# sync-android-to-repo.ps1
# Copies an external Android Studio project into the repo-side Android scaffold.
#
# Usage (from repo root):
#   $env:MINDSTORMS_ANDROID_PROJECT="<android-project-root>"
#   powershell -ExecutionPolicy Bypass -File scripts/sync-android-to-repo.ps1
#
# Then commit the result:
#   git add android/robot-inventor-app
#   git commit -m "chore: sync repo-side Android scaffold"
#   git push

$source = if ($env:MINDSTORMS_ANDROID_PROJECT) {
    $env:MINDSTORMS_ANDROID_PROJECT
} elseif ($env:MINDSTORMS_ANDROID_APP_DIR) {
    $env:MINDSTORMS_ANDROID_APP_DIR
} else {
    ""
}

$dest = if ($env:MINDSTORMS_REPO_ANDROID_DIR) {
    $env:MINDSTORMS_REPO_ANDROID_DIR
} else {
    Join-Path $PSScriptRoot ".." "android" "robot-inventor-app"
}
$dest   = [IO.Path]::GetFullPath($dest)

if (-not $source -or -not (Test-Path $source)) {
    Write-Error "Android project not found. Set MINDSTORMS_ANDROID_PROJECT or MINDSTORMS_ANDROID_APP_DIR."
    exit 1
}

Write-Host "Source: $source"
Write-Host "Dest:   $dest"

# Files/folders to exclude from the copy
$excludeDirs = @(".gradle", "build", ".idea", ".kotlin")

function Copy-Filtered {
    param([string]$Src, [string]$Dst)
    New-Item -ItemType Directory -Force -Path $Dst | Out-Null
    foreach ($item in Get-ChildItem -Path $Src) {
        if ($excludeDirs -contains $item.Name) { continue }
        # Also skip local.properties (machine-specific SDK path)
        if ($item.Name -eq "local.properties") { continue }
        $destItem = Join-Path $Dst $item.Name
        if ($item.PSIsContainer) {
            Copy-Filtered -Src $item.FullName -Dst $destItem
        } else {
            Copy-Item -Path $item.FullName -Destination $destItem -Force
        }
    }
}

Copy-Filtered -Src $source -Dst $dest

Write-Host ""
Write-Host "Done. Files copied to $dest"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  git diff -- android/robot-inventor-app"
Write-Host "  git add android/robot-inventor-app"
Write-Host "  git commit -m 'chore: sync repo-side Android scaffold'"
Write-Host "  git push"
