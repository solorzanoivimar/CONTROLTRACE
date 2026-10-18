// ════════════════════════════════════════════════════════════════════════════
// CONTROL MAX · Edge Function "leer-comprobante" · lee una factura / ticket (PDF o foto) con IA
// ────────────────────────────────────────────────────────────────────────────
// Body JSON: { archivo: <base64 sin encabezado>, mime: "application/pdf" | "image/jpeg" | "image/png" | "image/webp",
//              tipo: "compra" | "gasto", categorias?: string[] }
// Devuelve: { ok:true, datos:{...}, uso:{entrada,salida}, modelo }  — NO guarda nada: PLUS llena el formulario y la persona confirma.
// Secretos necesarios en Supabase (Edge Functions → Secrets):
//   ANTHROPIC_API_KEY = clave de la API de Claude (console.anthropic.com → API keys)
//   CLAUDE_MODEL      = (opcional) modelo a usar; por defecto claude-sonnet-5-5
// ════════════════════════════════════════════════════════════════════════════
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const MIMES_IMG = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_B64 = 14_000_000; // ~10 MB de archivo

const num = { type: "number" };
const str = { type: "string" };
const SCHEMA = {
  type: "object",
  properties: {
    es_comprobante: { type: "boolean", description: "false si la imagen/PDF no es un comprobante (factura, ticket, nota de crédito/débito, recibo, remito valorizado)" },
    tipo: { type: "string", enum: ["Factura", "Nota de crédito", "Nota de débito", "Ticket", "Recibo", "Remito", "Otro"] },
    letra: { type: "string", enum: ["A", "B", "C", "M", "X", ""], description: "Letra del comprobante (recuadro arriba al centro). Vacío si no tiene." },
    punto_venta: { type: "integer", description: "Punto de venta (los primeros 4-5 dígitos del número)" },
    numero: { type: "integer", description: "Número del comprobante (los últimos 8 dígitos)" },
    fecha: { type: "string", description: "Fecha de emisión YYYY-MM-DD" },
    vencimiento: { type: "string", description: "Fecha de vencimiento del pago YYYY-MM-DD, vacío si no figura" },
    proveedor: { type: "object", description: "EMISOR del comprobante (quien vende). Nunca el receptor/cliente.", properties: {
      razon_social: str, cuit: { type: "string", description: "CUIT del emisor, solo dígitos (11)" },
      condicion_iva: { type: "string", enum: ["Responsable Inscripto", "Monotributista", "Exento", "Consumidor Final", ""] },
      domicilio: str }, required: ["razon_social", "cuit"] },
    cae: { type: "string", description: "CAE o CAI si figura, solo dígitos" },
    cae_vto: { type: "string", description: "Vencimiento del CAE YYYY-MM-DD" },
    moneda: { type: "string", enum: ["PES", "DOL"] },
    precios_con_iva: { type: "boolean", description: "true si los precios de los renglones incluyen IVA (típico de facturas B/C y tickets)" },
    items: { type: "array", description: "Renglones tal como figuran. Si es un servicio sin renglones, un solo renglón con la descripción.", items: { type: "object", properties: {
      codigo: { type: "string", description: "Código del artículo del proveedor, si figura" },
      descripcion: str, cantidad: num,
      unidad: { type: "string", description: "kg, u, caja, bulto, l, etc." },
      precio_unitario: { type: "number", description: "Precio unitario tal como figura (con bonificación aplicada)" },
      alicuota_iva: { type: "number", description: "21, 10.5, 27, 0 (exento) — si no figura por renglón, la del comprobante" },
      importe: { type: "number", description: "Importe del renglón tal como figura" } }, required: ["descripcion", "cantidad", "importe"] } },
    neto_gravado_21: num, neto_gravado_105: num, neto_gravado_27: num, no_gravado: num, exento: num,
    iva_21: num, iva_105: num, iva_27: num,
    percepcion_iva: num, percepcion_iibb: num, otros_tributos: { type: "number", description: "Impuestos internos, tasas municipales y otros tributos" },
    total: num,
    categoria_gasto: { type: "string", description: "Solo para gastos: la categoría de la lista que mejor corresponda" },
    concepto: { type: "string", description: "Concepto breve en castellano para el registro, ej: 'Luz galpón septiembre 2026', 'Combustible camioneta'" },
    advertencias: { type: "array", items: str, description: "Dudas: datos ilegibles, sumas que no cierran, documento cortado, etc." },
    confianza: { type: "string", enum: ["alta", "media", "baja"] },
  },
  required: ["es_comprobante", "tipo", "letra", "fecha", "proveedor", "items", "total", "confianza"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const URL_ = Deno.env.get("SUPABASE_URL"), ANON = Deno.env.get("SUPABASE_ANON_KEY"), SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const userSb = createClient(URL_, ANON, { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } });
  const db = createClient(URL_, SRV);
  try {
    const { data: { user } } = await userSb.auth.getUser();
    if (!user) return json({ error: "Sesión no válida. Volvé a ingresar." }, 401);
    const { data: pf } = await db.from("perfiles").select("empresa_id,activo").eq("id", user.id).single();
    if (!pf || pf.activo === false) return json({ error: "Usuario sin empresa o inactivo." }, 403);
    const KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!KEY) return json({ error: "Falta configurar el secreto ANTHROPIC_API_KEY en Supabase (Edge Functions → Secrets)." }, 500);
    const MODEL = Deno.env.get("CLAUDE_MODEL") || "claude-sonnet-5-5";

    let body: any = {}; try { body = await req.json(); } catch { /* vacío */ }
    const b64 = String(body.archivo || "").replace(/^data:[^,]*,/, ""), mime = String(body.mime || "").toLowerCase();
    if (!b64) return json({ error: "No llegó ningún archivo." }, 400);
    if (b64.length > MAX_B64) return json({ error: "El archivo es muy grande (máx. ~10 MB). Probá con una foto más chica o un PDF de menos páginas." }, 400);
    let bloque;
    if (mime === "application/pdf") bloque = { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } };
    else if (MIMES_IMG.includes(mime)) bloque = { type: "image", source: { type: "base64", media_type: mime, data: b64 } };
    else return json({ error: "Formato no soportado (" + (mime || "desconocido") + "). Subí un PDF o una foto JPG/PNG." }, 400);

    const { data: cfg } = await db.from("plus_config").select("cuit,razon_social").eq("empresa_id", pf.empresa_id).maybeSingle();
    const receptor = cfg ? `${cfg.razon_social || ""} (CUIT ${cfg.cuit || "?"})` : "nuestra empresa";
    const cats = Array.isArray(body.categorias) ? body.categorias.slice(0, 40).join(" | ") : "";
    const prompt = `Sos un asistente contable argentino. Leé este comprobante de ${body.tipo === "gasto" ? "GASTO" : "COMPRA"} recibido por ${receptor}.
Extraé los datos con la herramienta registrar_comprobante. Reglas:
- El PROVEEDOR es el EMISOR (arriba a la izquierda, junto al logo). ${receptor} es el RECEPTOR: nunca lo pongas como proveedor.
- CUIT solo con dígitos. Fechas en formato YYYY-MM-DD (en Argentina las fechas vienen como día/mes/año).
- Los números con formato argentino (1.234,56) devolvelos como número (1234.56).
- Si es factura A: separá neto gravado por alícuota e IVA. Si es B, C o ticket, los precios suelen incluir IVA: poné precios_con_iva=true y el total en "no_gravado" si no está discriminado.
- No inventes datos: si algo no se lee, dejalo vacío o en 0 y explicalo en "advertencias".
- Verificá que neto + IVA + percepciones + otros = total; si no cierra, avisalo en "advertencias".${cats ? `\n- Categoría de gasto: elegí UNA de esta lista: ${cats}.` : ""}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL, max_tokens: 4096,
        tools: [{ name: "registrar_comprobante", description: "Registra los datos leídos del comprobante", input_schema: SCHEMA }],
        tool_choice: { type: "tool", name: "registrar_comprobante" },
        messages: [{ role: "user", content: [bloque, { type: "text", text: prompt }] }],
      }),
    });
    const txt = await res.text(); let out: any; try { out = JSON.parse(txt); } catch { out = { raw: txt }; }
    if (!res.ok) {
      const m = (out && out.error && out.error.message) || txt.slice(0, 300);
      const amigable = res.status === 401 ? "La clave ANTHROPIC_API_KEY no es válida." : res.status === 429 ? "Demasiados pedidos seguidos: esperá un momento y volvé a probar." : /credit|billing|balance/i.test(m) ? "La cuenta de Anthropic no tiene crédito disponible (Console → Billing)." : "";
      return json({ error: (amigable ? amigable + " " : "") + `(IA ${res.status}: ${m})` }, 502);
    }
    const tu = (out.content || []).find((c) => c.type === "tool_use");
    if (!tu) return json({ error: "La IA no devolvió datos. Probá con una imagen más nítida." }, 502);
    return json({ ok: true, datos: tu.input, uso: { entrada: out.usage?.input_tokens || 0, salida: out.usage?.output_tokens || 0 }, modelo: MODEL });
  } catch (e) {
    return json({ error: String(e && e.message || e) }, 500);
  }
});
