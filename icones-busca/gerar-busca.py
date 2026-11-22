"""Gera os SVGs da Busca desenhados por código, no padrão Heroicons v2 optimized/24/outline.

Os desenhos do time (hand off/novos) foram refeitos aqui na grade; Edifício, Perfil e Construtoras
são escritos à mão em svg/ e não passam por este script.
Saída: um <path> por ícone, curvas em comandos relativos (c, s, a), números com até 3 casas e
sem espaços desnecessários, como no código otimizado do Heroicons.
Uso: python gerar-busca.py  (depois rode o build.ps1)
"""
import math, os, re

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'svg') + os.sep


# --- números e compactação ---------------------------------------------------
def f(v):
    s = ('%.3f' % v).rstrip('0').rstrip('.')
    if s.startswith('0.'): s = s[1:]
    if s.startswith('-0.'): s = '-' + s[2:]
    return '0' if s in ('', '-0') else s


def P(*nums):
    return ' '.join(f(n) for n in nums)


def _nums(nums):
    out = ''
    for n in nums:
        if out and not n.startswith('-') and not (n.startswith('.') and '.' in re.split(r'[ \-]', out)[-1]):
            out += ' '
        out += n
    return out


def compact(d):
    """Serializa como o svgo do Heroicons: sem espaço antes de '-' nem de '.' quando o número anterior já
    tem ponto, e sem repetir a letra quando o comando seguinte é o mesmo (exceto M)."""
    toks = re.findall(r'[a-zA-Z]|-?\d*\.?\d+', d)
    out, prev, i = '', None, 0
    while i < len(toks):
        c = toks[i]; i += 1
        args = []
        while i < len(toks) and not re.match(r'[a-zA-Z]', toks[i]):
            args.append(toks[i]); i += 1
        if c in 'Zz':
            out += c; prev = None; continue
        if c == prev and c not in 'Mm':
            tail = re.split(r'[a-zA-Z]', out)[-1]
            s = _nums([tail.split(' ')[-1]] + args)[len(tail.split(' ')[-1]):] if tail else _nums(args)
            out += s
        else:
            out += c + _nums(args)
        prev = c
    return out


class Pen:
    """Recebe pontos em coordenadas absolutas e escreve comandos relativos arredondados."""
    def __init__(self):
        self.d, self.x, self.y, self.sx, self.sy = '', 0.0, 0.0, 0.0, 0.0

    def _r(self, x, y):
        return round(x - self.x, 3), round(y - self.y, 3)

    def _go(self, dx, dy):
        self.x = round(self.x + dx, 3); self.y = round(self.y + dy, 3)

    def M(self, x, y):
        self.d += 'M' + P(x, y); self.x, self.y = round(x, 3), round(y, 3); self.sx, self.sy = self.x, self.y; return self

    def C(self, x1, y1, x2, y2, x, y):
        a = self._r(x1, y1); b = self._r(x2, y2); e = self._r(x, y)
        self.d += 'c' + P(*a, *b, *e); self._go(*e); return self

    def A(self, r, large, sweep, x, y):
        e = self._r(x, y)
        self.d += 'a' + P(r, r) + ' 0 %d %d ' % (large, sweep) + P(*e); self._go(*e); return self

    def L(self, x, y):
        e = self._r(x, y)
        if e[1] == 0: self.d += 'h' + f(e[0])
        elif e[0] == 0: self.d += 'v' + f(e[1])
        else: self.d += 'l' + P(*e)
        self._go(*e); return self

    def Z(self):
        self.d += 'Z'; self.x, self.y = self.sx, self.sy; return self


def circle(cx, cy, r):
    """Anel no formato do Heroicons: M(cx+r) cy a r r 0 1 1-2r 0 r r 0 0 1 2r 0Z"""
    return 'M%s a%s 0 1 1-%s 0 %s 0 0 1 %s 0Z' % (P(cx + r, cy), P(r, r), f(2 * r), P(r, r), f(2 * r))


def dot(x, y):
    """Ponto no formato do Heroicons: Mx yh.008v.008H x V y Z"""
    return 'M%sh.008v.008H%sV%sZ' % (P(x, y), f(x), f(y))


def tree(cx, ty, s):
    """Árvore de duas copas (desenho do Bairro do time), largura 9s, altura 12.75s."""
    def p(dx, dy): return cx + dx * s, ty + dy * s
    right = [((1.5, .75), (3, 2.25), (3, 4.125)), ((3, 4.75), (2.85, 5.25), (2.625, 5.625)),
             ((3.75, 6.375), (4.5, 7.5), (4.5, 9)), ((4.5, 11.07), (2.485, 12.75), (0, 12.75))]
    left = [((-2.485, 12.75), (-4.5, 11.07), (-4.5, 9)), ((-4.5, 7.5), (-3.75, 6.375), (-2.625, 5.625)),
            ((-2.85, 5.25), (-3, 4.75), (-3, 4.125)), ((-3, 2.25), (-1.5, .75), (0, 0))]
    pen = Pen().M(*p(0, 0))
    for c1, c2, e in right + left:
        pen.C(*p(*c1), *p(*c2), *p(*e))
    return pen.Z().d


def key(cx, top, R, bottom, teeth=1, shine=True):
    """Chave em pé na linguagem da key do Heroicons: argola com brilho, haste de 2.25 e dentes em degrau.
    teeth=1 põe os dentes à direita, -1 à esquerda."""
    w = 1.125
    cy = top + R
    yj = cy + math.sqrt(R * R - w * w)
    t = teeth
    pen = Pen().M(cx + t * w, yj)
    pen.A(R, 1, 0 if t > 0 else 1, cx - t * w, yj)        # volta pela argola até o outro lado da haste
    pen.L(cx - t * w, bottom).L(cx + t * (w + 1.875), bottom).L(cx + t * (w + 1.875), bottom - 2.25)
    pen.L(cx + t * (w + .75), bottom - 2.25).L(cx + t * (w + .75), bottom - 4.5)
    pen.L(cx + t * w, bottom - 4.5).Z()
    d = pen.d
    if shine:                                              # brilho: quarto de círculo concêntrico, como no Heroicons
        rs = R - 2.25
        d += Pen().M(cx, cy - rs).A(rs, 0, 1 if t > 0 else 0, cx + (rs if t > 0 else -rs), cy).d
    return d


def svg(name, d):
    with open(OUT + name + '.svg', 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">\n')
        fh.write('  <path stroke-linecap="round" stroke-linejoin="round" d="%s"/>\n</svg>\n' % compact(d))


I = {}
# --- Lugares ---------------------------------------------------------------
# Cidade: placa de direção (time: Cidade · 34-placa-direcao)
I['cidade'] = 'M12 2.25V21M8.25 21h7.5M12 3.75H5.25L3 6l2.25 2.25H12M12 10.5h6.75L21 12.75 18.75 15H12'
# Bairro: duas árvores sobre o terreno (time: Bairro · 07-bosque-arvores)
I['bairro'] = (tree(15.375, 2.25, .75) + 'M15.375 11.813v4' + tree(7.125, 4.5, 7 / 12) +
               'M7.125 11.938v2.937M2.25 14.25 12 20.25l9.75-6')
# Rua: o map-pin oficial do Heroicons (time: Rua · 32-pino-localizacao)
I['rua'] = 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z'
# Condomínio: dois prédios de telhado inclinado (time: Condomínio · 45-industria)
I['condominio'] = ('M2.25 21h19.5M3 21V8.25l7.5-3.75V21M10.5 8.25 21 3v18'
                   'M5.25 12h3M12.75 12h6M5.25 21v-3.75h3V21M14.25 21v-3.75h3V21')
# Empreendimento: par de chaves (time: Asset-6 · 29-chaves)
I['empreendimento'] = key(6.75, 2.25, 3.75, 19.5, 1) + key(17.25, 3.75, 3.75, 21, -1)

# --- Pessoas e empresas ----------------------------------------------------
# Corretores: busto do Perfil com a chave do imóvel
I['corretor'] = ('M11.25 8.4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.251 19.694a6 6 0 0 1 11.998 0A14.346 14.346 0 0 1 8.25 21'
                 'c-2.141 0-4.173-.467-5.999-1.306Z' + key(17.625, 9.75, 2.25, 21, 1, shine=False))
# Imobiliárias: loja de toldo recortado com arbusto (time: Imobiliária · 17-loja)
toldo = Pen().M(4.5, 3).L(19.5, 3).L(21.75, 7.5)
for k in range(3):
    toldo.A(4, 0, 1, 21.75 - 6.5 * (k + 1), 7.5)
I['imobiliaria'] = (toldo.L(4.5, 3).Z().d + 'M3.75 8.75V21M20.25 8.75V21M2.25 21h19.5M13.5 21v-6.75h3.75V21' +
                    tree(7.5, 13.5, 1 / 3) + 'M7.5 17.75V21')

# --- Mapa e anúncio --------------------------------------------------------
I['mapa-pino'] = ('M16.5 8.25c0 4.5-4.5 8.25-4.5 8.25s-4.5-3.75-4.5-8.25a4.5 4.5 0 1 1 9 0Z' + circle(12, 8.25, 1.5) +
                  'M7.125 14.25H4.5l-2.25 6.75h19.5l-2.25-6.75h-2.625')
I['camadas-mapa'] = ('M12 3.75l9.75 6-9.75 6-9.75-6 9.75-6ZM2.25 12.75v1.5L12 20.25l9.75-6v-1.5'
                     'M7.125 6.75c1.125 1.5 0 3 2.625 3.375s3.375-.375 4.5 1.125c.75 1.125 1.5 1.5 2.625 1.5')
# Rota até o imóvel: casinha, trilha de pontos e o alfinete (time: Asset-10 · 33-rota-casa)
I['rota-casa'] = ('M3 21v-5.625L6.375 12l3.375 3.375V21H3ZM5.625 21v-2.25h1.5V21' +
                  'M21 6.75c0 3.75-3.75 6.75-3.75 6.75s-3.75-3-3.75-6.75a3.75 3.75 0 1 1 7.5 0Z' + circle(17.25, 6.75, 1.5) +
                  dot(12.75, 20.25) + dot(15.375, 19.125) + dot(17.25, 16.875))
I['parque'] = (tree(7.5, 2.25, 2 / 3) + 'M7.5 10.75v5.25' + circle(16.875, 6, 1.875) +
               'M2.25 16.5c3.25-1.25 6.5-1.25 9.75 0s6.5 1.25 9.75 0M2.25 20.25c2.25-1 4.5-1 6.75 0')
I['chacara'] = ('M4.5 15h15M4.5 9.75V15M12 15V9.75H4.5l3.75-5.25h7.5L19.5 9.75V15M12 9.75l3.75-5.25'
                'M14.625 15v-3h2.25v3M14.25 17.25c-.375 1.5-2.25 3-4.5 3.75M17.25 17.25c0 1.5-.75 2.625-2.25 3.75')
I['planta'] = ('M3 3h18v8.25M3 3v4.5M3 10.5V21h9M9.75 3v6.75h3M15.75 9.75H21M9.75 13.5V21'
               'M14.25 14.25 16.5 21l1.5-2.25 2.625 2.625 1.125-1.125-2.625-2.625 2.25-1.5Z')
# Chave: a key oficial do Heroicons (time: Asset-5 · 23-chave)
I['chave'] = ('M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25'
              'v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z')
# Casa com chave: telhado e a chave em pé (time: Asset-7 · 30-casa-chave)
I['casa-chave'] = 'M3 10.5 12 3l9 7.5' + key(12, 7.875, 3.375, 21, 1)
# Selo: medalha de borda recortada com fitas (time: Asset-15 · 48-selo-premio)
selo = Pen()
n, R, cx, cy = 12, 5.625, 12, 8.625
for i in range(n + 1):
    a = -math.pi / 2 + 2 * math.pi * i / n
    x, y = cx + R * math.cos(a), cy + R * math.sin(a)
    selo.M(x, y) if i == 0 else selo.A(1.6, 0, 1, x, y)
I['selo'] = (selo.Z().d + circle(12, 8.625, 2.25) +
             'M9.75 13.875 8.25 20.25l1.875-.75.75 1.5L12 14.625 13.125 21l.75-1.5 1.875.75-1.5-6.375')

for k, d in I.items():
    svg(k, d)
print(len(I), 'gerados')
