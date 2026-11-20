/* ValeCasa · avaliação de bairros: página do bairro, questionário do morador, ranking, comparador e metodologia.
   Rotas: #bairros · #bairro-<slug>[/<seção>] · #avaliar[-<slug>] · #comparar[-a,b,c] · #metodologia */
(function(){
  const {D,A,$,$$,esc,ic,th,brl,brlK,norm,plural,store,scene,card} = VC;
  const AV = window.VCAval, fmt = AV.fmt;
  const prep = n => /^(Vila|Colônia)/.test(n) ? 'na' : n==='Engenheiro Neiva' ? 'em' : 'no';
  const de = n => ({na:'da',no:'do',em:'de'})[prep(n)];
  const stars = (v, cls='md') => `<span class="stars ${cls}" role="img" aria-label="${fmt(v)} de 5 estrelas">${[1,2,3,4,5].map(i=>ic('i-star', i<=Math.round(v)?'':'off')).join('')}</span>`;
  const grade = L => `<span class="grade g${L}">${L}</span>`;
  const GN = {A:5,B:4,C:3,D:2,E:1};
  const pct = v => v+'%';
  const ok5 = o => o.n>=5;
  const relatos = o => o.n ? `${o.n} ${plural(o.n,'relato','relatos')}` : 'nenhum';
  const cidadeM2 = Math.round(D.bairros.reduce((a,x)=>a+x.m2,0)/D.bairros.length/50)*50;
  const scrollTo = id => { const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); };
  const selo = (s, fem) => s==='ver' ? `<span class="badge b-ver">${ic('i-shield','i-12')}${fem?'Moradora verificada':'Morador verificado'}</span>`
    : s==='cli' ? `<span class="badge b-ver">${ic('i-shield','i-12')}Cliente ValeCasa</span>`
    : s==='cor' ? `<span class="badge b-cor">Corretor</span>` : `<span class="badge b-dec">${fem?'Moradora declarada':'Morador declarado'}</span>`;
  const NOTAS_K = [3,1,0,4,16,7,2,1]; // quantos não avaliaram cada critério (Pedregulho como base)
  const critN = (o,k) => Math.max(1, Math.round(o.n*(1-NOTAS_K[k]/38)));
  const dist = o => { if(o.dist) return o.dist; const n=o.n, w5=Math.max(.15,(o.nota-3.3)/1.6*.85); let d5=Math.round(n*w5), d4=Math.round(n*.3), d3=Math.round(n*.12), d2=Math.round(n*.05); const d1=Math.max(0,n-d5-d4-d3-d2); d4+=n-(d5+d4+d3+d2+d1); return [d5,d4,d3,d2,d1]; };

  /* distâncias e tempos a partir do mapa ilustrativo */
  const DEST = [['Centro',300,198],['Via Dutra',null,null],['Buriti Shopping',262,244],['EEAR',356,330],['UNESP',520,312],['Rodoviária',318,210]];
  function tempos(o){
    if(o.tempos) return o.tempos;
    const b=o.b; return DEST.map(([n,x,y])=>{ const km = x==null ? VC.distDutra(b.x,b.y)*VC.KM : Math.hypot(x-b.x,y-b.y)*VC.KM, car=Math.max(3,Math.round(2+km*1.7)); return [n, car+' min', x==null?'':Math.round(car*2.3+4)+' min']; });
  }
  function escolas(o){
    if(o.escolas) return o.escolas;
    const g=o.ind.fam, r=A.R(o.b.x*3+o.b.y)(), ideb=(4.6+GN[g]*.35+r*.3).toFixed(1).replace('.',',');
    const L=[['EMEF do bairro · municipal',`Fundamental I · ${300+Math.round(r*500)} m`,'IDEB '+ideb]];
    if(GN[g]>=3) L.push(['EE mais próxima · estadual',`Fundamental II e Médio · ${600+Math.round(r*400)} m`,'IDEB '+(4.2+GN[g]*.2).toFixed(1).replace('.',',')]);
    if(GN[g]>=4) L.push(['Creche municipal',`Infantil · ${350+Math.round(r*300)} m`,'']);
    return L;
  }

  /* ===== mapa do bairro: recorte do mapa ilustrativo da cidade ===== */
  const VW=240, VH=160;
  function bairroMapa(o){
    const b=o.b, vx=b.x-VW/2, vy=b.y-VH/2;
    let svg = A.mapa({focus:o.nome, poiLabels:false, labels:false}).replace('viewBox="0 0 600 420" preserveAspectRatio="xMidYMid meet"', `viewBox="${vx} ${vy} ${VW} ${VH}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mapa ilustrativo ${de(o.nome)} ${esc(o.nome)} com o limite do bairro"`).replace(' aria-hidden="true"','');
    if(o.ench.lv) svg = svg.replace('</svg>', `<ellipse cx="${b.x-6}" cy="${b.y+14}" rx="${o.ench.lv>1?36:24}" ry="${o.ench.lv>1?18:9}" fill="var(--vc-sun-500)" fill-opacity=".5"/></svg>`);
    const r=A.R(b.x+b.y*2), pt=()=>{ const a=r()*Math.PI*2, d=Math.sqrt(r()); return [b.x+Math.cos(a)*d*38, b.y+Math.sin(a)*d*22]; };
    const cnt={esc:1+GN[o.ind.fam]-1, sau:GN[o.pub[5][0]]>=4?2:1, com:GN[o.ind.cam]+1};
    const dots = [['esc','i-academic','Escola'],['sau','i-plus','Saúde'],['com','i-storefront','Comércio']].map(([k,i,l])=>Array.from({length:cnt[k]},()=>{ const [x,y]=pt(); return `<span class="m-dot" data-layer="${k}" data-x="${x.toFixed(1)}" data-y="${y.toFixed(1)}" hidden title="${l}">${ic(i)}</span>`; }).join('')).join('');
    const pois = D.pois.filter(p=>!p.hide && Math.abs(p.x-b.x)<VW/2-14 && Math.abs(p.y-b.y)<VH/2-10).map(p=>`<span class="m-dot lbl" data-x="${p.x}" data-y="${p.y}">${esc(p.n)}</span>`).join('');
    return `<div class="map">${svg}<span class="m-dot lbl" data-x="${b.x}" data-y="${b.y}" style="border-width:2px;font-size:13px">${esc(o.nome)}</span>${pois}${dots}</div>
      <div class="layers" role="group" aria-label="Camadas do mapa"><button class="vchip" type="button" aria-pressed="true" disabled>Limite do bairro</button><button class="vchip" type="button" data-ml="esc" aria-pressed="false">Escolas</button><button class="vchip" type="button" data-ml="sau" aria-pressed="false">Saúde</button><button class="vchip" type="button" data-ml="com" aria-pressed="false">Comércio</button></div>
      ${o.ench.lv?`<div class="legend"><i></i>Área mapeada de risco de enchente (Defesa Civil)</div>`:''}<span class="map-note" style="left:auto;right:10px">Mapa ilustrativo</span>`;
  }
  function layoutBairroMapa(box, o){
    const w=box.clientWidth, h=box.clientHeight, k=Math.max(w/VW,h/VH), ox=(w-VW*k)/2, oy=(h-VH*k)/2, vx=o.b.x-VW/2, vy=o.b.y-VH/2;
    $$('[data-x]',box).forEach(el=>{ el.style.left=(ox+(+el.dataset.x-vx)*k)+'px'; el.style.top=(oy+(+el.dataset.y-vy)*k)+'px'; });
  }

  /* ===== avaliações ===== */
  function reviewHTML(rv, i){
    const a = rv.fem ? 'à autora' : 'ao autor', util = rv.util + (store.get('util',{})[rv.nome+'|'+rv.tit] ? 1 : 0), marked = !!store.get('util',{})[rv.nome+'|'+rv.tit];
    return `<article class="panel review">
      <div class="who"><span class="av" style="background:${rv.cor[0]};color:${rv.cor[1]}">${rv.ini}</span><div><b>${esc(rv.nome)}</b><span class="cap">${esc(rv.perfil)}</span></div>${selo(rv.selo, rv.fem)}</div>
      <div class="row" style="gap:10px">${stars(rv.nota)}<span class="cap">${esc(rv.quando)} · ${esc(rv.denovo)}</span></div>
      <h3>“${esc(rv.tit)}”</h3><p>${esc(rv.txt)}</p>
      <div class="row">${rv.tags.map(t=>`<span class="vtag">${esc(t)}</span>`).join('')}${(rv.neg||[]).map(t=>`<span class="vtag neg">${esc(t)}</span>`).join('')}</div>
      ${rv.crit?`<div class="rcrit">${AV.CRIT.map((c,k)=>`<span>${c[1]} <b>${rv.crit[k]}</b></span>`).join('')}</div>`:''}
      ${rv.qa?`<div class="ans q"><span><b>${esc(rv.qa[0])} perguntou:</b> ${esc(rv.qa[1])}</span><span><b>${esc(rv.nome.split(' ')[0])} respondeu:</b> ${esc(rv.qa[2])}</span></div>`:''}
      <div class="acts"><button class="act" type="button" data-util="${i}" aria-pressed="${marked}">${ic('i-thumb')}Útil (<span>${util}</span>)</button><button class="act" type="button" data-askto="${esc(rv.nome.split(' ')[0])}">${ic('i-chat')}Perguntar ${a}</button><button class="act end" type="button" data-denuncia>${ic('i-flag')}Denunciar</button></div></article>`;
  }
  function denunciaModal(){
    VC.modal(VC.mh('Denunciar avaliação','O que tem de errado?')+`<form class="modal-b" id="dn-form">${['Ofensa ou discriminação','Expõe uma pessoa ou uma casa','Propaganda','Parece falsa ou não mora aqui'].map((x,i)=>`<label class="check"><input type="radio" name="dn" value="${i}" ${i===1?'checked':''}> ${x}</label>`).join('')}
      <p class="cap">Analisamos toda denúncia. Se for sobre você e envolver crime contra a honra, também dá para pedir por notificação formal.</p><button class="btn btn-primary" type="submit">Enviar denúncia</button></form>`, {label:'Denunciar avaliação', onMount(el){
      $('#dn-form',el).addEventListener('submit',e=>{ e.preventDefault(); el.querySelector('.modal').innerHTML=VC.mh('Denunciar avaliação')+`<div class="modal-b">${VC.okState('Recebemos a denúncia.','Uma pessoa da equipe lê a avaliação e a decisão fica registrada.')}</div>`; });
    }});
  }

  /* ===== perguntas ===== */
  function qaList(o){ return store.get('perg:'+o.slug, []).concat(o.qa); }
  function qaHTML(q){
    const nr = q.nr || q.r.length;
    return `<div class="qa"><div><b>${esc(q.p)}</b><span class="cap">Perguntado por ${esc(q.quem)} · ${esc(q.quando)}${nr?` · ${nr} ${plural(nr,'resposta','respostas')}`:''}</span></div>
      ${q.r.length ? q.r.map(a=>`<div class="ans"><div class="row"><b>${esc(a.nome)}</b>${selo(a.selo,a.fem)}${a.extra?`<span class="cap">${esc(a.extra)}</span>`:''}</div><p>${esc(a.t)}</p>${a.util?`<div><button class="act" type="button" data-autil aria-pressed="false">${ic('i-thumb')}Útil (<span>${a.util}</span>)</button></div>`:''}</div>`).join('')
        : `<div class="wait">${ic('i-clock')}Sem resposta ainda. Avisamos ${q.avisados||23} moradores. <button class="lnk" type="button" data-responder>Mora aqui? Responder</button></div>`}</div>`;
  }

  /* ===== PÁGINA DO BAIRRO ===== */
  function bairroPage(m){
    const o = AV.bySlug(m[1]); if(!o){ VC.go('bairros'); return; }
    const nm=o.nome, b=o.b, ok=ok5(o), n=o.n, P=prep(nm);
    const ims = D.imoveis.filter(i=>i.bairro===nm), nv=ims.filter(i=>i.fin==='venda').length, na=ims.length-nv;
    const segue = store.get('segue',[]).includes(o.slug), mine = store.get('av:'+o.slug, null);
    const viz = b.viz.map(AV.by).filter(Boolean);
    const par = AV.list.filter(x=>x!==o && !b.viz.includes(x.nome) && ok5(x)).sort((x,y)=>Math.abs(x.nota-(o.nota||AV.CIDADE))-Math.abs(y.nota-(o.nota||AV.CIDADE)))[0];
    const near = viz.concat(par?[par]:[]).slice(0,4);
    const qa = qaList(o);
    const tags = ok ? (o.tags||[]).map(([t,c])=>`<span class="vtag">${esc(t)} · ${c}</span>`).join('')+(o.neg||[]).map(([t,c])=>`<span class="vtag neg">${esc(t)} · ${c}</span>`).join('')
      : (o.relatos||[]).map(([t,c])=>`<span class="vtag">${esc(t)} · ${c}</span>`).join('')+(o.neg||[]).map(([t,c])=>`<span class="vtag neg">${esc(t)} · ${c}</span>`).join('');
    const tendCor = o.tend==='Melhorando' ? 'var(--brand-text)' : o.tend==='Piorando' ? 'var(--vc-coral)' : 'var(--ink)';
    const subs = [['boletim','Boletim'], ok&&['dizem','O que dizem'], o.reviews.length&&['avaliacoes',`Avaliações (${n})`], ['perguntas',`Perguntas (${Math.max(o.nq,qa.length)})`], ['dados','Dados do bairro'], ['precos','Preços'], ['imoveis','Imóveis']].filter(Boolean);
    const quickIdx = [0,2,4,1,6,7];
    const perfisTop = AV.PERFIS.map(([k,l])=>[l,o.perfis[k]]).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const ds = ok ? dist(o) : null;
    const t = tempos(o), segFurto = o.seg.furto;
    const aluguelM2 = o.aluguelM2 || Math.round(o.m2/215);
    const casa3 = o.casa3q || Math.round(b.media/10000)*10000;
    const diff = Math.round((o.m2/cidadeM2-1)*100);

    const html = `<div class="bp">
    <section class="wrap">
      <nav class="crumbs" aria-label="Você está em"><a href="#inicio">Início</a>›<a href="#bairros">Bairros</a>›<span>${esc(nm)}</span></nav>
      <div class="bp-hero">
        <div>
          <span class="hood-n row" style="gap:6px;font-size:13px">${ic('i-pin')}${esc(o.zona)} · Guaratinguetá, SP</span>
          <h1>Como é morar ${P} ${esc(nm)}</h1>
          <p class="lead">${esc(b.vibe)} O que os moradores contam e o que os dados públicos mostram, lado a lado.</p>
          ${ok ? `<div class="bp-score"><div class="main"><b class="big-n">${fmt(o.nota)}</b><div>${stars(o.nota)}<span style="font-size:13px;font-weight:600">Nota dos moradores</span><span class="cap">${n} avaliações · ${o.ver} de moradores verificados</span></div></div>
              <span class="sep" aria-hidden="true"></span><div class="kv"><span class="cap">Moraria aqui de novo</span><b>${o.nov}%</b></div><div class="kv"><span class="cap">Tendência</span><b style="font-size:15px;color:${tendCor}">${o.tend}</b></div></div>`
            : n ? `<div class="bp-note warn">${ic('i-info','i-20')}<span><b>Poucas avaliações ainda (${n}).</b> Mostramos os relatos, mas a nota só aparece a partir de 5, para não depender da opinião de uma pessoa.</span></div>`
            : `<div class="bp-note">${ic('i-chat','i-20')}<span><b>Ninguém contou ainda como é morar aqui.</b> Já dá para ver escolas, ruas, preços e riscos com dados públicos.</span></div>`}
          ${tags?`<div class="row">${tags}</div>`:''}
          ${mine?`<div class="mine">${ic('i-check')}<span>Sua avaliação (${mine.nota} ${plural(mine.nota,'estrela','estrelas')}) foi enviada em ${esc(mine.quando)} e está em leitura pela equipe.</span></div>`:''}
          <div class="row" style="gap:10px">
            <a class="btn btn-primary" href="#avaliar-${o.slug}">${n?'Avaliar o bairro':'Seja o primeiro a avaliar'}</a>
            <button class="btn btn-outline" type="button" data-goto="perguntas">${ic('i-chat')}Perguntar a quem mora</button>
            <button class="btn btn-outline" type="button" data-seguir aria-pressed="${segue}">${ic('i-bell')}<span>${segue?'Seguindo o bairro':'Seguir o bairro'}</span></button>
            <button class="btn btn-ghost" type="button" data-share>${ic('i-share')}Compartilhar</button>
          </div>
        </div>
        <div>
          <div class="bp-map" id="bp-map">${bairroMapa(o)}</div>
          <div class="bp-kpis">
            <a class="panel" href="#imoveis" data-goto="imoveis"><b>${nv}</b><span class="cap">à venda</span></a>
            <a class="panel" href="#imoveis" data-goto="imoveis"><b>${na}</b><span class="cap">para alugar</span></a>
            <a class="panel" href="#precos" data-goto="precos"><b>${brl(o.m2)}</b><span class="cap">m² pedido, venda</span></a>
          </div>
        </div>
      </div>
    </section>

    <nav class="subnav" aria-label="Seções da página"><div class="wrap">${subs.map(([k,l],i)=>`<button type="button" data-goto="${k}" aria-current="${i===0}">${l}</button>`).join('')}</div></nav>

    <div class="wrap">
    <section class="sec" id="boletim">
      <div class="sec-h"><div><span class="eyebrow">Boletim do bairro</span><h2>Como ${de(nm)==='da'?'a':'o'} ${esc(nm)} vai em cada ponto</h2><p>À esquerda, a nota de quem mora. À direita, o indicador público mais próximo. Quando os dois discordam, vale ler as avaliações.</p></div>
        <a class="lnk" href="#metodologia">${ic('i-info')}Como calculamos</a></div>
      <div class="panel bol" role="table" aria-label="Boletim ${de(nm)} ${esc(nm)}">
        <div class="bol-r h" role="row"><span role="columnheader">Critério</span><span role="columnheader">Moradores</span><span role="columnheader">Dado público</span></div>
        ${AV.CRIT.map((c,k)=>`<div class="bol-r" role="row"><b role="rowheader">${c[2]}</b>
          <div role="cell">${ok ? `<div class="vbar"><i style="width:${o.crit[k]/5*100}%"></i></div><b class="v">${fmt(o.crit[k])}</b><span class="cap">${critN(o,k)} notas</span>` : `<span class="cap">${n?'Notas por critério aparecem a partir de 3 avaliações':'Ainda sem notas de moradores'}</span>`}</div>
          <div role="cell">${grade(o.pub[k][0])}<span class="t">${esc(o.pub[k][1])}</span></div></div>`).join('')}
      </div>
      <p class="src">${ic('i-info')}<span>Notas dos moradores com média ajustada pela média da cidade. Dados públicos: IBGE Censo 2022, INEP, SSP-SP, Defesa Civil de Guaratinguetá, OpenStreetMap. Atualizado em nov/2026.</span></p>
    </section>

    ${ok ? `<section class="sec" id="dizem">
      <div class="sec-h"><div><span class="eyebrow">Perguntas rápidas</span><h2>O que dizem os moradores</h2><p>Respostas de sim ou não de quem mora ou morou aqui nos últimos 5 anos.</p></div></div>
      <div class="qgrid">${quickIdx.map(k=>{ const [v,c]=o.quick[k]; return `<div class="panel qcard ${AV.QUICK[k][2]?'neg':''}"><b>${v}%</b><p>${AV.QUICK[k][1]}</p><span class="cap">${c} respostas${k===1&&o.nome==='Pedregulho'?' · mais citada: rua perto do córrego':''}</span></div>`; }).join('')}</div>
      <div class="duo">
        <div class="panel"><h3>Para quem o bairro combina</h3><div class="lines" style="gap:10px">${perfisTop.map(([l,v])=>`<div class="prow"><span>${esc(l)}</span><div class="vbar g"><i style="width:${v}%"></i></div><b>${v}%</b></div>`).join('')}</div><span class="cap">Cada morador pode marcar mais de um perfil.</span></div>
        <div class="panel"><h3>Pontos fortes e fracos mais citados</h3><div class="ff">
          <div><span class="lbl-up" style="color:var(--brand-text)">Pontos fortes</span>${(o.fortes||[]).map(([t,c])=>`<span>${esc(t)}<b>${c}</b></span>`).join('')}</div>
          <div><span class="lbl-up">Pontos fracos</span>${(o.fracos||[]).map(([t,c])=>`<span>${esc(t)}<b>${c}</b></span>`).join('')}</div></div></div>
      </div>
      ${o.dica?`<div class="dica"><span class="blob" aria-hidden="true">${ic('i-sparkle')}</span><div><span class="k">Dica de morador</span><q>${esc(o.dica.t)}</q><small>${esc(o.dica.q)} · ${o.dica.util} pessoas acharam útil</small></div><button class="btn" type="button" data-goto="avaliacoes">Ver mais dicas (${o.dica.total})</button></div>`:''}
    </section>` : ''}

    ${o.reviews.length ? `<section class="sec" id="avaliacoes">
      <div class="sec-h"><div><span class="eyebrow">Avaliações</span><h2>${n} moradores contam como é morar aqui</h2></div><a class="btn btn-primary" href="#avaliar-${o.slug}">Avaliar o bairro</a></div>
      <div class="av-layout">
        <aside>
          <div class="panel" style="display:flex;flex-direction:column;gap:8px"><h3 style="margin-bottom:4px">Distribuição das notas</h3>${ds.map((v,i)=>`<div class="dist"><span>${5-i}★</span><div class="vbar s"><i style="width:${v/n*100}%"></i></div><span class="cap">${v}</span></div>`).join('')}</div>
          <div class="panel" style="display:flex;flex-direction:column;gap:12px"><h3>Filtrar</h3>
            <div class="row" role="group" aria-label="Filtrar avaliações">${[['todas','Todas'],['ver','Verificados'],['5+','Mais de 5 anos'],['ex','Ex-moradores'],['fam','Famílias'],['pet','Quem tem pet'],['ido','Idosos']].map(([k,l],i)=>`<button class="vchip" type="button" data-rf="${k}" aria-pressed="${i===0}">${l}</button>`).join('')}</div>
            <div class="field"><label for="rv-sort">Ordenar por</label><select class="input" id="rv-sort"><option value="util">Mais úteis</option><option value="rec">Mais recentes</option><option value="alta">Nota mais alta</option><option value="baixa">Nota mais baixa</option></select></div></div>
        </aside>
        <div id="rv-list"></div>
      </div>
    </section>` : ''}

    <section class="sec" id="perguntas">
      <div class="sec-h"><div><span class="eyebrow">Perguntas e respostas</span><h2>Pergunte a quem mora ${P} ${esc(nm)}</h2><p>Sua pergunta vai para os moradores que avaliaram ou seguem o bairro. Sem resposta em 48 horas, a equipe ValeCasa responde com dados.</p></div></div>
      <div class="panel">
        <form class="ask" id="ask-form" novalidate><div class="field"><label for="ask-q">Sua pergunta</label><input class="input" id="ask-q" placeholder="Ex.: Como é o trânsito na saída das escolas?" autocomplete="off"><span class="hint" data-ok=""></span></div><button class="btn btn-primary" type="submit">Perguntar</button></form>
        ${o.qa.length>1?`<p class="cap" style="margin-top:10px">Parecidas já respondidas: “O bairro alaga?” · “Tem creche municipal?”</p>`:''}
        <div id="qa-list" style="margin-top:12px">${qa.length ? qa.map(qaHTML).join('') : `<div class="qa"><span class="cap">Ninguém perguntou nada ainda sobre ${de(nm)==='da'?'a':'o'} ${esc(nm)}. A primeira pergunta vai para ${o.seguidores} ${plural(o.seguidores,'pessoa que segue','pessoas que seguem')} o bairro.</span></div>`}</div>
        ${o.nq>qa.length?`<p class="cap" style="padding-top:8px">Mostrando ${qa.length} de ${o.nq} perguntas neste protótipo.</p>`:''}
      </div>
    </section>

    <section class="sec" id="dados">
      <div class="sec-h"><div><span class="eyebrow">Dados do bairro</span><h2>O que os números públicos mostram</h2><p>Cada bloco diz de onde vem o dado e de quando é. O Censo é de 2022.</p></div><a class="lnk" href="#metodologia">${ic('i-info')}Fontes e método</a></div>
      <div class="dgrades">${AV.IND.map(([k,l,s])=>`<div class="panel">${grade(o.ind[k])}<div><b>${l}</b><span class="cap">${s}</span></div></div>`).join('')}</div>
      <div class="dpanels">
        <div class="panel"><h3>Quem mora aqui</h3><div class="kpi4 kpi">${[['moradores',0],['domicílios',1],['idade mediana',2],['renda mediana do responsável',3]].map(([l,i])=>`<div><b>${o.kpi[i]}</b><span>${l}</span></div>`).join('')}</div><p class="src">IBGE · Censo 2022, setores censitários somados no limite do bairro</p></div>
        <div class="panel"><h3>Como é a rua</h3><span class="cap">% de moradores em ruas com</span><div class="lines">${['Iluminação','Calçada','Bueiro','Árvores','Rampa','Ponto de ônibus'].map((l,i)=>`<div><span>${l}</span><div class="vbar"><i style="width:${o.rua[i]}%"></i></div><b>${o.rua[i]}%</b></div>`).join('')}</div><p class="src">IBGE · Censo 2022, entorno dos domicílios</p></div>
        <div class="panel"><h3>Escolas a até 1 km</h3><div class="sch">${escolas(o).map(([n1,s,v])=>`<div><span>${esc(n1)}<span class="cap">${esc(s)}</span></span>${v?`<b>${v}</b>`:'<span class="cap">sem IDEB</span>'}</div>`).join('')}</div><p class="src">INEP · Censo Escolar 2025 e IDEB 2023</p></div>
        <div class="panel"><h3>Quanto tempo leva</h3><div class="tt"><span class="lbl-up">Até</span><span class="lbl-up">Carro</span><span class="lbl-up">Ônibus</span>${t.map(([d,c,o2])=>`<span>${d}</span><b>${c}</b>${o2?`<b>${o2}</b>`:'<span class="cap">n/d</span>'}`).join('')}</div><p class="src">Rotas calculadas sobre o OpenStreetMap, dia útil às 8h</p></div>
        <div class="panel"><h3>Segurança, comparada à cidade</h3><div class="segbars" role="img" aria-label="Furtos: ${esc(nm)} ${segFurto<0?(-segFurto)+'% abaixo':segFurto+'% acima'} da média da cidade"><div><i style="height:${Math.round(90*(100+segFurto)/112)}px"></i><span>${esc(nm)}</span></div><div><i style="height:${Math.round(90*100/112)}px"></i><span>Média de Guará</span></div></div><p style="font-size:14px">${esc(o.seg.txt)}</p><p class="src">SSP-SP · ocorrências registradas, área do bairro</p></div>
        <div class="panel"><h3>${ic('i-warn','i-20')}Risco de enchente</h3><p style="font-size:14px">${esc(o.ench.txt)}</p>${ok&&o.ench.lv?`<p style="font-size:14px"><b>${o.quick[1][0]}%</b> dos moradores contam que alguma rua alaga na chuva forte.</p>`:''}${o.ench.lv?`<button class="lnk" type="button" data-goto="bp-map">${ic('i-map')}Ver no mapa</button>`:''}<p class="src">Defesa Civil de Guaratinguetá · plano de contingência</p></div>
      </div>
    </section>

    <section class="sec" id="precos">
      <div class="sec-h"><div><span class="eyebrow">Preços</span><h2>Quanto custa morar ${P} ${esc(nm)}</h2><p>Preço pedido nos anúncios ativos do ValeCasa, não o valor de venda.</p></div></div>
      <div class="prices">
        <div class="panel kpi"><span class="lbl-up">Venda · m²</span><b>${brl(o.m2)}</b><span>Cidade: ${brl(cidadeM2)} · ${diff<0?(-diff)+'% abaixo':diff>0?diff+'% acima':'na média'}</span></div>
        <div class="panel kpi"><span class="lbl-up">Aluguel · m²</span><b>${brl(aluguelM2)}</b><span>Cidade: ${brl(19)}</span></div>
        <div class="panel kpi"><span class="lbl-up">Casa de 3 quartos</span><b>${brlK(casa3)}</b><span>preço mais comum (mediana)</span></div>
        <div class="panel kpi"><span class="lbl-up">Aluguel de 2 quartos</span><b>${brl(o.alug2q)}</b><span>valor total mais comum</span></div>
      </div>
    </section>

    <section class="sec" id="imoveis">
      <div class="sec-h"><div><span class="eyebrow">Imóveis no bairro</span><h2>${ims.length} ${plural(ims.length,'imóvel','imóveis')} ${P} ${esc(nm)}</h2></div><button class="btn btn-outline" type="button" data-busca>${ic('i-map')}Ver todos no mapa</button></div>
      ${ims.length ? `<div class="cards c4">${ims.slice(0,8).map(im=>card(im)).join('')}</div>` : `<div class="empty">${A.vazia}<b>Nenhum imóvel anunciado ${P} ${esc(nm)} agora.</b><p>Siga o bairro e a gente avisa quando entrar um.</p></div>`}
    </section>

    ${near.length?`<section class="sec">
      <div class="sec-h"><div><span class="eyebrow">Compare</span><h2>Bairros parecidos e vizinhos</h2></div><a class="btn btn-outline" href="#comparar-${[o].concat(near).slice(0,3).map(x=>x.slug).join(',')}">Comparar bairros</a></div>
      <div class="tiles">${near.map((x,i)=>`<a class="tile" href="#bairro-${x.slug}">${scene(['casa','sobrado','apto','casa'][i%4], 120+i*7)}<div><span class="k">${x===par?'Parecido':'Vizinho'}</span><h3>${esc(x.nome)}</h3></div><div>${ok5(x)?`<b>${fmt(x.nota)} ★</b><span>${x.n} avaliações</span>`:`<b>Poucas avaliações</b><span>${relatos(x)}</span>`}</div></a>`).join('')}</div>
    </section>`:''}

    <section class="sec"><div class="cta-b"><div><h2>Mora ${P} ${esc(nm)}? Conta pra quem está chegando.</h2><p>São 3 minutos. Sua avaliação ajuda quem está decidindo onde morar, e você recebe as perguntas de quem quer saber mais.</p></div><a class="btn btn-primary" href="#avaliar-${o.slug}">Avaliar o bairro ${ic('i-arrow')}</a></div></section>
    </div></div>`;
    VC.mount('portal', html, {nav:'bairros', title:`Como é morar ${P} ${nm}`});

    const main=$('#main'), mp=$('#bp-map');
    const lay=()=>layoutBairroMapa($('.map',mp), o); const ro=new ResizeObserver(lay); ro.observe(mp); VC.onCleanup(()=>ro.disconnect()); lay();
    // avaliações
    let rf='todas';
    const drawRv=()=>{ const box=$('#rv-list'); if(!box) return; const s=$('#rv-sort').value;
      let L=o.reviews.map((r,i)=>[r,i]).filter(([r])=>rf==='todas'||(rf==='ver'?r.selo!=='dec':rf==='5+'?r.tempo==='5+':rf==='ex'?r.tempo==='ex':r.perfis.includes(rf)));
      L.sort(([a],[b])=>s==='rec'?b.ord-a.ord:s==='alta'?b.nota-a.nota:s==='baixa'?a.nota-b.nota:b.util-a.util);
      box.innerHTML = (L.length ? L.map(([r,i])=>reviewHTML(r,i)).join('') : `<div class="empty"><b>Nenhuma avaliação com esse filtro.</b><button class="btn btn-outline btn-sm" type="button" data-rf="todas">Ver todas</button></div>`)
        + `<p class="cap">Mostrando ${L.length} de ${n} avaliações. Neste protótipo, só algumas têm texto de exemplo.</p>`; };
    if($('#rv-sort')){ $('#rv-sort').addEventListener('change', drawRv); drawRv(); }
    // perguntas
    $('#ask-form').addEventListener('submit', e=>{ e.preventDefault(); const i=$('#ask-q'), v=i.value.trim();
      if(VC.fieldErr(i, v.length<10 ? 'Escreve a pergunta inteira, com pelo menos 10 letras, pra quem mora entender.' : '')) return;
      const L=store.get('perg:'+o.slug,[]); L.unshift({p:v.replace(/^./,c=>c.toUpperCase()), quem:'você', quando:'agora', r:[], avisados:Math.max(o.seguidores,3)}); store.set('perg:'+o.slug, L);
      $('#qa-list').innerHTML = qaList(o).map(qaHTML).join(''); i.value=''; VC.toast(`Pergunta enviada. Avisamos ${Math.max(o.seguidores,3)} moradores.`); });
    // cliques
    main.addEventListener('click', e=>{
      const g=e.target.closest('[data-goto]'); if(g){ e.preventDefault(); scrollTo(g.dataset.goto); return; }
      const ml=e.target.closest('[data-ml]'); if(ml){ const on=ml.getAttribute('aria-pressed')!=='true'; ml.setAttribute('aria-pressed',on); $$(`[data-layer="${ml.dataset.ml}"]`,mp).forEach(d=>d.hidden=!on); return; }
      const sg=e.target.closest('[data-seguir]'); if(sg){ let L=store.get('segue',[]); const on=!L.includes(o.slug); L=on?L.concat(o.slug):L.filter(x=>x!==o.slug); store.set('segue',L); sg.setAttribute('aria-pressed',on); sg.querySelector('span').textContent=on?'Seguindo o bairro':'Seguir o bairro'; VC.toast(on?`Pronto. A gente avisa quando ${de(nm)==='da'?'a':'o'} ${nm} tiver avaliação, pergunta ou imóvel novo.`:'Você deixou de seguir o bairro.'); return; }
      if(e.target.closest('[data-share]')){ VC.copy(location.href.split('#')[0]+'#bairro-'+o.slug); return; }
      if(e.target.closest('[data-busca]')){ VC.portal.setS({fin:'todos', bairros:[nm]}); VC.go('busca'); return; }
      const rfb=e.target.closest('[data-rf]'); if(rfb){ rf=rfb.dataset.rf; $$('[data-rf]',main).forEach(x=>x.setAttribute('aria-pressed', x.dataset.rf===rf)); drawRv(); return; }
      const ut=e.target.closest('[data-util]'); if(ut){ const r=o.reviews[+ut.dataset.util], k=r.nome+'|'+r.tit, U=store.get('util',{}); U[k]=!U[k]; store.set('util',U); ut.setAttribute('aria-pressed',!!U[k]); ut.querySelector('span').textContent=r.util+(U[k]?1:0); return; }
      const au=e.target.closest('[data-autil]'); if(au){ const on=au.getAttribute('aria-pressed')!=='true', s=au.querySelector('span'); au.setAttribute('aria-pressed',on); s.textContent=+s.textContent+(on?1:-1); return; }
      const at=e.target.closest('[data-askto]'); if(at){ scrollTo('perguntas'); const i=$('#ask-q'); i.value=`${at.dataset.askto}, `; setTimeout(()=>i.focus({preventScroll:true}),400); return; }
      if(e.target.closest('[data-denuncia]')){ denunciaModal(); return; }
      if(e.target.closest('[data-responder]')){ VC.modal(VC.mh('Responder pergunta','Só moradores e ex-moradores respondem com selo de morador.')+`<form class="modal-b" id="rs-form"><div class="field"><label for="rs-t">Sua resposta</label><textarea class="input" id="rs-t" placeholder="Conte o que você sabe, sem citar nomes de pessoas."></textarea><span class="hint" data-ok=""></span></div><button class="btn btn-primary" type="submit">Enviar resposta</button></form>`, {label:'Responder pergunta', onMount(el){ $('#rs-form',el).addEventListener('submit',ev=>{ ev.preventDefault(); const t=$('#rs-t',el); if(VC.fieldErr(t, t.value.trim().length<10?'Escreve um pouco mais pra resposta ajudar.':'')) return; el.querySelector('.modal').innerHTML=VC.mh('Responder pergunta')+`<div class="modal-b">${VC.okState('Resposta enviada.','A gente lê antes de publicar e avisa quem perguntou.')}</div>`; }); }}); return; }
    });
    // seção ativa no submenu
    const secs=subs.map(([k])=>document.getElementById(k)).filter(Boolean);
    const io=new IntersectionObserver(es=>{ es.forEach(en=>{ if(en.isIntersecting) $$('.subnav button').forEach(x=>x.setAttribute('aria-current', x.dataset.goto===en.target.id)); }); }, {rootMargin:'-30% 0px -60% 0px'});
    secs.forEach(s=>io.observe(s)); VC.onCleanup(()=>io.disconnect());
    if(m[2]) setTimeout(()=>scrollTo(m[2]), 80);
  }

  /* ===== QUESTIONÁRIO ===== */
  const STEPS = [['Vínculo','Sua relação com o bairro'],['Impressão geral','Nota e uma frase'],['Critérios','8 pontos, um toque cada'],['Fortes e fracos','Etiquetas e seu relato'],['Para quem combina','Opcional'],['Perguntas rápidas','Opcional'],['Dica de morador','Opcional']];
  const PCT = [14,29,43,57,71,86,100];
  const VINC = [['mora','Moro aqui','Avalia e conta na nota'],['morou','Já morei','Saiu há até 5 anos; conta na nota'],['trab','Trabalho ou estudo aqui','Comenta e responde perguntas'],['cor','Sou corretor ou imobiliária','Responde perguntas com selo Corretor']];
  const NOTA_L = ['','Ruim','Fraco','Regular','Bom','Ótimo'];
  const LUGARES = new Set(['Guará','Guaratinguetá','Dutra','Via','Buriti','Shopping','EEAR','UNESP','FEG','Santa','Casa','Estação','Paraíba','Rio','Centro','Mantiqueira','São','Paulo','UBS','Natal','Carnaval'].concat(D.bairros.flatMap(b=>b.n.split(' '))));
  function nomeSuspeito(txt){
    for(const s of txt.split(/[.!?…\n]+/)){ const w=s.trim().split(/\s+/).slice(1); for(const x of w){ const c=x.replace(/[^\p{L}]/gu,''); if(/^\p{Lu}\p{Ll}{2,}$/u.test(c) && !LUGARES.has(c)) return c; } }
    return '';
  }
  function avaliar(m){
    let o = m[1] ? AV.bySlug(m[1]) : AV.by('Pedregulho'); if(!o) o=AV.by('Pedregulho');
    const KEY='rascunho:'+o.slug;
    const S = Object.assign({step:1, vinc:null, tempo:null, moradia:null, posse:null, rua:'', nota:0, frase:'', denovo:null, crit:Array(8).fill(null), fortes:[], fracos:[], txt:'', perfis:[], quick:Array(11).fill(null), dica:'', whats:true}, store.get(KEY,{}));
    let err='', done=false;
    const save=()=>store.set(KEY, S);
    const conta = () => ['mora','morou'].includes(S.vinc);
    const falta = k => k===1 ? (!S.vinc ? 'Escolha sua relação com o bairro.' : conta()&&!S.tempo ? 'Diga há quanto tempo.' : '')
      : k===2 ? (!S.nota ? 'Dê uma nota de 1 a 5 estrelas.' : S.frase.trim().length<10 ? 'Resuma o bairro numa frase, com pelo menos 10 letras.' : !S.denovo ? 'Diga se moraria aqui de novo.' : '')
      : k===3 ? (S.crit.some(v=>v===null) ? `Falta ${S.crit.filter(v=>v===null).length===1?'1 critério':S.crit.filter(v=>v===null).length+' critérios'}. Se não souber, toque em “Não sei”.` : '')
      : k===4 ? (S.txt.trim().length<100 ? `Conte um pouco mais: faltam ${100-S.txt.trim().length} caracteres.` : '') : '';
    const chips = (key, list, max) => list.map(l=>`<button class="vchip" type="button" data-pick="${key}" data-v="${esc(l)}" aria-pressed="${S[key].includes(l)}">${esc(l)}</button>`).join('');
    const one = (key, list) => `<div class="row" role="group">${list.map(([v,l])=>`<button class="vchip" type="button" data-one="${key}" data-v="${v}" aria-pressed="${S[key]===v}">${l}</button>`).join('')}</div>`;
    const starBtns = (k, v, cls='') => `<div class="rate ${cls}" role="group" aria-label="${k==='nota'?'Nota geral':esc(AV.CRIT[k][2])}">${[1,2,3,4,5].map(i=>`<button type="button" data-rate="${k}" data-v="${i}" class="${i<=v?'on':''}" aria-label="${i} ${plural(i,'estrela','estrelas')}" aria-pressed="${v===i}">${ic('i-star')}</button>`).join('')}${k==='nota'&&v?`<b>${NOTA_L[v]}</b>`:''}</div>`;
    function body(){
      if(done) return `<div class="qz-body qz-done"><span class="blob">${ic('i-check-s')}</span><div><h2>Pronto, sua avaliação foi enviada.</h2><p>Como é sua primeira avaliação, alguém da equipe lê antes de publicar. Costuma levar até 1 dia. A gente te avisa no WhatsApp.</p></div>
        <div class="panel" style="display:flex;flex-direction:column;gap:12px;width:100%"><div class="row">${ic('i-shield','i-20')}<b>Quer o selo de morador verificado?</b></div><p style="color:var(--ink-2);font-size:14px">Avaliações verificadas pesam mais na nota e aparecem primeiro. Escolha um jeito:</p>
          <div class="opts"><button class="opt" type="button" data-verif="loc"><b>Pela localização</b><span class="cap">O celular confirma que você está no bairro em 2 noites diferentes. Nada é guardado depois.</span></button><button class="opt" type="button" data-verif="doc"><b>Por comprovante</b><span class="cap">Conta de luz, água ou contrato no seu nome. Apagado em até 30 dias.</span></button></div></div>
        <div class="row"><a class="btn btn-primary" href="#bairro-${o.slug}">Voltar para ${de(o.nome)==='da'?'a':'o'} ${esc(o.nome)}</a><button class="btn btn-outline" type="button" data-convite>${ic('i-share')}Chamar um vizinho para avaliar</button></div><span class="proto">Protótipo: nada foi enviado de verdade.</span></div>`;
      const s=S.step;
      if(s===1) return `<div class="qz-body"><div><h2>Qual é a sua relação com o bairro?</h2><p>Isso aparece ao lado da sua avaliação e define se ela entra na nota.</p></div>
        <div class="fld"><label for="qz-b">Bairro</label><select class="input" id="qz-b">${AV.list.map(x=>`<option value="${x.slug}" ${x===o?'selected':''}>${esc(x.nome)}</option>`).join('')}</select><span class="cap">Não é esse? Escolha o seu.</span></div>
        <div class="opts" role="group" aria-label="Sua relação com o bairro">${VINC.map(([v,l,d])=>`<button class="opt" type="button" data-one="vinc" data-v="${v}" aria-pressed="${S.vinc===v}"><b>${l}</b><span class="cap">${d}</span></button>`).join('')}</div>
        ${S.vinc&&!conta() ? `<div class="bp-note">${ic('i-info','i-20')}<span>${S.vinc==='cor'?'Corretores e imobiliárias não avaliam: eles têm interesse no resultado. Mas podem responder perguntas, com o selo Corretor.':'Quem trabalha ou estuda aqui não entra na nota, mas pode comentar e responder perguntas de quem está chegando.'}</span></div>`
        : `<div class="fld"><span>Há quanto tempo?</span>${one('tempo',[['<1','Menos de 1 ano'],['1-5','1 a 5 anos'],['5+','Mais de 5 anos']])}</div>
        <div class="row" style="gap:24px;align-items:flex-start"><div class="fld"><span>Você mora em <span class="cap">(opcional)</span></span>${one('moradia',[['casa','Casa'],['apto','Apartamento'],['cond','Condomínio fechado']])}</div><div class="fld"><span>Você <span class="cap">(opcional)</span></span>${one('posse',[['aluga','Aluga'],['dono','É dono']])}</div></div>
        <div class="fld"><label for="qz-rua">Sua rua <span class="cap">Opcional e privada: nunca aparece no site. Ajuda a mostrar o que muda de rua para rua.</span></label><input class="input" id="qz-rua" data-txt="rua" value="${esc(S.rua)}" placeholder="Ex.: Rua das Palmeiras" autocomplete="street-address"></div>`}</div>`;
      if(s===2) return `<div class="qz-body"><div><h2>No geral, que nota você dá para morar aqui?</h2><p>Não precisa ser a média dos detalhes. Pese o que importa para você.</p></div>${starBtns('nota',S.nota)}
        <div class="fld"><label for="qz-frase">Resuma o bairro em uma frase</label><input class="input" id="qz-frase" data-txt="frase" maxlength="80" value="${esc(S.frase)}" placeholder="Ex.: Bairro de vizinho que cumprimenta e criança na pracinha"><span class="cap" data-count="frase">${S.frase.length} de 80 caracteres · vira o título da sua avaliação</span></div>
        <div class="fld"><span>Você moraria aqui de novo?</span>${one('denovo',[['sim','Sim'],['talvez','Talvez'],['nao','Não']])}</div></div>`;
      if(s===3) return `<div class="qz-body"><div><h2>Agora, ponto por ponto</h2><p>Um toque por linha. Não sabe avaliar algum? Marque “Não sei”.</p></div><div>${AV.CRIT.map((c,k)=>`<div class="crit-r"><div><b>${c[2]}</b><span class="cap">${c[3]}</span></div>${starBtns(k,S.crit[k]||0,'sm')}<button class="vchip" type="button" data-ns="${k}" aria-pressed="${S.crit[k]===0}">Não sei</button></div>`).join('')}</div></div>`;
      if(s===4){ const nome=nomeSuspeito(S.txt); return `<div class="qz-body"><div><h2>O que tem de bom e de ruim?</h2><p>Escolha até 5 de cada lado e conte com suas palavras.</p></div>
        <div class="fld"><span class="lbl-up" data-cnt="fortes">Pontos fortes · ${S.fortes.length} de 5</span><div class="row">${chips('fortes',AV.FORTES)}</div></div>
        <div class="fld"><span class="lbl-up" data-cnt="fracos">Pontos fracos · ${S.fracos.length} de 5</span><div class="row">${chips('fracos',AV.FRACOS)}</div></div>
        <div class="fld"><label for="qz-txt">Conte como é morar aqui</label><textarea class="input" id="qz-txt" data-txt="txt" rows="5" placeholder="O que você conta para um amigo que pensa em se mudar para cá?">${esc(S.txt)}</textarea><span class="cap row" style="justify-content:space-between"><span>Mínimo de 100 caracteres</span><span data-count="txt">${S.txt.trim().length}${S.txt.trim().length>=100?' ✓':''}</span></span></div>
        <div class="bp-note warn" id="qz-nome" ${nome?'':'hidden'}>${ic('i-warn','i-20')}<span>Achamos o que parece um nome de pessoa no texto (“<b>${esc(nome)}</b>”). Antes de publicar, a gente avisa se algo precisar sair.</span></div></div>`; }
      if(s===5) return `<div class="qz-body"><div><h2>Para quem o bairro combina?</h2><p>Marque quantos quiser. Vira o filtro “bairros que combinam com” na busca.</p></div><div class="row">${chips('perfis',AV.PERFIS.map(p=>p[1]))}</div></div>`;
      if(s===6) return `<div class="qz-body"><div><h2>Perguntas rápidas</h2><p>Sim, não ou não sei. Viram o bloco “O que dizem os moradores”.</p></div><div>${AV.QUICK.map((q,k)=>{ const L=k===10?['Melhorando','Igual','Piorando']:['Sim','Não','Não sei']; return `<div class="qrow"><span>${k+1}. ${q[0]}</span><div class="seg" role="group" aria-label="${esc(q[0])}">${L.map((l,j)=>`<button type="button" data-q="${k}" data-v="${j}" aria-pressed="${S.quick[k]===j}">${l}</button>`).join('')}</div></div>`; }).join('')}</div></div>`;
      return `<div class="qz-body"><div><h2>Uma dica que só quem mora sabe <span class="cap">(opcional)</span></h2><p>A melhor padaria, a rua que alaga, o horário de trânsito na saída da escola.</p></div>
        <div class="fld"><label class="sr" for="qz-dica">Sua dica</label><textarea class="input" id="qz-dica" data-txt="dica" rows="4" placeholder="Ex.: A padaria da praça abre às 5h30 e o pão de queijo acaba às 8h.">${esc(S.dica)}</textarea></div>
        <div class="fld"><span>Fotos do bairro <span class="cap">até 3 · sem rostos nem placas de carro</span></span><div class="ph-add"><button type="button" data-foto>+ Adicionar foto</button><button type="button" data-foto>+ Adicionar foto</button><button type="button" data-foto>+ Adicionar foto</button></div></div>
        <label class="check" style="padding:0"><input type="checkbox" id="qz-wa" ${S.whats?'checked':''}> Pode me avisar por WhatsApp quando alguém fizer uma pergunta sobre o bairro.</label></div>`;
    }
    function draw(){
      const s=S.step, p=done?100:PCT[s-1];
      $('#qz-steps').innerHTML = STEPS.map(([l,h],i)=>{ const k=i+1; return `<li><button type="button" data-step="${k}" class="${!done&&k<s||done?'past':''}" ${!done&&k===s?'aria-current="step"':''}><span>${done||k<s?'✓':k}</span><span><span>${l}</span><small>${h}</small></span></button></li>`; }).join('');
      $('#qz-prog').innerHTML = `<div><span class="lbl-up">${done?'Concluído':`Etapa ${s} de 7`}</span><span class="cap">${done?'Avaliação 100% completa':`Sua avaliação está ${p}% completa`}</span></div><div class="vbar g" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso"><i style="width:${p}%"></i></div>`;
      $('#qz-body').innerHTML = body();
      const nav=$('#qz-nav'); nav.hidden=done;
      if(!done){ const stop = s===1 && S.vinc && !conta();
        nav.innerHTML = `<button class="btn btn-ghost" type="button" data-nav="-1" ${s===1?'disabled':''}>Voltar</button><span class="${err?'qz-err':'cap'}" role="status">${err||'Salvo automaticamente'}</span>${stop?`<a class="btn btn-primary" href="#bairro-${o.slug}/perguntas">Ver perguntas do bairro</a>`:`<button class="btn btn-primary" type="button" data-nav="1">${s===7?'Enviar avaliação':s>=5?'Continuar ou pular':'Continuar'}</button>`}`; }
    }
    const html = `<div class="wrap"><nav class="crumbs" aria-label="Você está em"><a href="#bairros">Bairros</a>›<a href="#bairro-${o.slug}">${esc(o.nome)}</a>›<span>Avaliar o bairro</span></nav>
      <div class="qz"><aside><div><span class="eyebrow">Sua avaliação</span><h1>Como é morar ${prep(o.nome)} ${esc(o.nome)}?</h1><p>Leva uns 3 minutos. As etapas 1 a 4 são obrigatórias.</p></div>
        <ol id="qz-steps" aria-label="Etapas"></ol>
        <div class="panel rules"><b>Antes de começar</b><span>Fale do bairro, não de um vizinho. Não cite nomes de pessoas nem identifique casas.</span><a class="lnk" href="#metodologia">Regras da comunidade</a></div></aside>
        <section class="qz-main" aria-label="Questionário"><div class="qz-prog" id="qz-prog"></div><div id="qz-body"></div><div class="qz-nav" id="qz-nav"></div></section></div></div>`;
    VC.mount('portal', html, {nav:'bairros', title:'Avaliar '+o.nome});
    draw();
    const root=$('.qz');
    const go = k => { err=''; S.step=Math.max(1,Math.min(7,k)); save(); draw(); $('.qz-main').scrollIntoView({behavior:'smooth', block:'nearest'}); };
    root.addEventListener('click', e=>{
      const st=e.target.closest('[data-step]'); if(st){ if(!done) go(+st.dataset.step); return; }
      const nv=e.target.closest('[data-nav]'); if(nv){ const d=+nv.dataset.nav; if(d<0){ go(S.step-1); return; }
        if(S.step<=4){ err=falta(S.step); if(err){ draw(); return; } }
        if(S.step===7){ const f=[1,2,3,4].find(k=>falta(k)); if(f){ S.step=f; err=falta(f); draw(); return; }
          store.set('av:'+o.slug, {nota:S.nota, frase:S.frase, quando:new Date().toLocaleDateString('pt-BR')}); store.set(KEY, {}); done=true; draw(); window.scrollTo({top:0, behavior:'smooth'}); return; }
        go(S.step+1); return; }
      const on=e.target.closest('[data-one]'); if(on){ S[on.dataset.one]=on.dataset.v; err=''; save(); draw(); return; }
      const rt=e.target.closest('[data-rate]'); if(rt){ const k=rt.dataset.rate, v=+rt.dataset.v; if(k==='nota') S.nota=v; else S.crit[+k]=v; err=''; save(); draw(); return; }
      const ns=e.target.closest('[data-ns]'); if(ns){ const k=+ns.dataset.ns; S.crit[k] = S.crit[k]===0 ? null : 0; save(); draw(); return; }
      const pk=e.target.closest('[data-pick]'); if(pk){ const key=pk.dataset.pick, v=pk.dataset.v, a=S[key];
        if(a.includes(v)) S[key]=a.filter(x=>x!==v); else { if(key!=='perfis' && a.length>=5){ VC.toast('Já são 5. Tire uma etiqueta para escolher outra.'); return; } a.push(v); }
        pk.setAttribute('aria-pressed', S[key].includes(v)); const c=$(`[data-cnt="${key}"]`); if(c) c.textContent=`${key==='fortes'?'Pontos fortes':'Pontos fracos'} · ${S[key].length} de 5`; save(); return; }
      const q=e.target.closest('[data-q]'); if(q){ const k=+q.dataset.q, v=+q.dataset.v; S.quick[k]=S.quick[k]===v?null:v; $$(`[data-q="${k}"]`).forEach(x=>x.setAttribute('aria-pressed', S.quick[k]===+x.dataset.v)); save(); return; }
      if(e.target.closest('[data-foto]')){ VC.toast('Enviar fotos não faz parte deste protótipo.'); return; }
      const vf=e.target.closest('[data-verif]'); if(vf){ vf.setAttribute('aria-pressed','true'); VC.toast(vf.dataset.verif==='loc'?'Combinado. Nas próximas 2 noites o celular confirma que você está no bairro.':'A gente te manda o link para enviar o comprovante pelo WhatsApp.'); return; }
      if(e.target.closest('[data-convite]')){ VC.copy(location.href.split('#')[0]+'#avaliar-'+o.slug); return; }
    });
    root.addEventListener('input', e=>{ const i=e.target, k=i.dataset.txt; if(!k) return; S[k]=i.value; save();
      const c=$(`[data-count="${k}"]`); if(c) c.textContent = k==='frase' ? `${i.value.length} de 80 caracteres · vira o título da sua avaliação` : `${i.value.trim().length}${i.value.trim().length>=100?' ✓':''}`;
      if(k==='txt'){ const nm=nomeSuspeito(i.value), box=$('#qz-nome'); box.hidden=!nm; if(nm) box.querySelector('b').textContent=nm; } });
    root.addEventListener('change', e=>{ if(e.target.id==='qz-b'){ save(); VC.go('avaliar-'+e.target.value); } if(e.target.id==='qz-wa'){ S.whats=e.target.checked; save(); } });
  }

  /* ===== RANKING ===== */
  const RK = [
    ['geral','Melhores no geral','Melhores bairros para morar em Guará', o=>o.nota, o=>`${stars(o.nota,'sm')}<b>${fmt(o.nota)}</b>`, o=>`${o.n} avaliações · ${o.nov}% moraria de novo`],
    ['fam','Para famílias','Melhores bairros para famílias com crianças', o=>o.perfis.fam, o=>`<b>${o.perfis.fam}%</b>`, o=>`marcam “famílias com crianças” · nota ${fmt(o.nota)}`],
    ['carro','Para quem não tem carro','Melhores bairros para quem não tem carro', o=>o.crit[3]+o.crit[2]+GN[o.ind.cam]/5, o=>`<b>${fmt(o.crit[3])}</b>`, o=>`mobilidade · comércio a pé ${o.ind.cam} · ${o.quick[3][0]}% veem ônibus com frequência`],
    ['tranq','Mais tranquilos','Bairros mais tranquilos de Guará', o=>o.crit[1], o=>`<b>${fmt(o.crit[1])}</b>`, o=>`tranquilidade · ${o.quick[5][0]}% contam barulho à noite`],
    ['seg','Mais seguros','Bairros onde os moradores se sentem mais seguros', o=>o.crit[0], o=>`<b>${fmt(o.crit[0])}</b>`, o=>`segurança · ${o.quick[0][0]}% andam a pé à noite com tranquilidade`],
    ['pet','Para quem tem pet','Melhores bairros para quem tem pet', o=>o.perfis.pet, o=>`<b>${o.perfis.pet}%</b>`, o=>`marcam “quem tem pet” · nota ${fmt(o.nota)}`]
  ];
  function ranking(){
    const ranked = AV.list.filter(ok5), sem = AV.list.filter(o=>!ok5(o)).sort((a,b)=>b.n-a.n);
    const tot = AV.list.reduce((a,o)=>a+o.n,0);
    let k='geral';
    const html = `<section class="rk-hero"><div class="wrap"><span class="lbl-up">Bairros de Guará</span><h1>Os bairros de Guaratinguetá, contados por quem mora neles</h1>
      <p>${tot} avaliações de moradores em ${AV.list.length} bairros, mais dados públicos de escolas, ruas, segurança e enchentes.</p>
      <form id="rk-form" role="search">${ic('i-search','i-20')}<label class="sr" for="rk-q">Buscar bairro</label><input id="rk-q" list="rk-dl" placeholder="Qual bairro você quer conhecer?" autocomplete="off"><datalist id="rk-dl">${AV.list.map(o=>`<option value="${esc(o.nome)}">`).join('')}</datalist><button class="btn btn-primary" type="submit">Buscar</button></form><p class="rk-msg" id="rk-msg" role="status"></p></div></section>
      <div class="wrap"><div class="rk-tabs" role="tablist" aria-label="Rankings">${RK.map((r,i)=>`<button class="vchip" type="button" role="tab" data-rk="${r[0]}" aria-selected="${i===0}">${r[1]}</button>`).join('')}</div>
      <div class="rk"><section aria-live="polite"><div><div><h2 id="rk-t"></h2><span class="cap">Só entram bairros com 5 ou mais avaliações · nov/2026</span></div><a class="btn btn-outline btn-sm" href="#comparar">Comparar bairros</a></div><ol id="rk-list"></ol></section>
        <aside><div class="panel"><h2>Ainda sem nota</h2><p>Estes bairros têm menos de 5 avaliações. Já mostramos dados públicos e os relatos que chegaram.</p><ul>${sem.map(o=>`<li><a href="#bairro-${o.slug}">${esc(o.nome)}</a><span class="cap">${relatos(o)}</span></li>`).join('')}</ul><a class="btn btn-primary" href="#avaliar-${sem[0]?sem[0].slug:''}">Avaliar meu bairro</a></div>
          <div class="panel"><h2>Como montamos o ranking</h2><p>A nota parte da média da cidade e se aproxima da média do bairro conforme as avaliações chegam. Assim, um bairro com 2 notas 5 não passa à frente de um com 30 avaliações.</p><a class="lnk" href="#metodologia">Ler a metodologia ${ic('i-arrow')}</a></div></aside></div></div>`;
    VC.mount('portal', html, {nav:'bairros', title:'Bairros de Guará'});
    const draw=()=>{ const r=RK.find(x=>x[0]===k); $('#rk-t').textContent=r[2];
      $('#rk-list').innerHTML = ranked.slice().sort((a,b)=>r[3](b)-r[3](a)).map((o,i)=>`<li><b>${i+1}</b><div class="nm"><span class="hood-n" style="font-size:12px">${esc(o.zona)}</span><a href="#bairro-${o.slug}">${esc(o.nome)}</a></div><div class="row">${(o.tags||[]).map(([t])=>`<span class="vtag">${esc(t)}</span>`).join('')}</div><div class="sc"><span>${r[4](o)}</span><span class="cap">${r[5](o)}</span></div></li>`).join(''); };
    draw();
    $('.rk-tabs').addEventListener('click', e=>{ const b=e.target.closest('[data-rk]'); if(!b) return; k=b.dataset.rk; $$('[data-rk]').forEach(x=>x.setAttribute('aria-selected', x===b)); draw(); });
    $('#rk-form').addEventListener('submit', e=>{ e.preventDefault(); const q=norm($('#rk-q').value.trim()); if(!q) return; const o=AV.list.find(x=>norm(x.nome)===q) || AV.list.find(x=>norm(x.nome).includes(q));
      if(o) VC.go('bairro-'+o.slug); else $('#rk-msg').textContent='Não achamos esse bairro. Tenta só uma parte do nome, como “Padroeira”.'; });
  }

  /* ===== COMPARADOR ===== */
  const minOf = s => parseInt(String(s),10);
  const CMP = [
    ['Moradores'],
    ['Nota geral', o=>ok5(o)?o.nota:null, o=>ok5(o)?`${fmt(o.nota)} ★ · ${o.n} avaliações`:`Poucas avaliações (${o.n})`, 1],
    ['Moraria aqui de novo', o=>ok5(o)?o.nov:null, o=>ok5(o)?o.nov+'%':'—', 1],
    ...AV.CRIT.map((c,k)=>[c[2], o=>ok5(o)?o.crit[k]:null, o=>ok5(o)?fmt(o.crit[k]):'—', 1]),
    ['O que dizem'],
    ['Andar a pé à noite', o=>ok5(o)?o.quick[0][0]:null, o=>ok5(o)?o.quick[0][0]+'% sim':'—', 1],
    ['Alguma rua alaga', o=>ok5(o)?o.quick[1][0]:null, o=>ok5(o)?o.quick[1][0]+'% sim':'—', -1],
    ['Ônibus com frequência', o=>ok5(o)?o.quick[3][0]:null, o=>ok5(o)?o.quick[3][0]+'% sim':'—', 1],
    ['Combina com', ()=>null, o=>ok5(o)?AV.PERFIS.map(([k,l])=>[l,o.perfis[k]]).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0].split(' (')[0]).join(', '):'—', 0],
    ['Dados públicos'],
    ['Caminhabilidade', o=>GN[o.ind.cam], o=>o.ind.cam, 1],
    ['Verde e lazer', o=>GN[o.ind.verde], o=>o.ind.verde, 1],
    ['Para famílias', o=>GN[o.ind.fam], o=>o.ind.fam, 1],
    ['Área de risco de enchente', o=>o.ench.lv, o=>o.ench.onde, -1],
    ['Renda mediana do responsável', ()=>null, o=>o.renda, 0],
    ['Centro de carro', o=>minOf(o.centro), o=>o.centro, -1],
    ['Preços'],
    ['m² pedido, venda', o=>o.m2, o=>brl(o.m2), -1],
    ['Aluguel 2 quartos', o=>o.alug2q, o=>brl(o.alug2q), -1],
    ['Imóveis anunciados', ()=>null, o=>String(D.imoveis.filter(i=>i.bairro===o.nome).length), 0]
  ];
  function comparar(m){
    let sel = (m[1]||'pedregulho,vila-paraiba,jardim-padroeira').split(',').map(AV.bySlug).filter(Boolean);
    const fill = AV.list.filter(o=>ok5(o)&&!sel.includes(o)); while(sel.length<3) sel.push(fill.shift()); sel=sel.slice(0,3);
    const names = sel.map(o=>o.nome);
    const rows = CMP.map(r=>{
      if(r.length===1) return `<tr><th colspan="4" scope="colgroup">${r[0]}</th></tr>`;
      const vals=sel.map(r[1]), dir=r[3], valid=dir && vals.every(v=>v!=null);
      const best = valid ? (dir>0?Math.max(...vals):Math.min(...vals)) : null, ties = valid ? vals.filter(v=>v===best).length : 0;
      return `<tr><th scope="row">${r[0]}</th>${sel.map((o,i)=>{ const b=valid && ties<3 && vals[i]===best; return `<td class="${b?'best':''}">${b?`<span>${ic('i-check','i-12')}${esc(r[2](o))}<span class="sr"> (melhor)</span></span>`:esc(r[2](o))}</td>`; }).join('')}</tr>`;
    }).join('');
    const html = `<div class="wrap"><nav class="crumbs" aria-label="Você está em"><a href="#bairros">Bairros</a>›<span>Comparar</span></nav>
      <div class="cp-h"><div><span class="eyebrow">Comparador de bairros</span><h1>${esc(names[0])}, ${esc(names[1])} ou ${esc(names[2])}?</h1><p>O verde marca o melhor dos três em cada linha. Primeiro a nota dos moradores, depois o que eles dizem, os dados públicos e os preços.</p></div>
        <div class="row"><button class="btn btn-ghost btn-sm" type="button" id="cp-share">${ic('i-share')}Enviar comparação</button></div></div>
      <div class="cp-box"><table class="cp"><caption class="sr">Comparação entre ${esc(names.join(', '))}</caption><thead><tr><th scope="col"><span class="cap">3 bairros · troque pelo menu</span></th>
        ${sel.map((o,i)=>`<th scope="col"><div><span class="hood-n" style="font-size:12px">${esc(o.zona)}</span><label class="sr" for="cp-s${i}">Bairro ${i+1}</label><select class="sel" id="cp-s${i}" data-cp="${i}">${AV.list.map(x=>`<option value="${x.slug}" ${x===o?'selected':''} ${x!==o&&sel.includes(x)?'disabled':''}>${esc(x.nome)}</option>`).join('')}</select><a class="lnk" href="#bairro-${o.slug}">Ver página</a></div></th>`).join('')}</tr></thead>
        <tbody>${rows}<tr><td></td>${sel.map(o=>`<td><button class="btn btn-outline btn-sm" type="button" data-cpb="${esc(o.nome)}">Ver imóveis</button></td>`).join('')}</tr></tbody></table></div>
      <p class="src">${ic('i-info')}<span>Linhas sem destaque não têm “melhor” (renda, perfil, quantidade) ou falta nota de algum bairro. <a class="lnk" href="#metodologia">Como calculamos</a></span></p></div>`;
    VC.mount('portal', html, {nav:'bairros', title:'Comparar bairros'});
    $('.cp').addEventListener('change', e=>{ const s=e.target.closest('[data-cp]'); if(!s) return; const L=sel.map(o=>o.slug); L[+s.dataset.cp]=s.value; VC.go('comparar-'+L.join(',')); });
    $('.cp').addEventListener('click', e=>{ const b=e.target.closest('[data-cpb]'); if(b){ VC.portal.setS({fin:'todos', bairros:[b.dataset.cpb]}); VC.go('busca'); } });
    $('#cp-share').addEventListener('click', ()=>VC.copy(location.href.split('#')[0]+'#comparar-'+sel.map(o=>o.slug).join(',')));
  }

  /* ===== METODOLOGIA ===== */
  const TOC = [['camadas','As três camadas'],['quem','Quem pode avaliar'],['criterios','Os 8 critérios'],['nota','Como a nota é calculada'],['verificacao','Verificação de moradores'],['rapidas','Perguntas rápidas e perfis'],['dados','Dados públicos'],['indicadores','Indicadores de A a E'],['moderacao','Moderação e regras'],['privacidade','Privacidade'],['limites','Limites']];
  function metodologia(){
    const ext = (u,t) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
    const html = `<section class="mt-hero"><div class="wrap"><span class="lbl-up">Metodologia · versão 1.0 · nov/2026</span><h1>Como avaliamos os bairros de Guaratinguetá</h1><p>Toda nota, porcentagem e letra que aparece numa página de bairro vem de um lugar. Aqui contamos de onde, como calculamos e o que ainda não sabemos.</p></div></section>
    <div class="wrap mt"><nav aria-label="Nesta página"><span class="lbl-up" style="padding:0 0 8px 12px">Nesta página</span>${TOC.map(([k,l])=>`<button type="button" data-goto="mt-${k}">${l}</button>`).join('')}</nav>
    <main>
      <section id="mt-camadas"><h2>As três camadas</h2><p>Cada página de bairro junta três tipos de informação. Elas aparecem lado a lado e nunca misturadas sem aviso: quando o morador e o dado discordam, a gente mostra os dois.</p>
        <div class="g3"><div class="panel"><span class="grade gA">1</span><b>Avaliações</b><span>Notas e relatos de quem mora ou morou no bairro.</span></div><div class="panel"><span class="grade gB">2</span><b>Perguntas e respostas</b><span>Quem está procurando pergunta; quem mora responde.</span></div><div class="panel"><span class="grade gD">3</span><b>Dados públicos</b><span>IBGE, INEP, SSP-SP, Defesa Civil e mapas abertos.</span></div></div></section>
      <section id="mt-quem"><h2>Quem pode avaliar</h2><p>Toda avaliação mostra o vínculo de quem escreveu. Só moradores e ex-moradores recentes entram na nota. Corretores podem ajudar respondendo perguntas, mas não avaliam: eles têm interesse no resultado.</p>
        <div class="tbox"><table><thead><tr><th scope="col">Vínculo</th><th scope="col">Pode</th><th scope="col">Conta na nota</th></tr></thead><tbody>${[['Moro aqui','Avaliar e responder','Sim'],['Já morei (saí há até 5 anos)','Avaliar e responder','Sim, com selo “ex-morador”'],['Trabalho ou estudo aqui','Comentar e responder','Não'],['Corretor ou imobiliária','Responder, com selo “Corretor”','Não'],['Visitante','Perguntar e marcar útil','Não']].map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        <p>Cada pessoa tem uma avaliação por bairro. Ela pode ser atualizada; a data da última edição aparece e o histórico fica guardado.</p></section>
      <section id="mt-criterios"><h2>Os 8 critérios</h2><p>O morador dá uma nota geral, perguntada direto, e uma nota de 1 a 5 em cada critério. A nota geral não é a média dos critérios: cada um pesa o que importa para si, e os critérios mostram o porquê. Todo critério aceita “Não sei avaliar”, que não entra na conta.</p>
        <div class="crit8">${[['Segurança','Andar a pé de dia e à noite, furtos, sensação de segurança'],['Tranquilidade','Barulho, movimento, vizinhança'],['Comércio e serviços','Mercado, padaria, farmácia a pé'],['Mobilidade','Ônibus, acesso de carro, trânsito, calçadas'],['Escolas e creches','Oferta e qualidade, públicas e particulares'],['Saúde','UBS, pronto-socorro e hospitais por perto'],['Lazer e natureza','Praças, parques, áreas verdes'],['Infraestrutura','Asfalto, iluminação, água, internet, enchentes']].map(([a,b])=>`<div><b>${a}</b><span class="cap">${b}</span></div>`).join('')}</div></section>
      <section id="mt-nota"><h2>Como a nota é calculada</h2><p>Em Guaratinguetá muitos bairros têm poucas avaliações. Se a nota fosse a média simples, um bairro com duas notas 5 passaria à frente de outro com 30 avaliações. Por isso a nota parte da média da cidade e vai se aproximando da média do bairro conforme as avaliações chegam.</p>
        <div class="formula"><div><span>Nota exibida =</span><span class="frac"><span>C × m + soma das notas do bairro</span><span>C + n</span></span></div><div><span><b>m</b> = média de Guaratinguetá</span><span><b>n</b> = avaliações do bairro</span><span><b>C</b> = 5, o peso da média da cidade</span></div></div>
        <div class="ex"><div class="panel"><span class="lbl-up">Exemplo 1</span><b>2 avaliações, as duas nota 5</b><span>Com a média da cidade em 3,9: (5 × 3,9 + 10) ÷ 7</span><b>4,2 <span class="cap">e não 5,0</span></b></div><div class="panel"><span class="lbl-up">Exemplo 2</span><b>30 avaliações, média 4,3</b><span>(5 × 3,9 + 129) ÷ 35</span><b>4,2 <span class="cap">quase a média própria</span></b></div></div>
        <div class="notes">${[['Mínimos.','Notas por critério aparecem a partir de 3 avaliações; nota geral e rankings, a partir de 5. Abaixo disso mostramos os relatos, sem número.'],['Tempo.','Avaliações dos últimos 3 anos têm peso cheio; de 3 a 5 anos, meio peso. Com mais de 5 anos saem do cálculo e continuam visíveis como “avaliação antiga”.'],['Verificação.','Avaliação de morador verificado pesa 1,5; de morador declarado, 1.'],['Revisão.','Os valores de C, dos mínimos e dos pesos serão revistos depois das primeiras avaliações, e a mudança fica registrada nesta página.']].map(([a,b])=>`<div>${ic('i-info')}<span><b>${a}</b> ${b}</span></div>`).join('')}</div></section>
      <section id="mt-verificacao"><h2>Verificação de moradores</h2><p>Todo mundo entra com o celular confirmado por SMS ou WhatsApp, uma conta por número. O selo de morador verificado é opcional e pode vir de três jeitos.</p>
        <div class="g3"><div class="panel">${ic('i-pin','i-20')}<b>Localização</b><span>O celular confirma estar no bairro em 2 noites diferentes. Guardamos só o resultado, não o trajeto.</span></div><div class="panel">${ic('i-doc','i-20')}<b>Comprovante</b><span>Conta de luz, água ou contrato no nome. Uma pessoa confere e o arquivo é apagado em até 30 dias.</span></div><div class="panel">${ic('i-key','i-20')}<b>Cliente ValeCasa</b><span>Quem comprou ou alugou por um anúncio do ValeCasa recebe o convite já verificado.</span></div></div></section>
      <section id="mt-rapidas"><h2>Perguntas rápidas e perfis</h2><p>As 11 perguntas de sim ou não viram frases como “82% dizem que dá para andar a pé à noite”. A porcentagem conta só quem respondeu sim ou não; “não sei” fica de fora. Cada frase aparece a partir de 5 respostas e sempre mostra quantas respostas teve.</p><p>Os perfis (“para quem combina”) somam as marcações dos moradores. Uma pessoa pode marcar vários, então os números não somam 100%. O filtro “bairros que combinam com” da busca usa os bairros em que mais da metade dos moradores marcou aquele perfil.</p></section>
      <section id="mt-dados"><h2>Dados públicos</h2><p>Todo bloco de dados mostra a fonte e a data. Os números do IBGE vêm em recortes de poucos quarteirões (setores censitários); a gente soma os que ficam dentro do limite de cada bairro.</p>
        <div class="tbox"><table><thead><tr><th scope="col">Tema</th><th scope="col">Fonte</th><th scope="col">Recorte</th><th scope="col">Atualização</th></tr></thead><tbody>${[
          ['Quem mora aqui', ext('https://biblioteca.ibge.gov.br/visualizacao/livros/liv102277.pdf','IBGE · Censo 2022, setores censitários'),'Setor, somado por bairro','A cada Censo'],
          ['Como é a rua', ext('https://agenciagov.ebc.com.br/noticias/202504/censo-2022-retrata-melhorias-na-infraestrutura-urbana-no-intervalo-de-uma-decada','IBGE · Censo 2022, entorno dos domicílios'),'Trecho de rua','A cada Censo'],
          ['Escolas', ext('https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos','INEP · Censo Escolar e IDEB'),'Cada escola','Anual (IDEB a cada 2 anos)'],
          ['Saúde e serviços', ext('https://metadadosgeo.ibge.gov.br/geonetwork_ibge/srv/api/records/517d0180-659e-41d8-81d3-b10d44de9b11','IBGE · CNEFE 2022')+' e CNES (DataSUS)','Cada estabelecimento','Mensal (CNES)'],
          ['Comércio a pé','OpenStreetMap','Cada ponto','Trimestral'],
          ['Enchente', ext('https://guaratingueta.sp.gov.br/wp-content/uploads/2025/05/PLANCON-Jd-Tamandare.pdf','Defesa Civil de Guaratinguetá')+' e Serviço Geológico do Brasil','Área de risco mapeada','Quando o plano muda'],
          ['Segurança', ext('https://www.ssp.sp.gov.br/estatistica/consultas','SSP-SP · estatísticas criminais'),'Delegacia e ocorrências com local','Mensal'],
          ['Tempo de deslocamento','Rotas calculadas sobre o OpenStreetMap','Centro do bairro','Trimestral'],
          ['Preços','Anúncios ativos do ValeCasa','Bairro','Diária']].map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        <p>Internet por fibra ainda não tem dado público confiável por bairro, por isso ela aparece só nas respostas dos moradores.</p></section>
      <section id="mt-indicadores"><h2>Indicadores de A a E</h2><p>Os dados viram 5 indicadores. A letra compara o bairro com os outros bairros de Guaratinguetá: A são os 20% melhores da cidade, E os 20% piores. Ela não compara com outras cidades.</p>
        <div class="scale">${grade('A')}20% melhores${grade('B')}${grade('C')}${grade('D')}${grade('E')}20% piores da cidade</div>
        <div class="ind">${[['Caminhabilidade','Quantos de 10 tipos de comércio e serviço (mercado, padaria, farmácia, banco, academia…) existem a 10 minutos a pé, mais calçada e iluminação do Censo.'],['Verde e lazer','Porcentagem de moradores em ruas arborizadas, mais praças e parques a até 800 m.'],['Para famílias','Creches e escolas a até 1 km, IDEB das escolas públicas próximas e praças.'],['Infraestrutura','Pavimentação e bueiros do Censo, e a parte do bairro em área de risco de enchente.'],['Acesso','Tempo de carro e de ônibus até o centro, a Dutra, a rodoviária, a EEAR e a UNESP.']].map(([a,b])=>`<div class="panel"><div><b>${a}</b><p>${b}</p></div></div>`).join('')}</div>
        <div class="bp-note">${ic('i-shield','i-20')}<span><b>Segurança com responsabilidade.</b> Com poucos registros por bairro, números absolutos assustam e estigmatizam. Por isso a segurança aparece sempre comparada com a média da cidade e com a tendência dos últimos 12 meses. Quando há poucos registros, dizemos isso em vez de dar uma letra. Nunca chamamos um bairro de “perigoso”.</span></div></section>
      <section id="mt-moderacao"><h2>Moderação e regras da comunidade</h2>
        <div class="pn"><div class="panel"><b class="lbl-up" style="color:var(--brand-text)">Pode</b><ul><li>Falar bem e mal do bairro</li><li>Contar sua experiência real</li><li>Dar dicas práticas</li><li>Discordar de outra avaliação</li></ul></div><div class="panel"><b class="lbl-up" style="color:var(--vc-coral)">Não pode</b><ul><li>Citar pessoas pelo nome ou identificar casas</li><li>Acusar alguém identificável de crime</li><li>Discriminar por raça, religião, origem, classe ou orientação</li><li>Propaganda, telefones e links</li></ul></div></div>
        <ol><li><b>Filtro automático</b> antes de publicar: palavrões, nomes, telefones, endereços completos e links voltam ao autor com sugestão de correção.</li><li><b>Leitura humana</b> da primeira avaliação de cada pessoa e de tudo que for denunciado.</li><li><b>Sinais de fraude:</b> várias avaliações do mesmo aparelho, picos num bairro, contas ligadas a corretores avaliando onde têm imóveis à venda.</li><li><b>Denúncias</b> têm prazo interno de análise e cada decisão fica registrada. Quem se sentir ofendido pode também enviar uma notificação formal.</li></ol>
        <p>Não pagamos por avaliação. Se houver sorteio, ele vale para qualquer avaliação completa, qualquer que seja a nota. Imobiliárias não pagam para mudar nota nem ordem das avaliações.</p></section>
      <section id="mt-privacidade"><h2>Privacidade</h2><p>Avaliações públicas mostram só primeiro nome e inicial. Rua, localização e comprovantes ficam privados, servem só para verificar e têm prazo para serem apagados. Você pode pedir a exclusão da sua conta e das suas avaliações a qualquer momento, como garante a LGPD.</p></section>
      <section id="mt-limites"><h2>O que ainda não sabemos</h2><ul><li>Avaliações são opiniões. Um bairro com poucas avaliações pode mudar bastante de nota.</li><li>O Censo é de 2022. Bairros que cresceram depois disso podem estar diferentes.</li><li>O preço mostrado é o pedido nos anúncios, não o valor pelo qual o imóvel foi vendido.</li><li>O limite de cada bairro segue o mapa da prefeitura. Quando há dúvida sobre uma rua, ela aparece nos dois bairros vizinhos.</li></ul>
        <div class="panel row" style="justify-content:space-between"><span>Encontrou um erro num dado? <b>Avisa a gente</b> e corrigimos.</span><button class="btn btn-outline btn-sm" type="button" data-erro>Falar com o ValeCasa</button></div><span class="cap">Histórico: v1.0 · nov/2026 · primeira versão.</span></section>
    </main></div>`;
    VC.mount('portal', html, {nav:'bairros', title:'Como avaliamos os bairros'});
    $('#main').addEventListener('click', e=>{ const g=e.target.closest('[data-goto]'); if(g){ scrollTo(g.dataset.goto); return; } if(e.target.closest('[data-erro]')) VC.toast('O contato não faz parte deste protótipo.'); });
  }

  /* ===== bloco "Sobre o bairro" do anúncio ===== */
  VC.sobreBairro = function(im){
    const o=AV.by(im.bairro); if(!o) return '';
    const nm=o.nome, ok=ok5(o), rv=o.reviews[0];
    const g=o.ind, comMin = ({A:4,B:7,C:11,D:16,E:25})[g.cam], esc1 = escolas(o)[0];
    const crit=[0,1,2,4,7];
    return `<section class="sb" aria-labelledby="sb-h">
      <div class="sb-h"><div><span class="eyebrow">Sobre o bairro</span><h2 id="sb-h">Como é morar ${prep(nm)} <span class="hood-n">${esc(nm)}</span></h2><div class="row">${(ok?o.tags:o.relatos||[]).map(([t])=>`<span class="vtag">${esc(t)}</span>`).join('')}</div></div>
        ${ok?`<div class="sc"><b>${fmt(o.nota)}</b><div>${stars(o.nota)}<span class="cap">${o.n} avaliações de moradores</span></div></div>`:`<span class="cap" style="max-width:26ch">${o.n?`Poucas avaliações ainda (${o.n}). A nota aparece a partir de 5.`:'Ninguém avaliou o bairro ainda.'}</span>`}</div>
      <div class="sb-b">
        ${ok?`<div><span class="lbl-up">Nota por ponto</span>${crit.map(k=>`<div class="cr"><span>${AV.CRIT[k][1]}</span><div class="vbar"><i style="width:${o.crit[k]/5*100}%"></i></div><b>${fmt(o.crit[k])}</b></div>`).join('')}</div>`
          :`<div><span class="lbl-up">Dados públicos</span>${AV.IND.slice(0,4).map(([k,l])=>`<div class="row">${grade(g[k])}<span>${l}</span></div>`).join('')}</div>`}
        <div><span class="lbl-up">${rv?'Um morador conta':o.dica?'Dica de morador':'O jeito do bairro'}</span>${rv?`<q>${esc((rv.txt.split('. ').slice(1,3).join('. ')||rv.txt).replace(/\.?$/,'.'))}</q><span class="cap">${esc(rv.nome)} · ${rv.selo==='ver'?(rv.fem?'moradora verificada':'morador verificado'):'morador'} ${rv.tempo==='5+'?'há mais de 5 anos':''}</span>`:`<p>${esc(o.b.vibe)}</p>`}</div>
        <div><span class="lbl-up">Perto deste imóvel</span>
          <span class="near1">${ic('i-storefront')}Padaria e mercado a ${comMin} min a pé</span>
          <span class="near1">${ic('i-academic')}${esc(esc1[0].split(' ·')[0])} a ${esc1[1].split('· ')[1]}${esc1[2]?' · '+esc1[2]:''}</span>
          <span class="near1">${ic('i-car')}Centro a ${o.centro} de carro</span>
          <span class="near1">${ic(o.ench.lv?'i-warn':'i-check')}${o.ench.lv?`Bairro tem área de risco de enchente (${esc(o.ench.onde.toLowerCase())}). Pergunte sobre a rua.`:'Fora da área de risco de enchente'}</span></div>
      </div>
      <div class="sb-f"><span>Dúvida sobre a rua? <b>${o.seguidores} ${plural(o.seguidores,'morador','moradores')}</b> respondem perguntas.</span><a class="btn btn-outline btn-sm" href="#bairro-${o.slug}/perguntas">${ic('i-chat')}Perguntar a quem mora</a><a class="btn btn-ghost btn-sm" href="#bairro-${o.slug}">Ver página do bairro ${ic('i-arrow')}</a></div>
    </section>`;
  };

  VC.route(/^bairros$/, ranking);
  VC.route(/^bairro-([a-z0-9-]+)(?:\/([a-z]+))?$/, bairroPage);
  VC.route(/^avaliar(?:-([a-z0-9-]+))?$/, avaliar);
  VC.route(/^comparar(?:-([a-z0-9,-]+))?$/, comparar);
  VC.route(/^metodologia$/, metodologia);
})();
