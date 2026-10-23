/* ValeCasa · portal: home (busca + feed), resultados de busca, página do imóvel e salvos. */
(function(){
  const {D,A,$,$$,esc,ic,th,brl,brlK,norm,plural,store,bairro,total,TAGS,TIPOS,com,fotos,scene,card,pinPrice} = VC;

  /* ===== estado da busca ===== */
  const S0 = () => ({fin:'venda', tipos:[], bairros:[], pmin:null, pmax:null, qmin:0, bmin:0, vmin:0, amin:null, tags:[], q:'', an:null, sort:'relevancia', map:true, limit:12, frase:''});
  let S = S0(); if(window.innerWidth<960) S.map=false;
  const setS = o => { S = Object.assign(S0(), {map:S.map}, o); };

  /* ===== busca do jeito que você fala ===== */
  function parse(text){
    const t=' '+norm(text)+' ', o={tipos:[], bairros:[], tags:[]}; let hit=false;
    if(/\b(alug|locac|locar|aluga)/.test(t)){ o.fin='aluguel'; hit=true; } else if(/\b(compr|venda|vend)/.test(t)){ o.fin='venda'; hit=true; }
    [[/\bcasas?\b|\bterrea/,'Casa'],[/\bap(to|ts?|artamentos?)\b|\bape\b/,'Apartamento'],[/\bsobrados?\b/,'Sobrado'],[/\bterrenos?\b|\blotes?\b/,'Terreno'],[/\bchacaras?\b|\bsitios?\b/,'Chácara'],[/\bkit(net|nete|inete)?s?\b|\bstudios?\b|\bquitinete/,'Kitnet'],[/\bcomercia|\blojas?\b|\bponto comercial/,'Comercial']]
      .forEach(([re,v])=>{ if(re.test(t)){ o.tipos.push(v); hit=true; } });
    D.bairros.forEach(b=>{ if(t.includes(' '+norm(b.n)+' ') || t.includes(' '+norm(b.n)+',')){ o.bairros.push(b.n); hit=true; } });
    const q=t.match(/(\d)\s*(quartos?|dorm\w*|qts?|suites?)/); if(q){ o.qmin=+q[1]; hit=true; }
    const p=t.match(/ate\s*(r\$\s*)?([\d.,]+)\s*(mil|k|milhao|milhoes|mi)?\b/);
    if(p){ let v=parseFloat(p[2].replace(/\.(?=\d{3})/g,'').replace(',','.')); const u=p[3]||''; if(u==='mil'||u==='k') v*=1000; else if(u.startsWith('mi')) v*=1e6; if(v>0){ o.pmax=v; hit=true; if(!o.fin) o.fin = v<20000 ? 'aluguel' : 'venda'; } }
    const tg=[[/quintal/,'quintal'],[/piscina/,'piscina'],[/\bpet\b|cachorr|gato|animal/,'pet'],[/mobiliad/,'mobiliado'],[/\beear\b|aeronautica|militar/,'eear'],[/unesp|\bfeg\b|faculdade/,'unesp'],[/dutra/,'dutra'],[/varanda/,'varanda'],[/lazer|academia/,'lazer'],[/condominio fechado/,'condominio'],[/vista|serra/,'vista'],[/baixou|barat/,'baixou'],[/dono|proprietario/,'proprietario'],[/perto do centro|no centro a pe/,'centro']];
    let t2=t; o.bairros.forEach(b=>{ t2=t2.split(norm(b)).join(' '); });
    tg.forEach(([re,v])=>{ if(re.test(t2)){ o.tags.push(v); hit=true; } });
    if(o.tipos.includes('Kitnet') && !o.fin){ o.fin='aluguel'; }
    return {set:o, hit};
  }
  VC.searchText = function(q){ const p=parse(q||''); setS(p.set); S.frase=p.hit?(q||''):''; if(!p.hit && q) S.q=q; VC.go('busca'); };

  function filtra(s=S, skip){
    let r=D.imoveis.filter(im=> s.fin==='todos' || im.fin===s.fin);
    if(s.an) r=r.filter(im=>im.an===s.an);
    if(s.tipos.length && skip!=='tipos') r=r.filter(im=>s.tipos.includes(im.tipo));
    if(s.bairros.length && skip!=='bairros') r=r.filter(im=>s.bairros.includes(im.bairro));
    if(s.pmin) r=r.filter(im=>total(im)>=s.pmin);
    if(s.pmax) r=r.filter(im=>total(im)<=s.pmax);
    if(s.qmin) r=r.filter(im=>im.q>=s.qmin);
    if(s.bmin) r=r.filter(im=>im.b>=s.bmin);
    if(s.vmin) r=r.filter(im=>im.v>=s.vmin);
    if(s.amin) r=r.filter(im=>(im.a||im.at)>=s.amin);
    if(s.tags.length && skip!=='tags') r=r.filter(im=>s.tags.every(t=> t==='baixou'?!!im.antes : t==='proprietario'?im.an==='prop' : im.tags.includes(t)));
    if(s.q){ const w=norm(s.q).split(/\s+/).filter(x=>x.length>2); if(w.length) r=r.filter(im=>{ const h=norm([im.tit,im.bairro,im.tipo,im.nota,(im.esp||[]).join(' ')].join(' ')); return w.some(x=>h.includes(x)); }); }
    const by={relevancia:(a,b)=>(a.dias-b.dias)||(b.seed-a.seed), recentes:(a,b)=>a.dias-b.dias, menor:(a,b)=>total(a)-total(b), maior:(a,b)=>total(b)-total(a), area:(a,b)=>(b.a||b.at)-(a.a||a.at)};
    return r.sort(by[s.sort]||by.relevancia);
  }
  const prep = b => /^(Vila|Colônia)/.test(b) ? 'na' : b==='Engenheiro Neiva' ? 'em' : 'no';
  const TP = {Casa:['casa','casas'],Apartamento:['apartamento','apartamentos'],Sobrado:['sobrado','sobrados'],Kitnet:['kitnet','kitnets'],Terreno:['terreno','terrenos'],'Chácara':['chácara','chácaras'],Comercial:['imóvel comercial','imóveis comerciais']};

  /* ===== HOME ===== */
  const CATS = [
    {big:1, t:'Casas com quintal', s:'à venda', f:{fin:'venda', tipos:['Casa','Sobrado'], tags:['quintal']}, cena:['casa',44]},
    {big:1, t:'Apartamentos', s:'para alugar', f:{fin:'aluguel', tipos:['Apartamento']}, cena:['apto',22]},
    {t:'Aceita pet', s:'para alugar', f:{fin:'aluguel', tags:['pet']}, i:'vc-canil'},
    {t:'Perto da EEAR', s:'para alugar', f:{fin:'aluguel', tags:['eear']}, i:'i-academic'},
    {t:'Perto da FEG/UNESP', s:'para alugar', f:{fin:'aluguel', tags:['unesp']}, i:'vc-biblioteca'},
    {t:'Chácaras e sítios', s:'à venda', f:{fin:'venda', tipos:['Chácara']}, i:'vc-arvores-frutiferas'},
    {t:'Baixou o preço', s:'à venda', f:{fin:'venda', tags:['baixou']}, i:'i-trend-down'},
    {t:'Direto com o dono', s:'à venda', f:{fin:'venda', tags:['proprietario']}, i:'i-key'}
  ];
  const FEEDS = {
    novos:{t:'Novos esta semana', f:im=>im.dias<=7, s:{fin:'todos', sort:'recentes'}},
    baixou:{t:'Baixou o preço', f:im=>!!im.antes, s:{fin:'todos', tags:['baixou']}},
    alugar:{t:'Para alugar', f:im=>im.fin==='aluguel', s:{fin:'aluguel'}},
    casas:{t:'Casas à venda', f:im=>im.fin==='venda'&&['Casa','Sobrado'].includes(im.tipo), s:{fin:'venda', tipos:['Casa','Sobrado']}}
  };
  const CANTOS = [
    {img:'estacao.png', alt:'Ilustração da Estação Ferroviária de Guaratinguetá', ey:'Centro', t:'Morar perto da Estação', p:'Prédio antigo, pé-direito alto e tudo a pé: banco, feira e as igrejas históricas. Bom pra quem quer largar o carro.', s:{fin:'todos', bairros:['Centro']}},
    {img:'eear.png', alt:'Ilustração do avião-monumento da EEAR', ey:'Pedregulho e Parque São Francisco', t:'Quem chega para a EEAR', p:'Alunos e famílias de militares costumam procurar casa nesses dois bairros. Muita gente aluga pelo tempo do curso ou da transferência.', s:{fin:'aluguel', tags:['eear']}},
    {img:'garcas.png', alt:'Ilustração do Monumento das Garças', ey:'Jardim Bela Vista e Clube dos 500', t:'Rua arborizada e vista pra serra', p:'As ruas mais verdes da cidade e as casas com quintal maior. Nos dias limpos, a Mantiqueira aparece no fim da rua.', s:{fin:'venda', bairros:['Jardim Bela Vista','Clube dos 500']}}
  ];
  const BROKERS = ['c1','c2','c3','c4','c5','c6'], AGENCIES = ['ag1','ag2','ag3'];
  const initials = nm => nm.split(' ').filter(w=>w.length>2).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const shortName = nm => { const p=nm.split(' '); return p.length>2 ? p[0]+' '+p[p.length-1] : nm; };

  function heroSeg(cls=''){ return `<div class="seg ${cls}" role="group" aria-label="Finalidade"><button type="button" data-fin="venda" aria-pressed="true">Comprar</button><button type="button" data-fin="aluguel" aria-pressed="false">Alugar</button><button type="button" data-fin="lx" aria-pressed="false">Lançamentos</button></div>`; }

  function home(m){
    const target = m && ['bairros','corretores'].includes(m[0]) ? m[0] : null;
    const novos = D.imoveis.filter(i=>i.dias<=1).length;
    const recent = store.get('recent',[]).map(id=>D.imoveis.find(i=>i.id===id)).filter(Boolean);
    const cnt = f => filtra(Object.assign(S0(), f)).length;
    const lxs = D.lancamentos.filter(l=>l.fase!=='pronto').slice(0,3);
    const hoodCount = n => D.imoveis.filter(i=>i.bairro===n).length;
    const html = `
    <section class="hero">
      <div class="hero-skyline">${A.skyline()}</div>
      <img class="hero-garcas" src="img/garcas.png" alt="">
      <div class="wrap hero-in">
        <span class="eyebrow">Guaratinguetá e região</span>
        <h1>Procurando casa em Guará? <em>Começa pelo bairro.</em></h1>
        <p class="lead">Escreve do jeito que você fala. A gente entende bairro, preço, número de quartos e até "aceita cachorro".</p>
        <form class="search-card" id="hero-form" role="search">
          <div class="search">
            <div class="search-field">${ic('i-search')}<label class="sr" for="hero-q">O que você procura</label><input id="hero-q" placeholder="Ex.: casa com quintal no Campo do Galvão até 550 mil" autocomplete="off">${heroSeg()}</div>
            ${heroSeg('seg-m')}
            <button class="btn btn-purple" type="submit">Buscar</button>
          </div>
          <div class="search-hint"><span>Experimente:</span>${['casa com quintal no Campo do Galvão','apartamento 2 quartos para alugar perto da Dutra','kitnet mobiliada perto da EEAR','chácara com piscina até 600 mil'].map(x=>`<button class="try" type="button">${x}</button>`).join('')}</div>
        </form>
        <div class="hero-note"><span>${ic('i-sparkle')}<b>${novos} ${plural(novos,'imóvel novo','imóveis novos')}</b> desde ontem</span><span>${ic('i-check')}Preço sempre com condomínio e IPTU</span><span>${ic('i-chat')}Fale direto com quem anuncia</span></div>
      </div>
    </section>

    <section class="sec"><div class="wrap">
      <div class="sec-h"><div><span class="eyebrow">Explore</span><h2>Do jeito que você mora</h2><p>Atalhos para o que mais se procura em Guará.</p></div></div>
      <div class="cats">${CATS.map((c,i)=>{ const n=cnt(c.f); return c.big
        ? `<a class="cat-big" href="#busca" data-cat="${i}">${scene(c.cena[0],c.cena[1])}<b>${c.t}</b><span>${n} ${plural(n,'imóvel','imóveis')} ${c.s}</span></a>`
        : `<a class="cat" href="#busca" data-cat="${i}"><span class="blob">${ic(c.i)}</span><div><b>${c.t}</b><br><span>${n} ${c.s}</span></div></a>`; }).join('')}</div>
    </div></section>

    ${recent.length ? `<section class="sec"><div class="wrap">
      <div class="sec-h"><div><span class="eyebrow">Para você</span><h2>Continue de onde parou</h2></div><div class="rail-nav"><button type="button" data-rail="rail-recent" data-dir="-1" aria-label="Anteriores">${ic('i-chev-l')}</button><button type="button" data-rail="rail-recent" data-dir="1" aria-label="Próximos">${ic('i-chev-r')}</button></div></div>
      <div class="rail" id="rail-recent">${recent.map(card).join('')}</div></div></section>` : ''}

    <section class="sec"><div class="wrap">
      <div class="sec-h"><div><span class="eyebrow">Feed</span><h2>O que está rolando em Guará</h2></div>
        <div class="tabs" role="tablist" aria-label="Feed">${Object.entries(FEEDS).map(([k,f],i)=>`<button class="tab" role="tab" type="button" data-feed="${k}" aria-selected="${i===0}">${f.t}</button>`).join('')}</div></div>
      <div class="cards c4" id="feed"></div>
      <div style="display:flex;justify-content:center;margin-top:28px"><a class="btn btn-outline" href="#busca" id="feed-all">Ver todos ${ic('i-arrow')}</a></div>
    </div></section>

    <section class="sec"><div class="wrap"><div class="lx-band">
      <img src="img/loja-lancamentos.png" alt="Ilustração da loja de Lançamentos ValeCasa, com um casal saindo com a chave no carrinho">
      <div><span class="eyebrow" style="color:var(--vc-green-500)">Área de lançamentos</span>
        <h2>Imóvel novo, <em>direto de quem constrói.</em></h2>
        <p>Planta, tabela de preço e andamento da obra de ${D.lancamentos.length} empreendimentos em Guará. Dá pra simular a parcela antes de falar com alguém.</p>
        <div class="lx-mini">${lxs.map(l=>`<a href="#lancamento-${l.id}"><span class="th">${scene(l.cena,l.seed)}</span><span><b>${esc(l.nome)}</b><small>${esc(l.bairro)} · ${VC.lxFase(l)}</small></span><span class="p">a partir de<strong>${brlK(VC.lxMin(l))}</strong></span></a>`).join('')}</div>
        <a class="btn btn-primary" href="#lancamentos">Entrar em Lançamentos ${ic('i-arrow')}</a></div>
    </div></div></section>

    <section class="sec" id="sec-bairros"><div class="wrap">
      <div class="sec-h"><div><span class="eyebrow">Bairros</span><h2>Conheça Guará pelo bairro</h2><p>Preço médio de venda e o jeito de cada lugar, contado por quem mora lá.</p></div><div class="rail-nav"><button type="button" data-rail="rail-hoods" data-dir="-1" aria-label="Bairros anteriores">${ic('i-chev-l')}</button><button type="button" data-rail="rail-hoods" data-dir="1" aria-label="Próximos bairros">${ic('i-chev-r')}</button></div></div>
      <div class="rail" id="rail-hoods" style="grid-auto-columns:minmax(180px,calc((100% - 5*24px)/6))">${D.bairros.map((b,i)=>{ const n=hoodCount(b.n); return `<a class="hood-t" href="#busca" data-bairro="${esc(b.n)}">${scene(['casa','apto','sobrado','chacara'][i%4], 90+i)}<div><h3>${esc(b.n)}</h3><span class="vibe">${esc(b.vibe)}</span></div><div><span>Média de venda</span><b>${brl(b.media)}</b><span class="cnt">${n} ${plural(n,'imóvel','imóveis')}</span></div></a>`; }).join('')}</div>
    </div></section>

    <section class="sec"><div class="wrap">
      <div class="sec-h"><div><span class="eyebrow" style="color:var(--vc-coral)">Cantinhos de Guará</span><h2>Onde morar, segundo quem conhece</h2></div></div>
      <div class="cantos">${CANTOS.map((c,i)=>`<a class="canto" href="#busca" data-canto="${i}"><div class="art"><img src="img/${c.img}" alt="${c.alt}"></div><span class="ey">${c.ey}</span><h3>${c.t}</h3><p>${c.p}</p><span class="go">Ver imóveis ${ic('i-arrow')}</span></a>`).join('')}</div>
    </div></section>

    <section class="sec" id="sec-corretores"><div class="wrap">
      <div class="sec-h"><div><span class="eyebrow">Profissionais</span><h2>Quem anuncia em Guará</h2><p>Nota dada por quem já fechou negócio pelo ValeCasa.</p></div></div>
      <div class="pros">
        <div id="brokers" style="display:flex;flex-direction:column;gap:20px"><div class="brokers">${BROKERS.map(k=>{ const c=D.corretores[k], n=D.imoveis.filter(i=>i.an===k).length; return `<button class="broker" type="button" data-an="${k}" data-name="${esc(norm(c.n))}"><span class="ph-cover" style="background:linear-gradient(160deg,${c.cover[0]},${c.cover[1]})"></span><span class="avatar" style="background:${c.cor}">${initials(c.n)}</span><b>${esc(shortName(c.n))}</b><span class="score"><span class="stars sm">${ic('i-star')}</span>${String(c.nota).replace('.',',')} · ${n} ${plural(n,'imóvel','imóveis')}</span></button>`; }).join('')}</div>
          <div class="agencies">${AGENCIES.map(k=>{ const c=D.corretores[k], n=D.imoveis.filter(i=>i.an===k).length; return `<button class="agency broker" type="button" data-an="${k}" data-name="${esc(norm(c.n))}"><span class="mark" style="color:${c.cor}">${esc(c.n.toUpperCase())}</span><span class="count-pill">${n} ${plural(n,'imóvel','imóveis')}</span></button>`; }).join('')}</div></div>
        <form class="pro-search" id="pro-form"><h3>Procurando alguém específico?</h3><p>Busque corretor ou imobiliária pelo nome.</p>
          <div class="search-field">${ic('i-search')}<label class="sr" for="pro-q">Nome do profissional</label><input id="pro-q" placeholder="Ex.: Cecília, Vale Mais"></div>
          <button class="btn btn-purple" type="submit">Buscar</button><p id="pro-msg" class="muted" hidden></p></form>
      </div>
    </div></section>

    <section class="sec"><div class="wrap"><div class="how">
      <div class="panel"><div class="sec-h" style="margin-bottom:24px"><div><span class="eyebrow">Como funciona</span><h2>Sem enrolação</h2></div></div>
        <div class="steps"><div class="step"><span class="blob">${ic('i-search')}</span><b>Pesquise</b><p>Por bairro, preço ou tipo de imóvel, com filtros rápidos.</p></div><div class="step"><span class="blob">${ic('i-chat')}</span><b>Entre em contato</b><p>Fale com quem anuncia pelo site ou pelo WhatsApp.</p></div><div class="step"><span class="blob">${ic('i-key')}</span><b>Vida nova</b><p>Feche negócio e pegue as chaves da casa nova.</p></div></div></div>
      <div class="anuncie"><span class="eyebrow">Para quem anuncia</span><q>Aqui o destaque é de quem faz o melhor anúncio, não de quem paga mais.</q><p>Foto boa, preço completo e descrição honesta colocam seu imóvel no topo da busca.</p><div class="row"><button class="btn btn-primary" type="button" data-anunciar>Anunciar imóvel</button><a class="link" href="#corretores">Sou corretor →</a></div></div>
    </div></div></section>`;
    VC.mount('portal', html, {nav:target});

    // hero
    let fin='venda';
    const form=$('#hero-form');
    form.addEventListener('click', e=>{
      const b=e.target.closest('[data-fin]'); if(b){ fin=b.dataset.fin; $$('[data-fin]',form).forEach(x=>x.setAttribute('aria-pressed', x.dataset.fin===fin)); $('#hero-q').placeholder = fin==='lx' ? 'Ex.: Village Tulipa, Vila Paraíba' : fin==='aluguel' ? 'Ex.: apartamento 2 quartos perto da Dutra' : 'Ex.: casa com quintal no Campo do Galvão até 550 mil'; }
      const t=e.target.closest('.try'); if(t){ $('#hero-q').value=t.textContent; VC.searchText(t.textContent); }
    });
    form.addEventListener('submit', e=>{ e.preventDefault(); const q=$('#hero-q').value.trim();
      if(fin==='lx'){ VC.lxSearch({q}); return; }
      const p=parse(q); setS(p.set); if(!p.set.fin) S.fin=fin; S.frase=q; if(!p.hit && q) S.q=q; VC.go('busca'); });
    // categorias, bairros, cantinhos
    $('#main').addEventListener('click', e=>{
      const c=e.target.closest('[data-cat]'); if(c){ setS(CATS[+c.dataset.cat].f); return; }
      const h=e.target.closest('[data-bairro]'); if(h){ setS({fin:'todos', bairros:[h.dataset.bairro]}); return; }
      const k=e.target.closest('[data-canto]'); if(k){ setS(CANTOS[+k.dataset.canto].s); return; }
      const a=e.target.closest('[data-an]'); if(a){ setS({fin:'todos', an:a.dataset.an}); VC.go('busca'); return; }
    });
    // feed
    let feedK='novos';
    const drawFeed=()=>{ const f=FEEDS[feedK], list=D.imoveis.filter(f.f).sort((a,b)=>a.dias-b.dias).slice(0,8); $('#feed').innerHTML=list.map(card).join(''); };
    $$('[data-feed]').forEach(b=>b.addEventListener('click',()=>{ feedK=b.dataset.feed; $$('[data-feed]').forEach(x=>x.setAttribute('aria-selected', x===b)); drawFeed(); }));
    $('#feed-all').addEventListener('click',()=>setS(FEEDS[feedK].s));
    drawFeed();
    // profissionais
    $('#pro-form').addEventListener('submit', e=>{ e.preventDefault(); });
    const proF=()=>{ const q=norm($('#pro-q').value.trim()); let n=0; $$('#brokers [data-name]').forEach(b=>{ const ok=!q||b.dataset.name.includes(q); b.hidden=!ok; if(ok) n++; }); const m=$('#pro-msg'); m.hidden=!!n; m.textContent='Ninguém com esse nome por aqui. Tenta só o sobrenome.'; };
    $('#pro-q').addEventListener('input', proF); $('#pro-form').addEventListener('submit', proF);
    if(target) setTimeout(()=>{ const el=document.getElementById('sec-'+target); if(el) el.scrollIntoView({behavior:'smooth'}); }, 60);
  }

  /* ===== BUSCA ===== */
  const CHIPS = [['tipos','Tipo de imóvel'],['bairros','Bairro'],['preco','Preço'],['quartos','Quartos e banheiros'],['area','Área (m²)'],['mais','Mais filtros']];
  function chipLabel(k){
    if(k==='tipos') return S.tipos.length ? (S.tipos.length>2 ? S.tipos.slice(0,2).join(', ')+' +'+(S.tipos.length-2) : S.tipos.join(', ')) : 'Tipo de imóvel';
    if(k==='bairros') return S.bairros.length ? (S.bairros.length>1 ? S.bairros[0]+' +'+(S.bairros.length-1) : S.bairros[0]) : 'Bairro';
    if(k==='preco') return S.pmin&&S.pmax ? `${brlK(S.pmin)} a ${brlK(S.pmax)}` : S.pmax ? 'Até '+brlK(S.pmax) : S.pmin ? 'A partir de '+brlK(S.pmin) : 'Preço';
    if(k==='quartos') return S.qmin||S.bmin||S.vmin ? [S.qmin&&S.qmin+'+ quartos', S.bmin&&S.bmin+'+ banh.', S.vmin&&S.vmin+'+ vagas'].filter(Boolean).join(' · ') : 'Quartos e banheiros';
    if(k==='area') return S.amin ? 'A partir de '+S.amin+' m²' : 'Área (m²)';
    if(k==='mais') return S.tags.length ? `Mais filtros · ${S.tags.length}` : 'Mais filtros';
  }
  const chipOn = k => k==='tipos'?S.tipos.length : k==='bairros'?S.bairros.length : k==='preco'?(S.pmin||S.pmax) : k==='quartos'?(S.qmin||S.bmin||S.vmin) : k==='area'?S.amin : S.tags.length;
  const anyOn = () => CHIPS.some(([k])=>chipOn(k)) || S.q || S.an;
  function nums(name, vals, cur){ return `<div class="nums" role="group" aria-label="${name}" data-num="${name}">${vals.map(v=>`<button type="button" data-v="${v}" aria-pressed="${(cur||0)===v}">${v?v+'+':'Qualquer'}</button>`).join('')}</div>`; }
  function popHTML(k){
    const fin=S.fin;
    if(k==='tipos'){ const base=filtra(S,'tipos'); return `<h4>Tipo de imóvel</h4><div class="checks">${TIPOS.map(t=>{ const n=base.filter(i=>i.tipo===t).length; return `<label class="check"><input type="checkbox" data-arr="tipos" value="${t}" ${S.tipos.includes(t)?'checked':''}>${t}<small>${n}</small></label>`; }).join('')}</div>`; }
    if(k==='bairros'){ const base=filtra(S,'bairros'); return `<h4>Bairro</h4><div class="checks">${D.bairros.map(b=>b.n).sort((a,b)=>a.localeCompare(b,'pt')).map(b=>{ const n=base.filter(i=>i.bairro===b).length; return `<label class="check"><input type="checkbox" data-arr="bairros" value="${esc(b)}" ${S.bairros.includes(b)?'checked':''}>${esc(b)}<small>${n}</small></label>`; }).join('')}</div>`; }
    if(k==='preco'){ const pre = fin==='aluguel' ? [1000,1500,2000,3000,5000] : [200000,350000,500000,800000,1200000];
      return `<h4>${fin==='aluguel'?'Total por mês':'Preço'}</h4><div class="range2"><div class="field"><label for="p-min">Mínimo</label><input class="input" id="p-min" inputmode="numeric" data-money="pmin" value="${S.pmin?th(S.pmin):''}" placeholder="R$ 0"></div><div class="field"><label for="p-max">Máximo</label><input class="input" id="p-max" inputmode="numeric" data-money="pmax" value="${S.pmax?th(S.pmax):''}" placeholder="Sem limite"></div></div>
      <div class="presets">${pre.map(v=>`<button type="button" data-pmax="${v}">até ${brlK(v)}</button>`).join('')}</div>${fin==='aluguel'?'<span class="hint muted" style="font-size:12px">O total soma aluguel, condomínio e IPTU.</span>':''}`; }
    if(k==='quartos') return `<h4>Quartos</h4>${nums('qmin',[0,1,2,3,4],S.qmin)}<h4>Banheiros</h4>${nums('bmin',[0,1,2,3],S.bmin)}<h4>Vagas</h4>${nums('vmin',[0,1,2,3],S.vmin)}`;
    if(k==='area') return `<h4>Área mínima</h4>${nums('amin',[0,50,80,120,200,300],S.amin).replace(/>(\d+)\+</g,'>$1 m²<')}`;
    if(k==='mais'){ const base=filtra(S,'tags'); return `<h4>Características</h4><div class="checks" style="max-height:300px">${Object.entries(TAGS).map(([t,l])=>{ const n=base.filter(im=>t==='baixou'?!!im.antes:t==='proprietario'?im.an==='prop':im.tags.includes(t)).length; return `<label class="check"><input type="checkbox" data-arr="tags" value="${t}" ${S.tags.includes(t)?'checked':''}>${l}<small>${n}</small></label>`; }).join('')}</div>`; }
  }
  function resetGroup(k){ if(k==='tipos') S.tipos=[]; if(k==='bairros') S.bairros=[]; if(k==='preco'){S.pmin=null;S.pmax=null;} if(k==='quartos'){S.qmin=0;S.bmin=0;S.vmin=0;} if(k==='area') S.amin=null; if(k==='mais') S.tags=[]; }

  function busca(){
    const segB = `<div class="seg" role="group" aria-label="Finalidade">${[['venda','Comprar'],['aluguel','Alugar'],['todos','Todos']].map(([v,l])=>`<button type="button" data-sfin="${v}" aria-pressed="${S.fin===v}">${l}</button>`).join('')}</div>`;
    const html = `
    <section class="srch-top"><div class="wrap">
      <form class="search" id="b-form" role="search">
        <div class="search-field">${ic('i-search')}<label class="sr" for="b-q">Buscar imóveis</label><input id="b-q" value="${esc(S.frase||S.q)}" placeholder="Bairro, tipo, preço ou o que você precisa" autocomplete="off">${segB}</div>
        ${segB.replace('class="seg"','class="seg seg-m"')}
        <button class="btn btn-search" type="submit">Buscar</button>
      </form>
      <div class="filters" id="b-filters">${CHIPS.map(([k,l],i)=>`<div class="chip-wrap"><button class="chip" type="button" data-chip="${k}" aria-expanded="false" aria-pressed="false"><span>${l}</span>${ic('i-chev')}</button></div>`).join('')}<button class="chip-clear" type="button" id="b-clear">Limpar filtros</button></div>
      <div class="understood" id="b-und"></div>
    </div></section>
    <div class="wrap">
      <div class="res-head"><div><h1 id="b-title"></h1><p id="b-sub"></p></div>
        <div class="res-tools"><label class="sr" for="b-sort">Ordenar por</label><select class="sel" id="b-sort">${[['relevancia','Mais relevantes'],['recentes','Mais recentes'],['menor','Menor preço'],['maior','Maior preço'],['area','Maior área']].map(([v,l])=>`<option value="${v}" ${S.sort===v?'selected':''}>${l}</option>`).join('')}</select>
        <button class="toggle-map" type="button" id="b-maptg" aria-pressed="${S.map}">${ic('i-map')} Mapa</button></div></div>
      <div class="res-layout ${S.map?'':'nomap'}" id="b-layout"><div id="b-list" style="min-width:0"></div><aside class="res-map" aria-label="Mapa dos resultados"><div class="map" id="b-map"></div></aside></div>
    </div>`;
    VC.mount('portal', html, {nav: S.fin==='aluguel'?'alugar':S.fin==='venda'?'comprar':null, title:'Busca', keepScroll:false});

    let openK=null;
    const closePop=()=>{ if(!openK) return; const w=$(`[data-chip="${openK}"]`); if(w){ w.setAttribute('aria-expanded','false'); const p=w.parentElement.querySelector('.pop'); if(p) p.remove(); } openK=null; };
    const openPop=k=>{
      closePop(); openK=k; const b=$(`[data-chip="${k}"]`); b.setAttribute('aria-expanded','true');
      const pop=document.createElement('div'); pop.className='pop'; pop.setAttribute('role','dialog'); pop.setAttribute('aria-label', b.textContent.trim());
      const r=b.getBoundingClientRect(); if(r.left+300>window.innerWidth-16) pop.classList.add('right');
      pop.innerHTML = popHTML(k)+`<div class="acts"><button class="chip-clear" type="button" data-reset>Limpar</button><button class="btn btn-primary btn-sm" type="button" data-done></button></div>`;
      b.parentElement.appendChild(pop); syncDone();
      pop.addEventListener('change', e=>{ const i=e.target; if(i.dataset.arr){ const a=S[i.dataset.arr]; if(i.checked){ if(!a.includes(i.value)) a.push(i.value); } else S[i.dataset.arr]=a.filter(x=>x!==i.value); S.limit=12; update(); } });
      pop.addEventListener('input', e=>{ const i=e.target; if(i.dataset.money){ const d=i.value.replace(/\D/g,''); i.value=d?th(+d):''; S[i.dataset.money]=d?+d:null; S.limit=12; update(); } });
      pop.addEventListener('click', e=>{
        const nb=e.target.closest('[data-num] button'); if(nb){ const g=nb.parentElement.dataset.num, v=+nb.dataset.v; S[g]= g==='amin' ? (v||null) : v; $$('button',nb.parentElement).forEach(x=>x.setAttribute('aria-pressed', x===nb)); update(); }
        const pm=e.target.closest('[data-pmax]'); if(pm){ S.pmax=+pm.dataset.pmax; const i=$('#p-max',pop); if(i) i.value=th(S.pmax); update(); }
        if(e.target.closest('[data-reset]')){ resetGroup(k); const kk=k; closePop(); update(); openPop(kk); }
        if(e.target.closest('[data-done]')) closePop();
      });
    };
    const syncDone=()=>{ const d=$('.pop [data-done]'); if(d){ const n=filtra().length; d.textContent = n ? `Ver ${n} ${plural(n,'imóvel','imóveis')}` : 'Nenhum resultado'; } };
    $('#b-filters').addEventListener('click', e=>{ const c=e.target.closest('[data-chip]'); if(c){ e.stopPropagation(); openK===c.dataset.chip ? closePop() : openPop(c.dataset.chip); } });
    const outside=e=>{ if(openK && !e.target.closest('.chip-wrap')) closePop(); };
    document.addEventListener('click', outside); VC.onCleanup(()=>document.removeEventListener('click', outside));
    $('#b-clear').addEventListener('click', ()=>{ const keep={fin:S.fin, sort:S.sort, map:S.map}; S=Object.assign(S0(), keep); $('#b-q').value=''; closePop(); update(); });
    $('#b-form').addEventListener('click', e=>{ const b=e.target.closest('[data-sfin]'); if(b){ S.fin=b.dataset.sfin; S.pmin=null; S.pmax=null; $$('[data-sfin]').forEach(x=>x.setAttribute('aria-pressed', x.dataset.sfin===S.fin)); update(); } });
    $('#b-form').addEventListener('submit', e=>{ e.preventDefault(); const q=$('#b-q').value.trim(); const p=parse(q); const keep={fin:p.set.fin||S.fin, sort:S.sort, map:S.map}; S=Object.assign(S0(), keep, p.set); S.frase=p.hit?q:''; if(!p.hit&&q) S.q=q; $$('[data-sfin]').forEach(x=>x.setAttribute('aria-pressed', x.dataset.sfin===S.fin)); update(); });
    $('#b-sort').addEventListener('change', e=>{ S.sort=e.target.value; update(); });
    $('#b-maptg').addEventListener('click', e=>{ S.map=!S.map; e.currentTarget.setAttribute('aria-pressed',S.map); $('#b-layout').classList.toggle('nomap',!S.map); if(S.map) A.layoutPins($('#b-map')); });
    $('#b-und').addEventListener('click', e=>{ const x=e.target.closest('[data-rm]'); if(!x) return; const [g,v]=x.dataset.rm.split('|');
      if(['tipos','bairros','tags'].includes(g)) S[g]=S[g].filter(i=>i!==v); else if(g==='preco'){S.pmin=null;S.pmax=null;} else if(g==='q'){S.q='';S.frase='';$('#b-q').value='';} else if(g==='an') S.an=null; else S[g]= g==='amin'?null:0; update(); });
    $('#b-list').addEventListener('click', e=>{
      const m=e.target.closest('[data-more]'); if(m){ S.limit+=12; update(true); }
      const em=e.target.closest('[data-empty]'); if(em){ const a=em.dataset.empty; if(a==='preco'){S.pmin=null;S.pmax=null;} else if(a==='tudo'){ S=Object.assign(S0(),{fin:S.fin,map:S.map}); $('#b-q').value=''; } else { S.bairros=[a]; } update(); }
      if(e.target.closest('[data-alert]')) alertModal();
    });
    // mapa
    const map=$('#b-map');
    map.addEventListener('click', e=>{ const p=e.target.closest('.pin'); if(!p) return; const id=+p.dataset.id; const list=filtra(); const ix=list.findIndex(i=>i.id===id); if(ix>=S.limit){ S.limit=Math.ceil((ix+1)/12)*12; update(true); }
      const c=$(`#b-list .card[data-id="${id}"]`); if(c){ c.scrollIntoView({behavior:'smooth', block:'center'}); c.classList.add('hl'); setTimeout(()=>c.classList.remove('hl'),1600); } });
    $('#b-list').addEventListener('mouseover', e=>{ const c=e.target.closest('.card'); $$('.pin.on',map).forEach(p=>p.classList.remove('on')); if(c){ const p=$(`.pin[data-id="${c.dataset.id}"]`,map); if(p) p.classList.add('on'); } });
    const ro=new ResizeObserver(()=>A.layoutPins(map)); ro.observe(map); VC.onCleanup(()=>ro.disconnect());
    update();

    function update(keepPins){
      const all=filtra(), list=all.slice(0,S.limit), n=all.length;
      // chips
      CHIPS.forEach(([k])=>{ const b=$(`[data-chip="${k}"]`); b.setAttribute('aria-pressed', !!chipOn(k)); b.querySelector('span').textContent=chipLabel(k); });
      $('#b-clear').hidden=!anyOn();
      // entendi
      const pills=[];
      if(S.an) pills.push(['an|', D.corretores[S.an].n]);
      S.tipos.forEach(t=>pills.push(['tipos|'+t, t]));
      S.bairros.forEach(b=>pills.push(['bairros|'+b, b]));
      if(S.pmin||S.pmax) pills.push(['preco|', chipLabel('preco')]);
      if(S.qmin) pills.push(['qmin|', S.qmin+'+ quartos']); if(S.bmin) pills.push(['bmin|', S.bmin+'+ banheiros']); if(S.vmin) pills.push(['vmin|', S.vmin+'+ vagas']);
      if(S.amin) pills.push(['amin|', 'A partir de '+S.amin+' m²']);
      S.tags.forEach(t=>pills.push(['tags|'+t, TAGS[t]]));
      if(S.q) pills.push(['q|', '"'+S.q+'"']);
      $('#b-und').innerHTML = pills.length ? `<span>${S.frase?'Entendi:':'Filtros:'}</span>`+pills.map(([k,l])=>`<span class="u">${esc(l)}<button type="button" data-rm="${esc(k)}" aria-label="Tirar ${esc(l)}">${ic('i-x','i-12')}</button></span>`).join('') : '';
      // título
      const tp = S.tipos.length===1 ? TP[S.tipos[0]][n===1?0:1] : plural(n,'imóvel','imóveis');
      const fn = S.fin==='venda'?'para comprar':S.fin==='aluguel'?'para alugar':'para comprar ou alugar';
      const onde = S.bairros.length===1 ? `${prep(S.bairros[0])} ${S.bairros[0]}` : S.bairros.length>1 ? `em ${S.bairros.length} bairros` : 'em Guará';
      $('#b-title').textContent = !n ? `Nenhum imóvel ${fn} ${onde}` : S.an ? `${n} ${plural(n,'imóvel','imóveis')} de ${D.corretores[S.an].n}` : `${n} ${tp} ${fn} ${onde}`;
      $('#b-sub').textContent = n ? (S.fin==='aluguel' ? 'Preço total por mês, já com condomínio e IPTU.' : 'Ordenados por '+$('#b-sort').selectedOptions[0].textContent.toLowerCase()+'.') : '';
      // lista
      if(!n){
        const b=S.bairros[0], viz=b ? bairro(b).viz.map(v=>[v, filtra(Object.assign({},S,{bairros:[v]})).length]).filter(x=>x[1]) : [];
        $('#b-list').innerHTML = `<div class="empty">${A.vazia}<b>${b?`Nada ${prep(b)} ${esc(b)} com esses filtros.`:'Nada com esses filtros.'}</b><p>${S.pmax||S.pmin?'Tira o filtro de preço ou olha os bairros vizinhos.':'Tira um filtro ou olha os bairros vizinhos.'}</p>
          <div class="row">${S.pmax||S.pmin?'<button class="btn btn-outline btn-sm" type="button" data-empty="preco">Tirar filtro de preço</button>':''}${viz.map(([v,c])=>`<button class="btn btn-outline btn-sm" type="button" data-empty="${esc(v)}">Ver ${prep(v)} ${esc(v)} (${c})</button>`).join('')}<button class="btn btn-ghost btn-sm" type="button" data-empty="tudo">Limpar tudo</button></div></div>`;
      } else {
        $('#b-list').innerHTML = `<div class="cards">${list.map(card).join('')}</div>`+
          (n>S.limit ? `<div class="more-row"><span>Mostrando ${list.length} de ${n}</span><button class="btn btn-outline" type="button" data-more>Ver mais imóveis</button></div>` : '')+
          `<div class="alert-box"><div><b>Avisa quando aparecer outro assim?</b><p>A gente manda um e-mail quando entrar imóvel novo com esses filtros.</p></div><button class="btn btn-primary btn-sm" type="button" data-alert>${ic('i-bell')} Criar alerta</button></div>`;
      }
      // mapa
      map.innerHTML = A.mapa({focus:S.bairros[0], poiLabels:true}) + all.map(im=>`<button class="pin" type="button" data-id="${im.id}" data-x="${im.x.toFixed(1)}" data-y="${im.y.toFixed(1)}" aria-label="${esc(im.tit)}, ${pinPrice(im)}">${pinPrice(im)}</button>`).join('') + '<span class="map-note">Mapa ilustrativo</span>';
      A.layoutPins(map);
      syncDone();
    }
  }
  function alertModal(){
    VC.modal(VC.mh('Criar alerta','A gente avisa por e-mail quando entrar imóvel novo com esses filtros.')+`<div class="modal-b"><div class="field"><label for="al-mail">Seu e-mail</label><input class="input" id="al-mail" type="email" autocomplete="email" placeholder="voce@email.com"><span class="hint" data-ok="Um e-mail por semana, no máximo"></span></div><button class="btn btn-primary" type="button" id="al-go">Criar alerta</button></div>`, {label:'Criar alerta', onMount(el){
      $('#al-go',el).addEventListener('click',()=>{ const i=$('#al-mail',el); if(VC.fieldErr(i, /^\S+@\S+\.\S+$/.test(i.value.trim())?'':'Esse e-mail parece incompleto. Confere se tem o @ e o final, como .com.')) return; el.querySelector('.modal').innerHTML=VC.mh('Criar alerta')+`<div class="modal-b">${VC.okState('Alerta criado.','Quando aparecer imóvel assim, a gente te avisa em '+esc(i.value.trim())+'.')}</div>`; });
    }});
  }

  /* ===== PÁGINA DO IMÓVEL ===== */
  const pmt = (pv, aa=.115, n=360) => { const i=Math.pow(1+aa,1/12)-1; return pv*i/(1-Math.pow(1+i,-n)); };
  function quality(im){
    const f=fotos(im).length, items=[
      ['Fotos de todos os cômodos', f>=5], ['Preço completo, com custos', true], ['Recado de quem anuncia', !!im.nota], ['Localização no mapa', im.id%2===1 || im.an!=='prop'],
      ['Planta do imóvel', im.id%3===0], ['Responde em até 1 hora', im.an!=='prop' || im.id%2===0]];
    const ok=items.filter(x=>x[1]).length; return {items, nota:Math.round((4+ok)*10)/10};
  }
  const fmtData = d => d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.','');
  function contatoModal(im){
    const c=D.corretores[im.an], first=c.agencia?c.n:c.n.split(' ')[0], art = c.tipo==='Corretora'||c.agencia ? 'a' : 'o', quem = im.an==='prop' ? 'o proprietário' : `${art} ${first}`;
    const msg=`Oi${im.an==='prop'?'':', '+first}! Vi ${im.tipo==='Casa'||im.tipo==='Chácara'||im.tipo==='Kitnet'?'a':'o'} ${im.tipo.toLowerCase()} ${prep(im.bairro)} ${im.bairro} no ValeCasa (código VC-${im.id}) e quero saber se ainda está disponível.`;
    VC.modal(VC.mh('Entrar em contato', `Sua mensagem vai direto para ${quem==='o proprietário'?'o proprietário':esc(c.n)}.`)+`<form class="modal-b" id="ct-form" novalidate>
      <div class="field"><label for="ct-nome">Nome</label><input class="input" id="ct-nome" autocomplete="name"><span class="hint" data-ok="Como ${quem} vai te chamar">Como ${quem} vai te chamar</span></div>
      <div class="field"><label for="ct-tel">Celular com DDD</label><input class="input" id="ct-tel" data-tel inputmode="tel" autocomplete="tel" placeholder="(12) 98123-4567"><span class="hint" data-ok=""></span></div>
      <div class="field"><label for="ct-msg">Mensagem</label><textarea class="input" id="ct-msg">${esc(msg)}</textarea></div>
      <label class="check" style="padding:0"><input type="checkbox" id="ct-wa" checked> Prefiro que me chamem no WhatsApp</label>
      <button class="btn btn-primary" type="submit">Enviar mensagem ${ic('i-arrow')}</button></form>`, {label:'Entrar em contato', onMount(el){
        VC.bindTel(el);
        $('#ct-form',el).addEventListener('submit', e=>{ e.preventDefault(); const nm=$('#ct-nome',el), tl=$('#ct-tel',el);
          const pra=quem.replace(/^a /,'pra ').replace(/^o /,'pro '); const e1=VC.fieldErr(nm, nm.value.trim()?'':`Diz seu nome ${pra} saber com quem está falando.`), e2=VC.fieldErr(tl, VC.telErro(tl.value)); if(e1||e2) return;
          const via=$('#ct-wa',el).checked?'te chamar no WhatsApp':'te ligar';
          el.querySelector('.modal').innerHTML=VC.mh('Entrar em contato')+`<div class="modal-b">${VC.okState(`Pronto, ${quem} recebeu sua mensagem.`, `${quem.charAt(0).toUpperCase()+quem.slice(1)} vai ${via} no ${esc(tl.value)}.`)}</div>`; });
      }});
  }
  function waModal(im){
    const c=D.corretores[im.an];
    VC.modal(VC.mh('Chamar no WhatsApp', esc(c.n))+`<div class="modal-b"><p style="font-size:14px;color:var(--ink-2)">Salva o número e manda o código do anúncio na primeira mensagem.</p><div class="copyline"><span id="wa-n">${c.tel}</span><button class="btn btn-outline btn-sm" type="button" id="wa-c">Copiar</button></div><div class="copyline" style="font-size:13px;font-weight:500"><span id="wa-m">Oi! Vi o anúncio VC-${im.id} no ValeCasa.</span><button class="btn btn-outline btn-sm" type="button" id="wa-cm">Copiar</button></div><span class="proto" style="align-self:flex-start">Número de exemplo deste protótipo.</span></div>`, {label:'WhatsApp', onMount(el){
      $('#wa-c',el).addEventListener('click',()=>VC.copy(c.tel,$('#wa-n',el))); $('#wa-cm',el).addEventListener('click',()=>VC.copy($('#wa-m',el).textContent,$('#wa-m',el)));
    }});
  }
  function reportModal(im){
    VC.modal(VC.mh('Viu algo errado neste anúncio?','Avisa a gente. Leva 30 segundos.')+`<form class="modal-b" id="rp-form">${['O imóvel já foi vendido ou alugado','O preço está diferente','As fotos não são deste imóvel','O endereço está errado','Outra coisa'].map((x,i)=>`<label class="check"><input type="radio" name="rp" value="${i}" ${i===0?'checked':''}> ${x}</label>`).join('')}<div class="field"><label for="rp-obs">Conta mais, se quiser</label><textarea class="input" id="rp-obs" placeholder="Ex.: fotos ruins, poucas informações…"></textarea></div><button class="btn btn-primary" type="submit">Enviar aviso</button></form>`, {label:'Avisar problema', onMount(el){
      $('#rp-form',el).addEventListener('submit',e=>{ e.preventDefault(); el.querySelector('.modal').innerHTML=VC.mh('Viu algo errado neste anúncio?')+`<div class="modal-b">${VC.okState('Obrigado pelo aviso.','A gente olha o anúncio VC-'+im.id+' em até 1 dia útil.')}</div>`; });
    }});
  }

  function imovel(m){
    const im=D.imoveis.find(i=>i.id===+m[1]); if(!im){ VC.go('inicio'); return; }
    VC.addRecent(im.id);
    const c=D.corretores[im.an], b=bairro(im.bairro), F=fotos(im), q=quality(im), venda=im.fin==='venda';
    const hoje=D.hoje, pub=new Date(hoje.getTime()-im.dias*864e5), vistos=40+(A.R(im.id)()*180|0);
    const finTxt = venda?'venda':'aluguel', kind = `${im.tipo} · ${finTxt}`;
    const poisD = D.pois.filter(p=>p.id!=='freigalvao').map(p=>({...p, km:Math.hypot(p.x-im.x,p.y-im.y)*VC.KM})).concat([{n:'Via Dutra', sub:'Acesso mais próximo', ic:'i-car', km:VC.distDutra(im.x,im.y)*VC.KM}]).sort((a,b)=>a.km-b.km);
    const tempo = km => km<1.2 ? `${Math.max(2,Math.round(km*13))} min a pé` : `${Math.max(3,Math.round(km*2+2))} min de carro`;
    const m2 = im.a&&venda ? im.preco/im.a : null, guaM2 = D.bairros.reduce((a,x)=>a+x.m2,0)/D.bairros.length;
    const diff = m2 ? Math.round((m2/b.m2-1)*100) : 0;
    const gal = F.slice(0,5);
    const galStyle = gal.length<5 ? 'grid-template-columns:2fr 1fr' : '';
    const seguro = Math.round(im.preco*.012/12*10)/10|0;
    const costs = venda
      ? [['Condomínio/mês', im.cond?brl(im.cond):'Não tem'], ['IPTU/ano', im.iptu?brl(im.iptu):'Não informado'], ['ITBI estimado (2%)', brl(im.preco*.02)], ['Escritura e registro (est.)', brl(im.preco*.012)]]
      : [['Aluguel', brl(im.preco)], ['Condomínio', im.cond?brl(im.cond):'Não tem'], ['IPTU', im.iptu?brl(im.iptu):'Não tem'], ['Seguro incêndio (est.)', brl(Math.max(18,seguro))]];
    const parcela = venda ? pmt(im.preco*.8) : 0;
    const desc = [
      `${im.tipo} ${venda?'à venda':'para alugar'} ${prep(im.bairro)} ${im.bairro}${im.a?`, com ${im.a} m² de área construída`:''}${im.at?` em terreno de ${th(im.at)} m²`:''}.${im.q?` São ${im.q} ${plural(im.q,'quarto','quartos')}${im.s?` (${im.s} ${plural(im.s,'suíte','suítes')})`:''}, ${im.b} ${plural(im.b,'banheiro','banheiros')} e ${im.v?im.v+' '+plural(im.v,'vaga','vagas'):'nenhuma vaga de garagem'}.`:''}`,
      `Sobre o bairro: ${b.vibe}`,
      venda ? `O valor pedido é ${brl(im.preco)}${im.cond?`, com condomínio de ${brl(im.cond)} por mês`:''}${im.iptu?` e IPTU de ${brl(im.iptu)} por ano`:''}.` : `O total por mês fica em ${brl(total(im))}, somando aluguel${im.cond?', condomínio':''}${im.iptu?' e IPTU':''}. Aceita fiador, seguro-fiança ou caução de três meses.`
    ];
    const first = im.an==='prop' ? 'quem anuncia' : c.agencia ? c.n : c.n.split(' ')[0];
    const more = D.imoveis.filter(i=>i.id!==im.id && (i.bairro===im.bairro || (i.fin===im.fin && i.tipo===im.tipo))).sort((a,b)=>(b.bairro===im.bairro)-(a.bairro===im.bairro) || (b.fin===im.fin)-(a.fin===im.fin)).slice(0,8);
    const html = `<div class="wrap">
      <nav class="crumbs" aria-label="Você está em"><a href="#inicio">Início</a>›<a href="#${venda?'comprar':'alugar'}">${venda?'Comprar':'Alugar'}</a>›<a href="#busca" data-crumb="${esc(im.bairro)}">${esc(im.bairro)}</a>›<span>VC-${im.id}</span></nav>
      <div class="gal" style="${galStyle}">${gal.map((f,i)=>`<button type="button" data-ph="${i}" aria-label="Abrir foto ${i+1}: ${esc(f[2])}" ${gal.length<5&&i>0&&i>2?'hidden':''}>${scene(f[0],f[1])}</button>`).join('')}
        <div class="g-top"><span class="badge ${venda?'b-sale':'b-rent'}">${venda?'Venda':'Aluguel'}</span>${im.dias<=2?'<span class="badge b-new">Novo</span>':''}${im.an==='prop'?'<span class="badge b-photo">Direto com o proprietário</span>':''}</div>
        <div class="g-acts"><button class="btn btn-sm" type="button" data-ph="0">${ic('i-photo')} Ver ${F.length} fotos</button><button class="btn btn-sm" type="button" data-goto="d-loc">${ic('i-map')} Mapa</button></div></div>
      <div class="detail">
        <div class="d-main">
          <div class="d-title"><span class="k">${kind}</span><h1>${esc(im.tit)}</h1>
            <div class="loc"><span>${ic('i-pin')}${esc(im.bairro)}, Guaratinguetá</span><span>${ic('i-clock')}${im.dias===0?'Anunciado hoje':`Anunciado há ${im.dias} ${plural(im.dias,'dia','dias')}`}</span><span>Código VC-${im.id}</span></div></div>
          ${im.tipo==='Terreno' ? `<div class="attrs"><div class="attr-area"><span>Área</span><div><div><b>${th(im.at)}m²</b><small>Terreno</small></div></div></div></div>` : `<div class="attrs">
            ${im.q?`<div class="attr">${ic('i-bed')}<b>${im.q}</b><span>${plural(im.q,'Quarto','Quartos')}</span></div>`:''}${im.s?`<div class="attr">${ic('i-bed')}<b>${im.s}</b><span>${plural(im.s,'Suíte','Suítes')}</span></div>`:''}
            <div class="attr">${ic('i-bath')}<b>${im.b}</b><span>${plural(im.b,'Banheiro','Banheiros')}</span></div><div class="attr">${ic('i-car')}<b>${im.v}</b><span>${plural(im.v,'Vaga','Vagas')}</span></div>
            <div class="attr-area"><span>Área</span><div><div><b>${im.a}m²</b><small>Construída</small></div>${im.at?`<div><b>${th(im.at)}m²</b><small>Total</small></div>`:''}</div></div></div>`}
          <section><div class="ph"><span class="t">${ic('i-doc','i-20')}Sobre o imóvel</span></div>
            <div class="desc clamp" id="d-desc"><p>${desc[0]}</p>${im.nota?`<div class="friend"><small>Recado de ${esc(first)}</small>${esc(im.nota)}</div>`:''}<p>${desc[2]}</p><p>${esc(desc[1])}</p></div>
            <button class="link" type="button" id="d-more" style="margin-top:8px;font-weight:600">Ler tudo</button></section>
          <section><div class="ph"><span class="t">${ic('i-home','i-20')}Espaços</span><span class="d">Os cômodos e áreas que fazem diferença</span></div><div class="list3">${im.esp.map(x=>`<span>${ic('i-check-s')}${esc(x)}</span>`).join('')}</div></section>
          <section><div class="ph"><span class="t">${ic('i-sparkle','i-20')}Comodidades</span><span class="d">Os itens que dão conforto e praticidade</span></div><div class="list3">${im.com.map(x=>{ const k=com(x); return `<span>${ic(k.i,'i-20')}${esc(k.n)}</span>`; }).join('')}</div></section>
          <section><div class="ph"><span class="t">${ic('i-calc','i-20')}Quanto custa de verdade</span><span class="d">${venda?'Estimativas para você não ser pego de surpresa':'Tudo o que entra no boleto do mês'}</span></div>
            ${venda ? `<div class="fin"><div><span>Entrada de 20%</span><b>${brl(im.preco*.2)}</b></div><div><span>Parcela estimada*</span><b>${brl(parcela)}/mês</b></div><div><span>Prazo</span><b>30 anos</b></div></div><p class="muted" style="font-size:12px;margin-top:10px">*Tabela Price com juros de 11,5% ao ano. O banco faz a conta final com a sua renda.</p>`
              : `<dl class="costs" style="border:1px solid var(--line);border-radius:var(--r-md);background:var(--surface);font-size:14px;padding:16px 20px">${costs.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}<dt class="sum">Total por mês</dt><dd class="sum">${brl(total(im)+Math.max(18,seguro))}</dd></dl>`}</section>
          ${m2 ? `<section><div class="ph"><span class="t">${ic('i-chart','i-20')}Preço comparado ao bairro</span><span class="d">${diff<0?`Este imóvel está ${-diff}% abaixo da média ${prep(b.n)} ${b.n}.`:diff>0?`Este imóvel está ${diff}% acima da média ${prep(b.n)} ${b.n}.`:'Na média do bairro.'}</span></div>
            <div class="cmp">${[['Este imóvel',m2,true],['Média '+(prep(b.n)==='na'?'da':prep(b.n)==='em'?'de':'do')+' '+b.n,b.m2],['Média de Guará',guaM2]].map(([l,v,me])=>{ const mx=Math.max(m2,b.m2,guaM2)*1.1; return `<div class="cmp-row ${me?'me':''}"><span>${esc(l)}</span><div class="bar"><i style="width:${(v/mx*100).toFixed(1)}%"></i></div><b>${brl(v)}/m²</b></div>`; }).join('')}</div></section>` : ''}
          <section id="d-loc"><div class="ph"><span class="t">${ic('i-map','i-20')}Localização</span><span class="d">${esc(im.bairro)}, Guaratinguetá. O endereço exato é passado por quem anuncia.</span></div>
            <div class="near"><div class="map" id="d-map">${A.mapa({focus:im.bairro, poiLabels:false})}<span class="pin dot" data-x="${im.x.toFixed(1)}" data-y="${im.y.toFixed(1)}" aria-hidden="true"></span><span class="map-note">Mapa ilustrativo</span></div>
            <ul>${poisD.slice(0,5).map(p=>`<li>${ic(p.ic,'i-20')}<span>${esc(p.n)}<small>${esc(p.sub)}</small></span><b>${p.km.toFixed(1).replace('.',',')} km<small>${tempo(p.km)}</small></b></li>`).join('')}</ul></div></section>
          <section><div class="ph"><span class="t">${ic('i-check','i-20')}Qualidade do anúncio</span><span class="d">É isso que coloca um anúncio no topo da busca, e não pagamento.</span></div>
            <div class="quality"><div class="q-score" style="--v:${q.nota*10}"><b>${String(q.nota).replace('.',',')}</b></div><div class="q-list">${q.items.map(([l,ok])=>`<span class="${ok?'ok':'no'}">${ic(ok?'i-check':'i-x')}${l}</span>`).join('')}</div></div></section>
          <section><div class="ph"><span class="t">${ic('i-clock','i-20')}Histórico do anúncio</span></div>
            <ul class="hist"><li class="hot"><b>${vistos} pessoas</b> viram este anúncio nos últimos 7 dias<small>Atualizado hoje</small></li>${im.antes?`<li class="hot"><b>Preço baixou ${brl(im.antes-im.preco)}</b>, de ${brl(im.antes)} para ${brl(im.preco)}<small>${fmtData(new Date(pub.getTime()+Math.max(1,im.dias-1)*0+864e5*0))}</small></li>`:''}<li><b>Anunciado</b> por ${esc(c.n)}<small>${fmtData(pub)} de 2026</small></li></ul></section>
          <section><div class="ph"><span class="t">${ic('i-star','i-20')}Avalie o anúncio</span><span class="d">Sua nota ajuda a ordenar a busca para todo mundo.</span></div>
            <div class="rate-grid"><div><span class="lbl">Qualidade do anúncio</span><div class="stars" data-rate="0" aria-label="Nota do anúncio"></div></div><div><span class="lbl">O imóvel</span><div class="stars" data-rate="0" aria-label="Nota do imóvel"></div></div></div></section>
        </div>
        <aside class="d-aside"><div class="aside-sticky">
          <div class="contact">
            <div class="total"><span>${venda?'Valor:':'Total:'}</span><b>${venda?brl(im.preco):brl(total(im))+'/mês'}</b></div>
            ${venda?`<div class="est">Parcela a partir de <b>${brl(parcela)}/mês</b> com 20% de entrada</div>`:''}
            <div class="agent-photo" style="background:${c.cover?`linear-gradient(160deg,${c.cover[0]},${c.cover[1]})`:'linear-gradient(160deg,var(--vc-purple-600),var(--vc-purple-900))'}"><span class="avatar" style="background:${c.cor}">${im.an==='prop'?ic('i-user','i-24'):initials(c.n)}</span></div>
            <div class="who"><b>${esc(c.n)}</b><span>${c.tipo} · ${c.creci}</span>${c.nota?`<div><span class="stars sm">${ic('i-star')}</span> <span style="font-size:12px;color:var(--ink-2)">${String(c.nota).replace('.',',')}</span></div>`:''}</div>
            <div class="acts"><button class="btn btn-primary" type="button" id="d-contact">Entrar em contato ${ic('i-arrow')}</button><button class="btn btn-outline btn-sm" type="button" id="d-wa">${ic('i-wa')} Chamar no WhatsApp</button></div>
            <dl class="costs">${costs.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
          </div>
          <div class="side-acts"><button class="btn btn-outline btn-sm" type="button" data-fav="i${im.id}" aria-pressed="${VC.isFav('i'+im.id)}">${ic('i-heart')} Salvar</button><button class="btn btn-outline btn-sm" type="button" id="d-share">${ic('i-share')} Compartilhar</button><button class="link" type="button" id="d-report">Viu algo errado neste anúncio? Avisa a gente.</button></div>
        </div></aside>
      </div>
      ${more.length?`<section class="sec"><div class="sec-h"><div><h2>Mais imóveis ${prep(im.bairro)} ${esc(im.bairro)} e parecidos</h2></div><div class="rail-nav"><button type="button" data-rail="rail-more" data-dir="-1" aria-label="Anteriores">${ic('i-chev-l')}</button><button type="button" data-rail="rail-more" data-dir="1" aria-label="Próximos">${ic('i-chev-r')}</button></div></div><div class="rail" id="rail-more">${more.map(card).join('')}</div></section>`:''}
    </div>
    <div class="mbar"><div><b>${venda?brl(im.preco):brl(total(im))}</b><small>${venda?'Parcela a partir de '+brl(parcela)+'/mês':'por mês, com custos'}</small></div><button class="btn btn-primary" type="button" data-contact2>Entrar em contato</button></div>`;
    VC.mount('portal', html, {title:im.tit, mbar:true});
    const main=$('#main');
    main.addEventListener('click', e=>{
      const p=e.target.closest('[data-ph]'); if(p){ VC.lightbox(F, +p.dataset.ph, im.tit); return; }
      const g=e.target.closest('[data-goto]'); if(g){ document.getElementById(g.dataset.goto).scrollIntoView({behavior:'smooth'}); return; }
      const cr=e.target.closest('[data-crumb]'); if(cr){ setS({fin:im.fin, bairros:[im.bairro]}); return; }
      if(e.target.closest('#d-contact,[data-contact2]')) contatoModal(im);
      if(e.target.closest('#d-wa')) waModal(im);
      if(e.target.closest('#d-report')) reportModal(im);
      if(e.target.closest('#d-share')) VC.copy(location.href.split('#')[0]+'#imovel-'+im.id);
      const st=e.target.closest('.stars[data-rate] button'); if(st){ const box=st.parentElement, v=+st.dataset.v; box.dataset.rate=v; drawStars(box); VC.toast('Valeu! Sua nota foi registrada.'); }
    });
    $('#d-more').addEventListener('click', e=>{ const d=$('#d-desc'); const open=d.classList.toggle('clamp'); e.currentTarget.textContent=open?'Ler tudo':'Mostrar menos'; });
    $$('.stars[data-rate]').forEach(drawStars);
    const mp=$('#d-map'), ro=new ResizeObserver(()=>A.layoutPins(mp)); ro.observe(mp); VC.onCleanup(()=>ro.disconnect()); A.layoutPins(mp);
  }
  function drawStars(box){ const v=+box.dataset.rate; box.innerHTML=[1,2,3,4,5].map(i=>`<button type="button" data-v="${i}" class="${i<=v?'':'off'}" aria-label="${i} ${plural(i,'estrela','estrelas')}">${ic('i-star')}</button>`).join(''); }

  /* ===== SALVOS ===== */
  function salvos(){
    const favs=VC.store.get('favs',[]); const ims=D.imoveis.filter(i=>favs.includes('i'+i.id)), lx=D.lancamentos.filter(l=>favs.includes('l'+l.id));
    const html=`<div class="wrap"><div class="res-head"><div><h1>Seus salvos</h1><p>Fica guardado neste navegador.</p></div></div>
      ${!ims.length&&!lx.length?`<div class="empty">${A.vazia}<b>Nada salvo ainda.</b><p>Toque no coração de um anúncio para guardar aqui e comparar depois.</p><div class="row"><a class="btn btn-primary" href="#comprar">Ver imóveis</a></div></div>`:''}
      ${ims.length?`<div class="cards">${ims.map(card).join('')}</div>`:''}
      ${lx.length?`<div class="sec-h" style="margin-top:48px"><div><span class="eyebrow">Lançamentos</span><h2>Empreendimentos salvos</h2></div></div><div class="posters">${lx.map(VC.lxPoster).join('')}</div>`:''}</div>`;
    VC.mount('portal', html, {title:'Salvos'});
  }

  VC.route(/^(inicio|bairros|corretores)$/, home);
  VC.route(/^busca$/, busca);
  VC.route(/^comprar$/, ()=>{ setS({fin:'venda'}); history.replaceState(null,'','#busca'); busca(); });
  VC.route(/^alugar$/, ()=>{ setS({fin:'aluguel'}); history.replaceState(null,'','#busca'); busca(); });
  VC.route(/^imovel-(\d+)$/, imovel);
  VC.route(/^salvos$/, salvos);
  VC.portal = {setS, parse, filtra};
})();
