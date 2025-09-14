import process from "process";
import * as cheerio from "cheerio";
import { pathToFileURL } from "url";
import fs from "fs";
import { marked } from "marked";
import { createHash } from "crypto";

const titleDescription = {"Bøker": "Bøkene jeg har lest", 
  "Cv": "min cv", 
  "Engasjement": "Hvordan jeg har engasjert meg",
  "Felt": "Feltene jeg har jobbet med",
  "Folk": "Noen folk som har inspirert meg",
  "Hjem": "Min hjemmeside",
  "Nyheter": "Hvor jeg får nyheter fra",
  "Podcaster": "Podcastene jeg lytter til",
  "Books": "The books I have read",
  "Fields": "The fields I have worked with",
  "Home": "My homepage",
  "Involvement": "The ways I have involved myself",
  "News": "Where I get my news from",
  "Podcasts": "Podcasts I listen to"
};
function processMdFile(mdFile) {
  const md = fs.readFileSync(mdFile, "utf-8"); // eller din egen fil
  const outHtml = mdFile.replace(/\.md/g, ".html");
  let oldSidebar = "";
  try {
    oldSidebar = readSidebar(outHtml);
  } catch(err) {
    console.log("No html gives error:" +err);

  }
  let sidebar = "";
  if (mdFile.includes("english")) {
    sidebar = makeSideBar("english");
  } else {
    sidebar = makeSideBar("english", true);
  }
  if ((stringIdentical(oldSidebar, sidebar) === true) &  (mdContentChanged(mdFile, md) === false)) {
    console.log("Not writing");
  } else {
    
    writeHtml(sidebar, md, outHtml, mdFile);
  }
}

function findName(mdFile){
  let name = capitalize(mdFile.replace(/\.md/, "").replace(/_/g, " "));
  if (name.includes("Index")){
      if (name.includes("english")){
        name = "Home";

      }else{
        name = "Hjem";
      }
  }
  return name.replace(/english/, "");

}

function defineHead(mdFile) {
  let name = capitalize(mdFile.replace(/\.md/, "").replace(/_/g, " "));
  const published = mdFile.includes("english") ? "Published": "Publisert";
  const today = new Date().toLocaleDateString("no-NO");
  const publishStatement =
    '<font size="1"><strong>' + published + ": " + today+ '</strong></font>';
  name = name.includes("Index english") ? "Home":
         name.includes("Index") ? "Hjem":
         name;
  const title = name.replace(/english/, "");
  const description = titleDescription[name];
  console.log("Name ", name, "-> title: ", title, " and description: ", description);
  const head = `
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="styles.css">
<title>Daniel Berge Sollien ${title}</title>
<meta name="description" content="My journey out of the oil industry, and who I am: ${description}"/>
<meta property="article:published_time" content="${today}" />
</head>
${publishStatement}
`;
  return head;
}

function stringIdentical(one, two) {
  let checkone = one.trim().replace(/[\r\n]/g, "");
  let checktwo = two.trim().replace(/[\r\n]/g, "");
  console.log("First string --" + checkone + "--");
  console.log("Second string --" + checktwo + "--");
  console.log(
    "Length of one ",
    checkone.length,
    "Length of two ",
    checktwo.length,
  );
  const check = checkone === checktwo;
  console.log("Returning value of ", check);
  return check;
}
function writeHtml(sidebar, md, outHtml, fileName) {
  const today = new Date().toLocaleDateString("no-NO");
  let html = `
<html>
${defineHead(fileName)}
<body>
${sidebar}
<div class="body-text">
${marked(md)}
</div>
</body>
</html>
`;
  html = html.replace(/(href="[^"]+)\.md"/gi, '$1.html"');
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
      findName(md) +
      "</a></div>\n";
  }
  sidebar += "</div>\n";
  sidebar = sidebar.replace(/\.md/g, '.html');
  return sidebar;
}

export {
  findMdFiles,
  mdContentChanged,
  makeSideBar,
  writeHtml, 
  titleDescription
}

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
