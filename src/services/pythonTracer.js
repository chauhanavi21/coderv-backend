import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TRACER_PATH = join(__dirname, '../../tracer.py');

/**
 * Runs user Python code through tracer.py and returns the step array.
 * @param {string} code  Python source
 * @returns {Promise<Array>}
 */
export function runPythonTrace(code) {
  const cmd = process.env.PYTHON_CMD || 'python';

  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, [TRACER_PATH]);
    let stdout = '';
    let stderr = '';
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      proc.kill('SIGTERM');
      reject(new Error('Execution timed out (8 s). Check for infinite loops.'));
    }, 8000);

    proc.stdout.on('data', (chunk) => { stdout += chunk; });
    proc.stderr.on('data', (chunk) => { stderr += chunk; });

    proc.on('close', (exitCode) => {
      clearTimeout(timer);
      if (killed) return;
      if (exitCode !== 0) {
        return reject(new Error(stderr.trim() || `Python exited with code ${exitCode}.`));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error('Tracer returned invalid JSON.'));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      if (err.code === 'ENOENT') {
        reject(
          new Error(
            `Python not found (tried "${cmd}"). ` +
            'Set PYTHON_CMD in backend/.env to the correct executable.'
          )
        );
      } else {
        reject(err);
      }
    });

    proc.stdin.write(code);
    proc.stdin.end();
  });
}
