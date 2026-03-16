@echo off
:: Starts the build server that watches for build triggers from macOS
:: Run this from the Windows VM to enable remote builds via shared folder

powershell -ExecutionPolicy Bypass -File "%~dp0build-server.ps1"
