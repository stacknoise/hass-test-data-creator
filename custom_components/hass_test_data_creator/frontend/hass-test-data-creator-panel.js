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
var ce = class extends HTMLElement {
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
ce.elementStyles = [], ce.shadowRootOptions = { mode: "open" }, ce[ie("elementProperties")] = /* @__PURE__ */ new Map(), ce[ie("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: ce }), (ee.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var le = globalThis, ue = (e) => e, de = le.trustedTypes, fe = de ? de.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, pe = "$lit$", h = `lit$${Math.random().toFixed(9).slice(2)}$`, me = "?" + h, he = `<${me}>`, ge = document, _e = () => ge.createComment(""), ve = (e) => e === null || typeof e != "object" && typeof e != "function", ye = Array.isArray, be = (e) => ye(e) || typeof e?.[Symbol.iterator] == "function", xe = "[ 	\n\f\r]", Se = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ce = /-->/g, we = />/g, g = RegExp(`>|${xe}(?:([^\\s"'>=/]+)(${xe}*=${xe}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Te = /'/g, Ee = /"/g, De = /^(?:script|style|textarea|title)$/i, Oe = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), _ = Oe(1), ke = Oe(2), v = Symbol.for("lit-noChange"), y = Symbol.for("lit-nothing"), Ae = /* @__PURE__ */ new WeakMap(), b = ge.createTreeWalker(ge, 129);
function je(e, t) {
	if (!ye(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return fe === void 0 ? t : fe.createHTML(t);
}
var Me = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Se;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === Se ? c[1] === "!--" ? o = Ce : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = g) : (De.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = g) : o = we : o === g ? c[0] === ">" ? (o = i ?? Se, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? g : c[3] === "\"" ? Ee : Te) : o === Ee || o === Te ? o = g : o === Ce || o === we ? o = Se : (o = g, i = void 0);
		let d = o === g && e[t + 1].startsWith("/>") ? " " : "";
		a += o === Se ? n + he : l >= 0 ? (r.push(s), n.slice(0, l) + pe + n.slice(l) + h + d) : n + h + (l === -2 ? t : d);
	}
	return [je(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ne = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Me(t, n);
		if (this.el = e.createElement(l, r), b.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = b.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(pe)) {
					let t = u[o++], n = i.getAttribute(e).split(h), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Re : r[1] === "?" ? ze : r[1] === "@" ? Be : Le
					}), i.removeAttribute(e);
				} else e.startsWith(h) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (De.test(i.tagName)) {
					let e = i.textContent.split(h), t = e.length - 1;
					if (t > 0) {
						i.textContent = de ? de.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], _e()), b.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], _e());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === me) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(h, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += h.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = ge.createElement("template");
		return n.innerHTML = e, n;
	}
};
function Pe(e, t, n = e, r) {
	if (t === v) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = ve(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = Pe(e, i._$AS(e, t.values), i, r)), t;
}
var Fe = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? ge).importNode(t, !0);
		b.currentNode = r;
		let i = b.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Ie(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Ve(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = b.nextNode(), a++);
		}
		return b.currentNode = ge, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Ie = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = y, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = Pe(this, e, t), ve(e) ? e === y || e == null || e === "" ? (this._$AH !== y && this._$AR(), this._$AH = y) : e !== this._$AH && e !== v && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? be(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== y && ve(this._$AH) ? this._$AA.nextSibling.data = e : this.T(ge.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ne.createElement(je(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Fe(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Ae.get(e.strings);
		return t === void 0 && Ae.set(e.strings, t = new Ne(e)), t;
	}
	k(t) {
		ye(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(_e()), this.O(_e()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ue(e).nextSibling;
			ue(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Le = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = y, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = y;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = Pe(this, e, t, 0), a = !ve(e) || e !== this._$AH && e !== v, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = Pe(this, r[n + o], t, o), s === v && (s = this._$AH[o]), a ||= !ve(s) || s !== this._$AH[o], s === y ? e = y : e !== y && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === y ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Re = class extends Le {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === y ? void 0 : e;
	}
}, ze = class extends Le {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== y);
	}
}, Be = class extends Le {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = Pe(this, e, t, 0) ?? y) === v) return;
		let n = this._$AH, r = e === y && n !== y || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== y && (n === y || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Ve = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		Pe(this, e);
	}
}, He = {
	M: pe,
	P: h,
	A: me,
	C: 1,
	L: Me,
	R: Fe,
	D: be,
	V: Pe,
	I: Ie,
	H: Le,
	N: ze,
	U: Be,
	B: Re,
	F: Ve
}, Ue = le.litHtmlPolyfillSupport;
Ue?.(Ne, Ie), (le.litHtmlVersions ??= []).push("3.3.3");
var We = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Ie(t.insertBefore(_e(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ge = globalThis, Ke = class extends ce {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = We(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return v;
	}
};
Ke._$litElement$ = !0, Ke.finalized = !0, Ge.litElementHydrateSupport?.({ LitElement: Ke });
var qe = Ge.litElementPolyfillSupport;
qe?.({ LitElement: Ke }), (Ge.litElementVersions ??= []).push("4.2.2");
// node_modules/@lit/reactive-element/decorators/custom-element.js
var x = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, Je = {
	attribute: !0,
	type: String,
	converter: ae,
	reflect: !1,
	hasChanged: oe
}, Ye = (e = Je, t, n) => {
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
function S(e) {
	return (t, n) => typeof n == "object" ? Ye(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function C(e) {
	return S({
		...e,
		state: !0,
		attribute: !1
	});
}
// node_modules/@lit/reactive-element/decorators/base.js
var Xe = (e, t, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, n), n);
// node_modules/@lit/reactive-element/decorators/query.js
function Ze(e, t) {
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
			return Xe(n, r, { get() {
				let n = e.call(this);
				return n === void 0 && (n = a(this), (n !== null || this.hasUpdated) && t.call(this, n)), n;
			} });
		}
		return Xe(n, r, { get() {
			return a(this);
		} });
	};
}
// src/common/constants.ts
var w = "device", Qe = "template", T = "times", $e = "interval", et = "once", tt = "random_window", nt = "poisson", rt = "enum", it = "state_machine", at = "noise", ot = "phase", st = "interval_s", ct = "shape", lt = "sensor", ut = "devices", dt = "groups", ft = "tdc-submit", pt = "hass_test_data_creator", mt = 3e4, ht = 3e5, gt = /* @__PURE__ */ new Map();
function _t(e, t, n) {
	let r = gt.get(e);
	if (r && Date.now() - r.at < t) return r.value;
	let i = n();
	return gt.set(e, {
		at: Date.now(),
		value: i
	}), i.catch(() => gt.delete(e)), i;
}
var vt = class {
	constructor(e) {
		this.hass = e;
	}
	info() {
		return _t("info", mt, () => this.call("info"));
	}
	templates() {
		return _t("templates", ht, () => this.call("templates/list"));
	}
	async saveTemplate(e, t, n) {
		let r = await this.call("templates/save", {
			template_id: e,
			name: t,
			entities: n
		});
		return gt.delete("templates"), r;
	}
	async deleteTemplate(e) {
		await this.call("templates/delete", { template_id: e }), gt.delete("templates");
	}
	device(e) {
		return this.call("devices/get", { device: e });
	}
	async deviceNames() {
		return (await this.call("devices/names")).devices;
	}
	devices(e, t, n = {}, r = !1) {
		return this.call("devices/list", {
			offset: e,
			limit: t,
			...n,
			...r ? { facets: r } : {}
		});
	}
	async devicesUpTo(e) {
		let t = [], n = 0;
		for (; t.length < e;) {
			let r = await this.devices(t.length, Math.min(500, e - t.length));
			if (n = r.total, t.push(...r.devices), r.devices.length === 0 || t.length >= n) break;
		}
		return {
			total: n,
			matched: n,
			devices: t
		};
	}
	create(e) {
		return this.call("devices/create", { ...e });
	}
	duplicate(e, t, n) {
		return this.call("devices/duplicate", {
			device: e,
			count: t,
			name_pattern: n
		});
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
	orphanTopics() {
		return this.call("removal/orphan_topics");
	}
	clearOrphanTopics(e) {
		return this.call("removal/orphan_topics_clear", { topics: e });
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
	transferExport(e, t, n) {
		return this.call("transfer/export", {
			category: e,
			offset: t,
			limit: n
		});
	}
	transferPlan(e) {
		return this.call("transfer/plan", { ...e });
	}
	transferRun(e) {
		return this.call("transfer/run", { ...e });
	}
	async transferExportAll(e) {
		let t = [await this.transferExport(e, 0, 500)], n = t[0].items.length;
		for (; n < t[0].total && t[t.length - 1].items.length > 0;) {
			let r = await this.transferExport(e, n, 500);
			t.push(r), n += r.items.length;
		}
		return t;
	}
	call(e, t = {}) {
		let n = Object.fromEntries(Object.entries(t).filter(([, e]) => e !== void 0));
		return this.hass.callWS({
			type: `${pt}/${e}`,
			...n
		});
	}
};
function E(e) {
	if (typeof e == "object" && e && "message" in e) {
		let { code: t, message: n } = e;
		return t ? `${t}: ${n}` : n;
	}
	return String(e);
}
// src/common/i18n.ts
var yt = {
	en: {
		title: "Test Data Generator",
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
		schTarget_run: "Device set",
		schAction: "Action",
		schEntity: "Entity",
		schAllFitting: "All that fit",
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
		histDevice: "Device",
		histEntity: "Sensor",
		histAll: "All",
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
		edShape: "Shape",
		edMin: "Minimum",
		edMax: "Maximum",
		edDecimals: "Decimals",
		edPeriod: "Period (seconds)",
		edInterval: "Interval (seconds)",
		edPhase: "Phase (0 to 1)",
		edRate: "Rate per hour",
		edFile: "File",
		edStep: "Seconds per value",
		edFileHint: "Put CSV files in the folder hass_test_data_creator/csv of the Home Assistant configuration",
		edNoFile: "No usable file found",
		edCsvPreview: "The curve comes from the file",
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
		useTitle: "Used in {count}",
		useNone: "Not used anywhere",
		use_schedules: "Schedule",
		use_scenarios: "Scenario",
		use_groups: "MQTT group",
		removeBlocked: "Still used: take it out of the schedules, scenarios and groups first",
		inUseWarning: "These devices are still used and cannot be removed yet:",
		pagePrevious: "‹ Previous",
		pageNext: "Next ›",
		devicesRange: "{from}–{to} of {total} devices",
		filterSearch: "Search devices",
		filterSearchHint: "Press / to search",
		filterReset: "Reset",
		filterAny: "Any",
		filterCount: "{matched} of {total}",
		filterCustom: "Own templates only",
		filterFault: "With fault",
		filterUsed: "Used",
		filterUnused: "Not used",
		filterSortBy: "Sort by",
		filterRemove: "Remove this filter",
		sortDefault: "Creation order",
		sortName: "Name",
		sortCreated: "Created",
		sortTemplate: "Template",
		sortDescending: "Descending",
		sortAscending: "Ascending",
		noMatches: "No devices match the filter.",
		noMatchesReset: "Reset the filter",
		noListMatches: "Nothing matches the filter.",
		filterSearchList: "Search",
		filterDevices: "Device",
		filterTemplates: "Template",
		filterScenario: "Scenario",
		filterOn: "On",
		filterOff: "Off",
		remove: "Remove",
		duplicate: "Duplicate…",
		dupCount: "Number of copies",
		dupPattern: "Name pattern",
		dupHint: "Copies keep template, area, output and curves. {template} is the name of this device, {n} a running number.",
		dupDo: "Create copies",
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
		customEntities: "Entities",
		baseTemplate: "Start from a template",
		baseNone: "Choose a template …",
		baseReplace: "This replaces the {old} entities of the custom device with the {count} entities of \"{name}\". Your changes are lost.",
		baseApply: "Replace entities",
		entAdd: "Add entity",
		entEdit: "Edit",
		entDelete: "Delete",
		entNew: "New entity",
		entChange: "Edit entity",
		entKey: "Key",
		entPlatform: "Platform",
		entUnit: "Unit",
		entApply: "Apply",
		entEmpty: "No entities yet. Use \"Add entity\" to begin.",
		entEventTypesLabel: "Event types (comma separated)",
		entNameEmpty: "The name is missing",
		entKeyInvalid: "The key may only have lower case letters, digits and underscores",
		entKeyTaken: "Another entity already has this key",
		entEventTypes: "An event needs at least one event type",
		customTemplate: "Custom device",
		preview: "Preview of the first sensor (24 hours)",
		entityList: "Entities of the template (curve over 24 hours)",
		estimate: "{entities} entities, about {rate} state changes per second",
		rateWarning: "This is a high load. Raise the tick interval or create fewer entities.",
		create: "Create devices",
		creating: "Creating …",
		created: "{count} devices created",
		target: "What to remove",
		targetAll: "Everything the integration created",
		targetDevice: "One device",
		targetRun: "One device set",
		pickOne: "Please choose",
		showPlan: "Show what will be removed",
		planDevices: "{count} devices",
		planOrphans: "{count} devices found only in the registry",
		planAreas: "Areas created by the integration that become empty: {names}",
		planNothing: "Nothing to remove.",
		keep: "Do not remove",
		ownTemplates: "Own templates",
		tplManage: "Manage own templates",
		tplNew: "New template",
		tplBack: "Back to the list",
		tplNone: "No own templates yet. Create one with \"New template\".",
		tplEntities: "{count} entities",
		tplDeleteConfirm: "Delete",
		tplName: "Template name",
		tplSave: "Save template",
		tplExists: "An own template with this name exists; saving replaces it",
		confirmRemove: "Remove now",
		removed: "{count} devices removed",
		scanTopics: "Search the broker for leftover topics",
		leftoverTopics: "{count} leftover topics of generated devices on the broker",
		leftoverNone: "The broker holds no leftover topics.",
		deleteLeftover: "Delete these topics",
		leftoverDeleted: "{count} topics deleted",
		error: "Error",
		tabTransfer: "Transfer",
		trfIntro: "Export saves definitions to a file. Choose what goes in; the file holds no runtime values, no credentials and no markers.",
		trfExportTitle: "Export",
		trfDevices: "Devices",
		trfTemplates: "Own templates",
		trfSchedules: "Schedules",
		trfScenarios: "Scenarios",
		trfGroups: "Groups",
		trfCount: "{count}",
		trfExport: "Export selection",
		trfExported: "File {name} saved: {count} entries",
		trfNothing: "Choose at least one category that has entries.",
		trfImportTitle: "Import",
		trfImportIntro: "Choose a file you exported before, then what to import and how. A plan shows what would happen before anything changes.",
		trfChooseFile: "Choose file",
		trfBadFile: "This is not a file made by the export of this integration",
		trfTooBig: "The file is larger than {max} bytes",
		trfNewer: "The file is from a newer version of the integration",
		trfDuplicate: "The file has the name {name} twice in {category}",
		trfFileLoaded: "File {name}",
		trfMode: "If it exists",
		trfModeAdd: "Add: keep what exists, create the rest",
		trfModeSync: "Sync: update what exists, create the rest",
		trfModeReplace: "Replace: remove all generated items of the category first",
		trfCheck: "Show plan",
		trfPlanTitle: "Plan",
		trfColCategory: "Category",
		trfColCreate: "Create",
		trfColUpdate: "Update",
		trfColSkip: "Skip",
		trfColConflict: "Conflict",
		trfColDelete: "Delete",
		trfProblems: "Problems",
		trfProblemMore: "… and {count} more",
		trfRun: "Import",
		trfRunConfirm: "Import and change {updates} items, remove {deletes} items",
		trfDone: "Import done: {created} created, {updated} updated, {deleted} removed, {problems} problems"
	},
	de: {
		title: "Testdaten Generator",
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
		schTarget_run: "Geräte Set",
		schAction: "Aktion",
		schEntity: "Entität",
		schAllFitting: "Alle passenden",
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
		histDevice: "Gerät",
		histEntity: "Sensor",
		histAll: "Alle",
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
		edShape: "Form",
		edMin: "Minimum",
		edMax: "Maximum",
		edDecimals: "Nachkommastellen",
		edPeriod: "Periode (Sekunden)",
		edInterval: "Intervall (Sekunden)",
		edPhase: "Phase (0 bis 1)",
		edRate: "Rate pro Stunde",
		edFile: "Datei",
		edStep: "Sekunden pro Wert",
		edFileHint: "CSV-Dateien gehören in den Ordner hass_test_data_creator/csv der Home-Assistant-Konfiguration",
		edNoFile: "Keine nutzbare Datei gefunden",
		edCsvPreview: "Die Kurve kommt aus der Datei",
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
		useTitle: "Verwendet in {count}",
		useNone: "Wird nirgends verwendet",
		use_schedules: "Zeitplan",
		use_scenarios: "Szenario",
		use_groups: "MQTT Gruppe",
		removeBlocked: "Wird noch verwendet: nimm es zuerst aus den Zeitplänen, Szenarien und Gruppen",
		inUseWarning: "Diese Geräte werden noch verwendet und lassen sich noch nicht entfernen:",
		pagePrevious: "‹ Zurück",
		pageNext: "Weiter ›",
		devicesRange: "{from}–{to} von {total} Geräten",
		filterSearch: "Geräte suchen",
		filterSearchHint: "Mit / suchen",
		filterReset: "Zurücksetzen",
		filterAny: "Alle",
		filterCount: "{matched} von {total}",
		filterCustom: "Nur eigene Vorlagen",
		filterFault: "Mit Störung",
		filterUsed: "Verwendet",
		filterUnused: "Nicht verwendet",
		filterSortBy: "Sortieren nach",
		filterRemove: "Diesen Filter entfernen",
		sortDefault: "Reihenfolge der Erzeugung",
		sortName: "Name",
		sortCreated: "Erzeugt",
		sortTemplate: "Vorlage",
		sortDescending: "Absteigend",
		sortAscending: "Aufsteigend",
		noMatches: "Kein Gerät passt zum Filter.",
		noMatchesReset: "Filter zurücksetzen",
		noListMatches: "Nichts passt zum Filter.",
		filterSearchList: "Suchen",
		filterDevices: "Gerät",
		filterTemplates: "Vorlage",
		filterScenario: "Szenario",
		filterOn: "An",
		filterOff: "Aus",
		remove: "Entfernen",
		duplicate: "Duplizieren…",
		dupCount: "Anzahl Kopien",
		dupPattern: "Namensmuster",
		dupHint: "Kopien übernehmen Vorlage, Bereich, Ausgabe und Kurven. {template} ist der Name dieses Geräts, {n} eine laufende Nummer.",
		dupDo: "Kopien erstellen",
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
		customEntities: "Entitäten",
		baseTemplate: "Von einer Vorlage ausgehen",
		baseNone: "Vorlage wählen …",
		baseReplace: "Das ersetzt die {old} Entitäten des eigenen Geräts durch die {count} Entitäten von „{name}“. Deine Änderungen gehen verloren.",
		baseApply: "Entitäten ersetzen",
		entAdd: "Entität hinzufügen",
		entEdit: "Bearbeiten",
		entDelete: "Löschen",
		entNew: "Neue Entität",
		entChange: "Entität bearbeiten",
		entKey: "Schlüssel",
		entPlatform: "Plattform",
		entUnit: "Einheit",
		entApply: "Übernehmen",
		entEmpty: "Noch keine Entität. Mit „Entität hinzufügen“ beginnen.",
		entEventTypesLabel: "Ereignistypen (mit Komma getrennt)",
		entNameEmpty: "Der Name fehlt",
		entKeyInvalid: "Der Schlüssel darf nur Kleinbuchstaben, Ziffern und Unterstriche enthalten",
		entKeyTaken: "Eine andere Entität hat diesen Schlüssel schon",
		entEventTypes: "Ein Ereignis braucht mindestens einen Ereignistyp",
		customTemplate: "Eigenes Gerät",
		preview: "Vorschau des ersten Sensors (24 Stunden)",
		entityList: "Entitäten der Vorlage (Kurve über 24 Stunden)",
		estimate: "{entities} Entitäten, etwa {rate} Zustandsänderungen pro Sekunde",
		rateWarning: "Das ist eine hohe Last. Erhöhe das Tick-Intervall oder erzeuge weniger Entitäten.",
		create: "Geräte erstellen",
		creating: "Erstelle …",
		created: "{count} Geräte erstellt",
		target: "Was entfernt werden soll",
		targetAll: "Alles, was die Integration erzeugt hat",
		targetDevice: "Ein Gerät",
		targetRun: "Ein Geräte Set",
		pickOne: "Bitte wählen",
		showPlan: "Anzeigen, was entfernt wird",
		planDevices: "{count} Geräte",
		planOrphans: "{count} Geräte, die nur in der Registry stehen",
		planAreas: "Von der Integration angelegte Bereiche, die leer werden: {names}",
		planNothing: "Es gibt nichts zu entfernen.",
		keep: "Nicht entfernen",
		ownTemplates: "Eigene Vorlagen",
		tplManage: "Eigene Vorlagen verwalten",
		tplNew: "Neue Vorlage",
		tplBack: "Zurück zur Liste",
		tplNone: "Noch keine eigenen Vorlagen. Lege mit „Neue Vorlage“ eine an.",
		tplEntities: "{count} Entitäten",
		tplDeleteConfirm: "Löschen",
		tplName: "Name der Vorlage",
		tplSave: "Vorlage speichern",
		tplExists: "Eine eigene Vorlage mit diesem Namen gibt es schon; Speichern ersetzt sie",
		confirmRemove: "Jetzt entfernen",
		removed: "{count} Geräte entfernt",
		scanTopics: "Im Broker nach übrig gebliebenen Topics suchen",
		leftoverTopics: "{count} übrig gebliebene Topics erzeugter Geräte im Broker",
		leftoverNone: "Der Broker enthält keine übrig gebliebenen Topics.",
		deleteLeftover: "Diese Topics löschen",
		leftoverDeleted: "{count} Topics gelöscht",
		error: "Fehler",
		tabTransfer: "Transfer",
		trfIntro: "Der Export speichert Definitionen in einer Datei. Wähle, was hinein soll; die Datei enthält keine Laufzeitwerte, keine Zugangsdaten und keine Markierungen.",
		trfExportTitle: "Export",
		trfDevices: "Geräte",
		trfTemplates: "Eigene Vorlagen",
		trfSchedules: "Zeitpläne",
		trfScenarios: "Szenarien",
		trfGroups: "Gruppen",
		trfCount: "{count}",
		trfExport: "Auswahl exportieren",
		trfExported: "Datei {name} gespeichert: {count} Einträge",
		trfNothing: "Wähle mindestens eine Kategorie, die Einträge hat.",
		trfImportTitle: "Import",
		trfImportIntro: "Wähle eine Datei, die Du vorher exportiert hast, dann was und wie importiert werden soll. Ein Plan zeigt vorab, was passieren würde.",
		trfChooseFile: "Datei wählen",
		trfBadFile: "Das ist keine Datei aus dem Export dieser Integration",
		trfTooBig: "Die Datei ist größer als {max} Bytes",
		trfNewer: "Die Datei stammt aus einer neueren Version der Integration",
		trfDuplicate: "Die Datei hat den Namen {name} doppelt in {category}",
		trfFileLoaded: "Datei {name}",
		trfMode: "Wenn es schon existiert",
		trfModeAdd: "Hinzufügen: Vorhandenes bleibt, der Rest wird angelegt",
		trfModeSync: "Sync: Vorhandenes wird aktualisiert, der Rest wird angelegt",
		trfModeReplace: "Ersetzen: erst alle erzeugten Einträge der Kategorie entfernen",
		trfCheck: "Plan anzeigen",
		trfPlanTitle: "Plan",
		trfColCategory: "Kategorie",
		trfColCreate: "Anlegen",
		trfColUpdate: "Aktualisieren",
		trfColSkip: "Überspringen",
		trfColConflict: "Konflikt",
		trfColDelete: "Löschen",
		trfProblems: "Probleme",
		trfProblemMore: "… und {count} weitere",
		trfRun: "Importieren",
		trfRunConfirm: "Importieren, {updates} Einträge ändern, {deletes} Einträge entfernen",
		trfDone: "Import fertig: {created} angelegt, {updated} aktualisiert, {deleted} entfernt, {problems} Probleme"
	}
};
function bt(e) {
	return e?.toLowerCase().startsWith("de") ? "de" : "en";
}
function xt(e, t, n = {}) {
	return yt[e][t].replace(/\{(\w+)\}/g, (e, t) => t in n ? String(n[t]) : e);
}
// src/common/labels.ts
var St = {
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
		csv: "CSV replay",
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
}, Ct = {
	en: St,
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
			csv: "CSV-Wiedergabe",
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
}, wt = {
	native: "outputNative",
	mqtt: "outputMqtt",
	z2m: "outputZ2m"
}, Tt = "fault_";
function D(e, t, n) {
	return Ct[bt(e)][t][n] ?? n;
}
function Et(e, t) {
	return t.startsWith(Tt) ? `${bt(e) === "de" ? "Störung" : "Fault"}: ${D(e, "fault", t.slice(6))}` : D(e, "action", t);
}
function Dt(e, t, n) {
	return `${t ? `${D(e, "entity", t)}: ` : ""}${Et(e, n)}`;
}
function O(e, t, n) {
	return Ct[bt(e)].template[t] ?? n;
}
function Ot(e, t, n) {
	let r = St.entity[t];
	return r !== void 0 && r === n ? D(e, "entity", t) : n;
}
function kt(e, t) {
	return t === null ? "–" : D(e, "state", t);
}
var At = /* @__PURE__ */ new Map();
function jt(e) {
	let t = bt(e), n = At.get(t);
	return n === void 0 && (n = new Intl.Collator(t, {
		numeric: !0,
		sensitivity: "base"
	}), At.set(t, n)), n;
}
function k(e, t, n) {
	let r = jt(e);
	return [...t].sort((e, t) => r.compare(n(e), n(t)));
}
// \0@oxc-project+runtime@0.155.0/helpers/esm/decorate.js
function A(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/common/base.ts
var Mt = o`
  :host {
    container-type: inline-size;
  }
`;
function Nt(e, t) {
	let n = new Set(e);
	return n.delete(t) || n.add(t), n;
}
var Pt = o`
  border-radius: 6px;
  border: 1px solid var(--divider-color);
  background: var(--card-background-color);
  color: var(--primary-text-color);
`, j = class extends Ke {
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
      ${Pt}
      cursor: pointer;
    }
    button.primary {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color);
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
      ${Pt}
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
			api: new vt(this.hass)
		}), this.client.api;
	}
	textField(e, t, n, r = {}) {
		return _`<label style="flex: ${r.flex ?? "1 1 200px"}"
      >${e}
      <input
        .value=${t}
        placeholder=${r.placeholder ?? ""}
        @input=${(e) => n(e.target.value)}
      />
    </label>`;
	}
	select(e, t, n, r, i) {
		return _`<label style="flex: 1 1 180px"
      >${e}
      <select
        ?disabled=${t.length === 1}
        @change=${(e) => i(e.target.value)}
      >
        ${k(this.hass?.language, t, r).map((e) => _`<option value=${e} ?selected=${e === n || t.length === 1}>
              ${r(e)}
            </option>`)}
      </select>
    </label>`;
	}
	detailRow(e, t) {
		return _`<tr>
      <td colspan=${e}>${t}</td>
    </tr>`;
	}
	submitRow(e) {
		return _`<p class="row">
      ${e.extra ?? y}
      <button
        class="primary"
        ?disabled=${!e.enabled || e.busy}
        @click=${e.submit}
      >
        ${e.label}
      </button>
      ${e.editing ? _`<button
              ?disabled=${e.busy}
              @click=${() => this.dispatchEvent(new CustomEvent("tdc-cancel", {
			bubbles: !0,
			composed: !0
		}))}
            >
              ${this.tr("detCancel")}
            </button>` : y}
    </p>`;
	}
	tr(e, t) {
		return xt(bt(this.hass?.language), e, t);
	}
};
A([S({ attribute: !1 })], j.prototype, "hass", void 0);
// node_modules/lit-html/directive.js
var Ft = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, It = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Lt = class {
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
}, { I: Rt } = He, zt = (e) => e, Bt = (e) => e.strings === void 0, Vt = () => document.createComment(""), Ht = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new Rt(r.insertBefore(Vt(), i), r.insertBefore(Vt(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = zt(e).nextSibling;
				zt(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, Ut = (e, t, n = e) => (e._$AI(t, n), e), Wt = {}, Gt = (e, t = Wt) => e._$AH = t, Kt = (e) => e._$AH, qt = (e) => {
	e._$AR(), e._$AA.remove();
}, Jt = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, Yt = It(class extends Lt {
	constructor(e) {
		if (super(e), e.type !== Ft.CHILD) throw Error("repeat() can only be used in text expressions");
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
		let i = Kt(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = Ut(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = Ut(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = Ut(i[d], a[m]), Ht(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = Ut(i[f], a[p]), Ht(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = Jt(o, p, m), u = Jt(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = Ht(e, i[d]);
					Ut(t, a[p]), c[p] = t;
				} else c[p] = Ut(n, a[p]), Ht(e, i[d], n), i[t] = null;
				p++;
			} else qt(i[f]), f--;
		} else qt(i[d]), d++;
		for (; p <= m;) {
			let t = Ht(e, c[m + 1]);
			Ut(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && qt(e);
		}
		return this.ut = o, Gt(e, c), v;
	}
}), Xt = class extends j {
	constructor(...e) {
		super(...e), this.open = !1, this.heading = "";
	}
	static {
		this.styles = [j.styles, o`
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
        background: var(
          --mdc-dialog-scrim-color,
          color-mix(in srgb, var(--primary-text-color) 32%, transparent)
        );
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
		return _`<dialog @close=${() => this.close()}>
      <div class="head">
        <h3>${this.heading}</h3>
        <button aria-label=${this.tr("detCancel")} @click=${() => this.close()}>✕</button>
      </div>
      <slot></slot>
    </dialog>`;
	}
};
A([S({ type: Boolean })], Xt.prototype, "open", void 0), A([S()], Xt.prototype, "heading", void 0), A([Ze("dialog")], Xt.prototype, "dialog", void 0), Xt = A([x("tdc-dialog")], Xt);
// node_modules/lit-html/directives/live.js
var Zt = It(class extends Lt {
	constructor(e) {
		if (super(e), e.type !== Ft.PROPERTY && e.type !== Ft.ATTRIBUTE && e.type !== Ft.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
		if (!Bt(e)) throw Error("`live` bindings can only contain a single expression");
	}
	render(e) {
		return e;
	}
	update(e, [t]) {
		if (t === v || t === y) return t;
		let n = e.element, r = e.name;
		if (e.type === Ft.PROPERTY) {
			if (t === n[r]) return v;
		} else if (e.type === Ft.BOOLEAN_ATTRIBUTE) {
			if (!!t === n.hasAttribute(r)) return v;
		} else if (e.type === Ft.ATTRIBUTE && n.getAttribute(r) === t + "") return v;
		return Gt(e), t;
	}
}), Qt = "query", $t = "sort", en = "descending", tn = [$t, en], nn = "tdc.filter.";
function rn(e) {
	return e === "multi" ? [] : e !== "switch" && "";
}
function an(e) {
	return {
		[Qt]: "",
		[$t]: "",
		[en]: !1,
		...Object.fromEntries(e.map((e) => [e.key, rn(e.kind)]))
	};
}
function on(e, t) {
	let n = an(e);
	return {
		...n,
		...Object.fromEntries(tn.map((e) => [e, t[e] ?? n[e]]))
	};
}
function sn(e, t) {
	return e.flatMap((e) => {
		let n = t[e.key], r = (t) => e.options?.find((e) => e.value === t)?.label ?? t;
		return e.kind === "switch" ? n === !0 ? [{
			key: e.key,
			value: "",
			label: e.label
		}] : [] : (Array.isArray(n) ? n : n ? [String(n)] : []).map((t) => ({
			key: e.key,
			value: t,
			label: `${e.label}: ${r(t)}`
		}));
	});
}
function cn(e, t) {
	return +!!String(t.query ?? "").trim() + sn(e, t).length;
}
function ln(e, t, n) {
	let r = e.find((e) => e.key === n.key);
	if (!r) return t;
	let i = t[n.key], a = Array.isArray(i) ? i.filter((e) => e !== n.value) : rn(r.kind);
	return {
		...t,
		[n.key]: a
	};
}
function un(e, t) {
	let n = an(e);
	if (typeof t != "object" || !t) return n;
	let r = t, i = { ...n };
	for (let [e, t] of Object.entries(n)) {
		let n = r[e];
		(Array.isArray(t) && Array.isArray(n) && n.every((e) => typeof e == "string") || typeof t == "string" && typeof n == "string" || typeof t == "boolean" && typeof n == "boolean") && (i[e] = n);
	}
	return i;
}
function dn(e, t) {
	try {
		let n = sessionStorage.getItem(`${nn}${e}`);
		return un(t, n ? JSON.parse(n) : null);
	} catch {
		return an(t);
	}
}
function fn(e, t) {
	try {
		sessionStorage.setItem(`${nn}${e}`, JSON.stringify(t));
	} catch {}
}
// src/common/shortcuts.ts
function pn(e) {
	if (!(e.modified || e.dialogOpen)) {
		if (e.key === "/" && !e.typing) return "search";
		if (e.key === "Escape" && (e.inSearch || !e.typing)) return "reset";
	}
}
function mn(e) {
	return e instanceof HTMLElement ? e.isContentEditable || [
		"INPUT",
		"TEXTAREA",
		"SELECT"
	].includes(e.tagName) || e.getAttribute("role") === "combobox" : !1;
}
// src/common/popover.ts
var hn = 4, gn = 12, _n = 320, vn = 120, yn = 200, bn = o`
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
    box-shadow: var(--dialog-box-shadow, var(--wa-shadow-l, var(--ha-card-box-shadow, none)));
  }
`, xn = class extends j {
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
		let t = this.getBoundingClientRect(), n = window.innerHeight - t.bottom - gn, r = t.top - gn, i = n < yn && r > n, a = i ? r : n, { style: o } = e;
		o.left = `${t.left}px`, o.minWidth = `${t.width}px`, o.maxHeight = `${Math.max(vn, Math.min(_n, a))}px`, o.top = i ? "" : `${t.bottom + hn}px`, o.bottom = i ? `${window.innerHeight - t.top + hn}px` : "";
	}
};
A([C()], xn.prototype, "open", void 0);
// src/common/multi-select.ts
function Sn(e, t, n) {
	let r = t.trim();
	if (!r) return e;
	let i = e.filter((e) => e !== r);
	return n ? [...i, r] : i;
}
var M = class extends xn {
	constructor(...e) {
		super(...e), this.items = [], this.selected = [], this.allowAdd = !1, this.single = !1, this.empty = "", this.draft = "";
	}
	static {
		this.styles = [
			j.styles,
			bn,
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
	pick(e, t) {
		if (!this.single) return this.emit(Sn(this.selected, e, t));
		this.emit(t && e.trim() ? [e.trim()] : []), this.open = !1;
	}
	add() {
		this.pick(this.draft, !0), this.draft = "";
	}
	options() {
		let e = new Set(this.items.map((e) => e.value)), t = this.selected.filter((t) => !e.has(t)).map((e) => ({
			value: e,
			label: e
		}));
		return k(this.hass?.language, [...this.items, ...t], (e) => e.label);
	}
	renderAdd() {
		return _`<div class="row add">
      <input
        .value=${Zt(this.draft)}
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
		return _`
      <button
        class="trigger"
        aria-haspopup="listbox"
        aria-expanded=${this.open ? "true" : "false"}
        @click=${() => this.open = !this.open}
      >
        ${t.length ? _`<span class="summary">${t.join(", ")}</span>` : _`<span class="summary empty">${this.empty || this.tr("areasNone")}</span>`}
        <span>▾</span>
      </button>
      ${this.open ? _`<div class="popover" popover="manual" role="listbox" aria-multiselectable="true">
              ${this.allowAdd ? this.renderAdd() : ""}
              ${e.map((e) => _`<label class="option">
                    <input
                      type="checkbox"
                      .checked=${this.selected.includes(e.value)}
                      @change=${(t) => this.pick(e.value, t.target.checked)}
                    />
                    ${e.label}
                  </label>`)}
            </div>` : ""}
    `;
	}
};
A([S({ attribute: !1 })], M.prototype, "items", void 0), A([S({ attribute: !1 })], M.prototype, "selected", void 0), A([S({ type: Boolean })], M.prototype, "allowAdd", void 0), A([S({ type: Boolean })], M.prototype, "single", void 0), A([S()], M.prototype, "empty", void 0), A([C()], M.prototype, "draft", void 0), M = A([x("tdc-multi-select")], M);
var N = class extends j {
	constructor(...e) {
		super(...e), this.fields = [], this.values = {}, this.sorts = [], this.searchLabel = "", this.matched = 0, this.total = 0, this.draft = {}, this.onKey = (e) => {
			let t = this.shadowRoot?.querySelector("input[type=search]"), n = e.composedPath()[0] ?? null, r = pn({
				key: e.key,
				modified: e.ctrlKey || e.metaKey || e.altKey,
				typing: mn(n),
				inSearch: n === t,
				dialogOpen: document.querySelector("tdc-dialog[open]") !== null
			});
			r === "search" && t ? (e.preventDefault(), t.focus(), t.select()) : r === "reset" && cn(this.fields, this.draft) > 0 && (this.replace(on(this.fields, this.draft)), t?.blur());
		};
	}
	static {
		this.styles = [j.styles, o`
      .bar {
        align-items: flex-end;
        margin: 0 0 8px;
      }
      .bar > * {
        min-width: 160px;
        flex: 1 1 160px;
      }
      .bar .search {
        flex: 2 1 220px;
      }
      .bar .narrow {
        flex: 0 0 auto;
        min-width: 0;
      }
      .chips {
        margin: 0 0 8px;
        align-items: center;
      }
      .chip {
        padding: 2px 10px;
        border-radius: 14px;
        background: var(--secondary-background-color);
        font-size: 0.9em;
      }
      .count {
        color: var(--secondary-text-color);
      }
      label.switch {
        flex-direction: row;
        align-items: center;
        gap: 6px;
        color: var(--primary-text-color);
      }
      label.switch input {
        width: auto;
        min-height: 0;
      }
    `];
	}
	willUpdate(e) {
		e.has("values") && this.timer === void 0 && (this.draft = this.values);
	}
	connectedCallback() {
		super.connectedCallback(), document.addEventListener("keydown", this.onKey);
	}
	disconnectedCallback() {
		document.removeEventListener("keydown", this.onKey), window.clearTimeout(this.timer), this.timer = void 0, super.disconnectedCallback();
	}
	set(e, t, n = !1) {
		this.draft = {
			...this.draft,
			[e]: t
		}, this.report(n);
	}
	replace(e) {
		this.draft = e, this.report(!0);
	}
	report(e) {
		window.clearTimeout(this.timer);
		let t = () => {
			this.timer = void 0, this.dispatchEvent(new CustomEvent("tdc-filter-change", { detail: this.draft }));
		};
		e ? t() : this.timer = window.setTimeout(t, 300);
	}
	renderField(e) {
		let t = this.draft[e.key];
		if (e.kind === "switch") return _`<label class="switch narrow">
        <input
          type="checkbox"
          .checked=${t === !0}
          @change=${(t) => this.set(e.key, t.target.checked, !0)}
        />
        ${e.label}
      </label>`;
		let n = Array.isArray(t) ? t : t ? [String(t)] : [];
		return _`<label>
      ${e.label}
      <tdc-multi-select
        .hass=${this.hass}
        .items=${e.options ?? []}
        .selected=${n}
        ?single=${e.kind === "choice"}
        empty=${this.tr("filterAny")}
        @tdc-select-change=${(t) => this.set(e.key, e.kind === "choice" ? t.detail[0] ?? "" : t.detail, !0)}
      ></tdc-multi-select>
    </label>`;
	}
	renderSort() {
		if (!this.sorts.length) return y;
		let e = this.draft[en] === !0, t = String(this.draft.sort ?? "");
		return _`<label class="narrow">
        ${this.tr("filterSortBy")}
        <select
          .value=${Zt(t)}
          @change=${(e) => this.set($t, e.target.value, !0)}
        >
          <option value="">${this.tr("sortDefault")}</option>
          ${this.sorts.map((e) => _`<option value=${e.value}>${e.label}</option>`)}
        </select>
      </label>
      <button
        class="narrow"
        title=${this.tr(e ? "sortDescending" : "sortAscending")}
        @click=${() => this.set(en, !e, !0)}
      >
        ${e ? "↓" : "↑"}
      </button>`;
	}
	renderChip(e) {
		return _`<span class="chip">
      ${e.label}
      <a
        href="#"
        role="button"
        title=${this.tr("filterRemove")}
        @click=${(t) => {
			t.preventDefault(), this.replace(ln(this.fields, this.draft, e));
		}}
        >×</a
      >
    </span>`;
	}
	render() {
		let e = sn(this.fields, this.draft), t = cn(this.fields, this.draft) > 0;
		return _`
      <div class="row bar">
        <label class="search">
          ${this.searchLabel || this.tr("filterSearch")}
          <input
            type="search"
            placeholder=${this.tr("filterSearchHint")}
            .value=${Zt(String(this.draft.query ?? ""))}
            @input=${(e) => this.set(Qt, e.target.value)}
          />
        </label>
        ${this.fields.map((e) => this.renderField(e))} ${this.renderSort()}
      </div>
      <div class="row chips">
        ${e.map((e) => this.renderChip(e))}
        ${t ? _`<button @click=${() => this.replace(on(this.fields, this.draft))}>
                ${this.tr("filterReset")}
              </button>` : y}
        <small class="count">
          ${this.tr("filterCount", {
			matched: this.matched,
			total: this.total
		})}
        </small>
      </div>
    `;
	}
};
A([S({ attribute: !1 })], N.prototype, "fields", void 0), A([S({ attribute: !1 })], N.prototype, "values", void 0), A([S({ attribute: !1 })], N.prototype, "sorts", void 0), A([S()], N.prototype, "searchLabel", void 0), A([S({ type: Number })], N.prototype, "matched", void 0), A([S({ type: Number })], N.prototype, "total", void 0), A([C()], N.prototype, "draft", void 0), N = A([x("tdc-filter-bar")], N);
// src/common/list-filter.ts
function Cn(e, t) {
	return e.toLocaleLowerCase().includes(t);
}
function wn(e) {
	return Array.isArray(e) ? e : typeof e == "string" && e ? [e] : [];
}
function Tn(e, t, n, r) {
	let i = String(n.query ?? "").trim().toLocaleLowerCase();
	return e.filter((e) => i && !r.texts(e).some((e) => Cn(e, i)) ? !1 : t.every((t) => {
		let i = r.values(e, t.key);
		if (t.kind === "switch") return n[t.key] !== !0 || i === !0;
		let a = wn(n[t.key]);
		return a.length === 0 || Array.isArray(i) && i.some((e) => a.includes(e));
	}));
}
function En(e, t, n, r) {
	return k(r, [...new Set(e.flatMap(t))].map((e) => ({
		value: e,
		label: n(e)
	})), (e) => e.label);
}
// src/common/polling.ts
var Dn = 1e4, P = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.message = "", this.error = "", this.busy = !1, this.expanded = /* @__PURE__ */ new Set(), this.creating = !1, this.listFilter = {}, this.listFilterTab = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.loadOptions(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), Dn);
	}
	disconnectedCallback() {
		window.clearInterval(this.timer), super.disconnectedCallback();
	}
	async loadOptions() {
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.optionsLoaded(this.info);
		} catch (e) {
			this.error = E(e);
		}
	}
	restoreFilter(e, t) {
		this.listFilterTab = e, this.listFilter = dn(e, t);
	}
	setListFilter(e) {
		this.listFilter = e, fn(this.listFilterTab, e);
	}
	renderFiltered(e, t, n, r) {
		let i = Tn(e, t, this.listFilter, n);
		return _`<tdc-filter-bar
        .hass=${this.hass}
        .fields=${t}
        .values=${this.listFilter}
        .matched=${i.length}
        .total=${e.length}
        searchLabel=${this.tr("filterSearchList")}
        @tdc-filter-change=${(e) => this.setListFilter(e.detail)}
      ></tdc-filter-bar>
      ${i.length === 0 ? _`<p>
              ${this.tr("noListMatches")}
              <button @click=${() => this.setListFilter(on(t, an(t)))}>
                ${this.tr("filterReset")}
              </button>
            </p>` : r(i)}`;
	}
	toggle(e) {
		this.expanded = Nt(this.expanded, e);
	}
	nameCell(e, t) {
		return _`<td class="name">${this.expanded.has(e) ? "▾" : "▸"} ${t}</td>`;
	}
	editRow(e, t, n, r) {
		return this.detailRow(e, _`<div
        @tdc-submit=${(e) => r(e.detail)}
        @tdc-cancel=${() => this.toggle(t)}
      >
        ${n}
      </div>`);
	}
	removeButton(e) {
		return _`<button
      ?disabled=${this.busy}
      @click=${(t) => {
			t.stopPropagation(), this.run(e);
		}}
    >
      ${this.tr("remove")}
    </button>`;
	}
	newPopup(e, t) {
		return _`
      <p>
        <button class="primary" @click=${() => this.creating = !0}>+ ${e}</button>
      </p>
      <tdc-dialog
        .hass=${this.hass}
        heading=${e}
        ?open=${this.creating}
        @tdc-close=${() => this.creating = !1}
      >
        ${t}
      </tdc-dialog>
    `;
	}
	async run(e) {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let t = await e();
			this.message = typeof t == "string" ? t : "", await this.refresh();
		} catch (e) {
			this.error = E(e);
		}
		this.busy = !1;
	}
};
A([C()], P.prototype, "info", void 0), A([C()], P.prototype, "templates", void 0), A([C()], P.prototype, "message", void 0), A([C()], P.prototype, "error", void 0), A([C()], P.prototype, "busy", void 0), A([C()], P.prototype, "expanded", void 0), A([C()], P.prototype, "creating", void 0), A([C()], P.prototype, "listFilter", void 0);
// src/common/menu-button.ts
var On = class extends xn {
	constructor(...e) {
		super(...e), this.label = "", this.items = [], this.disabled = !1;
	}
	static {
		this.styles = [
			j.styles,
			bn,
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
		return _`
      <button
        aria-haspopup="menu"
        aria-expanded=${this.open ? "true" : "false"}
        ?disabled=${this.disabled}
        @click=${() => this.open = !this.open}
      >
        ${this.label} ▾
      </button>
      ${this.open ? _`<div class="popover" popover="manual" role="menu">
              ${this.items.map((e) => _`<button
                    role="menuitem"
                    ?disabled=${e.disabled}
                    title=${e.hint ?? ""}
                    @click=${() => this.pick(e.value)}
                  >
                    ${e.label}
                  </button>`)}
            </div>` : ""}
    `;
	}
};
A([S()], On.prototype, "label", void 0), A([S({ attribute: !1 })], On.prototype, "items", void 0), A([S({ type: Boolean })], On.prototype, "disabled", void 0), On = A([x("tdc-menu-button")], On);
// src/common/row-list.ts
var kn = o`
  :host {
    --row-height: 40px;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    height: calc(4 * var(--row-height) + 2px);
    box-sizing: border-box;
    overflow-y: auto;
    border: 1px solid var(--divider-color);
    border-radius: 6px;
  }
  li {
    display: flex;
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
    height: var(--row-height);
    padding: 0 10px;
    border-bottom: 1px solid var(--divider-color);
  }
  li:last-child {
    border-bottom: none;
  }
  .range {
    flex: 0 0 auto;
    color: var(--secondary-text-color);
    font-size: 0.85em;
  }
  tdc-signal-preview {
    flex: 0 0 100px;
  }
  button.small {
    padding: 2px 8px;
  }
  button.danger {
    color: var(--error-color);
  }
`, An = [rt, it], jn = [
	"sine",
	"saw",
	"square",
	"triangle",
	"random_walk",
	"discharge"
], Mn = [
	"constant",
	"household_load",
	"pv_day"
], Nn = 600, Pn = 86400, Fn = 24;
function In(e) {
	return An.includes(e);
}
function Ln(e) {
	return e === "counter" ? ["rate_per_hour"] : e === "csv" ? ["step_s", ot] : e === "noise" ? [st, at] : e === "steps" ? [
		"period_s",
		st,
		ot,
		at
	] : e === "enum" ? [st] : e === "state_machine" ? [ot] : jn.includes(e) ? [
		"period_s",
		ot,
		at
	] : Mn.includes(e) ? [at] : [];
}
function Rn(e) {
	let t = e.period_s;
	return !Ln(e.shape).includes("period_s") || !t || t <= 0 ? Pn : Math.min(Pn, t * Fn);
}
function zn(e) {
	return e < 120 ? `${Number(e.toFixed(1))} s` : e < 7200 ? `${Number((e / 60).toFixed(1))} min` : `${Number((e / 3600).toFixed(1))} h`;
}
function Bn(e) {
	return e === "enum" ? ["values", "weights"] : e === "state_machine" ? ["states"] : [];
}
function Vn(e, t, n) {
	let r = { ...e }, i = Number(n);
	return n.trim() === "" || Number.isNaN(i) ? delete r[t] : r[t] = i, r;
}
function Hn(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function Un(e, t) {
	return t === "states" ? (e.states ?? []).map((e) => `${e.value}:${e.duration_s}`).join(", ") : (e[t] ?? []).join(", ");
}
function Wn(e, t, n) {
	let r = { ...e };
	return t === "values" ? r.values = Hn(n) : t === "weights" ? r.weights = Hn(n).map(Number).filter((e) => !Number.isNaN(e)) : r.states = Hn(n).flatMap((e) => {
		let [t, n] = e.split(":").map((e) => e.trim()), r = Number(n);
		return t && r > 0 ? [{
			value: t,
			duration_s: r
		}] : [];
	}), r;
}
function Gn(e) {
	return e === "enum" ? {
		values: ["on", "off"],
		interval_s: Nn
	} : e === "state_machine" ? { states: [{
		value: "idle",
		duration_s: Nn
	}, {
		value: "active",
		duration_s: Nn
	}] } : {};
}
function Kn(e, t) {
	let n = /* @__PURE__ */ new Set([
		ct,
		...Ln(t),
		...Bn(t)
	]);
	t === "csv" && n.add("file"), In(t) || [
		"min",
		"max",
		"decimals"
	].forEach((e) => n.add(e));
	let r = {
		...Gn(t),
		...e,
		shape: t
	};
	return Object.fromEntries(Object.entries(r).filter(([e]) => n.has(e)));
}
// src/signals/signals.ts
var qn = (1n << 64n) - 1n, Jn = 11400714819323198485n, Yn = 13787848793156543929n, Xn = 10723151780598845931n, Zn = 3600, Qn = 3600, $n = 10, er = .5, tr = 3, nr = 1.5, rr = 30n, ir = 27n, ar = 31n, or = 11n, sr = 53, cr = 86400, lr = 24, ur = .12, dr = [
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
], fr = .12, pr = 600, mr = 6, hr = 900, gr = .3, _r = 2, vr = 3;
function yr(e, t = 0, n = 0) {
	return {
		shape: e.shape,
		min: e.min ?? 0,
		max: e.max ?? 100,
		period_s: e.period_s ?? Qn,
		interval_s: e.interval_s ?? $n,
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
function br(e, t) {
	let n = BigInt(e) * Jn + (BigInt(t) & qn) * Yn + Xn & qn;
	return n = (n ^ n >> rr) * Yn & qn, n = (n ^ n >> ir) * Xn & qn, n ^= n >> ar, Number(n >> or) / 2 ** sr;
}
function xr(e, t) {
	let n = t / e.period_s + e.phase;
	return n - Math.floor(n);
}
function Sr(e, t) {
	let n = Math.floor(t), r = t - n, i = r * r * (tr - 2 * r), a = br(e, n);
	return a + (br(e, n + 1) - a) * i;
}
function Cr(e) {
	return (e % cr + cr) % cr / Zn;
}
function wr(e, t, n) {
	let r = Math.abs(e - t), i = Math.min(r, lr - r);
	return Math.exp(-.5 * (i / n) ** 2);
}
var Tr = {
	constant: () => er,
	sine: (e, t) => er + er * Math.sin(2 * Math.PI * xr(e, t)),
	saw: (e, t) => xr(e, t),
	square: (e, t) => +(xr(e, t) < er),
	triangle: (e, t) => 1 - Math.abs(2 * xr(e, t) - 1),
	noise: (e, t) => br(e.seed, Math.floor(t / e.interval_s)),
	random_walk: (e, t) => Sr(e.seed, t / e.period_s + e.phase),
	household_load: (e, t) => {
		let n = Cr(t);
		return dr.reduce((e, [t, r, i]) => e + i * wr(n, t, r), ur) + fr * (Sr(e.seed, t / pr) - er);
	},
	pv_day: (e, t) => {
		let n = (Cr(t) - mr) / 14;
		if (!(n > 0 && n < 1)) return 0;
		let r = 1 - gr * Sr(e.seed, t / hr);
		return Math.sin(Math.PI * n) ** nr * r;
	},
	steps: (e, t) => {
		let n = Math.max(_r, Math.round(e.period_s / e.interval_s));
		return Math.min(1, Math.floor(xr(e, t) * n) / (n - 1));
	},
	discharge: (e, t) => 1 - xr(e, t) ** vr
};
function Er(e, t) {
	let n = e.weights.length ? e.weights : e.values.map(() => 1), r = n.reduce((e, t) => e + t, 0), i = br(e.seed, Math.floor(t / e.interval_s)) * r, a = 0;
	for (let [t, r] of e.values.entries()) if (a += n[t], i < a) return r;
	return e.values[e.values.length - 1];
}
function Dr(e, t) {
	let n = e.states.reduce((e, [, t]) => e + t, 0), r = ((t + e.phase * n) % n + n) % n, i = 0;
	for (let [t, n] of e.states) if (i += n, r < i) return t;
	return e.states[e.states.length - 1][0];
}
var Or = {
	enum: Er,
	state_machine: Dr
};
function kr(e) {
	let t = e.shape === "enum" ? e.values : e.states.map(([e]) => e);
	return [...new Set(t)];
}
function Ar(e, t) {
	return Number(e.toFixed(t));
}
function jr(e, t) {
	if (e.shape in Or) return Or[e.shape](e, t);
	if (e.shape === "counter") {
		let n = Math.max(0, t - e.origin);
		return Ar(e.min + e.rate_per_hour * n / Zn, e.decimals);
	}
	let n = (Tr[e.shape] ?? Tr.constant)(e, t);
	return e.noise && (n += (br(e.seed + 1, Math.floor(t)) - er) * 2 * e.noise), n = Math.min(1, Math.max(0, n)), Ar(e.min + n * (e.max - e.min), e.decimals);
}
// src/signals/signal-preview.ts
var Mr = 320, Nr = 80, Pr = 800, Fr = 100, Ir = 480, Lr = 6, Rr = 12, zr = [
	0,
	.5,
	1
], Br = class extends Ke {
	constructor(...e) {
		super(...e), this.unit = "", this.compact = !1;
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
      height: auto;
      background: var(--secondary-background-color);
      border-radius: 6px;
    }
    :host(:not([compact])) {
      margin-top: 12px;
    }
    :host([compact]) svg {
      max-width: 120px;
      border-radius: 3px;
    }
    text {
      fill: var(--secondary-text-color);
      font-size: 9px;
    }
    polyline {
      fill: none;
      stroke: var(--primary-color);
      stroke-width: 1.5;
    }
  `;
	}
	get width() {
		return this.compact ? Mr : Pr;
	}
	get height() {
		return this.compact ? Nr : Fr;
	}
	points(e) {
		let t = yr(e, 1, 0), n = kr(t), r = Array.from({ length: 481 }, (r, i) => {
			let a = jr(t, i / Ir * Rn(e));
			return typeof a == "string" ? n.indexOf(a) : a;
		}), i = Math.min(...r), a = Math.max(...r) - i || 1;
		return r.map((e, t) => {
			let n = t / Ir * this.width, r = this.height - Lr - (e - i) / a * (this.height - 12);
			return `${n.toFixed(1)},${r.toFixed(1)}`;
		}).join(" ");
	}
	axis(e) {
		return ke`${zr.map((t) => {
			let n = t * this.width, r = t === 0 ? "start" : t === 1 ? "end" : "middle";
			return ke`<text x=${n} y=${this.height + Rr - 2} text-anchor=${r}>${zn(t * e)}</text>`;
		})}`;
	}
	render() {
		if (!this.signal) return _``;
		let e = this.signal.shape === "enum" || this.signal.shape === "state_machine", t = e ? kr(yr(this.signal)).join(" · ") : "", n = this.signal.min ?? 0, r = this.signal.max ?? 100, i = _`<svg
      viewBox="0 0 ${this.width} ${this.height + (this.compact ? 0 : Rr)}"
      role="img"
    >
      ${ke`<polyline points=${this.points(this.signal)}></polyline>`}
      ${this.compact ? "" : this.axis(Rn(this.signal))}
    </svg>`;
		return this.compact ? i : _`${i}
      <div>${e ? t : `${n} – ${r} ${this.unit}`}</div>`;
	}
};
A([S({ attribute: !1 })], Br.prototype, "signal", void 0), A([S()], Br.prototype, "unit", void 0), A([S({ type: Boolean })], Br.prototype, "compact", void 0), Br = A([x("tdc-signal-preview")], Br);
// src/signals/curve-editor.ts
var Vr = {
	min: "edMin",
	max: "edMax",
	decimals: "edDecimals",
	period_s: "edPeriod",
	interval_s: "edInterval",
	phase: "edPhase",
	rate_per_hour: "edRate",
	step_s: "edStep",
	noise: "edNoise"
}, Hr = {
	values: "edValues",
	weights: "edWeights",
	states: "edStates"
}, Ur = class extends j {
	constructor(...e) {
		super(...e), this.shapes = [], this.unit = "", this.files = [];
	}
	connectedCallback() {
		super.connectedCallback(), this.api.info().then((e) => this.files = e.csv_files ?? []).catch(() => void 0);
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent("tdc-signal-change", { detail: e }));
	}
	numberField(e) {
		return _`<label style="flex: 1 1 120px"
      >${this.tr(Vr[e])}
      <input
        type="number"
        step="any"
        .value=${this.signal[e] === void 0 ? "" : String(this.signal[e])}
        @input=${(t) => this.emit(Vn(this.signal, e, t.target.value))}
      />
    </label>`;
	}
	listField(e) {
		return this.textField(this.tr(Hr[e]), Un(this.signal, e), (t) => this.emit(Wn(this.signal, e, t)), { flex: "1 1 240px" });
	}
	changeShape(e) {
		let t = Kn(this.signal, e);
		this.emit(e === "csv" && !t.file && this.files[0] ? {
			...t,
			file: this.files[0]
		} : t);
	}
	renderFile() {
		let e = this.files.includes(this.signal.file ?? "") ? this.files : [...this.signal.file ? [this.signal.file] : [], ...this.files];
		return _`<label style="flex: 1 1 240px"
      >${this.tr("edFile")}
      <select
        ?disabled=${e.length === 0}
        @change=${(e) => this.emit({
			...this.signal,
			file: e.target.value
		})}
      >
        ${e.length === 0 ? _`<option>${this.tr("edNoFile")}</option>` : ""}
        ${e.map((e) => _`<option value=${e} ?selected=${e === this.signal.file}>${e}</option>`)}
      </select>
      <small>${this.tr("edFileHint")}</small>
    </label>`;
	}
	render() {
		return _`
      <div class="row form">
        <label style="flex: 1 1 180px"
          >${this.tr("edShape")}
          <select @change=${(e) => this.changeShape(e.target.value)}>
            ${k(this.hass?.language, this.shapes, (e) => D(this.hass?.language, ct, e)).map((e) => _`<option value=${e} ?selected=${e === this.signal.shape}>
                  ${D(this.hass?.language, ct, e)}
                </option>`)}
          </select>
        </label>
        ${In(this.signal.shape) ? "" : _`${this.numberField("min")} ${this.numberField("max")}
              ${this.numberField("decimals")}`}
      </div>
      <div class="row form">
        ${this.signal.shape === "csv" ? this.renderFile() : ""}
        ${Ln(this.signal.shape).map((e) => this.numberField(e))}
        ${Bn(this.signal.shape).map((e) => this.listField(e))}
      </div>
      ${this.signal.shape === "csv" ? _`<small>${this.tr("edCsvPreview")}</small>` : _`<tdc-signal-preview .signal=${this.signal} unit=${this.unit}></tdc-signal-preview>`}
    `;
	}
};
A([S({ attribute: !1 })], Ur.prototype, "signal", void 0), A([S({ attribute: !1 })], Ur.prototype, "shapes", void 0), A([S()], Ur.prototype, "unit", void 0), A([C()], Ur.prototype, "files", void 0), Ur = A([x("tdc-curve-editor")], Ur);
// src/wizard/entity-helpers.ts
var Wr = ["sensor", "climate"], Gr = "event", Kr = /* @__PURE__ */ "°C.°F.K.%.W.kW.Wh.kWh.V.A.Hz.VA.var.lx.dB.hPa.mbar.bar.Pa.ppm.ppb.µg/m³.m.cm.mm.km.m/s.km/h.l.L/min.m³.g.kg.s.min.h.d.B.kB.MB.GB.Mbit/s.lm".split("."), qr = /^[a-z0-9]+(_[a-z0-9]+)*$/;
function Jr(e) {
	return e.replace(/ß/g, "ss").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function Yr(e) {
	return Wr.includes(e);
}
function Xr(e, t) {
	let { signal: n, unit: r, event_types: i, ...a } = e, o = {
		...a,
		platform: t
	};
	return Yr(t) && (o.signal = n ?? {
		shape: "sine",
		min: 0,
		max: 100
	}, t === "sensor" && r && (o.unit = r)), t === Gr && (o.event_types = i ?? ["press"]), o;
}
function Zr(e) {
	return Xr({
		key: "",
		platform: e,
		name: ""
	}, e);
}
function Qr(e, t) {
	return e.name.trim() ? qr.test(e.key) ? t.includes(e.key) ? "entKeyTaken" : e.platform === Gr && !e.event_types?.length ? "entEventTypes" : "" : "entKeyInvalid" : "entNameEmpty";
}
function $r(e, t, n) {
	return t < 0 ? [...e, n] : e.map((e, r) => r === t ? n : e);
}
function ei(e, t) {
	return e.filter((e, n) => n !== t);
}
function ti(e) {
	let t = Object.values(e?.states ?? {}).map((e) => e.attributes?.unit_of_measurement).filter((e) => typeof e == "string" && e !== "");
	return [.../* @__PURE__ */ new Set([...t, ...Kr])].sort((e, t) => e.localeCompare(t));
}
// src/wizard/helpers.ts
var ni = 10;
function ri(e, t) {
	return Math.round(e / Math.max(1, t) * ni) / ni;
}
function ii(e, t) {
	return e.shape === "enum" || e.shape === "state_machine" ? kr(yr(e)).join(" · ") : `${e.min ?? 0} – ${e.max ?? 100}${t ? ` ${t}` : ""}`;
}
// src/wizard/entity-editor.ts
var ai = -1, F = class extends j {
	constructor(...e) {
		super(...e), this.entities = [], this.shapes = [], this.platforms = [], this.editIndex = ai, this.keyTouched = !1;
	}
	static {
		this.styles = [
			j.styles,
			kn,
			o`
      li.editing {
        background: var(--secondary-background-color);
      }
      .name {
        flex: 1 1 auto;
        min-width: 0;
      }
      .name div {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .empty {
        justify-content: center;
        text-align: center;
        color: var(--secondary-text-color);
      }
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-bottom: 6px;
      }
      .draft {
        margin-top: 10px;
        padding: 12px;
        border: 1px dashed var(--primary-color);
        border-radius: 6px;
        display: grid;
        gap: 10px;
      }
      .actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        align-items: center;
      }
    `
		];
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent("tdc-entities-change", { detail: e }));
	}
	add() {
		this.draft = Zr(this.platforms.includes("sensor") ? lt : "switch"), this.editIndex = ai, this.keyTouched = !1;
	}
	edit(e) {
		this.draft = structuredClone(this.entities[e]), this.editIndex = e, this.keyTouched = !0;
	}
	removeAt(e) {
		this.emit(ei(this.entities, e)), this.editIndex === e ? this.draft = void 0 : this.editIndex > e && --this.editIndex;
	}
	cancel() {
		this.draft = void 0;
	}
	apply() {
		this.draft &&= (this.emit($r(this.entities, this.editIndex, this.draft)), void 0);
	}
	setField(e, t) {
		if (!this.draft) return;
		let n = {
			...this.draft,
			[e]: t
		};
		e === "key" && (this.keyTouched = !0), e === "name" && !this.keyTouched && (n.key = Jr(t)), e === "unit" && !t && delete n.unit, this.draft = n;
	}
	otherKeys() {
		return this.entities.filter((e, t) => t !== this.editIndex).map((e) => e.key);
	}
	renderRow(e, t) {
		let n = D(this.hass?.language, "platform", e.platform);
		return _`<li class=${t === this.editIndex && this.draft ? "editing" : ""}>
      <span class="name">
        <div title=${e.name}>${e.name}</div>
        <small>${e.key} · ${n}</small>
      </span>
      ${e.signal ? _`<span class="range">${ii(e.signal, e.unit)}</span>
              <tdc-signal-preview compact .signal=${e.signal}></tdc-signal-preview>` : ""}
      <button class="small" @click=${() => this.edit(t)}>${this.tr("entEdit")}</button>
      <button class="small danger" @click=${() => this.removeAt(t)}>
        ${this.tr("entDelete")}
      </button>
    </li>`;
	}
	renderDraft(e) {
		let t = Qr(e, this.otherKeys()), n = this.hass?.language;
		return _`<div class="draft">
      <b>${this.tr(this.editIndex < 0 ? "entNew" : "entChange")}</b>
      <div class="row form">
        <label style="flex: 1 1 160px"
          >${this.tr("colName")}
          <input
            .value=${e.name}
            @input=${(e) => this.setField("name", e.target.value)}
          />
        </label>
        <label style="flex: 1 1 140px"
          >${this.tr("entKey")}
          <input
            .value=${e.key}
            @input=${(e) => this.setField("key", e.target.value)}
          />
        </label>
        <label style="flex: 1 1 140px"
          >${this.tr("entPlatform")}
          <select
            @change=${(t) => this.draft = Xr(e, t.target.value)}
          >
            ${k(n, this.platforms, (e) => D(n, "platform", e)).map((t) => _`<option value=${t} ?selected=${t === e.platform}>
                  ${D(n, "platform", t)}
                </option>`)}
          </select>
        </label>
        ${e.platform === "sensor" ? _`<label style="flex: 0 1 130px"
                >${this.tr("entUnit")}
                <input
                  list="units"
                  .value=${e.unit ?? ""}
                  @input=${(e) => this.setField("unit", e.target.value)}
                />
                <datalist id="units">
                  ${ti(this.hass).map((e) => _`<option value=${e}></option>`)}
                </datalist>
              </label>` : ""}
      </div>
      ${e.event_types ? _`<label
              >${this.tr("entEventTypesLabel")}
              <input
                .value=${e.event_types.join(", ")}
                @input=${(t) => this.draft = {
			...e,
			event_types: t.target.value.split(",").map((e) => e.trim()).filter(Boolean)
		}}
              />
            </label>` : ""}
      ${Yr(e.platform) && e.signal ? _`<tdc-curve-editor
              .hass=${this.hass}
              .signal=${e.signal}
              .shapes=${this.shapes}
              unit=${e.unit ?? ""}
              @tdc-signal-change=${(t) => this.draft = {
			...e,
			signal: t.detail
		}}
            ></tdc-curve-editor>` : ""}
      <div class="actions">
        <span class="error">${t ? this.tr(t) : ""}</span>
        <button @click=${() => this.cancel()}>${this.tr("detCancel")}</button>
        <button class="primary" ?disabled=${t !== ""} @click=${() => this.apply()}>
          ${this.tr("entApply")}
        </button>
      </div>
    </div>`;
	}
	render() {
		return _`<div class="head">
        <b>${this.tr("customEntities")} (${this.entities.length})</b>
        <button class="primary" @click=${() => this.add()}>${this.tr("entAdd")}</button>
      </div>
      <ul>
        ${this.entities.length ? this.entities.map((e, t) => this.renderRow(e, t)) : _`<li class="empty">${this.tr("entEmpty")}</li>`}
      </ul>
      ${this.draft ? this.renderDraft(this.draft) : ""}`;
	}
};
A([S({ attribute: !1 })], F.prototype, "entities", void 0), A([S({ attribute: !1 })], F.prototype, "shapes", void 0), A([S({ attribute: !1 })], F.prototype, "platforms", void 0), A([C()], F.prototype, "draft", void 0), A([C()], F.prototype, "editIndex", void 0), A([C()], F.prototype, "keyTouched", void 0), F = A([x("tdc-entity-editor")], F);
// src/wizard/entities-form.ts
var I = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.entities = [], this.shapes = [], this.platforms = [], this.pendingBase = "";
	}
	change(e) {
		this.dispatchEvent(new CustomEvent("tdc-entities-change", { detail: e }));
	}
	applyBase() {
		let e = this.templates.find((e) => e.id === this.pendingBase);
		e && this.change(structuredClone(e.entities)), this.pendingBase = "";
	}
	chooseBase(e) {
		this.pendingBase = e, this.entities.length === 0 && this.applyBase();
	}
	renderBase() {
		let e = this.hass?.language, t = this.templates.find((e) => e.id === this.pendingBase);
		return _`<div class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr("baseTemplate")}
          <select
            .value=${this.pendingBase}
            @change=${(e) => this.chooseBase(e.target.value)}
          >
            <option value="">${this.tr("baseNone")}</option>
            ${k(e, this.templates, (t) => O(e, t.id, t.name)).map((t) => _`<option value=${t.id} ?selected=${t.id === this.pendingBase}>
                  ${O(e, t.id, t.name)}
                </option>`)}
          </select>
        </label>
      </div>
      ${t ? _`<p class="warning">
              ${this.tr("baseReplace", {
			old: this.entities.length,
			count: t.entities.length,
			name: O(e, t.id, t.name)
		})}
              <button class="primary" @click=${() => this.applyBase()}>
                ${this.tr("baseApply")}
              </button>
              <button @click=${() => this.pendingBase = ""}>${this.tr("detCancel")}</button>
            </p>` : ""}`;
	}
	render() {
		return _`<div style="display: grid; gap: 20px">
      ${this.renderBase()}
      <tdc-entity-editor
        .hass=${this.hass}
        .entities=${this.entities}
        .shapes=${this.shapes}
        .platforms=${this.platforms}
        @tdc-entities-change=${(e) => this.change(e.detail)}
      ></tdc-entity-editor>
    </div>`;
	}
};
A([S({ attribute: !1 })], I.prototype, "templates", void 0), A([S({ attribute: !1 })], I.prototype, "entities", void 0), A([S({ attribute: !1 })], I.prototype, "shapes", void 0), A([S({ attribute: !1 })], I.prototype, "platforms", void 0), A([C()], I.prototype, "pendingBase", void 0), I = A([x("tdc-entities-form")], I);
// src/wizard/entity-list.ts
var oi = class extends j {
	constructor(...e) {
		super(...e), this.entities = [];
	}
	static {
		this.styles = [
			j.styles,
			kn,
			o`
      .name {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--primary-text-color);
      }
    `
		];
	}
	render() {
		return this.entities.length ? _`<ul>
      ${this.entities.map((e) => _`<li>
            <span class="name" title=${e.name}>${e.name}</span>
            ${e.signal ? _`<span class="range">${ii(e.signal, e.unit)}</span>
                    <tdc-signal-preview compact .signal=${e.signal}></tdc-signal-preview>` : _`<span class="range"
                    >${D(this.hass?.language, "platform", e.platform)}</span
                  >`}
          </li>`)}
    </ul>` : _``;
	}
};
A([S({ attribute: !1 })], oi.prototype, "entities", void 0), oi = A([x("tdc-entity-list")], oi);
// src/devices/helpers.ts
var si = {
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
}, ci = "fault_";
function li(e, t) {
	let n = e[t] ?? [];
	return {
		plain: n.filter((e) => !e.startsWith("fault_") && !(e in si)),
		withValue: n.filter((e) => e in si),
		faults: n.filter((e) => e.startsWith(ci)).map((e) => e.slice(6))
	};
}
function ui(e, t) {
	let n = si[e], r = Number(t);
	if (n && t.trim() !== "" && !Number.isNaN(r) && !(r < n.min || r > n.max)) return { [n.param]: r };
}
function di(e) {
	let t = Number(e);
	return e.trim() !== "" && t > 0 ? { duration_s: t } : void 0;
}
function fi(e, t) {
	let n = [...Object.values(e ?? {}).map((e) => e.name), ...t.flatMap((e) => e.area ? [e.area] : [])];
	return [...new Set(n)].sort((e, t) => e.localeCompare(t));
}
var pi = [
	"schedules",
	"scenarios",
	dt
];
function mi(e) {
	return pi.flatMap((t) => (e?.[t] ?? []).map((e) => ({
		kind: t,
		name: e.name
	})));
}
function hi(e, t) {
	return e <= 0 ? 0 : Math.floor((e - 1) / t) * t;
}
var gi = [
	{
		key: "templates",
		kind: "multi",
		label: ""
	},
	{
		key: "areas",
		kind: "multi",
		label: ""
	},
	{
		key: "outputs",
		kind: "multi",
		label: ""
	},
	{
		key: "platforms",
		kind: "multi",
		label: ""
	},
	{
		key: "runs",
		kind: "multi",
		label: ""
	},
	{
		key: "state",
		kind: "choice",
		label: ""
	},
	{
		key: "custom",
		kind: "switch",
		label: ""
	}
], _i = "devices";
function vi(e) {
	let t = (t) => {
		let n = e[t];
		return Array.isArray(n) && n.length ? n : void 0;
	}, n = (t) => {
		let n = e[t];
		return typeof n == "string" && n.trim() ? n.trim() : void 0;
	}, r = {
		query: n("query"),
		templates: t("templates"),
		areas: t("areas"),
		outputs: t("outputs"),
		platforms: t("platforms"),
		runs: t("runs"),
		custom: e.custom === !0 || void 0,
		state: n("state"),
		sort: n("sort"),
		descending: e.descending === !0 || void 0
	};
	return Object.fromEntries(Object.entries(r).filter(([, e]) => e !== void 0));
}
function yi(e, t, n) {
	let r = (e ?? []).map((e) => ({
		value: e.value,
		label: `${n(e)} (${e.count})`
	})), i = (Array.isArray(t) ? t : t ? [String(t)] : []).filter((e) => !r.some((t) => t.value === e)).map((e) => ({
		value: e,
		label: n({
			value: e,
			count: 0
		})
	}));
	return [...r, ...i];
}
// src/wizard/creation-wizard.ts
var bi = 10, xi = 10, L = "custom", Si = 50, Ci = ["even", "random"], wi = {
	even: "modeEven",
	random: "modeRandom"
}, R = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.template = "", this.count = bi, this.pattern = "{template} {nn}", this.areas = [], this.mode = "even", this.seed = "", this.output = "native", this.custom = [], this.busy = !1, this.message = "", this.error = "";
	}
	async connectedCallback() {
		super.connectedCallback();
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.template = this.templates[0]?.id ?? L;
		} catch (e) {
			this.error = E(e);
		}
	}
	entities() {
		return this.template === L ? this.custom : this.templates.find((e) => e.id === this.template)?.entities ?? [];
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
			...this.template === L ? { entities: this.custom } : {}
		};
		try {
			let t = await this.api.create(e);
			this.message = this.tr("created", { count: t.devices }), this.dispatchEvent(new CustomEvent("tdc-created"));
		} catch (e) {
			this.error = E(e);
		}
		this.busy = !1;
	}
	renderEstimate() {
		let e = this.entities(), t = ri(e.filter((e) => e.platform === lt).length * this.count, this.info?.tick_seconds ?? xi);
		return _`<p>
      <small>${this.tr("estimate", {
			entities: e.length * this.count,
			rate: t
		})}</small>
      ${t > Si ? _`<br /><span class="warning">${this.tr("rateWarning")}</span>` : ""}
    </p>`;
	}
	templateOptions() {
		let e = this.hass?.language, t = (t) => k(e, this.templates.filter((e) => !e.bundled === t).map((t) => ({
			id: t.id,
			label: O(e, t.id, t.name)
		})), (e) => e.label);
		return {
			bundled: t(!1),
			own: t(!0),
			custom: {
				id: L,
				label: this.tr("customTemplate")
			}
		};
	}
	option(e) {
		let t = e.id === L;
		return _`<option
      value=${e.id}
      ?selected=${e.id === this.template}
      style=${t ? "font-weight: bold" : ""}
    >
      ${t ? "✚ " : ""}${e.label}
    </option>`;
	}
	choose(e) {
		this.template = e;
	}
	render() {
		let e = this.templateOptions();
		return _`
      <div class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr(Qe)}
          <select @change=${(e) => this.choose(e.target.value)}>
            ${e.bundled.map((e) => this.option(e))}
            ${e.own.length ? _`<optgroup label=${this.tr("ownTemplates")}>
                    ${e.own.map((e) => this.option(e))}
                  </optgroup>` : ""}
            <hr />
            ${this.option(e.custom)}
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
            .items=${fi(this.hass?.areas, []).map((e) => ({
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
            ${k(this.hass?.language, Ci, (e) => this.tr(wi[e])).map((e) => _`<option value=${e} ?selected=${e === this.mode}>
                  ${this.tr(wi[e])}
                </option>`)}
          </select>
        </label>
        ${this.select(this.tr("colOutput"), this.info?.outputs ?? ["native"], this.output, (e) => this.tr(wt[e] ?? "outputNative"), (e) => this.output = e)}
        <label style="flex: 0 0 160px"
          >${this.tr("seed")}
          <input
            .value=${this.seed}
            @input=${(e) => this.seed = e.target.value}
          />
          <small>${this.tr("seedHint")}</small>
        </label>
      </p>
      ${this.template === L ? _`<div style="display: grid; gap: 20px">
              <tdc-entities-form
                .hass=${this.hass}
                .templates=${this.templates}
                .entities=${this.custom}
                .shapes=${this.info?.shapes ?? []}
                .platforms=${this.info?.platforms ?? []}
                @tdc-entities-change=${(e) => this.custom = e.detail}
              ></tdc-entities-form>
            </div>` : ""}
      ${this.template === L ? "" : _`<p>
              <small>${this.tr("entityList")}</small>
              <tdc-entity-list .hass=${this.hass} .entities=${this.entities()}></tdc-entity-list>
            </p>`}
      ${this.renderEstimate()}
      <p class="row">
        <button
          class="primary"
          ?disabled=${this.busy || !this.template || this.entities().length === 0}
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
A([C()], R.prototype, "info", void 0), A([C()], R.prototype, "templates", void 0), A([C()], R.prototype, "template", void 0), A([C()], R.prototype, "count", void 0), A([C()], R.prototype, "pattern", void 0), A([C()], R.prototype, "areas", void 0), A([C()], R.prototype, "mode", void 0), A([C()], R.prototype, "seed", void 0), A([C()], R.prototype, "output", void 0), A([C()], R.prototype, "custom", void 0), A([C()], R.prototype, "busy", void 0), A([C()], R.prototype, "message", void 0), A([C()], R.prototype, "error", void 0), R = A([x("tdc-creation-wizard")], R);
// src/wizard/template-wizard.ts
var z = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.name = "", this.entities = [], this.busy = !1, this.error = "";
	}
	async connectedCallback() {
		super.connectedCallback();
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]);
		} catch (e) {
			this.error = E(e);
		}
	}
	willUpdate(e) {
		e.has("editing") && (this.name = this.editing?.name ?? "", this.entities = structuredClone(this.editing?.entities ?? []));
	}
	async save() {
		let e = this.name.trim();
		this.busy = !0, this.error = "";
		try {
			let t = await this.api.saveTemplate(this.editing?.id ?? Jr(e), e, this.entities);
			this.dispatchEvent(new CustomEvent("tdc-template-saved", { detail: t }));
		} catch (e) {
			this.error = E(e);
		}
		this.busy = !1;
	}
	render() {
		let e = this.name.trim(), t = this.editing?.id ?? Jr(e), n = !this.editing && this.templates.some((e) => e.id === t && !e.bundled);
		return _`
      <div style="display: grid; gap: 20px">
        <label
          >${this.tr("tplName")}
          <input
            .value=${this.name}
            @input=${(e) => this.name = e.target.value}
          />
          ${n ? _`<small class="warning">${this.tr("tplExists")}</small>` : ""}
        </label>
        <tdc-entities-form
          .hass=${this.hass}
          .templates=${this.templates}
          .entities=${this.entities}
          .shapes=${this.info?.shapes ?? []}
          .platforms=${this.info?.platforms ?? []}
          @tdc-entities-change=${(e) => this.entities = e.detail}
        ></tdc-entities-form>
      </div>
      <p class="row">
        <button
          class="primary"
          ?disabled=${this.busy || !t || this.entities.length === 0}
          @click=${() => void this.save()}
        >
          ${this.tr("tplSave")}
        </button>
        <span class="error">${this.error}</span>
      </p>
    `;
	}
};
A([S({ attribute: !1 })], z.prototype, "editing", void 0), A([C()], z.prototype, "info", void 0), A([C()], z.prototype, "templates", void 0), A([C()], z.prototype, "name", void 0), A([C()], z.prototype, "entities", void 0), A([C()], z.prototype, "busy", void 0), A([C()], z.prototype, "error", void 0), z = A([x("tdc-template-wizard")], z);
// src/wizard/template-manager.ts
var B = class extends j {
	constructor(...e) {
		super(...e), this.own = [], this.form = !1, this.confirming = "", this.busy = !1, this.error = "";
	}
	static {
		this.styles = [
			j.styles,
			kn,
			o`
      li > span {
        flex: 1 1 auto;
        min-width: 0;
      }
      li.empty {
        justify-content: center;
        color: var(--secondary-text-color);
      }
    `
		];
	}
	async connectedCallback() {
		super.connectedCallback(), await this.reload();
	}
	async reload() {
		try {
			this.own = (await this.api.templates()).filter((e) => !e.bundled);
		} catch (e) {
			this.error = E(e);
		}
	}
	openForm(e) {
		this.editing = e, this.form = !0, this.error = "";
	}
	async closeForm() {
		this.form = !1, await this.reload();
	}
	async removeTemplate(e) {
		this.busy = !0, this.error = "";
		try {
			await this.api.deleteTemplate(e), this.confirming = "", await this.reload();
		} catch (e) {
			this.error = E(e);
		}
		this.busy = !1;
	}
	renderActions(e) {
		return this.confirming === e.id ? _`<button
        class="small danger"
        ?disabled=${this.busy}
        @click=${() => void this.removeTemplate(e.id)}
      >
        ${this.tr("tplDeleteConfirm")}
      </button>
      <button class="small" @click=${() => this.confirming = ""}>
        ${this.tr("detCancel")}
      </button>` : _`<button class="small" @click=${() => this.openForm(e)}>
          ${this.tr("entEdit")}
        </button>
        <button class="small danger" @click=${() => this.confirming = e.id}>
          ${this.tr("entDelete")}
        </button>`;
	}
	renderList() {
		return _`<p class="end">
        <button class="primary" @click=${() => this.openForm()}>+ ${this.tr("tplNew")}</button>
      </p>
      <ul>
        ${this.own.length ? this.own.map((e) => _`<li>
                    <span>
                      <div title=${e.name}>${e.name}</div>
                      <small>${this.tr("tplEntities", { count: e.entities.length })}</small>
                    </span>
                    ${this.renderActions(e)}
                  </li>`) : _`<li class="empty">${this.tr("tplNone")}</li>`}
      </ul>
      <p class="error">${this.error}</p>`;
	}
	render() {
		return this.form ? _`<p>
        <button @click=${() => void this.closeForm()}>‹ ${this.tr("tplBack")}</button>
      </p>
      <tdc-template-wizard
        .hass=${this.hass}
        .editing=${this.editing}
        @tdc-template-saved=${() => void this.closeForm()}
      ></tdc-template-wizard>` : this.renderList();
	}
};
A([C()], B.prototype, "own", void 0), A([C()], B.prototype, "form", void 0), A([C()], B.prototype, "editing", void 0), A([C()], B.prototype, "confirming", void 0), A([C()], B.prototype, "busy", void 0), A([C()], B.prototype, "error", void 0), B = A([x("tdc-template-manager")], B);
// src/devices/device-detail.ts
var V = class extends j {
	constructor(...e) {
		super(...e), this.actions = {}, this.areas = [], this.shapes = [], this.picked = {}, this.inputs = {}, this.curves = {}, this.busy = !1, this.error = "";
	}
	static {
		this.styles = [j.styles, o`
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
      .usage {
        margin: 24px 0 8px 32px;
      }
      .usage ul {
        margin: 8px 0 0;
        padding-left: 20px;
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
			this.error = E(e);
		}
		this.busy = !1;
	}
	async saveArea() {
		let e = (this.areaDraft ?? this.device.area ?? "").trim();
		await this.run(async () => {
			await this.api.updateDevice(this.device.id, e || null), this.areaDraft = void 0;
		});
	}
	async openCurve(e) {
		await this.run(async () => {
			let t = (await this.api.device(this.device.id)).entities.find((t) => t.key === e.key)?.signal;
			t && (this.curves = {
				...this.curves,
				[e.key]: { ...t }
			});
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
		return _`<div class="row area-row">
      <label style="flex: 0 1 320px"
        >${this.tr("detArea")}
        <tdc-multi-select
          .hass=${this.hass}
          .items=${this.areas.map((e) => ({
			value: e,
			label: e
		}))}
          .selected=${e ? [e] : []}
          single
          allowAdd
          empty=${this.tr("detAreaNone")}
          @tdc-select-change=${(e) => this.areaDraft = e.detail[0] ?? ""}
        ></tdc-multi-select>
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
		let t = this.hass?.language, n = li(this.actions, e.platform);
		return k(t, [
			...n.plain,
			...n.withValue,
			...n.faults.map((e) => `${ci}${e}`)
		], (e) => Et(t, e)).map((e) => ({
			value: e,
			label: Et(t, e)
		}));
	}
	pick(e, t) {
		t in si || t.startsWith("fault_") ? this.picked = {
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
		let n = si[t], r = `${e.key}:${t}`, i = this.inputs[r] ?? String(n ? n.start : 60), a = n ? ui(t, i) : di(i);
		return _`<span class="row">
      <strong>${Et(this.hass?.language, t)}</strong>
      <input
        type="number"
        min=${n ? n.min : 1}
        max=${n ? n.max : y}
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
		return _`<tr>
      <td colspan="3" class="curve">
        <tdc-curve-editor
          .hass=${this.hass}
          .signal=${this.curves[e.key]}
          .shapes=${this.shapes.filter((e) => !In(e))}
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
		let t = this.hass?.language, n = this.menuItems(e), r = e.shape != null && !In(e.shape);
		return _`<tr>
        <td>
          ${Ot(t, e.key, e.name)}<br /><small
            >${D(t, "platform", e.platform)}</small
          >
        </td>
        <td>
          ${kt(t, e.state)}${e.unit ? ` ${e.unit}` : ""}${e.fault ? _`<br /><small class="warning">⚠ ${D(t, "fault", e.fault)}</small>` : ""}
        </td>
        <td class="row">
          ${n.length ? _`<tdc-menu-button
                  .hass=${this.hass}
                  label=${this.tr("detActions")}
                  ?disabled=${this.busy}
                  .items=${n}
                  @tdc-pick=${(t) => this.pick(e, t.detail)}
                ></tdc-menu-button>` : ""}
          ${this.renderPicked(e)}
          ${r ? _`<button
                  ?disabled=${this.busy || e.key in this.curves}
                  @click=${() => void this.openCurve(e)}
                >
                  ${this.tr("detCurve")}
                </button>` : ""}
        </td>
      </tr>
      ${e.key in this.curves ? this.renderCurve(e) : ""}`;
	}
	renderUsage() {
		let e = mi(this.device.used_by);
		return e.length === 0 ? _`<p class="usage"><small>${this.tr("useNone")}</small></p>` : _`<details class="usage">
      <summary>${this.tr("useTitle", { count: e.length })}</summary>
      <ul>
        ${e.map((e) => _`<li>${this.tr(`use_${e.kind}`)}: ${e.name}</li>`)}
      </ul>
    </details>`;
	}
	render() {
		return _`
      ${this.renderArea()}
      <table>
        <tr>
          <th>${this.tr("detEntity")}</th>
          <th>${this.tr("detState")}</th>
          <th>${this.tr("colActions")}</th>
        </tr>
        ${this.device.entities.map((e) => this.renderEntity(e))}
      </table>
      ${this.renderUsage()}
      <p class="error">${this.error}</p>
    `;
	}
};
A([S({ attribute: !1 })], V.prototype, "device", void 0), A([S({ attribute: !1 })], V.prototype, "actions", void 0), A([S({ attribute: !1 })], V.prototype, "areas", void 0), A([S({ attribute: !1 })], V.prototype, "shapes", void 0), A([C()], V.prototype, "areaDraft", void 0), A([C()], V.prototype, "picked", void 0), A([C()], V.prototype, "inputs", void 0), A([C()], V.prototype, "curves", void 0), A([C()], V.prototype, "busy", void 0), A([C()], V.prototype, "error", void 0), V = A([x("tdc-device-detail")], V);
// src/devices/duplicate-dialog.ts
var Ti = "{template} {n}", Ei = 500, Di = (e) => e.target.value, Oi = class extends j {
	constructor(...e) {
		super(...e), this.count = 1, this.pattern = Ti, this.busy = !1, this.error = "";
	}
	async submit() {
		this.busy = !0;
		try {
			await this.api.duplicate(this.device.id, this.count, this.pattern), this.error = "", this.dispatchEvent(new CustomEvent("tdc-created", {
				bubbles: !0,
				composed: !0
			}));
		} catch (e) {
			this.error = E(e);
		}
		this.busy = !1;
	}
	render() {
		let e = Number.isInteger(this.count) && this.count >= 1 && this.count <= Ei;
		return _`
      <p><b>${this.device.name}</b></p>
      <div class="row">
        <label
          >${this.tr("dupCount")}
          <input
            type="number"
            min="1"
            max=${Ei}
            .value=${String(this.count)}
            @input=${(e) => this.count = Number(Di(e))}
          />
        </label>
        <label
          >${this.tr("dupPattern")}
          <input
            type="text"
            maxlength="64"
            .value=${this.pattern}
            @input=${(e) => this.pattern = Di(e)}
          />
        </label>
      </div>
      <p><small>${this.tr("dupHint")}</small></p>
      ${this.error ? _`<p class="error">${this.error}</p>` : ""}
      <button class="primary" ?disabled=${this.busy || !e} @click=${() => void this.submit()}>
        ${this.tr("dupDo")}
      </button>
    `;
	}
};
A([S({ attribute: !1 })], Oi.prototype, "device", void 0), A([C()], Oi.prototype, "count", void 0), A([C()], Oi.prototype, "pattern", void 0), A([C()], Oi.prototype, "busy", void 0), A([C()], Oi.prototype, "error", void 0), Oi = A([x("tdc-duplicate-dialog")], Oi);
// src/devices/device-list.ts
var ki = 4, Ai = 6, ji = {
	switch: "toggle",
	event: "press",
	binary_sensor: "pulse",
	light: "toggle"
}, Mi = "fire:", Ni = "remove", Pi = "duplicate", Fi = [
	lt,
	"switch",
	"binary_sensor",
	"light",
	"cover",
	"climate"
], H = class extends P {
	constructor(...e) {
		super(...e), this.devices = [], this.total = 0, this.matched = 0, this.offset = 0, this.loaded = !1, this.templating = !1, this.filter = dn(_i, gi), this.facetsStale = !0;
	}
	static {
		this.styles = [
			P.styles,
			Mt,
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
	optionsLoaded() {}
	async refresh() {
		let e = vi(this.filter), t = this.facetsStale;
		this.facetsStale = !1;
		try {
			let n = await this.api.devices(this.offset, 50, e, t);
			n.devices.length === 0 && this.offset > 0 && (this.offset = hi(n.matched, 50), n = await this.api.devices(this.offset, 50, e, t)), this.devices = n.devices, this.total = n.total, this.matched = n.matched, n.facets && (this.facets = n.facets), this.error = "";
		} catch (e) {
			this.facetsStale ||= t, this.error = E(e);
		}
		this.loaded = !0;
	}
	reload() {
		this.facetsStale = !0, this.refresh();
	}
	setFilter(e) {
		this.filter = e, fn(_i, e), this.offset = 0, this.reload();
	}
	facetTemplate(e) {
		return e.value === "custom" ? this.tr("customTemplate") : O(this.hass?.language, e.value, e.value);
	}
	filterFields() {
		let e = this.hass?.language, t = this.facets, n = (e, n, r) => yi(t?.[e], this.filter[n], r), r = {
			fault: this.tr("filterFault"),
			used: this.tr("filterUsed"),
			unused: this.tr("filterUnused")
		};
		return [
			{
				key: "templates",
				kind: "multi",
				label: this.tr("colTemplate"),
				options: n("templates", "templates", (e) => this.facetTemplate(e))
			},
			{
				key: "areas",
				kind: "multi",
				label: this.tr("colArea"),
				options: n("areas", "areas", (e) => e.value === "" ? this.tr("areasNone") : e.value)
			},
			{
				key: "outputs",
				kind: "multi",
				label: this.tr("colOutput"),
				options: n("outputs", "outputs", (e) => this.tr(wt[e.value] ?? "outputNative"))
			},
			{
				key: "platforms",
				kind: "multi",
				label: this.tr("detEntity"),
				options: n("platforms", "platforms", (t) => D(e, "platform", t.value))
			},
			{
				key: "runs",
				kind: "multi",
				label: this.tr("schTarget_run"),
				options: n("runs", "runs", (e) => e.label || e.value)
			},
			{
				key: "state",
				kind: "choice",
				label: this.tr("detState"),
				options: n("state", "state", (e) => r[e.value] ?? e.value)
			},
			{
				key: "custom",
				kind: "switch",
				label: this.tr("filterCustom")
			}
		];
	}
	renderFilter() {
		return _`<tdc-filter-bar
      .hass=${this.hass}
      .fields=${this.filterFields()}
      .values=${this.filter}
      .sorts=${[
			{
				value: "name",
				label: this.tr("sortName")
			},
			{
				value: "created",
				label: this.tr("sortCreated")
			},
			{
				value: "template",
				label: this.tr("sortTemplate")
			}
		]}
      .matched=${this.matched}
      .total=${this.total}
      @tdc-filter-change=${(e) => this.setFilter(e.detail)}
    ></tdc-filter-bar>`;
	}
	goTo(e) {
		this.offset = e, this.refresh();
	}
	async fire(e, t) {
		try {
			await this.api.fire(e.id, t.key, ji[t.platform]), await this.refresh();
		} catch (e) {
			this.error = E(e);
		}
	}
	menuItems(e) {
		let t = this.hass?.language;
		return k(t, [
			...e.entities.filter((e) => e.platform in ji).map((e) => ({
				value: `${Mi}${e.key}`,
				label: `${Ot(t, e.key, e.name)} – ${Et(t, ji[e.platform])}`
			})),
			{
				value: Pi,
				label: this.tr("duplicate")
			},
			{
				value: Ni,
				label: this.tr("remove"),
				disabled: mi(e.used_by).length > 0,
				hint: this.tr("removeBlocked")
			}
		], (e) => e.label);
	}
	pick(e, t) {
		if (t === Pi) {
			this.duplicating = e;
			return;
		}
		if (t === Ni) {
			this.dispatchEvent(new CustomEvent("tdc-remove", { detail: {
				target: w,
				id: e.id
			} }));
			return;
		}
		let n = e.entities.find((e) => `${Mi}${e.key}` === t);
		n && this.fire(e, n);
	}
	values(e) {
		let t = this.hass?.language;
		return e.entities.filter((e) => Fi.includes(e.platform)).slice(0, ki).map((e) => {
			let n = e.unit ? ` ${e.unit}` : "", r = e.fault ? ` ⚠ ${D(t, "fault", e.fault)}` : "";
			return `${Ot(t, e.key, e.name)}: ${kt(t, e.state)}${n}${r}`;
		}).join(" · ");
	}
	templateName(e) {
		return e.template === "custom" ? this.tr("customTemplate") : O(this.hass?.language, e.template, e.model);
	}
	renderRow(e) {
		let t = this.expanded.has(e.id);
		return _`<tr class="device card" @click=${() => this.toggle(e.id)}>
        <td class="name nowrap">${t ? "▾" : "▸"} ${e.name}</td>
        <td class="nowrap" data-label=${this.tr("colTemplate")}>${this.templateName(e)}</td>
        <td class="nowrap" data-label=${this.tr("colArea")}>${e.area ?? "–"}</td>
        <td class="nowrap" data-label=${this.tr("colOutput")}>
          ${this.tr(wt[e.output] ?? "outputNative")}
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
      ${t ? this.detailRow(Ai, _`<tdc-device-detail
                .hass=${this.hass}
                .device=${e}
                .actions=${this.info?.actions ?? {}}
                .shapes=${this.info?.shapes ?? []}
                .areas=${fi(this.hass.areas, this.devices)}
                @tdc-changed=${() => this.reload()}
              ></tdc-device-detail>`) : ""}`;
	}
	renderNew() {
		return _`
      <p>
        <button class="primary" @click=${() => this.creating = !0}>
          + ${this.tr("create")}
        </button>
        <button class="primary" @click=${() => this.templating = !0}>
          ${this.tr("tplManage")}
        </button>
      </p>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr("create")}
        ?open=${this.creating}
        @tdc-close=${() => this.creating = !1}
      >
        ${this.creating ? _`<tdc-creation-wizard
                .hass=${this.hass}
                @tdc-created=${() => {
			this.creating = !1, this.reload();
		}}
              ></tdc-creation-wizard>` : y}
      </tdc-dialog>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr("duplicate")}
        ?open=${this.duplicating !== void 0}
        @tdc-close=${() => this.duplicating = void 0}
      >
        ${this.duplicating ? _`<tdc-duplicate-dialog
                .hass=${this.hass}
                .device=${this.duplicating}
                @tdc-created=${() => {
			this.duplicating = void 0, this.refresh();
		}}
              ></tdc-duplicate-dialog>` : y}
      </tdc-dialog>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr("tplManage")}
        ?open=${this.templating}
        @tdc-close=${() => this.templating = !1}
      >
        ${this.templating ? _`<tdc-template-manager .hass=${this.hass}></tdc-template-manager>` : y}
      </tdc-dialog>
    `;
	}
	render() {
		return this.loaded ? _`
      ${this.renderNew()} ${this.error ? _`<p class="error">${this.error}</p>` : ""}
      ${this.total === 0 ? "" : this.renderFilter()}
      ${this.total === 0 ? _`<p>${this.tr("noDevices")}</p>` : this.matched === 0 ? _`<p>
                ${this.tr("noMatches")}
                <a
                  href="#"
                  @click=${(e) => {
			e.preventDefault(), this.setFilter(on(this.filterFields(), this.filter));
		}}
                  >${this.tr("noMatchesReset")}</a
                >
              </p>` : _`<table class="cards">
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
                    ${Yt(this.devices, (e) => e.id, (e) => this.renderRow(e))}
                  </tbody>
                </table>
                <p class="row">
                  <button
                    ?disabled=${this.offset === 0}
                    @click=${() => this.goTo(Math.max(0, this.offset - 50))}
                  >
                    ${this.tr("pagePrevious")}
                  </button>
                  <small>
                    ${this.tr("devicesRange", {
			from: this.offset + 1,
			to: this.offset + this.devices.length,
			total: this.matched
		})}
                  </small>
                  <button
                    ?disabled=${this.offset + this.devices.length >= this.matched}
                    @click=${() => this.goTo(this.offset + 50)}
                  >
                    ${this.tr("pageNext")}
                  </button>
                </p>`}
    ` : _`${this.tr("loading")}`;
	}
};
A([C()], H.prototype, "devices", void 0), A([C()], H.prototype, "total", void 0), A([C()], H.prototype, "matched", void 0), A([C()], H.prototype, "offset", void 0), A([C()], H.prototype, "loaded", void 0), A([C()], H.prototype, "templating", void 0), A([C()], H.prototype, "duplicating", void 0), A([C()], H.prototype, "facets", void 0), A([C()], H.prototype, "filter", void 0), H = A([x("tdc-device-list")], H);
// src/group/helpers.ts
var Ii = "groups", Li = [];
function Ri(e) {
	return {
		texts: (t) => [
			t.name,
			String(t.number),
			e(t)
		],
		values: () => !1
	};
}
// src/group/group-form.ts
var U = class extends j {
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
		this.dispatchEvent(new CustomEvent(ft, {
			detail: {
				name: this.name.trim(),
				members: this.members
			},
			bubbles: !0,
			composed: !0
		}));
	}
	render() {
		return _`
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
          ${this.devices.length === 0 ? _`<small>${this.tr("grpNoDevices")}</small>` : y}
        </label>
      </div>
      ${this.submitRow({
			enabled: !!this.name.trim() && this.members.length > 0,
			busy: this.busy,
			label: this.submitLabel || this.tr("schSave"),
			editing: !!this.group,
			submit: () => this.submit()
		})}
    `;
	}
};
A([S({ attribute: !1 })], U.prototype, "devices", void 0), A([S({ attribute: !1 })], U.prototype, "group", void 0), A([S()], U.prototype, "submitLabel", void 0), A([S({ type: Boolean })], U.prototype, "busy", void 0), A([C()], U.prototype, "name", void 0), A([C()], U.prototype, "members", void 0), U = A([x("tdc-group-form")], U);
// src/group/group-panel.ts
var zi = 3, Bi = "z2m", Vi = class extends P {
	static {
		this.styles = [
			j.styles,
			Mt,
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
	constructor() {
		super(), this.groups = [], this.devices = [], this.restoreFilter(Ii, Li);
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			[this.groups, this.devices] = await Promise.all([this.api.groups(), this.api.deviceNames()]);
		} catch (e) {
			this.error = E(e);
		}
	}
	members() {
		return this.devices.filter((e) => e.output === Bi).map((e) => ({
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
	renderNew() {
		return this.newPopup(this.tr("grpNew"), _`<tdc-group-form
        id="new"
        .hass=${this.hass}
        .devices=${this.members()}
        submitLabel=${this.tr("grpAdd")}
        ?busy=${this.busy}
        @tdc-submit=${(e) => void this.add(e.detail)}
      ></tdc-group-form>`);
	}
	renderRow(e) {
		let t = this.expanded.has(e.id);
		return _`<tr class="group card" @click=${() => this.toggle(e.id)}>
        <td class="name">
          ${t ? "▾" : "▸"} ${e.name}<br /><small
            >${this.tr("grpNumber", { number: e.number })}</small
          >
        </td>
        <td data-label=${this.tr("grpMembers")}>${this.memberNames(e)}</td>
        <td data-label=${this.tr("colActions")}>
          ${this.removeButton(() => this.api.removeGroup(e.id))}
        </td>
      </tr>
      ${t ? this.editRow(zi, e.id, _`<tdc-group-form
                .hass=${this.hass}
                .devices=${this.members()}
                .group=${e}
                ?busy=${this.busy}
              ></tdc-group-form>`, (t) => void this.save(e, t)) : y}`;
	}
	renderTable(e) {
		return _`<table class="cards">
      <tr>
        <th>${this.tr("colName")}</th>
        <th>${this.tr("grpMembers")}</th>
        <th>${this.tr("colActions")}</th>
      </tr>
      ${Yt(e, (e) => e.id, (e) => this.renderRow(e))}
    </table>`;
	}
	render() {
		return _`
      ${this.renderNew()}
      ${this.groups.length === 0 ? _`<p>${this.tr("grpNone")}</p>` : this.renderFiltered(this.groups, Li, Ri((e) => this.memberNames(e)), (e) => this.renderTable(e))}
      <p class="error">${this.error}</p>
    `;
	}
};
A([C()], Vi.prototype, "groups", void 0), A([C()], Vi.prototype, "devices", void 0), A([Ze("tdc-group-form#new")], Vi.prototype, "newForm", void 0), Vi = A([x("tdc-group-panel")], Vi);
function Hi(e) {
	return Math.min(365, Math.max(1, Math.round(e) || 1));
}
function Ui(e, t) {
	let [n, ...r] = (t.length ? e.filter((e) => t.includes(e.id)) : e).map((e) => {
		let t = /* @__PURE__ */ new Map();
		for (let n of e.entities) {
			let e = n.shape;
			n.platform === "sensor" && n.state_class && e && !In(e) && t.set(n.key, {
				key: n.key,
				name: n.name
			});
		}
		return t;
	});
	return n ? [...n.values()].filter((e) => r.every((t) => t.has(e.key))) : [];
}
// src/history/history-panel.ts
var Wi = 7, W = class extends j {
	constructor(...e) {
		super(...e), this.days = Wi, this.chosen = [], this.entity = "", this.devices = [], this.busy = !1, this.message = "", this.error = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.loadDevices();
	}
	async loadDevices() {
		try {
			this.devices = await this.api.deviceNames();
		} catch (e) {
			this.error = E(e);
		}
	}
	pick(e) {
		this.chosen = e, Ui(this.devices, e).some((e) => e.key === this.entity) || (this.entity = "");
	}
	async importHistory() {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let e = await this.api.importHistory(Hi(this.days), this.chosen.length > 1 ? this.chosen : this.chosen[0], this.entity || void 0);
			this.message = this.tr("histDone", { ...e });
		} catch (e) {
			this.error = E(e);
		}
		this.busy = !1;
	}
	renderChoice(e, t, n, r) {
		let i = k(this.hass?.language, t, (e) => e.label);
		return _`<label
      >${e}
      <select @change=${(e) => r(e.target.value)}>
        <option value="" ?selected=${n === ""}>${this.tr("histAll")}</option>
        ${i.map((e) => _`<option value=${e.value} ?selected=${e.value === n}>
              ${e.label}
            </option>`)}
      </select>
    </label>`;
	}
	render() {
		let e = this.hass?.language, t = this.devices.map((e) => ({
			value: e.id,
			label: e.name
		})), n = Ui(this.devices, this.chosen).map((t) => ({
			value: t.key,
			label: Ot(e, t.key, t.name)
		}));
		return _`
      <p>${this.tr("histIntro")}</p>
      <div class="fields bottom">
        <label
          >${this.tr("histDays")}
          <input
            type="number"
            min=${1}
            max=${365}
            .value=${String(this.days)}
            @input=${(e) => this.days = Number(e.target.value)}
          />
        </label>
        <label
          >${this.tr("histDevice")}
          <tdc-multi-select
            .hass=${this.hass}
            .items=${t}
            .selected=${this.chosen}
            empty=${this.tr("histAll")}
            @tdc-select-change=${(e) => this.pick(e.detail)}
          ></tdc-multi-select>
        </label>
        ${this.renderChoice(this.tr("histEntity"), n, this.entity, (e) => this.entity = e)}
        <div>
          <button class="primary" ?disabled=${this.busy} @click=${() => void this.importHistory()}>
            ${this.tr("histImport")}
          </button>
        </div>
      </div>
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
A([C()], W.prototype, "days", void 0), A([C()], W.prototype, "chosen", void 0), A([C()], W.prototype, "entity", void 0), A([C()], W.prototype, "devices", void 0), A([C()], W.prototype, "busy", void 0), A([C()], W.prototype, "message", void 0), A([C()], W.prototype, "error", void 0), W = A([x("tdc-history-panel")], W);
// src/common/targets.ts
var Gi = 1e3;
function Ki(e) {
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
function qi(e) {
	let t = /* @__PURE__ */ new Date(e * Gi), n = (e) => String(e).padStart(2, "0");
	return `${`${t.getFullYear()}-${n(t.getMonth() + 1)}-${n(t.getDate())}`} ${n(t.getHours())}:${n(t.getMinutes())}`;
}
function Ji(e, t, n) {
	return `${qi(e.created)} · ${O(t, e.template, e.model)} · ${n(e.count)}`;
}
function Yi(e, t, n, r, i) {
	return k(r, e === "device" ? t.map((e) => ({
		value: e.id,
		label: e.name
	})) : e === "template" ? n.map((e) => ({
		value: e.id,
		label: O(r, e.id, e.name)
	})) : Ki(t).map((e) => ({
		value: e.id,
		label: Ji(e, r, i)
	})), (e) => e.label);
}
function Xi(e, t, n, r, i, a) {
	return e === "device" ? n.find((e) => e.id === t || e.name === t)?.name ?? t : Yi(e, n, r, i, a).find((e) => e.value === t)?.label ?? t;
}
function Zi(e, t, n) {
	return e === "device" ? n.find((e) => e.id === t || e.name === t)?.id ?? t : t;
}
// src/common/target-select.ts
var Qi = {
	device: "schTarget_device",
	template: "schTarget_template",
	run: "schTarget_run"
}, G = class extends j {
	constructor(...e) {
		super(...e), this.kind = w, this.values = [], this.multiple = !1, this.templates = [], this.devices = [], this.error = "";
	}
	willUpdate(e) {
		e.has("kind") && this.kind !== "template" && this.loadDevices(), super.willUpdate(e);
	}
	async loadDevices() {
		try {
			this.devices = await this.api.deviceNames(), this.error = "";
		} catch (e) {
			this.error = E(e);
		}
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent("tdc-target-change", { detail: e }));
	}
	updated(e) {
		if (super.updated(e), this.multiple && this.kind === "device") return;
		let t = this.options();
		t.length === 1 && this.values[0] !== t[0].value && this.emit([t[0].value]);
	}
	options() {
		return Yi(this.kind, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e }));
	}
	renderSingle(e, t) {
		let n = t === "" || e.some((e) => e.value === t);
		return _`<select
      ?disabled=${e.length === 1}
      @change=${(e) => {
			let t = e.target.value;
			this.emit(t ? [t] : []);
		}}
    >
      ${e.length === 1 ? "" : _`<option value="" ?selected=${t === ""}>${this.tr("pickOne")}</option>`}
      ${n ? "" : _`<option value=${t} selected>${t}</option>`}
      ${e.map((e) => _`<option value=${e.value} ?selected=${e.value === t}>
            ${e.label}
          </option>`)}
    </select>`;
	}
	render() {
		let e = this.options(), t = this.values.map((e) => Zi(this.kind, e, this.devices));
		return _`<label>
      ${this.tr(Qi[this.kind])}
      ${this.multiple && this.kind === "device" ? _`<tdc-multi-select
              .hass=${this.hass}
              .items=${e}
              .selected=${t}
              empty=${this.tr("pickOne")}
              @tdc-select-change=${(e) => this.emit(e.detail)}
            ></tdc-multi-select>` : this.renderSingle(e, t[0] ?? "")}
      ${this.error ? _`<small class="error">${this.error}</small>` : ""}
    </label>`;
	}
};
A([S()], G.prototype, "kind", void 0), A([S({ attribute: !1 })], G.prototype, "values", void 0), A([S({ type: Boolean })], G.prototype, "multiple", void 0), A([S({ attribute: !1 })], G.prototype, "templates", void 0), A([C()], G.prototype, "devices", void 0), A([C()], G.prototype, "error", void 0), G = A([x("tdc-target-select")], G);
// src/removal/removal-panel.ts
var $i = 20, ea = {
	all: "targetAll",
	device: "targetDevice",
	run: "targetRun"
}, K = class extends j {
	constructor(...e) {
		super(...e), this.target = "all", this.targetId = "", this.busy = !1, this.message = "", this.error = "";
	}
	static {
		this.styles = [j.styles, o`
      .plan {
        margin-top: 20px;
      }
      .plan ul {
        margin: 0 0 12px;
        padding-left: 20px;
      }
    `];
	}
	async showPlan() {
		this.message = "", this.error = "";
		try {
			this.plan = await this.api.removalPlan(this.target, this.targetId || void 0);
		} catch (e) {
			this.plan = void 0, this.error = E(e);
		}
	}
	async confirm() {
		this.busy = !0;
		try {
			let e = await this.api.removalRun(this.target, this.targetId || void 0);
			this.message = this.tr("removed", { count: e.devices + e.orphans }), this.plan = void 0;
		} catch (e) {
			this.error = E(e);
		}
		this.busy = !1;
	}
	async scanTopics() {
		this.message = "", this.error = "", this.busy = !0;
		try {
			this.leftover = (await this.api.orphanTopics()).topics;
		} catch (e) {
			this.leftover = void 0, this.error = E(e);
		}
		this.busy = !1;
	}
	async deleteLeftover() {
		this.busy = !0;
		try {
			let e = await this.api.clearOrphanTopics(this.leftover ?? []);
			this.message = this.tr("leftoverDeleted", { count: e.cleared.length }), this.leftover = void 0;
		} catch (e) {
			this.error = E(e);
		}
		this.busy = !1;
	}
	renderLeftover(e) {
		return e.length === 0 ? _`<p>${this.tr("leftoverNone")}</p>` : _`<p>${this.tr("leftoverTopics", { count: e.length })}</p>
      <p>
        <small
          >${e.slice(0, $i).join(", ")}${e.length > $i ? " …" : ""}</small
        >
      </p>
      <div class="row">
        <button class="primary" ?disabled=${this.busy} @click=${() => void this.deleteLeftover()}>
          ${this.tr("deleteLeftover")}
        </button>
        <button @click=${() => this.leftover = void 0}>${this.tr("keep")}</button>
      </div>`;
	}
	renderPlan(e) {
		return e.devices.length + e.orphans.length === 0 && e.runs.length === 0 ? _`<p>${this.tr("planNothing")}</p>` : _`<ul>
        <li>${this.tr("planDevices", { count: e.devices.length })}</li>
        ${e.groups.length ? _`<li>${this.tr("planGroups", { count: e.groups.length })}</li>` : ""}
        ${e.topics.length ? _`<li>${this.tr("planTopics", { count: e.topics.length })}</li>` : ""}
        ${e.statistics.length ? _`<li>${this.tr("planStatistics", { count: e.statistics.length })}</li>` : ""}
        ${e.scenarios.length ? _`<li>${this.tr("planScenarios", { count: e.scenarios.length })}</li>` : ""}
        ${e.schedules.length ? _`<li>${this.tr("planSchedules", { count: e.schedules.length })}</li>` : ""}
        ${e.orphans.length ? _`<li>${this.tr("planOrphans", { count: e.orphans.length })}</li>` : ""}
        ${e.areas.length ? _`<li>${this.tr("planAreas", { names: e.areas.join(", ") })}</li>` : ""}
      </ul>
      <p>
        <small
          >${e.devices.slice(0, $i).map((e) => e.name).join(", ")}${e.devices.length > $i ? " …" : ""}</small
        >
      </p>
      ${e.in_use.length ? _`<p class="error">${this.tr("inUseWarning")}</p>
              <ul>
                ${e.in_use.map((e) => _`<li>
                      ${e.device}:
                      ${mi(e.usage).map((e) => `${this.tr(`use_${e.kind}`)} ${e.name}`).join(", ")}
                    </li>`)}
              </ul>` : ""}
      <div class="row">
        <button
          class="primary"
          ?disabled=${this.busy || e.in_use.length > 0}
          @click=${() => void this.confirm()}
        >
          ${this.tr("confirmRemove")}
        </button>
        <button @click=${() => this.plan = void 0}>${this.tr("keep")}</button>
      </div>`;
	}
	render() {
		return _`
      <div class="fields bottom">
        <label
          >${this.tr("target")}
          <select
            @change=${(e) => {
			this.target = e.target.value, this.plan = void 0;
		}}
          >
            ${k(this.hass?.language, Object.keys(ea), (e) => this.tr(ea[e])).map((e) => _`<option value=${e} ?selected=${this.target === e}>
                  ${this.tr(ea[e])}
                </option>`)}
          </select>
        </label>
        ${this.target === "all" ? "" : _`<tdc-target-select
                .hass=${this.hass}
                kind=${this.target}
                .values=${this.targetId ? [this.targetId] : []}
                @tdc-target-change=${(e) => {
			this.targetId = e.detail[0] ?? "", this.plan = void 0;
		}}
              ></tdc-target-select>`}
        <div class="row wide">
          <button
            ?disabled=${this.target !== "all" && !this.targetId}
            @click=${() => void this.showPlan()}
          >
            ${this.tr("showPlan")}
          </button>
          <button ?disabled=${this.busy} @click=${() => void this.scanTopics()}>
            ${this.tr("scanTopics")}
          </button>
        </div>
      </div>
      ${this.plan ? _`<div class="plan">${this.renderPlan(this.plan)}</div>` : ""}
      ${this.leftover ? _`<div class="plan">${this.renderLeftover(this.leftover)}</div>` : ""}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
A([S()], K.prototype, "target", void 0), A([S()], K.prototype, "targetId", void 0), A([C()], K.prototype, "plan", void 0), A([C()], K.prototype, "busy", void 0), A([C()], K.prototype, "leftover", void 0), A([C()], K.prototype, "message", void 0), A([C()], K.prototype, "error", void 0), K = A([x("tdc-removal-panel")], K);
// src/schedule/helpers.ts
var ta = 60, na = 3, ra = 24, ia = 16;
function aa() {
	return {
		type: T,
		times: "08:00, 18:30",
		weekdays: [],
		everyS: ta,
		start: "00:00",
		end: "24:00",
		at: "",
		count: na,
		perDay: ra
	};
}
function oa(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function sa(e) {
	switch (e.type) {
		case T: return e.weekdays.length ? {
			type: T,
			times: oa(e.times),
			weekdays: [...e.weekdays].sort()
		} : {
			type: T,
			times: oa(e.times)
		};
		case $e: return {
			type: $e,
			every_s: e.everyS,
			start: e.start,
			end: e.end
		};
		case et: return {
			type: et,
			at: e.at
		};
		case tt: return {
			type: tt,
			count: e.count,
			start: e.start,
			end: e.end
		};
		case nt: return {
			type: nt,
			per_day: e.perDay
		};
	}
}
function ca(e, t) {
	switch (e) {
		case "all": return { all: !0 };
		case Qe: return { template: t[0] ?? "" };
		case w: return { device: t.length === 1 ? t[0] : t };
		case "run": return { run: t[0] ?? "" };
	}
}
function q(e) {
	return "template" in e ? {
		kind: Qe,
		ids: [e.template]
	} : "device" in e ? {
		kind: w,
		ids: typeof e.device == "string" ? [e.device] : e.device
	} : "run" in e ? {
		kind: "run",
		ids: [e.run]
	} : {
		kind: "all",
		ids: []
	};
}
function la(e) {
	switch (e.type) {
		case T: return e.times.join(", ");
		case $e: return `${e.every_s} s (${e.start}–${e.end})`;
		case et: return e.at.replace("T", " ");
		case tt: return `${e.count}× ${e.start}–${e.end}`;
		case nt: return `Ø ${e.per_day}/d`;
	}
}
function ua(e) {
	return e.slice(0, ia).replace("T", " ");
}
function da(e) {
	return [...new Set(Object.values(e).flat())];
}
function fa(e) {
	return {
		kind: "all",
		targetIds: [],
		action: da(e)[0] ?? "",
		entity: ""
	};
}
function pa(e, t, n, r) {
	let i = (e) => new Set(e.map((e) => e.platform));
	if (e === "all") return n.length ? n.map((e) => i(e.entities)) : void 0;
	if (t.length === 0) return;
	if (e === "template") {
		let e = r.find((e) => e.id === t[0]);
		return e ? [i(e.entities)] : void 0;
	}
	let a = e === "device" ? n.filter((e) => t.includes(e.id) || t.includes(e.name)) : n.filter((e) => e.run_id === t[0]);
	return a.length ? a.map((e) => i(e.entities)) : void 0;
}
function ma(e, t) {
	let n = da(e);
	if (!t) return [];
	let r = t.map((t) => new Set(Object.entries(e).filter(([e]) => t.has(e)).flatMap(([, e]) => e)));
	return n.filter((e) => r.every((t) => t.has(e)));
}
function ha(e, t, n, r, i, a) {
	let o = t.length === 1 ? e === "template" ? r.find((e) => e.id === t[0])?.entities ?? [] : e === "device" ? n.find((e) => e.id === t[0] || e.name === t[0])?.entities ?? [] : [] : [], s = new Set(Object.entries(i).filter(([, e]) => e.includes(a)).map(([e]) => e));
	return o.filter((e) => s.has(e.platform)).map(({ key: e, name: t }) => ({
		key: e,
		name: t
	}));
}
function ga(e) {
	return {
		target: ca(e.kind, e.targetIds),
		entity: e.entity,
		action: e.action
	};
}
function _a(e) {
	let t = {
		...aa(),
		type: e.type
	};
	switch (e.type) {
		case T: return {
			...t,
			times: e.times.join(", "),
			weekdays: e.weekdays ?? []
		};
		case $e: return {
			...t,
			everyS: e.every_s,
			start: e.start,
			end: e.end
		};
		case et: return {
			...t,
			at: e.at
		};
		case tt: return {
			...t,
			count: e.count,
			start: e.start,
			end: e.end
		};
		case nt: return {
			...t,
			perDay: e.per_day
		};
	}
}
function va(e) {
	let { kind: t, ids: n } = q(e.target);
	return {
		kind: t,
		targetIds: n,
		action: e.action,
		entity: e.entity
	};
}
var ya = "schedules", ba = [
	{
		key: "triggers",
		kind: "multi",
		label: ""
	},
	{
		key: "actions",
		kind: "multi",
		label: ""
	},
	{
		key: "targets",
		kind: "multi",
		label: ""
	},
	{
		key: "enabled",
		kind: "choice",
		label: ""
	}
], xa = "scenario";
function Sa(e) {
	return e.scenario ? xa : e.action;
}
function Ca(e, t) {
	return {
		texts: (n) => [
			n.name,
			e(n),
			t(n),
			la(n.trigger)
		],
		values: (e, t) => {
			switch (t) {
				case "triggers": return [e.trigger.type];
				case "actions": return [Sa(e)];
				case "targets": return [q(e.target).kind];
				default: return [e.enabled ? "on" : "off"];
			}
		}
	};
}
// src/scenario/helpers.ts
function wa(e) {
	return {
		afterS: 0,
		work: fa(e),
		params: ""
	};
}
function Ta(e) {
	if (e.trim() === "") return {};
	try {
		let t = JSON.parse(e);
		return typeof t == "object" && t && !Array.isArray(t) ? t : void 0;
	} catch {
		return;
	}
}
function Ea(e) {
	let t = [];
	for (let n of e) {
		let e = Ta(n.params);
		if (e === void 0) return;
		t.push({
			after_s: Math.max(0, n.afterS || 0),
			...ga(n.work),
			params: e
		});
	}
	return t;
}
function Da(e) {
	return {
		afterS: e.after_s,
		work: va(e),
		params: Object.keys(e.params).length ? JSON.stringify(e.params) : ""
	};
}
var Oa = "scenarios", ka = [{
	key: "devices",
	kind: "multi",
	label: ""
}, {
	key: "templates",
	kind: "multi",
	label: ""
}];
function Aa(e, t, n) {
	let r = e.steps.flatMap((e) => {
		let r = q(e.target);
		return r.kind === t ? r.ids.map(n) : [];
	});
	return [...new Set(r)];
}
function ja(e, t) {
	return Aa(e, w, (e) => Zi(w, e, t));
}
function Ma(e) {
	return Aa(e, Qe, (e) => e);
}
function Na(e, t) {
	return {
		texts: t,
		values: (t, n) => n === "devices" ? ja(t, e) : Ma(t)
	};
}
// src/schedule/work-picker.ts
var Pa = [
	"all",
	Qe,
	w,
	"run"
], J = class extends j {
	constructor(...e) {
		super(...e), this.actions = {}, this.templates = [], this.devices = [], this.loaded = !1, this.error = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.loadDevices();
	}
	async loadDevices() {
		try {
			this.devices = await this.api.deviceNames(), this.loaded = !0, this.error = "";
		} catch (e) {
			this.error = E(e);
		}
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent("tdc-work-change", { detail: {
			...this.work,
			...e
		} }));
	}
	actionChoices() {
		if (!this.loaded) return this.work.action ? [this.work.action] : [];
		let e = this.hass?.language, t = pa(this.work.kind, this.work.targetIds, this.devices, this.templates);
		return k(e, ma(this.actions, t), (t) => Et(e, t));
	}
	entities() {
		let e = ha(this.work.kind, this.work.targetIds, this.devices, this.templates, this.actions, this.work.action);
		return e.length > 1 ? e : [];
	}
	updated(e) {
		if (super.updated(e), !this.loaded) return;
		let t = this.actionChoices();
		t.length && !t.includes(this.work.action) ? this.emit({
			action: t[0],
			entity: ""
		}) : t.length === 0 && this.work.action && this.emit({
			action: "",
			entity: ""
		});
	}
	renderAction(e) {
		let t = this.actionChoices();
		return t.length === 0 ? _`<label
        >${this.tr("schAction")}
        <select disabled>
          <option>${this.tr("pickOne")}</option>
        </select>
      </label>` : this.select(this.tr("schAction"), t, this.work.action, (t) => Et(e, t), (e) => this.emit({
			action: e,
			entity: ""
		}));
	}
	renderEntity(e, t) {
		let n = k(t, e, (e) => Ot(t, e.key, e.name));
		return _`<label
      >${this.tr("schEntity")}
      <select @change=${(e) => this.emit({ entity: e.target.value })}>
        <option value="" ?selected=${!this.work.entity}>${this.tr("schAllFitting")}</option>
        ${n.map((e) => _`<option value=${e.key} ?selected=${e.key === this.work.entity}>
              ${Ot(t, e.key, e.name)}
            </option>`)}
      </select>
    </label>`;
	}
	render() {
		let e = this.hass?.language, t = this.entities();
		return _`
      <div class="fields">
        ${this.select(this.tr("schTarget"), Pa, this.work.kind, (e) => this.tr(`schTarget_${e}`), (e) => this.emit({
			kind: e,
			targetIds: [],
			entity: ""
		}))}
        ${this.work.kind === "all" ? y : _`<tdc-target-select
                .hass=${this.hass}
                kind=${this.work.kind}
                ?multiple=${this.work.kind === w}
                .values=${this.work.targetIds}
                .templates=${this.templates}
                @tdc-target-change=${(e) => this.emit({
			targetIds: e.detail,
			entity: ""
		})}
              ></tdc-target-select>`}
        ${t.length ? this.renderEntity(t, e) : y}
      </div>
      <div class="fields">${this.renderAction(e)}</div>
      ${this.error ? _`<p class="error">${this.error}</p>` : y}
    `;
	}
};
A([S({ attribute: !1 })], J.prototype, "work", void 0), A([S({ attribute: !1 })], J.prototype, "actions", void 0), A([S({ attribute: !1 })], J.prototype, "templates", void 0), A([C()], J.prototype, "devices", void 0), A([C()], J.prototype, "loaded", void 0), A([C()], J.prototype, "error", void 0), J = A([x("tdc-work-picker")], J);
// src/scenario/scenario-form.ts
var Y = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.submitLabel = "", this.busy = !1, this.name = "", this.steps = [], this.error = "";
	}
	willUpdate(e) {
		let t = this.info?.actions;
		this.scenario && t && this.loadedId !== this.scenario.id ? (this.loadedId = this.scenario.id, this.name = this.scenario.name, this.steps = this.scenario.steps.map(Da)) : !this.scenario && t && this.steps.length === 0 && (this.steps = [wa(t)]), super.willUpdate(e);
	}
	reset() {
		this.name = "", this.error = "", this.steps = [wa(this.info?.actions ?? {})];
	}
	setStep(e, t) {
		this.steps = this.steps.map((n, r) => r === e ? {
			...n,
			...t
		} : n);
	}
	complete() {
		return !!this.name.trim() && this.steps.length > 0 && this.steps.every((e) => e.work.action && (e.work.kind === "all" || e.work.targetIds.length > 0));
	}
	submit() {
		let e = Ea(this.steps);
		e ? (this.error = "", this.dispatchEvent(new CustomEvent(ft, {
			detail: {
				name: this.name,
				steps: e
			},
			bubbles: !0,
			composed: !0
		}))) : this.error = this.tr("scnBadParams");
	}
	renderStep(e, t) {
		return _`<fieldset>
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
		return _`
      <div class="fields">
        ${this.textField(this.tr("schName"), this.name, (e) => this.name = e)}
      </div>
      ${this.steps.map((e, t) => this.renderStep(e, t))}
      ${this.submitRow({
			enabled: this.complete(),
			busy: this.busy,
			label: this.submitLabel || this.tr("schSave"),
			editing: !!this.scenario,
			submit: () => this.submit(),
			extra: _`<button
          @click=${() => this.steps = [...this.steps, wa(this.info?.actions ?? {})]}
        >
          ${this.tr("scnAddStep")}
        </button>`
		})}
      <p class="error">${this.error}</p>
    `;
	}
};
A([S({ attribute: !1 })], Y.prototype, "info", void 0), A([S({ attribute: !1 })], Y.prototype, "templates", void 0), A([S({ attribute: !1 })], Y.prototype, "scenario", void 0), A([S()], Y.prototype, "submitLabel", void 0), A([S({ type: Boolean })], Y.prototype, "busy", void 0), A([C()], Y.prototype, "name", void 0), A([C()], Y.prototype, "steps", void 0), A([C()], Y.prototype, "error", void 0), Y = A([x("tdc-scenario-form")], Y);
// src/scenario/scenario-panel.ts
var Fa = 3, Ia = class extends P {
	static {
		this.styles = [
			j.styles,
			Mt,
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
	constructor() {
		super(), this.scenarios = [], this.devices = [], this.restoreFilter(Oa, ka);
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			[this.scenarios, this.devices] = await Promise.all([this.api.scenarios(), this.api.deviceNames()]);
		} catch (e) {
			this.error = E(e);
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
	targetLabel(e, t) {
		return Xi(e, t, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e }));
	}
	filterFields() {
		let e = this.hass?.language;
		return [{
			key: "devices",
			kind: "multi",
			label: this.tr("filterDevices"),
			options: En(this.scenarios, (e) => ja(e, this.devices), (e) => this.targetLabel(w, e), e)
		}, {
			key: "templates",
			kind: "multi",
			label: this.tr("filterTemplates"),
			options: En(this.scenarios, Ma, (e) => this.targetLabel(Qe, e), e)
		}];
	}
	searchTexts(e) {
		return [
			e.name,
			...ja(e, this.devices).map((e) => this.targetLabel(w, e)),
			...Ma(e).map((e) => this.targetLabel(Qe, e))
		];
	}
	renderNew() {
		return this.newPopup(this.tr("scnNew"), _`<tdc-scenario-form
        id="new"
        .hass=${this.hass}
        .info=${this.info}
        .templates=${this.templates}
        submitLabel=${this.tr("scnCreate")}
        ?busy=${this.busy}
        @tdc-submit=${(e) => void this.add(e.detail)}
      ></tdc-scenario-form>`);
	}
	renderRow(e) {
		let t = e.steps[0], { kind: n } = t ? q(t.target) : { kind: "all" }, r = this.hass?.language, i = this.expanded.has(e.id);
		return _`<tr class="scenario card" @click=${() => this.toggle(e.id)}>
        ${this.nameCell(e.id, e.name)}
        <td data-label=${this.tr("scnSteps")}>
          ${this.tr("scnStepCount", { count: e.steps.length })}<br /><small
            >${t ? `${Dt(r, t.entity, t.action)} · ${this.tr(`schTarget_${n}`)}` : ""}</small
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
          ${this.removeButton(() => this.api.removeScenario(e.id).then(() => void 0))}
        </td>
      </tr>
      ${i ? this.editRow(Fa, e.id, _`<tdc-scenario-form
                .scenario=${e}
                .hass=${this.hass}
                ?busy=${this.busy}
                .templates=${this.templates}
                .info=${this.info}
              ></tdc-scenario-form>`, (t) => void this.save(e, t)) : y}`;
	}
	renderTable(e) {
		return _`<table class="cards">
      <tr>
        <th>${this.tr("schName")}</th>
        <th>${this.tr("scnSteps")}</th>
        <th>${this.tr("colActions")}</th>
      </tr>
      ${Yt(e, (e) => e.id, (e) => this.renderRow(e))}
    </table>`;
	}
	render() {
		return _`
      ${this.renderNew()}
      ${this.scenarios.length === 0 ? _`<p>${this.tr("scnNone")}</p>` : this.renderFiltered(this.scenarios, this.filterFields(), Na(this.devices, (e) => this.searchTexts(e)), (e) => this.renderTable(e))}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
A([C()], Ia.prototype, "scenarios", void 0), A([C()], Ia.prototype, "devices", void 0), A([Ze("tdc-scenario-form#new")], Ia.prototype, "newForm", void 0), Ia = A([x("tdc-scenario-panel")], Ia);
// src/schedule/schedule-form.ts
var La = [
	T,
	$e,
	et,
	tt,
	nt
], Ra = [
	"weekdayMon",
	"weekdayTue",
	"weekdayWed",
	"weekdayThu",
	"weekdayFri",
	"weekdaySat",
	"weekdaySun"
], X = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.scenarios = [], this.submitLabel = "", this.busy = !1, this.name = "", this.scenarioId = "", this.work = fa({}), this.seed = "", this.form = aa(), this.started = !1;
	}
	willUpdate(e) {
		let t = this.info?.actions;
		this.schedule && t && this.loadedId !== this.schedule.id ? (this.loadedId = this.schedule.id, this.name = this.schedule.name, this.scenarioId = this.schedule.scenario ?? "", this.work = va(this.schedule), this.form = _a(this.schedule.trigger)) : !this.schedule && t && !this.started && (this.started = !0, this.work = fa(t)), super.willUpdate(e);
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
		let e = this.scenarioId ? { scenario: this.scenarioId } : ga(this.work), t = this.schedule && "action" in e && e.action === this.schedule.action;
		return {
			name: this.name,
			...e,
			trigger: sa(this.form),
			seed: this.seed || void 0,
			...this.schedule ? {
				params: t ? this.schedule.params : {},
				enabled: this.schedule.enabled
			} : {}
		};
	}
	complete() {
		return !!this.work.action && (this.work.kind === "all" || this.work.targetIds.length > 0);
	}
	submit() {
		this.dispatchEvent(new CustomEvent(ft, {
			detail: this.request(),
			bubbles: !0,
			composed: !0
		}));
	}
	field(e, t, n = "text") {
		let r = n === "number";
		return _`<label style="flex: 1 1 140px"
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
		return _`<div class="row wide">
      ${Ra.map((e, t) => _`<label style="flex-direction: row; align-items: center">
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
			case T: return _`${this.field(this.tr("schTimes"), T)} ${this.renderWeekdays()}`;
			case $e: return _`${this.field(this.tr("schEveryS"), "everyS", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case et: return this.field(this.tr("schAt"), "at", "datetime-local");
			case tt: return _`${this.field(this.tr("schCount"), "count", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case nt: return this.field(this.tr("schPerDay"), "perDay", "number");
		}
	}
	render() {
		return _`
      <div class="fields">
        ${this.textField(this.tr("schName"), this.name, (e) => this.name = e)}
      </div>
      <div class="fields">
        ${this.select(this.tr("schTrigger"), La, this.form.type, (e) => this.tr(`schTrigger_${e}`), (e) => this.setForm({ type: e }))}
        ${this.select(this.tr("schRuns"), ["", ...this.scenarios.map((e) => e.id)], this.scenarioId, (e) => e ? this.tr("schScenario", { id: this.scenarioName(e) }) : this.tr("schRunsAction"), (e) => this.scenarioId = e)}
      </div>
      ${this.scenarioId ? y : _`<tdc-work-picker
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
      ${this.submitRow({
			enabled: !!this.name.trim() && !!(this.scenarioId || this.complete()),
			busy: this.busy,
			label: this.submitLabel || this.tr("schSave"),
			editing: !!this.schedule,
			submit: () => this.submit()
		})}
    `;
	}
};
A([S({ attribute: !1 })], X.prototype, "info", void 0), A([S({ attribute: !1 })], X.prototype, "templates", void 0), A([S({ attribute: !1 })], X.prototype, "scenarios", void 0), A([S({ attribute: !1 })], X.prototype, "schedule", void 0), A([S()], X.prototype, "submitLabel", void 0), A([S({ type: Boolean })], X.prototype, "busy", void 0), A([C()], X.prototype, "name", void 0), A([C()], X.prototype, "scenarioId", void 0), A([C()], X.prototype, "work", void 0), A([C()], X.prototype, "seed", void 0), A([C()], X.prototype, "form", void 0), X = A([x("tdc-schedule-form")], X);
// src/schedule/schedule-panel.ts
var za = 6, Ba = 24, Va = 50, Z = class extends P {
	static {
		this.styles = [
			j.styles,
			Mt,
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
	constructor() {
		super(), this.schedules = [], this.runs = [], this.scenarios = [], this.devices = [], this.previewOpen = !1, this.restoreFilter(ya, ba);
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			[this.schedules, this.runs, this.scenarios, this.devices] = await Promise.all([
				this.api.schedules(),
				this.api.schedulePreview(Ba),
				this.api.scenarios(),
				this.api.deviceNames()
			]), this.error = "";
		} catch (e) {
			this.error = E(e);
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
	scenarioName(e) {
		return this.scenarios.find((t) => t.id === e)?.name ?? e;
	}
	targetText(e, t) {
		let n = this.tr(`schTarget_${e}`);
		return e === "all" ? n : `${n}: ${t.map((t) => Xi(e, t, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e }))).join(", ")}`;
	}
	actionText(e) {
		return e.scenario ? this.tr("schScenario", { id: this.scenarioName(e.scenario) }) : Dt(this.hass?.language, e.entity, e.action);
	}
	targetOf(e) {
		let { kind: t, ids: n } = q(e.target);
		return e.scenario ? "" : this.targetText(t, n);
	}
	filterFields() {
		let e = this.hass?.language;
		return [
			{
				key: "triggers",
				kind: "multi",
				label: this.tr("schTrigger"),
				options: En(this.schedules, (e) => [e.trigger.type], (e) => this.tr(`schTrigger_${e}`), e)
			},
			{
				key: "actions",
				kind: "multi",
				label: this.tr("schAction"),
				options: En(this.schedules, (e) => [Sa(e)], (t) => t === "scenario" ? this.tr("filterScenario") : Dt(e, "", t), e)
			},
			{
				key: "targets",
				kind: "multi",
				label: this.tr("schTarget"),
				options: En(this.schedules, (e) => [q(e.target).kind], (e) => this.tr(`schTarget_${e}`), e)
			},
			{
				key: "enabled",
				kind: "choice",
				label: this.tr("schEnabled"),
				options: [{
					value: "on",
					label: this.tr("filterOn")
				}, {
					value: "off",
					label: this.tr("filterOff")
				}]
			}
		];
	}
	renderNew() {
		return this.newPopup(this.tr("schNew"), _`<tdc-schedule-form
        id="new"
        .hass=${this.hass}
        .info=${this.info}
        .templates=${this.templates}
        .scenarios=${this.scenarios}
        submitLabel=${this.tr("schAdd")}
        ?busy=${this.busy}
        @tdc-submit=${(e) => void this.add(e.detail)}
      ></tdc-schedule-form>`);
	}
	renderRow(e) {
		let { kind: t, ids: n } = q(e.target), r = this.expanded.has(e.id);
		return _`<tr class="schedule card" @click=${() => this.toggle(e.id)}>
        ${this.nameCell(e.id, e.name)}
        <td data-label=${this.tr("schTarget")}>
          ${e.scenario ? "–" : this.targetText(t, n)}
        </td>
        <td data-label=${this.tr("schAction")}>${this.actionText(e)}</td>
        <td data-label=${this.tr("schTrigger")}>
          ${this.tr(`schTrigger_${e.trigger.type}`)}<br /><small
            >${la(e.trigger)}</small
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
          ${this.removeButton(() => this.api.removeSchedule(e.id))}
        </td>
      </tr>
      ${r ? this.editRow(za, e.id, _`<tdc-schedule-form
                .hass=${this.hass}
                .info=${this.info}
                .templates=${this.templates}
                .scenarios=${this.scenarios}
                .schedule=${e}
                ?busy=${this.busy}
              ></tdc-schedule-form>`, (t) => void this.save(e, t)) : y}`;
	}
	renderTable(e) {
		return _`<table class="cards">
      <tr>
        <th>${this.tr("schName")}</th>
        <th>${this.tr("schTarget")}</th>
        <th>${this.tr("schAction")}</th>
        <th>${this.tr("schTrigger")}</th>
        <th>${this.tr("schEnabled")}</th>
        <th>${this.tr("colActions")}</th>
      </tr>
      ${Yt(e, (e) => e.id, (e) => this.renderRow(e))}
    </table>`;
	}
	renderList() {
		return this.schedules.length === 0 ? _`<p>${this.tr("schNone")}</p>` : this.renderFiltered(this.schedules, this.filterFields(), Ca((e) => this.targetOf(e), (e) => this.actionText(e)), (e) => this.renderTable(e));
	}
	actionCount() {
		let e = this.runs.length;
		return this.tr(e === 1 ? "schActionOne" : "schActions", { count: e });
	}
	renderPreview() {
		return this.runs.length === 0 ? _`<p><small>${this.tr("schNoRuns")}</small></p>` : _`<table>
        <tr>
          <th>${this.tr("schWhen")}</th>
          <th>${this.tr("schName")}</th>
        </tr>
        ${this.runs.slice(0, Va).map((e) => _`<tr>
              <td>${ua(e.when)}</td>
              <td>${e.name}</td>
            </tr>`)}
      </table>
      ${this.runs.length > Va ? _`<p>
              <small>${this.tr("schMoreRuns", { count: this.runs.length - Va })}</small>
            </p>` : y}`;
	}
	render() {
		return _`
      ${this.renderNew()}
      <details
        class="section"
        ?open=${this.previewOpen}
        @toggle=${(e) => this.previewOpen = e.target.open}
      >
        <summary>
          ${this.tr("schPreview", { hours: Ba })} · ${this.actionCount()}
        </summary>
        ${this.renderPreview()}
      </details>
      <h3 class="list-title">${this.tr("schList")}</h3>
      ${this.renderList()}
      <p class="error">${this.error}</p>
    `;
	}
};
A([C()], Z.prototype, "schedules", void 0), A([C()], Z.prototype, "runs", void 0), A([C()], Z.prototype, "scenarios", void 0), A([C()], Z.prototype, "devices", void 0), A([C()], Z.prototype, "previewOpen", void 0), A([Ze("tdc-schedule-form#new")], Z.prototype, "newForm", void 0), Z = A([x("tdc-schedule-panel")], Z);
// src/transfer/helpers.ts
var Ha = [
	"devices",
	"templates",
	"schedules",
	"scenarios",
	"groups"
], Ua = {
	devices: "trfDevices",
	templates: "trfTemplates",
	schedules: "trfSchedules",
	scenarios: "trfScenarios",
	groups: "trfGroups"
};
function Wa(e) {
	return Ha.filter((t) => t !== "groups" || e);
}
function Ga(e) {
	let t = (e) => String(e).padStart(2, "0");
	return `tdc-export-${`${e.getFullYear()}${t(e.getMonth() + 1)}${t(e.getDate())}`}-${t(e.getHours())}${t(e.getMinutes())}.json`;
}
function Ka(e, t) {
	let n = {
		format_version: 0,
		integration_version: "",
		exported_at: t
	};
	for (let t of Ha) {
		let r = e[t];
		r && (n.format_version = r[0]?.format_version ?? n.format_version, n.integration_version = r[0]?.integration_version ?? n.integration_version, n[t] = r.flatMap((e) => e.items));
	}
	return n;
}
var qa = [
	"templates",
	"devices",
	"scenarios",
	"schedules",
	"groups"
], Ja = [...qa].reverse(), Ya = 1048576;
function Xa(e) {
	return e === "templates" ? "id" : "name";
}
function Za(e, t) {
	return e[t] ?? [];
}
function Qa(e) {
	return qa.filter((t) => Array.isArray(e[t]));
}
function $a(e) {
	for (let t of Qa(e)) {
		let n = /* @__PURE__ */ new Set();
		for (let r of Za(e, t)) {
			let e = String(r[Xa(t)] ?? "");
			if (n.has(e)) return {
				category: t,
				name: e
			};
			n.add(e);
		}
	}
}
function eo(e, t) {
	if (e.length > t) return {
		error: "trfTooBig",
		values: { max: t }
	};
	let n;
	try {
		n = JSON.parse(e);
	} catch {
		return { error: "trfBadFile" };
	}
	if (typeof n != "object" || !n) return { error: "trfBadFile" };
	let r = n;
	if (typeof r.format_version != "number") return { error: "trfBadFile" };
	if (r.format_version > 1) return { error: "trfNewer" };
	if (Qa(r).length === 0) return { error: "trfBadFile" };
	let i = $a(r);
	return i ? {
		error: "trfDuplicate",
		values: { ...i }
	} : { file: r };
}
function to(e, t) {
	let n = (n) => t.includes(n) ? Za(e, n).map((e) => String(e[Xa(n)])) : [];
	return {
		devices: n("devices"),
		templates: n("templates"),
		scenarios: n("scenarios")
	};
}
function no(e, t, n) {
	let r = [], i = [], a = 0;
	for (let o of e) {
		let e = JSON.stringify(o).length;
		i.length > 0 && (i.length >= t || a + e > n) && (r.push(i), i = [], a = 0), i.push(o), a += e;
	}
	return i.length > 0 && r.push(i), r;
}
function ro(e) {
	let t = {
		...e[0],
		create: 0,
		update: 0,
		skip: 0,
		conflict: 0,
		delete: 0,
		problems: []
	};
	for (let n of e) t.create += n.create, t.update += n.update, t.skip += n.skip, t.conflict += n.conflict, t.delete += n.delete, t.problems.push(...n.problems);
	return t;
}
function io(e) {
	return e.some((e) => e.update > 0 || e.delete > 0);
}
// src/transfer/transfer-panel.ts
var ao = [
	"add",
	"sync",
	"replace"
], oo = {
	add: "trfModeAdd",
	sync: "trfModeSync",
	replace: "trfModeReplace"
}, so = 20, co = 33554432, Q = class extends j {
	constructor(...e) {
		super(...e), this.mqtt = !1, this.counts = {}, this.chosen = /* @__PURE__ */ new Set(), this.busy = !1, this.message = "", this.error = "", this.fileName = "", this.take = /* @__PURE__ */ new Set(), this.modes = {};
	}
	static {
		this.styles = [j.styles, o`
      .choice {
        flex-direction: row;
        align-items: center;
        gap: 8px;
        color: var(--primary-text-color);
      }
      .choice input {
        width: auto;
        min-height: 0;
      }
      section {
        margin-bottom: 24px;
      }
    `];
	}
	connectedCallback() {
		super.connectedCallback(), this.loadCounts();
	}
	async loadCounts() {
		try {
			let e = await Promise.all(Wa(!0).map(async (e) => [e, (await this.api.transferExport(e, 0, 0)).total]));
			this.counts = Object.fromEntries(e);
		} catch (e) {
			this.error = E(e);
		}
	}
	download(e, t) {
		let n = URL.createObjectURL(new Blob([t], { type: "application/json" })), r = document.createElement("a");
		r.href = n, r.download = e, r.click(), URL.revokeObjectURL(n);
	}
	async exportChosen() {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let e = {}, t = 0;
			for (let n of Wa(this.mqtt)) this.chosen.has(n) && (e[n] = await this.api.transferExportAll(n), t += e[n].reduce((e, t) => e + t.items.length, 0));
			let n = /* @__PURE__ */ new Date(), r = Ga(n);
			this.download(r, JSON.stringify(Ka(e, n.toISOString()), null, 2)), this.message = this.tr("trfExported", {
				name: r,
				count: t
			});
		} catch (e) {
			this.error = E(e);
		}
		this.busy = !1;
	}
	importing() {
		let e = Wa(this.mqtt);
		return qa.filter((t) => this.take.has(t) && e.includes(t) && this.file && Qa(this.file).includes(t));
	}
	batch(e, t, n) {
		let r = this.importing();
		return {
			category: e,
			mode: this.modes[e] ?? "add",
			items: t,
			known: to(this.file, r),
			replacing: r.filter((e) => this.modes[e] === "replace"),
			first: n,
			file_name: this.fileName
		};
	}
	async chooseFile(e) {
		let t = e.target.files?.[0];
		if (this.plans = void 0, this.message = "", this.error = "", !t) return;
		let n = await this.api.info().catch(() => void 0), r = eo(await t.text(), n?.limits.max_transfer_bytes ?? co);
		"error" in r ? (this.file = void 0, this.error = this.tr(r.error, r.values)) : (this.file = r.file, this.fileName = t.name, this.take = new Set(Qa(r.file)), this.modes = {});
	}
	async showPlan() {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let e = [];
			for (let t of this.importing()) {
				let n = no(Za(this.file, t), 500, Ya), r = [];
				for (let [e, i] of (n.length ? n : [[]]).entries()) r.push(await this.api.transferPlan(this.batch(t, i, e === 0)));
				e.push(ro(r));
			}
			this.plans = e;
		} catch (e) {
			this.plans = void 0, this.error = E(e);
		}
		this.busy = !1;
	}
	async runImport() {
		this.busy = !0, this.error = "";
		try {
			let e = this.importing(), t = [];
			for (let n of Ja.filter((t) => e.includes(t))) this.modes[n] === "replace" && t.push(await this.api.transferRun({
				...this.batch(n, [], !0),
				phase: "purge"
			}));
			for (let n of e) {
				let e = no(Za(this.file, n), 500, Ya);
				for (let [r, i] of e.entries()) t.push(await this.api.transferRun(this.batch(n, i, r === 0)));
			}
			let n = ro(t.length ? t : [this.emptyPlan()]);
			this.message = this.tr("trfDone", {
				created: n.create,
				updated: n.update,
				deleted: n.delete,
				problems: n.problems.length
			}), this.plans = void 0, await this.loadCounts();
		} catch (e) {
			this.error = E(e);
		}
		this.busy = !1;
	}
	emptyPlan() {
		return {
			category: "devices",
			mode: "add",
			create: 0,
			update: 0,
			skip: 0,
			conflict: 0,
			delete: 0,
			problems: []
		};
	}
	renderFileCategory(e) {
		return _`<tr>
      <td>
        <label class="choice">
          <input
            type="checkbox"
            .checked=${this.take.has(e)}
            @change=${() => {
			this.take = Nt(this.take, e), this.plans = void 0;
		}}
          />
          ${this.tr(Ua[e])}
          (${Za(this.file, e).length})
        </label>
      </td>
      <td>
        <select
          ?disabled=${!this.take.has(e)}
          @change=${(t) => {
			this.modes = {
				...this.modes,
				[e]: t.target.value
			}, this.plans = void 0;
		}}
        >
          ${ao.map((t) => _`<option value=${t} ?selected=${(this.modes[e] ?? "add") === t}>
                ${this.tr(oo[t])}
              </option>`)}
        </select>
      </td>
    </tr>`;
	}
	renderPlan(e) {
		let t = e.flatMap((e) => e.problems);
		return _`<h3>${this.tr("trfPlanTitle")}</h3>
      <table>
        <tr>
          <th>${this.tr("trfColCategory")}</th>
          <th>${this.tr("trfColCreate")}</th>
          <th>${this.tr("trfColUpdate")}</th>
          <th>${this.tr("trfColSkip")}</th>
          <th>${this.tr("trfColConflict")}</th>
          <th>${this.tr("trfColDelete")}</th>
        </tr>
        ${e.map((e) => _`<tr>
              <td>${this.tr(Ua[e.category])}</td>
              <td>${e.create}</td>
              <td>${e.update}</td>
              <td>${e.skip}</td>
              <td>${e.conflict}</td>
              <td>${e.delete}</td>
            </tr>`)}
      </table>
      ${t.length ? _`<h3>${this.tr("trfProblems")}</h3>
              <ul>
                ${t.slice(0, so).map((e) => _`<li>${e.name} · ${e.code} · ${e.reason}</li>`)}
              </ul>
              ${t.length > so ? _`<small
                      >${this.tr("trfProblemMore", { count: t.length - so })}</small
                    >` : ""}` : ""}
      <p>
        <button class="primary" ?disabled=${this.busy} @click=${() => void this.runImport()}>
          ${io(e) ? this.tr("trfRunConfirm", {
			updates: e.reduce((e, t) => e + t.update, 0),
			deletes: e.reduce((e, t) => e + t.delete, 0)
		}) : this.tr("trfRun")}
        </button>
      </p>`;
	}
	renderImport() {
		return _`<section>
      <h3>${this.tr("trfImportTitle")}</h3>
      <p>${this.tr("trfImportIntro")}</p>
      <p>
        <input
          type="file"
          accept="application/json,.json"
          @change=${(e) => void this.chooseFile(e)}
        />
      </p>
      ${this.file ? _`<p><small>${this.tr("trfFileLoaded", { name: this.fileName })}</small></p>
              <table>
                ${Qa(this.file).filter((e) => Wa(this.mqtt).includes(e)).map((e) => this.renderFileCategory(e))}
              </table>
              <p>
                <button
                  ?disabled=${this.busy || this.importing().length === 0}
                  @click=${() => void this.showPlan()}
                >
                  ${this.tr("trfCheck")}
                </button>
              </p>` : ""}
      ${this.plans ? this.renderPlan(this.plans) : ""}
    </section>`;
	}
	renderChoice(e) {
		let t = this.counts[e] ?? 0;
		return _`<label class="choice">
      <input
        type="checkbox"
        .checked=${this.chosen.has(e)}
        ?disabled=${t === 0}
        @change=${() => this.chosen = Nt(this.chosen, e)}
      />
      ${this.tr(Ua[e])} (${t})
    </label>`;
	}
	render() {
		let e = Wa(this.mqtt).filter((e) => this.chosen.has(e) && (this.counts[e] ?? 0) > 0);
		return _`
      <p>${this.tr("trfIntro")}</p>
      <section>
        <h3>${this.tr("trfExportTitle")}</h3>
        <fieldset>
          ${Wa(this.mqtt).map((e) => this.renderChoice(e))}
        </fieldset>
        <p class="row">
          <button
            class="primary"
            ?disabled=${this.busy || e.length === 0}
            @click=${() => void this.exportChosen()}
          >
            ${this.tr("trfExport")}
          </button>
          ${e.length === 0 ? _`<small>${this.tr("trfNothing")}</small>` : ""}
        </p>
      </section>
      ${this.renderImport()}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
A([S({ type: Boolean })], Q.prototype, "mqtt", void 0), A([C()], Q.prototype, "counts", void 0), A([C()], Q.prototype, "chosen", void 0), A([C()], Q.prototype, "busy", void 0), A([C()], Q.prototype, "message", void 0), A([C()], Q.prototype, "error", void 0), A([C()], Q.prototype, "file", void 0), A([C()], Q.prototype, "fileName", void 0), A([C()], Q.prototype, "take", void 0), A([C()], Q.prototype, "modes", void 0), A([C()], Q.prototype, "plans", void 0), Q = A([x("tdc-transfer-panel")], Q);
// src/panel.ts
var $ = class extends j {
	constructor(...e) {
		super(...e), this.narrow = !1, this.tab = ut, this.removeTarget = "all", this.removeId = "", this.lapse = 1, this.mqtt = !1;
	}
	static {
		this.styles = [j.styles, o`
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
	connectedCallback() {
		super.connectedCallback(), this.loadInfo();
	}
	async loadInfo() {
		try {
			let e = await this.api.info();
			this.lapse = e.time_lapse, this.mqtt = e.mqtt;
		} catch {
			this.lapse = 1;
		}
		!this.mqtt && this.tab === "groups" && (this.tab = ut);
	}
	startRemoval(e) {
		this.removeTarget = e.detail.target, this.removeId = e.detail.id, this.tab = "remove";
	}
	renderTab(e, t) {
		return _`<button
      class=${this.tab === e ? "active" : ""}
      @click=${() => {
			this.tab = e, this.loadInfo();
		}}
    >
      ${t}
    </button>`;
	}
	render() {
		return _`
      <header>
        <h2>${this.tr("title")}</h2>
        <span class="badge">${this.tr("badge")}</span>
        ${this.lapse > 1 ? _`<span class="badge">${this.tr("badgeLapse", { factor: this.lapse })}</span>` : ""}
      </header>
      <nav>
        ${this.renderTab(ut, this.tr("tabDevices"))}
        ${this.renderTab("schedules", this.tr("tabSchedules"))}
        ${this.renderTab("scenarios", this.tr("tabScenarios"))}
        ${this.mqtt ? this.renderTab(dt, this.tr("tabGroups")) : ""}
        ${this.renderTab("history", this.tr("tabHistory"))}
        ${this.renderTab("remove", this.tr("tabRemove"))}
        ${this.renderTab("transfer", this.tr("tabTransfer"))}
      </nav>
      ${this.tab === "devices" ? _`<tdc-device-list
              .hass=${this.hass}
              @tdc-remove=${this.startRemoval}
            ></tdc-device-list>` : ""}
      ${this.tab === "schedules" ? _`<tdc-schedule-panel .hass=${this.hass}></tdc-schedule-panel>` : ""}
      ${this.tab === "scenarios" ? _`<tdc-scenario-panel .hass=${this.hass}></tdc-scenario-panel>` : ""}
      ${this.tab === "groups" ? _`<tdc-group-panel .hass=${this.hass}></tdc-group-panel>` : ""}
      ${this.tab === "history" ? _`<tdc-history-panel .hass=${this.hass}></tdc-history-panel>` : ""}
      ${this.tab === "remove" ? _`<tdc-removal-panel
              .hass=${this.hass}
              .target=${this.removeTarget}
              .targetId=${this.removeId}
            ></tdc-removal-panel>` : ""}
      ${this.tab === "transfer" ? _`<tdc-transfer-panel .hass=${this.hass} .mqtt=${this.mqtt}></tdc-transfer-panel>` : ""}
    `;
	}
};
A([S({ type: Boolean })], $.prototype, "narrow", void 0), A([C()], $.prototype, "tab", void 0), A([C()], $.prototype, "removeTarget", void 0), A([C()], $.prototype, "removeId", void 0), A([C()], $.prototype, "lapse", void 0), A([C()], $.prototype, "mqtt", void 0), $ = A([x("hass-test-data-creator-panel")], $);
export { $ as TdcPanel };
