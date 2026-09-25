# Reglas de Desarrollo - Generador CSS Pixel Art

## Contexto del proyecto

Este proyecto evoluciona hacia un MVP para generar y renderizar animales en Pixel Art mediante HTML y CSS. El usuario selecciona un animal y, opcionalmente, un estilo o una animación. Un backend PHP obtiene la matriz correspondiente, la convierte en CSS basado principalmente en `box-shadow` y el navegador muestra el resultado.

- Interfaz actual: HTML, CSS y JavaScript nativo.
- Backend objetivo: PHP servido en el entorno Apache del proyecto.
- Representación fuente: matrices de píxeles y paletas de colores.
- Salida visual principal: cuadrados CSS posicionados con `box-shadow`.
- Idioma de la interfaz y documentación: español.
- Fuera del MVP: IA, generación desde prompts, carga o procesamiento de imágenes y reconocimiento visual.

## Flujo funcional

```text
Usuario
  -> selecciona un animal
  -> selecciona opcionalmente un estilo o animación
  -> el backend PHP obtiene el patrón
  -> el patrón se convierte en CSS
  -> el navegador renderiza el Pixel Art
```

## Estructura actual

- `index.html`: interfaz existente y punto de entrada del navegador.
- `css/style.css`: estilos y figuras Pixel Art existentes.
- `js/script.js`: comportamiento de la interfaz actual.
- `resources/`: recursos visuales y multimedia.
- `.ia-context/`: alcance, estándares y reglas para asistentes y colaboradores.

La estructura PHP y el catálogo de matrices todavía deben incorporarse. No tratarlos como existentes hasta comprobarlos en el repositorio.

## Reglas obligatorias

1. Mantener el alcance del MVP sin IA ni procesamiento de imágenes.
2. Mantener los textos visibles y la documentación en español.
3. Usar la matriz como fuente de verdad y generar el CSS a partir de ella.
4. Separar patrones, generación CSS, transporte HTTP y presentación visual.
5. Validar animales, estilos, animaciones, escalas y colores en el backend.
6. No construir nombres de archivo o código CSS directamente con entradas sin validar.
7. Mantener accesibilidad básica: HTML semántico, labels, foco visible, contraste y soporte responsive.
8. Respetar `prefers-reduced-motion` al incorporar animaciones.
9. Evitar frameworks, base de datos y dependencias nuevas salvo que resuelvan una necesidad demostrable.
10. Actualizar `README.md` cuando cambien instalación, uso, estructura o requisitos.
11. Probar el flujo completo en el servidor PHP/Apache después de cambios funcionales.

## Criterios del MVP

- El usuario puede elegir al menos un animal disponible.
- El backend encuentra un patrón válido y genera sus píxeles CSS.
- La figura se renderiza sin imágenes rasterizadas ni canvas.
- Los animales no implementados producen un error controlado.
- La interfaz funciona en escritorio y móvil.
- El diseño permite añadir animales mediante nuevos patrones sin reescribir el generador.

## Catálogo objetivo

Perro, gato, zorro, panda, rana, unicornio, narval y ballena. Esta lista expresa el objetivo del catálogo, no garantiza que todos estén implementados.
