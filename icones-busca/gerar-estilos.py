"""Gera as versões duotone e preenchida dos ícones da Busca (mesmo método dos Tipos de imóvel).

A geometria vem do próprio contorno (svg/<id>.svg), lido parte por parte (pathlib_vc.subpaths).
Cada ícone é descrito em CAMADAS, de trás para a frente. Cada camada tem:
  massas   partes fechadas (ou fechadas aqui) que viram área sólida; no preenchido ganham 0,75 de borda,
           para bater com a silhueta externa do contorno de 1,5
  tracos   partes que continuam como barra de 1,5 com ponta redonda (chão, poste, ripas)
  furos    áreas recortadas da camada (portas, o miolo do alfinete)
  cortes   linhas recortadas como sulco de 1,5 (janelas, gravata, brilho da chave)
Uma camada da frente abre um respiro de GAP na de trás (cabeça sobre o corpo, chave sobre chave),
como no "user" sólido do Heroicons; camadas com corta=False só se somam.
Duotone = contorno sobre a área das massas (menos os furos) a 20% da cor.
Uso: python gerar-estilos.py   (precisa do shapely)  e depois o build.ps1
"""
import io, os, re, sys
from shapely.geometry import Polygon, LineString, Point, box
from shapely.ops import unary_union

root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, root)
import pathlib_vc

H = 0.75   # meia espessura do traço
GAP = 1.0  # respiro entre peças sobrepostas no preenchido


def partes(id_):
    s = io.open(os.path.join(root, 'svg', id_ + '.svg'), encoding='utf-8').read()
    return pathlib_vc.subpaths(re.search(r' d="([^"]+)"', s).group(1))


def poly(*sps):
    """Área fechada formada por uma ou mais partes em sequência (a última volta à primeira)."""
    pts = []
    for sp in sps:
        pts += sp['pts'] if not pts else sp['pts'][1:]
    return Polygon(pts).buffer(0)


def rev(sp):
    return dict(sp, pts=list(reversed(sp['pts'])))


def linha(sp):
    return LineString(sp['pts'])


def barra(g):
    return g.buffer(H, cap_style='round', join_style='round')


def borda(g):
    return g.buffer(H, join_style='round')


def ICONES(p):
    """p(id) devolve as partes do contorno; cada ícone vira uma lista de camadas."""
    I = {}

    c = p('cidade')   # 0 poste, 1 base, 2 placa esquerda, 3 placa direita
    I['cidade'] = [dict(massas=[poly(c[2]), poly(c[3])], tracos=[linha(c[0]), linha(c[1])])]

    b = p('bairro')   # 0 árvore grande, 1 tronco, 2 árvore pequena, 3 tronco, 4 chão, 5 sol
    I['bairro'] = [dict(massas=[poly(b[0])], tracos=[linha(b[1])]),
                   dict(massas=[poly(b[2])], tracos=[linha(b[3])]),
                   dict(massas=[poly(b[5])], tracos=[linha(b[4])], corta=False)]

    r = p('rua')      # 0 miolo, 1 alfinete
    I['rua'] = [dict(massas=[poly(r[1])], furos=[poly(r[0])])]

    e = p('edificio')  # 0 chão, 1 prédio, 2 caixa d'água, 3-11 janelas, 12 marquise, 13 porta
    I['edificio'] = [dict(massas=[poly(e[1]), poly(e[2])], tracos=[linha(e[0])],
                          furos=[poly(e[13])], cortes=[linha(x) for x in e[3:13]])]

    k = p('condominio')  # 0 casa, 1 e 2 telhados de trás, 3 porta
    porta = poly(k[3]).union(box(7, 17, 9, 20))   # a porta abre até o chão
    I['condominio'] = [dict(massas=[poly(k[0])], furos=[porta]),
                       dict(tracos=[linha(k[1]), linha(k[2])], corta=False)]

    m = p('empreendimento')  # 0 chave de trás (aberta, fecha na argola da da frente), 1 brilho, 2 chave da frente
    I['empreendimento'] = [dict(massas=[poly(m[0])]),
                           dict(massas=[poly(m[2])], cortes=[linha(m[1])])]

    f = p('perfil')   # 0 ombros, 1 círculo (parte de cima), 2 círculo (parte de baixo), 3 cabeça
    disco = poly(f[1], rev(f[2]))
    ombros = poly(f[0], rev(f[2])).buffer(H).intersection(disco.buffer(-H))
    I['perfil'] = [dict(massas=[disco], furos=[borda(poly(f[3])), ombros], tinta=[disco])]

    t = p('corretor')  # 0 cabeça, 1 corpo, 2 gravata, 3 nó
    I['corretor'] = [dict(massas=[poly(t[1])], cortes=[linha(t[2]), linha(t[3])]),
                     dict(massas=[poly(t[0])])]

    q = p('imobiliaria')  # 0-1 corpos de trás, 2-3 cabeças de trás, 4 cabeça da frente, 5 corpo, 6 gravata, 7 nó
    I['imobiliaria'] = [dict(massas=[poly(q[0]), poly(q[1])]),
                        dict(massas=[poly(q[2]), poly(q[3])]),
                        dict(massas=[poly(q[5])], cortes=[linha(q[6]), linha(q[7])]),
                        dict(massas=[poly(q[4])])]

    o = p('construtora')  # 0 chão, 1 parede, 2-7 janelas, 8 porta, 9 telhado, 10 cabeça, 11 corpo, 12 gravata, 13 nó
    predio = box(o[1]['bbox'][0], o[9]['bbox'][1], o[9]['bbox'][2], o[0]['bbox'][1])
    I['construtora'] = [dict(massas=[predio], tracos=[linha(o[0]), linha(o[9])],
                             cortes=[linha(x) for x in o[2:9]]),
                        dict(massas=[poly(o[11])], cortes=[linha(o[12]), linha(o[13])]),
                        dict(massas=[poly(o[10])])]
    return I


def solido_da_camada(c):
    g = unary_union([borda(x) for x in c.get('massas', [])] + [barra(x) for x in c.get('tracos', [])])
    for fu in c.get('furos', []):
        g = g.difference(fu)
    for co in c.get('cortes', []):
        g = g.difference(barra(co))
    # traços ficam por cima dos furos (ex.: o chão passa embaixo da porta)
    return g


def silhueta(c):
    return unary_union(c.get('massas', []) + [x for x in c.get('tracos', [])])


def path_d(geom):
    geom = geom.simplify(0.01, preserve_topology=True)
    polys = [geom] if geom.geom_type == 'Polygon' else [g for g in geom.geoms if g.geom_type == 'Polygon']
    f = lambda v: ('%.3f' % v).rstrip('0').rstrip('.')
    out = []
    for pg in polys:
        if pg.area < .05:
            continue
        for ring in [pg.exterior] + list(pg.interiors):
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


if __name__ == '__main__':
    os.makedirs(os.path.join(root, 'svg-duotone'), exist_ok=True)
    os.makedirs(os.path.join(root, 'svg-preenchido'), exist_ok=True)
    for id_, camadas in ICONES(partes).items():
        feitos = []
        for c in camadas:
            g = solido_da_camada(c)
            if c.get('corta', True):
                respiro = silhueta(c).buffer(H + GAP, join_style='round')
                feitos = [x.difference(respiro) for x in feitos]
            feitos.append(g)
        solido = unary_union(feitos)
        tinta = unary_union([unary_union(c.get('tinta', c.get('massas', []))) for c in camadas])
        for c in camadas:
            for fu in c.get('furos', []):
                tinta = tinta.difference(fu)
        with io.open(os.path.join(root, 'svg-preenchido', id_ + '.svg'), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(TPL_SOLID.format(d=path_d(solido)))
        with io.open(os.path.join(root, 'svg-duotone', id_ + '.svg'), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(TPL_DUO.format(t=path_d(tinta), o=outline_d(id_)))
    print('ok')
