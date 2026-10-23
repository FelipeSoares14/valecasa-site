/* ValeCasa · dados de exemplo do protótipo (fictícios). Coordenadas em um mapa ilustrativo 600×420. */
window.VCData = (function(){
  const hoje = new Date(2026, 9, 12); // 12/out/2026

  const bairros = [
    {n:'Centro', x:300, y:198, media:420000, m2:3900, vibe:'Comércio a pé, Estação Ferroviária e as igrejas históricas.', viz:['Vila São José','Jardim Bela Vista','Vila Paraíba']},
    {n:'Campo do Galvão', x:188, y:172, media:480000, m2:3600, vibe:'Rua de casa térrea, quintal e vizinho que se conhece pelo nome.', viz:['Jardim do Vale','Beira Rio','Centro']},
    {n:'Pedregulho', x:338, y:306, media:390000, m2:3300, vibe:'Bairro da EEAR, com padaria, feira e comércio de bairro.', viz:['Parque São Francisco','Jardim Padroeira','Clube dos 500']},
    {n:'Jardim Padroeira', x:236, y:268, media:350000, m2:3100, vibe:'Residencial, tranquilo e com acesso rápido à Dutra.', viz:['Jardim do Vale','Pedregulho','Centro']},
    {n:'Vila Paraíba', x:412, y:150, media:560000, m2:4300, vibe:'Prédios novos e lançamentos a poucos minutos do Centro.', viz:['Centro','Jardim Bela Vista','Engenheiro Neiva']},
    {n:'Clube dos 500', x:468, y:270, media:875000, m2:4800, vibe:'Casas grandes, terrenos amplos e silêncio à noite.', viz:['Portal das Colinas','Jardim Bela Vista','Pedregulho']},
    {n:'Jardim Bela Vista', x:380, y:228, media:600000, m2:4200, vibe:'Ruas arborizadas e vista aberta para a Mantiqueira.', viz:['Centro','Clube dos 500','Vila Paraíba']},
    {n:'Engenheiro Neiva', x:548, y:92, media:380000, m2:2800, vibe:'Distrito com jeito de cidade pequena, a 15 minutos do Centro.', viz:['Vila Paraíba']},
    {n:'International Park', x:120, y:300, media:1320000, m2:5600, vibe:'Condomínio fechado, lotes grandes e muita área verde.', viz:['Jardim do Vale','Jardim Padroeira']},
    {n:'Vila São José', x:282, y:128, media:280000, m2:2900, vibe:'Bairro antigo, entre o rio e o Centro.', viz:['Centro','Beira Rio']},
    {n:'Colônia', x:60, y:378, media:520000, m2:1800, vibe:'Chácaras e sítios em estrada asfaltada, perto da cidade.', viz:['International Park']},
    {n:'Portal das Colinas', x:508, y:330, media:450000, m2:3500, vibe:'Bairro planejado ao lado da FEG/UNESP.', viz:['Clube dos 500','Parque São Francisco']},
    {n:'Jardim do Vale', x:158, y:232, media:330000, m2:3000, vibe:'Ruas planas, escola e mercado perto de casa.', viz:['Campo do Galvão','Jardim Padroeira']},
    {n:'Parque São Francisco', x:410, y:356, media:300000, m2:2800, vibe:'Bom custo-benefício a 5 minutos da EEAR.', viz:['Pedregulho','Portal das Colinas']},
    {n:'Beira Rio', x:220, y:104, media:310000, m2:2900, vibe:'Perto do Paraíba e do Centro, com ruas calmas.', viz:['Vila São José','Campo do Galvão']}
  ];

  const pois = [
    {id:'buriti', n:'Buriti Shopping', x:262, y:244, ic:'i-storefront', sub:'Shopping'},
    {id:'estacao', n:'Estação Ferroviária', x:308, y:184, ic:'i-flag', sub:'Centro histórico'},
    {id:'eear', n:'EEAR', x:356, y:330, ic:'i-academic', sub:'Escola de Especialistas de Aeronáutica'},
    {id:'feg', n:'FEG/UNESP', x:520, y:312, ic:'i-academic', sub:'Faculdade de Engenharia'},
    {id:'santacasa', n:'Santa Casa', x:286, y:216, left:true, ic:'i-plus', sub:'Hospital'},
    {id:'freigalvao', n:'Casa de Frei Galvão', x:294, y:206, hide:true, ic:'i-home', sub:'Centro histórico'}
  ];
  /* Via Dutra e rio Paraíba do Sul, traçado ilustrativo */
  const dutra = [[0,334],[150,300],[300,264],[440,232],[600,192]];
  const rio = 'M-10 150 C 80 96, 150 132, 220 108 S 340 84, 400 96 S 520 58, 610 52';

  const corretores = {
    c1:{n:'Márcia Chagas Albotelli', tipo:'Corretora', creci:'Creci 739736-F', nota:4.9, cor:'#8A4DF0', cover:['#E9D9C3','#C9A27E'], tel:'(12) 99714-2208'},
    c2:{n:'João Carlos Ribeiro', tipo:'Corretor', creci:'Creci 81244-F', nota:4.9, cor:'#007F50', cover:['#D7DDE4','#8C9AA8'], tel:'(12) 99630-1175'},
    c3:{n:'Cecília Mendes', tipo:'Corretora', creci:'Creci 112905-F', nota:4.8, cor:'#E09200', cover:['#EDE3D4','#A98F6C'], tel:'(12) 98821-4410'},
    c4:{n:'Suzana Garcia', tipo:'Corretora', creci:'Creci 98370-F', nota:4.8, cor:'#4D00AF', cover:['#E6DCCF','#B89A7A'], tel:'(12) 99155-0932'},
    c5:{n:'Rafael Toledo', tipo:'Corretor', creci:'Creci 140221-F', nota:4.7, cor:'#1F6FE0', cover:['#DCE6E0','#8FA89A'], tel:'(12) 98107-6643'},
    c6:{n:'Beatriz Nogueira', tipo:'Corretora', creci:'Creci 127764-F', nota:4.9, cor:'#6514D6', cover:['#E8DDE6','#B091A8'], tel:'(12) 99288-3017'},
    ag1:{n:'Vale Mais Imóveis', tipo:'Imobiliária', creci:'Creci J-28741', nota:4.8, cor:'#3D008C', agencia:true, tel:'(12) 3122-4580'},
    ag2:{n:'Faria & Silva', tipo:'Imobiliária', creci:'Creci J-19022', nota:4.7, cor:'#E5483B', agencia:true, tel:'(12) 3125-7731'},
    ag3:{n:'Casa Guará Imóveis', tipo:'Imobiliária', creci:'Creci J-31560', nota:4.6, cor:'#007F50', agencia:true, tel:'(12) 3132-0904'},
    prop:{n:'Proprietário', tipo:'Anúncio direto', creci:'Sem intermediação', nota:null, cor:'#4E4A5E', tel:'(12) 99402-8861'}
  };

  /* fin: venda|aluguel · preço: venda = valor; aluguel = aluguel mensal · iptu: anual na venda, mensal no aluguel */
  const imoveis = [
    {id:101, fin:'venda', tipo:'Casa', bairro:'Campo do Galvão', preco:520000, cond:0, iptu:1240, q:3, s:1, b:2, v:2, a:142, at:250, tit:'Casa térrea com quintal e edícula em rua sem saída', tags:['quintal','pet'], cena:'casa', seed:3, dias:1, an:'c1', nota:'Rua sem saída, quase sem carro passando. Dá pra deixar as crianças brincarem na calçada.', esp:['Edícula','Quintal','Lavanderia coberta','Garagem coberta','Cozinha planejada','Despensa'], com:['churrasqueira','aquecimento-solar-de-agua','portao','armario-embutido','piso-frio','cerca']},
    {id:102, fin:'venda', tipo:'Apartamento', bairro:'Vila Paraíba', preco:398000, antes:420000, cond:520, iptu:980, q:2, s:1, b:2, v:1, a:68, tit:'Apartamento com varanda gourmet a 5 minutos do Centro', tags:['varanda','lazer'], cena:'apto', seed:5, dias:3, an:'ag1', nota:'Prédio de 2019, com elevador e portaria 24h. A varanda pega o sol da manhã.', esp:['Varanda gourmet','Sala para 2 ambientes','Suíte','Área de serviço'], com:['elevador','portaria-24h','academia','piscina','salao-de-jogos','varanda-gourmet']},
    {id:103, fin:'venda', tipo:'Sobrado', bairro:'Jardim Bela Vista', preco:690000, cond:0, iptu:1850, q:3, s:3, b:4, v:2, a:186, at:300, tit:'Sobrado com três suítes e vista para a Mantiqueira', tags:['quintal','vista'], cena:'sobrado', seed:8, dias:6, an:'c2', nota:'Do quarto de cima dá pra ver a serra nos dias de céu limpo.', esp:['Escritório','Lavabo','Espaço gourmet','Quintal gramado','Closet'], com:['churrasqueira','closet','lavabo','vista-panoramica','aquecimento-solar-de-agua','sistema-de-alarme']},
    {id:104, fin:'venda', tipo:'Chácara', bairro:'Colônia', preco:500000, cond:320, iptu:665, q:3, s:0, b:2, v:4, a:187, at:2400, tit:'Chácara com piscina na estrada asfaltada', tags:['piscina','pet','quintal'], cena:'chacara', seed:2, dias:9, an:'prop', nota:'Asfalto até a porteira, então dá pra ir e voltar do trabalho todo dia.', esp:['Varanda ampla','Pomar','Casa de caseiro','Piscina','Campo gramado'], com:['piscina','churrasqueira','forno-de-pizza','arvores-frutiferas','poco-artesiano','caseiro']},
    {id:105, fin:'venda', tipo:'Casa', bairro:'Pedregulho', preco:365000, cond:0, iptu:820, q:2, s:0, b:1, v:1, a:88, at:180, tit:'Excelente casa em rua tradicional no Pedregulho', tags:['eear','quintal'], cena:'casa', seed:14, dias:2, an:'c3', nota:'A 5 minutos da EEAR. Muita família de militar mora nessa rua.', esp:['Quintal','Área de serviço','Garagem'], com:['piso-frio','portao','quintal','cerca']},
    {id:106, fin:'venda', tipo:'Casa', bairro:'Clube dos 500', preco:1180000, cond:0, iptu:3200, q:4, s:2, b:4, v:4, a:320, at:600, tit:'Casa ampla com piscina, churrasqueira e jardim', tags:['piscina','quintal','pet'], cena:'casa', seed:21, dias:12, an:'ag2', nota:'Terreno de 600 m² numa das ruas mais calmas do bairro.', esp:['Piscina','Espaço gourmet','Jardim','Escritório','Lavabo','Dependência de serviço'], com:['piscina','churrasqueira','espaco-gourmet','jardim','sistema-de-alarme','energia-solar']},
    {id:107, fin:'venda', tipo:'Apartamento', bairro:'Centro', preco:285000, antes:299000, cond:380, iptu:640, q:2, s:0, b:1, v:1, a:62, tit:'Apartamento no Centro a duas quadras da Estação', tags:['centro'], cena:'apto', seed:9, dias:4, an:'c4', nota:'Dá pra fazer tudo a pé: banco, mercado, farmácia e a feira de domingo.', esp:['Sala de estar','Cozinha','Área de serviço'], com:['elevador','interfone','piso-frio']},
    {id:108, fin:'venda', tipo:'Terreno', bairro:'Portal das Colinas', preco:190000, cond:0, iptu:420, q:0, s:0, b:0, v:0, a:0, at:300, tit:'Terreno plano de 300 m² perto da FEG/UNESP', tags:['unesp'], cena:'terreno', seed:4, dias:15, an:'prop', nota:'Plano, sem precisar de muro de arrimo. Rua com água, luz e esgoto.', esp:['Terreno plano','Frente de 10 m'], com:['acesso-asfaltado','rua-tranquila']},
    {id:109, fin:'venda', tipo:'Casa', bairro:'Jardim do Vale', preco:340000, cond:0, iptu:760, q:3, s:1, b:2, v:2, a:110, at:200, tit:'Casa com três quartos, garagem coberta e quintal', tags:['quintal','pet'], cena:'casa', seed:31, dias:0, an:'c5', nota:'Escola municipal e mercado a duas quadras.', esp:['Quintal','Garagem coberta','Suíte','Área de serviço'], com:['quintal','piso-frio','armario-de-cozinha','perto-de-escolas']},
    {id:110, fin:'venda', tipo:'Casa', bairro:'International Park', preco:1450000, cond:890, iptu:4200, q:4, s:4, b:5, v:4, a:380, at:1000, tit:'Casa em condomínio com área verde e piscina aquecida', tags:['piscina','condominio'], cena:'sobrado', seed:40, dias:20, an:'ag2', nota:'Portaria 24h e ruas internas largas. Lote de 1.000 m².', esp:['Piscina aquecida','Home theater','Adega','Espaço gourmet','Jardim'], com:['piscina-aquecida','adega','portaria-24h','espaco-gourmet','energia-solar','automacao-residencial']},
    {id:111, fin:'venda', tipo:'Apartamento', bairro:'Jardim Bela Vista', preco:470000, cond:610, iptu:1100, q:3, s:1, b:2, v:2, a:84, tit:'Apartamento de três quartos com lazer completo', tags:['lazer','piscina'], cena:'apto', seed:12, dias:7, an:'ag1', nota:'Condomínio com piscina, academia e playground.', esp:['Varanda','Suíte','Sala para 2 ambientes'], com:['piscina','academia','playground','salao-de-jogos','portaria-24h','elevador']},
    {id:112, fin:'venda', tipo:'Casa', bairro:'Vila São José', preco:255000, antes:270000, cond:0, iptu:520, q:2, s:0, b:1, v:1, a:72, at:150, tit:'Casa simples e bem cuidada perto do rio', tags:['quintal'], cena:'casa', seed:7, dias:5, an:'prop', nota:'Telhado trocado em 2024 e parte elétrica nova.', esp:['Quintal','Área de serviço'], com:['quintal','piso-frio']},
    {id:113, fin:'venda', tipo:'Comercial', bairro:'Centro', preco:650000, cond:0, iptu:2100, q:0, s:0, b:2, v:0, a:140, tit:'Prédio comercial com loja no térreo e sala em cima', tags:['comercial','centro'], cena:'comercial', seed:3, dias:30, an:'ag3', nota:'Rua de muito movimento a pé, perto da praça.', esp:['Loja no térreo','Sala no piso superior','Copa'], com:['com-lojas-no-terreo','divisorias','ar-condicionado']},
    {id:114, fin:'venda', tipo:'Sobrado', bairro:'Portal das Colinas', preco:560000, cond:0, iptu:1400, q:3, s:1, b:3, v:2, a:150, at:250, tit:'Sobrado novo com espaço gourmet', tags:['unesp','quintal'], cena:'sobrado', seed:17, dias:1, an:'c6', nota:'Primeiro morador. Ainda dá tempo de escolher a cor dos armários.', esp:['Espaço gourmet','Suíte','Lavabo','Quintal'], com:['espaco-gourmet','churrasqueira','lavabo','aquecimento-solar-de-agua']},
    {id:115, fin:'venda', tipo:'Chácara', bairro:'Engenheiro Neiva', preco:420000, cond:0, iptu:380, q:2, s:0, b:1, v:3, a:96, at:5000, tit:'Sítio pequeno com pomar e nascente', tags:['quintal','pet'], cena:'chacara', seed:9, dias:18, an:'prop', nota:'Nascente própria e pomar com 30 pés de fruta.', esp:['Pomar','Nascente','Galinheiro','Varanda'], com:['arvores-frutiferas','poco-artesiano','lago','galpao']},
    {id:116, fin:'venda', tipo:'Casa', bairro:'Parque São Francisco', preco:299000, antes:315000, cond:0, iptu:640, q:2, s:1, b:2, v:2, a:90, at:175, tit:'Casa com suíte e churrasqueira perto da EEAR', tags:['eear','quintal'], cena:'casa', seed:26, dias:3, an:'c3', nota:'Boa para quem quer sair do aluguel sem gastar muito.', esp:['Suíte','Churrasqueira','Quintal'], com:['churrasqueira','quintal','piso-frio']},
    {id:201, fin:'aluguel', tipo:'Kitnet', bairro:'Pedregulho', preco:850, cond:0, iptu:0, q:1, s:0, b:1, v:0, a:28, tit:'Kitnet mobiliada perto da EEAR, com água inclusa', tags:['mobiliado','eear'], cena:'quarto', seed:2, dias:1, an:'prop', nota:'Água inclusa no aluguel. Fica a 10 minutos a pé do portão da EEAR.', esp:['Cozinha americana','Banheiro'], com:['mobiliado','cozinha-americana','fogao','freezer']},
    {id:202, fin:'aluguel', tipo:'Apartamento', bairro:'Vila Paraíba', preco:1850, cond:300, iptu:0, q:2, s:1, b:2, v:1, a:65, tit:'Apartamento com varanda e lazer perto do Centro', tags:['lazer','pet'], cena:'apto', seed:22, dias:2, an:'c1', nota:'O condomínio aceita pet de pequeno e médio porte.', esp:['Varanda','Suíte','Área de serviço'], com:['piscina','academia','elevador','portaria-24h']},
    {id:203, fin:'aluguel', tipo:'Casa', bairro:'Campo do Galvão', preco:2300, cond:0, iptu:90, q:3, s:1, b:2, v:2, a:130, at:250, tit:'Casa térrea com quintal grande, aceita pet', tags:['quintal','pet'], cena:'casa', seed:44, dias:4, an:'c2', nota:'Quintal de 80 m², bom pra cachorro grande.', esp:['Quintal','Edícula','Garagem coberta'], com:['quintal','churrasqueira','canil']},
    {id:204, fin:'aluguel', tipo:'Kitnet', bairro:'Jardim Padroeira', preco:950, cond:150, iptu:0, q:1, s:0, b:1, v:0, a:30, tit:'Kitnet com cozinha compartilhada e área de serviço', tags:['mobiliado'], cena:'quarto', seed:5, dias:6, an:'prop', nota:'Internet inclusa. Ponto de ônibus na esquina.', esp:['Área de serviço compartilhada'], com:['mobiliado','lavanderia']},
    {id:205, fin:'aluguel', tipo:'Apartamento', bairro:'Centro', preco:1400, cond:280, iptu:45, q:2, s:0, b:1, v:0, a:58, tit:'Apartamento perto da Estação, sem vaga, bom pra quem anda a pé', tags:['centro'], cena:'apto', seed:33, dias:0, an:'c4', nota:'Sem garagem, mas tem estacionamento mensal na mesma rua.', esp:['Sala','Cozinha','Área de serviço'], com:['interfone','piso-frio']},
    {id:206, fin:'aluguel', tipo:'Casa', bairro:'Pedregulho', preco:1650, cond:0, iptu:60, q:2, s:0, b:1, v:1, a:80, at:160, tit:'Casa com garagem e quintal a 5 minutos da EEAR', tags:['eear','quintal','pet'], cena:'casa', seed:52, dias:8, an:'c3', nota:'Os últimos inquilinos eram alunos da EEAR e ficaram três anos.', esp:['Quintal','Garagem','Área de serviço'], com:['quintal','portao','piso-frio']},
    {id:207, fin:'aluguel', tipo:'Apartamento', bairro:'Portal das Colinas', preco:1300, cond:220, iptu:40, q:1, s:0, b:1, v:1, a:42, tit:'Apartamento de um quarto mobiliado perto da FEG/UNESP', tags:['unesp','mobiliado'], cena:'sala', seed:11, dias:2, an:'c6', nota:'Dá pra ir a pé até a FEG em 8 minutos.', esp:['Sala integrada','Cozinha americana'], com:['mobiliado','cozinha-americana','ar-condicionado']},
    {id:208, fin:'aluguel', tipo:'Sobrado', bairro:'Jardim Bela Vista', preco:3800, cond:0, iptu:210, q:3, s:2, b:3, v:2, a:170, tit:'Sobrado com duas suítes e área gourmet', tags:['quintal'], cena:'sobrado', seed:3, dias:11, an:'ag1', nota:'Área gourmet com churrasqueira e forno de pizza.', esp:['Área gourmet','Duas suítes','Lavabo'], com:['churrasqueira','forno-de-pizza','lavabo','closet']},
    {id:209, fin:'aluguel', tipo:'Comercial', bairro:'Centro', preco:3200, cond:0, iptu:300, q:0, s:0, b:1, v:0, a:90, tit:'Loja de rua no Centro com 90 m² e vitrine', tags:['comercial','centro'], cena:'comercial', seed:12, dias:14, an:'ag3', nota:'Ponto de esquina, com vitrine para as duas ruas.', esp:['Salão','Banheiro','Depósito'], com:['de-esquina','divisorias']},
    {id:210, fin:'aluguel', tipo:'Casa', bairro:'Jardim do Vale', preco:1900, antes:2100, cond:0, iptu:70, q:3, s:1, b:2, v:2, a:105, tit:'Casa de três quartos com quintal, perto de escola', tags:['quintal','pet'], cena:'casa', seed:61, dias:5, an:'c5', nota:'O dono baixou o aluguel em setembro e aceita fiador ou seguro-fiança.', esp:['Quintal','Suíte','Garagem'], com:['quintal','perto-de-escolas','piso-frio']},
    {id:211, fin:'aluguel', tipo:'Apartamento', bairro:'Jardim Bela Vista', preco:2600, cond:650, iptu:120, q:3, s:1, b:2, v:2, a:84, tit:'Apartamento com piscina e academia no condomínio', tags:['lazer','piscina'], cena:'apto', seed:41, dias:3, an:'ag1', nota:'Duas vagas cobertas e depósito privativo no subsolo.', esp:['Varanda','Suíte','Depósito'], com:['piscina','academia','deposito-privativo','portaria-24h','elevador']},
    {id:212, fin:'aluguel', tipo:'Casa', bairro:'Clube dos 500', preco:6500, cond:0, iptu:450, q:4, s:3, b:5, v:4, a:300, tit:'Casa alto padrão com piscina e espaço gourmet', tags:['piscina','quintal','pet'], cena:'casa', seed:70, dias:21, an:'ag2', nota:'Jardim com manutenção inclusa no aluguel.', esp:['Piscina','Espaço gourmet','Escritório','Jardim'], com:['piscina','espaco-gourmet','jardim','sistema-de-alarme']},
    {id:213, fin:'aluguel', tipo:'Kitnet', bairro:'Portal das Colinas', preco:900, cond:0, iptu:0, q:1, s:0, b:1, v:0, a:26, tit:'Kitnet para estudante, a pé da FEG', tags:['unesp','mobiliado'], cena:'quarto', seed:19, dias:1, an:'prop', nota:'Contas de água e internet já estão no valor.', esp:['Cozinha americana'], com:['mobiliado','cozinha-americana']},
    {id:214, fin:'aluguel', tipo:'Apartamento', bairro:'Vila São José', preco:1250, cond:180, iptu:0, q:2, s:0, b:1, v:1, a:55, tit:'Apartamento térreo com quintalzinho, aceita pet', tags:['pet','quintal'], cena:'apto', seed:8, dias:9, an:'c2', nota:'Térreo com quintal privativo de 20 m².', esp:['Quintal privativo','Área de serviço'], com:['quintal','piso-frio']}
  ];

  /* anúncios extras gerados a partir de modelos, para o feed e a busca terem volume */
  (function(){
    let s=20261012; const r=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }, pick=a=>a[Math.floor(r()*a.length)];
    const urb=['Centro','Campo do Galvão','Pedregulho','Jardim Padroeira','Vila Paraíba','Jardim Bela Vista','Vila São José','Portal das Colinas','Jardim do Vale','Parque São Francisco','Beira Rio','Clube dos 500'];
    const T={
      Casa:{cena:'casa', a:[70,190], at:[150,380], q:[2,4], tit:['Casa térrea com {q} quartos e quintal','Casa reformada com garagem para {v} carros','Casa com área gourmet e {q} quartos','Casa de esquina com {q} quartos e edícula','Casa com suíte, quintal e portão eletrônico','Casa em rua calma com {q} quartos'], tags:['quintal','pet'], esp:['Quintal','Garagem coberta','Área de serviço','Edícula','Churrasqueira'], com:['churrasqueira','quintal','piso-frio','portao','aquecimento-solar-de-agua']},
      Apartamento:{cena:'apto', a:[45,105], q:[1,3], tit:['Apartamento de {q} quartos com varanda','Apartamento com elevador e {v} vaga','Apartamento de {q} quartos perto do comércio','Apartamento com sacada e lazer no condomínio','Apartamento reformado de {q} quartos'], tags:['varanda','lazer','pet'], esp:['Varanda','Área de serviço','Sala integrada'], com:['elevador','portaria-24h','piscina','academia','interfone']},
      Sobrado:{cena:'sobrado', a:[120,220], at:[180,360], q:[3,4], tit:['Sobrado com {q} quartos e espaço gourmet','Sobrado novo com suíte e quintal','Sobrado com varanda e vista para a serra'], tags:['quintal','vista'], esp:['Espaço gourmet','Lavabo','Suíte','Quintal'], com:['espaco-gourmet','lavabo','closet','churrasqueira']}
    };
    const notas=['Vizinhança tranquila e padaria a duas quadras.','Dá pra ir a pé até o mercado e a farmácia.','Pega sol da manhã na sala e nos quartos.','Garagem coberta e portão eletrônico trocados este ano.','Ônibus para o Centro passa na esquina.','Documentação em dia, pronto para financiar.','O dono aceita proposta e estuda permuta.','Rua plana, boa pra quem anda de bicicleta.'];
    const ans=['c1','c2','c3','c4','c5','c6','ag1','ag2','ag3','prop'];
    for(let k=0;k<40;k++){
      const tipo = k%5===0?'Sobrado':k%2?'Apartamento':'Casa', t=T[tipo], fin = k%3===0?'aluguel':'venda';
      const bn = tipo==='Apartamento' ? pick(urb.filter(x=>x!=='Clube dos 500')) : pick(urb), b=bairros.find(x=>x.n===bn);
      const q=t.q[0]+Math.floor(r()*(t.q[1]-t.q[0]+1)), span=t.q[1]-t.q[0]+1, a=Math.round(t.a[0]+((q-t.q[0])+r())/span*(t.a[1]-t.a[0])), at=t.at?Math.round((t.at[0]+r()*(t.at[1]-t.at[0]))/10)*10:0;
      const su=q>=3?1+Math.floor(r()*2):r()<.5?1:0, v=tipo==='Apartamento'?1+(r()<.3?1:0):1+Math.floor(r()*3), bh=Math.max(1,su+(r()<.6?1:0));
      const venda=Math.round(b.m2*a*(.85+r()*.3)/1000)*1000, preco = fin==='venda' ? venda : Math.round(venda*.0048/50)*50;
      const cond = tipo==='Apartamento' ? Math.round((180+a*4)/10)*10 : 0, iptu = fin==='venda' ? Math.round(venda*.0022/10)*10 : (r()<.5?Math.round(venda*.0022/12/5)*5:0);
      const tags=t.tags.filter(()=>r()<.5); if(at>=250 && !tags.includes('quintal') && tipo!=='Apartamento') tags.push('quintal');
      const im={id:300+k, fin, tipo, bairro:bn, preco, cond, iptu, q, s:su, b:bh, v, a, at, tit:pick(t.tit).replace('{q} quartos',q===1?'1 quarto':q+' quartos').replace('{v} carros',v===1?'1 carro':v+' carros').replace('{v} vaga',v===1?'1 vaga':v+' vagas').replace('{q}',q).replace('{v}',v), tags, cena:t.cena, seed:100+k*3, dias:Math.floor(r()*26), an:pick(ans), nota:pick(notas), esp:t.esp.filter(()=>r()<.7), com:t.com.filter(()=>r()<.7)};
      if(r()<.16) im.antes = fin==='venda' ? Math.round(preco*1.06/1000)*1000 : Math.round(preco*1.08/50)*50;
      if(!im.esp.length) im.esp=[t.esp[0]]; if(!im.com.length) im.com=[t.com[0]];
      imoveis.push(im);
    }
  })();

  const construtoras = {
    pietra:{n:'Pietra Construções', sig:'PC', cor:'#4D00AF', desde:1998, sobre:'Construtora de Guaratinguetá com 14 prédios entregues no Vale do Paraíba.'},
    alvorada:{n:'Alvorada Incorporações', sig:'AI', cor:'#E09200', desde:2006, sobre:'Incorporadora focada em apartamentos compactos perto do Centro.'},
    mantiqueira:{n:'Mantiqueira Engenharia', sig:'ME', cor:'#007F50', desde:1991, sobre:'Engenharia regional com obras em Guará, Lorena e Aparecida.'},
    serraazul:{n:'Serra Azul Empreendimentos', sig:'SA', cor:'#1F6FE0', desde:2011, sobre:'Condomínios de médio e alto padrão com vista para a serra.'},
    paraiba:{n:'Paraíba Urbanismo', sig:'PU', cor:'#E5483B', desde:2003, sobre:'Loteamentos e condomínios de casas no Vale do Paraíba.'}
  };

  /* fase: planta | obras | pronto · entrega: [ano, mês 1-12] */
  const lancamentos = [
    {id:1, nome:'Village Tulipa', cons:'pietra', bairro:'Vila Paraíba', fase:'obras', entrega:[2027,12], lanc:[2025,3], cena:'torre', seed:4, torres:2, andares:12, porAndar:4, destaque:true,
      tip:[{q:3,s:1,a:98,v:2,p:799000},{q:4,s:2,a:126,v:2,p:1049000}],
      etapas:[['Fundação',100],['Estrutura',82],['Alvenaria',55],['Instalações',30],['Acabamento',6]],
      com:['piscina','academia','espaco-gourmet','playground','brinquedoteca','salao-de-jogos','coworking','bicicletario','portaria-24h','pet-place'],
      txt:['Duas torres de 12 andares com varanda gourmet em todas as unidades e lazer no térreo.','Fica numa rua tranquila da Vila Paraíba, a cinco minutos do Centro e com saída rápida para a Dutra. O decorado está aberto de terça a domingo.'],
      why:[['i-pin','A 5 minutos do Centro','Sem precisar atravessar a cidade para trabalhar ou estudar.'],['i-sun','Sol da manhã nas varandas','As unidades de final 01 e 02 ficam viradas para o nascente.'],['i-shield','Obra com seguro','Seguro de término de obra contratado pela construtora.']]},
    {id:2, nome:'Jardim das Figueiras', cons:'alvorada', bairro:'Centro', fase:'planta', entrega:[2028,6], lanc:[2026,8], cena:'torre', seed:11, torres:1, andares:14, porAndar:6,
      tip:[{q:2,s:1,a:52,v:1,p:412000},{q:3,s:1,a:74,v:1,p:548000}],
      etapas:[['Fundação',8],['Estrutura',0],['Alvenaria',0],['Instalações',0],['Acabamento',0]],
      com:['piscina','academia','coworking','lavanderia','bicicletario','portaria-24h','espaco-gourmet'],
      txt:['Torre única de 14 andares a três quadras da praça da Matriz, com coworking e lavanderia no térreo.','Lançado em agosto, ainda com tabela de pré-lançamento nas unidades dos andares baixos.'],
      why:[['i-pin','No Centro, tudo a pé','Banco, mercado, farmácia e a Estação a poucas quadras.'],['i-calc','Tabela de lançamento','Os primeiros andares têm o menor preço do prédio.'],['i-building','Torre única','Menos vizinhos e elevadores sem fila.']]},
    {id:3, nome:'Residencial Califórnia', cons:'mantiqueira', bairro:'Pedregulho', fase:'obras', entrega:[2027,3], lanc:[2024,11], cena:'torre', seed:23, torres:3, andares:8, porAndar:6,
      tip:[{q:2,s:0,a:45,v:1,p:189000},{q:3,s:1,a:67,v:1,p:259000}],
      etapas:[['Fundação',100],['Estrutura',100],['Alvenaria',90],['Instalações',70],['Acabamento',42]],
      com:['piscina','playground','churrasqueira','salao-de-jogos','portaria-24h','bicicletario'],
      txt:['Três torres de oito andares no Pedregulho, perto da EEAR, com piscina e churrasqueira.','Aceita FGTS na entrada e tem unidades que se encaixam em programas de financiamento habitacional.'],
      why:[['i-academic','Perto da EEAR','Muito procurado por famílias de militares e servidores.'],['i-calc','Entrada com FGTS','Dá pra usar o FGTS no sinal e nas parcelas.'],['i-clock','Entrega em março de 2027','A obra está 76% concluída.']]},
    {id:4, nome:'Mirante da Serra', cons:'serraazul', bairro:'Portal das Colinas', fase:'planta', entrega:[2029,4], lanc:[2026,9], cena:'torre', seed:37, torres:1, andares:16, porAndar:2,
      tip:[{q:3,s:3,a:142,v:3,p:1150000},{q:4,s:4,a:184,v:3,p:1490000}],
      etapas:[['Fundação',0],['Estrutura',0],['Alvenaria',0],['Instalações',0],['Acabamento',0]],
      com:['piscina-aquecida','academia','sauna','espaco-gourmet','hidromassagem','coworking','portaria-24h','energia-solar'],
      txt:['Dois apartamentos por andar, três ou quatro suítes e vista aberta para a Serra da Mantiqueira.','Projeto com energia solar nas áreas comuns e piscina aquecida na cobertura.'],
      why:[['i-eye','Vista para a Mantiqueira','A partir do 6º andar a vista é livre.'],['i-building','Dois por andar','Hall privativo e mais privacidade.'],['i-sun','Energia solar','Conta de luz do condomínio menor.']]},
    {id:5, nome:'Estação Guará Studios', cons:'alvorada', bairro:'Centro', fase:'obras', entrega:[2027,8], lanc:[2025,6], cena:'torre', seed:52, torres:1, andares:10, porAndar:8,
      tip:[{q:1,s:0,a:28,v:0,p:245000,studio:true},{q:1,s:0,a:40,v:1,p:318000}],
      etapas:[['Fundação',100],['Estrutura',60],['Alvenaria',22],['Instalações',8],['Acabamento',0]],
      com:['coworking','lavanderia','academia','bicicletario','coffee-shop','portaria-24h'],
      txt:['Studios e apartamentos de um quarto ao lado da Estação Ferroviária, com lavanderia e coworking.','Bom para morar sozinho ou para alugar para estudantes da FEG e alunos da EEAR.'],
      why:[['i-flag','Ao lado da Estação','No miolo do Centro histórico.'],['i-academic','Procura alta por aluguel','Estudantes e militares alugam o ano todo.'],['i-calc','A partir de R$ 245 mil','O studio é o menor ticket da cidade em prédio novo.']]},
    {id:6, nome:'Reserva das Garças', cons:'paraiba', bairro:'Jardim Bela Vista', fase:'pronto', entrega:[2026,8], lanc:[2023,10], cena:'condominio', seed:6, torres:0, andares:2, porAndar:0, casas:48,
      tip:[{q:3,s:1,a:120,v:2,p:690000,casa:true},{q:3,s:3,a:152,v:2,p:840000,casa:true}],
      etapas:[['Fundação',100],['Estrutura',100],['Alvenaria',100],['Instalações',100],['Acabamento',100]],
      com:['piscina','playground','espaco-gourmet','quadra-poliesportiva','pista-de-cooper','portaria-24h','area-verde'],
      txt:['Condomínio de 48 casas com portaria, piscina e pista de caminhada em volta da área verde.','Pronto pra morar desde agosto, com financiamento direto pelo banco e casas modelo abertas aos sábados.'],
      why:[['i-key','Chave na mão','Pode mudar no mês seguinte à assinatura.'],['i-home','Casa com quintal em condomínio','Segurança de condomínio sem abrir mão do quintal.'],['i-sparkle','Área verde de 6 mil m²','Com pista de caminhada e quadra.']]},
    {id:7, nome:'Parque das Paineiras', cons:'mantiqueira', bairro:'Jardim do Vale', fase:'planta', entrega:[2028,11], lanc:[2026,5], cena:'torre', seed:64, torres:4, andares:5, porAndar:4,
      tip:[{q:2,s:0,a:48,v:1,p:229000},{q:2,s:1,a:54,v:1,p:252000}],
      etapas:[['Fundação',20],['Estrutura',0],['Alvenaria',0],['Instalações',0],['Acabamento',0]],
      com:['playground','churrasqueira','salao-de-jogos','pet-place','bicicletario'],
      txt:['Quatro prédios baixos de cinco andares no Jardim do Vale, com churrasqueira e pet place.','Parcelas mensais que cabem no lugar do aluguel durante a obra.'],
      why:[['i-calc','Parcela de obra baixa','A partir de R$ 690 por mês até as chaves.'],['i-home','Ruas planas','Bom pra quem tem criança ou anda de bicicleta.'],['i-pin','Perto da Dutra','Saída para São Paulo e Rio em 5 minutos.']]},
    {id:8, nome:'Alto do Pedregulho', cons:'pietra', bairro:'Pedregulho', fase:'obras', entrega:[2028,6], lanc:[2025,11], cena:'torre', seed:78, torres:1, andares:25, porAndar:4, destaque:true,
      modelo3d:'img/alto-do-pedregulho.gltf.json',
      tip:[{q:2,s:1,a:69,v:1,p:419000},{q:3,s:1,a:83,v:1,p:499000},{q:3,s:3,a:125,v:2,p:779000},{q:3,s:2,a:157,v:2,p:1090000,duplex:true},{q:4,s:3,a:241,v:3,p:1540000,duplex:true}],
      /* pavimentos com apartamentos: tipos do 4º ao 23º e duplex no 24º/25º. finais = índice em tip por final (01 a 04) */
      pav:{de:4, ate:23, finais:[2,0,1,2], duplex:{andar:24, finais:[4,3,3,4]}},
      etapas:[['Fundação',100],['Estrutura',38],['Alvenaria',10],['Instalações',0],['Acabamento',0]],
      com:['piscina','piscina-infantil','deck-molhado','academia','coworking','brinquedoteca','salao-de-jogos','espaco-gourmet','churrasqueira','playground','mini-quadra','pet-place','automacao-residencial','portaria-24h'],
      txt:['Torre única de 25 andares na parte alta do Pedregulho, com quatro apartamentos por andar e duplex com terraço na cobertura.','O lazer fica todo no embasamento: piscina de 20 metros, quadra, brinquedoteca, coworking e academia. No espelho de vendas dá pra girar o prédio em 3D e ver cada unidade no lugar dela.'],
      why:[['i-eye','Vista para a Mantiqueira','Do 15º andar pra cima, os finais 03 e 04 olham direto para a serra.'],['i-academic','Perto da EEAR','A 4 minutos de carro do portão principal.'],['i-home','De 69 a 241 m²','Do 2 quartos ao duplex com spa no terraço.']]}
  ];

  return {hoje, bairros, pois, dutra, rio, corretores, imoveis, construtoras, lancamentos};
})();
