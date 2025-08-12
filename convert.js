import fs from 'fs';
import { marked } from 'marked';

const md = fs.readFileSync('index.md', 'utf-8');
const html = marked(md);

fs.writeFileSync('index.html', `
<html>
  <head><meta charset="utf-8"><title>Daniel Berge Sollien</title></head>
  <body>${html}</body>
</html>
`);