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
}, h = (e, t) => !l(e, t), oe = {
	attribute: !0,
	type: String,
	converter: m,
	reflect: !1,
	useDefault: !1,
	hasChanged: h
};
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
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
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? h)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[p("elementProperties")] = /* @__PURE__ */ new Map(), g[p("finalized")] = /* @__PURE__ */ new Map(), ae?.({ ReactiveElement: g }), (f.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var _ = globalThis, se = (e) => e, v = _.trustedTypes, ce = v ? v.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, le = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, ue = "?" + y, de = `<${ue}>`, b = document, x = () => b.createComment(""), S = (e) => e === null || typeof e != "object" && typeof e != "function", C = Array.isArray, fe = (e) => C(e) || typeof e?.[Symbol.iterator] == "function", w = "[ 	\n\f\r]", T = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pe = /-->/g, me = />/g, E = RegExp(`>|${w}(?:([^\\s"'>=/]+)(${w}*=${w}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), he = /'/g, ge = /"/g, _e = /^(?:script|style|textarea|title)$/i, ve = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), D = ve(1), ye = ve(2), O = Symbol.for("lit-noChange"), k = Symbol.for("lit-nothing"), be = /* @__PURE__ */ new WeakMap(), A = b.createTreeWalker(b, 129);
function xe(e, t) {
	if (!C(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ce === void 0 ? t : ce.createHTML(t);
}
var Se = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = T;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === T ? c[1] === "!--" ? o = pe : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = E) : (_e.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = E) : o = me : o === E ? c[0] === ">" ? (o = i ?? T, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? E : c[3] === "\"" ? ge : he) : o === ge || o === he ? o = E : o === pe || o === me ? o = T : (o = E, i = void 0);
		let d = o === E && e[t + 1].startsWith("/>") ? " " : "";
		a += o === T ? n + de : l >= 0 ? (r.push(s), n.slice(0, l) + le + n.slice(l) + y + d) : n + y + (l === -2 ? t : d);
	}
	return [xe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, j = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Se(t, n);
		if (this.el = e.createElement(l, r), A.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = A.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(le)) {
					let t = u[o++], n = i.getAttribute(e).split(y), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? we : r[1] === "?" ? Te : r[1] === "@" ? Ee : P
					}), i.removeAttribute(e);
				} else e.startsWith(y) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (_e.test(i.tagName)) {
					let e = i.textContent.split(y), t = e.length - 1;
					if (t > 0) {
						i.textContent = v ? v.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], x()), A.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], x());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ue) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(y, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += y.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = b.createElement("template");
		return n.innerHTML = e, n;
	}
};
function M(e, t, n = e, r) {
	if (t === O) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = S(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = M(e, i._$AS(e, t.values), i, r)), t;
}
var Ce = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? b).importNode(t, !0);
		A.currentNode = r;
		let i = A.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new N(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new De(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = A.nextNode(), a++);
		}
		return A.currentNode = b, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, N = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = k, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = M(this, e, t), S(e) ? e === k || e == null || e === "" ? (this._$AH !== k && this._$AR(), this._$AH = k) : e !== this._$AH && e !== O && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? fe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== k && S(this._$AH) ? this._$AA.nextSibling.data = e : this.T(b.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = j.createElement(xe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Ce(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = be.get(e.strings);
		return t === void 0 && be.set(e.strings, t = new j(e)), t;
	}
	k(t) {
		C(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(x()), this.O(x()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = se(e).nextSibling;
			se(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, P = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = k, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = k;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = M(this, e, t, 0), a = !S(e) || e !== this._$AH && e !== O, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = M(this, r[n + o], t, o), s === O && (s = this._$AH[o]), a ||= !S(s) || s !== this._$AH[o], s === k ? e = k : e !== k && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === k ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, we = class extends P {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === k ? void 0 : e;
	}
}, Te = class extends P {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== k);
	}
}, Ee = class extends P {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = M(this, e, t, 0) ?? k) === O) return;
		let n = this._$AH, r = e === k && n !== k || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== k && (n === k || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, De = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		M(this, e);
	}
}, Oe = _.litHtmlPolyfillSupport;
Oe?.(j, N), (_.litHtmlVersions ??= []).push("3.3.3");
var ke = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new N(t.insertBefore(x(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, F = globalThis, I = class extends g {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ke(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return O;
	}
};
I._$litElement$ = !0, I.finalized = !0, F.litElementHydrateSupport?.({ LitElement: I });
var Ae = F.litElementPolyfillSupport;
Ae?.({ LitElement: I }), (F.litElementVersions ??= []).push("4.2.2");
// node_modules/@lit/reactive-element/decorators/custom-element.js
var L = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, je = {
	attribute: !0,
	type: String,
	converter: m,
	reflect: !1,
	hasChanged: h
}, Me = (e = je, t, n) => {
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
function R(e) {
	return (t, n) => typeof n == "object" ? Me(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function z(e) {
	return R({
		...e,
		state: !0,
		attribute: !1
	});
}
// src/common/api.ts
var Ne = "hass_test_data_creator", Pe = class {
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
	call(e, t = {}) {
		let n = Object.fromEntries(Object.entries(t).filter(([, e]) => e !== void 0));
		return this.hass.callWS({
			type: `${Ne}/${e}`,
			...n
		});
	}
};
function B(e) {
	if (typeof e == "object" && e && "message" in e) {
		let { code: t, message: n } = e;
		return t ? `${t}: ${n}` : n;
	}
	return String(e);
}
// src/common/i18n.ts
var Fe = {
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
function Ie(e) {
	return e?.toLowerCase().startsWith("de") ? "de" : "en";
}
function Le(e, t, n = {}) {
	return Fe[e][t].replace(/\{(\w+)\}/g, (e, t) => t in n ? String(n[t]) : e);
}
// \0@oxc-project+runtime@0.155.0/helpers/esm/decorate.js
function V(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/common/base.ts
var Re = o`
  border-radius: 6px;
  border: 1px solid var(--divider-color);
  background: var(--card-background-color);
  color: var(--primary-text-color);
`, H = class extends I {
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
      ${Re}
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
      ${Re}
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
			api: new Pe(this.hass)
		}), this.client.api;
	}
	textField(e, t, n, r = {}) {
		return D`<label style="flex: ${r.flex ?? "1 1 200px"}"
      >${e}
      <input
        .value=${t}
        placeholder=${r.placeholder ?? ""}
        @input=${(e) => n(e.target.value)}
      />
    </label>`;
	}
	tr(e, t) {
		return Le(Ie(this.hass?.language), e, t);
	}
};
V([R({ attribute: !1 })], H.prototype, "hass", void 0);
// src/devices/device-list.ts
var ze = 200, Be = 1e4, Ve = {
	switch: "toggle",
	event: "press",
	binary_sensor: "pulse"
}, U = class extends H {
	constructor(...e) {
		super(...e), this.devices = [], this.total = 0, this.loaded = !1, this.error = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), Be);
	}
	disconnectedCallback() {
		window.clearInterval(this.timer), super.disconnectedCallback();
	}
	async refresh(e = !1) {
		let t = Math.max(ze, this.devices.length + (e ? ze : 0));
		try {
			let e = await this.api.devices(0, t);
			this.devices = e.devices, this.total = e.total, this.error = "";
		} catch (e) {
			this.error = B(e);
		}
		this.loaded = !0;
	}
	async fire(e, t) {
		try {
			await this.api.fire(e.id, t.key, Ve[t.platform]), await this.refresh();
		} catch (e) {
			this.error = B(e);
		}
	}
	values(e) {
		return e.entities.filter((e) => e.platform === "sensor" || e.platform === "switch" || e.platform === "binary_sensor").slice(0, 4).map((e) => `${e.name}: ${e.state ?? "–"}${e.unit ? ` ${e.unit}` : ""}${e.fault ? ` ⚠ ${e.fault}` : ""}`).join(" · ");
	}
	renderRow(e) {
		let t = e.entities.filter((e) => e.platform in Ve);
		return D`<tr>
      <td>${e.name}</td>
      <td>${e.model}</td>
      <td>${e.area ?? "–"}</td>
      <td>${e.output}</td>
      <td><small>${this.values(e)}</small></td>
      <td class="row">
        ${t.map((t) => D`<button @click=${() => void this.fire(e, t)}>${t.name}</button>`)}
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
		return this.loaded ? D`
      ${this.error ? D`<p class="error">${this.error}</p>` : ""}
      ${this.devices.length === 0 ? D`<p>${this.tr("noDevices")}</p>` : D`<table>
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
                ${this.devices.length < this.total ? D`<button @click=${() => void this.refresh(!0)}>
                        ${this.tr("loadMore")}
                      </button>` : ""}
              </p>`}
    ` : D`${this.tr("loading")}`;
	}
};
V([z()], U.prototype, "devices", void 0), V([z()], U.prototype, "total", void 0), V([z()], U.prototype, "loaded", void 0), V([z()], U.prototype, "error", void 0), U = V([L("tdc-device-list")], U);
// src/removal/removal-panel.ts
var W = class extends H {
	constructor(...e) {
		super(...e), this.target = "all", this.targetId = "", this.busy = !1, this.message = "", this.error = "";
	}
	async showPlan() {
		this.message = "", this.error = "";
		try {
			this.plan = await this.api.removalPlan(this.target, this.targetId || void 0);
		} catch (e) {
			this.plan = void 0, this.error = B(e);
		}
	}
	async confirm() {
		this.busy = !0;
		try {
			let e = await this.api.removalRun(this.target, this.targetId || void 0);
			this.message = this.tr("removed", { count: e.devices + e.orphans }), this.plan = void 0;
		} catch (e) {
			this.error = B(e);
		}
		this.busy = !1;
	}
	renderPlan(e) {
		return e.devices.length + e.orphans.length === 0 && e.runs.length === 0 ? D`<p>${this.tr("planNothing")}</p>` : D`<ul>
        <li>${this.tr("planDevices", { count: e.devices.length })}</li>
        ${e.schedules.length ? D`<li>${this.tr("planSchedules", { count: e.schedules.length })}</li>` : ""}
        ${e.orphans.length ? D`<li>${this.tr("planOrphans", { count: e.orphans.length })}</li>` : ""}
        ${e.areas.length ? D`<li>${this.tr("planAreas", { names: e.areas.join(", ") })}</li>` : ""}
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
		return D`
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
V([R()], W.prototype, "target", void 0), V([R()], W.prototype, "targetId", void 0), V([z()], W.prototype, "plan", void 0), V([z()], W.prototype, "busy", void 0), V([z()], W.prototype, "message", void 0), V([z()], W.prototype, "error", void 0), W = V([L("tdc-removal-panel")], W);
// src/schedule/helpers.ts
function He() {
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
function Ue(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function We(e) {
	switch (e.type) {
		case "times": return e.weekdays.length ? {
			type: "times",
			times: Ue(e.times),
			weekdays: [...e.weekdays].sort()
		} : {
			type: "times",
			times: Ue(e.times)
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
function Ge(e, t) {
	switch (e) {
		case "all": return { all: !0 };
		case "template": return { template: t };
		case "device": return { device: t };
		case "run": return { run: t };
	}
}
function Ke(e) {
	return "all" in e ? {
		kind: "all",
		id: ""
	} : "template" in e ? {
		kind: "template",
		id: e.template
	} : "device" in e ? {
		kind: "device",
		id: e.device
	} : {
		kind: "run",
		id: e.run
	};
}
function qe(e) {
	switch (e.type) {
		case "times": return e.times.join(", ");
		case "interval": return `${e.every_s} s (${e.start}–${e.end})`;
		case "once": return e.at.replace("T", " ");
		case "random_window": return `${e.count}× ${e.start}–${e.end}`;
		case "poisson": return `Ø ${e.per_day}/d`;
	}
}
function Je(e) {
	return e.slice(0, 16).replace("T", " ");
}
// src/schedule/schedule-panel.ts
var Ye = 1e4, Xe = 24, G = 50, Ze = [
	"times",
	"interval",
	"once",
	"random_window",
	"poisson"
], Qe = [
	"all",
	"template",
	"device",
	"run"
], $e = [
	"weekdayMon",
	"weekdayTue",
	"weekdayWed",
	"weekdayThu",
	"weekdayFri",
	"weekdaySat",
	"weekdaySun"
], K = class extends H {
	constructor(...e) {
		super(...e), this.schedules = [], this.runs = [], this.templates = [], this.error = "", this.busy = !1, this.name = "", this.kind = "all", this.targetId = "", this.entity = "", this.actionKey = "", this.seed = "", this.form = He();
	}
	connectedCallback() {
		super.connectedCallback(), this.loadOptions(), this.refresh(), this.timer = window.setInterval(() => void this.refresh(), Ye);
	}
	disconnectedCallback() {
		window.clearInterval(this.timer), super.disconnectedCallback();
	}
	async loadOptions() {
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.actionKey ||= this.actionKeys()[0] ?? "";
		} catch (e) {
			this.error = B(e);
		}
	}
	async refresh() {
		try {
			[this.schedules, this.runs] = await Promise.all([this.api.schedules(), this.api.schedulePreview(Xe)]), this.error = "";
		} catch (e) {
			this.error = B(e);
		}
	}
	actionKeys() {
		return Object.entries(this.info?.actions ?? {}).flatMap(([e, t]) => t.map((t) => `${e}/${t}`));
	}
	entityKeys() {
		let e = this.actionKey.split("/")[0], t = this.templates.flatMap((t) => t.entities.filter((t) => t.platform === e).map((e) => e.key));
		return [...new Set(t)];
	}
	async run(e) {
		this.busy = !0;
		try {
			await e(), await this.refresh();
		} catch (e) {
			this.error = B(e);
		}
		this.busy = !1;
	}
	async add() {
		let [, e] = this.actionKey.split("/"), t = this.entity || this.entityKeys()[0] || "";
		await this.run(async () => {
			await this.api.addSchedule({
				name: this.name,
				target: Ge(this.kind, this.targetId),
				entity: t,
				action: e,
				trigger: We(this.form),
				seed: this.seed || void 0
			}), this.name = "";
		});
	}
	setForm(e) {
		this.form = {
			...this.form,
			...e
		};
	}
	field(e, t, n = "text") {
		let r = n === "number";
		return D`<label style="flex: 1 1 140px"
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
			case "times": return D`${this.field(this.tr("schTimes"), "times")}
          <div class="row">
            ${$e.map((e, t) => D`<label style="flex-direction: row; align-items: center">
                  <input
                    type="checkbox"
                    style="width: auto"
                    .checked=${this.form.weekdays.includes(t)}
                    @change=${(e) => this.setForm({ weekdays: e.target.checked ? [...this.form.weekdays, t] : this.form.weekdays.filter((e) => e !== t) })}
                  />${this.tr(e)}
                </label>`)}
          </div>`;
			case "interval": return D`${this.field(this.tr("schEveryS"), "everyS", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case "once": return this.field(this.tr("schAt"), "at", "datetime-local");
			case "random_window": return D`${this.field(this.tr("schCount"), "count", "number")}
        ${this.field(this.tr("schFrom"), "start")} ${this.field(this.tr("schTo"), "end")}`;
			case "poisson": return this.field(this.tr("schPerDay"), "perDay", "number");
		}
	}
	select(e, t, n, r, i) {
		return D`<label style="flex: 1 1 180px"
      >${e}
      <select @change=${(e) => i(e.target.value)}>
        ${t.map((e) => D`<option value=${e} ?selected=${e === n}>${r(e)}</option>`)}
      </select>
    </label>`;
	}
	renderForm() {
		let e = this.entityKeys();
		return D`
      <h3>${this.tr("schNew")}</h3>
      <div class="row">
        ${this.textField(this.tr("schName"), this.name, (e) => this.name = e)}
        ${this.select(this.tr("schTarget"), Qe, this.kind, (e) => this.tr(`schTarget_${e}`), (e) => this.kind = e)}
        ${this.kind === "all" ? k : this.textField(this.tr("targetId"), this.targetId, (e) => this.targetId = e)}
      </div>
      <div class="row">
        ${this.select(this.tr("schAction"), this.actionKeys(), this.actionKey, (e) => e, (e) => {
			this.actionKey = e, this.entity = "";
		})}
        ${this.select(this.tr("schEntity"), e, this.entity || e[0] || "", (e) => e, (e) => this.entity = e)}
        ${this.select(this.tr("schTrigger"), Ze, this.form.type, (e) => this.tr(`schTrigger_${e}`), (e) => this.setForm({ type: e }))}
      </div>
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
          ?disabled=${this.busy || !this.name.trim() || !this.actionKey}
          @click=${() => void this.add()}
        >
          ${this.tr("schAdd")}
        </button>
      </p>
    `;
	}
	renderRow(e) {
		let { kind: t, id: n } = Ke(e.target);
		return D`<tr>
      <td>${e.name}</td>
      <td>${this.tr(`schTarget_${t}`)}${n ? ` ${n}` : ""}</td>
      <td>${e.entity}: ${e.action}</td>
      <td>
        ${this.tr(`schTrigger_${e.trigger.type}`)}<br /><small
          >${qe(e.trigger)}</small
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
		return this.runs.length === 0 ? D`<p><small>${this.tr("schNoRuns")}</small></p>` : D`<table>
        <tr>
          <th>${this.tr("schWhen")}</th>
          <th>${this.tr("schName")}</th>
        </tr>
        ${this.runs.slice(0, G).map((e) => D`<tr>
              <td>${Je(e.when)}</td>
              <td>${e.name}</td>
            </tr>`)}
      </table>
      ${this.runs.length > G ? D`<p>
              <small>${this.tr("schMoreRuns", { count: this.runs.length - G })}</small>
            </p>` : k}`;
	}
	render() {
		return D`
      ${this.schedules.length === 0 ? D`<p>${this.tr("schNone")}</p>` : D`<table>
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
      <h3>${this.tr("schPreview", { hours: Xe })}</h3>
      ${this.renderPreview()}
      <p class="error">${this.error}</p>
    `;
	}
};
V([z()], K.prototype, "schedules", void 0), V([z()], K.prototype, "runs", void 0), V([z()], K.prototype, "info", void 0), V([z()], K.prototype, "templates", void 0), V([z()], K.prototype, "error", void 0), V([z()], K.prototype, "busy", void 0), V([z()], K.prototype, "name", void 0), V([z()], K.prototype, "kind", void 0), V([z()], K.prototype, "targetId", void 0), V([z()], K.prototype, "entity", void 0), V([z()], K.prototype, "actionKey", void 0), V([z()], K.prototype, "seed", void 0), V([z()], K.prototype, "form", void 0), K = V([L("tdc-schedule-panel")], K);
// src/signals/signals.ts
var q = (1n << 64n) - 1n, et = 11400714819323198485n, tt = 13787848793156543929n, nt = 10723151780598845931n, rt = 3600;
function it(e, t = 0, n = 0) {
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
		origin: n
	};
}
function J(e, t) {
	let n = BigInt(e) * et + (BigInt(t) & q) * tt + nt & q;
	return n = (n ^ n >> 30n) * tt & q, n = (n ^ n >> 27n) * nt & q, n ^= n >> 31n, Number(n >> 11n) / 2 ** 53;
}
function Y(e, t) {
	let n = t / e.period_s + e.phase;
	return n - Math.floor(n);
}
var at = {
	constant: () => .5,
	sine: (e, t) => .5 + .5 * Math.sin(2 * Math.PI * Y(e, t)),
	saw: (e, t) => Y(e, t),
	square: (e, t) => +(Y(e, t) < .5),
	triangle: (e, t) => 1 - Math.abs(2 * Y(e, t) - 1),
	noise: (e, t) => J(e.seed, Math.floor(t / e.interval_s)),
	random_walk: (e, t) => {
		let n = t / e.period_s + e.phase, r = Math.floor(n), i = n - r, a = i * i * (3 - 2 * i), o = J(e.seed, r);
		return o + (J(e.seed, r + 1) - o) * a;
	}
};
function ot(e, t) {
	return Number(e.toFixed(t));
}
function st(e, t) {
	if (e.shape === "counter") {
		let n = Math.max(0, t - e.origin);
		return ot(e.min + e.rate_per_hour * n / rt, e.decimals);
	}
	let n = (at[e.shape] ?? at.constant)(e, t);
	return e.noise && (n += (J(e.seed + 1, Math.floor(t)) - .5) * 2 * e.noise), n = Math.min(1, Math.max(0, n)), ot(e.min + n * (e.max - e.min), e.decimals);
}
// src/signals/signal-preview.ts
var ct = 320, lt = 80, ut = 96, dt = 86400, X = class extends I {
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
		let t = it(e, 1, 0), n = Array.from({ length: 97 }, (e, n) => st(t, n / ut * dt)), r = Math.min(...n), i = Math.max(...n) - r || 1;
		return n.map((e, t) => {
			let n = t / ut * ct, a = 74 - (e - r) / i * 68;
			return `${n.toFixed(1)},${a.toFixed(1)}`;
		}).join(" ");
	}
	render() {
		if (!this.signal) return D``;
		let e = this.signal.min ?? 0, t = this.signal.max ?? 100;
		return D`<svg viewBox="0 0 ${ct} ${lt}" role="img">
        ${ye`<polyline points=${this.points(this.signal)}></polyline>`}
      </svg>
      <div>${e} – ${t} ${this.unit}</div>`;
	}
};
V([R({ attribute: !1 })], X.prototype, "signal", void 0), V([R()], X.prototype, "unit", void 0), X = V([L("tdc-signal-preview")], X);
// src/wizard/helpers.ts
function ft(e) {
	return e.split(",").map((e) => e.trim()).filter((e) => e.length > 0);
}
function pt(e, t) {
	return Math.round(e / Math.max(1, t) * 10) / 10;
}
// src/wizard/creation-wizard.ts
var Z = "custom", mt = 50, ht = JSON.stringify([{
	key: "level",
	platform: "sensor",
	name: "Level",
	unit: "%",
	signal: {
		shape: "sine",
		min: 0,
		max: 100
	}
}], null, 2), Q = class extends H {
	constructor(...e) {
		super(...e), this.templates = [], this.template = "", this.count = 10, this.pattern = "{template} {nn}", this.areas = "", this.mode = "even", this.seed = "", this.custom = ht, this.busy = !1, this.message = "", this.error = "";
	}
	async connectedCallback() {
		super.connectedCallback();
		try {
			[this.info, this.templates] = await Promise.all([this.api.info(), this.api.templates()]), this.template = this.templates[0]?.id ?? Z;
		} catch (e) {
			this.error = B(e);
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
	async submit() {
		this.busy = !0, this.message = "", this.error = "";
		let e = {
			template: this.template,
			count: this.count,
			name_pattern: this.pattern,
			areas: ft(this.areas),
			area_mode: this.mode,
			...this.seed ? { seed: this.seed } : {},
			...this.template === Z ? { entities: this.entities() } : {}
		};
		try {
			let t = await this.api.create(e);
			this.message = this.tr("created", { count: t.devices });
		} catch (e) {
			this.error = B(e);
		}
		this.busy = !1;
	}
	renderEstimate() {
		let e = this.entities(), t = pt(e.filter((e) => e.platform === "sensor").length * this.count, this.info?.tick_seconds ?? 10);
		return D`<p>
      <small>${this.tr("estimate", {
			entities: e.length * this.count,
			rate: t
		})}</small>
      ${t > mt ? D`<br /><span class="warning">${this.tr("rateWarning")}</span>` : ""}
    </p>`;
	}
	render() {
		let e = this.entities().find((e) => e.platform === "sensor" && e.signal);
		return D`
      <div class="row">
        <label style="flex: 1 1 220px"
          >${this.tr("template")}
          <select @change=${(e) => this.template = e.target.value}>
            ${this.templates.map((e) => D`<option value=${e.id} ?selected=${e.id === this.template}>${e.name}</option>`)}
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
        <label style="flex: 0 0 160px"
          >${this.tr("seed")}
          <input
            .value=${this.seed}
            @input=${(e) => this.seed = e.target.value}
          />
          <small>${this.tr("seedHint")}</small>
        </label>
      </p>
      ${this.template === Z ? D`<label
              >${this.tr("customEntities")}
              <textarea
                rows="8"
                .value=${this.custom}
                @input=${(e) => this.custom = e.target.value}
              ></textarea>
            </label>` : ""}
      ${e?.signal ? D`<p>
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
V([z()], Q.prototype, "info", void 0), V([z()], Q.prototype, "templates", void 0), V([z()], Q.prototype, "template", void 0), V([z()], Q.prototype, "count", void 0), V([z()], Q.prototype, "pattern", void 0), V([z()], Q.prototype, "areas", void 0), V([z()], Q.prototype, "mode", void 0), V([z()], Q.prototype, "seed", void 0), V([z()], Q.prototype, "custom", void 0), V([z()], Q.prototype, "busy", void 0), V([z()], Q.prototype, "message", void 0), V([z()], Q.prototype, "error", void 0), Q = V([L("tdc-creation-wizard")], Q);
// src/panel.ts
var $ = class extends H {
	constructor(...e) {
		super(...e), this.narrow = !1, this.tab = "devices", this.removeTarget = "all", this.removeId = "";
	}
	static {
		this.styles = [H.styles, o`
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
		return D`<button class=${this.tab === e ? "active" : ""} @click=${() => this.tab = e}>
      ${t}
    </button>`;
	}
	render() {
		return D`
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
      ${this.tab === "devices" ? D`<tdc-device-list
              .hass=${this.hass}
              @tdc-remove=${this.startRemoval}
            ></tdc-device-list>` : ""}
      ${this.tab === "create" ? D`<tdc-creation-wizard .hass=${this.hass}></tdc-creation-wizard>` : ""}
      ${this.tab === "schedules" ? D`<tdc-schedule-panel .hass=${this.hass}></tdc-schedule-panel>` : ""}
      ${this.tab === "remove" ? D`<tdc-removal-panel
              .hass=${this.hass}
              .target=${this.removeTarget}
              .targetId=${this.removeId}
            ></tdc-removal-panel>` : ""}
    `;
	}
};
V([R({ type: Boolean })], $.prototype, "narrow", void 0), V([z()], $.prototype, "tab", void 0), V([z()], $.prototype, "removeTarget", void 0), V([z()], $.prototype, "removeId", void 0), $ = V([L("hass-test-data-creator-panel")], $);
export { $ as TdcPanel };
