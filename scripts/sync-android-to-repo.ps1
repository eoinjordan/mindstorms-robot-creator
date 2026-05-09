# sync-android-to-repo.ps1
# Copies the MindstormsAICreator Android project from AndroidStudioProjects
# into the repo at android/MindstormsAICreator/ so GitHub Actions can build it.
#
# Usage (from repo root):
#   powershell -ExecutionPolicy Bypass -File scripts/sync-android-to-repo.ps1
#
# Then commit the result:
#   git add android/MindstormsAICreator
#   git commit -m "chore: add Android project for CI builds"
#   git push

$source = "$env:USERPROFILE\AndroidStudioProjects\MindstormsAICreator"
$dest   = Join-Path $PSScriptRoot ".." "android" "MindstormsAICreator"
$dest   = [IO.Path]::GetFullPath($dest)

if (-not (Test-Path $source)) {
    Write-Error "Android project not found at: $source"
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
Write-Host "Done. Files copied to android/MindstormsAICreator/"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  git add android/MindstormsAICreator"
Write-Host "  git commit -m 'chore: add Android project for CI builds'"
Write-Host "  git push"
