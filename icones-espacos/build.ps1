# Gera o sprite, o catálogo e o .zip dos ícones de Espaços do ValeCasa.
# Os Espaços com origem "comodidade:<id>" usam o mesmo desenho da comodidade: o SVG é copiado
# de ..\icones-comodidades\svg a cada build, então editar a comodidade atualiza o Espaço.
# Uso: powershell -File build.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$comodidades = Join-Path (Split-Path $root -Parent) 'icones-comodidades\svg'
$utf8 = New-Object Text.UTF8Encoding $false
$jsonText = [IO.File]::ReadAllText("$root\espacos.json")
$data = $jsonText | ConvertFrom-Json

# Sincroniza os desenhos herdados das comodidades
foreach ($i in $data.icones) {
  if ($i.origem -like 'comodidade:*') {
    $src = Join-Path $comodidades ($i.origem.Substring(11) + '.svg')
    if (-not (Test-Path $src)) { throw "Comodidade não encontrada para $($i.id): $src" }
    Copy-Item $src "$root\svg\$($i.id).svg" -Force
  }
}

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
  if ($inner -match '<(circle|rect|ellipse|line|polygon|polyline)\b') { throw "$id.svg tem forma solta; converta para <path>" }
  "  <symbol id=`"vc-esp-$id`" viewBox=`"0 0 24 24`">$inner</symbol>"
}
$sprite = "<svg xmlns=`"http://www.w3.org/2000/svg`" fill=`"none`" stroke=`"currentColor`" stroke-width=`"1.5`" stroke-linecap=`"round`" stroke-linejoin=`"round`">`n$($symbols -join "`n")`n</svg>`n"
[IO.File]::WriteAllText("$root\dist\espacos-sprite.svg", $sprite, $utf8)

# Catálogo
$tpl = [IO.File]::ReadAllText("$root\catalogo-template.html")
$html = $tpl.Replace('/*__DATA__*/', $jsonText.Trim()).Replace('<!--__SPRITE__-->', ($symbols -join "`n"))
[IO.File]::WriteAllText("$root\dist\catalogo-espacos.html", $html, $utf8)

# Pacote .zip para o time
$ver = $data.versao
$stage = Join-Path $env:TEMP "vc-espacos-$ver"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path "$stage\svg" | Out-Null
Copy-Item "$root\svg\*.svg" "$stage\svg\"
Copy-Item "$root\espacos.json", "$root\dist\espacos-sprite.svg" $stage
$readme = @"
# Ícones de Espaços ValeCasa · v$ver

$($ids.Count) ícones de cômodos e espaços na grade do Heroicons v2: 24x24, traço 1.5, só <path>, cor herdada do texto (currentColor).

## Conteúdo
- svg/                 um arquivo por espaço (ex.: svg/quarto-casal.svg)
- espacos-sprite.svg   todos os ícones num arquivo só, com ids vc-esp-<nome>
- espacos.json         nome em português, categoria e origem de cada ícone

## Origem dos desenhos
- novo: desenhado para os Espaços
- comodidade:<id>: mesmo desenho da comodidade de mesmo conceito
- heroicons:<nome>: ícone oficial do Heroicons (MIT)

## Uso com sprite
<svg class="icon" width="24" height="24"><use href="/assets/espacos-sprite.svg#vc-esp-quarto"/></svg>

## Uso inline
Cole o conteúdo de svg/quarto.svg. A cor segue o CSS color do elemento pai.

## Tamanhos
16 px em listas, 20 px no card do imóvel, 28 px nos blocos da página do imóvel.
"@
[IO.File]::WriteAllText("$stage\LEIAME.md", $readme, $utf8)
$zip = "$root\dist\espacos-valecasa-v$ver.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($stage, $zip)
Remove-Item $stage -Recurse -Force

"OK: $($ids.Count) ícones · sprite, catálogo e $(Split-Path $zip -Leaf) gerados em dist\"
