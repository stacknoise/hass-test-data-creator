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
}), h = Ae(1), je = Ae(2), g = Symbol.for("lit-noChange"), _ = Symbol.for("lit-nothing"), Me = /* @__PURE__ */ new WeakMap(), Ne = _e.createTreeWalker(_e, 129);
function Pe(e, t) {
	if (!be(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return pe === void 0 ? t : pe.createHTML(t);
}
var Fe = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Ce;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, ee = 0;
		for (; ee < n.length && (o.lastIndex = ee, c = o.exec(n), c !== null);) ee = o.lastIndex, o === Ce ? c[1] === "!--" ? o = we : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = Ee) : (ke.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = Ee) : o = Te : o === Ee ? c[0] === ">" ? (o = i ?? Ce, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? Ee : c[3] === "\"" ? Oe : De) : o === Oe || o === De ? o = Ee : o === we || o === Te ? o = Ce : (o = Ee, i = void 0);
		let u = o === Ee && e[t + 1].startsWith("/>") ? " " : "";
		a += o === Ce ? n + ge : l >= 0 ? (r.push(s), n.slice(0, l) + me + n.slice(l) + m + u) : n + m + (l === -2 ? t : u);
	}
	return [Pe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ie = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, ee] = Fe(t, n);
		if (this.el = e.createElement(l, r), Ne.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = Ne.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(me)) {
					let t = ee[o++], n = i.getAttribute(e).split(m), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Ve : r[1] === "?" ? He : r[1] === "@" ? Ue : Be
					}), i.removeAttribute(e);
				} else e.startsWith(m) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (ke.test(i.tagName)) {
					let e = i.textContent.split(m), t = e.length - 1;
					if (t > 0) {
						i.textContent = fe ? fe.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], ve()), Ne.nextNode(), c.push({
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
function Le(e, t, n = e, r) {
	if (t === g) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = ye(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = Le(e, i._$AS(e, t.values), i, r)), t;
}
var Re = class {
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
		Ne.currentNode = r;
		let i = Ne.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new ze(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new We(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = Ne.nextNode(), a++);
		}
		return Ne.currentNode = _e, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, ze = class e {
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
		e = Le(this, e, t), ye(e) ? e === _ || e == null || e === "" ? (this._$AH !== _ && this._$AR(), this._$AH = _) : e !== this._$AH && e !== g && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? xe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
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
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ie.createElement(Pe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Re(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Me.get(e.strings);
		return t === void 0 && Me.set(e.strings, t = new Ie(e)), t;
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
}, Be = class {
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
		if (i === void 0) e = Le(this, e, t, 0), a = !ye(e) || e !== this._$AH && e !== g, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = Le(this, r[n + o], t, o), s === g && (s = this._$AH[o]), a ||= !ye(s) || s !== this._$AH[o], s === _ ? e = _ : e !== _ && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === _ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Ve = class extends Be {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === _ ? void 0 : e;
	}
}, He = class extends Be {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== _);
	}
}, Ue = class extends Be {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = Le(this, e, t, 0) ?? _) === g) return;
		let n = this._$AH, r = e === _ && n !== _ || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== _ && (n === _ || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, We = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		Le(this, e);
	}
}, Ge = {
	M: me,
	P: m,
	A: he,
	C: 1,
	L: Fe,
	R: Re,
	D: xe,
	V: Le,
	I: ze,
	H: Be,
	N: He,
	U: Ue,
	B: Ve,
	F: We
}, Ke = ue.litHtmlPolyfillSupport;
Ke?.(Ie, ze), (ue.litHtmlVersions ??= []).push("3.3.3");
var qe = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new ze(t.insertBefore(ve(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Je = globalThis, Ye = class extends le {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = qe(t, this.renderRoot, this.renderOptions);
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
Ye._$litElement$ = !0, Ye.finalized = !0, Je.litElementHydrateSupport?.({ LitElement: Ye });
var Xe = Je.litElementPolyfillSupport;
Xe?.({ LitElement: Ye }), (Je.litElementVersions ??= []).push("4.2.2");
// node_modules/@lit/reactive-element/decorators/custom-element.js
var v = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, Ze = {
	attribute: !0,
	type: String,
	converter: oe,
	reflect: !1,
	hasChanged: se
}, Qe = (e = Ze, t, n) => {
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
function y(e) {
	return (t, n) => typeof n == "object" ? Qe(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function b(e) {
	return y({
		...e,
		state: !0,
		attribute: !1
	});
}
// node_modules/@lit/reactive-element/decorators/base.js
var $e = (e, t, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, n), n);
// node_modules/@lit/reactive-element/decorators/query.js
function et(e, t) {
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
			return $e(n, r, { get() {
				let n = e.call(this);
				return n === void 0 && (n = a(this), (n !== null || this.hasUpdated) && t.call(this, n)), n;
			} });
		}
		return $e(n, r, { get() {
			return a(this);
		} });
	};
}
// src/common/constants.ts
var x = "device", S = "template", C = "times", tt = "interval", nt = "once", rt = "random_window", it = "poisson", at = "enum", ot = "state_machine", st = "noise", ct = "phase", lt = "interval_s", ut = "shape", dt = "sensor", ft = "devices", pt = "groups", mt = "tdc-submit", ht = "hass_test_data_creator", gt = 3e4, _t = 3e5, vt = /* @__PURE__ */ new Map();
function yt(e, t, n) {
	let r = vt.get(e);
	if (r && Date.now() - r.at < t) return r.value;
	let i = n();
	return vt.set(e, {
		at: Date.now(),
		value: i
	}), i.catch(() => vt.delete(e)), i;
}
var bt = class {
	constructor(e) {
		this.hass = e;
	}
	info() {
		return yt("info", gt, () => this.call("info"));
	}
	templates() {
		return yt("templates", _t, () => this.call("templates/list"));
	}
	async saveTemplate(e, t, n) {
		let r = await this.call("templates/save", {
			template_id: e,
			name: t,
			entities: n
		});
		return vt.delete("templates"), r;
	}
	async deleteTemplate(e) {
		await this.call("templates/delete", { template_id: e }), vt.delete("templates");
	}
	logGet(e, t, n = {}) {
		return this.call("log/get", Object.keys(n).length ? {
			since: e,
			limit: t,
			filter: n
		} : {
			since: e,
			limit: t
		});
	}
	logStop() {
		return this.call("log/set", { capture: !1 });
	}
	logClear() {
		return this.call("log/clear");
	}
	async sourcesList(e, t = 50) {
		return (await this.call("sources/list", {
			query: e,
			limit: t
		})).devices;
	}
	async sourcesInspect(e) {
		return (await this.call("sources/inspect", { device_id: e })).entities;
	}
	sourcesDerive(e) {
		return this.call("sources/derive", { device_id: e });
	}
	sourcesPreview(e, t, n, r = {}) {
		return this.call("sources/preview", {
			entity_id: e,
			key: t,
			deviation: n,
			count: r.count ?? 5,
			...r.seed ? { seed: r.seed } : {},
			...r.template ? { template: r.template } : {}
		});
	}
	async sourcesRemoved() {
		return (await this.call("sources/removed")).sources;
	}
	setSeed(e, t, n) {
		return this.call("devices/set_seed", {
			devices: e,
			seed: t,
			...n ? { entity: n } : {}
		});
	}
	confirmSourceRemoved(e, t) {
		return this.call("devices/confirm_source_removed", {
			source: e,
			remove: t
		});
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
	bulkPause(e, t) {
		return this.call("devices/bulk_pause", {
			...e,
			paused: t
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
			type: `${ht}/${e}`,
			...n
		});
	}
};
function w(e) {
	if (typeof e == "object" && e && "message" in e) {
		let { code: t, message: n } = e;
		return t ? `${t}: ${n}` : n;
	}
	return String(e);
}
// src/common/i18n.ts
var xt = {
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
		detSeed: "Seed",
		detSeedSet: "Set seed",
		detSeedRandom: "Random seed",
		detSaveCurve: "Save curve",
		detLive: "Live view",
		detLiveColumn: "Live (1-second interval)",
		detLiveHint: "Reads the values every second while this device is open",
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
		filterPaused: "Paused",
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
		pause: "Pause",
		resume: "Resume",
		pausedBadge: "Paused",
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
		tabLog: "Log",
		logIntro: "Every state change of the generated entities while this tab is open. Nothing is stored; closing the tab empties the log.",
		logPause: "Pause",
		logResume: "Resume",
		logClear: "Clear",
		logSave: "Save to file",
		logSaveCsv: "CSV",
		logSaveJson: "JSON",
		logCount: "{count} entries",
		logNew: "{count} new",
		logMissed: "{count} entries were missed because they came too fast",
		logEmpty: "No changes yet. They appear here as the entities change.",
		follow: "Follow device",
		seedHintSource: "Sets how the copies deviate from the source",
		sourceIntro: "The devices copy the values of a real device (read only) and deviate from it by their seed. If the source is offline, the copies are offline too.",
		sourceSearch: "Search device",
		sourceNoMatch: "No device found",
		sourceUnusable: "No entity that a copy could follow",
		sourceChosen: "Source: {name}",
		sourceChange: "Change",
		sourceColSource: "Source entity",
		sourceColValue: "Current value",
		sourceOffset: "Offset (±)",
		sourceScale: "Factor (± %)",
		sourceNoise: "Noise (% of range)",
		sourceLag: "Delay (up to s)",
		sourceDropout: "Dropout (%)",
		sourceDecimals: "Decimals",
		sourcePreview: "Preview",
		sourceNow: "Source {value} {unit}, five copies",
		colSource: "Source",
		filterSource: "Source",
		filterSourceState: "Source state",
		filterSourceWith: "With source",
		filterSourceWithout: "Without source",
		filterSourceNone: "(none)",
		sourceState_ok: "ok",
		sourceState_offline: "offline",
		sourceState_removed: "removed",
		sourceFilterBy: "Show the devices of this source",
		detSource: "Source",
		sourceFollows: "follows {entity}",
		sourceRemovedAsk: "The source {name} was removed. Remove its {count} copies?",
		sourceRemoveYes: "Remove copies",
		sourceKeepNo: "Keep them offline",
		sourceLogFilter: "Source",
		logNoMatches: "No change matches the filter.",
		logOnlyNumeric: "Numbers only",
		logWindow: "Time window",
		logWindowMinutes: "Last {count} min",
		logMinDelta: "Minimum change",
		logMinDeltaValue: "from {value}",
		logFilterCause: "Cause",
		logShow: "Show in log",
		logSaved: "{name} saved with {count} entries",
		logColTime: "Time",
		logColDevice: "Device",
		logColEntity: "Entity",
		logColChange: "Change",
		logColCause: "Cause",
		logCause_signal: "Curve",
		logCause_action: "Action",
		logCause_fault: "Fault",
		logCause_source: "Source",
		logCause_restore: "Restore",
		logCause_other: "Other",
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
		bulkPaused: "{count} devices paused",
		bulkResumed: "{count} devices resumed",
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
		detSeed: "Seed",
		detSeedSet: "Seed setzen",
		detSeedRandom: "Zufälliger Seed",
		detSaveCurve: "Kurve speichern",
		detLive: "Live-Ansicht",
		detLiveColumn: "Live (1-Sekunden-Takt)",
		detLiveHint: "Liest die Werte jede Sekunde, solange das Gerät geöffnet ist",
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
		filterPaused: "Pausiert",
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
		pause: "Pausieren",
		resume: "Fortsetzen",
		pausedBadge: "Pausiert",
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
		tabLog: "Log",
		logIntro: "Jede Zustandsänderung der generierten Entitäten, solange dieser Tab offen ist. Es wird nichts gespeichert; beim Schließen des Tabs wird das Log geleert.",
		logPause: "Pause",
		logResume: "Weiter",
		logClear: "Leeren",
		logSave: "In Datei speichern",
		logSaveCsv: "CSV",
		logSaveJson: "JSON",
		logCount: "{count} Einträge",
		logNew: "{count} neu",
		logMissed: "{count} Einträge fehlen, weil sie zu schnell kamen",
		logEmpty: "Noch keine Änderungen. Sie erscheinen hier, sobald sich Entitäten ändern.",
		follow: "Gerät folgen",
		seedHintSource: "Legt fest, wie die Kopien von der Quelle abweichen",
		sourceIntro: "Die Geräte übernehmen die Werte eines echten Geräts (nur lesend) und weichen per Seed davon ab. Ist die Quelle offline, sind auch die Kopien offline.",
		sourceSearch: "Gerät suchen",
		sourceNoMatch: "Kein Gerät gefunden",
		sourceUnusable: "Keine Entität, der eine Kopie folgen könnte",
		sourceChosen: "Quelle: {name}",
		sourceChange: "Ändern",
		sourceColSource: "Quell-Entität",
		sourceColValue: "Aktueller Wert",
		sourceOffset: "Versatz (±)",
		sourceScale: "Faktor (± %)",
		sourceNoise: "Rauschen (% des Bereichs)",
		sourceLag: "Verzögerung (bis s)",
		sourceDropout: "Aussetzer (%)",
		sourceDecimals: "Nachkommastellen",
		sourcePreview: "Vorschau",
		sourceNow: "Quelle {value} {unit}, fünf Kopien",
		colSource: "Quelle",
		filterSource: "Quelle",
		filterSourceState: "Quellzustand",
		filterSourceWith: "Mit Quelle",
		filterSourceWithout: "Ohne Quelle",
		filterSourceNone: "(ohne)",
		sourceState_ok: "ok",
		sourceState_offline: "offline",
		sourceState_removed: "entfernt",
		sourceFilterBy: "Geräte dieser Quelle zeigen",
		detSource: "Quelle",
		sourceFollows: "folgt {entity}",
		sourceRemovedAsk: "Die Quelle {name} wurde entfernt. Die {count} Kopien entfernen?",
		sourceRemoveYes: "Kopien entfernen",
		sourceKeepNo: "Offline lassen",
		sourceLogFilter: "Quelle",
		logNoMatches: "Keine Änderung passt zum Filter.",
		logOnlyNumeric: "Nur Zahlenwerte",
		logWindow: "Zeitfenster",
		logWindowMinutes: "Letzte {count} Min.",
		logMinDelta: "Mindeständerung",
		logMinDeltaValue: "ab {value}",
		logFilterCause: "Ursache",
		logShow: "Im Log zeigen",
		logSaved: "{name} mit {count} Einträgen gespeichert",
		logColTime: "Zeit",
		logColDevice: "Gerät",
		logColEntity: "Entität",
		logColChange: "Änderung",
		logColCause: "Ursache",
		logCause_signal: "Kurve",
		logCause_action: "Aktion",
		logCause_fault: "Fehler",
		logCause_source: "Quelle",
		logCause_restore: "Wiederherstellung",
		logCause_other: "Sonstiges",
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
		bulkPaused: "{count} Geräte pausiert",
		bulkResumed: "{count} Geräte fortgesetzt",
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
function St(e) {
	return e?.toLowerCase().startsWith("de") ? "de" : "en";
}
function Ct(e, t, n = {}) {
	return xt[e][t].replace(/\{(\w+)\}/g, (e, t) => t in n ? String(n[t]) : e);
}
// src/common/labels.ts
var wt = {
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
}, Tt = {
	en: wt,
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
}, Et = {
	native: "outputNative",
	mqtt: "outputMqtt",
	z2m: "outputZ2m"
}, Dt = "fault_";
function T(e, t, n) {
	return Tt[St(e)][t][n] ?? n;
}
function E(e, t) {
	return t.startsWith(Dt) ? `${St(e) === "de" ? "Störung" : "Fault"}: ${T(e, "fault", t.slice(6))}` : T(e, "action", t);
}
function Ot(e, t, n) {
	return `${t ? `${T(e, "entity", t)}: ` : ""}${E(e, n)}`;
}
function D(e, t, n) {
	return Tt[St(e)].template[t] ?? n;
}
function kt(e, t, n) {
	let r = wt.entity[t];
	return r !== void 0 && r === n ? T(e, "entity", t) : n;
}
function At(e, t) {
	return t === null ? "–" : T(e, "state", t);
}
var jt = /* @__PURE__ */ new Map();
function Mt(e) {
	let t = St(e), n = jt.get(t);
	return n === void 0 && (n = new Intl.Collator(t, {
		numeric: !0,
		sensitivity: "base"
	}), jt.set(t, n)), n;
}
function O(e, t, n) {
	let r = Mt(e);
	return [...t].sort((e, t) => r.compare(n(e), n(t)));
}
// \0@oxc-project+runtime@0.155.0/helpers/esm/decorate.js
function k(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/common/base.ts
var Nt = o`
  :host {
    container-type: inline-size;
  }
`;
function Pt(e, t) {
	let n = new Set(e);
	return n.delete(t) || n.add(t), n;
}
var Ft = o`
  border-radius: 6px;
  border: 1px solid var(--divider-color);
  background: var(--card-background-color);
  color: var(--primary-text-color);
`, A = class extends Ye {
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
      ${Ft}
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
      ${Ft}
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
			api: new bt(this.hass)
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
        ${O(this.hass?.language, t, r).map((e) => h`<option value=${e} ?selected=${e === n || t.length === 1}>
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
		return Ct(St(this.hass?.language), e, t);
	}
};
k([y({ attribute: !1 })], A.prototype, "hass", void 0);
// node_modules/lit-html/directive.js
var It = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, Lt = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Rt = class {
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
}, { I: zt } = Ge, Bt = (e) => e, Vt = (e) => e.strings === void 0, Ht = () => document.createComment(""), Ut = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new zt(r.insertBefore(Ht(), i), r.insertBefore(Ht(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = Bt(e).nextSibling;
				Bt(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, Wt = (e, t, n = e) => (e._$AI(t, n), e), Gt = {}, Kt = (e, t = Gt) => e._$AH = t, qt = (e) => e._$AH, Jt = (e) => {
	e._$AR(), e._$AA.remove();
}, Yt = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, Xt = Lt(class extends Rt {
	constructor(e) {
		if (super(e), e.type !== It.CHILD) throw Error("repeat() can only be used in text expressions");
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
		let i = qt(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, ee, u = 0, d = i.length - 1, f = 0, p = a.length - 1;
		for (; u <= d && f <= p;) if (i[u] === null) u++;
		else if (i[d] === null) d--;
		else if (s[u] === o[f]) c[f] = Wt(i[u], a[f]), u++, f++;
		else if (s[d] === o[p]) c[p] = Wt(i[d], a[p]), d--, p--;
		else if (s[u] === o[p]) c[p] = Wt(i[u], a[p]), Ut(e, c[p + 1], i[u]), u++, p--;
		else if (s[d] === o[f]) c[f] = Wt(i[d], a[f]), Ut(e, i[u], i[d]), d--, f++;
		else if (l === void 0 && (l = Yt(o, f, p), ee = Yt(s, u, d)), l.has(s[u])) {
			if (l.has(s[d])) {
				let t = ee.get(o[f]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = Ut(e, i[u]);
					Wt(t, a[f]), c[f] = t;
				} else c[f] = Wt(n, a[f]), Ut(e, i[u], n), i[t] = null;
				f++;
			} else Jt(i[d]), d--;
		} else Jt(i[u]), u++;
		for (; f <= p;) {
			let t = Ut(e, c[p + 1]);
			Wt(t, a[f]), c[f++] = t;
		}
		for (; u <= d;) {
			let e = i[u++];
			e !== null && Jt(e);
		}
		return this.ut = o, Kt(e, c), g;
	}
}), Zt = class extends A {
	constructor(...e) {
		super(...e), this.open = !1, this.heading = "";
	}
	static {
		this.styles = [A.styles, o`
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
k([y({ type: Boolean })], Zt.prototype, "open", void 0), k([y()], Zt.prototype, "heading", void 0), k([et("dialog")], Zt.prototype, "dialog", void 0), Zt = k([v("tdc-dialog")], Zt);
// node_modules/lit-html/directives/live.js
var Qt = Lt(class extends Rt {
	constructor(e) {
		if (super(e), e.type !== It.PROPERTY && e.type !== It.ATTRIBUTE && e.type !== It.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
		if (!Vt(e)) throw Error("`live` bindings can only contain a single expression");
	}
	render(e) {
		return e;
	}
	update(e, [t]) {
		if (t === g || t === _) return t;
		let n = e.element, r = e.name;
		if (e.type === It.PROPERTY) {
			if (t === n[r]) return g;
		} else if (e.type === It.BOOLEAN_ATTRIBUTE) {
			if (!!t === n.hasAttribute(r)) return g;
		} else if (e.type === It.ATTRIBUTE && n.getAttribute(r) === t + "") return g;
		return Kt(e), t;
	}
}), $t = "query", en = "sort", tn = "descending", nn = [en, tn], rn = "tdc.filter.";
function an(e) {
	return e === "multi" ? [] : e !== "switch" && "";
}
function on(e) {
	return {
		[$t]: "",
		[en]: "",
		[tn]: !1,
		...Object.fromEntries(e.map((e) => [e.key, an(e.kind)]))
	};
}
function sn(e, t) {
	let n = on(e);
	return {
		...n,
		...Object.fromEntries(nn.map((e) => [e, t[e] ?? n[e]]))
	};
}
function cn(e, t) {
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
function ln(e, t) {
	return +!!String(t.query ?? "").trim() + cn(e, t).length;
}
function un(e, t, n) {
	let r = e.find((e) => e.key === n.key);
	if (!r) return t;
	let i = t[n.key], a = Array.isArray(i) ? i.filter((e) => e !== n.value) : an(r.kind);
	return {
		...t,
		[n.key]: a
	};
}
function dn(e, t) {
	let n = on(e);
	if (typeof t != "object" || !t) return n;
	let r = t, i = { ...n };
	for (let [e, t] of Object.entries(n)) {
		let n = r[e];
		(Array.isArray(t) && Array.isArray(n) && n.every((e) => typeof e == "string") || typeof t == "string" && typeof n == "string" || typeof t == "boolean" && typeof n == "boolean") && (i[e] = n);
	}
	return i;
}
function fn(e, t) {
	try {
		let n = sessionStorage.getItem(`${rn}${e}`);
		return dn(t, n ? JSON.parse(n) : null);
	} catch {
		return on(t);
	}
}
function pn(e, t) {
	try {
		sessionStorage.setItem(`${rn}${e}`, JSON.stringify(t));
	} catch {}
}
// src/common/shortcuts.ts
function mn(e) {
	if (!(e.modified || e.dialogOpen)) {
		if (e.key === "/" && !e.typing) return "search";
		if (e.key === "Escape" && (e.inSearch || !e.typing)) return "reset";
	}
}
function hn(e) {
	return e instanceof HTMLElement ? e.isContentEditable || [
		"INPUT",
		"TEXTAREA",
		"SELECT"
	].includes(e.tagName) || e.getAttribute("role") === "combobox" : !1;
}
// src/common/popover.ts
var gn = 4, _n = 12, vn = 320, yn = 120, bn = 200, xn = o`
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
`, Sn = class extends A {
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
		let t = this.getBoundingClientRect(), n = window.innerHeight - t.bottom - _n, r = t.top - _n, i = n < bn && r > n, a = i ? r : n, { style: o } = e;
		o.left = `${t.left}px`, o.minWidth = `${t.width}px`, o.maxHeight = `${Math.max(yn, Math.min(vn, a))}px`, o.top = i ? "" : `${t.bottom + gn}px`, o.bottom = i ? `${window.innerHeight - t.top + gn}px` : "";
	}
};
k([b()], Sn.prototype, "open", void 0);
// src/common/multi-select.ts
function Cn(e, t, n) {
	let r = t.trim();
	if (!r) return e;
	let i = e.filter((e) => e !== r);
	return n ? [...i, r] : i;
}
var j = class extends Sn {
	constructor(...e) {
		super(...e), this.items = [], this.selected = [], this.allowAdd = !1, this.single = !1, this.empty = "", this.draft = "";
	}
	static {
		this.styles = [
			A.styles,
			xn,
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
		if (!this.single) return this.emit(Cn(this.selected, e, t));
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
		return O(this.hass?.language, [...this.items, ...t], (e) => e.label);
	}
	renderAdd() {
		return h`<div class="row add">
      <input
        .value=${Qt(this.draft)}
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
k([y({ attribute: !1 })], j.prototype, "items", void 0), k([y({ attribute: !1 })], j.prototype, "selected", void 0), k([y({ type: Boolean })], j.prototype, "allowAdd", void 0), k([y({ type: Boolean })], j.prototype, "single", void 0), k([y()], j.prototype, "empty", void 0), k([b()], j.prototype, "draft", void 0), j = k([v("tdc-multi-select")], j);
var M = class extends A {
	constructor(...e) {
		super(...e), this.fields = [], this.values = {}, this.sorts = [], this.searchLabel = "", this.searchBefore = "", this.matched = 0, this.total = 0, this.hideCount = !1, this.draft = {}, this.onKey = (e) => {
			let t = this.shadowRoot?.querySelector("input[type=search]"), n = e.composedPath()[0] ?? null, r = mn({
				key: e.key,
				modified: e.ctrlKey || e.metaKey || e.altKey,
				typing: hn(n),
				inSearch: n === t,
				dialogOpen: document.querySelector("tdc-dialog[open]") !== null
			});
			r === "search" && t ? (e.preventDefault(), t.focus(), t.select()) : r === "reset" && ln(this.fields, this.draft) > 0 && (this.replace(sn(this.fields, this.draft)), t?.blur());
		};
	}
	static {
		this.styles = [A.styles, o`
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
		let e = this.draft[tn] === !0, t = String(this.draft.sort ?? "");
		return h`<label class="narrow">
        ${this.tr("filterSortBy")}
        <select
          .value=${Qt(t)}
          @change=${(e) => this.set(en, e.target.value, !0)}
        >
          <option value="">${this.tr("sortDefault")}</option>
          ${this.sorts.map((e) => h`<option value=${e.value}>${e.label}</option>`)}
        </select>
      </label>
      <button
        class="narrow"
        title=${this.tr(e ? "sortDescending" : "sortAscending")}
        @click=${() => this.set(tn, !e, !0)}
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
			t.preventDefault(), this.replace(un(this.fields, this.draft, e));
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
        .value=${Qt(String(this.draft.query ?? ""))}
        @input=${(e) => this.set($t, e.target.value)}
      />
    </label>`;
	}
	render() {
		let e = cn(this.fields, this.draft), t = ln(this.fields, this.draft) > 0;
		return h`
      <div class="row bar">
        ${this.searchFirst() ? this.renderSearch() : _}
        ${this.fields.map((e) => h`${e.key === this.searchBefore ? this.renderSearch() : _}${this.renderField(e)}`)}
        ${this.renderSort()}
      </div>
      <div class="row chips">
        ${e.map((e) => this.renderChip(e))}
        ${t ? h`<button @click=${() => this.replace(sn(this.fields, this.draft))}>
                ${this.tr("filterReset")}
              </button>` : _}
        ${this.hideCount ? _ : h`<small class="count">
                ${this.tr("filterCount", {
			matched: this.matched,
			total: this.total
		})}
              </small>`}
      </div>
    `;
	}
};
k([y({ attribute: !1 })], M.prototype, "fields", void 0), k([y({ attribute: !1 })], M.prototype, "values", void 0), k([y({ attribute: !1 })], M.prototype, "sorts", void 0), k([y()], M.prototype, "searchLabel", void 0), k([y()], M.prototype, "searchBefore", void 0), k([y({ type: Number })], M.prototype, "matched", void 0), k([y({ type: Number })], M.prototype, "total", void 0), k([y({ type: Boolean })], M.prototype, "hideCount", void 0), k([b()], M.prototype, "draft", void 0), M = k([v("tdc-filter-bar")], M);
// src/common/list-filter.ts
function wn(e, t) {
	return e.toLocaleLowerCase().includes(t);
}
function Tn(e) {
	return Array.isArray(e) ? e : typeof e == "string" && e ? [e] : [];
}
function En(e, t, n, r) {
	let i = String(n.query ?? "").trim().toLocaleLowerCase();
	return e.filter((e) => i && !r.texts(e).some((e) => wn(e, i)) ? !1 : t.every((t) => {
		let i = r.values(e, t.key);
		if (t.kind === "switch") return n[t.key] !== !0 || i === !0;
		let a = Tn(n[t.key]);
		return a.length === 0 || Array.isArray(i) && i.some((e) => a.includes(e));
	}));
}
function Dn(e, t, n, r) {
	return O(r, [...new Set(e.flatMap(t))].map((e) => ({
		value: e,
		label: n(e)
	})), (e) => e.label);
}
// src/common/polling.ts
var On = 1e4;
function kn(e, t = On) {
	let n = window.setInterval(() => {
		document.hidden || e();
	}, t);
	return () => window.clearInterval(n);
}
var N = class extends A {
	constructor(...e) {
		super(...e), this.templates = [], this.message = "", this.error = "", this.busy = !1, this.expanded = /* @__PURE__ */ new Set(), this.creating = !1, this.listFilter = {}, this.listFilterTab = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.loadOptions(), this.refresh(), this.stopPolling = kn(() => void this.refresh());
	}
	disconnectedCallback() {
		this.stopPolling?.(), super.disconnectedCallback();
	}
	async loadOptions() {
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.optionsLoaded(this.info);
		} catch (e) {
			this.error = w(e);
		}
	}
	restoreFilter(e, t) {
		this.listFilterTab = e, this.listFilter = fn(e, t);
	}
	setListFilter(e) {
		this.listFilter = e, pn(this.listFilterTab, e);
	}
	renderFiltered(e, t, n, r) {
		let i = En(e, t, this.listFilter, n);
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
              <button @click=${() => this.setListFilter(sn(t, on(t)))}>
                ${this.tr("filterReset")}
              </button>
            </p>` : r(i)}`;
	}
	toggle(e) {
		this.expanded = Pt(this.expanded, e);
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
			this.error = w(e);
		}
		this.busy = !1;
	}
};
k([b()], N.prototype, "info", void 0), k([b()], N.prototype, "templates", void 0), k([b()], N.prototype, "message", void 0), k([b()], N.prototype, "error", void 0), k([b()], N.prototype, "busy", void 0), k([b()], N.prototype, "expanded", void 0), k([b()], N.prototype, "creating", void 0), k([b()], N.prototype, "listFilter", void 0);
// src/common/menu-button.ts
var An = class extends Sn {
	constructor(...e) {
		super(...e), this.label = "", this.items = [], this.disabled = !1;
	}
	static {
		this.styles = [
			A.styles,
			xn,
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
k([y()], An.prototype, "label", void 0), k([y({ attribute: !1 })], An.prototype, "items", void 0), k([y({ type: Boolean })], An.prototype, "disabled", void 0), An = k([v("tdc-menu-button")], An);
// src/devices/helpers.ts
var jn = {
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
}, Mn = "fault_";
function Nn(e, t) {
	let n = e[t] ?? [];
	return {
		plain: n.filter((e) => !e.startsWith("fault_") && !(e in jn)),
		withValue: n.filter((e) => e in jn),
		faults: n.filter((e) => e.startsWith(Mn)).map((e) => e.slice(6))
	};
}
function Pn(e, t) {
	let n = jn[e], r = Number(t);
	if (n && t.trim() !== "" && !Number.isNaN(r) && !(r < n.min || r > n.max)) return { [n.param]: r };
}
function Fn(e) {
	let t = Number(e);
	return e.trim() !== "" && t > 0 ? { duration_s: t } : void 0;
}
function In(e, t) {
	let n = [...Object.values(e ?? {}).map((e) => e.name), ...t.flatMap((e) => e.area ? [e.area] : [])];
	return [...new Set(n)].sort((e, t) => e.localeCompare(t));
}
var Ln = [
	"schedules",
	"scenarios",
	pt
];
function Rn(e) {
	return Ln.flatMap((t) => (e?.[t] ?? []).map((e) => ({
		kind: t,
		name: e.name
	})));
}
function zn(e, t) {
	return e <= 0 ? 0 : Math.floor((e - 1) / t) * t;
}
var Bn = [
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
		key: "sources",
		kind: "multi",
		label: ""
	},
	{
		key: "source_state",
		kind: "choice",
		label: ""
	},
	{
		key: "custom",
		kind: "switch",
		label: ""
	}
], Vn = "custom";
function Hn(e, t) {
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
function Un(e, t) {
	return e.sort === t ? e.descending === !0 ? "descending" : "ascending" : "none";
}
var Wn = "devices";
function Gn(e) {
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
		sources: t("sources"),
		source_state: n("source_state"),
		custom: e.custom === !0 || void 0,
		state: n("state"),
		sort: n("sort"),
		descending: e.descending === !0 || void 0
	};
	return Object.fromEntries(Object.entries(r).filter(([, e]) => e !== void 0));
}
function Kn(e, t, n) {
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
function qn(e) {
	return e === "removed" ? {
		text: "sourceState_removed",
		tone: "error"
	} : e === "offline" ? {
		text: "sourceState_offline",
		tone: "warn"
	} : {
		text: "sourceState_ok",
		tone: "ok"
	};
}
// src/wizard/common-fields.ts
var Jn = "custom", Yn = ["even", "random"], Xn = {
	even: "modeEven",
	random: "modeRandom"
}, Zn = {
	template: "",
	count: 10,
	pattern: "{template} {nn}",
	areas: [],
	mode: "even",
	output: "native",
	seed: ""
}, P = class extends A {
	constructor(...e) {
		super(...e), this.templates = [], this.allowCustom = !1, this.noTemplate = !1, this.seedHint = "seedHint", this.values = Zn;
	}
	willUpdate(e) {
		e.has("templates") && !this.noTemplate && !this.values.template && this.templates.length && this.set({ template: this.templates[0].id });
	}
	set(e) {
		this.values = {
			...this.values,
			...e
		}, this.dispatchEvent(new CustomEvent("tdc-fields-change", { detail: this.values }));
	}
	templateOptions(e) {
		let t = this.hass?.language;
		return O(t, this.templates.filter((t) => !t.bundled === e).map((e) => ({
			id: e.id,
			label: D(t, e.id, e.name)
		})), (e) => e.label);
	}
	option(e, t) {
		let n = e === Jn;
		return h`<option
      value=${e}
      ?selected=${e === this.values.template}
      style=${n ? "font-weight: bold" : ""}
    >
      ${n ? "✚ " : ""}${t}
    </option>`;
	}
	renderTemplate() {
		let e = this.templateOptions(!0);
		return h`<label
      >${this.tr(S)}
      <select
        @change=${(e) => this.set({ template: e.target.value })}
      >
        ${this.templateOptions(!1).map((e) => this.option(e.id, e.label))}
        ${e.length ? h`<optgroup label=${this.tr("ownTemplates")}>
                ${e.map((e) => this.option(e.id, e.label))}
              </optgroup>` : ""}
        ${this.allowCustom ? h`<hr />
                ${this.option(Jn, this.tr("customTemplate"))}` : ""}
      </select>
    </label>`;
	}
	render() {
		let e = this.values;
		return h`<div class="fields">
      ${this.noTemplate ? _ : this.renderTemplate()}
      <label
        >${this.tr("count")}
        <input
          type="number"
          min="1"
          .value=${String(e.count)}
          @input=${(e) => this.set({ count: Number(e.target.value) })}
        />
      </label>
      <label
        >${this.tr("namePattern")}
        <input
          .value=${e.pattern}
          @input=${(e) => this.set({ pattern: e.target.value })}
        />
        <small>${this.tr("namePatternHint")}</small>
      </label>
      <label
        >${this.tr("areas")}
        <tdc-multi-select
          .hass=${this.hass}
          .items=${In(this.hass?.areas, []).map((e) => ({
			value: e,
			label: e
		}))}
          allowAdd
          .selected=${e.areas}
          @tdc-select-change=${(e) => this.set({ areas: e.detail })}
        ></tdc-multi-select>
        <small>${this.tr("areasHint")}</small>
      </label>
      <label
        >${this.tr("areaMode")}
        <select
          @change=${(e) => this.set({ mode: e.target.value })}
        >
          ${O(this.hass?.language, Yn, (e) => this.tr(Xn[e])).map((t) => h`<option value=${t} ?selected=${t === e.mode}>
                ${this.tr(Xn[t])}
              </option>`)}
        </select>
      </label>
      ${this.select(this.tr("colOutput"), this.info?.outputs ?? ["native"], e.output, (e) => this.tr(Et[e] ?? "outputNative"), (e) => this.set({ output: e }))}
      <label
        >${this.tr("seed")}
        <input
          .value=${e.seed}
          @input=${(e) => this.set({ seed: e.target.value })}
        />
        <small>${this.tr(this.seedHint)}</small>
      </label>
    </div>`;
	}
};
k([y({ attribute: !1 })], P.prototype, "templates", void 0), k([y({ attribute: !1 })], P.prototype, "info", void 0), k([y({ type: Boolean })], P.prototype, "allowCustom", void 0), k([y({ type: Boolean })], P.prototype, "noTemplate", void 0), k([y({ attribute: "seed-hint" })], P.prototype, "seedHint", void 0), k([b()], P.prototype, "values", void 0), P = k([v("tdc-device-fields")], P);
// src/common/row-list.ts
var Qn = o`
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
`, $n = [at, ot], er = [
	"sine",
	"saw",
	"square",
	"triangle",
	"random_walk",
	"discharge"
], tr = [
	"constant",
	"household_load",
	"pv_day"
], nr = 600, rr = 86400, ir = 24;
function ar(e) {
	return $n.includes(e);
}
function or(e) {
	return e === "counter" ? ["rate_per_hour"] : e === "csv" ? ["step_s", ct] : e === "noise" ? [lt, st] : e === "steps" ? [
		"period_s",
		lt,
		ct,
		st
	] : e === "enum" ? [lt] : e === "state_machine" ? [ct] : er.includes(e) ? [
		"period_s",
		ct,
		st
	] : tr.includes(e) ? [st] : [];
}
function sr(e) {
	let t = e.period_s;
	return !or(e.shape).includes("period_s") || !t || t <= 0 ? rr : Math.min(rr, t * ir);
}
function cr(e) {
	return e < 120 ? `${Number(e.toFixed(1))} s` : e < 7200 ? `${Number((e / 60).toFixed(1))} min` : `${Number((e / 3600).toFixed(1))} h`;
}
function lr(e) {
	return e === "enum" ? ["values", "weights"] : e === "state_machine" ? ["states"] : [];
}
function ur(e, t, n) {
	let r = { ...e }, i = Number(n);
	return n.trim() === "" || Number.isNaN(i) ? delete r[t] : r[t] = i, r;
}
function dr(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function fr(e, t) {
	return t === "states" ? (e.states ?? []).map((e) => `${e.value}:${e.duration_s}`).join(", ") : (e[t] ?? []).join(", ");
}
function pr(e, t, n) {
	let r = { ...e };
	return t === "values" ? r.values = dr(n) : t === "weights" ? r.weights = dr(n).map(Number).filter((e) => !Number.isNaN(e)) : r.states = dr(n).flatMap((e) => {
		let [t, n] = e.split(":").map((e) => e.trim()), r = Number(n);
		return t && r > 0 ? [{
			value: t,
			duration_s: r
		}] : [];
	}), r;
}
function mr(e) {
	return e === "enum" ? {
		values: ["on", "off"],
		interval_s: nr
	} : e === "state_machine" ? { states: [{
		value: "idle",
		duration_s: nr
	}, {
		value: "active",
		duration_s: nr
	}] } : {};
}
function hr(e, t) {
	let n = /* @__PURE__ */ new Set([
		ut,
		...or(t),
		...lr(t)
	]);
	t === "csv" && n.add("file"), ar(t) || [
		"min",
		"max",
		"decimals"
	].forEach((e) => n.add(e));
	let r = {
		...mr(t),
		...e,
		shape: t
	};
	return Object.fromEntries(Object.entries(r).filter(([e]) => n.has(e)));
}
// src/common/curve-style.ts
var gr = o`
  svg {
    width: 100%;
    height: auto;
    background: var(--secondary-background-color);
  }
  polyline {
    fill: none;
    stroke: var(--primary-color);
    stroke-width: 1.5;
  }
`, _r = (1n << 64n) - 1n, vr = 11400714819323198485n, yr = 13787848793156543929n, br = 10723151780598845931n, xr = 3600, Sr = 3600, Cr = 10, wr = .5, Tr = 3, Er = 1.5, Dr = 30n, Or = 27n, kr = 31n, Ar = 11n, jr = 53, Mr = 86400, Nr = 24, Pr = .12, Fr = [
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
], Ir = .12, Lr = 600, Rr = 6, zr = 900, Br = .3, Vr = 2, Hr = 3;
function Ur(e, t = 0, n = 0) {
	return {
		shape: e.shape,
		min: e.min ?? 0,
		max: e.max ?? 100,
		period_s: e.period_s ?? Sr,
		interval_s: e.interval_s ?? Cr,
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
function Wr(e, t) {
	let n = BigInt(e) * vr + (BigInt(t) & _r) * yr + br & _r;
	return n = (n ^ n >> Dr) * yr & _r, n = (n ^ n >> Or) * br & _r, n ^= n >> kr, Number(n >> Ar) / 2 ** jr;
}
function Gr(e, t) {
	let n = t / e.period_s + e.phase;
	return n - Math.floor(n);
}
function Kr(e, t) {
	let n = Math.floor(t), r = t - n, i = r * r * (Tr - 2 * r), a = Wr(e, n);
	return a + (Wr(e, n + 1) - a) * i;
}
function qr(e) {
	return (e % Mr + Mr) % Mr / xr;
}
function Jr(e, t, n) {
	let r = Math.abs(e - t), i = Math.min(r, Nr - r);
	return Math.exp(-.5 * (i / n) ** 2);
}
var Yr = {
	constant: () => wr,
	sine: (e, t) => wr + wr * Math.sin(2 * Math.PI * Gr(e, t)),
	saw: (e, t) => Gr(e, t),
	square: (e, t) => +(Gr(e, t) < wr),
	triangle: (e, t) => 1 - Math.abs(2 * Gr(e, t) - 1),
	noise: (e, t) => Wr(e.seed, Math.floor(t / e.interval_s)),
	random_walk: (e, t) => Kr(e.seed, t / e.period_s + e.phase),
	household_load: (e, t) => {
		let n = qr(t);
		return Fr.reduce((e, [t, r, i]) => e + i * Jr(n, t, r), Pr) + Ir * (Kr(e.seed, t / Lr) - wr);
	},
	pv_day: (e, t) => {
		let n = (qr(t) - Rr) / 14;
		if (!(n > 0 && n < 1)) return 0;
		let r = 1 - Br * Kr(e.seed, t / zr);
		return Math.sin(Math.PI * n) ** Er * r;
	},
	steps: (e, t) => {
		let n = Math.max(Vr, Math.round(e.period_s / e.interval_s));
		return Math.min(1, Math.floor(Gr(e, t) * n) / (n - 1));
	},
	discharge: (e, t) => 1 - Gr(e, t) ** Hr
};
function Xr(e, t) {
	let n = e.weights.length ? e.weights : e.values.map(() => 1), r = n.reduce((e, t) => e + t, 0), i = Wr(e.seed, Math.floor(t / e.interval_s)) * r, a = 0;
	for (let [t, r] of e.values.entries()) if (a += n[t], i < a) return r;
	return e.values[e.values.length - 1];
}
function Zr(e, t) {
	let n = e.states.reduce((e, [, t]) => e + t, 0), r = ((t + e.phase * n) % n + n) % n, i = 0;
	for (let [t, n] of e.states) if (i += n, r < i) return t;
	return e.states[e.states.length - 1][0];
}
var Qr = {
	enum: Xr,
	state_machine: Zr
};
function $r(e) {
	let t = e.shape === "enum" ? e.values : e.states.map(([e]) => e);
	return [...new Set(t)];
}
function ei(e, t) {
	return Number(e.toFixed(t));
}
function ti(e, t) {
	if (e.shape in Qr) return Qr[e.shape](e, t);
	if (e.shape === "counter") {
		let n = Math.max(0, t - e.origin);
		return ei(e.min + e.rate_per_hour * n / xr, e.decimals);
	}
	let n = (Yr[e.shape] ?? Yr.constant)(e, t);
	return e.noise && (n += (Wr(e.seed + 1, Math.floor(t)) - wr) * 2 * e.noise), n = Math.min(1, Math.max(0, n)), ei(e.min + n * (e.max - e.min), e.decimals);
}
// src/signals/signal-preview.ts
var ni = 320, ri = 80, ii = 800, ai = 100, oi = 480, si = 6, ci = 12, li = [
	0,
	.5,
	1
], ui = class extends Ye {
	constructor(...e) {
		super(...e), this.unit = "", this.compact = !1;
	}
	static {
		this.styles = [gr, o`
      :host {
        display: block;
        color: var(--secondary-text-color);
        font-size: 0.8em;
      }
      svg {
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
    `];
	}
	get width() {
		return this.compact ? ni : ii;
	}
	get height() {
		return this.compact ? ri : ai;
	}
	points(e) {
		let t = Ur(e, 1, 0), n = $r(t), r = Array.from({ length: 481 }, (r, i) => {
			let a = ti(t, i / oi * sr(e));
			return typeof a == "string" ? n.indexOf(a) : a;
		}), i = Math.min(...r), a = Math.max(...r) - i || 1;
		return r.map((e, t) => {
			let n = t / oi * this.width, r = this.height - si - (e - i) / a * (this.height - 12);
			return `${n.toFixed(1)},${r.toFixed(1)}`;
		}).join(" ");
	}
	axis(e) {
		return je`${li.map((t) => {
			let n = t * this.width, r = t === 0 ? "start" : t === 1 ? "end" : "middle";
			return je`<text x=${n} y=${this.height + ci - 2} text-anchor=${r}>${cr(t * e)}</text>`;
		})}`;
	}
	render() {
		if (!this.signal) return h``;
		let e = this.signal.shape === "enum" || this.signal.shape === "state_machine", t = e ? $r(Ur(this.signal)).join(" · ") : "", n = this.signal.min ?? 0, r = this.signal.max ?? 100, i = h`<svg
      viewBox="0 0 ${this.width} ${this.height + (this.compact ? 0 : ci)}"
      role="img"
    >
      ${je`<polyline points=${this.points(this.signal)}></polyline>`}
      ${this.compact ? "" : this.axis(sr(this.signal))}
    </svg>`;
		return this.compact ? i : h`${i}
      <div>${e ? t : `${n} – ${r} ${this.unit}`}</div>`;
	}
};
k([y({ attribute: !1 })], ui.prototype, "signal", void 0), k([y()], ui.prototype, "unit", void 0), k([y({ type: Boolean })], ui.prototype, "compact", void 0), ui = k([v("tdc-signal-preview")], ui);
// src/signals/curve-editor.ts
var di = {
	min: "edMin",
	max: "edMax",
	decimals: "edDecimals",
	period_s: "edPeriod",
	interval_s: "edInterval",
	phase: "edPhase",
	rate_per_hour: "edRate",
	step_s: "edStep",
	noise: "edNoise"
}, fi = {
	values: "edValues",
	weights: "edWeights",
	states: "edStates"
}, pi = class extends A {
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
      >${this.tr(di[e])}
      <input
        type="number"
        step="any"
        .value=${this.signal[e] === void 0 ? "" : String(this.signal[e])}
        @input=${(t) => this.emit(ur(this.signal, e, t.target.value))}
      />
    </label>`;
	}
	listField(e) {
		return this.textField(this.tr(fi[e]), fr(this.signal, e), (t) => this.emit(pr(this.signal, e, t)), { flex: "1 1 240px" });
	}
	changeShape(e) {
		let t = hr(this.signal, e);
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
            ${O(this.hass?.language, this.shapes, (e) => T(this.hass?.language, ut, e)).map((e) => h`<option value=${e} ?selected=${e === this.signal.shape}>
                  ${T(this.hass?.language, ut, e)}
                </option>`)}
          </select>
        </label>
        ${ar(this.signal.shape) ? "" : h`${this.numberField("min")} ${this.numberField("max")}
              ${this.numberField("decimals")}`}
      </div>
      <div class="row form">
        ${this.signal.shape === "csv" ? this.renderFile() : ""}
        ${or(this.signal.shape).map((e) => this.numberField(e))}
        ${lr(this.signal.shape).map((e) => this.listField(e))}
      </div>
      ${this.signal.shape === "csv" ? h`<small>${this.tr("edCsvPreview")}</small>` : h`<tdc-signal-preview .signal=${this.signal} unit=${this.unit}></tdc-signal-preview>`}
    `;
	}
};
k([y({ attribute: !1 })], pi.prototype, "signal", void 0), k([y({ attribute: !1 })], pi.prototype, "shapes", void 0), k([y()], pi.prototype, "unit", void 0), k([b()], pi.prototype, "files", void 0), pi = k([v("tdc-curve-editor")], pi);
// src/wizard/entity-helpers.ts
var mi = ["sensor", "climate"], hi = "event", gi = /* @__PURE__ */ "°C.°F.K.%.W.kW.Wh.kWh.V.A.Hz.VA.var.lx.dB.hPa.mbar.bar.Pa.ppm.ppb.µg/m³.m.cm.mm.km.m/s.km/h.l.L/min.m³.g.kg.s.min.h.d.B.kB.MB.GB.Mbit/s.lm".split("."), _i = /^[a-z0-9]+(_[a-z0-9]+)*$/;
function vi(e) {
	return e.replace(/ß/g, "ss").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function yi(e) {
	return mi.includes(e);
}
function bi(e, t) {
	let { signal: n, unit: r, event_types: i, ...a } = e, o = {
		...a,
		platform: t
	};
	return yi(t) && (o.signal = n ?? {
		shape: "sine",
		min: 0,
		max: 100
	}, t === "sensor" && r && (o.unit = r)), t === hi && (o.event_types = i ?? ["press"]), o;
}
function xi(e) {
	return bi({
		key: "",
		platform: e,
		name: ""
	}, e);
}
function Si(e, t) {
	return e.name.trim() ? _i.test(e.key) ? t.includes(e.key) ? "entKeyTaken" : e.platform === hi && !e.event_types?.length ? "entEventTypes" : "" : "entKeyInvalid" : "entNameEmpty";
}
function Ci(e, t, n) {
	return t < 0 ? [...e, n] : e.map((e, r) => r === t ? n : e);
}
function wi(e, t) {
	return e.filter((e, n) => n !== t);
}
function Ti(e) {
	let t = Object.values(e?.states ?? {}).map((e) => e.attributes?.unit_of_measurement).filter((e) => typeof e == "string" && e !== "");
	return [.../* @__PURE__ */ new Set([...t, ...gi])].sort((e, t) => e.localeCompare(t));
}
// src/wizard/helpers.ts
var Ei = 10;
function Di(e, t) {
	return Math.round(e / Math.max(1, t) * Ei) / Ei;
}
function Oi(e, t) {
	return e.shape === "enum" || e.shape === "state_machine" ? $r(Ur(e)).join(" · ") : `${e.min ?? 0} – ${e.max ?? 100}${t ? ` ${t}` : ""}`;
}
// src/wizard/entity-editor.ts
var ki = -1, F = class extends A {
	constructor(...e) {
		super(...e), this.entities = [], this.shapes = [], this.platforms = [], this.editIndex = ki, this.keyTouched = !1;
	}
	static {
		this.styles = [
			A.styles,
			Qn,
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
		this.draft = xi(this.platforms.includes("sensor") ? dt : "switch"), this.editIndex = ki, this.keyTouched = !1;
	}
	edit(e) {
		this.draft = structuredClone(this.entities[e]), this.editIndex = e, this.keyTouched = !0;
	}
	removeAt(e) {
		this.emit(wi(this.entities, e)), this.editIndex === e ? this.draft = void 0 : this.editIndex > e && --this.editIndex;
	}
	cancel() {
		this.draft = void 0;
	}
	apply() {
		this.draft &&= (this.emit(Ci(this.entities, this.editIndex, this.draft)), void 0);
	}
	setField(e, t) {
		if (!this.draft) return;
		let n = {
			...this.draft,
			[e]: t
		};
		e === "key" && (this.keyTouched = !0), e === "name" && !this.keyTouched && (n.key = vi(t)), e === "unit" && !t && delete n.unit, this.draft = n;
	}
	otherKeys() {
		return this.entities.filter((e, t) => t !== this.editIndex).map((e) => e.key);
	}
	renderRow(e, t) {
		let n = T(this.hass?.language, "platform", e.platform);
		return h`<li class=${t === this.editIndex && this.draft ? "editing" : ""}>
      <span class="name">
        <div title=${e.name}>${e.name}</div>
        <small>${e.key} · ${n}</small>
      </span>
      ${e.signal ? h`<span class="range">${Oi(e.signal, e.unit)}</span>
              <tdc-signal-preview compact .signal=${e.signal}></tdc-signal-preview>` : ""}
      <button class="small" @click=${() => this.edit(t)}>${this.tr("entEdit")}</button>
      <button class="small danger" @click=${() => this.removeAt(t)}>
        ${this.tr("entDelete")}
      </button>
    </li>`;
	}
	renderDraft(e) {
		let t = Si(e, this.otherKeys()), n = this.hass?.language;
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
            @change=${(t) => this.draft = bi(e, t.target.value)}
          >
            ${O(n, this.platforms, (e) => T(n, "platform", e)).map((t) => h`<option value=${t} ?selected=${t === e.platform}>
                  ${T(n, "platform", t)}
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
                  ${Ti(this.hass).map((e) => h`<option value=${e}></option>`)}
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
      ${yi(e.platform) && e.signal ? h`<tdc-curve-editor
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
k([y({ attribute: !1 })], F.prototype, "entities", void 0), k([y({ attribute: !1 })], F.prototype, "shapes", void 0), k([y({ attribute: !1 })], F.prototype, "platforms", void 0), k([b()], F.prototype, "draft", void 0), k([b()], F.prototype, "editIndex", void 0), k([b()], F.prototype, "keyTouched", void 0), F = k([v("tdc-entity-editor")], F);
// src/wizard/entities-form.ts
var Ai = class extends A {
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
            ${O(e, this.templates, (t) => D(e, t.id, t.name)).map((t) => h`<option value=${t.id} ?selected=${t.id === this.pendingBase}>
                  ${D(e, t.id, t.name)}
                </option>`)}
          </select>
        </label>
      </div>
      ${t ? h`<p class="warning">
              ${this.tr("baseReplace", {
			old: this.entities.length,
			count: t.entities.length,
			name: D(e, t.id, t.name)
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
k([y({ attribute: !1 })], Ai.prototype, "templates", void 0), k([y({ attribute: !1 })], Ai.prototype, "entities", void 0), k([y({ attribute: !1 })], Ai.prototype, "shapes", void 0), k([y({ attribute: !1 })], Ai.prototype, "platforms", void 0), k([b()], Ai.prototype, "pendingBase", void 0), Ai = k([v("tdc-entities-form")], Ai);
// src/wizard/entity-list.ts
var ji = class extends A {
	constructor(...e) {
		super(...e), this.entities = [];
	}
	static {
		this.styles = [
			A.styles,
			Qn,
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
            ${e.signal ? h`<span class="range">${Oi(e.signal, e.unit)}</span>
                    <tdc-signal-preview compact .signal=${e.signal}></tdc-signal-preview>` : h`<span class="range"
                    >${T(this.hass?.language, "platform", e.platform)}</span
                  >`}
          </li>`)}
    </ul>` : h``;
	}
};
k([y({ attribute: !1 })], ji.prototype, "entities", void 0), ji = k([v("tdc-entity-list")], ji);
// src/wizard/wizard-base.ts
var Mi = 10, Ni = 50, I = class extends A {
	constructor(...e) {
		super(...e), this.templates = [], this.values = Zn, this.busy = !1, this.message = "", this.error = "";
	}
	async connectedCallback() {
		super.connectedCallback();
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]);
		} catch (e) {
			this.error = w(e);
		}
	}
	entities() {
		return this.templates.find((e) => e.id === this.values.template)?.entities ?? [];
	}
	take(e) {
		this.values = e;
	}
	request(e) {
		let t = this.values;
		return {
			template: t.template,
			count: t.count,
			name_pattern: t.pattern,
			areas: t.areas,
			area_mode: t.mode,
			output: t.output,
			...t.seed ? { seed: t.seed } : {},
			...e
		};
	}
	async submit(e) {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let t = await this.api.create(e);
			this.message = this.tr("created", { count: t.devices }), this.dispatchEvent(new CustomEvent("tdc-created"));
		} catch (e) {
			this.error = w(e);
		}
		this.busy = !1;
	}
	renderEstimate() {
		let e = this.entities(), t = Di(e.filter((e) => e.platform === dt).length * this.values.count, this.info?.tick_seconds ?? Mi);
		return h`<p>
      <small>${this.tr("estimate", {
			entities: e.length * this.values.count,
			rate: t
		})}</small>
      ${t > Ni ? h`<br /><span class="warning">${this.tr("rateWarning")}</span>` : ""}
    </p>`;
	}
	renderSubmit(e, t) {
		return h`<p class="row">
      <button class="primary" ?disabled=${this.busy || e} @click=${t}>
        ${this.busy ? this.tr("creating") : this.tr("create")}
      </button>
      <span>${this.message}</span>
      <span class="error">${this.error}</span>
    </p>`;
	}
};
k([b()], I.prototype, "info", void 0), k([b()], I.prototype, "templates", void 0), k([b()], I.prototype, "values", void 0), k([b()], I.prototype, "busy", void 0), k([b()], I.prototype, "message", void 0), k([b()], I.prototype, "error", void 0);
// src/wizard/creation-wizard.ts
var Pi = class extends I {
	constructor(...e) {
		super(...e), this.custom = [];
	}
	entities() {
		return this.values.template === "custom" ? this.custom : super.entities();
	}
	create() {
		let e = this.values.template === Jn;
		return this.submit(this.request(e ? { entities: this.custom } : {}));
	}
	render() {
		let e = this.values.template === Jn;
		return h`
      <tdc-device-fields
        .hass=${this.hass}
        .templates=${this.templates}
        .info=${this.info}
        allowCustom
        @tdc-fields-change=${(e) => this.take(e.detail)}
      ></tdc-device-fields>
      ${e ? h`<div style="display: grid; gap: 20px">
              <tdc-entities-form
                .hass=${this.hass}
                .templates=${this.templates}
                .entities=${this.custom}
                .shapes=${this.info?.shapes ?? []}
                .platforms=${this.info?.platforms ?? []}
                @tdc-entities-change=${(e) => this.custom = e.detail}
              ></tdc-entities-form>
            </div>` : h`<p>
              <small>${this.tr("entityList")}</small>
              <tdc-entity-list .hass=${this.hass} .entities=${this.entities()}></tdc-entity-list>
            </p>`}
      ${this.renderEstimate()}
      ${this.renderSubmit(!this.values.template || this.entities().length === 0, () => void this.create())}
    `;
	}
};
k([b()], Pi.prototype, "custom", void 0), Pi = k([v("tdc-creation-wizard")], Pi);
// src/wizard/source-helpers.ts
var Fi = {
	offset: 0,
	scalePercent: 0,
	noisePercent: 0,
	lagSeconds: 0,
	dropoutPercent: 0,
	decimals: null
};
function Ii(e) {
	let t = {
		offset: e.offset,
		scale: e.scalePercent / 100,
		noise: e.noisePercent / 100,
		lag_s: e.lagSeconds,
		dropout: e.dropoutPercent / 100,
		...e.decimals === null ? {} : { decimals: e.decimals }
	};
	return Object.fromEntries(Object.entries(t).filter(([e, t]) => e === "decimals" || t !== 0));
}
function Li(e, t) {
	return Object.fromEntries(Object.entries(e).filter(([e]) => t.has(e)));
}
function Ri(e, t, n) {
	let r = new Set(e);
	return n ? r.add(t) : r.delete(t), r;
}
function zi(e, t, n, r) {
	let i = Li(t.mapping, n);
	return !e || Object.keys(i).length === 0 ? null : {
		source: {
			device_id: e,
			mapping: i,
			deviation: Ii(r)
		},
		entities: t.entities.filter((e) => n.has(e.key))
	};
}
function Bi(e, t) {
	return e.find((e) => e.platform === "sensor" && t[e.key])?.key ?? "";
}
// src/wizard/source-step.ts
var Vi = 300, Hi = "custom", Ui = [
	{
		key: "offset",
		label: "sourceOffset",
		step: "0.1"
	},
	{
		key: "scalePercent",
		label: "sourceScale",
		step: "0.5"
	},
	{
		key: "noisePercent",
		label: "sourceNoise",
		step: "0.5"
	},
	{
		key: "lagSeconds",
		label: "sourceLag",
		step: "1"
	},
	{
		key: "dropoutPercent",
		label: "sourceDropout",
		step: "1"
	}
], L = class extends A {
	constructor(...e) {
		super(...e), this.seed = "", this.query = "", this.found = [], this.infos = [], this.included = /* @__PURE__ */ new Set(), this.form = Fi, this.error = "";
	}
	static {
		this.styles = [
			A.styles,
			Qn,
			o`
      :host {
        --head-height: 36px;
      }
      .entities {
        max-height: calc(var(--head-height) + 4 * var(--row-height) + 2px);
        overflow-y: auto;
        margin-bottom: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
      }
      thead th {
        position: sticky;
        top: 0;
        height: var(--head-height);
        background: var(--card-background-color);
      }
      tbody tr {
        height: var(--row-height);
      }
      ul {
        margin-bottom: 12px;
      }
    `
		];
	}
	disconnectedCallback() {
		window.clearTimeout(this.timer), super.disconnectedCallback();
	}
	report() {
		let e = this.derived ? zi(this.device?.id ?? "", this.derived, this.included, this.form) : null;
		this.dispatchEvent(new CustomEvent("tdc-source-change", { detail: e }));
	}
	connectedCallback() {
		super.connectedCallback(), this.search();
	}
	async search() {
		try {
			this.found = await this.api.sourcesList(this.query.trim()), this.error = "";
		} catch (e) {
			this.error = w(e);
		}
	}
	typing(e) {
		this.query = e, window.clearTimeout(this.timer), this.timer = window.setTimeout(() => void this.search(), Vi);
	}
	async choose(e) {
		try {
			let [t, n] = await Promise.all([this.api.sourcesDerive(e.id), this.api.sourcesInspect(e.id)]);
			this.device = e, this.derived = t, this.infos = n, this.included = new Set(t.entities.map((e) => e.key)), this.preview = void 0, this.error = "";
		} catch (e) {
			this.error = w(e);
		}
		this.report();
	}
	change() {
		this.device = void 0, this.derived = void 0, this.included = /* @__PURE__ */ new Set(), this.preview = void 0, this.report();
	}
	include(e, t) {
		this.included = Ri(this.included, e, t), this.preview = void 0, this.report();
	}
	setNumber(e, t) {
		this.form = {
			...this.form,
			[e]: Number(t) || 0
		}, this.preview = void 0, this.report();
	}
	setDecimals(e) {
		this.form = {
			...this.form,
			decimals: e === "" ? null : Number(e)
		}, this.preview = void 0, this.report();
	}
	async runPreview() {
		let e = this.previewKey();
		if (e && this.derived) try {
			this.preview = await this.api.sourcesPreview(this.derived.mapping[e], e, Ii(this.form), {
				seed: this.seed,
				template: Hi
			}), this.error = "";
		} catch (e) {
			this.error = w(e);
		}
	}
	renderSearch() {
		return h`<div class="fields">
        ${this.textField(this.tr("sourceSearch"), this.query, (e) => this.typing(e))}
      </div>
      ${this.found.length === 0 ? h`<p><small>${this.tr("sourceNoMatch")}</small></p>` : h`<ul>
              ${this.found.map((e) => h`<li>
                    <button
                      ?disabled=${e.usable === 0}
                      @click=${() => void this.choose(e)}
                    >
                      ${e.name}
                    </button>
                    <small
                      >${e.usable === 0 ? this.tr("sourceUnusable") : [e.manufacturer, e.model].filter(Boolean).join(" ")}</small
                    >
                  </li>`)}
            </ul>`}`;
	}
	previewKey() {
		return this.derived ? Bi(this.derived.entities, Li(this.derived.mapping, this.included)) : "";
	}
	renderRow(e, t) {
		let n = t.mapping[e.key], r = this.infos.find((e) => e.entity_id === n);
		return h`<tr>
      <td>
        <input
          type="checkbox"
          .checked=${this.included.has(e.key)}
          @change=${(t) => this.include(e.key, t.target.checked)}
        />
      </td>
      <td>${e.name}</td>
      <td><small>${n}</small></td>
      <td>${r ? `${r.state ?? "–"} ${r.unit ?? ""}` : ""}</td>
    </tr>`;
	}
	renderMapping(e) {
		return h`<div class="entities">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>${this.tr("detEntity")}</th>
            <th>${this.tr("sourceColSource")}</th>
            <th>${this.tr("sourceColValue")}</th>
          </tr>
        </thead>
        <tbody>
          ${e.entities.map((t) => this.renderRow(t, e))}
        </tbody>
      </table>
    </div>`;
	}
	renderDeviation() {
		return h`<div class="fields">
        ${Ui.map((e) => h`<label
              >${this.tr(e.label)}
              <input
                type="number"
                min="0"
                step=${e.step}
                .value=${String(this.form[e.key] ?? 0)}
                @input=${(t) => this.setNumber(e.key, t.target.value)}
              />
            </label>`)}
        <label
          >${this.tr("sourceDecimals")}
          <input
            type="number"
            min="0"
            max="6"
            .value=${this.form.decimals === null ? "" : String(this.form.decimals)}
            @input=${(e) => this.setDecimals(e.target.value)}
          />
        </label>
      </div>
      <p class="row">
        <button ?disabled=${!this.previewKey()} @click=${() => void this.runPreview()}>
          ${this.tr("sourcePreview")}
        </button>
        ${this.preview ? h`<small
                >${this.tr("sourceNow", {
			value: this.preview.source,
			unit: this.preview.unit ?? ""
		})}:
                ${this.preview.copies.map((e) => e.value).join(" · ")}</small
              >` : _}
      </p>`;
	}
	render() {
		return h`<fieldset>
      <legend>${this.tr("colSource")}</legend>
      ${this.device && this.derived ? h`<p>
                ${this.tr("sourceChosen", { name: this.device.name })}
                <button @click=${() => this.change()}>${this.tr("sourceChange")}</button>
              </p>
              ${this.renderMapping(this.derived)} ${this.renderDeviation()}` : this.renderSearch()}
      <span class="error">${this.error}</span>
    </fieldset>`;
	}
};
k([y()], L.prototype, "seed", void 0), k([b()], L.prototype, "query", void 0), k([b()], L.prototype, "found", void 0), k([b()], L.prototype, "device", void 0), k([b()], L.prototype, "derived", void 0), k([b()], L.prototype, "infos", void 0), k([b()], L.prototype, "included", void 0), k([b()], L.prototype, "form", void 0), k([b()], L.prototype, "preview", void 0), k([b()], L.prototype, "error", void 0), L = k([v("tdc-source-step")], L);
// src/wizard/follow-wizard.ts
var Wi = class extends I {
	constructor(...e) {
		super(...e), this.choice = null;
	}
	entities() {
		return this.choice?.entities ?? [];
	}
	create() {
		return this.choice ? this.submit(this.request({
			template: Jn,
			entities: this.choice.entities,
			source: this.choice.source
		})) : Promise.resolve();
	}
	render() {
		return h`
      <p><small>${this.tr("sourceIntro")}</small></p>
      <tdc-device-fields
        .hass=${this.hass}
        .info=${this.info}
        noTemplate
        seed-hint="seedHintSource"
        @tdc-fields-change=${(e) => this.take(e.detail)}
      ></tdc-device-fields>
      <tdc-source-step
        .hass=${this.hass}
        seed=${this.values.seed}
        @tdc-source-change=${(e) => this.choice = e.detail}
      ></tdc-source-step>
      ${this.renderEstimate()} ${this.renderSubmit(this.choice === null, () => void this.create())}
    `;
	}
};
k([b()], Wi.prototype, "choice", void 0), Wi = k([v("tdc-follow-wizard")], Wi);
// src/wizard/template-wizard.ts
var R = class extends A {
	constructor(...e) {
		super(...e), this.templates = [], this.name = "", this.entities = [], this.busy = !1, this.error = "";
	}
	async connectedCallback() {
		super.connectedCallback();
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]);
		} catch (e) {
			this.error = w(e);
		}
	}
	willUpdate(e) {
		e.has("editing") && (this.name = this.editing?.name ?? "", this.entities = structuredClone(this.editing?.entities ?? []));
	}
	async save() {
		let e = this.name.trim();
		this.busy = !0, this.error = "";
		try {
			let t = await this.api.saveTemplate(this.editing?.id ?? vi(e), e, this.entities);
			this.dispatchEvent(new CustomEvent("tdc-template-saved", { detail: t }));
		} catch (e) {
			this.error = w(e);
		}
		this.busy = !1;
	}
	render() {
		let e = this.name.trim(), t = this.editing?.id ?? vi(e), n = !this.editing && this.templates.some((e) => e.id === t && !e.bundled);
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
k([y({ attribute: !1 })], R.prototype, "editing", void 0), k([b()], R.prototype, "info", void 0), k([b()], R.prototype, "templates", void 0), k([b()], R.prototype, "name", void 0), k([b()], R.prototype, "entities", void 0), k([b()], R.prototype, "busy", void 0), k([b()], R.prototype, "error", void 0), R = k([v("tdc-template-wizard")], R);
// src/wizard/template-manager.ts
var z = class extends A {
	constructor(...e) {
		super(...e), this.own = [], this.form = !1, this.confirming = "", this.busy = !1, this.error = "";
	}
	static {
		this.styles = [
			A.styles,
			Qn,
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
			this.error = w(e);
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
			this.error = w(e);
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
k([b()], z.prototype, "own", void 0), k([b()], z.prototype, "form", void 0), k([b()], z.prototype, "editing", void 0), k([b()], z.prototype, "confirming", void 0), k([b()], z.prototype, "busy", void 0), k([b()], z.prototype, "error", void 0), z = k([v("tdc-template-manager")], z);
// src/devices/area-picker.ts
function Gi(e, t, n, r, i) {
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
// src/devices/source-badge.ts
var Ki = class extends A {
	constructor(...e) {
		super(...e), this.state = "ok";
	}
	static {
		this.styles = [A.styles, o`
      small {
        color: var(--text-primary-color);
        font-size: 0.8em;
        padding: 1px 8px;
        border-radius: 999px;
      }
      .ok {
        background: var(--success-color);
      }
      .warn {
        background: var(--warning-color);
      }
      .error {
        background: var(--error-color);
      }
    `];
	}
	render() {
		let e = qn(this.state);
		return h`<small class=${e.tone}>${this.tr(e.text)}</small>`;
	}
};
k([y()], Ki.prototype, "state", void 0), Ki = k([v("tdc-source-badge")], Ki);
var qi = 1e3;
function Ji(e) {
	if (e == null || e.trim() === "") return;
	let t = Number(e);
	return Number.isFinite(t) ? t : void 0;
}
function Yi(e, t, n = 120) {
	return [...e, t].slice(-n);
}
function Xi(e, t, n, r = 4) {
	if (e.length < 2) return "";
	let i = e[0].at, a = e[e.length - 1].at - i || 1, o = e.map((e) => e.value), s = Math.min(...o), c = Math.max(...o) - s || 1;
	return e.map((e) => {
		let o = (e.at - i) / a * t, l = n - r - (e.value - s) / c * (n - 2 * r);
		return `${o.toFixed(1)},${l.toFixed(1)}`;
	}).join(" ");
}
// src/devices/live-curve.ts
var Zi = 240, Qi = 40, $i = class extends Ye {
	constructor(...e) {
		super(...e), this.samples = [];
	}
	static {
		this.styles = [gr, o`
      svg {
        display: block;
        height: 32px;
        min-width: 80px;
        border-radius: 4px;
      }
      polyline {
        vector-effect: non-scaling-stroke;
      }
    `];
	}
	render() {
		return h`<svg viewBox="0 0 ${Zi} ${Qi}" preserveAspectRatio="none" role="img">
      <polyline points=${Xi(this.samples, Zi, Qi)}></polyline>
    </svg>`;
	}
};
k([y({ attribute: !1 })], $i.prototype, "samples", void 0), $i = k([v("tdc-live-curve")], $i);
// src/devices/device-detail.ts
var B = class extends A {
	constructor(...e) {
		super(...e), this.actions = {}, this.areas = [], this.shapes = [], this.picked = {}, this.inputs = {}, this.curves = {}, this.live = !1, this.samples = {}, this.liveStates = {}, this.seeds = {}, this.busy = !1, this.error = "";
	}
	static {
		this.styles = [A.styles, o`
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
      .live-col {
        width: 100%;
        padding-left: 16px;
      }
      td.row {
        flex-wrap: nowrap;
        white-space: nowrap;
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
        .live-col {
          display: none;
        }
        td.row {
          flex-wrap: wrap;
        }
        td:last-child {
          flex: 1 1 100%;
        }
      }
    `];
	}
	connectedCallback() {
		super.connectedCallback(), this.device.source && this.loadFull();
	}
	async loadFull() {
		try {
			this.full = await this.api.device(this.device.id);
		} catch (e) {
			this.error = w(e);
		}
	}
	async setSeed(e, t) {
		let n = this.seeds[e.key] ?? "", r = t ? "random" : Number(n);
		!t && (n.trim() === "" || !Number.isInteger(r) || Number(r) < 0) || await this.run(async () => {
			await this.api.setSeed([this.device.id], r, e.key), await this.loadFull(), this.seeds = {
				...this.seeds,
				[e.key]: ""
			};
		});
	}
	renderSeed(e) {
		let t = this.full?.source?.mapping;
		if (!t || !(e.key in t)) return _;
		let n = this.full?.source?.seeds?.[e.key];
		return h`<input
        type="number"
        min="0"
        aria-label=${this.tr("detSeed")}
        placeholder=${n === void 0 ? this.tr("detSeed") : String(n)}
        .value=${this.seeds[e.key] ?? ""}
        @input=${(t) => this.seeds = {
			...this.seeds,
			[e.key]: t.target.value
		}}
      />
      <button ?disabled=${this.busy} @click=${() => void this.setSeed(e, !1)}>
        ${this.tr("detSeedSet")}
      </button>
      <button ?disabled=${this.busy} @click=${() => void this.setSeed(e, !0)}>
        ${this.tr("detSeedRandom")}
      </button>`;
	}
	disconnectedCallback() {
		this.stopLive?.(), super.disconnectedCallback();
	}
	setLive(e) {
		this.stopLive?.(), this.stopLive = void 0, this.live = e, this.samples = {}, this.liveStates = {}, e && (this.readLive(), this.stopLive = kn(() => void this.readLive(), qi));
	}
	async readLive() {
		try {
			let e = await this.api.device(this.device.id);
			if (!this.live) return;
			let t = Date.now(), n = { ...this.samples }, r = {};
			for (let i of e.entities) {
				let e = Ji(i.state);
				e !== void 0 && (n[i.key] = Yi(n[i.key] ?? [], {
					at: t,
					value: e
				}), r[i.key] = i.state ?? "");
			}
			this.samples = n, this.liveStates = r;
		} catch (e) {
			this.setLive(!1), this.error = w(e);
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
			this.error = w(e);
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
        ${Gi(this.hass, this.areas, e, {
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
		let t = this.hass?.language, n = Nn(this.actions, e.platform);
		return O(t, [
			...n.plain,
			...n.withValue,
			...n.faults.map((e) => `${Mn}${e}`)
		], (e) => E(t, e)).map((e) => ({
			value: e,
			label: E(t, e)
		}));
	}
	pick(e, t) {
		t in jn || t.startsWith("fault_") ? this.picked = {
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
		let n = jn[t], r = `${e.key}:${t}`, i = this.inputs[r] ?? String(n ? n.start : 60), a = n ? Pn(t, i) : Fn(i);
		return h`<span class="row">
      <strong>${E(this.hass?.language, t)}</strong>
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
      <td colspan="4" class="curve">
        <tdc-curve-editor
          .hass=${this.hass}
          .signal=${this.curves[e.key]}
          .shapes=${this.shapes.filter((e) => !ar(e))}
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
		let t = this.hass?.language, n = this.menuItems(e), r = e.shape != null && !ar(e.shape) && !this.device.source;
		return h`<tr>
        <td>
          ${kt(t, e.key, e.name)}<br /><small
            >${T(t, "platform", e.platform)}</small
          >
          ${this.renderFollows(e)}
        </td>
        <td>
          <span
            >${At(t, this.liveStates[e.key] ?? e.state)}${e.unit ? ` ${e.unit}` : ""}</span
          >
          ${e.fault ? h`<br /><small class="warning">⚠ ${T(t, "fault", e.fault)}</small>` : ""}
        </td>
        <td class="live-col">
          ${this.live && e.key in this.samples ? h`<tdc-live-curve .samples=${this.samples[e.key]}></tdc-live-curve>` : ""}
        </td>
        <td class="row">
          ${n.length ? h`<tdc-menu-button
                  .hass=${this.hass}
                  label=${this.tr("detActions")}
                  ?disabled=${this.busy}
                  .items=${n}
                  @tdc-pick=${(t) => this.pick(e, t.detail)}
                ></tdc-menu-button>` : ""}
          ${this.renderPicked(e)} ${this.renderSeed(e)}
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
		let e = Rn(this.device.used_by);
		return e.length === 0 ? h`<p class="usage"><small>${this.tr("useNone")}</small></p>` : h`<details class="usage">
      <summary>${this.tr("useTitle", { count: e.length })}</summary>
      <ul>
        ${e.map((e) => h`<li>${this.tr(`use_${e.kind}`)}: ${e.name}</li>`)}
      </ul>
    </details>`;
	}
	renderSource() {
		let e = this.device.source;
		return e ? h`<p>
      ${this.tr("detSource")}: <strong>${e.name}</strong>
      <tdc-source-badge .hass=${this.hass} state=${e.state}></tdc-source-badge>
    </p>` : _;
	}
	renderFollows(e) {
		let t = this.full?.source?.mapping?.[e.key];
		return t ? h`<br /><small>${this.tr("sourceFollows", { entity: t })}</small>` : _;
	}
	render() {
		return h`
      ${this.renderArea()} ${this.renderSource()}
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
          <th class="live-col">${this.tr("detLiveColumn")}</th>
          <th>${this.tr("colActions")}</th>
        </tr>
        ${this.device.entities.map((e) => this.renderEntity(e))}
      </table>
      ${this.renderUsage()}
      <p class="error">${this.error}</p>
    `;
	}
};
k([y({ attribute: !1 })], B.prototype, "device", void 0), k([y({ attribute: !1 })], B.prototype, "actions", void 0), k([y({ attribute: !1 })], B.prototype, "areas", void 0), k([y({ attribute: !1 })], B.prototype, "shapes", void 0), k([b()], B.prototype, "areaDraft", void 0), k([b()], B.prototype, "picked", void 0), k([b()], B.prototype, "inputs", void 0), k([b()], B.prototype, "curves", void 0), k([b()], B.prototype, "live", void 0), k([b()], B.prototype, "samples", void 0), k([b()], B.prototype, "liveStates", void 0), k([b()], B.prototype, "full", void 0), k([b()], B.prototype, "seeds", void 0), k([b()], B.prototype, "busy", void 0), k([b()], B.prototype, "error", void 0), B = k([v("tdc-device-detail")], B);
var ea = {
	ids: /* @__PURE__ */ new Set(),
	all: !1
};
function ta(e, t) {
	return e.all ? t : e.ids.size;
}
function na(e, t) {
	if (e.all) return t.length ? "all" : "none";
	let n = t.filter((t) => e.ids.has(t)).length;
	return n === 0 ? "none" : n === t.length ? "all" : "some";
}
function ra(e, t) {
	let n = new Set(e.ids);
	return !n.delete(t) && n.size < 500 && n.add(t), {
		ids: n,
		all: !1
	};
}
function ia(e, t) {
	let n = new Set(e.ids);
	if (na(e, t) === "all") t.forEach((e) => n.delete(e));
	else for (let e of t) n.size < 500 && n.add(e);
	return {
		ids: n,
		all: !1
	};
}
function aa(e, t, n) {
	return !e.all && na(e, t) === "all" && n > e.ids.size;
}
function oa(e, t) {
	return e.all ? { filter: {
		...t,
		sort: void 0,
		descending: void 0
	} } : { ids: [...e.ids] };
}
function sa(e) {
	return e > 100;
}
function ca(e) {
	return [...new Set(Object.values(e).flat())];
}
function la(e) {
	return e in jn ? "value" : e.startsWith("fault_") ? "seconds" : "none";
}
function ua(e, t) {
	let n = la(e);
	return n === "none" ? {} : n === "value" ? Pn(e, t) : Fn(t);
}
// src/devices/bulk-bar.ts
var da = "area", fa = "group", pa = "action", ma = "remove", ha = 8, V = class extends A {
	constructor(...e) {
		super(...e), this.count = 0, this.target = { ids: [] }, this.areas = [], this.actions = {}, this.mqtt = !1, this.mode = "", this.busy = !1, this.error = "", this.area = "", this.groupName = "", this.groupId = "", this.groups = [], this.action = "", this.input = "", this.confirmed = !1;
	}
	static {
		this.styles = [A.styles, o`
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
			e === ma && (this.plan = await this.api.bulkRemovePlan(this.confirmedTarget())), e === fa && (this.groups = await this.api.groups());
		} catch (e) {
			this.error = w(e);
		}
	}
	async apply(e) {
		this.busy = !0, this.error = "";
		try {
			let t = await e();
			this.close(), this.dispatchEvent(new CustomEvent("tdc-bulk-done", { detail: t }));
		} catch (e) {
			this.error = w(e);
		} finally {
			this.busy = !1;
		}
	}
	async pause(e) {
		await this.apply(async () => {
			let t = await this.api.bulkPause(this.confirmedTarget(), e);
			return this.tr(e ? "bulkPaused" : "bulkResumed", { count: t.devices });
		});
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
        ${Gi(this.hass, this.areas, this.area, {
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
		return this.action ? ua(this.action, this.input) : void 0;
	}
	pickAction(e) {
		this.action = e, this.input = String(jn[e]?.start ?? 60);
	}
	renderAction() {
		let e = this.hass?.language, t = la(this.action);
		return h`<label
        >${this.tr("schAction")}
        <select @change=${(e) => this.pickAction(e.target.value)}>
          <option value=""></option>
          ${O(e, ca(this.actions), (t) => E(e, t)).map((t) => h`<option value=${t} ?selected=${t === this.action}>
                ${E(e, t)}
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
		let t = e.in_use.length > 0, n = sa(e.count), r = e.in_use.map((e) => e.device), i = r.slice(0, ha).join(", ") + (r.length > ha ? " …" : "");
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
			[da]: "bulkAreaHeading",
			[fa]: "bulkGroupHeading",
			[pa]: "bulkActionHeading",
			[ma]: "bulkRemoveHeading"
		}, t = this.mode ? this.tr(e[this.mode], { count: this.count }) : "";
		return h`<tdc-dialog
      .hass=${this.hass}
      heading=${t}
      ?open=${this.mode !== ""}
      @tdc-close=${() => this.close()}
    >
      <div class="dialog-body">
        ${this.mode === da ? this.renderArea() : _}
        ${this.mode === fa ? this.renderGroup() : _}
        ${this.mode === pa ? this.renderAction() : _}
        ${this.mode === ma ? this.renderRemove() : _}
        ${this.error ? h`<p class="error">${this.error}</p>` : _}
      </div>
    </tdc-dialog>`;
	}
	render() {
		return this.count === 0 ? h`${_}` : h`<div class="bar">
        <strong>${this.tr("bulkSelected", { count: this.count })}</strong>
        <button @click=${() => void this.open(da)}>${this.tr("bulkArea")}</button>
        ${this.mqtt ? h`<button @click=${() => void this.open(fa)}>
                ${this.tr("bulkGroup")}
              </button>` : _}
        <button @click=${() => void this.open(pa)}>${this.tr("bulkAction")}</button>
        <button @click=${() => void this.pause(!0)} ?disabled=${this.busy}>
          ${this.tr("pause")}
        </button>
        <button @click=${() => void this.pause(!1)} ?disabled=${this.busy}>
          ${this.tr("resume")}
        </button>
        <button @click=${() => void this.open(ma)}>${this.tr("bulkRemove")}</button>
        <button @click=${() => this.dispatchEvent(new CustomEvent("tdc-bulk-clear"))}>
          ${this.tr("bulkClear")}
        </button>
      </div>
      ${this.renderDialog()}`;
	}
};
k([y({ type: Number })], V.prototype, "count", void 0), k([y({ attribute: !1 })], V.prototype, "target", void 0), k([y({ attribute: !1 })], V.prototype, "areas", void 0), k([y({ attribute: !1 })], V.prototype, "actions", void 0), k([y({ type: Boolean })], V.prototype, "mqtt", void 0), k([b()], V.prototype, "mode", void 0), k([b()], V.prototype, "busy", void 0), k([b()], V.prototype, "error", void 0), k([b()], V.prototype, "area", void 0), k([b()], V.prototype, "groupName", void 0), k([b()], V.prototype, "groupId", void 0), k([b()], V.prototype, "groups", void 0), k([b()], V.prototype, "action", void 0), k([b()], V.prototype, "input", void 0), k([b()], V.prototype, "plan", void 0), k([b()], V.prototype, "confirmed", void 0), V = k([v("tdc-bulk-bar")], V);
// src/devices/duplicate-dialog.ts
var ga = "{template} {n}", _a = 500, va = (e) => e.target.value, ya = class extends A {
	constructor(...e) {
		super(...e), this.count = 1, this.pattern = ga, this.busy = !1, this.error = "";
	}
	async submit() {
		this.busy = !0;
		try {
			await this.api.duplicate(this.device.id, this.count, this.pattern), this.error = "", this.dispatchEvent(new CustomEvent("tdc-created", {
				bubbles: !0,
				composed: !0
			}));
		} catch (e) {
			this.error = w(e);
		}
		this.busy = !1;
	}
	render() {
		let e = Number.isInteger(this.count) && this.count >= 1 && this.count <= _a;
		return h`
      <p><b>${this.device.name}</b></p>
      <div class="row">
        <label
          >${this.tr("dupCount")}
          <input
            type="number"
            min="1"
            max=${_a}
            .value=${String(this.count)}
            @input=${(e) => this.count = Number(va(e))}
          />
        </label>
        <label
          >${this.tr("dupPattern")}
          <input
            type="text"
            maxlength="64"
            .value=${this.pattern}
            @input=${(e) => this.pattern = va(e)}
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
k([y({ attribute: !1 })], ya.prototype, "device", void 0), k([b()], ya.prototype, "count", void 0), k([b()], ya.prototype, "pattern", void 0), k([b()], ya.prototype, "busy", void 0), k([b()], ya.prototype, "error", void 0), ya = k([v("tdc-duplicate-dialog")], ya);
// src/devices/source-banner.ts
var ba = class extends A {
	constructor(...e) {
		super(...e), this.removed = [], this.busy = !1, this.error = "";
	}
	async load() {
		try {
			this.removed = await this.api.sourcesRemoved(), this.error = "";
		} catch (e) {
			this.error = w(e);
		}
	}
	connectedCallback() {
		super.connectedCallback(), this.load();
	}
	async answer(e, t) {
		this.busy = !0;
		try {
			await this.api.confirmSourceRemoved(e.id, t), this.dispatchEvent(new CustomEvent("tdc-changed", {
				bubbles: !0,
				composed: !0
			})), await this.load();
		} catch (e) {
			this.error = w(e);
		}
		this.busy = !1;
	}
	render() {
		return this.removed.length === 0 && !this.error ? _ : h`${this.removed.map((e) => h`<p class="warning">
            ${this.tr("sourceRemovedAsk", {
			name: e.name,
			count: e.devices.length
		})}
            <small>${e.devices.map((e) => e.name).join(", ")}</small>
            <button
              class="primary"
              ?disabled=${this.busy}
              @click=${() => void this.answer(e, !0)}
            >
              ${this.tr("sourceRemoveYes")}
            </button>
            <button ?disabled=${this.busy} @click=${() => void this.answer(e, !1)}>
              ${this.tr("sourceKeepNo")}
            </button>
          </p>`)} <span class="error">${this.error}</span>`;
	}
};
k([b()], ba.prototype, "removed", void 0), k([b()], ba.prototype, "busy", void 0), k([b()], ba.prototype, "error", void 0), ba = k([v("tdc-source-banner")], ba);
// src/devices/device-list.ts
var xa = 4, Sa = 8, Ca = {
	switch: "toggle",
	event: "press",
	binary_sensor: "pulse",
	light: "toggle"
}, wa = "fire:", Ta = "remove", Ea = "duplicate", Da = "pause", Oa = "show_log", ka = [
	dt,
	"switch",
	"binary_sensor",
	"light",
	"cover",
	"climate"
], H = class extends N {
	constructor(...e) {
		super(...e), this.devices = [], this.total = 0, this.matched = 0, this.offset = 0, this.loaded = !1, this.templating = !1, this.following = !1, this.filter = fn(Wn, Bn), this.selection = ea, this.facetsStale = !0;
	}
	static {
		this.styles = [
			N.styles,
			Nt,
			o`
      tr.device {
        cursor: pointer;
      }
      td.nowrap {
        white-space: nowrap;
      }
      small.paused {
        margin-left: 6px;
        padding: 1px 6px;
        border-radius: 8px;
        color: var(--text-primary-color);
        background: var(--warning-color);
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
		let e = Gn(this.filter), t = this.facetsStale;
		this.facetsStale = !1;
		try {
			let n = await this.api.devices(this.offset, 50, e, t);
			n.devices.length === 0 && this.offset > 0 && (this.offset = zn(n.matched, 50), n = await this.api.devices(this.offset, 50, e, t)), this.devices = n.devices, this.total = n.total, this.matched = n.matched, n.facets && (this.facets = n.facets), this.error = "";
		} catch (e) {
			this.facetsStale ||= t, this.error = w(e);
		}
		this.loaded = !0;
	}
	reload() {
		this.facetsStale = !0, this.refresh();
	}
	setFilter(e) {
		this.filter = e, this.selection = ea, pn(Wn, e), this.offset = 0, this.reload();
	}
	facetTemplate(e) {
		return e.value === "custom" ? this.tr("customTemplate") : D(this.hass?.language, e.value, e.value);
	}
	filterFields() {
		let e = this.hass?.language, t = this.facets, n = (e, n, r) => Kn(t?.[e], this.filter[n], r), r = {
			fault: this.tr("filterFault"),
			used: this.tr("filterUsed"),
			unused: this.tr("filterUnused"),
			paused: this.tr("filterPaused")
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
				options: n("outputs", "outputs", (e) => this.tr(Et[e.value] ?? "outputNative"))
			},
			{
				key: "platforms",
				kind: "multi",
				label: this.tr("detEntity"),
				options: n("platforms", "platforms", (t) => T(e, "platform", t.value))
			},
			{
				key: "runs",
				kind: "multi",
				label: this.tr("schTarget_run"),
				options: n("runs", "runs", (e) => e.label || e.value)
			},
			{
				key: "sources",
				kind: "multi",
				label: this.tr("filterSource"),
				options: n("sources", "sources", (e) => e.value === "" ? this.tr("filterSourceNone") : e.label || e.value)
			},
			{
				key: "source_state",
				kind: "choice",
				label: this.tr("filterSourceState"),
				options: [
					{
						value: "with",
						label: this.tr("filterSourceWith")
					},
					{
						value: "without",
						label: this.tr("filterSourceWithout")
					},
					{
						value: "offline",
						label: this.tr("sourceState_offline")
					},
					{
						value: "removed",
						label: this.tr("sourceState_removed")
					}
				]
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
      searchBefore=${Vn}
      .matched=${this.matched}
      .total=${this.total}
      @tdc-filter-change=${(e) => this.setFilter(e.detail)}
    ></tdc-filter-bar>`;
	}
	sortHeader(e, t) {
		let n = Un(this.filter, e);
		return h`<th
      class="sortable"
      aria-sort=${n}
      @click=${() => this.setFilter(Hn(this.filter, e))}
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
			await this.api.fire(e.id, t.key, Ca[t.platform]), await this.refresh();
		} catch (e) {
			this.error = w(e);
		}
	}
	async togglePause(e) {
		try {
			await this.api.bulkPause({ ids: [e.id] }, !e.paused), await this.refresh();
		} catch (e) {
			this.error = w(e);
		}
	}
	menuItems(e) {
		let t = this.hass?.language;
		return O(t, [
			...e.entities.filter((e) => e.platform in Ca).map((e) => ({
				value: `${wa}${e.key}`,
				label: `${kt(t, e.key, e.name)} – ${E(t, Ca[e.platform])}`
			})),
			{
				value: Ea,
				label: this.tr("duplicate")
			},
			{
				value: Da,
				label: this.tr(e.paused ? "resume" : "pause")
			},
			{
				value: Oa,
				label: this.tr("logShow")
			},
			{
				value: Ta,
				label: this.tr("remove"),
				disabled: Rn(e.used_by).length > 0,
				hint: this.tr("removeBlocked")
			}
		], (e) => e.label);
	}
	pick(e, t) {
		if (t === Ea) {
			this.duplicating = e;
			return;
		}
		if (t === Da) {
			this.togglePause(e);
			return;
		}
		if (t === Oa) {
			this.dispatchEvent(new CustomEvent("tdc-show-log", { detail: { id: e.id } }));
			return;
		}
		if (t === Ta) {
			this.dispatchEvent(new CustomEvent("tdc-remove", { detail: {
				target: x,
				id: e.id
			} }));
			return;
		}
		let n = e.entities.find((e) => `${wa}${e.key}` === t);
		n && this.fire(e, n);
	}
	values(e) {
		let t = this.hass?.language;
		return e.entities.filter((e) => ka.includes(e.platform)).slice(0, xa).map((e) => {
			let n = e.unit ? ` ${e.unit}` : "", r = e.fault ? ` ⚠ ${T(t, "fault", e.fault)}` : "";
			return `${kt(t, e.key, e.name)}: ${At(t, e.state)}${n}${r}`;
		}).join(" · ");
	}
	templateName(e) {
		return e.template === "custom" ? this.tr("customTemplate") : D(this.hass?.language, e.template, e.model);
	}
	pageIds() {
		return this.devices.map((e) => e.id);
	}
	pageState() {
		return na(this.selection, this.pageIds());
	}
	renderBulk() {
		let e = ta(this.selection, this.matched);
		return h`
      ${this.selection.all ? h`<p class="row">
              <small>${this.tr("bulkAllSelected", { count: this.matched })}</small>
              <button @click=${() => this.selection = ea}>
                ${this.tr("bulkClear")}
              </button>
            </p>` : aa(this.selection, this.pageIds(), this.matched) ? h`<p class="row">
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
        .target=${oa(this.selection, Gn(this.filter))}
        .areas=${In(this.hass.areas, this.devices)}
        .actions=${this.info?.actions ?? {}}
        .mqtt=${this.info?.mqtt ?? !1}
        @tdc-bulk-clear=${() => this.selection = ea}
        @tdc-bulk-done=${(e) => {
			this.selection = ea, this.reload(), this.message = e.detail;
		}}
      ></tdc-bulk-bar>
      ${this.message ? h`<p>${this.message}</p>` : _}
    `;
	}
	renderSource(e) {
		let t = e.source;
		return t ? h`<a
        href="#"
        title=${this.tr("sourceFilterBy")}
        @click=${(e) => {
			e.preventDefault(), e.stopPropagation(), this.setFilter({
				...sn(this.filterFields(), this.filter),
				sources: [t.id]
			});
		}}
        >${t.name}</a
      >
      <tdc-source-badge .hass=${this.hass} state=${t.state}></tdc-source-badge>` : "–";
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
            @change=${() => this.selection = ra(this.selection, e.id)}
          />
        </td>
        <td class="name nowrap">
          ${t ? "▾" : "▸"} ${e.name}
          ${e.paused ? h`<small class="paused">${this.tr("pausedBadge")}</small>` : _}
        </td>
        <td class="nowrap" data-label=${this.tr("colTemplate")}>${this.templateName(e)}</td>
        <td class="nowrap" data-label=${this.tr("colArea")}>${e.area ?? "–"}</td>
        <td class="nowrap" data-label=${this.tr("colOutput")}>
          ${this.tr(Et[e.output] ?? "outputNative")}
        </td>
        <td class="nowrap" data-label=${this.tr("colSource")}>${this.renderSource(e)}</td>
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
      ${t ? this.detailRow(Sa, h`<tdc-device-detail
                .hass=${this.hass}
                .device=${e}
                .actions=${this.info?.actions ?? {}}
                .shapes=${this.info?.shapes ?? []}
                .areas=${In(this.hass.areas, this.devices)}
                @tdc-changed=${() => this.reload()}
              ></tdc-device-detail>`) : ""}`;
	}
	created() {
		this.creating = !1, this.following = !1, this.reload();
	}
	renderWizard(e, t, n, r) {
		return h`<tdc-dialog
      .hass=${this.hass}
      heading=${this.tr(e)}
      ?open=${t}
      @tdc-close=${n}
    >
      ${t ? r() : _}
    </tdc-dialog>`;
	}
	renderNew() {
		return h`
      <p>
        <button class="primary" @click=${() => this.creating = !0}>
          + ${this.tr("create")}
        </button>
        <button class="primary" @click=${() => this.following = !0}>
          + ${this.tr("follow")}
        </button>
        <button class="primary" @click=${() => this.templating = !0}>
          ${this.tr("tplManage")}
        </button>
      </p>
      ${this.renderWizard("create", this.creating, () => this.creating = !1, () => h`<tdc-creation-wizard
            .hass=${this.hass}
            @tdc-created=${() => this.created()}
          ></tdc-creation-wizard>`)}
      ${this.renderWizard("follow", this.following, () => this.following = !1, () => h`<tdc-follow-wizard
            .hass=${this.hass}
            @tdc-created=${() => this.created()}
          ></tdc-follow-wizard>`)}
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
      <tdc-source-banner .hass=${this.hass} @tdc-changed=${() => this.reload()}></tdc-source-banner>
      ${this.total === 0 ? "" : this.renderFilter()}
      ${this.total === 0 ? h`<p>${this.tr("noDevices")}</p>` : this.matched === 0 ? h`<p>
                ${this.tr("noMatches")}
                <a
                  href="#"
                  @click=${(e) => {
			e.preventDefault(), this.setFilter(sn(this.filterFields(), this.filter));
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
                          @change=${() => this.selection = ia(this.selection, this.pageIds())}
                        />
                      </th>
                      ${this.sortHeader("name", this.tr("colName"))}
                      ${this.sortHeader("template", this.tr("colTemplate"))}
                      <th>${this.tr("colArea")}</th>
                      <th>${this.tr("colOutput")}</th>
                      <th>${this.tr("colSource")}</th>
                      <th>${this.tr("colValues")}</th>
                      <th>${this.tr("colActions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Xt(this.devices, (e) => e.id, (e) => this.renderRow(e))}
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
k([b()], H.prototype, "devices", void 0), k([b()], H.prototype, "total", void 0), k([b()], H.prototype, "matched", void 0), k([b()], H.prototype, "offset", void 0), k([b()], H.prototype, "loaded", void 0), k([b()], H.prototype, "templating", void 0), k([b()], H.prototype, "following", void 0), k([b()], H.prototype, "duplicating", void 0), k([b()], H.prototype, "facets", void 0), k([b()], H.prototype, "filter", void 0), k([b()], H.prototype, "selection", void 0), H = k([v("tdc-device-list")], H);
// src/common/targets.ts
var Aa = 1e3;
function ja(e) {
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
function Ma(e) {
	let t = /* @__PURE__ */ new Date(e * Aa), n = (e) => String(e).padStart(2, "0");
	return `${`${t.getFullYear()}-${n(t.getMonth() + 1)}-${n(t.getDate())}`} ${n(t.getHours())}:${n(t.getMinutes())}`;
}
function Na(e, t, n) {
	return `${Ma(e.created)} · ${D(t, e.template, e.model)} · ${n(e.count)}`;
}
function Pa(e, t, n, r, i) {
	return O(r, e === "device" ? t.map((e) => ({
		value: e.id,
		label: Fa(e.name, e.source)
	})) : e === "template" ? n.map((e) => ({
		value: e.id,
		label: D(r, e.id, e.name)
	})) : ja(t).map((e) => ({
		value: e.id,
		label: Na(e, r, i)
	})), (e) => e.label);
}
function Fa(e, t) {
	return t ? `${e} · ${t.name}` : e;
}
function Ia(e, t, n, r, i, a) {
	return e === "device" ? n.find((e) => e.id === t || e.name === t)?.name ?? t : Pa(e, n, r, i, a).find((e) => e.value === t)?.label ?? t;
}
function La(e, t, n) {
	return e === "device" ? n.find((e) => e.id === t || e.name === t)?.id ?? t : t;
}
// src/group/helpers.ts
var Ra = "groups", za = [];
function Ba(e) {
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
var U = class extends A {
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
		this.dispatchEvent(new CustomEvent(mt, {
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
k([y({ attribute: !1 })], U.prototype, "devices", void 0), k([y({ attribute: !1 })], U.prototype, "group", void 0), k([y()], U.prototype, "submitLabel", void 0), k([y({ type: Boolean })], U.prototype, "busy", void 0), k([b()], U.prototype, "name", void 0), k([b()], U.prototype, "members", void 0), U = k([v("tdc-group-form")], U);
// src/group/group-panel.ts
var Va = 3, Ha = "z2m", Ua = class extends N {
	static {
		this.styles = [
			A.styles,
			Nt,
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
		super(), this.groups = [], this.devices = [], this.restoreFilter(Ra, za);
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			[this.groups, this.devices] = await Promise.all([this.api.groups(), this.api.deviceNames()]);
		} catch (e) {
			this.error = w(e);
		}
	}
	members() {
		return this.devices.filter((e) => e.output === Ha).map((e) => ({
			value: e.id,
			label: Fa(e.name, e.source)
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
      ${t ? this.editRow(Va, e.id, h`<tdc-group-form
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
      ${Xt(e, (e) => e.id, (e) => this.renderRow(e))}
    </table>`;
	}
	render() {
		return h`
      ${this.renderNew()}
      ${this.groups.length === 0 ? h`<p>${this.tr("grpNone")}</p>` : this.renderFiltered(this.groups, za, Ba((e) => this.memberNames(e)), (e) => this.renderTable(e))}
      <p class="error">${this.error}</p>
    `;
	}
};
k([b()], Ua.prototype, "groups", void 0), k([b()], Ua.prototype, "devices", void 0), k([et("tdc-group-form#new")], Ua.prototype, "newForm", void 0), Ua = k([v("tdc-group-panel")], Ua);
function Wa(e) {
	return Math.min(365, Math.max(1, Math.round(e) || 1));
}
function Ga(e, t) {
	let [n, ...r] = (t.length ? e.filter((e) => t.includes(e.id)) : e).map((e) => {
		let t = /* @__PURE__ */ new Map();
		for (let n of e.entities) {
			let e = n.shape;
			n.platform === "sensor" && n.state_class && e && !ar(e) && t.set(n.key, {
				key: n.key,
				name: n.name
			});
		}
		return t;
	});
	return n ? [...n.values()].filter((e) => r.every((t) => t.has(e.key))) : [];
}
// src/history/history-panel.ts
var Ka = 7, W = class extends A {
	constructor(...e) {
		super(...e), this.days = Ka, this.chosen = [], this.entity = "", this.devices = [], this.busy = !1, this.message = "", this.error = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.loadDevices();
	}
	async loadDevices() {
		try {
			this.devices = await this.api.deviceNames();
		} catch (e) {
			this.error = w(e);
		}
	}
	pick(e) {
		this.chosen = e, Ga(this.devices, e).some((e) => e.key === this.entity) || (this.entity = "");
	}
	async importHistory() {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let e = await this.api.importHistory(Wa(this.days), this.chosen.length > 1 ? this.chosen : this.chosen[0], this.entity || void 0);
			this.message = this.tr("histDone", { ...e });
		} catch (e) {
			this.error = w(e);
		}
		this.busy = !1;
	}
	renderChoice(e, t, n, r) {
		let i = O(this.hass?.language, t, (e) => e.label);
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
			label: Fa(e.name, e.source)
		})), n = Ga(this.devices, this.chosen).map((t) => ({
			value: t.key,
			label: kt(e, t.key, t.name)
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
k([b()], W.prototype, "days", void 0), k([b()], W.prototype, "chosen", void 0), k([b()], W.prototype, "entity", void 0), k([b()], W.prototype, "devices", void 0), k([b()], W.prototype, "busy", void 0), k([b()], W.prototype, "message", void 0), k([b()], W.prototype, "error", void 0), W = k([v("tdc-history-panel")], W);
function qa(e, t, n) {
	if (t.length === 0) return e;
	let r = e.concat(t);
	return r.length > n ? r.slice(r.length - n) : r;
}
function Ja(e, t, n, r = 28, i = 8) {
	let a = Math.floor(t / r), o = Math.ceil(n / r);
	return {
		start: Math.max(0, Math.min(e, a - i)),
		end: Math.max(0, Math.min(e, a + o + i))
	};
}
function Ya(e, t, n) {
	return e + t >= n - 4;
}
function Xa(e) {
	let t = /* @__PURE__ */ new Date(e * 1e3), n = (e, t = 2) => String(e).padStart(t, "0");
	return `${n(t.getHours())}:${n(t.getMinutes())}:${n(t.getSeconds())}.${n(t.getMilliseconds(), 3)}`;
}
function Za(e) {
	if (e === null || e === 0) return "";
	let t = Number(e.toFixed(3));
	return `${t > 0 ? "+" : ""}${t}`;
}
function Qa(e, t) {
	return e === null ? "–" : t && e !== "" && !Number.isNaN(Number(e)) ? `${e} ${t}` : e;
}
var $a = [
	"seq",
	"at",
	"device",
	"source",
	"entity",
	"key",
	"old",
	"new",
	"unit",
	"delta",
	"cause",
	"template",
	"area",
	"platform"
];
function eo(e) {
	let t = e === null ? "" : String(e);
	return /[",\r\n]/.test(t) ? `"${t.replaceAll("\"", "\"\"")}"` : t;
}
function to(e) {
	let t = e.map((e) => [
		e.seq,
		(/* @__PURE__ */ new Date(e.at * 1e3)).toISOString(),
		e.device,
		e.source,
		e.name,
		e.key,
		e.old,
		e.new,
		e.unit,
		e.delta,
		e.cause,
		e.template,
		e.area,
		e.platform
	].map(eo).join(","));
	return [$a.join(","), ...t].join("\n") + "\n";
}
function no(e) {
	return JSON.stringify(e, null, 2);
}
function ro(e, t) {
	let n = e.toISOString();
	return `tdc-log-${n.slice(0, 10)}-${n.slice(11, 19).replaceAll(":", "")}.${t}`;
}
var io = [
	"signal",
	"action",
	"fault",
	"source",
	"restore",
	"other"
], ao = [
	"sensor",
	"binary_sensor",
	"switch",
	"light",
	"cover",
	"climate",
	"event"
], oo = "only_numeric", so = "window", co = "min_delta", lo = [
	{
		key: "devices",
		kind: "multi",
		label: ""
	},
	{
		key: "entities",
		kind: "multi",
		label: ""
	},
	{
		key: "templates",
		kind: "multi",
		label: ""
	},
	{
		key: "sources",
		kind: "multi",
		label: ""
	},
	{
		key: "platforms",
		kind: "multi",
		label: ""
	},
	{
		key: "outputs",
		kind: "multi",
		label: ""
	},
	{
		key: "causes",
		kind: "multi",
		label: ""
	},
	{
		key: so,
		kind: "choice",
		label: ""
	},
	{
		key: co,
		kind: "choice",
		label: ""
	},
	{
		key: oo,
		kind: "switch",
		label: ""
	}
], uo = [
	60,
	300,
	900,
	3600
], fo = [
	.1,
	1,
	10,
	100
];
function po(e) {
	let t = typeof e == "string" ? Number(e) : NaN;
	return t > 0 ? t : void 0;
}
function mo(e, t = Date.now() / 1e3) {
	let n = (t) => {
		let n = e[t];
		return Array.isArray(n) && n.length ? n : void 0;
	}, r = {
		query: (typeof e.query == "string" ? e.query.trim() : "") || void 0,
		devices: n("devices"),
		entities: n("entities"),
		templates: n("templates"),
		sources: n("sources"),
		platforms: n("platforms"),
		outputs: n("outputs"),
		causes: n("causes"),
		only_numeric: e.only_numeric === !0 || void 0,
		min_delta: po(e[co]),
		from: po(e.window) === void 0 ? void 0 : t - Number(e[so])
	};
	return Object.fromEntries(Object.entries(r).filter(([, e]) => e !== void 0));
}
function ho(e) {
	return [...new Map(e.map((e) => [e.value, e])).values()].sort((e, t) => e.label.localeCompare(t.label));
}
function go(e, t, n) {
	return {
		devices: ho(e.map((e) => ({
			value: e.id,
			label: e.name
		}))),
		entities: ho(e.flatMap((e) => e.entities.map((e) => ({
			value: e.key,
			label: e.name || e.key
		})))),
		templates: ho(e.map((e) => ({
			value: e.template,
			label: t(e.template)
		}))),
		sources: ho(e.flatMap((e) => e.source ? [{
			value: e.source.id,
			label: e.source.name
		}] : [])),
		outputs: ho(e.map((e) => ({
			value: e.output,
			label: n(e.output)
		})))
	};
}
function _o(e, t) {
	return {
		query: "",
		sort: "",
		descending: !1,
		...Object.fromEntries(e.map((e) => [e.key, e.kind === "multi" ? e.key === "devices" ? [t] : [] : !1]))
	};
}
// src/log/log-panel.ts
var vo = 1e3, yo = 5e3, bo = "min(65vh, 640px)", G = class extends A {
	constructor(...e) {
		super(...e), this.entries = [], this.paused = !1, this.frozen = 0, this.listTop = 0, this.missed = 0, this.message = "", this.error = "", this.filter = fn("log", lo), this.names = [], this.lastSeq = 0, this.capacity = yo, this.follow = !0, this.reading = !1;
	}
	static {
		this.styles = [A.styles, o`
      .bar {
        align-items: center;
        gap: 10px;
        display: flex;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }
      .bar .grow {
        flex: 1;
      }
      .list {
        position: relative;
        overflow-y: auto;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
      }
      .head,
      .row {
        display: grid;
        grid-template-columns:
          110px minmax(120px, 1fr) minmax(120px, 1fr) minmax(110px, 1fr)
          minmax(160px, 1.5fr) 90px;
        gap: 8px;
        align-items: center;
        padding: 0 8px;
        box-sizing: border-box;
      }
      .head {
        position: sticky;
        top: 0;
        z-index: 1;
        height: 30px;
        font-size: 0.8em;
        font-weight: 500;
        color: var(--secondary-text-color);
        background: var(--secondary-background-color);
        border-bottom: 1px solid var(--divider-color);
      }
      .row {
        height: ${28}px;
        border-bottom: 1px solid var(--divider-color);
        font-size: 0.9em;
      }
      .row > span {
        white-space: nowrap;
        min-width: 0;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .time {
        font-variant-numeric: tabular-nums;
        color: var(--secondary-text-color);
      }
      .delta {
        color: var(--secondary-text-color);
        margin-left: 6px;
      }
      .cause {
        display: inline-block;
        line-height: 1.5;
        font-size: 0.8em;
        padding: 1px 8px;
        border-radius: 999px;
        border: 1px solid var(--divider-color);
        color: var(--secondary-text-color);
      }
      .cause.fault {
        border-color: var(--error-color);
        color: var(--error-color);
      }
      .unavailable {
        color: var(--warning-color);
      }
      .empty {
        padding: 16px;
        color: var(--secondary-text-color);
      }
    `];
	}
	connectedCallback() {
		super.connectedCallback(), this.loadNames(), this.read(), this.stopPolling = kn(() => void this.read(), vo);
	}
	disconnectedCallback() {
		this.stopPolling?.(), this.api.logStop().catch(() => void 0), super.disconnectedCallback();
	}
	updated(e) {
		this.follow && !this.paused && e.has("entries") && this.list && (this.list.scrollTop = this.list.scrollHeight);
	}
	async read() {
		if (!this.reading) {
			this.reading = !0;
			try {
				for (let e = 0; e < 10; e += 1) {
					let e = await this.api.logGet(this.lastSeq, 500, mo(this.filter));
					if (this.capacity = e.capacity || yo, e.last_seq < this.lastSeq) this.entries = [], this.frozen = 0, this.lastSeq = 0;
					else if (this.missed += e.dropped, this.entries = qa(this.entries, e.entries, this.capacity), e.entries.length > 0 && (this.lastSeq = e.entries[e.entries.length - 1].seq), this.error = "", e.entries.length < 500) break;
				}
			} catch (e) {
				this.error = w(e);
			}
			this.reading = !1;
		}
	}
	async loadNames() {
		try {
			this.names = await this.api.deviceNames();
		} catch (e) {
			this.error = w(e);
		}
	}
	setFilter(e) {
		this.filter = e, pn("log", e), this.entries = [], this.frozen = 0, this.lastSeq = 0, this.paused = !1, this.follow = !0, this.read();
	}
	fields() {
		let e = this.hass?.language, t = go(this.names, (t) => D(e, t, t), (e) => this.tr(Et[e] ?? "outputNative")), n = {
			devices: this.tr("filterDevices"),
			entities: this.tr("logColEntity"),
			templates: this.tr("filterTemplates"),
			platforms: this.tr("entPlatform"),
			outputs: this.tr("colOutput"),
			causes: this.tr("logFilterCause"),
			sources: this.tr("colSource"),
			window: this.tr("logWindow"),
			min_delta: this.tr("logMinDelta"),
			only_numeric: this.tr("logOnlyNumeric")
		}, r = {
			devices: t.devices,
			entities: t.entities,
			templates: t.templates,
			sources: t.sources,
			outputs: t.outputs,
			platforms: ao.map((t) => ({
				value: t,
				label: T(e, "platform", t)
			})),
			window: uo.map((e) => ({
				value: String(e),
				label: this.tr("logWindowMinutes", { count: e / 60 })
			})),
			min_delta: fo.map((e) => ({
				value: String(e),
				label: this.tr("logMinDeltaValue", { value: e })
			})),
			causes: io.map((e) => ({
				value: e,
				label: this.tr(`logCause_${e}`)
			}))
		};
		return lo.map((e) => ({
			...e,
			label: n[e.key],
			options: r[e.key]
		}));
	}
	renderFilter() {
		let e = this.fields();
		return h`<tdc-filter-bar
      .hass=${this.hass}
      .fields=${e}
      .values=${this.filter}
      hideCount
      searchLabel=${this.tr("filterSearchList")}
      @tdc-filter-change=${(e) => this.setFilter(e.detail)}
    ></tdc-filter-bar>`;
	}
	shown() {
		return this.paused ? this.entries.slice(Math.max(0, this.entries.length - this.frozen)) : this.entries;
	}
	togglePause() {
		this.paused = !this.paused, this.frozen = this.paused ? this.entries.length : 0, this.paused || (this.follow = !0);
	}
	async clear() {
		try {
			await this.api.logClear(), this.entries = [], this.frozen = 0, this.missed = 0, this.message = "";
		} catch (e) {
			this.error = w(e);
		}
	}
	save(e) {
		let t = this.shown(), n = ro(/* @__PURE__ */ new Date(), e), r = e === "csv" ? to(t) : no(t), i = e === "csv" ? "text/csv" : "application/json", a = URL.createObjectURL(new Blob([r], { type: i })), o = document.createElement("a");
		o.href = a, o.download = n, o.click(), URL.revokeObjectURL(a), this.message = this.tr("logSaved", {
			name: n,
			count: t.length
		});
	}
	onScroll() {
		this.list && (this.listTop = this.list.scrollTop, this.follow = Ya(this.list.scrollTop, this.list.clientHeight, this.list.scrollHeight));
	}
	renderBar(e) {
		let t = this.paused ? this.entries.length - this.frozen : 0;
		return h`<div class="bar">
      <button @click=${() => this.togglePause()}>
        ${this.paused ? this.tr("logResume") : this.tr("logPause")}
      </button>
      <button @click=${() => void this.clear()}>${this.tr("logClear")}</button>
      <span class="grow">
        ${this.tr("logCount", { count: e })}
        ${t > 0 ? h` · ${this.tr("logNew", { count: t })}` : _}
      </span>
      <span>${this.tr("logSave")}:</span>
      <button ?disabled=${e === 0} @click=${() => this.save("csv")}>
        ${this.tr("logSaveCsv")}
      </button>
      <button ?disabled=${e === 0} @click=${() => this.save("json")}>
        ${this.tr("logSaveJson")}
      </button>
    </div>`;
	}
	renderRow(e) {
		let t = e.new === "unavailable", n = Za(e.delta);
		return h`<div class="row">
      <span class="time">${Xa(e.at)}</span>
      <span title=${e.device}>${e.device}</span>
      <span title=${e.key}>${e.name}</span>
      <span title=${e.source}>${e.source || "–"}</span>
      <span class=${t ? "unavailable" : ""}>
        ${Qa(e.old, e.unit)} → ${Qa(e.new, e.unit)}
        ${n ? h`<span class="delta">${n}</span>` : _}
      </span>
      <span
        ><span class="cause ${e.cause}"
          >${this.tr(`logCause_${e.cause}`)}</span
        ></span
      >
    </div>`;
	}
	render() {
		let e = this.shown(), t = this.list?.clientHeight ?? 640, { start: n, end: r } = Ja(e.length, this.listTop, t);
		return h`
      <p>${this.tr("logIntro")}</p>
      ${this.renderFilter()} ${this.renderBar(e.length)}
      ${this.missed > 0 ? h`<p class="warning">${this.tr("logMissed", { count: this.missed })}</p>` : _}
      <div class="list" style="height: ${bo}" @scroll=${() => this.onScroll()}>
        <div class="head">
          <span>${this.tr("logColTime")}</span>
          <span>${this.tr("logColDevice")}</span>
          <span>${this.tr("logColEntity")}</span>
          <span>${this.tr("colSource")}</span>
          <span>${this.tr("logColChange")}</span>
          <span>${this.tr("logColCause")}</span>
        </div>
        ${e.length === 0 ? h`<div class="empty">
                ${this.tr(Object.keys(mo(this.filter)).length ? "logNoMatches" : "logEmpty")}
                ${Object.keys(mo(this.filter)).length ? h`<button
                        @click=${() => this.setFilter(sn(lo, this.filter))}
                      >
                        ${this.tr("filterReset")}
                      </button>` : _}
              </div>` : h`<div style="height: ${e.length * 28}px; position: relative">
                <div style="transform: translateY(${n * 28}px)">
                  ${e.slice(n, r).map((e) => this.renderRow(e))}
                </div>
              </div>`}
      </div>
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
k([b()], G.prototype, "entries", void 0), k([b()], G.prototype, "paused", void 0), k([b()], G.prototype, "frozen", void 0), k([b()], G.prototype, "listTop", void 0), k([b()], G.prototype, "missed", void 0), k([b()], G.prototype, "message", void 0), k([b()], G.prototype, "error", void 0), k([b()], G.prototype, "filter", void 0), k([b()], G.prototype, "names", void 0), k([et(".list")], G.prototype, "list", void 0), G = k([v("tdc-log-panel")], G);
// src/common/target-select.ts
var xo = {
	device: "schTarget_device",
	template: "schTarget_template",
	run: "schTarget_run"
}, K = class extends A {
	constructor(...e) {
		super(...e), this.kind = x, this.values = [], this.multiple = !1, this.templates = [], this.devices = [], this.error = "";
	}
	willUpdate(e) {
		e.has("kind") && this.kind !== "template" && this.loadDevices(), super.willUpdate(e);
	}
	async loadDevices() {
		try {
			this.devices = await this.api.deviceNames(), this.error = "";
		} catch (e) {
			this.error = w(e);
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
		return Pa(this.kind, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e }));
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
		let e = this.options(), t = this.values.map((e) => La(this.kind, e, this.devices));
		return h`<label>
      ${this.tr(xo[this.kind])}
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
k([y()], K.prototype, "kind", void 0), k([y({ attribute: !1 })], K.prototype, "values", void 0), k([y({ type: Boolean })], K.prototype, "multiple", void 0), k([y({ attribute: !1 })], K.prototype, "templates", void 0), k([b()], K.prototype, "devices", void 0), k([b()], K.prototype, "error", void 0), K = k([v("tdc-target-select")], K);
// src/removal/removal-panel.ts
var So = 20, Co = {
	all: "targetAll",
	device: "targetDevice",
	run: "targetRun"
}, q = class extends A {
	constructor(...e) {
		super(...e), this.target = "all", this.targetId = "", this.busy = !1, this.message = "", this.error = "";
	}
	static {
		this.styles = [A.styles, o`
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
			this.plan = void 0, this.error = w(e);
		}
	}
	async confirm() {
		this.busy = !0;
		try {
			let e = await this.api.removalRun(this.target, this.targetId || void 0);
			this.message = this.tr("removed", { count: e.devices + e.orphans }), this.plan = void 0;
		} catch (e) {
			this.error = w(e);
		}
		this.busy = !1;
	}
	async scanTopics() {
		this.message = "", this.error = "", this.busy = !0;
		try {
			this.leftover = (await this.api.orphanTopics()).topics;
		} catch (e) {
			this.leftover = void 0, this.error = w(e);
		}
		this.busy = !1;
	}
	async deleteLeftover() {
		this.busy = !0;
		try {
			let e = await this.api.clearOrphanTopics(this.leftover ?? []);
			this.message = this.tr("leftoverDeleted", { count: e.cleared.length }), this.leftover = void 0;
		} catch (e) {
			this.error = w(e);
		}
		this.busy = !1;
	}
	renderLeftover(e) {
		return e.length === 0 ? h`<p>${this.tr("leftoverNone")}</p>` : h`<p>${this.tr("leftoverTopics", { count: e.length })}</p>
      <p>
        <small
          >${e.slice(0, So).join(", ")}${e.length > So ? " …" : ""}</small
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
          >${e.devices.slice(0, So).map((e) => e.source ? `${e.name} · ${e.source}` : e.name).join(", ")}${e.devices.length > So ? " …" : ""}</small
        >
      </p>
      ${e.in_use.length ? h`<p class="error">${this.tr("inUseWarning")}</p>
              <ul>
                ${e.in_use.map((e) => h`<li>
                      ${e.device}:
                      ${Rn(e.usage).map((e) => `${this.tr(`use_${e.kind}`)} ${e.name}`).join(", ")}
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
            ${O(this.hass?.language, Object.keys(Co), (e) => this.tr(Co[e])).map((e) => h`<option value=${e} ?selected=${this.target === e}>
                  ${this.tr(Co[e])}
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
k([y()], q.prototype, "target", void 0), k([y()], q.prototype, "targetId", void 0), k([b()], q.prototype, "plan", void 0), k([b()], q.prototype, "busy", void 0), k([b()], q.prototype, "leftover", void 0), k([b()], q.prototype, "message", void 0), k([b()], q.prototype, "error", void 0), q = k([v("tdc-removal-panel")], q);
// src/schedule/helpers.ts
var wo = 60, To = 3, Eo = 24, Do = 16;
function Oo() {
	return {
		type: C,
		times: "08:00, 18:30",
		weekdays: [],
		everyS: wo,
		start: "00:00",
		end: "24:00",
		at: "",
		count: To,
		perDay: Eo
	};
}
function ko(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function Ao(e) {
	switch (e.type) {
		case C: return e.weekdays.length ? {
			type: C,
			times: ko(e.times),
			weekdays: [...e.weekdays].sort()
		} : {
			type: C,
			times: ko(e.times)
		};
		case tt: return {
			type: tt,
			every_s: e.everyS,
			start: e.start,
			end: e.end
		};
		case nt: return {
			type: nt,
			at: e.at
		};
		case rt: return {
			type: rt,
			count: e.count,
			start: e.start,
			end: e.end
		};
		case it: return {
			type: it,
			per_day: e.perDay
		};
	}
}
function jo(e, t) {
	switch (e) {
		case "all": return { all: !0 };
		case S: return { template: t[0] ?? "" };
		case x: return { device: t.length === 1 ? t[0] : t };
		case "run": return { run: t[0] ?? "" };
	}
}
function Mo(e) {
	return "template" in e ? {
		kind: S,
		ids: [e.template]
	} : "device" in e ? {
		kind: x,
		ids: typeof e.device == "string" ? [e.device] : e.device
	} : "run" in e ? {
		kind: "run",
		ids: [e.run]
	} : {
		kind: "all",
		ids: []
	};
}
function No(e) {
	switch (e.type) {
		case C: return e.times.join(", ");
		case tt: return `${e.every_s} s (${e.start}–${e.end})`;
		case nt: return e.at.replace("T", " ");
		case rt: return `${e.count}× ${e.start}–${e.end}`;
		case it: return `Ø ${e.per_day}/d`;
	}
}
function Po(e) {
	return e.slice(0, Do).replace("T", " ");
}
function Fo(e) {
	return [...new Set(Object.values(e).flat())];
}
function Io(e) {
	return {
		kind: "all",
		targetIds: [],
		action: Fo(e)[0] ?? "",
		entity: ""
	};
}
function Lo(e, t, n, r) {
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
function Ro(e, t) {
	let n = Fo(e);
	if (!t) return [];
	let r = t.map((t) => new Set(Object.entries(e).filter(([e]) => t.has(e)).flatMap(([, e]) => e)));
	return n.filter((e) => r.every((t) => t.has(e)));
}
function zo(e, t, n, r, i, a) {
	let o = t.length === 1 ? e === "template" ? r.find((e) => e.id === t[0])?.entities ?? [] : e === "device" ? n.find((e) => e.id === t[0] || e.name === t[0])?.entities ?? [] : [] : [], s = new Set(Object.entries(i).filter(([, e]) => e.includes(a)).map(([e]) => e));
	return o.filter((e) => s.has(e.platform)).map(({ key: e, name: t }) => ({
		key: e,
		name: t
	}));
}
function Bo(e) {
	return {
		target: jo(e.kind, e.targetIds),
		entity: e.entity,
		action: e.action
	};
}
function Vo(e) {
	let t = {
		...Oo(),
		type: e.type
	};
	switch (e.type) {
		case C: return {
			...t,
			times: e.times.join(", "),
			weekdays: e.weekdays ?? []
		};
		case tt: return {
			...t,
			everyS: e.every_s,
			start: e.start,
			end: e.end
		};
		case nt: return {
			...t,
			at: e.at
		};
		case rt: return {
			...t,
			count: e.count,
			start: e.start,
			end: e.end
		};
		case it: return {
			...t,
			perDay: e.per_day
		};
	}
}
function Ho(e) {
	let { kind: t, ids: n } = Mo(e.target);
	return {
		kind: t,
		targetIds: n,
		action: e.action,
		entity: e.entity
	};
}
var Uo = "schedules", Wo = [
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
], Go = "scenario";
function Ko(e) {
	return e.scenario ? Go : e.action;
}
function qo(e, t) {
	return {
		texts: (n) => [
			n.name,
			e(n),
			t(n),
			No(n.trigger)
		],
		values: (e, t) => {
			switch (t) {
				case "triggers": return [e.trigger.type];
				case "actions": return [Ko(e)];
				case "targets": return [Mo(e.target).kind];
				default: return [e.enabled ? "on" : "off"];
			}
		}
	};
}
// src/scenario/helpers.ts
function Jo(e) {
	return {
		afterS: 0,
		work: Io(e),
		params: ""
	};
}
function Yo(e) {
	if (e.trim() === "") return {};
	try {
		let t = JSON.parse(e);
		return typeof t == "object" && t && !Array.isArray(t) ? t : void 0;
	} catch {
		return;
	}
}
function Xo(e) {
	let t = [];
	for (let n of e) {
		let e = Yo(n.params);
		if (e === void 0) return;
		t.push({
			after_s: Math.max(0, n.afterS || 0),
			...Bo(n.work),
			params: e
		});
	}
	return t;
}
function Zo(e) {
	return {
		afterS: e.after_s,
		work: Ho(e),
		params: Object.keys(e.params).length ? JSON.stringify(e.params) : ""
	};
}
var Qo = "scenarios", $o = [{
	key: "devices",
	kind: "multi",
	label: ""
}, {
	key: "templates",
	kind: "multi",
	label: ""
}];
function es(e, t, n) {
	let r = e.steps.flatMap((e) => {
		let r = Mo(e.target);
		return r.kind === t ? r.ids.map(n) : [];
	});
	return [...new Set(r)];
}
function ts(e, t) {
	return es(e, x, (e) => La(x, e, t));
}
function ns(e) {
	return es(e, S, (e) => e);
}
function rs(e, t) {
	return {
		texts: t,
		values: (t, n) => n === "devices" ? ts(t, e) : ns(t)
	};
}
// src/schedule/work-picker.ts
var is = [
	"all",
	S,
	x,
	"run"
], J = class extends A {
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
			this.error = w(e);
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
		let e = this.hass?.language, t = Lo(this.work.kind, this.work.targetIds, this.devices, this.templates);
		return O(e, Ro(this.actions, t), (t) => E(e, t));
	}
	entities() {
		let e = zo(this.work.kind, this.work.targetIds, this.devices, this.templates, this.actions, this.work.action);
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
      </label>` : this.select(this.tr("schAction"), t, this.work.action, (t) => E(e, t), (e) => this.emit({
			action: e,
			entity: ""
		}));
	}
	renderEntity(e, t) {
		let n = O(t, e, (e) => kt(t, e.key, e.name));
		return h`<label
      >${this.tr("schEntity")}
      <select @change=${(e) => this.emit({ entity: e.target.value })}>
        <option value="" ?selected=${!this.work.entity}>${this.tr("schAllFitting")}</option>
        ${n.map((e) => h`<option value=${e.key} ?selected=${e.key === this.work.entity}>
              ${kt(t, e.key, e.name)}
            </option>`)}
      </select>
    </label>`;
	}
	render() {
		let e = this.hass?.language, t = this.entities();
		return h`
      <div class="fields">
        ${this.select(this.tr("schTarget"), is, this.work.kind, (e) => this.tr(`schTarget_${e}`), (e) => this.emit({
			kind: e,
			targetIds: [],
			entity: ""
		}))}
        ${this.work.kind === "all" ? _ : h`<tdc-target-select
                .hass=${this.hass}
                kind=${this.work.kind}
                ?multiple=${this.work.kind === x}
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
k([y({ attribute: !1 })], J.prototype, "work", void 0), k([y({ attribute: !1 })], J.prototype, "actions", void 0), k([y({ attribute: !1 })], J.prototype, "templates", void 0), k([b()], J.prototype, "devices", void 0), k([b()], J.prototype, "loaded", void 0), k([b()], J.prototype, "error", void 0), J = k([v("tdc-work-picker")], J);
// src/scenario/scenario-form.ts
var Y = class extends A {
	constructor(...e) {
		super(...e), this.templates = [], this.submitLabel = "", this.busy = !1, this.name = "", this.steps = [], this.error = "";
	}
	willUpdate(e) {
		let t = this.info?.actions;
		this.scenario && t && this.loadedId !== this.scenario.id ? (this.loadedId = this.scenario.id, this.name = this.scenario.name, this.steps = this.scenario.steps.map(Zo)) : !this.scenario && t && this.steps.length === 0 && (this.steps = [Jo(t)]), super.willUpdate(e);
	}
	reset() {
		this.name = "", this.error = "", this.steps = [Jo(this.info?.actions ?? {})];
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
		let e = Xo(this.steps);
		e ? (this.error = "", this.dispatchEvent(new CustomEvent(mt, {
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
          @click=${() => this.steps = [...this.steps, Jo(this.info?.actions ?? {})]}
        >
          ${this.tr("scnAddStep")}
        </button>`
		})}
      <p class="error">${this.error}</p>
    `;
	}
};
k([y({ attribute: !1 })], Y.prototype, "info", void 0), k([y({ attribute: !1 })], Y.prototype, "templates", void 0), k([y({ attribute: !1 })], Y.prototype, "scenario", void 0), k([y()], Y.prototype, "submitLabel", void 0), k([y({ type: Boolean })], Y.prototype, "busy", void 0), k([b()], Y.prototype, "name", void 0), k([b()], Y.prototype, "steps", void 0), k([b()], Y.prototype, "error", void 0), Y = k([v("tdc-scenario-form")], Y);
// src/scenario/scenario-panel.ts
var as = 3, os = class extends N {
	static {
		this.styles = [
			A.styles,
			Nt,
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
		super(), this.scenarios = [], this.devices = [], this.restoreFilter(Qo, $o);
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			[this.scenarios, this.devices] = await Promise.all([this.api.scenarios(), this.api.deviceNames()]);
		} catch (e) {
			this.error = w(e);
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
		return Ia(e, t, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e }));
	}
	filterFields() {
		let e = this.hass?.language;
		return [{
			key: "devices",
			kind: "multi",
			label: this.tr("filterDevices"),
			options: Dn(this.scenarios, (e) => ts(e, this.devices), (e) => this.targetLabel(x, e), e)
		}, {
			key: "templates",
			kind: "multi",
			label: this.tr("filterTemplates"),
			options: Dn(this.scenarios, ns, (e) => this.targetLabel(S, e), e)
		}];
	}
	searchTexts(e) {
		return [
			e.name,
			...ts(e, this.devices).map((e) => this.targetLabel(x, e)),
			...ns(e).map((e) => this.targetLabel(S, e))
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
		let t = e.steps[0], { kind: n } = t ? Mo(t.target) : { kind: "all" }, r = this.hass?.language, i = this.expanded.has(e.id);
		return h`<tr class="scenario card" @click=${() => this.toggle(e.id)}>
        ${this.nameCell(e.id, e.name)}
        <td data-label=${this.tr("scnSteps")}>
          ${this.tr("scnStepCount", { count: e.steps.length })}<br /><small
            >${t ? `${Ot(r, t.entity, t.action)} · ${this.tr(`schTarget_${n}`)}` : ""}</small
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
      ${i ? this.editRow(as, e.id, h`<tdc-scenario-form
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
      ${Xt(e, (e) => e.id, (e) => this.renderRow(e))}
    </table>`;
	}
	render() {
		return h`
      ${this.renderNew()}
      ${this.scenarios.length === 0 ? h`<p>${this.tr("scnNone")}</p>` : this.renderFiltered(this.scenarios, this.filterFields(), rs(this.devices, (e) => this.searchTexts(e)), (e) => this.renderTable(e))}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
k([b()], os.prototype, "scenarios", void 0), k([b()], os.prototype, "devices", void 0), k([et("tdc-scenario-form#new")], os.prototype, "newForm", void 0), os = k([v("tdc-scenario-panel")], os);
// src/schedule/schedule-form.ts
var ss = [
	C,
	tt,
	nt,
	rt,
	it
], cs = [
	"weekdayMon",
	"weekdayTue",
	"weekdayWed",
	"weekdayThu",
	"weekdayFri",
	"weekdaySat",
	"weekdaySun"
], X = class extends A {
	constructor(...e) {
		super(...e), this.templates = [], this.scenarios = [], this.submitLabel = "", this.busy = !1, this.name = "", this.scenarioId = "", this.work = Io({}), this.seed = "", this.form = Oo(), this.started = !1;
	}
	willUpdate(e) {
		let t = this.info?.actions;
		this.schedule && t && this.loadedId !== this.schedule.id ? (this.loadedId = this.schedule.id, this.name = this.schedule.name, this.scenarioId = this.schedule.scenario ?? "", this.work = Ho(this.schedule), this.form = Vo(this.schedule.trigger)) : !this.schedule && t && !this.started && (this.started = !0, this.work = Io(t)), super.willUpdate(e);
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
		let e = this.scenarioId ? { scenario: this.scenarioId } : Bo(this.work), t = this.schedule && "action" in e && e.action === this.schedule.action;
		return {
			name: this.name,
			...e,
			trigger: Ao(this.form),
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
		this.dispatchEvent(new CustomEvent(mt, {
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
      ${cs.map((e, t) => h`<label style="flex-direction: row; align-items: center">
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
			case C: return h`${this.field(this.tr("schTimes"), C)} ${this.renderWeekdays()}`;
			case tt: return h`${this.field(this.tr("schEveryS"), "everyS", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case nt: return this.field(this.tr("schAt"), "at", "datetime-local");
			case rt: return h`${this.field(this.tr("schCount"), "count", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case it: return this.field(this.tr("schPerDay"), "perDay", "number");
		}
	}
	render() {
		return h`
      <div class="fields">
        ${this.textField(this.tr("schName"), this.name, (e) => this.name = e)}
      </div>
      <div class="fields">
        ${this.select(this.tr("schTrigger"), ss, this.form.type, (e) => this.tr(`schTrigger_${e}`), (e) => this.setForm({ type: e }))}
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
k([y({ attribute: !1 })], X.prototype, "info", void 0), k([y({ attribute: !1 })], X.prototype, "templates", void 0), k([y({ attribute: !1 })], X.prototype, "scenarios", void 0), k([y({ attribute: !1 })], X.prototype, "schedule", void 0), k([y()], X.prototype, "submitLabel", void 0), k([y({ type: Boolean })], X.prototype, "busy", void 0), k([b()], X.prototype, "name", void 0), k([b()], X.prototype, "scenarioId", void 0), k([b()], X.prototype, "work", void 0), k([b()], X.prototype, "seed", void 0), k([b()], X.prototype, "form", void 0), X = k([v("tdc-schedule-form")], X);
// src/schedule/schedule-panel.ts
var ls = 6, us = 24, ds = 50, Z = class extends N {
	static {
		this.styles = [
			A.styles,
			Nt,
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
		super(), this.schedules = [], this.runs = [], this.scenarios = [], this.devices = [], this.previewOpen = !1, this.restoreFilter(Uo, Wo);
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			[this.schedules, this.runs, this.scenarios, this.devices] = await Promise.all([
				this.api.schedules(),
				this.api.schedulePreview(us),
				this.api.scenarios(),
				this.api.deviceNames()
			]), this.error = "";
		} catch (e) {
			this.error = w(e);
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
		return e === "all" ? n : `${n}: ${t.map((t) => Ia(e, t, this.devices, this.templates, this.hass?.language, (e) => this.tr("planDevices", { count: e }))).join(", ")}`;
	}
	actionText(e) {
		return e.scenario ? this.tr("schScenario", { id: this.scenarioName(e.scenario) }) : Ot(this.hass?.language, e.entity, e.action);
	}
	targetOf(e) {
		let { kind: t, ids: n } = Mo(e.target);
		return e.scenario ? "" : this.targetText(t, n);
	}
	filterFields() {
		let e = this.hass?.language;
		return [
			{
				key: "triggers",
				kind: "multi",
				label: this.tr("schTrigger"),
				options: Dn(this.schedules, (e) => [e.trigger.type], (e) => this.tr(`schTrigger_${e}`), e)
			},
			{
				key: "actions",
				kind: "multi",
				label: this.tr("schAction"),
				options: Dn(this.schedules, (e) => [Ko(e)], (t) => t === "scenario" ? this.tr("filterScenario") : Ot(e, "", t), e)
			},
			{
				key: "targets",
				kind: "multi",
				label: this.tr("schTarget"),
				options: Dn(this.schedules, (e) => [Mo(e.target).kind], (e) => this.tr(`schTarget_${e}`), e)
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
		let { kind: t, ids: n } = Mo(e.target), r = this.expanded.has(e.id);
		return h`<tr class="schedule card" @click=${() => this.toggle(e.id)}>
        ${this.nameCell(e.id, e.name)}
        <td data-label=${this.tr("schTarget")}>
          ${e.scenario ? "–" : this.targetText(t, n)}
        </td>
        <td data-label=${this.tr("schAction")}>${this.actionText(e)}</td>
        <td data-label=${this.tr("schTrigger")}>
          ${this.tr(`schTrigger_${e.trigger.type}`)}<br /><small
            >${No(e.trigger)}</small
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
      ${r ? this.editRow(ls, e.id, h`<tdc-schedule-form
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
      ${Xt(e, (e) => e.id, (e) => this.renderRow(e))}
    </table>`;
	}
	renderList() {
		return this.schedules.length === 0 ? h`<p>${this.tr("schNone")}</p>` : this.renderFiltered(this.schedules, this.filterFields(), qo((e) => this.targetOf(e), (e) => this.actionText(e)), (e) => this.renderTable(e));
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
        ${this.runs.slice(0, ds).map((e) => h`<tr>
              <td>${Po(e.when)}</td>
              <td>${e.name}</td>
            </tr>`)}
      </table>
      ${this.runs.length > ds ? h`<p>
              <small>${this.tr("schMoreRuns", { count: this.runs.length - ds })}</small>
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
          ${this.tr("schPreview", { hours: us })} · ${this.actionCount()}
        </summary>
        ${this.renderPreview()}
      </details>
      <h3 class="list-title">${this.tr("schList")}</h3>
      ${this.renderList()}
      <p class="error">${this.error}</p>
    `;
	}
};
k([b()], Z.prototype, "schedules", void 0), k([b()], Z.prototype, "runs", void 0), k([b()], Z.prototype, "scenarios", void 0), k([b()], Z.prototype, "devices", void 0), k([b()], Z.prototype, "previewOpen", void 0), k([et("tdc-schedule-form#new")], Z.prototype, "newForm", void 0), Z = k([v("tdc-schedule-panel")], Z);
// src/transfer/helpers.ts
var fs = [
	"devices",
	"templates",
	"schedules",
	"scenarios",
	"groups"
], ps = {
	devices: "trfDevices",
	templates: "trfTemplates",
	schedules: "trfSchedules",
	scenarios: "trfScenarios",
	groups: "trfGroups"
};
function ms(e) {
	return fs.filter((t) => t !== "groups" || e);
}
function hs(e) {
	let t = (e) => String(e).padStart(2, "0");
	return `tdc-export-${`${e.getFullYear()}${t(e.getMonth() + 1)}${t(e.getDate())}`}-${t(e.getHours())}${t(e.getMinutes())}.json`;
}
function gs(e, t) {
	let n = {
		format_version: 0,
		integration_version: "",
		exported_at: t
	};
	for (let t of fs) {
		let r = e[t];
		r && (n.format_version = r[0]?.format_version ?? n.format_version, n.integration_version = r[0]?.integration_version ?? n.integration_version, n[t] = r.flatMap((e) => e.items));
	}
	return n;
}
var _s = [
	"templates",
	"devices",
	"scenarios",
	"schedules",
	"groups"
], vs = [..._s].reverse(), ys = 1048576;
function bs(e) {
	return e === "templates" ? "id" : "name";
}
function xs(e, t) {
	return e[t] ?? [];
}
function Ss(e) {
	return _s.filter((t) => Array.isArray(e[t]));
}
function Cs(e) {
	for (let t of Ss(e)) {
		let n = /* @__PURE__ */ new Set();
		for (let r of xs(e, t)) {
			let e = String(r[bs(t)] ?? "");
			if (n.has(e)) return {
				category: t,
				name: e
			};
			n.add(e);
		}
	}
}
function ws(e, t) {
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
	if (r.format_version > 2) return { error: "trfNewer" };
	if (Ss(r).length === 0) return { error: "trfBadFile" };
	let i = Cs(r);
	return i ? {
		error: "trfDuplicate",
		values: { ...i }
	} : { file: r };
}
function Ts(e, t) {
	let n = (n) => t.includes(n) ? xs(e, n).map((e) => String(e[bs(n)])) : [];
	return {
		devices: n("devices"),
		templates: n("templates"),
		scenarios: n("scenarios")
	};
}
function Es(e, t, n) {
	let r = [], i = [], a = 0;
	for (let o of e) {
		let e = JSON.stringify(o).length;
		i.length > 0 && (i.length >= t || a + e > n) && (r.push(i), i = [], a = 0), i.push(o), a += e;
	}
	return i.length > 0 && r.push(i), r;
}
function Ds(e) {
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
function Os(e) {
	return e.some((e) => e.update > 0 || e.delete > 0);
}
// src/transfer/transfer-panel.ts
var ks = [
	"add",
	"sync",
	"replace"
], As = {
	add: "trfModeAdd",
	sync: "trfModeSync",
	replace: "trfModeReplace"
}, js = 20, Ms = 33554432, Q = class extends A {
	constructor(...e) {
		super(...e), this.mqtt = !1, this.counts = {}, this.chosen = /* @__PURE__ */ new Set(), this.busy = !1, this.message = "", this.error = "", this.fileName = "", this.take = /* @__PURE__ */ new Set(), this.modes = {};
	}
	static {
		this.styles = [A.styles, o`
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
			let e = await Promise.all(ms(!0).map(async (e) => [e, (await this.api.transferExport(e, 0, 0)).total]));
			this.counts = Object.fromEntries(e);
		} catch (e) {
			this.error = w(e);
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
			for (let n of ms(this.mqtt)) this.chosen.has(n) && (e[n] = await this.api.transferExportAll(n), t += e[n].reduce((e, t) => e + t.items.length, 0));
			let n = /* @__PURE__ */ new Date(), r = hs(n);
			this.download(r, JSON.stringify(gs(e, n.toISOString()), null, 2)), this.message = this.tr("trfExported", {
				name: r,
				count: t
			});
		} catch (e) {
			this.error = w(e);
		}
		this.busy = !1;
	}
	importing() {
		let e = ms(this.mqtt);
		return _s.filter((t) => this.take.has(t) && e.includes(t) && this.file && Ss(this.file).includes(t));
	}
	batch(e, t, n) {
		let r = this.importing();
		return {
			category: e,
			mode: this.modes[e] ?? "add",
			items: t,
			known: Ts(this.file, r),
			replacing: r.filter((e) => this.modes[e] === "replace"),
			first: n,
			file_name: this.fileName
		};
	}
	async chooseFile(e) {
		let t = e.target.files?.[0];
		if (this.plans = void 0, this.message = "", this.error = "", !t) return;
		let n = await this.api.info().catch(() => void 0), r = ws(await t.text(), n?.limits.max_transfer_bytes ?? Ms);
		"error" in r ? (this.file = void 0, this.error = this.tr(r.error, r.values)) : (this.file = r.file, this.fileName = t.name, this.take = new Set(Ss(r.file)), this.modes = {});
	}
	async showPlan() {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let e = [];
			for (let t of this.importing()) {
				let n = Es(xs(this.file, t), 500, ys), r = [];
				for (let [e, i] of (n.length ? n : [[]]).entries()) r.push(await this.api.transferPlan(this.batch(t, i, e === 0)));
				e.push(Ds(r));
			}
			this.plans = e;
		} catch (e) {
			this.plans = void 0, this.error = w(e);
		}
		this.busy = !1;
	}
	async runImport() {
		this.busy = !0, this.error = "";
		try {
			let e = this.importing(), t = [];
			for (let n of vs.filter((t) => e.includes(t))) this.modes[n] === "replace" && t.push(await this.api.transferRun({
				...this.batch(n, [], !0),
				phase: "purge"
			}));
			for (let n of e) {
				let e = Es(xs(this.file, n), 500, ys);
				for (let [r, i] of e.entries()) t.push(await this.api.transferRun(this.batch(n, i, r === 0)));
			}
			let n = Ds(t.length ? t : [this.emptyPlan()]);
			this.message = this.tr("trfDone", {
				created: n.create,
				updated: n.update,
				deleted: n.delete,
				problems: n.problems.length
			}), this.plans = void 0, await this.loadCounts();
		} catch (e) {
			this.error = w(e);
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
			this.take = Pt(this.take, e), this.plans = void 0;
		}}
          />
          ${this.tr(ps[e])}
          (${xs(this.file, e).length})
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
          ${ks.map((t) => h`<option value=${t} ?selected=${(this.modes[e] ?? "add") === t}>
                ${this.tr(As[t])}
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
              <td>${this.tr(ps[e.category])}</td>
              <td>${e.create}</td>
              <td>${e.update}</td>
              <td>${e.skip}</td>
              <td>${e.conflict}</td>
              <td>${e.delete}</td>
            </tr>`)}
      </table>
      ${t.length ? h`<h3>${this.tr("trfProblems")}</h3>
              <ul>
                ${t.slice(0, js).map((e) => h`<li>${e.name} · ${e.code} · ${e.reason}</li>`)}
              </ul>
              ${t.length > js ? h`<small
                      >${this.tr("trfProblemMore", { count: t.length - js })}</small
                    >` : ""}` : ""}
      <p>
        <button class="primary" ?disabled=${this.busy} @click=${() => void this.runImport()}>
          ${Os(e) ? this.tr("trfRunConfirm", {
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
                ${Ss(this.file).filter((e) => ms(this.mqtt).includes(e)).map((e) => this.renderFileCategory(e))}
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
        @change=${() => this.chosen = Pt(this.chosen, e)}
      />
      ${this.tr(ps[e])} (${t})
    </label>`;
	}
	render() {
		let e = ms(this.mqtt).filter((e) => this.chosen.has(e) && (this.counts[e] ?? 0) > 0);
		return h`
      <p>${this.tr("trfIntro")}</p>
      <section>
        <h3>${this.tr("trfExportTitle")}</h3>
        <fieldset>
          ${ms(this.mqtt).map((e) => this.renderChoice(e))}
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
k([y({ type: Boolean })], Q.prototype, "mqtt", void 0), k([b()], Q.prototype, "counts", void 0), k([b()], Q.prototype, "chosen", void 0), k([b()], Q.prototype, "busy", void 0), k([b()], Q.prototype, "message", void 0), k([b()], Q.prototype, "error", void 0), k([b()], Q.prototype, "file", void 0), k([b()], Q.prototype, "fileName", void 0), k([b()], Q.prototype, "take", void 0), k([b()], Q.prototype, "modes", void 0), k([b()], Q.prototype, "plans", void 0), Q = k([v("tdc-transfer-panel")], Q);
// src/panel.ts
var $ = class extends A {
	constructor(...e) {
		super(...e), this.narrow = !1, this.tab = ft, this.removeTarget = "all", this.removeId = "", this.lapse = 1, this.mqtt = !1;
	}
	static {
		this.styles = [A.styles, o`
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
		!this.mqtt && this.tab === "groups" && (this.tab = ft);
	}
	startRemoval(e) {
		this.removeTarget = e.detail.target, this.removeId = e.detail.id, this.tab = "remove";
	}
	showLog(e) {
		pn("log", _o(lo, e.detail.id)), this.tab = "log";
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
        ${this.renderTab(ft, this.tr("tabDevices"))}
        ${this.renderTab("schedules", this.tr("tabSchedules"))}
        ${this.renderTab("scenarios", this.tr("tabScenarios"))}
        ${this.mqtt ? this.renderTab(pt, this.tr("tabGroups")) : ""}
        ${this.renderTab("history", this.tr("tabHistory"))}
        ${this.renderTab("log", this.tr("tabLog"))}
        ${this.renderTab("remove", this.tr("tabRemove"))}
        ${this.renderTab("transfer", this.tr("tabTransfer"))}
      </nav>
      ${this.tab === "devices" ? h`<tdc-device-list
              .hass=${this.hass}
              @tdc-remove=${this.startRemoval}
              @tdc-show-log=${this.showLog}
            ></tdc-device-list>` : ""}
      ${this.tab === "schedules" ? h`<tdc-schedule-panel .hass=${this.hass}></tdc-schedule-panel>` : ""}
      ${this.tab === "scenarios" ? h`<tdc-scenario-panel .hass=${this.hass}></tdc-scenario-panel>` : ""}
      ${this.tab === "groups" ? h`<tdc-group-panel .hass=${this.hass}></tdc-group-panel>` : ""}
      ${this.tab === "history" ? h`<tdc-history-panel .hass=${this.hass}></tdc-history-panel>` : ""}
      ${this.tab === "log" ? h`<tdc-log-panel .hass=${this.hass}></tdc-log-panel>` : ""}
      ${this.tab === "remove" ? h`<tdc-removal-panel
              .hass=${this.hass}
              .target=${this.removeTarget}
              .targetId=${this.removeId}
            ></tdc-removal-panel>` : ""}
      ${this.tab === "transfer" ? h`<tdc-transfer-panel .hass=${this.hass} .mqtt=${this.mqtt}></tdc-transfer-panel>` : ""}
    `;
	}
};
k([y({ type: Boolean })], $.prototype, "narrow", void 0), k([b()], $.prototype, "tab", void 0), k([b()], $.prototype, "removeTarget", void 0), k([b()], $.prototype, "removeId", void 0), k([b()], $.prototype, "lapse", void 0), k([b()], $.prototype, "mqtt", void 0), $ = k([v("hass-test-data-creator-panel")], $);
export { $ as TdcPanel };
