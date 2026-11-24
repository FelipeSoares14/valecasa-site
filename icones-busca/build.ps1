# Gera o sprite, o catálogo e o .zip dos ícones da Busca do ValeCasa (lugares e pessoas/empresas).
# Os contornos vêm dos desenhos do time (converter-time.py); duotone e preenchido de gerar-estilos.py;
# animados de gerar-animados.py. Mesmo esquema dos Tipos de imóvel.
# Uso: powershell -ExecutionPolicy Bypass -File build.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$utf8 = New-Object Text.UTF8Encoding $false
$jsonText = [IO.File]::ReadAllText("$root\busca.json")
$data = $jsonText | ConvertFrom-Json

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
    "  <symbol id=`"vc-busca-$id$($e.sufixo)`" viewBox=`"0 0 24 24`" $($e.attrs)>$inner</symbol>"
  }
}
$sprite = "<svg xmlns=`"http://www.w3.org/2000/svg`">`n$($symbols -join "`n")`n</svg>`n"
[IO.File]::WriteAllText("$root\dist\busca-sprite.svg", $sprite, $utf8)

# Animados: SVG com partes e CSS próprio, usados inline (não entram no sprite)
$anim = [ordered]@{}
foreach ($id in $ids) {
  $f = "$root\animados\$id.svg"
  if (-not (Test-Path $f)) { throw "animados: falta $id.svg (rode gerar-animados.py)" }
  $svg = [IO.File]::ReadAllText($f).Trim()
  if ($svg -match '<(circle|rect|ellipse|line|polygon|polyline)\b') { throw "animados\$id.svg tem forma solta; converta para <path>" }
  $anim[$id] = $svg
}
$animJson = $anim | ConvertTo-Json -Compress

# Catálogo
$tpl = [IO.File]::ReadAllText("$root\catalogo-template.html")
$html = $tpl.Replace('/*__DATA__*/', $jsonText.Trim()).Replace('/*__ANIM__*/', $animJson).Replace('<!--__SPRITE__-->', ($symbols -join "`n"))
[IO.File]::WriteAllText("$root\dist\catalogo-busca.html", $html, $utf8)

# Pacote .zip para o time
$ver = $data.versao
Get-ChildItem "$root\dist" -Filter 'busca-valecasa-v*.zip' | Remove-Item -Force
$stage = Join-Path $env:TEMP "vc-busca-$ver"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
foreach ($e in $estilos) {
  New-Item -ItemType Directory -Path "$stage\$($e.pasta)" | Out-Null
  Copy-Item "$root\$($e.pasta)\*.svg" "$stage\$($e.pasta)\"
}
New-Item -ItemType Directory -Path "$stage\animados" | Out-Null
Copy-Item "$root\animados\*" "$stage\animados\"
Copy-Item "$root\busca.json", "$root\dist\busca-sprite.svg" $stage
$readme = @"
# Ícones da Busca ValeCasa · v$ver

$($ids.Count) ícones para as sugestões da busca (lugares e pessoas ou empresas) em três estilos estáticos e uma versão animada, na grade do Heroicons v2 (24x24, só <path>, cor herdada do texto).

## Estilos
- svg/              contorno: traço 1.5, pontas e cantos arredondados (padrão outline do Heroicons)
- svg-duotone/      duotone: o mesmo contorno sobre uma área de fundo em 20% da cor
- svg-preenchido/   preenchido: silhueta sólida com janelas, portas e gravata vazadas (padrão solid do Heroicons)
- animados/         animado: o contorno separado em partes que se mexem como a coisa que representam (1,1 s, mola), mais o vc-anim.js

## Conteúdo
- busca-sprite.svg   os três estilos num arquivo só: vc-busca-<nome>, vc-busca-<nome>-duotone, vc-busca-<nome>-preenchido
- busca.json         nome em português, grupo, origem e sinônimos de cada ícone

## Uso com sprite
<svg class="icon" width="24" height="24"><use href="/assets/busca-sprite.svg#vc-busca-bairro-preenchido"/></svg>

## Uso inline
Cole o conteúdo do SVG. A cor segue o CSS color do elemento pai.

## Animados
Cole o SVG de animados/ direto no HTML: dentro de sprite ou de <img> ele não anima. Toca ao passar o mouse, focar ou tocar no ícone ou no link/botão que o contém. Inclua animados/vc-anim.js para a animação ir até o fim mesmo se o mouse sair antes. Quem pediu menos movimento no sistema vê o ícone parado.

## Quando usar cada estilo
Contorno é o padrão. Preenchido marca o item ativo (a sugestão selecionada, o filtro escolhido). Duotone serve para destaques grandes. Animado é para pontos de interação de destaque, como a sugestão em foco no dropdown da busca; use com moderação.

## Tamanhos
20 px nas linhas do dropdown da busca, 16 px em chips e etiquetas.
"@
[IO.File]::WriteAllText("$stage\LEIAME.md", $readme, $utf8)
$zip = "$root\dist\busca-valecasa-v$ver.zip"
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($stage, $zip)
Remove-Item $stage -Recurse -Force

"OK: $($ids.Count) ícones x $($estilos.Count) estilos · sprite, catálogo e $(Split-Path $zip -Leaf) gerados em dist\"
