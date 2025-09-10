import process from "process";
import * as cheerio from "cheerio";
import { pathToFileURL } from "url";
import fs from "fs";
import { marked } from "marked";
import { createHash } from "crypto";

function processMdFile(mdFile) {
  const md = fs.readFileSync(mdFile, "utf-8"); // eller din egen fil
  const outHtml = mdFile.replace(/\.md/g, ".html");
  const oldSidebar = readSidebar(outHtml);
  let sidebar = "";
  if (mdFile.includes("english")) {
    sidebar = makeSideBar("english");
  } else {
    sidebar = makeSideBar("english", true);
  }
  if ((stringIdentical(oldSidebar, sidebar) === true) &  (mdContentChanged(mdFile, md) === false)) {
    console.log("Not writing");
  } else {
    
    writeHtml(sidebar, md, outHtml);
  }
}

function stringIdentical(one, two){

  let checkone = one.trim().replace(/[\r\n]/g, '');
  let checktwo = two.trim().replace(/[\r\n]/g, '');
  console.log("First string --"+checkone+'--');
  console.log("Second string --"+checktwo+'--');
  console.log("Length of one ", checkone.length, "Length of two ", checktwo.length);
  const check = checkone === checktwo;
  console.log("Returning value of ", check);
  return check;
}
function writeHtml(sidebar, md, outHtml) {
  const today = new Date().toLocaleDateString("no-NO");
  let html = `
<html>
<head>
  <meta charset="utf-8">
  <title>Daniel Berge Sollien</title>
</head>
<body>
${sidebar}
<div class="body-text">
${marked(md)}
</div>
</body>
</html>
`;
  html = html.replace(/(href="[^"]+)\.md"/gi, '$1.html"');
  html = html.replace(/{{Date}}/g, today);
  fs.writeFileSync(outHtml, html);
  console.log(outHtml + " generert");
}

function readSidebar(htmlName) {
  const html = fs.readFileSync(htmlName, "utf-8");

// Last inn i cheerio
const $ = cheerio.load(html);

// Hent hele div.sidebar (inkludert alle barna)
const sidebar = $("div.sidebar").prop("outerHTML");

console.log('Returning: ' + sidebar);
return sidebar;  

}

function mdContentChanged(mdFile, md) {
  console.log("Checking file: " + mdFile);
  const hashFile = mdFile.replace(/\.md/, ".hash");
  let hashChanged = true;
  const mdHash = createHash("md5").update(md).digest("hex");
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
    fs.writeFileSync(hashFile, mdHash);
  }
  console.log("Returning value of "+hashChanged)
  return hashChanged;
}

function capitalize(text) {
  const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
  console.log(capitalized);
  return capitalized;
}

function findMdFiles() {
  const files = fs
    .readdirSync(".")
    .filter((word) => word.endsWith(".md") && word !== "README.md");
  console.log(files);
  return files;
}

function filterMdFiles(filterCriteria, reverse = false) {
  if (reverse === false) {
    return findMdFiles().filter((word) => word.includes(filterCriteria));
  } else {
    return findMdFiles().filter((word) => !word.includes(filterCriteria));
  }
}

function makeSideBar(filterCriteria, reverse = false) {
  let sidebar = '\n<div class="sidebar">\n';
  let mds = [];
  if (reverse === false) {
    mds = filterMdFiles(filterCriteria);
  } else {
    mds = filterMdFiles(filterCriteria, true);
  }
  for (const md of mds) {
    sidebar +=
      '<div><a href="' +
      md +
      '">' +
      capitalize(md.replace(/.md/, "").replace(/_english/, "")) +
      "</a></div>\n";
  }
  sidebar += "</div>\n";
  sidebar = sidebar.replace(/\.md/g, '.html');
  return sidebar;
}
export { findMdFiles, mdContentChanged, makeSideBar, processMdFile as writeHtml };

function main() {
  for (const mdFile of findMdFiles()) {
    processMdFile(mdFile);
  }
}
// Optional: run only if executed directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log("Running main");
  main();
} else {
  console.log("This doesn't work");
}
