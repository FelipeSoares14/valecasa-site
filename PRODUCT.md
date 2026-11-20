# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Quem procura imóvel em Guaratinguetá (Guará, SP)**, público principal: casais por volta dos 47 anos tomando uma decisão grande, comprar ou alugar a casa onde vão morar. Chegam ansiosos e cansados dos portais grandes; querem saber o custo real, como é o bairro e com quem vão falar.
- **Inquilinos**: procuram aluguel e precisam ver o custo total do mês (aluguel, condomínio, IPTU, seguro), não só o valor do aluguel.
- **Corretores e imobiliárias**: anunciam e respondem contatos. São quem paga o ValeCasa.
- **Proprietários diretos**: anunciam o próprio imóvel, sem corretor.
- **Construtoras e loteadoras**: mostram lançamentos (na planta, em obras, prontos) e loteamentos, com tabela de preço, andamento da obra e espelho de vendas.

## Product Purpose

O ValeCasa é um portal imobiliário só de Guaratinguetá. Existe para tornar a busca por casa leve de novo: em vez de um portal nacional frio e cansativo, o visitante encontra imóveis da cidade explicados por quem conhece cada bairro, com o custo de verdade à vista e um caminho curto até falar com quem anuncia.

Estágio: protótipo navegável que vai virar o portal real, com anúncios reais. Sucesso é o visitante chegar a um contato qualificado (mensagem, WhatsApp ou visita agendada) sabendo o que está comprando ou alugando, e o anunciante receber esse contato.

## Positioning

- **Só Guará, de verdade.** Bairros, distâncias e referências da cidade (Dutra, Buriti Shopping, EEAR, Estação, bairros pelo nome) fazem parte do produto, não são decoração.
- **O destaque é de quem faz o melhor anúncio, não de quem paga mais.** A ordem da busca vem da qualidade do anúncio (fotos, preço completo, recado de quem anuncia, localização, tempo de resposta) e da avaliação dos visitantes. Não se vende destaque.
- **Custo de verdade.** Preço completo com condomínio, IPTU, ITBI, escritura, simulação de financiamento e renda mínima, antes de qualquer contato.

## Operating Context

- Busca por bairro, tipo, finalidade (comprar/alugar), preço e filtros; mapa ilustrativo da cidade com pontos de referência e distância até a Dutra.
- Página do imóvel: fotos, espaços, comodidades, custos, simulador de financiamento (Price/SAC, FGTS, prazo, juros), comparação de preço por m² com o bairro e com Guará, qualidade do anúncio, histórico e avaliação.
- Contato direto com quem anuncia (mensagem ou WhatsApp) e aviso de anúncio errado.
- Área de Lançamentos com linguagem própria: empreendimentos por fase, linha do tempo de entregas, espelho de vendas 3D (prédio e loteamento), simulador de compra na planta e de parcelamento direto com a loteadora, agendamento de visita ao decorado ou estande.
- Salvos e vistos recentemente ficam no navegador do visitante.
- A marca também aparece fora do site: outdoor, institucional, redes sociais (série "cantinho em Guará") e materiais para corretores.

## Capabilities and Constraints

- Idioma: português do Brasil, interface e conteúdo.
- Site estático em HTML, CSS e JavaScript sem framework (SPA com rotas por âncora). Hoje é publicado como artifact do Claude, cuja CSP bloqueia buscar arquivos de CDN e `data:` URIs; os modelos 3D são carregados como `.gltf.json` e montados em memória.
- Modelos 3D do espelho de vendas são gerados por scripts do Blender versionados em `3d/`.
- Receita: assinatura paga por anunciantes (corretores e imobiliárias), sem venda de destaque na busca. Preços e planos ainda não definidos.
- Ainda não definidos: como proprietários diretos e construtoras/loteadoras pagam (ou se pagam), cadastro e login, painel do anunciante, origem dos dados reais de anúncios.

## Brand Commitments

- Nome: ValeCasa (escrito junto). Apelido da cidade: Guará.
- Assinatura de outdoor e institucional: "O jeito certo de procurar imóveis."
- Voz: o amigo que entende do assunto, trabalha com imóveis há anos, conhece a cidade de cor e ajuda sem enrolar e sem vender peixe. Pilares: acolhedor mas não piegas; direto mas não seco; ousado mas não arrogante; local de verdade.
- No site, o tom fica entre o institucional e o das redes: direto e acolhedor, frases curtas, sempre com o próximo passo claro, sem gíria ("entra lá" fica para as redes).
- Evitar: "jornada", "sinergia", "soluções imobiliárias", "excelência", "o melhor", "o número 1", gíria forçada, excesso de exclamação.
- Pessoas aparecem sempre em fotografia, nunca com rostos ilustrados.
- Guia completo de voz, tom e microcopy: `design-system/index.html`, seção "Voz e tom".

## Evidence on Hand

- Marca, manual, briefing e fotos ficam no Drive, em `valecasa campanha` (referência; arquivos pesados não entram no repositório).
- Ilustrações de marcos locais (Estação, Garças, EEAR, loja de Lançamentos) em `img/`; ilustrações de estados vazios em `ilustracoes/`; 150 ícones de comodidades em `icones-comodidades/`.
- **Todo o conteúdo do protótipo é fictício:** imóveis, preços, corretores, telefones, avaliações, números de visitas, empreendimentos ("Alto do Pedregulho", "Bosque dos Pinheiros") e a loteadora "Paraíba Urbanismo". Não há anúncios reais, depoimentos, clientes, parceiros, números de audiência ou imprensa. Não inventar nada disso como se fosse real, e não usar marcas reais de imobiliárias ou construtoras usadas como referência.

## Product Principles

1. **Guará antes de tudo.** Cada tela fala da cidade pelo nome: bairro, distância, referência real. Nada que serviria igual para qualquer cidade.
2. **Mérito, não pagamento.** O que sobe na busca e o que ganha destaque é a qualidade do anúncio. Nenhuma decisão de produto pode vender visibilidade.
3. **Custo completo antes do contato.** O visitante sabe quanto vai pagar de verdade, com estimativas honestas e avisos claros, antes de falar com alguém.
4. **Caminho curto até uma pessoa.** Toda página termina num próximo passo claro: mensagem, WhatsApp ou visita.
5. **Sem vender peixe.** Simulações e estimativas dizem o que deixam de fora; o produto prefere a verdade incômoda ao entusiasmo de corretor.
