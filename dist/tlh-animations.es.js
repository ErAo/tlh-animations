var P = Object.defineProperty, O = Object.defineProperties;
var k = Object.getOwnPropertyDescriptors;
var y = Object.getOwnPropertySymbols;
var U = Object.prototype.hasOwnProperty, M = Object.prototype.propertyIsEnumerable;
var _ = (l, t, e) => t in l ? P(l, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[t] = e, g = (l, t) => {
  for (var e in t || (t = {}))
    U.call(t, e) && _(l, e, t[e]);
  if (y)
    for (var e of y(t))
      M.call(t, e) && _(l, e, t[e]);
  return l;
}, E = (l, t) => O(l, k(t));
var T = (l, t, e) => _(l, typeof t != "symbol" ? t + "" : t, e);
class D {
  constructor(t, e = {}) {
    this.elements = {
      // to store DOM elements
      container: t
    }, this.customAnimations = e.customAnimations || {}, this.scrollCords = {
      // to define where the animation starts and ends in relation to the container and viewport
      startAt: 0,
      endAt: 0
    }, this._cachedVWValue = window.innerWidth, this.progress = 0, this.previousProgress = 0, this.progressEnded = !1, this.interfaceReady = !1, this.hasStarted = !1, this._lastScrollTime = 0, this.timeline = {}, this.options = g(g({
      start: 0,
      // 0 means when the top of the container hits the bottom of the viewport
      end: 0,
      // 0 means when the bottom of the container hits the bottom of the viewport
      markers: !1,
      // show markers at start and end positions
      pin: !1,
      // pin the container during the animation
      detectionMode: {
        start: "top",
        // top, center, bottom
        end: "bottom"
        // top, center, bottom
      },
      scrollDistance: 0,
      // this value will be calculated automatically if set to 0
      fullscreen: !0
    }, this.getDataOptions()), e.options), this._eventDetailPool = {
      container: t,
      progress: 0,
      containerRect: null,
      scrollTop: 0,
      progressReverse: 0
    };
  }
}
class L {
  constructor() {
    T(this, "easing", {
      linear: (t) => t,
      easeIn: (t) => t * t,
      easeOut: (t) => t * (2 - t),
      easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      bounce: (t) => t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375 : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    });
    // Selector helper
    T(this, "selector", (t) => typeof t == "string" ? document.querySelectorAll(t) : [t]);
  }
  getElementPosition(t) {
    typeof t == "string" && (t = document.querySelector(t));
    const e = t.getBoundingClientRect(), n = window.pageYOffset || document.documentElement.scrollTop, s = window.pageXOffset || document.documentElement.scrollLeft;
    return { top: e.top + n, left: e.left + s };
  }
  scrollTo(t, e = 500, n = "linear") {
    const s = window.scrollY || window.pageYOffset, r = typeof t == "number" ? t : this.getElementPosition(t).top, c = r - s;
    let o = null;
    if (e <= 0) {
      window.scrollTo(0, r);
      return;
    }
    const i = (a) => {
      o === null && (o = a);
      const d = a - o, h = Math.min(d / e, 1), m = this.easing[n](h) * c + s;
      window.scrollTo(0, m), h < 1 && requestAnimationFrame(i);
    };
    requestAnimationFrame(i);
  }
}
class H {
  constructor(t, e) {
    if (this.name = t, this.props = e, this.container = e.container || null, this.start = e.start ? e.start : 0, this.end = e.end ? e.end : 100, this.duration = e.duration ? e.duration : 1, this.normalizedProgress = 0, this.hasStarted = !1, this.progressEnded = !1, this.progress = 0, !this.container) {
      console.error("Container is required for animation:", t);
      return;
    }
    return this.container.addEventListener(this.props.events.onUpdate, (n) => {
      this.updateTimeline(n.detail.progress);
    }), this;
  }
  onUpdate() {
    this.progress === 0 && (this.hasStarted = !1), this.progressEnded = this.progress === 1 ? 1 : this.progress === 0 ? 0 : !1, this.props.onUpdate && this.props.onUpdate.bind(this)();
  }
  onStart() {
    this.hasStarted = !0, this.props.onStart && this.props.onStart.bind(this)();
  }
  onComplete() {
    this.props.onComplete && this.props.onComplete.bind(this)();
  }
  updateTimeline(t) {
    const { start: e, end: n, duration: s } = this;
    this._cachedUnits || (this._cachedUnits = {
      startUnit: e * 0.01,
      endUnit: n * 0.01
    });
    const { startUnit: r, endUnit: c } = this._cachedUnits, o = this.props.normalizedProgress(r, c, t);
    let i;
    s !== 1 ? i = Math.pow(o, s) : i = o, i = Math.max(0, Math.min(1, i)), this.progress = o, this.normalizedProgress = i, this.progress > 0 && !this.hasStarted && this.onStart(), this.onUpdate(), t === 1 && this.onComplete();
  }
}
class x {
  constructor(t) {
    this.parent = t, this.elements = t.elements, this.customEvents = t.customEvents, this.normalizedProgress = t.normalizedProgress;
  }
  add(t, e) {
    if (!t) {
      console.error("Animation name is required");
      return;
    }
    if (!e) {
      console.error("Animation props are required");
      return;
    }
    return new H(t, E(g({}, e), {
      normalizedProgress: this.normalizedProgress,
      container: this.elements.container,
      events: this.customEvents
    }));
  }
}
const f = {
  onUpdate: "tlh-animate-update",
  onStart: "tlh-animate-start",
  onComplete: "tlh-animate-complete",
  globalScroll: "tlh-global-scroll",
  globalResize: "tlh-global-resize"
}, b = {
  marker: "tlh-scroll-marker",
  markerStart: "tlh-scroll-marker-start",
  markerEnd: "tlh-scroll-marker-end",
  pinSpacer: "tlh-pin-section",
  pinInner: "tlh-pin-inner"
};
class V extends D {
  constructor(t, e = {}) {
    super(t, e), this.props = e, this.customEvents = {
      onUpdate: f.onUpdate,
      onStart: f.onStart,
      onComplete: f.onComplete
    }, this.timeline = new x(this), this.init();
  }
  getDataOptions() {
    return this.elements.container.dataset;
  }
  init() {
    this.setElements("container", this.elements.container), this.props.onMounted && this.props.onMounted.call(this), this.setScrollCords(), this.createInterface(), this.setEvents();
  }
  setScrollCords() {
    const { end: t, start: e } = this.options, n = window.innerHeight, s = n * (e * 0.01), r = n * (t * 0.01);
    this.scrollCords.startAt = s, this.scrollCords.endAt = r;
  }
  addToTimeline(t) {
    if (!t.name) {
      console.warn("You must provide a name for the timeline animation.");
      return;
    }
    if (this.timeline[t.name]) {
      console.warn(`Timeline animation with name "${t.name}" already exists.`);
      return;
    }
    this.timeline.add(t.name, t), this._cachedAnimationKeys = null;
  }
  setElements(t, e) {
    this.elements[t] = e;
  }
  addMarkers() {
    if (!this.options.markers) return;
    const { top: t, bottom: e } = this.getElementCords(), { endAt: n, startAt: s } = this.scrollCords, { startMarker: r, endMarker: c } = this.elements, o = r != null ? r : document.createElement("div"), i = c != null ? c : document.createElement("div");
    o.classList.add(b.marker, b.markerStart), i.classList.add(b.marker, b.markerEnd);
    const { end: a, start: d } = this.options.detectionMode, h = (m, p) => `
        position: absolute;
        left: 0;
        right: 0;
        top: ${m}px;
        width: 100%;
        height: 2px;
        z-index: 9999;
        background: ${p};
      `;
    o.style.cssText = h(t - s, "green"), i.style.cssText = h(e + n, "red"), o.textContent = `Start - once this touch the ${d} of the viewport`, i.textContent = `End - once this touch the ${a} of the viewport`, !r && !c && (document.body.append(o), document.body.append(i), this.setElements("startMarker", o), this.setElements("endMarker", i));
  }
  createPinInterface() {
    const t = document.createElement("div");
    t.classList.add(b.pinSpacer), t.style.cssText = `
        position: sticky;
        top: 0;
        height: 100vh;
        width: 100%;
        pointer-events: none;
      `, Array.from(this.elements.container.childNodes).forEach((n) => {
      t.appendChild(n);
    }), this.elements.container.appendChild(t);
  }
  createInterface() {
    const { container: t } = this.elements, { scrollDistance: e, fullscreen: n } = this.options, { endAt: s } = this.scrollCords, r = e * 0.01, c = window.innerHeight;
    !e && e != 0 && console.warn("scrollDistance must be defined on element or animation options");
    const o = c * r;
    if (this.options.scrollTop = o + s, e > 0 && n) {
      const i = c + o;
      t.style.height = `${i}px`;
    }
    this.interfaceReady = !0, this.addMarkers(), this.options.pin && this.createPinInterface();
  }
  resize(t = !1) {
    this.resizeTimeout && clearTimeout(this.resizeTimeout);
    const e = window.innerWidth;
    (e !== this._cachedVWValue || t) && (this._cachedViewportValues = null, this._cachedAnimationKeys = null, this.resizeTimeout = setTimeout(() => {
      this._cachedVWValue = e, this.rebuild.bind(this)();
    }, 200));
  }
  scrollControl(t) {
    this.onScroll(t);
  }
  resizeControl(t) {
    this.resize();
  }
  setEvents() {
    const { onUpdate: t, onStart: e, onComplete: n } = this.customEvents;
    this._boundScrollControl = this.scrollControl.bind(this), this._boundResizeControl = this.resizeControl.bind(this), this._boundOnUpdate = this.onUpdate.bind(this), this._boundOnStart = this.onStart.bind(this), this._boundOnComplete = this.onComplete.bind(this), window.addEventListener(f.globalScroll, this._boundScrollControl), window.addEventListener(f.globalResize, this._boundResizeControl), this.elements.container.addEventListener(t, this._boundOnUpdate), this.elements.container.addEventListener(e, this._boundOnStart), this.elements.container.addEventListener(n, this._boundOnComplete);
  }
  getTopDetectionRange() {
    const { detectionMode: t } = this.options, { start: e } = t, n = window.innerHeight;
    return e === "top" ? 0 : e === "center" ? n / 2 : e === "bottom" ? n : 0;
  }
  getBottomDetectionRange() {
    const { detectionMode: t } = this.options, { end: e } = t, n = window.innerHeight;
    return e === "top" ? n * -1 : e === "center" ? n / 2 * -1 : 0;
  }
  getElementCords() {
    const t = window.scrollY || window.pageYOffset, { container: e } = this.elements, { startAt: n, endAt: s } = this.scrollCords, { scrollDistance: r, fullscreen: c } = this.options;
    this._cachedViewportValues || (this._cachedViewportValues = {
      vh: window.innerHeight,
      scaleDistance: c ? 0 : r * 0.01,
      topDetectionRange: this.getTopDetectionRange(),
      bottomDetectionRange: this.getBottomDetectionRange()
    });
    const { vh: o, scaleDistance: i, topDetectionRange: a, bottomDetectionRange: d } = this._cachedViewportValues, h = e.getBoundingClientRect();
    let m = h.top + t, p = h.bottom + t;
    p += o * i;
    let u = t + a, v = t + o + d, C = m - n - u, S = p + s - v;
    return {
      top: m,
      height: h.height,
      totalSpace: p - m,
      bottom: p,
      toStart: C,
      toEnd: S
    };
  }
  onScroll(t) {
    if (!this.interfaceReady) return;
    const { toStart: e, toEnd: n } = this.getElementCords();
    let s = 0;
    if (e <= 0 && n >= 0) {
      const u = Math.abs(e) + Math.abs(n), v = Math.abs(e);
      s = u > 0 ? v / u : 0;
    } else e > 0 ? s = 0 : n < 0 && (s = 1);
    if (s = Math.max(0, Math.min(1, s)), Math.abs(this.progress - s) < 1e-3 && this.previousProgress !== void 0)
      return;
    const { container: c } = this.elements, { scrollTop: o } = this.options, i = 1 - s;
    this.previousProgress = this.progress, this.progress = s, this.progressReverse = i;
    const a = this._eventDetailPool;
    a.progress = s, a.scrollTop = o, a.progressReverse = i, a.containerRect = null;
    const d = () => (a.containerRect || (a.containerRect = c.getBoundingClientRect()), a.containerRect), { onUpdate: h, onStart: m, onComplete: p } = this.customEvents;
    s > 0 && !this.hasStarted && (this.hasStarted = !0, d(), this.elements.container.dispatchEvent(new CustomEvent(m, {
      detail: E(g({}, a), { containerRect: a.containerRect })
    }))), !((e >= 0 && n >= 0 || e < 0 && n < 0) && this.progressEnded !== !1) && (this.elements.container.dispatchEvent(new CustomEvent(h, {
      detail: E(g({}, a), { containerRect: d(), scrollEvent: t })
    })), s === 1 && this.previousProgress < 1 && (d(), this.elements.container.dispatchEvent(new CustomEvent(p, {
      detail: E(g({}, a), { containerRect: a.containerRect })
    }))));
  }
  onUpdate(t) {
    const { progress: e } = t.detail;
    this.progressEnded = e === 1 ? 1 : e === 0 ? 0 : !1, e === 0 && (this.hasStarted = !1), this._cachedAnimationKeys || (this._cachedAnimationKeys = {
      custom: Object.keys(this.customAnimations),
      timeline: Object.keys(this.timeline)
    });
    const { custom: n } = this._cachedAnimationKeys;
    n.forEach((s) => {
      this.customAnimations[s].call(this);
    }), this.props.onUpdate && this.props.onUpdate.call(this, t);
  }
  onStart(t) {
    this.props.onStart && this.props.onStart.call(this, t);
  }
  onComplete(t) {
    this.props.onComplete && this.props.onComplete.call(this, t);
  }
  normalizedProgress(t, e, n = this.progress) {
    return Math.max(0, Math.min(1, (n - t) / (e - t)));
  }
  getPercentElement(t, e = {}) {
    if (!t)
      return console.warn("Element is not defined"), 0;
    const {
      mode: n = "start",
      // 'start', 'center', 'end', 'visible'
      offset: s = 0,
      // Offset adicional en píxeles
      threshold: r = 0.5,
      // Para modo 'visible' (0-1)
      cache: c = !0
      // Usar cache para optimizar
    } = e, o = `${t.className || "element"}-${n}-${s}-${r}`;
    if (c && this._elementPercentCache && this._elementPercentCache[o])
      return this._elementPercentCache[o];
    try {
      const { container: i } = this.elements, { scrollDistance: a, fullscreen: d } = this.options, h = i.getBoundingClientRect(), m = i.scrollTop || 0, p = h.top + window.scrollY - m, u = t.getBoundingClientRect(), v = t.scrollTop || 0, C = u.top + window.scrollY - v, S = window.innerHeight, z = d ? 0 : a * 0.01, A = h.height + S * z;
      let w = C - p + s;
      switch (n) {
        case "start":
          w += 0;
          break;
        case "center":
          w += u.height / 2;
          break;
        case "end":
          w += u.height;
          break;
        case "visible":
          w += u.height * r;
          break;
        default:
          w += 0;
      }
      const R = Math.max(0, Math.min(1, w / A)) * 100;
      return c && (this._elementPercentCache || (this._elementPercentCache = {}), this._elementPercentCache[o] = R), R;
    } catch (i) {
      return console.warn("Error calculating element percentage:", i), 0;
    }
  }
  setProgress(t, e) {
    this.progress = t;
    const { onUpdate: n } = this.customEvents;
    this.elements.container.dispatchEvent(new CustomEvent(n, {
      detail: {
        container: this.container,
        progress: t
      }
    })), setTimeout(e, 200);
  }
  destroy() {
    this._boundScrollControl && window.removeEventListener(f.globalScroll, this._boundScrollControl), this._boundResizeControl && window.removeEventListener(f.globalResize, this._boundResizeControl);
    const { onUpdate: t, onStart: e, onComplete: n } = this.customEvents;
    this._boundOnUpdate && this.elements.container.removeEventListener(t, this._boundOnUpdate), this._boundOnStart && this.elements.container.removeEventListener(e, this._boundOnStart), this._boundOnComplete && this.elements.container.removeEventListener(n, this._boundOnComplete), this._boundScrollControl = null, this._boundResizeControl = null, this._boundOnUpdate = null, this._boundOnStart = null, this._boundOnComplete = null, this.progress = 0, this.previousProgress = 0, this.progressEnded = !1, this._cachedViewportValues = null, this._cachedAnimationKeys = null, this.interfaceReady = !1;
  }
  rebuild() {
    this.destroy(), this.init();
  }
}
class $ {
  constructor() {
    this.instances = {}, this.helpers = new L(), this.setEvents();
  }
  _createOptimizedScrollHandler() {
    let t = !1, e = 0;
    return (n) => {
      const s = performance.now();
      s - e < 16.67 || t || (e = s, requestAnimationFrame(() => {
        const r = new CustomEvent(f.globalScroll, { detail: { originalEvent: n } });
        window.dispatchEvent(r), t = !1;
      }), t = !0);
    };
  }
  _createOptimizedResizeHandler(t) {
    let e;
    return (n) => {
      clearTimeout(e), e = setTimeout(() => {
        const s = new CustomEvent(f.globalResize, { detail: { originalEvent: n } });
        window.dispatchEvent(s);
      }, 100);
    };
  }
  setEvents() {
    window.addEventListener("scroll", this._createOptimizedScrollHandler(), { passive: !0 }), window.addEventListener("resize", this._createOptimizedResizeHandler());
  }
  createAnimation(t, e = {}) {
    if (!t) {
      console.error("No container element provided for animation.");
      return;
    }
    let n = e.name;
    if (n || (n = t.getAttribute("data-name") || `instance-${Object.keys(this.instances).length + 1}`), this.instances[n]) {
      console.warn(`Instance with name "${n}" already exists. Skipping creation. Please set a valid name on props.`);
      return;
    }
    e.helpers = this.helpers;
    const s = new V(t, e);
    return this.addInstance(s, n), this.instances[n];
  }
  addInstance(t, e) {
    this.instances[e] = t;
  }
  getInstance(t) {
    return this.instances[t];
  }
}
typeof window != "undefined" && (window.TLH = $);
export {
  D as AnimationConstructor,
  b as ELEMENTS_CLASS,
  f as EVENTS,
  L as Helpers,
  $ as TLH,
  V as TLHAnimation,
  x as TimeLine,
  $ as default
};
//# sourceMappingURL=tlh-animations.es.js.map
