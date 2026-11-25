@echo off
powershell.exe -NoProfile -STA -File "%~dp0EXPORT_VALIDATED_TIMESHEET.ps1"
if errorlevel 1 pause
