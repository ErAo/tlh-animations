# TLH Animations 🎬

Una librería de animaciones basada en scroll inspirada en GSAP, diseñada para crear experiencias interactivas fluidas y optimizadas.

## 📦 Instalación

```bash
npm install tlh-animations
```

O incluye directamente el archivo en tu proyecto:

```html
<script type="module" src="path/to/animations.js"></script>
```

## 🚀 Uso Básico

```javascript
import TLH from 'tlh-animations';

// Crear instancia principal
const tlh = new TLH();

// Crear animación
const animation = tlh.createAnimation(document.querySelector('.mi-contenedor'), {
  name: 'mi-animacion',
  options: {
    start: 0,
    end: 100,
    scrollDistance: 200,
    markers: true
  }
});
```

## 📖 API Reference

### TLH (Clase Principal)

#### Constructor
```javascript
const tlh = new TLH();
```

#### Métodos

##### `createAnimation(container, props)`
Crea una nueva animación de scroll.

**Parámetros:**
- `container` *(Element)*: Elemento DOM que servirá como contenedor
- `props` *(Object)*: Configuración de la animación

**Retorna:** Instancia de `TLHAnimation`

```javascript
const animation = tlh.createAnimation(element, {
  name: 'mi-animacion',
  options: { /* opciones */ },
  onMounted: function() { /* callback */ },
  onUpdate: function(event) { /* callback */ },
  onStart: function(event) { /* callback */ },
  onComplete: function(event) { /* callback */ }
});
```

##### `getInstance(name)`
Obtiene una instancia de animación por nombre.

```javascript
const animation = tlh.getInstance('mi-animacion');
```

### TLHAnimation (Clase de Animación)

#### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `progress` | Number | Progreso actual (0-1) |
| `previousProgress` | Number | Progreso anterior |
| `progressReverse` | Number | Progreso inverso (1-0) |
| `hasStarted` | Boolean | Si la animación ha comenzado |
| `progressEnded` | Boolean/Number | Estado de finalización |

#### Opciones de Configuración

```javascript
const options = {
  start: 0,                    // Punto de inicio (% viewport)
  end: 0,                      // Punto final (% viewport)  
  markers: false,              // Mostrar marcadores visuales
  pin: true,                   // Fijar elemento durante animación
  scrollDistance: 0,           // Distancia de scroll personalizada
  fullscreen: true,            // Usar altura completa del viewport
  detectionMode: {
    start: 'top',              // 'top', 'center', 'bottom'
    end: 'bottom'              // 'top', 'center', 'bottom'
  }
};
```

#### Métodos Principales

##### `addToTimeline(props)`
Añade una animación al timeline.

```javascript
animation.addToTimeline({
  name: 'fadeIn',
  start: 0,
  end: 50,
  duration: 1,
  onUpdate: function() {
    // Lógica de animación
  },
  onStart: function() {
    // Al iniciar
  },
  onComplete: function() {
    // Al completar
  }
});
```

##### `normalizedProgress(start, end, progress)`
Calcula el progreso normalizado entre dos puntos.

```javascript
const normalizedValue = animation.normalizedProgress(0.2, 0.8, animation.progress);
```

##### `getPercentElement(element, options)`
Calcula el porcentaje de un elemento dentro del contenedor.

```javascript
const percentage = animation.getPercentElement(element, {
  mode: 'center',        // 'start', 'center', 'end', 'visible'
  offset: 0,             // Offset en píxeles
  threshold: 0.5,        // Para modo 'visible'
  cache: true            // Usar cache
});
```

##### `setProgress(progress, callback)`
Establece manualmente el progreso de la animación.

```javascript
animation.setProgress(0.5, () => {
  console.log('Progreso establecido');
});
```

##### `destroy()`
Destruye la animación y limpia los event listeners.

```javascript
animation.destroy();
```

##### `rebuild()`
Reconstruye la animación (útil para cambios de viewport).

```javascript
animation.rebuild();
```

### Timeline

El timeline permite crear animaciones secuenciales y paralelas.

#### Uso

```javascript
// Acceder al timeline
const timeline = animation.timeline;

// Añadir animación al timeline
const timelineAnimation = timeline.add('fadeIn', {
  start: 0,
  end: 50,
  duration: 1,
  onUpdate: function() {
    const element = document.querySelector('.elemento');
    element.style.opacity = this.normalizedProgress;
  }
});
```

### Helpers

Utilidades para animaciones y selectores.

#### Funciones de Easing

```javascript
import { Helpers } from 'tlh-animations';

// Funciones disponibles
Helpers.easing.linear(t)      // Lineal
Helpers.easing.easeIn(t)      // Ease in
Helpers.easing.easeOut(t)     // Ease out  
Helpers.easing.easeInOut(t)   // Ease in-out
Helpers.easing.bounce(t)      // Bounce
```

#### Selector Helper

```javascript
const elements = Helpers.selector('.mi-clase');
// Retorna NodeList o Array con elementos
```

## 🎯 Ejemplos Prácticos

### Animación de Fade In/Out

```javascript
const animation = tlh.createAnimation(document.querySelector('.hero'), {
  name: 'hero-fade',
  options: {
    start: 0,
    end: 100,
    scrollDistance: 150,
    markers: true
  },
  customAnimations: {
    fadeInOut: function() {
      const element = this.elements.container.querySelector('.content');
      const opacity = this.progress < 0.5 
        ? this.progress * 2 
        : (1 - this.progress) * 2;
      
      element.style.opacity = opacity;
    }
  }
});
```

### Animación con Timeline

```javascript
const animation = tlh.createAnimation(container, {
  name: 'timeline-demo',
  onMounted: function() {
    // Texto aparece del 0% al 30%
    this.addToTimeline({
      name: 'textReveal',
      start: 0,
      end: 30,
      onUpdate: function() {
        const text = document.querySelector('.text');
        text.style.transform = `translateY(${(1 - this.normalizedProgress) * 100}px)`;
        text.style.opacity = this.normalizedProgress;
      }
    });

    // Imagen se escala del 30% al 70%
    this.addToTimeline({
      name: 'imageScale',
      start: 30,
      end: 70,
      onUpdate: function() {
        const img = document.querySelector('.image');
        const scale = 0.8 + (this.normalizedProgress * 0.2);
        img.style.transform = `scale(${scale})`;
      }
    });
  }
});
```

### Animación Paralax

```javascript
const paralaxAnimation = tlh.createAnimation(document.querySelector('.paralax-section'), {
  name: 'paralax',
  options: {
    scrollDistance: 200,
    detectionMode: {
      start: 'center',
      end: 'center'
    }
  },
  customAnimations: {
    paralaxEffect: function() {
      const bg = this.elements.container.querySelector('.bg-image');
      const content = this.elements.container.querySelector('.content');
      
      // Fondo se mueve más lento
      const bgOffset = this.progress * 50;
      bg.style.transform = `translateY(${bgOffset}px)`;
      
      // Contenido se mueve más rápido
      const contentOffset = this.progress * -100;
      content.style.transform = `translateY(${contentOffset}px)`;
    }
  }
});
```

### Usando Atributos Data

```html
<div class="animation-container" 
     data-name="my-animation"
     data-start="10"
     data-end="90"
     data-scroll-distance="300"
     data-markers="true">
  <div class="content">Contenido animado</div>
</div>
```

```javascript
const element = document.querySelector('.animation-container');
const animation = tlh.createAnimation(element, {
  customAnimations: {
    slideIn: function() {
      const content = this.elements.container.querySelector('.content');
      const translateX = (1 - this.progress) * 100;
      content.style.transform = `translateX(${translateX}%)`;
    }
  }
});
```

## 🎨 Configuración Avanzada

### Detección Personalizada

```javascript
const animation = tlh.createAnimation(container, {
  options: {
    detectionMode: {
      start: 'top',     // Elemento toca la parte superior del viewport
      end: 'bottom'     // Elemento toca la parte inferior del viewport
    }
  }
});
```

### Marcadores de Debug

```javascript
const animation = tlh.createAnimation(container, {
  options: {
    markers: true  // Muestra líneas verdes y rojas para start/end
  }
});
```

### Animaciones con Duración

```javascript
animation.addToTimeline({
  name: 'slowReveal',
  start: 0,
  end: 50,
  duration: 2,  // Hace la animación más lenta
  onUpdate: function() {
    // this.normalizedProgress tendrá easing aplicado
  }
});
```

## 🔧 Eventos Disponibles

### Eventos Globales
- `tlh-global-scroll`: Evento de scroll optimizado
- `tlh-global-resize`: Evento de resize optimizado

### Eventos de Animación
- `tlh-animate-update`: Se dispara en cada frame de la animación
- `tlh-animate-start`: Se dispara al inicio de la animación
- `tlh-animate-complete`: Se dispara al completar la animación

### Callbacks

```javascript
const animation = tlh.createAnimation(container, {
  onMounted: function() {
    // Ejecutado cuando la animación se monta
    console.log('Animación montada');
  },
  onUpdate: function(event) {
    // Ejecutado en cada frame
    console.log('Progress:', this.progress);
  },
  onStart: function(event) {
    // Ejecutado al iniciar
    console.log('Animación iniciada');
  },
  onComplete: function(event) {
    // Ejecutado al completar
    console.log('Animación completada');
  }
});
```

## ⚡ Optimización

### Cache Automático
La librería implementa cache automático para:
- Valores de viewport
- Coordenadas de elementos
- Claves de animación
- Cálculos de porcentajes

### Throttling de Eventos
Los eventos de scroll y resize están optimizados con:
- RequestAnimationFrame para scroll
- Debounce para resize
- Pool de objetos para eventos

### Limpieza de Memoria
```javascript
// Destruir animación para liberar memoria
animation.destroy();

// O reconstruir después de cambios
animation.rebuild();
```

## 🎭 Casos de Uso

- ✅ Animaciones de scroll paralax
- ✅ Revelar contenido progresivamente  
- ✅ Efectos de escala y transformación
- ✅ Animaciones de texto (typewriter, fade)
- ✅ Galerías y sliders animados
- ✅ Efectos de partículas basados en scroll
- ✅ Navegación sticky animada
- ✅ Loading screens con progreso

## 🛠️ Desarrollo

```bash
# Instalar dependencias
npm install

# Build para producción
npm run build
```

## 📄 Licencia

MIT © [Richar Arenas]

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

¿Necesitas ayuda? Abre un [issue](https://github.com/tu-usuario/tlh-animations/issues) en GitHub.