"""Gera a versão animada dos ícones da Busca (pasta animados/), no mesmo padrão dos Tipos de imóvel.

Cada ícone é o mesmo desenho do contorno (svg/), separado em partes (subpaths do próprio contorno,
então parado ele é idêntico) que se mexem como a coisa que representam: as placas apontam, as árvores
balançam, o alfinete pula, as janelas acendem, as chaves chacoalham, as cabeças acenam.
A mola, o kick() e o CSS são os mesmos de ../icones-tipos/gerar-animados.py: curva linear() de uma
simulação de mola amortecida, 1,1 s, toca no :hover/:focus-visible do ícone ou do link/botão que o
contém e com a classe .is-playing (vc-anim.js), parado com prefers-reduced-motion.

Uso: python gerar-animados.py   e depois powershell -ExecutionPolicy Bypass -File build.ps1
"""
import io, math, os, re, shutil, sys

root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, root)
import pathlib_vc

OUT = os.path.join(root, 'animados')
DUR = 1.1  # segundos


def spring(zeta, n=48, erro=3.5):
    """Curva de mola amortecida de 0 a 1 em linear(); assenta (e^-erro) no fim da animação."""
    omega = erro / zeta
    wd = omega * math.sqrt(1 - zeta * zeta)
    pts = []
    for i in range(n + 1):
        t = i / n
        pts.append(1 - math.exp(-zeta * omega * t) * (math.cos(wd * t) + (zeta * omega / wd) * math.sin(wd * t)))
    pts[-1] = 1
    return 'linear(' + ', '.join(('%.3f' % p).rstrip('0').rstrip('.') if p not in (0, 1) else str(int(p)) for p in pts) + ')'


QUICA = spring(0.38)     # pulos e assentamentos
BALANCA = spring(0.22)   # pêndulo, árvore, chave
SAIDA = 'cubic-bezier(.2,.8,.3,1)'


def kick(peak, at=18):
    """Sai do repouso, chega ao pico e volta com mola."""
    return [(0, 'transform:none', SAIDA), (at, f'transform:{peak}', None), (100, 'transform:none', None)]


# Janela que pisca acesa (mesma das janelas do Apartamento nos Tipos)
ACENDE = [(0, 'opacity:1', None), (12, 'opacity:.15', 'steps(1)'), (30, 'opacity:1', None), (100, 'opacity:1', None)]

# Cada parte: (classe, índices dos subpaths do contorno, keyframes ou None, origem 'x y' ou None, atraso, mola)
ICONES = {
    'cidade': [            # 0 poste, 1 base, 2 placa esquerda, 3 placa direita
        ('poste', [0, 1], None, None, 0, None),
        ('placa-e', [2], kick('translateX(-1.5px)'), None, 0, QUICA),
        ('placa-d', [3], kick('translateX(1.5px)'), None, .1, QUICA),
    ],
    'bairro': [            # 0 árvore grande, 1 tronco, 2 árvore pequena, 3 tronco, 4 chão, 5 sol
        ('chao', [4], None, None, 0, None),
        ('arvore-g', [0, 1], kick('rotate(5deg)', 14), '13.446 19.871', 0, BALANCA),
        ('arvore-p', [2, 3], kick('rotate(-6deg)', 14), '5.679 19.871', .08, BALANCA),
        ('sol', [5], kick('scale(1.35)', 20), '20.25 6.375', .16, QUICA),
    ],
    'rua': [               # 0 miolo, 1 alfinete
        ('pino', [0, 1], kick('translateY(-3px)', 22), None, 0, QUICA),
    ],
    'edificio': [          # 0 chão, 1 prédio, 2 caixa d'água, 3-11 janelas (de cima para baixo), 12 marquise, 13 porta
        ('predio', [0, 1, 12, 13], None, None, 0, None),
        ('j1', [9, 10, 11], ACENDE, None, 0, None),
        ('j2', [6, 7, 8], ACENDE, None, .08, None),
        ('j3', [3, 4, 5], ACENDE, None, .16, None),
        ('caixa', [2], kick('translateY(-1.5px)', 22), None, .26, QUICA),
    ],
    'condominio': [        # 0 casa, 1 e 2 telhados de trás, 3 porta
        ('casa', [0, 3], kick('translateY(-1.5px)'), None, 0, QUICA),
        ('eco1', [1], kick('translateY(-1.5px)'), None, .08, QUICA),
        ('eco2', [2], kick('translateY(-1.5px)'), None, .16, QUICA),
    ],
    'empreendimento': [    # 0 chave de trás, 1 brilho, 2 chave da frente; giram em volta da argola da frente
        ('chave-tras', [0], kick('rotate(-10deg)', 14), '13.854 7.592', .06, BALANCA),
        ('chave', [1, 2], kick('rotate(12deg)', 14), '13.854 7.592', 0, BALANCA),
    ],
    'perfil': [            # 0 ombros, 1-2 círculo, 3 cabeça
        ('circulo', [0, 1, 2], None, None, 0, None),
        ('cabeca', [3], kick('translateY(-1.5px)', 20), None, 0, QUICA),
    ],
    'corretor': [          # 0 cabeça, 1 corpo, 2 gravata, 3 nó
        ('corpo', [1, 2], None, None, 0, None),
        ('cabeca', [0], kick('translateY(-1.5px)', 20), None, 0, QUICA),
        ('no', [3], kick('scale(1.25)', 20), '12 13.6', .1, QUICA),
    ],
    'imobiliaria': [       # 0-1 corpos de trás, 2 cabeça direita, 3 cabeça esquerda, 4 cabeça da frente, 5 corpo, 6 gravata, 7 nó
        ('corpos', [0, 1, 5, 6, 7], None, None, 0, None),
        ('cabeca-e', [3], kick('translateY(-1.5px)', 20), None, 0, QUICA),
        ('cabeca-c', [4], kick('translateY(-1.5px)', 20), None, .08, QUICA),
        ('cabeca-d', [2], kick('translateY(-1.5px)', 20), None, .16, QUICA),
    ],
    'construtora': [       # 0 chão, 1 parede, 2-4 e 5-7 janelas, 8 porta, 9 telhado, 10 cabeça, 11 corpo, 12 gravata, 13 nó
        ('predio', [0, 1, 8, 9, 11, 12, 13], None, None, 0, None),
        ('j1', [4, 7], ACENDE, None, 0, None),
        ('j2', [3, 6], ACENDE, None, .08, None),
        ('j3', [2, 5], ACENDE, None, .16, None),
        ('cabeca', [10], kick('translateY(-1.5px)', 20), None, .26, QUICA),
    ],
}


def css_for(id_, partes):
    host = f'vc-anim-{id_}'
    rules = [f'.{host} *{{transform-box:view-box}}']
    kfs = []
    for cls, idx, kf, origin, delay, mola in partes:
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


def partes_do_contorno(id_):
    s = io.open(os.path.join(root, 'svg', id_ + '.svg'), encoding='utf-8').read()
    return pathlib_vc.subpaths(re.search(r' d="([^"]+)"', s).group(1))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    # o mesmo vc-anim.js dos Tipos (um só script serve as duas famílias)
    shutil.copyfile(os.path.join(root, '..', 'icones-tipos', 'animados', 'vc-anim.js'), os.path.join(OUT, 'vc-anim.js'))
    for id_, partes in ICONES.items():
        sub = partes_do_contorno(id_)
        usados = sorted(i for _, idx, *_ in partes for i in idx)
        if usados != list(range(len(sub))):
            raise SystemExit(f'{id_}: as partes precisam usar cada subpath uma vez (tem {len(sub)}, usadas {usados})')
        css = css_for(id_, partes)
        paths = '\n'.join(f'  <path class="{c}" d="{"".join(sub[i]["d"] for i in idx)}"/>' for c, idx, *_ in partes)
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" class="vc-anim vc-anim-{id_}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" '
               f'stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-slot="icon">\n'
               f'  <style>{css}</style>\n{paths}\n</svg>\n')
        with io.open(os.path.join(OUT, id_ + '.svg'), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(svg)
    print('ok', len(ICONES))
