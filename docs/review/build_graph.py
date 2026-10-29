"""Build dependency-graph.html: an interactive diagram of the dependencies of the integration.

Usage (Python 3.14, stdlib only), from the repository root:
    python docs/review/build_graph.py [path-to-repository]

It reuses the analysis of build_dependencies.py (same folder) and writes one self-contained HTML
file with three views: the topic packages, the modules, and the TypeScript files of the panel.
A click on a node shows what it imports and who imports it; the links go to dependencies.html.
"""

from __future__ import annotations

import json
from pathlib import Path
import sys

import build_dependencies as bd

HERE = Path(__file__).resolve().parent
OUT = HERE / "dependency-graph.html"
DETAILS = "dependencies.html"


def point_at(root: Path) -> None:
    """Make the analysis of build_dependencies read the repository at `root`."""
    bd.ROOT = root
    bd.PKG = root / "custom_components" / "hass_test_data_creator"
    bd.PANEL = root / "panel-src" / "src"


def module_nodes(modules: dict[str, bd.Module]) -> dict[str, object]:
    """Return the nodes and edges of the module view and of the package view."""
    nodes = []
    edges = []
    for name, mod in sorted(modules.items()):
        nodes.append(
            {
                "id": name,
                "label": name.split(".")[-1] if "." in name else name,
                "group": bd.topic_of(name),
                "layer": bd.layer_of(name),
                "size": mod.code,
                "doc": mod.doc,
                "href": f"{DETAILS}#{bd.anchor('m', name)}",
            }
        )
        for target in sorted(mod.imports):
            if target in modules and target != name:
                edges.append([name, target, 0])
        for target in sorted(mod.lazy_imports):
            if target in modules and target != name:
                edges.append([name, target, 1])
    package_nodes: dict[str, dict] = {}
    for node in nodes:
        entry = package_nodes.setdefault(
            node["group"],
            {
                "id": node["group"],
                "label": node["group"],
                "group": node["group"],
                "layer": node["layer"],
                "size": 0,
                "doc": "",
                "href": f"{DETAILS}#topic-{node['group']}",
                "count": 0,
            },
        )
        entry["size"] += node["size"]
        entry["count"] += 1
        entry.setdefault("layers", []).append(node["layer"])
    for entry in package_nodes.values():
        layers = entry.pop("layers")
        # the entry points of the root fill the first row; a package sits where most of its modules are
        entry["layer"] = 0 if entry["id"] == "(root)" else max(set(layers), key=layers.count)
    weights: dict[tuple[str, str], int] = {}
    group = {n["id"]: n["group"] for n in nodes}
    for source, target, _ in edges:
        a, b = group[source], group[target]
        if a != b:
            weights[(a, b)] = weights.get((a, b), 0) + 1
    package_edges = [[a, b, w] for (a, b), w in sorted(weights.items())]
    return {
        "modules": {"nodes": nodes, "edges": edges},
        "packages": {"nodes": sorted(package_nodes.values(), key=lambda n: n["id"]), "edges": package_edges},
    }


def panel_nodes(ts: dict[str, bd.TsFile]) -> dict[str, object]:
    """Return the nodes and edges of the panel view (files without tests)."""
    nodes = []
    edges = []
    files = {rel: f for rel, f in ts.items() if not f.test}
    for rel, f in sorted(files.items()):
        folder = rel.split("/")[0] if "/" in rel else "(root)"
        nodes.append(
            {
                "id": rel,
                "label": rel.split("/")[-1].removesuffix(".ts"),
                "group": folder,
                "layer": 0,
                "size": f.lines,
                "doc": ", ".join(tag for tag, _ in f.tags),
                "href": f"{DETAILS}#{bd.anchor('t', rel)}",
            }
        )
        for target in sorted(f.imports):
            if target in files:
                edges.append([rel, target, 0])
    return {"nodes": nodes, "edges": edges}


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dependency graph</title>
<style>
:root{--bg:#fafafa;--fg:#212121;--muted:#6b6b6b;--card:#fff;--line:#d5d5d5;--accent:#0b7fc7;--out:#d9730d;--in:#1c8a4a}
@media (prefers-color-scheme:dark){:root{--bg:#111;--fg:#e4e4e4;--muted:#9a9a9a;--card:#1c1c1c;--line:#3a3a3a;--accent:#4fb3f0;--out:#f0a050;--in:#5fcf8a}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,sans-serif}
header{padding:12px 16px;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;gap:12px;align-items:center}
h1{font-size:17px;margin:0}
.tabs button,select,input{font:inherit;color:inherit;background:var(--card);border:1px solid var(--line);border-radius:6px;padding:5px 10px}
.tabs button.on{border-color:var(--accent);color:var(--accent)}
main{display:grid;grid-template-columns:1fr 320px;min-height:calc(100vh - 56px)}
@media (max-width:900px){main{grid-template-columns:1fr}}
#stage{overflow:auto;padding:8px;min-height:60vh}
aside{border-left:1px solid var(--line);padding:12px 16px;background:var(--card);overflow:auto}
aside h2{font-size:15px;margin:0 0 4px}
aside ul{margin:4px 0 12px;padding-left:18px}
aside a{color:var(--accent)}
.muted{color:var(--muted)}
svg text{fill:var(--fg);font:11px system-ui,sans-serif;pointer-events:none}
svg .band{fill:none;stroke:var(--line);stroke-dasharray:4 4}
svg .bandlabel{fill:var(--muted);font-size:11px}
svg .node rect{fill:var(--card);stroke:var(--line);stroke-width:1.2}
svg .node{cursor:pointer}
svg .node:hover rect{stroke:var(--accent)}
svg .node.sel rect{stroke:var(--fg);stroke-width:2.4}
svg .node.out rect{stroke:var(--out);stroke-width:2.2}
svg .node.in rect{stroke:var(--in);stroke-width:2.2}
svg .node.dim{opacity:.25}
svg path.edge{fill:none;stroke:var(--line);stroke-width:1;opacity:.55}
svg path.edge.lazy{stroke-dasharray:3 3}
svg path.edge.out{stroke:var(--out);stroke-width:2;opacity:1}
svg path.edge.in{stroke:var(--in);stroke-width:2;opacity:1}
svg path.edge.hide{display:none}
.legend span{display:inline-block;width:18px;height:3px;vertical-align:middle;margin:0 4px 0 12px}
</style>
</head>
<body>
<header>
<h1>Dependency graph</h1>
<div class="tabs"><button data-view="packages" class="on">Packages</button><button data-view="modules">Modules</button><button data-view="panel">Panel</button></div>
<label>Filter <input id="filter" placeholder="module or package" size="18"></label>
<label><input type="checkbox" id="all"> all edges</label>
<span class="legend muted"><span style="background:var(--out)"></span>imports <span style="background:var(--in)"></span>imported by <span style="background:var(--line)"></span>other</span>
<a href="dependencies.html" class="muted">&larr; details</a>
</header>
<main>
<div id="stage"></div>
<aside id="side"><p class="muted">Click a node: its imports (orange) and its importers (green) are highlighted and listed here. Arrows point from the importing module to the imported one. In the module and panel views the edges of the selected node are drawn; tick "all edges" to see every edge.</p></aside>
</main>
<script>
const DATA = __DATA__;
const LAYERS = __LAYERS__;
const NS = 'http://www.w3.org/2000/svg';
let view = 'packages', selected = null;

function el(name, attrs, parent) { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

function layout(graph, view) {
  // rows by layer (modules and packages) or by folder (panel); nodes in a row wrap into several lines
  const rows = new Map();
  for (const n of graph.nodes) { const key = view === 'panel' ? n.group : n.layer; if (!rows.has(key)) rows.set(key, []); rows.get(key).push(n); }
  const keys = [...rows.keys()].sort((a, b) => view === 'panel' ? String(a).localeCompare(String(b)) : a - b);
  const W = view === 'packages' ? 118 : 104, H = 30, GX = 10, GY = 12, LEFT = 150, WIDTH = Math.max(900, Math.min(1500, window.innerWidth - 380));
  const perLine = Math.max(1, Math.floor((WIDTH - LEFT) / (W + GX)));
  let y = 10; const bands = [];
  for (const key of keys) {
    const list = rows.get(key).sort((a, b) => a.group.localeCompare(b.group) || a.id.localeCompare(b.id));
    const lines = Math.ceil(list.length / perLine);
    const top = y;
    list.forEach((n, i) => { n.x = LEFT + (i % perLine) * (W + GX); n.y = y + 8 + Math.floor(i / perLine) * (H + GY); n.w = W; n.h = H; });
    y += 16 + lines * (H + GY);
    bands.push({ top, height: y - top - 4, label: view === 'panel' ? key : LAYERS[key] });
  }
  return { width: LEFT + perLine * (W + GX) + 10, height: y + 10, bands };
}

function path(a, b) {
  const x1 = a.x + a.w / 2, y1 = a.y + a.h / 2, x2 = b.x + b.w / 2, y2 = b.y + b.h / 2;
  if (a === b) return '';
  const dy = Math.abs(y2 - y1), dx = Math.abs(x2 - x1);
  const bend = Math.max(30, Math.min(160, dy / 2 + dx / 4));
  const sy = y2 >= y1 ? a.y + a.h : a.y, ey = y2 >= y1 ? b.y : b.y + b.h;
  const sx = x1, ex = x2;
  if (Math.abs(y2 - y1) < 1) return `M${x1},${a.y} C${x1},${a.y - 28} ${x2},${b.y - 28} ${x2},${b.y}`;
  return `M${sx},${sy} C${sx},${sy + (y2 >= y1 ? bend : -bend)} ${ex},${ey + (y2 >= y1 ? -bend : bend)} ${ex},${ey}`;
}

function render() {
  const graph = DATA[view];
  const stage = document.getElementById('stage');
  stage.textContent = '';
  const box = layout(graph, view);
  const svg = el('svg', { width: box.width, height: box.height, viewBox: `0 0 ${box.width} ${box.height}` }, stage);
  const defs = el('defs', {}, svg);
  for (const [id, cls] of [['arrow', ''], ['arrow-out', 'out'], ['arrow-in', 'in']]) {
    const m = el('marker', { id, viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
    el('path', { d: 'M0,0 L8,4 L0,8 z', fill: cls === 'out' ? 'var(--out)' : cls === 'in' ? 'var(--in)' : 'var(--line)' }, m);
  }
  for (const b of box.bands) {
    el('rect', { class: 'band', x: 4, y: b.top, width: box.width - 8, height: b.height, rx: 8 }, svg);
    const t = el('text', { class: 'bandlabel', x: 12, y: b.top + 22 }, svg); t.textContent = b.label;
  }
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const edgeEls = [];
  for (const [s, t, w] of graph.edges) {
    const a = byId.get(s), b = byId.get(t); if (!a || !b) continue;
    const p = el('path', { class: 'edge' + (view === 'packages' ? '' : (w === 1 ? ' lazy' : '')), d: path(a, b), 'marker-end': 'url(#arrow)' }, svg);
    if (view === 'packages') p.setAttribute('stroke-width', Math.min(5, 1 + Math.log2(w || 1)));
    edgeEls.push({ s, t, p, w });
  }
  const nodeEls = new Map();
  for (const n of graph.nodes) {
    const g = el('g', { class: 'node', transform: `translate(${n.x},${n.y})` }, svg);
    el('rect', { width: n.w, height: n.h, rx: 6 }, g);
    const t = el('text', { x: 6, y: 13 }, g); t.textContent = n.label.length > 17 ? n.label.slice(0, 16) + '…' : n.label;
    const sub = el('text', { x: 6, y: 25, style: 'fill:var(--muted);font-size:9.5px' }, g);
    sub.textContent = view === 'packages' ? `${n.count} modules · ${n.size} lines` : (view === 'modules' ? `${n.group} · ${n.size}` : `${n.size} lines`);
    const title = el('title', {}, g); title.textContent = n.id + (n.doc ? ' — ' + n.doc : '');
    g.addEventListener('click', () => { selected = n.id; paint(); });
    nodeEls.set(n.id, g);
  }
  render.state = { graph, edgeEls, nodeEls, byId };
  paint();
}

function paint() {
  const { graph, edgeEls, nodeEls, byId } = render.state;
  const filter = document.getElementById('filter').value.trim().toLowerCase();
  const all = document.getElementById('all').checked || view === 'packages';
  const outs = new Set(), ins = new Set();
  for (const e of edgeEls) {
    const isOut = e.s === selected, isIn = e.t === selected;
    if (isOut) outs.add(e.t);
    if (isIn) ins.add(e.s);
    e.p.setAttribute('class', 'edge' + (view !== 'packages' && e.w === 1 ? ' lazy' : '') + (isOut ? ' out' : isIn ? ' in' : (all || !selected && false ? '' : ' hide')));
    e.p.setAttribute('marker-end', isOut ? 'url(#arrow-out)' : isIn ? 'url(#arrow-in)' : 'url(#arrow)');
    if (!selected && all) e.p.setAttribute('class', 'edge' + (view !== 'packages' && e.w === 1 ? ' lazy' : ''));
  }
  for (const [id, g] of nodeEls) {
    const hit = !filter || id.toLowerCase().includes(filter);
    g.setAttribute('class', 'node' + (id === selected ? ' sel' : outs.has(id) ? ' out' : ins.has(id) ? ' in' : '') + (hit ? '' : ' dim') + (selected && id !== selected && !outs.has(id) && !ins.has(id) ? ' dim' : ''));
  }
  const side = document.getElementById('side');
  if (!selected) return;
  const n = byId.get(selected);
  const list = (set) => [...set].sort().map((x) => { const m = byId.get(x); return `<li><a href="#" data-node="${x}">${x}</a>${m ? ` <a href="${m.href}" title="details">&#8599;</a>` : ''}</li>`; }).join('') || '<li class="muted">none</li>';
  const weightNote = view === 'packages' ? '<p class="muted">Package view: the line width shows how many module imports connect two packages.</p>' : '';
  side.innerHTML = `<h2>${n.id}</h2><p class="muted">${n.doc || ''}</p><p><a href="${n.href}">Open the details &#8599;</a></p>${weightNote}<b>Imports (${outs.size})</b><ul>${list(outs)}</ul><b>Imported by (${ins.size})</b><ul>${list(ins)}</ul>`;
  side.querySelectorAll('a[data-node]').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); selected = a.dataset.node; paint(); }));
}

document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('on', x === b));
  view = b.dataset.view; selected = null; document.getElementById('side').innerHTML = '<p class="muted">Click a node.</p>'; render();
}));
document.getElementById('filter').addEventListener('input', paint);
document.getElementById('all').addEventListener('change', paint);
window.addEventListener('resize', () => { render(); });
render();
</script>
</body>
</html>
"""


def main() -> None:
    """Analyse the repository and write dependency-graph.html."""
    if len(sys.argv) > 1:
        point_at(Path(sys.argv[1]).resolve())
    modules = bd.analyse_python()
    ts = bd.analyse_ts()
    data = module_nodes(modules)
    data["panel"] = panel_nodes(ts)
    layers = ["Entry points", "WebSocket API", "Topic modules", "Domain parts", "Foundation"]
    page = PAGE.replace("__DATA__", json.dumps(data)).replace("__LAYERS__", json.dumps(layers))
    OUT.write_text(page, encoding="utf-8")
    print(
        f"wrote {OUT} ({len(page) / 1024:.0f} KiB): {len(data['modules']['nodes'])} modules, "
        f"{len(data['modules']['edges'])} module edges, {len(data['packages']['edges'])} package edges, "
        f"{len(data['panel']['nodes'])} panel files"
    )


if __name__ == "__main__":
    main()
