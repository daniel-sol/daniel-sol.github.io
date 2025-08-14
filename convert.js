import fs, { write } from 'fs';
import { marked } from 'marked';
import { createHash } from 'crypto';


const mdFiles = ['index.md', "index_english.md"];
const today = new Date().toLocaleDateString("no-NO");
for (const mdFile of mdFiles) {
  const md = fs.readFileSync(mdFile, 'utf-8'); // eller din egen fil
  // ...
  if (!hashIdentical(mdFile, md)) {
    writeHtml(md, mdFile);
  }
}

function writeHtml(md, mdFile) {
  console.log("Writing.. ");
  let html = `
<html>
<head>
  <meta charset="utf-8">
  <title>Daniel Berge Sollien</title>
</head>
<body>
${marked(md)}
</body>
</html>
`;
  html = html.replace(/(href="[^"]+)\.md"/gi, '$1.html"');
  const outHtml = mdFile.replace(/\.md/g, ".html");
  html = html.replace(/{{Date}}/g, today);
  fs.writeFileSync(outHtml, html);
  console.log(outHtml + ' generert');
}

function hashIdentical(mdFile, md) {
  const hashFile = mdFile.replace(/\.md/, ".hash");
  let writeHtml = true;
  // Checking if a file with the hash of the file exists
  if (fs.existsSync(hashFile)) {
    const mdHash = createHash("md5").update(md).digest("hex");
    console.log(mdHash);
    const fileContent = fs.readFileSync(hashFile, 'utf-8');
    if (fileContent === mdHash) {
      console.log("Contents are identical");
      writeHtml = false;
    } else {
      console.log("The contents are not identical!");
      fs.writeFileSync(hashFile, mdHash);
    }
  } else {
    console.log("No pre-generated hash")

    return writeHtml;
  }
}
