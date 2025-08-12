import fs from 'fs';
import { marked } from 'marked';

const md = fs.readFileSync('index.md', 'utf-8');
let html = marked(md);

const today = new Date().toLocaleDateString("no-NO");
fs.writeFileSync('index.html', `
<html>
  <head><meta charset="utf-8"><title>Daniel Berge Sollien</title></head>
  <body>${html.replace(/{{Date}}/g, today)}</body>
</html>
`);