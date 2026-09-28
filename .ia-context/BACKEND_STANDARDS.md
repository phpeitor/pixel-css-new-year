# Estándares Backend - Generador CSS Pixel Art

## Objetivo

El backend PHP resuelve patrones de animales y convierte matrices a CSS. Para imágenes, valida las cargas y delega la eliminación de fondo a un servicio Python local persistente; PHP no ejecuta inferencia de IA.

## Flujo

1. Recibir el identificador del animal.
2. Recibir opcionalmente un estilo o una animación.
3. Validar los valores contra catálogos permitidos.
4. Cargar la matriz y su paleta de colores.
5. Convertir las celdas visibles en declaraciones `box-shadow`.
6. Entregar el resultado necesario para renderizar la figura en el navegador.

Para imágenes:

1. Validar método, tamaño, tipo MIME y error de carga en `backend/remove-background.php`.
2. Enviar los bytes al servicio enlazado únicamente a `127.0.0.1`.
3. Devolver PNG con transparencia; nunca exponer trazas o rutas internas.
4. Mantener el modelo cargado en memoria en el proceso Python; no iniciar Python por cada solicitud PHP.
5. Cuantizar en `/pixelate` con Pillow: recortar alfa vacío, preservar proporción, limitar la paleta solicitada y retornar una cuadrícula PNG con transparencia.

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
- Mantener el endpoint en `backend/generate.php` y el catálogo en `backend/patterns.php`.
- No añadir base de datos, framework PHP, paquetes de Composer o sistema de caché hasta que exista una necesidad concreta del MVP.
- Documentar el contrato de cualquier endpoint cuando sea incorporado.
- Limitar el servicio de visión a loopback; no exponerlo a la red ni permitir URLs arbitrarias de entrada.
