# Manuales del usuario de CONTROL MAX

Esta carpeta tiene los manuales del usuario de cada módulo. El sistema los lee directamente de acá: para corregir un manual no hace falta tocar el código de ningún módulo.

## Qué hay en la carpeta
| Archivo | Para qué sirve |
|---|---|
| `manual.js` | El panel "📖 Manual" (índice, buscador, preguntas, PDF). Es el mismo para todos los módulos. |
| `trace.md`, `plus.md` | El texto del manual de cada módulo (CONTROL TRACE, CONTROL PLUS). Después se suman `docs.md`, `agro.md`, etc. |
| `img/trace/`, `img/plus/` | Las capturas (`.png`) y los esquemas (`.svg`) de cada manual. |
| `pdf/` | El PDF de cada manual, listo para imprimir o para capacitar. |

## Cómo corregir un texto
1. En GitHub, abrí el archivo del módulo (por ejemplo `trace.md`) y tocá el lápiz ✎.
2. Corregí el texto y guardá con "Commit changes".
3. En un par de minutos, Vercel lo publica y el manual ya se ve corregido dentro del sistema. La IA también responde con el texto nuevo (tarda hasta 10 minutos).

## Reglas del formato
- `## Título` empieza un **tema**. Justo abajo va la línea con sus datos, que no se ve en pantalla:
  `<!-- id: remitos | grupo: Administración | pantalla: ent | roles: admin, supervisor, comercial | resumen: … -->`
  - `id`: nombre corto y único del tema, **no lo cambies** (lo usan los enlaces y la IA).
  - `pantalla`: el código de la pantalla del sistema donde se abre este tema solo. Puede haber varias, separadas por coma.
    En los módulos con pestañas (como PLUS) se escribe sección>pestaña, por ejemplo `ventas>tv-cob` o `compras>tc-pag>tcp-comis`. Si una pantalla figura en varios temas, se abre el que la indica de forma más precisa (y, a igualdad, el primero).
  - `roles`: quién lo usa (`todos`, o una lista).
- `### Subtítulo` divide el tema en partes.
- `1.` `2.` `3.` son pasos numerados. `-` es una lista común. Las sub-listas van con dos espacios adelante.
- `**texto**` va en negrita. Usalo para los nombres de botones y campos.
- `> 💡 …` es un consejo, `> ⚠️ …` una advertencia y `> 🔒 …` algo que pide PIN.
- `![Descripción](img/trace/archivo.png)` inserta una imagen.
- `[texto](#id-del-tema)` es un enlace a otro tema.
- Los ejemplos tienen que ser genéricos: nada de clientes, proveedores ni datos reales de una empresa.

## Cuando sale una versión nueva de un módulo
Cada entrega de una versión nueva incluye también el manual actualizado:
1. El `.md` corregido, con la `version:` nueva en el encabezado.
2. Las capturas nuevas o rehechas de las pantallas que cambiaron.
3. El PDF regenerado (`pdf/manual_<modulo>_<versión>.pdf`). Podés borrar el PDF de la versión anterior.

Si cambia `manual.js`, en `cmax-top.js` se sube el número `?v=` de `MANUAL_JS`, así los navegadores no usan la copia vieja.

## Sumar el manual de otro módulo
1. Se escribe `<modulo>.md` y sus imágenes en `img/<modulo>/`.
2. En `manual.js` se agrega el módulo a la lista `MODULOS`.
3. En `cmax-top.js` se agrega a `CON_MANUAL`. Con eso aparece el botón 📖 en ese módulo.
