<!--
manual: config
modulo: CONFIGURACIÓN CONTROL MAX
version: cfg 1.5
actualizado: 2026-10-29
sugerencias: ¿Cómo doy de alta un usuario nuevo?; ¿Cómo hago para que un rol no vea CONTROL PLUS?; ¿Cómo cambio el PIN de supervisor?; ¿Qué es el acceso Galpón o Finca?
-->
# Manual del usuario · Configuración CONTROL MAX

**Configuración** es el módulo donde se cargan los datos de la empresa y se decide **quién entra** al sistema y **qué ve cada uno**. Lo que se guarda acá lo usan todos los módulos a la vez: CONTROL TRACE, CONTROL PLUS, CONTROLAGRO, CONTROL TOTAL, CONTROL DOCS y CONTROL RRHH.

Este manual explica cada sección paso a paso. Los ejemplos usan una empresa de demostración: los nombres y números son ficticios.

## Qué es Configuración y quién entra
<!-- id: introduccion | grupo: Primeros pasos | roles: todos | resumen: Las secciones, quién las usa y qué módulos toman cada dato -->
### Quién entra
- El **Administrador** (y el **Dueño**) ven todas las secciones.
- El **Supervisor** entra solo a **Usuarios**: puede crear y editar usuarios, pero no administradores.
- Los demás roles no entran: ven el aviso "Solo administradores" y vuelven al portal.

### Las secciones
| Sección | Para qué sirve | La usan |
|---|---|---|
| Datos de la empresa | Razón social, CUIT, domicilios, habilitaciones y logo | Remitos y etiquetas (TRACE), facturas y recibos (PLUS) |
| Facturación y FCE | Puntos de venta, valores por defecto, Factura de Crédito MiPyME y conexión con ARCA | CONTROL PLUS |
| Operarios | El padrón de personas del galpón | CONTROL TRACE |
| Usuarios | Quién entra al sistema, con qué rol y acceso | Todo CONTROL MAX |
| Roles y permisos | Qué módulos y qué pantallas ve cada rol | Todo CONTROL MAX |
| PIN y autorizadores | El PIN de supervisor para autorizar operaciones | TRACE y PLUS |
| Plan y módulos | Qué módulos tiene habilitados la empresa | El portal |

> 💡 No hay nada que sincronizar: cada dato se guarda en un solo lugar y todos los módulos lo leen de ahí. Los cambios de permisos se aplican cuando la persona vuelve a entrar al módulo.

> ⚠️ Si arriba aparece un aviso amarillo del tipo "corré … .sql en Supabase", falta activar una parte del sistema en la base de datos. Avisale al administrador del sistema: mientras tanto, esa parte no se puede guardar.

## Cambiar mi contraseña
<!-- id: mi-clave | grupo: Primeros pasos | roles: todos | resumen: Cada usuario cambia su propia contraseña -->
1. Arriba a la derecha, tocá **tu nombre**.
2. Escribí la **Nueva contraseña** (mínimo 6 caracteres) y repetila.
3. Tocá **💾 Guardar**.

> 💡 Si alguien se olvidó la contraseña, un administrador o supervisor se la **blanquea** desde [Usuarios](#usuarios).

## Datos de la empresa
<!-- id: empresa | grupo: Empresa | pantalla: empresa | roles: admin | resumen: Datos fiscales, domicilios, habilitaciones y logo -->
![Datos de la empresa](img/config/empresa.png)

### Paso a paso
1. En el menú, tocá **🏢 Datos de la empresa**.
2. En **Identificación**, completá:
   - **Razón social** (obligatoria) y **Nombre de fantasía**.
   - **CUIT** (obligatorio): el sistema controla el dígito verificador.
   - **Condición frente al IVA**: define la letra de las facturas en PLUS (A/B si es Responsable Inscripto, C si es Monotributista o Exento).
   - **Ingresos Brutos** e **Inicio de actividades**.
3. En **Domicilios y contacto**:
   - **Domicilio fiscal**: sale en los remitos de TRACE y en las facturas de PLUS.
   - **Localidad**, **Provincia**, **Teléfono** y **Email**.
   - **Domicilio de planta**: sale en las etiquetas.
4. En **Habilitaciones y numeración de remitos**:
   - **RENSPA** y **RNE**: salen en las etiquetas y los remitos.
   - **Punto de venta de remitos (TRACE)**: el prefijo del número de remito (por ejemplo, 0001).
5. Tocá **💾 Guardar**. Aparece "ya los usan TRACE y PLUS".

> ⚠️ El punto de venta de los **remitos** es distinto de los puntos de venta de las **facturas**, que se cargan en [Facturación y FCE](#facturacion).

### Logo
1. En **Logo**, tocá **⬆ Subir logo** y elegí la imagen (PNG o JPG, de hasta 1,5 MB).
2. Se guarda en el momento. Sale en el comprobante de recepción y en las etiquetas.

## Facturación y FCE
<!-- id: facturacion | grupo: Empresa | pantalla: facturacion | roles: admin | resumen: Puntos de venta, valores por defecto de PLUS y Factura de Crédito MiPyME -->
![Facturación y FCE](img/config/facturacion.png)

Es la misma configuración que se ve en **CONTROL PLUS → Configuración**: lo que se cambia en un lugar se ve en el otro.

### Puntos de venta
1. En **Puntos de venta habilitados en ARCA**, tocá **＋ Agregar**.
2. Completá el **Número** (como figura en ARCA), una **Descripción** (por ejemplo, "Casa central") y el **Sistema en ARCA**:
   - **Web Service**: CONTROL PLUS pide el CAE a ARCA al emitir.
   - **Factura en línea**, **Controlador fiscal** o **Manual**: el comprobante queda pendiente de CAE y el CAE se carga a mano en PLUS.
3. Si querés que se proponga en las facturas nuevas, tildá **Usar por defecto**.
4. Tocá **💾 Guardar**.

Con **✏️** se edita un punto de venta, y con **Desactivar** deja de ofrecerse (se puede volver a **Activar**).

> ⚠️ Para facturar desde el sistema, el punto de venta tiene que estar dado de alta en ARCA como **RECE para aplicativo y web services**.

### Valores por defecto
Lo que se propone al hacer una factura nueva en CONTROL PLUS:
- **Punto de venta por defecto**.
- **Alícuota IVA** de los productos que no tienen una propia en su ficha.
- **Concepto**: productos, servicios o ambos.
- **Días de vencimiento** de las facturas (para clientes que no tienen días propios).
- **Leyenda al pie de los comprobantes**.

### Factura de Crédito Electrónica MiPyME (FCE)
Se usa cuando el cliente es una empresa grande obligada a recibir FCE (se marca en su ficha de PLUS) y el comprobante supera el monto mínimo vigente de ARCA. Completá:
- **CBU del emisor** (22 dígitos, obligatorio) y **Alias CBU**.
- **Transferencia por defecto**: SCA (Sistema de Circulación Abierta) o ADC (Agente de Depósito Colectivo).
- **Monto mínimo FCE vigente**, según lo publicado por ARCA.
- **Leyenda adicional FCE** (opcional).

Al terminar, tocá **💾 Guardar** arriba a la derecha. Aparece "ya la usa CONTROL PLUS".

## Conexión con ARCA (factura electrónica)
<!-- id: arca | grupo: Empresa | pantalla: facturacion | roles: admin | resumen: Certificado, ambiente de pruebas y paso a producción -->
![Integración con ARCA](img/config/arca.png)

En **Facturación y FCE → Integración ARCA** se conecta CONTROL PLUS con ARCA para pedir el CAE de las facturas. Solo se envían los comprobantes de los puntos de venta **Web Service**.

### El estado de la conexión
Arriba de la sección se ve el estado:
| Indicador | Qué significa |
|---|---|
| ⚪ No conectado | La función de facturación no está instalada o no responde. Avisale al administrador del sistema |
| 🧪 Homologación (pruebas) | Conectado al ambiente de pruebas de ARCA: las facturas reales no se envían |
| 🟢 Producción | Las facturas de puntos de venta Web Service se envían a ARCA y tienen validez fiscal |
| Sin certificado | Todavía no se cargó el certificado de ARCA |
| Pedido generado · falta cargar el .crt | Ya se descargó el pedido; falta subir el certificado que da ARCA |
| Certificado OK · vence … | Listo para facturar, con la fecha de vencimiento del certificado |

### Paso a paso para conectar
1. Elegí el **Ambiente** (empezá por *🧪 Homologación*) y revisá el **CUIT emisor** (11 dígitos). Tocá **💾 Guardar ARCA**.
2. Tocá **🧪 Probar conexión**. Si todo anda, ARCA autoriza una factura de prueba y aparece "✅ Conexión funcionando".
3. Para producción, en **1 · Pedido de certificado para producción** tocá **📝 Generar y descargar pedido (.csr)**. La clave privada queda guardada en el sistema, nunca pasa por tu computadora.
4. En ARCA, entrá a **Administración de Certificados Digitales**, subí el archivo .csr y descargá el certificado (.crt).
5. En **2 · Certificado que te da ARCA (.crt)**, elegí ese archivo. Se guarda solo.
6. En ARCA, entrá al **Administrador de Relaciones** y autorizá el servicio **Facturación electrónica (wsfe)** para ese certificado.
7. Cambiá el **Ambiente** a *🟢 Producción* y tocá **💾 Guardar ARCA**. El sistema pide confirmación.

> ⚠️ Al pasar a **Producción**, las facturas de los puntos de venta Web Service se envían a ARCA y tienen validez fiscal. Hacelo cuando las pruebas hayan salido bien.

> ⚠️ Si generás un **pedido nuevo** teniendo ya un certificado, el certificado actual deja de usarse hasta que cargues el nuevo .crt.

> 💡 Si el estado dice "Falta el secreto AFIPSDK_TOKEN", falta un dato de la instalación del sistema: avisale al administrador del sistema.

## Operarios
<!-- id: operarios | grupo: Empresa | pantalla: operarios | roles: admin | resumen: El padrón de personas del galpón que usa TRACE -->
![Operarios](img/config/operarios.png)

Es el padrón de las personas que trabajan en el galpón. CONTROL TRACE lo usa en **"Recibido por"** de la recepción y en producción y etiquetado. Los operarios **no son usuarios**: no entran al sistema.

1. Tocá **＋ Agregar operario**.
2. Escribí el **Nombre y apellido** y elegí el **Área**: recepción, producción, despacho o general.
3. Tocá **💾 Guardar**.

Con **✏️** se corrige un operario. Si alguien deja de trabajar, tocá **Desactivar**: deja de ofrecerse en TRACE, pero sigue apareciendo en los registros anteriores. Se puede volver a **Activar**.

## Usuarios
<!-- id: usuarios | grupo: Accesos | pantalla: usuarios | roles: admin, supervisor | resumen: Dar de alta, cambiar rol o acceso, blanquear la clave y dar de baja -->
![Usuarios](img/config/usuarios.png)

La lista muestra a cada usuario con su **correo**, **rol**, **acceso** y **estado**. Tu propio usuario aparece marcado como **vos** y no se puede cambiar desde acá.

### Dar de alta un usuario
1. Tocá **＋ Nuevo usuario**.
2. Completá el **Nombre y apellido** y el **Correo** con el que va a ingresar.
3. Escribí una **Contraseña inicial** (mínimo 6 caracteres). Pedile que la cambie después (ver [Cambiar mi contraseña](#mi-clave)).
4. Elegí el **Rol**: define qué puede hacer en cada módulo (ver [Roles](#roles)).
5. Elegí el **Acceso a CONTROL TRACE**: *Galpón* (entra a TRACE), *Finca* (entra a CONTROLAGRO) o *Administrador* (todos los módulos).
6. Tocá **💾 Guardar**. Ya puede ingresar desde el portal CONTROL MAX con ese correo y contraseña.

![Nuevo usuario](img/config/usuario-nuevo.png)

> 💡 El **acceso** es solo para CONTROL TRACE y CONTROLAGRO. Los demás módulos (PLUS, TOTAL, DOCS, RRHH) los habilita el **rol**. Por ejemplo, para un Jefe de RRHH dejá el acceso en *Galpón*.

### Cambiar el rol o el acceso
Elegí el nuevo valor en las columnas **Rol** o **Acceso** de la lista. Se guarda en el momento ("Rol actualizado"). La persona lo ve la próxima vez que entra a cada módulo.

### Blanquear la contraseña
1. Tocá **🔑 Blanquear clave** en la fila del usuario.
2. Escribí una **Contraseña temporal** (mínimo 6 caracteres) y tocá **🔑 Blanquear**.
3. Pasale la contraseña temporal a la persona y pedile que la cambie.

### Dar de baja
**Dar de baja** impide que el usuario ingrese, sin borrar nada de lo que registró. Se puede **Activar** de nuevo.

> 🔒 El **Supervisor** puede crear y editar usuarios, pero no puede crear administradores ni modificar a un administrador o dueño.

## Roles: qué hace cada uno
<!-- id: roles | grupo: Accesos | pantalla: permisos | roles: admin, supervisor | resumen: Los roles de CONTROL MAX y lo que ven de entrada -->
| Rol | Para quién es | Módulos que ve de entrada |
|---|---|---|
| Administrador | Quien administra el sistema | Todos, siempre, incluida Configuración |
| Dueño | Dueños o socios | Todos, siempre, incluida Configuración |
| Supervisor | Jefe de planta o encargado | TRACE, PLUS, TOTAL y DOCS; en Configuración, solo Usuarios |
| Comercial | Ventas y atención de clientes | TRACE, PLUS y DOCS |
| Preparador | Operarios con usuario en el galpón | TRACE y DOCS |
| Chofer | Reparto | TRACE (validación de carga) |
| Jefe de RRHH | Recursos humanos | RRHH, TOTAL (solo reportes de RRHH) y DOCS |

"De entrada" quiere decir lo que ve cada rol mientras no se cambie en [Roles y permisos](#permisos). El Administrador y el Dueño ven todo siempre, para que la empresa nunca se quede sin acceso.

![Cómo se decide qué ve cada usuario](img/config/accesos.svg)

## Roles y permisos
<!-- id: permisos | grupo: Accesos | pantalla: permisos | roles: admin | resumen: Qué módulos, pantallas de TRACE y secciones de PLUS ve cada rol -->
![Roles y permisos](img/config/permisos.png)

En **🛡️ Roles y permisos** hay cuatro tablas con una columna por rol. Tildá lo que cada rol puede ver y tocá **💾 Guardar permisos**.

1. **Módulos de CONTROL MAX que ve cada rol en el portal**: TRACE, PLUS, CONTROLAGRO, TOTAL, DOCS y RRHH. Si un módulo no está en el plan de la empresa, aparece marcado "no está en el plan".
2. **Pantallas de CONTROL TRACE**: Recepción, Producción, Pedidos, Remitos, Etiquetas, Stock, etc. El Panel lo ven todos.
3. **Secciones de CONTROL PLUS**: Dashboard, Ventas, Compras, Entidades, Inventario, Caja y Banco. Solo aplica a los roles que tienen CONTROL PLUS tildado en la primera tabla.
4. **CONTROL DOCS: quién publica**: qué roles pueden publicar, republicar y retirar documentos del muro. Qué ve cada uno se elige al publicar cada documento.

> 💡 Los permisos se aplican cuando la persona **vuelve a entrar** a cada módulo (o recarga la página).

> 🔒 La **Configuración** (la de CONTROL MAX y la de PLUS) es siempre solo para el Administrador y el Dueño.

### Ejemplo: que el rol Comercial no vea Caja ni Banco en PLUS
1. En la tabla **3 · Secciones de CONTROL PLUS**, destildá **Caja** y **Banco** en la columna *Comercial*.
2. Tocá **💾 Guardar permisos**.
3. La próxima vez que un comercial entre a PLUS, esas secciones no aparecen en su menú.

## PIN y autorizadores
<!-- id: seguridad | grupo: Accesos | pantalla: seguridad | roles: admin | resumen: El PIN único de supervisor y las personas que pueden autorizar -->
![PIN y autorizadores](img/config/seguridad.png)

Hay **un único PIN** para todo CONTROL MAX. TRACE lo pide para anular, editar, desbloquear o ajustar stock, y PLUS para facturar con el crédito excedido y para anular recibos o pagos, entre otras operaciones.

### Cambiar el PIN del supervisor principal
1. En **🔐 PIN y autorizadores**, completá el **Nombre** del supervisor principal.
2. Escribí el **PIN** (mínimo 4 caracteres) y repetilo en **Repetir PIN**.
3. Tocá **💾 Guardar**. Aparece "vale para TRACE y PLUS".

> ⚠️ Si el PIN está en **1234** (el que viene de fábrica) o vacío, aparece un aviso amarillo: conviene cambiarlo.

### Autorizadores adicionales
Son personas que también pueden autorizar con **su propio PIN** cuando el supervisor no está. Se pueden cargar hasta tres.
1. Completá el **Nombre** y el **PIN** de cada autorizador.
2. Tocá **💾 Guardar**.

- Cada persona tiene que tener un **PIN distinto**.
- Para quitar a un autorizador, **borrá su PIN** y guardá.
- **Mostrar PINes** deja ver lo que está escrito.

> 💡 Cada vez que alguien autoriza con su PIN, queda registrado **quién** lo hizo (se ve en Auditoría de CONTROL TOTAL).

## Plan y módulos
<!-- id: plan | grupo: Suscripción | pantalla: plan | roles: admin | resumen: Qué módulos tiene habilitados la empresa -->
![Plan y módulos](img/config/plan.png)

Define qué módulos de CONTROL MAX tiene habilitados la empresa.
1. Elegí el **Plan**: Completo, Profesional, Básico o Personalizado.
2. Tildá los módulos habilitados. Los que no estén tildados aparecen en el portal como **"No en tu plan"** y nadie puede entrar.
3. Tocá **💾 Guardar**.

> ⚠️ Tiene que quedar al menos un módulo operativo: CONTROL TRACE, CONTROL PLUS o CONTROLAGRO.

> 💡 Configuración siempre está habilitada para el administrador, sea cual sea el plan.

## Problemas frecuentes
<!-- id: problemas | grupo: Ayuda | roles: todos | resumen: Mensajes del sistema y qué hacer -->
### "Ese correo ya tiene un usuario"
La persona ya está dada de alta. Buscala en la lista de Usuarios y cambiale el rol o el acceso (si está dada de baja, tocá **Activar**). Si no, usá otro correo.

### "No se pudieron cargar los usuarios"
La función que administra los usuarios no responde. Avisale al administrador del sistema.

### "La función … no acepta el rol"
El rol elegido no está habilitado en la instalación. Creá el usuario con otro rol (por ejemplo, Preparador) y avisale al administrador del sistema para que le asigne el rol correcto.

### Cambié los permisos y la persona sigue viendo lo mismo
Los permisos se aplican al volver a entrar al módulo. Pedile que recargue la página.

### "El CUIT no es válido"
Revisá los 11 dígitos: el último es un dígito verificador que se calcula con los anteriores.

### "Cada persona tiene que tener un PIN distinto"
Dos autorizadores (o un autorizador y el supervisor principal) tienen el mismo PIN. Cambiá uno de los dos.

### "Esa sección es solo para administradores"
Con rol Supervisor solo se puede entrar a Usuarios.

### Aviso amarillo "corré … .sql"
Falta activar una parte del sistema en la base de datos. Avisale al administrador del sistema.
