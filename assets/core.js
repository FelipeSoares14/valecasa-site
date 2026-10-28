/* ValeCasa · núcleo do protótipo: rotas por âncora, helpers, header/footer do portal, cards, favoritos, modais. */
window.VC = (function(){
  const D = window.VCData, A = window.VCArt;
  const $ = (s,el=document)=>el.querySelector(s), $$ = (s,el=document)=>[...el.querySelectorAll(s)];
  const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ic = (id, cls='') => `<svg class="i ${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const th = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const brl = v => 'R$ '+th(v);
  const brlK = v => v>=1e6 ? 'R$ '+(Math.round(v/1e4)/100).toString().replace('.',',')+' mi' : v>=1e4 ? 'R$ '+Math.round(v/1000)+' mil' : brl(v);
  const norm = s => String(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
  const plural = (k, um, varios) => k===1 ? um : varios;
  const store = {
    get(k,d){ try{ const v=localStorage.getItem('vc:'+k); return v?JSON.parse(v):d; }catch(e){ return d; } },
    set(k,v){ try{ localStorage.setItem('vc:'+k, JSON.stringify(v)); }catch(e){} }
  };

  /* ===== dados derivados ===== */
  const bairro = nm => D.bairros.find(b=>b.n===nm) || D.bairros[0];
  function distSeg(px,py,ax,ay,bx,by){ const dx=bx-ax, dy=by-ay, t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy))); return Math.hypot(px-(ax+t*dx), py-(ay+t*dy)); }
  function distDutra(x,y){ let m=1e9; for(let i=0;i<D.dutra.length-1;i++){ const [a,b]=[D.dutra[i],D.dutra[i+1]]; m=Math.min(m,distSeg(x,y,a[0],a[1],b[0],b[1])); } return m; }
  const KM = .028; // km por unidade do mapa ilustrativo
  function pos(im){ const b=bairro(im.bairro), r=A.R(im.id); return {x:b.x+(r()-.5)*44, y:b.y+(r()-.5)*30}; }
  D.imoveis.forEach(im=>{
    const p=pos(im); im.x=p.x; im.y=p.y;
    if(distDutra(p.x,p.y)*KM<1.3 && !im.tags.includes('dutra')) im.tags.push('dutra');
    if(Math.hypot(p.x-300,p.y-198)*KM<1.6 && !im.tags.includes('centro')) im.tags.push('centro');
  });
  const total = im => im.fin==='aluguel' ? im.preco+im.cond+im.iptu : im.preco;

  const TAGS = {quintal:'Com quintal', pet:'Aceita pet', mobiliado:'Mobiliado', piscina:'Piscina', eear:'Perto da EEAR', unesp:'Perto da FEG/UNESP', dutra:'Perto da Dutra', centro:'Perto do Centro', varanda:'Varanda', lazer:'Condomínio com lazer', condominio:'Em condomínio', vista:'Vista para a serra', baixou:'Baixou o preço', proprietario:'Direto com o proprietário'};
  const TIPOS = ['Casa','Apartamento','Sobrado','Kitnet','Terreno','Chácara','Comercial'];
  const COM = {
    'churrasqueira':'Churrasqueira','aquecimento-solar-de-agua':'Aquecimento solar','portao':['Portão eletrônico','vc-pulmao-veiculos'],'armario-embutido':'Armário embutido','piso-frio':'Piso frio','cerca':'Cerca elétrica',
    'elevador':'Elevador','portaria-24h':'Portaria 24h','academia':'Academia','piscina':'Piscina','salao-de-jogos':'Salão de jogos','varanda-gourmet':'Varanda gourmet','closet':'Closet','lavabo':'Lavabo',
    'vista-panoramica':'Vista panorâmica','sistema-de-alarme':'Sistema de alarme','forno-de-pizza':'Forno de pizza','arvores-frutiferas':'Árvores frutíferas','poco-artesiano':'Poço artesiano','caseiro':'Casa de caseiro',
    'quintal':'Quintal','espaco-gourmet':'Espaço gourmet','jardim':'Jardim','energia-solar':'Energia solar','interfone':'Interfone','acesso-asfaltado':'Acesso asfaltado','rua-tranquila':'Rua tranquila',
    'armario-de-cozinha':'Armário de cozinha','perto-de-escolas':'Perto de escolas','piscina-aquecida':'Piscina aquecida','adega':'Adega','automacao-residencial':'Automação residencial','playground':'Playground',
    'com-lojas-no-terreo':'Loja no térreo','divisorias':'Divisórias','ar-condicionado':'Ar-condicionado','lago':'Lago','galpao':'Galpão','mobiliado':'Mobiliado','cozinha-americana':'Cozinha americana','fogao':'Fogão',
    'freezer':'Geladeira','canil':'Canil','lavanderia':'Lavanderia','deposito-privativo':'Depósito privativo','de-esquina':'De esquina','brinquedoteca':'Brinquedoteca','coworking':'Coworking','bicicletario':'Bicicletário',
    'pet-place':['Pet place','vc-canil'],'sauna':'Sauna','hidromassagem':'Hidromassagem','coffee-shop':'Café','quadra-poliesportiva':'Quadra poliesportiva','pista-de-cooper':'Pista de caminhada','area-verde':'Área verde','vagas-determinadas':'Vagas demarcadas','piscina-infantil':'Piscina infantil','deck-molhado':'Deck molhado','mini-quadra':'Quadra recreativa','fitness-ao-ar-livre':'Academia ao ar livre'
  };
  const com = id => { const v=COM[id]; return Array.isArray(v) ? {n:v[0], i:v[1]} : {n:v||id, i:'vc-'+id}; };

  function fotos(im){
    const s=im.seed;
    if(im.tipo==='Terreno') return [['terreno',s,'Terreno'],['terreno',s+7,'Vista da rua'],['chacara',s+2,'Arredores']];
    if(im.tipo==='Comercial') return [['comercial',s,'Fachada'],['sala',s+3,'Salão'],['cozinha',s+5,'Copa'],['banheiro',s+4,'Banheiro']];
    if(im.tipo==='Kitnet') return [['quarto',s,'Quarto'],['cozinha',s+1,'Cozinha'],['banheiro',s+2,'Banheiro'],['apto',s+3,'Prédio']];
    if(im.cena==='sala') return [['sala',s,'Sala'],['quarto',s+1,'Quarto'],['cozinha',s+2,'Cozinha'],['banheiro',s+3,'Banheiro'],['apto',s+4,'Fachada']];
    const L=[[im.cena,s,'Fachada'],['sala',s+1,'Sala'],['cozinha',s+2,'Cozinha'],['quarto',s+3,'Quarto'],['banheiro',s+4,'Banheiro']];
    if(im.tags.includes('piscina')) L.splice(1,0,['piscina',s+5,'Piscina']);
    if(im.tipo==='Chácara') L.splice(1,0,['chacara',s+6,'Terreno']);
    if(im.q>=3) L.push(['quarto',s+8,'Quarto 2']);
    return L;
  }
  const scene = (t,s,o) => A.scene(t,s,o);

  /* ===== favoritos e vistos ===== */
  let favs = new Set(store.get('favs', ['i103','l1']));
  const isFav = k => favs.has(k);
  function toggleFav(k){ favs.has(k)?favs.delete(k):favs.add(k); store.set('favs',[...favs]); $$('[data-fav="'+k+'"]').forEach(b=>b.setAttribute('aria-pressed', favs.has(k))); $$('.saved .n').forEach(e=>{ e.textContent=favs.size; e.hidden=!favs.size; }); toast(favs.has(k)?'Salvo. Fica guardado em Salvos, no topo da página.':'Removido dos salvos.'); }
  const favBtn = (k, cls='icon-btn tr') => `<button class="${cls}" type="button" aria-label="Salvar" aria-pressed="${isFav(k)}" data-fav="${k}">${ic('i-heart')}</button>`;
  function addRecent(id){ const r=store.get('recent',[]).filter(x=>x!==id); r.unshift(id); store.set('recent', r.slice(0,8)); }

  /* ===== card de imóvel (DS) ===== */
  function breakdown(im){
    if(im.fin==='aluguel'){ const p=['Aluguel '+brl(im.preco)]; if(im.cond) p.push('Cond. '+brl(im.cond)); if(im.iptu) p.push('IPTU '+brl(im.iptu)); return p.length>1 ? p.join(' + ') : 'Sem condomínio e sem IPTU'; }
    const p=[]; if(im.cond) p.push('Cond. '+brl(im.cond)); if(im.iptu) p.push('IPTU '+brl(im.iptu)+'/ano'); return p.join(' · ') || 'Sem condomínio';
  }
  function specs(im){
    if(im.tipo==='Terreno') return `<div class="specs"><span>${ic('i-area')}${th(im.at)} m² de terreno</span></div>`;
    const o=[]; if(im.q) o.push(`<span title="Quartos">${ic('i-bed')}${im.q}</span>`); if(im.b) o.push(`<span title="Banheiros">${ic('i-bath')}${im.b}</span>`); if(im.v) o.push(`<span title="Vagas">${ic('i-car')}${im.v}</span>`); if(im.a) o.push(`<span title="Área">${ic('i-area')}${im.a}m²</span>`);
    return `<div class="specs">${o.join('')}</div>`;
  }
  function priceHTML(im){
    const drop = im.antes ? `<span class="drop">${ic('i-trend-down')}baixou ${brlK(im.antes-im.preco)}</span>` : '';
    return im.fin==='aluguel' ? `<span class="price">${brl(total(im))}<small>/total</small>${drop}</span>` : `<span class="price">${brl(im.preco)}${drop}</span>`;
  }
  function card(im){
    const f=fotos(im), badge = im.fin==='aluguel' ? '<span class="badge b-rent">Aluguel</span>' : '<span class="badge b-sale">Venda</span>';
    const extra = im.dias<=2 ? '<span class="badge b-new">Novo</span>' : '';
    const owner = im.an==='prop' ? '<span class="badge b-owner">Proprietário</span>' : '';
    return `<a class="card" href="#imovel-${im.id}" data-id="${im.id}">
      <div class="photo">${scene(f[0][0],f[0][1])}<span class="tl">${badge}${extra}</span>${favBtn('i'+im.id)}<span class="bl"><span class="badge b-photo">${ic('i-camera','i-12')} ${f.length}</span>${owner}</span></div>
      <span class="hood">${esc(im.bairro)}</span>
      ${priceHTML(im)}
      <span class="breakdown">${breakdown(im)}</span>
      <span class="title">${esc(im.tit)}</span>
      ${specs(im)}
    </a>`;
  }
  const pinPrice = im => im.fin==='aluguel' ? brl(total(im)) : brlK(im.preco);

  /* ===== rotas ===== */
  const routes=[]; let cleanups=[];
  function route(re, fn){ routes.push([re,fn]); }
  function go(h){ if(location.hash==='#'+h) render(); else location.hash=h; }
  function onCleanup(fn){ cleanups.push(fn); }
  function render(){
    cleanups.forEach(f=>{ try{f()}catch(e){} }); cleanups=[];
    closeModal(); closeDrawer();
    const h = decodeURIComponent(location.hash.slice(1)) || 'inicio';
    for(const [re,fn] of routes){ const m=h.match(re); if(m){ fn(m); return; } }
    routes[0][1]([h]);
  }
  function mount(area, html, o={}){
    document.body.dataset.area = area;
    document.body.classList.toggle('has-mbar', !!o.mbar);
    document.body.classList.toggle('has-actionbar', !!o.actionbar);
    const app=$('#app');
    app.innerHTML = (area==='lx' ? VC.lxHeader(o.nav) : header(o.nav)) + `<main id="main" class="view">${html}</main>` + (area==='lx' ? VC.lxFooter() : footer());
    document.title = o.title ? o.title+' · ValeCasa' : 'ValeCasa · Imóveis em Guaratinguetá';
    if(!o.keepScroll) window.scrollTo({top:0, behavior:'auto'});
    $$('.saved .n').forEach(e=>{ e.textContent=favs.size; e.hidden=!favs.size; });
  }

  /* ===== header e footer do portal ===== */
  const LOGO = `<svg viewBox="0 0 667 118"><use href="#logo-word"/></svg>`;
  function header(nav){
    const a = k => nav===k ? ' aria-current="page"' : '';
    return `<header class="hdr"><div class="wrap hdr-in">
      <a class="logo" href="#inicio" aria-label="ValeCasa, página inicial">${LOGO}</a>
      <form class="hdr-search" data-qs role="search"><label class="sr" for="hdr-q">Buscar imóveis</label>${ic('i-search')}<input id="hdr-q" name="q" placeholder="Digite um bairro ou o que procura" autocomplete="off"></form>
      <nav class="hdr-nav" aria-label="Principal">
        <a href="#comprar"${a('comprar')}>Comprar</a><a href="#alugar"${a('alugar')}>Alugar</a>
        <a href="#lancamentos">Lançamentos <span class="tag-lx">Novo</span></a>
        <a href="#bairros"${a('bairros')}>Bairros</a><a href="#corretores"${a('corretores')}>Corretores</a>
      </nav>
      <div class="hdr-acts">
        <a class="saved" href="#salvos" aria-label="Imóveis salvos">${ic('i-heart','i-20')}<span class="n">0</span></a>
        <button class="btn btn-primary btn-sm hide-sm" type="button" data-anunciar>Anunciar imóvel</button>
        <button class="btn btn-ghost btn-sm hide-sm" type="button" data-login>Entrar</button>
        <button class="menu-btn" type="button" aria-label="Abrir menu" data-drawer="portal">${ic('i-menu','i-24')}</button>
      </div></div></header>`;
  }
  function themeTg(){ const t=store.get('theme','system'); return `<div class="theme-tg" role="group" aria-label="Tema">${[['system','Sistema'],['light','Claro'],['dark','Escuro']].map(([k,l])=>`<button type="button" data-theme-set="${k}" aria-pressed="${t===k}">${l}</button>`).join('')}</div>`; }
  function footer(){
    return `<footer class="footer"><div class="wrap footer-in">
      <div><a class="logo" href="#inicio" aria-label="ValeCasa">${LOGO}</a><p class="tagline">O portal de imóveis de Guaratinguetá, direto ao ponto. Aqui o destaque é de quem faz o melhor anúncio.</p>
        <div class="social" aria-label="Redes sociais"><span>${ic('i-wa')}</span><span>${ic('i-ig')}</span><span>${ic('i-mail')}</span><span>${ic('i-phone')}</span></div></div>
      <div><h4>Procurar</h4><ul><li><a href="#comprar">Comprar</a></li><li><a href="#alugar">Alugar</a></li><li><a href="#lancamentos">Lançamentos</a></li><li><a href="#bairros">Bairros de Guará</a></li></ul></div>
      <div><h4>Anunciar</h4><ul><li><a href="#inicio" data-anunciar>Anunciar imóvel</a></li><li><a href="#corretores">Para corretores</a></li><li><a href="#lancamentos">Para construtoras</a></li><li><a href="#inicio" data-anunciar>Mídia kit</a></li></ul></div>
      <div><h4>ValeCasa</h4><ul><li><a href="#inicio">Quem somos</a></li><li><a href="#inicio">Ajuda</a></li><li><a href="#inicio">Fale conosco</a></li><li><a href="#inicio">Política de privacidade</a></li></ul></div>
      <small><span><b style="color:#fff;font-weight:600">O jeito certo de procurar imóveis.</b> · Protótipo com dados de exemplo · © 2026 ValeCasa</span>${themeTg()}</small>
    </div></footer>`;
  }

  /* ===== tema ===== */
  function applyTheme(t){ const r=document.documentElement; if(t==='system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme',t); }
  applyTheme(store.get('theme','system'));

  /* ===== modal, drawer, toast, lightbox ===== */
  let modalEl=null, lastFocus=null;
  function modal(html, o={}){
    closeModal(); lastFocus=document.activeElement;
    modalEl=document.createElement('div'); modalEl.className=o.lightbox?'':'modal-bg';
    modalEl.innerHTML = o.lightbox ? html : `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(o.label||'Janela')}">${html}</div>`;
    document.body.appendChild(modalEl);
    modalEl.addEventListener('click', e=>{ if(e.target===modalEl || e.target.closest('[data-close]')) closeModal(); });
    const f=modalEl.querySelector('input,textarea,select,button:not(.x-btn)'); if(f && !o.lightbox) setTimeout(()=>f.focus(),30);
    if(o.onMount) o.onMount(modalEl);
    return modalEl;
  }
  function closeModal(){ if(modalEl){ modalEl.remove(); modalEl=null; if(lastFocus && lastFocus.focus) try{lastFocus.focus({preventScroll:true})}catch(e){} } }
  const mh = (t, sub='') => `<div class="modal-h"><div><h2>${t}</h2>${sub?`<p>${sub}</p>`:''}</div><button class="x-btn" type="button" data-close aria-label="Fechar">${ic('i-x','i-20')}</button></div>`;
  const okState = (t, p) => `<div class="ok-state"><span class="blob">${ic('i-check-s')}</span><b>${t}</b><p>${p}</p><span class="proto">Protótipo: nada foi enviado de verdade.</span><button class="btn btn-outline btn-sm" type="button" data-close>Fechar</button></div>`;
  let drawerEl=null;
  function openDrawer(area){
    closeDrawer();
    const links = area==='lx'
      ? [['lancamentos','Lançamentos','i-building'],['lancamentos-busca','Todos os empreendimentos','i-grid'],['lancamentos-busca|planta','Na planta','i-doc'],['lancamentos-busca|obras','Em obras','i-crane'],['lancamentos-busca|pronto','Prontos pra morar','i-key'],['inicio','Voltar ao portal ValeCasa','i-arrow-l']]
      : [['inicio','Início','i-home'],['comprar','Comprar','i-key'],['alugar','Alugar','i-home-modern'],['lancamentos','Lançamentos','i-building'],['bairros','Bairros','i-map'],['corretores','Corretores','i-user'],['salvos','Salvos','i-heart']];
    drawerEl=document.createElement('div');
    drawerEl.innerHTML=`<div class="drawer-bg" data-dclose></div><nav class="drawer" aria-label="Menu"><button class="x-btn x" type="button" data-dclose aria-label="Fechar menu">${ic('i-x','i-20')}</button>${links.map(([h,l,i])=>{ const [r,f]=h.split('|'); return `<a href="#${r}" ${f?`data-lxfase="${f}"`:''}>${ic(i,'i-20')}${l}</a>`; }).join('')}${area==='lx'?'':`<button class="btn btn-primary" type="button" data-anunciar style="margin-top:12px">Anunciar imóvel</button>`}</nav>`;
    document.body.appendChild(drawerEl);
    drawerEl.addEventListener('click', e=>{ if(e.target.closest('[data-dclose]') || e.target.closest('a')) setTimeout(closeDrawer, 0); });
  }
  function closeDrawer(){ if(drawerEl){ drawerEl.remove(); drawerEl=null; } }
  let toastT;
  function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'), 2600); }
  function lightbox(list, i=0, title=''){
    let k=i;
    const draw = el => {
      el.querySelector('.lb-img').innerHTML = scene(list[k][0], list[k][1], list[k][3]);
      el.querySelector('.lb-count').textContent = `${k+1} de ${list.length} · ${list[k][2]}`;
      el.querySelectorAll('.lb-thumbs button').forEach((b,j)=>b.setAttribute('aria-current', j===k));
    };
    const el = modal(`<div class="lb" role="dialog" aria-modal="true" aria-label="Fotos">
      <div class="lb-top"><div><b>${esc(title)}</b><div class="lb-cap lb-count"></div></div><button class="x-btn" type="button" data-close aria-label="Fechar fotos">${ic('i-x','i-24')}</button></div>
      <div class="lb-stage"><button class="lb-arrow l" type="button" aria-label="Foto anterior" data-lb="-1">${ic('i-chev-l','i-24')}</button><div class="lb-img"></div><button class="lb-arrow r" type="button" aria-label="Próxima foto" data-lb="1">${ic('i-chev-r','i-24')}</button></div>
      <div class="lb-thumbs">${list.map((f,j)=>`<button type="button" data-lbi="${j}" aria-label="Foto ${j+1}: ${esc(f[2])}">${scene(f[0],f[1],f[3])}</button>`).join('')}</div></div>`, {lightbox:true});
    el.addEventListener('click', e=>{ const a=e.target.closest('[data-lb]'), t=e.target.closest('[data-lbi]'); if(a){ k=(k+ +a.dataset.lb+list.length)%list.length; draw(el); } if(t){ k=+t.dataset.lbi; draw(el); } });
    el._key = e=>{ if(e.key==='ArrowRight'){ k=(k+1)%list.length; draw(el); } if(e.key==='ArrowLeft'){ k=(k-1+list.length)%list.length; draw(el); } };
    draw(el); el.querySelector('.x-btn').focus();
  }

  /* ===== campo de telefone ===== */
  function maskTel(v){ const d=v.replace(/\D/g,'').slice(0,11); if(d.length<=2) return d.length?'('+d:''; if(d.length<=7) return `(${d.slice(0,2)}) ${d.slice(2)}`; return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`; }
  function telErro(v){ const d=v.replace(/\D/g,''); if(d.length===11) return ''; if(d.length===9||d.length===8) return 'Faltou o DDD. Digite os 11 números, como (12) 98123-4567.'; return 'Digite os 11 números do celular, como (12) 98123-4567.'; }
  function bindTel(root){ $$('input[data-tel]',root).forEach(i=>i.addEventListener('input',()=>{ i.value=maskTel(i.value); })); }
  function fieldErr(input, msg){ const h=input.parentElement.querySelector('.hint'); input.classList.toggle('err', !!msg); input.setAttribute('aria-invalid', !!msg); if(h){ h.textContent = msg || h.dataset.ok || ''; h.classList.toggle('err', !!msg); } return !!msg; }
  async function copy(text, el){ try{ await navigator.clipboard.writeText(text); toast('Copiado: '+text); }catch(e){ if(el){ const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r); } toast('Selecionei o texto. É só copiar.'); } }

  /* ===== modais compartilhados ===== */
  function anunciarModal(){
    modal(mh('Anunciar no ValeCasa','Aqui o destaque é de quem faz o melhor anúncio, não de quem paga mais.')+`<div class="modal-b">
      <p style="font-size:14px;color:var(--ink-2)">Anúncio com fotos boas, preço completo e descrição honesta aparece primeiro. Quem você é?</p>
      <div class="nums" role="group" aria-label="Tipo de anunciante" id="an-tipo">${['Proprietário','Corretor','Imobiliária','Construtora'].map((x,i)=>`<button type="button" aria-pressed="${i===0}">${x}</button>`).join('')}</div>
      <div class="field"><label for="an-nome">Seu nome</label><input class="input" id="an-nome" autocomplete="name"><span class="hint" data-ok="Como a gente vai te chamar"></span></div>
      <div class="field"><label for="an-tel">Celular com DDD</label><input class="input" id="an-tel" data-tel inputmode="tel" placeholder="(12) 98123-4567"><span class="hint" data-ok="A gente te chama no WhatsApp pra montar o anúncio"></span></div>
      <button class="btn btn-primary" type="button" id="an-go">Começar meu anúncio</button></div>`, {label:'Anunciar imóvel', onMount(el){
        bindTel(el);
        el.querySelector('#an-tipo').addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return; $$('button',e.currentTarget).forEach(x=>x.setAttribute('aria-pressed', x===b)); });
        el.querySelector('#an-go').addEventListener('click', ()=>{
          const nm=el.querySelector('#an-nome'), tl=el.querySelector('#an-tel');
          const e1=fieldErr(nm, nm.value.trim()?'':'Diz seu nome pra gente saber com quem fala.'), e2=fieldErr(tl, telErro(tl.value));
          if(e1||e2) return;
          el.querySelector('.modal').innerHTML = mh('Anunciar no ValeCasa')+`<div class="modal-b">${okState('Pronto, recebemos seu contato.','Alguém do time ValeCasa vai te chamar no WhatsApp para montar o anúncio com você.')}</div>`;
        });
      }});
  }

  /* ===== eventos globais ===== */
  document.addEventListener('click', e=>{
    const f=e.target.closest('[data-fav]'); if(f){ e.preventDefault(); e.stopPropagation(); toggleFav(f.dataset.fav); return; }
    if(e.target.closest('[data-anunciar]')){ e.preventDefault(); anunciarModal(); return; }
    if(e.target.closest('[data-login]')){ toast('O login não faz parte deste protótipo.'); return; }
    const dr=e.target.closest('[data-drawer]'); if(dr){ openDrawer(dr.dataset.drawer); return; }
    const t=e.target.closest('[data-theme-set]'); if(t){ const v=t.dataset.themeSet; store.set('theme',v); applyTheme(v); $$('[data-theme-set]').forEach(b=>b.setAttribute('aria-pressed', b.dataset.themeSet===v)); return; }
    const rn=e.target.closest('[data-rail]'); if(rn){ const r=document.getElementById(rn.dataset.rail); if(r) r.scrollBy({left:(+rn.dataset.dir)*r.clientWidth*.9, behavior:'smooth'}); return; }
    const lf=e.target.closest('[data-lxfase]'); if(lf && VC.lxSetFase){ VC.lxSetFase(lf.dataset.lxfase); }
  });
  document.addEventListener('submit', e=>{
    const f=e.target.closest('[data-qs]'); if(f){ e.preventDefault(); const q=f.querySelector('input').value.trim(); if(VC.searchText) VC.searchText(q); }
  });
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ if(modalEl) closeModal(); else closeDrawer(); }
    if(modalEl && modalEl._key) modalEl._key(e);
  });
  window.addEventListener('hashchange', render);

  return {D, A, $, $$, esc, ic, th, brl, brlK, norm, plural, store, bairro, distDutra, KM, total, TAGS, TIPOS, COM, com, fotos, scene, isFav, favBtn, addRecent, breakdown, specs, priceHTML, card, pinPrice,
    route, go, render, mount, onCleanup, header, footer, themeTg, LOGO, modal, closeModal, mh, okState, toast, lightbox, maskTel, telErro, bindTel, fieldErr, copy, anunciarModal,
    start(){ render(); }};
})();
