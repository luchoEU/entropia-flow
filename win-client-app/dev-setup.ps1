# Entropia Flow Client - Windows Build Environment Setup
# Run: powershell -ExecutionPolicy Bypass -File setup.ps1

$ErrorActionPreference = "Continue"

function Write-Status($name, $version) {
    if ($version) {
        Write-Host "  [OK] $name : $version" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $name" -ForegroundColor Red
    }
}

function Get-ToolVersion($command, $args_) {
    try {
        $output = & $command $args_ 2>&1 | Out-String
        if ($LASTEXITCODE -ne 0) { return $null }
        return $output.Trim()
    } catch {
        return $null
    }
}

function Refresh-Path {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machinePath;$userPath"
}

# =============================================================================
# CHECK PREREQUISITES
# =============================================================================

Write-Host ""
Write-Host "=== Entropia Flow Client - Build Environment Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$missing = @()

# Git
$gitVersion = Get-ToolVersion "git" "--version"
Write-Status "Git" $gitVersion
if (-not $gitVersion) { $missing += "git" }

# Node.js
$nodeVersion = Get-ToolVersion "node" "--version"
Write-Status "Node.js" $nodeVersion
if (-not $nodeVersion) { $missing += "node" }

# npm
$npmVersion = Get-ToolVersion "npm" "--version"
Write-Status "npm" $npmVersion
if (-not $npmVersion) { $missing += "npm" }

# Go
$goVersion = Get-ToolVersion "go" "version"
Write-Status "Go" $goVersion
if (-not $goVersion) { $missing += "go" }

# Neutralino CLI
$neuVersion = Get-ToolVersion "neu" "version"
Write-Status "Neutralino CLI" $neuVersion
if (-not $neuVersion) { $missing += "neu" }

# rsrc (no --version flag, just check it exists in PATH)
$rsrcPath = Get-Command "rsrc" -ErrorAction SilentlyContinue
$rsrcVersion = if ($rsrcPath) { $rsrcPath.Source } else { $null }
Write-Status "rsrc" $rsrcVersion
if (-not $rsrcVersion) { $missing += "rsrc" }

# =============================================================================
# INSTALL MISSING TOOLS
# =============================================================================

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "Missing tools: $($missing -join ', ')" -ForegroundColor Yellow
    $install = Read-Host "Install missing tools? (y/n)"

    if ($install -eq "y") {
        # Phase 1: Install base tools via winget (git, node, go)
        $wingetTools = $missing | Where-Object { $_ -in @("git", "node", "npm", "go") }
        foreach ($tool in $wingetTools) {
            Write-Host ""
            switch ($tool) {
                "git" {
                    Write-Host "Installing Git via winget..." -ForegroundColor Cyan
                    winget install Git.Git --accept-package-agreements --accept-source-agreements
                }
                "node" {
                    Write-Host "Installing Node.js LTS via winget..." -ForegroundColor Cyan
                    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
                }
                "npm" {
                    Write-Host "npm is included with Node.js, skipping..." -ForegroundColor Gray
                }
                "go" {
                    Write-Host "Installing Go via winget..." -ForegroundColor Cyan
                    winget install GoLang.Go --accept-package-agreements --accept-source-agreements
                }
            }
        }

        # Refresh PATH so npm/go are available for phase 2
        if ($wingetTools.Count -gt 0) {
            Write-Host ""
            Write-Host "Refreshing PATH after winget installs..." -ForegroundColor Yellow
            Refresh-Path
        }

        # Phase 2: Install tools that depend on npm/go
        $derivedTools = $missing | Where-Object { $_ -in @("neu", "rsrc") }
        foreach ($tool in $derivedTools) {
            Write-Host ""
            switch ($tool) {
                "neu" {
                    Write-Host "Installing Neutralino CLI via npm..." -ForegroundColor Cyan
                    npm install -g @neutralinojs/neu --ignore-scripts
                }
                "rsrc" {
                    Write-Host "Installing rsrc via go install..." -ForegroundColor Cyan
                    go install github.com/akavel/rsrc@latest
                }
            }
        }

        # Ensure GOPATH/bin is in PATH for rsrc (persistently)
        $gopath = go env GOPATH 2>$null
        if ($gopath -and -not ($env:Path -like "*$gopath\bin*")) {
            $env:Path += ";$gopath\bin"
            $currentUserPath = [Environment]::GetEnvironmentVariable("Path", "User")
            if (-not ($currentUserPath -like "*$gopath\bin*")) {
                [Environment]::SetEnvironmentVariable("Path", "$currentUserPath;$gopath\bin", "User")
                Write-Host "Added $gopath\bin to user PATH (persistent)" -ForegroundColor Green
            }
        }

        # Re-check after install
        Write-Host ""
        Write-Host "Re-checking after install..." -ForegroundColor Yellow
        Write-Host "(You may need to open a NEW terminal for all PATH changes to take effect)" -ForegroundColor Yellow
        Write-Host ""

        $gitVersion = Get-ToolVersion "git" "--version"
        Write-Status "Git" $gitVersion

        $nodeVersion = Get-ToolVersion "node" "--version"
        Write-Status "Node.js" $nodeVersion

        $npmVersion = Get-ToolVersion "npm" "--version"
        Write-Status "npm" $npmVersion

        $goVersion = Get-ToolVersion "go" "version"
        Write-Status "Go" $goVersion

        $neuVersion = Get-ToolVersion "neu" "version"
        Write-Status "Neutralino CLI" $neuVersion

        $rsrcPath = Get-Command "rsrc" -ErrorAction SilentlyContinue
        Write-Status "rsrc" $(if ($rsrcPath) { $rsrcPath.Source } else { $null })
    }
} else {
    Write-Host ""
    Write-Host "All tools are installed!" -ForegroundColor Green
}

# =============================================================================
# INSTALL NODE DEPENDENCIES
# =============================================================================

Write-Host ""
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path (Join-Path $scriptDir "node_modules"))) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
    Push-Location $scriptDir
    npm install
    Pop-Location
} else {
    Write-Host "node_modules already exists, skipping npm install" -ForegroundColor Gray
}

# Also check chrome-extension dependencies
$chromeExtDir = Join-Path (Split-Path -Parent $scriptDir) "chrome-extension"
if (Test-Path $chromeExtDir) {
    if (-not (Test-Path (Join-Path $chromeExtDir "node_modules"))) {
        Write-Host "Installing chrome-extension npm dependencies..." -ForegroundColor Cyan
        Push-Location $chromeExtDir
        npm install
        Pop-Location
    } else {
        Write-Host "chrome-extension/node_modules already exists, skipping" -ForegroundColor Gray
    }
}

# =============================================================================
# SUMMARY
# =============================================================================

Write-Host ""
Write-Host "=== Setup Summary ===" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Verify each tool actually runs (not just exists in PATH)
function Test-Tool($name, $command, $args_) {
    try {
        & $command $args_ 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "non-zero exit" }
        Write-Host "  PASS  $name" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  FAIL  $name" -ForegroundColor Red
        return $false
    }
}

if (-not (Test-Tool "Git"            "git"  "--version")) { $allGood = $false }
if (-not (Test-Tool "Node.js"        "node" "--version")) { $allGood = $false }
if (-not (Test-Tool "npm"            "npm"  "--version")) { $allGood = $false }
if (-not (Test-Tool "Go"             "go"   "version"))   { $allGood = $false }
if (-not (Test-Tool "Neutralino CLI" "neu"  "version")) { $allGood = $false }
# rsrc has no version flag, just check it exists and is callable
$rsrcPath = Get-Command "rsrc" -ErrorAction SilentlyContinue
if ($rsrcPath) {
    Write-Host "  PASS  rsrc" -ForegroundColor Green
} else {
    Write-Host "  FAIL  rsrc" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
if ($allGood) {
    Write-Host "All prerequisites met! You can now run:" -ForegroundColor Green
    Write-Host "  npm run pack" -ForegroundColor White
    Write-Host ""
    Write-Host "This will build everything and create dist\EntropiaFlowClient.zip" -ForegroundColor Gray
} else {
    Write-Host "Some tools are still missing. Open a NEW terminal and run this script again." -ForegroundColor Red
    Write-Host "If tools were just installed via winget, a new terminal is required for PATH updates." -ForegroundColor Yellow
}

Write-Host ""
