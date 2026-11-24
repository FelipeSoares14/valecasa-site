# Ícones de Tipos de Imóvel ValeCasa · v1.2

13 ícones dos tipos de imóvel (busca, filtros, cards e anúncios) na grade do Heroicons v2: 24x24, traço 1.5, só `<path>`, cor herdada do texto (currentColor). Mesmo método dos Espaços (`../icones-espacos`).

## Conteúdo
- svg/            contorno: um arquivo por tipo (ex.: svg/sobrado.svg)
- svg-duotone/    duotone: o mesmo contorno sobre uma área de fundo em 20% da cor
- svg-preenchido/ preenchido: silhueta sólida com portas e janelas vazadas
- animados/       versão animada: o contorno em partes que se mexem ao passar o mouse, mais o vc-anim.js
- tipos.json      nome em português, categoria, origem e nomes alternativos de cada ícone
- build.ps1       gera dist/tipos-sprite.svg (os três estilos), dist/catalogo-tipos.html e o .zip
- catalogo-template.html   modelo do catálogo

## Tipos
- Casas: Casa, Sobrado, Casa de Condomínio, Casa de Vila
- Apartamentos e Unidades: Apartamento, Cobertura, Kitnet, Studio, Flat, Loft
- Terrenos e Rurais: Terreno / Lote, Chácara, Fazenda / Sítio

## Origem dos desenhos (campo `origem` no tipos.json)
- `time:<arquivo>`: ícone desenhado pelo time ValeCasa e redesenhado no padrão (só traço, sem preenchimento nem máscara): Casa (`casa comum`), Casa de Vila (`casa de vila`), Chácara (`35-chácara`: sede com varanda em arcos e caminho até a porta), Terreno / Lote (`terreno`) e Fazenda / Sítio (`rural`, a porteira).
- `novo`: desenhado para os Tipos na mesma linguagem (8).
- `heroicons:<nome>` e `comodidade:<id>`: nenhum por enquanto.

## Linguagem
Cada tipo mostra a fachada real do imóvel, como se vê da rua: casa térrea com porta e garagem, sobrado com o mesmo telhado em dois andares, pórtico de condomínio fechado, predinho de kitnets com escada externa, prédio de flat com marquise e placa, cobertura com guarda-sol no terraço. Studio (cama e bancada no mesmo ambiente) e Loft (corte do pé-direito duplo com mezanino, cama, escada e janela industrial) mostram o interior, porque a diferença deles está dentro.

## Estilos
- Contorno (`svg/`, sprite `vc-tipo-<id>`): o padrão, em listas, filtros e cards.
- Duotone (`svg-duotone/`, sprite `vc-tipo-<id>-duotone`): destaques grandes, como os atalhos de busca da home. Dois paths: a área de fundo (`fill="currentColor" opacity=".2"`) e o contorno.
- Preenchido (`svg-preenchido/`, sprite `vc-tipo-<id>-preenchido`): item ativo, como o filtro selecionado. Padrão `solid` do Heroicons: um path com `fill-rule="evenodd"`.

Os dois estilos novos são gerados a partir de uma descrição geométrica de cada ícone (massas, furos e traços), com o mesmo desenho do contorno. Se um contorno mudar, o duotone e o preenchido precisam ser gerados de novo.

## Versão animada (`animados/`)
Cada ícone é o mesmo desenho do contorno, separado em partes que se mexem como a coisa que representam, por 1,1 s, com mola: o telhado da Casa pula e assenta, o pendente do Studio balança, o caminho da Chácara se desenha até a porta, as folhas da porteira abrem e fecham.

- A curva de mola é uma `linear()` calculada de uma simulação de mola amortecida (`gerar-animados.py`), então o movimento passa do ponto e assenta.
- Toca ao passar o mouse, focar ou tocar no ícone ou no link/botão que o contém (`:hover`), ou com a classe `.is-playing`.
- `vc-anim.js` (opcional) faz a animação ir até o fim mesmo se o mouse sair antes, e toca de novo a cada entrada, foco ou clique.
- Quem pediu menos movimento no sistema (`prefers-reduced-motion`) vê o ícone parado.
- Use o SVG inline no HTML: dentro de sprite (`<use>`) ou de `<img>` ele não anima.
- Fora do padrão "um path só": aqui cada parte é um `<path>` com classe, e o arquivo leva um `<style>` com os keyframes.

Para mudar um movimento, edite `ICONES` em `gerar-animados.py`, rode `python gerar-animados.py` e depois o build.

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
