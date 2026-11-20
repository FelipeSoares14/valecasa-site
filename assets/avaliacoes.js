/* ValeCasa · avaliação de bairros: dados de exemplo (fictícios) das notas dos moradores, perguntas e dados públicos.
   O Pedregulho tem a página completa do protótipo; os outros bairros completam o que falta com valores gerados a partir do perfil de cada um.
   Regras da metodologia: nota geral e rankings a partir de 5 avaliações; média ajustada pela média da cidade (C = 5). */
window.VCAval = (function(){
  const D = window.VCData;
  const CIDADE = 3.9, C = 5;

  /* 8 critérios: [chave, nome curto, nome, descrição] */
  const CRIT = [
    ['seg','Segurança','Segurança','Andar a pé de dia e à noite'],
    ['tra','Tranquilidade','Tranquilidade','Barulho, movimento, vizinhança'],
    ['com','Comércio','Comércio e serviços','Mercado, padaria, farmácia a pé'],
    ['mob','Mobilidade','Mobilidade','Ônibus, trânsito, calçadas'],
    ['esc','Escolas','Escolas e creches','Oferta e qualidade'],
    ['sau','Saúde','Saúde','UBS, pronto-socorro, hospitais'],
    ['laz','Lazer','Lazer e natureza','Praças, parques, áreas verdes'],
    ['inf','Infraestrutura','Infraestrutura','Asfalto, luz, água, internet, enchentes']
  ];
  /* 11 perguntas rápidas: [pergunta, frase no bairro, é ruim quando é sim] */
  const QUICK = [
    ['Dá para andar a pé à noite com tranquilidade?','dizem que dá para andar a pé à noite com tranquilidade',0],
    ['Alguma rua do bairro alaga quando chove forte?','contam que alguma rua alaga quando chove forte',1],
    ['Tem mercado ou padaria a até 10 minutos a pé?','têm mercado ou padaria a até 10 minutos a pé',0],
    ['Passa ônibus perto com frequência?','dizem que passa ônibus perto com frequência',0],
    ['Os vizinhos se conhecem e se ajudam?','dizem que os vizinhos se conhecem e se ajudam',0],
    ['Tem barulho frequente à noite (bar, festa, trânsito)?','contam que tem barulho frequente à noite',1],
    ['Crianças brincam na rua ou na praça?','veem crianças brincando na rua ou na praça',0],
    ['Tem internet por fibra que funciona bem?','têm internet por fibra que funciona bem',0],
    ['Falta água ou luz com frequência?','contam que falta água ou luz com frequência',1],
    ['As calçadas servem para carrinho de bebê ou cadeira de rodas?','dizem que as calçadas servem para carrinho ou cadeira de rodas',0],
    ['Nos últimos anos, o bairro está:','acham que o bairro está melhorando',0]
  ];
  const PERFIS = [['fam','Famílias com crianças pequenas'],['ado','Famílias com adolescentes'],['cas','Casais sem filhos'],['jov','Jovens e solteiros'],['est','Estudantes (UNESP, faculdades)'],['eear','Militares e famílias da EEAR'],['ido','Idosos e aposentados'],['pet','Quem tem pet'],['home','Quem trabalha de casa'],['bus','Quem depende de ônibus']];
  const FORTES = ['Rua tranquila','Tem de tudo a pé','Perto do centro','Vizinhos conhecidos','Arborizado','Bom para cachorro','Vista bonita','Preço justo'];
  const FRACOS = ['Alaga na chuva','Pouco ônibus','Barulho à noite','Falta iluminação','Longe do comércio','Internet ruim','Ruas esburacadas','Trem ou rodovia barulhenta'];
  const IND = [['cam','Caminhabilidade','comércio a pé'],['verde','Verde e lazer','árvores e praças'],['fam','Para famílias','escolas e creches'],['infra','Infraestrutura','rua e enchente'],['acesso','Acesso','tempo até destinos']];

  /* por bairro: zona, avaliações (n), verificados, nota bruta, % moraria de novo, tendência, critérios, etiquetas do ranking */
  const B = {
    'Pedregulho':{zona:'Zona norte', n:38, ver:21, nota:4.3, nov:87, tend:'Melhorando', crit:[3.8,4.5,4.4,3.6,4.2,3.9,3.4,3.5], seguidores:23,
      tags:[['Rua tranquila',24],['Tem de tudo a pé',19],['Bom para famílias',17]], neg:[['Alaga na chuva forte',9]],
      fortes:[['Rua tranquila',24],['Tem de tudo a pé',19],['Perto do centro',16],['Vizinhos conhecidos',14],['Preço justo',9]],
      fracos:[['Alaga na chuva',9],['Pouco ônibus à noite',8],['Ruas esburacadas',6],['Poucas áreas verdes',5],['Barulho de bar',3]],
      quick:[[82,31],[38,29],[94,35],[44,27],[71,34],[22,30],[76,30],[89,28],[9,26],[41,25],[63,24]],
      perfis:{fam:64,ido:51,pet:47,eear:29,bus:18,home:22,cas:20,ado:24,jov:10,est:6},
      ind:{cam:'A',verde:'C',fam:'A',infra:'C',acesso:'B'},
      pub:[['B','Furtos 18% abaixo da média da cidade em 12 meses'],['A','Longe da Dutra e da ferrovia; 2 bares com som'],['A','9 de 10 tipos de comércio a 10 minutos a pé'],['B','6 min de carro ao centro; 3 linhas de ônibus'],['A','5 escolas a até 1 km; IDEB acima da média da cidade'],['B','1 UBS no bairro; pronto-socorro a 2,4 km'],['C','64% dos moradores em ruas arborizadas; 2 praças'],['C','Parte sul em área de risco de enchente mapeada']],
      kpi:['9,8 mil','3.420','39 anos','R$ 2.900'], rua:[98,91,66,64,22,14],
      escolas:[['EMEF da praça · municipal','Fundamental I · 350 m','IDEB 6,4'],['EE do bairro · estadual','Fundamental II e Médio · 700 m','IDEB 5,1'],['Creche municipal','Infantil · 420 m',''],['2 escolas particulares','Infantil ao Médio · até 900 m','']],
      tempos:[['Centro','6 min','14 min'],['Via Dutra','4 min',''],['Buriti Shopping','8 min','22 min'],['EEAR','9 min','25 min'],['UNESP','11 min','28 min'],['Rodoviária','7 min','18 min']],
      seg:{furto:-18, txt:'Furtos 18% abaixo da média da cidade. Roubos: poucos registros para comparar com segurança.'},
      ench:{lv:1, onde:'Parte sul', txt:'Cerca de 12% da área do bairro, na parte sul, está em área mapeada de risco alto de enchente. O resto do bairro fica fora.'},
      aluguelM2:18, casa3q:420000, alug2q:1600, anuncios:205,
      dica:{t:'A padaria da praça abre às 5h30 e o pão de queijo acaba às 8h. Na saída da escola, das 17h às 17h30, evite a rua principal.', q:'Renata M. · moradora verificada há mais de 5 anos', util:31, total:12},
      reviews:[
        {nome:'Cláudia R.', ini:'CR', cor:['#E2C9F8','#3D008C'], fem:1, perfil:'Moradora há mais de 5 anos · casa própria · família com crianças', selo:'ver', tempo:'5+', perfis:['fam'], nota:5, quando:'Atualizada em out/2026', denovo:'moraria de novo', tit:'Bairro de vizinho que cumprimenta e criança na pracinha',
          txt:'Moro na mesma rua há 11 anos. Faço tudo a pé: mercado, farmácia, padaria e a escola das meninas. É tranquilo de dia e de noite. O ponto fraco é a chuva forte de verão, quando a parte de baixo, perto do córrego, enche rápido. Quem for comprar ali, pergunte ao vizinho.',
          tags:['Tem de tudo a pé','Vizinhos conhecidos','Rua tranquila'], neg:['Alaga na chuva'], crit:[4,5,5,4,5,4,3,3], util:27,
          qa:['Marcos T.','a parte que alaga chega até a rua da escola?','não, fica só nas duas quadras mais perto do córrego. A rua da escola é mais alta.'], ord:3},
        {nome:'João P.', ini:'JP', cor:['#BDFFE6','#006B43'], perfil:'Morador de 1 a 5 anos · aluga · trabalha de casa', selo:'dec', tempo:'1-5', perfis:['home'], nota:4, quando:'Set/2026', denovo:'moraria de novo', tit:'Bom para quem tem carro e trabalha de casa',
          txt:'A fibra é ótima e o silêncio durante o dia ajuda muito. De carro chego no centro em poucos minutos. Sem carro é mais difícil: o ônibus passa pouco depois das 20h.',
          tags:['Rua tranquila','Perto do centro'], neg:['Pouco ônibus à noite'], util:14, ord:2},
        {nome:'Antônio L.', ini:'AL', cor:['#FBF3E7','#7A4E00'], perfil:'Ex-morador · saiu em 2024 · aposentado', selo:'cli', tempo:'ex', perfis:['ido'], nota:3, quando:'Mar/2025', denovo:'talvez moraria de novo', tit:'Gostava muito, mas as calçadas pesaram',
          txt:'Morei 20 anos. Com a idade, as calçadas irregulares e a falta de rampa ficaram difíceis. O bairro é ótimo de vizinhança, só falta cuidar do chão.',
          tags:['Vizinhos conhecidos'], neg:['Calçadas ruins'], util:9, ord:1}
      ],
      qa:[
        {p:'Tem creche municipal perto? Vaga é difícil?', quem:'Fernanda S.', quando:'há 3 dias', r:[
          {nome:'Paula A.', selo:'ver', fem:1, extra:'mora de 1 a 5 anos', t:'Tem uma a 4 quadras da praça. Consegui vaga no segundo semestre; vale se inscrever cedo.', util:6},
          {nome:'Imobiliária Vale Mais', selo:'cor', t:'A creche municipal fica na rua de trás da UBS. Há também 2 particulares no bairro.'}]},
        {p:'Dá para ir de bicicleta até a UNESP?', quem:'Lucas B.', quando:'ontem', r:[]},
        {p:'O barulho da festa na praça é toda semana?', quem:'Rita C.', quando:'há 2 semanas', nr:3, r:[
          {nome:'Sérgio N.', selo:'dec', t:'Só na festa junina e no aniversário do bairro. No resto do ano é bem silencioso.'}]}
      ], nq:14},
    'Jardim Padroeira':{zona:'Zona oeste', n:31, ver:17, nota:4.4, nov:90, tend:'Estável', crit:[4.3,4.4,3.6,3.4,4.3,3.7,4.1,4.2],
      tags:[['Rua tranquila',20],['Arborizado',15],['Seguro à noite',13]], quickSet:{0:91,1:6,3:29}, perfis:{fam:72,home:41,pet:52,ido:38},
      ind:{cam:'C',verde:'B',fam:'A',infra:'B',acesso:'B'}, renda:'R$ 4.800', centro:'9 min', ench:{lv:0, onde:'Fora'}, m2:5200, alug2q:2100, anuncios:176,
      reviews:[{nome:'Mariana F.', ini:'MF', cor:['#BDFFE6','#006B43'], fem:1, perfil:'Moradora de 1 a 5 anos · casa própria · família com crianças', selo:'ver', tempo:'1-5', perfis:['fam'], nota:5, quando:'Out/2026', denovo:'moraria de novo', tit:'Rua arborizada e silêncio de noite',
        txt:'As ruas são largas e cheias de árvore, e à noite só se ouve passarinho. Para o mercado grande precisa de carro, mas a Dutra fica perto e chego rápido em qualquer lugar.', tags:['Rua tranquila','Arborizado'], neg:['Longe do comércio'], util:11, ord:1}]},
    'Clube dos 500':{zona:'Zona oeste', n:19, ver:9, nota:4.2, nov:88, tend:'Estável', tags:[['Casas amplas',11],['Silencioso',10],['Seguro',8]], perfis:{fam:58,pet:61,ido:44,home:39}, ind:{cam:'D',verde:'A',fam:'B',infra:'A',acesso:'C'}, ench:{lv:0, onde:'Fora'}},
    'Vila Paraíba':{zona:'Zona leste', n:22, ver:11, nota:4.1, nov:79, tend:'Melhorando', crit:[3.9,3.7,4.0,4.1,4.0,4.2,3.2,3.6],
      tags:[['Perto do centro',13],['Muito ônibus',11],['Comércio',9]], quickSet:{0:74,1:41,3:68}, perfis:{est:56,bus:52,jov:44,fam:58},
      ind:{cam:'A',verde:'D',fam:'B',infra:'C',acesso:'A'}, renda:'R$ 2.500', centro:'4 min', ench:{lv:1, onde:'Parte leste'}, m2:3700, alug2q:1450, anuncios:148,
      reviews:[{nome:'Bruno S.', ini:'BS', cor:['#E2C9F8','#3D008C'], perfil:'Morador de 1 a 5 anos · aluga · estudante', selo:'dec', tempo:'1-5', perfis:['est','bus'], nota:4, quando:'Ago/2026', denovo:'moraria de novo', tit:'Prático para quem anda de ônibus',
        txt:'Passa ônibus toda hora e o Centro fica a uma caminhada. Os prédios novos trouxeram mais movimento. Falta praça e sombra: no verão as ruas esquentam bastante.', tags:['Perto do centro','Muito ônibus'], neg:['Poucas áreas verdes'], util:7, ord:1}]},
    'Jardim Bela Vista':{zona:'Zona sul', n:14, ver:6, nota:4.0, nov:81, tend:'Melhorando', tags:[['Vista bonita',9],['Novo',6],['Tranquilo',6]], perfis:{fam:55,cas:48,pet:50}, ind:{cam:'B',verde:'A',fam:'B',infra:'B',acesso:'B'}, ench:{lv:0, onde:'Fora'}},
    'Vila São José':{zona:'Zona leste', n:12, ver:5, nota:3.9, nov:72, tend:'Estável', tags:[['Preço justo',7],['Vizinhos conhecidos',6]], perfis:{fam:49,ido:57,bus:40}, ind:{cam:'B',verde:'C',fam:'B',infra:'C',acesso:'A'}, ench:{lv:1, onde:'Beira do rio'}},
    'Centro':{zona:'Centro', n:27, ver:12, nota:3.8, nov:66, tend:'Igual', tags:[['Tem de tudo a pé',18],['Ônibus',12]], neg:[['Barulho à noite',8]], perfis:{ido:62,bus:58,jov:41,fam:31}, ind:{cam:'A',verde:'D',fam:'B',infra:'B',acesso:'A'}, ench:{lv:0, onde:'Fora'}},
    'Engenheiro Neiva':{zona:'Distrito', n:9, ver:3, nota:3.7, nov:70, tend:'Igual', tags:[['Preço justo',6],['Calmo',5]], perfis:{fam:52,ido:48,pet:44}, ind:{cam:'C',verde:'B',fam:'C',infra:'C',acesso:'D'}, ench:{lv:0, onde:'Fora'}},
    'Campo do Galvão':{zona:'Zona sul', n:3, relatos:[['Preço justo',2],['Perto da Dutra',2]], neg:[['Pouco comércio',2]], ind:{cam:'C',verde:'B',fam:'B',infra:'C',acesso:'B'}, ench:{lv:2, onde:'Área alta'}},
    'Colônia':{zona:'Zona rural', n:1, relatos:[['Sossego',1]], ind:{cam:'E',verde:'A',fam:'D',infra:'D',acesso:'D'}, ench:{lv:0, onde:'Fora'}},
    'International Park':{zona:'Zona oeste', n:4, relatos:[['Seguro',3],['Arborizado',3]], neg:[['Longe do comércio',2]], ind:{cam:'D',verde:'A',fam:'C',infra:'A',acesso:'C'}, ench:{lv:0, onde:'Fora'}},
    'Jardim do Vale':{zona:'Zona sul', n:0, ind:{cam:'B',verde:'C',fam:'B',infra:'C',acesso:'B'}, ench:{lv:0, onde:'Fora'}},
    'Portal das Colinas':{zona:'Zona leste', n:2, relatos:[['Perto da UNESP',2]], ind:{cam:'C',verde:'B',fam:'C',infra:'B',acesso:'B'}, ench:{lv:0, onde:'Fora'}},
    'Parque São Francisco':{zona:'Zona norte', n:0, ind:{cam:'C',verde:'C',fam:'B',infra:'C',acesso:'B'}, ench:{lv:1, onde:'Parte norte'}},
    'Beira Rio':{zona:'Zona norte', n:1, relatos:[['Rua calma',1]], ind:{cam:'B',verde:'C',fam:'C',infra:'D',acesso:'B'}, ench:{lv:2, onde:'Grande parte'}}
  };

  /* completa o que falta com valores estáveis, gerados a partir do bairro */
  const LV = {A:4.5,B:3.9,C:3.4,D:2.9,E:2.5};
  const fmt = v => v.toFixed(1).replace('.',',');
  const slug = n => n.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const list = D.bairros.map((b,i)=>{
    const o = Object.assign({}, B[b.n]||{n:0}), r = window.VCArt.R(300+i*7), j = s => Math.round((r()-.5)*s*10)/10;
    o.b = b; o.nome = b.n; o.slug = slug(b.n);
    const g = o.ind;
    if(!o.crit && o.n){ const base=o.nota||CIDADE; o.crit=[LV[g.infra]*.4+base*.6+j(.4), base+j(.6), LV[g.cam]*.6+base*.4, LV[g.acesso]*.6+base*.4, LV[g.fam]*.6+base*.4, base-.2+j(.5), LV[g.verde]*.6+base*.4, LV[g.infra]*.6+base*.4].map(v=>Math.max(2.6,Math.min(4.8,Math.round(v*10)/10))); }
    if(!o.quick && o.n>=5){ const c=o.crit; o.quick=[c[0]*20-4,(o.ench.lv?30+o.ench.lv*8:6),c[2]*21,c[3]*15-4,c[1]*16,22-(c[1]-3.5)*20,c[4]*17,70+j(30),8,40+j(20),o.tend==='Melhorando'?62:40].map((v,k)=>[Math.max(4,Math.min(97,Math.round(v))), Math.max(5,Math.round(o.n*.8)-k%3)]); }
    if(o.quickSet) Object.entries(o.quickSet).forEach(([k,v])=>{ o.quick[k]=[v,o.quick[k][1]]; });
    o.perfis = Object.assign({fam:30,ado:20,cas:22,jov:15,est:8,eear:6,ido:30,pet:35,home:20,bus:15}, o.perfis||{});
    if(!o.fortes && o.tags) o.fortes=o.tags.concat(o.neg?[]:[]);
    if(!o.fracos && o.n>=5) o.fracos=(o.neg||[]).concat([['Ruas esburacadas',3],['Pouco ônibus à noite',2]]).slice(0,3);
    if(!o.pub){ const txt={seg:{A:'Furtos bem abaixo da média da cidade em 12 meses',B:'Furtos abaixo da média da cidade em 12 meses',C:'Furtos perto da média da cidade em 12 meses',D:'Furtos acima da média da cidade em 12 meses',E:'Poucos registros para comparar'}};
      o.pub=[[g.infra==='A'?'A':g.cam==='A'?'C':'B', txt.seg[g.infra==='A'?'A':g.cam==='A'?'C':'B']], [g.cam==='A'?'C':'A', g.cam==='A'?'Movimento de comércio e trânsito durante o dia':'Ruas residenciais, pouco trânsito de passagem'], [g.cam, ({A:'9 de 10 tipos de comércio a 10 minutos a pé',B:'7 de 10 tipos de comércio a 10 minutos a pé',C:'5 de 10 tipos de comércio a 10 minutos a pé',D:'3 de 10 tipos de comércio a 10 minutos a pé',E:'Comércio só de carro'})[g.cam]],
        [g.acesso, `${o.centro||Math.round(3+Math.hypot(b.x-300,b.y-198)/14)+' min'} de carro ao centro`], [g.fam, ({A:'Escolas e creches a até 1 km; IDEB acima da média',B:'Escolas a até 1 km; IDEB na média da cidade',C:'1 escola a até 1 km',D:'Escola mais próxima a mais de 1 km',E:'Sem escola a até 2 km'})[g.fam]],
        [g.cam==='A'?'A':'B', g.cam==='A'?'Santa Casa e UBS a até 1 km':'1 UBS a até 1,5 km'], [g.verde, ({A:'Muita área verde e ruas arborizadas',B:'Ruas arborizadas e 1 praça',C:'Metade das ruas arborizadas',D:'Poucas árvores e praças',E:'Quase sem praças'})[g.verde]],
        [g.infra, o.ench.lv ? `${o.ench.onde} em área de risco de enchente mapeada` : ({A:'Ruas pavimentadas e com bueiro',B:'Quase todas as ruas pavimentadas',C:'Parte das ruas sem bueiro',D:'Ruas sem pavimentação em parte do bairro',E:'Pouca pavimentação'})[g.infra]]];
    }
    const pop = 3+Math.round(r()*9);
    o.kpi = o.kpi || [`${pop},${Math.round(r()*9)} mil`, String(Math.round(pop*350)).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), `${35+Math.round(r()*8)} anos`, o.renda || 'R$ '+String(Math.round(b.m2*.9/100)*100).replace(/\B(?=(\d{3})+(?!\d))/g,'.')];
    o.rua = o.rua || [96+Math.round(r()*3), 70+Math.round(r()*25), 50+Math.round(r()*40), ({A:85,B:72,C:55,D:38,E:20})[g.verde], 10+Math.round(r()*30), 8+Math.round(r()*30)];
    o.renda = o.renda || o.kpi[3];
    o.centro = o.centro || o.pub[3][1].split(' de carro')[0];
    o.m2 = o.m2 || b.m2; o.alug2q = o.alug2q || Math.round(b.media/260/50)*50;
    o.anuncios = o.anuncios || 40+Math.round(r()*120);
    o.ench.txt = o.ench.txt || (o.ench.lv===0 ? 'O bairro fica fora das áreas mapeadas de risco de enchente.' : o.ench.lv===1 ? `Uma parte do bairro (${o.ench.onde.toLowerCase()}) está em área mapeada de risco de enchente. O resto fica fora.` : 'Grande parte do bairro está em área mapeada de risco de enchente.');
    o.seg = o.seg || {furto: ({A:-20,B:-8,C:2,D:12,E:0})[o.pub[0][0]], txt: o.pub[0][1]+'.'};
    o.reviews = o.reviews || []; o.qa = o.qa || []; o.nq = o.nq || o.qa.length;
    o.seguidores = o.seguidores || Math.max(2, Math.round(o.n*.6));
    /* nota exibida: média da cidade puxando para o bairro conforme chegam avaliações */
    o.ajust = o.n>=5 ? Math.round(((C*CIDADE + o.nota*o.n)/(C+o.n))*10)/10 : null;
    o.show = o.n>=5 ? o.nota : null; // o protótipo mostra a nota do design (já ajustada)
    return o;
  });
  const by = n => list.find(o=>o.nome===n);
  const bySlug = s => list.find(o=>o.slug===s);
  return {CRIT, QUICK, PERFIS, FORTES, FRACOS, IND, CIDADE, C, list, by, bySlug, slug, fmt};
})();
