<!--
manual: plus
modulo: CONTROL PLUS
version: v13.0
actualizado: 2026-10-29
sugerencias: ¿Cómo facturo varios remitos juntos?; ¿Cómo registro una cobranza con cheque?; ¿Cómo cargo una factura de compra desde una foto?; ¿Cómo cierro la caja al final del día?
-->
# Manual del usuario · CONTROL PLUS

CONTROL PLUS es el módulo **administrativo y de facturación** de CONTROL MAX: ventas, factura electrónica, cobranzas, compras, gastos, pagos, caja, banco, inventario y costos.

Trabaja sobre la misma base de datos que CONTROL TRACE: los remitos que se emiten en TRACE se facturan acá, las recepciones de TRACE se cargan como compras, y los productos, materias primas y precios son los mismos en los dos módulos. No hay que sincronizar nada.

Este manual explica cada pantalla paso a paso. Cada tema indica qué roles lo usan. Los ejemplos usan una empresa de demostración: los nombres, productos y números son ficticios.

## Qué es CONTROL PLUS y cómo se conecta con TRACE
<!-- id: introduccion | grupo: Primeros pasos | roles: todos | resumen: Las secciones del módulo y lo que comparte con TRACE -->
![El circuito administrativo de CONTROL PLUS](img/plus/circuito.svg)

### Las secciones del menú
| Sección | Para qué sirve |
|---|---|
| Dashboard | Resumen del mes y lo pendiente para hoy |
| Ventas | Facturas, notas de crédito y débito, presupuestos, pedidos, remitos a facturar, cobranzas, cuentas corrientes y precios |
| Compras | Comprobantes de compra, gastos, remitos de compra, pagos a proveedores, cheques propios, comisiones y cuentas corrientes |
| Entidades | Clientes, proveedores y vendedores |
| Inventario | Fichas de materias primas, productos e insumos, envases, bienes de uso, implementos, costos, stock, ajustes, movimientos y ubicaciones |
| Caja | Apertura, movimientos, cierre y arqueo de cada caja |
| Banco | Cuentas bancarias, movimientos y conciliación con el extracto |
| Configuración | Datos fiscales, puntos de venta, factura de crédito MiPyME y conexión con ARCA |

### Lo que comparte con CONTROL TRACE
- **Pedidos**: es la misma lista. Un pedido cargado en PLUS lo ve TRACE para planificar y armar el remito, y al revés.
- **Remitos**: se emiten en TRACE (ahí se asignan los lotes y se valida la carga). En PLUS se ven con sus precios y se **facturan**.
- **Recepciones**: lo que se recibe en TRACE aparece en PLUS como pendiente de cargar su **comprobante de compra**.
- **Productos, materias primas e insumos**: las fichas se cargan en **Inventario** y las usa TRACE para producir, etiquetar y remitir.
- **Precios por cliente**: los mismos que sugiere el remito de TRACE.
- **Stock y ajustes**: el stock por lote es el mismo; los ajustes de stock se hacen en **Inventario → Ajustes de stock**.

> 💡 Si en una pantalla aparece "Falta un paso en Supabase: corré … .sql", hay una función nueva que todavía no se activó en la base de datos. Avisale al administrador del sistema.

## Moverse por el sistema, listas y filtros
<!-- id: navegacion | grupo: Primeros pasos | roles: todos | resumen: Menú, pestañas, filtros, Excel e impresión -->
![Dashboard de CONTROL PLUS](img/plus/dashboard.png)

### Menú y pestañas
- El **menú de la izquierda** tiene las secciones agrupadas en *Principal*, *Comercial*, *Tesorería* y *Sistema*. En el celular se abre con **☰**.
- Al lado de **Ventas** y **Compras** aparece un número dorado con lo pendiente (por ejemplo, remitos sin facturar o recepciones sin comprobante).
- Cada sección tiene **pestañas** arriba. Algunas pestañas tienen a su vez pestañas internas (por ejemplo, *Cobranzas → Recibos / Cartera de cheques*).
- Arriba al centro está la barra de CONTROL MAX: **🏠 CONTROL MAX** vuelve al portal, **⧉ Nueva pestaña** abre otra pestaña y **📖 Manual** abre este manual (también con **F1**).

### Filtros
Casi todas las listas tienen arriba una fila de filtros: cliente o proveedor, estado, tipo y fechas **Desde / Hasta**. La lista se actualiza sola al cambiar un filtro. El botón **↺** (o *Limpiar*) vuelve los filtros a cero.

### Buscar por código o por nombre
En los campos de cliente, proveedor y artículo podés escribir el **código y apretar Enter**, o buscar por **nombre** (o CUIT) y elegirlo de la lista.

### Exportar e imprimir
- **📥 Excel** descarga la lista tal como la estás viendo, con los filtros aplicados.
- **🖨️** imprime la lista. Si el navegador bloquea la ventana de impresión, permití las ventanas emergentes para el sitio.

### Actualizar
**🔄 Actualizar** (en el Dashboard e Inventario) o **🔄 Sincronizar** (en Remitos y Recepciones) trae lo último cargado por otras personas o desde TRACE.

## Roles, permisos y PIN de supervisor
<!-- id: permisos | grupo: Primeros pasos | roles: todos | resumen: Quién entra a PLUS y qué operaciones piden PIN -->
### Quién entra a PLUS
Por defecto entran a PLUS los roles **Administrador**, **Dueño**, **Administración**, **Supervisor** y **Comercial**. El administrador puede cambiar, en Configuración CONTROL MAX, qué roles entran y qué secciones ve cada uno. Si tocás una sección que tu rol no tiene, aparece "Tu rol no tiene acceso a…".

La sección **Configuración** de PLUS solo la ve un administrador.

### Operaciones que piden PIN de supervisor
- Facturar a un cliente con **facturas vencidas** o que **supera su límite de crédito**.
- **Editar o anular** comprobantes, recibos, órdenes de pago y movimientos.
- Marcar remitos o recepciones como **listos** (no se facturan en PLUS).
- Corregir precios de recepciones en TRACE.
- Ajustes de stock, conteos de envases e implementos.
- Egresos manuales de una caja que tenga activado "Pedir PIN".

> 🔒 Es el **mismo PIN** de CONTROL TRACE (también valen los autorizadores). Cada autorización queda registrada en **Auditoría** de CONTROL TOTAL, con quién la hizo, la fecha y el detalle.

## Dashboard
<!-- id: dashboard | grupo: Primeros pasos | pantalla: dashboard | roles: todos | resumen: Resumen del mes y lo que hay que atender hoy -->
Es la pantalla de entrada. Resume el mes actual:

- **Facturado del mes** (y neto sin IVA) y **Comprobantes** emitidos (con los pendientes de CAE).
- **Cobrado** en el mes y **A cobrar** (saldo de clientes, con lo vencido).
- **Compras + gastos** del mes y **A pagar proveedores**.
- **Resultado bruto**: ventas netas menos compras y gastos.
- **Facturación neta — últimos 6 meses** y **Ranking clientes — año**.
- **Últimos comprobantes**, con **Ver todos**.
- **Para atender hoy**: remitos de TRACE sin facturar, recepciones sin comprobante de compra, facturas pendientes de CAE, etc. Tocá cada línea para ir directo a resolverla.

## Emitir una factura
<!-- id: factura | grupo: Ventas | pantalla: ventas>tv-cv | roles: admin, supervisor, comercial | resumen: Factura A, B, C o X, con o sin CAE de ARCA -->
![Nueva factura](img/plus/factura.png)

### Paso a paso
1. En **Ventas**, tocá **＋ Nueva Factura**.
2. En **Comprobante**, revisá la **Letra** (se sugiere según la condición de IVA del cliente), el **Punto de venta**, la **Fecha**, la **Condición de venta** y el **Vencimiento de pago** (se calcula con los días del cliente).
3. Elegí el **Cliente**: escribí su código y Enter, o buscalo por nombre o CUIT. Se completan el CUIT, la condición de IVA y el domicilio. Si le falta un dato, tocá **✏️** para editar su ficha sin salir de la factura; con **＋** creás un cliente nuevo.
4. Si corresponde, elegí el **Vendedor**, el **Concepto** (productos, servicios o ambos; para servicios hay que indicar el período *desde / hasta*), la **Moneda** y la **Orden de compra** del cliente.
5. En **Ítems** (precios **netos, sin IVA**), por cada renglón buscá el artículo o servicio, y completá **Cant.**, **Precio unit.**, **Bonif %** e **IVA**. El precio se sugiere con el precio del cliente, su lista o el precio base. Con **＋ Agregar ítem** sumás renglones.
6. Si hace falta, cargá un **Descuento global** (en % y/o en $, se aplica antes del IVA), **Percepciones / otros tributos** y **Observaciones** (se imprimen).
7. Tocá **🚀 Emitir**. Si todavía no querés emitirla, tocá **💾 Guardar borrador**.

### Qué pasa al emitir
- Si el punto de venta es **Web Service** y la conexión con ARCA está en producción, el sistema pide el **CAE** a ARCA en el momento. Ver [Factura electrónica y CAE](#cae).
- Si el punto de venta es de otro sistema (talonario, factura en línea, controlador fiscal), la factura queda **pendiente de CAE** y el CAE se carga a mano.
- Las facturas **X** (no fiscales) quedan emitidas sin CAE.

> ⚠️ Antes de emitir, el sistema controla: que haya cliente e ítems, que el total sea mayor a cero, que para una factura **A** el cliente tenga un CUIT válido, y que el emisor tenga su CUIT cargado en Configuración.

> 🔒 Si el cliente tiene **facturas vencidas** o la factura le hace **superar su límite de crédito**, aparece "Facturación bloqueada por control de crédito". Un supervisor puede autorizarla con su PIN.

### Borradores
Los borradores no tienen número ni afectan la cuenta corriente. En la lista aparecen con el botón **✏️ Emitir**, que abre la factura para terminarla.

### Imprimir y enviar
![Detalle de una factura emitida](img/plus/factura-detalle.png)

En el detalle de la factura (**👁 Ver**), además de imprimir, podés cobrarla, editarla (si no tiene CAE), emitir una nota de crédito o anularla:
- **🖨️ Imprimir / PDF** imprime el comprobante con su CAE y código QR de ARCA.
- **📧 Email** abre tu programa de correo con un mensaje armado para el cliente (adjuntá el PDF).

## Factura electrónica y CAE
<!-- id: cae | grupo: Ventas | pantalla: ventas>tv-cv | roles: admin, supervisor, comercial | resumen: Pedir el CAE a ARCA, reintentar y cargarlo a mano -->
### Cómo se pide el CAE
Al emitir desde un punto de venta **Web Service**, el sistema envía el comprobante a ARCA ("Pidiendo el CAE… no cierres esta ventana"). Si sale bien, aparece "✅ CAE …" con el número asignado y se abre el comprobante.

### Si ARCA lo rechaza
Aparece **❌ ARCA rechazó el comprobante** con los motivos y sugerencias. El comprobante queda **pendiente de CAE**.
1. Corregí lo que indica el mensaje (por ejemplo, el CUIT del cliente o la condición de IVA). Mientras no tenga CAE, se puede editar.
2. Tocá **🔄 Reintentar**, o en la lista el botón **🏛 CAE** (tiene ⚠ si hubo un rechazo).

> 💡 Si hubo un corte en el medio y ARCA ya lo había autorizado, al reintentar el sistema lo detecta y **recupera** el CAE sin duplicar el comprobante.

### Ambiente de pruebas (homologación)
Mientras la conexión con ARCA está en **Homologación**, el botón dice **🧪 Probar envío a ARCA**: ARCA autoriza una copia de prueba y el comprobante real **sigue pendiente de CAE**. Sirve para verificar que todo esté bien antes de pasar a producción.

### Cargar el CAE a mano
Si emitiste el comprobante por otro medio (por ejemplo, *Comprobantes en línea* de ARCA):
1. Abrí el comprobante y tocá **🧾 Registrar CAE manual** (o **CAE** en la lista).
2. Copiá exactamente el **número** de comprobante, el **punto de venta**, el **CAE (14 dígitos)** y su **vencimiento**.
3. Tocá **Guardar**. El comprobante pasa a *Emitida*.

### Estados de un comprobante
| Estado | Qué significa |
|---|---|
| Borrador | Guardado sin número. Se puede editar y emitir |
| Pendiente CAE | Tiene número pero todavía no tiene CAE |
| Emitida | Tiene CAE (o es X / saldo inicial) |
| Con saldo | Emitida y con importe pendiente de cobro |
| Anulada | Anulada sin CAE. No suma |

> ⚠️ Un comprobante **con CAE no se puede editar ni anular**: se corrige con una **nota de crédito**.

## Factura de Crédito Electrónica MiPyME (FCE)
<!-- id: fce | grupo: Ventas | pantalla: ventas>tv-cv | roles: admin, supervisor, comercial | resumen: Cuándo corresponde y qué datos lleva -->
Corresponde cuando el cliente es una **empresa grande obligada a recibir FCE** y el comprobante supera el **monto mínimo** vigente que publica ARCA.

1. En la ficha del cliente (Entidades → pestaña *Fiscal*), marcá **¿Obligado a recibir FCE MiPyME?** en *Sí*. Desde ese momento, sus facturas se sugieren como FCE.
2. En la factura, revisá que esté tildado **Factura de Crédito Electrónica MiPyME (FCE)**, con el **CBU del emisor**, el **Alias** y la **Transferencia** (SCA o ADC). Vienen de Configuración.
3. La FCE exige la **fecha de vencimiento del pago** (igual o posterior a la fecha de la factura).
4. Emitila como cualquier factura.

El comprador tiene 30 días para aceptarla o rechazarla en el Registro de Facturas de Crédito. Para anotar lo que hizo, abrí la factura y tocá **🏛 Aceptación FCE**: *Pendiente de aceptación*, *Aceptada* o *Rechazada*. Si fue rechazada, se emite una nota de crédito FCE indicando **¿Anula por rechazo del comprador?: Sí**.

> 💡 En la lista de comprobantes, el filtro **Tipo → Solo FCE MiPyME** muestra solo las facturas de crédito.

## Facturar remitos de TRACE
<!-- id: facturar-remitos | grupo: Ventas | pantalla: ventas>tv-rem | roles: admin, supervisor, comercial | resumen: Uno o varios remitos del mismo cliente en una factura -->
Los remitos se emiten en CONTROL TRACE. En **Ventas → Remitos** se ven con sus precios para facturarlos.

![Remitos pendientes de facturar](img/plus/remitos.png)

### Facturar uno o varios remitos
1. Filtrá por **Cliente** y dejá el **Estado** en *Pendiente de facturar*.
2. Tildá los remitos que van en la factura (tienen que ser del **mismo cliente**).
3. Tocá **🧾 Facturar seleccionados** (o **🧾 Facturar** en un remito).
4. Se abre la factura con los productos, cantidades y precios de los remitos. Los mismos productos con el mismo precio se juntan en un solo renglón. En *Observaciones* queda "Según remito N° …" y se completa la orden de compra.
5. Revisá precios y condición de IVA, y tocá **🚀 Emitir**.

> ⚠️ Si algún producto no tiene precio, arriba aparece "Sin precio para…": completalo antes de emitir. Si un renglón todavía no tiene lote en TRACE, se factura igual; el stock se descuenta cuando se asigne el lote.

### Remitos que no se van a facturar
Si un remito ya está incluido en el saldo inicial del cliente (o no se factura por otro motivo), tocá **✓ Marcar como listos**. Podés elegir los remitos tildados o *todos los pendientes hasta una fecha*, con un motivo. Pide PIN. Desaparecen de los pendientes (se ven con el estado *✓ Listos (ocultos)* y se pueden volver a pendientes).

### Indicadores
Arriba ves los remitos del período, los **pendientes de facturar**, los **facturados** y las unidades despachadas. Las **muestras** sin valor comercial aparecen con su estado y no se facturan.

## Notas de crédito y de débito
<!-- id: notas | grupo: Ventas | pantalla: ventas>tv-nc, ventas>tv-nd | roles: admin, supervisor, comercial | resumen: Anular, ajustar o recargar un comprobante emitido -->
### Nota de crédito
Sirve para anular total o parcialmente una factura (devolución, error de precio, bonificación).
1. Abrí la factura (**👁 Ver**) y tocá **↩ Nota de crédito**. Se arma con el mismo cliente, letra y renglones, asociada a esa factura.
   También podés ir a **Ventas → Notas de crédito → ＋ Nueva nota de crédito** y elegir el **Comprobante asociado**.
2. Dejá solo los renglones y cantidades a acreditar, o ajustá los importes.
3. Tocá **🚀 Emitir**.

El importe se aplica contra el saldo de la factura asociada. Si sobra, queda **sin aplicar** como crédito a favor del cliente, que se puede usar en una cobranza.

### Nota de débito
Sirve para cargos adicionales (intereses, diferencias de precio, un cheque rechazado). Se carga desde **Ventas → Notas de débito → ＋ Nueva nota de débito**, con su comprobante asociado.

> ⚠️ ARCA exige el **comprobante asociado** en las notas de crédito y de débito.

## Presupuestos
<!-- id: presupuestos | grupo: Ventas | pantalla: ventas>tv-pre | roles: admin, supervisor, comercial | resumen: Cotizaciones que se pasan a factura o a pedido -->
Un presupuesto no es un comprobante fiscal: no tiene CAE ni afecta la cuenta corriente.
1. Tocá **📝 Presupuesto** (o *Presupuestos → ＋ Nuevo presupuesto*).
2. Cargá cliente, ítems y la fecha de validez, y tocá **💾 Guardar presupuesto**.
3. Cuando el cliente lo acepta:
   - **🧾 Facturar**: abre la factura con los mismos datos. El presupuesto pasa a *Facturado*.
   - **📋 Pedido**: crea un pedido con los productos (para que TRACE lo produzca y remita). El presupuesto pasa a *Pasado a pedido*.

## Pedidos de clientes
<!-- id: pedidos | grupo: Ventas | pantalla: ventas>tv-ped | roles: admin, supervisor, comercial | resumen: La misma lista de pedidos que usa TRACE -->
Los pedidos que se cargan acá los usa CONTROL TRACE para planificar la producción y armar el remito. Es la misma lista.

1. Tocá **＋ Nuevo pedido**.
2. Elegí el **Cliente**, la **Fecha del pedido**, la **Fecha de entrega** y, si hay, el **N° de orden de compra** (pasa al remito).
3. Agregá los productos con sus **Unidades** y el **Precio unit.** El importe y el total estimado se calculan solos.
4. Tocá **💾 Registrar pedido**. Aparece "ya lo ve CONTROL TRACE".

La lista se filtra por cliente, estado (*📱 Por confirmar*, *Pendiente*, *Cumplido (remitido)*, *No entregado*) y fechas, y muestra el remito que lo cumplió. Las acciones de cada pedido (editar, marcar cumplido o no entregado, eliminar) funcionan igual que en TRACE.

> 💡 Los pedidos que cargan los vendedores desde el celular se confirman en **TRACE → Pedidos**.

## Cobranzas y recibos
<!-- id: cobranzas | grupo: Ventas | pantalla: ventas>tv-cob | roles: admin, supervisor, comercial | resumen: Registrar lo que paga un cliente y generar el recibo -->
![Nueva cobranza](img/plus/cobranza.png)

### Registrar una cobranza
1. Tocá **💰 Cobranza** (o **💰 Cobrar** desde una factura o desde Cuentas por cobrar).
2. Revisá la **Fecha** y el **Punto de venta**, y elegí el **Cliente**.
3. En **Comprobantes a cancelar**, tildá las facturas que paga y ajustá el importe de cada una. Si no tildás ninguna, se imputa automáticamente a las más antiguas.
4. Si el cliente tiene **créditos a favor** (notas de crédito o cobros a cuenta), indicá cuánto usar de cada uno.
5. En **Formas de cobro**, cargá cómo pagó. Con **＋ Agregar forma de cobro** sumás varias:
   - **Efectivo**: elegí la caja.
   - **Transferencia**: la cuenta destino y el N° de operación.
   - **Mercado Pago**, **Tarjeta débito** o **Tarjeta crédito**: la cuenta de acreditación (opcional) y el cupón o N° de operación.
   - **Cheque**: N°, tipo (ECheq, diferido o común), banco, librador, CUIT, fecha de emisión y **fecha de cobro**. El cheque queda en la **cartera de cheques**.
6. Si el cliente te retuvo impuestos, cargalos en **Retenciones sufridas** (Ganancias, IVA, Ingresos Brutos, SUSS, municipal): N° de certificado, alícuota e importe.
7. Tocá **✅ Confirmar y generar recibo**. El número de recibo se asigna en ese momento.

> 💡 Si cobrás más de lo que imputás, la diferencia queda **a cuenta** del cliente, como crédito a favor para la próxima cobranza.

> ⚠️ Lo imputado no puede superar lo cobrado, y el importe a cancelar de una factura no puede superar su saldo.

### Ver y anular recibos
En **Cobranzas → Recibos** ves cada recibo con sus comprobantes, formas de cobro, retenciones, total y lo que quedó a cuenta. Se puede imprimir y **anular** (con PIN). No se puede anular si alguno de sus cheques ya se depositó o se entregó, o si su anticipo ya se usó en otro recibo.

## Cartera de cheques de terceros
<!-- id: cheques | grupo: Ventas | pantalla: ventas>tv-cob>tvc-cheques | roles: admin, supervisor, comercial | resumen: Depositar, pasar a caja, entregar o rechazar cheques recibidos -->
En **Cobranzas → Cartera de cheques** están todos los cheques recibidos de clientes. Arriba ves los que están **en cartera**, los que **vencen en 30 días**, los depositados o entregados y los rechazados.

- **🏦 Depositar**: elegí la cuenta bancaria. El cheque pasa a *Depositado* y se registra el crédito en el banco.
- **💵 A caja**: si lo cobraste por ventanilla, ingresa como efectivo en la caja elegida.
- **Entregar a un proveedor**: se hace desde la orden de pago, eligiéndolo como forma de pago.
- **Rechazado**: marca el cheque como rechazado y te ofrece emitir en el momento la **nota de débito** al cliente.

Filtrá por librador, estado, fechas de cobro o buscá por N°, banco o proveedor. **🖨️ Imprimir** saca el listado.

## Cuentas por cobrar y cuenta corriente de clientes
<!-- id: cxc | grupo: Ventas | pantalla: ventas>tv-cxc, ventas>tv-cc | roles: admin, supervisor, comercial | resumen: Antigüedad de saldos, comprobantes pendientes, C/C y saldo inicial -->
### Cuentas por cobrar
Muestra el **total a cobrar**, lo **no vencido**, lo **vencido** y los **créditos a favor** de clientes.
- **Antigüedad de saldos por cliente**: no vencido, 1–30 días, 31–60, 61–90 y más de 90.
- **Comprobantes pendientes de cobro**: con vencimiento, días y situación. Filtrá por cliente y situación (*Vencido +30*, *Vencido +90*…). Desde cada fila, **C/C** abre su cuenta corriente y **💰 Cobrar** abre la cobranza.

### Cuenta corriente de un cliente
En **C/C clientes**, elegí el cliente y el período. Ves los débitos, los créditos y el **saldo a la fecha**, con cada movimiento (facturas, notas, recibos). Se exporta a Excel o se imprime para mandarle al cliente.

### Saldo inicial
Cuando empezás a usar PLUS, cargá lo que cada cliente debía en el sistema anterior:
1. En **C/C clientes**, elegí el cliente y tocá **➕ Saldo inicial**.
2. Cargá el **Importe adeudado** y una **Referencia** (por ejemplo, el comprobante del sistema anterior).
3. Tocá **💾 Registrar saldo**.

No es un comprobante fiscal, pero suma a la cuenta corriente y se cobra como cualquier factura.

## Precios: por cliente, listas y servicios
<!-- id: precios | grupo: Ventas | pantalla: ventas>tv-pc, ventas>tv-lp, ventas>tv-srv, inventario>ti-srv | roles: admin, supervisor, comercial | resumen: De dónde sale el precio que sugieren la factura y el remito -->
El precio que se sugiere en la factura de PLUS y en el remito de TRACE sale, en este orden, de:
1. el **precio del cliente** para ese producto;
2. la **lista de precios** asignada al cliente;
3. el **precio base** del producto (su ficha en Inventario).

### Precios por cliente
1. En **Ventas → Precios por cliente**, elegí el cliente.
2. Escribí el precio en la columna **Precio del cliente** de cada producto (los cambios se resaltan en amarillo). Al lado ves el precio base, el de su lista y el precio con IVA.
3. Atajos: **⤵ Traer de su lista** copia los precios de su lista; **％ Ajustar todos** sube o baja todos los precios en un porcentaje.
4. Tocá **💾 Guardar precios**. Aparece "ya los usa TRACE".

> 💡 Al emitir un remito en TRACE, el precio usado queda guardado como precio de ese cliente.

### Listas de precios
En **Listas de precios**, **＋ Nueva lista** crea una lista con código, nombre, vigencia, **redondeo** (al $1, $10 o $100) y las formas de cobro habilitadas. Con **💲 Precios** cargás el precio de cada artículo (con **Aplicar a todos** para un ajuste general). La lista se asigna en la ficha de cada cliente.

### Servicios
En **Servicios** (está en Ventas y también en Inventario) cargás lo que la empresa factura que no es un producto (fletes, alquileres, asesorías): código, nombre, descripción, unidad, precio neto e IVA. Aparecen en el buscador de ítems de la factura.

## Libro IVA Ventas
<!-- id: iva-ventas | grupo: Ventas | pantalla: ventas>tv-cv | roles: admin, supervisor | resumen: Exportar el libro de IVA del período -->
1. En **Ventas → Comprobantes de venta**, elegí el período en **Desde / Hasta**.
2. Tocá **📘 IVA Ventas**.

Se descarga un Excel con cada comprobante fiscal del período (sin borradores ni anulados): fecha, tipo, código ARCA, punto de venta, número, cliente, CUIT, condición de IVA, neto gravado, no gravado, exento, IVA por alícuota, percepciones, total y CAE. Las notas de crédito van en negativo.

## Registrar un comprobante de compra o un gasto
<!-- id: compras | grupo: Compras | pantalla: compras>tc-gas, compras>tc-cv | roles: admin, supervisor, comercial | resumen: Facturas de proveedores y gastos, a mano o desde PDF o foto -->
![Registrar comprobante de compra](img/plus/compra.png)

### Desde un PDF o una foto (IA)
1. Tocá **📎 Desde PDF / foto** (o, dentro del formulario, **📄 Subir PDF / foto**; desde el celular, **📷 Sacar foto**). También podés arrastrar el archivo.
2. Esperá unos segundos: se completan el proveedor, el tipo, el número, las fechas, los renglones, el IVA y las percepciones.
3. Revisá los avisos (datos ilegibles, sumas que no cierran). Si el proveedor no existe, aparece **＋ Darlo de alta**.
4. Tocá **💾 Registrar**. El archivo queda guardado con el comprobante (en el detalle: **📎 Ver comprobante original**).

### A mano
1. Tocá **＋ Registrar compra** (o **＋ Gasto**).
2. En **Comprobante del proveedor**: **Tipo** (Factura A, B, C, M, X, ticket, recibo o sin comprobante), **N° comprobante**, **Fecha** y **Vencimiento de pago**. Para un gasto, también la **Categoría** y el **Concepto**.
3. Elegí el **Proveedor** (con **✏️** editás su ficha y con **＋** creás uno nuevo) y la **Condición de pago**.
4. Elegí cómo cargar el detalle:
   - **por ítems**: artículo (materia prima, producto, insumo o texto libre), cantidad, unidad, precio e IVA;
   - **por importes**: neto gravado al 21 %, 10,5 % y 27 %, no gravado o exento, percepción de IVA, percepción de IIBB y otros tributos.
5. Si se pagó en el momento, en **¿Se pagó al registrar?** elegí *Sí, en efectivo* (con la caja) o *Sí, por transferencia* (con la cuenta).
6. Si compraste insumos, tildá **📦 Ingresar los insumos al stock y actualizar su costo** y elegí a qué depósito entran.
7. Tocá **💾 Registrar**.

> ⚠️ El sistema avisa si ese comprobante del proveedor **ya está registrado**.

### Gastos
Los gastos son egresos que no van a stock: servicios, alquileres, sueldos, combustible, reparaciones, honorarios, fletes, impuestos. Se cargan igual, con su categoría, en **Compras → Gastos**, donde se filtran por proveedor, categoría, estado o texto, y se pagan con **💳 Pagar**.

### Editar y anular
- **Editar**: solo si no tiene pagos ni notas de crédito aplicadas.
- **Anular** (con PIN): si tiene pagos aplicados, primero anulá la orden de pago.

### Libro IVA Compras
**📘 IVA Compras** descarga el libro de IVA compras del período elegido.

## Registrar compras desde las recepciones de TRACE
<!-- id: compras-trace | grupo: Compras | pantalla: compras>tc-cv | roles: admin, supervisor, comercial | resumen: Cargar la factura del proveedor de la mercadería recibida -->
Lo que se recibe en TRACE aparece en **Compras → Comprobantes de compra**, en el panel **📥 Recepciones de CONTROL TRACE sin comprobante de compra**.

![Recepciones de TRACE pendientes](img/plus/recepciones.png)

### Paso a paso
1. Tildá las recepciones que vienen en la misma factura del proveedor (tienen que ser del **mismo proveedor**).
2. Tocá **💾 Registrar seleccionadas** (o **Registrar** en una recepción).
3. Se abre la compra con un renglón por recepción (cantidad, unidad y precio de TRACE). Completá el **Tipo** y el **N° de comprobante** del proveedor, y revisá los precios.
4. Tocá **💾 Registrar**.

> 💡 Si cambiás el precio en la compra, **se corrige también en la recepción de TRACE**, así el costeo y el rinde quedan bien.

### Revisar diferencias de precios
**🔧 Revisar precios en TRACE** compara cada recepción con su factura de compra. Si hay diferencias, muestra la lista y, con PIN, corrige el total y el precio por kilo de las recepciones según la factura (los kilos no cambian).

### Recepciones que no se cargan
**✓ Marcar seleccionadas como listas** saca de la lista las recepciones que no se van a cargar como compra (por ejemplo, las incluidas en el saldo inicial del proveedor). Pide PIN.

## Remitos, notas y compras por artículo
<!-- id: compras-otros | grupo: Compras | pantalla: compras>tc-rem, compras>tc-nc, compras>tc-nd, compras>tc-ap | roles: admin, supervisor, comercial | resumen: Remitos de compra manuales, notas de proveedores y análisis por artículo -->
### Remitos de compra
Las recepciones de TRACE funcionan como remito de compra. Para lo que no pasa por TRACE (insumos, packaging, repuestos), tocá **＋ Remito manual** y cargá el proveedor y los artículos. Desde la lista, **Registrar factura** carga su comprobante.

### Notas de crédito y de débito recibidas
En sus pestañas, **＋ Nueva nota de crédito / débito** registra las notas del proveedor, de compra o de gasto, asociadas al comprobante original. Las notas de crédito sin aplicar quedan como crédito a favor para el próximo pago.

### Compra de artículos por proveedor
Analiza qué se compró, a quién y a qué precio. Filtrá por proveedor, artículo, origen (comprobantes o recepciones de TRACE sin facturar), pago y fechas. La **Vista** puede ser *Detalle* o *Resumen por artículo*.

## Pagos a proveedores
<!-- id: pagos | grupo: Compras | pantalla: compras>tc-pag | roles: admin, supervisor | resumen: Órdenes de pago con efectivo, transferencia y cheques -->
![Nueva orden de pago](img/plus/pago.png)

### Registrar un pago
1. Tocá **💳 Pago** (o **💳 Pagar** desde un comprobante, un gasto o Cuentas por pagar).
2. Revisá la **Fecha** y elegí el **Proveedor**. Ves su **saldo adeudado**.
3. En **Comprobantes a cancelar**, tildá lo que pagás y ajustá los importes. Si no tildás nada, se imputa a los más antiguos.
4. Usá los **créditos a favor** (notas de crédito del proveedor o pagos a cuenta) si corresponde.
5. En **Formas de pago** (**＋ Agregar forma de pago** para varias):
   - **Efectivo**: la caja.
   - **Transferencia**: la cuenta de origen y el N° de operación.
   - **Cheque propio**: la cuenta (chequera), N°, tipo, fecha de emisión y **fecha de pago**.
   - **Cheque de terceros**: elegí un cheque **en cartera**; el importe se completa solo.
6. Tocá **✅ Confirmar pago**. El número de orden de pago se asigna en ese momento.

> 💡 Si pagás de más, queda **a cuenta** del proveedor. Un gasto sin proveedor no puede quedar con pago a cuenta.

### Ver y anular
En **Pagos → Órdenes de pago** ves cada orden con sus comprobantes, formas de pago y total. Se imprime y se **anula** con PIN; no se puede anular si un cheque propio de esa orden ya se debitó.

### Chequera propia
En **Pagos → Chequera propia** están los cheques emitidos, con su fecha de pago y estado (*Pendientes de débito*, *Debitados*, *Rechazados*, *Anulados*):
- **✓ Debitado**: cuando el banco lo debita, registra el movimiento en la cuenta.
- **＋ Registrar cheque emitido**: para cheques que no salieron de una orden de pago.

## Comisiones de vendedores
<!-- id: comisiones | grupo: Compras | pantalla: compras>tc-pag>tcp-comis | roles: admin | resumen: Calcular y liquidar las comisiones por período y producto -->
Las comisiones se calculan sobre lo **facturado** (facturas + notas de débito − notas de crédito), según la regla de cada vendedor (ver [Vendedores](#vendedores)).

### Ver lo pendiente
En **Pagos → Comisiones vendedores**, elegí el año, el vendedor y si querés ver solo lo pendiente. La tabla muestra, por vendedor y mes, la regla, la comisión, lo liquidado y lo pendiente.

### Liquidar
1. Tocá **🧾 Liquidar comisiones** (o **💳 Liquidar** en una fila).
2. Elegí el **Vendedor** y el período de ventas (**Ventas desde / hasta**).
3. Revisá el **resumen por producto** y destildá lo que no vas a pagar. Con *Ver los comprobantes incluidos* ves de qué facturas sale.
4. Completá la **Fecha de pago**, la **Forma de pago** (caja o cuenta), la referencia y las observaciones.
5. Confirmá. Queda en **Liquidaciones emitidas**, donde se ve, imprime, exporta o anula.

> ⚠️ Si en ese período ya hubo pagos de comisión anteriores sin detalle por producto, el sistema lo avisa para que no los pagues dos veces.

## Cuentas por pagar y cuenta corriente de proveedores
<!-- id: cxp | grupo: Compras | pantalla: compras>tc-cxp, compras>tc-cc | roles: admin, supervisor, comercial | resumen: Deuda por vencimiento y C/C de cada proveedor -->
### Cuentas por pagar
Muestra el **total a pagar**, lo **a vencer**, lo **vencido** y los **créditos a nuestro favor**, con la **antigüedad de deuda por proveedor**. La lista de comprobantes se filtra por proveedor y vencimiento (*Vence hoy*, *Próximos 7 días*, *Próximos 30 días*, *Vencidas*). Desde cada fila: **C/C** o **💳 Pagar**.

### Cuenta corriente de un proveedor
En **C/C proveedores**, elegí el proveedor y el período: compras, pagos y créditos, y el saldo a pagar.

### Saldo inicial
**➕ Saldo inicial** carga lo que se le debía al proveedor al empezar a usar PLUS.

## Clientes
<!-- id: clientes | grupo: Entidades | pantalla: clientes | roles: admin, supervisor, comercial | resumen: Ficha del cliente con datos fiscales y condiciones comerciales -->
![Ficha de cliente](img/plus/cliente.png)

### Dar de alta o editar un cliente
1. En **Entidades → Clientes**, tocá **＋ Nuevo** (o **✏️ Editar** en un cliente).
2. **Datos generales**: el **Código** (se sugiere el siguiente), **Razón social** (obligatoria), **CUIT**, **Condición IVA**, teléfono, email, localidad, provincia y domicilio.
3. **Fiscal**: N° de IIBB, inicio de actividades, **Tipo de comprobante** que se le hace y si está **obligado a recibir FCE MiPyME**.
4. **Comercial**: **Lista de precios**, **Condición de pago**, **Días de vencimiento** de sus facturas, **Vendedor asignado** y **Límite de crédito** (0 = sin límite).
5. Tocá **💾 Guardar**.

> 💡 El **límite de crédito** y las facturas vencidas activan el control de crédito al facturar (ver [Emitir una factura](#factura)).

### Buscar y dar de baja
Buscá por razón social, CUIT o código, y filtrá por condición de IVA y estado. **Desactivar** no borra al cliente: deja de ofrecerse y se puede **reactivar**. La lista muestra el saldo de su cuenta corriente.

> ⚠️ Los clientes nuevos que da de alta un vendedor desde la app quedan marcados para revisar: completá su CUIT, condición de IVA y dirección antes de facturarles.

## Proveedores
<!-- id: proveedores | grupo: Entidades | pantalla: clientes>te-prov | roles: admin, supervisor, comercial | resumen: Ficha del proveedor con datos bancarios y condiciones -->
1. En **Entidades → Proveedores**, tocá **＋ Nuevo** (o **✏️ Editar**).
2. **Datos generales**: código, **Razón social** (obligatoria), CUIT, condición IVA, **Rubro** (materia prima, insumos agrícolas, logística, servicios, packaging, otros), teléfono y email.
3. **Bancarios**: banco, **CBU (22 dígitos)**, alias y tipo de cuenta.
4. **Condiciones**: condición de pago, moneda habitual y observaciones.
5. Tocá **💾 Guardar**.

El **nombre** del proveedor es el que se elige en la recepción de TRACE. La lista se filtra por rubro y estado y muestra el saldo de su cuenta corriente.

## Vendedores y app de pedidos
<!-- id: vendedores | grupo: Entidades | pantalla: clientes>te-vend | roles: admin, supervisor | resumen: Comisión, productos que comisionan y acceso a la app del celular -->
### Ficha del vendedor
1. En **Entidades → Vendedores**, tocá **＋ Nuevo**.
2. Completá **Código**, **Nombre y Apellido**, **Zona asignada**, teléfono y email.
3. **Comisión % general**: lo que cobra sobre todo lo que vende.
4. **Productos que pagan comisión** (opcional): si agregás productos, **solo esos** pagan comisión, cada uno con su % o con un **importe en $ por unidad**. Elegí **cuándo cobra** la comisión de esos productos: solo en las ventas a sus clientes (o facturas con su nombre), o en todas las ventas del producto.
5. Marcá las **listas de precios autorizadas** y tocá **💾 Guardar**.

### Darle acceso a la app de pedidos
El vendedor carga pedidos desde el celular (CONTROL VENDEDOR). Entran a **TRACE → Pedidos** como *📱 Por confirmar*.
1. En la fila del vendedor, tocá **📱 App de pedidos**. El vendedor tiene que tener **código** cargado.
2. Revisá la **Clave** (se propone una al azar, mínimo 6 caracteres) y el **WhatsApp de la empresa** que recibe los avisos de pedidos (con código de área).
3. Tocá **✅ Dar acceso**. El sistema arma el mensaje con el link, el usuario (su código) y la clave para mandárselo.

Después, desde el mismo botón: **🔑 Cambiar la clave**, **💬 Reenviar el link por WhatsApp** o **Quitar el acceso**.

## Fichas de materias primas, productos e insumos
<!-- id: fichas | grupo: Inventario | pantalla: inventario>ti-mp, inventario>ti-prod, inventario>ti-ins, inventario>ti-rub | roles: admin, supervisor | resumen: Los maestros que usan TRACE y PLUS -->
Las fichas de **Inventario** son las mismas que usa CONTROL TRACE para recibir, producir, etiquetar y remitir.

![Ficha de producto](img/plus/producto.png)

### Materias primas
En **Materia prima**, **＋ Nueva materia prima**: código, nombre, unidad (kg, u, atado, caja, bolsa), stock mínimo y rubro. Es la lista que aparece en la recepción de TRACE. La lista muestra lo recibido en 12 meses, el último precio, la última recepción y los proveedores.

> ⚠️ No se puede cambiar el nombre ni el código de una materia prima que ya se usó. **Baja** no la borra: deja de ofrecerse en la recepción.

### Productos
En **Productos**, **＋ Nuevo producto** abre la ficha completa:
- **Identificación**: código, nombre, presentación, **familia** (define el tipo de etiqueta en TRACE), rubro y **tipo**: *simple* (sale de una materia prima), *compuesto por producción* (varias materias primas, con receta) o *compuesto de ensamblado* (pack armado con productos terminados).
- **Producción y rotulado**: GTIN (EAN-13), contenido en kg por unidad, **unidades por caja**, **rinde** (unidades por kg de MP), **vida útil**, **producción por defecto** (para el plan de TRACE), RNPA, RNE, *venta por unidad* (peso variable), *apto microondas* y la configuración de **muestras**.
- **Facturación**: unidad de facturación, **precio de venta base** (neto), alícuota de IVA y stock mínimo.
- **Receta**: las materias primas (y cantidades) y los **insumos** que consume (envases, etiquetas, cajas), con el momento en que se descuentan (al producir o al despachar).

Tocá **💾 Guardar**: "TRACE lo toma al actualizar".

> ⚠️ Si cambiás el nombre de un producto, los pedidos, remitos y producciones anteriores conservan el nombre viejo. El sistema te pide confirmación.

### Insumos
En **Insumos**, **＋ Nuevo insumo**: nombre, **unidad de uso**, rubro, **unidad de compra** (rollo, caja, bulto) y su **rinde** (cuántas unidades de uso trae), stock inicial, mínimos y costo por unidad de uso. TRACE los descuenta solo, según la receta de cada producto.

Cada insumo tiene dos stocks: el del **depósito de compra** (en unidad de compra) y el **stock de uso** (fraccionado, el que descuenta TRACE). Acciones:
- **＋ Ingreso** y **⚖️ Ajustar** (stock de uso o de depósito).
- **🚚 Al galpón**: pasa unidades de compra al depósito de uso, fraccionadas. Cuando se termina el rollo o el bulto, en **🚚 Entregas al galpón** tocá **✅ Cerrar** y cargá **cuánto rindió de verdad**: la diferencia queda como merma.
- **🖨️ Planilla de conteo** para el conteo físico.

El filtro **Mostrar** te deja ver los *bajo mínimo* o *sin stock*.

### Rubros
En **Rubros** agrupás artículos para reportes (no cambia la familia de etiquetas de TRACE). Un rubro con artículos no se puede dar de baja.

## Costos de productos
<!-- id: costos | grupo: Inventario | pantalla: inventario>ti-cost | roles: admin | resumen: Costeo por producto y margen -->
![Costeo de producto](img/plus/costos.png)

El costo de la materia prima se calcula igual que en TRACE: **promedio ponderado por kilo de las últimas 5 compras**, con el descarte y la merma absorbidos en el costo por kilo procesado.

### Costear un producto
1. En **Inventario → Costos**, en **🧮 Costeo de producto**, escribí el código y Enter, o buscá el producto.
2. La **materia prima** y los **insumos** por unidad se calculan solos.
3. Completá los **gastos operativos**, **mano de obra**, **flete** y **otros** por unidad, y el **precio de venta de referencia**.
4. Ves el **costo total** y el **margen**. Tocá **💾 Guardar costeo**.

**🖨️ Ficha ½ A4** o **🖨️ A4** imprime la ficha de costos del producto. Abajo están el **costo de materia prima por kilo procesado** de cada MP y el **costeo de todos los productos**.

## Stock, cámaras y traslados
<!-- id: stock | grupo: Inventario | pantalla: inventario>ti-stock | roles: admin, supervisor, comercial | resumen: Stock por lote y mover lotes entre cámaras -->
En **Inventario → Stock** elegís qué ver: **Materia prima**, **Productos** o **Insumos**.
- Materia prima y productos se ven **por lote**, con su stock y la **cámara** donde está. Es el mismo cálculo que TRACE; **Verificar contra Trace** lo comprueba.
- Filtrá por artículo, lote o cámara.

### Mover lotes a otra cámara
1. Tildá los lotes.
2. Tocá **↔ Mover seleccionados** y elegí la cámara destino.

**📜 Traslados** muestra el historial de movimientos entre cámaras.

## Ajustes de stock
<!-- id: ajustes | grupo: Inventario | pantalla: inventario>ti-aj | roles: admin, supervisor | resumen: Corregir el stock de un lote después de un conteo -->
![Ajustes de stock](img/plus/ajustes.png)

1. En **Inventario → Ajustes de stock**, elegí **🥬 Materia prima (kg)** o **📦 Productos (u)**.
2. Buscá el artículo o el lote.
3. Escribí el **conteo físico** (o directamente el **ajuste ±**) solo en los lotes que no coinciden.
4. Escribí el **Motivo** (aplica a todos los cambios), por ejemplo "conteo físico mensual".
5. Tocá **✅ Aplicar ajustes** e ingresá el PIN de supervisor.

> ⚠️ Un ajuste no puede dejar un lote en negativo. Los ajustes de **insumos** se hacen desde la pestaña Insumos.

En **Historial de ajustes** ves cada ajuste con quién lo registró y quién lo autorizó. Se puede editar o anular, y con **Ver anulados** aparecen también los anulados.

## Movimientos (kardex)
<!-- id: movimientos | grupo: Inventario | pantalla: inventario>ti-mov | roles: admin, supervisor | resumen: Entradas y salidas de cada artículo -->
En **Inventario → Movimientos** elegís el tipo de artículo:
- **Insumos** o **Insumos — depósito de compra**: cada ingreso, consumo y ajuste, filtrado por insumo, tipo y fechas.
- **Materia prima** o **Productos** (por lote): todas las entradas y salidas del artículo, con el saldo, filtrando por lote.

## Envases retornables
<!-- id: envases | grupo: Inventario | pantalla: inventario>ti-env | roles: admin, supervisor | resumen: Cajones y bins que van y vuelven con la mercadería -->
Lleva la **cuenta corriente de envases** por ubicación: cuántos hay en el galpón, en la finca y en manos de cada proveedor.

1. Creá los **tipos de envase** con **＋ Tipo de envase**: código, nombre, la **presentación** que lo vincula con la recepción de TRACE (por ejemplo, *caja*), capacidad y valor de reposición.
2. Registrá los movimientos:
   - **🚚 Salida a finca / proveedor** y **↩️ Devolución al galpón**.
   - **↔ Traslado** entre ubicaciones, **＋ Compra** y **🗑 Baja**.
   - **⚖️ Conteo**: escribís lo contado y la diferencia queda como ajuste (pide PIN).

En **Saldo de envases por ubicación**, tocá un número para ver sus movimientos. Cada movimiento genera un remito de envases que se imprime (🖨️) o se anula.

> 💡 Si la ubicación externa está **vinculada con su proveedor** (en Ubicaciones), cuando TRACE recibe mercadería de ese proveedor los envases vuelven solos al galpón.

## Bienes de uso e implementos
<!-- id: bienes | grupo: Inventario | pantalla: inventario>ti-bien, inventario>ti-imp | roles: admin, supervisor | resumen: Maquinaria y vehículos con depreciación; implementos por área -->
### Bienes de uso
Maquinaria, vehículos, balanzas, herramientas e instalaciones.
1. **＋ Nuevo bien**: código, nombre, categoría, área, marca, modelo, N° de serie y estado.
2. Datos de compra: la factura registrada en PLUS (o a mano), fecha, proveedor, **valor de origen**, valor residual, **vida útil** en meses y fecha de **alta en uso** (desde ahí empieza a depreciarse).
3. Para vehículos y equipos: patente, año, combustible, si registra km u horas, y los vencimientos (VTV, seguro, calibración).

Desde la **📋 Ficha** registrás cargas de combustible, services, reparaciones y calibraciones, y cambiás el área o el estado (nuevo, en uso, en reposo, en reparación, de baja). **📉 Depreciación** muestra la amortización del período y los valores residuales.

### Implementos
Implementos de **trabajo** (cuchillos, tablas, balanzas de mano) y de **limpieza** (cepillos, escurridores, baldes), que se controlan por cantidad en cada área. El **color** sirve para el código de colores por zona y evitar la contaminación cruzada.

Movimientos: **📤 Entrega a un área**, **＋ Compra**, **↔ Traslado**, **⚖️ Conteo** y **🗑 Baja**.

## Ubicaciones: cámaras, depósitos y áreas
<!-- id: ubicaciones | grupo: Inventario | pantalla: inventario>ti-ubic | roles: admin | resumen: Dónde se guarda cada cosa -->
En **📍 Ubicaciones** cargás los lugares de la empresa con el nombre que usen: **cámaras de frío**, **depósitos**, **áreas o sectores** del galpón y lugares **externos** (fincas, proveedores).

1. **＋ Nueva ubicación**: código, nombre, tipo y **qué se guarda** ahí (materia prima, producto terminado, insumos, envases).
2. Para los insumos marcá el **rol**: *depósito de compra* (entra lo comprado) o *depósito de uso* (el galpón, donde TRACE lo descuenta). Hay un solo depósito de uso.
3. Opcional: **Por defecto**, temperatura objetivo, capacidad, **proveedor vinculado** (para los envases) y notas.

> ⚠️ Las ubicaciones no se borran, se dan de baja. No se puede dar de baja una ubicación con stock, envases, bienes o lotes: primero hay que moverlos.

## Caja
<!-- id: caja | grupo: Tesorería | pantalla: caja | roles: admin, supervisor | resumen: Abrir, registrar movimientos, cerrar y arquear -->
![Caja](img/plus/caja.png)

### Abrir la caja
1. En **Caja**, elegí la caja arriba y tocá **🔓 Abrir caja**.
2. Contá el efectivo (podés cargarlo por billete) y escribí el **Efectivo contado**.
3. Tocá **🔓 Confirmar apertura**. Si no coincide con el saldo del sistema, se registra un ajuste por la diferencia.

### Movimientos
En **Movimientos de la sesión** ves el saldo de apertura, los ingresos, los egresos y el saldo actual. Botones:
- **＋ Ingreso** y **－ Egreso**: con categoría, importe, concepto y referencia.
- **🏦 Depositar en banco**: sale de la caja y entra a la cuenta elegida.
- **⇄ Pasar a otra caja**.
- **🖨️ Imprimir sesión** y **🗓️ Imprimir por período**.

Las cobranzas en efectivo, los pagos en efectivo y los cheques pasados a caja se registran solos.

### Cerrar la caja (arqueo)
1. Tocá **🔒 Cerrar caja**.
2. Contá el efectivo y escribí el **Efectivo contado**. Ves la **diferencia** con el saldo teórico.
3. Indicá cuánto **queda como fondo** para la próxima apertura y, si corresponde, en qué cuenta se **deposita el resto**.
4. Agregá observaciones y tocá **Confirmar**. Aparece "Caja cerrada — cuadra ✓" o "con diferencia de…".

### Historial y cajas
- **Histórico de cierres**: cada cierre con su responsable, saldo teórico, contado y diferencia.
- **Todos los movimientos**: con filtros rápidos (*Hoy*, *Esta semana*, *Este mes*, *Mes anterior*) e impresión del período con saldo inicial, final y resumen por categoría.
- **Administrar cajas**: **＋ Nueva caja** con nombre, ubicación, responsable, moneda, saldo inicial y **Pedir PIN para egresos manuales**.

## Banco y conciliación
<!-- id: banco | grupo: Tesorería | pantalla: banco | roles: admin, supervisor | resumen: Cuentas, movimientos e importación del extracto -->
![Conciliación bancaria](img/plus/banco.png)

### Cuentas y movimientos
- En **Administrar cuentas**, **＋ Nueva cuenta bancaria**: banco, tipo, N° de cuenta, moneda, **CBU (22 dígitos)**, alias, titular y saldo inicial con su fecha.
- Arriba elegís la cuenta y ves el **saldo contable**, el **saldo del extracto**, lo **sin conciliar** y los **cheques propios a debitar**.
- **＋ Registrar movimiento**: crédito o débito, categoría, concepto, importe y N° de operación del banco. Las cobranzas, pagos, depósitos y cheques se registran solos.

### Conciliar con el extracto
1. Descargá el extracto del home banking en **Excel o CSV**.
2. En **Conciliación**, elegí el archivo y tocá **⚡ Procesar e importar**. El sistema detecta las columnas de fecha, concepto e importe (o débito y crédito) y cruza cada línea con los movimientos cargados (mismo importe, ±5 días).
3. Revisá lo que quedó suelto:
   - **Extracto sin conciliar**: **🔗 Vincular** con un movimiento del sistema, o **＋ Crear** el movimiento (por ejemplo, una comisión bancaria).
   - **Sistema sin conciliar**: **✓ Marcar** como conciliado.
4. **🔗 Conciliar automáticamente** vuelve a cruzar todo.

También podés cargar líneas del extracto a mano (**＋ Agregar línea**: fecha, importe con signo y concepto).

## Configuración de facturación y ARCA
<!-- id: configuracion | grupo: Configuración | pantalla: config | roles: admin | resumen: Datos del emisor, puntos de venta, FCE y conexión con ARCA -->
Solo la ve un administrador. Los usuarios, roles, permisos, PIN y plan se manejan desde **Configuración CONTROL MAX**.

### Datos del emisor y facturación
1. Completá **Razón social**, nombre de fantasía, **CUIT**, **Condición IVA**, Ingresos Brutos, inicio de actividades, domicilio fiscal, localidad, provincia, teléfono y email.
2. En **Facturación**: punto de venta por defecto, **alícuota de IVA por defecto**, concepto por defecto, días de vencimiento por defecto y la **leyenda al pie** de los comprobantes.
3. Tocá **💾 Guardar configuración**.

### Puntos de venta
**＋ Agregar punto de venta**: el número como figura en ARCA, una descripción, el **sistema en ARCA** (*Web Service*, *Factura en línea*, *Controlador fiscal* o *Manual*) y si es el de por defecto.

> ⚠️ Para facturar desde el sistema, el punto de venta tiene que estar dado de alta en ARCA como **RECE para aplicativo y web services** y marcado acá como **Web Service**. Los de otros sistemas se registran con CAE manual.

### Factura de Crédito MiPyME
CBU y alias del emisor, transferencia por defecto (SCA o ADC), **monto mínimo FCE vigente** y una leyenda adicional opcional.

### Integración con ARCA
1. Elegí el **Ambiente**: *🧪 Homologación (pruebas)* o *🟢 Producción*, y cargá el **CUIT emisor**. Tocá **💾 Guardar**.
2. **1 · Pedido de certificado**: tocá **📝 Generar y descargar pedido (.csr)**. La clave privada queda guardada en Supabase, nunca pasa por tu computadora. Subí el .csr en ARCA → *Administración de Certificados Digitales*.
3. **2 · Certificado**: subí el **.crt** que te da ARCA. Después autorizá el servicio *Facturación electrónica (wsfe)* para ese certificado en el *Administrador de Relaciones* de ARCA.
4. Tocá **🧪 Probar conexión**.

### PIN de supervisor
Se cambia en **Seguridad — Autorizaciones**. Es el mismo PIN de CONTROL TRACE: al cambiarlo, cambia para todo CONTROL MAX.

## Problemas frecuentes
<!-- id: problemas | grupo: Ayuda | roles: todos | resumen: Mensajes del sistema y qué hacer -->
### "Para comprobantes A el cliente necesita un CUIT válido"
Editá el cliente (✏️ en la factura o en Entidades) y corregí el CUIT: 11 dígitos con dígito verificador correcto.

### La factura quedó "pendiente de CAE"
- Si el punto de venta es Web Service: tocá **🏛 CAE** para pedirlo de nuevo y leé el motivo del rechazo.
- Si no es Web Service: registrá el CAE a mano con **CAE**.
- Si ARCA está en homologación, los comprobantes reales siempre quedan pendientes.

### "Tiene CAE: no se puede editar / anular"
Emití una **nota de crédito** asociada a ese comprobante.

### "Tiene cobranzas aplicadas: anulá primero el recibo"
Anulá el recibo (con PIN), corregí el comprobante y volvé a registrar la cobranza.

### "Facturación bloqueada por control de crédito"
El cliente tiene facturas vencidas o supera su límite de crédito. Cobrá lo vencido, ampliá el límite en su ficha o pedile a un supervisor que autorice con PIN.

### Un remito de TRACE no aparece para facturar
Tocá **🔄 Sincronizar**. Revisá el filtro de estado y de fechas, y que el remito no esté anulado o marcado como *listo*.

### "Ese comprobante del proveedor ya está registrado"
Ya se cargó una compra del mismo proveedor con ese número. Buscala en Comprobantes de compra antes de cargarla otra vez.

### "Lo imputado supera lo cobrado / pagado"
Bajá los importes a cancelar o agregá otra forma de cobro o de pago.

### "Primero creá una caja" / "Primero cargá una cuenta bancaria"
Creá la caja en **Caja → Administrar cajas** o la cuenta en **Banco → Administrar cuentas**.

## Glosario
<!-- id: glosario | grupo: Ayuda | roles: todos | resumen: Términos que usa el sistema -->
| Término | Significado |
|---|---|
| ARCA | Agencia de Recaudación y Control Aduanero (ex AFIP) |
| CAE | Código de Autorización Electrónico que da ARCA a cada comprobante |
| Punto de venta Web Service | Punto de venta habilitado para facturar desde el sistema |
| Homologación | Ambiente de pruebas de ARCA |
| FCE | Factura de Crédito Electrónica MiPyME |
| NC / ND | Nota de crédito / nota de débito |
| Comprobante X | Comprobante no fiscal |
| Saldo inicial | Deuda de un cliente o proveedor al empezar a usar el sistema |
| Imputar | Aplicar un cobro o un pago a comprobantes determinados |
| A cuenta | Importe cobrado o pagado que no se aplicó a ningún comprobante |
| Cartera | Cheques de terceros recibidos y todavía no usados |
| Conciliar | Cruzar los movimientos del sistema con el extracto del banco |
| Arqueo | Conteo del efectivo de una caja al abrirla o cerrarla |
| Libro IVA | Detalle de comprobantes fiscales del período para la liquidación de IVA |
