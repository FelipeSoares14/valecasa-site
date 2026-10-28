# Ícones de Espaços ValeCasa · v1.0

59 ícones de cômodos e espaços (lançamentos e imóveis usados) na grade do Heroicons v2: 24x24, traço 1.5, só `<path>`, cor herdada do texto (currentColor).

## Conteúdo
- svg/            um arquivo por espaço (ex.: svg/quarto-casal.svg)
- espacos.json    nome em português, categoria e origem de cada ícone
- build.ps1       gera dist/espacos-sprite.svg, dist/catalogo-espacos.html e o .zip
- catalogo-template.html   modelo do catálogo

## Origem dos desenhos (campo `origem` no espacos.json)
- `novo`: desenhado para os Espaços (21)
- `comodidade:<id>`: mesmo desenho da comodidade de mesmo conceito (37). O build copia o SVG de `../icones-comodidades/svg`, então para mudar um desses ícones edite a comodidade e rode o build de novo.
- `heroicons:<nome>`: ícone oficial do Heroicons, MIT (1: Salão de Festas usa `cake`)

## Padrão do código
Igual ao `optimized/24/outline` do Heroicons v2:

    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
      <path stroke-linecap="round" stroke-linejoin="round" d="..."/>
    </svg>

Sem width/height e sem circle, rect, ellipse, line, polygon ou polyline. O build recusa um SVG com forma solta.

## Gerar
    powershell -File build.ps1

## Uso com sprite
    <svg class="icon" width="24" height="24"><use href="/assets/espacos-sprite.svg#vc-esp-quarto"/></svg>

## Tamanhos
16 px em listas, 20 px no card do imóvel, 28 px nos blocos da página do imóvel.
