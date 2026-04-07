const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const rootDir = __dirname;

app.disable('x-powered-by');

app.get('/', (_req, res) => {
  res.redirect('/port/');
});

app.use('/port', express.static(path.join(rootDir, 'port')));
app.use('/assets', express.static(path.join(rootDir, 'assets')));

app.listen(port, () => {
  console.log(`Escaparazzi dev server listening on http://localhost:${port}`);
});
