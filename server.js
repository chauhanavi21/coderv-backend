// Load .env before any other import reads process.env
import 'dotenv/config';

import app from './src/app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CoderV backend  →  http://localhost:${PORT}`);
  console.log(`Python command  →  ${process.env.PYTHON_CMD || 'python'}`);
});
