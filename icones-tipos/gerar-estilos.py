"""Gera as versões duotone e preenchida dos ícones de Tipos de imóvel.

Cada ícone é descrito por:
  massas   polígonos que viram área sólida (no preenchido ganham 0,75 de borda arredondada,
           para bater com a silhueta externa do contorno de 1,5)
  furos    polígonos recortados das massas (portas, janelas)
  tracos   linhas que continuam como barra de 1,5 com ponta redonda (chão, ripas, escada)
  tinta    (opcional) área do duotone; padrão = massas - furos
Uso: python gerar-estilos.py   (precisa do shapely: pip install shapely)
Depois rode o build.ps1 para atualizar sprite, catálogo e .zip.
"""
import io, json, math, os, re, sys
from shapely.geometry import Polygon, LineString, Point, MultiPolygon
from shapely.ops import unary_union

root = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
H = 0.75  # meia espessura do traço


def R(x1, y1, x2, y2):
    return Polygon([(x1, y1), (x2, y1), (x2, y2), (x1, y2)])


def P(*pts):
    return Polygon(pts)


def cubic(p0, p1, p2, p3, n=24):
    out = []
    for i in range(n + 1):
        t = i / n
        a = (1 - t) ** 3; b = 3 * (1 - t) ** 2 * t; c = 3 * (1 - t) * t * t; d = t ** 3
        out.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return out


def arc(cx, cy, r, a0, a1, n=24):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def semicirc_top(cx, cy, r):  # meia-lua com o lado reto embaixo
    return Polygon(arc(cx, cy, r, 180, 360))


def L(*pts):
    return LineString(pts)


def dash(x1, x2, y):  # janela em traço curto -> furo com o mesmo desenho do traço
    return LineString([(x1, y), (x2, y)]).buffer(H, cap_style='round')


def stroke(g):
    return g.buffer(H, cap_style='round', join_style='round')


# --- formas com curva ---------------------------------------------------------
terreno = Polygon(
    cubic((21.75, 12.75), (18.7, 10.35), (15.45, 8.35), (12, 6.75))[:-1]
    + cubic((12, 6.75), (8.55, 8.35), (5.3, 10.35), (2.25, 12.75))[:-1]
    + cubic((2.25, 12.75), (5.6, 14.4), (8.85, 16.4), (12, 18.75))[:-1]
    + cubic((12, 18.75), (15.15, 16.4), (18.4, 14.4), (21.75, 12.75))[:-1])

arvore = Polygon(
    cubic((18, 4.5), (16.5, 5.25), (15, 6.75), (15, 8.625))[:-1]
    + cubic((15, 8.625), (15, 9.375), (15.375, 10.125), (15.75, 10.5))[:-1]
    + cubic((15.75, 10.5), (15, 11.25), (14.25, 12.375), (14.25, 13.5))[:-1]
    + arc(18, 13.5, 3.75, 180, 0)[:-1]
    + cubic((21.75, 13.5), (21.75, 12.375), (21, 11.25), (20.25, 10.5))[:-1]
    + cubic((20.25, 10.5), (20.625, 10.125), (21, 9.375), (21, 8.625))[:-1]
    + cubic((21, 8.625), (21, 6.75), (19.5, 5.25), (18, 4.5))[:-1])

travessa_curva = LineString(cubic((2.25, 10.5), (5.25, 9.5), (18.75, 9.5), (21.75, 10.5)))

ICONES = {
    'casa': dict(
        massas=[P((5.25, 6), (18.75, 6), (21.75, 9.75), (2.25, 9.75)), R(3.75, 9.75, 20.25, 20.25)],
        furos=[R(6, 13.5, 9, 20.25), R(12, 13.5, 18, 20.25)],
        tracos=[L((2.25, 20.25), (21.75, 20.25)), L((12, 15.75), (18, 15.75)), L((12, 18), (18, 18))]),
    'sobrado': dict(
        massas=[P((5.25, 2.25), (18.75, 2.25), (21.75, 6), (2.25, 6)), R(3.75, 6, 20.25, 20.25)],
        furos=[R(6, 8.25, 9.75, 10.5), R(6, 15, 9, 20.25), R(12, 15, 18, 20.25)],
        tracos=[L((2.25, 20.25), (21.75, 20.25)), L((12, 17.625), (18, 17.625))]),
    'casa-de-condominio': dict(
        massas=[R(2.25, 3.75, 21.75, 6), R(3, 6, 5.25, 20.25), R(18.75, 6, 21, 20.25),
                P((9.375, 10.5), (14.625, 10.5), (16.5, 12.75), (7.5, 12.75)), R(8.25, 12.75, 15.75, 20.25)],
        furos=[R(10.875, 16.5, 13.125, 20.25)],
        tracos=[L((2.25, 20.25), (21.75, 20.25))]),
    'casa-de-vila': dict(
        massas=[P((3.75, 4.27), (20.25, 9.98), (20.25, 20.25), (3.75, 20.25))],
        furos=[R(6, 8.25, 9, 10.5), R(12.75, 15.75, 15.75, 20.25)],
        tracos=[L((2.25, 3.75), (21.75, 10.5))]),
    'apartamento': dict(
        massas=[R(3.75, 8.25, 9.75, 21), R(9.75, 3, 20.25, 21)],
        furos=[dash(6, 7.5, y) for y in (11.25, 14.25, 17.25)]
              + [dash(x, x + 1.5, y) for y in (6, 9, 12, 15) for x in (12, 16.5)]
              + [R(13.5, 18, 16.5, 21)],
        tracos=[L((2.25, 21), (21.75, 21))]),
    'cobertura': dict(
        massas=[R(5.25, 11.25, 18.75, 21), R(5.25, 6.75, 11.25, 11.25), R(11.25, 9.75, 18.75, 11.25), semicirc_top(16.125, 6.75, 2.25)],
        furos=[dash(8.25, 9.75, 14.25), dash(14.25, 15.75, 14.25), R(10.125, 17.25, 13.875, 21)],
        tracos=[L((3.75, 21), (20.25, 21)), L((3.75, 11.25), (20.25, 11.25)), L((4.5, 6.75), (11.25, 6.75)),
                L((16.125, 6.75), (16.125, 9.75))],
        tinta=[R(5.25, 11.25, 18.75, 21).difference(unary_union([dash(8.25, 9.75, 14.25), dash(14.25, 15.75, 14.25), R(10.125, 17.25, 13.875, 21)])),
               R(5.25, 6.75, 11.25, 11.25), semicirc_top(16.125, 6.75, 2.25)]),
    'kitnet': dict(
        massas=[R(2.25, 4.5, 15.75, 20.25)],
        furos=[R(4.875, 8.625, 7.125, 12.375), R(10.875, 8.625, 13.125, 12.375),
               R(4.875, 16.5, 7.125, 20.25), R(10.875, 16.5, 13.125, 20.25)],
        tracos=[L((2.25, 20.25), (21.75, 20.25)), L((15.75, 12.375), (17.25, 12.375), (21.75, 20.25)),
                L((18.75, 15), (20.25, 15)), L((20.25, 17.625), (21.75, 17.625))]),
    'studio': dict(
        massas=[R(3.75, 16.5, 11.25, 20.25), R(6, 15, 9, 16.5), R(13.5, 13.5, 21, 20.25), R(15.75, 12, 18.75, 13.5),
                semicirc_top(17.25, 8.25, 2.25)],
        furos=[],
        tracos=[L((2.25, 20.25), (21.75, 20.25)), L((3.75, 20.25), (3.75, 13.5)), L((17.25, 3.75), (17.25, 6))]),
    'flat': dict(
        massas=[R(5.25, 6.75, 18.75, 21), R(6.75, 2.25, 17.25, 4.5)],
        furos=[dash(8.25, 9.75, 9.75), dash(14.25, 15.75, 9.75), dash(8.25, 9.75, 12.75), dash(14.25, 15.75, 12.75),
               R(7.5, 15, 16.5, 21)],
        tracos=[L((3.75, 21), (20.25, 21)), L((8.25, 4.5), (8.25, 6.75)), L((15.75, 4.5), (15.75, 6.75)),
                P((7.5, 15), (16.5, 15), (15, 16.5), (9, 16.5)).exterior,
                L((10.125, 21), (10.125, 16.5)), L((13.875, 21), (13.875, 16.5))],
        massas_extra=[P((7.5, 15), (16.5, 15), (15, 16.5), (9, 16.5))],
        tinta=[R(5.25, 6.75, 18.75, 15)]),
    'loft': dict(
        massas=[R(6, 6, 10.5, 9.75),
                P((6.75, 20.25), (8.0625, 20.25), (8.0625, 18.1875), (9.375, 18.1875), (9.375, 16.125), (10.6875, 16.125),
                  (10.6875, 14.0625), (12, 14.0625), (12, 12), (12, 20.25)),
                R(14.25, 10.125, 18, 12)],
        furos=[],
        tracos=[L((2.25, 20.25), (21.75, 20.25)), L((3.75, 20.25), (3.75, 3.75), (20.25, 3.75), (20.25, 20.25)),
                L((12, 12), (20.25, 12)), L((18, 12), (18, 8.25))]),
    'terreno-lote': dict(
        massas=[terreno],
        furos=[stroke(L((16.125, 12), (17.25, 12.75), (16.125, 13.5))), stroke(L((7.875, 12), (6.75, 12.75), (7.875, 13.5)))],
        tracos=[]),
    'chacara': dict(
        massas=[P((2.25, 12.75), (7.125, 8.25), (12, 12.75)), R(3.75, 11.4, 10.5, 20.25), arvore],
        furos=[R(6, 16.5, 8.25, 20.25)],
        tracos=[L((2.25, 20.25), (21.75, 20.25)), L((18, 13.5), (18, 20.25))]),
    'fazenda-sitio': dict(
        massas=[R(2.25, 7.5, 3.75, 19.5), R(11.25, 7.5, 12.75, 19.5), R(20.25, 7.5, 21.75, 19.5)],
        furos=[],
        tracos=[L((2.25, 18.75), (21.75, 18.75)), travessa_curva, L((2.25, 14.625), (21.75, 14.625)),
                L((12, 9.75), (3, 18.75)), L((12, 9.75), (21, 18.75))],
        tinta=[Polygon(list(travessa_curva.coords) + [(21.75, 18.75), (2.25, 18.75)])]),
}


def path_d(geom):
    geom = geom.simplify(0.01, preserve_topology=True)
    polys = [geom] if isinstance(geom, Polygon) else list(geom.geoms)
    out = []
    f = lambda v: ('%.3f' % v).rstrip('0').rstrip('.')
    for p in polys:
        for ring in [p.exterior] + list(p.interiors):
            pts = list(ring.coords)[:-1]
            out.append('M' + f(pts[0][0]) + ' ' + f(pts[0][1]) + ''.join('L' + f(x) + ' ' + f(y) for x, y in pts[1:]) + 'Z')
    return ''.join(out)


def outline_d(id_):
    s = io.open(os.path.join(root, 'svg', id_ + '.svg'), encoding='utf-8').read()
    return re.search(r' d="([^"]+)"', s).group(1)


TPL_SOLID = ('<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" data-slot="icon">\n'
             '  <path fill-rule="evenodd" d="{d}" clip-rule="evenodd"/>\n</svg>\n')
TPL_DUO = ('<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">\n'
           '  <path fill="currentColor" stroke="none" opacity=".2" fill-rule="evenodd" d="{t}"/>\n'
           '  <path stroke-linecap="round" stroke-linejoin="round" d="{o}"/>\n</svg>\n')

os.makedirs(os.path.join(root, 'svg-duotone'), exist_ok=True)
os.makedirs(os.path.join(root, 'svg-preenchido'), exist_ok=True)
for id_, g in ICONES.items():
    massas = unary_union(g['massas'])
    furos = unary_union(g['furos']) if g['furos'] else Polygon()
    tracos = unary_union([stroke(t) for t in g['tracos']]) if g['tracos'] else Polygon()
    extra = unary_union([m.buffer(H, join_style='round') for m in g.get('massas_extra', [])]) if g.get('massas_extra') else Polygon()
    solido = unary_union([massas.buffer(H, join_style='round').difference(furos), tracos, extra])
    tinta = unary_union(g['tinta']) if 'tinta' in g else massas.difference(furos)
    with io.open(os.path.join(root, 'svg-preenchido', id_ + '.svg'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(TPL_SOLID.format(d=path_d(solido)))
    with io.open(os.path.join(root, 'svg-duotone', id_ + '.svg'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(TPL_DUO.format(t=path_d(tinta), o=outline_d(id_)))
print('ok', len(ICONES))
