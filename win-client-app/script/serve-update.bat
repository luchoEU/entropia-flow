@echo off
:: Starts the dev update manifest server on port 9147.
:: Run this from the Windows VM so the Windows client can fetch
:: update-manifest.json, dist\resources.neu, and the binary zip from localhost.

cd /d "%~dp0.."
npm run serve-update
