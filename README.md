# Pixel Art 👾

[![forthebadge](http://forthebadge.com/images/badges/made-with-javascript.svg)](https://www.linkedin.com/in/drphp/)
[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](https://www.linkedin.com/in/drphp/)

<a href="https://www.instagram.com/amvsoft.tech/">
  <img src="https://cdn.dribbble.com/userupload/45144748/file/01d86655ce850b259809348ec45c0196.png?resize=1200x900&vertical=center" alt="Instagram" width="600">
</a>

## Pixel Fauna

Pixel Fauna genera ilustraciones Pixel Art desde patrones de animales o imágenes subidas por el usuario. Los resultados se pueden previsualizar y exportar como CSS `box-shadow`.

### Funcionalidades

- Catálogo de criaturas con patrones definidos por matriz y paleta.
- Carga de imágenes PNG, JPG, GIF y WebP, hasta 10 MB.
- Eliminación de fondo local con `rembg`; los archivos no se envían a proveedores externos.
- Conversión de la imagen recortada a una cuadrícula con Pillow, paleta configurable y dithering Floyd–Steinberg.
- Ajustes de resolución y cantidad de colores.
- Vista del recorte original transparente y vista pixelada.
- Copia del CSS generado cuando se está en modo Pixel Art.
- Eliminación rápida de fondo blanco como alternativa si el servicio de IA no está disponible.

## Arquitectura

```text
Navegador ── PHP/Apache ── servicio Python local
    │                           ├── rembg: elimina el fondo
    │                           └── Pillow: recorta y cuantiza
    └── renderiza las celdas como CSS box-shadow
```

El servicio Python mantiene el modelo cargado para reutilizarlo entre solicitudes. Los endpoints PHP validan la carga y actúan como proxy hacia `127.0.0.1`; la conversión a `box-shadow` y el renderizado final siguen en el navegador.

### Requisitos

- Apache 2.4 con PHP 8.0 o superior.
- Extensiones PHP `curl` y `fileinfo` habilitadas.
- Python 3.13. `rembg` no soporta actualmente Python 3.14.
- Windows PowerShell para los scripts de instalación incluidos.

## Instalación local

1. Clona o copia el proyecto dentro del directorio servido por Apache.
2. Si aún no existe el archivo local de configuración, créalo desde PowerShell en la raíz del proyecto:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Instala Python 3.13. Desde una terminal PowerShell, entra en `python_service` y crea el entorno virtual e instala `rembg`:

   ```powershell
   .\setup.ps1
   ```

4. Inicia el servicio Python y deja esa terminal abierta:

   ```powershell
   .\run.ps1
   ```

   En el primer arranque se descargan los pesos del modelo `u2netp`; los siguientes arranques reutilizan la caché local.

5. Inicia Apache y abre la URL local correspondiente, por ejemplo:

   ```text
   http://localhost/pixel-css-new-year/
   ```

No abras `index.html` mediante `file://`: la interfaz necesita los endpoints PHP. Si Apache limita el tamaño de POST, configura `upload_max_filesize` y `post_max_size` en PHP a un valor de al menos `12M`.

### Configuración (`.env`)

`.env` es la configuración local y está excluido de Git. `.env.example` contiene la plantilla compartible. PHP y Python leen el mismo archivo; las variables de entorno del proceso tienen precedencia sobre sus valores.

| Variable | Valor inicial | Uso |
| --- | --- | --- |
| `PYTHON_SERVICE_URL` | `http://127.0.0.1:8765` | URL base del servicio Python. Debe usar loopback. |
| `PYTHON_HEALTH_PATH` | `/health` | Ruta de comprobación del servicio. |
| `PYTHON_REMOVE_BACKGROUND_PATH` | `/remove-background` | Ruta para quitar el fondo. |
| `PYTHON_PIXELATE_PATH` | `/pixelate` | Ruta para generar la cuadrícula de píxeles. |
| `PYTHON_CONNECT_TIMEOUT` | `2` | Tiempo máximo para conectar PHP con Python, en segundos. |
| `PYTHON_REMOVE_BACKGROUND_TIMEOUT` | `120` | Tiempo máximo para eliminar el fondo. |
| `PYTHON_PIXELATE_TIMEOUT` | `30` | Tiempo máximo para cuantizar la imagen. |
| `REMBG_MODEL` | `u2netp` | Modelo cargado por `rembg`. |

Al cambiar el puerto de `PYTHON_SERVICE_URL`, Python lo usa para enlazar su servidor y PHP construye los endpoints a partir de esa URL. Al cambiar las rutas, actualiza las variables correspondientes; reinicia Python para aplicar su configuración. `u2netp` prioriza tamaño y velocidad; otros modelos pueden requerir más descarga, memoria y tiempo.

No añadas claves privadas ni credenciales a `.env`: en esta instalación Apache no permite reglas `.htaccess` y el archivo contiene solo configuración local no secreta. Para desplegarlo en un servidor, configura la denegación de archivos `.env` en el VirtualHost de Apache o usa variables de entorno del sistema.

## Flujo de una imagen

1. El navegador valida el tipo y el tamaño del archivo.
2. `backend/remove-background.php` valida la carga y envía los bytes al servicio Python local.
3. `rembg` devuelve un PNG con transparencia.
4. `backend/pixelate-image.php` envía el PNG junto con los ajustes de resolución y colores.
5. Pillow recorta los márgenes transparentes, conserva la proporción, reduce con LANCZOS, limita la paleta y aplica dithering Floyd–Steinberg.
6. El navegador convierte cada píxel visible en una sombra CSS.

Los controles permiten alternar entre **Vista normal, sin efecto pixel** y la imagen pixelada. La copia de CSS queda deshabilitada en vista normal. Al cambiar resolución o colores se reutiliza el PNG ya procesado, sin volver a ejecutar la eliminación de fondo.

Si la IA local no responde y está habilitado el respaldo, el frontend intenta quitar el blanco conectado a los bordes y aplica su cuantización local.

## Endpoints

| Endpoint | Método y entrada | Respuesta |
| --- | --- | --- |
| `backend/generate.php` | `GET`; opcionalmente `?animal=<id>` | Catálogo JSON o dimensiones, paleta CSS `box-shadow` y metadatos del patrón. |
| `backend/remove-background.php` | `POST multipart/form-data`, campo `image` | PNG RGBA procesado por `rembg`. |
| `backend/pixelate-image.php` | `POST multipart/form-data`: `image`, `resolution` (16–48), `colors` (4–16) | PNG transparente reducido y cuantizado. |
| Servicio Python `/health` | `GET` en loopback | Estado de disponibilidad. |
| Servicio Python `/remove-background` | `POST` con bytes de imagen | PNG RGBA. |
| Servicio Python `/pixelate` | `POST` con bytes; query `resolution` y `colors` | PNG RGBA de la cuadrícula. |

Los proxies PHP aceptan PNG, JPG, GIF y WebP hasta 10 MB. Los errores responden con un estado HTTP adecuado y un cuerpo JSON.

## Estructura del proyecto

```text
.
├── .env.example                 # Plantilla de configuración
├── .gitignore                   # Excluye .env y el entorno virtual
├── .ia-context/                 # Estándares y reglas del proyecto
├── backend/
│   ├── config.php               # Carga .env y construye endpoints Python
│   ├── generate.php             # Catálogo y CSS box-shadow de animales
│   ├── patterns.php             # Matrices y paletas de los animales
│   ├── pixelate-image.php       # Validación y proxy de cuantización
│   └── remove-background.php    # Validación y proxy de rembg
├── css/style.css                # Estilos responsive
├── index.html                   # Interfaz
├── js/script.js                 # Catálogo, carga, previsualización y exportación
├── python_service/
│   ├── remove_bg_service.py     # Servicio local rembg + Pillow
│   ├── requirements.txt         # Dependencias Python
│   ├── setup.ps1                # Creación del entorno e instalación
│   └── run.ps1                  # Inicio del servicio
└── resources/                   # Logo y recursos visuales
```

## Añadir un patrón de animal

Edita `backend/patterns.php` y agrega una entrada con identificador, nombre, emoji, paleta y matriz. Usa `.` para una celda transparente y declara en la paleta todos los demás símbolos. Las filas pueden tener diferente longitud: PHP completa las cortas con transparencia. Puedes asignar `pixelSize` para cambiar la escala.

La interfaz muestra rana, unicornio, narval y elefante. Los otros patrones que permanecen en el catálogo del backend no aparecen en el selector.

## Validación local

```powershell
node --check js\script.js
php -l backend\config.php
php -l backend\generate.php
php -l backend\remove-background.php
php -l backend\pixelate-image.php
.\python_service\.venv\Scripts\python.exe -m py_compile python_service\remove_bg_service.py
```

Con el servicio Python activo, verifica su estado:

```powershell
Invoke-WebRequest http://127.0.0.1:8765/health
```

## Dependencias

PHP no requiere Composer. El servicio Python instala `rembg[cpu]`; Pillow llega como dependencia de `rembg` y se usa para preparar la cuadrícula pixelada.
