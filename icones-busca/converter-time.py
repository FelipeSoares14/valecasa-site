"""Converte os ícones do time (exportados do Figma) para o padrão Heroicons v2 optimized/24/outline.

Fonte: OneDrive/Área de Trabalho/hand off/icones dribble/search (desenhos do time ValeCasa).
O desenho é mantido. O script só:
  1. desfaz a escala quando o ícone foi redimensionado no Figma (traço diferente de 1.5): escala 1.5/traço
     em volta do centro da grade, para o traço voltar a 1.5 sem mudar a proporção;
  2. junta todos os <path> num só, sem fill, e tira restos de exportação (trechos de menos de 0.05);
  3. reescreve curvas que são arcos de círculo como arcos (a), retas como h/v/l e o resto em c relativo,
     com até 3 casas, como o svgo do Heroicons;
  4. aplica os poucos ajustes listados em AJUSTES (cada um explicado).
Perfil e Rua são os ícones oficiais do Heroicons (user-circle e map-pin) e saem com o código oficial.
Uso: python converter-time.py  (depois rode o build.ps1)
"""
import math, os, re

ORIGEM = os.path.join(os.path.expanduser('~'), 'OneDrive', 'Área de Trabalho', 'hand off', 'icones dribble', 'search')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'svg')

ARQUIVOS = {'cidade': 'Cidade.svg', 'bairro': 'BAIRRO.svg', 'rua': 'rua.svg', 'condominio': 'Condomínio.svg',
            'empreendimento': 'EMPREENDIMENTO.svg', 'perfil': 'perfil.svg', 'corretor': 'Corretor.svg',
            'imobiliaria': 'Imobiliaria.svg', 'construtora': 'Construtora.svg'}

OFICIAIS = {
    'perfil': 'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    'rua': 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z',
}


# --- leitura -----------------------------------------------------------------
def parse(d):
    """Path absoluto do Figma (M L H V C Z) -> subpaths {'start', 'segs': [(tipo, pontos)], 'closed'}"""
    toks = re.findall(r'[MLHVCZ]|-?\d*\.?\d+(?:e-?\d+)?', d)
    subs, cur, x, y, i, cmd = [], None, 0.0, 0.0, 0, None
    while i < len(toks):
        if re.match(r'[A-Z]', toks[i]):
            cmd = toks[i]; i += 1
            if cmd == 'Z':
                cur['closed'] = True; x, y = cur['start']
            continue
        n = lambda k: float(toks[i + k])
        if cmd == 'M':
            cur = {'start': (n(0), n(1)), 'segs': [], 'closed': False}; subs.append(cur); x, y = n(0), n(1); i += 2; cmd = 'L'
        elif cmd == 'L':
            cur['segs'].append(('L', [(x, y), (n(0), n(1))])); x, y = n(0), n(1); i += 2
        elif cmd == 'H':
            cur['segs'].append(('L', [(x, y), (n(0), y)])); x = n(0); i += 1
        elif cmd == 'V':
            cur['segs'].append(('L', [(x, y), (x, n(0))])); y = n(0); i += 1
        elif cmd == 'C':
            cur['segs'].append(('C', [(x, y), (n(0), n(1)), (n(2), n(3)), (n(4), n(5))])); x, y = n(4), n(5); i += 6
        else:
            raise ValueError('comando não previsto: ' + cmd)
    return subs


def ler(arquivo):
    s = open(os.path.join(ORIGEM, arquivo), encoding='utf-8').read()
    paths = re.findall(r'<path[^>]*>', s)
    traco = float(re.search(r'stroke-width="([\d.]+)"', paths[0]).group(1))
    subs = []
    for p in paths:
        subs += parse(re.search(r' d="([^"]*)"', p).group(1))
    return subs, traco


# --- geometria ---------------------------------------------------------------
def transformar(subs, fn):
    for sp in subs:
        sp['start'] = fn(*sp['start'])
        sp['segs'] = [(t, [fn(*p) for p in pts]) for t, pts in sp['segs']]
    return subs


def _bez(p, t):
    a = 1 - t
    return (a**3 * p[0][0] + 3 * a * a * t * p[1][0] + 3 * a * t * t * p[2][0] + t**3 * p[3][0],
            a**3 * p[0][1] + 3 * a * a * t * p[1][1] + 3 * a * t * t * p[2][1] + t**3 * p[3][1])


def comprimento(seg):
    t, pts = seg
    if t == 'L':
        return math.dist(pts[0], pts[1])
    return sum(math.dist(_bez(pts, k / 8), _bez(pts, (k + 1) / 8)) for k in range(8))


def limpar(subs):
    """Tira subpaths degenerados e trechos minúsculos (restos do Figma), costurando as pontas."""
    out = []
    for sp in subs:
        if sum(comprimento(s) for s in sp['segs']) < .1:
            continue
        segs = []
        for s in sp['segs']:
            if comprimento(s) < .05:
                continue
            if segs:
                s = (s[0], [segs[-1][1][-1]] + s[1][1:])
            else:
                s = (s[0], [sp['start']] + s[1][1:])
            segs.append(s)
        if sp['closed'] and segs and math.dist(segs[-1][1][-1], sp['start']) < .05:
            segs[-1] = (segs[-1][0], segs[-1][1][:-1] + [sp['start']])
        sp['segs'] = segs
        # Anel minúsculo (ponto cheio no Figma, com fill): com traço 1.5 e sem fill o Chrome o desenha oco.
        # Vira o ponto do Heroicons (Mx yh.008v.008H x V y Z) no mesmo centro.
        xs = [p[0] for _, pts in segs for p in pts]; ys = [p[1] for _, pts in segs for p in pts]
        if sp['closed'] and max(xs) - min(xs) < 1.2 and max(ys) - min(ys) < 1.2:
            sp['dot'] = (round((min(xs) + max(xs)) / 2, 3), round((min(ys) + max(ys)) / 2, 3))
        out.append(sp)
    return out


def como_reta(pts, tol=.01):
    (x0, y0), _, _, (x3, y3) = pts
    L = math.dist((x0, y0), (x3, y3))
    if L < 1e-6:
        return False
    return all(abs((x3 - x0) * (y0 - y) - (x0 - x) * (y3 - y0)) / L <= tol for x, y in pts[1:3])


def como_arco(pts, tol=.012):
    """Se a cúbica é um arco de círculo, devolve (centro, raio, sweep, ângulo)."""
    p0, p1, p2, p3 = pts
    t0 = (p1[0] - p0[0], p1[1] - p0[1]); t3 = (p3[0] - p2[0], p3[1] - p2[1])
    if math.hypot(*t0) < 1e-6 or math.hypot(*t3) < 1e-6:
        return None
    n0 = (-t0[1], t0[0]); n3 = (-t3[1], t3[0])
    det = n0[0] * (-n3[1]) - n0[1] * (-n3[0])
    if abs(det) < 1e-9:
        return None
    dx, dy = p3[0] - p0[0], p3[1] - p0[1]
    a = (dx * (-n3[1]) - dy * (-n3[0])) / det
    c = (p0[0] + a * n0[0], p0[1] + a * n0[1])
    r0, r3 = math.dist(c, p0), math.dist(c, p3)
    if abs(r0 - r3) > tol * max(1, r0):
        return None
    r = (r0 + r3) / 2
    if any(abs(math.dist(c, _bez(pts, k)) - r) > tol * max(1, r) for k in (.25, .5, .75)):
        return None
    a0 = math.atan2(p0[1] - c[1], p0[0] - c[0]); a3 = math.atan2(p3[1] - c[1], p3[0] - c[0])
    sweep = 1 if (t0[0] * (p0[1] - c[1]) - t0[1] * (p0[0] - c[0])) < 0 else 0
    ang = (a3 - a0) % (2 * math.pi) if sweep else (a0 - a3) % (2 * math.pi)
    return c, r, sweep, ang


# --- escrita no formato do svgo do Heroicons ---------------------------------
def f(v):
    s = ('%.3f' % v).rstrip('0').rstrip('.')
    if s.startswith('0.'): s = s[1:]
    if s.startswith('-0.'): s = '-' + s[2:]
    return '0' if s in ('', '-0') else s


def _nums(nums):
    out = ''
    for n in nums:
        if out and not n.startswith('-') and not (n.startswith('.') and '.' in re.split(r'[ \-]', out)[-1]):
            out += ' '
        out += n
    return out


def compact(cmds):
    """cmds: (letra, [números formatados]). Não repete a letra quando o comando seguinte é igual (exceto M)."""
    out, prev = '', None
    for c, args in cmds:
        if c == 'Z':
            out += c; prev = None; continue
        if c == prev and c != 'M':
            last = re.split(r'[a-zA-Z ]', out)[-1]
            out += _nums([last] + args)[len(last):]
        else:
            out += c + _nums(args)
        prev = c
    return out


def escrever(subs):
    cmds = []
    for sp in subs:
        if 'dot' in sp:
            x, y = sp['dot']
            cmds += [('M', [f(x), f(y)]), ('h', ['.008']), ('v', ['.008']), ('H', [f(x)]), ('V', [f(y)]), ('Z', [])]
            continue
        if 'circle' in sp:   # círculo no formato do Heroicons: a r r 0 1 1-2r 0 r r 0 0 1 2r 0Z
            cx, cy, r = sp['circle']
            cmds += [('M', [f(cx + r), f(cy)]), ('a', [f(r), f(r), '0', '1', '1', f(-2 * r), '0']),
                     ('a', [f(r), f(r), '0', '0', '1', f(2 * r), '0']), ('Z', [])]
            continue
        # 1) classifica cada trecho e junta arcos seguidos do mesmo círculo (até 180 graus)
        itens = []
        for t, pts in sp['segs']:
            arco = como_arco(pts) if t == 'C' else None
            if arco:
                c, r, sw, ang = arco
                u = itens[-1] if itens else None
                if u and u[0] == 'a' and math.dist(u[1]['c'], c) < .02 and abs(u[1]['r'] - r) < .02 \
                        and u[1]['sw'] == sw and u[1]['ang'] + ang <= math.pi + 1e-3:
                    u[1]['ang'] += ang; u[1]['fim'] = pts[3]
                else:
                    itens.append(('a', {'c': c, 'r': r, 'sw': sw, 'ang': ang, 'fim': pts[3]}))
            elif t == 'C' and como_reta(pts):
                itens.append(('l', [pts[0], pts[3]]))
            else:
                itens.append(('l' if t == 'L' else 'c', pts))
        # 2) escreve em relativo, acompanhando a posição arredondada
        x, y = round(sp['start'][0], 3), round(sp['start'][1], 3)
        cmds.append(('M', [f(x), f(y)]))
        for k, (t, v) in enumerate(itens):
            ultimo = k == len(itens) - 1
            if t == 'a':
                ex, ey = round(v['fim'][0], 3), round(v['fim'][1], 3)
                large = 1 if v['ang'] > math.pi - 1e-3 else 0
                rr = f(round(v['r'], 3))
                cmds.append(('a', [rr, rr, '0', str(large), str(v['sw']), f(ex - x), f(ey - y)]))
            else:
                ex, ey = round(v[-1][0], 3), round(v[-1][1], 3)
                if t == 'l' and sp['closed'] and ultimo and (ex, ey) == (round(sp['start'][0], 3), round(sp['start'][1], 3)):
                    break   # a última reta volta ao início: o Z já desenha
                if t == 'l':
                    if ey == y: cmds.append(('h', [f(ex - x)]))
                    elif ex == x: cmds.append(('v', [f(ey - y)]))
                    else: cmds.append(('l', [f(ex - x), f(ey - y)]))
                else:
                    cmds.append(('c', [f(round(a, 3) - (x if i % 2 == 0 else y)) for q in v[1:] for i, a in enumerate(q)]))
            x, y = ex, ey
        if sp['closed']:
            cmds.append(('Z', []))
    return compact(cmds)


# --- ajustes mínimos por ícone ----------------------------------------------
def _troncos_ate_o_chao(subs):
    """Bairro: os troncos paravam 0.7 acima do chão (já pareciam encostados); passam a tocar o chão."""
    chao = max((sp for sp in subs if len(sp['segs']) == 1 and abs(sp['segs'][0][1][0][1] - sp['segs'][0][1][1][1]) < .01),
               key=lambda sp: comprimento(sp['segs'][0]))
    yc = chao['segs'][0][1][0][1]
    for sp in subs:
        if sp is not chao and len(sp['segs']) == 1:
            (x0, y0), (x1, y1) = sp['segs'][0][1]
            if abs(x0 - x1) < .01 and 0 < yc - max(y0, y1) < 1:
                topo = min(y0, y1)
                sp['start'] = (x0, topo); sp['segs'] = [('L', [(x0, topo), (x0, yc)])]
    return subs


def _pontos(sp):
    return [sp['start']] + [p for _, pts in sp['segs'] for p in pts]


def _gravata_no_eixo(subs, centralizar=True):
    """Corretor, Imobiliária e Construtora: o eixo da figura é o centro da cabeça (a de cima). As pontas da gravata
    e do nó que estavam até 0.2 fora desse eixo voltam para ele. No Corretor e na Imobiliária a figura também é
    centralizada na grade (x = 12); na Construtora a pessoa fica onde está, à direita do prédio."""
    cabeca = min((sp for sp in subs if sp['closed']), key=lambda sp: min(p[1] for p in _pontos(sp)))
    xs = [p[0] for p in _pontos(cabeca)]
    eixo = (min(xs) + max(xs)) / 2
    alvo = 12 if centralizar else eixo
    dx = alvo - eixo
    return transformar(subs, lambda x, y: (alvo, y) if abs(x - eixo) < .2 else (x + dx, y))


SOL = (20.25, 6.375, 1.5)


def _bairro(subs):
    """Bairro: troncos até o chão e, no lugar do ponto pequeno, um sol (ou lua) de raio 1.5,
    a pedido do time, um pouco para a esquerda para caber na margem da grade."""
    subs = _troncos_ate_o_chao(subs)
    for sp in subs:
        if 'dot' in sp:
            del sp['dot']
            sp['circle'] = SOL
    return subs


AJUSTES = {
    'bairro': _bairro,
    'corretor': _gravata_no_eixo,
    'imobiliaria': _gravata_no_eixo,
    'construtora': lambda s: _gravata_no_eixo(s, centralizar=False),
}

# Construtora: o time encaixou o desenho no quadro de 24 de propósito (traço 1.423). Desfazer a escala o deixaria
# 5% maior, passando da área útil da grade (até 22.4); por isso ela mantém o tamanho do arquivo e só o traço vira 1.5.
MANTER_TAMANHO = {'construtora'}


def converter(id_):
    if id_ in OFICIAIS:
        return OFICIAIS[id_]
    subs, traco = ler(ARQUIVOS[id_])
    k = 1.5 / traco
    if abs(k - 1) > 1e-3 and id_ not in MANTER_TAMANHO:
        transformar(subs, lambda x, y: (12 + (x - 12) * k, 12 + (y - 12) * k))
    subs = limpar(subs)
    if id_ in AJUSTES:
        subs = AJUSTES[id_](subs)
    return escrever(subs)


if __name__ == '__main__':
    for id_ in ARQUIVOS:
        d = converter(id_)
        with open(os.path.join(OUT, id_ + '.svg'), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write('<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">\n')
            fh.write('  <path stroke-linecap="round" stroke-linejoin="round" d="%s"/>\n</svg>\n' % d)
        print(id_, len(d), d[:110])
