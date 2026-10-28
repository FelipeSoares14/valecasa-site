# Gera o sprite, o catálogo e o .zip dos ícones de comodidades do ValeCasa.
# Uso: powershell -ExecutionPolicy Bypass -File build.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$utf8 = New-Object Text.UTF8Encoding $false
$jsonText = [IO.File]::ReadAllText("$root\comodidades.json")
$data = $jsonText | ConvertFrom-Json

# Confere se índice e arquivos batem
$ids = @($data.icones | ForEach-Object { $_.id })
$files = @(Get-ChildItem "$root\svg" -Filter *.svg | ForEach-Object { $_.BaseName })
$semArquivo = $ids | Where-Object { $files -notcontains $_ }
$semIndice = $files | Where-Object { $ids -notcontains $_ }
$dup = $ids | Group-Object | Where-Object Count -gt 1 | ForEach-Object Name
if ($semArquivo) { throw "No índice, mas sem SVG: $($semArquivo -join ', ')" }
if ($semIndice) { throw "SVG sem entrada no índice: $($semIndice -join ', ')" }
if ($dup) { throw "ids repetidos no índice: $($dup -join ', ')" }

# Sprite
$symbols = foreach ($id in $ids) {
  $svg = [IO.File]::ReadAllText("$root\svg\$id.svg")
  # Sem o <metadata> de procedência (C2PA): no sprite ele só pesaria
  $inner = [regex]::Match($svg, '(?s)<svg[^>]*>(.*)</svg>').Groups[1].Value -replace '(?s)<metadata>.*?</metadata>', ''
  $inner = $inner.Trim()
  "  <symbol id=`"vc-$id`" viewBox=`"0 0 24 24`">$inner</symbol>"
}
$sprite = "<svg xmlns=`"http://www.w3.org/2000/svg`" fill=`"none`" stroke=`"currentColor`" stroke-width=`"1.5`" stroke-linecap=`"round`" stroke-linejoin=`"round`">`n$($symbols -join "`n")`n</svg>`n"
[IO.File]::WriteAllText("$root\dist\comodidades-sprite.svg", $sprite, $utf8)

# Catálogo
$tpl = [IO.File]::ReadAllText("$root\catalogo-template.html")
$html = $tpl.Replace('/*__DATA__*/', $jsonText.Trim()).Replace('<!--__SPRITE__-->', ($symbols -join "`n"))
[IO.File]::WriteAllText("$root\dist\catalogo-comodidades.html", $html, $utf8)

# Pacote .zip para o time
$ver = $data.versao
$stage = Join-Path $env:TEMP "vc-comodidades-$ver"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path "$stage\svg" | Out-Null
Copy-Item "$root\svg\*.svg" "$stage\svg\"
Copy-Item "$root\comodidades.json", "$root\dist\comodidades-sprite.svg" $stage
$readme = @"
# Ícones de comodidades ValeCasa · v$ver

$($ids.Count) ícones na grade do Heroicons v2: 24x24, traço 1.5, cor herdada do texto (currentColor).

## Conteúdo
- svg/            um arquivo por ícone (ex.: svg/piscina.svg)
- comodidades-sprite.svg   todos os ícones num arquivo só, com ids vc-<nome>
- comodidades.json         nome em português, categoria, família e nomes alternativos de cada ícone

## Uso com sprite
<svg class="icon" width="24" height="24"><use href="/assets/comodidades-sprite.svg#vc-piscina"/></svg>

## Uso inline
Cole o conteúdo de svg/piscina.svg. A cor segue o CSS color do elemento pai.

## Tamanhos
16 px em listas, 20 px no card do lançamento, 28 px nos blocos da página do lançamento.
"@
[IO.File]::WriteAllText("$stage\LEIAME.md", $readme, $utf8)
$zip = "$root\dist\comodidades-valecasa-v$ver.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($stage, $zip)
Remove-Item $stage -Recurse -Force

"OK: $($ids.Count) ícones · sprite, catálogo e $(Split-Path $zip -Leaf) gerados em dist\"
