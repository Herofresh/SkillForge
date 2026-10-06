# Store graphics for Google Play (PLAN 7.5): the 512 px icon and the 1024 x 500 feature graphic,
# drawn from the app icon (assets/images/icon.png) with the app's fonts and palette. Windows only
# (System.Drawing). Run from the repo root: powershell -File docs/play/graphics/make-graphics.ps1
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
$out = Join-Path $root 'docs/play/graphics'

function Color([string]$hex) { [System.Drawing.ColorTranslator]::FromHtml($hex) }
# Palette (src/components/palette.ts)
$night = Color '#0D0B14'; $stone = Color '#1A1624'; $stoneEdge = Color '#3E3654'
$gold = Color '#E9B949'; $goldDark = Color '#9A7328'; $rune = Color '#62E3F0'; $bone = Color '#F3EAD3'
$mist = Color '#B4A9C8'

$fonts = New-Object System.Drawing.Text.PrivateFontCollection
$fonts.AddFontFile((Join-Path $root 'node_modules/@expo-google-fonts/jersey-15/400Regular/Jersey15_400Regular.ttf'))
$fonts.AddFontFile((Join-Path $root 'node_modules/@expo-google-fonts/silkscreen/400Regular/Silkscreen_400Regular.ttf'))
$jersey = $fonts.Families | Where-Object { $_.Name -like 'Jersey*' }
$silk = $fonts.Families | Where-Object { $_.Name -like 'Silkscreen*' }

$icon = [System.Drawing.Image]::FromFile((Join-Path $root 'assets/images/icon.png'))

function Pixelated([System.Drawing.Graphics]$g) {
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
}

# 1. Store icon: 512 x 512, 32-bit PNG
$bmp = New-Object System.Drawing.Bitmap 512, 512, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp); Pixelated $g
$g.DrawImage($icon, 0, 0, 512, 512)
$g.Dispose(); $bmp.Save((Join-Path $out 'icon-512.png'), [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()

# 2. Feature graphic: 1024 x 500, 24-bit PNG (Play rejects alpha)
$w = 1024; $h = 500
$bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear($night)
# A grid of faint stone tiles, like the app's skill tree background
$tile = New-Object System.Drawing.SolidBrush $stone
for ($x = 0; $x -lt $w; $x += 32) { for ($y = 0; $y -lt $h; $y += 32) {
  if ((($x / 32) + ($y / 32)) % 2 -eq 0) { $g.FillRectangle($tile, $x, $y, 32, 32) } } }
# Gold frame, two pixels of pixel-art border
$g.FillRectangle((New-Object System.Drawing.SolidBrush $goldDark), 0, 0, $w, 8)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $goldDark), 0, $h - 8, $w, 8)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $gold), 0, 8, $w, 4)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $gold), 0, $h - 12, $w, 4)
# Icon on the left, crisp
Pixelated $g
$g.DrawImage($icon, 64, 74, 352, 352)
# Title and tagline
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$title = New-Object System.Drawing.Font $jersey, 132, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$tag = New-Object System.Drawing.Font $silk, 30, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$line = New-Object System.Drawing.Font $silk, 22, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('SkillForge', $title, (New-Object System.Drawing.SolidBrush $goldDark), 462, 118)
$g.DrawString('SkillForge', $title, (New-Object System.Drawing.SolidBrush $gold), 458, 112)
$g.DrawString('CALISTHENICS RPG', $tag, (New-Object System.Drawing.SolidBrush $rune), 466, 262)
$g.DrawString('Skill tree  -  XP  -  Workouts', $line, (New-Object System.Drawing.SolidBrush $mist), 468, 318)
$g.Dispose(); $bmp.Save((Join-Path $out 'feature-1024x500.png'), [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
$icon.Dispose()
Write-Output 'Wrote icon-512.png and feature-1024x500.png'
