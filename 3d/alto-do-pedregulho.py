"""
ValeCasa · Alto do Pedregulho — prédio + paisagem low poly para o espelho de vendas 3D.

Como usar
  No Blender: aba Scripting > Open > este arquivo > Run Script.
  Ou pelo terminal:
    blender -b -P alto-do-pedregulho.py

O script apaga a cena atual e monta tudo do zero. Depois:
  - exporta `img/alto-do-pedregulho.glb` e `img/alto-do-pedregulho.gltf.json` no repositório
    (o site carrega o .gltf.json);
  - salva `alto-do-pedregulho.blend` na pasta 3d do Drive (arquivos de design ficam lá, fora do
    GitHub). Se o Drive não estiver disponível, salva ao lado deste script (o .gitignore ignora .blend).

A regra que liga o 3D ao site
  Cada apartamento é um objeto separado chamado U_<andar><final>, por exemplo
  U_0703 = 7º andar, final 03. Os duplex usam o andar de baixo: U_2401.
  O site lê esse nome, procura a unidade no espelho de vendas e pinta pela situação.
  Se você remodelar a fachada à mão, mantenha esses objetos (e os nomes) intactos.
"""
import bpy, bmesh, math, os, random
from mathutils import Matrix, Vector, noise

def _pasta_do_script():
    # pelo terminal (-P) o __file__ é o caminho real; pela aba Scripting, usa o arquivo aberto no Text Editor
    f = globals().get('__file__', '')
    if f and os.path.isfile(f): return os.path.dirname(os.path.abspath(f))
    for t in bpy.data.texts:
        if t.filepath and os.path.basename(t.filepath) == 'alto-do-pedregulho.py':
            return os.path.dirname(bpy.path.abspath(t.filepath))
    raise SystemExit('Abra este arquivo pelo Text Editor (Open) e rode de novo.')

HERE = _pasta_do_script()
REPO = os.path.dirname(HERE)
GLB = os.path.join(REPO, 'img', 'alto-do-pedregulho.glb')
DRIVE_3D = 'G:/Outros computadores/Meu laptop (1)/Área de Trabalho/valecasa campanha/3d'
BLEND = os.path.join(DRIVE_3D if os.path.isdir(DRIVE_3D) else HERE, 'alto-do-pedregulho.blend')
rnd = random.Random(78)

# ---------------------------------------------------------------- prédio (metros)
# Planta do pavimento tipo, vista de cima. Frente (rua principal) = -Y; Mantiqueira = +Y.
#   final 01 · 125 m²  | final 02 · 69 m²      <- frente
#   ---------- circulação / elevadores ----------
#   final 03 · 83 m²   | final 04 · 125 m²     <- fundos
PX0, PX1 = -3.0, 19.0          # largura da lâmina
PY0, PY1 = -11.5, 11.5         # profundidade
CORE = 1.5                     # meia largura da circulação central
FINAIS = {                     # final: (x0, x1, lado)
    1: (-3.0, 10.0, 'frente'), 2: (10.0, 19.0, 'frente'),
    3: (-3.0, 6.0, 'fundos'),  4: (6.0, 19.0, 'fundos'),
}
TIPO_ANDARES = range(4, 24)    # 4º ao 23º
PE = 3.0                       # pé-direito piso a piso
Z_TIPO = 12.6                  # cota do 4º andar
DUPLEX = 24                    # duplex ocupam 24º e 25º
Z_DUP = Z_TIPO + len(TIPO_ANDARES) * PE
Z_COB = Z_DUP + 2 * PE

# ---------------------------------------------------------------- materiais
PALETA = {
    'fachada_clara': '#E9DFD0', 'fachada_escura': '#6B5A4E', 'laje': '#D9CCB9',
    'embasamento': '#46403C', 'embasamento_2': '#85766A', 'vidro': '#2E3A47',
    'guarda_corpo': ('#CFE6EE', .35), 'dourado': '#E7B56A',
    'unidade': '#BFE3D3',
    'grama': '#8DB36B', 'grama_2': '#79A35A', 'campo': '#A9C27A', 'lote': '#9DBF73',
    'asfalto': '#5A5F66', 'calcada': '#D3CDC2', 'agua': '#62C6D6', 'deck': '#B98F66',
    'quadra': '#C46A4A', 'arvore': '#4F8F46', 'arvore_2': '#6BAA4B', 'ipe_rosa': '#E58BB8',
    'ipe_amarelo': '#F2C94C', 'tronco': '#6B4A35', 'telhado': '#B5573B', 'telhado_2': '#8E4A36',
    'casa_1': '#F2E2C4', 'casa_2': '#E9C9A8', 'casa_3': '#CFE0D8', 'casa_4': '#F0D3D3',
    'casa_5': '#DCD6EA', 'casa_6': '#F4F1EA', 'predio_viz': '#D8D2CA',
    'serra': '#6F9A63', 'serra_alta': '#55777F', 'serra_topo': '#8FA6B2',
}

def hex2rgb(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c]

MATS = {}
def mat(name):
    if name in MATS: return MATS[name]
    spec = PALETA[name]; hexc, alpha = (spec if isinstance(spec, tuple) else (spec, 1.0))
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*hex2rgb(hexc), 1)
    b.inputs['Roughness'].default_value = .85
    if name == 'dourado':
        b.inputs['Emission Color'].default_value = (*hex2rgb(hexc), 1)
        b.inputs['Emission Strength'].default_value = 2.0
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
        for attr, val in (('surface_render_method', 'BLENDED'), ('blend_method', 'BLEND')):
            try: setattr(m, attr, val); break
            except Exception: pass
    MATS[name] = m
    return m

# ---------------------------------------------------------------- geometria acumulada por material
BMS = {}
def bm_for(name):
    if name not in BMS: BMS[name] = bmesh.new()
    return BMS[name]

def box(name, x0, y0, z0, x1, y1, z1):
    """Caixa entre dois cantos, somada à malha estática do material."""
    c = Vector(((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
    M = Matrix.Translation(c) @ Matrix.Diagonal((abs(x1 - x0), abs(y1 - y0), abs(z1 - z0), 1))
    bmesh.ops.create_cube(bm_for(name), size=1, matrix=M)

def prism_roof(name, x0, y0, x1, y1, z, h, along_x=True):
    bm = bm_for(name)
    if along_x:
        ym = (y0 + y1) / 2
        v = [bm.verts.new(p) for p in ((x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z), (x0, ym, z + h), (x1, ym, z + h))]
        faces = ((0, 1, 5, 4), (2, 3, 4, 5), (0, 4, 3), (1, 2, 5), (0, 3, 2, 1))
    else:
        xm = (x0 + x1) / 2
        v = [bm.verts.new(p) for p in ((x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z), (xm, y0, z + h), (xm, y1, z + h))]
        faces = ((1, 2, 5, 4), (3, 0, 4, 5), (0, 1, 4), (2, 3, 5), (0, 3, 2, 1))
    for f in faces: bm.faces.new([v[i] for i in f])

def tree(x, y, z=0.0, s=1.0, kind=None):
    kind = kind or rnd.choices(['arvore', 'arvore_2', 'ipe_rosa', 'ipe_amarelo'], [5, 4, 1, 1])[0]
    h = (2.2 + rnd.random() * 1.6) * s
    bmesh.ops.create_cone(bm_for('tronco'), cap_ends=True, segments=5, radius1=.22 * s, radius2=.16 * s, depth=h,
                          matrix=Matrix.Translation((x, y, z + h / 2)))
    r = (1.6 + rnd.random() * 1.3) * s
    bm = bm_for(kind)
    res = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r,
                                     matrix=Matrix.Translation((x, y, z + h + r * .7)) @ Matrix.Diagonal((1, 1, .85 + rnd.random() * .4, 1)))
    for v in res['verts']: v.co += Vector((rnd.uniform(-.25, .25), rnd.uniform(-.25, .25), rnd.uniform(-.25, .25))) * s

# ---------------------------------------------------------------- cena limpa
# limpa a cena sem reiniciar o Blender (reiniciar apagaria este script do Text Editor)
scene = bpy.context.scene
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob, do_unlink=True)
for c in list(bpy.data.collections): bpy.data.collections.remove(c)
for bag in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras, bpy.data.worlds):
    for item in list(bag): bag.remove(item)
COLS = {}
def col(name):
    if name not in COLS:
        c = bpy.data.collections.new(name); scene.collection.children.link(c); COLS[name] = c
    return COLS[name]

def flush(prefix, collection):
    """Transforma cada malha acumulada em um objeto (um por material)."""
    for name, bm in list(BMS.items()):
        me = bpy.data.meshes.new(f'{prefix}_{name}')
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
        bm.to_mesh(me); bm.free()
        me.materials.append(mat(name))
        ob = bpy.data.objects.new(f'{prefix}_{name}', me); col(collection).objects.link(ob)
    BMS.clear()

# ================================================================= PRÉDIO
# embasamento: térreo (portaria, lojas, lobby) + 2º pavimento (academia, coworking)
B0, B1, BY = -34.0, 21.0, 14.0
box('vidro', B0 + .4, -BY + .4, 0, B1 - .4, BY - .4, 4.6)
for x in [B0 + i * 5.5 for i in range(int((B1 - B0) / 5.5) + 1)] + [B1]:
    box('embasamento', x - .45, -BY - .2, 0, x + .45, -BY + .6, 4.6)
    box('embasamento', x - .45, BY - .6, 0, x + .45, BY + .2, 4.6)
for y in (-BY, -7, 0, 7, BY):
    box('embasamento', B0 - .2, y - .45, 0, B0 + .6, y + .45, 4.6)
    box('embasamento', B1 - .6, y - .45, 0, B1 + .2, y + .45, 4.6)
box('embasamento', B0 - .5, -BY - .5, 4.6, B1 + .5, BY + .5, 5.4)       # cornija
box('embasamento_2', B0, -BY, 5.4, B1, BY, 9.0)                        # 2º pavimento
box('vidro', B0 + 1, -BY - .05, 6.2, B1 - 1, BY + .05, 8.3)              # faixa de janelas
box('vidro', B0 - .05, -BY + 1, 6.2, B1 + .05, BY - 1, 8.3)
box('embasamento', B0 - .5, -BY - .5, 9.0, B1 + .5, BY + .5, 9.4)       # laje do deck
# portaria com frisos dourados, como no prospecto
for x in (12.0, 15.6):
    box('dourado', x - .08, -BY - .35, .2, x + .08, -BY - .2, 4.4)
box('embasamento', 11.2, -BY - .3, 0, 16.4, -BY - .1, .2)

# deck de lazer sobre o embasamento (3º pavimento)
box('deck', -32.5, -12.5, 9.4, -5.0, 1.0, 9.55)
box('agua', -30.0, -10.5, 9.4, -13.0, -3.0, 9.6)                        # piscina adulto
box('agua', -11.0, -10.5, 9.4, -7.5, -6.0, 9.6)                         # piscina infantil
box('quadra', -31.0, 3.0, 9.4, -17.0, 12.0, 9.5)                        # quadra recreativa
box('grama_2', -15.5, 3.0, 9.4, -5.0, 12.5, 9.7)                        # playground/jardim
for x0 in (-32.5, -5.4):
    box('guarda_corpo', x0, -13.6, 9.4, x0 + .1, 13.6, 10.5)
box('guarda_corpo', B0, -BY - .4, 9.4, -3.4, -BY - .3, 10.5)
box('guarda_corpo', B0, BY + .3, 9.4, -3.4, BY + .4, 10.5)
for p in ((-32, 1.8), (-25, 1.8), (-18, 1.8), (-12, 12), (-7, 8), (-7, 4)):
    tree(p[0], p[1], 9.6, .8)

# 3º pavimento sob a torre: salão de festas, gourmet, brinquedoteca (fechado em vidro)
box('vidro', PX0 + .2, PY0 + .2, 9.4, PX1 - .2, PY1 - .2, Z_TIPO)

# lâmina: lajes, circulação e pilastras
for f in list(TIPO_ANDARES) + [DUPLEX, DUPLEX + 2]:
    z = Z_TIPO + (f - 4) * PE if f < DUPLEX else Z_DUP + (f - DUPLEX) * PE
    box('laje', PX0 - .4, PY0 - .4, z - .15, PX1 + .4, PY1 + .4, z + .15)
box('fachada_escura', PX0 - .3, -CORE, 9.4, PX1 + .3, CORE, Z_COB + 1.4)     # circulação (faixa escura)
pil = lambda x, y0, y1: box('fachada_clara', x - .45, y0, Z_TIPO - .4, x + .45, y1, Z_COB + 1.4)
for x in (PX0, 10.0, PX1): pil(x, PY0 - .55, PY0 + .4)
for x in (PX0, 6.0, PX1):  pil(x, PY1 - .4, PY1 + .55)
for x in (PX0, PX1):
    for y in (PY0 + 4, PY1 - 4):
        box('fachada_clara', x - .55, y - .4, Z_TIPO - .4, x + .55, y + .4, Z_COB + 1.4)

# coroamento escalonado
box('fachada_clara', PX0 - .4, PY0 - .4, Z_COB, PX1 + .4, PY1 + .4, Z_COB + 1.4)
box('fachada_escura', 6.0, 0.0, Z_COB, PX1 + .4, PY1 + .4, Z_COB + 7.0)
box('fachada_clara', 5.6, -.4, Z_COB + 7.0, PX1 + .8, PY1 + .8, Z_COB + 7.6)
box('fachada_clara', PX0 - .4, PY0 - .4, Z_COB, 5.0, -2.0, Z_COB + 3.6)
box('fachada_escura', PX0 - .8, PY0 - .8, Z_COB + 3.6, 5.4, -1.6, Z_COB + 4.1)

# varandas: laje escura + guarda-corpo de vidro
def varanda(x0, x1, lado, z, prof=1.6):
    if lado == 'frente': ya, yb, ye = PY0 - prof, PY0, PY0 - prof
    else:                ya, yb, ye = PY1, PY1 + prof, PY1 + prof
    box('fachada_escura', x0, ya, z - .1, x1, yb, z + .2)
    box('guarda_corpo', x0, ye - .05, z + .2, x1, ye + .05, z + 1.25)
    box('guarda_corpo', x0, ya, z + .2, x0 + .08, yb, z + 1.25)
    box('guarda_corpo', x1 - .08, ya, z + .2, x1, yb, z + 1.25)

for f in TIPO_ANDARES:
    z = Z_TIPO + (f - 4) * PE
    for fin, (x0, x1, lado) in FINAIS.items():
        w = x1 - x0; varanda(x0 + w * .22, x1 - w * .22, lado, z)
for fin, (x0, x1, lado) in FINAIS.items():
    varanda(x0 + 1, x1 - 1, lado, Z_DUP)
    varanda(x0 + 1.5, x1 - 1.5, lado, Z_DUP + PE, prof=2.4)            # terraço do piso superior

flush('Predio', 'Predio')

# ---------------------------------------------------------------- unidades (um objeto por apartamento)
unit_mat = mat('unidade')
def unidade(f, fin, z0, h, tipo):
    x0, x1, lado = FINAIS[fin]
    ya, yb = (PY0, -CORE) if lado == 'frente' else (CORE, PY1)
    sx, sy, sz = (x1 - x0) - .9, (yb - ya), h - .3
    me = bpy.data.meshes.new(f'U_{f:02d}{fin:02d}')
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Diagonal((sx, sy, sz, 1))); bm.to_mesh(me); bm.free()
    me.materials.append(unit_mat)
    ob = bpy.data.objects.new(me.name, me)
    ob.location = ((x0 + x1) / 2, (ya + yb) / 2, z0 + .15 + sz / 2)
    ob['andar'] = f; ob['final'] = fin; ob['tipologia'] = tipo
    col('Unidades').objects.link(ob)

TIPO_FINAL = {1: '125 m²', 2: '69 m²', 3: '83 m²', 4: '125 m²'}
for f in TIPO_ANDARES:
    for fin in FINAIS: unidade(f, fin, Z_TIPO + (f - 4) * PE, PE, TIPO_FINAL[fin])
for fin in FINAIS:
    unidade(DUPLEX, fin, Z_DUP, 2 * PE, '241 m² duplex' if fin in (1, 4) else '157 m² duplex')

# ================================================================= PAISAGEM
box('grama', -1400, -1400, -.4, 1400, 1400, -.05)

# malha urbana: ruas a cada 90 m (x) e 70 m (y); o terreno do prédio é o quarteirão (0, 0)
SX, SY, RUA = 90, 70, 10
CX, CY = range(-3, 4), range(-3, 3)
qx = lambda i: (-45 + i * SX, -45 + i * SX + 80)
qy = lambda j: (-20 + j * SY, -20 + j * SY + 60)
box('asfalto', qx(CX[0])[0] - RUA, qy(CY[0])[0] - RUA, -.05, qx(CX[-1])[1] + RUA, qy(CY[-1])[1] + RUA, .02)
PRACA = {(-2, 1)}
for i in CX:
    for j in CY:
        x0, x1 = qx(i); y0, y1 = qy(j)
        box('calcada', x0, y0, 0, x1, y1, .18)
        box('lote', x0 + 2.5, y0 + 2.5, 0, x1 - 2.5, y1 - 2.5, .22)
        # árvores de calçada
        for t in range(int((x1 - x0) / 14)):
            if rnd.random() < .6: tree(x0 + 7 + t * 14, y0 + 1.2, .18, .7)
            if rnd.random() < .6: tree(x0 + 7 + t * 14, y1 - 1.2, .18, .7)
        if (i, j) == (0, 0):                         # terreno do Alto do Pedregulho
            box('grama_2', x0 + 2.5, y0 + 2.5, 0, x1 - 2.5, y1 - 2.5, .3)
            for p in ((-41, -16), (-41, 18), (-41, 34), (31, -16), (31, 0), (31, 18), (31, 34), (-20, 32), (-5, 34), (12, 32)):
                tree(p[0], p[1], .3, 1.0)
            continue
        if (i, j) in PRACA:                          # praça do bairro
            for _ in range(18): tree(rnd.uniform(x0 + 6, x1 - 6), rnd.uniform(y0 + 6, y1 - 6), .22, 1.1)
            continue
        alto = rnd.random() < (.35 if abs(i) + abs(j) <= 2 else .12)
        # casas nas bordas do quarteirão (lotes de 10 m)
        for side in ('s', 'n'):
            for k in range(int((x1 - x0 - 6) / 10)):
                lx = x0 + 3 + k * 10
                if alto and side == 's' and 2 <= k <= 4:
                    if k == 2:
                        hb = rnd.choice((9, 12, 15))
                        box('predio_viz', lx + 1, y0 + 4, .22, lx + 29, y0 + 18, .22 + hb)
                        box('vidro', lx + .95, y0 + 3.95, 1.4, lx + 29.05, y0 + 18.05, 1.6)
                        for zz in range(3, int(hb), 3): box('fachada_escura', lx + .9, y0 + 3.9, zz, lx + 29.1, y0 + 18.1, zz + .25)
                    continue
                if rnd.random() < .12: continue
                w, d, h = rnd.uniform(6.5, 8.5), rnd.uniform(9, 13), rnd.choice((3.2, 3.2, 3.2, 6.0))
                hx0 = lx + (10 - w) / 2
                ya, yb = (y0 + 5, y0 + 5 + d) if side == 's' else (y1 - 5 - d, y1 - 5)
                box(f'casa_{rnd.randint(1, 6)}', hx0, ya, .22, hx0 + w, yb, .22 + h)
                prism_roof(rnd.choice(('telhado', 'telhado', 'telhado_2')), hx0 - .4, ya - .4, hx0 + w + .4, yb + .4, .22 + h, 1.8, along_x=False)
        for _ in range(4): tree(rnd.uniform(x0 + 8, x1 - 8), rnd.uniform(y0 + 22, y1 - 22), .22, .9)

# campos e capões de mata em volta da cidade
for _ in range(170):
    a, r = rnd.uniform(0, math.tau), rnd.uniform(330, 900)
    x, y = math.cos(a) * r, math.sin(a) * r * .8
    if y > 360: continue
    for _ in range(rnd.randint(1, 4)): tree(x + rnd.uniform(-12, 12), y + rnd.uniform(-12, 12), 0, rnd.uniform(1.2, 2.2), rnd.choice(('arvore', 'arvore_2')))
for _ in range(14):
    x0, y0 = rnd.uniform(-900, 900), rnd.uniform(-700, 330)
    if abs(x0) < 330 and -260 < y0 < 260: continue
    box('campo', x0, y0, -.06, x0 + rnd.uniform(80, 200), y0 + rnd.uniform(60, 160), -.02)

# Serra da Mantiqueira ao norte: grade triangulada com ruído, faces separadas por altura
NX, NY, X0, X1, Y0, Y1 = 64, 22, -1500.0, 1500.0, 420.0, 1350.0
def alt(x, y):
    t = max(0.0, (y - Y0) / (Y1 - Y0))
    n = noise.noise(Vector((x / 380, y / 380, 3.1))) * .5 + .5
    n2 = noise.noise(Vector((x / 120, y / 120, 7.7))) * .5 + .5
    return (t ** .9) * (260 + 280 * n) + n2 * 35 * t - 4
grid = [[None] * (NX + 1) for _ in range(NY + 1)]
for j in range(NY + 1):
    for i in range(NX + 1):
        x = X0 + (X1 - X0) * i / NX + (rnd.uniform(-14, 14) if 0 < i < NX else 0)
        y = Y0 + (Y1 - Y0) * j / NY + (rnd.uniform(-14, 14) if 0 < j < NY else 0)
        grid[j][i] = Vector((x, y, alt(x, y)))
for j in range(NY):
    for i in range(NX):
        a, b, c, d = grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]
        for tri in (((a, b, c), (a, c, d)) if (i + j) % 2 else ((a, b, d), (b, c, d))):
            zc = sum(p.z for p in tri) / 3
            name = 'serra' if zc < 150 else 'serra_alta' if zc < 330 else 'serra_topo'
            bm = bm_for(name); bm.faces.new([bm.verts.new(p) for p in tri])

flush('Paisagem', 'Paisagem')

# ---------------------------------------------------------------- câmera e luz (só para renderizar no Blender)
sun = bpy.data.objects.new('Sol', bpy.data.lights.new('Sol', 'SUN')); scene.collection.objects.link(sun)
sun.data.energy = 4; sun.rotation_euler = (math.radians(50), math.radians(10), math.radians(-35))
cam = bpy.data.objects.new('Camera', bpy.data.cameras.new('Camera')); scene.collection.objects.link(cam)
cam.location = (-95, -140, 70); cam.rotation_euler = (math.radians(72), 0, math.radians(-33)); scene.camera = cam
world = bpy.data.worlds.new('Ceu'); world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (*hex2rgb('#CFE3F0'), 1); scene.world = world

# ---------------------------------------------------------------- salvar e exportar
os.makedirs(os.path.dirname(GLB), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
bpy.ops.export_scene.gltf(filepath=GLB, export_format='GLB', export_apply=True, export_extras=True,
                          export_cameras=False, export_lights=False, export_yup=True,
                          export_normals=False, export_texcoords=False)
# sem compressão Draco de propósito: o decodificador Draco é baixado em tempo de execução,
# e a hospedagem de artifacts bloqueia esse download. Também sem normais e UVs: o site usa
# sombreamento chapado (flatShading), então os vértices ficam compartilhados e o arquivo encolhe
# cópia em glTF de texto (.gltf.json, buffer embutido em base64): é o formato que o site carrega,
# porque a hospedagem de artifacts não serve .glb
import base64, json, struct
with open(GLB, 'rb') as fh: data = fh.read()
jlen = struct.unpack_from('<I', data, 12)[0]; gl = json.loads(data[20:20 + jlen])
blen = struct.unpack_from('<I', data, 20 + jlen)[0]; binc = data[28 + jlen:28 + jlen + blen]
gl['buffers'][0]['uri'] = 'data:application/octet-stream;base64,' + base64.b64encode(binc).decode()
GLTF = GLB.replace('.glb', '.gltf.json')
with open(GLTF, 'w', encoding='utf-8') as fh: json.dump(gl, fh, separators=(',', ':'))
print('OK', GLB, os.path.getsize(GLB) // 1024, 'KB ·', GLTF, os.path.getsize(GLTF) // 1024, 'KB')
