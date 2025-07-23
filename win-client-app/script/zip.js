const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const zip = new AdmZip();

zip.addLocalFile("dist/EntropiaFlowClient/EntropiaFlowClient-win_x64.exe", "/", "EntropiaFlowClient.exe");
zip.addLocalFile("dist/EntropiaFlowClient/resources.neu", "/");
zip.addLocalFile("relay/EntropiaFlowClient-relay.exe", "/relay");

zip.writeZip("dist/EntropiaFlowClient.zip");
console.log("Created dist\\EntropiaFlowClient.zip");
