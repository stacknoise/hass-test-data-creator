/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis, ot = J.ShadowRoot && (J.ShadyCSS === void 0 || J.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, lt = Symbol(), mt = /* @__PURE__ */ new WeakMap();
let Dt = class {
  constructor(t, s, r) {
    if (this._$cssResult$ = !0, r !== lt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (ot && t === void 0) {
      const r = s !== void 0 && s.length === 1;
      r && (t = mt.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && mt.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Wt = (e) => new Dt(typeof e == "string" ? e : e + "", void 0, lt), tt = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((r, i, n) => r + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + e[n + 1], e[0]);
  return new Dt(s, e, lt);
}, Ft = (e, t) => {
  if (ot) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const r = document.createElement("style"), i = J.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = s.cssText, e.appendChild(r);
  }
}, $t = ot ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const r of t.cssRules) s += r.cssText;
  return Wt(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Lt, defineProperty: Bt, getOwnPropertyDescriptor: Vt, getOwnPropertyNames: Kt, getOwnPropertySymbols: Gt, getPrototypeOf: Zt } = Object, et = globalThis, gt = et.trustedTypes, qt = gt ? gt.emptyScript : "", Jt = et.reactiveElementPolyfillSupport, j = (e, t) => e, X = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? qt : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let s = e;
  switch (t) {
    case Boolean:
      s = e !== null;
      break;
    case Number:
      s = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(e);
      } catch {
        s = null;
      }
  }
  return s;
} }, ht = (e, t) => !Lt(e, t), vt = { attribute: !0, type: String, converter: X, reflect: !1, useDefault: !1, hasChanged: ht };
Symbol.metadata ??= Symbol("metadata"), et.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let R = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = vt) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(t, r, s);
      i !== void 0 && Bt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, s, r) {
    const { get: i, set: n } = Vt(this.prototype, t) ?? { get() {
      return this[s];
    }, set(a) {
      this[s] = a;
    } };
    return { get: i, set(a) {
      const c = i?.call(this);
      n?.call(this, a), this.requestUpdate(t, c, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? vt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(j("elementProperties"))) return;
    const t = Zt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(j("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(j("properties"))) {
      const s = this.properties, r = [...Kt(s), ...Gt(s)];
      for (const i of r) this.createProperty(i, s[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [r, i] of s) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, r] of this.elementProperties) {
      const i = this._$Eu(s, r);
      i !== void 0 && this._$Eh.set(i, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const i of r) s.unshift($t(i));
    } else t !== void 0 && s.push($t(t));
    return s;
  }
  static _$Eu(t, s) {
    const r = s.attribute;
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
    const t = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const r of s.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ft(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, s, r) {
    this._$AK(t, r);
  }
  _$ET(t, s) {
    const r = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, r);
    if (i !== void 0 && r.reflect === !0) {
      const n = (r.converter?.toAttribute !== void 0 ? r.converter : X).toAttribute(s, r.type);
      this._$Em = t, n == null ? this.removeAttribute(i) : this.setAttribute(i, n), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const r = this.constructor, i = r._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const n = r.getPropertyOptions(i), a = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : X;
      this._$Em = i;
      const c = a.fromAttribute(s, n.type);
      this[i] = c ?? this._$Ej?.get(i) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, s, r, i = !1, n) {
    if (t !== void 0) {
      const a = this.constructor;
      if (i === !1 && (n = this[t]), r ??= a.getPropertyOptions(t), !((r.hasChanged ?? ht)(n, s) || r.useDefault && r.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, r)))) return;
      this.C(t, s, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: r, reflect: i, wrapped: n }, a) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, a ?? s ?? this[t]), n !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (s = void 0), this._$AL.set(t, s)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
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
        const { wrapped: a } = n, c = this[i];
        a !== !0 || this._$AL.has(i) || c === void 0 || this.C(i, void 0, n, c);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((r) => r.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
R.elementStyles = [], R.shadowRootOptions = { mode: "open" }, R[j("elementProperties")] = /* @__PURE__ */ new Map(), R[j("finalized")] = /* @__PURE__ */ new Map(), Jt?.({ ReactiveElement: R }), (et.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct = globalThis, ft = (e) => e, Q = ct.trustedTypes, yt = Q ? Q.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, It = "$lit$", w = `lit$${Math.random().toFixed(9).slice(2)}$`, Ht = "?" + w, Yt = `<${Ht}>`, S = document, z = () => S.createComment(""), W = (e) => e === null || typeof e != "object" && typeof e != "function", dt = Array.isArray, Xt = (e) => dt(e) || typeof e?.[Symbol.iterator] == "function", rt = `[ 	
\f\r]`, U = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, bt = /-->/g, _t = />/g, E = RegExp(`>|${rt}(?:([^\\s"'>=/]+)(${rt}*=${rt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), wt = /'/g, At = /"/g, Ut = /^(?:script|style|textarea|title)$/i, jt = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), o = jt(1), Qt = jt(2), k = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), Et = /* @__PURE__ */ new WeakMap(), x = S.createTreeWalker(S, 129);
function zt(e, t) {
  if (!dt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return yt !== void 0 ? yt.createHTML(t) : t;
}
const te = (e, t) => {
  const s = e.length - 1, r = [];
  let i, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = U;
  for (let c = 0; c < s; c++) {
    const l = e[c];
    let p, m, d = -1, y = 0;
    for (; y < l.length && (a.lastIndex = y, m = a.exec(l), m !== null); ) y = a.lastIndex, a === U ? m[1] === "!--" ? a = bt : m[1] !== void 0 ? a = _t : m[2] !== void 0 ? (Ut.test(m[2]) && (i = RegExp("</" + m[2], "g")), a = E) : m[3] !== void 0 && (a = E) : a === E ? m[0] === ">" ? (a = i ?? U, d = -1) : m[1] === void 0 ? d = -2 : (d = a.lastIndex - m[2].length, p = m[1], a = m[3] === void 0 ? E : m[3] === '"' ? At : wt) : a === At || a === wt ? a = E : a === bt || a === _t ? a = U : (a = E, i = void 0);
    const _ = a === E && e[c + 1].startsWith("/>") ? " " : "";
    n += a === U ? l + Yt : d >= 0 ? (r.push(p), l.slice(0, d) + It + l.slice(d) + w + _) : l + w + (d === -2 ? c : _);
  }
  return [zt(e, n + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class F {
  constructor({ strings: t, _$litType$: s }, r) {
    let i;
    this.parts = [];
    let n = 0, a = 0;
    const c = t.length - 1, l = this.parts, [p, m] = te(t, s);
    if (this.el = F.createElement(p, r), x.currentNode = this.el.content, s === 2 || s === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (i = x.nextNode()) !== null && l.length < c; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const d of i.getAttributeNames()) if (d.endsWith(It)) {
          const y = m[a++], _ = i.getAttribute(d).split(w), G = /([.?@])?(.*)/.exec(y);
          l.push({ type: 1, index: n, name: G[2], strings: _, ctor: G[1] === "." ? se : G[1] === "?" ? re : G[1] === "@" ? ie : st }), i.removeAttribute(d);
        } else d.startsWith(w) && (l.push({ type: 6, index: n }), i.removeAttribute(d));
        if (Ut.test(i.tagName)) {
          const d = i.textContent.split(w), y = d.length - 1;
          if (y > 0) {
            i.textContent = Q ? Q.emptyScript : "";
            for (let _ = 0; _ < y; _++) i.append(d[_], z()), x.nextNode(), l.push({ type: 2, index: ++n });
            i.append(d[y], z());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Ht) l.push({ type: 2, index: n });
      else {
        let d = -1;
        for (; (d = i.data.indexOf(w, d + 1)) !== -1; ) l.push({ type: 7, index: n }), d += w.length - 1;
      }
      n++;
    }
  }
  static createElement(t, s) {
    const r = S.createElement("template");
    return r.innerHTML = t, r;
  }
}
function D(e, t, s = e, r) {
  if (t === k) return t;
  let i = r !== void 0 ? s._$Co?.[r] : s._$Cl;
  const n = W(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== n && (i?._$AO?.(!1), n === void 0 ? i = void 0 : (i = new n(e), i._$AT(e, s, r)), r !== void 0 ? (s._$Co ??= [])[r] = i : s._$Cl = i), i !== void 0 && (t = D(e, i._$AS(e, t.values), i, r)), t;
}
class ee {
  constructor(t, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: s }, parts: r } = this._$AD, i = (t?.creationScope ?? S).importNode(s, !0);
    x.currentNode = i;
    let n = x.nextNode(), a = 0, c = 0, l = r[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let p;
        l.type === 2 ? p = new B(n, n.nextSibling, this, t) : l.type === 1 ? p = new l.ctor(n, l.name, l.strings, this, t) : l.type === 6 && (p = new ne(n, this, t)), this._$AV.push(p), l = r[++c];
      }
      a !== l?.index && (n = x.nextNode(), a++);
    }
    return x.currentNode = S, i;
  }
  p(t) {
    let s = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, s), s += r.strings.length - 2) : r._$AI(t[s])), s++;
  }
}
class B {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, s, r, i) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = r, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && t?.nodeType === 11 && (t = s.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, s = this) {
    t = D(this, t, s), W(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== k && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Xt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && W(this._$AH) ? this._$AA.nextSibling.data = t : this.T(S.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: r } = t, i = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = F.createElement(zt(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const n = new ee(i, this), a = n.u(this.options);
      n.p(s), this.T(a), this._$AH = n;
    }
  }
  _$AC(t) {
    let s = Et.get(t.strings);
    return s === void 0 && Et.set(t.strings, s = new F(t)), s;
  }
  k(t) {
    dt(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let r, i = 0;
    for (const n of t) i === s.length ? s.push(r = new B(this.O(z()), this.O(z()), this, this.options)) : r = s[i], r._$AI(n), i++;
    i < s.length && (this._$AR(r && r._$AB.nextSibling, i), s.length = i);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const r = ft(t).nextSibling;
      ft(t).remove(), t = r;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class st {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, r, i, n) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = s, this._$AM = i, this.options = n, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = u;
  }
  _$AI(t, s = this, r, i) {
    const n = this.strings;
    let a = !1;
    if (n === void 0) t = D(this, t, s, 0), a = !W(t) || t !== this._$AH && t !== k, a && (this._$AH = t);
    else {
      const c = t;
      let l, p;
      for (t = n[0], l = 0; l < n.length - 1; l++) p = D(this, c[r + l], s, l), p === k && (p = this._$AH[l]), a ||= !W(p) || p !== this._$AH[l], p === u ? t = u : t !== u && (t += (p ?? "") + n[l + 1]), this._$AH[l] = p;
    }
    a && !i && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class se extends st {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class re extends st {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class ie extends st {
  constructor(t, s, r, i, n) {
    super(t, s, r, i, n), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = D(this, t, s, 0) ?? u) === k) return;
    const r = this._$AH, i = t === u && r !== u || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, n = t !== u && (r === u || i);
    i && this.element.removeEventListener(this.name, this, r), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class ne {
  constructor(t, s, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    D(this, t);
  }
}
const ae = ct.litHtmlPolyfillSupport;
ae?.(F, B), (ct.litHtmlVersions ??= []).push("3.3.3");
const oe = (e, t, s) => {
  const r = s?.renderBefore ?? t;
  let i = r._$litPart$;
  if (i === void 0) {
    const n = s?.renderBefore ?? null;
    r._$litPart$ = i = new B(t.insertBefore(z(), n), n, void 0, s ?? {});
  }
  return i._$AI(e), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const pt = globalThis;
class M extends R {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = oe(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return k;
  }
}
M._$litElement$ = !0, M.finalized = !0, pt.litElementHydrateSupport?.({ LitElement: M });
const le = pt.litElementPolyfillSupport;
le?.({ LitElement: M });
(pt.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const H = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const he = { attribute: !0, type: String, converter: X, reflect: !1, hasChanged: ht }, ce = (e = he, t, s) => {
  const { kind: r, metadata: i } = s;
  let n = globalThis.litPropertyMetadata.get(i);
  if (n === void 0 && globalThis.litPropertyMetadata.set(i, n = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(s.name, e), r === "accessor") {
    const { name: a } = s;
    return { set(c) {
      const l = t.get.call(this);
      t.set.call(this, c), this.requestUpdate(a, l, e, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(a, void 0, e, c), c;
    } };
  }
  if (r === "setter") {
    const { name: a } = s;
    return function(c) {
      const l = this[a];
      t.call(this, c), this.requestUpdate(a, l, e, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function P(e) {
  return (t, s) => typeof s == "object" ? ce(e, t, s) : ((r, i, n) => {
    const a = i.hasOwnProperty(n);
    return i.constructor.createProperty(n, r), a ? Object.getOwnPropertyDescriptor(i, n) : void 0;
  })(e, t, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function h(e) {
  return P({ ...e, state: !0, attribute: !1 });
}
const de = "hass_test_data_creator";
class pe {
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
  devices(t, s) {
    return this.call("devices/list", { offset: t, limit: s });
  }
  /** Create the devices of a job. */
  create(t) {
    return this.call("devices/create", { ...t });
  }
  /** Run an action on one entity of a device. */
  fire(t, s, r) {
    return this.call("devices/fire", { device: t, entity: s, action: r });
  }
  /** Return what a removal of the target would delete. */
  removalPlan(t, s) {
    return this.call("removal/plan", { target: t, target_id: s });
  }
  /** Remove the target. */
  removalRun(t, s) {
    return this.call("removal/run", { target: t, target_id: s });
  }
  /** Return all schedules. */
  schedules() {
    return this.call("schedules/list");
  }
  /** Add a schedule. */
  addSchedule(t) {
    return this.call("schedules/add", { ...t });
  }
  /** Delete a schedule. */
  removeSchedule(t) {
    return this.call("schedules/remove", { schedule_id: t });
  }
  /** Switch a schedule on or off. */
  enableSchedule(t, s) {
    return this.call("schedules/enable", { schedule_id: t, enabled: s });
  }
  /** Return the planned runs of the next hours. */
  schedulePreview(t) {
    return this.call("schedules/preview", { hours: t });
  }
  /** Send a command with its defined fields to the backend. */
  call(t, s = {}) {
    const r = Object.fromEntries(Object.entries(s).filter(([, i]) => i !== void 0));
    return this.hass.callWS({ type: `${de}/${t}`, ...r });
  }
}
function b(e) {
  if (typeof e == "object" && e !== null && "message" in e) {
    const { code: t, message: s } = e;
    return t ? `${t}: ${s}` : s;
  }
  return String(e);
}
const ue = {
  title: "Test data",
  badge: "Test environment",
  tabDevices: "Devices",
  tabCreate: "Create",
  tabRemove: "Remove",
  tabSchedules: "Schedules",
  schNone: "No schedules yet. Add one below.",
  schNew: "New schedule",
  schName: "Name",
  schTarget: "Runs on",
  schTarget_all: "All devices",
  schTarget_template: "Template",
  schTarget_device: "Device",
  schTarget_run: "Creation run",
  schAction: "Action",
  schEntity: "Entity",
  schTrigger: "Trigger",
  schTrigger_times: "Fixed times",
  schTrigger_interval: "Interval",
  schTrigger_once: "Once",
  schTrigger_random_window: "Random in a window",
  schTrigger_poisson: "Average rate",
  schTimes: "Times (HH:MM, comma separated)",
  schEveryS: "Every (seconds)",
  schFrom: "From",
  schTo: "To",
  schAt: "Date and time",
  schCount: "Times per day",
  schPerDay: "Average per day",
  weekdayMon: "Mon",
  weekdayTue: "Tue",
  weekdayWed: "Wed",
  weekdayThu: "Thu",
  weekdayFri: "Fri",
  weekdaySat: "Sat",
  weekdaySun: "Sun",
  schAdd: "Add schedule",
  schEnabled: "On",
  schPreview: "Next {hours} hours",
  schWhen: "When",
  schNoRuns: "Nothing planned.",
  schMoreRuns: "… and {count} more",
  planSchedules: "{count} schedules",
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
}, me = {
  title: "Testdaten",
  badge: "Testumgebung",
  tabDevices: "Geräte",
  tabCreate: "Erstellen",
  tabRemove: "Entfernen",
  tabSchedules: "Zeitpläne",
  schNone: "Noch keine Zeitpläne. Lege unten einen an.",
  schNew: "Neuer Zeitplan",
  schName: "Name",
  schTarget: "Läuft auf",
  schTarget_all: "Allen Geräten",
  schTarget_template: "Vorlage",
  schTarget_device: "Gerät",
  schTarget_run: "Erstellungslauf",
  schAction: "Aktion",
  schEntity: "Entität",
  schTrigger: "Auslöser",
  schTrigger_times: "Feste Zeiten",
  schTrigger_interval: "Intervall",
  schTrigger_once: "Einmalig",
  schTrigger_random_window: "Zufällig im Zeitfenster",
  schTrigger_poisson: "Durchschnittsrate",
  schTimes: "Zeiten (HH:MM, kommagetrennt)",
  schEveryS: "Alle (Sekunden)",
  schFrom: "Von",
  schTo: "Bis",
  schAt: "Datum und Uhrzeit",
  schCount: "Mal pro Tag",
  schPerDay: "Durchschnitt pro Tag",
  weekdayMon: "Mo",
  weekdayTue: "Di",
  weekdayWed: "Mi",
  weekdayThu: "Do",
  weekdayFri: "Fr",
  weekdaySat: "Sa",
  weekdaySun: "So",
  schAdd: "Zeitplan anlegen",
  schEnabled: "An",
  schPreview: "Nächste {hours} Stunden",
  schWhen: "Wann",
  schNoRuns: "Nichts geplant.",
  schMoreRuns: "… und {count} weitere",
  planSchedules: "{count} Zeitpläne",
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
}, $e = { en: ue, de: me };
function ge(e) {
  return e?.toLowerCase().startsWith("de") ? "de" : "en";
}
function ve(e, t, s = {}) {
  return $e[e][t].replace(
    /\{(\w+)\}/g,
    (r, i) => i in s ? String(s[i]) : r
  );
}
var fe = Object.defineProperty, ye = (e, t, s, r) => {
  for (var i = void 0, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (i = a(t, s, i) || i);
  return i && fe(t, s, i), i;
};
const xt = tt`
  border-radius: 6px;
  border: 1px solid var(--divider-color);
  background: var(--card-background-color);
  color: var(--primary-text-color);
`;
class O extends M {
  static {
    this.styles = tt`
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
      ${xt}
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
      ${xt}
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
    return this.client?.hass !== this.hass && (this.client = { hass: this.hass, api: new pe(this.hass) }), this.client.api;
  }
  /** The text `key` in the language of Home Assistant. */
  tr(t, s) {
    return ve(ge(this.hass?.language), t, s);
  }
}
ye([
  P({ attribute: !1 })
], O.prototype, "hass");
var be = Object.defineProperty, _e = Object.getOwnPropertyDescriptor, V = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? _e(t, s) : t, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (i = (r ? a(t, s, i) : a(i)) || i);
  return r && i && be(t, s, i), i;
};
const St = 200, we = 1e4, Tt = {
  switch: "toggle",
  event: "press",
  binary_sensor: "pulse"
};
let I = class extends O {
  constructor() {
    super(...arguments), this.devices = [], this.total = 0, this.loaded = !1, this.error = "";
  }
  /** Load the data when the element is added to the page. */
  connectedCallback() {
    super.connectedCallback(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), we);
  }
  /** Stop the refresh timer when the element is removed. */
  disconnectedCallback() {
    window.clearInterval(this.timer), super.disconnectedCallback();
  }
  /** Reload the devices that are shown now, at least the first page. */
  async refresh(e = !1) {
    const t = Math.max(St, this.devices.length + (e ? St : 0));
    try {
      const s = await this.api.devices(0, t);
      this.devices = s.devices, this.total = s.total, this.error = "";
    } catch (s) {
      this.error = b(s);
    }
    this.loaded = !0;
  }
  /** Run the action of an entity and reload the list. */
  async fire(e, t) {
    try {
      await this.api.fire(e.id, t.key, Tt[t.platform]), await this.refresh();
    } catch (s) {
      this.error = b(s);
    }
  }
  /** Return the current values of the first entities as one line. */
  values(e) {
    return e.entities.filter(
      (t) => t.platform === "sensor" || t.platform === "switch" || t.platform === "binary_sensor"
    ).slice(0, 4).map((t) => `${t.name}: ${t.state ?? "–"}${t.unit ? ` ${t.unit}` : ""}`).join(" · ");
  }
  /** Render the table row of one device. */
  renderRow(e) {
    const t = e.entities.filter((s) => s.platform in Tt);
    return o`<tr>
      <td>${e.name}</td>
      <td>${e.model}</td>
      <td>${e.area ?? "–"}</td>
      <td>${e.output}</td>
      <td><small>${this.values(e)}</small></td>
      <td class="row">
        ${t.map(
      (s) => o`<button @click=${() => void this.fire(e, s)}>${s.name}</button>`
    )}
        <button
          @click=${() => this.dispatchEvent(
      new CustomEvent("tdc-remove", { detail: { target: "device", id: e.id } })
    )}
        >
          ${this.tr("remove")}
        </button>
      </td>
    </tr>`;
  }
  /** Render the element. */
  render() {
    return this.loaded ? o`
      ${this.error ? o`<p class="error">${this.error}</p>` : ""}
      ${this.devices.length === 0 ? o`<p>${this.tr("noDevices")}</p>` : o`<table>
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
                  ${this.devices.map((e) => this.renderRow(e))}
                </tbody>
              </table>
              <p class="row">
                <small>
                  ${this.tr("devicesOf", { shown: this.devices.length, total: this.total })}
                </small>
                ${this.devices.length < this.total ? o`<button @click=${() => void this.refresh(!0)}>
                        ${this.tr("loadMore")}
                      </button>` : ""}
              </p>`}
    ` : o`${this.tr("loading")}`;
  }
};
V([
  h()
], I.prototype, "devices", 2);
V([
  h()
], I.prototype, "total", 2);
V([
  h()
], I.prototype, "loaded", 2);
V([
  h()
], I.prototype, "error", 2);
I = V([
  H("tdc-device-list")
], I);
var Ae = Object.defineProperty, Ee = Object.getOwnPropertyDescriptor, C = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ee(t, s) : t, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (i = (r ? a(t, s, i) : a(i)) || i);
  return r && i && Ae(t, s, i), i;
};
let A = class extends O {
  constructor() {
    super(...arguments), this.target = "all", this.targetId = "", this.busy = !1, this.message = "", this.error = "";
  }
  /** Ask the backend what the removal of the selected target would delete. */
  async showPlan() {
    this.message = "", this.error = "";
    try {
      this.plan = await this.api.removalPlan(this.target, this.targetId || void 0);
    } catch (e) {
      this.plan = void 0, this.error = b(e);
    }
  }
  /** Run the removal that was shown. */
  async confirm() {
    this.busy = !0;
    try {
      const e = await this.api.removalRun(this.target, this.targetId || void 0);
      this.message = this.tr("removed", { count: e.devices + e.orphans }), this.plan = void 0;
    } catch (e) {
      this.error = b(e);
    }
    this.busy = !1;
  }
  /** Render the list of what will be removed. */
  renderPlan(e) {
    return e.devices.length + e.orphans.length === 0 && e.runs.length === 0 ? o`<p>${this.tr("planNothing")}</p>` : o`<ul>
        <li>${this.tr("planDevices", { count: e.devices.length })}</li>
        ${e.schedules.length ? o`<li>${this.tr("planSchedules", { count: e.schedules.length })}</li>` : ""}
        ${e.orphans.length ? o`<li>${this.tr("planOrphans", { count: e.orphans.length })}</li>` : ""}
        ${e.areas.length ? o`<li>${this.tr("planAreas", { names: e.areas.join(", ") })}</li>` : ""}
      </ul>
      <p>
        <small
          >${e.devices.slice(0, 20).map((s) => s.name).join(", ")}${e.devices.length > 20 ? " …" : ""}</small
        >
      </p>
      <button class="primary" ?disabled=${this.busy} @click=${() => void this.confirm()}>
        ${this.tr("confirmRemove")}
      </button>`;
  }
  /** Render the element. */
  render() {
    return o`
      <div class="row">
        <label style="flex: 0 0 280px"
          >${this.tr("target")}
          <select
            @change=${(e) => {
      this.target = e.target.value, this.plan = void 0;
    }}
          >
            <option value="all" ?selected=${this.target === "all"}>${this.tr("targetAll")}</option>
            <option value="device" ?selected=${this.target === "device"}>
              ${this.tr("targetDevice")}
            </option>
            <option value="run" ?selected=${this.target === "run"}>${this.tr("targetRun")}</option>
          </select>
        </label>
        ${this.target === "all" ? "" : o`<label style="flex: 1 1 260px"
                >${this.tr("targetId")}
                <input
                  .value=${this.targetId}
                  @input=${(e) => this.targetId = e.target.value}
                />
              </label>`}
        <button @click=${() => void this.showPlan()}>${this.tr("showPlan")}</button>
      </div>
      ${this.plan ? this.renderPlan(this.plan) : ""}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
  }
};
C([
  P()
], A.prototype, "target", 2);
C([
  P()
], A.prototype, "targetId", 2);
C([
  h()
], A.prototype, "plan", 2);
C([
  h()
], A.prototype, "busy", 2);
C([
  h()
], A.prototype, "message", 2);
C([
  h()
], A.prototype, "error", 2);
A = C([
  H("tdc-removal-panel")
], A);
function xe() {
  return {
    type: "times",
    times: "08:00, 18:30",
    weekdays: [],
    everyS: 60,
    start: "00:00",
    end: "24:00",
    at: "",
    count: 3,
    perDay: 24
  };
}
function Pt(e) {
  return e.split(",").map((t) => t.trim()).filter(Boolean);
}
function Se(e) {
  switch (e.type) {
    case "times":
      return e.weekdays.length ? { type: "times", times: Pt(e.times), weekdays: [...e.weekdays].sort() } : { type: "times", times: Pt(e.times) };
    case "interval":
      return { type: "interval", every_s: e.everyS, start: e.start, end: e.end };
    case "once":
      return { type: "once", at: e.at };
    case "random_window":
      return { type: "random_window", count: e.count, start: e.start, end: e.end };
    case "poisson":
      return { type: "poisson", per_day: e.perDay };
  }
}
function Te(e, t) {
  switch (e) {
    case "all":
      return { all: !0 };
    case "template":
      return { template: t };
    case "device":
      return { device: t };
    case "run":
      return { run: t };
  }
}
function Pe(e) {
  return "all" in e ? { kind: "all", id: "" } : "template" in e ? { kind: "template", id: e.template } : "device" in e ? { kind: "device", id: e.device } : { kind: "run", id: e.run };
}
function Oe(e) {
  switch (e.type) {
    case "times":
      return e.times.join(", ");
    case "interval":
      return `${e.every_s} s (${e.start}–${e.end})`;
    case "once":
      return e.at.replace("T", " ");
    case "random_window":
      return `${e.count}× ${e.start}–${e.end}`;
    case "poisson":
      return `Ø ${e.per_day}/d`;
  }
}
function Ce(e) {
  return e.slice(0, 16).replace("T", " ");
}
var Ne = Object.defineProperty, Re = Object.getOwnPropertyDescriptor, v = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Re(t, s) : t, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (i = (r ? a(t, s, i) : a(i)) || i);
  return r && i && Ne(t, s, i), i;
};
const Me = 1e4, Ot = 24, it = 50, ke = ["times", "interval", "once", "random_window", "poisson"], De = ["all", "template", "device", "run"], Ie = [
  "weekdayMon",
  "weekdayTue",
  "weekdayWed",
  "weekdayThu",
  "weekdayFri",
  "weekdaySat",
  "weekdaySun"
];
let $ = class extends O {
  constructor() {
    super(...arguments), this.schedules = [], this.runs = [], this.templates = [], this.error = "", this.busy = !1, this.name = "", this.kind = "all", this.targetId = "", this.entity = "", this.actionKey = "", this.seed = "", this.form = xe();
  }
  /** Load the data when the element is added to the page. */
  connectedCallback() {
    super.connectedCallback(), this.loadOptions(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), Me);
  }
  /** Stop the refresh timer when the element is removed. */
  disconnectedCallback() {
    window.clearInterval(this.timer), super.disconnectedCallback();
  }
  /** Load the actions and the templates that the form offers. */
  async loadOptions() {
    try {
      [this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.actionKey ||= this.actionKeys()[0] ?? "";
    } catch (e) {
      this.error = b(e);
    }
  }
  /** Reload the schedules and the planned runs. */
  async refresh() {
    try {
      [this.schedules, this.runs] = await Promise.all([
        this.api.schedules(),
        this.api.schedulePreview(Ot)
      ]), this.error = "";
    } catch (e) {
      this.error = b(e);
    }
  }
  /** Return the actions as `platform/action`, for the select. */
  actionKeys() {
    return Object.entries(this.info?.actions ?? {}).flatMap(
      ([e, t]) => t.map((s) => `${e}/${s}`)
    );
  }
  /** Return the keys of the template entities that the selected action works on. */
  entityKeys() {
    const e = this.actionKey.split("/")[0], t = this.templates.flatMap(
      (s) => s.entities.filter((r) => r.platform === e).map((r) => r.key)
    );
    return [...new Set(t)];
  }
  /** Run a call, then reload; show an error as text. */
  async run(e) {
    this.busy = !0;
    try {
      await e(), await this.refresh();
    } catch (t) {
      this.error = b(t);
    }
    this.busy = !1;
  }
  /** Create the schedule that the form describes. */
  async add() {
    const [, e] = this.actionKey.split("/"), t = this.entity || this.entityKeys()[0] || "";
    await this.run(async () => {
      await this.api.addSchedule({
        name: this.name,
        target: Te(this.kind, this.targetId),
        entity: t,
        action: e,
        trigger: Se(this.form),
        seed: this.seed || void 0
      }), this.name = "";
    });
  }
  /** Change one field of the trigger form. */
  setForm(e) {
    this.form = { ...this.form, ...e };
  }
  /** Render a text or number input bound to a field of the trigger form. */
  field(e, t, s = "text") {
    const r = s === "number";
    return o`<label style="flex: 1 1 140px"
      >${e}
      <input
        type=${s}
        .value=${String(this.form[t])}
        @input=${(i) => {
      const n = i.target.value;
      this.setForm({ [t]: r ? Number(n) : n });
    }}
      />
    </label>`;
  }
  /** Render the inputs that belong to the selected trigger type. */
  renderTriggerFields() {
    switch (this.form.type) {
      case "times":
        return o`${this.field(this.tr("schTimes"), "times")}
          <div class="row">
            ${Ie.map(
          (e, t) => o`<label style="flex-direction: row; align-items: center">
                  <input
                    type="checkbox"
                    style="width: auto"
                    .checked=${this.form.weekdays.includes(t)}
                    @change=${(s) => this.setForm({
            weekdays: s.target.checked ? [...this.form.weekdays, t] : this.form.weekdays.filter((r) => r !== t)
          })}
                  />${this.tr(e)}
                </label>`
        )}
          </div>`;
      case "interval":
        return o`${this.field(this.tr("schEveryS"), "everyS", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
      case "once":
        return this.field(this.tr("schAt"), "at", "datetime-local");
      case "random_window":
        return o`${this.field(this.tr("schCount"), "count", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
      case "poisson":
        return this.field(this.tr("schPerDay"), "perDay", "number");
    }
  }
  /** Render a select with the given values; `text` returns the label of a value. */
  select(e, t, s, r, i) {
    return o`<label style="flex: 1 1 180px"
      >${e}
      <select @change=${(n) => i(n.target.value)}>
        ${t.map(
      (n) => o`<option value=${n} ?selected=${n === s}>${r(n)}</option>`
    )}
      </select>
    </label>`;
  }
  /** Render the form for a new schedule. */
  renderForm() {
    const e = this.entityKeys();
    return o`
      <h3>${this.tr("schNew")}</h3>
      <div class="row">
        <label style="flex: 1 1 200px"
          >${this.tr("schName")}
          <input
            .value=${this.name}
            @input=${(t) => this.name = t.target.value}
          />
        </label>
        ${this.select(
      this.tr("schTarget"),
      De,
      this.kind,
      (t) => this.tr(`schTarget_${t}`),
      (t) => this.kind = t
    )}
        ${this.kind === "all" ? u : o`<label style="flex: 1 1 200px"
                >${this.tr("targetId")}
                <input
                  .value=${this.targetId}
                  @input=${(t) => this.targetId = t.target.value}
                />
              </label>`}
      </div>
      <div class="row">
        ${this.select(
      this.tr("schAction"),
      this.actionKeys(),
      this.actionKey,
      (t) => t,
      (t) => {
        this.actionKey = t, this.entity = "";
      }
    )}
        ${this.select(
      this.tr("schEntity"),
      e,
      this.entity || e[0] || "",
      (t) => t,
      (t) => this.entity = t
    )}
        ${this.select(
      this.tr("schTrigger"),
      ke,
      this.form.type,
      (t) => this.tr(`schTrigger_${t}`),
      (t) => this.setForm({ type: t })
    )}
      </div>
      <div class="row">
        ${this.renderTriggerFields()}
        <label style="flex: 1 1 140px"
          >${this.tr("seed")}
          <input
            .value=${this.seed}
            placeholder=${this.tr("seedHint")}
            @input=${(t) => this.seed = t.target.value}
          />
        </label>
      </div>
      <p>
        <button
          class="primary"
          ?disabled=${this.busy || !this.name.trim() || !this.actionKey}
          @click=${() => void this.add()}
        >
          ${this.tr("schAdd")}
        </button>
      </p>
    `;
  }
  /** Render the table row of one schedule. */
  renderRow(e) {
    const { kind: t, id: s } = Pe(e.target);
    return o`<tr>
      <td>${e.name}</td>
      <td>${this.tr(`schTarget_${t}`)}${s ? ` ${s}` : ""}</td>
      <td>${e.entity}: ${e.action}</td>
      <td>
        ${this.tr(`schTrigger_${e.trigger.type}`)}<br /><small
          >${Oe(e.trigger)}</small
        >
      </td>
      <td>
        <input
          type="checkbox"
          style="width: auto"
          title=${this.tr("schEnabled")}
          .checked=${e.enabled}
          ?disabled=${this.busy}
          @change=${(r) => void this.run(
      () => this.api.enableSchedule(e.id, r.target.checked)
    )}
        />
      </td>
      <td>
        <button
          ?disabled=${this.busy}
          @click=${() => void this.run(() => this.api.removeSchedule(e.id))}
        >
          ${this.tr("remove")}
        </button>
      </td>
    </tr>`;
  }
  /** Render the planned runs of the next hours. */
  renderPreview() {
    return this.runs.length === 0 ? o`<p><small>${this.tr("schNoRuns")}</small></p>` : o`<table>
        <tr>
          <th>${this.tr("schWhen")}</th>
          <th>${this.tr("schName")}</th>
        </tr>
        ${this.runs.slice(0, it).map(
      (e) => o`<tr>
              <td>${Ce(e.when)}</td>
              <td>${e.name}</td>
            </tr>`
    )}
      </table>
      ${this.runs.length > it ? o`<p>
              <small>${this.tr("schMoreRuns", { count: this.runs.length - it })}</small>
            </p>` : u}`;
  }
  /** Render the element. */
  render() {
    return o`
      ${this.schedules.length === 0 ? o`<p>${this.tr("schNone")}</p>` : o`<table>
              <tr>
                <th>${this.tr("schName")}</th>
                <th>${this.tr("schTarget")}</th>
                <th>${this.tr("schAction")}</th>
                <th>${this.tr("schTrigger")}</th>
                <th>${this.tr("schEnabled")}</th>
                <th>${this.tr("colActions")}</th>
              </tr>
              ${this.schedules.map((e) => this.renderRow(e))}
            </table>`}
      ${this.renderForm()}
      <h3>${this.tr("schPreview", { hours: Ot })}</h3>
      ${this.renderPreview()}
      <p class="error">${this.error}</p>
    `;
  }
};
v([
  h()
], $.prototype, "schedules", 2);
v([
  h()
], $.prototype, "runs", 2);
v([
  h()
], $.prototype, "info", 2);
v([
  h()
], $.prototype, "templates", 2);
v([
  h()
], $.prototype, "error", 2);
v([
  h()
], $.prototype, "busy", 2);
v([
  h()
], $.prototype, "name", 2);
v([
  h()
], $.prototype, "kind", 2);
v([
  h()
], $.prototype, "targetId", 2);
v([
  h()
], $.prototype, "entity", 2);
v([
  h()
], $.prototype, "actionKey", 2);
v([
  h()
], $.prototype, "seed", 2);
v([
  h()
], $.prototype, "form", 2);
$ = v([
  H("tdc-schedule-panel")
], $);
const Z = (1n << 64n) - 1n, He = 0x9e3779b97f4a7c15n, Ct = 0xbf58476d1ce4e5b9n, Nt = 0x94d049bb133111ebn, Ue = 3600;
function je(e, t = 0, s = 0) {
  return {
    shape: e.shape,
    min: e.min ?? 0,
    max: e.max ?? 100,
    period_s: e.period_s ?? 3600,
    interval_s: e.interval_s ?? 10,
    noise: e.noise ?? 0,
    decimals: e.decimals ?? 1,
    phase: e.phase ?? 0,
    rate_per_hour: e.rate_per_hour ?? 0,
    seed: t,
    origin: s
  };
}
function Y(e, t) {
  let s = BigInt(e) * He + (BigInt(t) & Z) * Ct + Nt & Z;
  return s = (s ^ s >> 30n) * Ct & Z, s = (s ^ s >> 27n) * Nt & Z, s ^= s >> 31n, Number(s >> 11n) / 2 ** 53;
}
function q(e, t) {
  const s = t / e.period_s + e.phase;
  return s - Math.floor(s);
}
const Rt = {
  constant: () => 0.5,
  sine: (e, t) => 0.5 + 0.5 * Math.sin(2 * Math.PI * q(e, t)),
  saw: (e, t) => q(e, t),
  square: (e, t) => q(e, t) < 0.5 ? 1 : 0,
  triangle: (e, t) => 1 - Math.abs(2 * q(e, t) - 1),
  noise: (e, t) => Y(e.seed, Math.floor(t / e.interval_s)),
  random_walk: (e, t) => {
    const s = t / e.period_s + e.phase, r = Math.floor(s), i = s - r, n = i * i * (3 - 2 * i), a = Y(e.seed, r), c = Y(e.seed, r + 1);
    return a + (c - a) * n;
  }
};
function Mt(e, t) {
  return Number(e.toFixed(t));
}
function ze(e, t) {
  if (e.shape === "counter") {
    const r = Math.max(0, t - e.origin);
    return Mt(e.min + e.rate_per_hour * r / Ue, e.decimals);
  }
  let s = (Rt[e.shape] ?? Rt.constant)(e, t);
  return e.noise && (s += (Y(e.seed + 1, Math.floor(t)) - 0.5) * 2 * e.noise), s = Math.min(1, Math.max(0, s)), Mt(e.min + s * (e.max - e.min), e.decimals);
}
var We = Object.defineProperty, Fe = Object.getOwnPropertyDescriptor, ut = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Fe(t, s) : t, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (i = (r ? a(t, s, i) : a(i)) || i);
  return r && i && We(t, s, i), i;
};
const kt = 320, nt = 80, at = 96, Le = 86400;
let L = class extends M {
  constructor() {
    super(...arguments), this.unit = "";
  }
  /** Return the points of the curve for 24 hours as an SVG point list. */
  points(e) {
    const t = je(e, 1, 0), s = Array.from(
      { length: at + 1 },
      (a, c) => ze(t, c / at * Le)
    ), r = Math.min(...s), n = Math.max(...s) - r || 1;
    return s.map((a, c) => {
      const l = c / at * kt, p = nt - 6 - (a - r) / n * (nt - 12);
      return `${l.toFixed(1)},${p.toFixed(1)}`;
    }).join(" ");
  }
  /** Render the element. */
  render() {
    if (!this.signal) return o``;
    const e = this.signal.min ?? 0, t = this.signal.max ?? 100;
    return o`<svg viewBox="0 0 ${kt} ${nt}" role="img">
        ${Qt`<polyline points=${this.points(this.signal)}></polyline>`}
      </svg>
      <div>${e} – ${t} ${this.unit}</div>`;
  }
};
L.styles = tt`
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
ut([
  P({ attribute: !1 })
], L.prototype, "signal", 2);
ut([
  P()
], L.prototype, "unit", 2);
L = ut([
  H("tdc-signal-preview")
], L);
function Be(e) {
  return e.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
}
function Ve(e, t) {
  return Math.round(e / Math.max(1, t) * 10) / 10;
}
var Ke = Object.defineProperty, Ge = Object.getOwnPropertyDescriptor, f = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ge(t, s) : t, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (i = (r ? a(t, s, i) : a(i)) || i);
  return r && i && Ke(t, s, i), i;
};
const N = "custom", Ze = 50, qe = JSON.stringify(
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
let g = class extends O {
  constructor() {
    super(...arguments), this.templates = [], this.template = "", this.count = 10, this.pattern = "{template} {nn}", this.areas = "", this.mode = "even", this.seed = "", this.custom = qe, this.busy = !1, this.message = "", this.error = "";
  }
  /** Load the data when the element is added to the page. */
  async connectedCallback() {
    super.connectedCallback();
    try {
      [this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.template = this.templates[0]?.id ?? N;
    } catch (e) {
      this.error = b(e);
    }
  }
  /** Return the entity definitions of the selected template, or the parsed custom ones. */
  entities() {
    if (this.template === N)
      try {
        return JSON.parse(this.custom);
      } catch {
        return [];
      }
    return this.templates.find((e) => e.id === this.template)?.entities ?? [];
  }
  /** Create the devices with the inputs of the form. */
  async submit() {
    this.busy = !0, this.message = "", this.error = "";
    const e = {
      template: this.template,
      count: this.count,
      name_pattern: this.pattern,
      areas: Be(this.areas),
      area_mode: this.mode,
      ...this.seed ? { seed: this.seed } : {},
      ...this.template === N ? { entities: this.entities() } : {}
    };
    try {
      const t = await this.api.create(e);
      this.message = this.tr("created", { count: t.devices });
    } catch (t) {
      this.error = b(t);
    }
    this.busy = !1;
  }
  /** Render the estimate of the load and a warning for a high rate. */
  renderEstimate() {
    const e = this.entities(), t = e.filter((r) => r.platform === "sensor").length * this.count, s = Ve(t, this.info?.tick_seconds ?? 10);
    return o`<p>
      <small>${this.tr("estimate", { entities: e.length * this.count, rate: s })}</small>
      ${s > Ze ? o`<br /><span class="warning">${this.tr("rateWarning")}</span>` : ""}
    </p>`;
  }
  /** Render the element. */
  render() {
    const e = this.entities().find((t) => t.platform === "sensor" && t.signal);
    return o`
      <div class="row">
        <label style="flex: 1 1 220px"
          >${this.tr("template")}
          <select @change=${(t) => this.template = t.target.value}>
            ${this.templates.map(
      (t) => o`<option value=${t.id} ?selected=${t.id === this.template}>${t.name}</option>`
    )}
            <option value=${N} ?selected=${this.template === N}>
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
      ${this.template === N ? o`<label
              >${this.tr("customEntities")}
              <textarea
                rows="8"
                .value=${this.custom}
                @input=${(t) => this.custom = t.target.value}
              ></textarea>
            </label>` : ""}
      ${e?.signal ? o`<p>
              <small>${this.tr("preview")}</small>
              <tdc-signal-preview
                .signal=${e.signal}
                unit=${e.unit ?? ""}
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
f([
  h()
], g.prototype, "info", 2);
f([
  h()
], g.prototype, "templates", 2);
f([
  h()
], g.prototype, "template", 2);
f([
  h()
], g.prototype, "count", 2);
f([
  h()
], g.prototype, "pattern", 2);
f([
  h()
], g.prototype, "areas", 2);
f([
  h()
], g.prototype, "mode", 2);
f([
  h()
], g.prototype, "seed", 2);
f([
  h()
], g.prototype, "custom", 2);
f([
  h()
], g.prototype, "busy", 2);
f([
  h()
], g.prototype, "message", 2);
f([
  h()
], g.prototype, "error", 2);
g = f([
  H("tdc-creation-wizard")
], g);
var Je = Object.defineProperty, Ye = Object.getOwnPropertyDescriptor, K = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ye(t, s) : t, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (i = (r ? a(t, s, i) : a(i)) || i);
  return r && i && Je(t, s, i), i;
};
let T = class extends O {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "devices", this.removeTarget = "all", this.removeId = "";
  }
  /** Switch to the removal tab with a preset target. */
  startRemoval(e) {
    this.removeTarget = e.detail.target, this.removeId = e.detail.id, this.tab = "remove";
  }
  /** Render one tab button. */
  renderTab(e, t) {
    return o`<button class=${this.tab === e ? "active" : ""} @click=${() => this.tab = e}>
      ${t}
    </button>`;
  }
  /** Render the element. */
  render() {
    return o`
      <header>
        <h2>${this.tr("title")}</h2>
        <span class="badge">${this.tr("badge")}</span>
      </header>
      <nav>
        ${this.renderTab("devices", this.tr("tabDevices"))}
        ${this.renderTab("create", this.tr("tabCreate"))}
        ${this.renderTab("schedules", this.tr("tabSchedules"))}
        ${this.renderTab("remove", this.tr("tabRemove"))}
      </nav>
      ${this.tab === "devices" ? o`<tdc-device-list
              .hass=${this.hass}
              @tdc-remove=${this.startRemoval}
            ></tdc-device-list>` : ""}
      ${this.tab === "create" ? o`<tdc-creation-wizard .hass=${this.hass}></tdc-creation-wizard>` : ""}
      ${this.tab === "schedules" ? o`<tdc-schedule-panel .hass=${this.hass}></tdc-schedule-panel>` : ""}
      ${this.tab === "remove" ? o`<tdc-removal-panel
              .hass=${this.hass}
              .target=${this.removeTarget}
              .targetId=${this.removeId}
            ></tdc-removal-panel>` : ""}
    `;
  }
};
T.styles = [
  O.styles,
  tt`
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
K([
  P({ type: Boolean })
], T.prototype, "narrow", 2);
K([
  h()
], T.prototype, "tab", 2);
K([
  h()
], T.prototype, "removeTarget", 2);
K([
  h()
], T.prototype, "removeId", 2);
T = K([
  H("hass-test-data-creator-panel")
], T);
export {
  T as TdcPanel
};
