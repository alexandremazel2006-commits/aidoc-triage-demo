on run
	set projectPath to (POSIX path of (path to home folder)) & "Documents/aidoc-triage-demo"
	set backendPath to projectPath & "/backend"

	-- Backend (FastAPI / AI model) on port 8000
	set backendRunning to false
	try
		do shell script "curl -sf -o /dev/null http://localhost:8000/health"
		set backendRunning to true
	end try
	if backendRunning is false then
		do shell script "cd " & quoted form of backendPath & " && (nohup ./venv/bin/uvicorn app.main:app --port 8000 > /tmp/radiocheck-backend.log 2>&1 &) ; sleep 1"
	end if

	-- Frontend (Next.js) on port 3000
	set frontendRunning to false
	try
		do shell script "curl -sf -o /dev/null http://localhost:3000"
		set frontendRunning to true
	end try
	if frontendRunning is false then
		do shell script "cd " & quoted form of projectPath & " && (export PATH=\"/opt/homebrew/bin:$PATH\"; nohup /opt/homebrew/bin/npm run dev > /tmp/aidoc-dev.log 2>&1 &) ; sleep 1"
	end if

	-- The model can take a few seconds to load into memory on first start.
	if backendRunning is false then
		delay 6
	end if
	if frontendRunning is false then
		delay 2
	end if

	do shell script "open -na 'Google Chrome' --args --app=http://localhost:3000/radiocheck --window-size=1400,900"
end run
