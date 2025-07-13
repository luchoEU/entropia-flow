@echo off
cd ..\chrome-extension\
call npm run stream-dev
copy dist.win\EntropiaFlowStream.js ..\win-client-app\resources\js\
cd ..\win-client-app\
