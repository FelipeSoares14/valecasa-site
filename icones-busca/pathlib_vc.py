"""Leitura de paths SVG (todos os comandos) para os geradores da Busca.

subpaths(d)  -> lista de subpaths; cada um com 'd' (texto absoluto no começo, para usar sozinho),
                'pts' (polilinha amostrada), 'closed' e 'bbox'.
"""
import math, re

_NUM = r'-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?'


def _tokens(d):
    return re.findall(r'[MmLlHhVvCcSsQqTtAaZz]|' + _NUM, d)


def _arc_pts(x1, y1, rx, ry, phi, fa, fs, x2, y2, n=24):
    """Converte arco de endpoint para pontos (SVG 1.1, F.6.5)."""
    if rx == 0 or ry == 0 or (x1 == x2 and y1 == y2):
        return [(x2, y2)]
    phi = math.radians(phi)
    c, s = math.cos(phi), math.sin(phi)
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    x1p, y1p = c * dx + s * dy, -s * dx + c * dy
    rx, ry = abs(rx), abs(ry)
    lam = x1p ** 2 / rx ** 2 + y1p ** 2 / ry ** 2
    if lam > 1:
        rx *= math.sqrt(lam); ry *= math.sqrt(lam)
    num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
    den = rx * rx * y1p * y1p + ry * ry * x1p * x1p
    co = math.sqrt(max(0, num / den)) * (-1 if fa == fs else 1)
    cxp, cyp = co * rx * y1p / ry, -co * ry * x1p / rx
    cx = c * cxp - s * cyp + (x1 + x2) / 2
    cy = s * cxp + c * cyp + (y1 + y2) / 2
    ang = lambda ux, uy, vx, vy: math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
    t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
    dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
    if not fs and dt > 0: dt -= 2 * math.pi
    if fs and dt < 0: dt += 2 * math.pi
    out = []
    for i in range(1, n + 1):
        t = t1 + dt * i / n
        out.append((cx + rx * math.cos(t) * c - ry * math.sin(t) * s, cy + rx * math.cos(t) * s + ry * math.sin(t) * c))
    return out


def _cubic(p0, p1, p2, p3, n=16):
    out = []
    for i in range(1, n + 1):
        t = i / n; a = 1 - t
        out.append((a ** 3 * p0[0] + 3 * a * a * t * p1[0] + 3 * a * t * t * p2[0] + t ** 3 * p3[0],
                    a ** 3 * p0[1] + 3 * a * a * t * p1[1] + 3 * a * t * t * p2[1] + t ** 3 * p3[1]))
    return out


def subpaths(d):
    toks = _tokens(d)
    subs, cur = [], None
    x = y = sx = sy = 0.0
    lc = None  # último controle de cúbica (para S)
    i, cmd = 0, None

    def novo(px, py):
        nonlocal cur
        cur = {'start': (px, py), 'pts': [(px, py)], 'closed': False, 'segs': []}
        subs.append(cur)

    while i < len(toks):
        t = toks[i]
        if re.match(r'[A-Za-z]', t):
            cmd = t; i += 1
            if cmd in 'Zz':
                cur['closed'] = True; cur['segs'].append('Z'); x, y = sx, sy; lc = None
                continue
        n = lambda k: float(toks[i + k])
        rel = cmd.islower(); C = cmd.upper()
        ox, oy = (x, y) if rel else (0, 0)
        if C == 'M':
            x, y = ox + n(0), oy + n(1); sx, sy = x, y; novo(x, y); i += 2
            cmd = 'l' if rel else 'L'; lc = None; continue
        if cur is None or (cur['closed'] and cur['segs'] and cur['segs'][-1] == 'Z'):
            novo(x, y)  # desenho depois de Z sem M: continua do ponto inicial
        if C == 'L':
            nx, ny = ox + n(0), oy + n(1); i += 2
            cur['segs'].append(('L', (x, y), (nx, ny))); cur['pts'].append((nx, ny)); x, y = nx, ny; lc = None
        elif C == 'H':
            nx = ox + n(0) if rel else n(0); i += 1
            cur['segs'].append(('L', (x, y), (nx, y))); cur['pts'].append((nx, y)); x = nx; lc = None
        elif C == 'V':
            ny = oy + n(0) if rel else n(0); i += 1
            cur['segs'].append(('L', (x, y), (x, ny))); cur['pts'].append((x, ny)); y = ny; lc = None
        elif C in 'CS':
            if C == 'C':
                p1 = (ox + n(0), oy + n(1)); p2 = (ox + n(2), oy + n(3)); p3 = (ox + n(4), oy + n(5)); i += 6
            else:
                p1 = (2 * x - lc[0], 2 * y - lc[1]) if lc else (x, y)
                p2 = (ox + n(0), oy + n(1)); p3 = (ox + n(2), oy + n(3)); i += 4
            cur['segs'].append(('C', (x, y), p1, p2, p3)); cur['pts'] += _cubic((x, y), p1, p2, p3)
            x, y = p3; lc = p2
        elif C == 'A':
            rx, ry, phi, fa, fs = n(0), n(1), n(2), int(n(3)), int(n(4))
            nx, ny = ox + n(5), oy + n(6); i += 7
            cur['segs'].append(('A', (x, y), rx, ry, phi, fa, fs, (nx, ny)))
            cur['pts'] += _arc_pts(x, y, rx, ry, phi, fa, fs, nx, ny); x, y = nx, ny; lc = None
        else:
            raise ValueError('comando não previsto: ' + cmd)
    for sp in subs:
        xs = [p[0] for p in sp['pts']]; ys = [p[1] for p in sp['pts']]
        sp['bbox'] = (min(xs), min(ys), max(xs), max(ys))
        sp['d'] = absoluto(sp)
    return subs


def _f(v):
    s = ('%.3f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('', '-0') else s


def absoluto(sp):
    """Texto do subpath em comandos absolutos (para usar sozinho num <path>)."""
    out = 'M%s %s' % (_f(sp['start'][0]), _f(sp['start'][1]))
    for s in sp['segs']:
        if s == 'Z':
            out += 'Z'
        elif s[0] == 'L':
            out += 'L%s %s' % (_f(s[2][0]), _f(s[2][1]))
        elif s[0] == 'C':
            out += 'C' + ' '.join(_f(v) for p in s[2:] for v in p)
        elif s[0] == 'A':
            _, _, rx, ry, phi, fa, fs, e = s
            out += 'A%s %s %s %d %d %s %s' % (_f(rx), _f(ry), _f(phi), fa, fs, _f(e[0]), _f(e[1]))
    return out
