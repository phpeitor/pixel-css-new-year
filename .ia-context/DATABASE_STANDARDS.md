# Estándares de Datos - Patrones Pixel Art

## Alcance

El MVP no requiere una base de datos. Los animales y sus patrones pueden almacenarse en archivos o estructuras PHP versionadas en el repositorio. Una base de datos solo se incorporará si aparece una necesidad concreta de administración o persistencia dinámica.

## Modelo de patrón

Cada patrón debe definir como mínimo:

- Un identificador único y estable del animal, por ejemplo `gato` o `narval`.
- Un nombre visible en español.
- Una matriz rectangular de filas y columnas.
- Una paleta que relacione símbolos o valores con colores CSS válidos.
- Un valor inequívoco para las celdas transparentes.
- Metadatos opcionales para estilos o animaciones compatibles.

Ejemplo conceptual:

```php
[
    'id' => 'gato',
    'nombre' => 'Gato',
    'paleta' => ['N' => '#222222', 'B' => '#ffffff'],
    'matriz' => [
        '..N.N..',
        '.NBBBN.',
        'NBBBBBN',
    ],
]
```

## Reglas

- Todas las filas de una matriz deben tener la misma longitud.
- Cada símbolo visible debe existir en la paleta.
- Los colores deben expresarse en un formato CSS validado y consistente, preferentemente hexadecimal.
- No duplicar coordenadas ni almacenar manualmente el mismo patrón como matriz y como `box-shadow`.
- La matriz es la fuente de verdad; el CSS debe generarse a partir de ella.
- Los identificadores no deben depender del texto visible ni contener rutas de archivo.
- Mantener los patrones pequeños y legibles para facilitar revisión y cambios.

## Catálogo inicial

El catálogo objetivo contempla perro, gato, zorro, panda, rana, unicornio, narval y ballena. Un animal solo debe mostrarse como disponible cuando su patrón esté implementado y validado.
