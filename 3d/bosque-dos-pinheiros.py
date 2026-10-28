"""
ValeCasa · Bosque dos Pinheiros — loteamento + paisagem low poly para o espelho de vendas 3D.

Como usar
  No Blender: aba Scripting > Open > este arquivo > Run Script.
  Ou pelo terminal:
    blender -b -P bosque-dos-pinheiros.py

O script apaga a cena atual e monta tudo do zero. Depois:
  - exporta `img/bosque-dos-pinheiros.glb` e `img/bosque-dos-pinheiros.gltf.json` no repositório
    (o site carrega o .gltf.json);
  - salva `bosque-dos-pinheiros.blend` na pasta 3d do Drive (arquivos de design ficam lá, fora do
    GitHub). Se o Drive não estiver disponível, salva ao lado deste script (o .gitignore ignora .blend).

A regra que liga o 3D ao site
  Cada lote é um objeto separado chamado L_<quadra><lote>, por exemplo L_0312 = quadra 3, lote 12.
  Em cada quadra, a fileira de cima (norte) vai de 1 a n, de oeste para leste, e a de baixo continua
  de n+1 a 2n, de leste para oeste. O site calcula a mesma numeração a partir do campo `lotes` do
  lançamento em assets/data.js: se mudar a largura, a frente ou o fundo de uma quadra aqui, mude lá também.
"""
import bpy, bmesh, math, os, random
from mathutils import Matrix, Vector, noise

def _pasta_do_script():
    # pelo terminal (-P) o __file__ é o caminho real; pela aba Scripting, usa o arquivo aberto no Text Editor
    f = globals().get('__file__', '')
    if f and os.path.isfile(f): return os.path.dirname(os.path.abspath(f))
    for t in bpy.data.texts:
        if t.filepath and os.path.basename(t.filepath) == 'bosque-dos-pinheiros.py':
            return os.path.dirname(bpy.path.abspath(t.filepath))
    raise SystemExit('Abra este arquivo pelo Text Editor (Open) e rode de novo.')

HERE = _pasta_do_script()
REPO = os.path.dirname(HERE)
GLB = os.path.join(REPO, 'img', 'bosque-dos-pinheiros.glb')
DRIVE_3D = 'G:/Outros computadores/Meu laptop (1)/Área de Trabalho/valecasa campanha/3d'
BLEND = os.path.join(DRIVE_3D if os.path.isdir(DRIVE_3D) else HERE, 'bosque-dos-pinheiros.blend')
rnd = random.Random(91)

# ---------------------------------------------------------------- implantação (metros)
# X = leste, Y = norte. A entrada fica na avenida ao sul; a Mantiqueira, ao norte.
#
#            rua norte
#   [ Q1 ] [ Q2 ] ‖ [ Q3 ] [ Q4 ]      lotes 12 x 25, vista para a serra
#   [ Q5 ] [ Q6 ] ‖ [ Q7 ] [ Q8 ]      lotes 10 x 25
#   [ Q9 ] [ Q10] O [ Q11] [Lazer 1]   O = rotatória no bulevar
#   [Inst] [Laz2] ‖ [   Bosque     ]
#   [   Q12 mistos  ] ‖ [ com lago ]
#            avenida de acesso (pórtico no bulevar)
CALCADA = 2.5
COL = {1: (-238, -133), 2: (-119, -14), 3: (14, 119), 4: (133, 238)}
LIN = {1: (121, 176), 2: (52, 107), 3: (-17, 38), 4: (-86, -31), 5: (-165, -100)}
#           quadra: (x0, x1, y0, y1, frente, fundo)
QUADRAS = {
    1: (*COL[1], *LIN[1], 12, 25), 2: (*COL[2], *LIN[1], 12, 25), 3: (*COL[3], *LIN[1], 12, 25), 4: (*COL[4], *LIN[1], 12, 25),
    5: (*COL[1], *LIN[2], 10, 25), 6: (*COL[2], *LIN[2], 10, 25), 7: (*COL[3], *LIN[2], 10, 25), 8: (*COL[4], *LIN[2], 10, 25),
    9: (*COL[1], *LIN[3], 10, 25), 10: (*COL[2], *LIN[3], 10, 25), 11: (*COL[3], *LIN[3], 12, 25),
    12: (COL[1][0], COL[2][1], *LIN[5], 15, 30),
}
X0, X1, Y0, Y1 = -252, 252, -185, 190          # limites do loteamento, com as ruas de contorno
ROT = (0.0, 45.0, 16.0)                          # rotatória: centro x, y e raio

def lotes_da_quadra(q):
    """Retângulos (x0, y0, x1, y1) dos lotes, na ordem da numeração. Esquinas ficam com a sobra da largura."""
    x0, x1, y0, y1, fr, fu = QUADRAS[q]
    a, b = x0 + CALCADA, x1 - CALCADA
    w = b - a; n = int(w // fr); c = (w - (n - 2) * fr) / 2
    larg = [c] + [fr] * (n - 2) + [c]
    xs = [a]
    for l in larg: xs.append(xs[-1] + l)
    topo, base = y1 - CALCADA, y0 + CALCADA
    norte = [(xs[i], topo - fu, xs[i + 1], topo) for i in range(n)]
    sul = [(xs[i], base, xs[i + 1], base + fu) for i in reversed(range(n))]
    return norte + sul

# ---------------------------------------------------------------- materiais
PALETA = {
    'lote': '#9DBF73', 'divisa': '#ECE6D6', 'calcada': '#D6D0C4', 'asfalto': '#5A5F66', 'faixa': '#F2EFE6',
    'grama': '#8DB36B', 'grama_2': '#79A35A', 'mata': '#5F8F4E', 'campo': '#A9C27A', 'campo_2': '#C2C98A',
    'agua': '#62B8CF', 'areia': '#E6D2A0', 'piso_play': '#E0795A', 'quadra_azul': '#3E7CB1', 'quadra_verde': '#3C8D5A',
    'deck': '#B98F66', 'metal': '#7C8790', 'portico': '#1F3B2D', 'dourado': '#E2A93B',
    'arvore': '#4F8F46', 'arvore_2': '#6BAA4B', 'ipe_rosa': '#E58BB8', 'ipe_amarelo': '#F2C94C', 'tronco': '#6B4A35',
    'pinheiro': '#2F5D3A', 'pinheiro_2': '#3F7048',
    'telhado': '#B5573B', 'telhado_2': '#8E4A36', 'laje': '#E4DED2',
    'casa_1': '#F2E2C4', 'casa_2': '#E9C9A8', 'casa_3': '#CFE0D8', 'casa_4': '#F0D3D3', 'casa_5': '#DCD6EA', 'casa_6': '#F4F1EA',
    'escola': '#EFE3C8', 'vidro': '#2E3A47',
    'serra': '#6F9A63', 'serra_alta': '#55777F', 'serra_topo': '#8FA6B2',
}

def hex2rgb(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c]

MATS = {}
def mat(name):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*hex2rgb(PALETA[name]), 1)
    b.inputs['Roughness'].default_value = .85
    if name == 'dourado':
        b.inputs['Emission Color'].default_value = (*hex2rgb(PALETA[name]), 1)
        b.inputs['Emission Strength'].default_value = 1.5
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

def box_rot(name, cx, cy, w, l, ang, z0, z1):
    """Caixa w x l centrada em (cx, cy), girada `ang` radianos em torno de Z."""
    M = Matrix.Translation((cx, cy, (z0 + z1) / 2)) @ Matrix.Rotation(ang, 4, 'Z') @ Matrix.Diagonal((w, l, z1 - z0, 1))
    bmesh.ops.create_cube(bm_for(name), size=1, matrix=M)

def disco(name, cx, cy, rx, ry, z0, z1, seg=16, jitter=0.0):
    bm = bm_for(name)
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=1, radius2=1, depth=1,
                                matrix=Matrix.Translation((cx, cy, (z0 + z1) / 2)) @ Matrix.Diagonal((rx, ry, z1 - z0, 1)))
    if jitter:
        for v in res['verts']:
            k = 1 + rnd.uniform(-jitter, jitter)
            v.co.x = cx + (v.co.x - cx) * k; v.co.y = cy + (v.co.y - cy) * k

def prism_roof(name, x0, y0, x1, y1, z, h):
    bm = bm_for(name); xm = (x0 + x1) / 2
    v = [bm.verts.new(p) for p in ((x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z), (xm, y0, z + h), (xm, y1, z + h))]
    for f in ((1, 2, 5, 4), (3, 0, 4, 5), (0, 1, 4), (2, 3, 5), (0, 3, 2, 1)): bm.faces.new([v[i] for i in f])

def tree(x, y, z=0.0, s=1.0, kind=None):
    kind = kind or rnd.choices(['arvore', 'arvore_2', 'ipe_rosa', 'ipe_amarelo'], [5, 4, 2, 1])[0]
    h = (2.2 + rnd.random() * 1.6) * s
    bmesh.ops.create_cone(bm_for('tronco'), cap_ends=True, segments=5, radius1=.22 * s, radius2=.16 * s, depth=h,
                          matrix=Matrix.Translation((x, y, z + h / 2)))
    r = (1.6 + rnd.random() * 1.3) * s
    res = bmesh.ops.create_icosphere(bm_for(kind), subdivisions=1, radius=r,
                                     matrix=Matrix.Translation((x, y, z + h + r * .7)) @ Matrix.Diagonal((1, 1, .85 + rnd.random() * .4, 1)))
    for v in res['verts']: v.co += Vector((rnd.uniform(-.25, .25), rnd.uniform(-.25, .25), rnd.uniform(-.25, .25))) * s

def pine(x, y, z=0.0, s=1.0):
    """Pinheiro low poly: tronco e duas copas cônicas."""
    kind = rnd.choice(('pinheiro', 'pinheiro_2'))
    h = (6.0 + rnd.random() * 3.5) * s
    bmesh.ops.create_cone(bm_for('tronco'), cap_ends=True, segments=5, radius1=.3 * s, radius2=.2 * s, depth=h * .35,
                          matrix=Matrix.Translation((x, y, z + h * .175)))
    for base, alt, raio in ((.22, .5, 2.2), (.5, .5, 1.6)):
        d = h * alt
        bmesh.ops.create_cone(bm_for(kind), cap_ends=True, segments=7, radius1=raio * s * (.9 + rnd.random() * .25), radius2=0,
                              depth=d, matrix=Matrix.Translation((x, y, z + h * base + d / 2)))

def casa(x, y, w, d, h=3.2, z=0.0):
    box(f'casa_{rnd.randint(1, 6)}', x, y, z, x + w, y + d, z + h)
    prism_roof(rnd.choice(('telhado', 'telhado', 'telhado_2')), x - .4, y - .4, x + w + .4, y + d + .4, z + h, 1.7)

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

# ================================================================= LOTEAMENTO
box('asfalto', X0, Y0, -.05, X1, Y1, .02)
# avenida de acesso continua para leste e oeste; a rua norte segue para a Vila Rosa
box('asfalto', -1300, -185, -.05, 1300, -165, .02)
box('asfalto', -330, 176, -.05, X0, 190, .02)
for x in range(-1290, 1290, 24):
    if not (X0 < x < X1): box('faixa', x, -175.2, .02, x + 10, -174.8, .04)

# quadras: calçada, divisas e árvores de calçada
def quarteirao(x0, x1, y0, y1, arvores=True):
    box('calcada', x0, y0, 0, x1, y1, .15)
    if not arvores: return
    for x in range(int(x0) + 8, int(x1) - 4, 16):
        for y in (y0 + 1.1, y1 - 1.1):
            if rnd.random() < .7: tree(x + rnd.uniform(-2, 2), y, .15, .65)

for q, (x0, x1, y0, y1, fr, fu) in QUADRAS.items():
    quarteirao(x0, x1, y0, y1)
    box('divisa', x0 + CALCADA, y0 + CALCADA, 0, x1 - CALCADA, y1 - CALCADA, .22)

# bulevar: canteiro central com pinheiros e ipês, interrompido na rotatória
for y0, y1 in ((121, 176), (ROT[1] + ROT[2] + 2, 107), (-17, ROT[1] - ROT[2] - 2), (-86, -31), (-165, -100)):
    box('grama_2', -4, y0, 0, 4, y1, .3)
    for k, y in enumerate(range(int(y0) + 5, int(y1) - 2, 12)):
        if k % 2: pine(0, y, .3, .8)
        else: tree(0, y, .3, .85, 'ipe_rosa')
disco('calcada', ROT[0], ROT[1], ROT[2], ROT[2], 0, .2, seg=20)
disco('grama_2', ROT[0], ROT[1], ROT[2] - 1.2, ROT[2] - 1.2, .2, .35, seg=20)
pine(0, 45, .35, 1.4)
for a in range(0, 360, 45):
    tree(math.cos(math.radians(a)) * 9, 45 + math.sin(math.radians(a)) * 9, .35, .55, 'ipe_amarelo' if a % 90 else 'ipe_rosa')

# faixas centrais nas ruas de contorno
for y in (183, -175):
    for x in range(X0 + 6, X1 - 6, 22): box('faixa', x, y - .2, .02, x + 9, y + .2, .04)

# pórtico de entrada no bulevar
for x in (-11, 11):
    box('portico', x - 1.1, -168.6, 0, x + 1.1, -166.4, 8)
box('portico', -12.5, -168.4, 7, 12.5, -166.6, 9)
box('dourado', -10, -168.7, 7.6, 10, -168.4, 8.4)
for x in (-14.5, 14.5): pine(x, -170, 0, 1.0)

# Sistema de Lazer 01: praça com playground, academia ao ar livre e quiosque
x0, x1 = COL[4]; y0, y1 = LIN[3]
quarteirao(x0, x1, y0, y1)
box('grama', x0 + CALCADA, y0 + CALCADA, 0, x1 - CALCADA, y1 - CALCADA, .25)
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
box('calcada', x0 + CALCADA, cy - 1.5, .25, x1 - CALCADA, cy + 1.5, .3)
box('calcada', cx - 1.5, y0 + CALCADA, .25, cx + 1.5, y1 - CALCADA, .3)
box('piso_play', x0 + 10, cy + 5, .25, x0 + 32, y1 - 7, .32)
box('ipe_amarelo', x0 + 13, cy + 9, .32, x0 + 17, cy + 13, 3.2)
box('piso_play', x0 + 17, cy + 10, 2.6, x0 + 23, cy + 12, 2.8)
box('quadra_azul', x0 + 24, cy + 8, .32, x0 + 29, cy + 14, 2.2)
for k in range(5):
    box('metal', cx + 10 + k * 5, y0 + 9, .25, cx + 11 + k * 5, y0 + 10, 1.8)
box('deck', cx + 12, cy + 8, .25, cx + 22, cy + 18, .45)
prism_roof('telhado', cx + 11, cy + 7, cx + 23, cy + 19, 3.4, 2.2)
for p in ((cx + 12, cy + 8), (cx + 22, cy + 8), (cx + 12, cy + 18), (cx + 22, cy + 18)):
    box('deck', p[0] - .2, p[1] - .2, .45, p[0] + .2, p[1] + .2, 3.4)
for _ in range(16):
    tree(rnd.uniform(x0 + 6, x1 - 6), rnd.choice((rnd.uniform(y0 + 5, cy - 4), rnd.uniform(cy + 4, y1 - 5))), .25, 1.0)

# Sistema de Lazer 02: praça com pista de caminhada e quadra de areia
x0, x1 = COL[2]; y0, y1 = LIN[4]
quarteirao(x0, x1, y0, y1)
box('grama', x0 + CALCADA, y0 + CALCADA, 0, x1 - CALCADA, y1 - CALCADA, .25)
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
for k in range(28):   # pista oval
    a0, a1 = k / 28 * math.tau, (k + 1) / 28 * math.tau
    px, py = cx + math.cos((a0 + a1) / 2) * 40, cy + math.sin((a0 + a1) / 2) * 18
    box_rot('calcada', px, py, 2.4, math.hypot(40 * (math.cos(a1) - math.cos(a0)), 18 * (math.sin(a1) - math.sin(a0))) + .4,
            math.atan2(18 * (math.sin(a1) - math.sin(a0)), 40 * (math.cos(a1) - math.cos(a0))) - math.pi / 2, .25, .3)
box('areia', cx - 9, cy - 5, .25, cx + 9, cy + 5, .33)
for x in (cx - 9.5, cx + 9.5): box('metal', x - .1, cy - .1, .33, x + .1, cy + .1, 2.6)
for _ in range(22):
    a = rnd.uniform(0, math.tau); r = rnd.uniform(1.12, 1.35)
    tree(cx + math.cos(a) * 40 * r, cy + math.sin(a) * 18 * r * 1.1, .25, .95)

# Área Institucional: escola e quadra poliesportiva
x0, x1 = COL[1]; y0, y1 = LIN[4]
quarteirao(x0, x1, y0, y1)
box('grama_2', x0 + CALCADA, y0 + CALCADA, 0, x1 - CALCADA, y1 - CALCADA, .25)
box('escola', x0 + 8, y0 + 8, .25, x0 + 50, y0 + 26, 7.5)
box('vidro', x0 + 9, y0 + 7.9, 3, x0 + 49, y0 + 8, 5.5)
box('laje', x0 + 7, y0 + 7, 7.5, x0 + 51, y0 + 27, 8)
box('quadra_verde', x1 - 46, y0 + 8, .25, x1 - 8, y1 - 8, .3)
box('quadra_azul', x1 - 42, y0 + 12, .3, x1 - 12, y1 - 12, .34)
for x in (x1 - 41, x1 - 13): box('metal', x - .2, (y0 + y1) / 2 - .2, .34, x + .2, (y0 + y1) / 2 + .2, 3.5)
for x in range(int(x0) + 10, int(x0) + 50, 9): tree(x, y1 - 7, .25, .9)

# Bosque: área verde com pinheiros, trilha e lago (toma as duas quadras e a rua entre elas)
BX0, BX1, BY0, BY1 = COL[3][0], COL[4][1], LIN[5][0], LIN[4][1]
quarteirao(BX0, BX1, BY0, BY1)
box('mata', BX0 + CALCADA, BY0 + CALCADA, 0, BX1 - CALCADA, BY1 - CALCADA, .3)
LAGO = (150.0, -98.0, 34.0, 20.0)
disco('areia', LAGO[0], LAGO[1], LAGO[2] + 3, LAGO[3] + 3, .3, .34, seg=18, jitter=.06)
disco('agua', LAGO[0], LAGO[1], LAGO[2], LAGO[3], .34, .38, seg=18, jitter=.08)
box('deck', LAGO[0] - 2, LAGO[1] + LAGO[3] - 4, .3, LAGO[0] + 2, LAGO[1] + LAGO[3] + 10, .7)
TR = ((BX0 + BX1) / 2, (BY0 + BY1) / 2, 92.0, 54.0)
for k in range(40):   # trilha
    a0, a1 = k / 40 * math.tau, (k + 1) / 40 * math.tau
    rx, ry = TR[2], TR[3]
    px, py = TR[0] + math.cos((a0 + a1) / 2) * rx, TR[1] + math.sin((a0 + a1) / 2) * ry
    box_rot('areia', px, py, 2.0, math.hypot(rx * (math.cos(a1) - math.cos(a0)), ry * (math.sin(a1) - math.sin(a0))) + .4,
            math.atan2(ry * (math.sin(a1) - math.sin(a0)), rx * (math.cos(a1) - math.cos(a0))) - math.pi / 2, .3, .34)
for _ in range(330):
    x, y = rnd.uniform(BX0 + 6, BX1 - 6), rnd.uniform(BY0 + 6, BY1 - 6)
    if ((x - LAGO[0]) / (LAGO[2] + 7)) ** 2 + ((y - LAGO[1]) / (LAGO[3] + 7)) ** 2 < 1: continue
    t = ((x - TR[0]) / TR[2]) ** 2 + ((y - TR[1]) / TR[3]) ** 2
    if .9 < t < 1.12: continue
    if rnd.random() < .8: pine(x, y, .3, rnd.uniform(.9, 1.4))
    else: tree(x, y, .3, 1.1, rnd.choice(('arvore', 'arvore_2', 'ipe_rosa')))

flush('Loteamento', 'Loteamento')

# ---------------------------------------------------------------- lotes (um objeto por lote)
lote_mat = mat('lote')
total = 0
for q in QUADRAS:
    fu = QUADRAS[q][5]
    for k, (a, b, c, d) in enumerate(lotes_da_quadra(q), start=1):
        sx, sy, sz = (c - a) - .6, (d - b) - .6, .28
        me = bpy.data.meshes.new(f'L_{q:02d}{k:02d}')
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Diagonal((sx, sy, sz, 1))); bm.to_mesh(me); bm.free()
        me.materials.append(lote_mat)
        ob = bpy.data.objects.new(me.name, me)
        ob.location = ((a + c) / 2, (b + d) / 2, .22 + sz / 2)
        ob['quadra'] = q; ob['lote'] = k; ob['area_m2'] = round((c - a) * fu, 1)
        col('Lotes').objects.link(ob); total += 1
print('lotes:', total, {q: len(lotes_da_quadra(q)) for q in QUADRAS})

# ================================================================= ENTORNO
box('grama', -4500, -4500, -.4, 4500, 4500, -.06)

# Vila Rosa, a oeste: quarteirões de casas térreas
for i in range(5):
    for j in range(-2, 4):
        x0, y0 = -330 - i * 92 - 80, j * 72
        if rnd.random() < .08: continue
        quarteirao(x0, x0 + 80, y0, y0 + 60, arvores=False)
        box('asfalto', x0 - 12, y0 - 12, -.05, x0 + 92, y0 + 72, .02)
        for side in (0, 1):
            for k in range(7):
                if rnd.random() < .15: continue
                w, d = rnd.uniform(6.5, 8.5), rnd.uniform(9, 13)
                hx = x0 + 3 + k * 11 + (10 - w) / 2
                hy = y0 + 4 if side == 0 else y0 + 56 - d
                casa(hx, hy, w, d, rnd.choice((3.2, 3.2, 3.2, 6.0)), .15)
        for _ in range(3): tree(rnd.uniform(x0 + 8, x0 + 72), rnd.uniform(y0 + 22, y0 + 38), .15, .9)

# Clube dos 500, a leste: lotes grandes, casas maiores e piscinas
for i in range(4):
    for j in range(-1, 3):
        x0, y0 = 320 + i * 132, j * 96
        box('asfalto', x0 - 12, y0 - 12, -.05, x0 + 132, y0 + 96, .02)
        quarteirao(x0, x0 + 120, y0, y0 + 84, arvores=False)
        box('grama_2', x0 + 2, y0 + 2, 0, x0 + 118, y0 + 82, .2)
        for k in range(4):
            for side in (0, 1):
                if rnd.random() < .2: continue
                lx = x0 + 4 + k * 29; ly = y0 + 6 if side == 0 else y0 + 50
                w, d = rnd.uniform(12, 16), rnd.uniform(10, 14)
                casa(lx, ly, w, d, rnd.choice((3.4, 6.2)), .2)
                if rnd.random() < .6: box('agua', lx + 2, ly + d + 3, .2, lx + 9, ly + d + 7, .28)
                if rnd.random() < .7: tree(lx + w + 4, ly + d / 2, .2, 1.1)

# clube com campo de futebol e piscina, perto da avenida
box('campo', 360, -320, 0, 470, -250, .12)
box('faixa', 414.6, -320, .12, 415.4, -250, .14)
box('agua', 490, -300, 0, 515, -285, .2)
box('escola', 490, -270, 0, 520, -255, 4.5)
for x in range(350, 530, 14): tree(x, -240, 0, 1.0)

# campos, plantações e capões de mata em volta
for _ in range(22):
    x0, y0 = rnd.uniform(-2600, 2600), rnd.uniform(-2400, 1300)
    if -900 < x0 < 1000 and -500 < y0 < 450: continue
    box(rnd.choice(('campo', 'campo_2')), x0, y0, -.05, x0 + rnd.uniform(150, 420), y0 + rnd.uniform(120, 300), -.02)
for _ in range(240):
    a, r = rnd.uniform(0, math.tau), rnd.uniform(420, 1900)
    x, y = math.cos(a) * r, math.sin(a) * r * .85
    if y > 1250: continue
    for _ in range(rnd.randint(1, 4)):
        px, py = x + rnd.uniform(-16, 16), y + rnd.uniform(-16, 16)
        if rnd.random() < .35: pine(px, py, 0, rnd.uniform(1.2, 2.0))
        else: tree(px, py, 0, rnd.uniform(1.3, 2.3), rnd.choice(('arvore', 'arvore_2')))

# Serra da Mantiqueira ao norte: grade triangulada com ruído, faces separadas por altura
NX, NY, SX0, SX1, SY0, SY1 = 70, 22, -5000.0, 5000.0, 1500.0, 4600.0
def alt(x, y):
    t = max(0.0, (y - SY0) / (SY1 - SY0))
    n = noise.noise(Vector((x / 1100, y / 1100, 3.1))) * .5 + .5
    n2 = noise.noise(Vector((x / 360, y / 360, 7.7))) * .5 + .5
    return (t ** .8) * (520 + 700 * n) + n2 * 90 * t - 8
grid = [[None] * (NX + 1) for _ in range(NY + 1)]
for j in range(NY + 1):
    for i in range(NX + 1):
        x = SX0 + (SX1 - SX0) * i / NX + (rnd.uniform(-45, 45) if 0 < i < NX else 0)
        y = SY0 + (SY1 - SY0) * j / NY + (rnd.uniform(-45, 45) if 0 < j < NY else 0)
        grid[j][i] = Vector((x, y, alt(x, y)))
for j in range(NY):
    for i in range(NX):
        a, b, c, d = grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]
        for tri in (((a, b, c), (a, c, d)) if (i + j) % 2 else ((a, b, d), (b, c, d))):
            zc = sum(p.z for p in tri) / 3
            name = 'serra' if zc < 300 else 'serra_alta' if zc < 700 else 'serra_topo'
            bm = bm_for(name); bm.faces.new([bm.verts.new(p) for p in tri])

flush('Entorno', 'Entorno')

# ---------------------------------------------------------------- câmera e luz (só para renderizar no Blender)
sun = bpy.data.objects.new('Sol', bpy.data.lights.new('Sol', 'SUN')); scene.collection.objects.link(sun)
sun.data.energy = 4; sun.rotation_euler = (math.radians(50), math.radians(10), math.radians(-35))
cam = bpy.data.objects.new('Camera', bpy.data.cameras.new('Camera')); scene.collection.objects.link(cam)
cam.location = (-160, -520, 330); cam.rotation_euler = (math.radians(55), 0, math.radians(-17)); scene.camera = cam
cam.data.clip_end = 8000
world = bpy.data.worlds.new('Ceu'); world.use_nodes = True
next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND').inputs['Color'].default_value = (*hex2rgb('#CFE3F0'), 1)
scene.world = world

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
