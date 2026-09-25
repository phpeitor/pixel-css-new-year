# Roles de Agentes - Generador CSS Pixel Art

## Analista

- Revisar la implementación existente antes de proponer cambios.
- Separar el alcance confirmado del MVP de ideas para versiones futuras.
- No introducir IA, procesamiento de imágenes ni generación automática desde fotografías.
- Mantener como flujo principal: selección del animal, estilo o animación opcional, generación CSS y renderizado en el navegador.

## Backend PHP

- Obtener y validar el patrón solicitado desde un catálogo controlado por la aplicación.
- Convertir cada celda visible de la matriz en una coordenada y un color para `box-shadow`.
- Devolver respuestas predecibles y errores claros para animales, estilos o animaciones no admitidos.
- Mantener separadas la definición del patrón y la lógica que genera CSS.

## Frontend

- Implementar una interfaz responsive y accesible para seleccionar el animal y las opciones disponibles.
- Renderizar el resultado con HTML y CSS, principalmente mediante píxeles cuadrados en `box-shadow`.
- Preservar el estilo visual pixel art del proyecto y reutilizar sus recursos cuando corresponda.
- Evitar dependencias innecesarias para las interacciones básicas del MVP.

## Contenido Pixel Art

- Crear y revisar patrones legibles, consistentes y fáciles de ampliar.
- Usar una paleta explícita y distinguir las celdas transparentes de los píxeles visibles.
- Incluir inicialmente animales como perro, gato, zorro, panda, rana, unicornio, narval y ballena según se implementen.
- Comprobar que cada patrón conserva su silueta en diferentes tamaños de píxel.

## QA

- Probar el flujo completo desde la selección hasta el renderizado.
- Verificar patrones, colores, escala y ausencia de píxeles desplazados.
- Revisar escritorio, móvil, navegación por teclado y mensajes de error.
- Confirmar que el CSS generado sea válido y no incluya datos proporcionados por el usuario sin escapar.
