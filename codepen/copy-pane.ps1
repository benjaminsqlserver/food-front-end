<#
.SYNOPSIS
  Copies the CodePen HTML pane to the clipboard as correct UTF-8.

.DESCRIPTION
  Windows PowerShell 5.1's `Get-Content -Raw` falls back to the system ANSI
  codepage for files with no byte-order mark, which silently mangles every
  accented character on the way to the clipboard: `Ẹ` arrives as `áº¸` and `₦`
  as `â‚¦`. Reading through System.IO.File with an explicit encoding avoids that
  entirely.

  Run this, then paste into the HTML pane in CodePen with Ctrl+A, Ctrl+V.

.EXAMPLE
  .\codepen\copy-pane.ps1
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$pane = Join-Path $PSScriptRoot 'html-pane.html'
if (-not (Test-Path $pane)) {
  Write-Host "html-pane.html not found. Regenerate it with:" -ForegroundColor Red
  Write-Host "  node codepen/make-panes.mjs . v1.0"
  exit 1
}

$content = [System.IO.File]::ReadAllText($pane, [System.Text.Encoding]::UTF8)
Set-Clipboard -Value $content

# Prove the round trip rather than assume it.
$back = Get-Clipboard -Raw
$greeting = [char]0x1EB8   # Ẹ  LATIN CAPITAL LETTER E WITH DOT BELOW
$naira    = [char]0x20A6   # ₦  NAIRA SIGN
$mojibake = [char]0x00C3   # Ã  the tell-tale of a Windows-1252 misread

$ok = $back.Contains($greeting) -and $back.Contains($naira) -and -not $back.Contains($mojibake)

Write-Host ""
if ($ok) {
  Write-Host "  Copied $([math]::Round($back.Length / 1kb, 1)) KB as UTF-8." -ForegroundColor Green
  Write-Host "  Verified: the Yoruba greeting and the Naira sign both survived."
  Write-Host ""
  Write-Host "  Now in CodePen: click the HTML pane, then Ctrl+A, Ctrl+V, Ctrl+S." -ForegroundColor DarkGray
} else {
  Write-Host "  Clipboard check FAILED - do not paste this." -ForegroundColor Red
  Write-Host "  Copy from GitHub instead, using the 'Copy raw file' button:"
  Write-Host "  https://github.com/benjaminsqlserver/food-front-end/blob/main/codepen/html-pane.html"
  exit 1
}
Write-Host ""
