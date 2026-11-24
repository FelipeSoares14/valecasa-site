# Ícones da Busca ValeCasa · v2.2

10 ícones para as sugestões do dropdown da busca da home (lugares e pessoas ou empresas), em três estilos (contorno, duotone e preenchido) e numa versão animada, como os Tipos de imóvel. Grade do Heroicons v2: 24x24, traço 1.5, só `<path>`, cor herdada do texto (currentColor). Mesmo esquema dos Tipos (`../icones-tipos`) e dos Espaços (`../icones-espacos`).

## Conteúdo
- svg/                     contorno: um arquivo por ícone (ex.: svg/bairro.svg)
- svg-duotone/             duotone: o mesmo contorno sobre uma área de fundo em 20% da cor
- svg-preenchido/          preenchido: silhueta sólida com janelas, portas, gravata e brilho vazados
- animados/                versão animada: o contorno em partes que se mexem ao passar o mouse, mais o vc-anim.js
- busca.json               nome em português, grupo, origem e sinônimos de cada ícone
- converter-time.py        converte os desenhos do time para o padrão (veja abaixo)
- gerar-estilos.py         gera o duotone e o preenchido a partir do contorno (precisa do shapely)
- gerar-animados.py        gera os animados a partir do contorno
- pathlib_vc.py            lê o path do contorno parte por parte (usado pelos dois geradores)
- build.ps1                gera dist/busca-sprite.svg, dist/catalogo-busca.html e o .zip
- catalogo-template.html   modelo do catálogo

## Ícones
- Lugares: Cidade, Bairro, Rua, Edifício, Condomínio, Empreendimento
- Pessoas e empresas: Perfil, Corretores, Imobiliárias, Construtoras

## Desenhos
Todos são do time ValeCasa (`OneDrive/Área de Trabalho/hand off/icones dribble/search`), exceto o Edifício:
- Cidade: a placa de direção no poste.
- Bairro: duas árvores de copa dupla no chão e o sol (ou a lua) no céu.
- Rua: o alfinete de localização (igual ao `map-pin` do Heroicons).
- Condomínio: uma casa na frente e o telhado das casas iguais repetido atrás.
- Empreendimento: duas chaves, uma atrás da outra.
- Perfil: a pessoa no círculo (igual ao `user-circle` do Heroicons).
- Corretores: a pessoa de gravata.
- Imobiliárias: a equipe, com a pessoa de gravata na frente e duas atrás.
- Construtoras: a pessoa de gravata na frente do prédio em obra.
- Edifício (`novo`, da versão anterior): um prédio só, com caixa d'água no topo, janelas e marquise na entrada.

## Como os desenhos do time entram (converter-time.py)
O desenho é mantido. O script só:
1. desfaz a escala de quem foi redimensionado no Figma (traço 1.549, 1.468 ou 1.626): escala 1.5/traço em volta do centro da grade, para o traço voltar a 1.5 com a mesma proporção. A Construtora é a exceção: o time a encaixou no quadro de propósito (traço 1.423), e desfazer a escala a faria passar da área útil da grade, então ela mantém o tamanho e só o traço vira 1.5;
2. junta os `<path>` num só, sem fill, e tira restos de exportação do Figma (trechos de menos de 0.05);
3. reescreve como o svgo do Heroicons: arcos de círculo como `a`, retas como `h`/`v`/`l`, o resto em `c` relativo, até 3 casas, sem repetir a letra do comando;
4. troca anel minúsculo (cheio no Figma) pelo ponto do Heroicons (`h.008v.008`), porque com traço 1.5 e sem fill o Chrome o desenha oco;
5. ajustes mínimos: no Bairro os troncos, que paravam 0.7 acima do chão, passam a tocar o chão, e o ponto do céu virou um sol (ou lua) de raio 1.5, a pedido do time, em (20.25, 6.375) para caber na margem; no Corretor, na Imobiliária e na Construtora as pontas da gravata e do nó, que estavam até 0.2 fora do eixo da cabeça, voltam ao eixo, e no Corretor e na Imobiliária a figura fica centralizada na grade.

Perfil e Rua saem com o código oficial do Heroicons, porque o desenho do time é exatamente o `user-circle` e o `map-pin`.

Se o time mudar um desenho, salve por cima na pasta de origem e rode, nesta ordem:

    python converter-time.py
    python gerar-estilos.py
    python gerar-animados.py
    powershell -ExecutionPolicy Bypass -File build.ps1

(Se as partes de um ícone mudarem de quantidade, ajuste os índices em `gerar-estilos.py` e `gerar-animados.py`; o gerador dos animados avisa quando uma parte ficou de fora.)

## Estilos
- Contorno (`svg/`, sprite `vc-busca-<id>`): o padrão, nas linhas do dropdown.
- Duotone (`svg-duotone/`, sprite `vc-busca-<id>-duotone`): destaques grandes. Dois paths: a área de fundo (`fill="currentColor" opacity=".2"`) e o contorno.
- Preenchido (`svg-preenchido/`, sprite `vc-busca-<id>-preenchido`): item ativo, como a sugestão selecionada. Padrão `solid` do Heroicons: um path com `fill-rule="evenodd"`.

O `gerar-estilos.py` lê o contorno parte por parte e descreve cada ícone em camadas, de trás para a frente: massas (ganham 0,75 de borda, para bater com a silhueta do contorno de 1,5), traços (barra de 1,5), furos (portas, o miolo do alfinete) e cortes (janelas, gravata e brilho da chave viram sulcos de 1,5). Onde o contorno desenha uma coisa na frente da outra (cabeça sobre o corpo, chave sobre chave, pessoa diante do prédio), a peça de trás ganha um respiro de 1,0, como no `user` sólido do Heroicons. No Perfil, cabeça e ombros são vazados no disco, como no `user-circle` sólido do Heroicons. Se um contorno mudar, rode o script de novo.

## Versão animada (`animados/`)
Mesmo padrão dos Tipos: cada ícone é o contorno separado em partes (os próprios subpaths do contorno, então parado ele é idêntico), que se mexem por 1,1 s com mola:
- Cidade: as placas se abrem para os lados.
- Bairro: as árvores balançam e o sol pulsa.
- Rua: o alfinete pula e assenta.
- Edifício: as janelas acendem de baixo para cima e a caixa d'água pula.
- Condomínio: a casa e os telhados de trás pulam em onda.
- Empreendimento: as chaves chacoalham em volta da argola.
- Perfil, Corretores e Construtoras: a cabeça acena (no Corretor o nó da gravata também; na Construtora as janelas acendem antes).
- Imobiliárias: as três cabeças acenam em onda.

A curva de mola, o `kick()` e o CSS são os mesmos do `../icones-tipos/gerar-animados.py`, e o `vc-anim.js` é o mesmo arquivo (copiado a cada geração). Toca ao passar o mouse, focar ou tocar no ícone ou no link/botão que o contém, ou com a classe `.is-playing`. Quem pediu menos movimento no sistema vê o ícone parado. Use o SVG inline: dentro de sprite ou de `<img>` ele não anima. Fora do padrão "um path só": cada parte é um `<path>` com classe, e o arquivo leva um `<style>`.

## Padrão do código
Igual ao `optimized/24/outline` do Heroicons v2:

    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
      <path stroke-linecap="round" stroke-linejoin="round" d="..."/>
    </svg>

Sem width/height e sem circle, rect, ellipse, line, polygon ou polyline. O build recusa um SVG com forma solta.

## Uso com sprite
    <svg class="icon" width="20" height="20"><use href="/assets/busca-sprite.svg#vc-busca-bairro"/></svg>

## Tamanhos
20 px nas linhas do dropdown da busca, 16 px em chips e etiquetas.
