/* ValeCasa · espelho de vendas em 3D.
   Carrega o modelo exportado do Blender (scripts em 3d/) e liga cada objeto do modelo à unidade do espelho:
   U_<andar><final> num prédio, L_<quadra><lote> num loteamento. Cor pela situação, card no hover e seleção no clique.
   Carregado sob demanda por lancamentos.js com import(); depende do importmap de "three" no index.html. */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const COR = {
  free:{c:'#3BDB9C', e:'#03FE9F'}, res:{c:'#FFD84D', e:'#FFB800'},
  sold:{c:'#B9B3C4', e:'#000000'}, sel:{c:'#7A3DF0', e:'#4D00AF'}
};
const cache = {};
/* O modelo vem como .gltf.json com o buffer embutido em base64. A hospedagem de artifacts bloqueia
   qualquer fetch que não seja de arquivo publicado junto da página (inclusive data: e decodificadores
   em CDN), então o buffer é decodificado aqui e o glTF vira um GLB em memória, sem nenhum outro pedido. */
async function glbFromJson(url){
  const gl = await (await fetch(url)).json(), b = gl.buffers[0];
  const bin = Uint8Array.from(atob(b.uri.slice(b.uri.indexOf(',')+1)), c => c.charCodeAt(0)); delete b.uri;
  const js = new TextEncoder().encode(JSON.stringify(gl)), jl = (js.length+3)&~3, bl = (bin.length+3)&~3, total = 28+jl+bl;
  const out = new ArrayBuffer(total), dv = new DataView(out), u8 = new Uint8Array(out);
  dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, total, true);
  dv.setUint32(12, jl, true); dv.setUint32(16, 0x4E4F534A, true); u8.set(js, 20); u8.fill(0x20, 20+js.length, 20+jl);
  dv.setUint32(20+jl, bl, true); dv.setUint32(24+jl, 0x004E4942, true); u8.set(bin, 28+jl);
  return new GLTFLoader().parseAsync(out, '');
}
const load = url => cache[url] || (cache[url] = glbFromJson(url));
const isDark = () => { const t=document.documentElement.dataset.theme; return t ? t==='dark' : matchMedia('(prefers-color-scheme: dark)').matches; };

/* o: {url, unit(n), dim(u), sel(), tip(u) -> html, onPick(u), onError(err), erro, vista}
   vista: enquadramento. O padrão serve para um prédio (alto e estreito); um loteamento (largo e plano)
   passa {plano:true, dir:[x,y,z], dist} e a câmera, o alcance, a névoa e a sombra se ajustam ao tamanho. */
export function mount(el, o){
  const V = Object.assign({plano:false, dir:[-.62,.16,1], dist:3.0, alvoY:.78, minDist:45}, o.vista);
  const dark = isDark(), SKY = new THREE.Color(dark ? '#2A2440' : '#CFE3F0');
  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = dark ? .95 : 1.05;
  const cv = renderer.domElement; cv.setAttribute('role','img'); cv.setAttribute('aria-label', o.label || 'Prédio em 3D');
  el.prepend(cv); el.style.background = '#'+SKY.getHexString();
  const $ = s => el.querySelector(s), tipEl = $('.m3d-tip'), msg = $('.m3d-msg'), hint = $('.m3d-hint');
  if(hint) hint.textContent = matchMedia('(pointer:coarse)').matches ? 'Arraste para girar · pinça para aproximar' : 'Arraste para girar · Ctrl + rolagem para aproximar';

  const scene = new THREE.Scene(); scene.background = SKY; scene.fog = new THREE.Fog(SKY, 520, 2000);
  scene.add(new THREE.HemisphereLight(dark?'#8C86C0':'#EAF4FF', dark?'#2C3A2A':'#7E9A5E', dark?.6:1.25));
  const sun = new THREE.DirectionalLight(dark?'#FFB27A':'#FFF4E0', dark?1.2:2.6);
  const SOL = new THREE.Vector3(dark?-268:-138, dark?90:220, dark?60:170);   // posição do sol em relação ao centro
  sun.position.set(8,0,0).add(SOL); sun.target.position.set(8,0,0);
  Object.assign(sun.shadow.camera, {left:-110, right:110, top:110, bottom:-110, near:1, far:700});
  sun.castShadow = true; sun.shadow.mapSize.set(2048,2048); sun.shadow.bias = -.0004; sun.shadow.normalBias = .4;
  scene.add(sun, sun.target);

  const camera = new THREE.PerspectiveCamera(32, 1, 1, 6000);
  // rolagem comum continua rolando a página; Ctrl/⌘ + rolagem (ou pinça no trackpad) aproxima
  const onWheel = e => { const z = e.ctrlKey || e.metaKey; controls.enableZoom = z; if(!z && hint){ hint.classList.remove('pulse'); void hint.offsetWidth; hint.classList.add('pulse'); } };
  cv.addEventListener('wheel', onWheel, {passive:true});
  const controls = new OrbitControls(camera, cv);
  Object.assign(controls, {enableDamping:true, dampingFactor:.08, minDistance:45, maxDistance:520, minPolarAngle:.15, maxPolarAngle:Math.PI/2-.05,
    screenSpacePanning:true, autoRotate:true, autoRotateSpeed:.45, enableZoom:false});
  controls.addEventListener('start', () => { controls.autoRotate = false; anim = null; });

  let units = [], hover = null, home = null, anim = null, foco = null, raio = 120, alive = true, visible = true, raf = 0, down = null, lastSel = null;
  const center = new THREE.Vector3(8, 40, 0);

  function paint(){
    const s = o.sel();
    for(const m of units){
      const u = m.userData.u, k = u.n===s ? 'sel' : u.st, dim = o.dim(u), mt = m.material, c = COR[k];
      mt.color.set(c.c); mt.emissive.set(c.e);
      mt.emissiveIntensity = m===hover ? .6 : k==='sold' ? 0 : dark ? .4 : k==='sel' ? .35 : .08;
      mt.opacity = dim ? .14 : 1; mt.depthWrite = !dim; m.castShadow = !dim;
    }
  }
  function hit(e){
    const r = cv.getBoundingClientRect(), ndc = new THREE.Vector2((e.clientX-r.left)/r.width*2-1, -(e.clientY-r.top)/r.height*2+1), ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(units.filter(m => !o.dim(m.userData.u)), false)[0];
    return h ? h.object : null;
  }
  function showTip(m, e){
    if(!tipEl) return;
    if(!m){ tipEl.hidden = true; return; }
    tipEl.innerHTML = o.tip(m.userData.u); tipEl.hidden = false;
    const r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    let x = e.clientX-r.left+18, y = e.clientY-r.top+18;
    if(x+w > r.width-8) x = e.clientX-r.left-w-18;
    if(y+h > r.height-8) y = e.clientY-r.top-h-18;
    tipEl.style.setProperty('--x', Math.max(8,x)+'px'); tipEl.style.setProperty('--y', Math.max(8,y)+'px');
  }
  function setHover(m){ if(m===hover) return; hover = m; el.classList.toggle('hov', !!m); paint(); }

  const onMove = e => {
    if(e.pointerType==='touch' || !units.length) return;
    if(e.buttons){ setHover(null); showTip(null); return; }
    const m = hit(e); setHover(m); showTip(m, e);
  };
  const onEnter = e => { if(e.pointerType!=='touch') controls.autoRotate = false; };
  const onLeave = e => { if(e.pointerType!=='touch'){ setHover(null); showTip(null); } };
  const onDown = e => { down = {x:e.clientX, y:e.clientY}; };
  const onUp = e => {
    if(!down || Math.hypot(e.clientX-down.x, e.clientY-down.y) > 6){ down = null; return; }
    down = null; const m = hit(e);
    if(e.pointerType==='touch'){ setHover(m); showTip(m, e); }
    if(m && m.userData.u.st!=='sold') o.onPick(m.userData.u);
  };
  cv.addEventListener('pointerenter', onEnter); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerleave', onLeave);
  cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointerup', onUp);

  const goHome = () => { if(home) anim = {t:0, p0:camera.position.clone(), t0:controls.target.clone(), p1:home.pos, t1:home.target}; foco = null; };
  const reset = $('[data-m3d-reset]'); if(reset) reset.addEventListener('click', goHome);

  load(o.url).then(g => {
    if(!alive) return;
    const root = g.scene.clone(true);
    root.traverse(m => {
      if(!m.isMesh) return;
      m.castShadow = m.receiveShadow = true;
      if(m.material){ m.material.flatShading = true; m.material.needsUpdate = true; }   // o modelo vem sem normais
      const k = /^[UL]_(\d{4})$/.exec(m.name), u = k && o.unit(+k[1]);
      if(u){ m.userData.u = u; m.material = new THREE.MeshStandardMaterial({roughness:.35, metalness:.05, transparent:true, flatShading:true}); units.push(m); }
      else if(m.material && m.material.transparent){ m.castShadow = false; m.material.depthWrite = false; }
    });
    scene.add(root);
    const box = new THREE.Box3(); units.forEach(m => box.expandByObject(m));
    box.getCenter(center); const s = box.getSize(new THREE.Vector3());
    const ref = V.plano ? Math.max(s.x, s.z) : s.y, R = Math.max(110, Math.max(s.x, s.z)*.6);
    const target = center.clone().setY(V.plano ? 0 : center.y*V.alvoY);
    // no loteamento, afasta o bastante para a largura caber no quadro; em tela em pé (celular),
    // olha pelo lado para o comprimento do terreno ficar na vertical da tela
    const lado = V.plano && camera.aspect < .9, dir = lado ? new THREE.Vector3(-V.dir[2], V.dir[1], V.dir[0]) : new THREE.Vector3(...V.dir);
    const caber = V.plano ? (lado ? s.z : s.x)*.56/(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect) : 0;
    home = {target, pos: target.clone().add(dir.normalize().multiplyScalar(Math.max(ref*V.dist, caber)))};
    camera.position.copy(home.pos); controls.target.copy(home.target);
    // alcance, névoa e sombra proporcionais ao tamanho do modelo (no prédio, ficam nos valores de antes)
    const dist = home.pos.distanceTo(target), k = R/110;
    raio = V.plano ? R*1.2 : 120;
    Object.assign(controls, {minDistance:V.minDist, maxDistance:Math.max(520, dist*2.2)});
    scene.fog.near = Math.max(520, dist*2.2); scene.fog.far = Math.max(2000, dist*7);
    sun.target.position.set(center.x, 0, center.z); sun.position.copy(sun.target.position).addScaledVector(SOL, k);
    Object.assign(sun.shadow.camera, {left:-R, right:R, top:R, bottom:-R, far:Math.max(700, SOL.length()*k + R*2)}); sun.shadow.camera.updateProjectionMatrix();
    controls.update();
    lastSel = o.sel(); paint();
    if(msg) msg.hidden = true;
  }).catch(err => { if(msg) msg.textContent = o.erro || 'Não deu pra carregar o 3D.'; if(o.onError) o.onError(err); });

  function resize(){
    const w = el.clientWidth, h = el.clientHeight; if(!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w/h; camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if(visible && !raf) loop(); }); io.observe(el);

  const ease = t => t<.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  function loop(){
    raf = 0; if(!alive || !visible) return;
    if(anim){
      anim.t = Math.min(1, anim.t+.035); const k = ease(anim.t);
      camera.position.lerpVectors(anim.p0, anim.p1, k); controls.target.lerpVectors(anim.t0, anim.t1, k);
      if(anim.t>=1) anim = null;
    } else if(foco){
      const d = foco.clone().sub(controls.target).multiplyScalar(.08); controls.target.add(d); camera.position.add(d);
      if(d.length() < .02) foco = null;
    }
    // não deixa o alvo sair de perto do modelo
    const t = controls.target, C = THREE.MathUtils.clamp;
    t.y = V.plano ? C(t.y, 0, 60) : C(t.y, 4, 95); t.x = C(t.x, center.x-raio, center.x+raio); t.z = C(t.z, center.z-raio, center.z+raio);
    controls.update(); renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  loop();

  return {
    /* repinta; se a seleção mudou, leva a câmera até a unidade escolhida: no prédio sobe ou desce até o andar,
       no loteamento desliza sobre o terreno até o lote */
    update(){
      paint();
      const s = o.sel(); if(s===lastSel) return; lastSel = s;
      const m = units.find(x => x.userData.u.n===s);
      if(!m) return;
      const p = m.getWorldPosition(new THREE.Vector3()), t = controls.target;
      controls.autoRotate = false; anim = null;
      foco = V.plano ? new THREE.Vector3(p.x, t.y, p.z) : new THREE.Vector3(t.x, THREE.MathUtils.clamp(p.y, 10, 90), t.z);
    },
    dispose(){
      alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose();
      cv.removeEventListener('wheel', onWheel); cv.removeEventListener('pointerenter', onEnter); cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerleave', onLeave);
      cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointerup', onUp);
      units.forEach(m => m.material.dispose()); renderer.dispose(); renderer.forceContextLoss(); cv.remove();
    }
  };
}
