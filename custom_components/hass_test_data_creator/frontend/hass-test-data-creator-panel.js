// node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, ee = globalThis, te = ee.trustedTypes, ne = te ? te.emptyScript : "", re = ee.reactiveElementPolyfillSupport, ie = (e, t) => e, ae = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ne : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, oe = (e, t) => !l(e, t), se = {
	attribute: !0,
	type: String,
	converter: ae,
	reflect: !1,
	useDefault: !1,
	hasChanged: oe
};
Symbol.metadata ??= Symbol("metadata"), ee.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var h = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = se) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? se;
	}
	static _$Ei() {
		if (this.hasOwnProperty(ie("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(ie("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ie("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? ae : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ae : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? oe)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
h.elementStyles = [], h.shadowRootOptions = { mode: "open" }, h[ie("elementProperties")] = /* @__PURE__ */ new Map(), h[ie("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: h }), (ee.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var ce = globalThis, le = (e) => e, ue = ce.trustedTypes, de = ue ? ue.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, fe = "$lit$", g = `lit$${Math.random().toFixed(9).slice(2)}$`, pe = "?" + g, me = `<${pe}>`, _ = document, he = () => _.createComment(""), ge = (e) => e === null || typeof e != "object" && typeof e != "function", _e = Array.isArray, ve = (e) => _e(e) || typeof e?.[Symbol.iterator] == "function", ye = "[ 	\n\f\r]", be = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, xe = /-->/g, Se = />/g, v = RegExp(`>|${ye}(?:([^\\s"'>=/]+)(${ye}*=${ye}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Ce = /'/g, we = /"/g, Te = /^(?:script|style|textarea|title)$/i, Ee = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), y = Ee(1), De = Ee(2), b = Symbol.for("lit-noChange"), x = Symbol.for("lit-nothing"), Oe = /* @__PURE__ */ new WeakMap(), S = _.createTreeWalker(_, 129);
function ke(e, t) {
	if (!_e(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return de === void 0 ? t : de.createHTML(t);
}
var Ae = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = be;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === be ? c[1] === "!--" ? o = xe : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = v) : (Te.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = v) : o = Se : o === v ? c[0] === ">" ? (o = i ?? be, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? v : c[3] === "\"" ? we : Ce) : o === we || o === Ce ? o = v : o === xe || o === Se ? o = be : (o = v, i = void 0);
		let d = o === v && e[t + 1].startsWith("/>") ? " " : "";
		a += o === be ? n + me : l >= 0 ? (r.push(s), n.slice(0, l) + fe + n.slice(l) + g + d) : n + g + (l === -2 ? t : d);
	}
	return [ke(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, je = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Ae(t, n);
		if (this.el = e.createElement(l, r), S.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = S.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(fe)) {
					let t = u[o++], n = i.getAttribute(e).split(g), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Fe : r[1] === "?" ? Ie : r[1] === "@" ? Le : Pe
					}), i.removeAttribute(e);
				} else e.startsWith(g) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (Te.test(i.tagName)) {
					let e = i.textContent.split(g), t = e.length - 1;
					if (t > 0) {
						i.textContent = ue ? ue.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], he()), S.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], he());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === pe) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(g, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += g.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = _.createElement("template");
		return n.innerHTML = e, n;
	}
};
function C(e, t, n = e, r) {
	if (t === b) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = ge(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = C(e, i._$AS(e, t.values), i, r)), t;
}
var Me = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? _).importNode(t, !0);
		S.currentNode = r;
		let i = S.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Ne(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Re(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = S.nextNode(), a++);
		}
		return S.currentNode = _, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Ne = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = x, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = C(this, e, t), ge(e) ? e === x || e == null || e === "" ? (this._$AH !== x && this._$AR(), this._$AH = x) : e !== this._$AH && e !== b && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ve(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== x && ge(this._$AH) ? this._$AA.nextSibling.data = e : this.T(_.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = je.createElement(ke(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Me(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Oe.get(e.strings);
		return t === void 0 && Oe.set(e.strings, t = new je(e)), t;
	}
	k(t) {
		_e(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(he()), this.O(he()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = le(e).nextSibling;
			le(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Pe = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = x, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = x;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = C(this, e, t, 0), a = !ge(e) || e !== this._$AH && e !== b, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = C(this, r[n + o], t, o), s === b && (s = this._$AH[o]), a ||= !ge(s) || s !== this._$AH[o], s === x ? e = x : e !== x && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === x ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Fe = class extends Pe {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === x ? void 0 : e;
	}
}, Ie = class extends Pe {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== x);
	}
}, Le = class extends Pe {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = C(this, e, t, 0) ?? x) === b) return;
		let n = this._$AH, r = e === x && n !== x || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== x && (n === x || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Re = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		C(this, e);
	}
}, ze = {
	M: fe,
	P: g,
	A: pe,
	C: 1,
	L: Ae,
	R: Me,
	D: ve,
	V: C,
	I: Ne,
	H: Pe,
	N: Ie,
	U: Le,
	B: Fe,
	F: Re
}, Be = ce.litHtmlPolyfillSupport;
Be?.(je, Ne), (ce.litHtmlVersions ??= []).push("3.3.3");
var Ve = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Ne(t.insertBefore(he(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, He = globalThis, w = class extends h {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ve(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return b;
	}
};
w._$litElement$ = !0, w.finalized = !0, He.litElementHydrateSupport?.({ LitElement: w });
var Ue = He.litElementPolyfillSupport;
Ue?.({ LitElement: w }), (He.litElementVersions ??= []).push("4.2.2");
// node_modules/@lit/reactive-element/decorators/custom-element.js
var T = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, We = {
	attribute: !0,
	type: String,
	converter: ae,
	reflect: !1,
	hasChanged: oe
}, Ge = (e = We, t, n) => {
	let { kind: r, metadata: i } = n, a = globalThis.litPropertyMetadata.get(i);
	if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(n.name, e), r === "accessor") {
		let { name: r } = n;
		return {
			set(n) {
				let i = t.get.call(this);
				t.set.call(this, n), this.requestUpdate(r, i, e, !0, n);
			},
			init(t) {
				return t !== void 0 && this.C(r, void 0, e, t), t;
			}
		};
	}
	if (r === "setter") {
		let { name: r } = n;
		return function(n) {
			let i = this[r];
			t.call(this, n), this.requestUpdate(r, i, e, !0, n);
		};
	}
	throw Error("Unsupported decorator location: " + r);
};
function E(e) {
	return (t, n) => typeof n == "object" ? Ge(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function D(e) {
	return E({
		...e,
		state: !0,
		attribute: !1
	});
}
// node_modules/@lit/reactive-element/decorators/base.js
var Ke = (e, t, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, n), n);
// node_modules/@lit/reactive-element/decorators/query.js
function qe(e, t) {
	return (n, r, i) => {
		let a = (t) => t.renderRoot?.querySelector(e) ?? null;
		if (t) {
			let { get: e, set: t } = typeof r == "object" ? n : i ?? (() => {
				let e = Symbol();
				return {
					get() {
						return this[e];
					},
					set(t) {
						this[e] = t;
					}
				};
			})();
			return Ke(n, r, { get() {
				let n = e.call(this);
				return n === void 0 && (n = a(this), (n !== null || this.hasUpdated) && t.call(this, n)), n;
			} });
		}
		return Ke(n, r, { get() {
			return a(this);
		} });
	};
}
// src/common/api.ts
var Je = "hass_test_data_creator", Ye = class {
	constructor(e) {
		this.hass = e;
	}
	info() {
		return this.call("info");
	}
	templates() {
		return this.call("templates/list");
	}
	devices(e, t) {
		return this.call("devices/list", {
			offset: e,
			limit: t
		});
	}
	create(e) {
		return this.call("devices/create", { ...e });
	}
	fire(e, t, n, r) {
		return this.call("devices/fire", {
			device: e,
			entity: t,
			action: n,
			params: r
		});
	}
	updateDevice(e, t) {
		return this.call("devices/update", {
			device: e,
			area: t
		});
	}
	setSignal(e, t, n) {
		return this.call("devices/signal", {
			device: e,
			entity: t,
			signal: n
		});
	}
	removalPlan(e, t) {
		return this.call("removal/plan", {
			target: e,
			target_id: t
		});
	}
	removalRun(e, t) {
		return this.call("removal/run", {
			target: e,
			target_id: t
		});
	}
	schedules() {
		return this.call("schedules/list");
	}
	addSchedule(e) {
		return this.call("schedules/add", { ...e });
	}
	updateSchedule(e, t) {
		return this.call("schedules/update", {
			schedule_id: e,
			...t
		});
	}
	removeSchedule(e) {
		return this.call("schedules/remove", { schedule_id: e });
	}
	enableSchedule(e, t) {
		return this.call("schedules/enable", {
			schedule_id: e,
			enabled: t
		});
	}
	schedulePreview(e) {
		return this.call("schedules/preview", { hours: e });
	}
	scenarios() {
		return this.call("scenarios/list");
	}
	addScenario(e, t) {
		return this.call("scenarios/add", {
			name: e,
			steps: t
		});
	}
	updateScenario(e, t, n) {
		return this.call("scenarios/update", {
			scenario_id: e,
			name: t,
			steps: n
		});
	}
	removeScenario(e) {
		return this.call("scenarios/remove", { scenario_id: e });
	}
	runScenario(e) {
		return this.call("scenarios/run", { scenario_id: e });
	}
	groups() {
		return this.call("groups/list");
	}
	addGroup(e, t) {
		return this.call("groups/add", {
			name: e,
			members: t
		});
	}
	updateGroup(e, t, n) {
		return this.call("groups/update", {
			group_id: e,
			name: t,
			members: n
		});
	}
	removeGroup(e) {
		return this.call("groups/remove", { group_id: e });
	}
	importHistory(e, t, n) {
		return this.call("history/import", {
			days: e,
			device: t,
			entity: n
		});
	}
	call(e, t = {}) {
		let n = Object.fromEntries(Object.entries(t).filter(([, e]) => e !== void 0));
		return this.hass.callWS({
			type: `${Je}/${e}`,
			...n
		});
	}
};
function O(e) {
	if (typeof e == "object" && e && "message" in e) {
		let { code: t, message: n } = e;
		return t ? `${t}: ${n}` : n;
	}
	return String(e);
}
// src/common/i18n.ts
var Xe = {
	en: {
		title: "Test data",
		badge: "Test environment",
		badgeLapse: "Time lapse ×{factor}",
		tabDevices: "Devices",
		tabRemove: "Remove",
		tabSchedules: "Schedules",
		schNone: "No schedules yet. Add one above.",
		schList: "Existing schedules",
		schActionOne: "1 action",
		schActions: "{count} actions",
		schSave: "Save changes",
		schSeedKeep: "Empty keeps the seed",
		schNew: "New schedule",
		schName: "Name",
		schTarget: "Runs on",
		schTarget_all: "All devices",
		schTarget_template: "Template",
		schTarget_device: "Device",
		schTarget_run: "Creation batch",
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
		planScenarios: "{count} scenarios",
		planTopics: "{count} MQTT topics with retained messages",
		planStatistics: "{count} imported statistics",
		tabHistory: "History",
		histIntro: "Writes hourly long-term statistics for the past days, computed from the curves of the sensors that have a state class. Existing statistics of those hours are replaced. Counters grow through the whole period.",
		histDays: "Days back (1 to 365)",
		histDevice: "Device (name or id, empty: all)",
		histEntity: "Entity key (for example power, empty: all)",
		histImport: "Import history",
		histDone: "{series} statistics with {rows} rows written, {skipped} sensors skipped",
		outputNative: "Home Assistant (native)",
		outputMqtt: "MQTT discovery",
		outputZ2m: "Zigbee2MQTT",
		tabGroups: "MQTT groups",
		grpNone: "No groups yet. Add one above; members must be Zigbee2MQTT devices.",
		grpNoDevices: "There are no Zigbee2MQTT devices yet. Create devices with the output Zigbee2MQTT first.",
		grpNew: "New group",
		grpMembers: "Members",
		grpAdd: "Add group",
		grpNumber: "Group {number}",
		planGroups: "{count} groups",
		tabScenarios: "Scenarios",
		scnNone: "No scenarios yet. Add one below.",
		scnNew: "New scenario",
		scnSteps: "Steps",
		scnStep: "Step {number}",
		scnAfter: "Wait after the step before (seconds)",
		scnParams: "Parameters (JSON)",
		scnParamsHint: "For example {\"brightness\": 128}",
		scnAddStep: "Add step",
		scnRemoveStep: "Remove step",
		scnCreate: "Add scenario",
		scnRun: "Run",
		scnStarted: "{count} steps started",
		scnStepCount: "{count} steps",
		scnBadParams: "The parameters are not valid JSON",
		edSensor: "Curve of the entity",
		edShape: "Shape",
		edMin: "Minimum",
		edMax: "Maximum",
		edDecimals: "Decimals",
		edPeriod: "Period (seconds)",
		edInterval: "Interval (seconds)",
		edPhase: "Phase (0 to 1)",
		edRate: "Rate per hour",
		edNoise: "Noise (fraction of the range)",
		edValues: "States (comma separated)",
		edWeights: "Weights (comma separated, optional)",
		edStates: "States with seconds (idle:600, wash:1800)",
		schScenario: "Scenario {id}",
		schRuns: "Runs",
		schRunsAction: "An action",
		loading: "Loading …",
		noDevices: "No test devices yet. Use the button above to create some.",
		colName: "Name",
		colTemplate: "Template",
		colArea: "Area",
		colOutput: "Output",
		colValues: "Values",
		colActions: "Actions",
		detArea: "Area",
		detAreaNone: "No area",
		detSaveArea: "Save area",
		detAreaHint: "Pick an existing area or type a new name; empty removes the area.",
		detEntity: "Entity",
		detState: "State",
		detActions: "Choose action",
		detRun: "Run",
		detSeconds: "Duration in seconds",
		detCurve: "Change curve",
		detSaveCurve: "Save curve",
		detCancel: "Cancel",
		loadMore: "Load more",
		devicesOf: "{shown} of {total} devices",
		remove: "Remove",
		template: "Template",
		count: "Count",
		namePattern: "Name pattern",
		namePatternHint: "Placeholders: {n}, {nn}, {template}",
		areas: "Areas",
		areasHint: "Pick areas or add new ones; the devices are spread over them",
		areasNone: "No area",
		areasAdd: "New area",
		areasAddButton: "Add",
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
		targetRun: "One creation batch",
		pickOne: "Please choose",
		showPlan: "Show what will be removed",
		planDevices: "{count} devices",
		planOrphans: "{count} devices found only in the registry",
		planAreas: "Areas created by the integration that become empty: {names}",
		planNothing: "Nothing to remove.",
		confirmRemove: "Remove now",
		removed: "{count} devices removed",
		error: "Error"
	},
	de: {
		title: "Testdaten",
		badge: "Testumgebung",
		badgeLapse: "Zeitraffer ×{factor}",
		tabDevices: "Geräte",
		tabRemove: "Entfernen",
		tabSchedules: "Zeitpläne",
		schNone: "Noch keine Zeitpläne. Lege oben einen an.",
		schList: "Vorhandene Zeitpläne",
		schActionOne: "1 Aktion",
		schActions: "{count} Aktionen",
		schSave: "Änderungen speichern",
		schSeedKeep: "Leer behält den Seed",
		schNew: "Neuer Zeitplan",
		schName: "Name",
		schTarget: "Läuft auf",
		schTarget_all: "Allen Geräten",
		schTarget_template: "Vorlage",
		schTarget_device: "Gerät",
		schTarget_run: "Erstellung",
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
		planScenarios: "{count} Szenarien",
		planTopics: "{count} MQTT-Topics mit gespeicherten (retained) Nachrichten",
		planStatistics: "{count} importierte Statistiken",
		tabHistory: "Verlauf",
		histIntro: "Schreibt stündliche Langzeitstatistiken für die vergangenen Tage, berechnet aus den Kurven der Sensoren mit Zustandsklasse. Vorhandene Statistiken dieser Stunden werden ersetzt. Zähler wachsen über den ganzen Zeitraum.",
		histDays: "Tage zurück (1 bis 365)",
		histDevice: "Gerät (Name oder Id, leer: alle)",
		histEntity: "Entitätsschlüssel (zum Beispiel power, leer: alle)",
		histImport: "Verlauf importieren",
		histDone: "{series} Statistiken mit {rows} Zeilen geschrieben, {skipped} Sensoren übersprungen",
		outputNative: "Home Assistant (nativ)",
		outputMqtt: "MQTT-Discovery",
		outputZ2m: "Zigbee2MQTT",
		tabGroups: "MQTT Gruppen",
		grpNone: "Noch keine Gruppen. Lege oben eine an; Mitglieder müssen Zigbee2MQTT-Geräte sein.",
		grpNoDevices: "Es gibt noch keine Zigbee2MQTT-Geräte. Erstelle zuerst Geräte mit dem Ausgang Zigbee2MQTT.",
		grpNew: "Neue Gruppe",
		grpMembers: "Mitglieder",
		grpAdd: "Gruppe anlegen",
		grpNumber: "Gruppe {number}",
		planGroups: "{count} Gruppen",
		tabScenarios: "Szenarien",
		scnNone: "Noch keine Szenarien. Lege unten eines an.",
		scnNew: "Neues Szenario",
		scnSteps: "Schritte",
		scnStep: "Schritt {number}",
		scnAfter: "Wartezeit nach dem Schritt davor (Sekunden)",
		scnParams: "Parameter (JSON)",
		scnParamsHint: "Zum Beispiel {\"brightness\": 128}",
		scnAddStep: "Schritt hinzufügen",
		scnRemoveStep: "Schritt entfernen",
		scnCreate: "Szenario anlegen",
		scnRun: "Starten",
		scnStarted: "{count} Schritte gestartet",
		scnStepCount: "{count} Schritte",
		scnBadParams: "Die Parameter sind kein gültiges JSON",
		edSensor: "Kurve der Entität",
		edShape: "Form",
		edMin: "Minimum",
		edMax: "Maximum",
		edDecimals: "Nachkommastellen",
		edPeriod: "Periode (Sekunden)",
		edInterval: "Intervall (Sekunden)",
		edPhase: "Phase (0 bis 1)",
		edRate: "Rate pro Stunde",
		edNoise: "Rauschen (Anteil des Bereichs)",
		edValues: "Zustände (kommagetrennt)",
		edWeights: "Gewichte (kommagetrennt, optional)",
		edStates: "Zustände mit Sekunden (idle:600, wash:1800)",
		schScenario: "Szenario {id}",
		schRuns: "Startet",
		schRunsAction: "Eine Aktion",
		loading: "Lade …",
		noDevices: "Noch keine Testgeräte. Erzeuge welche mit dem Knopf oben.",
		colName: "Name",
		colTemplate: "Vorlage",
		colArea: "Bereich",
		colOutput: "Ausgang",
		colValues: "Werte",
		colActions: "Aktionen",
		detArea: "Bereich",
		detAreaNone: "Kein Bereich",
		detSaveArea: "Bereich speichern",
		detAreaHint: "Wähle einen vorhandenen Bereich oder tippe einen neuen Namen; leer entfernt den Bereich.",
		detEntity: "Entität",
		detState: "Zustand",
		detActions: "Aktion wählen",
		detRun: "Ausführen",
		detSeconds: "Dauer in Sekunden",
		detCurve: "Kurve ändern",
		detSaveCurve: "Kurve speichern",
		detCancel: "Abbrechen",
		loadMore: "Mehr laden",
		devicesOf: "{shown} von {total} Geräten",
		remove: "Entfernen",
		template: "Vorlage",
		count: "Anzahl",
		namePattern: "Namensmuster",
		namePatternHint: "Platzhalter: {n}, {nn}, {template}",
		areas: "Bereiche",
		areasHint: "Wähle Bereiche oder füge neue hinzu; die Geräte werden darauf verteilt",
		areasNone: "Kein Bereich",
		areasAdd: "Neuer Bereich",
		areasAddButton: "Hinzufügen",
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
		targetRun: "Eine Erstellung",
		pickOne: "Bitte wählen",
		showPlan: "Anzeigen, was entfernt wird",
		planDevices: "{count} Geräte",
		planOrphans: "{count} Geräte, die nur in der Registry stehen",
		planAreas: "Von der Integration angelegte Bereiche, die leer werden: {names}",
		planNothing: "Es gibt nichts zu entfernen.",
		confirmRemove: "Jetzt entfernen",
		removed: "{count} Geräte entfernt",
		error: "Fehler"
	}
};
function Ze(e) {
	return e?.toLowerCase().startsWith("de") ? "de" : "en";
}
function Qe(e, t, n = {}) {
	return Xe[e][t].replace(/\{(\w+)\}/g, (e, t) => t in n ? String(n[t]) : e);
}
// src/common/labels.ts
var $e = {
	shape: {
		constant: "Constant",
		sine: "Sine",
		saw: "Sawtooth",
		square: "Square",
		triangle: "Triangle",
		noise: "Noise",
		random_walk: "Random walk",
		household_load: "Household load",
		pv_day: "Photovoltaic day",
		steps: "Steps",
		discharge: "Discharge",
		counter: "Counter",
		enum: "Enumeration",
		state_machine: "State sequence"
	},
	action: {
		turn_on: "Turn on",
		turn_off: "Turn off",
		toggle: "Toggle",
		set_on: "Set to on",
		set_off: "Set to off",
		pulse: "Pulse",
		press: "Press",
		set_brightness: "Set brightness",
		open: "Open",
		close: "Close",
		set_position: "Set position",
		set_temperature: "Set temperature"
	},
	fault: {
		unavailable: "Unavailable",
		dropout: "Dropout",
		frozen: "Frozen",
		spike: "Spike",
		battery_low: "Battery low",
		linkquality_drop: "Link quality drop",
		late: "Late messages",
		duplicate: "Duplicate messages"
	},
	platform: {
		sensor: "Sensor",
		binary_sensor: "Binary sensor",
		switch: "Switch",
		light: "Light",
		cover: "Blind",
		climate: "Thermostat",
		event: "Event"
	},
	template: {
		climate_sensor: "Climate sensor",
		contact_sensor: "Contact sensor",
		cover: "Blind",
		light: "Dimmable light",
		motion_sensor: "Motion sensor",
		plug_metering: "Plug with metering",
		thermostat: "Thermostat",
		wall_button: "Wall button",
		washer: "Washing machine"
	},
	entity: {
		action: "Action",
		battery: "Battery",
		contact: "Contact",
		cover: "Blind",
		current: "Current",
		door: "Door",
		energy: "Energy",
		humidity: "Humidity",
		illuminance: "Illuminance",
		light: "Light",
		linkquality: "Link quality",
		motion: "Motion",
		power: "Power",
		pressure: "Pressure",
		program: "Program",
		state: "Switch",
		temperature: "Temperature",
		thermostat: "Thermostat",
		voltage: "Voltage"
	},
	state: {
		on: "on",
		off: "off",
		open: "open",
		closed: "closed",
		opening: "opening",
		closing: "closing",
		heat: "heating",
		unavailable: "unavailable",
		unknown: "unknown"
	}
}, et = {
	en: $e,
	de: {
		shape: {
			constant: "Konstant",
			sine: "Sinus",
			saw: "Sägezahn",
			square: "Rechteck",
			triangle: "Dreieck",
			noise: "Rauschen",
			random_walk: "Zufallsweg",
			household_load: "Haushaltslast",
			pv_day: "Photovoltaik-Tag",
			steps: "Treppe",
			discharge: "Entladung",
			counter: "Zähler",
			enum: "Aufzählung",
			state_machine: "Zustandsfolge"
		},
		action: {
			turn_on: "Einschalten",
			turn_off: "Ausschalten",
			toggle: "Umschalten",
			set_on: "Auf „an“ setzen",
			set_off: "Auf „aus“ setzen",
			pulse: "Impuls",
			press: "Drücken",
			set_brightness: "Helligkeit setzen",
			open: "Öffnen",
			close: "Schließen",
			set_position: "Position setzen",
			set_temperature: "Temperatur setzen"
		},
		fault: {
			unavailable: "Nicht verfügbar",
			dropout: "Aussetzer",
			frozen: "Eingefroren",
			spike: "Ausreißer",
			battery_low: "Batterie schwach",
			linkquality_drop: "Verbindungsqualität sinkt",
			late: "Verspätete Nachrichten",
			duplicate: "Doppelte Nachrichten"
		},
		platform: {
			sensor: "Sensor",
			binary_sensor: "Binärsensor",
			switch: "Schalter",
			light: "Leuchte",
			cover: "Rollo",
			climate: "Thermostat",
			event: "Ereignis"
		},
		template: {
			climate_sensor: "Klimasensor",
			contact_sensor: "Kontaktsensor",
			cover: "Rollo",
			light: "Dimmbare Leuchte",
			motion_sensor: "Bewegungsmelder",
			plug_metering: "Steckdose mit Messung",
			thermostat: "Thermostat",
			wall_button: "Wandtaster",
			washer: "Waschmaschine"
		},
		entity: {
			action: "Aktion",
			battery: "Batterie",
			contact: "Kontakt",
			cover: "Rollo",
			current: "Strom",
			door: "Tür",
			energy: "Energie",
			humidity: "Luftfeuchtigkeit",
			illuminance: "Beleuchtungsstärke",
			light: "Leuchte",
			linkquality: "Verbindungsqualität",
			motion: "Bewegung",
			power: "Leistung",
			pressure: "Druck",
			program: "Programm",
			state: "Schalter",
			temperature: "Temperatur",
			thermostat: "Thermostat",
			voltage: "Spannung"
		},
		state: {
			on: "an",
			off: "aus",
			open: "offen",
			closed: "geschlossen",
			opening: "öffnet",
			closing: "schließt",
			heat: "Heizen",
			unavailable: "nicht verfügbar",
			unknown: "unbekannt"
		}
	}
}, tt = {
	native: "outputNative",
	mqtt: "outputMqtt",
	z2m: "outputZ2m"
}, nt = "fault_";
function k(e, t, n) {
	return et[Ze(e)][t][n] ?? n;
}
function A(e, t) {
	return t.startsWith(nt) ? `${Ze(e) === "de" ? "Störung" : "Fault"}: ${k(e, "fault", t.slice(6))}` : k(e, "action", t);
}
function rt(e, t) {
	let [n, r] = t.split("/");
	return r ? `${k(e, "platform", n)} · ${A(e, r)}` : t;
}
function it(e, t, n) {
	return et[Ze(e)].template[t] ?? n;
}
function at(e, t, n) {
	let r = $e.entity[t];
	return r !== void 0 && r === n ? k(e, "entity", t) : n;
}
function ot(e, t) {
	return t === null ? "–" : k(e, "state", t);
}
function j(e, t, n) {
	let r = Ze(e);
	return [...t].sort((e, t) => n(e).localeCompare(n(t), r, {
		numeric: !0,
		sensitivity: "base"
	}));
}
// \0@oxc-project+runtime@0.155.0/helpers/esm/decorate.js
function M(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/common/base.ts
var st = o`
  :host {
    container-type: inline-size;
  }
`, ct = o`
  border-radius: 6px;
  border: 1px solid var(--divider-color);
  background: var(--card-background-color);
  color: var(--primary-text-color);
`, N = class extends w {
	static {
		this.styles = o`
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
      ${ct}
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
      ${ct}
    }
    input,
    select {
      min-height: 36px;
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
    @container (max-width: 760px) {
      table.cards thead,
      table.cards tr:has(> th) {
        display: none;
      }
      table.cards,
      table.cards tbody,
      table.cards tr,
      table.cards td {
        display: block;
      }
      table.cards tbody {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 12px;
        margin-top: 12px;
      }
      table.cards tr:not(.card) {
        grid-column: 1 / -1;
      }
      table.cards tr.card {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 4px 8px;
      }
      table.cards tr.card > td {
        display: flex;
        gap: 12px;
        padding: 4px 0;
        border-bottom: 0;
      }
      table.cards tr.card > td[data-label]::before {
        content: attr(data-label);
        flex: 0 0 90px;
        color: var(--secondary-text-color);
        font-size: 0.8em;
        padding-top: 2px;
      }
      table.cards tr.card > td.name {
        font-weight: 500;
      }
      table.cards tr.card > td.row {
        flex-wrap: wrap;
      }
      table.cards tr.card > td.row::before {
        flex-basis: 100%;
      }
    }
    .row.form {
      align-items: flex-start;
    }
    .fields {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 8px 12px;
      align-items: start;
      margin-bottom: 8px;
    }
    .end {
      display: flex;
      justify-content: flex-end;
    }
    .fields.bottom {
      align-items: end;
    }
    fieldset {
      margin: 0 0 12px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
    }
    legend {
      padding: 0 6px;
      color: var(--secondary-text-color);
    }
    .fields > .wide {
      grid-column: 1 / -1;
    }
    .row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
  `;
	}
	get api() {
		return this.client?.hass !== this.hass && (this.client = {
			hass: this.hass,
			api: new Ye(this.hass)
		}), this.client.api;
	}
	textField(e, t, n, r = {}) {
		return y`<label style="flex: ${r.flex ?? "1 1 200px"}"
      >${e}
      <input
        .value=${t}
        placeholder=${r.placeholder ?? ""}
        @input=${(e) => n(e.target.value)}
      />
    </label>`;
	}
	select(e, t, n, r, i) {
		return y`<label style="flex: 1 1 180px"
      >${e}
      <select @change=${(e) => i(e.target.value)}>
        ${j(this.hass?.language, t, r).map((e) => y`<option value=${e} ?selected=${e === n}>${r(e)}</option>`)}
      </select>
    </label>`;
	}
	tr(e, t) {
		return Qe(Ze(this.hass?.language), e, t);
	}
};
M([E({ attribute: !1 })], N.prototype, "hass", void 0);
// node_modules/lit-html/directive.js
var P = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, lt = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), ut = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, { I: dt } = ze, ft = (e) => e, pt = (e) => e.strings === void 0, mt = () => document.createComment(""), ht = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new dt(r.insertBefore(mt(), i), r.insertBefore(mt(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = ft(e).nextSibling;
				ft(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, F = (e, t, n = e) => (e._$AI(t, n), e), gt = {}, _t = (e, t = gt) => e._$AH = t, vt = (e) => e._$AH, yt = (e) => {
	e._$AR(), e._$AA.remove();
}, bt = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, xt = lt(class extends ut {
	constructor(e) {
		if (super(e), e.type !== P.CHILD) throw Error("repeat() can only be used in text expressions");
	}
	dt(e, t, n) {
		let r;
		n === void 0 ? n = t : t !== void 0 && (r = t);
		let i = [], a = [], o = 0;
		for (let t of e) i[o] = r ? r(t, o) : o, a[o] = n(t, o), o++;
		return {
			values: a,
			keys: i
		};
	}
	render(e, t, n) {
		return this.dt(e, t, n).values;
	}
	update(e, [t, n, r]) {
		let i = vt(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = F(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = F(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = F(i[d], a[m]), ht(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = F(i[f], a[p]), ht(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = bt(o, p, m), u = bt(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = ht(e, i[d]);
					F(t, a[p]), c[p] = t;
				} else c[p] = F(n, a[p]), ht(e, i[d], n), i[t] = null;
				p++;
			} else yt(i[f]), f--;
		} else yt(i[d]), d++;
		for (; p <= m;) {
			let t = ht(e, c[m + 1]);
			F(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && yt(e);
		}
		return this.ut = o, _t(e, c), b;
	}
}), St = 4, Ct = 12, wt = 320, Tt = 120, Et = 200, Dt = o`
  .popover {
    position: fixed;
    inset: auto;
    margin: 0;
    overflow-y: auto;
    padding: 4px 0;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`, Ot = class extends N {
	constructor(...e) {
		super(...e), this.open = !1, this.closeOutside = (e) => {
			e.composedPath().includes(this) || (this.open = !1);
		}, this.closeOnEscape = (e) => {
			e.key === "Escape" && (this.open = !1);
		}, this.follow = () => this.placePopover();
	}
	connectedCallback() {
		super.connectedCallback(), document.addEventListener("click", this.closeOutside), document.addEventListener("keydown", this.closeOnEscape), window.addEventListener("scroll", this.follow, !0), window.addEventListener("resize", this.follow);
	}
	disconnectedCallback() {
		document.removeEventListener("click", this.closeOutside), document.removeEventListener("keydown", this.closeOnEscape), window.removeEventListener("scroll", this.follow, !0), window.removeEventListener("resize", this.follow), super.disconnectedCallback();
	}
	updated(e) {
		super.updated(e), this.open && this.placePopover();
	}
	placePopover() {
		let e = this.renderRoot.querySelector(".popover");
		if (!this.open || !e) return;
		e.matches(":popover-open") || e.showPopover();
		let t = this.getBoundingClientRect(), n = window.innerHeight - t.bottom - Ct, r = t.top - Ct, i = n < Et && r > n, a = i ? r : n, { style: o } = e;
		o.left = `${t.left}px`, o.minWidth = `${t.width}px`, o.maxHeight = `${Math.max(Tt, Math.min(wt, a))}px`, o.top = i ? "" : `${t.bottom + St}px`, o.bottom = i ? `${window.innerHeight - t.top + St}px` : "";
	}
};
M([D()], Ot.prototype, "open", void 0);
// src/common/menu-button.ts
var kt = class extends Ot {
	constructor(...e) {
		super(...e), this.label = "", this.items = [], this.disabled = !1;
	}
	static {
		this.styles = [
			N.styles,
			Dt,
			o`
      :host {
        display: inline-block;
        position: relative;
      }
      :host > button {
        white-space: nowrap;
      }
      .popover button {
        display: block;
        width: 100%;
        text-align: left;
        white-space: nowrap;
        border: 0;
        border-radius: 0;
        background: none;
      }
      .popover button:hover,
      .popover button:focus-visible {
        background: var(--secondary-background-color);
      }
    `
		];
	}
	pick(e) {
		this.open = !1, this.dispatchEvent(new CustomEvent("tdc-pick", { detail: e }));
	}
	render() {
		return y`
      <button
        aria-haspopup="menu"
        aria-expanded=${this.open ? "true" : "false"}
        ?disabled=${this.disabled}
        @click=${() => this.open = !this.open}
      >
        ${this.label} ▾
      </button>
      ${this.open ? y`<div class="popover" popover="manual" role="menu">
              ${this.items.map((e) => y`<button role="menuitem" @click=${() => this.pick(e.value)}>
                    ${e.label}
                  </button>`)}
            </div>` : ""}
    `;
	}
};
M([E()], kt.prototype, "label", void 0), M([E({ attribute: !1 })], kt.prototype, "items", void 0), M([E({ type: Boolean })], kt.prototype, "disabled", void 0), kt = M([T("tdc-menu-button")], kt);
// src/common/dialog.ts
var At = class extends N {
	constructor(...e) {
		super(...e), this.open = !1, this.heading = "";
	}
	static {
		this.styles = [N.styles, o`
      dialog {
        width: min(760px, 94vw);
        max-height: 90vh;
        padding: 16px 20px;
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        overflow-y: auto;
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
      }
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .head h3 {
        margin: 0;
      }
    `];
	}
	updated(e) {
		super.updated(e), e.has("open") && this.dialog && (this.open && !this.dialog.open && this.dialog.showModal(), !this.open && this.dialog.open && this.dialog.close());
	}
	close() {
		this.dispatchEvent(new CustomEvent("tdc-close"));
	}
	render() {
		return y`<dialog
      @close=${() => this.close()}
      @click=${(e) => {
			e.target === this.dialog && this.close();
		}}
    >
      <div class="head">
        <h3>${this.heading}</h3>
        <button aria-label=${this.tr("detCancel")} @click=${() => this.close()}>✕</button>
      </div>
      <slot></slot>
    </dialog>`;
	}
};
M([E({ type: Boolean })], At.prototype, "open", void 0), M([E()], At.prototype, "heading", void 0), M([qe("dialog")], At.prototype, "dialog", void 0), At = M([T("tdc-dialog")], At);
// src/signals/editor-helpers.ts
var jt = ["enum", "state_machine"], Mt = [
	"sine",
	"saw",
	"square",
	"triangle",
	"random_walk",
	"discharge"
], Nt = [
	"constant",
	"household_load",
	"pv_day"
], Pt = 600;
function Ft(e) {
	return jt.includes(e);
}
function It(e) {
	return e === "counter" ? ["rate_per_hour"] : e === "noise" ? ["interval_s", "noise"] : e === "steps" ? [
		"period_s",
		"interval_s",
		"phase",
		"noise"
	] : e === "enum" ? ["interval_s"] : e === "state_machine" ? ["phase"] : Mt.includes(e) ? [
		"period_s",
		"phase",
		"noise"
	] : Nt.includes(e) ? ["noise"] : [];
}
function Lt(e) {
	return e === "enum" ? ["values", "weights"] : e === "state_machine" ? ["states"] : [];
}
function Rt(e, t, n) {
	let r = { ...e }, i = Number(n);
	return n.trim() === "" || Number.isNaN(i) ? delete r[t] : r[t] = i, r;
}
function zt(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function Bt(e, t) {
	return t === "states" ? (e.states ?? []).map((e) => `${e.value}:${e.duration_s}`).join(", ") : (e[t] ?? []).join(", ");
}
function Vt(e, t, n) {
	let r = { ...e };
	return t === "values" ? r.values = zt(n) : t === "weights" ? r.weights = zt(n).map(Number).filter((e) => !Number.isNaN(e)) : r.states = zt(n).flatMap((e) => {
		let [t, n] = e.split(":").map((e) => e.trim()), r = Number(n);
		return t && r > 0 ? [{
			value: t,
			duration_s: r
		}] : [];
	}), r;
}
function Ht(e) {
	return e === "enum" ? {
		values: ["on", "off"],
		interval_s: Pt
	} : e === "state_machine" ? { states: [{
		value: "idle",
		duration_s: Pt
	}, {
		value: "active",
		duration_s: Pt
	}] } : {};
}
function Ut(e, t) {
	let n = /* @__PURE__ */ new Set([
		"shape",
		...It(t),
		...Lt(t)
	]);
	Ft(t) || [
		"min",
		"max",
		"decimals"
	].forEach((e) => n.add(e));
	let r = {
		...Ht(t),
		...e,
		shape: t
	};
	return Object.fromEntries(Object.entries(r).filter(([e]) => n.has(e)));
}
function Wt(e) {
	try {
		let t = JSON.parse(e);
		return Array.isArray(t) ? t : [];
	} catch {
		return [];
	}
}
function Gt(e) {
	return Wt(e).flatMap((e, t) => e.platform === "sensor" && e.signal ? [{
		index: t,
		name: String(e.name ?? e.key ?? t),
		signal: e.signal
	}] : []);
}
function Kt(e, t, n) {
	let r = Wt(e);
	return r[t] ? (r[t] = {
		...r[t],
		signal: n
	}, JSON.stringify(r, null, 2)) : e;
}
// src/signals/signals.ts
var qt = (1n << 64n) - 1n, Jt = 11400714819323198485n, Yt = 13787848793156543929n, Xt = 10723151780598845931n, Zt = 3600, Qt = 86400, $t = 24, en = .12, tn = [
	[
		7.5,
		1.2,
		.3
	],
	[
		12.5,
		1,
		.25
	],
	[
		19,
		2.2,
		.55
	]
], nn = .12, rn = 600, an = 6, on = 900, sn = .3, cn = 2, ln = 3;
function un(e, t = 0, n = 0) {
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
		values: e.values ?? [],
		weights: e.weights ?? [],
		states: (e.states ?? []).map((e) => [e.value, e.duration_s]),
		seed: t,
		origin: n
	};
}
function dn(e, t) {
	let n = BigInt(e) * Jt + (BigInt(t) & qt) * Yt + Xt & qt;
	return n = (n ^ n >> 30n) * Yt & qt, n = (n ^ n >> 27n) * Xt & qt, n ^= n >> 31n, Number(n >> 11n) / 2 ** 53;
}
function I(e, t) {
	let n = t / e.period_s + e.phase;
	return n - Math.floor(n);
}
function fn(e, t) {
	let n = Math.floor(t), r = t - n, i = r * r * (3 - 2 * r), a = dn(e, n);
	return a + (dn(e, n + 1) - a) * i;
}
function pn(e) {
	return (e % Qt + Qt) % Qt / Zt;
}
function mn(e, t, n) {
	let r = Math.abs(e - t), i = Math.min(r, $t - r);
	return Math.exp(-.5 * (i / n) ** 2);
}
var hn = {
	constant: () => .5,
	sine: (e, t) => .5 + .5 * Math.sin(2 * Math.PI * I(e, t)),
	saw: (e, t) => I(e, t),
	square: (e, t) => +(I(e, t) < .5),
	triangle: (e, t) => 1 - Math.abs(2 * I(e, t) - 1),
	noise: (e, t) => dn(e.seed, Math.floor(t / e.interval_s)),
	random_walk: (e, t) => fn(e.seed, t / e.period_s + e.phase),
	household_load: (e, t) => {
		let n = pn(t);
		return tn.reduce((e, [t, r, i]) => e + i * mn(n, t, r), en) + nn * (fn(e.seed, t / rn) - .5);
	},
	pv_day: (e, t) => {
		let n = (pn(t) - an) / 14;
		if (!(n > 0 && n < 1)) return 0;
		let r = 1 - sn * fn(e.seed, t / on);
		return Math.sin(Math.PI * n) ** 1.5 * r;
	},
	steps: (e, t) => {
		let n = Math.max(cn, Math.round(e.period_s / e.interval_s));
		return Math.min(1, Math.floor(I(e, t) * n) / (n - 1));
	},
	discharge: (e, t) => 1 - I(e, t) ** ln
};
function gn(e, t) {
	let n = e.weights.length ? e.weights : e.values.map(() => 1), r = n.reduce((e, t) => e + t, 0), i = dn(e.seed, Math.floor(t / e.interval_s)) * r, a = 0;
	for (let [t, r] of e.values.entries()) if (a += n[t], i < a) return r;
	return e.values[e.values.length - 1];
}
function _n(e, t) {
	let n = e.states.reduce((e, [, t]) => e + t, 0), r = ((t + e.phase * n) % n + n) % n, i = 0;
	for (let [t, n] of e.states) if (i += n, r < i) return t;
	return e.states[e.states.length - 1][0];
}
var vn = {
	enum: gn,
	state_machine: _n
};
function yn(e) {
	let t = e.shape === "enum" ? e.values : e.states.map(([e]) => e);
	return [...new Set(t)];
}
function bn(e, t) {
	return Number(e.toFixed(t));
}
function xn(e, t) {
	if (e.shape in vn) return vn[e.shape](e, t);
	if (e.shape === "counter") {
		let n = Math.max(0, t - e.origin);
		return bn(e.min + e.rate_per_hour * n / Zt, e.decimals);
	}
	let n = (hn[e.shape] ?? hn.constant)(e, t);
	return e.noise && (n += (dn(e.seed + 1, Math.floor(t)) - .5) * 2 * e.noise), n = Math.min(1, Math.max(0, n)), bn(e.min + n * (e.max - e.min), e.decimals);
}
// src/signals/signal-preview.ts
var Sn = 320, Cn = 80, wn = 96, Tn = 86400, En = class extends w {
	constructor(...e) {
		super(...e), this.unit = "";
	}
	static {
		this.styles = o`
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
	}
	points(e) {
		let t = un(e, 1, 0), n = yn(t), r = Array.from({ length: 97 }, (e, r) => {
			let i = xn(t, r / wn * Tn);
			return typeof i == "string" ? n.indexOf(i) : i;
		}), i = Math.min(...r), a = Math.max(...r) - i || 1;
		return r.map((e, t) => {
			let n = t / wn * Sn, r = 74 - (e - i) / a * 68;
			return `${n.toFixed(1)},${r.toFixed(1)}`;
		}).join(" ");
	}
	render() {
		if (!this.signal) return y``;
		let e = this.signal.shape === "enum" || this.signal.shape === "state_machine", t = e ? yn(un(this.signal)).join(" · ") : "", n = this.signal.min ?? 0, r = this.signal.max ?? 100;
		return y`<svg viewBox="0 0 ${Sn} ${Cn}" role="img">
        ${De`<polyline points=${this.points(this.signal)}></polyline>`}
      </svg>
      <div>${e ? t : `${n} – ${r} ${this.unit}`}</div>`;
	}
};
M([E({ attribute: !1 })], En.prototype, "signal", void 0), M([E()], En.prototype, "unit", void 0), En = M([T("tdc-signal-preview")], En);
// src/signals/curve-editor.ts
var Dn = {
	min: "edMin",
	max: "edMax",
	decimals: "edDecimals",
	period_s: "edPeriod",
	interval_s: "edInterval",
	phase: "edPhase",
	rate_per_hour: "edRate",
	noise: "edNoise"
}, On = {
	values: "edValues",
	weights: "edWeights",
	states: "edStates"
}, kn = class extends N {
	constructor(...e) {
		super(...e), this.shapes = [], this.unit = "";
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent("tdc-signal-change", { detail: e }));
	}
	numberField(e) {
		return y`<label style="flex: 1 1 120px"
      >${this.tr(Dn[e])}
      <input
        type="number"
        step="any"
        .value=${this.signal[e] === void 0 ? "" : String(this.signal[e])}
        @input=${(t) => this.emit(Rt(this.signal, e, t.target.value))}
      />
    </label>`;
	}
	listField(e) {
		return this.textField(this.tr(On[e]), Bt(this.signal, e), (t) => this.emit(Vt(this.signal, e, t)), { flex: "1 1 240px" });
	}
	render() {
		return y`
      <div class="row form">
        <label style="flex: 1 1 180px"
          >${this.tr("edShape")}
          <select
            @change=${(e) => this.emit(Ut(this.signal, e.target.value))}
          >
            ${j(this.hass?.language, this.shapes, (e) => k(this.hass?.language, "shape", e)).map((e) => y`<option value=${e} ?selected=${e === this.signal.shape}>
                  ${k(this.hass?.language, "shape", e)}
                </option>`)}
          </select>
        </label>
        ${Ft(this.signal.shape) ? "" : y`${this.numberField("min")} ${this.numberField("max")}
              ${this.numberField("decimals")}`}
      </div>
      <div class="row form">
        ${It(this.signal.shape).map((e) => this.numberField(e))}
        ${Lt(this.signal.shape).map((e) => this.listField(e))}
      </div>
      <tdc-signal-preview .signal=${this.signal} unit=${this.unit}></tdc-signal-preview>
    `;
	}
};
M([E({ attribute: !1 })], kn.prototype, "signal", void 0), M([E({ attribute: !1 })], kn.prototype, "shapes", void 0), M([E()], kn.prototype, "unit", void 0), kn = M([T("tdc-curve-editor")], kn);
// node_modules/lit-html/directives/live.js
var An = lt(class extends ut {
	constructor(e) {
		if (super(e), e.type !== P.PROPERTY && e.type !== P.ATTRIBUTE && e.type !== P.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
		if (!pt(e)) throw Error("`live` bindings can only contain a single expression");
	}
	render(e) {
		return e;
	}
	update(e, [t]) {
		if (t === b || t === x) return t;
		let n = e.element, r = e.name;
		if (e.type === P.PROPERTY) {
			if (t === n[r]) return b;
		} else if (e.type === P.BOOLEAN_ATTRIBUTE) {
			if (!!t === n.hasAttribute(r)) return b;
		} else if (e.type === P.ATTRIBUTE && n.getAttribute(r) === t + "") return b;
		return _t(e), t;
	}
});
// src/common/multi-select.ts
function jn(e, t, n) {
	let r = t.trim();
	if (!r) return e;
	let i = e.filter((e) => e !== r);
	return n ? [...i, r] : i;
}
var L = class extends Ot {
	constructor(...e) {
		super(...e), this.items = [], this.selected = [], this.allowAdd = !1, this.empty = "", this.draft = "";
	}
	static {
		this.styles = [
			N.styles,
			Dt,
			o`
      :host {
        display: block;
        position: relative;
      }
      button.trigger {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        width: 100%;
        min-height: 36px;
        text-align: left;
      }
      .summary {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .empty {
        color: var(--secondary-text-color);
      }
      .add {
        flex-wrap: nowrap;
        padding: 4px 8px 8px;
        border-bottom: 1px solid var(--divider-color);
      }
      label.option {
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        font-size: 1em;
        color: var(--primary-text-color);
        cursor: pointer;
      }
      label.option:hover {
        background: var(--secondary-background-color);
      }
      label.option input {
        width: auto;
        min-height: 0;
      }
    `
		];
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent("tdc-select-change", { detail: e }));
	}
	add() {
		this.emit(jn(this.selected, this.draft, !0)), this.draft = "";
	}
	options() {
		let e = new Set(this.items.map((e) => e.value)), t = this.selected.filter((t) => !e.has(t)).map((e) => ({
			value: e,
			label: e
		}));
		return j(this.hass?.language, [...this.items, ...t], (e) => e.label);
	}
	renderAdd() {
		return y`<div class="row add">
      <input
        .value=${An(this.draft)}
        placeholder=${this.tr("areasAdd")}
        @input=${(e) => this.draft = e.target.value}
        @keydown=${(e) => {
			e.key === "Enter" && this.add();
		}}
      />
      <button ?disabled=${!this.draft.trim()} @click=${() => this.add()}>
        ${this.tr("areasAddButton")}
      </button>
    </div>`;
	}
	render() {
		let e = this.options(), t = this.selected.map((t) => e.find((e) => e.value === t)?.label ?? t);
		return y`
      <button
        class="trigger"
        aria-haspopup="listbox"
        aria-expanded=${this.open ? "true" : "false"}
        @click=${() => this.open = !this.open}
      >
        ${t.length ? y`<span class="summary">${t.join(", ")}</span>` : y`<span class="summary empty">${this.empty || this.tr("areasNone")}</span>`}
        <span>▾</span>
      </button>
      ${this.open ? y`<div class="popover" popover="manual" role="listbox" aria-multiselectable="true">
              ${this.allowAdd ? this.renderAdd() : ""}
              ${e.map((e) => y`<label class="option">
                    <input
                      type="checkbox"
                      .checked=${this.selected.includes(e.value)}
                      @change=${(t) => this.emit(jn(this.selected, e.value, t.target.checked))}
                    />
                    ${e.label}
                  </label>`)}
            </div>` : ""}
    `;
	}
};
M([E({ attribute: !1 })], L.prototype, "items", void 0), M([E({ attribute: !1 })], L.prototype, "selected", void 0), M([E({ type: Boolean })], L.prototype, "allowAdd", void 0), M([E()], L.prototype, "empty", void 0), M([D()], L.prototype, "draft", void 0), L = M([T("tdc-multi-select")], L);
// src/devices/helpers.ts
var Mn = {
	set_brightness: {
		param: "brightness",
		min: 0,
		max: 255,
		start: 128
	},
	set_position: {
		param: "position",
		min: 0,
		max: 100,
		start: 50
	},
	set_temperature: {
		param: "temperature",
		min: 5,
		max: 30,
		start: 21
	}
}, Nn = "fault_";
function Pn(e, t) {
	let n = e[t] ?? [];
	return {
		plain: n.filter((e) => !e.startsWith("fault_") && !(e in Mn)),
		withValue: n.filter((e) => e in Mn),
		faults: n.filter((e) => e.startsWith(Nn)).map((e) => e.slice(6))
	};
}
function Fn(e, t) {
	let n = Mn[e], r = Number(t);
	if (n && t.trim() !== "" && !Number.isNaN(r) && !(r < n.min || r > n.max)) return { [n.param]: r };
}
function In(e) {
	let t = Number(e);
	return e.trim() !== "" && t > 0 ? { duration_s: t } : void 0;
}
function Ln(e, t) {
	let n = [...Object.values(e ?? {}).map((e) => e.name), ...t.flatMap((e) => e.area ? [e.area] : [])];
	return [...new Set(n)].sort((e, t) => e.localeCompare(t));
}
// src/wizard/helpers.ts
function Rn(e, t) {
	return Math.round(e / Math.max(1, t) * 10) / 10;
}
// src/wizard/creation-wizard.ts
var R = "custom", zn = 50, Bn = ["even", "random"], Vn = {
	even: "modeEven",
	random: "modeRandom"
}, Hn = JSON.stringify([{
	key: "level",
	platform: "sensor",
	name: "Level",
	unit: "%",
	signal: {
		shape: "sine",
		min: 0,
		max: 100
	}
}], null, 2), z = class extends N {
	constructor(...e) {
		super(...e), this.templates = [], this.template = "", this.count = 10, this.pattern = "{template} {nn}", this.areas = [], this.mode = "even", this.seed = "", this.output = "native", this.custom = Hn, this.editIndex = -1, this.busy = !1, this.message = "", this.error = "";
	}
	async connectedCallback() {
		super.connectedCallback();
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.template = this.templates[0]?.id ?? R;
		} catch (e) {
			this.error = O(e);
		}
	}
	entities() {
		if (this.template === R) try {
			return JSON.parse(this.custom);
		} catch {
			return [];
		}
		return this.templates.find((e) => e.id === this.template)?.entities ?? [];
	}
	changeSignal(e, t) {
		this.custom = Kt(this.custom, e, t.detail);
	}
	renderEditor() {
		let e = Gt(this.custom), t = e.find((e) => e.index === this.editIndex) ?? e[0];
		return t ? y`<h3>${this.tr("edSensor")}</h3>
      <p>
        <select
          @change=${(e) => this.editIndex = Number(e.target.value)}
        >
          ${j(this.hass?.language, e, (e) => e.name).map((e) => y`<option value=${e.index} ?selected=${e.index === t.index}>
                ${e.name}
              </option>`)}
        </select>
      </p>
      <tdc-curve-editor
        .hass=${this.hass}
        .signal=${t.signal}
        .shapes=${this.info?.shapes ?? []}
        @tdc-signal-change=${(e) => this.changeSignal(t.index, e)}
      ></tdc-curve-editor>` : y``;
	}
	async submit() {
		this.busy = !0, this.message = "", this.error = "";
		let e = {
			template: this.template,
			count: this.count,
			name_pattern: this.pattern,
			areas: this.areas,
			area_mode: this.mode,
			output: this.output,
			...this.seed ? { seed: this.seed } : {},
			...this.template === R ? { entities: this.entities() } : {}
		};
		try {
			let t = await this.api.create(e);
			this.message = this.tr("created", { count: t.devices }), this.dispatchEvent(new CustomEvent("tdc-created"));
		} catch (e) {
			this.error = O(e);
		}
		this.busy = !1;
	}
	renderEstimate() {
		let e = this.entities(), t = Rn(e.filter((e) => e.platform === "sensor").length * this.count, this.info?.tick_seconds ?? 10);
		return y`<p>
      <small>${this.tr("estimate", {
			entities: e.length * this.count,
			rate: t
		})}</small>
      ${t > zn ? y`<br /><span class="warning">${this.tr("rateWarning")}</span>` : ""}
    </p>`;
	}
	templateOptions() {
		let e = this.hass?.language;
		return j(e, [...this.templates.map((t) => ({
			id: t.id,
			label: it(e, t.id, t.name)
		})), {
			id: R,
			label: this.tr("customTemplate")
		}], (e) => e.label);
	}
	render() {
		let e = this.entities().find((e) => e.platform === "sensor" && e.signal);
		return y`
      <div class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr("template")}
          <select @change=${(e) => this.template = e.target.value}>
            ${this.templateOptions().map((e) => y`<option value=${e.id} ?selected=${e.id === this.template}>
                  ${e.label}
                </option>`)}
          </select>
        </label>
        <label style="flex: 0 0 100px"
          >${this.tr("count")}
          <input
            type="number"
            min="1"
            .value=${String(this.count)}
            @input=${(e) => this.count = Number(e.target.value)}
          />
        </label>
      </div>
      <p class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr("namePattern")}
          <input
            .value=${this.pattern}
            @input=${(e) => this.pattern = e.target.value}
          />
          <small>${this.tr("namePatternHint")}</small>
        </label>
        <label style="flex: 1 1 220px"
          >${this.tr("areas")}
          <tdc-multi-select
            .hass=${this.hass}
            .items=${Ln(this.hass?.areas, []).map((e) => ({
			value: e,
			label: e
		}))}
            allowAdd
            .selected=${this.areas}
            @tdc-select-change=${(e) => this.areas = e.detail}
          ></tdc-multi-select>
          <small>${this.tr("areasHint")}</small>
        </label>
        <label style="flex: 0 0 160px"
          >${this.tr("areaMode")}
          <select
            @change=${(e) => this.mode = e.target.value}
          >
            ${j(this.hass?.language, Bn, (e) => this.tr(Vn[e])).map((e) => y`<option value=${e} ?selected=${e === this.mode}>
                  ${this.tr(Vn[e])}
                </option>`)}
          </select>
        </label>
        ${this.select(this.tr("colOutput"), this.info?.outputs ?? ["native"], this.output, (e) => this.tr(tt[e] ?? "outputNative"), (e) => this.output = e)}
        <label style="flex: 0 0 160px"
          >${this.tr("seed")}
          <input
            .value=${this.seed}
            @input=${(e) => this.seed = e.target.value}
          />
          <small>${this.tr("seedHint")}</small>
        </label>
      </p>
      ${this.template === R ? y`<label
              >${this.tr("customEntities")}
              <textarea
                rows="8"
                .value=${this.custom}
                @input=${(e) => this.custom = e.target.value}
              ></textarea>
            </label>` : ""}
      ${this.template === R ? this.renderEditor() : ""}
      ${e?.signal && this.template !== R ? y`<p>
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
M([D()], z.prototype, "info", void 0), M([D()], z.prototype, "templates", void 0), M([D()], z.prototype, "template", void 0), M([D()], z.prototype, "count", void 0), M([D()], z.prototype, "pattern", void 0), M([D()], z.prototype, "areas", void 0), M([D()], z.prototype, "mode", void 0), M([D()], z.prototype, "seed", void 0), M([D()], z.prototype, "output", void 0), M([D()], z.prototype, "custom", void 0), M([D()], z.prototype, "editIndex", void 0), M([D()], z.prototype, "busy", void 0), M([D()], z.prototype, "message", void 0), M([D()], z.prototype, "error", void 0), z = M([T("tdc-creation-wizard")], z);
// src/devices/device-detail.ts
var B = class extends N {
	constructor(...e) {
		super(...e), this.actions = {}, this.areas = [], this.shapes = [], this.picked = {}, this.inputs = {}, this.curves = {}, this.busy = !1, this.error = "";
	}
	static {
		this.styles = [N.styles, o`
      :host {
        padding: 8px 0 12px;
        container-type: inline-size;
      }
      td {
        vertical-align: middle;
      }
      input[type='number'] {
        width: 80px;
      }
      select {
        width: auto;
      }
      .area-row {
        align-items: flex-end;
      }
      .area-row small {
        padding-bottom: 8px;
      }
      .curve {
        padding: 4px 0 8px;
      }
      @container (max-width: 560px) {
        table,
        tbody {
          display: block;
        }
        tr:first-child {
          display: none;
        }
        tr {
          display: flex;
          flex-wrap: wrap;
          column-gap: 12px;
          border-bottom: 1px solid var(--divider-color);
        }
        td {
          border-bottom: 0;
        }
        td:last-child {
          flex: 1 1 100%;
        }
      }
    `];
	}
	async run(e) {
		this.busy = !0, this.error = "";
		try {
			await e(), this.dispatchEvent(new CustomEvent("tdc-changed", {
				bubbles: !0,
				composed: !0
			}));
		} catch (e) {
			this.error = O(e);
		}
		this.busy = !1;
	}
	async saveArea() {
		let e = (this.areaDraft ?? this.device.area ?? "").trim();
		await this.run(async () => {
			await this.api.updateDevice(this.device.id, e || null), this.areaDraft = void 0;
		});
	}
	openCurve(e) {
		e.signal && (this.curves = {
			...this.curves,
			[e.key]: { ...e.signal }
		});
	}
	closeCurve(e) {
		let t = { ...this.curves };
		delete t[e.key], this.curves = t;
	}
	async saveCurve(e) {
		let t = this.curves[e.key];
		await this.run(async () => {
			await this.api.setSignal(this.device.id, e.key, t), this.closeCurve(e);
		});
	}
	fire(e, t, n) {
		return this.run(() => this.api.fire(this.device.id, e.key, t, n));
	}
	renderArea() {
		let e = this.areaDraft ?? this.device.area ?? "", t = e.trim() !== (this.device.area ?? "");
		return y`<div class="row area-row">
      <label style="flex: 0 1 320px"
        >${this.tr("detArea")}
        <input
          list="tdc-areas"
          .value=${e}
          placeholder=${this.tr("detAreaNone")}
          @input=${(e) => this.areaDraft = e.target.value}
        />
        <datalist id="tdc-areas">
          ${this.areas.map((e) => y`<option value=${e}></option>`)}
        </datalist>
      </label>
      <button
        class="primary"
        ?disabled=${this.busy || !t}
        @click=${() => void this.saveArea()}
      >
        ${this.tr("detSaveArea")}
      </button>
      <small>${this.tr("detAreaHint")}</small>
    </div>`;
	}
	menuItems(e) {
		let t = this.hass?.language, n = Pn(this.actions, e.platform);
		return j(t, [
			...n.plain,
			...n.withValue,
			...n.faults.map((e) => `${Nn}${e}`)
		], (e) => A(t, e)).map((e) => ({
			value: e,
			label: A(t, e)
		}));
	}
	pick(e, t) {
		t in Mn || t.startsWith("fault_") ? this.picked = {
			...this.picked,
			[e.key]: t
		} : this.fire(e, t);
	}
	cancelPick(e) {
		let t = { ...this.picked };
		delete t[e.key], this.picked = t;
	}
	renderPicked(e) {
		let t = this.picked[e.key];
		if (!t) return "";
		let n = Mn[t], r = `${e.key}:${t}`, i = this.inputs[r] ?? String(n ? n.start : 60), a = n ? Fn(t, i) : In(i);
		return y`<span class="row">
      <strong>${A(this.hass?.language, t)}</strong>
      <input
        type="number"
        min=${n ? n.min : 1}
        max=${n ? n.max : x}
        .value=${i}
        title=${n ? `${n.min} – ${n.max}` : this.tr("detSeconds")}
        @input=${(e) => this.inputs = {
			...this.inputs,
			[r]: e.target.value
		}}
      />
      <small>${n ? `${n.min} – ${n.max}` : this.tr("detSeconds")}</small>
      <button
        class="primary"
        ?disabled=${this.busy || !a}
        @click=${async () => {
			await this.fire(e, t, a), this.error || this.cancelPick(e);
		}}
      >
        ${this.tr("detRun")}
      </button>
      <button ?disabled=${this.busy} @click=${() => this.cancelPick(e)}>
        ${this.tr("detCancel")}
      </button>
    </span>`;
	}
	renderCurve(e) {
		return y`<tr>
      <td colspan="3" class="curve">
        <tdc-curve-editor
          .hass=${this.hass}
          .signal=${this.curves[e.key]}
          .shapes=${this.shapes.filter((e) => !Ft(e))}
          unit=${e.unit ?? ""}
          @tdc-signal-change=${(t) => this.curves = {
			...this.curves,
			[e.key]: t.detail
		}}
        ></tdc-curve-editor>
        <p class="row">
          <button
            class="primary"
            ?disabled=${this.busy}
            @click=${() => void this.saveCurve(e)}
          >
            ${this.tr("detSaveCurve")}
          </button>
          <button ?disabled=${this.busy} @click=${() => this.closeCurve(e)}>
            ${this.tr("detCancel")}
          </button>
        </p>
      </td>
    </tr>`;
	}
	renderEntity(e) {
		let t = this.hass?.language, n = this.menuItems(e), r = e.signal != null && !Ft(e.signal.shape);
		return y`<tr>
        <td>
          ${at(t, e.key, e.name)}<br /><small
            >${k(t, "platform", e.platform)}</small
          >
        </td>
        <td>
          ${ot(t, e.state)}${e.unit ? ` ${e.unit}` : ""}${e.fault ? y`<br /><small class="warning">⚠ ${k(t, "fault", e.fault)}</small>` : ""}
        </td>
        <td class="row">
          ${n.length ? y`<tdc-menu-button
                  .hass=${this.hass}
                  label=${this.tr("detActions")}
                  ?disabled=${this.busy}
                  .items=${n}
                  @tdc-pick=${(t) => this.pick(e, t.detail)}
                ></tdc-menu-button>` : ""}
          ${this.renderPicked(e)}
          ${r ? y`<button
                  ?disabled=${this.busy || e.key in this.curves}
                  @click=${() => this.openCurve(e)}
                >
                  ${this.tr("detCurve")}
                </button>` : ""}
        </td>
      </tr>
      ${e.key in this.curves ? this.renderCurve(e) : ""}`;
	}
	render() {
		return y`
      ${this.renderArea()}
      <table>
        <tr>
          <th>${this.tr("detEntity")}</th>
          <th>${this.tr("detState")}</th>
          <th>${this.tr("colActions")}</th>
        </tr>
        ${this.device.entities.map((e) => this.renderEntity(e))}
      </table>
      <p class="error">${this.error}</p>
    `;
	}
};
M([E({ attribute: !1 })], B.prototype, "device", void 0), M([E({ attribute: !1 })], B.prototype, "actions", void 0), M([E({ attribute: !1 })], B.prototype, "areas", void 0), M([E({ attribute: !1 })], B.prototype, "shapes", void 0), M([D()], B.prototype, "areaDraft", void 0), M([D()], B.prototype, "picked", void 0), M([D()], B.prototype, "inputs", void 0), M([D()], B.prototype, "curves", void 0), M([D()], B.prototype, "busy", void 0), M([D()], B.prototype, "error", void 0), B = M([T("tdc-device-detail")], B);
// src/devices/device-list.ts
var Un = 200, Wn = 1e4, Gn = {
	switch: "toggle",
	event: "press",
	binary_sensor: "pulse",
	light: "toggle"
}, Kn = "fire:", qn = "remove", Jn = [
	"sensor",
	"switch",
	"binary_sensor",
	"light",
	"cover",
	"climate"
], V = class extends N {
	constructor(...e) {
		super(...e), this.devices = [], this.total = 0, this.loaded = !1, this.error = "", this.creating = !1, this.expanded = /* @__PURE__ */ new Set();
	}
	static {
		this.styles = [
			N.styles,
			st,
			o`
      tr.device {
        cursor: pointer;
      }
      td.nowrap {
        white-space: nowrap;
      }
      td.nowrap.row {
        flex-wrap: nowrap;
      }
      td.values {
        width: 100%;
      }
      @container (max-width: 760px) {
        table.cards tr.card > td.nowrap {
          white-space: normal;
        }
        td.values {
          width: auto;
        }
      }
      tr.device:hover {
        background: var(--secondary-background-color);
      }
    `
		];
	}
	connectedCallback() {
		super.connectedCallback(), this.loadInfo(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), Wn);
	}
	disconnectedCallback() {
		window.clearInterval(this.timer), super.disconnectedCallback();
	}
	async loadInfo() {
		try {
			this.info = await this.api.info();
		} catch (e) {
			this.error = O(e);
		}
	}
	toggle(e) {
		let t = new Set(this.expanded);
		t.delete(e) || t.add(e), this.expanded = t;
	}
	async refresh(e = !1) {
		let t = Math.max(Un, this.devices.length + (e ? Un : 0));
		try {
			let e = await this.api.devices(0, t);
			this.devices = e.devices, this.total = e.total, this.error = "";
		} catch (e) {
			this.error = O(e);
		}
		this.loaded = !0;
	}
	async fire(e, t) {
		try {
			await this.api.fire(e.id, t.key, Gn[t.platform]), await this.refresh();
		} catch (e) {
			this.error = O(e);
		}
	}
	menuItems(e) {
		let t = this.hass?.language;
		return j(t, [...e.entities.filter((e) => e.platform in Gn).map((e) => ({
			value: `${Kn}${e.key}`,
			label: `${at(t, e.key, e.name)} – ${A(t, Gn[e.platform])}`
		})), {
			value: qn,
			label: this.tr("remove")
		}], (e) => e.label);
	}
	pick(e, t) {
		if (t === qn) {
			this.dispatchEvent(new CustomEvent("tdc-remove", { detail: {
				target: "device",
				id: e.id
			} }));
			return;
		}
		let n = e.entities.find((e) => `${Kn}${e.key}` === t);
		n && this.fire(e, n);
	}
	values(e) {
		let t = this.hass?.language;
		return e.entities.filter((e) => Jn.includes(e.platform)).slice(0, 4).map((e) => {
			let n = e.unit ? ` ${e.unit}` : "", r = e.fault ? ` ⚠ ${k(t, "fault", e.fault)}` : "";
			return `${at(t, e.key, e.name)}: ${ot(t, e.state)}${n}${r}`;
		}).join(" · ");
	}
	templateName(e) {
		return e.template === "custom" ? this.tr("customTemplate") : it(this.hass?.language, e.template, e.model);
	}
	renderRow(e) {
		let t = this.expanded.has(e.id);
		return y`<tr class="device card" @click=${() => this.toggle(e.id)}>
        <td class="name nowrap">${t ? "▾" : "▸"} ${e.name}</td>
        <td class="nowrap" data-label=${this.tr("colTemplate")}>${this.templateName(e)}</td>
        <td class="nowrap" data-label=${this.tr("colArea")}>${e.area ?? "–"}</td>
        <td class="nowrap" data-label=${this.tr("colOutput")}>
          ${this.tr(tt[e.output] ?? "outputNative")}
        </td>
        <td class="values" data-label=${this.tr("colValues")}>
          <small>${this.values(e)}</small>
        </td>
        <td class="row nowrap" data-label=${this.tr("colActions")}>
          <tdc-menu-button
            .hass=${this.hass}
            label=${this.tr("colActions")}
            .items=${this.menuItems(e)}
            @click=${(e) => e.stopPropagation()}
            @tdc-pick=${(t) => this.pick(e, t.detail)}
          ></tdc-menu-button>
        </td>
      </tr>
      ${t ? y`<tr>
              <td colspan="6">
                <tdc-device-detail
                  .hass=${this.hass}
                  .device=${e}
                  .actions=${this.info?.actions ?? {}}
                  .shapes=${this.info?.shapes ?? []}
                  .areas=${Ln(this.hass.areas, this.devices)}
                  @tdc-changed=${() => void this.refresh()}
                ></tdc-device-detail>
              </td>
            </tr>` : ""}`;
	}
	renderNew() {
		return y`
      <p>
        <button class="primary" @click=${() => this.creating = !0}>
          + ${this.tr("create")}
        </button>
      </p>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr("create")}
        ?open=${this.creating}
        @tdc-close=${() => this.creating = !1}
      >
        ${this.creating ? y`<tdc-creation-wizard
                .hass=${this.hass}
                @tdc-created=${() => {
			this.creating = !1, this.refresh();
		}}
              ></tdc-creation-wizard>` : x}
      </tdc-dialog>
    `;
	}
	render() {
		return this.loaded ? y`
      ${this.renderNew()} ${this.error ? y`<p class="error">${this.error}</p>` : ""}
      ${this.devices.length === 0 ? y`<p>${this.tr("noDevices")}</p>` : y`<table class="cards">
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
                  ${xt(this.devices, (e) => e.id, (e) => this.renderRow(e))}
                </tbody>
              </table>
              <p class="row">
                <small>
                  ${this.tr("devicesOf", {
			shown: this.devices.length,
			total: this.total
		})}
                </small>
                ${this.devices.length < this.total ? y`<button @click=${() => void this.refresh(!0)}>
                        ${this.tr("loadMore")}
                      </button>` : ""}
              </p>`}
    ` : y`${this.tr("loading")}`;
	}
};
M([D()], V.prototype, "devices", void 0), M([D()], V.prototype, "total", void 0), M([D()], V.prototype, "loaded", void 0), M([D()], V.prototype, "error", void 0), M([D()], V.prototype, "creating", void 0), M([D()], V.prototype, "info", void 0), M([D()], V.prototype, "expanded", void 0), V = M([T("tdc-device-list")], V);
// src/common/polling.ts
var Yn = 1e4, H = class extends N {
	constructor(...e) {
		super(...e), this.templates = [], this.message = "", this.error = "", this.busy = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this.loadOptions(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), Yn);
	}
	disconnectedCallback() {
		window.clearInterval(this.timer), super.disconnectedCallback();
	}
	async loadOptions() {
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.optionsLoaded(this.info);
		} catch (e) {
			this.error = O(e);
		}
	}
	async run(e) {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let t = await e();
			this.message = typeof t == "string" ? t : "", await this.refresh();
		} catch (e) {
			this.error = O(e);
		}
		this.busy = !1;
	}
};
M([D()], H.prototype, "info", void 0), M([D()], H.prototype, "templates", void 0), M([D()], H.prototype, "message", void 0), M([D()], H.prototype, "error", void 0), M([D()], H.prototype, "busy", void 0);
// src/group/group-form.ts
var U = class extends N {
	constructor(...e) {
		super(...e), this.devices = [], this.submitLabel = "", this.busy = !1, this.name = "", this.members = [];
	}
	willUpdate(e) {
		this.group && this.loadedId !== this.group.id && (this.loadedId = this.group.id, this.name = this.group.name, this.members = [...this.group.members]), super.willUpdate(e);
	}
	reset() {
		this.name = "", this.members = [];
	}
	submit() {
		this.dispatchEvent(new CustomEvent("tdc-submit", { detail: {
			name: this.name.trim(),
			members: this.members
		} }));
	}
	render() {
		return y`
      <div class="fields">
        ${this.textField(this.tr("colName"), this.name, (e) => this.name = e)}
        <label
          >${this.tr("grpMembers")}
          <tdc-multi-select
            .hass=${this.hass}
            .items=${this.devices}
            .selected=${this.members}
            empty=${this.tr("pickOne")}
            @tdc-select-change=${(e) => this.members = e.detail}
          ></tdc-multi-select>
          ${this.devices.length === 0 ? y`<small>${this.tr("grpNoDevices")}</small>` : x}
        </label>
      </div>
      <p class="row">
        <button
          class="primary"
          ?disabled=${this.busy || !this.name.trim() || this.members.length === 0}
          @click=${() => this.submit()}
        >
          ${this.submitLabel}
        </button>
        ${this.group ? y`<button
                ?disabled=${this.busy}
                @click=${() => this.dispatchEvent(new CustomEvent("tdc-cancel"))}
              >
                ${this.tr("detCancel")}
              </button>` : x}
      </p>
    `;
	}
};
M([E({ attribute: !1 })], U.prototype, "devices", void 0), M([E({ attribute: !1 })], U.prototype, "group", void 0), M([E()], U.prototype, "submitLabel", void 0), M([E({ type: Boolean })], U.prototype, "busy", void 0), M([D()], U.prototype, "name", void 0), M([D()], U.prototype, "members", void 0), U = M([T("tdc-group-form")], U);
// src/group/group-panel.ts
var Xn = 500, Zn = "z2m", W = class extends H {
	constructor(...e) {
		super(...e), this.groups = [], this.devices = [], this.expanded = /* @__PURE__ */ new Set(), this.creating = !1;
	}
	static {
		this.styles = [
			N.styles,
			st,
			o`
      tr.group {
        cursor: pointer;
      }
      tr.group:hover {
        background: var(--secondary-background-color);
      }
    `
		];
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			let [e, t] = await Promise.all([this.api.groups(), this.api.devices(0, Xn)]);
			this.groups = e, this.devices = t.devices;
		} catch (e) {
			this.error = O(e);
		}
	}
	members() {
		return this.devices.filter((e) => e.output === Zn).map((e) => ({
			value: e.id,
			label: e.name
		}));
	}
	memberNames(e) {
		let t = new Map(this.devices.map((e) => [e.id, e.name]));
		return e.members.map((e) => t.get(e) ?? e).join(", ");
	}
	async add(e) {
		await this.run(async () => {
			await this.api.addGroup(e.name, e.members), this.newForm?.reset(), this.creating = !1;
		});
	}
	async save(e, t) {
		await this.run(async () => {
			await this.api.updateGroup(e.id, t.name, t.members), this.toggle(e.id);
		});
	}
	toggle(e) {
		let t = new Set(this.expanded);
		t.delete(e) || t.add(e), this.expanded = t;
	}
	renderNew() {
		return y`
      <p>
        <button class="primary" @click=${() => this.creating = !0}>
          + ${this.tr("grpNew")}
        </button>
      </p>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr("grpNew")}
        ?open=${this.creating}
        @tdc-close=${() => this.creating = !1}
      >
        <tdc-group-form
          id="new"
          .hass=${this.hass}
          .devices=${this.members()}
          submitLabel=${this.tr("grpAdd")}
          ?busy=${this.busy}
          @tdc-submit=${(e) => void this.add(e.detail)}
        ></tdc-group-form>
      </tdc-dialog>
    `;
	}
	renderRow(e) {
		let t = this.expanded.has(e.id);
		return y`<tr class="group card" @click=${() => this.toggle(e.id)}>
        <td class="name">
          ${t ? "▾" : "▸"} ${e.name}<br /><small
            >${this.tr("grpNumber", { number: e.number })}</small
          >
        </td>
        <td data-label=${this.tr("grpMembers")}>${this.memberNames(e)}</td>
        <td data-label=${this.tr("colActions")}>
          <button
            ?disabled=${this.busy}
            @click=${(t) => {
			t.stopPropagation(), this.run(() => this.api.removeGroup(e.id));
		}}
          >
            ${this.tr("remove")}
          </button>
        </td>
      </tr>
      ${t ? y`<tr>
              <td colspan="3">
                <tdc-group-form
                  .hass=${this.hass}
                  .devices=${this.members()}
                  .group=${e}
                  submitLabel=${this.tr("schSave")}
                  ?busy=${this.busy}
                  @tdc-submit=${(t) => void this.save(e, t.detail)}
                  @tdc-cancel=${() => this.toggle(e.id)}
                ></tdc-group-form>
              </td>
            </tr>` : x}`;
	}
	render() {
		return y`
      ${this.renderNew()}
      ${this.groups.length === 0 ? y`<p>${this.tr("grpNone")}</p>` : y`<table class="cards">
              <tr>
                <th>${this.tr("colName")}</th>
                <th>${this.tr("grpMembers")}</th>
                <th>${this.tr("colActions")}</th>
              </tr>
              ${xt(this.groups, (e) => e.id, (e) => this.renderRow(e))}
            </table>`}
      <p class="error">${this.error}</p>
    `;
	}
};
M([D()], W.prototype, "groups", void 0), M([D()], W.prototype, "devices", void 0), M([D()], W.prototype, "expanded", void 0), M([D()], W.prototype, "creating", void 0), M([qe("tdc-group-form#new")], W.prototype, "newForm", void 0), W = M([T("tdc-group-panel")], W);
function Qn(e) {
	return Math.min(365, Math.max(1, Math.round(e) || 1));
}
// src/history/history-panel.ts
var G = class extends N {
	constructor(...e) {
		super(...e), this.days = 7, this.device = "", this.entity = "", this.busy = !1, this.message = "", this.error = "";
	}
	async importHistory() {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let e = await this.api.importHistory(Qn(this.days), this.device.trim() || void 0, this.entity.trim() || void 0);
			this.message = this.tr("histDone", { ...e });
		} catch (e) {
			this.error = O(e);
		}
		this.busy = !1;
	}
	render() {
		return y`
      <p>${this.tr("histIntro")}</p>
      <div class="row">
        <label style="flex: 0 1 180px"
          >${this.tr("histDays")}
          <input
            type="number"
            min=${1}
            max=${365}
            .value=${String(this.days)}
            @input=${(e) => this.days = Number(e.target.value)}
          />
        </label>
        ${this.textField(this.tr("histDevice"), this.device, (e) => this.device = e)}
        ${this.textField(this.tr("histEntity"), this.entity, (e) => this.entity = e)}
        <button class="primary" ?disabled=${this.busy} @click=${() => void this.importHistory()}>
          ${this.tr("histImport")}
        </button>
      </div>
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
M([D()], G.prototype, "days", void 0), M([D()], G.prototype, "device", void 0), M([D()], G.prototype, "entity", void 0), M([D()], G.prototype, "busy", void 0), M([D()], G.prototype, "message", void 0), M([D()], G.prototype, "error", void 0), G = M([T("tdc-history-panel")], G);
// src/common/targets.ts
function $n(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = t.get(n.run_id);
		e ? (e.count += 1, e.created = Math.min(e.created, n.created_at)) : t.set(n.run_id, {
			id: n.run_id,
			created: n.created_at,
			count: 1,
			template: n.template,
			model: n.model
		});
	}
	return [...t.values()];
}
function er(e) {
	let t = /* @__PURE__ */ new Date(e * 1e3), n = (e) => String(e).padStart(2, "0");
	return `${`${t.getFullYear()}-${n(t.getMonth() + 1)}-${n(t.getDate())}`} ${n(t.getHours())}:${n(t.getMinutes())}`;
}
function tr(e, t, n) {
	return `${er(e.created)} · ${it(t, e.template, e.model)} · ${n(e.count)}`;
}
function nr(e, t, n, r, i) {
	return j(r, e === "device" ? t.map((e) => ({
		value: e.id,
		label: e.name
	})) : e === "template" ? n.map((e) => ({
		value: e.id,
		label: it(r, e.id, e.name)
	})) : $n(t).map((e) => ({
		value: e.id,
		label: tr(e, r, i)
	})), (e) => e.label);
}
function rr(e, t, n, r, i, a) {
	return e === "device" ? n.find((e) => e.id === t || e.name === t)?.name ?? t : nr(e, n, r, i, a).find((e) => e.value === t)?.label ?? t;
}
function ir(e, t, n) {
	return e === "device" ? n.find((e) => e.id === t || e.name === t)?.id ?? t : t;
}
// src/common/target-select.ts
var ar = 500, or = {
	device: "schTarget_device",
	template: "schTarget_template",
	run: "schTarget_run"
}, K = class extends N {
	constructor(...e) {
		super(...e), this.kind = "device", this.values = [], this.multiple = !1, this.templates = [], this.devices = [], this.error = "";
	}
	willUpdate(e) {
		e.has("kind") && this.kind !== "template" && this.loadDevices(), super.willUpdate(e);
	}
	async loadDevices() {
		try {
			this.devices = (await this.api.devices(0, ar)).devices, this.error = "";
		} catch (e) {
			this.error = O(e);
		}
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent("tdc-target-change", { detail: e }));
	}
	renderSingle(e, t) {
		let n = t === "" || e.some((e) => e.value === t);
		return y`<select
      @change=${(e) => {
			let t = e.target.value;
			this.emit(t ? [t] : []);
		}}
    >
      <option value="" ?selected=${t === ""}>${this.tr("pickOne")}</option>
      ${n ? "" : y`<option value=${t} selected>${t}</option>`}
      ${e.map((e) => y`<option value=${e.value} ?selected=${e.value === t}>
            ${e.label}
          </option>`)}
    </select>`;
	}
	render() {
		let e = nr(this.kind, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e })), t = this.values.map((e) => ir(this.kind, e, this.devices));
		return y`<label>
      ${this.tr(or[this.kind])}
      ${this.multiple && this.kind === "device" ? y`<tdc-multi-select
              .hass=${this.hass}
              .items=${e}
              .selected=${t}
              empty=${this.tr("pickOne")}
              @tdc-select-change=${(e) => this.emit(e.detail)}
            ></tdc-multi-select>` : this.renderSingle(e, t[0] ?? "")}
      ${this.error ? y`<small class="error">${this.error}</small>` : ""}
    </label>`;
	}
};
M([E()], K.prototype, "kind", void 0), M([E({ attribute: !1 })], K.prototype, "values", void 0), M([E({ type: Boolean })], K.prototype, "multiple", void 0), M([E({ attribute: !1 })], K.prototype, "templates", void 0), M([D()], K.prototype, "devices", void 0), M([D()], K.prototype, "error", void 0), K = M([T("tdc-target-select")], K);
// src/removal/removal-panel.ts
var sr = {
	all: "targetAll",
	device: "targetDevice",
	run: "targetRun"
}, q = class extends N {
	constructor(...e) {
		super(...e), this.target = "all", this.targetId = "", this.busy = !1, this.message = "", this.error = "";
	}
	async showPlan() {
		this.message = "", this.error = "";
		try {
			this.plan = await this.api.removalPlan(this.target, this.targetId || void 0);
		} catch (e) {
			this.plan = void 0, this.error = O(e);
		}
	}
	async confirm() {
		this.busy = !0;
		try {
			let e = await this.api.removalRun(this.target, this.targetId || void 0);
			this.message = this.tr("removed", { count: e.devices + e.orphans }), this.plan = void 0;
		} catch (e) {
			this.error = O(e);
		}
		this.busy = !1;
	}
	renderPlan(e) {
		return e.devices.length + e.orphans.length === 0 && e.runs.length === 0 ? y`<p>${this.tr("planNothing")}</p>` : y`<ul>
        <li>${this.tr("planDevices", { count: e.devices.length })}</li>
        ${e.groups.length ? y`<li>${this.tr("planGroups", { count: e.groups.length })}</li>` : ""}
        ${e.topics.length ? y`<li>${this.tr("planTopics", { count: e.topics.length })}</li>` : ""}
        ${e.statistics.length ? y`<li>${this.tr("planStatistics", { count: e.statistics.length })}</li>` : ""}
        ${e.scenarios.length ? y`<li>${this.tr("planScenarios", { count: e.scenarios.length })}</li>` : ""}
        ${e.schedules.length ? y`<li>${this.tr("planSchedules", { count: e.schedules.length })}</li>` : ""}
        ${e.orphans.length ? y`<li>${this.tr("planOrphans", { count: e.orphans.length })}</li>` : ""}
        ${e.areas.length ? y`<li>${this.tr("planAreas", { names: e.areas.join(", ") })}</li>` : ""}
      </ul>
      <p>
        <small
          >${e.devices.slice(0, 20).map((e) => e.name).join(", ")}${e.devices.length > 20 ? " …" : ""}</small
        >
      </p>
      <button class="primary" ?disabled=${this.busy} @click=${() => void this.confirm()}>
        ${this.tr("confirmRemove")}
      </button>`;
	}
	render() {
		return y`
      <div class="row">
        <label style="flex: 0 0 280px"
          >${this.tr("target")}
          <select
            @change=${(e) => {
			this.target = e.target.value, this.plan = void 0;
		}}
          >
            ${j(this.hass?.language, Object.keys(sr), (e) => this.tr(sr[e])).map((e) => y`<option value=${e} ?selected=${this.target === e}>
                  ${this.tr(sr[e])}
                </option>`)}
          </select>
        </label>
        ${this.target === "all" ? "" : y`<tdc-target-select
                .hass=${this.hass}
                kind=${this.target}
                .values=${this.targetId ? [this.targetId] : []}
                @tdc-target-change=${(e) => {
			this.targetId = e.detail[0] ?? "", this.plan = void 0;
		}}
              ></tdc-target-select>`}
        <button
          ?disabled=${this.target !== "all" && !this.targetId}
          @click=${() => void this.showPlan()}
        >
          ${this.tr("showPlan")}
        </button>
      </div>
      ${this.plan ? this.renderPlan(this.plan) : ""}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
M([E()], q.prototype, "target", void 0), M([E()], q.prototype, "targetId", void 0), M([D()], q.prototype, "plan", void 0), M([D()], q.prototype, "busy", void 0), M([D()], q.prototype, "message", void 0), M([D()], q.prototype, "error", void 0), q = M([T("tdc-removal-panel")], q);
// src/schedule/helpers.ts
function cr() {
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
function lr(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function ur(e) {
	switch (e.type) {
		case "times": return e.weekdays.length ? {
			type: "times",
			times: lr(e.times),
			weekdays: [...e.weekdays].sort()
		} : {
			type: "times",
			times: lr(e.times)
		};
		case "interval": return {
			type: "interval",
			every_s: e.everyS,
			start: e.start,
			end: e.end
		};
		case "once": return {
			type: "once",
			at: e.at
		};
		case "random_window": return {
			type: "random_window",
			count: e.count,
			start: e.start,
			end: e.end
		};
		case "poisson": return {
			type: "poisson",
			per_day: e.perDay
		};
	}
}
function dr(e, t) {
	switch (e) {
		case "all": return { all: !0 };
		case "template": return { template: t[0] ?? "" };
		case "device": return { device: t.length === 1 ? t[0] : t };
		case "run": return { run: t[0] ?? "" };
	}
}
function fr(e) {
	return "template" in e ? {
		kind: "template",
		ids: [e.template]
	} : "device" in e ? {
		kind: "device",
		ids: typeof e.device == "string" ? [e.device] : e.device
	} : "run" in e ? {
		kind: "run",
		ids: [e.run]
	} : {
		kind: "all",
		ids: []
	};
}
function pr(e) {
	switch (e.type) {
		case "times": return e.times.join(", ");
		case "interval": return `${e.every_s} s (${e.start}–${e.end})`;
		case "once": return e.at.replace("T", " ");
		case "random_window": return `${e.count}× ${e.start}–${e.end}`;
		case "poisson": return `Ø ${e.per_day}/d`;
	}
}
function mr(e) {
	return e.slice(0, 16).replace("T", " ");
}
function hr(e) {
	return Object.entries(e).flatMap(([e, t]) => t.map((t) => `${e}/${t}`));
}
function gr(e) {
	return {
		kind: "all",
		targetIds: [],
		actionKey: hr(e)[0] ?? "",
		entity: ""
	};
}
function _r(e) {
	return [...new Map(e.map((e) => [`${e.platform}/${e.key}`, e])).values()].map(({ platform: e, key: t }) => ({
		platform: e,
		key: t
	}));
}
function vr(e) {
	return _r(e.flatMap((e) => e.entities));
}
function yr(e, t, n, r) {
	if (e === "all") return n.length ? _r(n.flatMap((e) => e.entities)) : vr(r);
	if (t.length === 0) return;
	if (e === "template") {
		let e = r.find((e) => e.id === t[0]);
		return e ? _r(e.entities) : void 0;
	}
	let i = e === "device" ? n.filter((e) => t.includes(e.id) || t.includes(e.name)) : n.filter((e) => e.run_id === t[0]);
	return i.length ? _r(i.flatMap((e) => e.entities)) : void 0;
}
function br(e, t) {
	let n = t ? new Set(t.map((e) => e.platform)) : void 0;
	return hr(e).filter((e) => !n || n.has(e.split("/")[0]));
}
function xr(e, t) {
	let n = t.split("/")[0];
	return [...new Set(e.filter((e) => e.platform === n).map((e) => e.key))];
}
function Sr(e) {
	return {
		target: dr(e.kind, e.targetIds),
		entity: e.entity,
		action: e.actionKey.split("/")[1] ?? ""
	};
}
function Cr(e) {
	let t = {
		...cr(),
		type: e.type
	};
	switch (e.type) {
		case "times": return {
			...t,
			times: e.times.join(", "),
			weekdays: e.weekdays ?? []
		};
		case "interval": return {
			...t,
			everyS: e.every_s,
			start: e.start,
			end: e.end
		};
		case "once": return {
			...t,
			at: e.at
		};
		case "random_window": return {
			...t,
			count: e.count,
			start: e.start,
			end: e.end
		};
		case "poisson": return {
			...t,
			perDay: e.per_day
		};
	}
}
function wr(e, t, n) {
	let { kind: r, ids: i } = fr(e.target), a = Object.entries(t).filter(([, t]) => t.includes(e.action)).map(([e]) => e), o = a.find((t) => n.some((n) => n.entities.some((n) => n.platform === t && n.key === e.entity))) ?? a[0];
	return {
		kind: r,
		targetIds: i,
		actionKey: o ? `${o}/${e.action}` : "",
		entity: e.entity
	};
}
// src/schedule/work-picker.ts
var Tr = [
	"all",
	"template",
	"device",
	"run"
], Er = 500, J = class extends N {
	constructor(...e) {
		super(...e), this.actions = {}, this.templates = [], this.devices = [], this.error = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.loadDevices();
	}
	async loadDevices() {
		try {
			this.devices = (await this.api.devices(0, Er)).devices, this.error = "";
		} catch (e) {
			this.error = O(e);
		}
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent("tdc-work-change", { detail: {
			...this.work,
			...e
		} }));
	}
	scope() {
		let e = yr(this.work.kind, this.work.targetIds, this.devices, this.templates), t = this.hass?.language;
		return {
			actionKeys: j(t, br(this.actions, e), (e) => rt(t, e)),
			entities: j(t, xr(e ?? vr(this.templates), this.work.actionKey), (e) => k(t, "entity", e))
		};
	}
	updated(e) {
		super.updated(e);
		let { actionKeys: t, entities: n } = this.scope();
		t.length && !t.includes(this.work.actionKey) ? this.emit({
			actionKey: t[0],
			entity: ""
		}) : n.length && !n.includes(this.work.entity) && this.emit({ entity: n[0] });
	}
	render() {
		let { actionKeys: e, entities: t } = this.scope(), n = this.hass?.language;
		return y`
      <div class="fields">
        ${this.select(this.tr("schTarget"), Tr, this.work.kind, (e) => this.tr(`schTarget_${e}`), (e) => this.emit({
			kind: e,
			targetIds: []
		}))}
        ${this.work.kind === "all" ? x : y`<tdc-target-select
                .hass=${this.hass}
                kind=${this.work.kind}
                ?multiple=${this.work.kind === "device"}
                .values=${this.work.targetIds}
                .templates=${this.templates}
                @tdc-target-change=${(e) => this.emit({ targetIds: e.detail })}
              ></tdc-target-select>`}
        ${this.select(this.tr("schAction"), e, this.work.actionKey, (e) => rt(n, e), (e) => this.emit({
			actionKey: e,
			entity: ""
		}))}
        ${this.select(this.tr("schEntity"), t, this.work.entity || t[0] || "", (e) => k(n, "entity", e), (e) => this.emit({ entity: e }))}
      </div>
      ${this.error ? y`<p class="error">${this.error}</p>` : x}
    `;
	}
};
M([E({ attribute: !1 })], J.prototype, "work", void 0), M([E({ attribute: !1 })], J.prototype, "actions", void 0), M([E({ attribute: !1 })], J.prototype, "templates", void 0), M([D()], J.prototype, "devices", void 0), M([D()], J.prototype, "error", void 0), J = M([T("tdc-work-picker")], J);
// src/scenario/helpers.ts
function Dr(e) {
	return {
		afterS: 0,
		work: gr(e),
		params: ""
	};
}
function Or(e) {
	if (e.trim() === "") return {};
	try {
		let t = JSON.parse(e);
		return typeof t == "object" && t && !Array.isArray(t) ? t : void 0;
	} catch {
		return;
	}
}
function kr(e) {
	let t = [];
	for (let n of e) {
		let e = Or(n.params);
		if (e === void 0) return;
		t.push({
			after_s: Math.max(0, n.afterS || 0),
			...Sr(n.work),
			params: e
		});
	}
	return t;
}
function Ar(e, t, n) {
	return {
		afterS: e.after_s,
		work: wr(e, t, n),
		params: Object.keys(e.params).length ? JSON.stringify(e.params) : ""
	};
}
// src/scenario/scenario-form.ts
var Y = class extends N {
	constructor(...e) {
		super(...e), this.templates = [], this.submitLabel = "", this.busy = !1, this.name = "", this.steps = [], this.error = "";
	}
	willUpdate(e) {
		let t = this.info?.actions;
		this.scenario && t && this.loadedId !== this.scenario.id ? (this.loadedId = this.scenario.id, this.name = this.scenario.name, this.steps = this.scenario.steps.map((e) => Ar(e, t, this.templates))) : !this.scenario && t && this.steps.length === 0 && (this.steps = [Dr(t)]), super.willUpdate(e);
	}
	reset() {
		this.name = "", this.error = "", this.steps = [Dr(this.info?.actions ?? {})];
	}
	setStep(e, t) {
		this.steps = this.steps.map((n, r) => r === e ? {
			...n,
			...t
		} : n);
	}
	complete() {
		return !!this.name.trim() && this.steps.length > 0 && this.steps.every((e) => e.work.kind === "all" || e.work.targetIds.length > 0);
	}
	submit() {
		let e = kr(this.steps);
		e ? (this.error = "", this.dispatchEvent(new CustomEvent("tdc-submit", { detail: {
			name: this.name,
			steps: e
		} }))) : this.error = this.tr("scnBadParams");
	}
	renderStep(e, t) {
		return y`<fieldset>
      <legend>${this.tr("scnStep", { number: t + 1 })}</legend>
      <div class="fields bottom">
        <label
          >${this.tr("scnAfter")}
          <input
            type="number"
            min="0"
            .value=${String(e.afterS)}
            @input=${(e) => this.setStep(t, { afterS: Number(e.target.value) })}
          />
        </label>
        ${this.textField(this.tr("scnParams"), e.params, (e) => this.setStep(t, { params: e }), { placeholder: this.tr("scnParamsHint") })}
      </div>
      <tdc-work-picker
        .hass=${this.hass}
        .work=${e.work}
        .actions=${this.info?.actions ?? {}}
        .templates=${this.templates}
        @tdc-work-change=${(e) => this.setStep(t, { work: e.detail })}
      ></tdc-work-picker>
      <div class="end">
        <button
          ?disabled=${this.steps.length < 2}
          @click=${() => this.steps = this.steps.filter((e, n) => n !== t)}
        >
          ${this.tr("scnRemoveStep")}
        </button>
      </div>
    </fieldset>`;
	}
	render() {
		return y`
      <div class="fields">
        ${this.textField(this.tr("schName"), this.name, (e) => this.name = e)}
      </div>
      ${this.steps.map((e, t) => this.renderStep(e, t))}
      <p class="row">
        <button
          @click=${() => this.steps = [...this.steps, Dr(this.info?.actions ?? {})]}
        >
          ${this.tr("scnAddStep")}
        </button>
        <button
          class="primary"
          ?disabled=${this.busy || !this.complete()}
          @click=${() => this.submit()}
        >
          ${this.submitLabel}
        </button>
        ${this.scenario ? y`<button
                ?disabled=${this.busy}
                @click=${() => this.dispatchEvent(new CustomEvent("tdc-cancel"))}
              >
                ${this.tr("detCancel")}
              </button>` : x}
      </p>
      <p class="error">${this.error}</p>
    `;
	}
};
M([E({ attribute: !1 })], Y.prototype, "info", void 0), M([E({ attribute: !1 })], Y.prototype, "templates", void 0), M([E({ attribute: !1 })], Y.prototype, "scenario", void 0), M([E()], Y.prototype, "submitLabel", void 0), M([E({ type: Boolean })], Y.prototype, "busy", void 0), M([D()], Y.prototype, "name", void 0), M([D()], Y.prototype, "steps", void 0), M([D()], Y.prototype, "error", void 0), Y = M([T("tdc-scenario-form")], Y);
// src/scenario/scenario-panel.ts
var X = class extends H {
	constructor(...e) {
		super(...e), this.scenarios = [], this.expanded = /* @__PURE__ */ new Set(), this.creating = !1;
	}
	static {
		this.styles = [
			N.styles,
			st,
			o`
      tr.scenario {
        cursor: pointer;
      }
      tr.scenario:hover {
        background: var(--secondary-background-color);
      }
    `
		];
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			this.scenarios = await this.api.scenarios();
		} catch (e) {
			this.error = O(e);
		}
	}
	async add(e) {
		await this.run(async () => {
			await this.api.addScenario(e.name, e.steps), this.newForm?.reset(), this.creating = !1;
		});
	}
	async save(e, t) {
		await this.run(async () => {
			await this.api.updateScenario(e.id, t.name, t.steps), this.toggle(e.id);
		});
	}
	async start(e) {
		await this.run(async () => {
			let { steps: t } = await this.api.runScenario(e.id);
			return this.tr("scnStarted", { count: t });
		});
	}
	toggle(e) {
		let t = new Set(this.expanded);
		t.delete(e) || t.add(e), this.expanded = t;
	}
	renderNew() {
		return y`
      <p>
        <button class="primary" @click=${() => this.creating = !0}>
          + ${this.tr("scnNew")}
        </button>
      </p>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr("scnNew")}
        ?open=${this.creating}
        @tdc-close=${() => this.creating = !1}
      >
        <tdc-scenario-form
          id="new"
          .hass=${this.hass}
          .info=${this.info}
          .templates=${this.templates}
          submitLabel=${this.tr("scnCreate")}
          ?busy=${this.busy}
          @tdc-submit=${(e) => void this.add(e.detail)}
        ></tdc-scenario-form>
      </tdc-dialog>
    `;
	}
	renderRow(e) {
		let t = e.steps[0], { kind: n } = t ? fr(t.target) : { kind: "all" }, r = this.hass?.language, i = this.expanded.has(e.id);
		return y`<tr class="scenario card" @click=${() => this.toggle(e.id)}>
        <td class="name">${i ? "▾" : "▸"} ${e.name}</td>
        <td data-label=${this.tr("scnSteps")}>
          ${this.tr("scnStepCount", { count: e.steps.length })}<br /><small
            >${t ? `${k(r, "entity", t.entity)}: ${A(r, t.action)} · ${this.tr(`schTarget_${n}`)}` : ""}</small
          >
        </td>
        <td data-label=${this.tr("colActions")}>
          <button
            class="primary"
            ?disabled=${this.busy}
            @click=${(t) => {
			t.stopPropagation(), this.start(e);
		}}
          >
            ${this.tr("scnRun")}
          </button>
          <button
            ?disabled=${this.busy}
            @click=${(t) => {
			t.stopPropagation(), this.run(() => this.api.removeScenario(e.id).then(() => void 0));
		}}
          >
            ${this.tr("remove")}
          </button>
        </td>
      </tr>
      ${i ? y`<tr>
              <td colspan="3">
                <tdc-scenario-form
                  .hass=${this.hass}
                  .info=${this.info}
                  .templates=${this.templates}
                  .scenario=${e}
                  submitLabel=${this.tr("schSave")}
                  ?busy=${this.busy}
                  @tdc-submit=${(t) => void this.save(e, t.detail)}
                  @tdc-cancel=${() => this.toggle(e.id)}
                ></tdc-scenario-form>
              </td>
            </tr>` : x}`;
	}
	render() {
		return y`
      ${this.renderNew()}
      ${this.scenarios.length === 0 ? y`<p>${this.tr("scnNone")}</p>` : y`<table class="cards">
              <tr>
                <th>${this.tr("schName")}</th>
                <th>${this.tr("scnSteps")}</th>
                <th>${this.tr("colActions")}</th>
              </tr>
              ${xt(this.scenarios, (e) => e.id, (e) => this.renderRow(e))}
            </table>`}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
M([D()], X.prototype, "scenarios", void 0), M([D()], X.prototype, "expanded", void 0), M([D()], X.prototype, "creating", void 0), M([qe("tdc-scenario-form#new")], X.prototype, "newForm", void 0), X = M([T("tdc-scenario-panel")], X);
// src/schedule/schedule-form.ts
var jr = [
	"times",
	"interval",
	"once",
	"random_window",
	"poisson"
], Mr = [
	"weekdayMon",
	"weekdayTue",
	"weekdayWed",
	"weekdayThu",
	"weekdayFri",
	"weekdaySat",
	"weekdaySun"
], Z = class extends N {
	constructor(...e) {
		super(...e), this.templates = [], this.scenarios = [], this.submitLabel = "", this.busy = !1, this.name = "", this.scenarioId = "", this.work = gr({}), this.seed = "", this.form = cr();
	}
	willUpdate(e) {
		let t = this.info?.actions;
		this.schedule && t && this.loadedId !== this.schedule.id ? (this.loadedId = this.schedule.id, this.name = this.schedule.name, this.scenarioId = this.schedule.scenario ?? "", this.work = wr(this.schedule, t, this.templates), this.form = Cr(this.schedule.trigger)) : !this.schedule && t && !this.work.actionKey && (this.work = gr(t)), super.willUpdate(e);
	}
	reset() {
		this.name = "";
	}
	scenarioName(e) {
		return this.scenarios.find((t) => t.id === e)?.name ?? e;
	}
	setForm(e) {
		this.form = {
			...this.form,
			...e
		};
	}
	request() {
		let e = this.scenarioId ? { scenario: this.scenarioId } : Sr(this.work), t = this.schedule && "action" in e && e.action === this.schedule.action;
		return {
			name: this.name,
			...e,
			trigger: ur(this.form),
			seed: this.seed || void 0,
			...this.schedule ? {
				params: t ? this.schedule.params : {},
				enabled: this.schedule.enabled
			} : {}
		};
	}
	complete() {
		return !!this.work.actionKey && (this.work.kind === "all" || this.work.targetIds.length > 0);
	}
	submit() {
		this.dispatchEvent(new CustomEvent("tdc-submit", { detail: this.request() }));
	}
	field(e, t, n = "text") {
		let r = n === "number";
		return y`<label style="flex: 1 1 140px"
      >${e}
      <input
        type=${n}
        .value=${String(this.form[t])}
        @input=${(e) => {
			let n = e.target.value;
			this.setForm({ [t]: r ? Number(n) : n });
		}}
      />
    </label>`;
	}
	renderWeekdays() {
		return y`<div class="row wide">
      ${Mr.map((e, t) => y`<label style="flex-direction: row; align-items: center">
            <input
              type="checkbox"
              style="width: auto; min-height: 0"
              .checked=${this.form.weekdays.includes(t)}
              @change=${(e) => this.setForm({ weekdays: e.target.checked ? [...this.form.weekdays, t] : this.form.weekdays.filter((e) => e !== t) })}
            />${this.tr(e)}
          </label>`)}
    </div>`;
	}
	renderTriggerFields() {
		switch (this.form.type) {
			case "times": return y`${this.field(this.tr("schTimes"), "times")} ${this.renderWeekdays()}`;
			case "interval": return y`${this.field(this.tr("schEveryS"), "everyS", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case "once": return this.field(this.tr("schAt"), "at", "datetime-local");
			case "random_window": return y`${this.field(this.tr("schCount"), "count", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case "poisson": return this.field(this.tr("schPerDay"), "perDay", "number");
		}
	}
	render() {
		return y`
      <div class="fields">
        ${this.textField(this.tr("schName"), this.name, (e) => this.name = e)}
        ${this.select(this.tr("schTrigger"), jr, this.form.type, (e) => this.tr(`schTrigger_${e}`), (e) => this.setForm({ type: e }))}
        ${this.select(this.tr("schRuns"), ["", ...this.scenarios.map((e) => e.id)], this.scenarioId, (e) => e ? this.tr("schScenario", { id: this.scenarioName(e) }) : this.tr("schRunsAction"), (e) => this.scenarioId = e)}
      </div>
      ${this.scenarioId ? x : y`<tdc-work-picker
              .hass=${this.hass}
              .work=${this.work}
              .actions=${this.info?.actions ?? {}}
              .templates=${this.templates}
              @tdc-work-change=${(e) => this.work = e.detail}
            ></tdc-work-picker>`}
      <div class="fields">
        ${this.renderTriggerFields()}
        ${this.textField(this.tr("seed"), this.seed, (e) => this.seed = e, {
			flex: "1 1 140px",
			placeholder: this.tr(this.schedule ? "schSeedKeep" : "seedHint")
		})}
      </div>
      <p class="row">
        <button
          class="primary"
          ?disabled=${this.busy || !this.name.trim() || !(this.scenarioId || this.complete())}
          @click=${() => this.submit()}
        >
          ${this.submitLabel}
        </button>
        ${this.schedule ? y`<button
                ?disabled=${this.busy}
                @click=${() => this.dispatchEvent(new CustomEvent("tdc-cancel"))}
              >
                ${this.tr("detCancel")}
              </button>` : x}
      </p>
    `;
	}
};
M([E({ attribute: !1 })], Z.prototype, "info", void 0), M([E({ attribute: !1 })], Z.prototype, "templates", void 0), M([E({ attribute: !1 })], Z.prototype, "scenarios", void 0), M([E({ attribute: !1 })], Z.prototype, "schedule", void 0), M([E()], Z.prototype, "submitLabel", void 0), M([E({ type: Boolean })], Z.prototype, "busy", void 0), M([D()], Z.prototype, "name", void 0), M([D()], Z.prototype, "scenarioId", void 0), M([D()], Z.prototype, "work", void 0), M([D()], Z.prototype, "seed", void 0), M([D()], Z.prototype, "form", void 0), Z = M([T("tdc-schedule-form")], Z);
// src/schedule/schedule-panel.ts
var Nr = 24, Pr = 50, Fr = 500, Q = class extends H {
	constructor(...e) {
		super(...e), this.schedules = [], this.runs = [], this.scenarios = [], this.devices = [], this.expanded = /* @__PURE__ */ new Set(), this.previewOpen = !1, this.creating = !1;
	}
	static {
		this.styles = [
			N.styles,
			st,
			o`
      tr.schedule {
        cursor: pointer;
      }
      tr.schedule:hover {
        background: var(--secondary-background-color);
      }
      details.section summary {
        margin: 24px 0 12px;
        font-size: 1.17em;
        font-weight: 500;
        cursor: pointer;
      }
      h3.list-title {
        margin-top: 40px;
      }
    `
		];
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			let e;
			[this.schedules, this.runs, this.scenarios, e] = await Promise.all([
				this.api.schedules(),
				this.api.schedulePreview(Nr),
				this.api.scenarios(),
				this.api.devices(0, Fr)
			]), this.devices = e.devices, this.error = "";
		} catch (e) {
			this.error = O(e);
		}
	}
	async add(e) {
		await this.run(async () => {
			await this.api.addSchedule(e), this.newForm?.reset(), this.creating = !1;
		});
	}
	async save(e, t) {
		await this.run(async () => {
			await this.api.updateSchedule(e.id, t), this.toggle(e.id);
		});
	}
	async setEnabled(e, t) {
		this.schedules = this.schedules.map((n) => n.id === e.id ? {
			...n,
			enabled: t
		} : n), await this.run(() => this.api.enableSchedule(e.id, t)), this.error && await this.refresh();
	}
	toggle(e) {
		let t = new Set(this.expanded);
		t.delete(e) || t.add(e), this.expanded = t;
	}
	scenarioName(e) {
		return this.scenarios.find((t) => t.id === e)?.name ?? e;
	}
	targetText(e, t) {
		let n = this.tr(`schTarget_${e}`);
		return e === "all" ? n : `${n}: ${t.map((t) => rr(e, t, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e }))).join(", ")}`;
	}
	renderNew() {
		return y`
      <p>
        <button class="primary" @click=${() => this.creating = !0}>
          + ${this.tr("schNew")}
        </button>
      </p>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr("schNew")}
        ?open=${this.creating}
        @tdc-close=${() => this.creating = !1}
      >
        <tdc-schedule-form
          id="new"
          .hass=${this.hass}
          .info=${this.info}
          .templates=${this.templates}
          .scenarios=${this.scenarios}
          submitLabel=${this.tr("schAdd")}
          ?busy=${this.busy}
          @tdc-submit=${(e) => void this.add(e.detail)}
        ></tdc-schedule-form>
      </tdc-dialog>
    `;
	}
	renderRow(e) {
		let { kind: t, ids: n } = fr(e.target), r = this.hass?.language, i = this.expanded.has(e.id);
		return y`<tr class="schedule card" @click=${() => this.toggle(e.id)}>
        <td class="name">${i ? "▾" : "▸"} ${e.name}</td>
        <td data-label=${this.tr("schTarget")}>
          ${e.scenario ? "–" : this.targetText(t, n)}
        </td>
        <td data-label=${this.tr("schAction")}>
          ${e.scenario ? this.tr("schScenario", { id: this.scenarioName(e.scenario) }) : `${k(r, "entity", e.entity)}: ${A(r, e.action)}`}
        </td>
        <td data-label=${this.tr("schTrigger")}>
          ${this.tr(`schTrigger_${e.trigger.type}`)}<br /><small
            >${pr(e.trigger)}</small
          >
        </td>
        <td data-label=${this.tr("schEnabled")}>
          <input
            type="checkbox"
            style="width: auto; min-height: 0"
            title=${this.tr("schEnabled")}
            .checked=${e.enabled}
            ?disabled=${this.busy}
            @click=${(e) => e.stopPropagation()}
            @change=${(t) => void this.setEnabled(e, t.target.checked)}
          />
        </td>
        <td data-label=${this.tr("colActions")}>
          <button
            ?disabled=${this.busy}
            @click=${(t) => {
			t.stopPropagation(), this.run(() => this.api.removeSchedule(e.id));
		}}
          >
            ${this.tr("remove")}
          </button>
        </td>
      </tr>
      ${i ? y`<tr>
              <td colspan="6">
                <tdc-schedule-form
                  .hass=${this.hass}
                  .info=${this.info}
                  .templates=${this.templates}
                  .scenarios=${this.scenarios}
                  .schedule=${e}
                  submitLabel=${this.tr("schSave")}
                  ?busy=${this.busy}
                  @tdc-submit=${(t) => void this.save(e, t.detail)}
                  @tdc-cancel=${() => this.toggle(e.id)}
                ></tdc-schedule-form>
              </td>
            </tr>` : x}`;
	}
	renderList() {
		return this.schedules.length === 0 ? y`<p>${this.tr("schNone")}</p>` : y`<table class="cards">
      <tr>
        <th>${this.tr("schName")}</th>
        <th>${this.tr("schTarget")}</th>
        <th>${this.tr("schAction")}</th>
        <th>${this.tr("schTrigger")}</th>
        <th>${this.tr("schEnabled")}</th>
        <th>${this.tr("colActions")}</th>
      </tr>
      ${xt(this.schedules, (e) => e.id, (e) => this.renderRow(e))}
    </table>`;
	}
	actionCount() {
		let e = this.runs.length;
		return this.tr(e === 1 ? "schActionOne" : "schActions", { count: e });
	}
	renderPreview() {
		return this.runs.length === 0 ? y`<p><small>${this.tr("schNoRuns")}</small></p>` : y`<table>
        <tr>
          <th>${this.tr("schWhen")}</th>
          <th>${this.tr("schName")}</th>
        </tr>
        ${this.runs.slice(0, Pr).map((e) => y`<tr>
              <td>${mr(e.when)}</td>
              <td>${e.name}</td>
            </tr>`)}
      </table>
      ${this.runs.length > Pr ? y`<p>
              <small>${this.tr("schMoreRuns", { count: this.runs.length - Pr })}</small>
            </p>` : x}`;
	}
	render() {
		return y`
      ${this.renderNew()}
      <details
        class="section"
        ?open=${this.previewOpen}
        @toggle=${(e) => this.previewOpen = e.target.open}
      >
        <summary>
          ${this.tr("schPreview", { hours: Nr })} · ${this.actionCount()}
        </summary>
        ${this.renderPreview()}
      </details>
      <h3 class="list-title">${this.tr("schList")}</h3>
      ${this.renderList()}
      <p class="error">${this.error}</p>
    `;
	}
};
M([D()], Q.prototype, "schedules", void 0), M([D()], Q.prototype, "runs", void 0), M([D()], Q.prototype, "scenarios", void 0), M([D()], Q.prototype, "devices", void 0), M([D()], Q.prototype, "expanded", void 0), M([D()], Q.prototype, "previewOpen", void 0), M([D()], Q.prototype, "creating", void 0), M([qe("tdc-schedule-form#new")], Q.prototype, "newForm", void 0), Q = M([T("tdc-schedule-panel")], Q);
// src/panel.ts
var $ = class extends N {
	constructor(...e) {
		super(...e), this.narrow = !1, this.tab = "devices", this.removeTarget = "all", this.removeId = "", this.lapse = 1;
	}
	static {
		this.styles = [N.styles, o`
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
        flex-wrap: wrap;
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
    `];
	}
	async connectedCallback() {
		super.connectedCallback();
		try {
			this.lapse = (await this.api.info()).time_lapse;
		} catch {
			this.lapse = 1;
		}
	}
	startRemoval(e) {
		this.removeTarget = e.detail.target, this.removeId = e.detail.id, this.tab = "remove";
	}
	renderTab(e, t) {
		return y`<button class=${this.tab === e ? "active" : ""} @click=${() => this.tab = e}>
      ${t}
    </button>`;
	}
	render() {
		return y`
      <header>
        <h2>${this.tr("title")}</h2>
        <span class="badge">${this.tr("badge")}</span>
        ${this.lapse > 1 ? y`<span class="badge">${this.tr("badgeLapse", { factor: this.lapse })}</span>` : ""}
      </header>
      <nav>
        ${this.renderTab("devices", this.tr("tabDevices"))}
        ${this.renderTab("schedules", this.tr("tabSchedules"))}
        ${this.renderTab("scenarios", this.tr("tabScenarios"))}
        ${this.renderTab("groups", this.tr("tabGroups"))}
        ${this.renderTab("history", this.tr("tabHistory"))}
        ${this.renderTab("remove", this.tr("tabRemove"))}
      </nav>
      ${this.tab === "devices" ? y`<tdc-device-list
              .hass=${this.hass}
              @tdc-remove=${this.startRemoval}
            ></tdc-device-list>` : ""}
      ${this.tab === "schedules" ? y`<tdc-schedule-panel .hass=${this.hass}></tdc-schedule-panel>` : ""}
      ${this.tab === "scenarios" ? y`<tdc-scenario-panel .hass=${this.hass}></tdc-scenario-panel>` : ""}
      ${this.tab === "groups" ? y`<tdc-group-panel .hass=${this.hass}></tdc-group-panel>` : ""}
      ${this.tab === "history" ? y`<tdc-history-panel .hass=${this.hass}></tdc-history-panel>` : ""}
      ${this.tab === "remove" ? y`<tdc-removal-panel
              .hass=${this.hass}
              .target=${this.removeTarget}
              .targetId=${this.removeId}
            ></tdc-removal-panel>` : ""}
    `;
	}
};
M([E({ type: Boolean })], $.prototype, "narrow", void 0), M([D()], $.prototype, "tab", void 0), M([D()], $.prototype, "removeTarget", void 0), M([D()], $.prototype, "removeId", void 0), M([D()], $.prototype, "lapse", void 0), $ = M([T("hass-test-data-creator-panel")], $);
export { $ as TdcPanel };
