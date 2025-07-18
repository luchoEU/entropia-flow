set DEST="\\192.168.0.13\Entropia Flow Client\"
copy /D /Y dist\EntropiaFlowClient\EntropiaFlowClient-win_x64.exe %DEST%
copy /D /Y dist\EntropiaFlowClient\resources.neu %DEST%
copy /D /Y go-websocket-relay\EntropiaFlowClient-relay.exe %DEST%
