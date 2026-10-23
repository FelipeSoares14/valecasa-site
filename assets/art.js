/* ValeCasa · imagens geradas do protótipo: fotos ilustrativas (cenas), plantas, mapa e skyline.
   As cenas ficam no lugar das fotos reais dos anúncios. */
window.VCArt = (function(){
  let uid = 0;
  function R(seed){ let s = ((seed+1)*2654435761)>>>0 || 7; return function(){ s ^= s<<13; s>>>=0; s ^= s>>>17; s ^= s<<5; s>>>=0; return s/4294967296; }; }
  const P = (r,a)=>a[Math.floor(r()*a.length)];
  const n = v => Math.round(v*10)/10;
  function shade(hex, amt){
    const c=parseInt(hex.slice(1),16); let r=c>>16, g=(c>>8)&255, b=c&255;
    const f = amt<0 ? x=>Math.round(x*(1+amt)) : x=>Math.round(x+(255-x)*amt);
    r=f(r); g=f(g); b=f(b);
    return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }
  const rect=(x,y,w,h,f,o='')=>`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${f}" ${o}/>`;
  const poly=(pts,f,o='')=>`<polygon points="${pts}" fill="${f}" ${o}/>`;
  const circ=(cx,cy,r,f,o='')=>`<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${f}" ${o}/>`;
  const ell=(cx,cy,rx,ry,f,o='')=>`<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${f}" ${o}/>`;
  const wrap = (inner)=>`<svg class="scene" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${inner}</svg>`;
  function grad(stops, x2=0, y2=1){ const id='vg'+(++uid); return {id, def:`<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map((c,i)=>`<stop offset="${i/(stops.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`}; }

  const SKIES=[['#86BCEB','#D9EBF8'],['#9CC6E8','#ECF3F7'],['#7AB0E0','#CFE5F5'],['#A6C9EA','#F2EEE6'],['#8FC0E6','#E5F0F6']];
  const WALLS=['#F2E8D8','#EBDDC5','#F6F2EA','#DDE4E8','#EADBD0','#E4E8DA','#F1E3C2','#E2DCEB','#F0D9C8'];
  const ROOFS=['#9A4A3A','#B5523F','#6B4F45','#53585F','#8A5A44','#A0624A'];

  function sky(r, h=300, pal){ const [t,b]=pal||P(r,SKIES); const g=grad([t,b]); return `<defs>${g.def}</defs>`+rect(0,0,400,h,`url(#${g.id})`)+clouds(r); }
  function clouds(r){ let s=''; const k=1+Math.floor(r()*3); for(let i=0;i<k;i++){ const x=20+r()*330, y=22+r()*55, w=34+r()*40; s+=`<g opacity=".9">${circ(x,y,w*.3,'#fff')}${circ(x+w*.34,y-7,w*.38,'#fff')}${circ(x+w*.72,y,w*.28,'#fff')}${rect(x,y-3,w*.75,w*.3,'#fff','rx="6"')}</g>`; } return s; }
  function mountains(r, y, c1='#9EB5CD', c2='#BCCDDE'){
    let a=`0,${y}`, b=`0,${y}`;
    for(let x=0;x<=400;x+=50) a+=` ${x},${n(y-26-r()*46)}`;
    for(let x=-20;x<=420;x+=36) b+=` ${x},${n(y-6-r()*22)}`;
    return poly(a+` 400,${y}`,c2)+poly(b+` 400,${y}`,c1);
  }
  function tree(x,y,s=1,c='#5F8F4A',c2='#4A7439'){ return rect(x-2.2*s,y-20*s,4.4*s,20*s,'#6B4F3A')+circ(x,y-30*s,15*s,c)+circ(x-10*s,y-21*s,11*s,c2)+circ(x+10*s,y-22*s,12*s,c); }
  function palm(x,y,s=1){ let o=rect(x-2*s,y-58*s,4*s,58*s,'#8A6A4A'); for(const a of [-60,-25,10,45,80,130,170]) o+=ell(x+Math.cos(a*Math.PI/180)*16*s,y-60*s+Math.sin(a*Math.PI/180)*6*s,18*s,4.5*s,'#4E8A45',`transform="rotate(${a} ${n(x+Math.cos(a*Math.PI/180)*16*s)} ${n(y-60*s+Math.sin(a*Math.PI/180)*6*s)})"`); return o; }
  function bush(x,y,w,c='#5A8A47'){ return ell(x,y,w,w*.55,c)+ell(x+w*.5,y+2,w*.7,w*.45,shade(c,-.1)); }
  function win(x,y,w,h,g='#86A9C8'){ return rect(x-2,y-2,w+4,h+4,'#F7F5F0')+rect(x,y,w,h,g)+rect(x,y,w,h*.42,shade(g,.2))+rect(x+w/2-1,y,2,h,'#F7F5F0')+rect(x-4,y+h+2,w+8,3,'#DDD8CE'); }
  function street(base){ return rect(0,base,400,12,'#D8D3C9')+rect(0,base+12,400,300-base-12,'#70757B')+[30,130,230,330].map(x=>rect(x,base+30,46,4,'#E8E6E1')).join(''); }

  function casa(seed){
    const r=R(seed), wall=P(r,WALLS), roof=P(r,ROOFS), base=228;
    let s=sky(r)+mountains(r,176)+rect(0,172,400,60,'#86B26A');
    const hx=50+(r()*40|0), hw=230+(r()*40|0), hh=86, top=base-hh;
    s+=tree(hx+hw+46,base-6,1.3)+tree(hx-30,base-8,1.05,'#6C9A55','#557F42');
    if(r()<.5){
      s+=rect(hx,top,hw,hh,wall)+rect(hx+hw*.58,top-20,hw*.42,hh+20,shade(wall,-.06));
      s+=rect(hx-8,top-6,hw*.58+8,8,'#EFECE6')+rect(hx+hw*.58-4,top-26,hw*.42+12,8,'#EFECE6');
      s+=rect(hx+hw*.6,top-14,hw*.12,hh+14,'#A86F45');
    } else {
      s+=poly(`${hx-16},${top+4} ${n(hx+hw/2)},${top-44} ${hx+hw+16},${top+4}`,roof);
      s+=poly(`${hx-16},${top+4} ${hx+hw+16},${top+4} ${hx+hw+10},${top+10} ${hx-10},${top+10}`,shade(roof,-.28));
      s+=rect(hx,top+10,hw,hh-10,wall);
    }
    s+=win(hx+16,top+26,44,30)+win(hx+72,top+26,44,30);
    s+=rect(hx+hw*.5+2,base-54,26,54,'#7A5236')+circ(hx+hw*.5+23,base-27,1.7,'#E8D9A8');
    const gx=hx+hw-84;
    s+=rect(gx,base-52,70,52,'#D4CFC5'); for(let y=base-48;y<base;y+=7) s+=rect(gx,y,70,1.4,'#B9B3A8');
    // muro, portão e calçada
    const mw=shade(wall,-.14);
    s+=rect(0,base-12,400,26,mw)+rect(0,base-14,400,3,shade(mw,.2));
    s+=rect(gx-6,base-30,82,44,'#3E4248');
    for(let x=gx-2;x<gx+74;x+=6) s+=rect(x,base-28,2,40,'#5A5F66');
    s+=bush(hx+20,base+2,18)+bush(hx+hw*.33,base+4,14,'#679A50');
    return wrap(s+street(base+14));
  }

  function sobrado(seed){
    const r=R(seed), wall=P(r,WALLS), base=232;
    let s=sky(r)+mountains(r,170)+rect(0,168,400,70,'#86B26A');
    const hx=70+(r()*30|0), hw=230, top=base-150;
    s+=tree(hx-26,base-6,1.2)+tree(hx+hw+34,base-4,1.35,'#6C9A55','#557F42');
    s+=rect(hx,top,hw,150,wall)+rect(hx+hw*.55,top-14,hw*.45,164,shade(wall,-.07));
    s+=rect(hx-8,top-6,hw*.55+8,8,'#EFECE6')+rect(hx+hw*.55-4,top-20,hw*.45+12,8,'#EFECE6');
    s+=rect(hx+18,top+22,90,46,'#86A9C8')+rect(hx+18,top+22,90,18,'#A6C1D8')+rect(hx+62,top+22,2,46,'#F7F5F0');
    s+=rect(hx+12,top+60,104,4,'#E6E1D8')+rect(hx+12,top+46,104,16,'rgba(190,215,235,.55)')+rect(hx+12,top+44,104,2,'#9AA5AE');
    s+=win(hx+hw*.6+6,top+20,54,34);
    s+=rect(hx+hw*.62,top+76,hw*.34,74,'#A86F45');
    s+=win(hx+20,top+96,46,32)+rect(hx+82,base-56,26,56,'#6E4A30');
    s+=rect(0,base-12,400,26,shade(wall,-.16))+rect(hx+hw*.6,base-28,hw*.38,42,'#3E4248');
    for(let x=hx+hw*.6+4;x<hx+hw*.98;x+=6) s+=rect(x,base-26,2,38,'#5A5F66');
    s+=bush(hx+30,base+2,16)+bush(hx+140,base+4,12,'#679A50');
    return wrap(s+street(base+14));
  }

  function apto(seed){
    const r=R(seed), wall=P(r,['#EDE8E0','#E4E7EA','#F1ECE4','#D9DEE4','#E9E1D6','#E8E0EE']), acc=P(r,['#B07A57','#7D8B99','#A8A29A','#5E6B78','#8A5A44']);
    let s=sky(r)+mountains(r,236,'#A9BCD0','#C3D2E0');
    s+=rect(14,130,84,170,'#C9D0D8'); for(let y=140;y<290;y+=16) s+=rect(22,y,68,7,'#AAB6C3');
    s+=rect(318,170,76,130,'#D3D8DE'); for(let y=180;y<290;y+=16) s+=rect(326,y,60,7,'#B4BFCB');
    const bx=118+(r()*24|0), bw=148+(r()*20|0), by=22+(r()*36|0);
    s+=rect(bx,by,bw,300-by,wall)+poly(`${bx+bw},${by} ${bx+bw+24},${by+12} ${bx+bw+24},300 ${bx+bw},300`,shade(wall,-.17));
    for(let y=by+12;y<270;y+=22){
      s+=rect(bx+8,y,bw-16,13,'#7FA3C4')+rect(bx+8,y,bw-16,5,'#A6C1D8')+rect(bx+bw*.5-1,y,2,13,wall);
      s+=rect(bx+4,y+13,bw-8,4,shade(wall,-.05))+rect(bx+6,y+8,bw-12,5,'rgba(220,235,245,.55)');
      s+=poly(`${bx+bw+4},${y+3} ${bx+bw+20},${y+11} ${bx+bw+20},${y+20} ${bx+bw+4},${y+12}`,'#8EA9C0');
    }
    s+=rect(bx+bw*.28,by,9,300-by,acc)+rect(bx-4,by-6,bw+8,8,shade(wall,-.1));
    s+=rect(0,270,400,30,'#7FA55F')+tree(100,284,1.2)+tree(300,288,1.4,'#6C9A55','#557F42')+bush(60,282,16)+bush(350,284,14);
    return wrap(s);
  }

  function torre(seed, o={}){
    const r=R(seed); const day=o.day!=null?o.day:r()<.35;
    const pal = day ? ['#6FA8DC','#B9D7EE','#EAF2F7'] : ['#2A0F6B','#6B2E8F','#D9708A','#F6B98A'];
    const g=grad(pal);
    let s=`<defs>${g.def}</defs>`+rect(0,0,400,300,`url(#${g.id})`);
    if(!day){ for(let i=0;i<18;i++) s+=circ(r()*400,r()*110,r()*1.1+.3,'#fff','opacity=".7"'); }
    s+=mountains(r,250, day?'#8EA6BF':'#3B2366', day?'#AFC2D5':'#55307E');
    const glass = day?'#7C9FC0':'#2E2A5C', glass2 = day?'#A8C3DA':'#47407A', frame= day?'#E9EDF1':'#BDB6D6';
    if((o.torres||2)>1){ const x=40+(r()*30|0); s+=rect(x,96,82,210,day?'#C8D1DB':'#3A2F68'); for(let y=104;y<300;y+=14){ s+=rect(x+6,y,70,8,day?'#9FB3C7':'#2A2350'); if(!day) for(let k=0;k<5;k++) if(r()<.3) s+=rect(x+8+k*13,y+1,9,6,'#FFD27A','opacity=".85"'); } }
    const bx=150+(r()*30|0), bw=120, by=14+(r()*30|0);
    s+=rect(bx,by,bw,300-by,glass)+poly(`${bx+bw},${by} ${bx+bw+30},${by+14} ${bx+bw+30},300 ${bx+bw},300`,shade(glass,-.25));
    for(let y=by+8;y<300;y+=14){
      s+=rect(bx,y+10,bw,4,frame)+rect(bx+4,y,bw-8,10,glass2,'opacity=".7"');
      for(let k=0;k<6;k++){ const lit=!day && r()<.42; s+=rect(bx+6+k*19,y+1,15,8, lit?'#FFD27A':(day?'#C8DCEC':'#3B3470'), lit?'opacity=".92"':'opacity=".6"'); }
      s+=poly(`${bx+bw+2},${y+4} ${bx+bw+28},${y+16} ${bx+bw+28},${y+19} ${bx+bw+2},${y+7}`,frame,'opacity=".7"');
    }
    s+=rect(bx-6,by-10,bw+12,10,frame)+rect(bx+30,by-22,40,12,shade(frame,-.1));
    s+=rect(0,272,400,28,day?'#6E9B57':'#2B1F4D')+rect(bx-30,258,bw+90,18,day?'#E7E2D8':'#4A3F78');
    s+=palm(bx-18,276,.9)+palm(bx+bw+48,278,1)+bush(60,284,18,day?'#5A8A47':'#3A3168')+bush(350,286,16,day?'#5A8A47':'#3A3168');
    return wrap(s);
  }

  function condominio(seed){
    const r=R(seed); let s=sky(r)+mountains(r,190)+rect(0,186,400,114,'#86B26A');
    const cols=['#F3EEE6','#E6E1D8','#EFE6DA'];
    for(let i=0;i<3;i++){
      const x=24+i*124, w=112, top=118+(i%2)*6;
      s+=rect(x,top,w,92,cols[i])+rect(x+w*.5,top-16,w*.5,108,shade(cols[i],-.07))+rect(x-4,top-6,w*.5+4,7,'#FFFFFF')+rect(x+w*.5-3,top-22,w*.5+6,7,'#FFFFFF');
      s+=rect(x+8,top+18,40,26,'#7FA3C4')+rect(x+w*.55+4,top+4,40,24,'#7FA3C4')+rect(x+w*.55+8,top+44,30,48,'#A86F45')+rect(x+8,top+56,40,36,'#D4CFC5');
    }
    s+=rect(0,210,400,20,'#B9B1A3')+rect(0,228,400,72,'#70757B')+[20,120,220,320].map(x=>rect(x,262,48,4,'#E8E6E1')).join('');
    s+=palm(18,214,.9)+palm(150,214,.8)+palm(272,214,.85)+palm(392,214,.9);
    return wrap(s);
  }

  function sala(seed){
    const r=R(seed), wall=P(r,['#EFE8DD','#E6E2DA','#DDE3E6','#EDE3E8','#E8E4D8','#F1EADF']), fl=P(r,['#C9A27E','#B98B63','#D6C3A8','#A9927A']), sofa=P(r,['#5B6C7A','#8A5A44','#6B7F5E','#9AA3AD','#C4A484','#6F5B8E']);
    let s=rect(0,0,400,214,wall)+rect(0,214,400,86,fl);
    for(let x=-40;x<440;x+=44) s+=`<path d="M${x} 214 L${x-30} 300" stroke="${shade(fl,-.1)}" stroke-width="1.2"/>`;
    const g=grad(['#8FC0E6','#E5F0F6']);
    s+=`<defs>${g.def}</defs>`+rect(28,36,124,132,'#F7F5F0')+rect(34,42,112,120,`url(#${g.id})`)+poly('34,162 34,120 70,96 104,118 146,104 146,162','#9EB5CD')+rect(89,42,2,120,'#F7F5F0');
    s+=rect(18,28,16,160,shade(wall,-.12))+rect(146,28,16,160,shade(wall,-.12));
    const art=P(r,['#E5A65B','#7FA7C9','#B48CFF','#6BA587','#E07A5F']);
    s+=rect(232,58,96,64,'#FFFFFF')+rect(238,64,84,52,shade(art,.55))+circ(268,90,16,art)+rect(286,80,28,30,shade(art,-.2));
    s+=rect(176,170,26,58,shade(sofa,-.18),'rx="9"')+rect(368,170,26,58,shade(sofa,-.18),'rx="9"')+rect(192,158,186,64,sofa,'rx="12"')+rect(202,144,78,40,shade(sofa,.14),'rx="9"')+rect(288,144,78,40,shade(sofa,.14),'rx="9"');
    s+=ell(270,262,150,24,P(r,['#E7DCCB','#D9CFC1','#CDBFAF','#E4D9E8']))+rect(218,234,104,8,'#7A5236','rx="3"')+rect(226,242,4,14,'#5E3F29')+rect(310,242,4,14,'#5E3F29');
    s+=rect(160,196,26,30,'#D8CFC2','rx="3"'); for(const a of [-50,-20,10,40,70]) s+=ell(173+Math.cos((a-90)*Math.PI/180)*16,192+Math.sin((a-90)*Math.PI/180)*16,6,17,'#4F8A47',`transform="rotate(${a} ${n(173+Math.cos((a-90)*Math.PI/180)*16)} ${n(192+Math.sin((a-90)*Math.PI/180)*16)})"`);
    s+=rect(116,84,3,140,'#2B2B33')+poly('104,84 132,84 126,64 110,64','#F2E3C2');
    return wrap(s);
  }

  function cozinha(seed){
    const r=R(seed), wall=P(r,['#F2EEE8','#E8EBEE','#EFE7DD']), cab=P(r,['#5E6B78','#E9E4DC','#7A8B6E','#A86F45','#3F4650']), top='#E9E6E1';
    let s=rect(0,0,400,300,wall)+rect(0,240,400,60,P(r,['#CDBFAF','#BFB4A6','#D8D2CA']));
    for(let x=0;x<400;x+=20) for(let y=118;y<168;y+=12) s+=rect(x+1,y+1,18,10,shade(wall,-.04));
    s+=rect(20,30,360,80,cab); for(let x=20;x<380;x+=60) s+=rect(x+2,32,56,76,shade(cab,.06))+rect(x+50,66,2,12,'#C9C2B5');
    s+=rect(20,168,360,8,top)+rect(20,176,360,64,cab); for(let x=20;x<380;x+=60) s+=rect(x+2,180,56,58,shade(cab,.06))+rect(x+24,184,12,2,'#C9C2B5');
    s+=rect(140,150,60,18,'#C8CDD3','rx="3"')+rect(160,128,4,24,'#8E959C');
    s+=rect(70,226,260,12,top)+rect(80,238,240,40,shade(cab,-.12));
    for(const x of [110,200,290]) s+=rect(x-1,0,2,70,'#2B2B33')+poly(`${x-16},86 ${x+16},86 ${x+8},70 ${x-8},70`,'#2B2B33')+ell(x,88,12,3,'#FFE7A8');
    for(const x of [130,200,270]) s+=rect(x-10,270,20,6,'#3B3B42')+rect(x-2,276,4,24,'#3B3B42');
    s+=rect(300,140,40,28,'#7FA7C9','rx="2"');
    return wrap(s);
  }

  function quarto(seed){
    const r=R(seed), wall=P(r,['#E9E3EF','#E8E2D8','#DDE5E3','#F0E6DC']), bed=P(r,['#F7F5F0','#E9EEF2']), bl=P(r,['#8A6FB8','#6B8FA8','#C08A6A','#7A9A6E','#9AA3AD']);
    let s=rect(0,0,400,220,wall)+rect(0,220,400,80,P(r,['#C9A27E','#D6C3A8','#B79E86']));
    const g=grad(['#9CC6E8','#ECF3F7']);
    s+=`<defs>${g.def}</defs>`+rect(286,40,92,110,'#F7F5F0')+rect(292,46,80,98,`url(#${g.id})`)+rect(331,46,2,98,'#F7F5F0')+rect(278,32,14,140,shade(bl,.5));
    s+=rect(90,96,210,80,shade(wall,-.18),'rx="6"')+rect(80,160,230,70,bed,'rx="8"')+rect(80,196,230,40,bl,'rx="6"')+rect(80,200,230,6,shade(bl,.25));
    s+=rect(104,146,78,30,'#FFFFFF','rx="10"')+rect(196,146,78,30,'#FFFFFF','rx="10"');
    s+=rect(26,174,48,50,'#A86F45','rx="3"')+rect(36,150,4,24,'#3B3B42')+poly('26,150 50,150 44,132 32,132','#F2E3C2');
    s+=rect(316,174,48,50,'#A86F45','rx="3"');
    s+=ell(196,270,170,18,'#E4D9CB');
    return wrap(s);
  }

  function banheiro(seed){
    const r=R(seed), tile=P(r,['#EEF2F4','#E9E4DC','#E2E8E4']);
    let s=rect(0,0,400,300,tile); for(let x=0;x<400;x+=40) for(let y=0;y<300;y+=40) s+=rect(x+1,y+1,38,38,shade(tile,-.03));
    s+=rect(0,250,400,50,P(r,['#BFC4C9','#CFC6BA']));
    s+=rect(40,40,140,110,'#DDE6EC','rx="6"')+rect(46,46,128,98,'#C7D6E0','rx="4"')+rect(56,52,30,86,'rgba(255,255,255,.5)');
    s+=rect(30,168,160,62,P(r,['#A86F45','#5E6B78','#F2EFEA']),'rx="3"')+rect(30,160,160,10,'#F5F3EF')+ell(110,162,34,6,'#E6EBEE')+rect(108,136,4,24,'#8E959C');
    s+=rect(230,20,150,232,'rgba(200,225,240,.45)')+rect(230,20,3,232,'#B8C4CC')+circ(330,48,14,'#C8CDD3')+rect(326,60,8,6,'#9AA3AD');
    s+=rect(200,120,14,60,P(r,['#F2E3C2','#BFD9CF','#E2C9F8']),'rx="3"');
    return wrap(s);
  }

  function piscina(seed){
    const r=R(seed); let s=sky(r)+mountains(r,150)+rect(0,146,400,30,'#7FA55F');
    s+=rect(60,90,280,86,P(r,WALLS))+rect(54,84,292,8,'#F2EFEA')+rect(90,110,90,60,'#86A9C8')+rect(210,110,100,66,'#86A9C8')+rect(258,110,2,66,'#F2EFEA');
    s+=rect(0,176,400,124,'#E8DFD2');
    const g=grad(['#3FC1D9','#1E8FB5']);
    s+=`<defs>${g.def}</defs>`+rect(40,200,320,84,`url(#${g.id})`,'rx="4"')+rect(36,196,328,6,'#F4EFE7');
    for(let i=0;i<6;i++){ const y=212+i*12; s+=`<path d="M${50+i*9} ${y} q 20 -5 40 0 t 40 0 t 40 0" stroke="rgba(255,255,255,.55)" stroke-width="2" fill="none"/>`; }
    s+=rect(330,176,54,10,'#FFFFFF','rx="3"')+rect(336,186,4,10,'#9AA3AD')+poly('300,120 380,120 340,104','#E5483B')+rect(339,120,2,60,'#9AA3AD');
    s+=palm(24,192,.9)+bush(380,190,16);
    return wrap(s);
  }

  function chacara(seed){
    const r=R(seed); let s=sky(r)+mountains(r,150,'#93AFC9','#B7CBDE');
    s+=ell(80,190,220,60,'#7FAE5F')+ell(330,196,200,56,'#6E9F52')+rect(0,196,400,104,'#86B26A');
    for(let y=214;y<300;y+=14) s+=`<path d="M0 ${y} Q 200 ${y-8} 400 ${y}" stroke="#76A35B" stroke-width="3" fill="none"/>`;
    const hx=150, top=150;
    s+=poly(`${hx-14},${top} ${hx+60},${top-36} ${hx+134},${top}`,'#9A4A3A')+rect(hx,top,120,50,'#F2E8D8')+rect(hx-14,top+6,148,6,'#7A5236');
    s+=rect(hx+10,top+16,22,20,'#86A9C8')+rect(hx+50,top+18,20,32,'#7A5236')+rect(hx+86,top+16,22,20,'#86A9C8');
    for(let x=-6;x<400;x+=26) s+=rect(x,236,4,26,'#8A6A4A'); s+=rect(0,242,400,2,'#8A6A4A')+rect(0,252,400,2,'#8A6A4A');
    s+=tree(60,206,1.5)+tree(110,210,1.1,'#6C9A55','#557F42')+tree(320,204,1.6)+tree(372,210,1.2,'#6C9A55','#557F42');
    return wrap(s);
  }

  function terreno(seed){
    const r=R(seed); let s=sky(r)+mountains(r,168)+rect(0,164,400,136,'#9CBF7A');
    s+=poly('40,300 120,190 300,190 380,300','#C9A57A')+poly('120,190 300,190 290,198 130,198','#B8946A');
    for(let i=0;i<30;i++) s+=ell(60+r()*300,206+r()*90,4+r()*6,2,'#8FB06A');
    for(let x=10;x<400;x+=40) s+=rect(x,212,4,30,'#8A6A4A'); s+=rect(0,220,400,1.6,'#6B6B6B')+rect(0,232,400,1.6,'#6B6B6B');
    s+=rect(280,150,4,70,'#6B4F3A')+rect(244,140,80,40,'#FFFFFF','rx="3"')+rect(248,144,72,32,'#4D00AF','rx="2"')+`<text x="284" y="165" text-anchor="middle" font-family="Geologica,sans-serif" font-weight="800" font-size="13" fill="#03FE9F">VENDE-SE</text>`;
    s+=tree(40,214,1.2)+tree(372,212,1.3,'#6C9A55','#557F42');
    return wrap(s);
  }

  function comercial(seed){
    const r=R(seed), wall=P(r,['#E9E1D6','#DDE3E8','#F2E8D8','#E4DCEC']), aw=P(r,['#4D00AF','#007F50','#B5523F','#3F4650']);
    let s=sky(r)+rect(0,40,400,240,shade(wall,-.08))+rect(40,30,320,250,wall);
    s+=win(70,58,60,40)+win(170,58,60,40)+win(270,58,60,40);
    s+=rect(40,126,320,26,aw)+`<text x="200" y="144" text-anchor="middle" font-family="Geologica,sans-serif" font-weight="700" font-size="12" letter-spacing="2" fill="#fff">LOJA DISPONÍVEL</text>`;
    for(let x=40;x<360;x+=32) s+=poly(`${x},152 ${x+32},152 ${x+16},170`,x%64===40?aw:shade(aw,.35));
    s+=rect(56,172,288,96,'#86A9C8')+rect(56,172,288,30,'#A6C1D8')+rect(184,190,32,78,'#3E4248')+rect(150,172,2,96,'#E9E6E1')+rect(248,172,2,96,'#E9E6E1');
    return wrap(s+street(268));
  }

  function obra(seed, pct=50){
    const r=R(seed); let s=sky(r)+mountains(r,220)+rect(0,240,400,60,'#B8946A');
    const floors=10, done=Math.max(2,Math.round(floors*Math.min(1,pct/100+.2))), bx=120, bw=160, fh=20;
    for(let i=0;i<done;i++){ const y=240-(i+1)*fh; s+=rect(bx,y+16,bw,4,'#A7A9AC'); for(let c=0;c<5;c++) s+=rect(bx+4+c*38,y,6,16,'#B9BBBE'); if(i<done*pct/100+1) s+=rect(bx+10,y+2,bw-20,13,'#D8C7B4'); }
    const cx=316, ct=240-done*fh-60;
    s+=rect(cx,ct,8,240-ct,'#E09200'); for(let y=ct;y<240;y+=12) s+=`<path d="M${cx} ${y} l8 12 M${cx+8} ${y} l-8 12" stroke="#B87400" stroke-width="1"/>`;
    s+=rect(cx-150,ct-6,200,6,'#E09200')+rect(cx+30,ct-4,20,14,'#4E4A5E')+rect(cx-2,ct-20,12,14,'#E09200')+rect(cx-110,ct,1.5,60,'#4E4A5E')+rect(cx-118,ct+60,18,10,'#8A8D91');
    s+=rect(0,246,400,30,'#2F6B3F')+[...Array(10)].map((_,i)=>rect(i*42,246,2,30,'#245432')).join('')+`<text x="200" y="266" text-anchor="middle" font-family="Geologica,sans-serif" font-weight="700" font-size="11" letter-spacing="2" fill="#03FE9F">OBRA EM ANDAMENTO</text>`;
    return wrap(s);
  }

  const SCENES={casa,sobrado,apto,torre,condominio,sala,cozinha,quarto,banheiro,piscina,chacara,terreno,comercial,obra};
  function scene(type, seed, o){ return (SCENES[type]||casa)(seed||1, o); }

  /* ===== Planta ilustrativa ===== */
  const PLANS={
    studio:[[0,0,200,260,'Studio','social'],[200,0,80,110,'Banho','molhado'],[280,0,80,110,'Cozinha','social'],[200,110,160,150,'Varanda','externo']],
    1:[[0,0,170,125,'Dormitório','intimo'],[170,0,70,125,'Banho','molhado'],[240,0,120,125,'Cozinha','social'],[0,125,240,135,'Sala estar/jantar','social'],[240,125,120,60,'Área de serviço','molhado'],[240,185,120,75,'Varanda','externo']],
    2:[[0,0,140,130,'Suíte','intimo'],[140,0,60,130,'Banho','molhado'],[200,0,110,130,'Dormitório 2','intimo'],[310,0,50,130,'Banho','molhado'],[0,130,80,130,'Varanda\ngourmet','externo'],[80,130,170,130,'Sala estar/jantar','social'],[250,130,110,80,'Cozinha','social'],[250,210,110,50,'Área de serviço','molhado']],
    3:[[0,0,120,125,'Suíte','intimo'],[120,0,50,70,'Banho','molhado'],[120,70,50,55,'Closet','intimo'],[170,0,95,125,'Dormitório 2','intimo'],[265,0,95,125,'Dormitório 3','intimo'],[0,125,75,135,'Varanda\ngourmet','externo'],[75,125,165,135,'Sala estar/jantar','social'],[240,125,55,60,'Banho','molhado'],[295,125,65,60,'A. serviço','molhado'],[240,185,120,75,'Cozinha','social']],
    4:[[0,0,130,120,'Suíte master','intimo'],[130,0,50,60,'Banho','molhado'],[130,60,50,60,'Closet','intimo'],[180,0,90,120,'Suíte 2','intimo'],[270,0,90,70,'Suíte 3','intimo'],[270,70,90,50,'Banho','molhado'],[0,120,72,140,'Varanda\ngourmet','externo'],[72,120,148,140,'Sala estar/jantar','social'],[220,120,45,55,'Lavabo','molhado'],[265,120,95,55,'Suíte 4','intimo'],[220,175,140,85,'Cozinha','social']]
  };
  const fmtA = v => v.toFixed(1).replace('.',',');
  function planta(t){
    const key = t.studio?'studio':Math.min(4,Math.max(1,t.q));
    const rooms = PLANS[key].map(x=>x.slice());
    if(t.casa) rooms.forEach(x=>{ if(x[5]==='externo') x[4]='Quintal'; });
    if(key===4 && t.s<4) rooms.forEach(x=>{ if(x[4]==='Suíte 4') x[4]='Escritório'; });
    if(key===3 && t.s>=3) rooms.forEach(x=>{ if(/Dormitório/.test(x[4])) x[4]=x[4].replace('Dormitório','Suíte'); });
    const X=30, Y=30, W=340, H=240, sx=W/360, sy=H/260, tot=rooms.reduce((a,x)=>a+x[2]*x[3],0);
    const wm=Math.sqrt(t.a*360/260), hm=t.a/wm;
    let s='';
    rooms.forEach(([x,y,w,h,nm,tp])=>{
      const rx=X+x*sx, ry=Y+y*sy, rw=w*sx, rh=h*sy, area=t.a*(w*h)/tot;
      s+=`<rect class="fp-${tp} fp-in" x="${n(rx)}" y="${n(ry)}" width="${n(rw)}" height="${n(rh)}"/>`;
      const lines=nm.split('\n'), cy=ry+rh/2-(lines.length-1)*6;
      lines.forEach((l,i)=> s+=`<text class="fp-n" x="${n(rx+rw/2)}" y="${n(cy+i*12)}" text-anchor="middle">${l}</text>`);
      s+=`<text class="fp-a" x="${n(rx+rw/2)}" y="${n(cy+(lines.length-1)*12+13)}" text-anchor="middle">${fmtA(area)} m²</text>`;
      if(y===0 && w>=60) s+=`<line class="fp-win" x1="${n(rx+rw*.3)}" y1="${Y}" x2="${n(rx+rw*.7)}" y2="${Y}"/>`;
      if(tp==='externo' && x===0) s+=`<line class="fp-win" x1="${X}" y1="${n(ry+rh*.2)}" x2="${X}" y2="${n(ry+rh*.8)}"/>`;
    });
    s+=`<rect class="fp-wall" x="${X}" y="${Y}" width="${W}" height="${H}"/>`;
    s+=`<line class="fp-dim" x1="${X}" y1="14" x2="${X+W}" y2="14"/><line class="fp-dim" x1="${X}" y1="10" x2="${X}" y2="18"/><line class="fp-dim" x1="${X+W}" y1="10" x2="${X+W}" y2="18"/><text class="fp-dim-t" x="${X+W/2}" y="10" text-anchor="middle">${fmtA(wm)} m</text>`;
    s+=`<line class="fp-dim" x1="14" y1="${Y}" x2="14" y2="${Y+H}"/><line class="fp-dim" x1="10" y1="${Y}" x2="18" y2="${Y}"/><line class="fp-dim" x1="10" y1="${Y+H}" x2="18" y2="${Y+H}"/><text class="fp-dim-t" x="10" y="${Y+H/2}" text-anchor="middle" transform="rotate(-90 10 ${Y+H/2})">${fmtA(hm)} m</text>`;
    s+=`<g transform="translate(384 ${Y+H-6})"><circle r="9" fill="none" class="fp-dim"/><path d="M0 -6 L3 3 L0 1 L-3 3Z" class="fp-n"/></g>`;
    return `<svg viewBox="0 0 400 290" role="img" aria-label="Planta ilustrativa de ${t.a} m²">${s}</svg>`;
  }

  /* ===== Mapa ilustrativo de Guará ===== */
  function mapa(o={}){
    const D=window.VCData; let s='<rect class="m-land" x="-900" y="-900" width="2400" height="2220"/>';
    D.bairros.forEach(b=>{ s+=`<ellipse class="m-hood" cx="${b.x}" cy="${b.y}" rx="44" ry="28" ${o.focus===b.n?'style="fill:var(--tint-purple);stroke:var(--vc-purple-400);stroke-width:1.5;stroke-dasharray:4 3"':''}/>`; });
    const c=D.bairros[0];
    D.bairros.slice(1).forEach((b,i)=>{ const mx=(c.x+b.x)/2+(i%2?18:-18), my=(c.y+b.y)/2+(i%3?-12:12); s+=`<path class="m-road-e" d="M${c.x} ${c.y} Q${mx} ${my} ${b.x} ${b.y}" stroke-width="5"/><path class="m-road" d="M${c.x} ${c.y} Q${mx} ${my} ${b.x} ${b.y}" stroke-width="3"/>`; });
    s+=`<path class="m-water" d="M-900 150 L-10 150 ${D.rio.slice(D.rio.indexOf('C'))} L1500 52" stroke-width="14"/>`;
    const pts='-900,500 '+D.dutra.map(p=>p.join(',')).join(' ')+' 1500,-30';
    s+=`<polyline class="m-road-e" points="${pts}" stroke-width="12"/><polyline class="m-road" points="${pts}" stroke-width="7"/><polyline points="${pts}" fill="none" stroke="var(--vc-sun-500)" stroke-width="1.5" stroke-dasharray="6 6" opacity=".9"/>`;
    s+=`<text class="m-lbl-b" x="560" y="186" text-anchor="end" transform="rotate(-14 560 186)">Via Dutra</text><text class="m-lbl-b" x="520" y="48" text-anchor="end" transform="rotate(-4 520 48)" style="fill:var(--vc-link)">Rio Paraíba do Sul</text>`;
    if(o.pois!==false) D.pois.filter(p=>!p.hide).forEach(p=>{ s+=`<rect class="m-poi" x="${p.x-4}" y="${p.y-4}" width="8" height="8" rx="2"/>`; if(o.poiLabels!==false) s+= p.left ? `<text class="m-poi-t" x="${p.x-8}" y="${p.y+3}" text-anchor="end">${p.n}</text>` : `<text class="m-poi-t" x="${p.x+8}" y="${p.y+3}">${p.n}</text>`; });
    if(o.labels!==false) D.bairros.forEach(b=>{ s+=`<text class="m-lbl" x="${b.x}" y="${b.y+30}" text-anchor="middle">${b.n}</text>`; });
    return `<svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${s}</svg>`;
  }
  /* posiciona marcadores HTML sobre o SVG (preserveAspectRatio meet) */
  function layoutPins(box){
    const svg=box.querySelector('svg'); if(!svg) return;
    const w=box.clientWidth, h=box.clientHeight, k=Math.min(w/600,h/420), ox=(w-600*k)/2, oy=(h-420*k)/2;
    box.querySelectorAll('[data-x]').forEach(el=>{ el.style.left=(ox+(+el.dataset.x)*k)+'px'; el.style.top=(oy+(+el.dataset.y)*k)+'px'; });
  }

  /* ===== Skyline do hero ===== */
  function skyline(){
    const W=1440, G=146; let s=`<path d="M0 ${G}H${W}" stroke-width="3"/>`; let x=10; const r=R(9);
    const house=(x,h)=>`<path d="M${x} ${G}V${G-h}L${x+28} ${G-h-22}L${x+56} ${G-h}V${G}M${x+22} ${G}V${G-18}H${x+34}V${G}"/>`;
    const bldg=(x,h,w)=>{ let o=`<path d="M${x} ${G}V${G-h}H${x+w}V${G}M${x-4} ${G-h}H${x+w+4}"/>`; for(let y=G-h+10;y<G-14;y+=12) for(let k=x+8;k<x+w-8;k+=12) o+=`<rect x="${k}" y="${y}" width="6" height="6" fill="currentColor" stroke="none"/>`; return o; };
    const row=(x)=>`<path d="M${x} ${G}V${G-30}L${x+14} ${G-46}L${x+28} ${G-30}L${x+42} ${G-46}L${x+56} ${G-30}L${x+70} ${G-46}L${x+84} ${G-30}V${G}M${x+36} ${G}V${G-16}H${x+48}V${G}"/>`;
    const shop=(x)=>`<path d="M${x} ${G}V${G-40}H${x+50}V${G}M${x-4} ${G-40}L${x+2} ${G-54}H${x+48}L${x+54} ${G-40}M${x+10} ${G-40}V${G-54}M${x+20} ${G-40}V${G-54}M${x+30} ${G-40}V${G-54}M${x+40} ${G-40}V${G-54}M${x+18} ${G}V${G-22}H${x+32}V${G}"/>`;
    const tower=(x)=>{ let o=`<path d="M${x} ${G}V${G-70}H${x+10}V${G-84}H${x+18}V${G-96}H${x+30}V${G-84}H${x+38}V${G-70}H${x+48}V${G}"/>`; for(let y=G-60;y<G-14;y+=12) for(let k=x+8;k<x+44;k+=12) o+=`<rect x="${k}" y="${y}" width="6" height="6" fill="currentColor" stroke="none"/>`; return o; };
    const tree=(x)=>`<path d="M${x} ${G}V${G-14}"/><circle cx="${x}" cy="${G-22}" r="9" fill="currentColor" stroke="none"/>`;
    const car=(x)=>`<path d="M${x} ${G-6}V${G-14}L${x+6} ${G-20}H${x+22}L${x+28} ${G-14}V${G-6}Z"/>`;
    const seq=[()=>{s+=house(x,30+(r()*12|0));x+=78},()=>{s+=bldg(x,60+(r()*40|0),44);x+=66},()=>{s+=row(x);x+=104},()=>{s+=tree(x+8);x+=28},()=>{s+=shop(x);x+=74},()=>{s+=tower(x);x+=70},()=>{s+=car(x);x+=44}];
    while(x<W-60){ P(r,seq)(); }
    return `<svg viewBox="0 0 ${W} 150" preserveAspectRatio="xMidYMax slice" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${s}</svg>`;
  }

  /* Ilustração do DS: busca sem resultado (ilustracoes/piloto/estado-busca-vazia.svg) */
  const vazia = `<svg class="ilu" role="img" aria-label="Lupa sobre rua sem imóveis" viewBox="0 0 240 240" fill="none"><path fill="#4D00AF" d="M126 22c36 2 72 22 86 58 14 35 2 70-20 96-22 26-55 44-90 40-35-4-66-26-80-58-14-31-8-68 12-94 20-27 56-44 92-42Z"/><path fill="#E2C9F8" d="M44 188v-34l18-16 18 16v34H44ZM88 188v-74h28v74H88ZM168 188v-30l16-14 16 14v30h-32Z"/><path d="M95 124h4M105 124h4M95 136h4M105 136h4M95 148h4M105 148h4M95 160h4M105 160h4" stroke="#4D00AF" stroke-width="3" stroke-linecap="round"/><circle cx="146" cy="104" r="34" fill="#6514D6" stroke="#03FE9F" stroke-width="10"/><path d="M128 112h36" stroke="#E2C9F8" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 7"/><path d="M171 129l24 24" stroke="#FFDA00" stroke-width="12" stroke-linecap="round"/><path d="M28 188h184" stroke="#03FE9F" stroke-width="4" stroke-linecap="round"/></svg>`;

  return {scene, planta, mapa, layoutPins, skyline, vazia, R, shade};
})();
