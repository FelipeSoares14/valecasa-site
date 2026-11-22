# Ícones da Busca ValeCasa · v1.1

9 ícones para as sugestões do dropdown da busca da home (lugares) e para a busca de pessoas e empresas, na grade do Heroicons v2: 24x24, traço 1.5, só `<path>`, cor herdada do texto (currentColor). Mesmo esquema dos Tipos (`../icones-tipos`) e dos Espaços (`../icones-espacos`).

## Conteúdo
- svg/                     um arquivo por ícone (ex.: svg/bairro.svg)
- busca.json               nome em português, grupo, origem e sinônimos de cada ícone
- build.ps1                gera dist/busca-sprite.svg, dist/catalogo-busca.html e o .zip
- catalogo-template.html   modelo do catálogo

## Ícones
- Lugares: Cidade, Bairro, Rua, Edifício, Condomínio
- Pessoas e empresas: Perfil, Corretores, Imobiliárias, Construtoras

## Linguagem
- Cidade: o mapa dobrado (`map` do Heroicons), escolha do time.
- Bairro: duas árvores na calçada e um passarinho, desenho do time redesenhado no padrão.
- Rua: o alfinete de localização (`map-pin` do Heroicons), escolha do time.
- Edifício: um prédio só, com caixa d'água no topo, janelas e marquise na entrada.
- Condomínio: uma casa na frente e o telhado das casas iguais repetido atrás.
- Perfil: o `user` oficial do Heroicons.
- Corretores: o busto do Perfil com a chave do imóvel ao lado.
- Imobiliárias: o escritório de rua com a placa em forma de casa pendurada na fachada.
- Construtoras: o guindaste com o gancho sobre a obra.

## Origem dos desenhos (campo `origem` no busca.json)
- `time:<arquivo>`: ícones do time ValeCasa (`OneDrive/Área de Trabalho/icons example/busca`) no padrão: Cidade (`CIDADE`, igual ao `map` do Heroicons), Bairro (`BAIRRO`, redesenhado só com traço, sem preenchimento nem sobreposição) e Rua (`rua`, igual ao `map-pin`).
- `heroicons:<nome>`: Perfil (`user`).
- `novo`: desenhado para a Busca (5).
- `tipo:<id>` e `comodidade:<id>`: nenhum por enquanto; o build copia o SVG da origem a cada execução.

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
20 px nas linhas do dropdown da busca, 16 px em chips e etiquetas.
