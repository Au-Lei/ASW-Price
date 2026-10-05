$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..'))

node scripts/prepare-preview.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$esbuild = Join-Path (Get-Location) 'node_modules/@esbuild/win32-x64/esbuild.exe'
if (-not (Test-Path $esbuild)) {
  throw 'esbuild is missing. Run npm install first.'
}

& $esbuild '.preview-build/main.js' '--bundle' '--format=esm' '--minify' '--outfile=dist/assets/main.js' '--loader:.woff2=file' '--loader:.woff=file' '--loader:.ttf=file'
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'Preview files are ready. Run node scripts/serve-preview.mjs and visit http://localhost:5173/'
