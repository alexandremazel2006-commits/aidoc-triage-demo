on run
	set projectPath to (POSIX path of (path to home folder)) & "Documents/aidoc-triage-demo"
	set isRunning to false
	try
		do shell script "curl -sf -o /dev/null http://localhost:3000"
		set isRunning to true
	end try
	if isRunning is false then
		do shell script "cd " & quoted form of projectPath & " && (/opt/homebrew/bin/npm run dev > /tmp/aidoc-dev.log 2>&1 &) ; sleep 1"
		delay 2
	end if
	open location "http://localhost:3000/worklist"
end run
