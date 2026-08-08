<#
.SYNOPSIS
  Serves this folder over http:// and opens it in your browser.

.DESCRIPTION
  The page uses ES modules, which browsers refuse to load from file:// on CORS
  grounds. This gives them the http:// they need.

  It installs nothing. It uses only .NET classes that ship with Windows, so
  there is no Node, no Python and no package manager involved.

  Press Ctrl+C in this window to stop the server.

.PARAMETER Port
  Port to listen on. Defaults to 8000, and steps up automatically if that port
  is already taken.

.PARAMETER NoBrowser
  Start the server without opening a browser window.

.EXAMPLE
  .\serve.ps1
  .\serve.ps1 -Port 3000
#>

[CmdletBinding()]
param(
  [int]$Port = 8000,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

if (-not (Test-Path (Join-Path $root 'index.html'))) {
  Write-Host "No index.html next to this script - is it still in the site folder?" -ForegroundColor Red
  exit 1
}

$mime = @{
  '.html'        = 'text/html; charset=utf-8'
  '.css'         = 'text/css; charset=utf-8'
  '.js'          = 'text/javascript; charset=utf-8'
  '.mjs'         = 'text/javascript; charset=utf-8'
  '.json'        = 'application/json; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.svg'         = 'image/svg+xml'
  '.png'         = 'image/png'
  '.jpg'         = 'image/jpeg'
  '.jpeg'        = 'image/jpeg'
  '.webp'        = 'image/webp'
  '.ico'         = 'image/x-icon'
  '.woff2'       = 'font/woff2'
  '.txt'         = 'text/plain; charset=utf-8'
  '.md'          = 'text/plain; charset=utf-8'
}

# Claim a free port. Binding to localhost specifically avoids the URL-ACL
# permission prompt that a wildcard prefix would trigger on Windows.
$listener = New-Object System.Net.HttpListener
$bound = $false
foreach ($candidate in $Port..($Port + 20)) {
  try {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$candidate/")
    $listener.Start()
    $Port = $candidate
    $bound = $true
    break
  } catch {
    # Port busy or refused - try the next one.
  }
}

if (-not $bound) {
  Write-Host "Could not open a port between $Port and $($Port + 20)." -ForegroundColor Red
  exit 1
}

$url = "http://localhost:$Port/"

Write-Host ""
Write-Host "  Iya Bashirat Restaurant" -ForegroundColor DarkYellow
Write-Host "  serving $root"
Write-Host "  at      $url" -ForegroundColor Green
Write-Host ""
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

if (-not $NoBrowser) {
  Start-Process $url | Out-Null
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    try {
      $relative = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
      $relative = $relative -replace '/', '\'

      $candidate = Join-Path $root $relative
      $full = [System.IO.Path]::GetFullPath($candidate)

      # Refuse anything that resolves outside this folder.
      if (-not $full.StartsWith([System.IO.Path]::GetFullPath($root), [StringComparison]::OrdinalIgnoreCase)) {
        $response.StatusCode = 403
        $body = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
      }
      elseif (Test-Path -LiteralPath $full -PathType Leaf) {
        $response.StatusCode = 200
        $extension = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
        $type = $mime[$extension]
        if (-not $type) { $type = 'application/octet-stream' }
        $response.ContentType = $type
        # Local preview: never let the browser cache a file you just edited.
        $response.Headers.Add('Cache-Control', 'no-store')
        $body = [System.IO.File]::ReadAllBytes($full)
      }
      else {
        $response.StatusCode = 404
        $response.ContentType = 'text/plain; charset=utf-8'
        $body = [System.Text.Encoding]::UTF8.GetBytes("404 - $relative not found")
        Write-Host "  404 $relative" -ForegroundColor DarkGray
      }

      $response.ContentLength64 = $body.Length
      $response.OutputStream.Write($body, 0, $body.Length)
    } catch {
      Write-Host "  error: $($_.Exception.Message)" -ForegroundColor DarkRed
    } finally {
      $response.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
  Write-Host ""
  Write-Host "  Server stopped." -ForegroundColor DarkGray
}
