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
})(e) : e, { is: l, defineProperty: ee, getOwnPropertyDescriptor: u, getOwnPropertyNames: d, getOwnPropertySymbols: f, getPrototypeOf: p } = Object, te = globalThis, ne = te.trustedTypes, re = ne ? ne.emptyScript : "", ie = te.reactiveElementPolyfillSupport, ae = (e, t) => e, oe = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? re : null;
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
}, se = (e, t) => !l(e, t), ce = {
	attribute: !0,
	type: String,
	converter: oe,
	reflect: !1,
	useDefault: !1,
	hasChanged: se
};
Symbol.metadata ??= Symbol("metadata"), te.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var le = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = ce) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && ee(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = u(this.prototype, e) ?? {
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
		return this.elementProperties.get(e) ?? ce;
	}
	static _$Ei() {
		if (this.hasOwnProperty(ae("elementProperties"))) return;
		let e = p(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(ae("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ae("properties"))) {
			let e = this.properties, t = [...d(e), ...f(e)];
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
			let i = (n.converter?.toAttribute === void 0 ? oe : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? oe : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? se)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
le.elementStyles = [], le.shadowRootOptions = { mode: "open" }, le[ae("elementProperties")] = /* @__PURE__ */ new Map(), le[ae("finalized")] = /* @__PURE__ */ new Map(), ie?.({ ReactiveElement: le }), (te.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var ue = globalThis, de = (e) => e, fe = ue.trustedTypes, pe = fe ? fe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, me = "$lit$", m = `lit$${Math.random().toFixed(9).slice(2)}$`, he = "?" + m, ge = `<${he}>`, h = document, _e = () => h.createComment(""), ve = (e) => e === null || typeof e != "object" && typeof e != "function", ye = Array.isArray, be = (e) => ye(e) || typeof e?.[Symbol.iterator] == "function", xe = "[ 	\n\f\r]", Se = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ce = /-->/g, we = />/g, Te = RegExp(`>|${xe}(?:([^\\s"'>=/]+)(${xe}*=${xe}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Ee = /'/g, De = /"/g, Oe = /^(?:script|style|textarea|title)$/i, ke = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), g = ke(1), Ae = ke(2), _ = Symbol.for("lit-noChange"), v = Symbol.for("lit-nothing"), je = /* @__PURE__ */ new WeakMap(), y = h.createTreeWalker(h, 129);
function Me(e, t) {
	if (!ye(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return pe === void 0 ? t : pe.createHTML(t);
}
var Ne = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Se;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, ee = 0;
		for (; ee < n.length && (o.lastIndex = ee, c = o.exec(n), c !== null);) ee = o.lastIndex, o === Se ? c[1] === "!--" ? o = Ce : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = Te) : (Oe.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = Te) : o = we : o === Te ? c[0] === ">" ? (o = i ?? Se, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? Te : c[3] === "\"" ? De : Ee) : o === De || o === Ee ? o = Te : o === Ce || o === we ? o = Se : (o = Te, i = void 0);
		let u = o === Te && e[t + 1].startsWith("/>") ? " " : "";
		a += o === Se ? n + ge : l >= 0 ? (r.push(s), n.slice(0, l) + me + n.slice(l) + m + u) : n + m + (l === -2 ? t : u);
	}
	return [Me(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Pe = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, ee] = Ne(t, n);
		if (this.el = e.createElement(l, r), y.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = y.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(me)) {
					let t = ee[o++], n = i.getAttribute(e).split(m), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Re : r[1] === "?" ? ze : r[1] === "@" ? Be : Le
					}), i.removeAttribute(e);
				} else e.startsWith(m) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (Oe.test(i.tagName)) {
					let e = i.textContent.split(m), t = e.length - 1;
					if (t > 0) {
						i.textContent = fe ? fe.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], _e()), y.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], _e());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === he) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(m, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += m.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = h.createElement("template");
		return n.innerHTML = e, n;
	}
};
function b(e, t, n = e, r) {
	if (t === _) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = ve(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = b(e, i._$AS(e, t.values), i, r)), t;
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? h).importNode(t, !0);
		y.currentNode = r;
		let i = y.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Ie(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Ve(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = y.nextNode(), a++);
		}
		return y.currentNode = h, r;
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
		this.type = 2, this._$AH = v, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = b(this, e, t), ve(e) ? e === v || e == null || e === "" ? (this._$AH !== v && this._$AR(), this._$AH = v) : e !== this._$AH && e !== _ && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? be(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== v && ve(this._$AH) ? this._$AA.nextSibling.data = e : this.T(h.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Pe.createElement(Me(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Fe(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = je.get(e.strings);
		return t === void 0 && je.set(e.strings, t = new Pe(e)), t;
	}
	k(t) {
		ye(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(_e()), this.O(_e()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = de(e).nextSibling;
			de(e).remove(), e = t;
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
		this.type = 1, this._$AH = v, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = v;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = b(this, e, t, 0), a = !ve(e) || e !== this._$AH && e !== _, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = b(this, r[n + o], t, o), s === _ && (s = this._$AH[o]), a ||= !ve(s) || s !== this._$AH[o], s === v ? e = v : e !== v && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === v ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Re = class extends Le {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === v ? void 0 : e;
	}
}, ze = class extends Le {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== v);
	}
}, Be = class extends Le {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = b(this, e, t, 0) ?? v) === _) return;
		let n = this._$AH, r = e === v && n !== v || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== v && (n === v || r);
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
		b(this, e);
	}
}, He = {
	M: me,
	P: m,
	A: he,
	C: 1,
	L: Ne,
	R: Fe,
	D: be,
	V: b,
	I: Ie,
	H: Le,
	N: ze,
	U: Be,
	B: Re,
	F: Ve
}, Ue = ue.litHtmlPolyfillSupport;
Ue?.(Pe, Ie), (ue.litHtmlVersions ??= []).push("3.3.3");
var We = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Ie(t.insertBefore(_e(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ge = globalThis, Ke = class extends le {
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
		return _;
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
	converter: oe,
	reflect: !1,
	hasChanged: se
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
var Qe = "device", $e = "template", w = "times", et = "interval", tt = "once", nt = "random_window", rt = "poisson", it = "enum", at = "state_machine", ot = "noise", st = "phase", ct = "interval_s", lt = "shape", ut = "sensor", dt = "devices", ft = "groups", pt = "tdc-submit", mt = "hass_test_data_creator", ht = 3e4, gt = 3e5, _t = /* @__PURE__ */ new Map();
function vt(e, t, n) {
	let r = _t.get(e);
	if (r && Date.now() - r.at < t) return r.value;
	let i = n();
	return _t.set(e, {
		at: Date.now(),
		value: i
	}), i.catch(() => _t.delete(e)), i;
}
var yt = class {
	constructor(e) {
		this.hass = e;
	}
	info() {
		return vt("info", ht, () => this.call("info"));
	}
	templates() {
		return vt("templates", gt, () => this.call("templates/list"));
	}
	async saveTemplate(e, t, n) {
		let r = await this.call("templates/save", {
			template_id: e,
			name: t,
			entities: n
		});
		return _t.delete("templates"), r;
	}
	async deleteTemplate(e) {
		await this.call("templates/delete", { template_id: e }), _t.delete("templates");
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
			type: `${mt}/${e}`,
			...n
		});
	}
};
function T(e) {
	if (typeof e == "object" && e && "message" in e) {
		let { code: t, message: n } = e;
		return t ? `${t}: ${n}` : n;
	}
	return String(e);
}
// src/common/i18n.ts
var bt = {
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
		trfNothing: "Choose at least one category that has entries."
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
		trfNothing: "Wähle mindestens eine Kategorie, die Einträge hat."
	}
};
function xt(e) {
	return e?.toLowerCase().startsWith("de") ? "de" : "en";
}
function St(e, t, n = {}) {
	return bt[e][t].replace(/\{(\w+)\}/g, (e, t) => t in n ? String(n[t]) : e);
}
// src/common/labels.ts
var Ct = {
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
}, wt = {
	en: Ct,
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
}, Tt = {
	native: "outputNative",
	mqtt: "outputMqtt",
	z2m: "outputZ2m"
}, Et = "fault_";
function E(e, t, n) {
	return wt[xt(e)][t][n] ?? n;
}
function D(e, t) {
	return t.startsWith(Et) ? `${xt(e) === "de" ? "Störung" : "Fault"}: ${E(e, "fault", t.slice(6))}` : E(e, "action", t);
}
function Dt(e, t, n) {
	return `${t ? `${E(e, "entity", t)}: ` : ""}${D(e, n)}`;
}
function O(e, t, n) {
	return wt[xt(e)].template[t] ?? n;
}
function Ot(e, t, n) {
	let r = Ct.entity[t];
	return r !== void 0 && r === n ? E(e, "entity", t) : n;
}
function kt(e, t) {
	return t === null ? "–" : E(e, "state", t);
}
var At = /* @__PURE__ */ new Map();
function jt(e) {
	let t = xt(e), n = At.get(t);
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
			api: new yt(this.hass)
		}), this.client.api;
	}
	textField(e, t, n, r = {}) {
		return g`<label style="flex: ${r.flex ?? "1 1 200px"}"
      >${e}
      <input
        .value=${t}
        placeholder=${r.placeholder ?? ""}
        @input=${(e) => n(e.target.value)}
      />
    </label>`;
	}
	select(e, t, n, r, i) {
		return g`<label style="flex: 1 1 180px"
      >${e}
      <select
        ?disabled=${t.length === 1}
        @change=${(e) => i(e.target.value)}
      >
        ${k(this.hass?.language, t, r).map((e) => g`<option value=${e} ?selected=${e === n || t.length === 1}>
              ${r(e)}
            </option>`)}
      </select>
    </label>`;
	}
	detailRow(e, t) {
		return g`<tr>
      <td colspan=${e}>${t}</td>
    </tr>`;
	}
	submitRow(e) {
		return g`<p class="row">
      ${e.extra ?? v}
      <button
        class="primary"
        ?disabled=${!e.enabled || e.busy}
        @click=${e.submit}
      >
        ${e.label}
      </button>
      ${e.editing ? g`<button
              ?disabled=${e.busy}
              @click=${() => this.dispatchEvent(new CustomEvent("tdc-cancel", {
			bubbles: !0,
			composed: !0
		}))}
            >
              ${this.tr("detCancel")}
            </button>` : v}
    </p>`;
	}
	tr(e, t) {
		return St(xt(this.hass?.language), e, t);
	}
};
A([S({ attribute: !1 })], j.prototype, "hass", void 0);
// node_modules/lit-html/directive.js
var M = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, Ft = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), It = class {
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
}, { I: Lt } = He, Rt = (e) => e, zt = (e) => e.strings === void 0, Bt = () => document.createComment(""), Vt = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new Lt(r.insertBefore(Bt(), i), r.insertBefore(Bt(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = Rt(e).nextSibling;
				Rt(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, N = (e, t, n = e) => (e._$AI(t, n), e), Ht = {}, Ut = (e, t = Ht) => e._$AH = t, Wt = (e) => e._$AH, Gt = (e) => {
	e._$AR(), e._$AA.remove();
}, Kt = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, qt = Ft(class extends It {
	constructor(e) {
		if (super(e), e.type !== M.CHILD) throw Error("repeat() can only be used in text expressions");
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
		let i = Wt(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, ee, u = 0, d = i.length - 1, f = 0, p = a.length - 1;
		for (; u <= d && f <= p;) if (i[u] === null) u++;
		else if (i[d] === null) d--;
		else if (s[u] === o[f]) c[f] = N(i[u], a[f]), u++, f++;
		else if (s[d] === o[p]) c[p] = N(i[d], a[p]), d--, p--;
		else if (s[u] === o[p]) c[p] = N(i[u], a[p]), Vt(e, c[p + 1], i[u]), u++, p--;
		else if (s[d] === o[f]) c[f] = N(i[d], a[f]), Vt(e, i[u], i[d]), d--, f++;
		else if (l === void 0 && (l = Kt(o, f, p), ee = Kt(s, u, d)), l.has(s[u])) {
			if (l.has(s[d])) {
				let t = ee.get(o[f]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = Vt(e, i[u]);
					N(t, a[f]), c[f] = t;
				} else c[f] = N(n, a[f]), Vt(e, i[u], n), i[t] = null;
				f++;
			} else Gt(i[d]), d--;
		} else Gt(i[u]), u++;
		for (; f <= p;) {
			let t = Vt(e, c[p + 1]);
			N(t, a[f]), c[f++] = t;
		}
		for (; u <= d;) {
			let e = i[u++];
			e !== null && Gt(e);
		}
		return this.ut = o, Ut(e, c), _;
	}
}), Jt = class extends j {
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
		return g`<dialog @close=${() => this.close()}>
      <div class="head">
        <h3>${this.heading}</h3>
        <button aria-label=${this.tr("detCancel")} @click=${() => this.close()}>✕</button>
      </div>
      <slot></slot>
    </dialog>`;
	}
};
A([S({ type: Boolean })], Jt.prototype, "open", void 0), A([S()], Jt.prototype, "heading", void 0), A([Ze("dialog")], Jt.prototype, "dialog", void 0), Jt = A([x("tdc-dialog")], Jt);
// src/common/polling.ts
var Yt = 1e4, P = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.message = "", this.error = "", this.busy = !1, this.expanded = /* @__PURE__ */ new Set(), this.creating = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this.loadOptions(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), Yt);
	}
	disconnectedCallback() {
		window.clearInterval(this.timer), super.disconnectedCallback();
	}
	async loadOptions() {
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.optionsLoaded(this.info);
		} catch (e) {
			this.error = T(e);
		}
	}
	toggle(e) {
		this.expanded = Nt(this.expanded, e);
	}
	nameCell(e, t) {
		return g`<td class="name">${this.expanded.has(e) ? "▾" : "▸"} ${t}</td>`;
	}
	editRow(e, t, n, r) {
		return this.detailRow(e, g`<div
        @tdc-submit=${(e) => r(e.detail)}
        @tdc-cancel=${() => this.toggle(t)}
      >
        ${n}
      </div>`);
	}
	removeButton(e) {
		return g`<button
      ?disabled=${this.busy}
      @click=${(t) => {
			t.stopPropagation(), this.run(e);
		}}
    >
      ${this.tr("remove")}
    </button>`;
	}
	newPopup(e, t) {
		return g`
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
			this.error = T(e);
		}
		this.busy = !1;
	}
};
A([C()], P.prototype, "info", void 0), A([C()], P.prototype, "templates", void 0), A([C()], P.prototype, "message", void 0), A([C()], P.prototype, "error", void 0), A([C()], P.prototype, "busy", void 0), A([C()], P.prototype, "expanded", void 0), A([C()], P.prototype, "creating", void 0);
// node_modules/lit-html/directives/live.js
var Xt = Ft(class extends It {
	constructor(e) {
		if (super(e), e.type !== M.PROPERTY && e.type !== M.ATTRIBUTE && e.type !== M.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
		if (!zt(e)) throw Error("`live` bindings can only contain a single expression");
	}
	render(e) {
		return e;
	}
	update(e, [t]) {
		if (t === _ || t === v) return t;
		let n = e.element, r = e.name;
		if (e.type === M.PROPERTY) {
			if (t === n[r]) return _;
		} else if (e.type === M.BOOLEAN_ATTRIBUTE) {
			if (!!t === n.hasAttribute(r)) return _;
		} else if (e.type === M.ATTRIBUTE && n.getAttribute(r) === t + "") return _;
		return Ut(e), t;
	}
}), Zt = "query", Qt = "sort", $t = "descending", en = [Qt, $t], tn = "tdc.filter.";
function nn(e) {
	return e === "multi" ? [] : e !== "switch" && "";
}
function rn(e) {
	return {
		[Zt]: "",
		[Qt]: "",
		[$t]: !1,
		...Object.fromEntries(e.map((e) => [e.key, nn(e.kind)]))
	};
}
function an(e, t) {
	let n = rn(e);
	return {
		...n,
		...Object.fromEntries(en.map((e) => [e, t[e] ?? n[e]]))
	};
}
function on(e, t) {
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
function sn(e, t) {
	return +!!String(t.query ?? "").trim() + on(e, t).length;
}
function cn(e, t, n) {
	let r = e.find((e) => e.key === n.key);
	if (!r) return t;
	let i = t[n.key], a = Array.isArray(i) ? i.filter((e) => e !== n.value) : nn(r.kind);
	return {
		...t,
		[n.key]: a
	};
}
function ln(e, t) {
	let n = rn(e);
	if (typeof t != "object" || !t) return n;
	let r = t, i = { ...n };
	for (let [e, t] of Object.entries(n)) {
		let n = r[e];
		(Array.isArray(t) && Array.isArray(n) && n.every((e) => typeof e == "string") || typeof t == "string" && typeof n == "string" || typeof t == "boolean" && typeof n == "boolean") && (i[e] = n);
	}
	return i;
}
function un(e, t) {
	try {
		let n = sessionStorage.getItem(`${tn}${e}`);
		return ln(t, n ? JSON.parse(n) : null);
	} catch {
		return rn(t);
	}
}
function dn(e, t) {
	try {
		sessionStorage.setItem(`${tn}${e}`, JSON.stringify(t));
	} catch {}
}
// src/common/popover.ts
var fn = 4, pn = 12, mn = 320, hn = 120, gn = 200, _n = o`
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
`, vn = class extends j {
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
		let t = this.getBoundingClientRect(), n = window.innerHeight - t.bottom - pn, r = t.top - pn, i = n < gn && r > n, a = i ? r : n, { style: o } = e;
		o.left = `${t.left}px`, o.minWidth = `${t.width}px`, o.maxHeight = `${Math.max(hn, Math.min(mn, a))}px`, o.top = i ? "" : `${t.bottom + fn}px`, o.bottom = i ? `${window.innerHeight - t.top + fn}px` : "";
	}
};
A([C()], vn.prototype, "open", void 0);
// src/common/multi-select.ts
function yn(e, t, n) {
	let r = t.trim();
	if (!r) return e;
	let i = e.filter((e) => e !== r);
	return n ? [...i, r] : i;
}
var F = class extends vn {
	constructor(...e) {
		super(...e), this.items = [], this.selected = [], this.allowAdd = !1, this.single = !1, this.empty = "", this.draft = "";
	}
	static {
		this.styles = [
			j.styles,
			_n,
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
		if (!this.single) return this.emit(yn(this.selected, e, t));
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
		return g`<div class="row add">
      <input
        .value=${Xt(this.draft)}
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
		return g`
      <button
        class="trigger"
        aria-haspopup="listbox"
        aria-expanded=${this.open ? "true" : "false"}
        @click=${() => this.open = !this.open}
      >
        ${t.length ? g`<span class="summary">${t.join(", ")}</span>` : g`<span class="summary empty">${this.empty || this.tr("areasNone")}</span>`}
        <span>▾</span>
      </button>
      ${this.open ? g`<div class="popover" popover="manual" role="listbox" aria-multiselectable="true">
              ${this.allowAdd ? this.renderAdd() : ""}
              ${e.map((e) => g`<label class="option">
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
A([S({ attribute: !1 })], F.prototype, "items", void 0), A([S({ attribute: !1 })], F.prototype, "selected", void 0), A([S({ type: Boolean })], F.prototype, "allowAdd", void 0), A([S({ type: Boolean })], F.prototype, "single", void 0), A([S()], F.prototype, "empty", void 0), A([C()], F.prototype, "draft", void 0), F = A([x("tdc-multi-select")], F);
var I = class extends j {
	constructor(...e) {
		super(...e), this.fields = [], this.values = {}, this.sorts = [], this.matched = 0, this.total = 0, this.draft = {};
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
	disconnectedCallback() {
		window.clearTimeout(this.timer), this.timer = void 0, super.disconnectedCallback();
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
		if (e.kind === "switch") return g`<label class="switch narrow">
        <input
          type="checkbox"
          .checked=${t === !0}
          @change=${(t) => this.set(e.key, t.target.checked, !0)}
        />
        ${e.label}
      </label>`;
		let n = Array.isArray(t) ? t : t ? [String(t)] : [];
		return g`<label>
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
		if (!this.sorts.length) return v;
		let e = this.draft[$t] === !0, t = String(this.draft.sort ?? "");
		return g`<label class="narrow">
        ${this.tr("filterSortBy")}
        <select
          .value=${Xt(t)}
          @change=${(e) => this.set(Qt, e.target.value, !0)}
        >
          <option value="">${this.tr("sortDefault")}</option>
          ${this.sorts.map((e) => g`<option value=${e.value}>${e.label}</option>`)}
        </select>
      </label>
      <button
        class="narrow"
        title=${this.tr(e ? "sortDescending" : "sortAscending")}
        @click=${() => this.set($t, !e, !0)}
      >
        ${e ? "↓" : "↑"}
      </button>`;
	}
	renderChip(e) {
		return g`<span class="chip">
      ${e.label}
      <a
        href="#"
        role="button"
        title=${this.tr("filterRemove")}
        @click=${(t) => {
			t.preventDefault(), this.replace(cn(this.fields, this.draft, e));
		}}
        >×</a
      >
    </span>`;
	}
	render() {
		let e = on(this.fields, this.draft), t = sn(this.fields, this.draft) > 0;
		return g`
      <div class="row bar">
        <label class="search">
          ${this.tr("filterSearch")}
          <input
            type="search"
            .value=${Xt(String(this.draft.query ?? ""))}
            @input=${(e) => this.set(Zt, e.target.value)}
          />
        </label>
        ${this.fields.map((e) => this.renderField(e))} ${this.renderSort()}
      </div>
      <div class="row chips">
        ${e.map((e) => this.renderChip(e))}
        ${t ? g`<button @click=${() => this.replace(an(this.fields, this.draft))}>
                ${this.tr("filterReset")}
              </button>` : v}
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
A([S({ attribute: !1 })], I.prototype, "fields", void 0), A([S({ attribute: !1 })], I.prototype, "values", void 0), A([S({ attribute: !1 })], I.prototype, "sorts", void 0), A([S({ type: Number })], I.prototype, "matched", void 0), A([S({ type: Number })], I.prototype, "total", void 0), A([C()], I.prototype, "draft", void 0), I = A([x("tdc-filter-bar")], I);
// src/common/menu-button.ts
var bn = class extends vn {
	constructor(...e) {
		super(...e), this.label = "", this.items = [], this.disabled = !1;
	}
	static {
		this.styles = [
			j.styles,
			_n,
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
		return g`
      <button
        aria-haspopup="menu"
        aria-expanded=${this.open ? "true" : "false"}
        ?disabled=${this.disabled}
        @click=${() => this.open = !this.open}
      >
        ${this.label} ▾
      </button>
      ${this.open ? g`<div class="popover" popover="manual" role="menu">
              ${this.items.map((e) => g`<button
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
A([S()], bn.prototype, "label", void 0), A([S({ attribute: !1 })], bn.prototype, "items", void 0), A([S({ type: Boolean })], bn.prototype, "disabled", void 0), bn = A([x("tdc-menu-button")], bn);
// src/common/row-list.ts
var xn = o`
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
`, Sn = [it, at], Cn = [
	"sine",
	"saw",
	"square",
	"triangle",
	"random_walk",
	"discharge"
], wn = [
	"constant",
	"household_load",
	"pv_day"
], Tn = 600, En = 86400, Dn = 24;
function On(e) {
	return Sn.includes(e);
}
function kn(e) {
	return e === "counter" ? ["rate_per_hour"] : e === "csv" ? ["step_s", st] : e === "noise" ? [ct, ot] : e === "steps" ? [
		"period_s",
		ct,
		st,
		ot
	] : e === "enum" ? [ct] : e === "state_machine" ? [st] : Cn.includes(e) ? [
		"period_s",
		st,
		ot
	] : wn.includes(e) ? [ot] : [];
}
function An(e) {
	let t = e.period_s;
	return !kn(e.shape).includes("period_s") || !t || t <= 0 ? En : Math.min(En, t * Dn);
}
function jn(e) {
	return e < 120 ? `${Number(e.toFixed(1))} s` : e < 7200 ? `${Number((e / 60).toFixed(1))} min` : `${Number((e / 3600).toFixed(1))} h`;
}
function Mn(e) {
	return e === "enum" ? ["values", "weights"] : e === "state_machine" ? ["states"] : [];
}
function Nn(e, t, n) {
	let r = { ...e }, i = Number(n);
	return n.trim() === "" || Number.isNaN(i) ? delete r[t] : r[t] = i, r;
}
function Pn(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function Fn(e, t) {
	return t === "states" ? (e.states ?? []).map((e) => `${e.value}:${e.duration_s}`).join(", ") : (e[t] ?? []).join(", ");
}
function In(e, t, n) {
	let r = { ...e };
	return t === "values" ? r.values = Pn(n) : t === "weights" ? r.weights = Pn(n).map(Number).filter((e) => !Number.isNaN(e)) : r.states = Pn(n).flatMap((e) => {
		let [t, n] = e.split(":").map((e) => e.trim()), r = Number(n);
		return t && r > 0 ? [{
			value: t,
			duration_s: r
		}] : [];
	}), r;
}
function Ln(e) {
	return e === "enum" ? {
		values: ["on", "off"],
		interval_s: Tn
	} : e === "state_machine" ? { states: [{
		value: "idle",
		duration_s: Tn
	}, {
		value: "active",
		duration_s: Tn
	}] } : {};
}
function Rn(e, t) {
	let n = /* @__PURE__ */ new Set([
		lt,
		...kn(t),
		...Mn(t)
	]);
	t === "csv" && n.add("file"), On(t) || [
		"min",
		"max",
		"decimals"
	].forEach((e) => n.add(e));
	let r = {
		...Ln(t),
		...e,
		shape: t
	};
	return Object.fromEntries(Object.entries(r).filter(([e]) => n.has(e)));
}
// src/signals/signals.ts
var zn = (1n << 64n) - 1n, Bn = 11400714819323198485n, Vn = 13787848793156543929n, Hn = 10723151780598845931n, Un = 3600, Wn = 3600, Gn = 10, Kn = .5, qn = 3, Jn = 1.5, Yn = 30n, Xn = 27n, Zn = 31n, Qn = 11n, $n = 53, er = 86400, tr = 24, nr = .12, rr = [
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
], ir = .12, ar = 600, or = 6, sr = 900, cr = .3, lr = 2, ur = 3;
function dr(e, t = 0, n = 0) {
	return {
		shape: e.shape,
		min: e.min ?? 0,
		max: e.max ?? 100,
		period_s: e.period_s ?? Wn,
		interval_s: e.interval_s ?? Gn,
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
function fr(e, t) {
	let n = BigInt(e) * Bn + (BigInt(t) & zn) * Vn + Hn & zn;
	return n = (n ^ n >> Yn) * Vn & zn, n = (n ^ n >> Xn) * Hn & zn, n ^= n >> Zn, Number(n >> Qn) / 2 ** $n;
}
function pr(e, t) {
	let n = t / e.period_s + e.phase;
	return n - Math.floor(n);
}
function mr(e, t) {
	let n = Math.floor(t), r = t - n, i = r * r * (qn - 2 * r), a = fr(e, n);
	return a + (fr(e, n + 1) - a) * i;
}
function hr(e) {
	return (e % er + er) % er / Un;
}
function gr(e, t, n) {
	let r = Math.abs(e - t), i = Math.min(r, tr - r);
	return Math.exp(-.5 * (i / n) ** 2);
}
var _r = {
	constant: () => Kn,
	sine: (e, t) => Kn + Kn * Math.sin(2 * Math.PI * pr(e, t)),
	saw: (e, t) => pr(e, t),
	square: (e, t) => +(pr(e, t) < Kn),
	triangle: (e, t) => 1 - Math.abs(2 * pr(e, t) - 1),
	noise: (e, t) => fr(e.seed, Math.floor(t / e.interval_s)),
	random_walk: (e, t) => mr(e.seed, t / e.period_s + e.phase),
	household_load: (e, t) => {
		let n = hr(t);
		return rr.reduce((e, [t, r, i]) => e + i * gr(n, t, r), nr) + ir * (mr(e.seed, t / ar) - Kn);
	},
	pv_day: (e, t) => {
		let n = (hr(t) - or) / 14;
		if (!(n > 0 && n < 1)) return 0;
		let r = 1 - cr * mr(e.seed, t / sr);
		return Math.sin(Math.PI * n) ** Jn * r;
	},
	steps: (e, t) => {
		let n = Math.max(lr, Math.round(e.period_s / e.interval_s));
		return Math.min(1, Math.floor(pr(e, t) * n) / (n - 1));
	},
	discharge: (e, t) => 1 - pr(e, t) ** ur
};
function vr(e, t) {
	let n = e.weights.length ? e.weights : e.values.map(() => 1), r = n.reduce((e, t) => e + t, 0), i = fr(e.seed, Math.floor(t / e.interval_s)) * r, a = 0;
	for (let [t, r] of e.values.entries()) if (a += n[t], i < a) return r;
	return e.values[e.values.length - 1];
}
function yr(e, t) {
	let n = e.states.reduce((e, [, t]) => e + t, 0), r = ((t + e.phase * n) % n + n) % n, i = 0;
	for (let [t, n] of e.states) if (i += n, r < i) return t;
	return e.states[e.states.length - 1][0];
}
var br = {
	enum: vr,
	state_machine: yr
};
function xr(e) {
	let t = e.shape === "enum" ? e.values : e.states.map(([e]) => e);
	return [...new Set(t)];
}
function Sr(e, t) {
	return Number(e.toFixed(t));
}
function Cr(e, t) {
	if (e.shape in br) return br[e.shape](e, t);
	if (e.shape === "counter") {
		let n = Math.max(0, t - e.origin);
		return Sr(e.min + e.rate_per_hour * n / Un, e.decimals);
	}
	let n = (_r[e.shape] ?? _r.constant)(e, t);
	return e.noise && (n += (fr(e.seed + 1, Math.floor(t)) - Kn) * 2 * e.noise), n = Math.min(1, Math.max(0, n)), Sr(e.min + n * (e.max - e.min), e.decimals);
}
// src/signals/signal-preview.ts
var wr = 320, Tr = 80, Er = 800, Dr = 100, Or = 480, kr = 6, Ar = 12, jr = [
	0,
	.5,
	1
], Mr = class extends Ke {
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
		return this.compact ? wr : Er;
	}
	get height() {
		return this.compact ? Tr : Dr;
	}
	points(e) {
		let t = dr(e, 1, 0), n = xr(t), r = Array.from({ length: 481 }, (r, i) => {
			let a = Cr(t, i / Or * An(e));
			return typeof a == "string" ? n.indexOf(a) : a;
		}), i = Math.min(...r), a = Math.max(...r) - i || 1;
		return r.map((e, t) => {
			let n = t / Or * this.width, r = this.height - kr - (e - i) / a * (this.height - 12);
			return `${n.toFixed(1)},${r.toFixed(1)}`;
		}).join(" ");
	}
	axis(e) {
		return Ae`${jr.map((t) => {
			let n = t * this.width, r = t === 0 ? "start" : t === 1 ? "end" : "middle";
			return Ae`<text x=${n} y=${this.height + Ar - 2} text-anchor=${r}>${jn(t * e)}</text>`;
		})}`;
	}
	render() {
		if (!this.signal) return g``;
		let e = this.signal.shape === "enum" || this.signal.shape === "state_machine", t = e ? xr(dr(this.signal)).join(" · ") : "", n = this.signal.min ?? 0, r = this.signal.max ?? 100, i = g`<svg
      viewBox="0 0 ${this.width} ${this.height + (this.compact ? 0 : Ar)}"
      role="img"
    >
      ${Ae`<polyline points=${this.points(this.signal)}></polyline>`}
      ${this.compact ? "" : this.axis(An(this.signal))}
    </svg>`;
		return this.compact ? i : g`${i}
      <div>${e ? t : `${n} – ${r} ${this.unit}`}</div>`;
	}
};
A([S({ attribute: !1 })], Mr.prototype, "signal", void 0), A([S()], Mr.prototype, "unit", void 0), A([S({ type: Boolean })], Mr.prototype, "compact", void 0), Mr = A([x("tdc-signal-preview")], Mr);
// src/signals/curve-editor.ts
var Nr = {
	min: "edMin",
	max: "edMax",
	decimals: "edDecimals",
	period_s: "edPeriod",
	interval_s: "edInterval",
	phase: "edPhase",
	rate_per_hour: "edRate",
	step_s: "edStep",
	noise: "edNoise"
}, Pr = {
	values: "edValues",
	weights: "edWeights",
	states: "edStates"
}, Fr = class extends j {
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
		return g`<label style="flex: 1 1 120px"
      >${this.tr(Nr[e])}
      <input
        type="number"
        step="any"
        .value=${this.signal[e] === void 0 ? "" : String(this.signal[e])}
        @input=${(t) => this.emit(Nn(this.signal, e, t.target.value))}
      />
    </label>`;
	}
	listField(e) {
		return this.textField(this.tr(Pr[e]), Fn(this.signal, e), (t) => this.emit(In(this.signal, e, t)), { flex: "1 1 240px" });
	}
	changeShape(e) {
		let t = Rn(this.signal, e);
		this.emit(e === "csv" && !t.file && this.files[0] ? {
			...t,
			file: this.files[0]
		} : t);
	}
	renderFile() {
		let e = this.files.includes(this.signal.file ?? "") ? this.files : [...this.signal.file ? [this.signal.file] : [], ...this.files];
		return g`<label style="flex: 1 1 240px"
      >${this.tr("edFile")}
      <select
        ?disabled=${e.length === 0}
        @change=${(e) => this.emit({
			...this.signal,
			file: e.target.value
		})}
      >
        ${e.length === 0 ? g`<option>${this.tr("edNoFile")}</option>` : ""}
        ${e.map((e) => g`<option value=${e} ?selected=${e === this.signal.file}>${e}</option>`)}
      </select>
      <small>${this.tr("edFileHint")}</small>
    </label>`;
	}
	render() {
		return g`
      <div class="row form">
        <label style="flex: 1 1 180px"
          >${this.tr("edShape")}
          <select @change=${(e) => this.changeShape(e.target.value)}>
            ${k(this.hass?.language, this.shapes, (e) => E(this.hass?.language, lt, e)).map((e) => g`<option value=${e} ?selected=${e === this.signal.shape}>
                  ${E(this.hass?.language, lt, e)}
                </option>`)}
          </select>
        </label>
        ${On(this.signal.shape) ? "" : g`${this.numberField("min")} ${this.numberField("max")}
              ${this.numberField("decimals")}`}
      </div>
      <div class="row form">
        ${this.signal.shape === "csv" ? this.renderFile() : ""}
        ${kn(this.signal.shape).map((e) => this.numberField(e))}
        ${Mn(this.signal.shape).map((e) => this.listField(e))}
      </div>
      ${this.signal.shape === "csv" ? g`<small>${this.tr("edCsvPreview")}</small>` : g`<tdc-signal-preview .signal=${this.signal} unit=${this.unit}></tdc-signal-preview>`}
    `;
	}
};
A([S({ attribute: !1 })], Fr.prototype, "signal", void 0), A([S({ attribute: !1 })], Fr.prototype, "shapes", void 0), A([S()], Fr.prototype, "unit", void 0), A([C()], Fr.prototype, "files", void 0), Fr = A([x("tdc-curve-editor")], Fr);
// src/wizard/entity-helpers.ts
var Ir = ["sensor", "climate"], Lr = "event", Rr = /* @__PURE__ */ "°C.°F.K.%.W.kW.Wh.kWh.V.A.Hz.VA.var.lx.dB.hPa.mbar.bar.Pa.ppm.ppb.µg/m³.m.cm.mm.km.m/s.km/h.l.L/min.m³.g.kg.s.min.h.d.B.kB.MB.GB.Mbit/s.lm".split("."), zr = /^[a-z0-9]+(_[a-z0-9]+)*$/;
function Br(e) {
	return e.replace(/ß/g, "ss").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function Vr(e) {
	return Ir.includes(e);
}
function Hr(e, t) {
	let { signal: n, unit: r, event_types: i, ...a } = e, o = {
		...a,
		platform: t
	};
	return Vr(t) && (o.signal = n ?? {
		shape: "sine",
		min: 0,
		max: 100
	}, t === "sensor" && r && (o.unit = r)), t === Lr && (o.event_types = i ?? ["press"]), o;
}
function Ur(e) {
	return Hr({
		key: "",
		platform: e,
		name: ""
	}, e);
}
function Wr(e, t) {
	return e.name.trim() ? zr.test(e.key) ? t.includes(e.key) ? "entKeyTaken" : e.platform === Lr && !e.event_types?.length ? "entEventTypes" : "" : "entKeyInvalid" : "entNameEmpty";
}
function Gr(e, t, n) {
	return t < 0 ? [...e, n] : e.map((e, r) => r === t ? n : e);
}
function Kr(e, t) {
	return e.filter((e, n) => n !== t);
}
function qr(e) {
	let t = Object.values(e?.states ?? {}).map((e) => e.attributes?.unit_of_measurement).filter((e) => typeof e == "string" && e !== "");
	return [.../* @__PURE__ */ new Set([...t, ...Rr])].sort((e, t) => e.localeCompare(t));
}
// src/wizard/helpers.ts
var Jr = 10;
function Yr(e, t) {
	return Math.round(e / Math.max(1, t) * Jr) / Jr;
}
function Xr(e, t) {
	return e.shape === "enum" || e.shape === "state_machine" ? xr(dr(e)).join(" · ") : `${e.min ?? 0} – ${e.max ?? 100}${t ? ` ${t}` : ""}`;
}
// src/wizard/entity-editor.ts
var Zr = -1, L = class extends j {
	constructor(...e) {
		super(...e), this.entities = [], this.shapes = [], this.platforms = [], this.editIndex = Zr, this.keyTouched = !1;
	}
	static {
		this.styles = [
			j.styles,
			xn,
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
		this.draft = Ur(this.platforms.includes("sensor") ? ut : "switch"), this.editIndex = Zr, this.keyTouched = !1;
	}
	edit(e) {
		this.draft = structuredClone(this.entities[e]), this.editIndex = e, this.keyTouched = !0;
	}
	removeAt(e) {
		this.emit(Kr(this.entities, e)), this.editIndex === e ? this.draft = void 0 : this.editIndex > e && --this.editIndex;
	}
	cancel() {
		this.draft = void 0;
	}
	apply() {
		this.draft &&= (this.emit(Gr(this.entities, this.editIndex, this.draft)), void 0);
	}
	setField(e, t) {
		if (!this.draft) return;
		let n = {
			...this.draft,
			[e]: t
		};
		e === "key" && (this.keyTouched = !0), e === "name" && !this.keyTouched && (n.key = Br(t)), e === "unit" && !t && delete n.unit, this.draft = n;
	}
	otherKeys() {
		return this.entities.filter((e, t) => t !== this.editIndex).map((e) => e.key);
	}
	renderRow(e, t) {
		let n = E(this.hass?.language, "platform", e.platform);
		return g`<li class=${t === this.editIndex && this.draft ? "editing" : ""}>
      <span class="name">
        <div title=${e.name}>${e.name}</div>
        <small>${e.key} · ${n}</small>
      </span>
      ${e.signal ? g`<span class="range">${Xr(e.signal, e.unit)}</span>
              <tdc-signal-preview compact .signal=${e.signal}></tdc-signal-preview>` : ""}
      <button class="small" @click=${() => this.edit(t)}>${this.tr("entEdit")}</button>
      <button class="small danger" @click=${() => this.removeAt(t)}>
        ${this.tr("entDelete")}
      </button>
    </li>`;
	}
	renderDraft(e) {
		let t = Wr(e, this.otherKeys()), n = this.hass?.language;
		return g`<div class="draft">
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
            @change=${(t) => this.draft = Hr(e, t.target.value)}
          >
            ${k(n, this.platforms, (e) => E(n, "platform", e)).map((t) => g`<option value=${t} ?selected=${t === e.platform}>
                  ${E(n, "platform", t)}
                </option>`)}
          </select>
        </label>
        ${e.platform === "sensor" ? g`<label style="flex: 0 1 130px"
                >${this.tr("entUnit")}
                <input
                  list="units"
                  .value=${e.unit ?? ""}
                  @input=${(e) => this.setField("unit", e.target.value)}
                />
                <datalist id="units">
                  ${qr(this.hass).map((e) => g`<option value=${e}></option>`)}
                </datalist>
              </label>` : ""}
      </div>
      ${e.event_types ? g`<label
              >${this.tr("entEventTypesLabel")}
              <input
                .value=${e.event_types.join(", ")}
                @input=${(t) => this.draft = {
			...e,
			event_types: t.target.value.split(",").map((e) => e.trim()).filter(Boolean)
		}}
              />
            </label>` : ""}
      ${Vr(e.platform) && e.signal ? g`<tdc-curve-editor
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
		return g`<div class="head">
        <b>${this.tr("customEntities")} (${this.entities.length})</b>
        <button class="primary" @click=${() => this.add()}>${this.tr("entAdd")}</button>
      </div>
      <ul>
        ${this.entities.length ? this.entities.map((e, t) => this.renderRow(e, t)) : g`<li class="empty">${this.tr("entEmpty")}</li>`}
      </ul>
      ${this.draft ? this.renderDraft(this.draft) : ""}`;
	}
};
A([S({ attribute: !1 })], L.prototype, "entities", void 0), A([S({ attribute: !1 })], L.prototype, "shapes", void 0), A([S({ attribute: !1 })], L.prototype, "platforms", void 0), A([C()], L.prototype, "draft", void 0), A([C()], L.prototype, "editIndex", void 0), A([C()], L.prototype, "keyTouched", void 0), L = A([x("tdc-entity-editor")], L);
// src/wizard/entities-form.ts
var R = class extends j {
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
		return g`<div class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr("baseTemplate")}
          <select
            .value=${this.pendingBase}
            @change=${(e) => this.chooseBase(e.target.value)}
          >
            <option value="">${this.tr("baseNone")}</option>
            ${k(e, this.templates, (t) => O(e, t.id, t.name)).map((t) => g`<option value=${t.id} ?selected=${t.id === this.pendingBase}>
                  ${O(e, t.id, t.name)}
                </option>`)}
          </select>
        </label>
      </div>
      ${t ? g`<p class="warning">
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
		return g`<div style="display: grid; gap: 20px">
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
A([S({ attribute: !1 })], R.prototype, "templates", void 0), A([S({ attribute: !1 })], R.prototype, "entities", void 0), A([S({ attribute: !1 })], R.prototype, "shapes", void 0), A([S({ attribute: !1 })], R.prototype, "platforms", void 0), A([C()], R.prototype, "pendingBase", void 0), R = A([x("tdc-entities-form")], R);
// src/wizard/entity-list.ts
var Qr = class extends j {
	constructor(...e) {
		super(...e), this.entities = [];
	}
	static {
		this.styles = [
			j.styles,
			xn,
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
		return this.entities.length ? g`<ul>
      ${this.entities.map((e) => g`<li>
            <span class="name" title=${e.name}>${e.name}</span>
            ${e.signal ? g`<span class="range">${Xr(e.signal, e.unit)}</span>
                    <tdc-signal-preview compact .signal=${e.signal}></tdc-signal-preview>` : g`<span class="range"
                    >${E(this.hass?.language, "platform", e.platform)}</span
                  >`}
          </li>`)}
    </ul>` : g``;
	}
};
A([S({ attribute: !1 })], Qr.prototype, "entities", void 0), Qr = A([x("tdc-entity-list")], Qr);
// src/devices/helpers.ts
var $r = {
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
}, ei = "fault_";
function ti(e, t) {
	let n = e[t] ?? [];
	return {
		plain: n.filter((e) => !e.startsWith("fault_") && !(e in $r)),
		withValue: n.filter((e) => e in $r),
		faults: n.filter((e) => e.startsWith(ei)).map((e) => e.slice(6))
	};
}
function ni(e, t) {
	let n = $r[e], r = Number(t);
	if (n && t.trim() !== "" && !Number.isNaN(r) && !(r < n.min || r > n.max)) return { [n.param]: r };
}
function ri(e) {
	let t = Number(e);
	return e.trim() !== "" && t > 0 ? { duration_s: t } : void 0;
}
function ii(e, t) {
	let n = [...Object.values(e ?? {}).map((e) => e.name), ...t.flatMap((e) => e.area ? [e.area] : [])];
	return [...new Set(n)].sort((e, t) => e.localeCompare(t));
}
var ai = [
	"schedules",
	"scenarios",
	ft
];
function oi(e) {
	return ai.flatMap((t) => (e?.[t] ?? []).map((e) => ({
		kind: t,
		name: e.name
	})));
}
function si(e, t) {
	return e <= 0 ? 0 : Math.floor((e - 1) / t) * t;
}
var ci = [
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
], li = "devices";
function ui(e) {
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
function di(e, t, n) {
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
var fi = 10, pi = 10, mi = "custom", hi = 50, gi = ["even", "random"], _i = {
	even: "modeEven",
	random: "modeRandom"
}, z = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.template = "", this.count = fi, this.pattern = "{template} {nn}", this.areas = [], this.mode = "even", this.seed = "", this.output = "native", this.custom = [], this.busy = !1, this.message = "", this.error = "";
	}
	async connectedCallback() {
		super.connectedCallback();
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.template = this.templates[0]?.id ?? mi;
		} catch (e) {
			this.error = T(e);
		}
	}
	entities() {
		return this.template === mi ? this.custom : this.templates.find((e) => e.id === this.template)?.entities ?? [];
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
			...this.template === mi ? { entities: this.custom } : {}
		};
		try {
			let t = await this.api.create(e);
			this.message = this.tr("created", { count: t.devices }), this.dispatchEvent(new CustomEvent("tdc-created"));
		} catch (e) {
			this.error = T(e);
		}
		this.busy = !1;
	}
	renderEstimate() {
		let e = this.entities(), t = Yr(e.filter((e) => e.platform === ut).length * this.count, this.info?.tick_seconds ?? pi);
		return g`<p>
      <small>${this.tr("estimate", {
			entities: e.length * this.count,
			rate: t
		})}</small>
      ${t > hi ? g`<br /><span class="warning">${this.tr("rateWarning")}</span>` : ""}
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
				id: mi,
				label: this.tr("customTemplate")
			}
		};
	}
	option(e) {
		let t = e.id === mi;
		return g`<option
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
		return g`
      <div class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr($e)}
          <select @change=${(e) => this.choose(e.target.value)}>
            ${e.bundled.map((e) => this.option(e))}
            ${e.own.length ? g`<optgroup label=${this.tr("ownTemplates")}>
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
            .items=${ii(this.hass?.areas, []).map((e) => ({
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
            ${k(this.hass?.language, gi, (e) => this.tr(_i[e])).map((e) => g`<option value=${e} ?selected=${e === this.mode}>
                  ${this.tr(_i[e])}
                </option>`)}
          </select>
        </label>
        ${this.select(this.tr("colOutput"), this.info?.outputs ?? ["native"], this.output, (e) => this.tr(Tt[e] ?? "outputNative"), (e) => this.output = e)}
        <label style="flex: 0 0 160px"
          >${this.tr("seed")}
          <input
            .value=${this.seed}
            @input=${(e) => this.seed = e.target.value}
          />
          <small>${this.tr("seedHint")}</small>
        </label>
      </p>
      ${this.template === mi ? g`<div style="display: grid; gap: 20px">
              <tdc-entities-form
                .hass=${this.hass}
                .templates=${this.templates}
                .entities=${this.custom}
                .shapes=${this.info?.shapes ?? []}
                .platforms=${this.info?.platforms ?? []}
                @tdc-entities-change=${(e) => this.custom = e.detail}
              ></tdc-entities-form>
            </div>` : ""}
      ${this.template === mi ? "" : g`<p>
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
A([C()], z.prototype, "info", void 0), A([C()], z.prototype, "templates", void 0), A([C()], z.prototype, "template", void 0), A([C()], z.prototype, "count", void 0), A([C()], z.prototype, "pattern", void 0), A([C()], z.prototype, "areas", void 0), A([C()], z.prototype, "mode", void 0), A([C()], z.prototype, "seed", void 0), A([C()], z.prototype, "output", void 0), A([C()], z.prototype, "custom", void 0), A([C()], z.prototype, "busy", void 0), A([C()], z.prototype, "message", void 0), A([C()], z.prototype, "error", void 0), z = A([x("tdc-creation-wizard")], z);
// src/wizard/template-wizard.ts
var B = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.name = "", this.entities = [], this.busy = !1, this.error = "";
	}
	async connectedCallback() {
		super.connectedCallback();
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]);
		} catch (e) {
			this.error = T(e);
		}
	}
	willUpdate(e) {
		e.has("editing") && (this.name = this.editing?.name ?? "", this.entities = structuredClone(this.editing?.entities ?? []));
	}
	async save() {
		let e = this.name.trim();
		this.busy = !0, this.error = "";
		try {
			let t = await this.api.saveTemplate(this.editing?.id ?? Br(e), e, this.entities);
			this.dispatchEvent(new CustomEvent("tdc-template-saved", { detail: t }));
		} catch (e) {
			this.error = T(e);
		}
		this.busy = !1;
	}
	render() {
		let e = this.name.trim(), t = this.editing?.id ?? Br(e), n = !this.editing && this.templates.some((e) => e.id === t && !e.bundled);
		return g`
      <div style="display: grid; gap: 20px">
        <label
          >${this.tr("tplName")}
          <input
            .value=${this.name}
            @input=${(e) => this.name = e.target.value}
          />
          ${n ? g`<small class="warning">${this.tr("tplExists")}</small>` : ""}
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
A([S({ attribute: !1 })], B.prototype, "editing", void 0), A([C()], B.prototype, "info", void 0), A([C()], B.prototype, "templates", void 0), A([C()], B.prototype, "name", void 0), A([C()], B.prototype, "entities", void 0), A([C()], B.prototype, "busy", void 0), A([C()], B.prototype, "error", void 0), B = A([x("tdc-template-wizard")], B);
// src/wizard/template-manager.ts
var V = class extends j {
	constructor(...e) {
		super(...e), this.own = [], this.form = !1, this.confirming = "", this.busy = !1, this.error = "";
	}
	static {
		this.styles = [
			j.styles,
			xn,
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
			this.error = T(e);
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
			this.error = T(e);
		}
		this.busy = !1;
	}
	renderActions(e) {
		return this.confirming === e.id ? g`<button
        class="small danger"
        ?disabled=${this.busy}
        @click=${() => void this.removeTemplate(e.id)}
      >
        ${this.tr("tplDeleteConfirm")}
      </button>
      <button class="small" @click=${() => this.confirming = ""}>
        ${this.tr("detCancel")}
      </button>` : g`<button class="small" @click=${() => this.openForm(e)}>
          ${this.tr("entEdit")}
        </button>
        <button class="small danger" @click=${() => this.confirming = e.id}>
          ${this.tr("entDelete")}
        </button>`;
	}
	renderList() {
		return g`<p class="end">
        <button class="primary" @click=${() => this.openForm()}>+ ${this.tr("tplNew")}</button>
      </p>
      <ul>
        ${this.own.length ? this.own.map((e) => g`<li>
                    <span>
                      <div title=${e.name}>${e.name}</div>
                      <small>${this.tr("tplEntities", { count: e.entities.length })}</small>
                    </span>
                    ${this.renderActions(e)}
                  </li>`) : g`<li class="empty">${this.tr("tplNone")}</li>`}
      </ul>
      <p class="error">${this.error}</p>`;
	}
	render() {
		return this.form ? g`<p>
        <button @click=${() => void this.closeForm()}>‹ ${this.tr("tplBack")}</button>
      </p>
      <tdc-template-wizard
        .hass=${this.hass}
        .editing=${this.editing}
        @tdc-template-saved=${() => void this.closeForm()}
      ></tdc-template-wizard>` : this.renderList();
	}
};
A([C()], V.prototype, "own", void 0), A([C()], V.prototype, "form", void 0), A([C()], V.prototype, "editing", void 0), A([C()], V.prototype, "confirming", void 0), A([C()], V.prototype, "busy", void 0), A([C()], V.prototype, "error", void 0), V = A([x("tdc-template-manager")], V);
// src/devices/device-detail.ts
var H = class extends j {
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
			this.error = T(e);
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
		return g`<div class="row area-row">
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
		let t = this.hass?.language, n = ti(this.actions, e.platform);
		return k(t, [
			...n.plain,
			...n.withValue,
			...n.faults.map((e) => `${ei}${e}`)
		], (e) => D(t, e)).map((e) => ({
			value: e,
			label: D(t, e)
		}));
	}
	pick(e, t) {
		t in $r || t.startsWith("fault_") ? this.picked = {
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
		let n = $r[t], r = `${e.key}:${t}`, i = this.inputs[r] ?? String(n ? n.start : 60), a = n ? ni(t, i) : ri(i);
		return g`<span class="row">
      <strong>${D(this.hass?.language, t)}</strong>
      <input
        type="number"
        min=${n ? n.min : 1}
        max=${n ? n.max : v}
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
		return g`<tr>
      <td colspan="3" class="curve">
        <tdc-curve-editor
          .hass=${this.hass}
          .signal=${this.curves[e.key]}
          .shapes=${this.shapes.filter((e) => !On(e))}
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
		let t = this.hass?.language, n = this.menuItems(e), r = e.shape != null && !On(e.shape);
		return g`<tr>
        <td>
          ${Ot(t, e.key, e.name)}<br /><small
            >${E(t, "platform", e.platform)}</small
          >
        </td>
        <td>
          ${kt(t, e.state)}${e.unit ? ` ${e.unit}` : ""}${e.fault ? g`<br /><small class="warning">⚠ ${E(t, "fault", e.fault)}</small>` : ""}
        </td>
        <td class="row">
          ${n.length ? g`<tdc-menu-button
                  .hass=${this.hass}
                  label=${this.tr("detActions")}
                  ?disabled=${this.busy}
                  .items=${n}
                  @tdc-pick=${(t) => this.pick(e, t.detail)}
                ></tdc-menu-button>` : ""}
          ${this.renderPicked(e)}
          ${r ? g`<button
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
		let e = oi(this.device.used_by);
		return e.length === 0 ? g`<p class="usage"><small>${this.tr("useNone")}</small></p>` : g`<details class="usage">
      <summary>${this.tr("useTitle", { count: e.length })}</summary>
      <ul>
        ${e.map((e) => g`<li>${this.tr(`use_${e.kind}`)}: ${e.name}</li>`)}
      </ul>
    </details>`;
	}
	render() {
		return g`
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
A([S({ attribute: !1 })], H.prototype, "device", void 0), A([S({ attribute: !1 })], H.prototype, "actions", void 0), A([S({ attribute: !1 })], H.prototype, "areas", void 0), A([S({ attribute: !1 })], H.prototype, "shapes", void 0), A([C()], H.prototype, "areaDraft", void 0), A([C()], H.prototype, "picked", void 0), A([C()], H.prototype, "inputs", void 0), A([C()], H.prototype, "curves", void 0), A([C()], H.prototype, "busy", void 0), A([C()], H.prototype, "error", void 0), H = A([x("tdc-device-detail")], H);
// src/devices/duplicate-dialog.ts
var vi = "{template} {n}", yi = 500, bi = (e) => e.target.value, xi = class extends j {
	constructor(...e) {
		super(...e), this.count = 1, this.pattern = vi, this.busy = !1, this.error = "";
	}
	async submit() {
		this.busy = !0;
		try {
			await this.api.duplicate(this.device.id, this.count, this.pattern), this.error = "", this.dispatchEvent(new CustomEvent("tdc-created", {
				bubbles: !0,
				composed: !0
			}));
		} catch (e) {
			this.error = T(e);
		}
		this.busy = !1;
	}
	render() {
		let e = Number.isInteger(this.count) && this.count >= 1 && this.count <= yi;
		return g`
      <p><b>${this.device.name}</b></p>
      <div class="row">
        <label
          >${this.tr("dupCount")}
          <input
            type="number"
            min="1"
            max=${yi}
            .value=${String(this.count)}
            @input=${(e) => this.count = Number(bi(e))}
          />
        </label>
        <label
          >${this.tr("dupPattern")}
          <input
            type="text"
            maxlength="64"
            .value=${this.pattern}
            @input=${(e) => this.pattern = bi(e)}
          />
        </label>
      </div>
      <p><small>${this.tr("dupHint")}</small></p>
      ${this.error ? g`<p class="error">${this.error}</p>` : ""}
      <button class="primary" ?disabled=${this.busy || !e} @click=${() => void this.submit()}>
        ${this.tr("dupDo")}
      </button>
    `;
	}
};
A([S({ attribute: !1 })], xi.prototype, "device", void 0), A([C()], xi.prototype, "count", void 0), A([C()], xi.prototype, "pattern", void 0), A([C()], xi.prototype, "busy", void 0), A([C()], xi.prototype, "error", void 0), xi = A([x("tdc-duplicate-dialog")], xi);
// src/devices/device-list.ts
var Si = 4, Ci = 6, wi = {
	switch: "toggle",
	event: "press",
	binary_sensor: "pulse",
	light: "toggle"
}, Ti = "fire:", Ei = "remove", Di = "duplicate", Oi = [
	ut,
	"switch",
	"binary_sensor",
	"light",
	"cover",
	"climate"
], U = class extends P {
	constructor(...e) {
		super(...e), this.devices = [], this.total = 0, this.matched = 0, this.offset = 0, this.loaded = !1, this.templating = !1, this.filter = un(li, ci), this.facetsStale = !0;
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
		let e = ui(this.filter), t = this.facetsStale;
		this.facetsStale = !1;
		try {
			let n = await this.api.devices(this.offset, 50, e, t);
			n.devices.length === 0 && this.offset > 0 && (this.offset = si(n.matched, 50), n = await this.api.devices(this.offset, 50, e, t)), this.devices = n.devices, this.total = n.total, this.matched = n.matched, n.facets && (this.facets = n.facets), this.error = "";
		} catch (e) {
			this.facetsStale ||= t, this.error = T(e);
		}
		this.loaded = !0;
	}
	reload() {
		this.facetsStale = !0, this.refresh();
	}
	setFilter(e) {
		this.filter = e, dn(li, e), this.offset = 0, this.reload();
	}
	facetTemplate(e) {
		return e.value === "custom" ? this.tr("customTemplate") : O(this.hass?.language, e.value, e.value);
	}
	filterFields() {
		let e = this.hass?.language, t = this.facets, n = (e, n, r) => di(t?.[e], this.filter[n], r), r = {
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
				options: n("outputs", "outputs", (e) => this.tr(Tt[e.value] ?? "outputNative"))
			},
			{
				key: "platforms",
				kind: "multi",
				label: this.tr("detEntity"),
				options: n("platforms", "platforms", (t) => E(e, "platform", t.value))
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
		return g`<tdc-filter-bar
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
			await this.api.fire(e.id, t.key, wi[t.platform]), await this.refresh();
		} catch (e) {
			this.error = T(e);
		}
	}
	menuItems(e) {
		let t = this.hass?.language;
		return k(t, [
			...e.entities.filter((e) => e.platform in wi).map((e) => ({
				value: `${Ti}${e.key}`,
				label: `${Ot(t, e.key, e.name)} – ${D(t, wi[e.platform])}`
			})),
			{
				value: Di,
				label: this.tr("duplicate")
			},
			{
				value: Ei,
				label: this.tr("remove"),
				disabled: oi(e.used_by).length > 0,
				hint: this.tr("removeBlocked")
			}
		], (e) => e.label);
	}
	pick(e, t) {
		if (t === Di) {
			this.duplicating = e;
			return;
		}
		if (t === Ei) {
			this.dispatchEvent(new CustomEvent("tdc-remove", { detail: {
				target: Qe,
				id: e.id
			} }));
			return;
		}
		let n = e.entities.find((e) => `${Ti}${e.key}` === t);
		n && this.fire(e, n);
	}
	values(e) {
		let t = this.hass?.language;
		return e.entities.filter((e) => Oi.includes(e.platform)).slice(0, Si).map((e) => {
			let n = e.unit ? ` ${e.unit}` : "", r = e.fault ? ` ⚠ ${E(t, "fault", e.fault)}` : "";
			return `${Ot(t, e.key, e.name)}: ${kt(t, e.state)}${n}${r}`;
		}).join(" · ");
	}
	templateName(e) {
		return e.template === "custom" ? this.tr("customTemplate") : O(this.hass?.language, e.template, e.model);
	}
	renderRow(e) {
		let t = this.expanded.has(e.id);
		return g`<tr class="device card" @click=${() => this.toggle(e.id)}>
        <td class="name nowrap">${t ? "▾" : "▸"} ${e.name}</td>
        <td class="nowrap" data-label=${this.tr("colTemplate")}>${this.templateName(e)}</td>
        <td class="nowrap" data-label=${this.tr("colArea")}>${e.area ?? "–"}</td>
        <td class="nowrap" data-label=${this.tr("colOutput")}>
          ${this.tr(Tt[e.output] ?? "outputNative")}
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
      ${t ? this.detailRow(Ci, g`<tdc-device-detail
                .hass=${this.hass}
                .device=${e}
                .actions=${this.info?.actions ?? {}}
                .shapes=${this.info?.shapes ?? []}
                .areas=${ii(this.hass.areas, this.devices)}
                @tdc-changed=${() => this.reload()}
              ></tdc-device-detail>`) : ""}`;
	}
	renderNew() {
		return g`
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
        ${this.creating ? g`<tdc-creation-wizard
                .hass=${this.hass}
                @tdc-created=${() => {
			this.creating = !1, this.reload();
		}}
              ></tdc-creation-wizard>` : v}
      </tdc-dialog>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr("duplicate")}
        ?open=${this.duplicating !== void 0}
        @tdc-close=${() => this.duplicating = void 0}
      >
        ${this.duplicating ? g`<tdc-duplicate-dialog
                .hass=${this.hass}
                .device=${this.duplicating}
                @tdc-created=${() => {
			this.duplicating = void 0, this.refresh();
		}}
              ></tdc-duplicate-dialog>` : v}
      </tdc-dialog>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr("tplManage")}
        ?open=${this.templating}
        @tdc-close=${() => this.templating = !1}
      >
        ${this.templating ? g`<tdc-template-manager .hass=${this.hass}></tdc-template-manager>` : v}
      </tdc-dialog>
    `;
	}
	render() {
		return this.loaded ? g`
      ${this.renderNew()} ${this.error ? g`<p class="error">${this.error}</p>` : ""}
      ${this.total === 0 ? "" : this.renderFilter()}
      ${this.total === 0 ? g`<p>${this.tr("noDevices")}</p>` : this.matched === 0 ? g`<p>${this.tr("noMatches")}</p>` : g`<table class="cards">
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
                    ${qt(this.devices, (e) => e.id, (e) => this.renderRow(e))}
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
    ` : g`${this.tr("loading")}`;
	}
};
A([C()], U.prototype, "devices", void 0), A([C()], U.prototype, "total", void 0), A([C()], U.prototype, "matched", void 0), A([C()], U.prototype, "offset", void 0), A([C()], U.prototype, "loaded", void 0), A([C()], U.prototype, "templating", void 0), A([C()], U.prototype, "duplicating", void 0), A([C()], U.prototype, "facets", void 0), A([C()], U.prototype, "filter", void 0), U = A([x("tdc-device-list")], U);
// src/group/group-form.ts
var W = class extends j {
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
		this.dispatchEvent(new CustomEvent(pt, {
			detail: {
				name: this.name.trim(),
				members: this.members
			},
			bubbles: !0,
			composed: !0
		}));
	}
	render() {
		return g`
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
          ${this.devices.length === 0 ? g`<small>${this.tr("grpNoDevices")}</small>` : v}
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
A([S({ attribute: !1 })], W.prototype, "devices", void 0), A([S({ attribute: !1 })], W.prototype, "group", void 0), A([S()], W.prototype, "submitLabel", void 0), A([S({ type: Boolean })], W.prototype, "busy", void 0), A([C()], W.prototype, "name", void 0), A([C()], W.prototype, "members", void 0), W = A([x("tdc-group-form")], W);
// src/group/group-panel.ts
var ki = 3, Ai = "z2m", ji = class extends P {
	constructor(...e) {
		super(...e), this.groups = [], this.devices = [];
	}
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
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			[this.groups, this.devices] = await Promise.all([this.api.groups(), this.api.deviceNames()]);
		} catch (e) {
			this.error = T(e);
		}
	}
	members() {
		return this.devices.filter((e) => e.output === Ai).map((e) => ({
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
		return this.newPopup(this.tr("grpNew"), g`<tdc-group-form
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
		return g`<tr class="group card" @click=${() => this.toggle(e.id)}>
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
      ${t ? this.editRow(ki, e.id, g`<tdc-group-form
                .hass=${this.hass}
                .devices=${this.members()}
                .group=${e}
                ?busy=${this.busy}
              ></tdc-group-form>`, (t) => void this.save(e, t)) : v}`;
	}
	render() {
		return g`
      ${this.renderNew()}
      ${this.groups.length === 0 ? g`<p>${this.tr("grpNone")}</p>` : g`<table class="cards">
              <tr>
                <th>${this.tr("colName")}</th>
                <th>${this.tr("grpMembers")}</th>
                <th>${this.tr("colActions")}</th>
              </tr>
              ${qt(this.groups, (e) => e.id, (e) => this.renderRow(e))}
            </table>`}
      <p class="error">${this.error}</p>
    `;
	}
};
A([C()], ji.prototype, "groups", void 0), A([C()], ji.prototype, "devices", void 0), A([Ze("tdc-group-form#new")], ji.prototype, "newForm", void 0), ji = A([x("tdc-group-panel")], ji);
function Mi(e) {
	return Math.min(365, Math.max(1, Math.round(e) || 1));
}
function Ni(e, t) {
	let [n, ...r] = (t.length ? e.filter((e) => t.includes(e.id)) : e).map((e) => {
		let t = /* @__PURE__ */ new Map();
		for (let n of e.entities) {
			let e = n.shape;
			n.platform === "sensor" && n.state_class && e && !On(e) && t.set(n.key, {
				key: n.key,
				name: n.name
			});
		}
		return t;
	});
	return n ? [...n.values()].filter((e) => r.every((t) => t.has(e.key))) : [];
}
// src/history/history-panel.ts
var Pi = 7, G = class extends j {
	constructor(...e) {
		super(...e), this.days = Pi, this.chosen = [], this.entity = "", this.devices = [], this.busy = !1, this.message = "", this.error = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.loadDevices();
	}
	async loadDevices() {
		try {
			this.devices = await this.api.deviceNames();
		} catch (e) {
			this.error = T(e);
		}
	}
	pick(e) {
		this.chosen = e, Ni(this.devices, e).some((e) => e.key === this.entity) || (this.entity = "");
	}
	async importHistory() {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let e = await this.api.importHistory(Mi(this.days), this.chosen.length > 1 ? this.chosen : this.chosen[0], this.entity || void 0);
			this.message = this.tr("histDone", { ...e });
		} catch (e) {
			this.error = T(e);
		}
		this.busy = !1;
	}
	renderChoice(e, t, n, r) {
		let i = k(this.hass?.language, t, (e) => e.label);
		return g`<label
      >${e}
      <select @change=${(e) => r(e.target.value)}>
        <option value="" ?selected=${n === ""}>${this.tr("histAll")}</option>
        ${i.map((e) => g`<option value=${e.value} ?selected=${e.value === n}>
              ${e.label}
            </option>`)}
      </select>
    </label>`;
	}
	render() {
		let e = this.hass?.language, t = this.devices.map((e) => ({
			value: e.id,
			label: e.name
		})), n = Ni(this.devices, this.chosen).map((t) => ({
			value: t.key,
			label: Ot(e, t.key, t.name)
		}));
		return g`
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
A([C()], G.prototype, "days", void 0), A([C()], G.prototype, "chosen", void 0), A([C()], G.prototype, "entity", void 0), A([C()], G.prototype, "devices", void 0), A([C()], G.prototype, "busy", void 0), A([C()], G.prototype, "message", void 0), A([C()], G.prototype, "error", void 0), G = A([x("tdc-history-panel")], G);
// src/common/targets.ts
var Fi = 1e3;
function Ii(e) {
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
function Li(e) {
	let t = /* @__PURE__ */ new Date(e * Fi), n = (e) => String(e).padStart(2, "0");
	return `${`${t.getFullYear()}-${n(t.getMonth() + 1)}-${n(t.getDate())}`} ${n(t.getHours())}:${n(t.getMinutes())}`;
}
function Ri(e, t, n) {
	return `${Li(e.created)} · ${O(t, e.template, e.model)} · ${n(e.count)}`;
}
function zi(e, t, n, r, i) {
	return k(r, e === "device" ? t.map((e) => ({
		value: e.id,
		label: e.name
	})) : e === "template" ? n.map((e) => ({
		value: e.id,
		label: O(r, e.id, e.name)
	})) : Ii(t).map((e) => ({
		value: e.id,
		label: Ri(e, r, i)
	})), (e) => e.label);
}
function Bi(e, t, n, r, i, a) {
	return e === "device" ? n.find((e) => e.id === t || e.name === t)?.name ?? t : zi(e, n, r, i, a).find((e) => e.value === t)?.label ?? t;
}
function Vi(e, t, n) {
	return e === "device" ? n.find((e) => e.id === t || e.name === t)?.id ?? t : t;
}
// src/common/target-select.ts
var Hi = {
	device: "schTarget_device",
	template: "schTarget_template",
	run: "schTarget_run"
}, K = class extends j {
	constructor(...e) {
		super(...e), this.kind = Qe, this.values = [], this.multiple = !1, this.templates = [], this.devices = [], this.error = "";
	}
	willUpdate(e) {
		e.has("kind") && this.kind !== "template" && this.loadDevices(), super.willUpdate(e);
	}
	async loadDevices() {
		try {
			this.devices = await this.api.deviceNames(), this.error = "";
		} catch (e) {
			this.error = T(e);
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
		return zi(this.kind, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e }));
	}
	renderSingle(e, t) {
		let n = t === "" || e.some((e) => e.value === t);
		return g`<select
      ?disabled=${e.length === 1}
      @change=${(e) => {
			let t = e.target.value;
			this.emit(t ? [t] : []);
		}}
    >
      ${e.length === 1 ? "" : g`<option value="" ?selected=${t === ""}>${this.tr("pickOne")}</option>`}
      ${n ? "" : g`<option value=${t} selected>${t}</option>`}
      ${e.map((e) => g`<option value=${e.value} ?selected=${e.value === t}>
            ${e.label}
          </option>`)}
    </select>`;
	}
	render() {
		let e = this.options(), t = this.values.map((e) => Vi(this.kind, e, this.devices));
		return g`<label>
      ${this.tr(Hi[this.kind])}
      ${this.multiple && this.kind === "device" ? g`<tdc-multi-select
              .hass=${this.hass}
              .items=${e}
              .selected=${t}
              empty=${this.tr("pickOne")}
              @tdc-select-change=${(e) => this.emit(e.detail)}
            ></tdc-multi-select>` : this.renderSingle(e, t[0] ?? "")}
      ${this.error ? g`<small class="error">${this.error}</small>` : ""}
    </label>`;
	}
};
A([S()], K.prototype, "kind", void 0), A([S({ attribute: !1 })], K.prototype, "values", void 0), A([S({ type: Boolean })], K.prototype, "multiple", void 0), A([S({ attribute: !1 })], K.prototype, "templates", void 0), A([C()], K.prototype, "devices", void 0), A([C()], K.prototype, "error", void 0), K = A([x("tdc-target-select")], K);
// src/removal/removal-panel.ts
var Ui = 20, Wi = {
	all: "targetAll",
	device: "targetDevice",
	run: "targetRun"
}, q = class extends j {
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
			this.plan = void 0, this.error = T(e);
		}
	}
	async confirm() {
		this.busy = !0;
		try {
			let e = await this.api.removalRun(this.target, this.targetId || void 0);
			this.message = this.tr("removed", { count: e.devices + e.orphans }), this.plan = void 0;
		} catch (e) {
			this.error = T(e);
		}
		this.busy = !1;
	}
	async scanTopics() {
		this.message = "", this.error = "", this.busy = !0;
		try {
			this.leftover = (await this.api.orphanTopics()).topics;
		} catch (e) {
			this.leftover = void 0, this.error = T(e);
		}
		this.busy = !1;
	}
	async deleteLeftover() {
		this.busy = !0;
		try {
			let e = await this.api.clearOrphanTopics(this.leftover ?? []);
			this.message = this.tr("leftoverDeleted", { count: e.cleared.length }), this.leftover = void 0;
		} catch (e) {
			this.error = T(e);
		}
		this.busy = !1;
	}
	renderLeftover(e) {
		return e.length === 0 ? g`<p>${this.tr("leftoverNone")}</p>` : g`<p>${this.tr("leftoverTopics", { count: e.length })}</p>
      <p>
        <small
          >${e.slice(0, Ui).join(", ")}${e.length > Ui ? " …" : ""}</small
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
		return e.devices.length + e.orphans.length === 0 && e.runs.length === 0 ? g`<p>${this.tr("planNothing")}</p>` : g`<ul>
        <li>${this.tr("planDevices", { count: e.devices.length })}</li>
        ${e.groups.length ? g`<li>${this.tr("planGroups", { count: e.groups.length })}</li>` : ""}
        ${e.topics.length ? g`<li>${this.tr("planTopics", { count: e.topics.length })}</li>` : ""}
        ${e.statistics.length ? g`<li>${this.tr("planStatistics", { count: e.statistics.length })}</li>` : ""}
        ${e.scenarios.length ? g`<li>${this.tr("planScenarios", { count: e.scenarios.length })}</li>` : ""}
        ${e.schedules.length ? g`<li>${this.tr("planSchedules", { count: e.schedules.length })}</li>` : ""}
        ${e.orphans.length ? g`<li>${this.tr("planOrphans", { count: e.orphans.length })}</li>` : ""}
        ${e.areas.length ? g`<li>${this.tr("planAreas", { names: e.areas.join(", ") })}</li>` : ""}
      </ul>
      <p>
        <small
          >${e.devices.slice(0, Ui).map((e) => e.name).join(", ")}${e.devices.length > Ui ? " …" : ""}</small
        >
      </p>
      ${e.in_use.length ? g`<p class="error">${this.tr("inUseWarning")}</p>
              <ul>
                ${e.in_use.map((e) => g`<li>
                      ${e.device}:
                      ${oi(e.usage).map((e) => `${this.tr(`use_${e.kind}`)} ${e.name}`).join(", ")}
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
		return g`
      <div class="fields bottom">
        <label
          >${this.tr("target")}
          <select
            @change=${(e) => {
			this.target = e.target.value, this.plan = void 0;
		}}
          >
            ${k(this.hass?.language, Object.keys(Wi), (e) => this.tr(Wi[e])).map((e) => g`<option value=${e} ?selected=${this.target === e}>
                  ${this.tr(Wi[e])}
                </option>`)}
          </select>
        </label>
        ${this.target === "all" ? "" : g`<tdc-target-select
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
      ${this.plan ? g`<div class="plan">${this.renderPlan(this.plan)}</div>` : ""}
      ${this.leftover ? g`<div class="plan">${this.renderLeftover(this.leftover)}</div>` : ""}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
A([S()], q.prototype, "target", void 0), A([S()], q.prototype, "targetId", void 0), A([C()], q.prototype, "plan", void 0), A([C()], q.prototype, "busy", void 0), A([C()], q.prototype, "leftover", void 0), A([C()], q.prototype, "message", void 0), A([C()], q.prototype, "error", void 0), q = A([x("tdc-removal-panel")], q);
// src/schedule/helpers.ts
var Gi = 60, Ki = 3, qi = 24, Ji = 16;
function Yi() {
	return {
		type: w,
		times: "08:00, 18:30",
		weekdays: [],
		everyS: Gi,
		start: "00:00",
		end: "24:00",
		at: "",
		count: Ki,
		perDay: qi
	};
}
function Xi(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function Zi(e) {
	switch (e.type) {
		case w: return e.weekdays.length ? {
			type: w,
			times: Xi(e.times),
			weekdays: [...e.weekdays].sort()
		} : {
			type: w,
			times: Xi(e.times)
		};
		case et: return {
			type: et,
			every_s: e.everyS,
			start: e.start,
			end: e.end
		};
		case tt: return {
			type: tt,
			at: e.at
		};
		case nt: return {
			type: nt,
			count: e.count,
			start: e.start,
			end: e.end
		};
		case rt: return {
			type: rt,
			per_day: e.perDay
		};
	}
}
function Qi(e, t) {
	switch (e) {
		case "all": return { all: !0 };
		case $e: return { template: t[0] ?? "" };
		case Qe: return { device: t.length === 1 ? t[0] : t };
		case "run": return { run: t[0] ?? "" };
	}
}
function $i(e) {
	return "template" in e ? {
		kind: $e,
		ids: [e.template]
	} : "device" in e ? {
		kind: Qe,
		ids: typeof e.device == "string" ? [e.device] : e.device
	} : "run" in e ? {
		kind: "run",
		ids: [e.run]
	} : {
		kind: "all",
		ids: []
	};
}
function ea(e) {
	switch (e.type) {
		case w: return e.times.join(", ");
		case et: return `${e.every_s} s (${e.start}–${e.end})`;
		case tt: return e.at.replace("T", " ");
		case nt: return `${e.count}× ${e.start}–${e.end}`;
		case rt: return `Ø ${e.per_day}/d`;
	}
}
function ta(e) {
	return e.slice(0, Ji).replace("T", " ");
}
function na(e) {
	return [...new Set(Object.values(e).flat())];
}
function ra(e) {
	return {
		kind: "all",
		targetIds: [],
		action: na(e)[0] ?? "",
		entity: ""
	};
}
function ia(e, t, n, r) {
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
function aa(e, t) {
	let n = na(e);
	if (!t) return [];
	let r = t.map((t) => new Set(Object.entries(e).filter(([e]) => t.has(e)).flatMap(([, e]) => e)));
	return n.filter((e) => r.every((t) => t.has(e)));
}
function oa(e, t, n, r, i, a) {
	let o = t.length === 1 ? e === "template" ? r.find((e) => e.id === t[0])?.entities ?? [] : e === "device" ? n.find((e) => e.id === t[0] || e.name === t[0])?.entities ?? [] : [] : [], s = new Set(Object.entries(i).filter(([, e]) => e.includes(a)).map(([e]) => e));
	return o.filter((e) => s.has(e.platform)).map(({ key: e, name: t }) => ({
		key: e,
		name: t
	}));
}
function sa(e) {
	return {
		target: Qi(e.kind, e.targetIds),
		entity: e.entity,
		action: e.action
	};
}
function ca(e) {
	let t = {
		...Yi(),
		type: e.type
	};
	switch (e.type) {
		case w: return {
			...t,
			times: e.times.join(", "),
			weekdays: e.weekdays ?? []
		};
		case et: return {
			...t,
			everyS: e.every_s,
			start: e.start,
			end: e.end
		};
		case tt: return {
			...t,
			at: e.at
		};
		case nt: return {
			...t,
			count: e.count,
			start: e.start,
			end: e.end
		};
		case rt: return {
			...t,
			perDay: e.per_day
		};
	}
}
function la(e) {
	let { kind: t, ids: n } = $i(e.target);
	return {
		kind: t,
		targetIds: n,
		action: e.action,
		entity: e.entity
	};
}
// src/schedule/work-picker.ts
var ua = [
	"all",
	$e,
	Qe,
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
			this.error = T(e);
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
		let e = this.hass?.language, t = ia(this.work.kind, this.work.targetIds, this.devices, this.templates);
		return k(e, aa(this.actions, t), (t) => D(e, t));
	}
	entities() {
		let e = oa(this.work.kind, this.work.targetIds, this.devices, this.templates, this.actions, this.work.action);
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
		return t.length === 0 ? g`<label
        >${this.tr("schAction")}
        <select disabled>
          <option>${this.tr("pickOne")}</option>
        </select>
      </label>` : this.select(this.tr("schAction"), t, this.work.action, (t) => D(e, t), (e) => this.emit({
			action: e,
			entity: ""
		}));
	}
	renderEntity(e, t) {
		let n = k(t, e, (e) => Ot(t, e.key, e.name));
		return g`<label
      >${this.tr("schEntity")}
      <select @change=${(e) => this.emit({ entity: e.target.value })}>
        <option value="" ?selected=${!this.work.entity}>${this.tr("schAllFitting")}</option>
        ${n.map((e) => g`<option value=${e.key} ?selected=${e.key === this.work.entity}>
              ${Ot(t, e.key, e.name)}
            </option>`)}
      </select>
    </label>`;
	}
	render() {
		let e = this.hass?.language, t = this.entities();
		return g`
      <div class="fields">
        ${this.select(this.tr("schTarget"), ua, this.work.kind, (e) => this.tr(`schTarget_${e}`), (e) => this.emit({
			kind: e,
			targetIds: [],
			entity: ""
		}))}
        ${this.work.kind === "all" ? v : g`<tdc-target-select
                .hass=${this.hass}
                kind=${this.work.kind}
                ?multiple=${this.work.kind === Qe}
                .values=${this.work.targetIds}
                .templates=${this.templates}
                @tdc-target-change=${(e) => this.emit({
			targetIds: e.detail,
			entity: ""
		})}
              ></tdc-target-select>`}
        ${t.length ? this.renderEntity(t, e) : v}
      </div>
      <div class="fields">${this.renderAction(e)}</div>
      ${this.error ? g`<p class="error">${this.error}</p>` : v}
    `;
	}
};
A([S({ attribute: !1 })], J.prototype, "work", void 0), A([S({ attribute: !1 })], J.prototype, "actions", void 0), A([S({ attribute: !1 })], J.prototype, "templates", void 0), A([C()], J.prototype, "devices", void 0), A([C()], J.prototype, "loaded", void 0), A([C()], J.prototype, "error", void 0), J = A([x("tdc-work-picker")], J);
// src/scenario/helpers.ts
function da(e) {
	return {
		afterS: 0,
		work: ra(e),
		params: ""
	};
}
function fa(e) {
	if (e.trim() === "") return {};
	try {
		let t = JSON.parse(e);
		return typeof t == "object" && t && !Array.isArray(t) ? t : void 0;
	} catch {
		return;
	}
}
function pa(e) {
	let t = [];
	for (let n of e) {
		let e = fa(n.params);
		if (e === void 0) return;
		t.push({
			after_s: Math.max(0, n.afterS || 0),
			...sa(n.work),
			params: e
		});
	}
	return t;
}
function ma(e) {
	return {
		afterS: e.after_s,
		work: la(e),
		params: Object.keys(e.params).length ? JSON.stringify(e.params) : ""
	};
}
// src/scenario/scenario-form.ts
var Y = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.submitLabel = "", this.busy = !1, this.name = "", this.steps = [], this.error = "";
	}
	willUpdate(e) {
		let t = this.info?.actions;
		this.scenario && t && this.loadedId !== this.scenario.id ? (this.loadedId = this.scenario.id, this.name = this.scenario.name, this.steps = this.scenario.steps.map(ma)) : !this.scenario && t && this.steps.length === 0 && (this.steps = [da(t)]), super.willUpdate(e);
	}
	reset() {
		this.name = "", this.error = "", this.steps = [da(this.info?.actions ?? {})];
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
		let e = pa(this.steps);
		e ? (this.error = "", this.dispatchEvent(new CustomEvent(pt, {
			detail: {
				name: this.name,
				steps: e
			},
			bubbles: !0,
			composed: !0
		}))) : this.error = this.tr("scnBadParams");
	}
	renderStep(e, t) {
		return g`<fieldset>
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
		return g`
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
			extra: g`<button
          @click=${() => this.steps = [...this.steps, da(this.info?.actions ?? {})]}
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
var ha = 3, ga = class extends P {
	constructor(...e) {
		super(...e), this.scenarios = [];
	}
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
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			this.scenarios = await this.api.scenarios();
		} catch (e) {
			this.error = T(e);
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
	renderNew() {
		return this.newPopup(this.tr("scnNew"), g`<tdc-scenario-form
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
		let t = e.steps[0], { kind: n } = t ? $i(t.target) : { kind: "all" }, r = this.hass?.language, i = this.expanded.has(e.id);
		return g`<tr class="scenario card" @click=${() => this.toggle(e.id)}>
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
      ${i ? this.editRow(ha, e.id, g`<tdc-scenario-form
                .scenario=${e}
                .hass=${this.hass}
                ?busy=${this.busy}
                .templates=${this.templates}
                .info=${this.info}
              ></tdc-scenario-form>`, (t) => void this.save(e, t)) : v}`;
	}
	render() {
		return g`
      ${this.renderNew()}
      ${this.scenarios.length === 0 ? g`<p>${this.tr("scnNone")}</p>` : g`<table class="cards">
              <tr>
                <th>${this.tr("schName")}</th>
                <th>${this.tr("scnSteps")}</th>
                <th>${this.tr("colActions")}</th>
              </tr>
              ${qt(this.scenarios, (e) => e.id, (e) => this.renderRow(e))}
            </table>`}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
A([C()], ga.prototype, "scenarios", void 0), A([Ze("tdc-scenario-form#new")], ga.prototype, "newForm", void 0), ga = A([x("tdc-scenario-panel")], ga);
// src/schedule/schedule-form.ts
var _a = [
	w,
	et,
	tt,
	nt,
	rt
], va = [
	"weekdayMon",
	"weekdayTue",
	"weekdayWed",
	"weekdayThu",
	"weekdayFri",
	"weekdaySat",
	"weekdaySun"
], X = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.scenarios = [], this.submitLabel = "", this.busy = !1, this.name = "", this.scenarioId = "", this.work = ra({}), this.seed = "", this.form = Yi(), this.started = !1;
	}
	willUpdate(e) {
		let t = this.info?.actions;
		this.schedule && t && this.loadedId !== this.schedule.id ? (this.loadedId = this.schedule.id, this.name = this.schedule.name, this.scenarioId = this.schedule.scenario ?? "", this.work = la(this.schedule), this.form = ca(this.schedule.trigger)) : !this.schedule && t && !this.started && (this.started = !0, this.work = ra(t)), super.willUpdate(e);
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
		let e = this.scenarioId ? { scenario: this.scenarioId } : sa(this.work), t = this.schedule && "action" in e && e.action === this.schedule.action;
		return {
			name: this.name,
			...e,
			trigger: Zi(this.form),
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
		this.dispatchEvent(new CustomEvent(pt, {
			detail: this.request(),
			bubbles: !0,
			composed: !0
		}));
	}
	field(e, t, n = "text") {
		let r = n === "number";
		return g`<label style="flex: 1 1 140px"
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
		return g`<div class="row wide">
      ${va.map((e, t) => g`<label style="flex-direction: row; align-items: center">
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
			case w: return g`${this.field(this.tr("schTimes"), w)} ${this.renderWeekdays()}`;
			case et: return g`${this.field(this.tr("schEveryS"), "everyS", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case tt: return this.field(this.tr("schAt"), "at", "datetime-local");
			case nt: return g`${this.field(this.tr("schCount"), "count", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case rt: return this.field(this.tr("schPerDay"), "perDay", "number");
		}
	}
	render() {
		return g`
      <div class="fields">
        ${this.textField(this.tr("schName"), this.name, (e) => this.name = e)}
      </div>
      <div class="fields">
        ${this.select(this.tr("schTrigger"), _a, this.form.type, (e) => this.tr(`schTrigger_${e}`), (e) => this.setForm({ type: e }))}
        ${this.select(this.tr("schRuns"), ["", ...this.scenarios.map((e) => e.id)], this.scenarioId, (e) => e ? this.tr("schScenario", { id: this.scenarioName(e) }) : this.tr("schRunsAction"), (e) => this.scenarioId = e)}
      </div>
      ${this.scenarioId ? v : g`<tdc-work-picker
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
var ya = 6, ba = 24, xa = 50, Z = class extends P {
	constructor(...e) {
		super(...e), this.schedules = [], this.runs = [], this.scenarios = [], this.devices = [], this.previewOpen = !1;
	}
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
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			[this.schedules, this.runs, this.scenarios, this.devices] = await Promise.all([
				this.api.schedules(),
				this.api.schedulePreview(ba),
				this.api.scenarios(),
				this.api.deviceNames()
			]), this.error = "";
		} catch (e) {
			this.error = T(e);
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
		return e === "all" ? n : `${n}: ${t.map((t) => Bi(e, t, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e }))).join(", ")}`;
	}
	renderNew() {
		return this.newPopup(this.tr("schNew"), g`<tdc-schedule-form
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
		let { kind: t, ids: n } = $i(e.target), r = this.hass?.language, i = this.expanded.has(e.id);
		return g`<tr class="schedule card" @click=${() => this.toggle(e.id)}>
        ${this.nameCell(e.id, e.name)}
        <td data-label=${this.tr("schTarget")}>
          ${e.scenario ? "–" : this.targetText(t, n)}
        </td>
        <td data-label=${this.tr("schAction")}>
          ${e.scenario ? this.tr("schScenario", { id: this.scenarioName(e.scenario) }) : Dt(r, e.entity, e.action)}
        </td>
        <td data-label=${this.tr("schTrigger")}>
          ${this.tr(`schTrigger_${e.trigger.type}`)}<br /><small
            >${ea(e.trigger)}</small
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
      ${i ? this.editRow(ya, e.id, g`<tdc-schedule-form
                .hass=${this.hass}
                .info=${this.info}
                .templates=${this.templates}
                .scenarios=${this.scenarios}
                .schedule=${e}
                ?busy=${this.busy}
              ></tdc-schedule-form>`, (t) => void this.save(e, t)) : v}`;
	}
	renderList() {
		return this.schedules.length === 0 ? g`<p>${this.tr("schNone")}</p>` : g`<table class="cards">
      <tr>
        <th>${this.tr("schName")}</th>
        <th>${this.tr("schTarget")}</th>
        <th>${this.tr("schAction")}</th>
        <th>${this.tr("schTrigger")}</th>
        <th>${this.tr("schEnabled")}</th>
        <th>${this.tr("colActions")}</th>
      </tr>
      ${qt(this.schedules, (e) => e.id, (e) => this.renderRow(e))}
    </table>`;
	}
	actionCount() {
		let e = this.runs.length;
		return this.tr(e === 1 ? "schActionOne" : "schActions", { count: e });
	}
	renderPreview() {
		return this.runs.length === 0 ? g`<p><small>${this.tr("schNoRuns")}</small></p>` : g`<table>
        <tr>
          <th>${this.tr("schWhen")}</th>
          <th>${this.tr("schName")}</th>
        </tr>
        ${this.runs.slice(0, xa).map((e) => g`<tr>
              <td>${ta(e.when)}</td>
              <td>${e.name}</td>
            </tr>`)}
      </table>
      ${this.runs.length > xa ? g`<p>
              <small>${this.tr("schMoreRuns", { count: this.runs.length - xa })}</small>
            </p>` : v}`;
	}
	render() {
		return g`
      ${this.renderNew()}
      <details
        class="section"
        ?open=${this.previewOpen}
        @toggle=${(e) => this.previewOpen = e.target.open}
      >
        <summary>
          ${this.tr("schPreview", { hours: ba })} · ${this.actionCount()}
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
var Sa = [
	"devices",
	"templates",
	"schedules",
	"scenarios",
	"groups"
], Ca = {
	devices: "trfDevices",
	templates: "trfTemplates",
	schedules: "trfSchedules",
	scenarios: "trfScenarios",
	groups: "trfGroups"
};
function wa(e) {
	return Sa.filter((t) => t !== "groups" || e);
}
function Ta(e) {
	let t = (e) => String(e).padStart(2, "0");
	return `tdc-export-${`${e.getFullYear()}${t(e.getMonth() + 1)}${t(e.getDate())}`}-${t(e.getHours())}${t(e.getMinutes())}.json`;
}
function Ea(e, t) {
	let n = {
		format_version: 0,
		integration_version: "",
		exported_at: t
	};
	for (let t of Sa) {
		let r = e[t];
		r && (n.format_version = r[0]?.format_version ?? n.format_version, n.integration_version = r[0]?.integration_version ?? n.integration_version, n[t] = r.flatMap((e) => e.items));
	}
	return n;
}
// src/transfer/transfer-panel.ts
var Q = class extends j {
	constructor(...e) {
		super(...e), this.mqtt = !1, this.counts = {}, this.chosen = /* @__PURE__ */ new Set(), this.busy = !1, this.message = "", this.error = "";
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
			let e = await Promise.all(wa(!0).map(async (e) => [e, (await this.api.transferExport(e, 0, 0)).total]));
			this.counts = Object.fromEntries(e);
		} catch (e) {
			this.error = T(e);
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
			for (let n of wa(this.mqtt)) this.chosen.has(n) && (e[n] = await this.api.transferExportAll(n), t += e[n].reduce((e, t) => e + t.items.length, 0));
			let n = /* @__PURE__ */ new Date(), r = Ta(n);
			this.download(r, JSON.stringify(Ea(e, n.toISOString()), null, 2)), this.message = this.tr("trfExported", {
				name: r,
				count: t
			});
		} catch (e) {
			this.error = T(e);
		}
		this.busy = !1;
	}
	renderChoice(e) {
		let t = this.counts[e] ?? 0;
		return g`<label class="choice">
      <input
        type="checkbox"
        .checked=${this.chosen.has(e)}
        ?disabled=${t === 0}
        @change=${() => this.chosen = Nt(this.chosen, e)}
      />
      ${this.tr(Ca[e])} (${t})
    </label>`;
	}
	render() {
		let e = wa(this.mqtt).filter((e) => this.chosen.has(e) && (this.counts[e] ?? 0) > 0);
		return g`
      <p>${this.tr("trfIntro")}</p>
      <section>
        <h3>${this.tr("trfExportTitle")}</h3>
        <fieldset>
          ${wa(this.mqtt).map((e) => this.renderChoice(e))}
        </fieldset>
        <p class="row">
          <button
            class="primary"
            ?disabled=${this.busy || e.length === 0}
            @click=${() => void this.exportChosen()}
          >
            ${this.tr("trfExport")}
          </button>
          ${e.length === 0 ? g`<small>${this.tr("trfNothing")}</small>` : ""}
        </p>
        <p>${this.message}<span class="error">${this.error}</span></p>
      </section>
    `;
	}
};
A([S({ type: Boolean })], Q.prototype, "mqtt", void 0), A([C()], Q.prototype, "counts", void 0), A([C()], Q.prototype, "chosen", void 0), A([C()], Q.prototype, "busy", void 0), A([C()], Q.prototype, "message", void 0), A([C()], Q.prototype, "error", void 0), Q = A([x("tdc-transfer-panel")], Q);
// src/panel.ts
var $ = class extends j {
	constructor(...e) {
		super(...e), this.narrow = !1, this.tab = dt, this.removeTarget = "all", this.removeId = "", this.lapse = 1, this.mqtt = !1;
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
		!this.mqtt && this.tab === "groups" && (this.tab = dt);
	}
	startRemoval(e) {
		this.removeTarget = e.detail.target, this.removeId = e.detail.id, this.tab = "remove";
	}
	renderTab(e, t) {
		return g`<button
      class=${this.tab === e ? "active" : ""}
      @click=${() => {
			this.tab = e, this.loadInfo();
		}}
    >
      ${t}
    </button>`;
	}
	render() {
		return g`
      <header>
        <h2>${this.tr("title")}</h2>
        <span class="badge">${this.tr("badge")}</span>
        ${this.lapse > 1 ? g`<span class="badge">${this.tr("badgeLapse", { factor: this.lapse })}</span>` : ""}
      </header>
      <nav>
        ${this.renderTab(dt, this.tr("tabDevices"))}
        ${this.renderTab("schedules", this.tr("tabSchedules"))}
        ${this.renderTab("scenarios", this.tr("tabScenarios"))}
        ${this.mqtt ? this.renderTab(ft, this.tr("tabGroups")) : ""}
        ${this.renderTab("history", this.tr("tabHistory"))}
        ${this.renderTab("remove", this.tr("tabRemove"))}
        ${this.renderTab("transfer", this.tr("tabTransfer"))}
      </nav>
      ${this.tab === "devices" ? g`<tdc-device-list
              .hass=${this.hass}
              @tdc-remove=${this.startRemoval}
            ></tdc-device-list>` : ""}
      ${this.tab === "schedules" ? g`<tdc-schedule-panel .hass=${this.hass}></tdc-schedule-panel>` : ""}
      ${this.tab === "scenarios" ? g`<tdc-scenario-panel .hass=${this.hass}></tdc-scenario-panel>` : ""}
      ${this.tab === "groups" ? g`<tdc-group-panel .hass=${this.hass}></tdc-group-panel>` : ""}
      ${this.tab === "history" ? g`<tdc-history-panel .hass=${this.hass}></tdc-history-panel>` : ""}
      ${this.tab === "remove" ? g`<tdc-removal-panel
              .hass=${this.hass}
              .target=${this.removeTarget}
              .targetId=${this.removeId}
            ></tdc-removal-panel>` : ""}
      ${this.tab === "transfer" ? g`<tdc-transfer-panel .hass=${this.hass} .mqtt=${this.mqtt}></tdc-transfer-panel>` : ""}
    `;
	}
};
A([S({ type: Boolean })], $.prototype, "narrow", void 0), A([C()], $.prototype, "tab", void 0), A([C()], $.prototype, "removeTarget", void 0), A([C()], $.prototype, "removeId", void 0), A([C()], $.prototype, "lapse", void 0), A([C()], $.prototype, "mqtt", void 0), $ = A([x("hass-test-data-creator-panel")], $);
export { $ as TdcPanel };
