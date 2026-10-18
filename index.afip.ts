// ════════════════════════════════════════════════════════════════════════════
// CONTROL MAX · Edge Function "facturar" · Factura electrónica ARCA (WSFEv1) vía Afip SDK
// ────────────────────────────────────────────────────────────────────────────
// Acciones (body JSON: { accion, ... }):
//   estado            → configuración ARCA de la empresa (sin claves) + puntos de venta
//   guardar_config    → ambiente, CUIT, PV de prueba, certificado (solo admin)
//   generar_csr       → crea clave privada (queda guardada acá) y devuelve el pedido de certificado (CSR) para subir a ARCA
//   probar            → factura B de prueba en HOMOLOGACIÓN (no toca ningún comprobante)
//   emitir            → { comprobante_id } solicita CAE. En homologación es una simulación: no se guarda el CAE.
// Secretos necesarios en Supabase (Edge Functions → Secrets):
//   AFIPSDK_TOKEN  = access token de app.afipsdk.com
//   (SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY ya los pone Supabase)
// ════════════════════════════════════════════════════════════════════════════
import { createClient } from "npm:@supabase/supabase-js@2";
import forge from "npm:node-forge@1.3.1";

// ───────────────────────── funciones puras (testeadas) ─────────────────────────
const TEST_CUIT = 20409378472; // CUIT de pruebas de Afip SDK (homologación sin certificado)
const r2 = (n) => Math.round((Number(n) || 0) * 100 + Number.EPSILON) / 100;
const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
const arr = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const ymd = (s) => Number(String(s || "").slice(0, 10).replace(/-/g, ""));
const fromYmd = (s) => { s = String(s || ""); return s.length === 8 ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : null; };
const IVA_ALIC_ID = { "0": 3, "2.5": 9, "5": 8, "10.5": 4, "21": 5, "27": 6 };

// Arma el FECAEDetRequest a partir de un comprobante de PLUS y sus ítems.
// asoc = comprobante asociado (NC/ND), cuitEmisor = CUIT del emisor (número)
function armarDetalle(c, items, nro, asoc, cuitEmisor) {
  const letra = String(c.letra || "").toUpperCase();
  const sinIva = letra === "C";
  const det: any = {
    Concepto: Number(c.concepto) || 1,
    DocTipo: Number(c.doc_tipo) || 99,
    DocNro: Number(String(c.doc_nro || "0").replace(/\D/g, "")) || 0,
    CbteDesde: nro,
    CbteHasta: nro,
    CbteFch: ymd(c.fecha),
    ImpTotal: r2(c.total),
    ImpTotConc: 0,
    ImpNeto: 0,
    ImpOpEx: 0,
    ImpIVA: 0,
    ImpTrib: r2(c.tributos),
    MonId: c.moneda === "DOL" ? "DOL" : "PES",
    MonCotiz: c.moneda === "DOL" ? (num(c.cotizacion) || 1) : 1,
    CondicionIVAReceptorId: Number(c.cliente_iva_id) || 5,
  };
  if (det.MonId !== "PES") det.CanMisMonExt = "N"; // RG 5616: ¿se cancela en la misma moneda extranjera?
  if (sinIva) {
    // Factura C: todo va como neto, sin discriminar IVA
    det.ImpNeto = r2(num(c.neto_gravado) + num(c.neto_no_gravado) + num(c.exento));
  } else {
    det.ImpTotConc = r2(c.neto_no_gravado);
    det.ImpOpEx = r2(c.exento);
    // Bases por alícuota desde los ítems
    const g: Record<string, any> = {};
    for (const i of items || []) {
      const a = num(i.alicuota_iva);
      if (a > 0) { const k = String(a); g[k] = g[k] || { base: 0, iva: 0 }; g[k].base += num(i.neto); g[k].iva += num(i.iva); }
    }
    const ivaCab = { "10.5": r2(c.iva_105), "21": r2(c.iva_21), "27": r2(c.iva_27) };
    const lista = Object.entries(g).map(([k, v]) => ({ Id: IVA_ALIC_ID[k], BaseImp: r2(v.base), Importe: ivaCab[k] != null ? ivaCab[k] : r2(v.iva) })).sort((a, b) => a.Id - b.Id);
    // Si no hay ítems (comprobante por importes), se arma desde la cabecera
    if (!lista.length && num(c.neto_gravado) > 0) {
      const ivas = [["10.5", c.iva_105], ["21", c.iva_21], ["27", c.iva_27]].filter(([, v]) => num(v) > 0);
      if (ivas.length === 1) lista.push({ Id: IVA_ALIC_ID[ivas[0][0]], BaseImp: r2(c.neto_gravado), Importe: r2(ivas[0][1]) });
    }
    // Ajuste de centavos: la suma de bases tiene que dar el neto gravado
    const neto = r2(c.neto_gravado);
    const sumB = r2(lista.reduce((s, x) => s + x.BaseImp, 0));
    if (lista.length && Math.abs(sumB - neto) > 0 && Math.abs(sumB - neto) <= 0.05) {
      const big = lista.reduce((a, b) => (b.BaseImp > a.BaseImp ? b : a)); big.BaseImp = r2(big.BaseImp + (neto - sumB));
    }
    det.ImpNeto = neto;
    det.ImpIVA = r2(lista.reduce((s, x) => s + x.Importe, 0));
    if (lista.length) det.Iva = { AlicIva: lista };
  }
  // Total = suma exacta de las partes (ARCA lo valida)
  det.ImpTotal = r2(det.ImpTotConc + det.ImpNeto + det.ImpOpEx + det.ImpIVA + det.ImpTrib);
  if (det.ImpTrib > 0) {
    const base = det.ImpNeto || det.ImpTotal;
    det.Tributos = { Tributo: [{ Id: 99, Desc: "Percepciones / otros tributos", BaseImp: r2(base), Alic: base ? r2((det.ImpTrib / base) * 100) : 0, Importe: det.ImpTrib }] };
  }
  // Servicios: período y vencimiento obligatorios
  if (det.Concepto === 2 || det.Concepto === 3) {
    det.FchServDesde = ymd(c.serv_desde || c.fecha);
    det.FchServHasta = ymd(c.serv_hasta || c.fecha);
    det.FchVtoPago = ymd(c.fecha_vto || c.fecha);
  }
  // FCE MiPyME
  const opc = [];
  if (c.es_fce) {
    if (c.clase === "factura") {
      det.FchVtoPago = ymd(c.fce_vto_pago || c.fecha_vto);
      if (c.fce_cbu) opc.push({ Id: "2101", Valor: String(c.fce_cbu).replace(/\D/g, "") });
      if (c.fce_alias) opc.push({ Id: "2102", Valor: String(c.fce_alias) });
      opc.push({ Id: "27", Valor: c.fce_modalidad === "ADC" ? "ADC" : "SCA" });
    } else {
      opc.push({ Id: "22", Valor: c.fce_anulacion === "S" ? "S" : "N" });
    }
  }
  if (opc.length) det.Opcionales = { Opcional: opc };
  // NC / ND: comprobante asociado
  if (asoc) {
    det.CbtesAsoc = { CbteAsoc: [{ Tipo: Number(asoc.cbte_tipo), PtoVta: Number(asoc.punto_venta), Nro: Number(asoc.numero), Cuit: String(cuitEmisor), CbteFch: ymd(asoc.fecha) }] };
  }
  return det;
}

// Controles previos (devuelve lista de problemas en castellano)
function validar(c, asoc) {
  const p = [];
  if (!["factura", "nc", "nd"].includes(c.clase)) p.push("Solo se envían a ARCA facturas, notas de crédito y notas de débito.");
  if (!["A", "B", "C", "M"].includes(String(c.letra || "").toUpperCase())) p.push("La letra del comprobante no es fiscal (" + (c.letra || "—") + ").");
  if (!c.cbte_tipo) p.push("Falta el tipo de comprobante.");
  if (!c.fecha) p.push("Falta la fecha.");
  if (num(c.total) <= 0) p.push("El total tiene que ser mayor a cero.");
  if (String(c.letra).toUpperCase() === "A" && Number(c.doc_tipo) !== 80) p.push("La factura A requiere el CUIT del cliente.");
  if (["nc", "nd"].includes(c.clase)) {
    if (!asoc) p.push("La nota de crédito/débito necesita el comprobante asociado.");
    else if (!asoc.cae) p.push("El comprobante asociado todavía no tiene CAE.");
  }
  if (c.es_fce && c.clase === "factura") {
    if (String(c.fce_cbu || "").replace(/\D/g, "").length !== 22) p.push("La FCE necesita el CBU del emisor (22 dígitos).");
    if (!(c.fce_vto_pago || c.fecha_vto)) p.push("La FCE necesita la fecha de vencimiento del pago.");
  }
  return p;
}

// Lee la respuesta de FECAESolicitar (tolera objeto/array y con o sin "...Result")
function leerCAE(resp) {
  const r = resp && (resp.FECAESolicitarResult || resp);
  const cab = (r && r.FeCabResp) || {};
  const det = arr(r && r.FeDetResp && r.FeDetResp.FECAEDetResponse)[0] || {};
  const obs = arr(det.Observaciones && det.Observaciones.Obs).map((o) => `(${o.Code}) ${o.Msg}`);
  const errs = arr(r && r.Errors && r.Errors.Err).map((o) => `(${o.Code}) ${o.Msg}`);
  const resultado = det.Resultado || cab.Resultado || (errs.length ? "R" : "");
  return { resultado, cae: det.CAE ? String(det.CAE) : null, vto: fromYmd(det.CAEFchVto), nro: Number(det.CbteDesde) || null, obs, errs };
}
function leerUltimo(resp) { const r = resp && (resp.FECompUltimoAutorizadoResult || resp); const errs = arr(r && r.Errors && r.Errors.Err).map((o) => `(${o.Code}) ${o.Msg}`); return { nro: Number(r && r.CbteNro) || 0, errs }; }
function leerConsulta(resp) { const r = resp && (resp.FECompConsultarResult || resp); const g = (r && r.ResultGet) || null; return g ? { cae: g.CodAutorizacion ? String(g.CodAutorizacion) : null, vto: fromYmd(g.FchVto), fecha: fromYmd(g.CbteFch), total: num(g.ImpTotal), docNro: Number(g.DocNro) || 0, resultado: g.Resultado } : null; }

// QR fiscal (RG 4892)
function urlQR(o) { const j = JSON.stringify(o); const b = btoa(j); return "https://www.afip.gob.ar/fe/qr/?p=" + b; }

// ═══════════════════════════ FIN funciones puras ═══════════════════════════

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const API = "https://app.afipsdk.com/api/v1/afip";

async function afipsdk(path, body) {
  const tok = Deno.env.get("AFIPSDK_TOKEN");
  if (!tok) throw new Error("Falta configurar el secreto AFIPSDK_TOKEN en Supabase (Edge Functions → Secrets).");
  const res = await fetch(`${API}/${path}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` }, body: JSON.stringify(body) });
  const txt = await res.text(); let data; try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
  if (!res.ok) throw new Error(`Afip SDK ${res.status}: ${data.message || data.error || txt.slice(0, 300)}`);
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const URL_ = Deno.env.get("SUPABASE_URL"), ANON = Deno.env.get("SUPABASE_ANON_KEY"), SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authH = req.headers.get("Authorization") || "";
  const userSb = createClient(URL_, ANON, { global: { headers: { Authorization: authH } } });
  const db = createClient(URL_, SRV);
  let body: any = {}; try { body = await req.json(); } catch { /* vacío */ }
  const accion = body.accion || "estado";
  let empresaId = null, usuario = "", rol = "";
  const log = async (o) => { try { await db.from("arca_log").insert({ empresa_id: empresaId, usuario, ...o }); } catch { /* sin log */ } };
  try {
    const { data: { user } } = await userSb.auth.getUser();
    if (!user) return json({ error: "Sesión no válida. Volvé a ingresar." }, 401);
    const { data: pf } = await db.from("perfiles").select("empresa_id,rol,nombre,activo").eq("id", user.id).single();
    if (!pf || pf.activo === false) return json({ error: "Usuario sin empresa o inactivo." }, 403);
    empresaId = pf.empresa_id; rol = String(pf.rol || "").toLowerCase(); usuario = pf.nombre || user.email || "";
    const esAdmin = ["admin", "administrador", "dueno", "dueño"].includes(rol);

    const { data: cfgA } = await db.from("arca_credenciales").select("*").eq("empresa_id", empresaId).maybeSingle();
    const { data: plusCfg } = await db.from("plus_config").select("cuit,razon_social,fce_cbu,fce_alias,fce_modalidad").eq("empresa_id", empresaId).maybeSingle();
    const cuitEmpresa = Number(String((plusCfg && plusCfg.cuit) || "").replace(/\D/g, "")) || null;
    const amb = (cfgA && cfgA.ambiente) || "dev";
    const tieneCert = !!(cfgA && cfgA.cert && cfgA.key);
    // CUIT con el que se habla con ARCA: en homologación sin certificado propio se usa el CUIT de pruebas de Afip SDK
    // (un certificado de producción no sirve en homologación: ahí siempre se usa el CUIT de pruebas)
    const cuitWs = amb === "prod" ? Number((cfgA && cfgA.cuit) || cuitEmpresa) : TEST_CUIT;

    // Ticket de acceso (token/sign) — se guarda hasta que vence para no gastar consultas
    const ticket = async (environment, cuit) => {
      const usaCert = environment === "prod";
      if (cfgA && cfgA.ta_token && cfgA.ta_exp && cfgA.ta_env === environment && Number(cfgA.ta_cuit) === cuit && new Date(cfgA.ta_exp).getTime() - Date.now() > 10 * 60 * 1000) return { Token: cfgA.ta_token, Sign: cfgA.ta_sign, Cuit: cuit };
      const b: any = { environment, tax_id: String(cuit), wsid: "wsfe" }; if (usaCert) { b.cert = cfgA.cert; b.key = cfgA.key; }
      const t = await afipsdk("auth", b);
      await db.from("arca_credenciales").upsert({ empresa_id: empresaId, ta_token: t.token, ta_sign: t.sign, ta_exp: t.expiration, ta_env: environment, ta_cuit: cuit }, { onConflict: "empresa_id" });
      return { Token: t.token, Sign: t.sign, Cuit: cuit };
    };
    const ws = (environment, method, params) => afipsdk("requests", { environment, method, wsid: "wsfe", params });
    // Homologación: el CUIT de pruebas lo comparten todos los usuarios de Afip SDK. Otro puede emitir entre nuestra
    // consulta y nuestro envío, o dejar un comprobante con fecha posterior (error 10016). Se reintenta con número y fecha al día.
    const hoyAR = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
    const sumarDias = (f, d) => { const x = new Date(f + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10); };
    const emitirPrueba = async (Auth, pv0, tipo, base, items, asoc, cuit) => {
      // Si en un punto de venta de pruebas alguien dejó un comprobante con fecha más allá de hoy+5, ese PV queda
      // inutilizable hasta esa fecha: se prueba con otros puntos de venta.
      const pvs = [pv0, ...Array.from({ length: 4 }, () => 2 + Math.floor(Math.random() * 9000))];
      let r = null, nro = 0, pv = pv0;
      const hoy = hoyAR(), tope = sumarDias(hoy, 5);
      for (const p of pvs) {
        pv = p;
        for (let i = 0; i < 3; i++) {
          const u = leerUltimo(await ws("dev", "FECompUltimoAutorizado", { Auth, PtoVta: pv, CbteTipo: tipo }));
          if (u.errs.length) { r = { resultado: "R", cae: null, vto: null, nro: null, obs: [], errs: u.errs }; break; }
          nro = u.nro + 1; let fecha = hoy;
          if (u.nro > 0) { const q = leerConsulta(await ws("dev", "FECompConsultar", { Auth, FeCompConsReq: { CbteTipo: tipo, CbteNro: u.nro, PtoVta: pv } })); if (q && q.fecha && q.fecha > fecha) fecha = q.fecha; }
          if (fecha > tope) { r = { resultado: "R", cae: null, vto: null, nro: null, obs: [`(PV ${pv}) el ultimo comprobante de pruebas tiene fecha ${fecha}`], errs: [] }; break; }
          const det = armarDetalle({ ...base, fecha }, items, nro, asoc, cuit);
          r = leerCAE(await ws("dev", "FECAESolicitar", { Auth, FeCAEReq: { FeCabReq: { CantReg: 1, PtoVta: pv, CbteTipo: tipo }, FeDetReq: { FECAEDetRequest: det } } }));
          if (r.resultado === "A" || !/10016/.test([...r.obs, ...r.errs].join(" "))) break;
        }
        if (r && r.resultado === "A") break;
        // Rechazo por el contenido (no por número, fecha o punto de venta): no tiene sentido probar en otro PV
        const t = r ? [...r.obs, ...r.errs].join(" ") : "";
        if (r && !/10016|ultimo comprobante de pruebas|PtoVta|punto de venta|1000[45]/i.test(t)) break;
      }
      return { r, nro, pv };
    };

    // ───────────── estado ─────────────
    if (accion === "estado") {
      return json({ ok: true, ambiente: amb, cuit: cfgA && cfgA.cuit, cuit_empresa: cuitEmpresa, tiene_certificado: tieneCert, csr_pendiente: !!(cfgA && cfgA.key && !cfgA.cert),
        pv_prueba: (cfgA && cfgA.pv_prueba) || 1, test_cuit: TEST_CUIT, token_configurado: !!Deno.env.get("AFIPSDK_TOKEN"), cert_vence: (cfgA && cfgA.cert_vence) || null, cuit_ws: cuitWs });
    }
    // ───────────── guardar_config ─────────────
    if (accion === "guardar_config") {
      if (!esAdmin) return json({ error: "Solo un administrador puede cambiar la configuración de ARCA." }, 403);
      const up: any = { empresa_id: empresaId, updated_at: new Date().toISOString() };
      if (body.ambiente) up.ambiente = body.ambiente === "prod" ? "prod" : "dev";
      if (body.cuit) up.cuit = String(body.cuit).replace(/\D/g, "");
      if (body.pv_prueba) up.pv_prueba = Number(body.pv_prueba) || 1;
      if (body.cert) {
        const pem = String(body.cert).trim();
        if (!/BEGIN CERTIFICATE/.test(pem)) return json({ error: "El archivo no parece un certificado (.crt / .pem)." }, 400);
        try { const c = forge.pki.certificateFromPem(pem); up.cert_vence = c.validity.notAfter.toISOString(); } catch { return json({ error: "No se pudo leer el certificado." }, 400); }
        up.cert = pem; up.ta_token = null; up.ta_exp = null;
      }
      if (body.key) { const k = String(body.key).trim(); if (!/PRIVATE KEY/.test(k)) return json({ error: "El archivo no parece una clave privada (.key)." }, 400); up.key = k; up.ta_token = null; up.ta_exp = null; }
      if (up.ambiente === "prod" && !(up.cert || (cfgA && cfgA.cert))) return json({ error: "Para pasar a producción primero cargá el certificado de ARCA." }, 400);
      const { error } = await db.from("arca_credenciales").upsert(up, { onConflict: "empresa_id" }); if (error) throw error;
      await log({ accion, resultado: "OK", detalle: { ambiente: up.ambiente, cuit: up.cuit, cert: !!up.cert, key: !!up.key } });
      return json({ ok: true });
    }
    // ───────────── generar_csr ─────────────
    if (accion === "generar_csr") {
      if (!esAdmin) return json({ error: "Solo un administrador puede generar el pedido de certificado." }, 403);
      const cuit = String(body.cuit || (cfgA && cfgA.cuit) || cuitEmpresa || "").replace(/\D/g, "");
      if (cuit.length !== 11) return json({ error: "Cargá el CUIT de la empresa (11 dígitos) en Configuración." }, 400);
      const keys = forge.pki.rsa.generateKeyPair(2048);
      const csr = forge.pki.createCertificationRequest(); csr.publicKey = keys.publicKey;
      csr.setSubject([{ shortName: "C", value: "AR" }, { shortName: "O", value: String(body.organizacion || (plusCfg && plusCfg.razon_social) || "Empresa").slice(0, 60) }, { shortName: "CN", value: String(body.alias || "controlmax").replace(/[^A-Za-z0-9]/g, "").slice(0, 30) || "controlmax" }, { name: "serialNumber", value: "CUIT " + cuit }]);
      csr.sign(keys.privateKey, forge.md.sha256.create());
      const keyPem = forge.pki.privateKeyToPem(keys.privateKey), csrPem = forge.pki.certificationRequestToPem(csr);
      const { error } = await db.from("arca_credenciales").upsert({ empresa_id: empresaId, cuit, key: keyPem, cert: null, cert_vence: null, ta_token: null, ta_exp: null, updated_at: new Date().toISOString() }, { onConflict: "empresa_id" }); if (error) throw error;
      await log({ accion, resultado: "OK", detalle: { cuit } });
      return json({ ok: true, csr: csrPem });
    }
    // ───────────── probar (homologación) ─────────────
    if (accion === "probar") {
      const env = "dev", cuit = TEST_CUIT, pv = Number((cfgA && cfgA.pv_prueba) || 1);
      const Auth = await ticket(env, cuit);
      const c = { clase: "factura", letra: "B", cbte_tipo: 6, total: 121, neto_gravado: 100, iva_21: 21, doc_tipo: 99, doc_nro: 0, cliente_iva_id: 5, concepto: 1 };
      const { r, nro, pv: pvUsado } = await emitirPrueba(Auth, pv, 6, c, [{ alicuota_iva: 21, neto: 100, iva: 21 }], null, cuit);
      await log({ accion, ambiente: env, resultado: r.resultado, detalle: { pv: pvUsado, nro, ...r } });
      return json({ ok: r.resultado === "A", ambiente: "homologación", cuit, pv: pvUsado, nro, ...r });
    }
    // ───────────── emitir ─────────────
    if (accion === "emitir") {
      const id = body.comprobante_id; if (!id) return json({ error: "Falta el comprobante." }, 400);
      const { data: c } = await db.from("comprobantes_venta").select("*").eq("id", id).eq("empresa_id", empresaId).single();
      if (!c) return json({ error: "No se encontró el comprobante." }, 404);
      if (c.cae) return json({ ok: true, ya_tenia: true, cae: c.cae, vto: c.cae_vto, nro: c.numero });
      if (c.estado !== "pendiente_cae") return json({ error: "El comprobante no está pendiente de CAE (estado: " + c.estado + ")." }, 400);
      const { data: pvs } = await db.from("puntos_venta").select("numero,sistema,activo").eq("empresa_id", empresaId);
      const pvRow = (pvs || []).find((p) => Number(p.numero) === Number(c.punto_venta));
      if (!pvRow || !/web/i.test(pvRow.sistema || "")) return json({ error: `El punto de venta ${c.punto_venta} no está marcado como "Web Service" en Configuración → Puntos de venta. Los de otros sistemas se registran con CAE manual.` }, 400);
      const { data: items } = await db.from("comprobantes_venta_items").select("alicuota_iva,neto,iva").eq("comprobante_id", id).eq("empresa_id", empresaId);
      let asoc = null; if (c.cbte_asoc_id) { const { data: a } = await db.from("comprobantes_venta").select("cbte_tipo,punto_venta,numero,fecha,cae").eq("id", c.cbte_asoc_id).eq("empresa_id", empresaId).single(); asoc = a; }
      const prob = validar(c, asoc); if (prob.length) return json({ ok: false, resultado: "R", errs: prob, previo: true });
      const simul = amb !== "prod";
      const env = simul ? "dev" : "prod";
      if (simul && ["nc", "nd"].includes(c.clase)) return json({ ok: true, resultado: "S", simulacion: true, aviso: "En homologación no se pueden probar notas de crédito/débito contra comprobantes reales. Probá con una factura." });
      const cuit = simul ? TEST_CUIT : Number((cfgA && cfgA.cuit) || cuitEmpresa);
      if (!cuit) return json({ error: "Falta el CUIT del emisor en Configuración." }, 400);
      const pv = simul ? Number((cfgA && cfgA.pv_prueba) || 1) : Number(c.punto_venta);
      const tipo = Number(c.cbte_tipo);
      // Bloqueo: evita que dos personas pidan CAE del mismo comprobante a la vez
      if (!simul) {
        const lim = new Date(Date.now() - 2 * 60 * 1000).toISOString();
        const { data: lk } = await db.from("comprobantes_venta").update({ arca_lock: new Date().toISOString() }).eq("id", id).eq("empresa_id", empresaId).or(`arca_lock.is.null,arca_lock.lt.${lim}`).select("id");
        if (!lk || !lk.length) return json({ error: "Ya se está pidiendo el CAE de este comprobante. Esperá un momento y actualizá." }, 409);
      }
      const liberar = async (extra = {}) => { if (!simul) await db.from("comprobantes_venta").update({ arca_lock: null, ...extra }).eq("id", id).eq("empresa_id", empresaId); };
      try {
        const Auth = await ticket(env, cuit);
        // Recuperación: si un intento anterior quedó cortado, verificamos si ARCA lo autorizó
        const nroPrevio = !simul && c.arca_intento && c.arca_intento.nro ? Number(c.arca_intento.nro) : 0;
        if (nroPrevio) {
          const q = leerConsulta(await ws(env, "FECompConsultar", { Auth, FeCompConsReq: { CbteTipo: tipo, CbteNro: nroPrevio, PtoVta: pv } }));
          if (q && q.cae && Math.abs(q.total - num(c.total)) < 0.02) {
            await guardarOK(db, empresaId, c, nroPrevio, q.cae, q.vto, ["Recuperado: ARCA ya lo había autorizado"]);
            await log({ accion, ambiente: env, comprobante_id: id, resultado: "A", detalle: { recuperado: true, nro: nroPrevio, cae: q.cae } });
            await liberar();
            return json({ ok: true, resultado: "A", cae: q.cae, vto: q.vto, nro: nroPrevio, recuperado: true });
          }
        }
        if (simul) {
          const { r, nro, pv: pvUsado } = await emitirPrueba(Auth, pv, tipo, { ...c, punto_venta: pv }, items || [], asoc, cuit);
          await log({ accion, ambiente: env, comprobante_id: id, resultado: r.resultado, detalle: { pv: pvUsado, tipo, nro, simulacion: true, ...r } });
          return json({ ok: r.resultado === "A", simulacion: true, ...r, nro, pv: pvUsado });
        }
        const u = leerUltimo(await ws(env, "FECompUltimoAutorizado", { Auth, PtoVta: pv, CbteTipo: tipo })); if (u.errs.length) throw new Error(u.errs.join(" · "));
        const nro = u.nro + 1;
        const cs = simul ? { ...c, punto_venta: pv } : c;
        const det = armarDetalle(cs, items || [], nro, asoc, cuit);
        if (!simul) await db.from("comprobantes_venta").update({ arca_intento: { pv, tipo, nro, at: new Date().toISOString() } }).eq("id", id).eq("empresa_id", empresaId);
        const reqWs = { Auth, FeCAEReq: { FeCabReq: { CantReg: 1, PtoVta: pv, CbteTipo: tipo }, FeDetReq: { FECAEDetRequest: det } } };
        const r = leerCAE(await ws(env, "FECAESolicitar", reqWs));
        await log({ accion, ambiente: env, comprobante_id: id, resultado: r.resultado, detalle: { pv, tipo, nro, request: det, ...r } });
        if (simul) return json({ ok: r.resultado === "A", simulacion: true, ...r, nro, pv });
        if (r.resultado === "A" && r.cae) {
          await guardarOK(db, empresaId, c, nro, r.cae, r.vto, r.obs);
          await liberar();
          return json({ ok: true, ...r, nro });
        }
        await liberar({ arca_intento: null, arca_resultado: "R", arca_obs: [...r.errs, ...r.obs].join(" · ").slice(0, 1000) || "Rechazado por ARCA" });
        return json({ ok: false, ...r, nro });
      } catch (e) { await liberar(); throw e; }
    }
    return json({ error: "Acción desconocida: " + accion }, 400);
  } catch (e) {
    const msg = (e && e.message) || String(e);
    await log({ accion, resultado: "ERROR", detalle: { error: msg } });
    return json({ error: msg }, 500);
  }
});

async function guardarOK(db, empresaId, c, nro, cae, vto, obs) {
  // Si otro comprobante pendiente tenía ese número provisorio, se lo libera (lo renumera ARCA cuando pida su CAE)
  await db.from("comprobantes_venta").update({ numero: null }).eq("empresa_id", empresaId).eq("punto_venta", c.punto_venta).eq("cbte_tipo", c.cbte_tipo).eq("numero", nro).neq("id", c.id).is("cae", null);
  const upd: any = { numero: nro, cae, cae_vto: vto, estado: "emitida", arca_resultado: "A", arca_obs: (obs || []).join(" · ").slice(0, 1000) || null, arca_intento: null, arca_lock: null, arca_fecha: new Date().toISOString() };
  if (c.es_fce && c.clase === "factura") upd.fce_estado = "pendiente_aceptacion";
  const { error } = await db.from("comprobantes_venta").update(upd).eq("id", c.id).eq("empresa_id", empresaId);
  if (error) throw new Error("ARCA autorizó el comprobante (CAE " + cae + ") pero no se pudo guardar: " + error.message + ". Volvé a tocar Solicitar CAE: se recupera solo.");
}
