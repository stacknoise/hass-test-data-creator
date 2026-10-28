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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, ee = globalThis, te = ee.trustedTypes, ne = te ? te.emptyScript : "", re = ee.reactiveElementPolyfillSupport, h = (e, t) => e, ie = {
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
}, ae = (e, t) => !l(e, t), oe = {
	attribute: !0,
	type: String,
	converter: ie,
	reflect: !1,
	useDefault: !1,
	hasChanged: ae
};
Symbol.metadata ??= Symbol("metadata"), ee.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var g = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = oe) {
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
		return this.elementProperties.get(e) ?? oe;
	}
	static _$Ei() {
		if (this.hasOwnProperty(h("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(h("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(h("properties"))) {
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
			let i = (n.converter?.toAttribute === void 0 ? ie : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ie : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ae)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[h("elementProperties")] = /* @__PURE__ */ new Map(), g[h("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: g }), (ee.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var se = globalThis, ce = (e) => e, le = se.trustedTypes, ue = le ? le.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, de = "$lit$", _ = `lit$${Math.random().toFixed(9).slice(2)}$`, fe = "?" + _, pe = `<${fe}>`, v = document, me = () => v.createComment(""), he = (e) => e === null || typeof e != "object" && typeof e != "function", ge = Array.isArray, _e = (e) => ge(e) || typeof e?.[Symbol.iterator] == "function", ve = "[ 	\n\f\r]", ye = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, be = /-->/g, xe = />/g, y = RegExp(`>|${ve}(?:([^\\s"'>=/]+)(${ve}*=${ve}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Se = /'/g, Ce = /"/g, we = /^(?:script|style|textarea|title)$/i, Te = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), b = Te(1), Ee = Te(2), x = Symbol.for("lit-noChange"), S = Symbol.for("lit-nothing"), De = /* @__PURE__ */ new WeakMap(), C = v.createTreeWalker(v, 129);
function Oe(e, t) {
	if (!ge(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ue === void 0 ? t : ue.createHTML(t);
}
var ke = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = ye;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === ye ? c[1] === "!--" ? o = be : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = y) : (we.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = y) : o = xe : o === y ? c[0] === ">" ? (o = i ?? ye, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? y : c[3] === "\"" ? Ce : Se) : o === Ce || o === Se ? o = y : o === be || o === xe ? o = ye : (o = y, i = void 0);
		let d = o === y && e[t + 1].startsWith("/>") ? " " : "";
		a += o === ye ? n + pe : l >= 0 ? (r.push(s), n.slice(0, l) + de + n.slice(l) + _ + d) : n + _ + (l === -2 ? t : d);
	}
	return [Oe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ae = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ke(t, n);
		if (this.el = e.createElement(l, r), C.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = C.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(de)) {
					let t = u[o++], n = i.getAttribute(e).split(_), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Pe : r[1] === "?" ? Fe : r[1] === "@" ? Ie : Ne
					}), i.removeAttribute(e);
				} else e.startsWith(_) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (we.test(i.tagName)) {
					let e = i.textContent.split(_), t = e.length - 1;
					if (t > 0) {
						i.textContent = le ? le.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], me()), C.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], me());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === fe) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(_, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += _.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = v.createElement("template");
		return n.innerHTML = e, n;
	}
};
function w(e, t, n = e, r) {
	if (t === x) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = he(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = w(e, i._$AS(e, t.values), i, r)), t;
}
var je = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? v).importNode(t, !0);
		C.currentNode = r;
		let i = C.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Me(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Le(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = C.nextNode(), a++);
		}
		return C.currentNode = v, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Me = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = S, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = w(this, e, t), he(e) ? e === S || e == null || e === "" ? (this._$AH !== S && this._$AR(), this._$AH = S) : e !== this._$AH && e !== x && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? _e(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== S && he(this._$AH) ? this._$AA.nextSibling.data = e : this.T(v.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ae.createElement(Oe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new je(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = De.get(e.strings);
		return t === void 0 && De.set(e.strings, t = new Ae(e)), t;
	}
	k(t) {
		ge(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(me()), this.O(me()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ce(e).nextSibling;
			ce(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Ne = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = S, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = S;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = w(this, e, t, 0), a = !he(e) || e !== this._$AH && e !== x, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = w(this, r[n + o], t, o), s === x && (s = this._$AH[o]), a ||= !he(s) || s !== this._$AH[o], s === S ? e = S : e !== S && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === S ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Pe = class extends Ne {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === S ? void 0 : e;
	}
}, Fe = class extends Ne {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== S);
	}
}, Ie = class extends Ne {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = w(this, e, t, 0) ?? S) === x) return;
		let n = this._$AH, r = e === S && n !== S || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== S && (n === S || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Le = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		w(this, e);
	}
}, Re = {
	M: de,
	P: _,
	A: fe,
	C: 1,
	L: ke,
	R: je,
	D: _e,
	V: w,
	I: Me,
	H: Ne,
	N: Fe,
	U: Ie,
	B: Pe,
	F: Le
}, ze = se.litHtmlPolyfillSupport;
ze?.(Ae, Me), (se.litHtmlVersions ??= []).push("3.3.3");
var Be = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Me(t.insertBefore(me(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ve = globalThis, T = class extends g {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Be(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return x;
	}
};
T._$litElement$ = !0, T.finalized = !0, Ve.litElementHydrateSupport?.({ LitElement: T });
var He = Ve.litElementPolyfillSupport;
He?.({ LitElement: T }), (Ve.litElementVersions ??= []).push("4.2.2");
// node_modules/@lit/reactive-element/decorators/custom-element.js
var E = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, Ue = {
	attribute: !0,
	type: String,
	converter: ie,
	reflect: !1,
	hasChanged: ae
}, We = (e = Ue, t, n) => {
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
function D(e) {
	return (t, n) => typeof n == "object" ? We(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function O(e) {
	return D({
		...e,
		state: !0,
		attribute: !1
	});
}
// node_modules/@lit/reactive-element/decorators/base.js
var Ge = (e, t, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, n), n);
// node_modules/@lit/reactive-element/decorators/query.js
function Ke(e, t) {
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
			return Ge(n, r, { get() {
				let n = e.call(this);
				return n === void 0 && (n = a(this), (n !== null || this.hasUpdated) && t.call(this, n)), n;
			} });
		}
		return Ge(n, r, { get() {
			return a(this);
		} });
	};
}
// src/common/api.ts
var qe = "hass_test_data_creator", Je = class {
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
			type: `${qe}/${e}`,
			...n
		});
	}
};
function k(e) {
	if (typeof e == "object" && e && "message" in e) {
		let { code: t, message: n } = e;
		return t ? `${t}: ${n}` : n;
	}
	return String(e);
}
// src/common/i18n.ts
var Ye = {
	en: {
		title: "Test data",
		badge: "Test environment",
		badgeLapse: "Time lapse ×{factor}",
		tabDevices: "Devices",
		tabCreate: "Create",
		tabRemove: "Remove",
		tabSchedules: "Schedules",
		schNone: "No schedules yet. Add one above.",
		schList: "Existing schedules",
		schSave: "Save changes",
		schSeedKeep: "Empty keeps the seed",
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
		tabGroups: "Groups",
		grpNone: "No groups yet. Add one below; members must be Zigbee2MQTT devices.",
		grpNew: "New group",
		grpMembers: "Members (device names, comma separated)",
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
		noDevices: "No test devices yet. Open \"Create\" to generate some.",
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
	},
	de: {
		title: "Testdaten",
		badge: "Testumgebung",
		badgeLapse: "Zeitraffer ×{factor}",
		tabDevices: "Geräte",
		tabCreate: "Erstellen",
		tabRemove: "Entfernen",
		tabSchedules: "Zeitpläne",
		schNone: "Noch keine Zeitpläne. Lege oben einen an.",
		schList: "Vorhandene Zeitpläne",
		schSave: "Änderungen speichern",
		schSeedKeep: "Leer behält den Seed",
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
		tabGroups: "Gruppen",
		grpNone: "Noch keine Gruppen. Lege unten eine an; Mitglieder müssen Zigbee2MQTT-Geräte sein.",
		grpNew: "Neue Gruppe",
		grpMembers: "Mitglieder (Gerätenamen, kommagetrennt)",
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
		noDevices: "Noch keine Testgeräte. Öffne „Erstellen“, um welche zu erzeugen.",
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
	}
};
function Xe(e) {
	return e?.toLowerCase().startsWith("de") ? "de" : "en";
}
function Ze(e, t, n = {}) {
	return Ye[e][t].replace(/\{(\w+)\}/g, (e, t) => t in n ? String(n[t]) : e);
}
// src/common/labels.ts
var Qe = {
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
}, $e = {
	en: Qe,
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
}, et = {
	native: "outputNative",
	mqtt: "outputMqtt",
	z2m: "outputZ2m"
}, tt = "fault_";
function A(e, t, n) {
	return $e[Xe(e)][t][n] ?? n;
}
function j(e, t) {
	return t.startsWith(tt) ? `${Xe(e) === "de" ? "Störung" : "Fault"}: ${A(e, "fault", t.slice(6))}` : A(e, "action", t);
}
function nt(e, t) {
	let [n, r] = t.split("/");
	return r ? `${A(e, "platform", n)} · ${j(e, r)}` : t;
}
function rt(e, t, n) {
	return $e[Xe(e)].template[t] ?? n;
}
function it(e, t, n) {
	let r = Qe.entity[t];
	return r !== void 0 && r === n ? A(e, "entity", t) : n;
}
function at(e, t) {
	return t === null ? "–" : A(e, "state", t);
}
function M(e, t, n) {
	let r = Xe(e);
	return [...t].sort((e, t) => n(e).localeCompare(n(t), r, {
		numeric: !0,
		sensitivity: "base"
	}));
}
// \0@oxc-project+runtime@0.155.0/helpers/esm/decorate.js
function N(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/common/base.ts
var ot = o`
  :host {
    container-type: inline-size;
  }
`, st = o`
  border-radius: 6px;
  border: 1px solid var(--divider-color);
  background: var(--card-background-color);
  color: var(--primary-text-color);
`, P = class extends T {
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
      ${st}
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
      ${st}
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
			api: new Je(this.hass)
		}), this.client.api;
	}
	textField(e, t, n, r = {}) {
		return b`<label style="flex: ${r.flex ?? "1 1 200px"}"
      >${e}
      <input
        .value=${t}
        placeholder=${r.placeholder ?? ""}
        @input=${(e) => n(e.target.value)}
      />
    </label>`;
	}
	select(e, t, n, r, i) {
		return b`<label style="flex: 1 1 180px"
      >${e}
      <select @change=${(e) => i(e.target.value)}>
        ${M(this.hass?.language, t, r).map((e) => b`<option value=${e} ?selected=${e === n}>${r(e)}</option>`)}
      </select>
    </label>`;
	}
	tr(e, t) {
		return Ze(Xe(this.hass?.language), e, t);
	}
};
N([D({ attribute: !1 })], P.prototype, "hass", void 0);
// node_modules/lit-html/directive.js
var F = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, ct = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), lt = class {
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
}, { I: ut } = Re, dt = (e) => e, ft = (e) => e.strings === void 0, pt = () => document.createComment(""), I = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new ut(r.insertBefore(pt(), i), r.insertBefore(pt(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = dt(e).nextSibling;
				dt(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, L = (e, t, n = e) => (e._$AI(t, n), e), mt = {}, ht = (e, t = mt) => e._$AH = t, gt = (e) => e._$AH, _t = (e) => {
	e._$AR(), e._$AA.remove();
}, vt = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, yt = ct(class extends lt {
	constructor(e) {
		if (super(e), e.type !== F.CHILD) throw Error("repeat() can only be used in text expressions");
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
		let i = gt(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = L(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = L(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = L(i[d], a[m]), I(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = L(i[f], a[p]), I(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = vt(o, p, m), u = vt(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = I(e, i[d]);
					L(t, a[p]), c[p] = t;
				} else c[p] = L(n, a[p]), I(e, i[d], n), i[t] = null;
				p++;
			} else _t(i[f]), f--;
		} else _t(i[d]), d++;
		for (; p <= m;) {
			let t = I(e, c[m + 1]);
			L(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && _t(e);
		}
		return this.ut = o, ht(e, c), x;
	}
}), bt = o`
  .popover {
    position: absolute;
    z-index: 10;
    top: 100%;
    left: 0;
    margin-top: 4px;
    min-width: 100%;
    max-height: 320px;
    overflow-y: auto;
    padding: 4px 0;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    background: var(--card-background-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`, xt = class extends P {
	constructor(...e) {
		super(...e), this.open = !1, this.closeOutside = (e) => {
			e.composedPath().includes(this) || (this.open = !1);
		}, this.closeOnEscape = (e) => {
			e.key === "Escape" && (this.open = !1);
		};
	}
	connectedCallback() {
		super.connectedCallback(), document.addEventListener("click", this.closeOutside), document.addEventListener("keydown", this.closeOnEscape);
	}
	disconnectedCallback() {
		document.removeEventListener("click", this.closeOutside), document.removeEventListener("keydown", this.closeOnEscape), super.disconnectedCallback();
	}
};
N([O()], xt.prototype, "open", void 0);
// src/common/menu-button.ts
var R = class extends xt {
	constructor(...e) {
		super(...e), this.label = "", this.items = [], this.disabled = !1;
	}
	static {
		this.styles = [
			P.styles,
			bt,
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
		return b`
      <button
        aria-haspopup="menu"
        aria-expanded=${this.open ? "true" : "false"}
        ?disabled=${this.disabled}
        @click=${() => this.open = !this.open}
      >
        ${this.label} ▾
      </button>
      ${this.open ? b`<div class="popover" role="menu">
              ${this.items.map((e) => b`<button role="menuitem" @click=${() => this.pick(e.value)}>
                    ${e.label}
                  </button>`)}
            </div>` : ""}
    `;
	}
};
N([D()], R.prototype, "label", void 0), N([D({ attribute: !1 })], R.prototype, "items", void 0), N([D({ type: Boolean })], R.prototype, "disabled", void 0), R = N([E("tdc-menu-button")], R);
// src/signals/editor-helpers.ts
var St = ["enum", "state_machine"], Ct = [
	"sine",
	"saw",
	"square",
	"triangle",
	"random_walk",
	"discharge"
], wt = [
	"constant",
	"household_load",
	"pv_day"
], Tt = 600;
function Et(e) {
	return St.includes(e);
}
function Dt(e) {
	return e === "counter" ? ["rate_per_hour"] : e === "noise" ? ["interval_s", "noise"] : e === "steps" ? [
		"period_s",
		"interval_s",
		"phase",
		"noise"
	] : e === "enum" ? ["interval_s"] : e === "state_machine" ? ["phase"] : Ct.includes(e) ? [
		"period_s",
		"phase",
		"noise"
	] : wt.includes(e) ? ["noise"] : [];
}
function Ot(e) {
	return e === "enum" ? ["values", "weights"] : e === "state_machine" ? ["states"] : [];
}
function kt(e, t, n) {
	let r = { ...e }, i = Number(n);
	return n.trim() === "" || Number.isNaN(i) ? delete r[t] : r[t] = i, r;
}
function At(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function jt(e, t) {
	return t === "states" ? (e.states ?? []).map((e) => `${e.value}:${e.duration_s}`).join(", ") : (e[t] ?? []).join(", ");
}
function Mt(e, t, n) {
	let r = { ...e };
	return t === "values" ? r.values = At(n) : t === "weights" ? r.weights = At(n).map(Number).filter((e) => !Number.isNaN(e)) : r.states = At(n).flatMap((e) => {
		let [t, n] = e.split(":").map((e) => e.trim()), r = Number(n);
		return t && r > 0 ? [{
			value: t,
			duration_s: r
		}] : [];
	}), r;
}
function Nt(e) {
	return e === "enum" ? {
		values: ["on", "off"],
		interval_s: Tt
	} : e === "state_machine" ? { states: [{
		value: "idle",
		duration_s: Tt
	}, {
		value: "active",
		duration_s: Tt
	}] } : {};
}
function Pt(e, t) {
	let n = /* @__PURE__ */ new Set([
		"shape",
		...Dt(t),
		...Ot(t)
	]);
	Et(t) || [
		"min",
		"max",
		"decimals"
	].forEach((e) => n.add(e));
	let r = {
		...Nt(t),
		...e,
		shape: t
	};
	return Object.fromEntries(Object.entries(r).filter(([e]) => n.has(e)));
}
function Ft(e) {
	try {
		let t = JSON.parse(e);
		return Array.isArray(t) ? t : [];
	} catch {
		return [];
	}
}
function It(e) {
	return Ft(e).flatMap((e, t) => e.platform === "sensor" && e.signal ? [{
		index: t,
		name: String(e.name ?? e.key ?? t),
		signal: e.signal
	}] : []);
}
function Lt(e, t, n) {
	let r = Ft(e);
	return r[t] ? (r[t] = {
		...r[t],
		signal: n
	}, JSON.stringify(r, null, 2)) : e;
}
// src/signals/signals.ts
var Rt = (1n << 64n) - 1n, zt = 11400714819323198485n, Bt = 13787848793156543929n, Vt = 10723151780598845931n, Ht = 3600, Ut = 86400, Wt = 24, Gt = .12, Kt = [
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
], qt = .12, Jt = 600, Yt = 6, Xt = 900, Zt = .3, Qt = 2, $t = 3;
function en(e, t = 0, n = 0) {
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
function z(e, t) {
	let n = BigInt(e) * zt + (BigInt(t) & Rt) * Bt + Vt & Rt;
	return n = (n ^ n >> 30n) * Bt & Rt, n = (n ^ n >> 27n) * Vt & Rt, n ^= n >> 31n, Number(n >> 11n) / 2 ** 53;
}
function B(e, t) {
	let n = t / e.period_s + e.phase;
	return n - Math.floor(n);
}
function tn(e, t) {
	let n = Math.floor(t), r = t - n, i = r * r * (3 - 2 * r), a = z(e, n);
	return a + (z(e, n + 1) - a) * i;
}
function nn(e) {
	return (e % Ut + Ut) % Ut / Ht;
}
function rn(e, t, n) {
	let r = Math.abs(e - t), i = Math.min(r, Wt - r);
	return Math.exp(-.5 * (i / n) ** 2);
}
var an = {
	constant: () => .5,
	sine: (e, t) => .5 + .5 * Math.sin(2 * Math.PI * B(e, t)),
	saw: (e, t) => B(e, t),
	square: (e, t) => +(B(e, t) < .5),
	triangle: (e, t) => 1 - Math.abs(2 * B(e, t) - 1),
	noise: (e, t) => z(e.seed, Math.floor(t / e.interval_s)),
	random_walk: (e, t) => tn(e.seed, t / e.period_s + e.phase),
	household_load: (e, t) => {
		let n = nn(t);
		return Kt.reduce((e, [t, r, i]) => e + i * rn(n, t, r), Gt) + qt * (tn(e.seed, t / Jt) - .5);
	},
	pv_day: (e, t) => {
		let n = (nn(t) - Yt) / 14;
		if (!(n > 0 && n < 1)) return 0;
		let r = 1 - Zt * tn(e.seed, t / Xt);
		return Math.sin(Math.PI * n) ** 1.5 * r;
	},
	steps: (e, t) => {
		let n = Math.max(Qt, Math.round(e.period_s / e.interval_s));
		return Math.min(1, Math.floor(B(e, t) * n) / (n - 1));
	},
	discharge: (e, t) => 1 - B(e, t) ** $t
};
function on(e, t) {
	let n = e.weights.length ? e.weights : e.values.map(() => 1), r = n.reduce((e, t) => e + t, 0), i = z(e.seed, Math.floor(t / e.interval_s)) * r, a = 0;
	for (let [t, r] of e.values.entries()) if (a += n[t], i < a) return r;
	return e.values[e.values.length - 1];
}
function sn(e, t) {
	let n = e.states.reduce((e, [, t]) => e + t, 0), r = ((t + e.phase * n) % n + n) % n, i = 0;
	for (let [t, n] of e.states) if (i += n, r < i) return t;
	return e.states[e.states.length - 1][0];
}
var cn = {
	enum: on,
	state_machine: sn
};
function ln(e) {
	let t = e.shape === "enum" ? e.values : e.states.map(([e]) => e);
	return [...new Set(t)];
}
function un(e, t) {
	return Number(e.toFixed(t));
}
function dn(e, t) {
	if (e.shape in cn) return cn[e.shape](e, t);
	if (e.shape === "counter") {
		let n = Math.max(0, t - e.origin);
		return un(e.min + e.rate_per_hour * n / Ht, e.decimals);
	}
	let n = (an[e.shape] ?? an.constant)(e, t);
	return e.noise && (n += (z(e.seed + 1, Math.floor(t)) - .5) * 2 * e.noise), n = Math.min(1, Math.max(0, n)), un(e.min + n * (e.max - e.min), e.decimals);
}
// src/signals/signal-preview.ts
var fn = 320, pn = 80, mn = 96, hn = 86400, gn = class extends T {
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
		let t = en(e, 1, 0), n = ln(t), r = Array.from({ length: 97 }, (e, r) => {
			let i = dn(t, r / mn * hn);
			return typeof i == "string" ? n.indexOf(i) : i;
		}), i = Math.min(...r), a = Math.max(...r) - i || 1;
		return r.map((e, t) => {
			let n = t / mn * fn, r = 74 - (e - i) / a * 68;
			return `${n.toFixed(1)},${r.toFixed(1)}`;
		}).join(" ");
	}
	render() {
		if (!this.signal) return b``;
		let e = this.signal.shape === "enum" || this.signal.shape === "state_machine", t = e ? ln(en(this.signal)).join(" · ") : "", n = this.signal.min ?? 0, r = this.signal.max ?? 100;
		return b`<svg viewBox="0 0 ${fn} ${pn}" role="img">
        ${Ee`<polyline points=${this.points(this.signal)}></polyline>`}
      </svg>
      <div>${e ? t : `${n} – ${r} ${this.unit}`}</div>`;
	}
};
N([D({ attribute: !1 })], gn.prototype, "signal", void 0), N([D()], gn.prototype, "unit", void 0), gn = N([E("tdc-signal-preview")], gn);
// src/signals/curve-editor.ts
var _n = {
	min: "edMin",
	max: "edMax",
	decimals: "edDecimals",
	period_s: "edPeriod",
	interval_s: "edInterval",
	phase: "edPhase",
	rate_per_hour: "edRate",
	noise: "edNoise"
}, vn = {
	values: "edValues",
	weights: "edWeights",
	states: "edStates"
}, V = class extends P {
	constructor(...e) {
		super(...e), this.shapes = [], this.unit = "";
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent("tdc-signal-change", { detail: e }));
	}
	numberField(e) {
		return b`<label style="flex: 1 1 120px"
      >${this.tr(_n[e])}
      <input
        type="number"
        step="any"
        .value=${this.signal[e] === void 0 ? "" : String(this.signal[e])}
        @input=${(t) => this.emit(kt(this.signal, e, t.target.value))}
      />
    </label>`;
	}
	listField(e) {
		return this.textField(this.tr(vn[e]), jt(this.signal, e), (t) => this.emit(Mt(this.signal, e, t)), { flex: "1 1 240px" });
	}
	render() {
		return b`
      <div class="row form">
        <label style="flex: 1 1 180px"
          >${this.tr("edShape")}
          <select
            @change=${(e) => this.emit(Pt(this.signal, e.target.value))}
          >
            ${M(this.hass?.language, this.shapes, (e) => A(this.hass?.language, "shape", e)).map((e) => b`<option value=${e} ?selected=${e === this.signal.shape}>
                  ${A(this.hass?.language, "shape", e)}
                </option>`)}
          </select>
        </label>
        ${Et(this.signal.shape) ? "" : b`${this.numberField("min")} ${this.numberField("max")}
              ${this.numberField("decimals")}`}
      </div>
      <div class="row form">
        ${Dt(this.signal.shape).map((e) => this.numberField(e))}
        ${Ot(this.signal.shape).map((e) => this.listField(e))}
      </div>
      <tdc-signal-preview .signal=${this.signal} unit=${this.unit}></tdc-signal-preview>
    `;
	}
};
N([D({ attribute: !1 })], V.prototype, "signal", void 0), N([D({ attribute: !1 })], V.prototype, "shapes", void 0), N([D()], V.prototype, "unit", void 0), V = N([E("tdc-curve-editor")], V);
// src/devices/helpers.ts
var yn = {
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
}, bn = "fault_";
function xn(e, t) {
	let n = e[t] ?? [];
	return {
		plain: n.filter((e) => !e.startsWith("fault_") && !(e in yn)),
		withValue: n.filter((e) => e in yn),
		faults: n.filter((e) => e.startsWith(bn)).map((e) => e.slice(6))
	};
}
function Sn(e, t) {
	let n = yn[e], r = Number(t);
	if (n && t.trim() !== "" && !Number.isNaN(r) && !(r < n.min || r > n.max)) return { [n.param]: r };
}
function Cn(e) {
	let t = Number(e);
	return e.trim() !== "" && t > 0 ? { duration_s: t } : void 0;
}
function wn(e, t) {
	let n = [...Object.values(e ?? {}).map((e) => e.name), ...t.flatMap((e) => e.area ? [e.area] : [])];
	return [...new Set(n)].sort((e, t) => e.localeCompare(t));
}
// src/devices/device-detail.ts
var H = class extends P {
	constructor(...e) {
		super(...e), this.actions = {}, this.areas = [], this.shapes = [], this.picked = {}, this.inputs = {}, this.curves = {}, this.busy = !1, this.error = "";
	}
	static {
		this.styles = [P.styles, o`
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
			this.error = k(e);
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
		return b`<div class="row area-row">
      <label style="flex: 0 1 320px"
        >${this.tr("detArea")}
        <input
          list="tdc-areas"
          .value=${e}
          placeholder=${this.tr("detAreaNone")}
          @input=${(e) => this.areaDraft = e.target.value}
        />
        <datalist id="tdc-areas">
          ${this.areas.map((e) => b`<option value=${e}></option>`)}
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
		let t = this.hass?.language, n = xn(this.actions, e.platform);
		return M(t, [
			...n.plain,
			...n.withValue,
			...n.faults.map((e) => `${bn}${e}`)
		], (e) => j(t, e)).map((e) => ({
			value: e,
			label: j(t, e)
		}));
	}
	pick(e, t) {
		t in yn || t.startsWith("fault_") ? this.picked = {
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
		let n = yn[t], r = `${e.key}:${t}`, i = this.inputs[r] ?? String(n ? n.start : 60), a = n ? Sn(t, i) : Cn(i);
		return b`<span class="row">
      <strong>${j(this.hass?.language, t)}</strong>
      <input
        type="number"
        min=${n ? n.min : 1}
        max=${n ? n.max : S}
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
		return b`<tr>
      <td colspan="3" class="curve">
        <tdc-curve-editor
          .hass=${this.hass}
          .signal=${this.curves[e.key]}
          .shapes=${this.shapes.filter((e) => !Et(e))}
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
		let t = this.hass?.language, n = this.menuItems(e), r = e.signal != null && !Et(e.signal.shape);
		return b`<tr>
        <td>
          ${it(t, e.key, e.name)}<br /><small
            >${A(t, "platform", e.platform)}</small
          >
        </td>
        <td>
          ${at(t, e.state)}${e.unit ? ` ${e.unit}` : ""}${e.fault ? b`<br /><small class="warning">⚠ ${A(t, "fault", e.fault)}</small>` : ""}
        </td>
        <td class="row">
          ${n.length ? b`<tdc-menu-button
                  .hass=${this.hass}
                  label=${this.tr("detActions")}
                  ?disabled=${this.busy}
                  .items=${n}
                  @tdc-pick=${(t) => this.pick(e, t.detail)}
                ></tdc-menu-button>` : ""}
          ${this.renderPicked(e)}
          ${r ? b`<button
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
		return b`
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
N([D({ attribute: !1 })], H.prototype, "device", void 0), N([D({ attribute: !1 })], H.prototype, "actions", void 0), N([D({ attribute: !1 })], H.prototype, "areas", void 0), N([D({ attribute: !1 })], H.prototype, "shapes", void 0), N([O()], H.prototype, "areaDraft", void 0), N([O()], H.prototype, "picked", void 0), N([O()], H.prototype, "inputs", void 0), N([O()], H.prototype, "curves", void 0), N([O()], H.prototype, "busy", void 0), N([O()], H.prototype, "error", void 0), H = N([E("tdc-device-detail")], H);
// src/devices/device-list.ts
var Tn = 200, En = 1e4, Dn = {
	switch: "toggle",
	event: "press",
	binary_sensor: "pulse",
	light: "toggle"
}, On = "fire:", kn = "remove", An = [
	"sensor",
	"switch",
	"binary_sensor",
	"light",
	"cover",
	"climate"
], U = class extends P {
	constructor(...e) {
		super(...e), this.devices = [], this.total = 0, this.loaded = !1, this.error = "", this.expanded = /* @__PURE__ */ new Set();
	}
	static {
		this.styles = [
			P.styles,
			ot,
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
		super.connectedCallback(), this.loadInfo(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), En);
	}
	disconnectedCallback() {
		window.clearInterval(this.timer), super.disconnectedCallback();
	}
	async loadInfo() {
		try {
			this.info = await this.api.info();
		} catch (e) {
			this.error = k(e);
		}
	}
	toggle(e) {
		let t = new Set(this.expanded);
		t.delete(e) || t.add(e), this.expanded = t;
	}
	async refresh(e = !1) {
		let t = Math.max(Tn, this.devices.length + (e ? Tn : 0));
		try {
			let e = await this.api.devices(0, t);
			this.devices = e.devices, this.total = e.total, this.error = "";
		} catch (e) {
			this.error = k(e);
		}
		this.loaded = !0;
	}
	async fire(e, t) {
		try {
			await this.api.fire(e.id, t.key, Dn[t.platform]), await this.refresh();
		} catch (e) {
			this.error = k(e);
		}
	}
	menuItems(e) {
		let t = this.hass?.language;
		return M(t, [...e.entities.filter((e) => e.platform in Dn).map((e) => ({
			value: `${On}${e.key}`,
			label: `${it(t, e.key, e.name)} – ${j(t, Dn[e.platform])}`
		})), {
			value: kn,
			label: this.tr("remove")
		}], (e) => e.label);
	}
	pick(e, t) {
		if (t === kn) {
			this.dispatchEvent(new CustomEvent("tdc-remove", { detail: {
				target: "device",
				id: e.id
			} }));
			return;
		}
		let n = e.entities.find((e) => `${On}${e.key}` === t);
		n && this.fire(e, n);
	}
	values(e) {
		let t = this.hass?.language;
		return e.entities.filter((e) => An.includes(e.platform)).slice(0, 4).map((e) => {
			let n = e.unit ? ` ${e.unit}` : "", r = e.fault ? ` ⚠ ${A(t, "fault", e.fault)}` : "";
			return `${it(t, e.key, e.name)}: ${at(t, e.state)}${n}${r}`;
		}).join(" · ");
	}
	templateName(e) {
		return e.template === "custom" ? this.tr("customTemplate") : rt(this.hass?.language, e.template, e.model);
	}
	renderRow(e) {
		let t = this.expanded.has(e.id);
		return b`<tr class="device card" @click=${() => this.toggle(e.id)}>
        <td class="name nowrap">${t ? "▾" : "▸"} ${e.name}</td>
        <td class="nowrap" data-label=${this.tr("colTemplate")}>${this.templateName(e)}</td>
        <td class="nowrap" data-label=${this.tr("colArea")}>${e.area ?? "–"}</td>
        <td class="nowrap" data-label=${this.tr("colOutput")}>
          ${this.tr(et[e.output] ?? "outputNative")}
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
      ${t ? b`<tr>
              <td colspan="6">
                <tdc-device-detail
                  .hass=${this.hass}
                  .device=${e}
                  .actions=${this.info?.actions ?? {}}
                  .shapes=${this.info?.shapes ?? []}
                  .areas=${wn(this.hass.areas, this.devices)}
                  @tdc-changed=${() => void this.refresh()}
                ></tdc-device-detail>
              </td>
            </tr>` : ""}`;
	}
	render() {
		return this.loaded ? b`
      ${this.error ? b`<p class="error">${this.error}</p>` : ""}
      ${this.devices.length === 0 ? b`<p>${this.tr("noDevices")}</p>` : b`<table class="cards">
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
                  ${yt(this.devices, (e) => e.id, (e) => this.renderRow(e))}
                </tbody>
              </table>
              <p class="row">
                <small>
                  ${this.tr("devicesOf", {
			shown: this.devices.length,
			total: this.total
		})}
                </small>
                ${this.devices.length < this.total ? b`<button @click=${() => void this.refresh(!0)}>
                        ${this.tr("loadMore")}
                      </button>` : ""}
              </p>`}
    ` : b`${this.tr("loading")}`;
	}
};
N([O()], U.prototype, "devices", void 0), N([O()], U.prototype, "total", void 0), N([O()], U.prototype, "loaded", void 0), N([O()], U.prototype, "error", void 0), N([O()], U.prototype, "info", void 0), N([O()], U.prototype, "expanded", void 0), U = N([E("tdc-device-list")], U);
// src/common/polling.ts
var jn = 1e4, W = class extends P {
	constructor(...e) {
		super(...e), this.templates = [], this.message = "", this.error = "", this.busy = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this.loadOptions(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), jn);
	}
	disconnectedCallback() {
		window.clearInterval(this.timer), super.disconnectedCallback();
	}
	async loadOptions() {
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.optionsLoaded(this.info);
		} catch (e) {
			this.error = k(e);
		}
	}
	async run(e) {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let t = await e();
			this.message = typeof t == "string" ? t : "", await this.refresh();
		} catch (e) {
			this.error = k(e);
		}
		this.busy = !1;
	}
};
N([O()], W.prototype, "info", void 0), N([O()], W.prototype, "templates", void 0), N([O()], W.prototype, "message", void 0), N([O()], W.prototype, "error", void 0), N([O()], W.prototype, "busy", void 0);
// src/wizard/helpers.ts
function Mn(e) {
	return e.split(",").map((e) => e.trim()).filter((e) => e.length > 0);
}
function Nn(e, t) {
	return Math.round(e / Math.max(1, t) * 10) / 10;
}
// src/group/group-panel.ts
var Pn = 500, G = class extends W {
	constructor(...e) {
		super(...e), this.groups = [], this.names = {}, this.name = "", this.members = "";
	}
	static {
		this.styles = [P.styles, ot];
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			let [e, t] = await Promise.all([this.api.groups(), this.api.devices(0, Pn)]);
			this.groups = e, this.names = Object.fromEntries(t.devices.map((e) => [e.id, e.name]));
		} catch (e) {
			this.error = k(e);
		}
	}
	async add() {
		await this.run(async () => {
			await this.api.addGroup(this.name, Mn(this.members)), this.name = "", this.members = "";
		});
	}
	renderRow(e) {
		let t = e.members.map((e) => this.names[e] ?? e).join(", ");
		return b`<tr class="card">
      <td class="name">
        ${e.name}<br /><small>${this.tr("grpNumber", { number: e.number })}</small>
      </td>
      <td data-label=${this.tr("grpMembers")}>${t}</td>
      <td data-label=${this.tr("colActions")}>
        <button
          ?disabled=${this.busy}
          @click=${() => void this.run(() => this.api.removeGroup(e.id))}
        >
          ${this.tr("remove")}
        </button>
      </td>
    </tr>`;
	}
	render() {
		return b`
      ${this.groups.length === 0 ? b`<p>${this.tr("grpNone")}</p>` : b`<table class="cards">
              <tr>
                <th>${this.tr("colName")}</th>
                <th>${this.tr("grpMembers")}</th>
                <th>${this.tr("colActions")}</th>
              </tr>
              ${this.groups.map((e) => this.renderRow(e))}
            </table>`}
      <h3>${this.tr("grpNew")}</h3>
      <div class="row">
        ${this.textField(this.tr("colName"), this.name, (e) => this.name = e)}
        ${this.textField(this.tr("grpMembers"), this.members, (e) => this.members = e, { flex: "2 1 320px" })}
        <button
          class="primary"
          ?disabled=${this.busy || !this.name.trim() || !this.members.trim()}
          @click=${() => void this.add()}
        >
          ${this.tr("grpAdd")}
        </button>
      </div>
      <p class="error">${this.error}</p>
    `;
	}
};
N([O()], G.prototype, "groups", void 0), N([O()], G.prototype, "names", void 0), N([O()], G.prototype, "name", void 0), N([O()], G.prototype, "members", void 0), G = N([E("tdc-group-panel")], G);
function Fn(e) {
	return Math.min(365, Math.max(1, Math.round(e) || 1));
}
// src/history/history-panel.ts
var K = class extends P {
	constructor(...e) {
		super(...e), this.days = 7, this.device = "", this.entity = "", this.busy = !1, this.message = "", this.error = "";
	}
	async importHistory() {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let e = await this.api.importHistory(Fn(this.days), this.device.trim() || void 0, this.entity.trim() || void 0);
			this.message = this.tr("histDone", { ...e });
		} catch (e) {
			this.error = k(e);
		}
		this.busy = !1;
	}
	render() {
		return b`
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
N([O()], K.prototype, "days", void 0), N([O()], K.prototype, "device", void 0), N([O()], K.prototype, "entity", void 0), N([O()], K.prototype, "busy", void 0), N([O()], K.prototype, "message", void 0), N([O()], K.prototype, "error", void 0), K = N([E("tdc-history-panel")], K);
// src/removal/removal-panel.ts
var In = {
	all: "targetAll",
	device: "targetDevice",
	run: "targetRun"
}, q = class extends P {
	constructor(...e) {
		super(...e), this.target = "all", this.targetId = "", this.busy = !1, this.message = "", this.error = "";
	}
	async showPlan() {
		this.message = "", this.error = "";
		try {
			this.plan = await this.api.removalPlan(this.target, this.targetId || void 0);
		} catch (e) {
			this.plan = void 0, this.error = k(e);
		}
	}
	async confirm() {
		this.busy = !0;
		try {
			let e = await this.api.removalRun(this.target, this.targetId || void 0);
			this.message = this.tr("removed", { count: e.devices + e.orphans }), this.plan = void 0;
		} catch (e) {
			this.error = k(e);
		}
		this.busy = !1;
	}
	renderPlan(e) {
		return e.devices.length + e.orphans.length === 0 && e.runs.length === 0 ? b`<p>${this.tr("planNothing")}</p>` : b`<ul>
        <li>${this.tr("planDevices", { count: e.devices.length })}</li>
        ${e.groups.length ? b`<li>${this.tr("planGroups", { count: e.groups.length })}</li>` : ""}
        ${e.topics.length ? b`<li>${this.tr("planTopics", { count: e.topics.length })}</li>` : ""}
        ${e.statistics.length ? b`<li>${this.tr("planStatistics", { count: e.statistics.length })}</li>` : ""}
        ${e.scenarios.length ? b`<li>${this.tr("planScenarios", { count: e.scenarios.length })}</li>` : ""}
        ${e.schedules.length ? b`<li>${this.tr("planSchedules", { count: e.schedules.length })}</li>` : ""}
        ${e.orphans.length ? b`<li>${this.tr("planOrphans", { count: e.orphans.length })}</li>` : ""}
        ${e.areas.length ? b`<li>${this.tr("planAreas", { names: e.areas.join(", ") })}</li>` : ""}
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
		return b`
      <div class="row">
        <label style="flex: 0 0 280px"
          >${this.tr("target")}
          <select
            @change=${(e) => {
			this.target = e.target.value, this.plan = void 0;
		}}
          >
            ${M(this.hass?.language, Object.keys(In), (e) => this.tr(In[e])).map((e) => b`<option value=${e} ?selected=${this.target === e}>
                  ${this.tr(In[e])}
                </option>`)}
          </select>
        </label>
        ${this.target === "all" ? "" : this.textField(this.tr("targetId"), this.targetId, (e) => this.targetId = e, { flex: "1 1 260px" })}
        <button @click=${() => void this.showPlan()}>${this.tr("showPlan")}</button>
      </div>
      ${this.plan ? this.renderPlan(this.plan) : ""}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
N([D()], q.prototype, "target", void 0), N([D()], q.prototype, "targetId", void 0), N([O()], q.prototype, "plan", void 0), N([O()], q.prototype, "busy", void 0), N([O()], q.prototype, "message", void 0), N([O()], q.prototype, "error", void 0), q = N([E("tdc-removal-panel")], q);
// src/schedule/helpers.ts
function Ln() {
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
function Rn(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function zn(e) {
	switch (e.type) {
		case "times": return e.weekdays.length ? {
			type: "times",
			times: Rn(e.times),
			weekdays: [...e.weekdays].sort()
		} : {
			type: "times",
			times: Rn(e.times)
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
function Bn(e, t) {
	switch (e) {
		case "all": return { all: !0 };
		case "template": return { template: t };
		case "device": return { device: t };
		case "run": return { run: t };
	}
}
function Vn(e) {
	return "template" in e ? {
		kind: "template",
		id: e.template
	} : "device" in e ? {
		kind: "device",
		id: e.device
	} : "run" in e ? {
		kind: "run",
		id: e.run
	} : {
		kind: "all",
		id: ""
	};
}
function Hn(e) {
	switch (e.type) {
		case "times": return e.times.join(", ");
		case "interval": return `${e.every_s} s (${e.start}–${e.end})`;
		case "once": return e.at.replace("T", " ");
		case "random_window": return `${e.count}× ${e.start}–${e.end}`;
		case "poisson": return `Ø ${e.per_day}/d`;
	}
}
function Un(e) {
	return e.slice(0, 16).replace("T", " ");
}
function Wn(e) {
	return Object.entries(e).flatMap(([e, t]) => t.map((t) => `${e}/${t}`));
}
function Gn(e) {
	return {
		kind: "all",
		targetId: "",
		actionKey: Wn(e)[0] ?? "",
		entity: ""
	};
}
function Kn(e, t) {
	let n = t.split("/")[0], r = e.flatMap((e) => e.entities.filter((e) => e.platform === n).map((e) => e.key));
	return [...new Set(r)];
}
function qn(e, t) {
	return {
		target: Bn(e.kind, e.targetId),
		entity: e.entity || Kn(t, e.actionKey)[0] || "",
		action: e.actionKey.split("/")[1] ?? ""
	};
}
function Jn(e) {
	let t = {
		...Ln(),
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
function Yn(e, t, n) {
	let { kind: r, id: i } = Vn(e.target), a = Object.entries(t).filter(([, t]) => t.includes(e.action)).map(([e]) => e), o = a.find((t) => n.some((n) => n.entities.some((n) => n.platform === t && n.key === e.entity))) ?? a[0];
	return {
		kind: r,
		targetId: i,
		actionKey: o ? `${o}/${e.action}` : "",
		entity: e.entity
	};
}
// src/schedule/work-picker.ts
var Xn = [
	"all",
	"template",
	"device",
	"run"
], J = class extends P {
	constructor(...e) {
		super(...e), this.actions = {}, this.templates = [];
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent("tdc-work-change", { detail: {
			...this.work,
			...e
		} }));
	}
	render() {
		let e = Kn(this.templates, this.work.actionKey);
		return b`
      <div class="row">
        ${this.select(this.tr("schTarget"), Xn, this.work.kind, (e) => this.tr(`schTarget_${e}`), (e) => this.emit({ kind: e }))}
        ${this.work.kind === "all" ? S : this.textField(this.tr("targetId"), this.work.targetId, (e) => this.emit({ targetId: e }))}
        ${this.select(this.tr("schAction"), Wn(this.actions), this.work.actionKey, (e) => nt(this.hass?.language, e), (e) => this.emit({
			actionKey: e,
			entity: ""
		}))}
        ${this.select(this.tr("schEntity"), e, this.work.entity || e[0] || "", (e) => A(this.hass?.language, "entity", e), (e) => this.emit({ entity: e }))}
      </div>
    `;
	}
};
N([D({ attribute: !1 })], J.prototype, "work", void 0), N([D({ attribute: !1 })], J.prototype, "actions", void 0), N([D({ attribute: !1 })], J.prototype, "templates", void 0), J = N([E("tdc-work-picker")], J);
// src/scenario/helpers.ts
function Zn(e) {
	return {
		afterS: 0,
		work: Gn(e),
		params: ""
	};
}
function Qn(e) {
	if (e.trim() === "") return {};
	try {
		let t = JSON.parse(e);
		return typeof t == "object" && t && !Array.isArray(t) ? t : void 0;
	} catch {
		return;
	}
}
function $n(e, t) {
	let n = [];
	for (let r of e) {
		let e = Qn(r.params);
		if (e === void 0) return;
		n.push({
			after_s: Math.max(0, r.afterS || 0),
			...qn(r.work, t),
			params: e
		});
	}
	return n;
}
// src/scenario/scenario-panel.ts
var er = class extends W {
	constructor(...e) {
		super(...e), this.scenarios = [], this.name = "", this.steps = [];
	}
	static {
		this.styles = [P.styles, ot];
	}
	optionsLoaded(e) {
		this.steps = [Zn(e.actions)];
	}
	async refresh() {
		try {
			this.scenarios = await this.api.scenarios();
		} catch (e) {
			this.error = k(e);
		}
	}
	async add() {
		let e = $n(this.steps, this.templates);
		e ? await this.run(async () => {
			await this.api.addScenario(this.name, e), this.name = "", this.steps = [Zn(this.info?.actions ?? {})];
		}) : this.error = this.tr("scnBadParams");
	}
	async start(e) {
		await this.run(async () => {
			let { steps: t } = await this.api.runScenario(e.id);
			return this.tr("scnStarted", { count: t });
		});
	}
	setStep(e, t) {
		this.steps = this.steps.map((n, r) => r === e ? {
			...n,
			...t
		} : n);
	}
	renderStep(e, t) {
		return b`<fieldset>
      <legend>${this.tr("scnStep", { number: t + 1 })}</legend>
      <div class="row">
        <label style="flex: 1 1 180px"
          >${this.tr("scnAfter")}
          <input
            type="number"
            min="0"
            .value=${String(e.afterS)}
            @input=${(e) => this.setStep(t, { afterS: Number(e.target.value) })}
          />
        </label>
        ${this.textField(this.tr("scnParams"), e.params, (e) => this.setStep(t, { params: e }), { placeholder: this.tr("scnParamsHint") })}
        <button
          ?disabled=${this.steps.length < 2}
          @click=${() => this.steps = this.steps.filter((e, n) => n !== t)}
        >
          ${this.tr("remove")}
        </button>
      </div>
      <tdc-work-picker
        .hass=${this.hass}
        .work=${e.work}
        .actions=${this.info?.actions ?? {}}
        .templates=${this.templates}
        @tdc-work-change=${(e) => this.setStep(t, { work: e.detail })}
      ></tdc-work-picker>
    </fieldset>`;
	}
	renderForm() {
		return b`
      <h3>${this.tr("scnNew")}</h3>
      <div class="row">
        ${this.textField(this.tr("schName"), this.name, (e) => this.name = e)}
      </div>
      ${this.steps.map((e, t) => this.renderStep(e, t))}
      <p class="row">
        <button
          @click=${() => this.steps = [...this.steps, Zn(this.info?.actions ?? {})]}
        >
          ${this.tr("scnAddStep")}
        </button>
        <button
          class="primary"
          ?disabled=${this.busy || !this.name.trim() || this.steps.length === 0}
          @click=${() => void this.add()}
        >
          ${this.tr("scnCreate")}
        </button>
      </p>
    `;
	}
	renderRow(e) {
		let t = e.steps[0], { kind: n } = t ? Vn(t.target) : { kind: "all" };
		return b`<tr class="card">
      <td class="name">${e.name}</td>
      <td data-label=${this.tr("scnSteps")}>
        ${this.tr("scnStepCount", { count: e.steps.length })}<br /><small
          >${t ? `${A(this.hass?.language, "entity", t.entity)}: ${j(this.hass?.language, t.action)} · ${this.tr(`schTarget_${n}`)}` : ""}</small
        >
      </td>
      <td data-label=${this.tr("colActions")}>
        <button class="primary" ?disabled=${this.busy} @click=${() => void this.start(e)}>
          ${this.tr("scnRun")}
        </button>
        <button
          ?disabled=${this.busy}
          @click=${() => void this.run(() => this.api.removeScenario(e.id).then(() => void 0))}
        >
          ${this.tr("remove")}
        </button>
      </td>
    </tr>`;
	}
	render() {
		return b`
      ${this.scenarios.length === 0 ? b`<p>${this.tr("scnNone")}</p>` : b`<table class="cards">
              <tr>
                <th>${this.tr("schName")}</th>
                <th>${this.tr("scnSteps")}</th>
                <th>${this.tr("colActions")}</th>
              </tr>
              ${this.scenarios.map((e) => this.renderRow(e))}
            </table>`}
      ${this.renderForm()}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
N([O()], er.prototype, "scenarios", void 0), N([O()], er.prototype, "name", void 0), N([O()], er.prototype, "steps", void 0), er = N([E("tdc-scenario-panel")], er);
// src/schedule/schedule-form.ts
var tr = [
	"times",
	"interval",
	"once",
	"random_window",
	"poisson"
], nr = [
	"weekdayMon",
	"weekdayTue",
	"weekdayWed",
	"weekdayThu",
	"weekdayFri",
	"weekdaySat",
	"weekdaySun"
], Y = class extends P {
	constructor(...e) {
		super(...e), this.templates = [], this.scenarios = [], this.submitLabel = "", this.busy = !1, this.name = "", this.scenarioId = "", this.work = Gn({}), this.seed = "", this.form = Ln();
	}
	willUpdate(e) {
		let t = this.info?.actions;
		this.schedule && t && this.loadedId !== this.schedule.id ? (this.loadedId = this.schedule.id, this.name = this.schedule.name, this.scenarioId = this.schedule.scenario ?? "", this.work = Yn(this.schedule, t, this.templates), this.form = Jn(this.schedule.trigger)) : !this.schedule && t && !this.work.actionKey && (this.work = Gn(t)), super.willUpdate(e);
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
		let e = this.scenarioId ? { scenario: this.scenarioId } : qn(this.work, this.templates), t = this.schedule && "action" in e && e.action === this.schedule.action;
		return {
			name: this.name,
			...e,
			trigger: zn(this.form),
			seed: this.seed || void 0,
			...this.schedule ? {
				params: t ? this.schedule.params : {},
				enabled: this.schedule.enabled
			} : {}
		};
	}
	submit() {
		this.dispatchEvent(new CustomEvent("tdc-submit", { detail: this.request() }));
	}
	field(e, t, n = "text") {
		let r = n === "number";
		return b`<label style="flex: 1 1 140px"
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
		return b`<div class="row">
      ${nr.map((e, t) => b`<label style="flex-direction: row; align-items: center">
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
			case "times": return b`${this.field(this.tr("schTimes"), "times")} ${this.renderWeekdays()}`;
			case "interval": return b`${this.field(this.tr("schEveryS"), "everyS", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case "once": return this.field(this.tr("schAt"), "at", "datetime-local");
			case "random_window": return b`${this.field(this.tr("schCount"), "count", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case "poisson": return this.field(this.tr("schPerDay"), "perDay", "number");
		}
	}
	render() {
		return b`
      <div class="row form">
        ${this.textField(this.tr("schName"), this.name, (e) => this.name = e)}
        ${this.select(this.tr("schTrigger"), tr, this.form.type, (e) => this.tr(`schTrigger_${e}`), (e) => this.setForm({ type: e }))}
        ${this.select(this.tr("schRuns"), ["", ...this.scenarios.map((e) => e.id)], this.scenarioId, (e) => e ? this.tr("schScenario", { id: this.scenarioName(e) }) : this.tr("schRunsAction"), (e) => this.scenarioId = e)}
      </div>
      ${this.scenarioId ? S : b`<tdc-work-picker
              .hass=${this.hass}
              .work=${this.work}
              .actions=${this.info?.actions ?? {}}
              .templates=${this.templates}
              @tdc-work-change=${(e) => this.work = e.detail}
            ></tdc-work-picker>`}
      <div class="row form">
        ${this.renderTriggerFields()}
        ${this.textField(this.tr("seed"), this.seed, (e) => this.seed = e, {
			flex: "1 1 140px",
			placeholder: this.tr(this.schedule ? "schSeedKeep" : "seedHint")
		})}
      </div>
      <p class="row">
        <button
          class="primary"
          ?disabled=${this.busy || !this.name.trim() || !(this.scenarioId || this.work.actionKey)}
          @click=${() => this.submit()}
        >
          ${this.submitLabel}
        </button>
        ${this.schedule ? b`<button
                ?disabled=${this.busy}
                @click=${() => this.dispatchEvent(new CustomEvent("tdc-cancel"))}
              >
                ${this.tr("detCancel")}
              </button>` : S}
      </p>
    `;
	}
};
N([D({ attribute: !1 })], Y.prototype, "info", void 0), N([D({ attribute: !1 })], Y.prototype, "templates", void 0), N([D({ attribute: !1 })], Y.prototype, "scenarios", void 0), N([D({ attribute: !1 })], Y.prototype, "schedule", void 0), N([D()], Y.prototype, "submitLabel", void 0), N([D({ type: Boolean })], Y.prototype, "busy", void 0), N([O()], Y.prototype, "name", void 0), N([O()], Y.prototype, "scenarioId", void 0), N([O()], Y.prototype, "work", void 0), N([O()], Y.prototype, "seed", void 0), N([O()], Y.prototype, "form", void 0), Y = N([E("tdc-schedule-form")], Y);
// src/schedule/schedule-panel.ts
var rr = 24, ir = 50, X = class extends W {
	constructor(...e) {
		super(...e), this.schedules = [], this.runs = [], this.scenarios = [], this.expanded = /* @__PURE__ */ new Set();
	}
	static {
		this.styles = [
			P.styles,
			ot,
			o`
      tr.schedule {
        cursor: pointer;
      }
      tr.schedule:hover {
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
			[this.schedules, this.runs, this.scenarios] = await Promise.all([
				this.api.schedules(),
				this.api.schedulePreview(rr),
				this.api.scenarios()
			]), this.error = "";
		} catch (e) {
			this.error = k(e);
		}
	}
	async add(e) {
		await this.run(async () => {
			await this.api.addSchedule(e), this.newForm?.reset();
		});
	}
	async save(e, t) {
		await this.run(async () => {
			await this.api.updateSchedule(e.id, t), this.toggle(e.id);
		});
	}
	toggle(e) {
		let t = new Set(this.expanded);
		t.delete(e) || t.add(e), this.expanded = t;
	}
	scenarioName(e) {
		return this.scenarios.find((t) => t.id === e)?.name ?? e;
	}
	renderForm() {
		return b`
      <h3>${this.tr("schNew")}</h3>
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
    `;
	}
	renderRow(e) {
		let { kind: t, id: n } = Vn(e.target), r = this.hass?.language, i = this.expanded.has(e.id);
		return b`<tr class="schedule card" @click=${() => this.toggle(e.id)}>
        <td class="name">${i ? "▾" : "▸"} ${e.name}</td>
        <td data-label=${this.tr("schTarget")}>
          ${e.scenario ? "–" : `${this.tr(`schTarget_${t}`)}${n ? ` ${n}` : ""}`}
        </td>
        <td data-label=${this.tr("schAction")}>
          ${e.scenario ? this.tr("schScenario", { id: this.scenarioName(e.scenario) }) : `${A(r, "entity", e.entity)}: ${j(r, e.action)}`}
        </td>
        <td data-label=${this.tr("schTrigger")}>
          ${this.tr(`schTrigger_${e.trigger.type}`)}<br /><small
            >${Hn(e.trigger)}</small
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
            @change=${(t) => void this.run(() => this.api.enableSchedule(e.id, t.target.checked))}
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
      ${i ? b`<tr>
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
            </tr>` : S}`;
	}
	renderList() {
		return this.schedules.length === 0 ? b`<p>${this.tr("schNone")}</p>` : b`<table class="cards">
      <tr>
        <th>${this.tr("schName")}</th>
        <th>${this.tr("schTarget")}</th>
        <th>${this.tr("schAction")}</th>
        <th>${this.tr("schTrigger")}</th>
        <th>${this.tr("schEnabled")}</th>
        <th>${this.tr("colActions")}</th>
      </tr>
      ${yt(this.schedules, (e) => e.id, (e) => this.renderRow(e))}
    </table>`;
	}
	renderPreview() {
		return this.runs.length === 0 ? b`<p><small>${this.tr("schNoRuns")}</small></p>` : b`<table>
        <tr>
          <th>${this.tr("schWhen")}</th>
          <th>${this.tr("schName")}</th>
        </tr>
        ${this.runs.slice(0, ir).map((e) => b`<tr>
              <td>${Un(e.when)}</td>
              <td>${e.name}</td>
            </tr>`)}
      </table>
      ${this.runs.length > ir ? b`<p>
              <small>${this.tr("schMoreRuns", { count: this.runs.length - ir })}</small>
            </p>` : S}`;
	}
	render() {
		return b`
      ${this.renderForm()}
      <h3>${this.tr("schPreview", { hours: rr })}</h3>
      ${this.renderPreview()}
      <h3>${this.tr("schList")}</h3>
      ${this.renderList()}
      <p class="error">${this.error}</p>
    `;
	}
};
N([O()], X.prototype, "schedules", void 0), N([O()], X.prototype, "runs", void 0), N([O()], X.prototype, "scenarios", void 0), N([O()], X.prototype, "expanded", void 0), N([Ke("tdc-schedule-form#new")], X.prototype, "newForm", void 0), X = N([E("tdc-schedule-panel")], X);
// node_modules/lit-html/directives/live.js
var ar = ct(class extends lt {
	constructor(e) {
		if (super(e), e.type !== F.PROPERTY && e.type !== F.ATTRIBUTE && e.type !== F.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
		if (!ft(e)) throw Error("`live` bindings can only contain a single expression");
	}
	render(e) {
		return e;
	}
	update(e, [t]) {
		if (t === x || t === S) return t;
		let n = e.element, r = e.name;
		if (e.type === F.PROPERTY) {
			if (t === n[r]) return x;
		} else if (e.type === F.BOOLEAN_ATTRIBUTE) {
			if (!!t === n.hasAttribute(r)) return x;
		} else if (e.type === F.ATTRIBUTE && n.getAttribute(r) === t + "") return x;
		return ht(e), t;
	}
});
// src/common/multi-select.ts
function or(e, t, n) {
	let r = t.trim();
	if (!r) return e;
	let i = e.filter((e) => e !== r);
	return n ? [...i, r] : i;
}
var sr = class extends xt {
	constructor(...e) {
		super(...e), this.options = [], this.selected = [], this.draft = "";
	}
	static {
		this.styles = [
			P.styles,
			bt,
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
		this.emit(or(this.selected, this.draft, !0)), this.draft = "";
	}
	render() {
		let e = M(this.hass?.language, [.../* @__PURE__ */ new Set([...this.options, ...this.selected])], (e) => e);
		return b`
      <button
        class="trigger"
        aria-haspopup="listbox"
        aria-expanded=${this.open ? "true" : "false"}
        @click=${() => this.open = !this.open}
      >
        ${this.selected.length ? b`<span class="summary">${this.selected.join(", ")}</span>` : b`<span class="summary empty">${this.tr("areasNone")}</span>`}
        <span>▾</span>
      </button>
      ${this.open ? b`<div class="popover" role="listbox" aria-multiselectable="true">
              <div class="row add">
                <input
                  .value=${ar(this.draft)}
                  placeholder=${this.tr("areasAdd")}
                  @input=${(e) => this.draft = e.target.value}
                  @keydown=${(e) => {
			e.key === "Enter" && this.add();
		}}
                />
                <button ?disabled=${!this.draft.trim()} @click=${() => this.add()}>
                  ${this.tr("areasAddButton")}
                </button>
              </div>
              ${e.map((e) => b`<label class="option">
                    <input
                      type="checkbox"
                      .checked=${this.selected.includes(e)}
                      @change=${(t) => this.emit(or(this.selected, e, t.target.checked))}
                    />
                    ${e}
                  </label>`)}
            </div>` : ""}
    `;
	}
};
N([D({ attribute: !1 })], sr.prototype, "options", void 0), N([D({ attribute: !1 })], sr.prototype, "selected", void 0), N([O()], sr.prototype, "draft", void 0), sr = N([E("tdc-multi-select")], sr);
// src/wizard/creation-wizard.ts
var Z = "custom", cr = 50, lr = ["even", "random"], ur = {
	even: "modeEven",
	random: "modeRandom"
}, dr = JSON.stringify([{
	key: "level",
	platform: "sensor",
	name: "Level",
	unit: "%",
	signal: {
		shape: "sine",
		min: 0,
		max: 100
	}
}], null, 2), Q = class extends P {
	constructor(...e) {
		super(...e), this.templates = [], this.template = "", this.count = 10, this.pattern = "{template} {nn}", this.areas = [], this.mode = "even", this.seed = "", this.output = "native", this.custom = dr, this.editIndex = -1, this.busy = !1, this.message = "", this.error = "";
	}
	async connectedCallback() {
		super.connectedCallback();
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.template = this.templates[0]?.id ?? Z;
		} catch (e) {
			this.error = k(e);
		}
	}
	entities() {
		if (this.template === Z) try {
			return JSON.parse(this.custom);
		} catch {
			return [];
		}
		return this.templates.find((e) => e.id === this.template)?.entities ?? [];
	}
	changeSignal(e, t) {
		this.custom = Lt(this.custom, e, t.detail);
	}
	renderEditor() {
		let e = It(this.custom), t = e.find((e) => e.index === this.editIndex) ?? e[0];
		return t ? b`<h3>${this.tr("edSensor")}</h3>
      <p>
        <select
          @change=${(e) => this.editIndex = Number(e.target.value)}
        >
          ${M(this.hass?.language, e, (e) => e.name).map((e) => b`<option value=${e.index} ?selected=${e.index === t.index}>
                ${e.name}
              </option>`)}
        </select>
      </p>
      <tdc-curve-editor
        .hass=${this.hass}
        .signal=${t.signal}
        .shapes=${this.info?.shapes ?? []}
        @tdc-signal-change=${(e) => this.changeSignal(t.index, e)}
      ></tdc-curve-editor>` : b``;
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
			...this.template === Z ? { entities: this.entities() } : {}
		};
		try {
			let t = await this.api.create(e);
			this.message = this.tr("created", { count: t.devices });
		} catch (e) {
			this.error = k(e);
		}
		this.busy = !1;
	}
	renderEstimate() {
		let e = this.entities(), t = Nn(e.filter((e) => e.platform === "sensor").length * this.count, this.info?.tick_seconds ?? 10);
		return b`<p>
      <small>${this.tr("estimate", {
			entities: e.length * this.count,
			rate: t
		})}</small>
      ${t > cr ? b`<br /><span class="warning">${this.tr("rateWarning")}</span>` : ""}
    </p>`;
	}
	templateOptions() {
		let e = this.hass?.language;
		return M(e, [...this.templates.map((t) => ({
			id: t.id,
			label: rt(e, t.id, t.name)
		})), {
			id: Z,
			label: this.tr("customTemplate")
		}], (e) => e.label);
	}
	render() {
		let e = this.entities().find((e) => e.platform === "sensor" && e.signal);
		return b`
      <div class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr("template")}
          <select @change=${(e) => this.template = e.target.value}>
            ${this.templateOptions().map((e) => b`<option value=${e.id} ?selected=${e.id === this.template}>
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
            .options=${wn(this.hass?.areas, [])}
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
            ${M(this.hass?.language, lr, (e) => this.tr(ur[e])).map((e) => b`<option value=${e} ?selected=${e === this.mode}>
                  ${this.tr(ur[e])}
                </option>`)}
          </select>
        </label>
        ${this.select(this.tr("colOutput"), this.info?.outputs ?? ["native"], this.output, (e) => this.tr(et[e] ?? "outputNative"), (e) => this.output = e)}
        <label style="flex: 0 0 160px"
          >${this.tr("seed")}
          <input
            .value=${this.seed}
            @input=${(e) => this.seed = e.target.value}
          />
          <small>${this.tr("seedHint")}</small>
        </label>
      </p>
      ${this.template === Z ? b`<label
              >${this.tr("customEntities")}
              <textarea
                rows="8"
                .value=${this.custom}
                @input=${(e) => this.custom = e.target.value}
              ></textarea>
            </label>` : ""}
      ${this.template === Z ? this.renderEditor() : ""}
      ${e?.signal && this.template !== Z ? b`<p>
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
N([O()], Q.prototype, "info", void 0), N([O()], Q.prototype, "templates", void 0), N([O()], Q.prototype, "template", void 0), N([O()], Q.prototype, "count", void 0), N([O()], Q.prototype, "pattern", void 0), N([O()], Q.prototype, "areas", void 0), N([O()], Q.prototype, "mode", void 0), N([O()], Q.prototype, "seed", void 0), N([O()], Q.prototype, "output", void 0), N([O()], Q.prototype, "custom", void 0), N([O()], Q.prototype, "editIndex", void 0), N([O()], Q.prototype, "busy", void 0), N([O()], Q.prototype, "message", void 0), N([O()], Q.prototype, "error", void 0), Q = N([E("tdc-creation-wizard")], Q);
// src/panel.ts
var $ = class extends P {
	constructor(...e) {
		super(...e), this.narrow = !1, this.tab = "devices", this.removeTarget = "all", this.removeId = "", this.lapse = 1;
	}
	static {
		this.styles = [P.styles, o`
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
		return b`<button class=${this.tab === e ? "active" : ""} @click=${() => this.tab = e}>
      ${t}
    </button>`;
	}
	render() {
		return b`
      <header>
        <h2>${this.tr("title")}</h2>
        <span class="badge">${this.tr("badge")}</span>
        ${this.lapse > 1 ? b`<span class="badge">${this.tr("badgeLapse", { factor: this.lapse })}</span>` : ""}
      </header>
      <nav>
        ${this.renderTab("devices", this.tr("tabDevices"))}
        ${this.renderTab("create", this.tr("tabCreate"))}
        ${this.renderTab("schedules", this.tr("tabSchedules"))}
        ${this.renderTab("scenarios", this.tr("tabScenarios"))}
        ${this.renderTab("groups", this.tr("tabGroups"))}
        ${this.renderTab("history", this.tr("tabHistory"))}
        ${this.renderTab("remove", this.tr("tabRemove"))}
      </nav>
      ${this.tab === "devices" ? b`<tdc-device-list
              .hass=${this.hass}
              @tdc-remove=${this.startRemoval}
            ></tdc-device-list>` : ""}
      ${this.tab === "create" ? b`<tdc-creation-wizard .hass=${this.hass}></tdc-creation-wizard>` : ""}
      ${this.tab === "schedules" ? b`<tdc-schedule-panel .hass=${this.hass}></tdc-schedule-panel>` : ""}
      ${this.tab === "scenarios" ? b`<tdc-scenario-panel .hass=${this.hass}></tdc-scenario-panel>` : ""}
      ${this.tab === "groups" ? b`<tdc-group-panel .hass=${this.hass}></tdc-group-panel>` : ""}
      ${this.tab === "history" ? b`<tdc-history-panel .hass=${this.hass}></tdc-history-panel>` : ""}
      ${this.tab === "remove" ? b`<tdc-removal-panel
              .hass=${this.hass}
              .target=${this.removeTarget}
              .targetId=${this.removeId}
            ></tdc-removal-panel>` : ""}
    `;
	}
};
N([D({ type: Boolean })], $.prototype, "narrow", void 0), N([O()], $.prototype, "tab", void 0), N([O()], $.prototype, "removeTarget", void 0), N([O()], $.prototype, "removeId", void 0), N([O()], $.prototype, "lapse", void 0), $ = N([E("hass-test-data-creator-panel")], $);
export { $ as TdcPanel };
