# Estándares Frontend - Generador CSS Pixel Art

## Objetivo

Permitir que una persona seleccione un animal, elija opcionalmente un estilo o una animación y vea su representación Pixel Art generada con HTML y CSS.

## Convenciones

- Mantener la interfaz y los textos visibles en español.
- Usar HTML semántico, CSS y JavaScript nativo mientras cubran las necesidades del MVP.
- Preservar la identidad retro y pixel art ya presente en el proyecto.
- Mantener separados la interfaz de selección, la solicitud al backend y el renderizado del resultado.
- Mostrar únicamente opciones que el backend soporte realmente.
- Informar de estados de carga, selección vacía y errores sin dejar un lienzo ambiguo.

## Renderizado Pixel Art

- Representar la figura con una celda base cuadrada y una lista de sombras en `box-shadow`.
- Mantener `background: transparent` en el elemento base cuando todos los píxeles procedan de las sombras.
- Controlar el tamaño del píxel mediante una variable CSS o un valor centralizado.
- Usar escalado entero y evitar interpolación o desenfoque visual.
- Reservar espacio según las dimensiones del patrón para no alterar el layout al renderizar.
- Las animaciones deben ser opcionales y no deben modificar la matriz fuente.

Ejemplo de estructura:

```css
.pixel-art {
    width: 6px;
    height: 6px;
    background: transparent;
    box-shadow: var(--pixel-shadows);
}
```

## Responsive y accesibilidad

- Adaptar selector, controles y área de previsualización a escritorio y móvil.
- Asociar cada control con su `label` y permitir operar el flujo con teclado.
- Mantener foco visible, contraste suficiente y botones con nombres descriptivos.
- Respetar `prefers-reduced-motion`; desactivar o simplificar animaciones cuando se solicite.
- Evitar scroll horizontal causado por la figura; ajustar la escala al espacio disponible.

## Validación

- Revisar el flujo sin estilo ni animación y con cada opción implementada.
- Confirmar que cambiar de animal reemplaza el resultado anterior correctamente.
- Verificar el renderizado en viewport móvil y de escritorio.
- Revisar la consola del navegador y las respuestas fallidas del backend.
