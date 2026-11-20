---
name: ValeCasa
description: Portal imobiliário de Guaratinguetá, com números honestos e coração de quem mora na cidade.
colors:
  brand-green: "#03FE9F"
  brand-green-soft: "#6BFFC8"
  brand-green-tint: "#BDFFE6"
  brand-green-deep: "#007F50"
  on-green: "#00331F"
  brand-purple: "#4D00AF"
  brand-purple-deep: "#3D008C"
  brand-purple-night: "#22004F"
  brand-purple-bright: "#8A4DF0"
  brand-purple-tint: "#F3ECFF"
  lilac: "#E2C9F8"
  sun: "#FFDA00"
  coral-location: "#E5483B"
  star: "#F5B400"
  link: "#1F6FE0"
  success: "#16A34A"
  danger: "#DC2626"
  ink: "#140E1B"
  ink-2: "#4E4A5E"
  ink-3: "#6D687E"
  bg: "#F7F6FB"
  surface: "#FFFFFF"
  surface-2: "#F1EFF7"
  line: "#E3E0EC"
  line-strong: "#C9C5D6"
  lx-ground: "#1B0646"
  lx-paper: "#F5F0FD"
typography:
  display:
    fontFamily: "Geologica, ui-sans-serif, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(34px, 5.4vw, 58px)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  display-lx:
    fontFamily: "Geologica, ui-sans-serif, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(40px, 6.6vw, 88px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.045em"
  number-light:
    fontFamily: "Geologica, ui-sans-serif, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(36px, 4.6vw, 56px)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Geologica, ui-sans-serif, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(22px, 2.6vw, 28px)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Geologica, ui-sans-serif, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
  price:
    fontFamily: "Geologica, ui-sans-serif, Segoe UI, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  body:
    fontFamily: "Geologica, ui-sans-serif, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Geologica, ui-sans-serif, Segoe UI, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.14em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "10px"
  lg: "16px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.brand-green}"
    textColor: "{colors.on-green}"
    rounded: "{rounded.pill}"
    padding: "11px 22px"
  button-primary-hover:
    backgroundColor: "{colors.brand-green-soft}"
  button-purple:
    backgroundColor: "{colors.brand-purple}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "11px 22px"
  button-purple-hover:
    backgroundColor: "{colors.brand-purple-deep}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "11px 22px"
  button-outline-hover:
    backgroundColor: "{colors.surface-2}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "7px 12px 7px 16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  badge-sale:
    backgroundColor: "{colors.brand-purple-tint}"
    textColor: "{colors.brand-purple-deep}"
    rounded: "{rounded.xs}"
    padding: "5px 10px"
  badge-rent:
    backgroundColor: "{colors.brand-green-tint}"
    textColor: "{colors.brand-green-deep}"
    rounded: "{rounded.xs}"
    padding: "5px 10px"
  card-photo:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.sm}"
  simulator-panel:
    backgroundColor: "{colors.lx-ground}"
    textColor: "{colors.surface}"
    rounded: "20px"
---

# Design System: ValeCasa

## Overview

**Creative North Star: "O Conselheiro Moderno"**

O ValeCasa ajuda a escolher uma casa como um conselheiro que conhece Guará de cor: mostra os números sem rodeio (preço completo, custo do mês, parcela, preço do m² comparado ao bairro) e, ao lado deles, o que não cabe numa planilha: o recado de quem anuncia, o sol da manhã na sala, a padaria a duas quadras, quanto tempo leva até a Dutra. O visual carrega essa dupla natureza. A parte "dados" é limpa, tabular e precisa: números alinhados, barras de comparação, pontuações. A parte "coração" é a marca: o roxo profundo que acolhe, o verde vivo que diz "pode ir", as ilustrações de lugares reais da cidade e o coral que marca onde as coisas ficam.

O portal é claro e arejado, com densidade média: cards em grade e trilhos horizontais, seções separadas por espaço, não por caixas. A área de Lançamentos tem dialeto próprio, mais cinematográfico: um chão roxo-noite fixo nos dois temas, alternado com seções em papel lilás, títulos enormes em peso 800 e números grandes em peso 300. Os dois mundos compartilham a mesma fonte, os mesmos tokens de marca e o mesmo jeito de mostrar números.

O ValeCasa nunca deve parecer um portal nacional genérico: cinza e azul corporativo, grade infinita de cards iguais, a cidade como filtro e não como lugar.

**Key Characteristics:**
- Uma família só, Geologica, do peso 300 ao 900; a hierarquia vem de peso e tamanho.
- Roxo é chão e identidade; verde é ação e destaque; coral é localização.
- Números sempre tabulares, com os grandes em peso leve.
- Ilustrações de marcos reais de Guará no lugar de imagens genéricas.
- Tema claro e escuro completos, com a área de Lançamentos ancorada no roxo-noite em ambos.

## Colors

Uma marca de dois polos, roxo e verde neon, apoiada em neutros levemente arroxeados e em poucas cores com função fixa.

### Primary
- **Verde Sinal** (brand-green): a cor da ação. Botão principal, segmento selecionado, palavra em destaque nos títulos sobre roxo, logo sobre fundo escuro. Sempre com texto Verde Raiz (on-green) por cima, nunca branco.
- **Verde Hortelã** (brand-green-soft): hover do botão principal.
- **Verde Broto** (brand-green-tint): fundo do selo "Aluguel".
- **Verde Mata** (brand-green-deep): verde legível sobre claro (textos de marca, selo de aluguel, queda de preço).

### Secondary
- **Roxo ValeCasa** (brand-purple): a identidade. Logo sobre claro, botão secundário em caixa alta, contorno de destaque, cor de texto de marca, contadores.
- **Roxo Profundo** (brand-purple-deep) e **Roxo Noite** (brand-purple-night): o degradê do hero e do rodapé, texto do selo "Venda".
- **Roxo Elétrico** (brand-purple-bright): anel de foco e barras de juros nos simuladores.
- **Lavanda Clara** (brand-purple-tint) e **Lilás** (lilac): fundo do selo "Venda", textos secundários sobre roxo.
- **Chão de Lançamentos** (lx-ground) e **Papel Lilás** (lx-paper): o par de fundos da área de Lançamentos; o chão é igual nos dois temas.

### Tertiary
- **Coral Endereço** (coral-location): localização (bairro no card, tipo do imóvel no título) e o selo "Novo".
- **Sol** (sun): a fatia de entrada/sinal nas barras dos simuladores e reservas no espelho de vendas.
- **Estrela** (star), **Link** (link), **Sucesso** (success), **Perigo** (danger): funções fixas, sem uso decorativo.

### Neutral
- **Tinta** (ink): texto principal, contorno do botão outline.
- **Tinta Média** (ink-2) e **Tinta Suave** (ink-3): texto de apoio e legendas.
- **Névoa** (bg), **Superfície** (surface), **Superfície 2** (surface-2): fundo da página, cards e campos, áreas recuadas e hovers.
- **Linha** (line) e **Linha Forte** (line-strong): divisórias e bordas de campos e chips.

No tema escuro os neutros invertem para tons de berinjela (fundo #121019, superfície #1B1824), o texto de marca vira verde neon e o roxo de texto clareia para #B48CFF.

**The Green Means Go Rule.** O verde neon é reservado para a próxima ação e para o destaque de uma palavra. Se tudo é verde, nada é ação.

**The Coral Is a Place Rule.** Coral marca onde as coisas ficam (bairro, localização) e o que é novo. Não é cor de erro nem decoração.

**The Purple Floor Rule.** Roxo funciona como chão (hero, rodapé, painel de resultado, Lançamentos) ou como identidade pequena (logo, selo, contador). Evite roxo médio em grandes áreas de conteúdo do portal.

## Typography

**Display Font:** Geologica (com ui-sans-serif, Segoe UI, system-ui)
**Body Font:** Geologica
**Label Font:** Geologica em caixa alta com tracking largo

**Character:** Uma geométrica humanista com muitos pesos, usada nos extremos: 800 nos títulos que falam com voz própria, 300 nos números que precisam parecer calmos e grandes, 400 a 600 no resto.

### Hierarchy
- **Display** (800, clamp 34–58px, 1.02, -0.03em): títulos do hero do portal, até 15ch, com uma palavra em verde.
- **Display Lançamentos** (800, clamp 40–88px, 0.95, -0.045em): títulos de Lançamentos; seções usam a mesma voz em clamp 28–48px.
- **Number Light** (300, clamp 36–56px, 1, -0.04em, tabular): parcela, estatística, contagem regressiva, percentuais. O número grande é sempre leve.
- **Headline** (700, clamp 22–28px, 1.2, -0.015em): títulos de seção e da página do imóvel.
- **Title** (600, 16px): títulos de bloco com ícone, nomes em cards.
- **Price** (700, 17px, tabular): preço no card; subtotais em 600.
- **Body** (400, 15px, 1.55): texto corrido, até 68ch nas descrições.
- **Label** (600, 11px, tracking 0.14em, caixa alta): sobretítulos (eyebrows), cabeçalhos do rodapé; selos usam 700 a 10.5px.

**The Tabular Numbers Rule.** Todo número que se compara (preço, área, parcela, distância, nota) usa algarismos tabulares.

**The Heavy Words, Light Numbers Rule.** Palavras de impacto em 800; números de impacto em 300. Nunca um número gigante em peso pesado.

## Layout

O portal usa contêiner de 1240px com respiro lateral de 20px (16px no celular); Lançamentos usa 1320px com respiro clamp 16–32px. Seções do portal se separam por 56px no topo; as de Lançamentos por clamp 48–88px. A página do imóvel é uma coluna de conteúdo mais uma lateral fixa de 330px com o contato, que vira coluna única abaixo de 960px; no celular, uma barra fixa no rodapé carrega preço e "Entrar em contato".

Os feeds alternam grade de cards e trilhos horizontais com setas. O cabeçalho do portal é branco e fixo (64px); a navegação vira menu lateral abaixo de 1080px. Ritmo interno em passos de 4: 6, 8, 10, 12, 14, 16, 20, 24 e 36px entre blocos da página do imóvel. Componentes que vivem em colunas estreitas usam container queries para empilhar.

## Elevation & Depth

Plano por padrão, com profundidade por camadas de tom: névoa sob superfície branca, superfície 2 para áreas recuadas, roxo como chão escuro. Sombras são poucas e funcionais.

### Shadow Vocabulary
- **Repouso** (`box-shadow: 0 1px 2px rgba(27,24,37,.06), 0 1px 1px rgba(27,24,37,.04)`): botões redondos sobre foto, selos flutuantes.
- **Flutuante** (`box-shadow: 0 6px 24px -6px rgba(43,10,110,.18), 0 2px 6px rgba(27,24,37,.06)`): modais, menu lateral, toast. A sombra puxa para o roxo.
- **Cartão de busca** (`box-shadow: 0 20px 50px -20px rgba(0,0,0,.5)`): só o cartão de busca sobre o hero roxo.

**The Flat Cards Rule.** Cards de imóvel não têm sombra nem borda: a foto é o contêiner, e o hover aproxima a imagem (escala 1.035) em vez de levantar o card.

## Shapes

Duas famílias de canto convivem com função clara. **Pílula** (999px) para o que se toca com o dedo e é amigável: botão principal, botão outline, chips, abas, toast, links do menu. **Canto suave** (4–10px) para o que contém informação: fotos (6px), campos (6px), selos (4px), modais e painéis (10px), cartões de lançamento (16px), painel do simulador (20px). Botões retangulares em caixa alta (6px) são a exceção deliberada: o botão roxo e o botão de busca, que falam no tom "institucional" da marca. Bordas são finas (1px) em divisórias e 1.5px em campos e botões outline.

## Components

### Buttons
Simpáticos e firmes: pílula, peso 600, texto curto, sempre dizendo o próximo passo.
- **Shape:** pílula (999px), 14px, padding 11px 22px; pequeno 12px / 7px 14px; grande 15px / 14px 28px.
- **Primary:** Verde Sinal com texto Verde Raiz; hover em Verde Hortelã. Um por área de decisão.
- **Purple:** Roxo ValeCasa, texto branco, caixa alta 12px com tracking 0.06em, canto 6px; hover Roxo Profundo. Usado para ações institucionais e de anunciante.
- **Outline:** superfície com contorno Tinta 1.5px; hover em Superfície 2.
- **Ghost:** sem fundo, hover em Superfície 2.
- **Hover / Focus / Active:** transição de 0.15s em fundo e borda; ao pressionar desce 1px; foco com contorno de 2px em Roxo Elétrico, afastado 2px.

### Chips
- **Style:** pílula sobre superfície, borda Linha Forte, texto Tinta Média 13px; hover escurece a borda.
- **State:** abas usam o mesmo formato; segmentos (venda/aluguel, Price/SAC) ficam dentro de uma trilha Superfície 2, com o selecionado em Verde Sinal.

### Cards / Containers
- **Card de imóvel:** sem caixa. Foto 4:3 com canto 6px e selos sobrepostos (Venda/Aluguel/Novo no topo, favorito redondo no canto), depois bairro em coral, preço tabular, decomposição do custo em Tinta Suave e título em até duas linhas.
- **Painéis de informação:** superfície branca, borda Linha 1px, canto 10px, padding 16–20px (qualidade do anúncio, custos).
- **Shadow Strategy:** ver Elevation & Depth; cards são planos.

### Inputs / Fields
- **Style:** superfície, borda Linha Forte 1.5px, canto 6px, padding 10px 12px, 14px.
- **Focus:** borda Roxo ValeCasa e halo de 3px em Lilás.
- **Error:** borda e dica em Perigo, com mensagem que diz como corrigir.

### Navigation
- **Portal:** cabeçalho branco fixo, logo roxo, links 14px/500 em pílula com hover Superfície 2; página atual em 600 com fundo Superfície 2; selo "Novo" roxo em Lançamentos. Abaixo de 1080px, menu lateral de 320px.
- **Lançamentos:** cabeçalho roxo-noite translúcido com desfoque, logo verde, rótulo "LANÇAMENTOS" espaçado; página atual marcada por um traço verde embaixo.

### Simulador
O componente que traduz "número com coração". À esquerda, controles deslizantes com rótulo em 600 e valor grande tabular à direita, cada um com uma dica curta embaixo. À direita, um painel roxo-noite (canto 20px) com o resultado em Number Light, uma barra empilhada (Sol para entrada, Verde Sinal para o valor financiado ou parcelas da obra, Roxo Elétrico para juros ou financiamento), linhas com legenda e um aviso honesto do que a conta deixa de fora. No portal, o trilho do controle usa Roxo de texto sobre Linha Forte para funcionar nos dois temas.

### Selos
Caixa alta 10.5px/700, tracking 0.07em, canto 4px: Venda em Lavanda com Roxo Profundo, Aluguel em Verde Broto com Verde Mata, Novo em Coral com branco.

## Do's and Don'ts

### Do:
- **Do** usar Verde Sinal só para a próxima ação e para uma palavra de destaque em títulos sobre roxo.
- **Do** pôr texto Verde Raiz (#00331F) sobre verde neon, nunca branco.
- **Do** mostrar números com algarismos tabulares, e os grandes em peso 300.
- **Do** marcar bairro e localização em Coral Endereço.
- **Do** usar as ilustrações de marcos reais de Guará (Estação, Garças, EEAR) e cenas da cidade onde caberia uma imagem genérica.
- **Do** manter cards de imóvel planos, com a foto como contêiner.
- **Do** definir toda cor nova como token com versão clara e escura.

### Don't:
- **Don't** parecer um portal nacional genérico: cinza e azul corporativo, grade infinita de cards idênticos, a cidade reduzida a um filtro.
- **Don't** usar roxo médio como fundo de grandes áreas de conteúdo do portal; roxo é chão escuro ou identidade pequena.
- **Don't** usar coral como cor de erro; erro é Perigo (#DC2626).
- **Don't** criar uma segunda família tipográfica; a hierarquia vem de peso e tamanho em Geologica.
- **Don't** ilustrar pessoas com rostos; pessoas aparecem sempre em fotografia.
- **Don't** pôr sombra ou borda em cards de imóvel para "dar destaque".
