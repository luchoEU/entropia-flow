import { CLIENT_EXE } from "./const";

async function createDesktopShortcut() {
    const desktopCommand = `powershell -NoProfile -Command "[Environment]::GetFolderPath('Desktop')"`;
    const desktopResult = await Neutralino.os.execCommand(desktopCommand);
    const desktopPath = desktopResult.stdOut.trim();
    const shortcutPath = `${desktopPath}\\Entropia Flow Client.lnk`;

    const currPath = NL_CWD.replace(/\//g, '\\');
    const appPath = `${currPath}\\${CLIENT_EXE}`;

    const psScript = `
    $ws = New-Object -comObject WScript.Shell;
    $s = $ws.CreateShortcut("${shortcutPath}");
    $s.TargetPath = "${appPath}";
    $s.WorkingDirectory = "${currPath}";
    $s.WindowStyle = 1;
    $s.IconLocation = "${appPath},0";
    $s.Save()
    `
    const command = `powershell -ExecutionPolicy Bypass -Command "${psScript.replace(/\n/g, '').replace(/"/g, '\\"')}"`;
    console.log(command);
    const result = await Neutralino.os.execCommand(command);
    if (result.exitCode === 0) {
        console.log("Shortcut created successfully.");
        await Neutralino.os.showMessageBox("Shortcut created", "Shortcut created successfully");
    } else {
        console.error("Shortcut creation failed:", result.exitCode, result.stdErr);
        await Neutralino.os.showMessageBox("Shortcut creation failed", `Shortcut creation failed: ${result.exitCode}\n${result.stdErr}`);
    }
}

export { createDesktopShortcut }
