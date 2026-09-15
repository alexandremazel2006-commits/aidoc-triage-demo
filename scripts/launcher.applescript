on run
	set projectPath to (POSIX path of (path to home folder)) & "Documents/aidoc-triage-demo"
	set isRunning to false
	try
		do shell script "curl -sf -o /dev/null http://localhost:3000"
		set isRunning to true
	end try
	if isRunning is false then
		do shell script "cd " & quoted form of projectPath & " && (export PATH=\"/opt/homebrew/bin:$PATH\"; nohup /opt/homebrew/bin/npm run dev > /tmp/aidoc-dev.log 2>&1 &) ; sleep 1"
		delay 2
	end if
	-- Ouvre Chrome en "mode appli" : pas de barre d'adresse ni d'onglets,
	-- fenêtre autonome qui ressemble à une vraie application.
	do shell script "open -na 'Google Chrome' --args --app=http://localhost:3000/worklist --window-size=1400,900"
end run
