# Cleanup build caches to reduce repo size (safe for rebuild)
$itemsToRemove = @(
    "frontend\\.next",
    "frontend\\node_modules\\.cache",
    "backend\\node_modules\\.cache"
)
foreach ($item in $itemsToRemove) {
    $full = Join-Path (Get-Location) $item
    if (Test-Path $full) {
        Write-Output "Removing $full"
        Remove-Item -Recurse -Force $full -ErrorAction SilentlyContinue
    } else {
        Write-Output "Not found: $full"
    }
}
Write-Output "Cleanup complete. Run npm/yarn install and next build as needed."
