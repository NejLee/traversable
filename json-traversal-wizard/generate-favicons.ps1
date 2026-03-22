Add-Type -AssemblyName System.Drawing
$srcPath = Join-Path $PSScriptRoot "..\branding\trvlogo.png"
$outDir = $PSScriptRoot
$sizes = @(
    @{ w = 16; name = "favicon-16x16.png" },
    @{ w = 32; name = "favicon-32x32.png" },
    @{ w = 48; name = "favicon-48x48.png" },
    @{ w = 180; name = "apple-touch-icon.png" }
)
foreach ($item in $sizes) {
    $w = $item.w
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap $w, $w
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($src, 0, 0, $w, $w)
    $dest = Join-Path $outDir $item.name
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    Write-Host "Wrote $dest"
}
