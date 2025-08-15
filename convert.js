import process from "process";
import { pathToFileURL } from 'url';
import fs from "fs";
import { marked } from "marked";
import { createHash } from "crypto";

function writeHtml(md, mdFile) {
  const today = new Date().toLocaleDateString("no-NO");
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
  console.log(outHtml + " generert");
}

function mdContentChanged(mdFile, md) {
  const hashFile = mdFile.replace(/\.md/, ".hash");
  let hashChanged = true;
  // Checking if a file with the hash of the file exists
  if (fs.existsSync(hashFile)) {
    const fileContent = fs.readFileSync(hashFile, "utf-8");
    if (fileContent === mdHash) {
      console.log("Contents are identical");
      hashChanged = false;
    } else {
      console.log("The contents are not identical!");
    }
  } else {
    console.log("No pre-generated hash");
    const mdHash = createHash("md5").update(md).digest("hex");
    fs.writeFileSync(hashFile, mdHash);

    return hashChanged;
  }
}

function findMdFiles() {
  const files = fs
    .readdirSync(".")
    .filter((word) => word.endsWith(".md") && word !== "README.md");
  console.log(files);
  return files;
}

export { findMdFiles, mdContentChanged as mdContentNotChanged, writeHtml };

function main() {
  for (const mdFile of findMdFiles()) {
    const md = fs.readFileSync(mdFile, "utf-8"); // eller din egen fil
    // ...
    if (mdContentChanged(mdFile, md) === true) {
      writeHtml(md, mdFile);
    } else {
      console.log("Not writing");
    }
  }
}
// Optional: run only if executed directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log("Running main");
  main();
}else{
  console.log("This doesn't work");
}
