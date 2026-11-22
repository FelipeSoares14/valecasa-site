# Gera o sprite, o catálogo e o .zip dos ícones de Tipos de imóvel do ValeCasa.
# Tipos com origem "comodidade:<id>" (se surgirem) copiam o SVG da comodidade de mesmo conceito
# de ..\icones-comodidades\svg a cada build, como nos Espaços.
# Uso: powershell -File build.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$comodidades = Join-Path (Split-Path $root -Parent) 'icones-comodidades\svg'
$utf8 = New-Object Text.UTF8Encoding $false
$jsonText = [IO.File]::ReadAllText("$root\tipos.json")
$data = $jsonText | ConvertFrom-Json

# Sincroniza os desenhos herdados das comodidades
foreach ($i in $data.icones) {
  if ($i.origem -like 'comodidade:*') {
    $src = Join-Path $comodidades ($i.origem.Substring(11) + '.svg')
    if (-not (Test-Path $src)) { throw "Comodidade não encontrada para $($i.id): $src" }
    Copy-Item $src "$root\svg\$($i.id).svg" -Force
  }
}

# Estilos: contorno (svg\), duotone (svg-duotone\) e preenchido (svg-preenchido\)
$estilos = @(
  @{ id = 'contorno';   pasta = 'svg';            sufixo = '';            attrs = 'fill="none" stroke="currentColor" stroke-width="1.5"' },
  @{ id = 'duotone';    pasta = 'svg-duotone';    sufixo = '-duotone';    attrs = 'fill="none" stroke="currentColor" stroke-width="1.5"' },
  @{ id = 'preenchido'; pasta = 'svg-preenchido'; sufixo = '-preenchido'; attrs = 'fill="currentColor" stroke="none"' }
)

# Confere se índice e arquivos batem, nos três estilos
$ids = @($data.icones | ForEach-Object { $_.id })
$dup = $ids | Group-Object | Where-Object Count -gt 1 | ForEach-Object Name
if ($dup) { throw "ids repetidos no índice: $($dup -join ', ')" }
foreach ($e in $estilos) {
  $files = @(Get-ChildItem "$root\$($e.pasta)" -Filter *.svg | ForEach-Object { $_.BaseName })
  $semArquivo = $ids | Where-Object { $files -notcontains $_ }
  $semIndice = $files | Where-Object { $ids -notcontains $_ }
  if ($semArquivo) { throw "$($e.pasta): no índice, mas sem SVG: $($semArquivo -join ', ')" }
  if ($semIndice) { throw "$($e.pasta): SVG sem entrada no índice: $($semIndice -join ', ')" }
}

# Sprite: cada símbolo leva os próprios atributos de cor, então funciona em qualquer página
$symbols = foreach ($e in $estilos) {
  foreach ($id in $ids) {
    $svg = [IO.File]::ReadAllText("$root\$($e.pasta)\$id.svg")
    # Sem o <metadata> de procedência (C2PA): no sprite ele só pesaria
    $inner = [regex]::Match($svg, '(?s)<svg[^>]*>(.*)</svg>').Groups[1].Value -replace '(?s)<metadata>.*?</metadata>', ''
    $inner = ($inner.Trim() -replace '\r?\n\s*', '')
    if ($inner -match '<(circle|rect|ellipse|line|polygon|polyline)\b') { throw "$($e.pasta)\$id.svg tem forma solta; converta para <path>" }
    "  <symbol id=`"vc-tipo-$id$($e.sufixo)`" viewBox=`"0 0 24 24`" $($e.attrs)>$inner</symbol>"
  }
}
$sprite = "<svg xmlns=`"http://www.w3.org/2000/svg`">`n$($symbols -join "`n")`n</svg>`n"
[IO.File]::WriteAllText("$root\dist\tipos-sprite.svg", $sprite, $utf8)

# Catálogo
$tpl = [IO.File]::ReadAllText("$root\catalogo-template.html")
$html = $tpl.Replace('/*__DATA__*/', $jsonText.Trim()).Replace('<!--__SPRITE__-->', ($symbols -join "`n"))
[IO.File]::WriteAllText("$root\dist\catalogo-tipos.html", $html, $utf8)

# Pacote .zip para o time
$ver = $data.versao
Get-ChildItem "$root\dist" -Filter 'tipos-valecasa-v*.zip' | Remove-Item -Force
$stage = Join-Path $env:TEMP "vc-tipos-$ver"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
foreach ($e in $estilos) {
  New-Item -ItemType Directory -Path "$stage\$($e.pasta)" | Out-Null
  Copy-Item "$root\$($e.pasta)\*.svg" "$stage\$($e.pasta)\"
}
Copy-Item "$root\tipos.json", "$root\dist\tipos-sprite.svg" $stage
$readme = @"
# Ícones de Tipos de Imóvel ValeCasa · v$ver

$($ids.Count) ícones de tipos de imóvel em três estilos, na grade do Heroicons v2 (24x24, só <path>, cor herdada do texto).

## Estilos
- svg/              contorno: traço 1.5, pontas e cantos arredondados (padrão outline do Heroicons)
- svg-duotone/      duotone: o mesmo contorno sobre uma área de fundo em 20% da cor
- svg-preenchido/   preenchido: silhueta sólida com portas e janelas vazadas (padrão solid do Heroicons)

## Conteúdo
- tipos-sprite.svg   os três estilos num arquivo só: vc-tipo-<nome>, vc-tipo-<nome>-duotone, vc-tipo-<nome>-preenchido
- tipos.json         nome em português, categoria, origem e sinônimos de cada ícone

## Uso com sprite
<svg class="icon" width="24" height="24"><use href="/assets/tipos-sprite.svg#vc-tipo-sobrado-preenchido"/></svg>

## Uso inline
Cole o conteúdo do SVG. A cor segue o CSS color do elemento pai.

## Quando usar cada estilo
Contorno é o padrão. Preenchido marca o item ativo (filtro selecionado, aba atual). Duotone serve para destaques grandes, como os atalhos de busca da home.

## Tamanhos
16 px em listas e filtros, 20 px no card do imóvel, 28 px nos atalhos de busca da home.
"@
[IO.File]::WriteAllText("$stage\LEIAME.md", $readme, $utf8)
$zip = "$root\dist\tipos-valecasa-v$ver.zip"
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($stage, $zip)
Remove-Item $stage -Recurse -Force

"OK: $($ids.Count) ícones x $($estilos.Count) estilos · sprite, catálogo e $(Split-Path $zip -Leaf) gerados em dist\"
