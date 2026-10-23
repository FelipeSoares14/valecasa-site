# Gera a folha de prova de um lote em ..\folhas-de-prova\<arquivo>.png
# Uso: powershell -File prova.ps1 -Titulo "Lote 3 ..." -Arquivo lote-3 -Ids piscina,sauna,...
param([string]$Titulo, [string]$Arquivo, [string[]]$Ids, [int]$Altura = 0)
$root = $PSScriptRoot
$Ids = @($Ids | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })
$head = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
$ref = $head + '<path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>'
$cells = foreach ($k in $Ids) { $s = [IO.File]::ReadAllText("$root\svg\$k.svg"); "<div><div class='big'>$s</div><div class='sm'>$s$s</div><span>$k</span></div>" }
$cells += "<div class='ref'><div class='big'>$ref</div><div class='sm'>$ref$ref</div><span>referência: Heroicons home</span></div>"
$css = "h1{font-size:18px;margin:0 0 4px}p{margin:0 0 14px;font-size:12px;color:#666}.g{display:grid;grid-template-columns:repeat(7,150px);gap:8px}.g>div{border:1px solid #ddd;border-radius:6px;padding:8px;text-align:center}.ref{background:#F3ECFF}.big svg{width:96px;height:96px;background:repeating-linear-gradient(0deg,#eee 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,#eee 0 1px,transparent 1px 4px)}.sm{margin-top:4px}.sm svg{width:24px;height:24px;margin:0 4px;vertical-align:middle}.sm svg+svg{width:16px;height:16px}span{font-size:11px;display:block;margin-top:4px}"
$html = "<html><head><meta charset='utf-8'></head><body style='font-family:Segoe UI,sans-serif;margin:20px;color:#1B1825;background:#fff'><style>$css</style><h1>ValeCasa · Comodidades · $Titulo</h1><p>96 px na grade · 24 px · 16 px. Traço 1.5, grade Heroicons.</p><div class='g'>$($cells -join '')</div></body></html>"
$pv = Join-Path $env:TEMP "prova-$Arquivo.html"
[IO.File]::WriteAllText($pv, $html, (New-Object Text.UTF8Encoding $false))
$rows = [math]::Ceiling(($Ids.Count + 1) / 7)
if ($Altura -eq 0) { $Altura = 90 + $rows * 170 }
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
$out = Join-Path (Split-Path $root -Parent) "folhas-de-prova\$Arquivo.png"
& $edge --headless=new --disable-gpu --hide-scrollbars --window-size=1130,$Altura --screenshot="$out" "file:///$($pv -replace '\\','/')" | Out-Null
Start-Sleep 2
$out
