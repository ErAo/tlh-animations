import { defineConfig } from 'vite'
import { resolve } from 'path'

const FILE_NAME = 'tlh-animations'

export default defineConfig({
  // Configuración para librerías
  build: {
    lib: {
      // Punto de entrada de la librería
      entry: resolve(__dirname, 'animations.js'),
      // Nombre global para UMD build
      name: 'TLH',
      // Formatos de salida
      formats: ['es', 'umd', 'cjs'],
      // Función para generar nombres de archivos
      fileName: (format) => {
        switch (format) {
          case 'es':
            return `${FILE_NAME}.es.js`
          case 'umd':
            return `${FILE_NAME}.umd.js`
          case 'cjs':
            return `${FILE_NAME}.cjs.js`
          default:
            return `${FILE_NAME}.${format}.js`
        }
      }
    },
    // Opciones de rollup
    rollupOptions: {
      // Asegurar que las dependencias externas no sean incluidas en el bundle
      external: [],
      output: {
        // Configuración para UMD
        globals: {}
      }
    },
    // Directorio de salida
    outDir: 'dist',
    // Limpiar directorio de salida antes del build
    emptyOutDir: true,
    // Generar sourcemaps
    sourcemap: true,
    // Minificar código
    minify: 'esbuild',
    // Configuración del target
    target: 'es2015'
  },
  
  // Configuración para desarrollo
  server: {
    port: 3000,
    open: true,
    cors: true
  },

  // Configuración de resolución
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  // Configuración de optimización de dependencias
  optimizeDeps: {
    include: []
  },

  // Definir variables globales
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  },

  // Plugins adicionales (si necesitas alguno)
  plugins: []
})