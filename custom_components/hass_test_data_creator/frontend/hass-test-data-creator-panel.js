/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis, it = J.ShadowRoot && (J.ShadyCSS === void 0 || J.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, nt = Symbol(), dt = /* @__PURE__ */ new WeakMap();
let Tt = class {
  constructor(t, e, r) {
    if (this._$cssResult$ = !0, r !== nt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (it && t === void 0) {
      const r = e !== void 0 && e.length === 1;
      r && (t = dt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && dt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Dt = (s) => new Tt(typeof s == "string" ? s : s + "", void 0, nt), Y = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((r, i, n) => r + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + s[n + 1], s[0]);
  return new Tt(e, s, nt);
}, Ut = (s, t) => {
  if (it) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const r = document.createElement("style"), i = J.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = e.cssText, s.appendChild(r);
  }
}, pt = it ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const r of t.cssRules) e += r.cssText;
  return Dt(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: jt, defineProperty: zt, getOwnPropertyDescriptor: kt, getOwnPropertyNames: Lt, getOwnPropertySymbols: Bt, getPrototypeOf: Wt } = Object, Q = globalThis, ut = Q.trustedTypes, Vt = ut ? ut.emptyScript : "", Gt = Q.reactiveElementPolyfillSupport, D = (s, t) => s, K = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? Vt : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, ot = (s, t) => !jt(s, t), mt = { attribute: !0, type: String, converter: K, reflect: !1, useDefault: !1, hasChanged: ot };
Symbol.metadata ??= Symbol("metadata"), Q.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let O = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = mt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(t, r, e);
      i !== void 0 && zt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, r) {
    const { get: i, set: n } = kt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: i, set(o) {
      const l = i?.call(this);
      n?.call(this, o), this.requestUpdate(t, l, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? mt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(D("elementProperties"))) return;
    const t = Wt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(D("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(D("properties"))) {
      const e = this.properties, r = [...Lt(e), ...Bt(e)];
      for (const i of r) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [r, i] of e) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, r] of this.elementProperties) {
      const i = this._$Eu(e, r);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const i of r) e.unshift(pt(i));
    } else t !== void 0 && e.push(pt(t));
    return e;
  }
  static _$Eu(t, e) {
    const r = e.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const r of e.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ut(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, r) {
    this._$AK(t, r);
  }
  _$ET(t, e) {
    const r = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, r);
    if (i !== void 0 && r.reflect === !0) {
      const n = (r.converter?.toAttribute !== void 0 ? r.converter : K).toAttribute(e, r.type);
      this._$Em = t, n == null ? this.removeAttribute(i) : this.setAttribute(i, n), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const r = this.constructor, i = r._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const n = r.getPropertyOptions(i), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : K;
      this._$Em = i;
      const l = o.fromAttribute(e, n.type);
      this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, r, i = !1, n) {
    if (t !== void 0) {
      const o = this.constructor;
      if (i === !1 && (n = this[t]), r ??= o.getPropertyOptions(t), !((r.hasChanged ?? ot)(n, e) || r.useDefault && r.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, r)))) return;
      this.C(t, e, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: r, reflect: i, wrapped: n }, o) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, n] of this._$Ep) this[i] = n;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [i, n] of r) {
        const { wrapped: o } = n, l = this[i];
        o !== !0 || this._$AL.has(i) || l === void 0 || this.C(i, void 0, n, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((r) => r.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
O.elementStyles = [], O.shadowRootOptions = { mode: "open" }, O[D("elementProperties")] = /* @__PURE__ */ new Map(), O[D("finalized")] = /* @__PURE__ */ new Map(), Gt?.({ ReactiveElement: O }), (Q.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const at = globalThis, $t = (s) => s, X = at.trustedTypes, vt = X ? X.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, Mt = "$lit$", _ = `lit$${Math.random().toFixed(9).slice(2)}$`, Rt = "?" + _, qt = `<${Rt}>`, w = document, U = () => w.createComment(""), j = (s) => s === null || typeof s != "object" && typeof s != "function", lt = Array.isArray, Ft = (s) => lt(s) || typeof s?.[Symbol.iterator] == "function", et = `[ 	
\f\r]`, I = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, gt = /-->/g, ft = />/g, y = RegExp(`>|${et}(?:([^\\s"'>=/]+)(${et}*=${et}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), _t = /'/g, bt = /"/g, Nt = /^(?:script|style|textarea|title)$/i, Ht = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), h = Ht(1), Jt = Ht(2), T = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), yt = /* @__PURE__ */ new WeakMap(), A = w.createTreeWalker(w, 129);
function It(s, t) {
  if (!lt(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return vt !== void 0 ? vt.createHTML(t) : t;
}
const Zt = (s, t) => {
  const e = s.length - 1, r = [];
  let i, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = I;
  for (let l = 0; l < e; l++) {
    const a = s[l];
    let p, m, c = -1, g = 0;
    for (; g < a.length && (o.lastIndex = g, m = o.exec(a), m !== null); ) g = o.lastIndex, o === I ? m[1] === "!--" ? o = gt : m[1] !== void 0 ? o = ft : m[2] !== void 0 ? (Nt.test(m[2]) && (i = RegExp("</" + m[2], "g")), o = y) : m[3] !== void 0 && (o = y) : o === y ? m[0] === ">" ? (o = i ?? I, c = -1) : m[1] === void 0 ? c = -2 : (c = o.lastIndex - m[2].length, p = m[1], o = m[3] === void 0 ? y : m[3] === '"' ? bt : _t) : o === bt || o === _t ? o = y : o === gt || o === ft ? o = I : (o = y, i = void 0);
    const f = o === y && s[l + 1].startsWith("/>") ? " " : "";
    n += o === I ? a + qt : c >= 0 ? (r.push(p), a.slice(0, c) + Mt + a.slice(c) + _ + f) : a + _ + (c === -2 ? l : f);
  }
  return [It(s, n + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class z {
  constructor({ strings: t, _$litType$: e }, r) {
    let i;
    this.parts = [];
    let n = 0, o = 0;
    const l = t.length - 1, a = this.parts, [p, m] = Zt(t, e);
    if (this.el = z.createElement(p, r), A.currentNode = this.el.content, e === 2 || e === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (i = A.nextNode()) !== null && a.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const c of i.getAttributeNames()) if (c.endsWith(Mt)) {
          const g = m[o++], f = i.getAttribute(c).split(_), G = /([.?@])?(.*)/.exec(g);
          a.push({ type: 1, index: n, name: G[2], strings: f, ctor: G[1] === "." ? Xt : G[1] === "?" ? Yt : G[1] === "@" ? Qt : tt }), i.removeAttribute(c);
        } else c.startsWith(_) && (a.push({ type: 6, index: n }), i.removeAttribute(c));
        if (Nt.test(i.tagName)) {
          const c = i.textContent.split(_), g = c.length - 1;
          if (g > 0) {
            i.textContent = X ? X.emptyScript : "";
            for (let f = 0; f < g; f++) i.append(c[f], U()), A.nextNode(), a.push({ type: 2, index: ++n });
            i.append(c[g], U());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Rt) a.push({ type: 2, index: n });
      else {
        let c = -1;
        for (; (c = i.data.indexOf(_, c + 1)) !== -1; ) a.push({ type: 7, index: n }), c += _.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const r = w.createElement("template");
    return r.innerHTML = t, r;
  }
}
function M(s, t, e = s, r) {
  if (t === T) return t;
  let i = r !== void 0 ? e._$Co?.[r] : e._$Cl;
  const n = j(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== n && (i?._$AO?.(!1), n === void 0 ? i = void 0 : (i = new n(s), i._$AT(s, e, r)), r !== void 0 ? (e._$Co ??= [])[r] = i : e._$Cl = i), i !== void 0 && (t = M(s, i._$AS(s, t.values), i, r)), t;
}
class Kt {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: r } = this._$AD, i = (t?.creationScope ?? w).importNode(e, !0);
    A.currentNode = i;
    let n = A.nextNode(), o = 0, l = 0, a = r[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let p;
        a.type === 2 ? p = new L(n, n.nextSibling, this, t) : a.type === 1 ? p = new a.ctor(n, a.name, a.strings, this, t) : a.type === 6 && (p = new te(n, this, t)), this._$AV.push(p), a = r[++l];
      }
      o !== a?.index && (n = A.nextNode(), o++);
    }
    return A.currentNode = w, i;
  }
  p(t) {
    let e = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, e), e += r.strings.length - 2) : r._$AI(t[e])), e++;
  }
}
class L {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, r, i) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = r, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = M(this, t, e), j(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== T && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ft(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && j(this._$AH) ? this._$AA.nextSibling.data = t : this.T(w.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: r } = t, i = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = z.createElement(It(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const n = new Kt(i, this), o = n.u(this.options);
      n.p(e), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = yt.get(t.strings);
    return e === void 0 && yt.set(t.strings, e = new z(t)), e;
  }
  k(t) {
    lt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let r, i = 0;
    for (const n of t) i === e.length ? e.push(r = new L(this.O(U()), this.O(U()), this, this.options)) : r = e[i], r._$AI(n), i++;
    i < e.length && (this._$AR(r && r._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const r = $t(t).nextSibling;
      $t(t).remove(), t = r;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class tt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, r, i, n) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = n, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = u;
  }
  _$AI(t, e = this, r, i) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = M(this, t, e, 0), o = !j(t) || t !== this._$AH && t !== T, o && (this._$AH = t);
    else {
      const l = t;
      let a, p;
      for (t = n[0], a = 0; a < n.length - 1; a++) p = M(this, l[r + a], e, a), p === T && (p = this._$AH[a]), o ||= !j(p) || p !== this._$AH[a], p === u ? t = u : t !== u && (t += (p ?? "") + n[a + 1]), this._$AH[a] = p;
    }
    o && !i && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Xt extends tt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class Yt extends tt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Qt extends tt {
  constructor(t, e, r, i, n) {
    super(t, e, r, i, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = M(this, t, e, 0) ?? u) === T) return;
    const r = this._$AH, i = t === u && r !== u || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, n = t !== u && (r === u || i);
    i && this.element.removeEventListener(this.name, this, r), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class te {
  constructor(t, e, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    M(this, t);
  }
}
const ee = at.litHtmlPolyfillSupport;
ee?.(z, L), (at.litHtmlVersions ??= []).push("3.3.3");
const se = (s, t, e) => {
  const r = e?.renderBefore ?? t;
  let i = r._$litPart$;
  if (i === void 0) {
    const n = e?.renderBefore ?? null;
    r._$litPart$ = i = new L(t.insertBefore(U(), n), n, void 0, e ?? {});
  }
  return i._$AI(s), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ht = globalThis;
class C extends O {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = se(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return T;
  }
}
C._$litElement$ = !0, C.finalized = !0, ht.litElementHydrateSupport?.({ LitElement: C });
const re = ht.litElementPolyfillSupport;
re?.({ LitElement: C });
(ht.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const B = (s) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(s, t);
  }) : customElements.define(s, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ie = { attribute: !0, type: String, converter: K, reflect: !1, hasChanged: ot }, ne = (s = ie, t, e) => {
  const { kind: r, metadata: i } = e;
  let n = globalThis.litPropertyMetadata.get(i);
  if (n === void 0 && globalThis.litPropertyMetadata.set(i, n = /* @__PURE__ */ new Map()), r === "setter" && ((s = Object.create(s)).wrapped = !0), n.set(e.name, s), r === "accessor") {
    const { name: o } = e;
    return { set(l) {
      const a = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(o, a, s, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(o, void 0, s, l), l;
    } };
  }
  if (r === "setter") {
    const { name: o } = e;
    return function(l) {
      const a = this[o];
      t.call(this, l), this.requestUpdate(o, a, s, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function E(s) {
  return (t, e) => typeof e == "object" ? ne(s, t, e) : ((r, i, n) => {
    const o = i.hasOwnProperty(n);
    return i.constructor.createProperty(n, r), o ? Object.getOwnPropertyDescriptor(i, n) : void 0;
  })(s, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function d(s) {
  return E({ ...s, state: !0, attribute: !1 });
}
const oe = "hass_test_data_creator";
class ae {
  /** Create the client for one `hass` connection. */
  constructor(t) {
    this.hass = t;
  }
  /** Return version, limits and capabilities. */
  info() {
    return this.call("info");
  }
  /** Return all templates. */
  templates() {
    return this.call("templates/list");
  }
  /** Return one page of devices. */
  devices(t, e) {
    return this.call("devices/list", { offset: t, limit: e });
  }
  /** Create the devices of a job. */
  create(t) {
    return this.call("devices/create", { ...t });
  }
  /** Run an action on one entity of a device. */
  fire(t, e, r) {
    return this.call("devices/fire", { device: t, entity: e, action: r });
  }
  /** Return what a removal of the target would delete. */
  removalPlan(t, e) {
    return this.call("removal/plan", { target: t, target_id: e });
  }
  /** Remove the target. */
  removalRun(t, e) {
    return this.call("removal/run", { target: t, target_id: e });
  }
  /** Send a command with its defined fields to the backend. */
  call(t, e = {}) {
    const r = Object.fromEntries(Object.entries(e).filter(([, i]) => i !== void 0));
    return this.hass.callWS({ type: `${oe}/${t}`, ...r });
  }
}
function R(s) {
  if (typeof s == "object" && s !== null && "message" in s) {
    const { code: t, message: e } = s;
    return t ? `${t}: ${e}` : e;
  }
  return String(s);
}
const le = {
  title: "Test data",
  badge: "Test environment",
  tabDevices: "Devices",
  tabCreate: "Create",
  tabRemove: "Remove",
  loading: "Loading …",
  noDevices: 'No test devices yet. Open "Create" to generate some.',
  colName: "Name",
  colTemplate: "Template",
  colArea: "Area",
  colOutput: "Output",
  colValues: "Values",
  colActions: "Actions",
  loadMore: "Load more",
  devicesOf: "{shown} of {total} devices",
  remove: "Remove",
  template: "Template",
  count: "Count",
  namePattern: "Name pattern",
  namePatternHint: "Placeholders: {n}, {nn}, {template}",
  areas: "Areas",
  areasHint: "Comma separated; missing areas are created",
  areaMode: "Distribution",
  modeEven: "In turn",
  modeRandom: "Random",
  seed: "Seed",
  seedHint: "Empty uses the seed of the integration",
  customEntities: "Entities (JSON)",
  customTemplate: "Custom device",
  preview: "Preview of the first sensor (24 hours)",
  estimate: "{entities} entities, about {rate} state changes per second",
  rateWarning: "This is a high load. Raise the tick interval or create fewer entities.",
  create: "Create devices",
  creating: "Creating …",
  created: "{count} devices created",
  target: "What to remove",
  targetAll: "Everything the integration created",
  targetDevice: "One device",
  targetRun: "One creation run",
  targetId: "Id",
  showPlan: "Show what will be removed",
  planDevices: "{count} devices",
  planOrphans: "{count} devices found only in the registry",
  planAreas: "Areas created by the integration that become empty: {names}",
  planNothing: "Nothing to remove.",
  confirmRemove: "Remove now",
  removed: "{count} devices removed",
  error: "Error"
}, he = {
  title: "Testdaten",
  badge: "Testumgebung",
  tabDevices: "Geräte",
  tabCreate: "Erstellen",
  tabRemove: "Entfernen",
  loading: "Lade …",
  noDevices: "Noch keine Testgeräte. Öffne „Erstellen“, um welche zu erzeugen.",
  colName: "Name",
  colTemplate: "Vorlage",
  colArea: "Bereich",
  colOutput: "Ausgang",
  colValues: "Werte",
  colActions: "Aktionen",
  loadMore: "Mehr laden",
  devicesOf: "{shown} von {total} Geräten",
  remove: "Entfernen",
  template: "Vorlage",
  count: "Anzahl",
  namePattern: "Namensmuster",
  namePatternHint: "Platzhalter: {n}, {nn}, {template}",
  areas: "Bereiche",
  areasHint: "Kommagetrennt; fehlende Bereiche werden angelegt",
  areaMode: "Verteilung",
  modeEven: "Der Reihe nach",
  modeRandom: "Zufällig",
  seed: "Seed",
  seedHint: "Leer nutzt den Seed der Integration",
  customEntities: "Entitäten (JSON)",
  customTemplate: "Eigenes Gerät",
  preview: "Vorschau des ersten Sensors (24 Stunden)",
  estimate: "{entities} Entitäten, etwa {rate} Zustandsänderungen pro Sekunde",
  rateWarning: "Das ist eine hohe Last. Erhöhe das Tick-Intervall oder erzeuge weniger Entitäten.",
  create: "Geräte erstellen",
  creating: "Erstelle …",
  created: "{count} Geräte erstellt",
  target: "Was entfernt werden soll",
  targetAll: "Alles, was die Integration erzeugt hat",
  targetDevice: "Ein Gerät",
  targetRun: "Ein Erstellungslauf",
  targetId: "Id",
  showPlan: "Anzeigen, was entfernt wird",
  planDevices: "{count} Geräte",
  planOrphans: "{count} Geräte, die nur in der Registry stehen",
  planAreas: "Von der Integration angelegte Bereiche, die leer werden: {names}",
  planNothing: "Es gibt nichts zu entfernen.",
  confirmRemove: "Jetzt entfernen",
  removed: "{count} Geräte entfernt",
  error: "Fehler"
}, ce = { en: le, de: he };
function de(s) {
  return s?.toLowerCase().startsWith("de") ? "de" : "en";
}
function pe(s, t, e = {}) {
  return ce[s][t].replace(
    /\{(\w+)\}/g,
    (r, i) => i in e ? String(e[i]) : r
  );
}
var ue = Object.defineProperty, me = (s, t, e, r) => {
  for (var i = void 0, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (i = o(t, e, i) || i);
  return i && ue(t, e, i), i;
};
const At = Y`
  border-radius: 6px;
  border: 1px solid var(--divider-color);
  background: var(--card-background-color);
  color: var(--primary-text-color);
`;
class H extends C {
  static {
    this.styles = Y`
    :host {
      display: block;
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, inherit);
    }
    h2,
    h3 {
      margin: 0 0 12px;
      font-weight: 500;
    }
    button {
      font: inherit;
      padding: 6px 14px;
      ${At}
      cursor: pointer;
    }
    button.primary {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    input,
    select,
    textarea {
      font: inherit;
      box-sizing: border-box;
      width: 100%;
      padding: 6px 8px;
      ${At}
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }
    small {
      color: var(--secondary-text-color);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      text-align: left;
      padding: 6px 8px;
      border-bottom: 1px solid var(--divider-color);
      vertical-align: top;
    }
    th {
      font-size: 0.8em;
      font-weight: 500;
      color: var(--secondary-text-color);
    }
    .error {
      color: var(--error-color);
    }
    .warning {
      color: var(--warning-color);
    }
    .row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
  `;
  }
  /** The API client for the current `hass` object. */
  get api() {
    return this.client?.hass !== this.hass && (this.client = { hass: this.hass, api: new ae(this.hass) }), this.client.api;
  }
  /** The text `key` in the language of Home Assistant. */
  tr(t, e) {
    return pe(de(this.hass?.language), t, e);
  }
}
me([
  E({ attribute: !1 })
], H.prototype, "hass");
var $e = Object.defineProperty, ve = Object.getOwnPropertyDescriptor, W = (s, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? ve(t, e) : t, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (i = (r ? o(t, e, i) : o(i)) || i);
  return r && i && $e(t, e, i), i;
};
const wt = 200, ge = 1e4, xt = {
  switch: "toggle",
  event: "press",
  binary_sensor: "pulse"
};
let N = class extends H {
  constructor() {
    super(...arguments), this.devices = [], this.total = 0, this.loaded = !1, this.error = "";
  }
  /** Load the data when the element is added to the page. */
  connectedCallback() {
    super.connectedCallback(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), ge);
  }
  /** Stop the refresh timer when the element is removed. */
  disconnectedCallback() {
    window.clearInterval(this.timer), super.disconnectedCallback();
  }
  /** Reload the devices that are shown now, at least the first page. */
  async refresh(s = !1) {
    const t = Math.max(wt, this.devices.length + (s ? wt : 0));
    try {
      const e = await this.api.devices(0, t);
      this.devices = e.devices, this.total = e.total, this.error = "";
    } catch (e) {
      this.error = R(e);
    }
    this.loaded = !0;
  }
  /** Run the action of an entity and reload the list. */
  async fire(s, t) {
    try {
      await this.api.fire(s.id, t.key, xt[t.platform]), await this.refresh();
    } catch (e) {
      this.error = R(e);
    }
  }
  /** Return the current values of the first entities as one line. */
  values(s) {
    return s.entities.filter(
      (t) => t.platform === "sensor" || t.platform === "switch" || t.platform === "binary_sensor"
    ).slice(0, 4).map((t) => `${t.name}: ${t.state ?? "–"}${t.unit ? ` ${t.unit}` : ""}`).join(" · ");
  }
  /** Render the table row of one device. */
  renderRow(s) {
    const t = s.entities.filter((e) => e.platform in xt);
    return h`<tr>
      <td>${s.name}</td>
      <td>${s.model}</td>
      <td>${s.area ?? "–"}</td>
      <td>${s.output}</td>
      <td><small>${this.values(s)}</small></td>
      <td class="row">
        ${t.map(
      (e) => h`<button @click=${() => void this.fire(s, e)}>${e.name}</button>`
    )}
        <button
          @click=${() => this.dispatchEvent(
      new CustomEvent("tdc-remove", { detail: { target: "device", id: s.id } })
    )}
        >
          ${this.tr("remove")}
        </button>
      </td>
    </tr>`;
  }
  /** Render the element. */
  render() {
    return this.loaded ? h`
      ${this.error ? h`<p class="error">${this.error}</p>` : ""}
      ${this.devices.length === 0 ? h`<p>${this.tr("noDevices")}</p>` : h`<table>
                <thead>
                  <tr>
                    <th>${this.tr("colName")}</th>
                    <th>${this.tr("colTemplate")}</th>
                    <th>${this.tr("colArea")}</th>
                    <th>${this.tr("colOutput")}</th>
                    <th>${this.tr("colValues")}</th>
                    <th>${this.tr("colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.devices.map((s) => this.renderRow(s))}
                </tbody>
              </table>
              <p class="row">
                <small>
                  ${this.tr("devicesOf", { shown: this.devices.length, total: this.total })}
                </small>
                ${this.devices.length < this.total ? h`<button @click=${() => void this.refresh(!0)}>
                        ${this.tr("loadMore")}
                      </button>` : ""}
              </p>`}
    ` : h`${this.tr("loading")}`;
  }
};
W([
  d()
], N.prototype, "devices", 2);
W([
  d()
], N.prototype, "total", 2);
W([
  d()
], N.prototype, "loaded", 2);
W([
  d()
], N.prototype, "error", 2);
N = W([
  B("tdc-device-list")
], N);
var fe = Object.defineProperty, _e = Object.getOwnPropertyDescriptor, S = (s, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? _e(t, e) : t, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (i = (r ? o(t, e, i) : o(i)) || i);
  return r && i && fe(t, e, i), i;
};
let b = class extends H {
  constructor() {
    super(...arguments), this.target = "all", this.targetId = "", this.busy = !1, this.message = "", this.error = "";
  }
  /** Ask the backend what the removal of the selected target would delete. */
  async showPlan() {
    this.message = "", this.error = "";
    try {
      this.plan = await this.api.removalPlan(this.target, this.targetId || void 0);
    } catch (s) {
      this.plan = void 0, this.error = R(s);
    }
  }
  /** Run the removal that was shown. */
  async confirm() {
    this.busy = !0;
    try {
      const s = await this.api.removalRun(this.target, this.targetId || void 0);
      this.message = this.tr("removed", { count: s.devices + s.orphans }), this.plan = void 0;
    } catch (s) {
      this.error = R(s);
    }
    this.busy = !1;
  }
  /** Render the list of what will be removed. */
  renderPlan(s) {
    return s.devices.length + s.orphans.length === 0 && s.runs.length === 0 ? h`<p>${this.tr("planNothing")}</p>` : h`<ul>
        <li>${this.tr("planDevices", { count: s.devices.length })}</li>
        ${s.orphans.length ? h`<li>${this.tr("planOrphans", { count: s.orphans.length })}</li>` : ""}
        ${s.areas.length ? h`<li>${this.tr("planAreas", { names: s.areas.join(", ") })}</li>` : ""}
      </ul>
      <p>
        <small
          >${s.devices.slice(0, 20).map((e) => e.name).join(", ")}${s.devices.length > 20 ? " …" : ""}</small
        >
      </p>
      <button class="primary" ?disabled=${this.busy} @click=${() => void this.confirm()}>
        ${this.tr("confirmRemove")}
      </button>`;
  }
  /** Render the element. */
  render() {
    return h`
      <div class="row">
        <label style="flex: 0 0 280px"
          >${this.tr("target")}
          <select
            @change=${(s) => {
      this.target = s.target.value, this.plan = void 0;
    }}
          >
            <option value="all" ?selected=${this.target === "all"}>${this.tr("targetAll")}</option>
            <option value="device" ?selected=${this.target === "device"}>
              ${this.tr("targetDevice")}
            </option>
            <option value="run" ?selected=${this.target === "run"}>${this.tr("targetRun")}</option>
          </select>
        </label>
        ${this.target === "all" ? "" : h`<label style="flex: 1 1 260px"
                >${this.tr("targetId")}
                <input
                  .value=${this.targetId}
                  @input=${(s) => this.targetId = s.target.value}
                />
              </label>`}
        <button @click=${() => void this.showPlan()}>${this.tr("showPlan")}</button>
      </div>
      ${this.plan ? this.renderPlan(this.plan) : ""}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
  }
};
S([
  E()
], b.prototype, "target", 2);
S([
  E()
], b.prototype, "targetId", 2);
S([
  d()
], b.prototype, "plan", 2);
S([
  d()
], b.prototype, "busy", 2);
S([
  d()
], b.prototype, "message", 2);
S([
  d()
], b.prototype, "error", 2);
b = S([
  B("tdc-removal-panel")
], b);
const q = (1n << 64n) - 1n, be = 0x9e3779b97f4a7c15n, Et = 0xbf58476d1ce4e5b9n, St = 0x94d049bb133111ebn, ye = 3600;
function Ae(s, t = 0, e = 0) {
  return {
    shape: s.shape,
    min: s.min ?? 0,
    max: s.max ?? 100,
    period_s: s.period_s ?? 3600,
    interval_s: s.interval_s ?? 10,
    noise: s.noise ?? 0,
    decimals: s.decimals ?? 1,
    phase: s.phase ?? 0,
    rate_per_hour: s.rate_per_hour ?? 0,
    seed: t,
    origin: e
  };
}
function Z(s, t) {
  let e = BigInt(s) * be + (BigInt(t) & q) * Et + St & q;
  return e = (e ^ e >> 30n) * Et & q, e = (e ^ e >> 27n) * St & q, e ^= e >> 31n, Number(e >> 11n) / 2 ** 53;
}
function F(s, t) {
  const e = t / s.period_s + s.phase;
  return e - Math.floor(e);
}
const Pt = {
  constant: () => 0.5,
  sine: (s, t) => 0.5 + 0.5 * Math.sin(2 * Math.PI * F(s, t)),
  saw: (s, t) => F(s, t),
  square: (s, t) => F(s, t) < 0.5 ? 1 : 0,
  triangle: (s, t) => 1 - Math.abs(2 * F(s, t) - 1),
  noise: (s, t) => Z(s.seed, Math.floor(t / s.interval_s)),
  random_walk: (s, t) => {
    const e = t / s.period_s + s.phase, r = Math.floor(e), i = e - r, n = i * i * (3 - 2 * i), o = Z(s.seed, r), l = Z(s.seed, r + 1);
    return o + (l - o) * n;
  }
};
function Ot(s, t) {
  return Number(s.toFixed(t));
}
function we(s, t) {
  if (s.shape === "counter") {
    const r = Math.max(0, t - s.origin);
    return Ot(s.min + s.rate_per_hour * r / ye, s.decimals);
  }
  let e = (Pt[s.shape] ?? Pt.constant)(s, t);
  return s.noise && (e += (Z(s.seed + 1, Math.floor(t)) - 0.5) * 2 * s.noise), e = Math.min(1, Math.max(0, e)), Ot(s.min + e * (s.max - s.min), s.decimals);
}
var xe = Object.defineProperty, Ee = Object.getOwnPropertyDescriptor, ct = (s, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? Ee(t, e) : t, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (i = (r ? o(t, e, i) : o(i)) || i);
  return r && i && xe(t, e, i), i;
};
const Ct = 320, st = 80, rt = 96, Se = 86400;
let k = class extends C {
  constructor() {
    super(...arguments), this.unit = "";
  }
  /** Return the points of the curve for 24 hours as an SVG point list. */
  points(s) {
    const t = Ae(s, 1, 0), e = Array.from(
      { length: rt + 1 },
      (o, l) => we(t, l / rt * Se)
    ), r = Math.min(...e), n = Math.max(...e) - r || 1;
    return e.map((o, l) => {
      const a = l / rt * Ct, p = st - 6 - (o - r) / n * (st - 12);
      return `${a.toFixed(1)},${p.toFixed(1)}`;
    }).join(" ");
  }
  /** Render the element. */
  render() {
    if (!this.signal) return h``;
    const s = this.signal.min ?? 0, t = this.signal.max ?? 100;
    return h`<svg viewBox="0 0 ${Ct} ${st}" role="img">
        ${Jt`<polyline points=${this.points(this.signal)}></polyline>`}
      </svg>
      <div>${s} – ${t} ${this.unit}</div>`;
  }
};
k.styles = Y`
    :host {
      display: block;
      color: var(--secondary-text-color);
      font-size: 0.8em;
    }
    svg {
      width: 100%;
      max-width: 420px;
      height: auto;
      background: var(--secondary-background-color);
      border-radius: 6px;
    }
    polyline {
      fill: none;
      stroke: var(--primary-color);
      stroke-width: 1.5;
    }
  `;
ct([
  E({ attribute: !1 })
], k.prototype, "signal", 2);
ct([
  E()
], k.prototype, "unit", 2);
k = ct([
  B("tdc-signal-preview")
], k);
function Pe(s) {
  return s.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
}
function Oe(s, t) {
  return Math.round(s / Math.max(1, t) * 10) / 10;
}
var Ce = Object.defineProperty, Te = Object.getOwnPropertyDescriptor, v = (s, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? Te(t, e) : t, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (i = (r ? o(t, e, i) : o(i)) || i);
  return r && i && Ce(t, e, i), i;
};
const P = "custom", Me = 50, Re = JSON.stringify(
  [
    {
      key: "level",
      platform: "sensor",
      name: "Level",
      unit: "%",
      signal: { shape: "sine", min: 0, max: 100 }
    }
  ],
  null,
  2
);
let $ = class extends H {
  constructor() {
    super(...arguments), this.templates = [], this.template = "", this.count = 10, this.pattern = "{template} {nn}", this.areas = "", this.mode = "even", this.seed = "", this.custom = Re, this.busy = !1, this.message = "", this.error = "";
  }
  /** Load the data when the element is added to the page. */
  async connectedCallback() {
    super.connectedCallback();
    try {
      [this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.template = this.templates[0]?.id ?? P;
    } catch (s) {
      this.error = R(s);
    }
  }
  /** Return the entity definitions of the selected template, or the parsed custom ones. */
  entities() {
    if (this.template === P)
      try {
        return JSON.parse(this.custom);
      } catch {
        return [];
      }
    return this.templates.find((s) => s.id === this.template)?.entities ?? [];
  }
  /** Create the devices with the inputs of the form. */
  async submit() {
    this.busy = !0, this.message = "", this.error = "";
    const s = {
      template: this.template,
      count: this.count,
      name_pattern: this.pattern,
      areas: Pe(this.areas),
      area_mode: this.mode,
      ...this.seed ? { seed: this.seed } : {},
      ...this.template === P ? { entities: this.entities() } : {}
    };
    try {
      const t = await this.api.create(s);
      this.message = this.tr("created", { count: t.devices });
    } catch (t) {
      this.error = R(t);
    }
    this.busy = !1;
  }
  /** Render the estimate of the load and a warning for a high rate. */
  renderEstimate() {
    const s = this.entities(), t = s.filter((r) => r.platform === "sensor").length * this.count, e = Oe(t, this.info?.tick_seconds ?? 10);
    return h`<p>
      <small>${this.tr("estimate", { entities: s.length * this.count, rate: e })}</small>
      ${e > Me ? h`<br /><span class="warning">${this.tr("rateWarning")}</span>` : ""}
    </p>`;
  }
  /** Render the element. */
  render() {
    const s = this.entities().find((t) => t.platform === "sensor" && t.signal);
    return h`
      <div class="row">
        <label style="flex: 1 1 220px"
          >${this.tr("template")}
          <select @change=${(t) => this.template = t.target.value}>
            ${this.templates.map(
      (t) => h`<option value=${t.id} ?selected=${t.id === this.template}>${t.name}</option>`
    )}
            <option value=${P} ?selected=${this.template === P}>
              ${this.tr("customTemplate")}
            </option>
          </select>
        </label>
        <label style="flex: 0 0 100px"
          >${this.tr("count")}
          <input
            type="number"
            min="1"
            .value=${String(this.count)}
            @input=${(t) => this.count = Number(t.target.value)}
          />
        </label>
      </div>
      <p class="row">
        <label style="flex: 1 1 220px"
          >${this.tr("namePattern")}
          <input
            .value=${this.pattern}
            @input=${(t) => this.pattern = t.target.value}
          />
          <small>${this.tr("namePatternHint")}</small>
        </label>
        <label style="flex: 1 1 220px"
          >${this.tr("areas")}
          <input
            .value=${this.areas}
            @input=${(t) => this.areas = t.target.value}
          />
          <small>${this.tr("areasHint")}</small>
        </label>
        <label style="flex: 0 0 160px"
          >${this.tr("areaMode")}
          <select
            @change=${(t) => this.mode = t.target.value}
          >
            <option value="even">${this.tr("modeEven")}</option>
            <option value="random">${this.tr("modeRandom")}</option>
          </select>
        </label>
        <label style="flex: 0 0 160px"
          >${this.tr("seed")}
          <input
            .value=${this.seed}
            @input=${(t) => this.seed = t.target.value}
          />
          <small>${this.tr("seedHint")}</small>
        </label>
      </p>
      ${this.template === P ? h`<label
              >${this.tr("customEntities")}
              <textarea
                rows="8"
                .value=${this.custom}
                @input=${(t) => this.custom = t.target.value}
              ></textarea>
            </label>` : ""}
      ${s?.signal ? h`<p>
              <small>${this.tr("preview")}</small>
              <tdc-signal-preview
                .signal=${s.signal}
                unit=${s.unit ?? ""}
              ></tdc-signal-preview>
            </p>` : ""}
      ${this.renderEstimate()}
      <p class="row">
        <button
          class="primary"
          ?disabled=${this.busy || !this.template}
          @click=${() => void this.submit()}
        >
          ${this.busy ? this.tr("creating") : this.tr("create")}
        </button>
        <span>${this.message}</span>
        <span class="error">${this.error}</span>
      </p>
    `;
  }
};
v([
  d()
], $.prototype, "info", 2);
v([
  d()
], $.prototype, "templates", 2);
v([
  d()
], $.prototype, "template", 2);
v([
  d()
], $.prototype, "count", 2);
v([
  d()
], $.prototype, "pattern", 2);
v([
  d()
], $.prototype, "areas", 2);
v([
  d()
], $.prototype, "mode", 2);
v([
  d()
], $.prototype, "seed", 2);
v([
  d()
], $.prototype, "custom", 2);
v([
  d()
], $.prototype, "busy", 2);
v([
  d()
], $.prototype, "message", 2);
v([
  d()
], $.prototype, "error", 2);
$ = v([
  B("tdc-creation-wizard")
], $);
var Ne = Object.defineProperty, He = Object.getOwnPropertyDescriptor, V = (s, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? He(t, e) : t, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (i = (r ? o(t, e, i) : o(i)) || i);
  return r && i && Ne(t, e, i), i;
};
let x = class extends H {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "devices", this.removeTarget = "all", this.removeId = "";
  }
  /** Switch to the removal tab with a preset target. */
  startRemoval(s) {
    this.removeTarget = s.detail.target, this.removeId = s.detail.id, this.tab = "remove";
  }
  /** Render one tab button. */
  renderTab(s, t) {
    return h`<button class=${this.tab === s ? "active" : ""} @click=${() => this.tab = s}>
      ${t}
    </button>`;
  }
  /** Render the element. */
  render() {
    return h`
      <header>
        <h2>${this.tr("title")}</h2>
        <span class="badge">${this.tr("badge")}</span>
      </header>
      <nav>
        ${this.renderTab("devices", this.tr("tabDevices"))}
        ${this.renderTab("create", this.tr("tabCreate"))}
        ${this.renderTab("remove", this.tr("tabRemove"))}
      </nav>
      ${this.tab === "devices" ? h`<tdc-device-list
              .hass=${this.hass}
              @tdc-remove=${this.startRemoval}
            ></tdc-device-list>` : ""}
      ${this.tab === "create" ? h`<tdc-creation-wizard .hass=${this.hass}></tdc-creation-wizard>` : ""}
      ${this.tab === "remove" ? h`<tdc-removal-panel
              .hass=${this.hass}
              .target=${this.removeTarget}
              .targetId=${this.removeId}
            ></tdc-removal-panel>` : ""}
    `;
  }
};
x.styles = [
  H.styles,
  Y`
      :host {
        padding: 16px;
        max-width: 1100px;
        margin: 0 auto;
      }
      header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
      header h2 {
        margin: 0;
      }
      .badge {
        font-size: 0.75em;
        padding: 2px 10px;
        border-radius: 999px;
        border: 1px solid var(--warning-color);
        color: var(--warning-color);
      }
      nav {
        display: flex;
        gap: 4px;
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 16px;
      }
      nav button {
        border: 0;
        border-bottom: 2px solid transparent;
        border-radius: 0;
        background: none;
      }
      nav button.active {
        border-bottom-color: var(--primary-color);
        color: var(--primary-color);
      }
    `
];
V([
  E({ type: Boolean })
], x.prototype, "narrow", 2);
V([
  d()
], x.prototype, "tab", 2);
V([
  d()
], x.prototype, "removeTarget", 2);
V([
  d()
], x.prototype, "removeId", 2);
x = V([
  B("hass-test-data-creator-panel")
], x);
export {
  x as TdcPanel
};
