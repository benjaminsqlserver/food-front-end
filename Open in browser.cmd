@echo off
REM Double-click this file to view the site.
REM
REM It serves this folder over http:// and opens your browser. Nothing is
REM installed - it only uses PowerShell, which ships with Windows.
REM
REM Close this window (or press Ctrl+C) when you are finished.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" %*

REM Keep the window open if the script exited with an error, so the message
REM does not vanish before it can be read.
if errorlevel 1 pause
