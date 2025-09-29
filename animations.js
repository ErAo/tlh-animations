import AnimationConstructor from "./src/AnimationConstructor.js";
import Helpers from "./src/Helpers.js";
import TimeLine from "./src/TimeLine.js";
import { EVENTS, ELEMENTS_CLASS } from "./src/ConfigVars.js";

class TLHAnimation extends AnimationConstructor {
    constructor(container, props = {}) {
      super(container, props);
      this.props = props;

      this.customEvents = {
          onUpdate: EVENTS.onUpdate,
          onStart: EVENTS.onStart,
          onComplete: EVENTS.onComplete
      };

      this.timeline = new TimeLine(this);

      this.init();
    }

    getDataOptions () {
      const dataOptions = this.elements.container.dataset;
      return dataOptions;
    }

    init() {
      this.setElements('container', this.elements.container);
      if(this.props.onMounted) this.props.onMounted.call(this);
      this.setScrollCords();
      this.createInterface();
      this.setEvents();
    }

    setScrollCords() {
      const { end, start } = this.options;
      const vh = window.innerHeight;

      const newStart = vh * (start * 0.01);
      const newEnd = vh * (end * 0.01);

      this.scrollCords.startAt = newStart;
      this.scrollCords.endAt = newEnd;
    }
    
    addToTimeline(props) {
      if(!props.name) {
        console.warn('You must provide a name for the timeline animation.');
        return;
      }

      if(this.timeline[props.name]) {
        console.warn(`Timeline animation with name "${props.name}" already exists.`);
        return;
      }
  
      this.timeline.add(props.name, props);

      this._cachedAnimationKeys = null;
    }

    setElements(name, element) {
      this.elements[name] = element;
    }

    addMarkers() {
      if(!this.options.markers) return;
      const { top, bottom } = this.getElementCords();
      const { endAt, startAt } = this.scrollCords;
      const { startMarker: startMarkerElement, endMarker: endMarkerElement } = this.elements;
      const startMarker = startMarkerElement ?? document.createElement('div');
      const endMarker = endMarkerElement ?? document.createElement('div');
      startMarker.classList.add(ELEMENTS_CLASS.marker, ELEMENTS_CLASS.markerStart);
      endMarker.classList.add(ELEMENTS_CLASS.marker, ELEMENTS_CLASS.markerEnd);
      const { end, start } = this.options.detectionMode;

      const markerStyle = (top, color) => `
        position: absolute;
        left: 0;
        right: 0;
        top: ${top}px;
        width: 100%;
        height: 2px;
        z-index: 9999;
        background: ${color};
      `;

      startMarker.style.cssText = markerStyle(top - startAt, 'green');
      endMarker.style.cssText = markerStyle(bottom + endAt, 'red');

      startMarker.textContent = `Start - once this touch the ${start} of the viewport`;
      endMarker.textContent = `End - once this touch the ${end} of the viewport`;
      
      if(!startMarkerElement && !endMarkerElement) {
        document.body.append(startMarker);
        document.body.append(endMarker);
        this.setElements('startMarker', startMarker);
        this.setElements('endMarker', endMarker);
      }
    }

    createPinInterface() {
      const pinSection = document.createElement('div');
      pinSection.classList.add(ELEMENTS_CLASS.pinSpacer);
      pinSection.style.cssText = `
        position: sticky;
        top: 0;
        height: 100vh;
        width: 100%;
        pointer-events: none;
      `;

      const children = Array.from(this.elements.container.childNodes);
      children.forEach(child => {
        pinSection.appendChild(child);
      });

      this.elements.container.appendChild(pinSection);
    }

    createInterface() {
      const { container } = this.elements;
      const { scrollDistance, fullscreen } = this.options;
      const { endAt } = this.scrollCords;
      const scaleDistance = scrollDistance * 0.01;
      const windowHeight = window.innerHeight;

      if(!scrollDistance && scrollDistance != 0) {
        console.warn('scrollDistance must be defined on element or animation options');
      }

      const contentHeight = (windowHeight * scaleDistance);
      
      this.options.scrollTop = (contentHeight + endAt);
      if(scrollDistance > 0 && fullscreen) {
        const newHeight = windowHeight + contentHeight;
        container.style.height = `${newHeight}px`;
      }

      this.interfaceReady = true

      this.addMarkers()
      if(this.options.pin) this.createPinInterface()
    }

    resize(force = false) {
      if(this.resizeTimeout) clearTimeout(this.resizeTimeout);
      const vw = window.innerWidth;
      if(vw !== this._cachedVWValue || force) {
        this._cachedViewportValues = null;
        this._cachedAnimationKeys = null;
        this.resizeTimeout = setTimeout(() => {
          this._cachedVWValue = vw;
          this.rebuild.bind(this)();
        }, 200);
      }
    }

    scrollControl(event) {
      this.onScroll(event);
    }

    resizeControl(event) {
      this.resize();
    }

    setEvents(){
      const { onUpdate, onStart, onComplete } = this.customEvents;

      // Guardar referencias para poder removerlas después
      this._boundScrollControl = this.scrollControl.bind(this);
      this._boundResizeControl = this.resizeControl.bind(this);
      this._boundOnUpdate = this.onUpdate.bind(this);
      this._boundOnStart = this.onStart.bind(this);
      this._boundOnComplete = this.onComplete.bind(this);

      window.addEventListener(EVENTS.globalScroll, this._boundScrollControl);
      window.addEventListener(EVENTS.globalResize, this._boundResizeControl);
      
      this.elements.container.addEventListener(onUpdate, this._boundOnUpdate);
      this.elements.container.addEventListener(onStart, this._boundOnStart);
      this.elements.container.addEventListener(onComplete, this._boundOnComplete);
    }

    getTopDetectionRange(){
      const { detectionMode } = this.options;
      const { start } = detectionMode
      const vh = window.innerHeight;
      
      if(start === 'top') return 0;
      if(start === 'center') return vh / 2;
      if(start === 'bottom') return vh;
      return 0;
    }

    getBottomDetectionRange(){
      const { detectionMode } = this.options;
      const { end } = detectionMode
      const vh = window.innerHeight;

      if(end === 'top') return vh * -1;
      if(end === 'center') return (vh / 2) * -1;
      if(end === 'bottom') return 0;
      return 0;
    }

    getElementCords() {
      const scrollY = window.scrollY || window.pageYOffset;
      const { container } = this.elements;
      const { startAt, endAt } = this.scrollCords;
      const { scrollDistance, fullscreen } = this.options;
      
      // Cache valores que no cambian durante el scroll
      if (!this._cachedViewportValues) {
        this._cachedViewportValues = {
          vh: window.innerHeight,
          scaleDistance: !fullscreen ? scrollDistance * 0.01 : 0,
          topDetectionRange: this.getTopDetectionRange(),
          bottomDetectionRange: this.getBottomDetectionRange()
        };
      }
      
      const { vh, scaleDistance, topDetectionRange, bottomDetectionRange } = this._cachedViewportValues;
      
      const containerRect = container.getBoundingClientRect();
      let containerTop = containerRect.top + scrollY;
      let containerBottom = containerRect.bottom + scrollY;
      containerBottom += (vh * scaleDistance);

      let screenTop = scrollY + topDetectionRange;
      let screenBottom = scrollY + vh + bottomDetectionRange;

      let distanceToStart = (containerTop - startAt) - screenTop;
      let distanceToEnd = (containerBottom + endAt) - screenBottom;

      return { 
        top: containerTop, 
        height: containerRect.height,
        totalSpace: containerBottom - containerTop,
        bottom: containerBottom, 
        toStart: distanceToStart,
        toEnd: distanceToEnd
      };
    }

    onScroll(event) {
      if (!this.interfaceReady) return;
      const { toStart, toEnd } = this.getElementCords();

      let progress = 0;

      if (toStart <= 0 && toEnd >= 0) {
        const totalDistance = Math.abs(toStart) + Math.abs(toEnd);
        const currentDistance = Math.abs(toStart);
        progress = totalDistance > 0 ? currentDistance / totalDistance : 0;
      } else if (toStart > 0) {
        progress = 0;
      } else if (toEnd < 0) {
        progress = 1;
      }

      progress = Math.max(0, Math.min(1, progress));

      // Solo actualizar si el progreso cambió significativamente
      const progressDiff = Math.abs(this.progress - progress);
      if (progressDiff < 0.001 && this.previousProgress !== undefined) {
        return;
      }

      const { container } = this.elements;
      const { scrollTop } = this.options;
      const progressReverse = 1 - progress;
      
      this.previousProgress = this.progress;
      this.progress = progress;
      this.progressReverse = progressReverse;

      // Reutilizar objeto en lugar de crear nuevo
      const eventDetail = this._eventDetailPool;
      eventDetail.progress = progress;
      eventDetail.scrollTop = scrollTop;
      eventDetail.progressReverse = progressReverse;
      eventDetail.containerRect = null; // Se calculará solo si se necesita

      // Función lazy para containerRect
      const getContainerRect = () => {
        if (!eventDetail.containerRect) {
          eventDetail.containerRect = container.getBoundingClientRect();
        }
        return eventDetail.containerRect;
      };

      // trigger events
      const { onUpdate, onStart, onComplete } = this.customEvents;

      // Disparar evento de start cuando la animación comience
      if (progress > 0 && !this.hasStarted) {
        this.hasStarted = true;
        getContainerRect(); // Asegurar que se calcule para el evento
        this.elements.container.dispatchEvent(new CustomEvent(onStart, {
          detail: { ...eventDetail, containerRect: eventDetail.containerRect }
        }));
      }
      
      if (((toStart >= 0 && toEnd >= 0) || (toStart < 0 && toEnd < 0)) && this.progressEnded !== false) {
        return;
      }

      this.elements.container.dispatchEvent(new CustomEvent(onUpdate, {
        detail: { ...eventDetail, containerRect: getContainerRect(), scrollEvent: event }
      }));

      if (progress === 1 && this.previousProgress < 1) {
        getContainerRect();
        this.elements.container.dispatchEvent(new CustomEvent(onComplete, {
          detail: { ...eventDetail, containerRect: eventDetail.containerRect }
        }));
      }
    }

    onUpdate(event) {
        const { progress } = event.detail;

        this.progressEnded = progress === 1 ? 1 : (progress === 0 ? 0 : false);

        if (progress === 0) {
          this.hasStarted = false;
        }

        // Cache de arrays para evitar Object.keys() repetido
        if (!this._cachedAnimationKeys) {
          this._cachedAnimationKeys = {
            custom: Object.keys(this.customAnimations),
            timeline: Object.keys(this.timeline)
          };
        }

        const { custom: customAnimations } = this._cachedAnimationKeys;

        // Ejecutar animaciones personalizadas
        customAnimations.forEach(animation => {
          this.customAnimations[animation].call(this);
        });

        this.props.onUpdate && this.props.onUpdate.call(this, event);
    }

    onStart(event) {
      this.props.onStart && this.props.onStart.call(this, event);
      //console.log('Animation started');
    }

    onComplete(event) {
      this.props.onComplete && this.props.onComplete.call(this, event);
      //console.log('Animation completed');
    }

    normalizedProgress(start, end, progress = this.progress){
      return Math.max(0, Math.min(1, (progress - start) / (end - start)));
    }

    getPercentElement(element, options = {}) {
      if(!element) {
        console.warn('Element is not defined');
        return 0;
      }
      
      // Opciones de configuración
      const {
          mode = 'start',           // 'start', 'center', 'end', 'visible'
          offset = 0,               // Offset adicional en píxeles
          threshold = 0.5,          // Para modo 'visible' (0-1)
          cache = true              // Usar cache para optimizar
      } = options;

      // Cache key para evitar recálculos innecesarios
      const cacheKey = `${element.className || 'element'}-${mode}-${offset}-${threshold}`;
      
      if (cache && this._elementPercentCache && this._elementPercentCache[cacheKey]) {
          return this._elementPercentCache[cacheKey];
      }

      try {
          const { container } = this.elements;
          const { scrollDistance, fullscreen } = this.options;
          
          // Obtener coordenadas del container y elemento
          const containerRect = container.getBoundingClientRect();
          const containerScrollTop = container.scrollTop || 0;
          const containerTop = containerRect.top + window.scrollY - containerScrollTop;
          
          const elementRect = element.getBoundingClientRect();
          const elementScrollTop = element.scrollTop || 0;
          const elementTop = elementRect.top + window.scrollY - elementScrollTop;
          
          // Calcular altura total del container (incluyendo scroll distance)
          const vh = window.innerHeight;
          const scaleDistance = !fullscreen ? scrollDistance * 0.01 : 0;
          const totalContainerHeight = containerRect.height + (vh * scaleDistance);
          
          // Posición relativa del elemento dentro del container
          let relativeElementPosition = elementTop - containerTop + offset;
          
          // Ajustar según el modo de cálculo
          switch(mode) {
              case 'start':
                  // Cuando el elemento comience a aparecer
                  relativeElementPosition += 0;
                  break;
                  
              case 'center':
                  // Cuando el centro del elemento esté visible
                  relativeElementPosition += elementRect.height / 2;
                  break;
                  
              case 'end':
                  // Cuando el elemento termine de aparecer
                  relativeElementPosition += elementRect.height;
                  break;
                  
              case 'visible':
                  // Cuando un threshold del elemento sea visible
                  relativeElementPosition += elementRect.height * threshold;
                  break;
                  
              default:
                  relativeElementPosition += 0;
          }
          
          // Calcular el porcentaje (0-1) dentro del total del container
          const percentage = Math.max(0, Math.min(1, relativeElementPosition / totalContainerHeight));
          
          // Convertir a progreso del scroll (0-100)
          const scrollProgress = percentage * 100;
          
          // Guardar en cache
          if (cache) {
              if (!this._elementPercentCache) {
                  this._elementPercentCache = {};
              }
              this._elementPercentCache[cacheKey] = scrollProgress;
          }
          
          return scrollProgress;
          
      } catch (error) {
          console.warn('Error calculating element percentage:', error);
          return 0;
      }
    }
    
    setProgress(progress, callback) {
      this.progress = progress;
      const { onUpdate } = this.customEvents;
      
      this.elements.container.dispatchEvent(new CustomEvent(onUpdate, {
        detail: {
          container: this.container,
          progress: progress
        }
      }));

      setTimeout(callback, 200);
    }

    destroy() {
      if (this._boundScrollControl) {
          window.removeEventListener(EVENTS.globalScroll, this._boundScrollControl);
      }
      if (this._boundResizeControl) {
          window.removeEventListener(EVENTS.globalResize, this._boundResizeControl);
      }
      
      const { onUpdate, onStart, onComplete } = this.customEvents;
      if (this._boundOnUpdate) {
          this.elements.container.removeEventListener(onUpdate, this._boundOnUpdate);
      }
      if (this._boundOnStart) {
          this.elements.container.removeEventListener(onStart, this._boundOnStart);
      }
      if (this._boundOnComplete) {
          this.elements.container.removeEventListener(onComplete, this._boundOnComplete);
      }

      // Limpiar referencias
      this._boundScrollControl = null;
      this._boundResizeControl = null;
      this._boundOnUpdate = null;
      this._boundOnStart = null;
      this._boundOnComplete = null;
      
      this.progress = 0;
      this.previousProgress = 0;
      this.progressEnded = false;
      this._cachedViewportValues = null;
      this._cachedAnimationKeys = null;
      this.interfaceReady = false;
    }

    rebuild(){
      this.destroy();
      this.init()
    }
}

class TLH {
  constructor () {
    this.instances = {};

    this.setEvents()
  }

  _createOptimizedScrollHandler() {
      let ticking = false;
      let lastTime = 0;
      
      return (event) => {
        const now = performance.now();
        
        if (now - lastTime < 16.67) return;
        
        if (!ticking) {
          lastTime = now;
          
          requestAnimationFrame(() => {
            const updateEvent = new CustomEvent(EVENTS.globalScroll, { detail: { originalEvent: event } });
            window.dispatchEvent(updateEvent);
            ticking = false;
          });
          
          ticking = true;
        }
      };
  }

  _createOptimizedResizeHandler(event) {
      let resizeTimeout;

      return (event) => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const updateEvent = new CustomEvent(EVENTS.globalResize, { detail: { originalEvent: event } });
          window.dispatchEvent(updateEvent);
        }, 100);
      };
  }

  setEvents(){
    window.addEventListener('scroll', this._createOptimizedScrollHandler(), { passive: true });
    window.addEventListener('resize', this._createOptimizedResizeHandler());  
  }

  createAnimation(container, props = {}) {
    if(!container) {
      console.error('No container element provided for animation.');
      return; 
    }

    let name = props.name;
    if (!name) {
      name = container.getAttribute('data-name') || `instance-${Object.keys(this.instances).length + 1}`;
    }

    if(this.instances[name]) {
      console.warn(`Instance with name "${name}" already exists. Skipping creation. Please set a valid name on props.`);
      return;
    }

    const instance = new TLHAnimation(container, props);
    this.addInstance(instance, name);

    return this.instances[name]
  }

  addInstance(instance, name) {
    this.instances[name] = instance;
  }

  getInstance(name) {
    return this.instances[name];
  }
}

// Exportaciones
export default TLH;
export {
  TLH,
  TLHAnimation,
  TimeLine,
  Helpers,
  AnimationConstructor,
  EVENTS,
  ELEMENTS_CLASS
};

// Para compatibilidad con UMD
if (typeof window !== 'undefined') {
  window.TLH = TLH;
}