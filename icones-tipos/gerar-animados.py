"""Gera a versão animada dos ícones de Tipos de imóvel (pasta animados/).

Cada ícone é o mesmo desenho do contorno (svg/), separado em partes que se mexem
como a coisa que representam: telhado que pula, pendente que balança, porteira que abre.
O movimento usa mola de verdade: a curva de easing linear() vem de uma simulação
de mola amortecida, então o movimento passa do ponto e assenta.

Toca ao passar o mouse, ao focar ou tocar no próprio ícone ou no elemento que o contém
(ex.: o chip de filtro), e com a classe .is-playing (veja vc-anim.js).
Fica parado para quem pediu menos movimento no sistema (prefers-reduced-motion).

Uso: python gerar-animados.py   e depois powershell -ExecutionPolicy Bypass -File build.ps1
"""
import io, math, os, re

root = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(root, 'animados')
DUR = 1.1  # segundos


def spring(zeta, n=48, erro=3.5):
    """Curva de mola amortecida de 0 a 1 em linear(); assenta (e^-erro) no fim da animação."""
    omega = erro / zeta
    wd = omega * math.sqrt(1 - zeta * zeta)
    pts = []
    for i in range(n + 1):
        t = i / n
        x = 1 - math.exp(-zeta * omega * t) * (math.cos(wd * t) + (zeta * omega / wd) * math.sin(wd * t))
        pts.append(x)
    pts[-1] = 1
    return 'linear(' + ', '.join(('%.3f' % p).rstrip('0').rstrip('.') if p not in (0, 1) else str(int(p)) for p in pts) + ')'


QUICA = spring(0.38)     # pulos e assentamentos
BALANCA = spring(0.22)   # pêndulo, árvore, porteira
SAIDA = 'cubic-bezier(.2,.8,.3,1)'


def kick(peak, at=18):
    """Sai do repouso, chega ao pico e volta com mola."""
    return [(0, 'transform:none', SAIDA), (at, f'transform:{peak}', None), (100, 'transform:none', None)]


# Traço que se desenha do começo ao fim do path (o path ganha pathLength="1")
DESENHA = [(0, 'stroke-dasharray:1 1;stroke-dashoffset:1', 'cubic-bezier(.45,0,.2,1)'),
           (45, 'stroke-dasharray:1 1;stroke-dashoffset:0', None),
           (100, 'stroke-dasharray:1 1;stroke-dashoffset:0', None)]

# Cada parte: (classe, d, keyframes ou None, origem 'x y' ou None, atraso em s, mola)
# keyframes = lista de (porcento, declaração, easing desta etapa ou None = mola da parte)
ICONES = {
    'casa': [
        ('telhado', 'M5.25 6h13.5l3 3.75H2.25l3-3.75Z', kick('translateY(-2.25px)'), None, 0, QUICA),
        ('casa', 'M3.75 9.75v10.5M20.25 9.75v10.5M2.25 20.25h19.5M6 20.25V13.5h3v6.75M12 20.25V13.5h6v6.75', None, None, 0, None),
        ('portao', 'M12 15.75h6M12 18h6', kick('translateY(-1.5px)', 22), None, .08, QUICA),
    ],
    'sobrado': [
        ('telhado', 'M5.25 2.25h13.5l3 3.75H2.25l3-3.75Z', kick('translateY(-1.5px)'), None, 0, QUICA),
        ('casa', 'M3.75 6v14.25M20.25 6v14.25M2.25 20.25h19.5M3.75 12.75h16.5M6 20.25V15h3v5.25M12 20.25V15h6v5.25', None, None, 0, None),
        ('janela', 'M6 8.25h3.75v2.25H6V8.25Z', kick('scaleY(.15)', 20), '7.875 9.375', .12, QUICA),
        ('portao', 'M12 17.625h6', kick('translateY(-1.5px)', 22), None, .2, QUICA),
    ],
    'casa-de-condominio': [
        ('portico', 'M2.25 3.75h19.5v2.25H2.25V3.75Z', kick('translateY(-1.5px)'), None, 0, QUICA),
        ('pilares', 'M3 6v14.25M5.25 6v14.25M18.75 6v14.25M21 6v14.25M2.25 20.25h19.5', None, None, 0, None),
        ('casa', 'M9.375 10.5h5.25l1.875 2.25h-9l1.875-2.25ZM8.25 12.75v7.5M15.75 12.75v7.5M11.25 20.25v-3.75h1.5v3.75', kick('scale(1.12)', 20), '12 20.25', .1, QUICA),
    ],
    'casa-de-vila': [
        ('telhado', 'M2.25 3.75 21.75 10.5', kick('rotate(-9deg)', 20), '3.75 4.27', 0, QUICA),
        ('casa', 'M3.75 4.27v15.98h16.5V9.98M3.75 12.75h16.5M12.75 20.25v-4.5h3v4.5', None, None, 0, None),
        ('janela', 'M6 8.25h3v2.25H6V8.25Z', kick('scaleY(.15)', 20), '7.5 9.375', .14, QUICA),
    ],
    'apartamento': [
        ('chao', 'M2.25 21h19.5', None, None, 0, None),
        ('bloco', 'M3.75 21V8.25h6', None, None, 0, None),
        ('torre', 'M9.75 21V3h10.5v18M13.5 21v-3h3v3', kick('scaleY(1.07)', 20), '15 21', 0, QUICA),
        ('j1', 'M12 15h1.5M16.5 15H18M6 17.25h1.5', [(0, 'opacity:1', None), (12, 'opacity:.15', 'steps(1)'), (30, 'opacity:1', None), (100, 'opacity:1', None)], None, 0, None),
        ('j2', 'M12 12h1.5M16.5 12H18M6 14.25h1.5', [(0, 'opacity:1', None), (12, 'opacity:.15', 'steps(1)'), (30, 'opacity:1', None), (100, 'opacity:1', None)], None, .08, None),
        ('j3', 'M12 9h1.5M16.5 9H18M6 11.25h1.5', [(0, 'opacity:1', None), (12, 'opacity:.15', 'steps(1)'), (30, 'opacity:1', None), (100, 'opacity:1', None)], None, .16, None),
        ('j4', 'M12 6h1.5M16.5 6H18', [(0, 'opacity:1', None), (12, 'opacity:.15', 'steps(1)'), (30, 'opacity:1', None), (100, 'opacity:1', None)], None, .24, None),
    ],
    'cobertura': [
        ('predio', 'M3.75 21h16.5M3.75 11.25h16.5M5.25 21V6.75h6v4.5M4.5 6.75h6.75M18.75 11.25V21M11.25 9h7.5M18.75 9v2.25M8.25 14.25h1.5m4.5 0h1.5M10.125 21v-3.75h3.75V21', None, None, 0, None),
        ('haste', 'M16.125 6.75V9', None, None, 0, None),
        ('guardasol', 'M13.875 6.75a2.25 2.25 0 0 1 4.5 0h-4.5Z',
         [(0, 'transform:none', SAIDA), (16, 'transform:scale(.2,.5)', None), (100, 'transform:none', None)], '16.125 6.75', 0, QUICA),
    ],
    'kitnet': [
        ('predio', 'M2.25 4.5h13.5M2.25 4.5v15.75M15.75 4.5v15.75M2.25 12.375h13.5M2.25 20.25h19.5M15.75 12.375h1.5l4.5 7.875', None, None, 0, None),
        ('p1', 'M4.875 20.25V16.5h2.25v3.75', kick('scaleX(.2)', 20), '4.875 18', 0, QUICA),
        ('p2', 'M10.875 20.25V16.5h2.25v3.75', kick('scaleX(.2)', 20), '10.875 18', .07, QUICA),
        ('p3', 'M4.875 12.375V8.625h2.25v3.75', kick('scaleX(.2)', 20), '4.875 10.5', .14, QUICA),
        ('p4', 'M10.875 12.375V8.625h2.25v3.75', kick('scaleX(.2)', 20), '10.875 10.5', .21, QUICA),
        ('d1', 'M20.25 17.625h1.5', kick('translateY(-1.125px)', 25), None, .05, QUICA),
        ('d2', 'M18.75 15h1.5', kick('translateY(-1.125px)', 25), None, .17, QUICA),
    ],
    'studio': [
        ('piso', 'M2.25 20.25h19.5M3.75 20.25v-6.75M3.75 16.5h7.5v3.75M13.5 20.25v-6.75h7.5v6.75M13.5 15.75h7.5M15.75 13.5V12h3v1.5', None, None, 0, None),
        ('travesseiro', 'M6 16.5v-.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v.75', kick('translateY(-1.125px)', 25), None, .3, QUICA),
        ('pendente', 'M17.25 3.75V6M15 8.25a2.25 2.25 0 0 1 4.5 0h-4.5Z', kick('rotate(16deg)', 14), '17.25 3.75', 0, BALANCA),
    ],
    'flat': [
        ('predio', 'M3.75 21h16.5M5.25 21V6.75h13.5V21M8.25 4.5v2.25M15.75 4.5v2.25M8.25 9.75h1.5m4.5 0h1.5M8.25 12.75h1.5m4.5 0h1.5M10.125 21v-4.5M13.875 21v-4.5', None, None, 0, None),
        ('placa', 'M6.75 2.25h10.5V4.5H6.75V2.25Z',
         [(0, 'opacity:1', 'steps(1)'), (8, 'opacity:.2', 'steps(1)'), (14, 'opacity:1', 'steps(1)'), (22, 'opacity:.35', 'steps(1)'), (30, 'opacity:1', None), (100, 'opacity:1', None)], None, 0, None),
        ('marquise', 'M7.5 15h9l-1.5 1.5H9L7.5 15Z', kick('scaleY(1.6)', 18), '12 15', .12, QUICA),
    ],
    'loft': [
        ('casca', 'M2.25 20.25h19.5M3.75 20.25V3.75h16.5v16.5M6 6h4.5v3.75H6V6ZM8.25 6v3.75M12 12h8.25', None, None, 0, None),
        ('e1', 'M6.75 20.25h1.3125v-2.0625', kick('translateY(-.75px)', 25), None, 0, QUICA),
        ('e2', 'M8.0625 18.1875h1.3125v-2.0625', kick('translateY(-.75px)', 25), None, .07, QUICA),
        ('e3', 'M9.375 16.125h1.3125V14.0625', kick('translateY(-.75px)', 25), None, .14, QUICA),
        ('e4', 'M10.6875 14.0625h1.3125V12H12', kick('translateY(-.75px)', 25), None, .21, QUICA),
        ('cama', 'M14.25 12v-1.875H18M18 12V8.25', kick('translateY(-1.5px)', 20), None, .32, QUICA),
    ],
    'terreno-lote': [
        ('lote', 'M21.75 12.75C18.7 10.35 15.45 8.35 12 6.75 8.55 8.35 5.3 10.35 2.25 12.75 5.6 14.4 8.85 16.4 12 18.75c3.15-2.35 6.4-4.35 9.75-6Z', kick('scale(1.05)', 20), '12 12.75', 0, QUICA),
        ('marca-d', 'M16.125 12l1.125.75-1.125.75', kick('translateX(2.25px)', 22), None, .06, QUICA),
        ('marca-e', 'M7.875 12l-1.125.75 1.125.75', kick('translateX(-2.25px)', 22), None, .06, QUICA),
    ],
    'chacara': [
        ('caminho-e', 'M10.5 18.75C13.125 17.25 15.375 15 15.75 13.243', DESENHA, None, 0, None),
        ('caminho-d', 'M15.75 18.75C16.875 17.25 17.625 15 18 13.447', DESENHA, None, .06, None),
        ('telhado', 'M2.25 8.25 8.25 5.25H16.5L12 8.25H2.25ZM16.5 5.25 21.75 8.25', kick('translateY(-1.5px)'), None, .32, QUICA),
        ('casa', 'M3 8.25v5.749M13.5 7.25v5.893M20.25 7.393v6.42M2.25 14.25C6 12.75 18 12.75 21.75 14.25M5 13.583v-1.958a1.125 1.125 0 0 1 2.25 0v1.693M9.25 13.187v-1.562a1.125 1.125 0 0 1 2.25 0v1.502', None, None, 0, None),
        ('porta', 'M15.75 13.243v-1.618a1.125 1.125 0 0 1 2.25 0v1.822', kick('scale(1.2)', 20), '16.875 13.35', .42, QUICA),
    ],
    'fazenda-sitio': [
        ('mouroes', 'M3 8.25v10.5M12 8.25v10.5M21 8.25v10.5', None, None, 0, None),
        ('folha-e', 'M2.25 10.5C3.75 10 7.875 9.75 12 9.75M2.25 14.625H12M2.25 18.75H12M12 9.75l-9 9',
         kick('scaleX(.55)', 22), '3 14', 0, BALANCA),
        ('folha-d', 'M12 9.75c4.125 0 8.25.25 9.75.75M12 14.625h9.75M12 18.75h9.75M12 9.75l9 9',
         kick('scaleX(.55)', 22), '21 14', .05, BALANCA),
    ],
}


def css_for(id_, partes):
    host = f'vc-anim-{id_}'
    rules = [f'.{host} *{{transform-box:view-box}}']
    kfs = []
    for cls, d, kf, origin, delay, mola in partes:
        if not kf:
            continue
        name = f'vc-{id_}-{cls}'
        steps = []
        for pct, decl, ease in kf:
            e = ease if ease is not None else (mola or 'linear')
            steps.append(f'{pct}%{{{decl};animation-timing-function:{e}}}' if pct != 100 else f'{pct}%{{{decl}}}')
        kfs.append(f'@keyframes {name}{{{"".join(steps)}}}')
        if origin:
            x, y = origin.split()
            rules.append(f'.{host} .{cls}{{transform-origin:{x}px {y}px}}')
        sel = f'.{host}:is(:hover,:focus-visible,.is-playing) .{cls},:is(:hover,:focus-visible)>.{host} .{cls}'
        rules.append(f'{sel}{{animation:{name} {DUR}s {delay}s both}}')
    rules.append(f'@media (prefers-reduced-motion:reduce){{.{host} *{{animation:none!important}}}}')
    return ''.join(kfs + rules)


def outline_d(id_):
    s = io.open(os.path.join(root, 'svg', id_ + '.svg'), encoding='utf-8').read()
    return re.search(r' d="([^"]+)"', s).group(1)


os.makedirs(OUT, exist_ok=True)
for id_, partes in ICONES.items():
    css = css_for(id_, partes)
    paths = '\n'.join(f'  <path class="{c}"{" pathLength=\"1\"" if kf is DESENHA else ""} d="{d}"/>' for c, d, kf, *_ in partes)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" class="vc-anim vc-anim-{id_}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" '
           f'stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-slot="icon">\n'
           f'  <style>{css}</style>\n{paths}\n</svg>\n')
    with io.open(os.path.join(OUT, id_ + '.svg'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(svg)
print('ok', len(ICONES))
