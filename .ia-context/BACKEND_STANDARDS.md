# Estándares Backend - Generador CSS Pixel Art

## Objetivo

El backend PHP del MVP debe resolver una solicitud de animal y opciones permitidas, obtener su patrón Pixel Art y convertirlo en CSS renderizable. No utilizará IA, visión artificial ni procesamiento de imágenes.

## Flujo

1. Recibir el identificador del animal.
2. Recibir opcionalmente un estilo o una animación.
3. Validar los valores contra catálogos permitidos.
4. Cargar la matriz y su paleta de colores.
5. Convertir las celdas visibles en declaraciones `box-shadow`.
6. Entregar el resultado necesario para renderizar la figura en el navegador.

## Generación CSS

- Utilizar una celda base cuadrada, por ejemplo `width: 6px` y `height: 6px`.
- Traducir una celda en columna `x` y fila `y` a desplazamientos calculados a partir del tamaño de píxel.
- Omitir las celdas transparentes al construir `box-shadow`.
- Mantener los colores definidos por el patrón; no aceptar colores CSS arbitrarios sin validación.
- Generar salida determinista: el mismo patrón, escala y estilo deben producir el mismo CSS.
- Evitar estilos inline adicionales cuando una clase o una respuesta estructurada sea suficiente.

## Validación y seguridad

- Aceptar únicamente identificadores conocidos para animales, estilos y animaciones.
- No construir rutas de archivos directamente con valores recibidos del cliente.
- Escapar cualquier valor que llegue a HTML y definir el tipo de contenido correcto en respuestas JSON.
- Responder con códigos HTTP apropiados: `400` para parámetros inválidos, `404` para patrones inexistentes y `500` para errores internos.
- No exponer rutas internas, trazas, secretos ni detalles sensibles en producción.

## Diseño

- Mantener la lógica de patrones independiente del controlador o endpoint HTTP.
- Mantener una única representación canónica para cada patrón.
- No añadir base de datos, framework PHP o sistema de caché hasta que exista una necesidad concreta del MVP.
- Documentar el contrato de cualquier endpoint cuando sea incorporado.
