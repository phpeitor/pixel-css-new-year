# Pixel Art 👾

[![forthebadge](http://forthebadge.com/images/badges/made-with-javascript.svg)](https://www.linkedin.com/in/drphp/)
[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](https://www.linkedin.com/in/drphp/)

<a href="https://www.instagram.com/amvsoft.tech/">
  <img src="https://cdn.dribbble.com/userupload/45144748/file/01d86655ce850b259809348ec45c0196.png?resize=1200x900&vertical=center" alt="Instagram" width="600">
</a>

## Funcionamiento

1. Para animales, PHP carga una matriz de `backend/patterns.php` y la convierte en CSS `box-shadow`.
2. Para imágenes, PHP valida el archivo y lo pasa al servicio local de Python.
3. Python ejecuta `rembg` con el modelo `u2netp` y devuelve un PNG transparente.
4. Python recorta el espacio transparente, reduce con LANCZOS, cuantiza la paleta con Pillow y aplica dithering Floyd–Steinberg.
5. El navegador convierte la pequeña imagen resultante a sombras CSS.

## Requisitos

- PHP 8.0 o superior.
- Un servidor web como Apache.
- Python 3.13 para eliminación de fondo con IA (opcional).

## Uso local

Sirve el directorio desde Apache y abre la URL correspondiente, por ejemplo:

```text
http://localhost/pixel-css-new-year/
```

No abras `index.html` directamente mediante `file://`, ya que el frontend necesita consultar el endpoint PHP.

## Eliminación de fondo con IA

La app procesa imágenes mediante un servicio local, sin enviar archivos a un proveedor externo. Mantén el servicio Python en ejecución en una terminal mientras usas Apache.

La configuración compartida está en `.env` (plantilla: `.env.example`). PHP y Python leen el mismo archivo. Cambia `PYTHON_SERVICE_URL` para usar otro puerto local y ajusta los paths, timeouts o modelo según necesites. El archivo `.env` está excluido de Git y solo contiene ajustes locales no secretos; no guardes claves privadas ahí bajo el Apache actual.

Al clonar el proyecto por primera vez, crea tu configuración local con `Copy-Item .env.example .env` desde PowerShell. El repositorio trae valores por defecto si el archivo aún no existe.

1. Instala Python 3.13; `rembg` no es compatible actualmente con Python 3.14.
2. Abre PowerShell en `python_service` y crea el entorno e instala dependencias:

   ```powershell
   .\setup.ps1
   ```

3. En la misma carpeta, inicia el servicio:

   ```powershell
   .\run.ps1
   ```

En el primer inicio se descargan los pesos del modelo `u2netp`; quedan en la caché local para los siguientes usos. El servicio solo escucha en `127.0.0.1:8765`. Si no está disponible, la app usa el borrado rápido de fondo blanco cuando la opción de respaldo está activa.

En los controles de imagen se puede activar **Vista normal, sin efecto pixel** para inspeccionar el PNG recortado antes de pixelarlo. En ese modo se desactiva la copia de CSS hasta volver a la vista pixelada.

La conversión usa la biblioteca Pillow, ya instalada como dependencia de `rembg`: recorta el contenido transparente para aprovechar la cuadrícula, conserva la proporción, limita la paleta solicitada y distribuye tonos con dithering Floyd–Steinberg. Si falla este endpoint, el frontend conserva una cuantización local de respaldo.

Para cambiar el modelo, modifica `REMBG_MODEL` en `.env` y reinicia `run.ps1`. `u2netp` es la opción ligera usada por defecto; modelos más pesados pueden mejorar los bordes a cambio de espacio y tiempo.

Contrato de proxies PHP: `POST backend/remove-background.php` con un campo multipart `image` y `POST backend/pixelate-image.php` con `image`, `resolution` y `colors`. Ambos aceptan PNG/JPG/GIF/WebP de hasta 10 MB y responden con `image/png`; los errores se devuelven como JSON con un estado HTTP adecuado. El servicio Python interno ofrece `GET /health`, `POST /remove-background` y `POST /pixelate` en loopback.

## Estructura

- `index.html`: interfaz del generador.
- `css/style.css`: diseño responsive y renderizado del píxel base.
- `js/script.js`: catálogo, selección y actualización de la previsualización.
- `backend/generate.php`: endpoint que valida la selección y genera `box-shadow`.
- `backend/remove-background.php`: valida la carga y hace de proxy local al servicio Python.
- `backend/pixelate-image.php`: valida opciones de resolución/paleta y hace de proxy para Pillow.
- `backend/config.php`: carga valores comunes desde `.env`.
- `backend/patterns.php`: catálogo de matrices y paletas.
- `python_service/remove_bg_service.py`: servidor local persistente para `rembg`.
- `resources/fondo.mp4`: fondo de video de la interfaz.

## Añadir un animal

Añade una entrada a `backend/patterns.php` con un identificador, nombre, emoji, paleta y matriz rectangular. Usa `.` para las celdas transparentes y asegúrate de declarar en la paleta todos los demás símbolos. Puedes definir `pixelSize` para ajustar la escala de patrones más detallados.

El catálogo actual incluye perro, gato, zorro, panda, rana, unicornio, narval, ballena, elefante y tigre.

## Dependencias

El MVP no usa paquetes externos de PHP, por lo que no necesita `composer.json` ni `composer install`. Composer solo se incorporará cuando exista una dependencia real que lo justifique.
