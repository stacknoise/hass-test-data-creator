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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: ee, getOwnPropertySymbols: te, getPrototypeOf: ne } = Object, f = globalThis, re = f.trustedTypes, ie = re ? re.emptyScript : "", ae = f.reactiveElementPolyfillSupport, p = (e, t) => e, m = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ie : null;
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
	converter: m,
	reflect: !1,
	useDefault: !1,
	hasChanged: oe
};
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
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
		if (this.hasOwnProperty(p("elementProperties"))) return;
		let e = ne(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(p("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(p("properties"))) {
			let e = this.properties, t = [...ee(e), ...te(e)];
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
			let i = (n.converter?.toAttribute === void 0 ? m : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? m : e.converter;
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
h.elementStyles = [], h.shadowRootOptions = { mode: "open" }, h[p("elementProperties")] = /* @__PURE__ */ new Map(), h[p("finalized")] = /* @__PURE__ */ new Map(), ae?.({ ReactiveElement: h }), (f.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var ce = globalThis, le = (e) => e, g = ce.trustedTypes, ue = g ? g.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, de = "$lit$", _ = `lit$${Math.random().toFixed(9).slice(2)}$`, fe = "?" + _, pe = `<${fe}>`, v = document, y = () => v.createComment(""), b = (e) => e === null || typeof e != "object" && typeof e != "function", me = Array.isArray, he = (e) => me(e) || typeof e?.[Symbol.iterator] == "function", x = "[ 	\n\f\r]", S = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ge = /-->/g, _e = />/g, C = RegExp(`>|${x}(?:([^\\s"'>=/]+)(${x}*=${x}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ve = /'/g, ye = /"/g, be = /^(?:script|style|textarea|title)$/i, xe = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), w = xe(1), Se = xe(2), T = Symbol.for("lit-noChange"), E = Symbol.for("lit-nothing"), Ce = /* @__PURE__ */ new WeakMap(), D = v.createTreeWalker(v, 129);
function we(e, t) {
	if (!me(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ue === void 0 ? t : ue.createHTML(t);
}
var Te = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = S;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === S ? c[1] === "!--" ? o = ge : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = C) : (be.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = C) : o = _e : o === C ? c[0] === ">" ? (o = i ?? S, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? C : c[3] === "\"" ? ye : ve) : o === ye || o === ve ? o = C : o === ge || o === _e ? o = S : (o = C, i = void 0);
		let d = o === C && e[t + 1].startsWith("/>") ? " " : "";
		a += o === S ? n + pe : l >= 0 ? (r.push(s), n.slice(0, l) + de + n.slice(l) + _ + d) : n + _ + (l === -2 ? t : d);
	}
	return [we(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ee = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Te(t, n);
		if (this.el = e.createElement(l, r), D.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = D.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(de)) {
					let t = u[o++], n = i.getAttribute(e).split(_), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ke : r[1] === "?" ? Ae : r[1] === "@" ? je : k
					}), i.removeAttribute(e);
				} else e.startsWith(_) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (be.test(i.tagName)) {
					let e = i.textContent.split(_), t = e.length - 1;
					if (t > 0) {
						i.textContent = g ? g.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], y()), D.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], y());
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
function O(e, t, n = e, r) {
	if (t === T) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = b(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = O(e, i._$AS(e, t.values), i, r)), t;
}
var De = class {
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
		D.currentNode = r;
		let i = D.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Oe(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Me(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = D.nextNode(), a++);
		}
		return D.currentNode = v, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Oe = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = E, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = O(this, e, t), b(e) ? e === E || e == null || e === "" ? (this._$AH !== E && this._$AR(), this._$AH = E) : e !== this._$AH && e !== T && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? he(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== E && b(this._$AH) ? this._$AA.nextSibling.data = e : this.T(v.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ee.createElement(we(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new De(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Ce.get(e.strings);
		return t === void 0 && Ce.set(e.strings, t = new Ee(e)), t;
	}
	k(t) {
		me(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(y()), this.O(y()), this, this.options)) : r = n[i], r._$AI(a), i++;
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
}, k = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = E, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = E;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = O(this, e, t, 0), a = !b(e) || e !== this._$AH && e !== T, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = O(this, r[n + o], t, o), s === T && (s = this._$AH[o]), a ||= !b(s) || s !== this._$AH[o], s === E ? e = E : e !== E && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === E ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ke = class extends k {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === E ? void 0 : e;
	}
}, Ae = class extends k {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== E);
	}
}, je = class extends k {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = O(this, e, t, 0) ?? E) === T) return;
		let n = this._$AH, r = e === E && n !== E || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== E && (n === E || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Me = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		O(this, e);
	}
}, Ne = ce.litHtmlPolyfillSupport;
Ne?.(Ee, Oe), (ce.litHtmlVersions ??= []).push("3.3.3");
var Pe = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Oe(t.insertBefore(y(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Fe = globalThis, A = class extends h {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Pe(t, this.renderRoot, this.renderOptions);
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
};
A._$litElement$ = !0, A.finalized = !0, Fe.litElementHydrateSupport?.({ LitElement: A });
var Ie = Fe.litElementPolyfillSupport;
Ie?.({ LitElement: A }), (Fe.litElementVersions ??= []).push("4.2.2");
// node_modules/@lit/reactive-element/decorators/custom-element.js
var j = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, Le = {
	attribute: !0,
	type: String,
	converter: m,
	reflect: !1,
	hasChanged: oe
}, Re = (e = Le, t, n) => {
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
function M(e) {
	return (t, n) => typeof n == "object" ? Re(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function N(e) {
	return M({
		...e,
		state: !0,
		attribute: !1
	});
}
// src/common/api.ts
var ze = "hass_test_data_creator", Be = class {
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
	fire(e, t, n) {
		return this.call("devices/fire", {
			device: e,
			entity: t,
			action: n
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
	call(e, t = {}) {
		let n = Object.fromEntries(Object.entries(t).filter(([, e]) => e !== void 0));
		return this.hass.callWS({
			type: `${ze}/${e}`,
			...n
		});
	}
};
function P(e) {
	if (typeof e == "object" && e && "message" in e) {
		let { code: t, message: n } = e;
		return t ? `${t}: ${n}` : n;
	}
	return String(e);
}
// src/common/i18n.ts
var Ve = {
	en: {
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
		planScenarios: "{count} scenarios",
		planTopics: "{count} MQTT topics with retained messages",
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
	},
	de: {
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
		planScenarios: "{count} Szenarien",
		planTopics: "{count} MQTT-Topics mit retained Nachrichten",
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
	}
};
function He(e) {
	return e?.toLowerCase().startsWith("de") ? "de" : "en";
}
function Ue(e, t, n = {}) {
	return Ve[e][t].replace(/\{(\w+)\}/g, (e, t) => t in n ? String(n[t]) : e);
}
// \0@oxc-project+runtime@0.155.0/helpers/esm/decorate.js
function F(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/common/base.ts
var We = o`
  border-radius: 6px;
  border: 1px solid var(--divider-color);
  background: var(--card-background-color);
  color: var(--primary-text-color);
`, I = class extends A {
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
      ${We}
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
      ${We}
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
	get api() {
		return this.client?.hass !== this.hass && (this.client = {
			hass: this.hass,
			api: new Be(this.hass)
		}), this.client.api;
	}
	textField(e, t, n, r = {}) {
		return w`<label style="flex: ${r.flex ?? "1 1 200px"}"
      >${e}
      <input
        .value=${t}
        placeholder=${r.placeholder ?? ""}
        @input=${(e) => n(e.target.value)}
      />
    </label>`;
	}
	select(e, t, n, r, i) {
		return w`<label style="flex: 1 1 180px"
      >${e}
      <select @change=${(e) => i(e.target.value)}>
        ${t.map((e) => w`<option value=${e} ?selected=${e === n}>${r(e)}</option>`)}
      </select>
    </label>`;
	}
	tr(e, t) {
		return Ue(He(this.hass?.language), e, t);
	}
};
F([M({ attribute: !1 })], I.prototype, "hass", void 0);
// src/devices/device-list.ts
var Ge = 200, Ke = 1e4, qe = {
	switch: "toggle",
	event: "press",
	binary_sensor: "pulse",
	light: "toggle"
}, Je = [
	"sensor",
	"switch",
	"binary_sensor",
	"light",
	"cover",
	"climate"
], L = class extends I {
	constructor(...e) {
		super(...e), this.devices = [], this.total = 0, this.loaded = !1, this.error = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), Ke);
	}
	disconnectedCallback() {
		window.clearInterval(this.timer), super.disconnectedCallback();
	}
	async refresh(e = !1) {
		let t = Math.max(Ge, this.devices.length + (e ? Ge : 0));
		try {
			let e = await this.api.devices(0, t);
			this.devices = e.devices, this.total = e.total, this.error = "";
		} catch (e) {
			this.error = P(e);
		}
		this.loaded = !0;
	}
	async fire(e, t) {
		try {
			await this.api.fire(e.id, t.key, qe[t.platform]), await this.refresh();
		} catch (e) {
			this.error = P(e);
		}
	}
	values(e) {
		return e.entities.filter((e) => Je.includes(e.platform)).slice(0, 4).map((e) => `${e.name}: ${e.state ?? "–"}${e.unit ? ` ${e.unit}` : ""}${e.fault ? ` ⚠ ${e.fault}` : ""}`).join(" · ");
	}
	renderRow(e) {
		let t = e.entities.filter((e) => e.platform in qe);
		return w`<tr>
      <td>${e.name}</td>
      <td>${e.model}</td>
      <td>${e.area ?? "–"}</td>
      <td>${e.output}</td>
      <td><small>${this.values(e)}</small></td>
      <td class="row">
        ${t.map((t) => w`<button @click=${() => void this.fire(e, t)}>${t.name}</button>`)}
        <button
          @click=${() => this.dispatchEvent(new CustomEvent("tdc-remove", { detail: {
			target: "device",
			id: e.id
		} }))}
        >
          ${this.tr("remove")}
        </button>
      </td>
    </tr>`;
	}
	render() {
		return this.loaded ? w`
      ${this.error ? w`<p class="error">${this.error}</p>` : ""}
      ${this.devices.length === 0 ? w`<p>${this.tr("noDevices")}</p>` : w`<table>
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
                  ${this.tr("devicesOf", {
			shown: this.devices.length,
			total: this.total
		})}
                </small>
                ${this.devices.length < this.total ? w`<button @click=${() => void this.refresh(!0)}>
                        ${this.tr("loadMore")}
                      </button>` : ""}
              </p>`}
    ` : w`${this.tr("loading")}`;
	}
};
F([N()], L.prototype, "devices", void 0), F([N()], L.prototype, "total", void 0), F([N()], L.prototype, "loaded", void 0), F([N()], L.prototype, "error", void 0), L = F([j("tdc-device-list")], L);
// src/common/polling.ts
var Ye = 1e4, R = class extends I {
	constructor(...e) {
		super(...e), this.templates = [], this.message = "", this.error = "", this.busy = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this.loadOptions(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), Ye);
	}
	disconnectedCallback() {
		window.clearInterval(this.timer), super.disconnectedCallback();
	}
	async loadOptions() {
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.optionsLoaded(this.info);
		} catch (e) {
			this.error = P(e);
		}
	}
	async run(e) {
		this.busy = !0, this.message = "", this.error = "";
		try {
			let t = await e();
			this.message = typeof t == "string" ? t : "", await this.refresh();
		} catch (e) {
			this.error = P(e);
		}
		this.busy = !1;
	}
};
F([N()], R.prototype, "info", void 0), F([N()], R.prototype, "templates", void 0), F([N()], R.prototype, "message", void 0), F([N()], R.prototype, "error", void 0), F([N()], R.prototype, "busy", void 0);
// src/wizard/helpers.ts
function Xe(e) {
	return e.split(",").map((e) => e.trim()).filter((e) => e.length > 0);
}
function Ze(e, t) {
	return Math.round(e / Math.max(1, t) * 10) / 10;
}
// src/group/group-panel.ts
var Qe = 500, z = class extends R {
	constructor(...e) {
		super(...e), this.groups = [], this.names = {}, this.name = "", this.members = "";
	}
	optionsLoaded() {
		this.error = "";
	}
	async refresh() {
		try {
			let [e, t] = await Promise.all([this.api.groups(), this.api.devices(0, Qe)]);
			this.groups = e, this.names = Object.fromEntries(t.devices.map((e) => [e.id, e.name]));
		} catch (e) {
			this.error = P(e);
		}
	}
	async add() {
		await this.run(async () => {
			await this.api.addGroup(this.name, Xe(this.members)), this.name = "", this.members = "";
		});
	}
	renderRow(e) {
		let t = e.members.map((e) => this.names[e] ?? e).join(", ");
		return w`<tr>
      <td>${e.name}<br /><small>${this.tr("grpNumber", { number: e.number })}</small></td>
      <td>${t}</td>
      <td>
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
		return w`
      ${this.groups.length === 0 ? w`<p>${this.tr("grpNone")}</p>` : w`<table>
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
F([N()], z.prototype, "groups", void 0), F([N()], z.prototype, "names", void 0), F([N()], z.prototype, "name", void 0), F([N()], z.prototype, "members", void 0), z = F([j("tdc-group-panel")], z);
// src/removal/removal-panel.ts
var B = class extends I {
	constructor(...e) {
		super(...e), this.target = "all", this.targetId = "", this.busy = !1, this.message = "", this.error = "";
	}
	async showPlan() {
		this.message = "", this.error = "";
		try {
			this.plan = await this.api.removalPlan(this.target, this.targetId || void 0);
		} catch (e) {
			this.plan = void 0, this.error = P(e);
		}
	}
	async confirm() {
		this.busy = !0;
		try {
			let e = await this.api.removalRun(this.target, this.targetId || void 0);
			this.message = this.tr("removed", { count: e.devices + e.orphans }), this.plan = void 0;
		} catch (e) {
			this.error = P(e);
		}
		this.busy = !1;
	}
	renderPlan(e) {
		return e.devices.length + e.orphans.length === 0 && e.runs.length === 0 ? w`<p>${this.tr("planNothing")}</p>` : w`<ul>
        <li>${this.tr("planDevices", { count: e.devices.length })}</li>
        ${e.groups.length ? w`<li>${this.tr("planGroups", { count: e.groups.length })}</li>` : ""}
        ${e.topics.length ? w`<li>${this.tr("planTopics", { count: e.topics.length })}</li>` : ""}
        ${e.scenarios.length ? w`<li>${this.tr("planScenarios", { count: e.scenarios.length })}</li>` : ""}
        ${e.schedules.length ? w`<li>${this.tr("planSchedules", { count: e.schedules.length })}</li>` : ""}
        ${e.orphans.length ? w`<li>${this.tr("planOrphans", { count: e.orphans.length })}</li>` : ""}
        ${e.areas.length ? w`<li>${this.tr("planAreas", { names: e.areas.join(", ") })}</li>` : ""}
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
		return w`
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
        ${this.target === "all" ? "" : this.textField(this.tr("targetId"), this.targetId, (e) => this.targetId = e, { flex: "1 1 260px" })}
        <button @click=${() => void this.showPlan()}>${this.tr("showPlan")}</button>
      </div>
      ${this.plan ? this.renderPlan(this.plan) : ""}
      <p>${this.message}<span class="error">${this.error}</span></p>
    `;
	}
};
F([M()], B.prototype, "target", void 0), F([M()], B.prototype, "targetId", void 0), F([N()], B.prototype, "plan", void 0), F([N()], B.prototype, "busy", void 0), F([N()], B.prototype, "message", void 0), F([N()], B.prototype, "error", void 0), B = F([j("tdc-removal-panel")], B);
// src/schedule/helpers.ts
function $e() {
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
function et(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function tt(e) {
	switch (e.type) {
		case "times": return e.weekdays.length ? {
			type: "times",
			times: et(e.times),
			weekdays: [...e.weekdays].sort()
		} : {
			type: "times",
			times: et(e.times)
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
function nt(e, t) {
	switch (e) {
		case "all": return { all: !0 };
		case "template": return { template: t };
		case "device": return { device: t };
		case "run": return { run: t };
	}
}
function rt(e) {
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
function it(e) {
	switch (e.type) {
		case "times": return e.times.join(", ");
		case "interval": return `${e.every_s} s (${e.start}–${e.end})`;
		case "once": return e.at.replace("T", " ");
		case "random_window": return `${e.count}× ${e.start}–${e.end}`;
		case "poisson": return `Ø ${e.per_day}/d`;
	}
}
function at(e) {
	return e.slice(0, 16).replace("T", " ");
}
function ot(e) {
	return Object.entries(e).flatMap(([e, t]) => t.map((t) => `${e}/${t}`));
}
function V(e) {
	return {
		kind: "all",
		targetId: "",
		actionKey: ot(e)[0] ?? "",
		entity: ""
	};
}
function st(e, t) {
	let n = t.split("/")[0], r = e.flatMap((e) => e.entities.filter((e) => e.platform === n).map((e) => e.key));
	return [...new Set(r)];
}
function ct(e, t) {
	return {
		target: nt(e.kind, e.targetId),
		entity: e.entity || st(t, e.actionKey)[0] || "",
		action: e.actionKey.split("/")[1] ?? ""
	};
}
// src/schedule/work-picker.ts
var lt = [
	"all",
	"template",
	"device",
	"run"
], H = class extends I {
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
		let e = st(this.templates, this.work.actionKey);
		return w`
      <div class="row">
        ${this.select(this.tr("schTarget"), lt, this.work.kind, (e) => this.tr(`schTarget_${e}`), (e) => this.emit({ kind: e }))}
        ${this.work.kind === "all" ? E : this.textField(this.tr("targetId"), this.work.targetId, (e) => this.emit({ targetId: e }))}
        ${this.select(this.tr("schAction"), ot(this.actions), this.work.actionKey, (e) => e, (e) => this.emit({
			actionKey: e,
			entity: ""
		}))}
        ${this.select(this.tr("schEntity"), e, this.work.entity || e[0] || "", (e) => e, (e) => this.emit({ entity: e }))}
      </div>
    `;
	}
};
F([M({ attribute: !1 })], H.prototype, "work", void 0), F([M({ attribute: !1 })], H.prototype, "actions", void 0), F([M({ attribute: !1 })], H.prototype, "templates", void 0), H = F([j("tdc-work-picker")], H);
// src/scenario/helpers.ts
function U(e) {
	return {
		afterS: 0,
		work: V(e),
		params: ""
	};
}
function ut(e) {
	if (e.trim() === "") return {};
	try {
		let t = JSON.parse(e);
		return typeof t == "object" && t && !Array.isArray(t) ? t : void 0;
	} catch {
		return;
	}
}
function dt(e, t) {
	let n = [];
	for (let r of e) {
		let e = ut(r.params);
		if (e === void 0) return;
		n.push({
			after_s: Math.max(0, r.afterS || 0),
			...ct(r.work, t),
			params: e
		});
	}
	return n;
}
// src/scenario/scenario-panel.ts
var W = class extends R {
	constructor(...e) {
		super(...e), this.scenarios = [], this.name = "", this.steps = [];
	}
	optionsLoaded(e) {
		this.steps = [U(e.actions)];
	}
	async refresh() {
		try {
			this.scenarios = await this.api.scenarios();
		} catch (e) {
			this.error = P(e);
		}
	}
	async add() {
		let e = dt(this.steps, this.templates);
		e ? await this.run(async () => {
			await this.api.addScenario(this.name, e), this.name = "", this.steps = [U(this.info?.actions ?? {})];
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
		return w`<fieldset>
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
		return w`
      <h3>${this.tr("scnNew")}</h3>
      <div class="row">
        ${this.textField(this.tr("schName"), this.name, (e) => this.name = e)}
      </div>
      ${this.steps.map((e, t) => this.renderStep(e, t))}
      <p class="row">
        <button
          @click=${() => this.steps = [...this.steps, U(this.info?.actions ?? {})]}
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
		let t = e.steps[0], { kind: n } = t ? rt(t.target) : { kind: "all" };
		return w`<tr>
      <td>${e.name}</td>
      <td>
        ${this.tr("scnStepCount", { count: e.steps.length })}<br /><small
          >${t ? `${t.entity}: ${t.action} · ${this.tr(`schTarget_${n}`)}` : ""}</small
        >
      </td>
      <td>
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
		return w`
      ${this.scenarios.length === 0 ? w`<p>${this.tr("scnNone")}</p>` : w`<table>
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
F([N()], W.prototype, "scenarios", void 0), F([N()], W.prototype, "name", void 0), F([N()], W.prototype, "steps", void 0), W = F([j("tdc-scenario-panel")], W);
// src/schedule/schedule-panel.ts
var ft = 24, pt = 50, mt = [
	"times",
	"interval",
	"once",
	"random_window",
	"poisson"
], ht = [
	"weekdayMon",
	"weekdayTue",
	"weekdayWed",
	"weekdayThu",
	"weekdayFri",
	"weekdaySat",
	"weekdaySun"
], G = class extends R {
	constructor(...e) {
		super(...e), this.schedules = [], this.runs = [], this.scenarios = [], this.scenarioId = "", this.name = "", this.work = V({}), this.seed = "", this.form = $e();
	}
	optionsLoaded(e) {
		this.work = V(e.actions);
	}
	async refresh() {
		try {
			[this.schedules, this.runs, this.scenarios] = await Promise.all([
				this.api.schedules(),
				this.api.schedulePreview(ft),
				this.api.scenarios()
			]), this.error = "";
		} catch (e) {
			this.error = P(e);
		}
	}
	async add() {
		await this.run(async () => {
			await this.api.addSchedule({
				name: this.name,
				...this.scenarioId ? { scenario: this.scenarioId } : ct(this.work, this.templates),
				trigger: tt(this.form),
				seed: this.seed || void 0
			}), this.name = "";
		});
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
	field(e, t, n = "text") {
		let r = n === "number";
		return w`<label style="flex: 1 1 140px"
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
	renderTriggerFields() {
		switch (this.form.type) {
			case "times": return w`${this.field(this.tr("schTimes"), "times")}
          <div class="row">
            ${ht.map((e, t) => w`<label style="flex-direction: row; align-items: center">
                  <input
                    type="checkbox"
                    style="width: auto"
                    .checked=${this.form.weekdays.includes(t)}
                    @change=${(e) => this.setForm({ weekdays: e.target.checked ? [...this.form.weekdays, t] : this.form.weekdays.filter((e) => e !== t) })}
                  />${this.tr(e)}
                </label>`)}
          </div>`;
			case "interval": return w`${this.field(this.tr("schEveryS"), "everyS", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case "once": return this.field(this.tr("schAt"), "at", "datetime-local");
			case "random_window": return w`${this.field(this.tr("schCount"), "count", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case "poisson": return this.field(this.tr("schPerDay"), "perDay", "number");
		}
	}
	renderForm() {
		return w`
      <h3>${this.tr("schNew")}</h3>
      <div class="row">
        ${this.textField(this.tr("schName"), this.name, (e) => this.name = e)}
        ${this.select(this.tr("schTrigger"), mt, this.form.type, (e) => this.tr(`schTrigger_${e}`), (e) => this.setForm({ type: e }))}
      </div>
      <div class="row">
        ${this.select(this.tr("schRuns"), ["", ...this.scenarios.map((e) => e.id)], this.scenarioId, (e) => e ? this.tr("schScenario", { id: this.scenarioName(e) }) : this.tr("schRunsAction"), (e) => this.scenarioId = e)}
      </div>
      ${this.scenarioId ? E : w`<tdc-work-picker
              .hass=${this.hass}
              .work=${this.work}
              .actions=${this.info?.actions ?? {}}
              .templates=${this.templates}
              @tdc-work-change=${(e) => this.work = e.detail}
            ></tdc-work-picker>`}
      <div class="row">
        ${this.renderTriggerFields()}
        ${this.textField(this.tr("seed"), this.seed, (e) => this.seed = e, {
			flex: "1 1 140px",
			placeholder: this.tr("seedHint")
		})}
      </div>
      <p>
        <button
          class="primary"
          ?disabled=${this.busy || !this.name.trim() || !(this.scenarioId || this.work.actionKey)}
          @click=${() => void this.add()}
        >
          ${this.tr("schAdd")}
        </button>
      </p>
    `;
	}
	renderRow(e) {
		let { kind: t, id: n } = rt(e.target);
		return w`<tr>
      <td>${e.name}</td>
      <td>
        ${e.scenario ? "–" : `${this.tr(`schTarget_${t}`)}${n ? ` ${n}` : ""}`}
      </td>
      <td>
        ${e.scenario ? this.tr("schScenario", { id: this.scenarioName(e.scenario) }) : `${e.entity}: ${e.action}`}
      </td>
      <td>
        ${this.tr(`schTrigger_${e.trigger.type}`)}<br /><small
          >${it(e.trigger)}</small
        >
      </td>
      <td>
        <input
          type="checkbox"
          style="width: auto"
          title=${this.tr("schEnabled")}
          .checked=${e.enabled}
          ?disabled=${this.busy}
          @change=${(t) => void this.run(() => this.api.enableSchedule(e.id, t.target.checked))}
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
	renderPreview() {
		return this.runs.length === 0 ? w`<p><small>${this.tr("schNoRuns")}</small></p>` : w`<table>
        <tr>
          <th>${this.tr("schWhen")}</th>
          <th>${this.tr("schName")}</th>
        </tr>
        ${this.runs.slice(0, pt).map((e) => w`<tr>
              <td>${at(e.when)}</td>
              <td>${e.name}</td>
            </tr>`)}
      </table>
      ${this.runs.length > pt ? w`<p>
              <small>${this.tr("schMoreRuns", { count: this.runs.length - pt })}</small>
            </p>` : E}`;
	}
	render() {
		return w`
      ${this.schedules.length === 0 ? w`<p>${this.tr("schNone")}</p>` : w`<table>
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
      <h3>${this.tr("schPreview", { hours: ft })}</h3>
      ${this.renderPreview()}
      <p class="error">${this.error}</p>
    `;
	}
};
F([N()], G.prototype, "schedules", void 0), F([N()], G.prototype, "runs", void 0), F([N()], G.prototype, "scenarios", void 0), F([N()], G.prototype, "scenarioId", void 0), F([N()], G.prototype, "name", void 0), F([N()], G.prototype, "work", void 0), F([N()], G.prototype, "seed", void 0), F([N()], G.prototype, "form", void 0), G = F([j("tdc-schedule-panel")], G);
// src/signals/editor-helpers.ts
var gt = ["enum", "state_machine"], _t = [
	"sine",
	"saw",
	"square",
	"triangle",
	"random_walk",
	"discharge"
], vt = [
	"constant",
	"household_load",
	"pv_day"
], yt = 600;
function bt(e) {
	return gt.includes(e);
}
function xt(e) {
	return e === "counter" ? ["rate_per_hour"] : e === "noise" ? ["interval_s", "noise"] : e === "steps" ? [
		"period_s",
		"interval_s",
		"phase",
		"noise"
	] : e === "enum" ? ["interval_s"] : e === "state_machine" ? ["phase"] : _t.includes(e) ? [
		"period_s",
		"phase",
		"noise"
	] : vt.includes(e) ? ["noise"] : [];
}
function St(e) {
	return e === "enum" ? ["values", "weights"] : e === "state_machine" ? ["states"] : [];
}
function Ct(e, t, n) {
	let r = { ...e }, i = Number(n);
	return n.trim() === "" || Number.isNaN(i) ? delete r[t] : r[t] = i, r;
}
function wt(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function Tt(e, t) {
	return t === "states" ? (e.states ?? []).map((e) => `${e.value}:${e.duration_s}`).join(", ") : (e[t] ?? []).join(", ");
}
function Et(e, t, n) {
	let r = { ...e };
	return t === "values" ? r.values = wt(n) : t === "weights" ? r.weights = wt(n).map(Number).filter((e) => !Number.isNaN(e)) : r.states = wt(n).flatMap((e) => {
		let [t, n] = e.split(":").map((e) => e.trim()), r = Number(n);
		return t && r > 0 ? [{
			value: t,
			duration_s: r
		}] : [];
	}), r;
}
function Dt(e) {
	return e === "enum" ? {
		values: ["on", "off"],
		interval_s: yt
	} : e === "state_machine" ? { states: [{
		value: "idle",
		duration_s: yt
	}, {
		value: "active",
		duration_s: yt
	}] } : {};
}
function Ot(e, t) {
	let n = /* @__PURE__ */ new Set([
		"shape",
		...xt(t),
		...St(t)
	]);
	bt(t) || [
		"min",
		"max",
		"decimals"
	].forEach((e) => n.add(e));
	let r = {
		...Dt(t),
		...e,
		shape: t
	};
	return Object.fromEntries(Object.entries(r).filter(([e]) => n.has(e)));
}
function kt(e) {
	try {
		let t = JSON.parse(e);
		return Array.isArray(t) ? t : [];
	} catch {
		return [];
	}
}
function At(e) {
	return kt(e).flatMap((e, t) => e.platform === "sensor" && e.signal ? [{
		index: t,
		name: String(e.name ?? e.key ?? t),
		signal: e.signal
	}] : []);
}
function jt(e, t, n) {
	let r = kt(e);
	return r[t] ? (r[t] = {
		...r[t],
		signal: n
	}, JSON.stringify(r, null, 2)) : e;
}
// src/signals/signals.ts
var K = (1n << 64n) - 1n, Mt = 11400714819323198485n, Nt = 13787848793156543929n, Pt = 10723151780598845931n, Ft = 3600, It = 86400, Lt = 24, Rt = .12, zt = [
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
], Bt = .12, Vt = 600, Ht = 6, Ut = 900, Wt = .3, Gt = 2, Kt = 3;
function qt(e, t = 0, n = 0) {
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
function q(e, t) {
	let n = BigInt(e) * Mt + (BigInt(t) & K) * Nt + Pt & K;
	return n = (n ^ n >> 30n) * Nt & K, n = (n ^ n >> 27n) * Pt & K, n ^= n >> 31n, Number(n >> 11n) / 2 ** 53;
}
function J(e, t) {
	let n = t / e.period_s + e.phase;
	return n - Math.floor(n);
}
function Jt(e, t) {
	let n = Math.floor(t), r = t - n, i = r * r * (3 - 2 * r), a = q(e, n);
	return a + (q(e, n + 1) - a) * i;
}
function Yt(e) {
	return (e % It + It) % It / Ft;
}
function Xt(e, t, n) {
	let r = Math.abs(e - t), i = Math.min(r, Lt - r);
	return Math.exp(-.5 * (i / n) ** 2);
}
var Zt = {
	constant: () => .5,
	sine: (e, t) => .5 + .5 * Math.sin(2 * Math.PI * J(e, t)),
	saw: (e, t) => J(e, t),
	square: (e, t) => +(J(e, t) < .5),
	triangle: (e, t) => 1 - Math.abs(2 * J(e, t) - 1),
	noise: (e, t) => q(e.seed, Math.floor(t / e.interval_s)),
	random_walk: (e, t) => Jt(e.seed, t / e.period_s + e.phase),
	household_load: (e, t) => {
		let n = Yt(t);
		return zt.reduce((e, [t, r, i]) => e + i * Xt(n, t, r), Rt) + Bt * (Jt(e.seed, t / Vt) - .5);
	},
	pv_day: (e, t) => {
		let n = (Yt(t) - Ht) / 14;
		if (!(n > 0 && n < 1)) return 0;
		let r = 1 - Wt * Jt(e.seed, t / Ut);
		return Math.sin(Math.PI * n) ** 1.5 * r;
	},
	steps: (e, t) => {
		let n = Math.max(Gt, Math.round(e.period_s / e.interval_s));
		return Math.min(1, Math.floor(J(e, t) * n) / (n - 1));
	},
	discharge: (e, t) => 1 - J(e, t) ** Kt
};
function Qt(e, t) {
	let n = e.weights.length ? e.weights : e.values.map(() => 1), r = n.reduce((e, t) => e + t, 0), i = q(e.seed, Math.floor(t / e.interval_s)) * r, a = 0;
	for (let [t, r] of e.values.entries()) if (a += n[t], i < a) return r;
	return e.values[e.values.length - 1];
}
function $t(e, t) {
	let n = e.states.reduce((e, [, t]) => e + t, 0), r = ((t + e.phase * n) % n + n) % n, i = 0;
	for (let [t, n] of e.states) if (i += n, r < i) return t;
	return e.states[e.states.length - 1][0];
}
var en = {
	enum: Qt,
	state_machine: $t
};
function tn(e) {
	let t = e.shape === "enum" ? e.values : e.states.map(([e]) => e);
	return [...new Set(t)];
}
function nn(e, t) {
	return Number(e.toFixed(t));
}
function rn(e, t) {
	if (e.shape in en) return en[e.shape](e, t);
	if (e.shape === "counter") {
		let n = Math.max(0, t - e.origin);
		return nn(e.min + e.rate_per_hour * n / Ft, e.decimals);
	}
	let n = (Zt[e.shape] ?? Zt.constant)(e, t);
	return e.noise && (n += (q(e.seed + 1, Math.floor(t)) - .5) * 2 * e.noise), n = Math.min(1, Math.max(0, n)), nn(e.min + n * (e.max - e.min), e.decimals);
}
// src/signals/signal-preview.ts
var an = 320, on = 80, sn = 96, cn = 86400, Y = class extends A {
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
		let t = qt(e, 1, 0), n = tn(t), r = Array.from({ length: 97 }, (e, r) => {
			let i = rn(t, r / sn * cn);
			return typeof i == "string" ? n.indexOf(i) : i;
		}), i = Math.min(...r), a = Math.max(...r) - i || 1;
		return r.map((e, t) => {
			let n = t / sn * an, r = 74 - (e - i) / a * 68;
			return `${n.toFixed(1)},${r.toFixed(1)}`;
		}).join(" ");
	}
	render() {
		if (!this.signal) return w``;
		let e = this.signal.shape === "enum" || this.signal.shape === "state_machine", t = e ? tn(qt(this.signal)).join(" · ") : "", n = this.signal.min ?? 0, r = this.signal.max ?? 100;
		return w`<svg viewBox="0 0 ${an} ${on}" role="img">
        ${Se`<polyline points=${this.points(this.signal)}></polyline>`}
      </svg>
      <div>${e ? t : `${n} – ${r} ${this.unit}`}</div>`;
	}
};
F([M({ attribute: !1 })], Y.prototype, "signal", void 0), F([M()], Y.prototype, "unit", void 0), Y = F([j("tdc-signal-preview")], Y);
// src/signals/curve-editor.ts
var ln = {
	min: "edMin",
	max: "edMax",
	decimals: "edDecimals",
	period_s: "edPeriod",
	interval_s: "edInterval",
	phase: "edPhase",
	rate_per_hour: "edRate",
	noise: "edNoise"
}, un = {
	values: "edValues",
	weights: "edWeights",
	states: "edStates"
}, X = class extends I {
	constructor(...e) {
		super(...e), this.shapes = [], this.unit = "";
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent("tdc-signal-change", { detail: e }));
	}
	numberField(e) {
		return w`<label style="flex: 1 1 120px"
      >${this.tr(ln[e])}
      <input
        type="number"
        step="any"
        .value=${this.signal[e] === void 0 ? "" : String(this.signal[e])}
        @input=${(t) => this.emit(Ct(this.signal, e, t.target.value))}
      />
    </label>`;
	}
	listField(e) {
		return this.textField(this.tr(un[e]), Tt(this.signal, e), (t) => this.emit(Et(this.signal, e, t)), { flex: "1 1 240px" });
	}
	render() {
		return w`
      <div class="row">
        <label style="flex: 1 1 180px"
          >${this.tr("edShape")}
          <select
            @change=${(e) => this.emit(Ot(this.signal, e.target.value))}
          >
            ${this.shapes.map((e) => w`<option value=${e} ?selected=${e === this.signal.shape}>
                  ${e}
                </option>`)}
          </select>
        </label>
        ${bt(this.signal.shape) ? "" : w`${this.numberField("min")} ${this.numberField("max")}
              ${this.numberField("decimals")}`}
      </div>
      <div class="row">
        ${xt(this.signal.shape).map((e) => this.numberField(e))}
        ${St(this.signal.shape).map((e) => this.listField(e))}
      </div>
      <tdc-signal-preview .signal=${this.signal} unit=${this.unit}></tdc-signal-preview>
    `;
	}
};
F([M({ attribute: !1 })], X.prototype, "signal", void 0), F([M({ attribute: !1 })], X.prototype, "shapes", void 0), F([M()], X.prototype, "unit", void 0), X = F([j("tdc-curve-editor")], X);
// src/wizard/creation-wizard.ts
var Z = "custom", dn = {
	native: "outputNative",
	mqtt: "outputMqtt",
	z2m: "outputZ2m"
}, fn = 50, pn = JSON.stringify([{
	key: "level",
	platform: "sensor",
	name: "Level",
	unit: "%",
	signal: {
		shape: "sine",
		min: 0,
		max: 100
	}
}], null, 2), Q = class extends I {
	constructor(...e) {
		super(...e), this.templates = [], this.template = "", this.count = 10, this.pattern = "{template} {nn}", this.areas = "", this.mode = "even", this.seed = "", this.output = "native", this.custom = pn, this.editIndex = -1, this.busy = !1, this.message = "", this.error = "";
	}
	async connectedCallback() {
		super.connectedCallback();
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.template = this.templates[0]?.id ?? Z;
		} catch (e) {
			this.error = P(e);
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
		this.custom = jt(this.custom, e, t.detail);
	}
	renderEditor() {
		let e = At(this.custom), t = e.find((e) => e.index === this.editIndex) ?? e[0];
		return t ? w`<h3>${this.tr("edSensor")}</h3>
      <p>
        <select
          @change=${(e) => this.editIndex = Number(e.target.value)}
        >
          ${e.map((e) => w`<option value=${e.index} ?selected=${e.index === t.index}>
                ${e.name}
              </option>`)}
        </select>
      </p>
      <tdc-curve-editor
        .hass=${this.hass}
        .signal=${t.signal}
        .shapes=${this.info?.shapes ?? []}
        @tdc-signal-change=${(e) => this.changeSignal(t.index, e)}
      ></tdc-curve-editor>` : w``;
	}
	async submit() {
		this.busy = !0, this.message = "", this.error = "";
		let e = {
			template: this.template,
			count: this.count,
			name_pattern: this.pattern,
			areas: Xe(this.areas),
			area_mode: this.mode,
			output: this.output,
			...this.seed ? { seed: this.seed } : {},
			...this.template === Z ? { entities: this.entities() } : {}
		};
		try {
			let t = await this.api.create(e);
			this.message = this.tr("created", { count: t.devices });
		} catch (e) {
			this.error = P(e);
		}
		this.busy = !1;
	}
	renderEstimate() {
		let e = this.entities(), t = Ze(e.filter((e) => e.platform === "sensor").length * this.count, this.info?.tick_seconds ?? 10);
		return w`<p>
      <small>${this.tr("estimate", {
			entities: e.length * this.count,
			rate: t
		})}</small>
      ${t > fn ? w`<br /><span class="warning">${this.tr("rateWarning")}</span>` : ""}
    </p>`;
	}
	render() {
		let e = this.entities().find((e) => e.platform === "sensor" && e.signal);
		return w`
      <div class="row">
        <label style="flex: 1 1 220px"
          >${this.tr("template")}
          <select @change=${(e) => this.template = e.target.value}>
            ${this.templates.map((e) => w`<option value=${e.id} ?selected=${e.id === this.template}>${e.name}</option>`)}
            <option value=${Z} ?selected=${this.template === Z}>
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
            @input=${(e) => this.count = Number(e.target.value)}
          />
        </label>
      </div>
      <p class="row">
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
          <input
            .value=${this.areas}
            @input=${(e) => this.areas = e.target.value}
          />
          <small>${this.tr("areasHint")}</small>
        </label>
        <label style="flex: 0 0 160px"
          >${this.tr("areaMode")}
          <select
            @change=${(e) => this.mode = e.target.value}
          >
            <option value="even">${this.tr("modeEven")}</option>
            <option value="random">${this.tr("modeRandom")}</option>
          </select>
        </label>
        ${this.select(this.tr("colOutput"), this.info?.outputs ?? ["native"], this.output, (e) => this.tr(dn[e] ?? "outputNative"), (e) => this.output = e)}
        <label style="flex: 0 0 160px"
          >${this.tr("seed")}
          <input
            .value=${this.seed}
            @input=${(e) => this.seed = e.target.value}
          />
          <small>${this.tr("seedHint")}</small>
        </label>
      </p>
      ${this.template === Z ? w`<label
              >${this.tr("customEntities")}
              <textarea
                rows="8"
                .value=${this.custom}
                @input=${(e) => this.custom = e.target.value}
              ></textarea>
            </label>` : ""}
      ${this.template === Z ? this.renderEditor() : ""}
      ${e?.signal && this.template !== Z ? w`<p>
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
F([N()], Q.prototype, "info", void 0), F([N()], Q.prototype, "templates", void 0), F([N()], Q.prototype, "template", void 0), F([N()], Q.prototype, "count", void 0), F([N()], Q.prototype, "pattern", void 0), F([N()], Q.prototype, "areas", void 0), F([N()], Q.prototype, "mode", void 0), F([N()], Q.prototype, "seed", void 0), F([N()], Q.prototype, "output", void 0), F([N()], Q.prototype, "custom", void 0), F([N()], Q.prototype, "editIndex", void 0), F([N()], Q.prototype, "busy", void 0), F([N()], Q.prototype, "message", void 0), F([N()], Q.prototype, "error", void 0), Q = F([j("tdc-creation-wizard")], Q);
// src/panel.ts
var $ = class extends I {
	constructor(...e) {
		super(...e), this.narrow = !1, this.tab = "devices", this.removeTarget = "all", this.removeId = "";
	}
	static {
		this.styles = [I.styles, o`
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
    `];
	}
	startRemoval(e) {
		this.removeTarget = e.detail.target, this.removeId = e.detail.id, this.tab = "remove";
	}
	renderTab(e, t) {
		return w`<button class=${this.tab === e ? "active" : ""} @click=${() => this.tab = e}>
      ${t}
    </button>`;
	}
	render() {
		return w`
      <header>
        <h2>${this.tr("title")}</h2>
        <span class="badge">${this.tr("badge")}</span>
      </header>
      <nav>
        ${this.renderTab("devices", this.tr("tabDevices"))}
        ${this.renderTab("create", this.tr("tabCreate"))}
        ${this.renderTab("schedules", this.tr("tabSchedules"))}
        ${this.renderTab("scenarios", this.tr("tabScenarios"))}
        ${this.renderTab("groups", this.tr("tabGroups"))}
        ${this.renderTab("remove", this.tr("tabRemove"))}
      </nav>
      ${this.tab === "devices" ? w`<tdc-device-list
              .hass=${this.hass}
              @tdc-remove=${this.startRemoval}
            ></tdc-device-list>` : ""}
      ${this.tab === "create" ? w`<tdc-creation-wizard .hass=${this.hass}></tdc-creation-wizard>` : ""}
      ${this.tab === "schedules" ? w`<tdc-schedule-panel .hass=${this.hass}></tdc-schedule-panel>` : ""}
      ${this.tab === "scenarios" ? w`<tdc-scenario-panel .hass=${this.hass}></tdc-scenario-panel>` : ""}
      ${this.tab === "groups" ? w`<tdc-group-panel .hass=${this.hass}></tdc-group-panel>` : ""}
      ${this.tab === "remove" ? w`<tdc-removal-panel
              .hass=${this.hass}
              .target=${this.removeTarget}
              .targetId=${this.removeId}
            ></tdc-removal-panel>` : ""}
    `;
	}
};
F([M({ type: Boolean })], $.prototype, "narrow", void 0), F([N()], $.prototype, "tab", void 0), F([N()], $.prototype, "removeTarget", void 0), F([N()], $.prototype, "removeId", void 0), $ = F([j("hass-test-data-creator-panel")], $);
export { $ as TdcPanel };
