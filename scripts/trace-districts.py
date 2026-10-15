"""
Traces the 9 district outlines (and the island coastline) from a simple
district map image (pink districts, black borders, white sea) and writes
src/data/districtShapes.ts.

    python3 scripts/trace-districts.py path/to/districts-map.png

Only needs Pillow + numpy. Pixels are mapped linearly to the island's
real lat/lon extent; LABELS are the label positions in the image (also used
as each district's label anchor in the game).
"""
import json, sys
from collections import deque
import numpy as np
from PIL import Image

img = np.array(Image.open(sys.argv[1]).convert('RGB')).astype(int)
H, W, _ = img.shape
r, g, b = img[..., 0], img[..., 1], img[..., 2]
white = (r > 235) & (g > 235) & (b > 235)
pink = (r > 200) & (g > 150) & (g < 225) & (b > 150) & (b < 225) & (r - g > 20)
print('pink px', pink.sum(), 'white', white.sum(), file=sys.stderr)

# connected components of pink (4-neighbour)
lab = np.zeros((H, W), int)
comps = []
n = 0
for y in range(H):
    for x in range(W):
        if pink[y, x] and not lab[y, x]:
            n += 1
            q = deque([(y, x)]); lab[y, x] = n; pts = []
            while q:
                cy, cx = q.popleft(); pts.append((cy, cx))
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                    ny, nx = cy+dy, cx+dx
                    if 0 <= ny < H and 0 <= nx < W and pink[ny, nx] and not lab[ny, nx]:
                        lab[ny, nx] = n; q.append((ny, nx))
            comps.append((n, len(pts), np.mean([p[1] for p in pts]), np.mean([p[0] for p in pts])))
big = [c for c in comps if c[1] > 1500]
print('components', len(comps), 'big', [(c[0], c[1], round(c[2]), round(c[3])) for c in big], file=sys.stderr)

# label centres read off the image
LABELS = {
 'port-louis': (220, 185), 'pamplemousses': (270, 130), 'riviere-du-rempart': (345, 95),
 'flacq': (405, 250), 'moka': (270, 258), 'plaines-wilhems': (215, 355),
 'grand-port': (325, 415), 'savanne': (205, 470), 'black-river': (110, 315),
}
assign = {}
for did, (lx, ly) in LABELS.items():
    best = min(big, key=lambda c: (c[2]-lx)**2 + (c[3]-ly)**2)
    assign[best[0]] = did
print('assign', assign, file=sys.stderr)
keep = {k: v for k, v in assign.items()}
# grow district labels over line/text pixels inside the island (multi-source BFS)
region = np.zeros((H, W), int)
q = deque()
for cid in keep:
    ys, xs = np.nonzero(lab == cid)
    region[ys, xs] = cid
    for y, x in zip(ys, xs): q.append((y, x))
inside = ~white
while q:
    cy, cx = q.popleft()
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        ny, nx = cy+dy, cx+dx
        if 0 <= ny < H and 0 <= nx < W and inside[ny, nx] and not region[ny, nx]:
            region[ny, nx] = region[cy, cx]; q.append((ny, nx))

def trace(mask):
    """Moore-neighbour boundary trace of the largest blob; returns pixel-corner-ish points."""
    ys, xs = np.nonzero(mask)
    start = (ys.min(), xs[ys == ys.min()].min())
    nbr = [(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1)]
    pts = [start]; cur = start; back = 6  # came from the west
    for _ in range(200000):
        for i in range(8):
            d = (back + 1 + i) % 8
            ny, nx = cur[0]+nbr[d][0], cur[1]+nbr[d][1]
            if 0 <= ny < H and 0 <= nx < W and mask[ny, nx]:
                back = (d + 4) % 8
                cur = (ny, nx)
                break
        if cur == start: break
        pts.append(cur)
    return pts

def dp(points, eps):
    if len(points) < 3: return points
    a, bpt = np.array(points[0], float), np.array(points[-1], float)
    ab = bpt - a; L = np.hypot(*ab) or 1.0
    dmax, idx = 0, 0
    for i in range(1, len(points)-1):
        p = np.array(points[i], float)
        d = abs(ab[0]*(a[1]-p[1]) - ab[1]*(a[0]-p[0])) / L
        if d > dmax: dmax, idx = d, i
    if dmax > eps:
        return dp(points[:idx+1], eps)[:-1] + dp(points[idx:], eps)
    return [points[0], points[-1]]

def simplify_closed(pts, eps):
    # split at the farthest point from the start to handle the closed loop
    p0 = np.array(pts[0]); far = max(range(len(pts)), key=lambda i: np.hypot(*(np.array(pts[i]) - p0)))
    return dp(pts[:far+1], eps)[:-1] + dp(pts[far:] + [pts[0]], eps)[:-1]

# pixel -> lat/lon calibration from the main island's extent
island = region > 0
ys, xs = np.nonzero(island)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
print('island px bounds', x0, x1, y0, y1, file=sys.stderr)
LON0, LON1, LAT0, LAT1 = 57.307, 57.793, -19.983, -20.525
def ll(p):
    y, x = p
    return [round(LAT0 + (y - y0) / (y1 - y0) * (LAT1 - LAT0), 4), round(LON0 + (x - x0) / (x1 - x0) * (LON1 - LON0), 4)]

out = {'districts': {}, 'coast': None}
for cid, did in keep.items():
    pts = simplify_closed(trace(region == cid), 1.3)
    out['districts'][did] = [ll(p) for p in pts]
    print(did, len(pts), file=sys.stderr)
coast = simplify_closed(trace(island), 1.1)
out['coast'] = [ll(p) for p in coast]
print('coast', len(coast), file=sys.stderr)
out['labels'] = {k: ll((y, x)) for k, (x, y) in LABELS.items()}
ts = ['// GENERATED by scripts/trace-districts.py — do not edit by hand.',
      "import type { DistrictId, LatLon } from '@/types/geo';", '',
      '/** Island coastline (lat/lon, closed). */',
      'export const ISLAND_OUTLINE: LatLon[] = ' + json.dumps(out['coast']) + ';', '',
      '/** District outlines (lat/lon, closed; neighbours share edges). */',
      'export const DISTRICT_SHAPES: Record<DistrictId, LatLon[]> = {']
for k, v in out['districts'].items():
    ts.append(f"  '{k}': {json.dumps(v)},")
ts.append('};'); ts.append('')
ts.append('/** Where each district name sits (lat/lon). */')
ts.append('export const DISTRICT_LABELS: Record<DistrictId, LatLon> = {')
for k, v in out['labels'].items():
    ts.append(f"  '{k}': {json.dumps(v)},")
ts.append('};')
open('src/data/districtShapes.ts', 'w').write('\n'.join(ts) + '\n')
