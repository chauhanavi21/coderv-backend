"""
Python execution tracer for CoderV.
Reads Python code from stdin, traces line-by-line execution,
and outputs a JSON array of steps compatible with StepVisualizer.

Usage: python tracer.py < code.py
       echo "x = 5" | python tracer.py
"""

import sys
import json
import traceback as tb


def get_str_locals(frame):
    """Snapshot frame locals as repr strings, filtering out internals."""
    result = {}
    for k, v in frame.f_locals.items():
        if k.startswith('_'):
            continue
        try:
            result[k] = repr(v)[:60]
        except Exception:
            result[k] = '<unprintable>'
    return result


def make_action(prev, curr):
    """Derive the most significant variable action from a locals diff."""
    new_vars = {k: v for k, v in curr.items() if k not in prev}
    changed_vars = {k: v for k, v in curr.items() if k in prev and prev[k] != v}

    if new_vars:
        k, v = next(iter(new_vars.items()))
        return {'type': 'create', 'name': k, 'val': v}
    if changed_vars:
        k, v = next(iter(changed_vars.items()))
        return {'type': 'update', 'name': k, 'val': v}
    return None


def trace_and_capture(code_str):
    code_lines = code_str.split('\n')
    steps = []
    captured_prints = []

    # Per-frame state (keyed by id(frame))
    frame_prev_locals = {}
    frame_pending_line = {}

    class StdoutCapture:
        def write(self, text):
            text = text.rstrip('\n')
            if text:
                captured_prints.append(text)

        def flush(self):
            pass

    def commit_step(lineno, curr_locals, prev_locals):
        line_text = (
            code_lines[lineno].strip()
            if 0 <= lineno < len(code_lines)
            else f'line {lineno + 1}'
        )
        action = make_action(prev_locals, curr_locals)

        # Flush captured prints, attributed to this line
        for p in list(captured_prints):
            steps.append({
                'line': lineno,
                'desc': f'Output: {p}',
                'action': {'type': 'output', 'val': p},
            })
        captured_prints.clear()

        # Build human description
        desc = line_text
        if action:
            if action['type'] == 'create':
                desc = f"Assign {action['name']} = {action['val']}"
            elif action['type'] == 'update':
                desc = f"Update {action['name']} \u2192 {action['val']}"

        steps.append({'line': lineno, 'desc': desc, 'action': action})

    def tracer(frame, event, arg):
        # Only trace code from the exec'd string
        if frame.f_code.co_filename != '<string>':
            return tracer

        fid = id(frame)
        lineno = frame.f_lineno - 1  # convert to 0-indexed

        if event == 'call':
            frame_prev_locals[fid] = get_str_locals(frame)
            frame_pending_line[fid] = None
            fname = frame.f_code.co_name
            if fname != '<module>':
                steps.append({
                    'line': lineno,
                    'desc': f'Call {fname}()',
                    'action': {'type': 'fn_call', 'name': fname, 'arg': ''},
                })

        elif event == 'line':
            curr = get_str_locals(frame)
            pending = frame_pending_line.get(fid)
            prev = frame_prev_locals.get(fid, {})

            if pending is not None:
                commit_step(pending, curr, prev)

            frame_prev_locals[fid] = curr
            frame_pending_line[fid] = lineno

        elif event == 'return':
            curr = get_str_locals(frame)
            pending = frame_pending_line.get(fid)
            prev = frame_prev_locals.get(fid, {})

            if pending is not None:
                commit_step(pending, curr, prev)

            # Flush any remaining captured output
            for p in list(captured_prints):
                steps.append({
                    'line': lineno,
                    'desc': f'Output: {p}',
                    'action': {'type': 'output', 'val': p},
                })
            captured_prints.clear()

            fname = frame.f_code.co_name
            if fname != '<module>' and arg is not None:
                steps.append({
                    'line': lineno,
                    'desc': f'Return {repr(arg)[:40]}',
                    'action': {
                        'type': 'fn_return',
                        'ret': fname,
                        'val': repr(arg)[:40],
                    },
                })

            frame_prev_locals.pop(fid, None)
            frame_pending_line.pop(fid, None)

        return tracer

    saved_stdout = sys.stdout
    sys.stdout = StdoutCapture()

    try:
        sys.settrace(tracer)
        exec(compile(code_str, '<string>', 'exec'), {})  # noqa: S102
    except SyntaxError as e:
        error_line = (e.lineno or 1) - 1
        steps.append({
            'line': error_line,
            'desc': f'SyntaxError: {e.msg}',
            'action': {'type': 'output', 'val': f'SyntaxError: {e.msg}'},
        })
    except Exception as e:
        for p in list(captured_prints):
            steps.append({
                'line': 0,
                'desc': f'Output: {p}',
                'action': {'type': 'output', 'val': p},
            })
        err_msg = f'{type(e).__name__}: {e}'
        steps.append({
            'line': 0,
            'desc': err_msg,
            'action': {'type': 'output', 'val': err_msg},
        })
    finally:
        sys.settrace(None)
        sys.stdout = saved_stdout

    return steps


if __name__ == '__main__':
    source = sys.stdin.read()
    output = trace_and_capture(source)
    print(json.dumps(output))
