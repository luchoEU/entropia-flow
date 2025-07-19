@echo off
cd ..\chrome-extension\
call npm install
call npm run stream-dev
robocopy dist.win ..\win-client-app\resources\stream /E /COPY:DAT /R:0 /W:0
cd ..\win-client-app\
