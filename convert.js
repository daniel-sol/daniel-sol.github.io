import fs from 'fs';
import { marked } from 'marked';


const mdFiles = ['index.md', "my_blog.md"];
for (const mdFile of mdFiles) {
  const md = fs.readFileSync(mdFile, 'utf-8'); // eller din egen fil
  let html = `
<html>
<head>
  <meta charset="utf-8">
  <title>Min nettside</title>
</head>
<body>
${marked(md)}
</body>
</html>
`;
  html = html.replace(/(href="[^"]+)\.md"/gi, '$1.html"');
  const outHtml = mdFile.replace(/\.md/g, ".html");
  fs.writeFileSync(outHtml, html);
  console.log(outHtml + ' generert');
}