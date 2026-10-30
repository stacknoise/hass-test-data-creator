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
var ue = globalThis, de = (e) => e, fe = ue.trustedTypes, pe = fe ? fe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, me = "$lit$", m = `lit$${Math.random().toFixed(9).slice(2)}$`, he = "?" + m, ge = `<${he}>`, _e = document, ve = () => _e.createComment(""), ye = (e) => e === null || typeof e != "object" && typeof e != "function", be = Array.isArray, xe = (e) => be(e) || typeof e?.[Symbol.iterator] == "function", Se = "[ 	\n\f\r]", Ce = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, we = /-->/g, Te = />/g, Ee = RegExp(`>|${Se}(?:([^\\s"'>=/]+)(${Se}*=${Se}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), De = /'/g, Oe = /"/g, ke = /^(?:script|style|textarea|title)$/i, Ae = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), h = Ae(1), je = Ae(2), g = Symbol.for("lit-noChange"), _ = Symbol.for("lit-nothing"), Me = /* @__PURE__ */ new WeakMap(), v = _e.createTreeWalker(_e, 129);
function Ne(e, t) {
	if (!be(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return pe === void 0 ? t : pe.createHTML(t);
}
var Pe = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Ce;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, ee = 0;
		for (; ee < n.length && (o.lastIndex = ee, c = o.exec(n), c !== null);) ee = o.lastIndex, o === Ce ? c[1] === "!--" ? o = we : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = Ee) : (ke.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = Ee) : o = Te : o === Ee ? c[0] === ">" ? (o = i ?? Ce, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? Ee : c[3] === "\"" ? Oe : De) : o === Oe || o === De ? o = Ee : o === we || o === Te ? o = Ce : (o = Ee, i = void 0);
		let u = o === Ee && e[t + 1].startsWith("/>") ? " " : "";
		a += o === Ce ? n + ge : l >= 0 ? (r.push(s), n.slice(0, l) + me + n.slice(l) + m + u) : n + m + (l === -2 ? t : u);
	}
	return [Ne(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Fe = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, ee] = Pe(t, n);
		if (this.el = e.createElement(l, r), v.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = v.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(me)) {
					let t = ee[o++], n = i.getAttribute(e).split(m), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Be : r[1] === "?" ? Ve : r[1] === "@" ? He : ze
					}), i.removeAttribute(e);
				} else e.startsWith(m) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (ke.test(i.tagName)) {
					let e = i.textContent.split(m), t = e.length - 1;
					if (t > 0) {
						i.textContent = fe ? fe.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], ve()), v.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], ve());
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
		let n = _e.createElement("template");
		return n.innerHTML = e, n;
	}
};
function Ie(e, t, n = e, r) {
	if (t === g) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = ye(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = Ie(e, i._$AS(e, t.values), i, r)), t;
}
var Le = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? _e).importNode(t, !0);
		v.currentNode = r;
		let i = v.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Re(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Ue(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = v.nextNode(), a++);
		}
		return v.currentNode = _e, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Re = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = _, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = Ie(this, e, t), ye(e) ? e === _ || e == null || e === "" ? (this._$AH !== _ && this._$AR(), this._$AH = _) : e !== this._$AH && e !== g && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? xe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== _ && ye(this._$AH) ? this._$AA.nextSibling.data = e : this.T(_e.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Fe.createElement(Ne(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Le(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Me.get(e.strings);
		return t === void 0 && Me.set(e.strings, t = new Fe(e)), t;
	}
	k(t) {
		be(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(ve()), this.O(ve()), this, this.options)) : r = n[i], r._$AI(a), i++;
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
}, ze = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = _, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = _;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = Ie(this, e, t, 0), a = !ye(e) || e !== this._$AH && e !== g, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = Ie(this, r[n + o], t, o), s === g && (s = this._$AH[o]), a ||= !ye(s) || s !== this._$AH[o], s === _ ? e = _ : e !== _ && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === _ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Be = class extends ze {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === _ ? void 0 : e;
	}
}, Ve = class extends ze {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== _);
	}
}, He = class extends ze {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = Ie(this, e, t, 0) ?? _) === g) return;
		let n = this._$AH, r = e === _ && n !== _ || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== _ && (n === _ || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Ue = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		Ie(this, e);
	}
}, We = {
	M: me,
	P: m,
	A: he,
	C: 1,
	L: Pe,
	R: Le,
	D: xe,
	V: Ie,
	I: Re,
	H: ze,
	N: Ve,
	U: He,
	B: Be,
	F: Ue
}, Ge = ue.litHtmlPolyfillSupport;
Ge?.(Fe, Re), (ue.litHtmlVersions ??= []).push("3.3.3");
var Ke = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Re(t.insertBefore(ve(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, qe = globalThis, Je = class extends le {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ke(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return g;
	}
};
Je._$litElement$ = !0, Je.finalized = !0, qe.litElementHydrateSupport?.({ LitElement: Je });
var Ye = qe.litElementPolyfillSupport;
Ye?.({ LitElement: Je }), (qe.litElementVersions ??= []).push("4.2.2");
// node_modules/@lit/reactive-element/decorators/custom-element.js
var y = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, Xe = {
	attribute: !0,
	type: String,
	converter: oe,
	reflect: !1,
	hasChanged: se
}, Ze = (e = Xe, t, n) => {
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
function b(e) {
	return (t, n) => typeof n == "object" ? Ze(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function x(e) {
	return b({
		...e,
		state: !0,
		attribute: !1
	});
}
// node_modules/@lit/reactive-element/decorators/base.js
var Qe = (e, t, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, n), n);
// node_modules/@lit/reactive-element/decorators/query.js
function $e(e, t) {
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
			return Qe(n, r, { get() {
				let n = e.call(this);
				return n === void 0 && (n = a(this), (n !== null || this.hasUpdated) && t.call(this, n)), n;
			} });
		}
		return Qe(n, r, { get() {
			return a(this);
		} });
	};
}
// src/common/constants.ts
var S = "device", C = "template", w = "times", et = "interval", tt = "once", nt = "random_window", rt = "poisson", it = "enum", at = "state_machine", ot = "noise", st = "phase", ct = "interval_s", lt = "shape", ut = "sensor", dt = "devices", ft = "groups", pt = "tdc-submit", mt = "hass_test_data_creator", ht = 3e4, gt = 3e5, _t = /* @__PURE__ */ new Map();
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
	bulkRemovePlan(e) {
		return this.call("devices/bulk_remove", {
			...e,
			plan_only: !0
		});
	}
	bulkRemove(e) {
		return this.call("devices/bulk_remove", { ...e });
	}
	bulkArea(e, t) {
		return this.call("devices/bulk_area", {
			...e,
			area: t
		});
	}
	bulkGroup(e, t) {
		return this.call("devices/bulk_group", {
			...e,
			...t
		});
	}
	bulkAction(e, t, n) {
		return this.call("devices/bulk_action", {
			...e,
			action: t,
			params: n
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
		detLive: "Live view",
		detLiveHint: "Reads the values every 2 seconds while this device is open",
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
		bulkSelectPage: "Select this page",
		bulkSelectRow: "Select {name}",
		bulkSelected: "{count} selected",
		bulkSelectAll: "Select all {count} matches",
		bulkAllSelected: "All {count} matches are selected",
		bulkClear: "Clear selection",
		bulkArea: "Set area…",
		bulkGroup: "Add to group…",
		bulkAction: "Run action…",
		bulkRemove: "Remove…",
		bulkAreaHeading: "Set the area of {count} devices",
		bulkAreaApply: "Set area",
		bulkGroupHeading: "Add {count} devices to a group",
		bulkGroupNew: "New group",
		bulkGroupExisting: "Existing group",
		bulkGroupName: "Group name",
		bulkGroupPick: "Group",
		bulkGroupNote: "Only Zigbee2MQTT devices can join a group.",
		bulkGroupApply: "Add to group",
		bulkActionHeading: "Run an action on {count} devices",
		bulkActionRun: "Run",
		bulkActionValue: "Value",
		bulkActionSeconds: "Duration in seconds",
		bulkRemoveHeading: "Remove {count} devices",
		bulkRemoveLead: "{count} devices will be removed with their entities. This cannot be undone.",
		bulkRemoveBox: "Yes, remove all {count} devices",
		bulkRemoveApply: "Remove {count} devices",
		bulkRemoveInUse: "Still in use, remove them from schedules, scenarios and groups first: {names}",
		bulkMoved: "Area set on {count} devices",
		bulkGrouped: "Group {name} saved",
		bulkRan: "Action ran on {count} devices, {failed} failed",
		bulkRemoved: "{count} devices removed",
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
		detLive: "Live-Ansicht",
		detLiveHint: "Liest die Werte alle 2 Sekunden, solange das Gerät geöffnet ist",
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
		bulkSelectPage: "Diese Seite auswählen",
		bulkSelectRow: "{name} auswählen",
		bulkSelected: "{count} ausgewählt",
		bulkSelectAll: "Alle {count} Treffer auswählen",
		bulkAllSelected: "Alle {count} Treffer sind ausgewählt",
		bulkClear: "Auswahl aufheben",
		bulkArea: "Bereich setzen…",
		bulkGroup: "Zu Gruppe…",
		bulkAction: "Aktion ausführen…",
		bulkRemove: "Entfernen…",
		bulkAreaHeading: "Bereich von {count} Geräten setzen",
		bulkAreaApply: "Bereich setzen",
		bulkGroupHeading: "{count} Geräte zu einer Gruppe hinzufügen",
		bulkGroupNew: "Neue Gruppe",
		bulkGroupExisting: "Vorhandene Gruppe",
		bulkGroupName: "Gruppenname",
		bulkGroupPick: "Gruppe",
		bulkGroupNote: "Nur Zigbee2MQTT-Geräte können in eine Gruppe.",
		bulkGroupApply: "Zur Gruppe hinzufügen",
		bulkActionHeading: "Aktion auf {count} Geräten ausführen",
		bulkActionRun: "Ausführen",
		bulkActionValue: "Wert",
		bulkActionSeconds: "Dauer in Sekunden",
		bulkRemoveHeading: "{count} Geräte entfernen",
		bulkRemoveLead: "{count} Geräte werden mit ihren Entitäten entfernt. Das lässt sich nicht rückgängig machen.",
		bulkRemoveBox: "Ja, alle {count} Geräte entfernen",
		bulkRemoveApply: "{count} Geräte entfernen",
		bulkRemoveInUse: "Noch in Benutzung, nimm sie zuerst aus Zeitplänen, Szenarien und Gruppen: {names}",
		bulkMoved: "Bereich auf {count} Geräten gesetzt",
		bulkGrouped: "Gruppe {name} gespeichert",
		bulkRan: "Aktion auf {count} Geräten ausgeführt, {failed} fehlgeschlagen",
		bulkRemoved: "{count} Geräte entfernt",
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
`, j = class extends Je {
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
    input[type='checkbox'] {
      width: 18px;
      min-height: 0;
      height: 18px;
      padding: 0;
      margin: 0;
      flex: none;
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
		return h`<label style="flex: ${r.flex ?? "1 1 200px"}"
      >${e}
      <input
        .value=${t}
        placeholder=${r.placeholder ?? ""}
        @input=${(e) => n(e.target.value)}
      />
    </label>`;
	}
	select(e, t, n, r, i) {
		return h`<label style="flex: 1 1 180px"
      >${e}
      <select
        ?disabled=${t.length === 1}
        @change=${(e) => i(e.target.value)}
      >
        ${k(this.hass?.language, t, r).map((e) => h`<option value=${e} ?selected=${e === n || t.length === 1}>
              ${r(e)}
            </option>`)}
      </select>
    </label>`;
	}
	detailRow(e, t) {
		return h`<tr>
      <td colspan=${e}>${t}</td>
    </tr>`;
	}
	submitRow(e) {
		return h`<p class="row">
      ${e.extra ?? _}
      <button
        class="primary"
        ?disabled=${!e.enabled || e.busy}
        @click=${e.submit}
      >
        ${e.label}
      </button>
      ${e.editing ? h`<button
              ?disabled=${e.busy}
              @click=${() => this.dispatchEvent(new CustomEvent("tdc-cancel", {
			bubbles: !0,
			composed: !0
		}))}
            >
              ${this.tr("detCancel")}
            </button>` : _}
    </p>`;
	}
	tr(e, t) {
		return St(xt(this.hass?.language), e, t);
	}
};
A([b({ attribute: !1 })], j.prototype, "hass", void 0);
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
}, { I: Rt } = We, zt = (e) => e, Bt = (e) => e.strings === void 0, Vt = () => document.createComment(""), Ht = (e, t, n) => {
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
		let s = this.ut ??= [], c = [], l, ee, u = 0, d = i.length - 1, f = 0, p = a.length - 1;
		for (; u <= d && f <= p;) if (i[u] === null) u++;
		else if (i[d] === null) d--;
		else if (s[u] === o[f]) c[f] = Ut(i[u], a[f]), u++, f++;
		else if (s[d] === o[p]) c[p] = Ut(i[d], a[p]), d--, p--;
		else if (s[u] === o[p]) c[p] = Ut(i[u], a[p]), Ht(e, c[p + 1], i[u]), u++, p--;
		else if (s[d] === o[f]) c[f] = Ut(i[d], a[f]), Ht(e, i[u], i[d]), d--, f++;
		else if (l === void 0 && (l = Jt(o, f, p), ee = Jt(s, u, d)), l.has(s[u])) {
			if (l.has(s[d])) {
				let t = ee.get(o[f]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = Ht(e, i[u]);
					Ut(t, a[f]), c[f] = t;
				} else c[f] = Ut(n, a[f]), Ht(e, i[u], n), i[t] = null;
				f++;
			} else qt(i[d]), d--;
		} else qt(i[u]), u++;
		for (; f <= p;) {
			let t = Ht(e, c[p + 1]);
			Ut(t, a[f]), c[f++] = t;
		}
		for (; u <= d;) {
			let e = i[u++];
			e !== null && qt(e);
		}
		return this.ut = o, Gt(e, c), g;
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
		return h`<dialog @close=${() => this.close()}>
      <div class="head">
        <h3>${this.heading}</h3>
        <button aria-label=${this.tr("detCancel")} @click=${() => this.close()}>✕</button>
      </div>
      <slot></slot>
    </dialog>`;
	}
};
A([b({ type: Boolean })], Xt.prototype, "open", void 0), A([b()], Xt.prototype, "heading", void 0), A([$e("dialog")], Xt.prototype, "dialog", void 0), Xt = A([y("tdc-dialog")], Xt);
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
		if (t === g || t === _) return t;
		let n = e.element, r = e.name;
		if (e.type === Ft.PROPERTY) {
			if (t === n[r]) return g;
		} else if (e.type === Ft.BOOLEAN_ATTRIBUTE) {
			if (!!t === n.hasAttribute(r)) return g;
		} else if (e.type === Ft.ATTRIBUTE && n.getAttribute(r) === t + "") return g;
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
A([x()], xn.prototype, "open", void 0);
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
		return h`<div class="row add">
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
		return h`
      <button
        class="trigger"
        aria-haspopup="listbox"
        aria-expanded=${this.open ? "true" : "false"}
        @click=${() => this.open = !this.open}
      >
        ${t.length ? h`<span class="summary">${t.join(", ")}</span>` : h`<span class="summary empty">${this.empty || this.tr("areasNone")}</span>`}
        <span>▾</span>
      </button>
      ${this.open ? h`<div class="popover" popover="manual" role="listbox" aria-multiselectable="true">
              ${this.allowAdd ? this.renderAdd() : ""}
              ${e.map((e) => h`<label class="option">
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
A([b({ attribute: !1 })], M.prototype, "items", void 0), A([b({ attribute: !1 })], M.prototype, "selected", void 0), A([b({ type: Boolean })], M.prototype, "allowAdd", void 0), A([b({ type: Boolean })], M.prototype, "single", void 0), A([b()], M.prototype, "empty", void 0), A([x()], M.prototype, "draft", void 0), M = A([y("tdc-multi-select")], M);
var N = class extends j {
	constructor(...e) {
		super(...e), this.fields = [], this.values = {}, this.sorts = [], this.searchLabel = "", this.searchBefore = "", this.matched = 0, this.total = 0, this.draft = {}, this.onKey = (e) => {
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
		if (e.kind === "switch") return h`<label class="switch narrow">
        <input
          type="checkbox"
          .checked=${t === !0}
          @change=${(t) => this.set(e.key, t.target.checked, !0)}
        />
        ${e.label}
      </label>`;
		let n = Array.isArray(t) ? t : t ? [String(t)] : [];
		return h`<label>
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
		if (!this.sorts.length) return _;
		let e = this.draft[en] === !0, t = String(this.draft.sort ?? "");
		return h`<label class="narrow">
        ${this.tr("filterSortBy")}
        <select
          .value=${Zt(t)}
          @change=${(e) => this.set($t, e.target.value, !0)}
        >
          <option value="">${this.tr("sortDefault")}</option>
          ${this.sorts.map((e) => h`<option value=${e.value}>${e.label}</option>`)}
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
		return h`<span class="chip">
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
	searchFirst() {
		return !this.fields.some((e) => e.key === this.searchBefore);
	}
	renderSearch() {
		return h`<label class="search">
      ${this.searchLabel || this.tr("filterSearch")}
      <input
        type="search"
        placeholder=${this.tr("filterSearchHint")}
        .value=${Zt(String(this.draft.query ?? ""))}
        @input=${(e) => this.set(Qt, e.target.value)}
      />
    </label>`;
	}
	render() {
		let e = sn(this.fields, this.draft), t = cn(this.fields, this.draft) > 0;
		return h`
      <div class="row bar">
        ${this.searchFirst() ? this.renderSearch() : _}
        ${this.fields.map((e) => h`${e.key === this.searchBefore ? this.renderSearch() : _}${this.renderField(e)}`)}
        ${this.renderSort()}
      </div>
      <div class="row chips">
        ${e.map((e) => this.renderChip(e))}
        ${t ? h`<button @click=${() => this.replace(on(this.fields, this.draft))}>
                ${this.tr("filterReset")}
              </button>` : _}
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
A([b({ attribute: !1 })], N.prototype, "fields", void 0), A([b({ attribute: !1 })], N.prototype, "values", void 0), A([b({ attribute: !1 })], N.prototype, "sorts", void 0), A([b()], N.prototype, "searchLabel", void 0), A([b()], N.prototype, "searchBefore", void 0), A([b({ type: Number })], N.prototype, "matched", void 0), A([b({ type: Number })], N.prototype, "total", void 0), A([x()], N.prototype, "draft", void 0), N = A([y("tdc-filter-bar")], N);
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
var Dn = 1e4;
function On(e, t = Dn) {
	let n = window.setInterval(() => {
		document.hidden || e();
	}, t);
	return () => window.clearInterval(n);
}
var P = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.message = "", this.error = "", this.busy = !1, this.expanded = /* @__PURE__ */ new Set(), this.creating = !1, this.listFilter = {}, this.listFilterTab = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.loadOptions(), this.refresh(), this.stopPolling = On(() => void this.refresh());
	}
	disconnectedCallback() {
		this.stopPolling?.(), super.disconnectedCallback();
	}
	async loadOptions() {
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.optionsLoaded(this.info);
		} catch (e) {
			this.error = T(e);
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
		return h`<tdc-filter-bar
        .hass=${this.hass}
        .fields=${t}
        .values=${this.listFilter}
        .matched=${i.length}
        .total=${e.length}
        searchLabel=${this.tr("filterSearchList")}
        @tdc-filter-change=${(e) => this.setListFilter(e.detail)}
      ></tdc-filter-bar>
      ${i.length === 0 ? h`<p>
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
		return h`<td class="name">${this.expanded.has(e) ? "▾" : "▸"} ${t}</td>`;
	}
	editRow(e, t, n, r) {
		return this.detailRow(e, h`<div
        @tdc-submit=${(e) => r(e.detail)}
        @tdc-cancel=${() => this.toggle(t)}
      >
        ${n}
      </div>`);
	}
	removeButton(e) {
		return h`<button
      ?disabled=${this.busy}
      @click=${(t) => {
			t.stopPropagation(), this.run(e);
		}}
    >
      ${this.tr("remove")}
    </button>`;
	}
	newPopup(e, t) {
		return h`
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
A([x()], P.prototype, "info", void 0), A([x()], P.prototype, "templates", void 0), A([x()], P.prototype, "message", void 0), A([x()], P.prototype, "error", void 0), A([x()], P.prototype, "busy", void 0), A([x()], P.prototype, "expanded", void 0), A([x()], P.prototype, "creating", void 0), A([x()], P.prototype, "listFilter", void 0);
// src/common/menu-button.ts
var kn = class extends xn {
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
		return h`
      <button
        aria-haspopup="menu"
        aria-expanded=${this.open ? "true" : "false"}
        ?disabled=${this.disabled}
        @click=${() => this.open = !this.open}
      >
        ${this.label} ▾
      </button>
      ${this.open ? h`<div class="popover" popover="manual" role="menu">
              ${this.items.map((e) => h`<button
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
A([b()], kn.prototype, "label", void 0), A([b({ attribute: !1 })], kn.prototype, "items", void 0), A([b({ type: Boolean })], kn.prototype, "disabled", void 0), kn = A([y("tdc-menu-button")], kn);
// src/common/row-list.ts
var An = o`
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
`, jn = [it, at], Mn = [
	"sine",
	"saw",
	"square",
	"triangle",
	"random_walk",
	"discharge"
], Nn = [
	"constant",
	"household_load",
	"pv_day"
], Pn = 600, Fn = 86400, In = 24;
function Ln(e) {
	return jn.includes(e);
}
function Rn(e) {
	return e === "counter" ? ["rate_per_hour"] : e === "csv" ? ["step_s", st] : e === "noise" ? [ct, ot] : e === "steps" ? [
		"period_s",
		ct,
		st,
		ot
	] : e === "enum" ? [ct] : e === "state_machine" ? [st] : Mn.includes(e) ? [
		"period_s",
		st,
		ot
	] : Nn.includes(e) ? [ot] : [];
}
function zn(e) {
	let t = e.period_s;
	return !Rn(e.shape).includes("period_s") || !t || t <= 0 ? Fn : Math.min(Fn, t * In);
}
function Bn(e) {
	return e < 120 ? `${Number(e.toFixed(1))} s` : e < 7200 ? `${Number((e / 60).toFixed(1))} min` : `${Number((e / 3600).toFixed(1))} h`;
}
function Vn(e) {
	return e === "enum" ? ["values", "weights"] : e === "state_machine" ? ["states"] : [];
}
function Hn(e, t, n) {
	let r = { ...e }, i = Number(n);
	return n.trim() === "" || Number.isNaN(i) ? delete r[t] : r[t] = i, r;
}
function Un(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function Wn(e, t) {
	return t === "states" ? (e.states ?? []).map((e) => `${e.value}:${e.duration_s}`).join(", ") : (e[t] ?? []).join(", ");
}
function Gn(e, t, n) {
	let r = { ...e };
	return t === "values" ? r.values = Un(n) : t === "weights" ? r.weights = Un(n).map(Number).filter((e) => !Number.isNaN(e)) : r.states = Un(n).flatMap((e) => {
		let [t, n] = e.split(":").map((e) => e.trim()), r = Number(n);
		return t && r > 0 ? [{
			value: t,
			duration_s: r
		}] : [];
	}), r;
}
function Kn(e) {
	return e === "enum" ? {
		values: ["on", "off"],
		interval_s: Pn
	} : e === "state_machine" ? { states: [{
		value: "idle",
		duration_s: Pn
	}, {
		value: "active",
		duration_s: Pn
	}] } : {};
}
function qn(e, t) {
	let n = /* @__PURE__ */ new Set([
		lt,
		...Rn(t),
		...Vn(t)
	]);
	t === "csv" && n.add("file"), Ln(t) || [
		"min",
		"max",
		"decimals"
	].forEach((e) => n.add(e));
	let r = {
		...Kn(t),
		...e,
		shape: t
	};
	return Object.fromEntries(Object.entries(r).filter(([e]) => n.has(e)));
}
// src/signals/signals.ts
var Jn = (1n << 64n) - 1n, Yn = 11400714819323198485n, Xn = 13787848793156543929n, Zn = 10723151780598845931n, Qn = 3600, $n = 3600, er = 10, tr = .5, nr = 3, rr = 1.5, ir = 30n, ar = 27n, or = 31n, sr = 11n, cr = 53, lr = 86400, ur = 24, dr = .12, fr = [
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
], pr = .12, mr = 600, hr = 6, gr = 900, _r = .3, vr = 2, yr = 3;
function br(e, t = 0, n = 0) {
	return {
		shape: e.shape,
		min: e.min ?? 0,
		max: e.max ?? 100,
		period_s: e.period_s ?? $n,
		interval_s: e.interval_s ?? er,
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
function xr(e, t) {
	let n = BigInt(e) * Yn + (BigInt(t) & Jn) * Xn + Zn & Jn;
	return n = (n ^ n >> ir) * Xn & Jn, n = (n ^ n >> ar) * Zn & Jn, n ^= n >> or, Number(n >> sr) / 2 ** cr;
}
function Sr(e, t) {
	let n = t / e.period_s + e.phase;
	return n - Math.floor(n);
}
function Cr(e, t) {
	let n = Math.floor(t), r = t - n, i = r * r * (nr - 2 * r), a = xr(e, n);
	return a + (xr(e, n + 1) - a) * i;
}
function wr(e) {
	return (e % lr + lr) % lr / Qn;
}
function Tr(e, t, n) {
	let r = Math.abs(e - t), i = Math.min(r, ur - r);
	return Math.exp(-.5 * (i / n) ** 2);
}
var Er = {
	constant: () => tr,
	sine: (e, t) => tr + tr * Math.sin(2 * Math.PI * Sr(e, t)),
	saw: (e, t) => Sr(e, t),
	square: (e, t) => +(Sr(e, t) < tr),
	triangle: (e, t) => 1 - Math.abs(2 * Sr(e, t) - 1),
	noise: (e, t) => xr(e.seed, Math.floor(t / e.interval_s)),
	random_walk: (e, t) => Cr(e.seed, t / e.period_s + e.phase),
	household_load: (e, t) => {
		let n = wr(t);
		return fr.reduce((e, [t, r, i]) => e + i * Tr(n, t, r), dr) + pr * (Cr(e.seed, t / mr) - tr);
	},
	pv_day: (e, t) => {
		let n = (wr(t) - hr) / 14;
		if (!(n > 0 && n < 1)) return 0;
		let r = 1 - _r * Cr(e.seed, t / gr);
		return Math.sin(Math.PI * n) ** rr * r;
	},
	steps: (e, t) => {
		let n = Math.max(vr, Math.round(e.period_s / e.interval_s));
		return Math.min(1, Math.floor(Sr(e, t) * n) / (n - 1));
	},
	discharge: (e, t) => 1 - Sr(e, t) ** yr
};
function Dr(e, t) {
	let n = e.weights.length ? e.weights : e.values.map(() => 1), r = n.reduce((e, t) => e + t, 0), i = xr(e.seed, Math.floor(t / e.interval_s)) * r, a = 0;
	for (let [t, r] of e.values.entries()) if (a += n[t], i < a) return r;
	return e.values[e.values.length - 1];
}
function Or(e, t) {
	let n = e.states.reduce((e, [, t]) => e + t, 0), r = ((t + e.phase * n) % n + n) % n, i = 0;
	for (let [t, n] of e.states) if (i += n, r < i) return t;
	return e.states[e.states.length - 1][0];
}
var kr = {
	enum: Dr,
	state_machine: Or
};
function Ar(e) {
	let t = e.shape === "enum" ? e.values : e.states.map(([e]) => e);
	return [...new Set(t)];
}
function jr(e, t) {
	return Number(e.toFixed(t));
}
function Mr(e, t) {
	if (e.shape in kr) return kr[e.shape](e, t);
	if (e.shape === "counter") {
		let n = Math.max(0, t - e.origin);
		return jr(e.min + e.rate_per_hour * n / Qn, e.decimals);
	}
	let n = (Er[e.shape] ?? Er.constant)(e, t);
	return e.noise && (n += (xr(e.seed + 1, Math.floor(t)) - tr) * 2 * e.noise), n = Math.min(1, Math.max(0, n)), jr(e.min + n * (e.max - e.min), e.decimals);
}
// src/signals/signal-preview.ts
var Nr = 320, Pr = 80, Fr = 800, Ir = 100, Lr = 480, Rr = 6, zr = 12, Br = [
	0,
	.5,
	1
], Vr = class extends Je {
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
		return this.compact ? Nr : Fr;
	}
	get height() {
		return this.compact ? Pr : Ir;
	}
	points(e) {
		let t = br(e, 1, 0), n = Ar(t), r = Array.from({ length: 481 }, (r, i) => {
			let a = Mr(t, i / Lr * zn(e));
			return typeof a == "string" ? n.indexOf(a) : a;
		}), i = Math.min(...r), a = Math.max(...r) - i || 1;
		return r.map((e, t) => {
			let n = t / Lr * this.width, r = this.height - Rr - (e - i) / a * (this.height - 12);
			return `${n.toFixed(1)},${r.toFixed(1)}`;
		}).join(" ");
	}
	axis(e) {
		return je`${Br.map((t) => {
			let n = t * this.width, r = t === 0 ? "start" : t === 1 ? "end" : "middle";
			return je`<text x=${n} y=${this.height + zr - 2} text-anchor=${r}>${Bn(t * e)}</text>`;
		})}`;
	}
	render() {
		if (!this.signal) return h``;
		let e = this.signal.shape === "enum" || this.signal.shape === "state_machine", t = e ? Ar(br(this.signal)).join(" · ") : "", n = this.signal.min ?? 0, r = this.signal.max ?? 100, i = h`<svg
      viewBox="0 0 ${this.width} ${this.height + (this.compact ? 0 : zr)}"
      role="img"
    >
      ${je`<polyline points=${this.points(this.signal)}></polyline>`}
      ${this.compact ? "" : this.axis(zn(this.signal))}
    </svg>`;
		return this.compact ? i : h`${i}
      <div>${e ? t : `${n} – ${r} ${this.unit}`}</div>`;
	}
};
A([b({ attribute: !1 })], Vr.prototype, "signal", void 0), A([b()], Vr.prototype, "unit", void 0), A([b({ type: Boolean })], Vr.prototype, "compact", void 0), Vr = A([y("tdc-signal-preview")], Vr);
// src/signals/curve-editor.ts
var Hr = {
	min: "edMin",
	max: "edMax",
	decimals: "edDecimals",
	period_s: "edPeriod",
	interval_s: "edInterval",
	phase: "edPhase",
	rate_per_hour: "edRate",
	step_s: "edStep",
	noise: "edNoise"
}, Ur = {
	values: "edValues",
	weights: "edWeights",
	states: "edStates"
}, Wr = class extends j {
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
		return h`<label style="flex: 1 1 120px"
      >${this.tr(Hr[e])}
      <input
        type="number"
        step="any"
        .value=${this.signal[e] === void 0 ? "" : String(this.signal[e])}
        @input=${(t) => this.emit(Hn(this.signal, e, t.target.value))}
      />
    </label>`;
	}
	listField(e) {
		return this.textField(this.tr(Ur[e]), Wn(this.signal, e), (t) => this.emit(Gn(this.signal, e, t)), { flex: "1 1 240px" });
	}
	changeShape(e) {
		let t = qn(this.signal, e);
		this.emit(e === "csv" && !t.file && this.files[0] ? {
			...t,
			file: this.files[0]
		} : t);
	}
	renderFile() {
		let e = this.files.includes(this.signal.file ?? "") ? this.files : [...this.signal.file ? [this.signal.file] : [], ...this.files];
		return h`<label style="flex: 1 1 240px"
      >${this.tr("edFile")}
      <select
        ?disabled=${e.length === 0}
        @change=${(e) => this.emit({
			...this.signal,
			file: e.target.value
		})}
      >
        ${e.length === 0 ? h`<option>${this.tr("edNoFile")}</option>` : ""}
        ${e.map((e) => h`<option value=${e} ?selected=${e === this.signal.file}>${e}</option>`)}
      </select>
      <small>${this.tr("edFileHint")}</small>
    </label>`;
	}
	render() {
		return h`
      <div class="row form">
        <label style="flex: 1 1 180px"
          >${this.tr("edShape")}
          <select @change=${(e) => this.changeShape(e.target.value)}>
            ${k(this.hass?.language, this.shapes, (e) => E(this.hass?.language, lt, e)).map((e) => h`<option value=${e} ?selected=${e === this.signal.shape}>
                  ${E(this.hass?.language, lt, e)}
                </option>`)}
          </select>
        </label>
        ${Ln(this.signal.shape) ? "" : h`${this.numberField("min")} ${this.numberField("max")}
              ${this.numberField("decimals")}`}
      </div>
      <div class="row form">
        ${this.signal.shape === "csv" ? this.renderFile() : ""}
        ${Rn(this.signal.shape).map((e) => this.numberField(e))}
        ${Vn(this.signal.shape).map((e) => this.listField(e))}
      </div>
      ${this.signal.shape === "csv" ? h`<small>${this.tr("edCsvPreview")}</small>` : h`<tdc-signal-preview .signal=${this.signal} unit=${this.unit}></tdc-signal-preview>`}
    `;
	}
};
A([b({ attribute: !1 })], Wr.prototype, "signal", void 0), A([b({ attribute: !1 })], Wr.prototype, "shapes", void 0), A([b()], Wr.prototype, "unit", void 0), A([x()], Wr.prototype, "files", void 0), Wr = A([y("tdc-curve-editor")], Wr);
// src/wizard/entity-helpers.ts
var Gr = ["sensor", "climate"], Kr = "event", qr = /* @__PURE__ */ "°C.°F.K.%.W.kW.Wh.kWh.V.A.Hz.VA.var.lx.dB.hPa.mbar.bar.Pa.ppm.ppb.µg/m³.m.cm.mm.km.m/s.km/h.l.L/min.m³.g.kg.s.min.h.d.B.kB.MB.GB.Mbit/s.lm".split("."), Jr = /^[a-z0-9]+(_[a-z0-9]+)*$/;
function Yr(e) {
	return e.replace(/ß/g, "ss").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function Xr(e) {
	return Gr.includes(e);
}
function Zr(e, t) {
	let { signal: n, unit: r, event_types: i, ...a } = e, o = {
		...a,
		platform: t
	};
	return Xr(t) && (o.signal = n ?? {
		shape: "sine",
		min: 0,
		max: 100
	}, t === "sensor" && r && (o.unit = r)), t === Kr && (o.event_types = i ?? ["press"]), o;
}
function Qr(e) {
	return Zr({
		key: "",
		platform: e,
		name: ""
	}, e);
}
function $r(e, t) {
	return e.name.trim() ? Jr.test(e.key) ? t.includes(e.key) ? "entKeyTaken" : e.platform === Kr && !e.event_types?.length ? "entEventTypes" : "" : "entKeyInvalid" : "entNameEmpty";
}
function ei(e, t, n) {
	return t < 0 ? [...e, n] : e.map((e, r) => r === t ? n : e);
}
function ti(e, t) {
	return e.filter((e, n) => n !== t);
}
function ni(e) {
	let t = Object.values(e?.states ?? {}).map((e) => e.attributes?.unit_of_measurement).filter((e) => typeof e == "string" && e !== "");
	return [.../* @__PURE__ */ new Set([...t, ...qr])].sort((e, t) => e.localeCompare(t));
}
// src/wizard/helpers.ts
var ri = 10;
function ii(e, t) {
	return Math.round(e / Math.max(1, t) * ri) / ri;
}
function ai(e, t) {
	return e.shape === "enum" || e.shape === "state_machine" ? Ar(br(e)).join(" · ") : `${e.min ?? 0} – ${e.max ?? 100}${t ? ` ${t}` : ""}`;
}
// src/wizard/entity-editor.ts
var oi = -1, F = class extends j {
	constructor(...e) {
		super(...e), this.entities = [], this.shapes = [], this.platforms = [], this.editIndex = oi, this.keyTouched = !1;
	}
	static {
		this.styles = [
			j.styles,
			An,
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
		this.draft = Qr(this.platforms.includes("sensor") ? ut : "switch"), this.editIndex = oi, this.keyTouched = !1;
	}
	edit(e) {
		this.draft = structuredClone(this.entities[e]), this.editIndex = e, this.keyTouched = !0;
	}
	removeAt(e) {
		this.emit(ti(this.entities, e)), this.editIndex === e ? this.draft = void 0 : this.editIndex > e && --this.editIndex;
	}
	cancel() {
		this.draft = void 0;
	}
	apply() {
		this.draft &&= (this.emit(ei(this.entities, this.editIndex, this.draft)), void 0);
	}
	setField(e, t) {
		if (!this.draft) return;
		let n = {
			...this.draft,
			[e]: t
		};
		e === "key" && (this.keyTouched = !0), e === "name" && !this.keyTouched && (n.key = Yr(t)), e === "unit" && !t && delete n.unit, this.draft = n;
	}
	otherKeys() {
		return this.entities.filter((e, t) => t !== this.editIndex).map((e) => e.key);
	}
	renderRow(e, t) {
		let n = E(this.hass?.language, "platform", e.platform);
		return h`<li class=${t === this.editIndex && this.draft ? "editing" : ""}>
      <span class="name">
        <div title=${e.name}>${e.name}</div>
        <small>${e.key} · ${n}</small>
      </span>
      ${e.signal ? h`<span class="range">${ai(e.signal, e.unit)}</span>
              <tdc-signal-preview compact .signal=${e.signal}></tdc-signal-preview>` : ""}
      <button class="small" @click=${() => this.edit(t)}>${this.tr("entEdit")}</button>
      <button class="small danger" @click=${() => this.removeAt(t)}>
        ${this.tr("entDelete")}
      </button>
    </li>`;
	}
	renderDraft(e) {
		let t = $r(e, this.otherKeys()), n = this.hass?.language;
		return h`<div class="draft">
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
            @change=${(t) => this.draft = Zr(e, t.target.value)}
          >
            ${k(n, this.platforms, (e) => E(n, "platform", e)).map((t) => h`<option value=${t} ?selected=${t === e.platform}>
                  ${E(n, "platform", t)}
                </option>`)}
          </select>
        </label>
        ${e.platform === "sensor" ? h`<label style="flex: 0 1 130px"
                >${this.tr("entUnit")}
                <input
                  list="units"
                  .value=${e.unit ?? ""}
                  @input=${(e) => this.setField("unit", e.target.value)}
                />
                <datalist id="units">
                  ${ni(this.hass).map((e) => h`<option value=${e}></option>`)}
                </datalist>
              </label>` : ""}
      </div>
      ${e.event_types ? h`<label
              >${this.tr("entEventTypesLabel")}
              <input
                .value=${e.event_types.join(", ")}
                @input=${(t) => this.draft = {
			...e,
			event_types: t.target.value.split(",").map((e) => e.trim()).filter(Boolean)
		}}
              />
            </label>` : ""}
      ${Xr(e.platform) && e.signal ? h`<tdc-curve-editor
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
		return h`<div class="head">
        <b>${this.tr("customEntities")} (${this.entities.length})</b>
        <button class="primary" @click=${() => this.add()}>${this.tr("entAdd")}</button>
      </div>
      <ul>
        ${this.entities.length ? this.entities.map((e, t) => this.renderRow(e, t)) : h`<li class="empty">${this.tr("entEmpty")}</li>`}
      </ul>
      ${this.draft ? this.renderDraft(this.draft) : ""}`;
	}
};
A([b({ attribute: !1 })], F.prototype, "entities", void 0), A([b({ attribute: !1 })], F.prototype, "shapes", void 0), A([b({ attribute: !1 })], F.prototype, "platforms", void 0), A([x()], F.prototype, "draft", void 0), A([x()], F.prototype, "editIndex", void 0), A([x()], F.prototype, "keyTouched", void 0), F = A([y("tdc-entity-editor")], F);
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
		return h`<div class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr("baseTemplate")}
          <select
            .value=${this.pendingBase}
            @change=${(e) => this.chooseBase(e.target.value)}
          >
            <option value="">${this.tr("baseNone")}</option>
            ${k(e, this.templates, (t) => O(e, t.id, t.name)).map((t) => h`<option value=${t.id} ?selected=${t.id === this.pendingBase}>
                  ${O(e, t.id, t.name)}
                </option>`)}
          </select>
        </label>
      </div>
      ${t ? h`<p class="warning">
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
		return h`<div style="display: grid; gap: 20px">
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
A([b({ attribute: !1 })], I.prototype, "templates", void 0), A([b({ attribute: !1 })], I.prototype, "entities", void 0), A([b({ attribute: !1 })], I.prototype, "shapes", void 0), A([b({ attribute: !1 })], I.prototype, "platforms", void 0), A([x()], I.prototype, "pendingBase", void 0), I = A([y("tdc-entities-form")], I);
// src/wizard/entity-list.ts
var si = class extends j {
	constructor(...e) {
		super(...e), this.entities = [];
	}
	static {
		this.styles = [
			j.styles,
			An,
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
		return this.entities.length ? h`<ul>
      ${this.entities.map((e) => h`<li>
            <span class="name" title=${e.name}>${e.name}</span>
            ${e.signal ? h`<span class="range">${ai(e.signal, e.unit)}</span>
                    <tdc-signal-preview compact .signal=${e.signal}></tdc-signal-preview>` : h`<span class="range"
                    >${E(this.hass?.language, "platform", e.platform)}</span
                  >`}
          </li>`)}
    </ul>` : h``;
	}
};
A([b({ attribute: !1 })], si.prototype, "entities", void 0), si = A([y("tdc-entity-list")], si);
// src/devices/helpers.ts
var L = {
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
		plain: n.filter((e) => !e.startsWith("fault_") && !(e in L)),
		withValue: n.filter((e) => e in L),
		faults: n.filter((e) => e.startsWith(ci)).map((e) => e.slice(6))
	};
}
function ui(e, t) {
	let n = L[e], r = Number(t);
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
	ft
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
		key: "state",
		kind: "choice",
		label: ""
	},
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
		key: "custom",
		kind: "switch",
		label: ""
	}
], _i = "custom";
function vi(e, t) {
	return e.sort === t ? e.descending === !0 ? {
		...e,
		sort: "",
		descending: !1
	} : {
		...e,
		sort: t,
		descending: !0
	} : {
		...e,
		sort: t,
		descending: !1
	};
}
function yi(e, t) {
	return e.sort === t ? e.descending === !0 ? "descending" : "ascending" : "none";
}
var bi = "devices";
function xi(e) {
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
function Si(e, t, n) {
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
var Ci = 10, wi = 10, Ti = "custom", Ei = 50, Di = ["even", "random"], Oi = {
	even: "modeEven",
	random: "modeRandom"
}, R = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.template = "", this.count = Ci, this.pattern = "{template} {nn}", this.areas = [], this.mode = "even", this.seed = "", this.output = "native", this.custom = [], this.busy = !1, this.message = "", this.error = "";
	}
	async connectedCallback() {
		super.connectedCallback();
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.template = this.templates[0]?.id ?? Ti;
		} catch (e) {
			this.error = T(e);
		}
	}
	entities() {
		return this.template === Ti ? this.custom : this.templates.find((e) => e.id === this.template)?.entities ?? [];
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
			...this.template === Ti ? { entities: this.custom } : {}
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
		let e = this.entities(), t = ii(e.filter((e) => e.platform === ut).length * this.count, this.info?.tick_seconds ?? wi);
		return h`<p>
      <small>${this.tr("estimate", {
			entities: e.length * this.count,
			rate: t
		})}</small>
      ${t > Ei ? h`<br /><span class="warning">${this.tr("rateWarning")}</span>` : ""}
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
				id: Ti,
				label: this.tr("customTemplate")
			}
		};
	}
	option(e) {
		let t = e.id === Ti;
		return h`<option
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
		return h`
      <div class="row form">
        <label style="flex: 1 1 220px"
          >${this.tr(C)}
          <select @change=${(e) => this.choose(e.target.value)}>
            ${e.bundled.map((e) => this.option(e))}
            ${e.own.length ? h`<optgroup label=${this.tr("ownTemplates")}>
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
            ${k(this.hass?.language, Di, (e) => this.tr(Oi[e])).map((e) => h`<option value=${e} ?selected=${e === this.mode}>
                  ${this.tr(Oi[e])}
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
      ${this.template === Ti ? h`<div style="display: grid; gap: 20px">
              <tdc-entities-form
                .hass=${this.hass}
                .templates=${this.templates}
                .entities=${this.custom}
                .shapes=${this.info?.shapes ?? []}
                .platforms=${this.info?.platforms ?? []}
                @tdc-entities-change=${(e) => this.custom = e.detail}
              ></tdc-entities-form>
            </div>` : ""}
      ${this.template === Ti ? "" : h`<p>
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
A([x()], R.prototype, "info", void 0), A([x()], R.prototype, "templates", void 0), A([x()], R.prototype, "template", void 0), A([x()], R.prototype, "count", void 0), A([x()], R.prototype, "pattern", void 0), A([x()], R.prototype, "areas", void 0), A([x()], R.prototype, "mode", void 0), A([x()], R.prototype, "seed", void 0), A([x()], R.prototype, "output", void 0), A([x()], R.prototype, "custom", void 0), A([x()], R.prototype, "busy", void 0), A([x()], R.prototype, "message", void 0), A([x()], R.prototype, "error", void 0), R = A([y("tdc-creation-wizard")], R);
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
			let t = await this.api.saveTemplate(this.editing?.id ?? Yr(e), e, this.entities);
			this.dispatchEvent(new CustomEvent("tdc-template-saved", { detail: t }));
		} catch (e) {
			this.error = T(e);
		}
		this.busy = !1;
	}
	render() {
		let e = this.name.trim(), t = this.editing?.id ?? Yr(e), n = !this.editing && this.templates.some((e) => e.id === t && !e.bundled);
		return h`
      <div style="display: grid; gap: 20px">
        <label
          >${this.tr("tplName")}
          <input
            .value=${this.name}
            @input=${(e) => this.name = e.target.value}
          />
          ${n ? h`<small class="warning">${this.tr("tplExists")}</small>` : ""}
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
A([b({ attribute: !1 })], z.prototype, "editing", void 0), A([x()], z.prototype, "info", void 0), A([x()], z.prototype, "templates", void 0), A([x()], z.prototype, "name", void 0), A([x()], z.prototype, "entities", void 0), A([x()], z.prototype, "busy", void 0), A([x()], z.prototype, "error", void 0), z = A([y("tdc-template-wizard")], z);
// src/wizard/template-manager.ts
var B = class extends j {
	constructor(...e) {
		super(...e), this.own = [], this.form = !1, this.confirming = "", this.busy = !1, this.error = "";
	}
	static {
		this.styles = [
			j.styles,
			An,
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
		return this.confirming === e.id ? h`<button
        class="small danger"
        ?disabled=${this.busy}
        @click=${() => void this.removeTemplate(e.id)}
      >
        ${this.tr("tplDeleteConfirm")}
      </button>
      <button class="small" @click=${() => this.confirming = ""}>
        ${this.tr("detCancel")}
      </button>` : h`<button class="small" @click=${() => this.openForm(e)}>
          ${this.tr("entEdit")}
        </button>
        <button class="small danger" @click=${() => this.confirming = e.id}>
          ${this.tr("entDelete")}
        </button>`;
	}
	renderList() {
		return h`<p class="end">
        <button class="primary" @click=${() => this.openForm()}>+ ${this.tr("tplNew")}</button>
      </p>
      <ul>
        ${this.own.length ? this.own.map((e) => h`<li>
                    <span>
                      <div title=${e.name}>${e.name}</div>
                      <small>${this.tr("tplEntities", { count: e.entities.length })}</small>
                    </span>
                    ${this.renderActions(e)}
                  </li>`) : h`<li class="empty">${this.tr("tplNone")}</li>`}
      </ul>
      <p class="error">${this.error}</p>`;
	}
	render() {
		return this.form ? h`<p>
        <button @click=${() => void this.closeForm()}>‹ ${this.tr("tplBack")}</button>
      </p>
      <tdc-template-wizard
        .hass=${this.hass}
        .editing=${this.editing}
        @tdc-template-saved=${() => void this.closeForm()}
      ></tdc-template-wizard>` : this.renderList();
	}
};
A([x()], B.prototype, "own", void 0), A([x()], B.prototype, "form", void 0), A([x()], B.prototype, "editing", void 0), A([x()], B.prototype, "confirming", void 0), A([x()], B.prototype, "busy", void 0), A([x()], B.prototype, "error", void 0), B = A([y("tdc-template-manager")], B);
// src/devices/area-picker.ts
function ki(e, t, n, r, i) {
	return h`<tdc-multi-select
    .hass=${e}
    .items=${t.map((e) => ({
		value: e,
		label: e
	}))}
    .selected=${n ? [n] : []}
    single
    allowAdd
    empty=${r.none}
    aria-label=${r.field}
    @tdc-select-change=${(e) => i(e.detail[0] ?? "")}
  ></tdc-multi-select>`;
}
var Ai = 2e3;
function ji(e) {
	if (e == null || e.trim() === "") return;
	let t = Number(e);
	return Number.isFinite(t) ? t : void 0;
}
function Mi(e, t, n = 120) {
	return [...e, t].slice(-n);
}
function Ni(e, t, n, r = 4) {
	if (e.length < 2) return "";
	let i = e[0].at, a = e[e.length - 1].at - i || 1, o = e.map((e) => e.value), s = Math.min(...o), c = Math.max(...o) - s || 1;
	return e.map((e) => {
		let o = (e.at - i) / a * t, l = n - r - (e.value - s) / c * (n - 2 * r);
		return `${o.toFixed(1)},${l.toFixed(1)}`;
	}).join(" ");
}
// src/devices/live-curve.ts
var Pi = 240, Fi = 40, Ii = class extends Je {
	constructor(...e) {
		super(...e), this.samples = [];
	}
	static {
		this.styles = o`
    svg {
      width: 100%;
      max-width: 240px;
      height: auto;
      background: var(--secondary-background-color);
      border-radius: 4px;
    }
    polyline {
      fill: none;
      stroke: var(--primary-color);
      stroke-width: 1.5;
    }
  `;
	}
	render() {
		return h`<svg viewBox="0 0 ${Pi} ${Fi}" role="img">
      <polyline points=${Ni(this.samples, Pi, Fi)}></polyline>
    </svg>`;
	}
};
A([b({ attribute: !1 })], Ii.prototype, "samples", void 0), Ii = A([y("tdc-live-curve")], Ii);
// src/devices/device-detail.ts
var V = class extends j {
	constructor(...e) {
		super(...e), this.actions = {}, this.areas = [], this.shapes = [], this.picked = {}, this.inputs = {}, this.curves = {}, this.live = !1, this.samples = {}, this.busy = !1, this.error = "";
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
      .live {
        display: block;
        margin: 8px 0;
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
	disconnectedCallback() {
		this.stopLive?.(), super.disconnectedCallback();
	}
	setLive(e) {
		this.stopLive?.(), this.stopLive = void 0, this.live = e, this.samples = {}, e && (this.readLive(), this.stopLive = On(() => void this.readLive(), Ai));
	}
	async readLive() {
		try {
			let e = await this.api.device(this.device.id);
			if (!this.live) return;
			let t = Date.now(), n = { ...this.samples };
			for (let r of e.entities) {
				let e = ji(r.state);
				e !== void 0 && (n[r.key] = Mi(n[r.key] ?? [], {
					at: t,
					value: e
				}));
			}
			this.samples = n;
		} catch (e) {
			this.setLive(!1), this.error = T(e);
		}
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
		return h`<div class="row area-row">
      <label style="flex: 0 1 320px"
        >${this.tr("detArea")}
        ${ki(this.hass, this.areas, e, {
			field: this.tr("detArea"),
			none: this.tr("detAreaNone")
		}, (e) => this.areaDraft = e)}
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
		], (e) => D(t, e)).map((e) => ({
			value: e,
			label: D(t, e)
		}));
	}
	pick(e, t) {
		t in L || t.startsWith("fault_") ? this.picked = {
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
		let n = L[t], r = `${e.key}:${t}`, i = this.inputs[r] ?? String(n ? n.start : 60), a = n ? ui(t, i) : di(i);
		return h`<span class="row">
      <strong>${D(this.hass?.language, t)}</strong>
      <input
        type="number"
        min=${n ? n.min : 1}
        max=${n ? n.max : _}
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
		return h`<tr>
      <td colspan="3" class="curve">
        <tdc-curve-editor
          .hass=${this.hass}
          .signal=${this.curves[e.key]}
          .shapes=${this.shapes.filter((e) => !Ln(e))}
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
		let t = this.hass?.language, n = this.menuItems(e), r = e.shape != null && !Ln(e.shape);
		return h`<tr>
        <td>
          ${Ot(t, e.key, e.name)}<br /><small
            >${E(t, "platform", e.platform)}</small
          >
        </td>
        <td>
          ${kt(t, e.state)}${e.unit ? ` ${e.unit}` : ""}${this.live && e.key in this.samples ? h`<tdc-live-curve .samples=${this.samples[e.key]}></tdc-live-curve>` : ""}${e.fault ? h`<br /><small class="warning">⚠ ${E(t, "fault", e.fault)}</small>` : ""}
        </td>
        <td class="row">
          ${n.length ? h`<tdc-menu-button
                  .hass=${this.hass}
                  label=${this.tr("detActions")}
                  ?disabled=${this.busy}
                  .items=${n}
                  @tdc-pick=${(t) => this.pick(e, t.detail)}
                ></tdc-menu-button>` : ""}
          ${this.renderPicked(e)}
          ${r ? h`<button
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
		return e.length === 0 ? h`<p class="usage"><small>${this.tr("useNone")}</small></p>` : h`<details class="usage">
      <summary>${this.tr("useTitle", { count: e.length })}</summary>
      <ul>
        ${e.map((e) => h`<li>${this.tr(`use_${e.kind}`)}: ${e.name}</li>`)}
      </ul>
    </details>`;
	}
	render() {
		return h`
      ${this.renderArea()}
      <label class="live">
        <input
          type="checkbox"
          .checked=${this.live}
          @change=${(e) => this.setLive(e.target.checked)}
        />
        ${this.tr("detLive")} <small>${this.tr("detLiveHint")}</small>
      </label>
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
A([b({ attribute: !1 })], V.prototype, "device", void 0), A([b({ attribute: !1 })], V.prototype, "actions", void 0), A([b({ attribute: !1 })], V.prototype, "areas", void 0), A([b({ attribute: !1 })], V.prototype, "shapes", void 0), A([x()], V.prototype, "areaDraft", void 0), A([x()], V.prototype, "picked", void 0), A([x()], V.prototype, "inputs", void 0), A([x()], V.prototype, "curves", void 0), A([x()], V.prototype, "live", void 0), A([x()], V.prototype, "samples", void 0), A([x()], V.prototype, "busy", void 0), A([x()], V.prototype, "error", void 0), V = A([y("tdc-device-detail")], V);
var Li = {
	ids: /* @__PURE__ */ new Set(),
	all: !1
};
function Ri(e, t) {
	return e.all ? t : e.ids.size;
}
function zi(e, t) {
	if (e.all) return t.length ? "all" : "none";
	let n = t.filter((t) => e.ids.has(t)).length;
	return n === 0 ? "none" : n === t.length ? "all" : "some";
}
function Bi(e, t) {
	let n = new Set(e.ids);
	return !n.delete(t) && n.size < 500 && n.add(t), {
		ids: n,
		all: !1
	};
}
function Vi(e, t) {
	let n = new Set(e.ids);
	if (zi(e, t) === "all") t.forEach((e) => n.delete(e));
	else for (let e of t) n.size < 500 && n.add(e);
	return {
		ids: n,
		all: !1
	};
}
function Hi(e, t, n) {
	return !e.all && zi(e, t) === "all" && n > e.ids.size;
}
function Ui(e, t) {
	return e.all ? { filter: {
		...t,
		sort: void 0,
		descending: void 0
	} } : { ids: [...e.ids] };
}
function Wi(e) {
	return e > 100;
}
function Gi(e) {
	return [...new Set(Object.values(e).flat())];
}
function Ki(e) {
	return e in L ? "value" : e.startsWith("fault_") ? "seconds" : "none";
}
function qi(e, t) {
	let n = Ki(e);
	return n === "none" ? {} : n === "value" ? ui(e, t) : di(t);
}
// src/devices/bulk-bar.ts
var Ji = "area", Yi = "group", Xi = "action", Zi = "remove", Qi = 8, H = class extends j {
	constructor(...e) {
		super(...e), this.count = 0, this.target = { ids: [] }, this.areas = [], this.actions = {}, this.mqtt = !1, this.mode = "", this.busy = !1, this.error = "", this.area = "", this.groupName = "", this.groupId = "", this.groups = [], this.action = "", this.input = "", this.confirmed = !1;
	}
	static {
		this.styles = [j.styles, o`
      .bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin: 8px 0;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--secondary-background-color);
      }
      .dialog-body {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .buttons {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
    `];
	}
	willUpdate(e) {
		e.has("target") && this.mode && this.close();
	}
	confirmedTarget() {
		return {
			...this.target,
			expected: this.count
		};
	}
	close() {
		this.mode = "", this.error = "", this.plan = void 0, this.confirmed = !1;
	}
	async open(e) {
		this.error = "", this.mode = e;
		try {
			e === Zi && (this.plan = await this.api.bulkRemovePlan(this.confirmedTarget())), e === Yi && (this.groups = await this.api.groups());
		} catch (e) {
			this.error = T(e);
		}
	}
	async apply(e) {
		this.busy = !0, this.error = "";
		try {
			let t = await e();
			this.close(), this.dispatchEvent(new CustomEvent("tdc-bulk-done", { detail: t }));
		} catch (e) {
			this.error = T(e);
		} finally {
			this.busy = !1;
		}
	}
	buttons(e, t, n) {
		return h`<div class="buttons">
      <button @click=${() => this.close()}>${this.tr("detCancel")}</button>
      <button
        class="primary"
        ?disabled=${this.busy || !t}
        @click=${() => void this.apply(n)}
      >
        ${e}
      </button>
    </div>`;
	}
	renderArea() {
		return h`<label
        >${this.tr("detArea")}
        ${ki(this.hass, this.areas, this.area, {
			field: this.tr("detArea"),
			none: this.tr("detAreaNone")
		}, (e) => this.area = e)}
      </label>
      <small>${this.tr("detAreaHint")}</small>
      ${this.buttons(this.tr("bulkAreaApply"), !0, async () => {
			let e = await this.api.bulkArea(this.confirmedTarget(), this.area.trim() || null);
			return this.tr("bulkMoved", { count: e.devices });
		})}`;
	}
	renderGroup() {
		let e = this.groupId !== "", t = e || this.groupName.trim() !== "";
		return h`<small>${this.tr("bulkGroupNote")}</small>
      <label
        >${this.tr("bulkGroupExisting")}
        <select @change=${(e) => this.groupId = e.target.value}>
          <option value="">${this.tr("bulkGroupNew")}</option>
          ${this.groups.map((e) => h`<option value=${e.id} ?selected=${e.id === this.groupId}>${e.name}</option>`)}
        </select>
      </label>
      ${e ? _ : h`<label
              >${this.tr("bulkGroupName")}
              <input
                .value=${this.groupName}
                @input=${(e) => this.groupName = e.target.value}
              />
            </label>`}
      ${this.buttons(this.tr("bulkGroupApply"), t, async () => {
			let t = e ? { group_id: this.groupId } : { name: this.groupName.trim() }, n = await this.api.bulkGroup(this.confirmedTarget(), t);
			return this.tr("bulkGrouped", { name: n.name });
		})}`;
	}
	actionParams() {
		return this.action ? qi(this.action, this.input) : void 0;
	}
	pickAction(e) {
		this.action = e, this.input = String(L[e]?.start ?? 60);
	}
	renderAction() {
		let e = this.hass?.language, t = Ki(this.action);
		return h`<label
        >${this.tr("schAction")}
        <select @change=${(e) => this.pickAction(e.target.value)}>
          <option value=""></option>
          ${k(e, Gi(this.actions), (t) => D(e, t)).map((t) => h`<option value=${t} ?selected=${t === this.action}>
                ${D(e, t)}
              </option>`)}
        </select>
      </label>
      ${t === "none" ? _ : h`<label
              >${this.tr(t === "value" ? "bulkActionValue" : "bulkActionSeconds")}
              <input
                type="number"
                .value=${this.input}
                @input=${(e) => this.input = e.target.value}
              />
            </label>`}
      ${this.buttons(this.tr("bulkActionRun"), this.actionParams() !== void 0, async () => {
			let e = await this.api.bulkAction(this.confirmedTarget(), this.action, this.actionParams() ?? {});
			return this.tr("bulkRan", {
				count: e.devices,
				failed: e.failed
			});
		})}`;
	}
	renderRemove() {
		let e = this.plan;
		if (!e) return h`${this.error ? _ : this.tr("loading")}`;
		let t = e.in_use.length > 0, n = Wi(e.count), r = e.in_use.map((e) => e.device), i = r.slice(0, Qi).join(", ") + (r.length > Qi ? " …" : "");
		return h`<p>${this.tr("bulkRemoveLead", { count: e.count })}</p>
      ${t ? h`<p class="error">${this.tr("bulkRemoveInUse", { names: i })}</p>` : _}
      ${n ? h`<label class="row">
              <input
                type="checkbox"
                .checked=${this.confirmed}
                @change=${(e) => this.confirmed = e.target.checked}
              />
              ${this.tr("bulkRemoveBox", { count: e.count })}
            </label>` : _}
      ${this.buttons(this.tr("bulkRemoveApply", { count: e.count }), !t && e.count > 0 && (!n || this.confirmed), async () => {
			let e = await this.api.bulkRemove(this.confirmedTarget());
			return this.tr("bulkRemoved", { count: e.devices });
		})}`;
	}
	renderDialog() {
		let e = {
			[Ji]: "bulkAreaHeading",
			[Yi]: "bulkGroupHeading",
			[Xi]: "bulkActionHeading",
			[Zi]: "bulkRemoveHeading"
		}, t = this.mode ? this.tr(e[this.mode], { count: this.count }) : "";
		return h`<tdc-dialog
      .hass=${this.hass}
      heading=${t}
      ?open=${this.mode !== ""}
      @tdc-close=${() => this.close()}
    >
      <div class="dialog-body">
        ${this.mode === Ji ? this.renderArea() : _}
        ${this.mode === Yi ? this.renderGroup() : _}
        ${this.mode === Xi ? this.renderAction() : _}
        ${this.mode === Zi ? this.renderRemove() : _}
        ${this.error ? h`<p class="error">${this.error}</p>` : _}
      </div>
    </tdc-dialog>`;
	}
	render() {
		return this.count === 0 ? h`${_}` : h`<div class="bar">
        <strong>${this.tr("bulkSelected", { count: this.count })}</strong>
        <button @click=${() => void this.open(Ji)}>${this.tr("bulkArea")}</button>
        ${this.mqtt ? h`<button @click=${() => void this.open(Yi)}>
                ${this.tr("bulkGroup")}
              </button>` : _}
        <button @click=${() => void this.open(Xi)}>${this.tr("bulkAction")}</button>
        <button @click=${() => void this.open(Zi)}>${this.tr("bulkRemove")}</button>
        <button @click=${() => this.dispatchEvent(new CustomEvent("tdc-bulk-clear"))}>
          ${this.tr("bulkClear")}
        </button>
      </div>
      ${this.renderDialog()}`;
	}
};
A([b({ type: Number })], H.prototype, "count", void 0), A([b({ attribute: !1 })], H.prototype, "target", void 0), A([b({ attribute: !1 })], H.prototype, "areas", void 0), A([b({ attribute: !1 })], H.prototype, "actions", void 0), A([b({ type: Boolean })], H.prototype, "mqtt", void 0), A([x()], H.prototype, "mode", void 0), A([x()], H.prototype, "busy", void 0), A([x()], H.prototype, "error", void 0), A([x()], H.prototype, "area", void 0), A([x()], H.prototype, "groupName", void 0), A([x()], H.prototype, "groupId", void 0), A([x()], H.prototype, "groups", void 0), A([x()], H.prototype, "action", void 0), A([x()], H.prototype, "input", void 0), A([x()], H.prototype, "plan", void 0), A([x()], H.prototype, "confirmed", void 0), H = A([y("tdc-bulk-bar")], H);
// src/devices/duplicate-dialog.ts
var $i = "{template} {n}", ea = 500, ta = (e) => e.target.value, na = class extends j {
	constructor(...e) {
		super(...e), this.count = 1, this.pattern = $i, this.busy = !1, this.error = "";
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
		let e = Number.isInteger(this.count) && this.count >= 1 && this.count <= ea;
		return h`
      <p><b>${this.device.name}</b></p>
      <div class="row">
        <label
          >${this.tr("dupCount")}
          <input
            type="number"
            min="1"
            max=${ea}
            .value=${String(this.count)}
            @input=${(e) => this.count = Number(ta(e))}
          />
        </label>
        <label
          >${this.tr("dupPattern")}
          <input
            type="text"
            maxlength="64"
            .value=${this.pattern}
            @input=${(e) => this.pattern = ta(e)}
          />
        </label>
      </div>
      <p><small>${this.tr("dupHint")}</small></p>
      ${this.error ? h`<p class="error">${this.error}</p>` : ""}
      <button class="primary" ?disabled=${this.busy || !e} @click=${() => void this.submit()}>
        ${this.tr("dupDo")}
      </button>
    `;
	}
};
A([b({ attribute: !1 })], na.prototype, "device", void 0), A([x()], na.prototype, "count", void 0), A([x()], na.prototype, "pattern", void 0), A([x()], na.prototype, "busy", void 0), A([x()], na.prototype, "error", void 0), na = A([y("tdc-duplicate-dialog")], na);
// src/devices/device-list.ts
var ra = 4, ia = 7, aa = {
	switch: "toggle",
	event: "press",
	binary_sensor: "pulse",
	light: "toggle"
}, oa = "fire:", sa = "remove", ca = "duplicate", la = [
	ut,
	"switch",
	"binary_sensor",
	"light",
	"cover",
	"climate"
], U = class extends P {
	constructor(...e) {
		super(...e), this.devices = [], this.total = 0, this.matched = 0, this.offset = 0, this.loaded = !1, this.templating = !1, this.filter = dn(bi, gi), this.selection = Li, this.facetsStale = !0;
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
      td.check,
      th.check {
        width: 1%;
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
      th.sortable {
        cursor: pointer;
        user-select: none;
      }
      th.sortable:hover {
        color: var(--primary-text-color);
      }
      tr.device:hover {
        background: var(--secondary-background-color);
      }
    `
		];
	}
	optionsLoaded() {}
	async refresh() {
		let e = xi(this.filter), t = this.facetsStale;
		this.facetsStale = !1;
		try {
			let n = await this.api.devices(this.offset, 50, e, t);
			n.devices.length === 0 && this.offset > 0 && (this.offset = hi(n.matched, 50), n = await this.api.devices(this.offset, 50, e, t)), this.devices = n.devices, this.total = n.total, this.matched = n.matched, n.facets && (this.facets = n.facets), this.error = "";
		} catch (e) {
			this.facetsStale ||= t, this.error = T(e);
		}
		this.loaded = !0;
	}
	reload() {
		this.facetsStale = !0, this.refresh();
	}
	setFilter(e) {
		this.filter = e, this.selection = Li, fn(bi, e), this.offset = 0, this.reload();
	}
	facetTemplate(e) {
		return e.value === "custom" ? this.tr("customTemplate") : O(this.hass?.language, e.value, e.value);
	}
	filterFields() {
		let e = this.hass?.language, t = this.facets, n = (e, n, r) => Si(t?.[e], this.filter[n], r), r = {
			fault: this.tr("filterFault"),
			used: this.tr("filterUsed"),
			unused: this.tr("filterUnused")
		};
		return [
			{
				key: "state",
				kind: "choice",
				label: this.tr("detState"),
				options: n("state", "state", (e) => r[e.value] ?? e.value)
			},
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
				key: "custom",
				kind: "switch",
				label: this.tr("filterCustom")
			}
		];
	}
	renderFilter() {
		return h`<tdc-filter-bar
      .hass=${this.hass}
      .fields=${this.filterFields()}
      .values=${this.filter}
      searchBefore=${_i}
      .matched=${this.matched}
      .total=${this.total}
      @tdc-filter-change=${(e) => this.setFilter(e.detail)}
    ></tdc-filter-bar>`;
	}
	sortHeader(e, t) {
		let n = yi(this.filter, e);
		return h`<th
      class="sortable"
      aria-sort=${n}
      @click=${() => this.setFilter(vi(this.filter, e))}
    >
      ${t} <span class="arrow">${{
			ascending: "▲",
			descending: "▼",
			none: ""
		}[n]}</span>
    </th>`;
	}
	goTo(e) {
		this.offset = e, this.refresh();
	}
	async fire(e, t) {
		try {
			await this.api.fire(e.id, t.key, aa[t.platform]), await this.refresh();
		} catch (e) {
			this.error = T(e);
		}
	}
	menuItems(e) {
		let t = this.hass?.language;
		return k(t, [
			...e.entities.filter((e) => e.platform in aa).map((e) => ({
				value: `${oa}${e.key}`,
				label: `${Ot(t, e.key, e.name)} – ${D(t, aa[e.platform])}`
			})),
			{
				value: ca,
				label: this.tr("duplicate")
			},
			{
				value: sa,
				label: this.tr("remove"),
				disabled: mi(e.used_by).length > 0,
				hint: this.tr("removeBlocked")
			}
		], (e) => e.label);
	}
	pick(e, t) {
		if (t === ca) {
			this.duplicating = e;
			return;
		}
		if (t === sa) {
			this.dispatchEvent(new CustomEvent("tdc-remove", { detail: {
				target: S,
				id: e.id
			} }));
			return;
		}
		let n = e.entities.find((e) => `${oa}${e.key}` === t);
		n && this.fire(e, n);
	}
	values(e) {
		let t = this.hass?.language;
		return e.entities.filter((e) => la.includes(e.platform)).slice(0, ra).map((e) => {
			let n = e.unit ? ` ${e.unit}` : "", r = e.fault ? ` ⚠ ${E(t, "fault", e.fault)}` : "";
			return `${Ot(t, e.key, e.name)}: ${kt(t, e.state)}${n}${r}`;
		}).join(" · ");
	}
	templateName(e) {
		return e.template === "custom" ? this.tr("customTemplate") : O(this.hass?.language, e.template, e.model);
	}
	pageIds() {
		return this.devices.map((e) => e.id);
	}
	pageState() {
		return zi(this.selection, this.pageIds());
	}
	renderBulk() {
		let e = Ri(this.selection, this.matched);
		return h`
      ${this.selection.all ? h`<p class="row">
              <small>${this.tr("bulkAllSelected", { count: this.matched })}</small>
              <button @click=${() => this.selection = Li}>
                ${this.tr("bulkClear")}
              </button>
            </p>` : Hi(this.selection, this.pageIds(), this.matched) ? h`<p class="row">
                <button @click=${() => this.selection = {
			ids: this.selection.ids,
			all: !0
		}}>
                  ${this.tr("bulkSelectAll", { count: this.matched })}
                </button>
              </p>` : _}
      <tdc-bulk-bar
        .hass=${this.hass}
        .count=${e}
        .target=${Ui(this.selection, xi(this.filter))}
        .areas=${fi(this.hass.areas, this.devices)}
        .actions=${this.info?.actions ?? {}}
        .mqtt=${this.info?.mqtt ?? !1}
        @tdc-bulk-clear=${() => this.selection = Li}
        @tdc-bulk-done=${(e) => {
			this.selection = Li, this.reload(), this.message = e.detail;
		}}
      ></tdc-bulk-bar>
      ${this.message ? h`<p>${this.message}</p>` : _}
    `;
	}
	renderRow(e) {
		let t = this.expanded.has(e.id);
		return h`<tr class="device card" @click=${() => this.toggle(e.id)}>
        <td class="check" @click=${(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            aria-label=${this.tr("bulkSelectRow", { name: e.name })}
            .checked=${this.selection.all || this.selection.ids.has(e.id)}
            ?disabled=${this.selection.all}
            @change=${() => this.selection = Bi(this.selection, e.id)}
          />
        </td>
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
      ${t ? this.detailRow(ia, h`<tdc-device-detail
                .hass=${this.hass}
                .device=${e}
                .actions=${this.info?.actions ?? {}}
                .shapes=${this.info?.shapes ?? []}
                .areas=${fi(this.hass.areas, this.devices)}
                @tdc-changed=${() => this.reload()}
              ></tdc-device-detail>`) : ""}`;
	}
	renderNew() {
		return h`
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
        ${this.creating ? h`<tdc-creation-wizard
                .hass=${this.hass}
                @tdc-created=${() => {
			this.creating = !1, this.reload();
		}}
              ></tdc-creation-wizard>` : _}
      </tdc-dialog>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr("duplicate")}
        ?open=${this.duplicating !== void 0}
        @tdc-close=${() => this.duplicating = void 0}
      >
        ${this.duplicating ? h`<tdc-duplicate-dialog
                .hass=${this.hass}
                .device=${this.duplicating}
                @tdc-created=${() => {
			this.duplicating = void 0, this.refresh();
		}}
              ></tdc-duplicate-dialog>` : _}
      </tdc-dialog>
      <tdc-dialog
        .hass=${this.hass}
        heading=${this.tr("tplManage")}
        ?open=${this.templating}
        @tdc-close=${() => this.templating = !1}
      >
        ${this.templating ? h`<tdc-template-manager .hass=${this.hass}></tdc-template-manager>` : _}
      </tdc-dialog>
    `;
	}
	render() {
		return this.loaded ? h`
      ${this.renderNew()} ${this.error ? h`<p class="error">${this.error}</p>` : ""}
      ${this.total === 0 ? "" : this.renderFilter()}
      ${this.total === 0 ? h`<p>${this.tr("noDevices")}</p>` : this.matched === 0 ? h`<p>
                ${this.tr("noMatches")}
                <a
                  href="#"
                  @click=${(e) => {
			e.preventDefault(), this.setFilter(on(this.filterFields(), this.filter));
		}}
                  >${this.tr("noMatchesReset")}</a
                >
              </p>` : h`${this.renderBulk()}
                <table class="cards">
                  <thead>
                    <tr>
                      <th class="check">
                        <input
                          type="checkbox"
                          aria-label=${this.tr("bulkSelectPage")}
                          .checked=${this.pageState() === "all"}
                          .indeterminate=${this.pageState() === "some"}
                          ?disabled=${this.selection.all}
                          @change=${() => this.selection = Vi(this.selection, this.pageIds())}
                        />
                      </th>
                      ${this.sortHeader("name", this.tr("colName"))}
                      ${this.sortHeader("template", this.tr("colTemplate"))}
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
    ` : h`${this.tr("loading")}`;
	}
};
A([x()], U.prototype, "devices", void 0), A([x()], U.prototype, "total", void 0), A([x()], U.prototype, "matched", void 0), A([x()], U.prototype, "offset", void 0), A([x()], U.prototype, "loaded", void 0), A([x()], U.prototype, "templating", void 0), A([x()], U.prototype, "duplicating", void 0), A([x()], U.prototype, "facets", void 0), A([x()], U.prototype, "filter", void 0), A([x()], U.prototype, "selection", void 0), U = A([y("tdc-device-list")], U);
// src/group/helpers.ts
var ua = "groups", da = [];
function fa(e) {
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
		return h`
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
          ${this.devices.length === 0 ? h`<small>${this.tr("grpNoDevices")}</small>` : _}
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
A([b({ attribute: !1 })], W.prototype, "devices", void 0), A([b({ attribute: !1 })], W.prototype, "group", void 0), A([b()], W.prototype, "submitLabel", void 0), A([b({ type: Boolean })], W.prototype, "busy", void 0), A([x()], W.prototype, "name", void 0), A([x()], W.prototype, "members", void 0), W = A([y("tdc-group-form")], W);
// src/group/group-panel.ts
var pa = 3, ma = "z2m", ha = class extends P {
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
		super(), this.groups = [], this.devices = [], this.restoreFilter(ua, da);
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
		return this.devices.filter((e) => e.output === ma).map((e) => ({
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
		return this.newPopup(this.tr("grpNew"), h`<tdc-group-form
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
		return h`<tr class="group card" @click=${() => this.toggle(e.id)}>
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
      ${t ? this.editRow(pa, e.id, h`<tdc-group-form
                .hass=${this.hass}
                .devices=${this.members()}
                .group=${e}
                ?busy=${this.busy}
              ></tdc-group-form>`, (t) => void this.save(e, t)) : _}`;
	}
	renderTable(e) {
		return h`<table class="cards">
      <tr>
        <th>${this.tr("colName")}</th>
        <th>${this.tr("grpMembers")}</th>
        <th>${this.tr("colActions")}</th>
      </tr>
      ${Yt(e, (e) => e.id, (e) => this.renderRow(e))}
    </table>`;
	}
	render() {
		return h`
      ${this.renderNew()}
      ${this.groups.length === 0 ? h`<p>${this.tr("grpNone")}</p>` : this.renderFiltered(this.groups, da, fa((e) => this.memberNames(e)), (e) => this.renderTable(e))}
      <p class="error">${this.error}</p>
    `;
	}
};
A([x()], ha.prototype, "groups", void 0), A([x()], ha.prototype, "devices", void 0), A([$e("tdc-group-form#new")], ha.prototype, "newForm", void 0), ha = A([y("tdc-group-panel")], ha);
function ga(e) {
	return Math.min(365, Math.max(1, Math.round(e) || 1));
}
function _a(e, t) {
	let [n, ...r] = (t.length ? e.filter((e) => t.includes(e.id)) : e).map((e) => {
		let t = /* @__PURE__ */ new Map();
		for (let n of e.entities) {
			let e = n.shape;
			n.platform === "sensor" && n.state_class && e && !Ln(e) && t.set(n.key, {
				key: n.key,
				name: n.name
			});
		}
		return t;
	});
	return n ? [...n.values()].filter((e) => r.every((t) => t.has(e.key))) : [];
}
// src/history/history-panel.ts
var va = 7, G = class extends j {
	constructor(...e) {
		super(...e), this.days = va, this.chosen = [], this.entity = "", this.devices = [], this.busy = !1, this.message = "", this.error = "";
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
		this.chosen = e, _a(this.devices, e).some((e) => e.key === this.entity) || (this.entity = "");
	}
	async importHistory() {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let e = await this.api.importHistory(ga(this.days), this.chosen.length > 1 ? this.chosen : this.chosen[0], this.entity || void 0);
			this.message = this.tr("histDone", { ...e });
		} catch (e) {
			this.error = T(e);
		}
		this.busy = !1;
	}
	renderChoice(e, t, n, r) {
		let i = k(this.hass?.language, t, (e) => e.label);
		return h`<label
      >${e}
      <select @change=${(e) => r(e.target.value)}>
        <option value="" ?selected=${n === ""}>${this.tr("histAll")}</option>
        ${i.map((e) => h`<option value=${e.value} ?selected=${e.value === n}>
              ${e.label}
            </option>`)}
      </select>
    </label>`;
	}
	render() {
		let e = this.hass?.language, t = this.devices.map((e) => ({
			value: e.id,
			label: e.name
		})), n = _a(this.devices, this.chosen).map((t) => ({
			value: t.key,
			label: Ot(e, t.key, t.name)
		}));
		return h`
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
A([x()], G.prototype, "days", void 0), A([x()], G.prototype, "chosen", void 0), A([x()], G.prototype, "entity", void 0), A([x()], G.prototype, "devices", void 0), A([x()], G.prototype, "busy", void 0), A([x()], G.prototype, "message", void 0), A([x()], G.prototype, "error", void 0), G = A([y("tdc-history-panel")], G);
// src/common/targets.ts
var ya = 1e3;
function ba(e) {
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
function xa(e) {
	let t = /* @__PURE__ */ new Date(e * ya), n = (e) => String(e).padStart(2, "0");
	return `${`${t.getFullYear()}-${n(t.getMonth() + 1)}-${n(t.getDate())}`} ${n(t.getHours())}:${n(t.getMinutes())}`;
}
function Sa(e, t, n) {
	return `${xa(e.created)} · ${O(t, e.template, e.model)} · ${n(e.count)}`;
}
function Ca(e, t, n, r, i) {
	return k(r, e === "device" ? t.map((e) => ({
		value: e.id,
		label: e.name
	})) : e === "template" ? n.map((e) => ({
		value: e.id,
		label: O(r, e.id, e.name)
	})) : ba(t).map((e) => ({
		value: e.id,
		label: Sa(e, r, i)
	})), (e) => e.label);
}
function wa(e, t, n, r, i, a) {
	return e === "device" ? n.find((e) => e.id === t || e.name === t)?.name ?? t : Ca(e, n, r, i, a).find((e) => e.value === t)?.label ?? t;
}
function Ta(e, t, n) {
	return e === "device" ? n.find((e) => e.id === t || e.name === t)?.id ?? t : t;
}
// src/common/target-select.ts
var Ea = {
	device: "schTarget_device",
	template: "schTarget_template",
	run: "schTarget_run"
}, K = class extends j {
	constructor(...e) {
		super(...e), this.kind = S, this.values = [], this.multiple = !1, this.templates = [], this.devices = [], this.error = "";
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
		return Ca(this.kind, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e }));
	}
	renderSingle(e, t) {
		let n = t === "" || e.some((e) => e.value === t);
		return h`<select
      ?disabled=${e.length === 1}
      @change=${(e) => {
			let t = e.target.value;
			this.emit(t ? [t] : []);
		}}
    >
      ${e.length === 1 ? "" : h`<option value="" ?selected=${t === ""}>${this.tr("pickOne")}</option>`}
      ${n ? "" : h`<option value=${t} selected>${t}</option>`}
      ${e.map((e) => h`<option value=${e.value} ?selected=${e.value === t}>
            ${e.label}
          </option>`)}
    </select>`;
	}
	render() {
		let e = this.options(), t = this.values.map((e) => Ta(this.kind, e, this.devices));
		return h`<label>
      ${this.tr(Ea[this.kind])}
      ${this.multiple && this.kind === "device" ? h`<tdc-multi-select
              .hass=${this.hass}
              .items=${e}
              .selected=${t}
              empty=${this.tr("pickOne")}
              @tdc-select-change=${(e) => this.emit(e.detail)}
            ></tdc-multi-select>` : this.renderSingle(e, t[0] ?? "")}
      ${this.error ? h`<small class="error">${this.error}</small>` : ""}
    </label>`;
	}
};
A([b()], K.prototype, "kind", void 0), A([b({ attribute: !1 })], K.prototype, "values", void 0), A([b({ type: Boolean })], K.prototype, "multiple", void 0), A([b({ attribute: !1 })], K.prototype, "templates", void 0), A([x()], K.prototype, "devices", void 0), A([x()], K.prototype, "error", void 0), K = A([y("tdc-target-select")], K);
// src/removal/removal-panel.ts
var Da = 20, Oa = {
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
		return e.length === 0 ? h`<p>${this.tr("leftoverNone")}</p>` : h`<p>${this.tr("leftoverTopics", { count: e.length })}</p>
      <p>
        <small
          >${e.slice(0, Da).join(", ")}${e.length > Da ? " …" : ""}</small
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
		return e.devices.length + e.orphans.length === 0 && e.runs.length === 0 ? h`<p>${this.tr("planNothing")}</p>` : h`<ul>
        <li>${this.tr("planDevices", { count: e.devices.length })}</li>
        ${e.groups.length ? h`<li>${this.tr("planGroups", { count: e.groups.length })}</li>` : ""}
        ${e.topics.length ? h`<li>${this.tr("planTopics", { count: e.topics.length })}</li>` : ""}
        ${e.statistics.length ? h`<li>${this.tr("planStatistics", { count: e.statistics.length })}</li>` : ""}
        ${e.scenarios.length ? h`<li>${this.tr("planScenarios", { count: e.scenarios.length })}</li>` : ""}
        ${e.schedules.length ? h`<li>${this.tr("planSchedules", { count: e.schedules.length })}</li>` : ""}
        ${e.orphans.length ? h`<li>${this.tr("planOrphans", { count: e.orphans.length })}</li>` : ""}
        ${e.areas.length ? h`<li>${this.tr("planAreas", { names: e.areas.join(", ") })}</li>` : ""}
      </ul>
      <p>
        <small
          >${e.devices.slice(0, Da).map((e) => e.name).join(", ")}${e.devices.length > Da ? " …" : ""}</small
        >
      </p>
      ${e.in_use.length ? h`<p class="error">${this.tr("inUseWarning")}</p>
              <ul>
                ${e.in_use.map((e) => h`<li>
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
		return h`
      <div class="fields bottom">
        <label
          >${this.tr("target")}
          <select
            @change=${(e) => {
			this.target = e.target.value, this.plan = void 0;
		}}
          >
            ${k(this.hass?.language, Object.keys(Oa), (e) => this.tr(Oa[e])).map((e) => h`<option value=${e} ?selected=${this.target === e}>
                  ${this.tr(Oa[e])}
                </option>`)}
          </select>
        </label>
        ${this.target === "all" ? "" : h`<tdc-target-select
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
      ${this.plan ? h`<div class="plan">${this.renderPlan(this.plan)}</div>` : ""}
      ${this.leftover ? h`<div class="plan">${this.renderLeftover(this.leftover)}</div>` : ""}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
A([b()], q.prototype, "target", void 0), A([b()], q.prototype, "targetId", void 0), A([x()], q.prototype, "plan", void 0), A([x()], q.prototype, "busy", void 0), A([x()], q.prototype, "leftover", void 0), A([x()], q.prototype, "message", void 0), A([x()], q.prototype, "error", void 0), q = A([y("tdc-removal-panel")], q);
// src/schedule/helpers.ts
var ka = 60, Aa = 3, ja = 24, Ma = 16;
function Na() {
	return {
		type: w,
		times: "08:00, 18:30",
		weekdays: [],
		everyS: ka,
		start: "00:00",
		end: "24:00",
		at: "",
		count: Aa,
		perDay: ja
	};
}
function Pa(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function Fa(e) {
	switch (e.type) {
		case w: return e.weekdays.length ? {
			type: w,
			times: Pa(e.times),
			weekdays: [...e.weekdays].sort()
		} : {
			type: w,
			times: Pa(e.times)
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
function Ia(e, t) {
	switch (e) {
		case "all": return { all: !0 };
		case C: return { template: t[0] ?? "" };
		case S: return { device: t.length === 1 ? t[0] : t };
		case "run": return { run: t[0] ?? "" };
	}
}
function La(e) {
	return "template" in e ? {
		kind: C,
		ids: [e.template]
	} : "device" in e ? {
		kind: S,
		ids: typeof e.device == "string" ? [e.device] : e.device
	} : "run" in e ? {
		kind: "run",
		ids: [e.run]
	} : {
		kind: "all",
		ids: []
	};
}
function Ra(e) {
	switch (e.type) {
		case w: return e.times.join(", ");
		case et: return `${e.every_s} s (${e.start}–${e.end})`;
		case tt: return e.at.replace("T", " ");
		case nt: return `${e.count}× ${e.start}–${e.end}`;
		case rt: return `Ø ${e.per_day}/d`;
	}
}
function za(e) {
	return e.slice(0, Ma).replace("T", " ");
}
function Ba(e) {
	return [...new Set(Object.values(e).flat())];
}
function Va(e) {
	return {
		kind: "all",
		targetIds: [],
		action: Ba(e)[0] ?? "",
		entity: ""
	};
}
function Ha(e, t, n, r) {
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
function Ua(e, t) {
	let n = Ba(e);
	if (!t) return [];
	let r = t.map((t) => new Set(Object.entries(e).filter(([e]) => t.has(e)).flatMap(([, e]) => e)));
	return n.filter((e) => r.every((t) => t.has(e)));
}
function Wa(e, t, n, r, i, a) {
	let o = t.length === 1 ? e === "template" ? r.find((e) => e.id === t[0])?.entities ?? [] : e === "device" ? n.find((e) => e.id === t[0] || e.name === t[0])?.entities ?? [] : [] : [], s = new Set(Object.entries(i).filter(([, e]) => e.includes(a)).map(([e]) => e));
	return o.filter((e) => s.has(e.platform)).map(({ key: e, name: t }) => ({
		key: e,
		name: t
	}));
}
function Ga(e) {
	return {
		target: Ia(e.kind, e.targetIds),
		entity: e.entity,
		action: e.action
	};
}
function Ka(e) {
	let t = {
		...Na(),
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
function qa(e) {
	let { kind: t, ids: n } = La(e.target);
	return {
		kind: t,
		targetIds: n,
		action: e.action,
		entity: e.entity
	};
}
var Ja = "schedules", Ya = [
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
], Xa = "scenario";
function Za(e) {
	return e.scenario ? Xa : e.action;
}
function Qa(e, t) {
	return {
		texts: (n) => [
			n.name,
			e(n),
			t(n),
			Ra(n.trigger)
		],
		values: (e, t) => {
			switch (t) {
				case "triggers": return [e.trigger.type];
				case "actions": return [Za(e)];
				case "targets": return [La(e.target).kind];
				default: return [e.enabled ? "on" : "off"];
			}
		}
	};
}
// src/scenario/helpers.ts
function $a(e) {
	return {
		afterS: 0,
		work: Va(e),
		params: ""
	};
}
function eo(e) {
	if (e.trim() === "") return {};
	try {
		let t = JSON.parse(e);
		return typeof t == "object" && t && !Array.isArray(t) ? t : void 0;
	} catch {
		return;
	}
}
function to(e) {
	let t = [];
	for (let n of e) {
		let e = eo(n.params);
		if (e === void 0) return;
		t.push({
			after_s: Math.max(0, n.afterS || 0),
			...Ga(n.work),
			params: e
		});
	}
	return t;
}
function no(e) {
	return {
		afterS: e.after_s,
		work: qa(e),
		params: Object.keys(e.params).length ? JSON.stringify(e.params) : ""
	};
}
var ro = "scenarios", io = [{
	key: "devices",
	kind: "multi",
	label: ""
}, {
	key: "templates",
	kind: "multi",
	label: ""
}];
function ao(e, t, n) {
	let r = e.steps.flatMap((e) => {
		let r = La(e.target);
		return r.kind === t ? r.ids.map(n) : [];
	});
	return [...new Set(r)];
}
function oo(e, t) {
	return ao(e, S, (e) => Ta(S, e, t));
}
function so(e) {
	return ao(e, C, (e) => e);
}
function co(e, t) {
	return {
		texts: t,
		values: (t, n) => n === "devices" ? oo(t, e) : so(t)
	};
}
// src/schedule/work-picker.ts
var lo = [
	"all",
	C,
	S,
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
		let e = this.hass?.language, t = Ha(this.work.kind, this.work.targetIds, this.devices, this.templates);
		return k(e, Ua(this.actions, t), (t) => D(e, t));
	}
	entities() {
		let e = Wa(this.work.kind, this.work.targetIds, this.devices, this.templates, this.actions, this.work.action);
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
		return t.length === 0 ? h`<label
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
		return h`<label
      >${this.tr("schEntity")}
      <select @change=${(e) => this.emit({ entity: e.target.value })}>
        <option value="" ?selected=${!this.work.entity}>${this.tr("schAllFitting")}</option>
        ${n.map((e) => h`<option value=${e.key} ?selected=${e.key === this.work.entity}>
              ${Ot(t, e.key, e.name)}
            </option>`)}
      </select>
    </label>`;
	}
	render() {
		let e = this.hass?.language, t = this.entities();
		return h`
      <div class="fields">
        ${this.select(this.tr("schTarget"), lo, this.work.kind, (e) => this.tr(`schTarget_${e}`), (e) => this.emit({
			kind: e,
			targetIds: [],
			entity: ""
		}))}
        ${this.work.kind === "all" ? _ : h`<tdc-target-select
                .hass=${this.hass}
                kind=${this.work.kind}
                ?multiple=${this.work.kind === S}
                .values=${this.work.targetIds}
                .templates=${this.templates}
                @tdc-target-change=${(e) => this.emit({
			targetIds: e.detail,
			entity: ""
		})}
              ></tdc-target-select>`}
        ${t.length ? this.renderEntity(t, e) : _}
      </div>
      <div class="fields">${this.renderAction(e)}</div>
      ${this.error ? h`<p class="error">${this.error}</p>` : _}
    `;
	}
};
A([b({ attribute: !1 })], J.prototype, "work", void 0), A([b({ attribute: !1 })], J.prototype, "actions", void 0), A([b({ attribute: !1 })], J.prototype, "templates", void 0), A([x()], J.prototype, "devices", void 0), A([x()], J.prototype, "loaded", void 0), A([x()], J.prototype, "error", void 0), J = A([y("tdc-work-picker")], J);
// src/scenario/scenario-form.ts
var Y = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.submitLabel = "", this.busy = !1, this.name = "", this.steps = [], this.error = "";
	}
	willUpdate(e) {
		let t = this.info?.actions;
		this.scenario && t && this.loadedId !== this.scenario.id ? (this.loadedId = this.scenario.id, this.name = this.scenario.name, this.steps = this.scenario.steps.map(no)) : !this.scenario && t && this.steps.length === 0 && (this.steps = [$a(t)]), super.willUpdate(e);
	}
	reset() {
		this.name = "", this.error = "", this.steps = [$a(this.info?.actions ?? {})];
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
		let e = to(this.steps);
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
		return h`<fieldset>
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
		return h`
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
			extra: h`<button
          @click=${() => this.steps = [...this.steps, $a(this.info?.actions ?? {})]}
        >
          ${this.tr("scnAddStep")}
        </button>`
		})}
      <p class="error">${this.error}</p>
    `;
	}
};
A([b({ attribute: !1 })], Y.prototype, "info", void 0), A([b({ attribute: !1 })], Y.prototype, "templates", void 0), A([b({ attribute: !1 })], Y.prototype, "scenario", void 0), A([b()], Y.prototype, "submitLabel", void 0), A([b({ type: Boolean })], Y.prototype, "busy", void 0), A([x()], Y.prototype, "name", void 0), A([x()], Y.prototype, "steps", void 0), A([x()], Y.prototype, "error", void 0), Y = A([y("tdc-scenario-form")], Y);
// src/scenario/scenario-panel.ts
var uo = 3, fo = class extends P {
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
		super(), this.scenarios = [], this.devices = [], this.restoreFilter(ro, io);
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			[this.scenarios, this.devices] = await Promise.all([this.api.scenarios(), this.api.deviceNames()]);
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
	targetLabel(e, t) {
		return wa(e, t, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e }));
	}
	filterFields() {
		let e = this.hass?.language;
		return [{
			key: "devices",
			kind: "multi",
			label: this.tr("filterDevices"),
			options: En(this.scenarios, (e) => oo(e, this.devices), (e) => this.targetLabel(S, e), e)
		}, {
			key: "templates",
			kind: "multi",
			label: this.tr("filterTemplates"),
			options: En(this.scenarios, so, (e) => this.targetLabel(C, e), e)
		}];
	}
	searchTexts(e) {
		return [
			e.name,
			...oo(e, this.devices).map((e) => this.targetLabel(S, e)),
			...so(e).map((e) => this.targetLabel(C, e))
		];
	}
	renderNew() {
		return this.newPopup(this.tr("scnNew"), h`<tdc-scenario-form
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
		let t = e.steps[0], { kind: n } = t ? La(t.target) : { kind: "all" }, r = this.hass?.language, i = this.expanded.has(e.id);
		return h`<tr class="scenario card" @click=${() => this.toggle(e.id)}>
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
      ${i ? this.editRow(uo, e.id, h`<tdc-scenario-form
                .scenario=${e}
                .hass=${this.hass}
                ?busy=${this.busy}
                .templates=${this.templates}
                .info=${this.info}
              ></tdc-scenario-form>`, (t) => void this.save(e, t)) : _}`;
	}
	renderTable(e) {
		return h`<table class="cards">
      <tr>
        <th>${this.tr("schName")}</th>
        <th>${this.tr("scnSteps")}</th>
        <th>${this.tr("colActions")}</th>
      </tr>
      ${Yt(e, (e) => e.id, (e) => this.renderRow(e))}
    </table>`;
	}
	render() {
		return h`
      ${this.renderNew()}
      ${this.scenarios.length === 0 ? h`<p>${this.tr("scnNone")}</p>` : this.renderFiltered(this.scenarios, this.filterFields(), co(this.devices, (e) => this.searchTexts(e)), (e) => this.renderTable(e))}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
A([x()], fo.prototype, "scenarios", void 0), A([x()], fo.prototype, "devices", void 0), A([$e("tdc-scenario-form#new")], fo.prototype, "newForm", void 0), fo = A([y("tdc-scenario-panel")], fo);
// src/schedule/schedule-form.ts
var po = [
	w,
	et,
	tt,
	nt,
	rt
], mo = [
	"weekdayMon",
	"weekdayTue",
	"weekdayWed",
	"weekdayThu",
	"weekdayFri",
	"weekdaySat",
	"weekdaySun"
], X = class extends j {
	constructor(...e) {
		super(...e), this.templates = [], this.scenarios = [], this.submitLabel = "", this.busy = !1, this.name = "", this.scenarioId = "", this.work = Va({}), this.seed = "", this.form = Na(), this.started = !1;
	}
	willUpdate(e) {
		let t = this.info?.actions;
		this.schedule && t && this.loadedId !== this.schedule.id ? (this.loadedId = this.schedule.id, this.name = this.schedule.name, this.scenarioId = this.schedule.scenario ?? "", this.work = qa(this.schedule), this.form = Ka(this.schedule.trigger)) : !this.schedule && t && !this.started && (this.started = !0, this.work = Va(t)), super.willUpdate(e);
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
		let e = this.scenarioId ? { scenario: this.scenarioId } : Ga(this.work), t = this.schedule && "action" in e && e.action === this.schedule.action;
		return {
			name: this.name,
			...e,
			trigger: Fa(this.form),
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
		return h`<label style="flex: 1 1 140px"
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
		return h`<div class="row wide">
      ${mo.map((e, t) => h`<label style="flex-direction: row; align-items: center">
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
			case w: return h`${this.field(this.tr("schTimes"), w)} ${this.renderWeekdays()}`;
			case et: return h`${this.field(this.tr("schEveryS"), "everyS", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case tt: return this.field(this.tr("schAt"), "at", "datetime-local");
			case nt: return h`${this.field(this.tr("schCount"), "count", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case rt: return this.field(this.tr("schPerDay"), "perDay", "number");
		}
	}
	render() {
		return h`
      <div class="fields">
        ${this.textField(this.tr("schName"), this.name, (e) => this.name = e)}
      </div>
      <div class="fields">
        ${this.select(this.tr("schTrigger"), po, this.form.type, (e) => this.tr(`schTrigger_${e}`), (e) => this.setForm({ type: e }))}
        ${this.select(this.tr("schRuns"), ["", ...this.scenarios.map((e) => e.id)], this.scenarioId, (e) => e ? this.tr("schScenario", { id: this.scenarioName(e) }) : this.tr("schRunsAction"), (e) => this.scenarioId = e)}
      </div>
      ${this.scenarioId ? _ : h`<tdc-work-picker
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
A([b({ attribute: !1 })], X.prototype, "info", void 0), A([b({ attribute: !1 })], X.prototype, "templates", void 0), A([b({ attribute: !1 })], X.prototype, "scenarios", void 0), A([b({ attribute: !1 })], X.prototype, "schedule", void 0), A([b()], X.prototype, "submitLabel", void 0), A([b({ type: Boolean })], X.prototype, "busy", void 0), A([x()], X.prototype, "name", void 0), A([x()], X.prototype, "scenarioId", void 0), A([x()], X.prototype, "work", void 0), A([x()], X.prototype, "seed", void 0), A([x()], X.prototype, "form", void 0), X = A([y("tdc-schedule-form")], X);
// src/schedule/schedule-panel.ts
var ho = 6, go = 24, _o = 50, Z = class extends P {
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
		super(), this.schedules = [], this.runs = [], this.scenarios = [], this.devices = [], this.previewOpen = !1, this.restoreFilter(Ja, Ya);
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			[this.schedules, this.runs, this.scenarios, this.devices] = await Promise.all([
				this.api.schedules(),
				this.api.schedulePreview(go),
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
		return e === "all" ? n : `${n}: ${t.map((t) => wa(e, t, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e }))).join(", ")}`;
	}
	actionText(e) {
		return e.scenario ? this.tr("schScenario", { id: this.scenarioName(e.scenario) }) : Dt(this.hass?.language, e.entity, e.action);
	}
	targetOf(e) {
		let { kind: t, ids: n } = La(e.target);
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
				options: En(this.schedules, (e) => [Za(e)], (t) => t === "scenario" ? this.tr("filterScenario") : Dt(e, "", t), e)
			},
			{
				key: "targets",
				kind: "multi",
				label: this.tr("schTarget"),
				options: En(this.schedules, (e) => [La(e.target).kind], (e) => this.tr(`schTarget_${e}`), e)
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
		return this.newPopup(this.tr("schNew"), h`<tdc-schedule-form
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
		let { kind: t, ids: n } = La(e.target), r = this.expanded.has(e.id);
		return h`<tr class="schedule card" @click=${() => this.toggle(e.id)}>
        ${this.nameCell(e.id, e.name)}
        <td data-label=${this.tr("schTarget")}>
          ${e.scenario ? "–" : this.targetText(t, n)}
        </td>
        <td data-label=${this.tr("schAction")}>${this.actionText(e)}</td>
        <td data-label=${this.tr("schTrigger")}>
          ${this.tr(`schTrigger_${e.trigger.type}`)}<br /><small
            >${Ra(e.trigger)}</small
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
      ${r ? this.editRow(ho, e.id, h`<tdc-schedule-form
                .hass=${this.hass}
                .info=${this.info}
                .templates=${this.templates}
                .scenarios=${this.scenarios}
                .schedule=${e}
                ?busy=${this.busy}
              ></tdc-schedule-form>`, (t) => void this.save(e, t)) : _}`;
	}
	renderTable(e) {
		return h`<table class="cards">
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
		return this.schedules.length === 0 ? h`<p>${this.tr("schNone")}</p>` : this.renderFiltered(this.schedules, this.filterFields(), Qa((e) => this.targetOf(e), (e) => this.actionText(e)), (e) => this.renderTable(e));
	}
	actionCount() {
		let e = this.runs.length;
		return this.tr(e === 1 ? "schActionOne" : "schActions", { count: e });
	}
	renderPreview() {
		return this.runs.length === 0 ? h`<p><small>${this.tr("schNoRuns")}</small></p>` : h`<table>
        <tr>
          <th>${this.tr("schWhen")}</th>
          <th>${this.tr("schName")}</th>
        </tr>
        ${this.runs.slice(0, _o).map((e) => h`<tr>
              <td>${za(e.when)}</td>
              <td>${e.name}</td>
            </tr>`)}
      </table>
      ${this.runs.length > _o ? h`<p>
              <small>${this.tr("schMoreRuns", { count: this.runs.length - _o })}</small>
            </p>` : _}`;
	}
	render() {
		return h`
      ${this.renderNew()}
      <details
        class="section"
        ?open=${this.previewOpen}
        @toggle=${(e) => this.previewOpen = e.target.open}
      >
        <summary>
          ${this.tr("schPreview", { hours: go })} · ${this.actionCount()}
        </summary>
        ${this.renderPreview()}
      </details>
      <h3 class="list-title">${this.tr("schList")}</h3>
      ${this.renderList()}
      <p class="error">${this.error}</p>
    `;
	}
};
A([x()], Z.prototype, "schedules", void 0), A([x()], Z.prototype, "runs", void 0), A([x()], Z.prototype, "scenarios", void 0), A([x()], Z.prototype, "devices", void 0), A([x()], Z.prototype, "previewOpen", void 0), A([$e("tdc-schedule-form#new")], Z.prototype, "newForm", void 0), Z = A([y("tdc-schedule-panel")], Z);
// src/transfer/helpers.ts
var vo = [
	"devices",
	"templates",
	"schedules",
	"scenarios",
	"groups"
], yo = {
	devices: "trfDevices",
	templates: "trfTemplates",
	schedules: "trfSchedules",
	scenarios: "trfScenarios",
	groups: "trfGroups"
};
function bo(e) {
	return vo.filter((t) => t !== "groups" || e);
}
function xo(e) {
	let t = (e) => String(e).padStart(2, "0");
	return `tdc-export-${`${e.getFullYear()}${t(e.getMonth() + 1)}${t(e.getDate())}`}-${t(e.getHours())}${t(e.getMinutes())}.json`;
}
function So(e, t) {
	let n = {
		format_version: 0,
		integration_version: "",
		exported_at: t
	};
	for (let t of vo) {
		let r = e[t];
		r && (n.format_version = r[0]?.format_version ?? n.format_version, n.integration_version = r[0]?.integration_version ?? n.integration_version, n[t] = r.flatMap((e) => e.items));
	}
	return n;
}
var Co = [
	"templates",
	"devices",
	"scenarios",
	"schedules",
	"groups"
], wo = [...Co].reverse(), To = 1048576;
function Eo(e) {
	return e === "templates" ? "id" : "name";
}
function Do(e, t) {
	return e[t] ?? [];
}
function Oo(e) {
	return Co.filter((t) => Array.isArray(e[t]));
}
function ko(e) {
	for (let t of Oo(e)) {
		let n = /* @__PURE__ */ new Set();
		for (let r of Do(e, t)) {
			let e = String(r[Eo(t)] ?? "");
			if (n.has(e)) return {
				category: t,
				name: e
			};
			n.add(e);
		}
	}
}
function Ao(e, t) {
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
	if (Oo(r).length === 0) return { error: "trfBadFile" };
	let i = ko(r);
	return i ? {
		error: "trfDuplicate",
		values: { ...i }
	} : { file: r };
}
function jo(e, t) {
	let n = (n) => t.includes(n) ? Do(e, n).map((e) => String(e[Eo(n)])) : [];
	return {
		devices: n("devices"),
		templates: n("templates"),
		scenarios: n("scenarios")
	};
}
function Mo(e, t, n) {
	let r = [], i = [], a = 0;
	for (let o of e) {
		let e = JSON.stringify(o).length;
		i.length > 0 && (i.length >= t || a + e > n) && (r.push(i), i = [], a = 0), i.push(o), a += e;
	}
	return i.length > 0 && r.push(i), r;
}
function No(e) {
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
function Po(e) {
	return e.some((e) => e.update > 0 || e.delete > 0);
}
// src/transfer/transfer-panel.ts
var Fo = [
	"add",
	"sync",
	"replace"
], Io = {
	add: "trfModeAdd",
	sync: "trfModeSync",
	replace: "trfModeReplace"
}, Lo = 20, Ro = 33554432, Q = class extends j {
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
			let e = await Promise.all(bo(!0).map(async (e) => [e, (await this.api.transferExport(e, 0, 0)).total]));
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
			for (let n of bo(this.mqtt)) this.chosen.has(n) && (e[n] = await this.api.transferExportAll(n), t += e[n].reduce((e, t) => e + t.items.length, 0));
			let n = /* @__PURE__ */ new Date(), r = xo(n);
			this.download(r, JSON.stringify(So(e, n.toISOString()), null, 2)), this.message = this.tr("trfExported", {
				name: r,
				count: t
			});
		} catch (e) {
			this.error = T(e);
		}
		this.busy = !1;
	}
	importing() {
		let e = bo(this.mqtt);
		return Co.filter((t) => this.take.has(t) && e.includes(t) && this.file && Oo(this.file).includes(t));
	}
	batch(e, t, n) {
		let r = this.importing();
		return {
			category: e,
			mode: this.modes[e] ?? "add",
			items: t,
			known: jo(this.file, r),
			replacing: r.filter((e) => this.modes[e] === "replace"),
			first: n,
			file_name: this.fileName
		};
	}
	async chooseFile(e) {
		let t = e.target.files?.[0];
		if (this.plans = void 0, this.message = "", this.error = "", !t) return;
		let n = await this.api.info().catch(() => void 0), r = Ao(await t.text(), n?.limits.max_transfer_bytes ?? Ro);
		"error" in r ? (this.file = void 0, this.error = this.tr(r.error, r.values)) : (this.file = r.file, this.fileName = t.name, this.take = new Set(Oo(r.file)), this.modes = {});
	}
	async showPlan() {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let e = [];
			for (let t of this.importing()) {
				let n = Mo(Do(this.file, t), 500, To), r = [];
				for (let [e, i] of (n.length ? n : [[]]).entries()) r.push(await this.api.transferPlan(this.batch(t, i, e === 0)));
				e.push(No(r));
			}
			this.plans = e;
		} catch (e) {
			this.plans = void 0, this.error = T(e);
		}
		this.busy = !1;
	}
	async runImport() {
		this.busy = !0, this.error = "";
		try {
			let e = this.importing(), t = [];
			for (let n of wo.filter((t) => e.includes(t))) this.modes[n] === "replace" && t.push(await this.api.transferRun({
				...this.batch(n, [], !0),
				phase: "purge"
			}));
			for (let n of e) {
				let e = Mo(Do(this.file, n), 500, To);
				for (let [r, i] of e.entries()) t.push(await this.api.transferRun(this.batch(n, i, r === 0)));
			}
			let n = No(t.length ? t : [this.emptyPlan()]);
			this.message = this.tr("trfDone", {
				created: n.create,
				updated: n.update,
				deleted: n.delete,
				problems: n.problems.length
			}), this.plans = void 0, await this.loadCounts();
		} catch (e) {
			this.error = T(e);
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
		return h`<tr>
      <td>
        <label class="choice">
          <input
            type="checkbox"
            .checked=${this.take.has(e)}
            @change=${() => {
			this.take = Nt(this.take, e), this.plans = void 0;
		}}
          />
          ${this.tr(yo[e])}
          (${Do(this.file, e).length})
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
          ${Fo.map((t) => h`<option value=${t} ?selected=${(this.modes[e] ?? "add") === t}>
                ${this.tr(Io[t])}
              </option>`)}
        </select>
      </td>
    </tr>`;
	}
	renderPlan(e) {
		let t = e.flatMap((e) => e.problems);
		return h`<h3>${this.tr("trfPlanTitle")}</h3>
      <table>
        <tr>
          <th>${this.tr("trfColCategory")}</th>
          <th>${this.tr("trfColCreate")}</th>
          <th>${this.tr("trfColUpdate")}</th>
          <th>${this.tr("trfColSkip")}</th>
          <th>${this.tr("trfColConflict")}</th>
          <th>${this.tr("trfColDelete")}</th>
        </tr>
        ${e.map((e) => h`<tr>
              <td>${this.tr(yo[e.category])}</td>
              <td>${e.create}</td>
              <td>${e.update}</td>
              <td>${e.skip}</td>
              <td>${e.conflict}</td>
              <td>${e.delete}</td>
            </tr>`)}
      </table>
      ${t.length ? h`<h3>${this.tr("trfProblems")}</h3>
              <ul>
                ${t.slice(0, Lo).map((e) => h`<li>${e.name} · ${e.code} · ${e.reason}</li>`)}
              </ul>
              ${t.length > Lo ? h`<small
                      >${this.tr("trfProblemMore", { count: t.length - Lo })}</small
                    >` : ""}` : ""}
      <p>
        <button class="primary" ?disabled=${this.busy} @click=${() => void this.runImport()}>
          ${Po(e) ? this.tr("trfRunConfirm", {
			updates: e.reduce((e, t) => e + t.update, 0),
			deletes: e.reduce((e, t) => e + t.delete, 0)
		}) : this.tr("trfRun")}
        </button>
      </p>`;
	}
	renderImport() {
		return h`<section>
      <h3>${this.tr("trfImportTitle")}</h3>
      <p>${this.tr("trfImportIntro")}</p>
      <p>
        <input
          type="file"
          accept="application/json,.json"
          @change=${(e) => void this.chooseFile(e)}
        />
      </p>
      ${this.file ? h`<p><small>${this.tr("trfFileLoaded", { name: this.fileName })}</small></p>
              <table>
                ${Oo(this.file).filter((e) => bo(this.mqtt).includes(e)).map((e) => this.renderFileCategory(e))}
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
		return h`<label class="choice">
      <input
        type="checkbox"
        .checked=${this.chosen.has(e)}
        ?disabled=${t === 0}
        @change=${() => this.chosen = Nt(this.chosen, e)}
      />
      ${this.tr(yo[e])} (${t})
    </label>`;
	}
	render() {
		let e = bo(this.mqtt).filter((e) => this.chosen.has(e) && (this.counts[e] ?? 0) > 0);
		return h`
      <p>${this.tr("trfIntro")}</p>
      <section>
        <h3>${this.tr("trfExportTitle")}</h3>
        <fieldset>
          ${bo(this.mqtt).map((e) => this.renderChoice(e))}
        </fieldset>
        <p class="row">
          <button
            class="primary"
            ?disabled=${this.busy || e.length === 0}
            @click=${() => void this.exportChosen()}
          >
            ${this.tr("trfExport")}
          </button>
          ${e.length === 0 ? h`<small>${this.tr("trfNothing")}</small>` : ""}
        </p>
      </section>
      ${this.renderImport()}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
A([b({ type: Boolean })], Q.prototype, "mqtt", void 0), A([x()], Q.prototype, "counts", void 0), A([x()], Q.prototype, "chosen", void 0), A([x()], Q.prototype, "busy", void 0), A([x()], Q.prototype, "message", void 0), A([x()], Q.prototype, "error", void 0), A([x()], Q.prototype, "file", void 0), A([x()], Q.prototype, "fileName", void 0), A([x()], Q.prototype, "take", void 0), A([x()], Q.prototype, "modes", void 0), A([x()], Q.prototype, "plans", void 0), Q = A([y("tdc-transfer-panel")], Q);
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
		return h`<button
      class=${this.tab === e ? "active" : ""}
      @click=${() => {
			this.tab = e, this.loadInfo();
		}}
    >
      ${t}
    </button>`;
	}
	render() {
		return h`
      <header>
        <h2>${this.tr("title")}</h2>
        <span class="badge">${this.tr("badge")}</span>
        ${this.lapse > 1 ? h`<span class="badge">${this.tr("badgeLapse", { factor: this.lapse })}</span>` : ""}
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
      ${this.tab === "devices" ? h`<tdc-device-list
              .hass=${this.hass}
              @tdc-remove=${this.startRemoval}
            ></tdc-device-list>` : ""}
      ${this.tab === "schedules" ? h`<tdc-schedule-panel .hass=${this.hass}></tdc-schedule-panel>` : ""}
      ${this.tab === "scenarios" ? h`<tdc-scenario-panel .hass=${this.hass}></tdc-scenario-panel>` : ""}
      ${this.tab === "groups" ? h`<tdc-group-panel .hass=${this.hass}></tdc-group-panel>` : ""}
      ${this.tab === "history" ? h`<tdc-history-panel .hass=${this.hass}></tdc-history-panel>` : ""}
      ${this.tab === "remove" ? h`<tdc-removal-panel
              .hass=${this.hass}
              .target=${this.removeTarget}
              .targetId=${this.removeId}
            ></tdc-removal-panel>` : ""}
      ${this.tab === "transfer" ? h`<tdc-transfer-panel .hass=${this.hass} .mqtt=${this.mqtt}></tdc-transfer-panel>` : ""}
    `;
	}
};
A([b({ type: Boolean })], $.prototype, "narrow", void 0), A([x()], $.prototype, "tab", void 0), A([x()], $.prototype, "removeTarget", void 0), A([x()], $.prototype, "removeId", void 0), A([x()], $.prototype, "lapse", void 0), A([x()], $.prototype, "mqtt", void 0), $ = A([y("hass-test-data-creator-panel")], $);
export { $ as TdcPanel };
