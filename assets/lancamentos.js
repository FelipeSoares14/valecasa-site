/* ValeCasa · área de Lançamentos: vitrine, busca com filtros laterais e página do empreendimento. */
(function(){
  const {D,A,$,$$,esc,ic,th,brl,brlK,norm,plural,com,scene} = VC;
  const FASE = {planta:'Na planta', obras:'Em obras', pronto:'Pronto pra morar'};
  const MES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const mes = ([y,m]) => `${MES[m-1]}/${y}`;
  const W = [15,30,20,15,20];
  const prog = l => Math.round(l.etapas.reduce((a,[,p],i)=>a+p*W[i],0)/100);
  const minP = l => Math.min(...l.tip.map(t=>t.p));
  const cons = l => D.construtoras[l.cons];
  const quartosTxt = l => l.tip.some(t=>t.studio) ? 'Studio e 1 quarto' : [...new Set(l.tip.map(t=>t.q))].join(' e ')+' quartos';
  const areas = l => { const a=l.tip.map(t=>t.a), mn=Math.min(...a), mx=Math.max(...a); return mn===mx ? mn+' m²' : `${mn} a ${mx} m²`; };
  const mesesAte = l => Math.max(0,(l.entrega[0]-2026)*12 + l.entrega[1]-10);
  const tipName = t => t.studio ? 'Studio' : t.duplex ? `Duplex de ${t.q} quartos` : t.casa ? `Casa de ${t.q} quartos` : `${t.q} ${plural(t.q,'quarto','quartos')}`;
  const tipSub = t => [t.s?`${t.s} ${plural(t.s,'suíte','suítes')}`:'', t.v?`${t.v} ${plural(t.v,'vaga','vagas')}`:'sem vaga'].filter(Boolean).join(' · ');
  const bLogo = (c, extra='') => `<span class="b-logo" style="background:${c.cor};${extra}">${c.sig}</span>`;
  const andarTxt = u => u.dup ? `${u.f}º e ${u.f+1}º andares` : `${u.f}º andar`;
  const byEntrega = (a,b) => (a.entrega[0]*12+a.entrega[1])-(b.entrega[0]*12+b.entrega[1]);
  const telCons = l => `(12) 31${String(30+l.id*3).padStart(2,'0')}-${4000+l.id*137}`;
  VC.lxFase = l => FASE[l.fase]; VC.lxMin = minP;

  /* ===== espelho de vendas ===== */
  const cacheEsp = {};
  function espelho(l, torre=0){
    const key=l.id+'-'+torre; if(cacheEsp[key]) return cacheEsp[key];
    const r=A.R(l.id*31+torre*7), sold = l.fase==='pronto'?.8 : l.fase==='obras'?.5 : .2, rows=[];
    if(l.casas){
      const Q='ABCDEF'; for(let q=0;q<6;q++){ const row=[]; for(let u=1;u<=8;u++){ const x=r(), st= x<sold ? 'sold' : x<sold+.03 ? 'res':'free', tip=l.tip[(u===1||u===8)?1:0]; row.push({n:Q[q]+u, f:Q[q], u, st, tip, p:tip.p+(u===1||u===8?18000:0)}); } rows.push(row); }
    } else if(l.pav){
      const P=l.pav, D2=P.duplex, st=(x,bias)=> x<bias ? 'sold' : x<bias+.07 ? 'res' : 'free';
      rows.push(D2.finais.map((ti,i)=>({n:D2.andar*100+i+1, f:D2.andar, u:i+1, dup:true, st:st(r(),sold*.7), tip:l.tip[ti], p:l.tip[ti].p})));
      for(let f=P.ate; f>=P.de; f--) rows.push(P.finais.map((ti,i)=>{ const tip=l.tip[ti], bias=sold*(1.25-(f-P.de)/(P.ate-P.de)*.5);
        return {n:f*100+i+1, f, u:i+1, st:st(r(),bias), tip, p:Math.round(tip.p*(1+.007*(f-P.de))/100)*100}; }));
    } else {
      for(let f=l.andares; f>=1; f--){ const row=[]; for(let u=1;u<=l.porAndar;u++){ const x=r(), bias=sold*(1.2-f/l.andares*.4), st = x<bias ? 'sold' : x<bias+.07 ? 'res':'free';
        const tip = l.tip.length>1 && (u===1||u===l.porAndar) ? l.tip[l.tip.length-1] : l.tip[0];
        row.push({n:f*100+u, f, u, st, tip, p:Math.round((tip.p*(1+.007*(f-1))+(u<=Math.ceil(l.porAndar/2)?4500:0))/100)*100}); } rows.push(row); }
    }
    return cacheEsp[key]=rows;
  }
  const torresN = l => l.casas ? 1 : l.torres;
  const disponiveis = l => { let n=0; for(let t=0;t<torresN(l);t++) espelho(l,t).forEach(r=>r.forEach(u=>{ if(u.st==='free') n++; })); return n; };
  const unidades = l => l.casas || (l.pav ? espelho(l).flat().length : l.torres*l.andares*l.porAndar);

  /* ===== header e footer da área ===== */
  VC.lxHeader = nav => `<header class="lx-hdr"><div class="lx-wrap lx-hdr-in">
    <a class="lx-brand" href="#lancamentos" aria-label="ValeCasa Lançamentos"><span class="logo">${VC.LOGO}</span><span class="sep"></span><b>Lançamentos</b></a>
    <nav class="lx-nav" aria-label="Lançamentos">${[['','Empreendimentos'],['planta','Na planta'],['obras','Em obras'],['pronto','Prontos']].map(([f,l])=>`<a href="#lancamentos-busca" data-lxfase="${f}" ${nav===('f:'+f)?'aria-current="page"':''}>${l}</a>`).join('')}<a href="#lancamentos" data-lxgo="lx-sim">Simular parcela</a></nav>
    <div class="lx-hdr-acts"><a class="lx-back" href="#inicio">${ic('i-arrow-l')}<span>Portal ValeCasa</span></a><a class="saved" href="#salvos" aria-label="Salvos">${ic('i-heart','i-20')}<span class="n">0</span></a><button class="menu-btn" type="button" data-drawer="lx" aria-label="Abrir menu">${ic('i-menu','i-24')}</button></div>
  </div></header>`;
  VC.lxFooter = () => `<footer class="lx-foot"><div class="lx-wrap lx-foot-in">
    <div><a class="logo" href="#inicio" aria-label="ValeCasa">${VC.LOGO}</a><p style="margin-top:14px;max-width:38ch">Lançamentos de Guaratinguetá com planta, tabela e obra à vista. Uma área do portal ValeCasa.</p></div>
    <div><h4>Empreendimentos</h4><ul>${[['planta','Na planta'],['obras','Em obras'],['pronto','Prontos pra morar'],['','Todos']].map(([f,l])=>`<li><a href="#lancamentos-busca" data-lxfase="${f}">${l}</a></li>`).join('')}</ul></div>
    <div><h4>Construtoras</h4><ul>${Object.entries(D.construtoras).map(([k,c])=>`<li><a href="#lancamentos-busca" data-lxcons="${k}">${esc(c.n)}</a></li>`).join('')}</ul></div>
    <div><h4>Portal</h4><ul><li><a href="#inicio">Página inicial</a></li><li><a href="#comprar">Comprar usado</a></li><li><a href="#alugar">Alugar</a></li><li><a href="#inicio" data-anunciar>Anunciar lançamento</a></li></ul></div>
    <small><span>O jeito certo de procurar imóveis. · Protótipo com dados de exemplo</span>${VC.themeTg()}</small>
  </div></footer>`;

  /* ===== cards ===== */
  const phPill = l => `<span class="ph-pill ${l.fase}"><i></i>${FASE[l.fase]}</span>`;
  const entregaTxt = l => l.fase==='pronto' ? 'Entregue em '+mes(l.entrega) : 'Entrega '+mes(l.entrega);
  VC.lxPoster = l => { const c=cons(l); return `<a class="poster" href="#lancamento-${l.id}">
    <div class="img">${scene(l.cena,l.seed,{torres:l.torres})}<span class="tl">${phPill(l)}</span>${VC.favBtn('l'+l.id)}<span class="dots"><i></i><i></i><i></i><i></i><i></i></span><span class="bl"><span class="ph-pill dk">${entregaTxt(l)}</span></span><span class="br" style="color:${c.cor}">${c.sig}</span></div>
    <span class="hood">${ic('i-pin','i-12')}${esc(l.bairro)} · Guaratinguetá</span><span class="name">${esc(l.nome)}</span>
    <div class="specs"><span>${ic('i-bed')}${quartosTxt(l)}</span><span>${ic('i-area')}${areas(l)}</span></div>
    <span class="from">A partir de <b>${brl(minP(l))}</b></span></a>`; };
  const typTable = l => `<table class="typ"><thead><tr><th>Planta</th><th>Área</th><th>A partir de</th></tr></thead><tbody>${l.tip.map(t=>`<tr><td><b>${tipName(t)}</b><br><span class="muted" style="font-size:12px">${tipSub(t)}</span></td><td>${t.a} m²</td><td><b>${brl(t.p)}</b></td></tr>`).join('')}</tbody></table>`;
  const progBar = l => { const p=prog(l); return `<div class="prog"><div class="top"><span>${l.fase==='planta'?'Obra ainda não começou':'Andamento da obra'}</span><b>${p}%</b></div><div class="bar"><i style="width:${p}%"></i></div></div>`; };
  function lrow(l){ const c=cons(l), d=disponiveis(l); return `<a class="lrow" href="#lancamento-${l.id}">
    <div class="img">${scene(l.cena,l.seed,{torres:l.torres})}<span class="tl">${phPill(l)}<span class="ph-pill">${entregaTxt(l)}</span></span><span class="br" style="background:${c.cor}">${c.sig}</span></div>
    <div class="body"><div class="top"><div><span class="by">${esc(c.n)}</span><h3>${esc(l.nome)}</h3><span class="hood">${ic('i-pin','i-12')}${esc(l.bairro)} · Guaratinguetá</span></div>${VC.favBtn('l'+l.id,'icon-btn plain')}</div>
      ${typTable(l)}${progBar(l)}
      <div class="foot"><div class="amen-list">${l.com.slice(0,3).map(x=>{ const k=com(x); return `<span>${ic(k.i)}${esc(k.n)}</span>`; }).join('')}<span style="color:var(--ink-3)">+${l.com.length-3}</span></div><span class="avail" style="color:var(--brand-text)"><i></i>${d} ${plural(d,'unidade disponível','unidades disponíveis')}</span></div>
    </div></a>`; }

  /* ===== console de busca ===== */
  const L0 = () => ({q:'', fases:[], bairros:[], qs:[], pmax:null, ate:null, com:[], cons:[], sort:'entrega', view:'lista'});
  let L = L0();
  VC.lxSearch = o => { L = Object.assign(L0(), {view:L.view}, o); VC.go('lancamentos-busca'); };
  VC.lxSetFase = f => { L = Object.assign(L0(), {view:L.view}); if(f) L.fases=[f]; if(location.hash==='#lancamentos-busca') setTimeout(VC.render,0); };
  document.addEventListener('click', e=>{
    const c=e.target.closest('[data-lxcons]'); if(c){ L=Object.assign(L0(),{view:L.view, cons:[c.dataset.lxcons]}); if(location.hash==='#lancamentos-busca') setTimeout(VC.render,0); }
    const g=e.target.closest('[data-lxgo]'); if(g){ pendingScroll=g.dataset.lxgo; if(location.hash==='#lancamentos'){ e.preventDefault(); const el=document.getElementById(pendingScroll); pendingScroll=null; if(el) el.scrollIntoView({behavior:'smooth'}); } }
  });
  let pendingScroll=null;
  const consoleHTML = p => `<form class="lx-console" id="${p}-con" role="search">
    <div class="lx-f"><label for="${p}-q">Onde ou qual</label><input id="${p}-q" placeholder="Bairro ou nome do empreendimento" value="${esc(L.q)}" autocomplete="off"></div>
    <div class="lx-f"><span class="lbl">Fase da obra</span><div class="lx-phase" role="group" aria-label="Fase da obra">${[['','Todas'],['planta','Na planta'],['obras','Em obras'],['pronto','Prontos']].map(([v,l])=>`<button type="button" data-cf="${v}" aria-pressed="${(L.fases.length===1?L.fases[0]:'')===v}">${l}</button>`).join('')}</div></div>
    <div class="lx-f"><label for="${p}-qt">Quartos</label><select id="${p}-qt"><option value="">Qualquer</option>${[['1','Studio ou 1'],['2','2 quartos'],['3','3 quartos'],['4','4 ou mais']].map(([v,l])=>`<option value="${v}" ${L.qs.length===1&&L.qs[0]===+v?'selected':''}>${l}</option>`).join('')}</select></div>
    <button class="lx-go" type="submit">${ic('i-search')} Buscar</button></form>`;
  function bindConsole(p, onGo){
    const f=$('#'+p+'-con'); let fase=L.fases.length===1?L.fases[0]:'';
    f.addEventListener('click', e=>{ const b=e.target.closest('[data-cf]'); if(b){ fase=b.dataset.cf; $$('[data-cf]',f).forEach(x=>x.setAttribute('aria-pressed', x===b)); } });
    f.addEventListener('submit', e=>{ e.preventDefault(); const q=$('#'+p+'-q').value.trim(), qt=$('#'+p+'-qt').value; onGo({q, fases:fase?[fase]:[], qs:qt?[+qt]:[]}); });
  }

  /* ===== simulador ===== */
  const pmt = (pv, aa=.115, n=360) => { const i=Math.pow(1+aa,1/12)-1; return pv*i/(1-Math.pow(1+i,-n)); };
  function simHTML(l, pre){
    const price = pre||(l?minP(l):412000), meses = l?mesesAte(l):24;
    return `<div class="sim" data-sim>
      <div class="sim-ctrl">
        ${l?'':`<div class="field"><label for="sim-l">Empreendimento</label><select class="input" id="sim-l"><option value="">Escolha um, ou ajuste à mão</option>${D.lancamentos.filter(x=>x.fase!=='pronto').map(x=>`<option value="${x.id}">${esc(x.nome)} · ${brlK(minP(x))}</option>`).join('')}</select></div>`}
        <div class="sl"><div class="top"><label for="sim-p">Valor do imóvel</label><output id="sim-po"></output></div><input class="rng" type="range" id="sim-p" min="150000" max="1600000" step="100" value="${price}"></div>
        <div class="sl"><div class="top"><label for="sim-s">Sinal na assinatura</label><output id="sim-so"></output></div><input class="rng" type="range" id="sim-s" min="5" max="30" step="1" value="10"><small>Pago à vista quando você assina o contrato.</small></div>
        <div class="sl"><div class="top"><label for="sim-o">Pago durante a obra</label><output id="sim-oo"></output></div><input class="rng" type="range" id="sim-o" min="0" max="30" step="1" value="${meses?20:0}"><small>Dividido em parcelas mensais até as chaves.</small></div>
        <div class="sl"><div class="top"><label for="sim-m">Meses até as chaves</label><output id="sim-mo"></output></div><input class="rng" type="range" id="sim-m" min="0" max="40" step="1" value="${meses}"></div>
      </div>
      <div class="sim-out" aria-live="polite">
        <div class="big"><span id="sim-bl">Parcela durante a obra</span><b id="sim-big"></b></div>
        <div class="stack" aria-hidden="true"><i class="s1"></i><i class="s2"></i><i class="s3"></i></div>
        <div class="sim-rows">
          <div><i style="background:var(--vc-sun-500)"></i><span>Sinal na assinatura<small id="sim-r1s"></small></span><b id="sim-r1"></b></div>
          <div><i style="background:var(--vc-green-500)"></i><span>Parcelas da obra<small id="sim-r2s"></small></span><b id="sim-r2"></b></div>
          <div><i style="background:var(--vc-purple-400)"></i><span>Financiamento na entrega<small id="sim-r3s"></small></span><b id="sim-r3"></b></div>
        </div>
        <p class="sim-note">Simulação ilustrativa. Durante a obra as parcelas são corrigidas pelo INCC; depois das chaves, pela taxa do banco (aqui, 11,5% ao ano em 30 anos).</p>
      </div></div>`;
  }
  function bindSim(root){
    const g=id=>$('#'+id,root), fill=i=>i.style.setProperty('--p', ((i.value-i.min)/(i.max-i.min)*100)+'%');
    const calc=()=>{
      const P=+g('sim-p').value, s=+g('sim-s').value, m=+g('sim-m').value; let o=+g('sim-o').value; if(!m) o=0;
      const sinal=P*s/100, obra=P*o/100, fin=P-sinal-obra, parc=m?obra/m:0;
      g('sim-po').textContent=brl(P); g('sim-so').textContent=`${s}% · ${brl(sinal)}`; g('sim-oo').textContent=m?`${o}% · ${brl(obra)}`:'Pronto: sem obra'; g('sim-mo').textContent=m?`${m} ${plural(m,'mês','meses')}`:'Já está pronto';
      g('sim-bl').textContent = m ? 'Parcela mensal durante a obra' : 'Parcela do banco depois das chaves';
      g('sim-big').innerHTML = m ? `${brl(parc)}<small> /mês</small>` : `${brl(pmt(fin))}<small> /mês</small>`;
      g('sim-r1').textContent=brl(sinal); g('sim-r1s').textContent=`${s}% do valor`;
      g('sim-r2').textContent=m?`${m} × ${brl(parc)}`:'—'; g('sim-r2s').textContent=m?`${o}% do valor, ${brl(obra)} no total`:'Imóvel pronto, sem parcelas de obra';
      g('sim-r3').textContent=brl(fin); g('sim-r3s').textContent=`Parcela do banco estimada em ${brl(pmt(fin))}/mês`;
      const st=$$('.stack i',root); st[0].style.width=s+'%'; st[1].style.width=o+'%'; st[2].style.width=(100-s-o)+'%';
      $$('.rng',root).forEach(fill);
    };
    $$('.rng',root).forEach(i=>i.addEventListener('input',calc));
    const sl=g('sim-l'); if(sl) sl.addEventListener('change',()=>{ const l=D.lancamentos.find(x=>x.id===+sl.value); if(!l) return; g('sim-p').value=minP(l); g('sim-m').value=mesesAte(l); g('sim-o').value=mesesAte(l)?20:0; calc(); });
    root._setPrice = (p,m)=>{ g('sim-p').value=p; if(m!=null) g('sim-m').value=m; calc(); };
    calc();
  }

  /* ===== modal de visita ===== */
  function visitaModal(l, unit){
    const c=cons(l), dias=[]; let d=new Date(D.hoje.getTime()+864e5);
    while(dias.length<6){ if(d.getDay()!==1) dias.push(new Date(d)); d=new Date(d.getTime()+864e5); }
    const SEM=['dom','seg','ter','qua','qui','sex','sáb'];
    let di=0, hi=null; const horas=['10:00','11:00','14:00','15:00','16:00','17:00'];
    const lugar = l.fase==='pronto' ? 'no condomínio' : 'no decorado';
    VC.modal(VC.mh(`Agendar visita ${lugar}`, `${esc(l.nome)} · ${esc(c.n)}${unit?` · unidade ${unit}`:''}`)+`<form class="modal-b" id="vs-form" novalidate>
      <div class="field"><span style="font-size:13px;font-weight:500">Dia</span><div class="slots" role="group" aria-label="Dia da visita">${dias.map((x,i)=>`<button type="button" data-d="${i}" aria-pressed="${i===0}">${SEM[x.getDay()]}<b>${x.getDate()}</b>${MES[x.getMonth()]}</button>`).join('')}</div></div>
      <div class="field"><span style="font-size:13px;font-weight:500">Horário</span><div class="times" role="group" aria-label="Horário">${horas.map((h,i)=>`<button type="button" data-h="${i}" aria-pressed="false">${h}</button>`).join('')}</div><span class="hint" id="vs-hh"></span></div>
      <div class="field"><label for="vs-nome">Nome</label><input class="input" id="vs-nome" autocomplete="name"><span class="hint" data-ok=""></span></div>
      <div class="field"><label for="vs-tel">Celular com DDD</label><input class="input" id="vs-tel" data-tel inputmode="tel" placeholder="(12) 98123-4567"><span class="hint" data-ok="A construtora confirma pelo WhatsApp"></span></div>
      <button class="btn btn-primary" type="submit">Agendar visita</button></form>`, {label:'Agendar visita', onMount(el){
        VC.bindTel(el);
        el.addEventListener('click', e=>{ const b=e.target.closest('[data-d]'); if(b){ di=+b.dataset.d; $$('[data-d]',el).forEach(x=>x.setAttribute('aria-pressed',x===b)); } const h=e.target.closest('[data-h]'); if(h){ hi=+h.dataset.h; $$('[data-h]',el).forEach(x=>x.setAttribute('aria-pressed',x===h)); $('#vs-hh',el).textContent=''; } });
        $('#vs-form',el).addEventListener('submit', e=>{ e.preventDefault(); const nm=$('#vs-nome',el), tl=$('#vs-tel',el);
          const hh=$('#vs-hh',el); hh.textContent = hi==null ? 'Escolhe um horário.' : ''; hh.classList.toggle('err', hi==null);
          const e1=VC.fieldErr(nm, nm.value.trim()?'':'Diz seu nome pra construtora saber quem vai.'), e2=VC.fieldErr(tl, VC.telErro(tl.value)); if(e1||e2||hi==null) return;
          const x=dias[di]; el.querySelector('.modal').innerHTML=VC.mh(`Agendar visita ${lugar}`)+`<div class="modal-b">${VC.okState('Visita pedida.', `A ${esc(c.n)} vai confirmar sua visita de ${['domingo','segunda','terça','quarta','quinta','sexta','sábado'][x.getDay()]}, ${x.getDate()}/${MES[x.getMonth()]} às ${horas[hi]} pelo WhatsApp.`)}</div>`; });
      }});
  }
  function waModal(l){
    const c=cons(l), t=telCons(l);
    VC.modal(VC.mh('Falar com a construtora', esc(c.n))+`<div class="modal-b"><p style="font-size:14px;color:var(--ink-2)">Plantão de vendas do ${esc(l.nome)}, de terça a domingo, das 9h às 18h.</p><div class="copyline"><span id="lw-n">${t}</span><button class="btn btn-outline btn-sm" type="button" id="lw-c">Copiar</button></div><span class="proto" style="align-self:flex-start">Número de exemplo deste protótipo.</span></div>`, {label:'Contato', onMount(el){ $('#lw-c',el).addEventListener('click',()=>VC.copy(t,$('#lw-n',el))); }});
  }

  /* ===== HOME DE LANÇAMENTOS ===== */
  function lxHome(){
    const ls=D.lancamentos, feat=ls.find(l=>l.destaque)||ls[0], fc=cons(feat);
    const cnt=f=>ls.filter(l=>l.fase===f).length, ent27=ls.filter(l=>l.entrega[0]===2027).length;
    const amenCount={}; ls.forEach(l=>l.com.forEach(x=>amenCount[x]=(amenCount[x]||0)+1));
    const topAmen=Object.entries(amenCount).sort((a,b)=>b[1]-a[1]).slice(0,10);
    const sorted=[...ls].sort(byEntrega);
    const pctX = l => (((l.entrega[0]-2026)*12+l.entrega[1]-1)/48*100);
    const html = `
    <section class="lx-dark lx-hero"><div class="lx-wrap lx-hero-in">
      <div><span class="lx-k">Lançamentos em Guaratinguetá</span><h1>Imóvel novo, <em>direto de quem constrói.</em></h1>
        <p class="lead">Planta, tabela de preço e andamento da obra no mesmo lugar. Escolha a unidade no espelho de vendas e simule a parcela antes de falar com alguém.</p>${consoleHTML('h')}</div>
      <div class="lx-art"><img src="img/loja-lancamentos.png" alt="Ilustração da loja de Lançamentos ValeCasa, com um casal saindo com a chave no carrinho">
        <div class="lx-float f1"><b>Decorado aberto</b>Village Tulipa</div><div class="lx-float f2"><b>${prog(ls[2])}% da obra</b>Residencial Califórnia</div><div class="lx-float f3"><b>Pré-lançamento</b>Mirante da Serra</div></div>
    </div>
    <div class="lx-wrap"><div class="lx-stats"><div><b>${ls.length}</b><span>empreendimentos à venda</span></div><div><b>${Object.keys(D.construtoras).length}</b><span>construtoras de Guará e região</span></div><div><b>${brlK(Math.min(...ls.map(minP)))}</b><span>menor preço de tabela</span></div><div><b>${ent27}</b><span>entregas previstas para 2027</span></div></div></div></section>

    <section class="lx-dark lx-sec" style="padding-top:clamp(40px,5vw,64px)"><div class="lx-wrap">
      <div class="lx-sec-h"><div><span class="lx-k">Fase da obra</span><h2 class="lx-h2">Cada fase tem <em>uma vantagem.</em></h2></div><p>Quanto mais cedo você compra, menor o preço. Quanto mais perto da entrega, menos tempo de espera.</p></div>
      <div class="phases">${[['planta','Menor preço de tabela e parcelas que cabem no lugar do aluguel. A entrega leva de 2 a 3 anos.',6],['obras','Dá pra visitar o decorado e acompanhar a obra mês a mês. A entrega já está mais perto.',58],['pronto','Chave na mão em poucas semanas, com financiamento direto pelo banco.',100]].map(([f,p,m])=>`<a class="phase" href="#lancamentos-busca" data-lxfase="${f}"><span class="n">${cnt(f)}</span><h3>${FASE[f]}</h3><p>${p}</p><span class="meter"><i style="width:${m}%"></i></span><span class="go">Ver ${FASE[f].toLowerCase()} ${ic('i-arrow')}</span></a>`).join('')}</div>
    </div></section>

    <section class="lx-paper lx-sec"><div class="lx-wrap">
      <div class="lx-sec-h"><div><span class="lx-k">Destaque do mês</span><h2 class="lx-h2">Decorado aberto <em>na Vila Paraíba</em></h2></div><a class="lx-more" href="#lancamento-${feat.id}">Ver o empreendimento ${ic('i-arrow')}</a></div>
      <a class="feature" href="#lancamento-${feat.id}"><div class="img">${scene(feat.cena,feat.seed,{torres:feat.torres, day:false})}<span class="tl">${phPill(feat)}<span class="ph-pill">${entregaTxt(feat)}</span></span></div>
        <div class="body"><div style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--ink-3)">${bLogo(fc,'width:36px;height:36px;font-size:11px')}${esc(fc.n)}</div><h3>${esc(feat.nome)}</h3><span class="hood">${ic('i-pin','i-12')}${esc(feat.bairro)} · Guaratinguetá</span><p>${esc(feat.txt[0])}</p>${typTable(feat)}${progBar(feat)}<div class="price-from">A partir de <b>${brl(minP(feat))}</b></div><span class="btn btn-primary" style="align-self:flex-start">Ver plantas e unidades ${ic('i-arrow')}</span></div></a>
    </div></section>

    <section class="lx-paper lx-sec" style="padding-top:0"><div class="lx-wrap">
      <div class="lx-sec-h"><div><span class="lx-k">Todos</span><h2 class="lx-h2">${ls.length} empreendimentos <em>em Guará</em></h2></div><div class="qf" role="group" aria-label="Filtrar por fase">${[['','Todos'],['planta','Na planta'],['obras','Em obras'],['pronto','Prontos']].map(([v,l],i)=>`<button type="button" data-qf="${v}" aria-pressed="${i===0}">${l}</button>`).join('')}</div></div>
      <div class="posters" id="lx-grid"></div>
    </div></section>

    <section class="lx-dark lx-sec"><div class="lx-wrap">
      <div class="lx-sec-h"><div><span class="lx-k">Linha do tempo</span><h2 class="lx-h2">Quando cada um <em>fica pronto</em></h2></div><p>Planeje a mudança pela data de entrega das chaves. Toque no nome para abrir o empreendimento.</p></div>
      <div class="tl-wrap"><div class="tline">
        <div class="axis"></div>${[0,1,2,3].map(i=>`<div class="yr" style="left:${i*25}%"></div>`).join('')}
        <div class="today" style="left:${(9/48*100).toFixed(2)}%"><span>Hoje · out/2026</span></div>
        ${sorted.map((l,i)=>{ const up=i%2===1, lvl=Math.floor(i/2)%2, stem=lvl?84:26, past=l.fase==='pronto'; return `<a class="tl-m ${up?'up':''} ${past?'past':''}" href="#lancamento-${l.id}" style="left:${pctX(l).toFixed(2)}%;${up?'bottom:143px':'top:143px'}"><span class="dot"></span><span class="stem" style="height:${stem}px"></span><b>${esc(l.nome)}</b><small>${past?'Entregue em ':'Entrega '}${mes(l.entrega)}</small></a>`; }).join('')}
      </div><div class="tl-years">${[2026,2027,2028,2029].map((y,i)=>`<span style="left:${i*25}%">${y}</span>`).join('')}</div></div>
    </div></section>

    <section class="lx-paper lx-sec" id="lx-sim"><div class="lx-wrap">
      <div class="lx-sec-h"><div><span class="lx-k">Simulador</span><h2 class="lx-h2">Quanto fica a parcela <em>na planta?</em></h2></div><p>Na compra na planta você paga um sinal, parcelas mensais durante a obra e financia o resto quando recebe as chaves.</p></div>
      ${simHTML(null)}
    </div></section>

    <section class="lx-dark lx-sec"><div class="lx-wrap">
      <div class="lx-sec-h"><div><span class="lx-k">Comodidades</span><h2 class="lx-h2">O lazer que <em>mais aparece</em></h2></div><p>Toque numa comodidade para ver os empreendimentos que têm.</p></div>
      <div class="launch" style="background:var(--lx-ground-2)"><div class="amen">${topAmen.map(([x,n])=>{ const k=com(x); return `<a href="#lancamentos-busca" data-lxcom="${x}">${ic(k.i)}<span>${esc(k.n)}<br><small>${n} ${plural(n,'empreendimento','empreendimentos')}</small></span></a>`; }).join('')}</div></div>
    </div></section>

    <section class="lx-paper lx-sec"><div class="lx-wrap">
      <div class="lx-sec-h"><div><span class="lx-k">Construtoras</span><h2 class="lx-h2">Quem está <em>construindo em Guará</em></h2></div></div>
      <div class="builders">${Object.entries(D.construtoras).map(([k,c])=>{ const n=ls.filter(l=>l.cons===k).length; return `<a class="builder" href="#lancamentos-busca" data-lxcons="${k}">${bLogo(c)}<b>${esc(c.n)}</b><small>Desde ${c.desde} · ${n} ${plural(n,'lançamento','lançamentos')}</small></a>`; }).join('')}</div>
    </div></section>

    <section class="lx-dark lx-sec"><div class="lx-wrap">
      <div class="lx-sec-h"><div><span class="lx-k">Sem susto</span><h2 class="lx-h2">Comprar na planta, <em>passo a passo</em></h2></div></div>
      <div class="lx-steps">${[['Escolha a unidade','No espelho de vendas você vê o que está livre, andar por andar, com o preço de tabela.'],['Assine e pague o sinal','A proposta vira contrato com a construtora. O sinal costuma ficar entre 5% e 10%.'],['Parcelas durante a obra','Mensais, corrigidas pelo INCC. Dá pra acompanhar a obra por aqui.'],['Financie e pegue as chaves','Na entrega, o saldo vai para o banco e você muda. Dá pra usar o FGTS.']].map(([t,p],i)=>`<div class="lx-step"><span class="num">${String(i+1).padStart(2,'0')}</span><span class="line"></span><b>${t}</b><p>${p}</p></div>`).join('')}</div>
    </div></section>`;
    VC.mount('lx', html, {title:'Lançamentos'});
    bindConsole('h', o=>VC.lxSearch(o));
    let qf='';
    const drawGrid=()=>{ $('#lx-grid').innerHTML=ls.filter(l=>!qf||l.fase===qf).map(VC.lxPoster).join(''); };
    $$('[data-qf]').forEach(b=>b.addEventListener('click',()=>{ qf=b.dataset.qf; $$('[data-qf]').forEach(x=>x.setAttribute('aria-pressed',x===b)); drawGrid(); }));
    drawGrid();
    $('#main').addEventListener('click', e=>{ const a=e.target.closest('[data-lxcom]'); if(a){ L=Object.assign(L0(),{view:L.view, com:[a.dataset.lxcom]}); } });
    bindSim($('#lx-sim [data-sim]'));
    if(pendingScroll){ const id=pendingScroll; pendingScroll=null; setTimeout(()=>{ const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:'smooth'}); },60); }
  }

  /* ===== BUSCA DE LANÇAMENTOS ===== */
  function lfiltra(){
    let r=D.lancamentos.slice();
    if(L.q){ const w=norm(L.q).split(/\s+/).filter(x=>x.length>1); r=r.filter(l=>{ const h=norm([l.nome,l.bairro,cons(l).n].join(' ')); return w.every(x=>h.includes(x)); }); }
    if(L.fases.length) r=r.filter(l=>L.fases.includes(l.fase));
    if(L.bairros.length) r=r.filter(l=>L.bairros.includes(l.bairro));
    if(L.qs.length) r=r.filter(l=>l.tip.some(t=>L.qs.some(q=> q>=4 ? t.q>=4 : q===1 ? t.q<=1 : t.q===q)));
    if(L.pmax) r=r.filter(l=>minP(l)<=L.pmax);
    if(L.ate) r=r.filter(l=>l.entrega[0]<=L.ate);
    if(L.com.length) r=r.filter(l=>L.com.every(x=>l.com.includes(x)));
    if(L.cons.length) r=r.filter(l=>L.cons.includes(l.cons));
    const by={entrega:byEntrega, preco:(a,b)=>minP(a)-minP(b), 'preco-desc':(a,b)=>minP(b)-minP(a), obra:(a,b)=>prog(b)-prog(a)};
    return r.sort(by[L.sort]||byEntrega);
  }
  function lxBusca(){
    const allCom={}; D.lancamentos.forEach(l=>l.com.forEach(x=>allCom[x]=(allCom[x]||0)+1));
    const comList=Object.entries(allCom).sort((a,b)=>b[1]-a[1]).slice(0,9).map(x=>x[0]);
    const bairros=[...new Set(D.lancamentos.map(l=>l.bairro))].sort((a,b)=>a.localeCompare(b,'pt'));
    const html = `
    <section class="lx-dark"><div class="lx-wrap lxs-head"><span class="lx-k">Empreendimentos</span><h1 id="lx-title"></h1><p id="lx-sub"></p>${consoleHTML('s')}</div></section>
    <div class="lx-paper"><div class="lx-wrap lxs">
      <aside class="lx-side" id="lx-side" aria-label="Filtros">
        <div class="grp"><h4>Fase da obra</h4><div class="tog">${Object.entries(FASE).map(([k,l])=>`<button type="button" data-lf="fases" data-v="${k}">${l}</button>`).join('')}</div></div>
        <div class="grp"><h4>Quartos</h4><div class="tog">${[[1,'Studio/1'],[2,'2'],[3,'3'],[4,'4+']].map(([v,l])=>`<button type="button" data-lf="qs" data-v="${v}">${l}</button>`).join('')}</div></div>
        <div class="grp"><h4><label for="lf-p">Preço até</label><output id="lf-po"></output></h4><input class="rng" type="range" id="lf-p" min="150000" max="1600000" step="10000"></div>
        <div class="grp"><h4>Entrega até</h4><div class="tog">${[2026,2027,2028,2029].map(y=>`<button type="button" data-lf="ate" data-v="${y}">${y}</button>`).join('')}</div></div>
        <div class="grp"><h4>Bairro</h4><div class="checks">${bairros.map(b=>`<label class="check"><input type="checkbox" data-lb value="${esc(b)}">${esc(b)}</label>`).join('')}</div></div>
        <div class="grp"><h4>Comodidades</h4><div class="amen-tog">${comList.map(x=>{ const k=com(x); return `<button type="button" data-lf="com" data-v="${x}">${ic(k.i)}${esc(k.n)}</button>`; }).join('')}</div></div>
        <div class="grp"><h4>Construtora</h4><div class="checks">${Object.entries(D.construtoras).map(([k,c])=>`<label class="check"><input type="checkbox" data-lc value="${k}">${esc(c.n)}</label>`).join('')}</div></div>
        <div class="grp"><button class="btn btn-outline btn-sm" type="button" id="lf-clear">Limpar filtros</button></div>
      </aside>
      <div style="min-width:0">
        <div class="lxs-bar"><b id="lx-count"></b><div class="r"><button class="btn btn-outline btn-sm lx-filter-btn" type="button" id="lx-fbtn" aria-expanded="false">${ic('i-adjust')} Filtros</button>
          <label class="sr" for="lx-sort">Ordenar</label><select class="sel" id="lx-sort">${[['entrega','Entrega mais próxima'],['preco','Menor preço'],['preco-desc','Maior preço'],['obra','Obra mais adiantada']].map(([v,l])=>`<option value="${v}" ${L.sort===v?'selected':''}>${l}</option>`).join('')}</select>
          <div class="vt" role="group" aria-label="Visualização"><button type="button" data-view="lista" aria-pressed="${L.view==='lista'}">${ic('i-list')} Lista</button><button type="button" data-view="grade" aria-pressed="${L.view==='grade'}">${ic('i-grid')} Grade</button></div></div></div>
        <div id="lx-res"></div>
      </div>
    </div></div>`;
    VC.mount('lx', html, {title:'Empreendimentos', nav:'f:'+(L.fases.length===1?L.fases[0]:'')});
    bindConsole('s', o=>{ Object.assign(L,o); syncSide(); draw(); });
    const side=$('#lx-side'), pr=$('#lf-p');
    const syncSide=()=>{
      $$('[data-lf]',side).forEach(b=>{ const k=b.dataset.lf, v=k==='com'||k==='fases'?b.dataset.v:+b.dataset.v; b.setAttribute('aria-pressed', k==='ate' ? L.ate===v : L[k].includes(v)); });
      $$('[data-lb]',side).forEach(i=>i.checked=L.bairros.includes(i.value)); $$('[data-lc]',side).forEach(i=>i.checked=L.cons.includes(i.value));
      pr.value=L.pmax||1600000; pr.style.setProperty('--p', ((pr.value-pr.min)/(pr.max-pr.min)*100)+'%'); $('#lf-po').textContent=L.pmax?brlK(L.pmax):'Qualquer';
    };
    side.addEventListener('click', e=>{ const b=e.target.closest('[data-lf]'); if(!b) return; const k=b.dataset.lf, v=k==='com'||k==='fases'?b.dataset.v:+b.dataset.v;
      if(k==='ate') L.ate = L.ate===v?null:v; else L[k] = L[k].includes(v) ? L[k].filter(x=>x!==v) : [...L[k], v]; syncSide(); draw(); });
    side.addEventListener('change', e=>{ const i=e.target; if(i.matches('[data-lb]')) L.bairros=$$('[data-lb]:checked',side).map(x=>x.value); if(i.matches('[data-lc]')) L.cons=$$('[data-lc]:checked',side).map(x=>x.value); draw(); });
    pr.addEventListener('input', ()=>{ L.pmax = +pr.value>=1600000 ? null : +pr.value; syncSide(); draw(); });
    $('#lf-clear').addEventListener('click', ()=>{ L=Object.assign(L0(),{view:L.view, sort:L.sort}); $('#s-q').value=''; syncSide(); draw(); });
    $('#lx-sort').addEventListener('change', e=>{ L.sort=e.target.value; draw(); });
    $$('[data-view]').forEach(b=>b.addEventListener('click',()=>{ L.view=b.dataset.view; $$('[data-view]').forEach(x=>x.setAttribute('aria-pressed',x===b)); draw(); }));
    $('#lx-fbtn').addEventListener('click', e=>{ const o=side.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded',o); });
    $('#lx-res').addEventListener('click', e=>{ if(e.target.closest('[data-lclear]')){ $('#lf-clear').click(); } });
    syncSide(); draw();
    function draw(){
      const r=lfiltra(), n=r.length, nf=L.fases.length+L.bairros.length+L.qs.length+L.com.length+L.cons.length+(L.pmax?1:0)+(L.ate?1:0)+(L.q?1:0);
      $('#lx-title').textContent = n ? `${n} ${plural(n,'lançamento','lançamentos')} ${L.fases.length===1?FASE[L.fases[0]].toLowerCase()+' ':''}em Guará` : 'Nenhum lançamento com esses filtros';
      $('#lx-sub').textContent = n ? `Preço de tabela de ${brlK(Math.min(...r.map(minP)))} a ${brlK(Math.max(...r.map(minP)))}. Entregas de ${mes(r.slice().sort(byEntrega)[0].entrega)} a ${mes(r.slice().sort(byEntrega)[n-1].entrega)}.` : 'Tira um filtro ou volte para todos os empreendimentos.';
      $('#lx-count').textContent = `${n} ${plural(n,'resultado','resultados')}${nf?` · ${nf} ${plural(nf,'filtro','filtros')}`:''}`;
      $('#lx-fbtn').innerHTML = `${ic('i-adjust')} Filtros${nf?` (${nf})`:''}`;
      $('#lx-res').innerHTML = !n ? `<div class="lx-empty">${A.vazia}<b>Nada com esses filtros.</b><p>Tira o filtro de preço ou de entrega. Lançamento novo entra quase todo mês.</p><button class="btn btn-primary" type="button" data-lclear>Ver todos os lançamentos</button></div>`
        : L.view==='grade' ? `<div class="posters" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${r.map(VC.lxPoster).join('')}</div>` : `<div class="rows">${r.map(lrow).join('')}</div>`;
    }
  }

  /* ===== PÁGINA DO LANÇAMENTO ===== */
  const SECS=[['d-visao','Visão geral'],['d-plantas','Plantas'],['d-unidades','Unidades'],['d-lazer','Lazer'],['d-obra','Obra'],['d-local','Localização'],['d-pagamento','Pagamento'],['d-construtora','Construtora']];
  function lxDetalhe(m){
    const l=D.lancamentos.find(x=>x.id===+m[1]); if(!l){ VC.go('lancamentos'); return; }
    const c=cons(l), p=prog(l), disp=disponiveis(l), meses=mesesAte(l), b=VC.bairro(l.bairro);
    const gal=[[l.cena,l.seed,'Fachada',{torres:l.torres,day:false}],[l.cena,l.seed,'Fachada de dia',{torres:l.torres,day:true}],['piscina',l.seed+3,'Lazer'],['sala',l.seed+4,(l.fase==='pronto'?'Sala':'Decorado: sala')],['cozinha',l.seed+5,(l.fase==='pronto'?'Cozinha':'Decorado: cozinha')],['quarto',l.seed+6,(l.fase==='pronto'?'Suíte':'Decorado: suíte')]];
    const obraF = l.fase==='obras' ? [['obra',l.seed+11,'Obra em ago/2026',{}],['obra',l.seed+12,'Obra em set/2026',{}],['obra',l.seed+13,'Obra em out/2026',{}]] : [];
    obraF.forEach((f,i)=>f[3]=Math.max(5,p-12+i*6));
    const marcos=[['Lançamento',mes(l.lanc),true],['Início das obras',mes([l.lanc[0]+(l.lanc[1]+4>12?1:0),((l.lanc[1]+3)%12)+1]),l.fase!=='planta'||p>0],['Estrutura concluída',l.etapas[1][1]===100?'Concluída':'Em andamento',l.etapas[1][1]===100],['Entrega das chaves',mes(l.entrega),l.fase==='pronto']];
    const dists=[{n:'Centro', sub:'Praça e comércio', x:300,y:198}].concat(D.pois.filter(x=>['buriti','eear','feg','santacasa'].includes(x.id))).map(x=>({...x, km:Math.max(.3,Math.hypot(x.x-b.x,x.y-b.y)*VC.KM)})).concat([{n:'Via Dutra', sub:'Acesso mais próximo', km:Math.max(.3,VC.distDutra(b.x,b.y)*VC.KM)}]).sort((a,b)=>a.km-b.km);
    const casa=!!l.casas;
    const html = `
    <section class="dhero">${scene(l.cena,l.seed,{torres:l.torres,day:false})}<div class="lx-wrap dhero-in">
      <nav class="crumbs" aria-label="Você está em"><a href="#lancamentos">Lançamentos</a>›<a href="#lancamentos-busca" data-lxb="${esc(l.bairro)}">${esc(l.bairro)}</a>›<span>${esc(l.nome)}</span></nav>
      <div class="tags">${phPill(l)}<span class="ph-pill dk">${entregaTxt(l)}</span>${l.fase!=='planta'?'<span class="ph-pill dk">Decorado aberto</span>':'<span class="ph-pill dk">Tabela de pré-lançamento</span>'}</div>
      <div class="by">${bLogo(c)}<span>${esc(c.n)}<br><span style="font-size:12px;color:var(--lx-ink-3)">Construindo desde ${c.desde}</span></span></div>
      <h1>${esc(l.nome)}</h1>
      <div class="row"><span class="hood">${ic('i-pin')}${esc(l.bairro)} · Guaratinguetá</span><div class="pf">A partir de<b>${brl(minP(l))}</b></div>
        <div class="ctas"><button class="btn btn-primary btn-lg" type="button" data-visita>Agendar visita${l.fase==='pronto'?'':' ao decorado'}</button><button class="btn btn-outline btn-lg btn-lx-ghost" type="button" data-goto="d-plantas">Ver plantas</button>${VC.favBtn('l'+l.id,'icon-btn')}</div></div>
    </div>
    <div class="lx-wrap"><div class="facts">
      <div><span>Plantas</span><b>${quartosTxt(l)}</b></div><div><span>Área</span><b>${areas(l)}</b></div><div><span>${casa?'Casas':'Torres'}</span><b>${casa?l.casas:l.torres}</b></div><div><span>${casa?'Pavimentos':'Andares'}</span><b>${l.andares}</b></div><div><span>Disponíveis</span><b>${disp} de ${unidades(l)}</b></div><div><span>Entrega</span><b>${mes(l.entrega)}</b></div>
    </div></div></section>
    <nav class="subnav" aria-label="Seções do empreendimento"><div class="lx-wrap subnav-in">${SECS.map(([id,t],i)=>`<a href="#lancamento-${l.id}" data-sec="${id}" class="${i===0?'on':''}">${t}</a>`).join('')}</div></nav>

    <section class="lx-paper dsec" id="d-visao"><div class="lx-wrap">
      <div class="ov"><div class="txt"><span class="lx-k">Visão geral</span>${l.txt.map(t=>`<p>${esc(t)}</p>`).join('')}<p>${esc(b.vibe)}</p></div>
        <ul class="why">${l.why.map(([i,t,s])=>`<li>${ic(i)}<div><b>${esc(t)}</b><span>${esc(s)}</span></div></li>`).join('')}</ul></div>
      <div class="strip" aria-label="Fotos ilustrativas">${gal.map((g,i)=>`<button type="button" data-gal="${i}" aria-label="Abrir imagem: ${esc(g[2])}">${scene(g[0],g[1],g[3])}<span class="cap ph-pill">${esc(g[2])}</span></button>`).join('')}</div>
    </div></section>

    <section class="lx-paper dsec" id="d-plantas"><div class="lx-wrap">
      <div class="dsec-h"><div><span class="lx-k">Plantas</span><h2 class="lx-h2">${l.tip.length} ${plural(l.tip.length,'planta','plantas')}, <em>${areas(l)}</em></h2></div><p>Plantas ilustrativas com medidas aproximadas. O memorial descritivo completo vem com a proposta.</p></div>
      <div class="fp-tabs" role="tablist" aria-label="Plantas">${l.tip.map((t,i)=>`<button type="button" role="tab" data-tip="${i}" aria-selected="${i===0}">${tipName(t)}<small>${t.a} m² · a partir de ${brlK(t.p)}</small></button>`).join('')}</div>
      <div class="fp" id="fp-body"></div>
    </div></section>

    <section class="lx-paper dsec" id="d-unidades"><div class="lx-wrap">
      <div class="dsec-h"><div><span class="lx-k">Espelho de vendas</span><h2 class="lx-h2">Escolha <em>a sua unidade</em></h2></div><p>O que ainda está livre, ${casa?'quadra por quadra':'andar por andar'}. Toque numa unidade para ver planta, posição do sol e preço de tabela.</p></div>
      <div class="mirror-wrap"><div class="mirror-box">
        ${!casa&&l.torres>1?`<div class="fp-tabs" role="tablist" aria-label="Torres" style="margin-bottom:14px">${[...Array(l.torres)].map((_,i)=>`<button type="button" role="tab" data-torre="${i}" aria-selected="${i===0}" style="padding:7px 14px">Torre ${'ABCD'[i]}</button>`).join('')}</div>`:''}
        ${l.modelo3d?`<div class="m-view" role="tablist" aria-label="Como ver o espelho"><button type="button" role="tab" data-mview="3d" aria-selected="true">${ic('i-building')}Prédio 3D</button><button type="button" role="tab" data-mview="grade" aria-selected="false">${ic('i-list')}Grade</button></div>`:''}
        <div class="m-legend"><span><i style="background:var(--badge-rent-bg);box-shadow:inset 0 0 0 1px var(--vc-green-600)"></i>Disponível</span><span><i style="background:var(--lx-res)"></i>Reservada</span><span><i style="background:var(--lx-sold)"></i>Vendida</span>
          <label style="margin-left:auto;display:inline-flex;gap:6px;align-items:center">Planta <select class="sel" id="m-tip"><option value="">Todas</option>${l.tip.map((t,i)=>`<option value="${i}">${tipName(t)} · ${t.a} m²</option>`).join('')}</select></label></div>
        ${l.modelo3d?`<div class="m3d" id="m3d"><div class="m3d-msg">Carregando o prédio…</div><div class="m3d-tip" hidden></div>
          <div class="m3d-ui"><span class="m3d-hint">Arraste para girar</span><button type="button" class="m3d-reset" data-m3d-reset aria-label="Voltar à vista inicial" title="Voltar à vista inicial"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.34-5.66M4 4v4.5h4.5"/></svg></button></div></div>`:''}
        <div class="mirror-scroll" ${l.modelo3d?'hidden':''}><div class="mirror" id="mirror"></div></div>
      </div><div class="unit-card" id="unit-card" aria-live="polite"></div></div>
    </div></section>

    <section class="lx-paper dsec" id="d-lazer"><div class="lx-wrap">
      <div class="launch"><div class="launch-head"><div><span class="badge" style="background:var(--vc-green-500);color:var(--vc-green-ink)">Lançamento</span><h3 style="margin-top:10px">${esc(l.nome)}</h3><p>${esc(l.bairro)} · Guaratinguetá · ${l.fase==='pronto'?'Entregue em':'Entrega em'} ${mes(l.entrega)}</p></div><button class="btn btn-primary btn-sm" type="button" data-goto="d-plantas">Ver plantas ${ic('i-arrow')}</button></div>
        <div class="amen">${l.com.map(x=>{ const k=com(x); return `<div>${ic(k.i)}${esc(k.n)}</div>`; }).join('')}</div></div>
    </div></section>

    <section class="lx-dark dsec" id="d-obra"><div class="lx-wrap">
      <div class="dsec-h"><div><span class="lx-k">Andamento da obra</span><h2 class="lx-h2">${l.fase==='planta'?'A obra <em>vai começar</em>':l.fase==='pronto'?'Obra <em>entregue</em>':`${p}% <em>concluída</em>`}</h2></div><p>${l.fase==='planta'?`Lançado em ${mes(l.lanc)}. A construtora prevê o início da obra para os próximos meses e a entrega para ${mes(l.entrega)}.`:l.fase==='pronto'?`Chaves entregues em ${mes(l.entrega)}. O condomínio já está funcionando.`:'Atualizado pela construtora em 30/set/2026, com fotos do canteiro todo mês.'}</p></div>
      <div class="obra"><div class="ring" style="--v:${p}"><div><b>${p}%</b><span>da obra</span></div></div>
        <div><div class="stages">${l.etapas.map(([n,v])=>`<div class="stage ${v===100?'done':''}"><div class="top"><span>${n}</span><b>${v}%</b></div><div class="bar"><i style="width:${v}%"></i></div></div>`).join('')}</div>
        <ul class="mil">${marcos.map(([t,d,ok])=>`<li class="${ok?'done':''}"><b>${t}</b><small>${d}</small></li>`).join('')}</ul></div></div>
      ${obraF.length?`<div class="strip">${obraF.map((g,i)=>`<button type="button" data-obra="${i}" aria-label="Abrir ${esc(g[2])}">${scene(g[0],g[1],g[3])}<span class="cap ph-pill">${esc(g[2])}</span></button>`).join('')}</div>`:''}
    </div></section>

    <section class="lx-paper dsec" id="d-local"><div class="lx-wrap">
      <div class="dsec-h"><div><span class="lx-k">Localização</span><h2 class="lx-h2">${esc(l.bairro)}, <em>Guará</em></h2></div><p>${esc(b.vibe)} Distâncias em linha reta, pelo mapa ilustrativo.</p></div>
      <div class="loc"><div class="map" id="l-map">${A.mapa({focus:l.bairro})}<span class="pin dot" data-x="${b.x}" data-y="${b.y}" aria-hidden="true"></span><span class="map-note">Mapa ilustrativo</span></div>
        <ul class="dist">${dists.map(d=>`<li><b>${esc(d.n)}</b><span>${esc(d.sub)} · ${d.km<1.2?Math.max(2,Math.round(d.km*13))+' min a pé':Math.max(3,Math.round(d.km*2+2))+' min de carro'}</span><strong>${d.km.toFixed(1).replace('.',',')}<small> km</small></strong></li>`).join('')}</ul></div>
    </div></section>

    <section class="lx-paper dsec" id="d-pagamento"><div class="lx-wrap">
      <div class="dsec-h"><div><span class="lx-k">Pagamento</span><h2 class="lx-h2">Simule <em>a sua parcela</em></h2></div><p>${meses?`Faltam ${meses} meses para as chaves. Ajuste o sinal e quanto você quer pagar durante a obra.`:'Imóvel pronto: você paga o sinal e financia o resto pelo banco.'}</p></div>
      <div id="d-sim">${simHTML(l)}</div>
      <div class="conds">${[['i-calc','Sinal a partir de 5%','Na assinatura do contrato com a construtora.'],['i-chart','Correção pelo INCC','Só durante a obra, até a entrega das chaves.'],['i-key','FGTS no financiamento','Pode usar para dar entrada ou amortizar.'],['i-home','Financiamento bancário','Na entrega, com o banco que você escolher.']].map(([i,t,s])=>`<div>${ic(i)}<b>${t}</b>${s}</div>`).join('')}</div>
    </div></section>

    <section class="lx-paper dsec" id="d-construtora"><div class="lx-wrap">
      <div class="dsec-h"><div><span class="lx-k">Construtora</span><h2 class="lx-h2">${esc(c.n)}</h2></div><p>${esc(c.sobre)} Construindo desde ${c.desde}.</p></div>
      <div class="posters">${(D.lancamentos.filter(x=>x.cons===l.cons&&x.id!==l.id).concat(D.lancamentos.filter(x=>x.cons!==l.cons&&x.id!==l.id))).slice(0,4).map(VC.lxPoster).join('')}</div>
    </div></section>

    <div class="actionbar" role="region" aria-label="Ações do empreendimento"><div class="nm"><b>${esc(l.nome)}</b><small>A partir de ${brl(minP(l))} · ${disp} ${plural(disp,'disponível','disponíveis')}</small></div><div class="acts"><button class="btn btn-sm btn-lx-ghost wa" type="button" data-lwa>${ic('i-wa')}<span>WhatsApp</span></button><button class="btn btn-primary btn-sm" type="button" data-visita>Agendar visita</button></div></div>`;
    VC.mount('lx', html, {title:l.nome, actionbar:true});
    const main=$('#main');

    // plantas
    const fpBody=$('#fp-body');
    const drawFP=i=>{ const t=l.tip[i], free=[]; for(let k=0;k<torresN(l);k++) espelho(l,k).forEach(r=>r.forEach(u=>{ if(u.st==='free'&&u.tip===t) free.push(u); }));
      fpBody.innerHTML=`<div class="fp-draw">${A.planta(t)}<div class="note"><div class="fp-legend"><span><i style="background:var(--fp-social)"></i>Social</span><span><i style="background:var(--fp-intimo)"></i>Íntima</span><span><i style="background:var(--fp-molhado)"></i>Banheiros e serviço</span><span><i style="background:var(--fp-externo)"></i>${t.casa?'Quintal':'Varanda'}</span></div><span>Planta ilustrativa · medidas aproximadas</span></div></div>
      <div class="fp-spec"><span class="lx-k">${t.casa?'Casa':'Apartamento'}</span><h3>${tipName(t)}</h3><dl><dt>Área privativa</dt><dd>${t.a} m²</dd><dt>Quartos</dt><dd>${t.studio?'Studio':t.q}</dd><dt>Suítes</dt><dd>${t.s||'—'}</dd><dt>Banheiros</dt><dd>${t.studio||t.q===1?1:t.s+1}</dd><dt>Vagas</dt><dd>${t.v||'Sem vaga'}</dd></dl>
        <div class="pf">A partir de<b>${brl(t.p)}</b></div><span class="avail"><i></i>${free.length} ${plural(free.length,'unidade disponível','unidades disponíveis')} nesta planta</span>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" type="button" data-see-units="${i}">Ver unidades desta planta</button><button class="btn btn-sm btn-lx-ghost" type="button" data-sim-tip="${i}">Simular</button></div></div>`; };
    drawFP(0);
    // espelho
    let torre=0, tipF='', sel=null, v3=null;
    const mir=$('#mirror'), uc=$('#unit-card');
    const drawMirror=()=>{ const rows=espelho(l,torre), cols=rows[0].length;
      mir.style.gridTemplateColumns=`44px repeat(${cols}, minmax(0,1fr))`;
      mir.innerHTML=`<span></span>`+rows[0].map(u=>`<span class="colh">${casa?'Casa '+u.u:'Final '+String(u.u).padStart(2,'0')}</span>`).join('')+rows.map(r=>`<span class="fl">${casa?'Qd. '+r[0].f:r[0].dup?r[0].f+'/'+(r[0].f+1)+'º':r[0].f+'º'}</span>`+r.map(u=>{ const dim=tipF!==''&&u.tip!==l.tip[+tipF]; return `<button type="button" class="unit ${u.st==='free'?'':u.st} ${dim?'dim':''} ${sel===u.n?'sel':''}" data-u="${u.n}" ${u.st==='sold'?'disabled':''} aria-label="${casa?'Casa':'Unidade'} ${u.n}, ${u.st==='free'?'disponível':u.st==='res'?'reservada':'vendida'}">${u.n}</button>`; }).join('')).join('');
    };
    const findU=n=>{ for(const r of espelho(l,torre)) for(const u of r) if(String(u.n)===String(n)) return u; };
    const drawUnit=u=>{ if(!u){ uc.innerHTML=`<span class="k">Espelho de vendas</span><h3>Nenhuma livre</h3><p>Todas as unidades desta seleção já foram vendidas.</p>`; return; }
      const sol = u.u<=Math.ceil((casa?8:l.porAndar)/2) ? 'sol da manhã' : 'sol da tarde', vista = !casa && (l.pav ? u.f>=15 && u.u>=3 : u.f>=Math.ceil(l.andares*.6)) ? ', vista aberta para a Mantiqueira' : '';
      uc.innerHTML=`<span class="k">${casa?`Quadra ${u.f} · casa ${u.u}`:`${l.torres>1?`Torre ${'ABCD'[torre]} · `:''}${andarTxt(u)} · final ${String(u.u).padStart(2,'0')}`}</span><h3>${casa?'Casa':u.dup?'Duplex':'Apto'} ${u.n}</h3>
        <p>${tipName(u.tip)}, ${u.tip.a} m², ${tipSub(u.tip)}. Posição com ${sol}${vista}.</p>
        <div class="pr"><span style="font-size:13px;color:var(--lx-ink-2)">Preço de tabela</span><br><b>${brl(u.p)}</b></div>
        ${u.st==='res'?`<p style="color:var(--vc-sun-500)">Reservada até amanhã. Se a reserva cair, a gente te avisa.</p><button class="btn btn-sm btn-lx-ghost" type="button" data-avise="${u.n}">Me avisar se liberar</button>`
          :`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" type="button" data-quero="${u.n}">Quero esta unidade</button><button class="btn btn-sm btn-lx-ghost" type="button" data-sim-u="${u.n}">Simular esta</button></div>`}`; };
    const firstFree=()=>{ for(const r of espelho(l,torre)) for(const u of r) if(u.st==='free'&&(tipF===''||u.tip===l.tip[+tipF])) return u; };
    const pick=u=>{ sel=u?u.n:null; drawMirror(); drawUnit(u); if(v3) v3.update(); };
    pick(firstFree());
    // espelho 3D: o prédio do Blender, uma malha por unidade (ver assets/espelho3d.js)
    const m3=$('#m3d'), mscroll=$('.mirror-scroll');
    const setView=v=>{ $$('[data-mview]').forEach(b=>b.setAttribute('aria-selected', b.dataset.mview===v)); if(m3) m3.hidden=v!=='3d'; mscroll.hidden=v==='3d'; };
    if(m3){
      const ST={free:'Disponível',res:'Reservada',sold:'Vendida'};
      const tip3=u=>`<span class="k">${andarTxt(u)} · final ${String(u.u).padStart(2,'0')}</span><b>${u.dup?'Duplex':'Apto'} ${u.n}</b><span>${tipName(u.tip)} · ${u.tip.a} m² · ${tipSub(u.tip)}</span>
        <span class="row"><strong>${u.st==='sold'?'—':brl(u.p)}</strong><em class="st ${u.st}">${ST[u.st]}</em></span>${u.st==='sold'?'':`<small>${u.n===sel?'Selecionada':'Clique para selecionar'}</small>`}`;
      import('./espelho3d.js').then(mod=>{ if(!document.body.contains(m3)) return;
        v3=mod.mount(m3,{url:l.modelo3d, label:`${l.nome} em 3D. Use a grade para navegar pelo teclado.`, unit:n=>findU(n), sel:()=>sel, dim:u=>tipF!==''&&u.tip!==l.tip[+tipF], tip:tip3,
          onPick:u=>pick(u), onError:()=>setView('grade')});
        VC.onCleanup(()=>{ if(v3) v3.dispose(); v3=null; });
      }).catch(()=>setView('grade'));
    }
    $('#m-tip').addEventListener('change', e=>{ tipF=e.target.value; pick(firstFree()); });
    // simulador
    const simRoot=$('#d-sim [data-sim]'); bindSim(simRoot);
    const toSim=(price)=>{ simRoot._setPrice(price, meses); document.getElementById('d-pagamento').scrollIntoView({behavior:'smooth'}); };

    main.addEventListener('click', e=>{
      const s=e.target.closest('[data-sec]'); if(s){ e.preventDefault(); document.getElementById(s.dataset.sec).scrollIntoView({behavior:'smooth'}); return; }
      const g=e.target.closest('[data-goto]'); if(g){ document.getElementById(g.dataset.goto).scrollIntoView({behavior:'smooth'}); return; }
      if(e.target.closest('[data-visita]')){ visitaModal(l); return; }
      if(e.target.closest('[data-lwa]')){ waModal(l); return; }
      const ga=e.target.closest('[data-gal]'); if(ga){ VC.lightbox(gal, +ga.dataset.gal, l.nome); return; }
      const ob=e.target.closest('[data-obra]'); if(ob){ VC.lightbox(obraF, +ob.dataset.obra, l.nome+' · obra'); return; }
      const tp=e.target.closest('[data-tip]'); if(tp){ $$('[data-tip]').forEach(x=>x.setAttribute('aria-selected',x===tp)); drawFP(+tp.dataset.tip); return; }
      const tr=e.target.closest('[data-torre]'); if(tr){ torre=+tr.dataset.torre; $$('[data-torre]').forEach(x=>x.setAttribute('aria-selected',x===tr)); pick(firstFree()); return; }
      const mv=e.target.closest('[data-mview]'); if(mv){ setView(mv.dataset.mview); return; }
      const un=e.target.closest('.unit[data-u]'); if(un&&!un.disabled){ pick(findU(un.dataset.u)); if(window.innerWidth<900) uc.scrollIntoView({behavior:'smooth',block:'nearest'}); return; }
      const su=e.target.closest('[data-see-units]'); if(su){ tipF=su.dataset.seeUnits; $('#m-tip').value=tipF; pick(firstFree()); document.getElementById('d-unidades').scrollIntoView({behavior:'smooth'}); return; }
      const st=e.target.closest('[data-sim-tip]'); if(st){ toSim(l.tip[+st.dataset.simTip].p); return; }
      const sv=e.target.closest('[data-sim-u]'); if(sv){ toSim(findU(sv.dataset.simU).p); return; }
      const q=e.target.closest('[data-quero]'); if(q){ visitaModal(l, q.dataset.quero); return; }
      const av=e.target.closest('[data-avise]'); if(av){ VC.toast(`Pronto. Se a unidade ${av.dataset.avise} liberar, a gente te avisa.`); return; }
      const lb=e.target.closest('[data-lxb]'); if(lb){ L=Object.assign(L0(),{view:L.view, bairros:[lb.dataset.lxb]}); }
    });
    // scroll-spy
    const links=$$('.subnav [data-sec]'), bar=$('.subnav-in');
    const io=new IntersectionObserver(es=>{ es.forEach(en=>{ if(en.isIntersecting){ links.forEach(a=>a.classList.toggle('on', a.dataset.sec===en.target.id)); const on=links.find(a=>a.classList.contains('on')); if(on && bar.scrollWidth>bar.clientWidth) bar.scrollTo({left:on.offsetLeft-bar.clientWidth/2+on.offsetWidth/2, behavior:'smooth'}); } }); }, {rootMargin:'-140px 0px -55% 0px'});
    SECS.forEach(([id])=>io.observe(document.getElementById(id))); VC.onCleanup(()=>io.disconnect());
    const mp=$('#l-map'), ro=new ResizeObserver(()=>A.layoutPins(mp)); ro.observe(mp); VC.onCleanup(()=>ro.disconnect()); A.layoutPins(mp);
  }

  VC.route(/^lancamentos$/, lxHome);
  VC.route(/^lancamentos-busca$/, lxBusca);
  VC.route(/^lancamento-(\d+)$/, lxDetalhe);
})();
