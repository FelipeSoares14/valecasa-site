# Ícones da Busca ValeCasa · v1.3

19 ícones para as sugestões do dropdown da busca da home, para a busca de pessoas e empresas e para o mapa e o anúncio, na grade do Heroicons v2: 24x24, traço 1.5, só `<path>`, cor herdada do texto (currentColor). Mesmo esquema dos Tipos (`../icones-tipos`) e dos Espaços (`../icones-espacos`).

## Conteúdo
- svg/                     um arquivo por ícone (ex.: svg/bairro.svg)
- busca.json               nome em português, grupo, origem e sinônimos de cada ícone
- build.ps1                gera dist/busca-sprite.svg, dist/catalogo-busca.html e o .zip
- catalogo-template.html   modelo do catálogo

## Ícones
- Lugares: Cidade, Bairro, Rua, Edifício, Condomínio, Empreendimento
- Pessoas e empresas: Perfil, Corretores, Imobiliárias, Construtoras
- Mapa e anúncio: Mapa com pino, Camadas do mapa, Rota até o imóvel, Parque e natureza, Chácara, Planta baixa, Chave, Casa com chave, Selo

## Linguagem
- Cidade: a placa de direção no poste, com uma seta para cada lado.
- Bairro: duas árvores sobre um pedaço de terreno visto de cima.
- Rua: o `map-pin` oficial do Heroicons (o alfinete do time).
- Edifício: um prédio só, com caixa d'água no topo, janelas e marquise na entrada.
- Condomínio: dois prédios lado a lado, de telhado inclinado, com janela e porta.
- Empreendimento: um par de chaves em pé, desencontradas, com os dentes para dentro.
- Perfil: o `user` oficial do Heroicons.
- Corretores: o busto do Perfil com uma chave em pé ao lado.
- Imobiliárias: a loja de toldo recortado, com porta e um arbusto na frente.
- Construtoras: o guindaste com o gancho sobre a obra.
- Mapa e anúncio: alfinete sobre o mapa, camadas do mapa com uma estrada, casinha com uma trilha de pontos até o alfinete, árvore com sol e colinas, chácara com estradinha, planta baixa com o cursor, chave (a `key` oficial do Heroicons), casa com chave e selo de destaque.

As chaves desenhadas aqui (Empreendimento, Corretores, Casa com chave) seguem a anatomia da `key` do Heroicons: argola com o brilho em quarto de círculo, haste de 2.25 e dentes em degrau.

## Origem dos desenhos (campo `origem` no busca.json)
- `time:<arquivo>`: ícones do time ValeCasa (`OneDrive/Área de Trabalho/hand off/novos`), redesenhados no padrão. Os originais vieram de um traçado à mão de imagem, irregular e preenchido. A ideia de cada um foi mantida, mas a geometria foi refeita na grade, só com traço e sem sobreposição. Ao lado do nome do arquivo vai o nome interno do desenho (ex.: `Cidade (34-placa-direcao)`).
- `heroicons:<nome>`: Perfil (`user`), Rua (`map-pin`) e Chave (`key`), iguais aos oficiais; os desenhos do time para Rua e Chave pediam exatamente esses ícones.
- `novo`: desenhado para a Busca (Edifício, Corretores, Construtoras).
- `tipo:<id>` e `comodidade:<id>`: nenhum por enquanto; o build copia o SVG da origem a cada execução.

O `gerar-busca.py` desenha os ícones de código (todos menos Edifício, Perfil e Construtoras) e escreve o path como o svgo do Heroicons: curvas relativas, letra de comando sem repetição, sem espaço antes de `-` nem de `.` quando o número anterior já tem ponto. Depois de mudar um desenho, rode o script e o build.

A Chácara daqui é diferente da Chácara dos Tipos (`../icones-tipos/svg/chacara.svg`). Se as duas tiverem que ser iguais, troque a origem para `tipo:chacara`.

## Padrão do código
Igual ao `optimized/24/outline` do Heroicons v2:

    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
      <path stroke-linecap="round" stroke-linejoin="round" d="..."/>
    </svg>

Sem width/height e sem circle, rect, ellipse, line, polygon ou polyline. O build recusa um SVG com forma solta. Elementos que não se tocam ficam a pelo menos 2.0 de distância entre eixos.

## Gerar
    powershell -ExecutionPolicy Bypass -File build.ps1

## Uso com sprite
    <svg class="icon" width="20" height="20"><use href="/assets/busca-sprite.svg#vc-busca-bairro"/></svg>

## Tamanhos
20 px nas linhas do dropdown da busca, 16 px em chips e etiquetas, 24 px nos botões do mapa.
