<!--
manual: docs
modulo: CONTROL DOCS
version: v4.2
actualizado: 2026-10-29
sugerencias: ¿Cómo publico un pedido en el muro?; ¿Cómo dejo una TV del galpón mostrando el tablero?; ¿Cómo sé quién leyó un documento?; ¿Qué significa la carita del tablero?
-->
# Manual del usuario · CONTROL DOCS

CONTROL DOCS es el **muro de documentos** de CONTROL MAX: muestra a cada persona los pedidos y las órdenes de producción que necesita para trabajar, **sin precios**, y deja registrado quién los leyó. También tiene el **tablero de cumplimiento del plan** y un **modo pantalla** para dejarlo fijo en una TV del galpón.

Los ejemplos usan una empresa de demostración: los nombres, productos y números son ficticios.

## Qué es CONTROL DOCS y quién lo usa
<!-- id: introduccion | grupo: Primeros pasos | roles: todos | resumen: El muro, el tablero, el modo pantalla y quién publica -->
### Las secciones
| Sección | Para qué sirve | Quién la ve |
|---|---|---|
| 📌 Muro | Los documentos publicados para tu rol | Todos los que entran a DOCS |
| 🏆 Tablero del plan | Plan del día contra lo producido, por línea | Todos los que entran a DOCS |
| 📺 Modo pantalla | Mostrar el muro o el tablero en una TV, en grande | Todos los que entran a DOCS |
| 📤 Publicar | Elegir pedidos u órdenes y publicarlos en el muro | Quienes publican |
| 🗂️ Publicaciones | Republicar, retirar, ver lecturas e historial | Quienes publican |

### Quién publica
- El **Administrador** y el **Dueño** publican siempre.
- De entrada también publica el **Supervisor**. El administrador puede sumar o quitar roles en **Configuración → Roles y permisos → CONTROL DOCS: quién publica**.
- Abajo a la izquierda, debajo de tu nombre, dice tu rol y, si podés publicar, "· publica".

### De dónde salen los documentos
- Los **pedidos** se cargan en TRACE o en PLUS. En DOCS se publican como una **foto sin precios**: cliente, fecha de entrega, orden de compra, productos, unidades y cajas.
- Las **órdenes de producción** salen de los **planes de producción** de TRACE: solo productos y cantidades a producir, y la línea si la empresa trabaja con líneas.

> 💡 Una publicación es una **foto**: si después se edita el pedido o el plan, el muro sigue mostrando lo que se publicó, y a quien publica le aparece el aviso **⚠ cambió** para republicarlo.

![Vida de un documento en el muro](img/docs/ciclo.svg)

## El muro
<!-- id: muro | grupo: Primeros pasos | pantalla: muro | roles: todos | resumen: Ver los documentos publicados para tu rol y filtrarlos -->
![Muro de documentos](img/docs/muro.png)

Cada tarjeta es un documento: el tipo (📋 Pedido o 🗓️ Orden de producción), el número, el cliente o el día de producción, la fecha de entrega y los totales. Tocá una tarjeta para abrirla en grande (ver [Leer un documento](#visor)).

### Filtros
- **Todos / 📋 Pedidos / 🗓️ Órdenes de producción**.
- **Hoy / Mañana / Próximos / Todas**: según la fecha de entrega. *Próximos* muestra de hoy en adelante.
- **Todas las líneas / 🏭 Línea…**: aparece si la empresa trabaja con líneas de producción.

### Las etiquetas de cada tarjeta
| Etiqueta | Qué significa |
|---|---|
| 🆕 Nuevo | Todavía no lo leíste |
| 🔄 Actualizado | Lo leíste, pero se publicó una versión nueva |
| ✅ Visto | Ya leíste la versión actual |
| v1, v2… | Número de versión y cuándo se publicó |
| Para: … | Para qué roles se publicó (solo lo ve quien publica) |
| ⚠ cambió | El pedido o plan original cambió después de publicarlo (solo lo ve quien publica) |

> 💡 El número al lado de **📌 Muro** en el menú cuenta los documentos que **todavía no leíste**. El muro se actualiza solo cada minuto; con **🔄 Actualizar** lo traés en el momento.

Arriba del muro aparece **🏆 Tablero de hoy** con la carita de cada línea. Tocalo para ir al [tablero](#tablero).

## Leer un documento y confirmar la lectura
<!-- id: visor | grupo: Primeros pasos | pantalla: muro | roles: todos | resumen: Abrir en grande, agrandar la letra, imprimir y marcar como leído -->
![Documento abierto en grande](img/docs/visor.png)

1. En el muro, tocá la tarjeta del documento.
2. Se abre en grande. Arriba tenés:
   - **A−** y **A+**: achicar o agrandar la letra.
   - **⛶ Pantalla completa**.
   - **🖨️ Imprimir**.
   - **✕ Cerrar** (o la tecla Esc).
3. Abajo, tocá **✅ Leí este documento**. Queda registrado con tu nombre, la fecha y la versión, y la tarjeta pasa a **✅ Visto**.

> ⚠️ Si se publica una **versión nueva**, la tarjeta vuelve a marcarse (🔄 Actualizado) y hay que confirmar la lectura otra vez.

## Tablero de cumplimiento del plan
<!-- id: tablero | grupo: Producción | pantalla: tablero | roles: todos | resumen: Plan del día contra lo producido, caritas y ranking entre líneas -->
![Tablero de cumplimiento del plan](img/docs/tablero.png)

El tablero **se arma solo**: compara el **plan de producción** de cada día (cargado en TRACE) con lo **producido** ese día, por línea. Se actualiza cada minuto.

### Cómo se lee
- Cada producto del plan tiene su **semáforo**:
  - 🟢 **Cumplido**: llegó al 100% o más.
  - 🟡 **+50%**: entre el 50% y el 99%.
  - 🔴 **−50%**: menos del 50%.
- **Total de la línea**: lo planificado, lo producido y el porcentaje.
- **Objetivo diario cumplido**: la carita de cada día de la semana (de lunes a sábado).
  - 😊 **Carita feliz**: todos los productos del plan llegaron al 100%.
  - ☹️ El día terminó sin cumplir el plan.
  - 😐 El día está en curso.
  - Círculo punteado: día sin plan o que todavía no empezó. No cuenta para la semana.
- Al costado, un mensaje de ánimo o de felicitación y cuántas caritas felices lleva la línea en la semana.
- Si hay varias líneas, arriba aparece el **ranking** de la semana; la línea que va primera lleva 🏆.

### Moverse por el tablero
- **◀ ▶**: semana anterior o siguiente. **Esta semana** vuelve a la actual.
- Los botones **LUN … SÁB** eligen el día.
- **Todas las líneas / 🏭 Línea…**: ver una sola línea.
- **📺 Modo pantalla**: para mostrarlo en la TV (ver [Modo pantalla](#pantalla)).

> 💡 Para que el tablero funcione, el plan del día tiene que estar cargado en TRACE (Plan de producción) y las producciones registradas con la fecha de ese día.

## Registrar una observación del día
<!-- id: observacion | grupo: Producción | pantalla: tablero | roles: admin, supervisor | resumen: Causas, detalle y oportunidad de mejora cuando el plan no se cumple -->
![Observación del día](img/docs/observacion.png)

Cuando una línea no cumple el plan, quien publica puede dejar registrado **qué pasó** y **qué hacer la próxima vez**.

1. En el tablero, elegí el día y tocá **📝 Registrar observación** en la línea.
2. En **¿Qué pasó?**, marcá una o varias causas: MP con mucho descarte o mala calidad, faltó materia prima, faltó personal, faltaron insumos o envases, falla de máquina, corte de luz o servicios, cambio de prioridades, otra causa.
3. Escribí el **Detalle** (opcional).
4. En **💡 Oportunidad de mejora**, escribí la acción para la próxima vez (opcional).
5. Tocá **Guardar**.

Queda registrado con tu nombre y se ve en el tablero y en **📝 Observaciones de la semana**, al pie del tablero, con un resumen de las causas más repetidas. En la TV se muestra la causa, no la oportunidad de mejora.

### Corregir la carita de un día
Si el plan se cumplió igual aunque los números no lo muestren (por ejemplo, se cambió un producto por otro), abrí **Carita del día** dentro de la observación y elegí **😊 Carita feliz** o **☹️ No se cumplió**. Con **🤖 Automático** vuelve a calcularse sola. El día queda marcado con ✏️.

## Modo pantalla para la TV del galpón
<!-- id: pantalla | grupo: Pantalla | pantalla: pantalla | roles: todos | resumen: Mostrar documentos y tablero en grande, en rotación -->
![Configuración del modo pantalla](img/docs/pantalla.png)

Muestra los documentos publicados y/o el tablero en grande, uno tras otro y sin menú. Si un documento no entra en la pantalla, lo parte en páginas. Se actualiza solo cada minuto y la pantalla no se apaga.

### Paso a paso
1. Tocá **📺 Modo pantalla** en el menú.
2. Elegí:
   - **Tablero de cumplimiento 🏆**: *No, solo documentos*, *Documentos + tablero* o *Solo el tablero*.
   - **Qué documentos**: pedidos y órdenes, solo pedidos o solo órdenes.
   - **Línea de producción**: todas, o una sola (cada TV puede mostrar su línea).
   - **Entregas de**: hoy, hoy y mañana, u hoy en adelante.
   - **Segundos por página** y **Tamaño de letra**.
3. Tocá **▶ Iniciar modo pantalla**.

![Un documento en la TV](img/docs/tv.png)

En pantalla: **→ / ←** pasan de documento, **espacio** pausa y **Esc** sale. Con el mouse aparecen los botones **◀ ⏯ ▶** y **✕ Salir**.

### Dejarlo fijo en una TV
1. En la TV (o la PC conectada a la TV) entrá a CONTROL MAX con un **usuario propio para la pantalla**. Conviene crearlo en **Configuración → Usuarios** con rol **Preparador**, así ve lo mismo que el galpón.
2. Copiá la dirección que aparece en **Para dejarlo fijo en una TV** (**📋 Copiar**) y guardala en la TV como favorito o página de inicio. Arranca sola en modo pantalla con la configuración elegida.
3. La primera vez, tocá la pantalla una vez para que pase a pantalla completa (el navegador lo exige).

> 💡 Lo que se ve en la TV **no cuenta como lectura** de nadie.

## Publicar un pedido o una orden de producción
<!-- id: publicar | grupo: Publicar | pantalla: publicar | roles: admin, supervisor | resumen: Elegir el documento, para qué roles y hasta cuándo se ve -->
![Publicar documentos](img/docs/publicar.png)

### Paso a paso
1. Tocá **📤 Publicar** en el menú.
2. Arriba elegí **📋 Pedidos (sin valores)** o **🗓️ Órdenes de producción**.
   - Pedidos: se listan los pendientes y los de los últimos 30 días. Podés filtrar por **Cliente**, por **N° de pedido** y tildar **Incluir entregados**.
   - Órdenes: se listan los planes de producción guardados en TRACE, con su línea, día de producción, entrega, cantidad de productos y si el plan está **Confirmado** o **Proyectado**.
3. Tocá la fila del documento. La columna **En DOCS** muestra si ya está publicado y en qué versión.
4. Opcional: **👁 Vista previa** muestra exactamente cómo lo va a ver la gente.
5. Tocá **📤 Publicar**.
6. En **¿Quién lo ve?**, dejá **Todos los roles** o destildalo y elegí los roles.
7. Revisá **Visible hasta**: por defecto, el día siguiente a la entrega. Después pasa a *Vencido* y deja de verse en el muro.
8. Tocá **📤 Publicar**. Aparece "Publicado en el muro ✓".

![Elegir quién lo ve](img/docs/publicar-modal.png)

> 💡 Los administradores y quienes publican ven todos los documentos, sin importar los roles elegidos.

> ⚠️ Las órdenes de un plan sin productos a producir no se pueden publicar.

## Gestionar las publicaciones
<!-- id: publicaciones | grupo: Publicar | pantalla: publicaciones | roles: admin, supervisor | resumen: Republicar, retirar, ver quién leyó y el historial de versiones -->
![Publicaciones](img/docs/publicaciones.png)

En **🗂️ Publicaciones** está todo lo publicado. Se filtra por estado (**Publicadas**, **Vencidas**, **Retiradas**, **Todas**) y por tipo. Las que cambiaron en su origen aparecen primero, con **⚠ cambió**, y el número al lado de *Publicaciones* en el menú dice cuántas son.

Tocá una fila y usá los botones de arriba:

### 🔁 Republicar
Cuando se editó el pedido o el plan, tocá **🔁 Republicar (cambió)**. Se saca una foto nueva (v2, v3…), la anterior queda en el historial y a la gente le aparece **🔄 Actualizado** para que la vuelva a leer.

### ✕ Retirar
Saca el documento del muro, por ejemplo si el pedido se reprogramó. Pide un **Motivo**. No se borra: queda en *Retiradas*.

### 👥 Lecturas
Muestra, para la versión actual, quién **✅ Leyó** (con fecha y hora), quién leyó una versión anterior y quién está **⏳ Pendiente**, entre las personas de los roles a los que se publicó.

![Quién leyó un documento](img/docs/lecturas.png)

### 🕘 Historial
Aparece desde la versión 2. Lista todas las versiones con quién y cuándo las publicó; con **👁 Ver** abrís cualquiera de ellas.

> 💡 Si el pedido o el plan original se borró, la publicación muestra **origen borrado** y ya no se puede republicar; se puede retirar.

## Problemas frecuentes
<!-- id: problemas | grupo: Ayuda | roles: todos | resumen: Mensajes del sistema y qué hacer -->
### No veo un documento que publicaron
- Revisá los filtros del muro (por ejemplo, *Hoy* en lugar de *Próximos*, o una línea elegida).
- Puede estar publicado para otros roles, vencido o retirado. Preguntale a quien lo publicó.

### "Tu rol no tiene acceso a CONTROL DOCS"
Tu rol no tiene DOCS habilitado. Lo habilita el administrador en Configuración → Roles y permisos.

### "CONTROL DOCS no está en el plan de tu empresa"
El módulo no está habilitado en Configuración → Plan y módulos.

### No me aparecen Publicar ni Publicaciones
Tu rol no publica. El administrador lo habilita en Configuración → Roles y permisos → CONTROL DOCS: quién publica.

### El tablero dice "Sin plan de producción para hoy"
Todavía no se cargó el plan del día en TRACE. Cuando se cargue, el tablero aparece solo.

### Aviso "corré … .sql en Supabase"
Falta activar una parte del módulo en la base de datos. Avisale al administrador del sistema.

### La TV no pasa a pantalla completa
El navegador lo exige: tocá la pantalla una vez.
