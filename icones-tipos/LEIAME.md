# Ícones de Tipos de Imóvel ValeCasa · v1.1

13 ícones dos tipos de imóvel (busca, filtros, cards e anúncios) na grade do Heroicons v2: 24x24, traço 1.5, só `<path>`, cor herdada do texto (currentColor). Mesmo método dos Espaços (`../icones-espacos`).

## Conteúdo
- svg/            contorno: um arquivo por tipo (ex.: svg/sobrado.svg)
- svg-duotone/    duotone: o mesmo contorno sobre uma área de fundo em 20% da cor
- svg-preenchido/ preenchido: silhueta sólida com portas e janelas vazadas
- tipos.json      nome em português, categoria, origem e nomes alternativos de cada ícone
- build.ps1       gera dist/tipos-sprite.svg (os três estilos), dist/catalogo-tipos.html e o .zip
- catalogo-template.html   modelo do catálogo

## Tipos
- Casas: Casa, Sobrado, Casa de Condomínio, Casa de Vila
- Apartamentos e Unidades: Apartamento, Cobertura, Kitnet, Studio, Flat, Loft
- Terrenos e Rurais: Terreno / Lote, Chácara, Fazenda / Sítio

## Origem dos desenhos (campo `origem` no tipos.json)
- `time:<arquivo>`: ícone desenhado pelo time ValeCasa e redesenhado no padrão (só traço, sem preenchimento nem máscara): Casa (`casa comum`), Casa de Vila (`casa de vila`), Terreno / Lote (`terreno`) e Fazenda / Sítio (`rural`, a porteira).
- `novo`: desenhado para os Tipos na mesma linguagem (9).
- `heroicons:<nome>` e `comodidade:<id>`: nenhum por enquanto.

## Linguagem
Cada tipo mostra a fachada real do imóvel, como se vê da rua: casa térrea com porta e garagem, sobrado com o mesmo telhado em dois andares, pórtico de condomínio fechado, predinho de kitnets com escada externa, prédio de flat com marquise e placa, cobertura com guarda-sol no terraço. Studio (cama e bancada no mesmo ambiente) e Loft (corte do pé-direito duplo com mezanino, cama, escada e janela industrial) mostram o interior, porque a diferença deles está dentro.

## Estilos
- Contorno (`svg/`, sprite `vc-tipo-<id>`): o padrão, em listas, filtros e cards.
- Duotone (`svg-duotone/`, sprite `vc-tipo-<id>-duotone`): destaques grandes, como os atalhos de busca da home. Dois paths: a área de fundo (`fill="currentColor" opacity=".2"`) e o contorno.
- Preenchido (`svg-preenchido/`, sprite `vc-tipo-<id>-preenchido`): item ativo, como o filtro selecionado. Padrão `solid` do Heroicons: um path com `fill-rule="evenodd"`.

Os dois estilos novos são gerados a partir de uma descrição geométrica de cada ícone (massas, furos e traços), com o mesmo desenho do contorno. Se um contorno mudar, o duotone e o preenchido precisam ser gerados de novo.

## Padrão do código
Igual ao `optimized/24/outline` do Heroicons v2:

    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
      <path stroke-linecap="round" stroke-linejoin="round" d="..."/>
    </svg>

Sem width/height e sem circle, rect, ellipse, line, polygon ou polyline. O build recusa um SVG com forma solta.

## Gerar
Se um contorno mudar, gere o duotone e o preenchido de novo (precisa do shapely):

    python gerar-estilos.py

Depois, em todo caso:
    powershell -ExecutionPolicy Bypass -File build.ps1

## Uso com sprite
    <svg class="icon" width="24" height="24"><use href="/assets/tipos-sprite.svg#vc-tipo-sobrado"/></svg>

## Tamanhos
16 px em listas e filtros, 20 px no card do imóvel, 28 px nos atalhos de busca da home.
