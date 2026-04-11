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

// Copy standalone resources.neu for auto-update releases
const resourcesSrc = path.join(distDir, "resources.neu");
const resourcesDst = path.join("dist", "resources.neu");
fs.copyFileSync(resourcesSrc, resourcesDst);
console.log("Copied dist\\resources.neu");

// Update update-manifest.json with current version and zip filename
const manifestPath = path.join(__dirname, "..", "update-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.version = version;
const currentUrl = manifest.resourcesURL || "";
const baseUrl = currentUrl.replace(/\/dist\/resources\.neu$/, "");
if (baseUrl) {
    manifest.binaryURL = `${baseUrl}/dist/EntropiaFlowClient_v${version}.zip`;
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Updated update-manifest.json to v${version}`);
