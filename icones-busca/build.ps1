# Gera o sprite, o catálogo e o .zip dos ícones da Busca do ValeCasa (lugares e pessoas/empresas).
# Ícones com origem "tipo:<id>" ou "comodidade:<id>" (se surgirem) copiam o SVG de mesmo conceito a cada build.
# Uso: powershell -ExecutionPolicy Bypass -File build.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$repo = Split-Path $root -Parent
$utf8 = New-Object Text.UTF8Encoding $false
$jsonText = [IO.File]::ReadAllText("$root\busca.json")
$data = $jsonText | ConvertFrom-Json

# Sincroniza os desenhos herdados de outras famílias
foreach ($i in $data.icones) {
  $src = $null
  if ($i.origem -like 'tipo:*') { $src = Join-Path $repo ('icones-tipos\svg\' + $i.origem.Substring(5) + '.svg') }
  if ($i.origem -like 'comodidade:*') { $src = Join-Path $repo ('icones-comodidades\svg\' + $i.origem.Substring(11) + '.svg') }
  if ($src) {
    if (-not (Test-Path $src)) { throw "Origem não encontrada para $($i.id): $src" }
    Copy-Item $src "$root\svg\$($i.id).svg" -Force
  }
}

# Confere se índice e arquivos batem
$ids = @($data.icones | ForEach-Object { $_.id })
$dup = $ids | Group-Object | Where-Object Count -gt 1 | ForEach-Object Name
if ($dup) { throw "ids repetidos no índice: $($dup -join ', ')" }
$files = @(Get-ChildItem "$root\svg" -Filter *.svg | ForEach-Object { $_.BaseName })
$semArquivo = $ids | Where-Object { $files -notcontains $_ }
$semIndice = $files | Where-Object { $ids -notcontains $_ }
if ($semArquivo) { throw "No índice, mas sem SVG: $($semArquivo -join ', ')" }
if ($semIndice) { throw "SVG sem entrada no índice: $($semIndice -join ', ')" }

# Sprite: cada símbolo leva os próprios atributos de cor, então funciona em qualquer página
$symbols = foreach ($id in $ids) {
  $svg = [IO.File]::ReadAllText("$root\svg\$id.svg")
  # Sem o <metadata> de procedência (C2PA): no sprite ele só pesaria
  $inner = [regex]::Match($svg, '(?s)<svg[^>]*>(.*)</svg>').Groups[1].Value -replace '(?s)<metadata>.*?</metadata>', ''
  $inner = ($inner.Trim() -replace '\r?\n\s*', '')
  if ($inner -match '<(circle|rect|ellipse|line|polygon|polyline)\b') { throw "svg\$id.svg tem forma solta; converta para <path>" }
  "  <symbol id=`"vc-busca-$id`" viewBox=`"0 0 24 24`" fill=`"none`" stroke=`"currentColor`" stroke-width=`"1.5`">$inner</symbol>"
}
$sprite = "<svg xmlns=`"http://www.w3.org/2000/svg`">`n$($symbols -join "`n")`n</svg>`n"
[IO.File]::WriteAllText("$root\dist\busca-sprite.svg", $sprite, $utf8)

# Catálogo
$tpl = [IO.File]::ReadAllText("$root\catalogo-template.html")
$html = $tpl.Replace('/*__DATA__*/', $jsonText.Trim()).Replace('<!--__SPRITE__-->', ($symbols -join "`n"))
[IO.File]::WriteAllText("$root\dist\catalogo-busca.html", $html, $utf8)

# Pacote .zip para o time
$ver = $data.versao
Get-ChildItem "$root\dist" -Filter 'busca-valecasa-v*.zip' | Remove-Item -Force
$stage = Join-Path $env:TEMP "vc-busca-$ver"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path "$stage\svg" | Out-Null
Copy-Item "$root\svg\*.svg" "$stage\svg\"
Copy-Item "$root\busca.json", "$root\dist\busca-sprite.svg" $stage
$readme = @"
# Ícones da Busca ValeCasa · v$ver

$($ids.Count) ícones para as sugestões da busca, na grade do Heroicons v2 (24x24, traço 1.5, só <path>, cor herdada do texto).

## Grupos
- Lugares: Cidade, Bairro, Rua, Edifício, Condomínio
- Pessoas e empresas: Perfil, Corretores, Imobiliárias, Construtoras

## Conteúdo
- svg/              um arquivo por ícone (ex.: svg/bairro.svg)
- busca-sprite.svg  todos num arquivo só: vc-busca-<nome>
- busca.json        nome em português, grupo, origem e sinônimos de cada ícone

## Uso com sprite
<svg class="icon" width="20" height="20"><use href="/assets/busca-sprite.svg#vc-busca-bairro"/></svg>

## Uso inline
Cole o conteúdo do SVG. A cor segue o CSS color do elemento pai.

## Tamanhos
20 px nas linhas do dropdown da busca, 16 px em chips e etiquetas.
"@
[IO.File]::WriteAllText("$stage\LEIAME.md", $readme, $utf8)
$zip = "$root\dist\busca-valecasa-v$ver.zip"
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($stage, $zip)
Remove-Item $stage -Recurse -Force

"OK: $($ids.Count) ícones · sprite, catálogo e $(Split-Path $zip -Leaf) gerados em dist\"
