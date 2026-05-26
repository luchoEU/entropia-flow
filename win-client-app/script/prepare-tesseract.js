const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const relayDir = path.resolve(__dirname, "..", "relay");
const tesseractDst = path.join(relayDir, "tesseract.exe");

if (fs.existsSync(tesseractDst)) {
    console.log("[tesseract] Already present, skipping.");
    process.exit(0);
}

const commonPaths = [
    "C:\\Program Files\\Tesseract-OCR",
    "C:\\Program Files (x86)\\Tesseract-OCR",
];

let installDir = commonPaths.find(p => fs.existsSync(path.join(p, "tesseract.exe")));

if (!installDir) {
    console.log("[tesseract] Not found — installing via Chocolatey...");
    try {
        execSync("choco install tesseract --no-progress -y", { stdio: "inherit" });
    } catch {
        console.error("[tesseract] ERROR: choco install failed.");
        console.error("            Install Tesseract manually from https://github.com/UB-Mannheim/tesseract/wiki");
        console.error("            then place tesseract.exe and its DLLs in relay/");
        process.exit(1);
    }
    installDir = commonPaths.find(p => fs.existsSync(path.join(p, "tesseract.exe")));
    if (!installDir) {
        console.error("[tesseract] ERROR: Could not locate Tesseract after install.");
        process.exit(1);
    }
}

console.log(`[tesseract] Copying from ${installDir} to relay/...`);
for (const file of fs.readdirSync(installDir)) {
    const src = path.join(installDir, file);
    if (fs.statSync(src).isFile() && (file === "tesseract.exe" || file.endsWith(".dll"))) {
        fs.copyFileSync(src, path.join(relayDir, file));
        console.log(`[tesseract]   ${file}`);
    }
}
console.log("[tesseract] Done.");
