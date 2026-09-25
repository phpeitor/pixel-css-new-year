# Pixel Fauna

MVP de generación de animales Pixel Art con matrices PHP y CSS `box-shadow`.

## Funcionamiento

1. El navegador solicita a `backend/generate.php` el catálogo de animales.
2. El usuario selecciona un animal desde la lista de emojis.
3. PHP carga su matriz desde `backend/patterns.php`.
4. Cada celda visible se convierte en una sombra CSS.
5. El navegador renderiza el resultado sin imágenes ni `canvas`.

## Requisitos

- PHP 8.0 o superior.
- Un servidor web como Apache.

## Uso local

Sirve el directorio desde Apache y abre la URL correspondiente, por ejemplo:

```text
http://localhost/pixel-css-new-year/
```

No abras `index.html` directamente mediante `file://`, ya que el frontend necesita consultar el endpoint PHP.

## Estructura

- `index.html`: interfaz del generador.
- `css/style.css`: diseño responsive y renderizado del píxel base.
- `js/script.js`: catálogo, selección y actualización de la previsualización.
- `backend/generate.php`: endpoint que valida la selección y genera `box-shadow`.
- `backend/patterns.php`: catálogo de matrices y paletas.
- `resources/fondo.mp4`: fondo de video de la interfaz.

## Añadir un animal

Añade una entrada a `backend/patterns.php` con un identificador, nombre, emoji, paleta y matriz rectangular. Usa `.` para las celdas transparentes y asegúrate de declarar en la paleta todos los demás símbolos. Puedes definir `pixelSize` para ajustar la escala de patrones más detallados.

## Dependencias

El MVP no usa paquetes externos de PHP, por lo que no necesita `composer.json` ni `composer install`. Composer solo se incorporará cuando exista una dependencia real que lo justifique.
