var P = Object.defineProperty, O = Object.defineProperties;
var U = Object.getOwnPropertyDescriptors;
var z = Object.getOwnPropertySymbols;
var D = Object.prototype.hasOwnProperty, M = Object.prototype.propertyIsEnumerable;
var _ = (c, t, e) => t in c ? P(c, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : c[t] = e, f = (c, t) => {
  for (var e in t || (t = {}))
    D.call(t, e) && _(c, e, t[e]);
  if (z)
    for (var e of z(t))
      M.call(t, e) && _(c, e, t[e]);
  return c;
}, b = (c, t) => O(c, U(t));
var R = (c, t, e) => _(c, typeof t != "symbol" ? t + "" : t, e);
class L {
  constructor(t, e = {}) {
    this.elements = {
      // to store DOM elements
      container: t
    }, this.customAnimations = e.customAnimations || {}, this.scrollCords = {
      // to define where the animation starts and ends in relation to the container and viewport
      startAt: 0,
      endAt: 0
    }, this._cachedVWValue = window.innerWidth, this.progress = 0, this.previousProgress = 0, this.progressEnded = !1, this.interfaceReady = !1, this.hasStarted = !1, this._lastScrollTime = 0, this.timeline = {}, this.options = f(f({
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
class y {
}
R(y, "easing", {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  bounce: (t) => t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375 : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
}), // Selector helper
R(y, "selector", (t) => typeof t == "string" ? document.querySelectorAll(t) : [t]);
class x {
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
    const { startUnit: r, endUnit: l } = this._cachedUnits, o = this.props.normalizedProgress(r, l, t);
    let i;
    s !== 1 ? i = Math.pow(o, s) : i = o, i = Math.max(0, Math.min(1, i)), this.progress = o, this.normalizedProgress = i, this.progress > 0 && !this.hasStarted && this.onStart(), this.onUpdate(), t === 1 && this.onComplete();
  }
}
class V {
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
    return new x(t, b(f({}, e), {
      normalizedProgress: this.normalizedProgress,
      container: this.elements.container,
      events: this.customEvents
    }));
  }
}
const g = {
  onUpdate: "tlh-animate-update",
  onStart: "tlh-animate-start",
  onComplete: "tlh-animate-complete",
  globalScroll: "tlh-global-scroll",
  globalResize: "tlh-global-resize"
}, E = {
  marker: "tlh-scroll-marker",
  markerStart: "tlh-scroll-marker-start",
  markerEnd: "tlh-scroll-marker-end",
  pinSpacer: "tlh-pin-section",
  pinInner: "tlh-pin-inner"
};
class H extends L {
  constructor(t, e = {}) {
    super(t, e), this.props = e, this.customEvents = {
      onUpdate: g.onUpdate,
      onStart: g.onStart,
      onComplete: g.onComplete
    }, this.timeline = new V(this), this.init();
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
    const { top: t, bottom: e } = this.getElementCords(), { endAt: n, startAt: s } = this.scrollCords, { startMarker: r, endMarker: l } = this.elements, o = r != null ? r : document.createElement("div"), i = l != null ? l : document.createElement("div");
    o.classList.add(E.marker, E.markerStart), i.classList.add(E.marker, E.markerEnd);
    const { end: a, start: m } = this.options.detectionMode, h = (p, d) => `
        position: absolute;
        left: 0;
        right: 0;
        top: ${p}px;
        width: 100%;
        height: 2px;
        z-index: 9999;
        background: ${d};
      `;
    o.style.cssText = h(t - s, "green"), i.style.cssText = h(e + n, "red"), o.textContent = `Start - once this touch the ${m} of the viewport`, i.textContent = `End - once this touch the ${a} of the viewport`, !r && !l && (document.body.append(o), document.body.append(i), this.setElements("startMarker", o), this.setElements("endMarker", i));
  }
  createPinInterface() {
    const t = document.createElement("div");
    t.classList.add(E.pinSpacer), t.style.cssText = `
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
    const { container: t } = this.elements, { scrollDistance: e, fullscreen: n } = this.options, { endAt: s } = this.scrollCords, r = e * 0.01, l = window.innerHeight;
    !e && e != 0 && console.warn("scrollDistance must be defined on element or animation options");
    const o = l * r;
    if (this.options.scrollTop = o + s, e > 0 && n) {
      const i = l + o;
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
    this._boundScrollControl = this.scrollControl.bind(this), this._boundResizeControl = this.resizeControl.bind(this), this._boundOnUpdate = this.onUpdate.bind(this), this._boundOnStart = this.onStart.bind(this), this._boundOnComplete = this.onComplete.bind(this), window.addEventListener(g.globalScroll, this._boundScrollControl), window.addEventListener(g.globalResize, this._boundResizeControl), this.elements.container.addEventListener(t, this._boundOnUpdate), this.elements.container.addEventListener(e, this._boundOnStart), this.elements.container.addEventListener(n, this._boundOnComplete);
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
    const t = window.scrollY || window.pageYOffset, { container: e } = this.elements, { startAt: n, endAt: s } = this.scrollCords, { scrollDistance: r, fullscreen: l } = this.options;
    this._cachedViewportValues || (this._cachedViewportValues = {
      vh: window.innerHeight,
      scaleDistance: l ? 0 : r * 0.01,
      topDetectionRange: this.getTopDetectionRange(),
      bottomDetectionRange: this.getBottomDetectionRange()
    });
    const { vh: o, scaleDistance: i, topDetectionRange: a, bottomDetectionRange: m } = this._cachedViewportValues, h = e.getBoundingClientRect();
    let p = h.top + t, d = h.bottom + t;
    d += o * i;
    let u = t + a, w = t + o + m, C = p - n - u, S = d + s - w;
    return {
      top: p,
      height: h.height,
      totalSpace: d - p,
      bottom: d,
      toStart: C,
      toEnd: S
    };
  }
  onScroll(t) {
    if (!this.interfaceReady) return;
    const { toStart: e, toEnd: n } = this.getElementCords();
    let s = 0;
    if (e <= 0 && n >= 0) {
      const u = Math.abs(e) + Math.abs(n), w = Math.abs(e);
      s = u > 0 ? w / u : 0;
    } else e > 0 ? s = 0 : n < 0 && (s = 1);
    if (s = Math.max(0, Math.min(1, s)), Math.abs(this.progress - s) < 1e-3 && this.previousProgress !== void 0)
      return;
    const { container: l } = this.elements, { scrollTop: o } = this.options, i = 1 - s;
    this.previousProgress = this.progress, this.progress = s, this.progressReverse = i;
    const a = this._eventDetailPool;
    a.progress = s, a.scrollTop = o, a.progressReverse = i, a.containerRect = null;
    const m = () => (a.containerRect || (a.containerRect = l.getBoundingClientRect()), a.containerRect), { onUpdate: h, onStart: p, onComplete: d } = this.customEvents;
    s > 0 && !this.hasStarted && (this.hasStarted = !0, m(), this.elements.container.dispatchEvent(new CustomEvent(p, {
      detail: b(f({}, a), { containerRect: a.containerRect })
    }))), !((e >= 0 && n >= 0 || e < 0 && n < 0) && this.progressEnded !== !1) && (this.elements.container.dispatchEvent(new CustomEvent(h, {
      detail: b(f({}, a), { containerRect: m(), scrollEvent: t })
    })), s === 1 && this.previousProgress < 1 && (m(), this.elements.container.dispatchEvent(new CustomEvent(d, {
      detail: b(f({}, a), { containerRect: a.containerRect })
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
      cache: l = !0
      // Usar cache para optimizar
    } = e, o = `${t.className || "element"}-${n}-${s}-${r}`;
    if (l && this._elementPercentCache && this._elementPercentCache[o])
      return this._elementPercentCache[o];
    try {
      const { container: i } = this.elements, { scrollDistance: a, fullscreen: m } = this.options, h = i.getBoundingClientRect(), p = i.scrollTop || 0, d = h.top + window.scrollY - p, u = t.getBoundingClientRect(), w = t.scrollTop || 0, C = u.top + window.scrollY - w, S = window.innerHeight, A = m ? 0 : a * 0.01, k = h.height + S * A;
      let v = C - d + s;
      switch (n) {
        case "start":
          v += 0;
          break;
        case "center":
          v += u.height / 2;
          break;
        case "end":
          v += u.height;
          break;
        case "visible":
          v += u.height * r;
          break;
        default:
          v += 0;
      }
      const T = Math.max(0, Math.min(1, v / k)) * 100;
      return l && (this._elementPercentCache || (this._elementPercentCache = {}), this._elementPercentCache[o] = T), T;
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
    this._boundScrollControl && window.removeEventListener(g.globalScroll, this._boundScrollControl), this._boundResizeControl && window.removeEventListener(g.globalResize, this._boundResizeControl);
    const { onUpdate: t, onStart: e, onComplete: n } = this.customEvents;
    this._boundOnUpdate && this.elements.container.removeEventListener(t, this._boundOnUpdate), this._boundOnStart && this.elements.container.removeEventListener(e, this._boundOnStart), this._boundOnComplete && this.elements.container.removeEventListener(n, this._boundOnComplete), this._boundScrollControl = null, this._boundResizeControl = null, this._boundOnUpdate = null, this._boundOnStart = null, this._boundOnComplete = null, this.progress = 0, this.previousProgress = 0, this.progressEnded = !1, this._cachedViewportValues = null, this._cachedAnimationKeys = null, this.interfaceReady = !1;
  }
  rebuild() {
    this.destroy(), this.init();
  }
}
class $ {
  constructor() {
    this.instances = {}, this.setEvents();
  }
  _createOptimizedScrollHandler() {
    let t = !1, e = 0;
    return (n) => {
      const s = performance.now();
      s - e < 16.67 || t || (e = s, requestAnimationFrame(() => {
        const r = new CustomEvent(g.globalScroll, { detail: { originalEvent: n } });
        window.dispatchEvent(r), t = !1;
      }), t = !0);
    };
  }
  _createOptimizedResizeHandler(t) {
    let e;
    return (n) => {
      clearTimeout(e), e = setTimeout(() => {
        const s = new CustomEvent(g.globalResize, { detail: { originalEvent: n } });
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
    const s = new H(t, e);
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
  L as AnimationConstructor,
  E as ELEMENTS_CLASS,
  g as EVENTS,
  y as Helpers,
  $ as TLH,
  H as TLHAnimation,
  V as TimeLine,
  $ as default
};
//# sourceMappingURL=tlh-animations.es.js.map
