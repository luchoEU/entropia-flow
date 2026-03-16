const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const { version } = require("../package.json");

const distDir = "dist/EntropiaFlowClient";
const exeFiles = fs.readdirSync(distDir).filter(f => f.startsWith("EntropiaFlowClient-win") && f.endsWith(".exe"));

if (exeFiles.length === 0) {
    console.error("No EntropiaFlowClient executable found in " + distDir);
    process.exit(1);
}

const zip = new AdmZip();

zip.addLocalFile(path.join(distDir, exeFiles[0]), "/", "EntropiaFlowClient.exe");
zip.addLocalFile(path.join(distDir, "resources.neu"), "/");
zip.addLocalFile("relay/EntropiaFlowClient-relay.exe", "/relay");

const zipName = `dist/EntropiaFlowClient_v${version}.zip`;
zip.writeZip(zipName);
console.log(`Created ${zipName.replace(/\//g, "\\")}`);
