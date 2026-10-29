/* CONTROL MAX — 📖 Manual del usuario (panel común a todos los módulos)
   Lo carga la barra común (cmax-top.js) recién cuando la persona toca "📖 Manual" o aprieta F1.
   Los textos viven en /CONTROLTRACE/manuales/<modulo>.md (uno por módulo): se corrigen sin tocar el sistema.
   El panel: índice por temas, buscador, filtro por rol, abre el tema de la pantalla actual,
   preguntas a la IA (Edge Function "manual-ia") y "Descargar PDF" (imprime el manual completo).
   Si algo falla acá, el módulo sigue funcionando igual: todo está dentro de try/catch y no toca el código del módulo.
   HISTORIAL DE VERSIONES: manual 1.3 · 2026-10: manual de Configuración CONTROL MAX · manual 1.2 · 2026-10: manual de CONTROL PLUS (pantallas con pestañas: sección>pestaña) · manual 1.1 · 2026-10: logo completo de CONTROL MAX en la tapa del PDF · manual 1.0 · 2026-10: primera versión (piloto CONTROL TRACE). */
(function(){
  'use strict';
  if (window.CMXManual) return;
  var VERSION = '1.3';
  var BASE = '/CONTROLTRACE/manuales/';
  // Lee una variable global del módulo (también las declaradas con const/let, que no cuelgan de window)
  function g(n){ try { return Function('return typeof ' + n + '!=="undefined"?' + n + ':undefined')(); } catch(e){ return undefined; } }
  // Registro de módulos: qué manual usa cada uno y cómo saber pantalla, rol e ir a una pantalla.
  var MODULOS = [
    { re: /\/controltrace\/(index\.html)?$/i, slug: 'trace', nombre: 'CONTROL TRACE',
      pantalla: function(){ return g('cur') || ''; },
      rol: function(){ var S = g('S'); return (S && S.rol) || ''; },
      puedeVer: function(id){ var f = g('canSee'), S = g('S'); try { return f && S ? !!f(S.rol, id) : true; } catch(e){ return true; } },
      ir: function(id){ var f = g('go'); if (f) f(id); },
      sb: function(){ return g('sb'); } },
    // PLUS: la pantalla es la sección más la pestaña activa (y la sub-pestaña), por ejemplo "ventas>tv-cob>tvc-cheques".
    { re: /\/controlplus\/(index\.html)?$/i, slug: 'plus', nombre: 'CONTROL PLUS',
      pantalla: function(){
        var c = g('CUR') || ''; if (!c) return '';
        var root = document.getElementById('m-' + c), out = [c]; if (!root) return c;
        Array.prototype.forEach.call(root.querySelectorAll('.tab-pane.active'), function(p){ if (p.id && p.offsetParent !== null) out.push(p.id); });
        return out.join('>');
      },
      rol: function(){
        var S = g('S'), r = norm((S && S.rol) || '');
        if (/^(admin|administrador|administracion|dueno)$/.test(r)) return 'admin';
        return r;
      },
      puedeVer: function(id){ var f = g('secPermitida'); try { return f ? !!f(String(id).split('>')[0]) : true; } catch(e){ return true; } },
      ir: function(id){
        var partes = String(id).split('>'), f = g('go'); if (!f) return;
        f(partes[0]);
        var root = document.getElementById('m-' + partes[0]); if (!root) return;
        for (var i = 1; i < partes.length; i++) {
          var b = root.querySelector('[onclick*="switchTab(this,\'' + partes[i] + '\')"]');
          if (b) b.click();
        }
      },
      sb: function(){ return g('sb'); } },
    { re: /\/controlconfig\/(index\.html)?$/i, slug: 'config', nombre: 'Configuración CONTROL MAX',
      pantalla: function(){ return g('CUR') || ''; },
      rol: function(){ var f = g('esAdmin'), S = g('S'); try { if (f && f()) return 'admin'; } catch(e){} return norm((S && S.rol) || ''); },
      puedeVer: function(id){ var f = g('secOk'); try { return f ? !!f(id) : true; } catch(e){ return true; } },
      ir: function(id){ var f = g('go'); if (f) f(id); },
      sb: function(){ return g('sb'); } }
  ];
  // ¿La pantalla actual "cur" está dentro de la pantalla "p" del manual? (p = "ventas" abarca "ventas>tv-cv")
  function enPantalla(cur, p){ return !!cur && !!p && (cur === p || cur.indexOf(p + '>') === 0); }
  var ROLES = { admin: 'Administrador', supervisor: 'Supervisor', comercial: 'Comercial', preparador: 'Preparador', chofer: 'Chofer', rrhh: 'Jefe de RRHH', todos: 'Todos' };
  function modActual(){ for (var i = 0; i < MODULOS.length; i++) if (MODULOS[i].re.test(location.pathname)) return MODULOS[i]; return null; }

  // ───────── Lectura del manual (Markdown simple) ─────────
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function slugify(s){ return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60); }
  function meta(line){ var m = /^<!--([\s\S]*?)-->$/.exec(line.trim()); if (!m) return null; var o = {};
    m[1].split(/[|\n]/).forEach(function(p){ var i = p.indexOf(':'); if (i > 0) o[p.slice(0, i).trim().toLowerCase()] = p.slice(i + 1).trim(); }); return o; }
  function parse(md){
    var lines = md.replace(/\r/g, '').split('\n'), doc = { meta: {}, titulo: '', intro: [], temas: [] }, cur = null, i = 0;
    // encabezado: comentario inicial con manual/modulo/version
    var head = md.match(/^\s*<!--([\s\S]*?)-->/);
    if (head) { head[1].split('\n').forEach(function(p){ var k = p.indexOf(':'); if (k > 0) doc.meta[p.slice(0, k).trim().toLowerCase()] = p.slice(k + 1).trim(); }); i = md.slice(0, head.index + head[0].length).split('\n').length; }
    for (; i < lines.length; i++) {
      var l = lines[i];
      if (/^# /.test(l)) { doc.titulo = l.slice(2).trim(); continue; }
      if (/^## /.test(l)) {
        cur = { titulo: l.slice(3).trim(), id: '', pantalla: [], roles: [], grupo: '', lineas: [] };
        var nx = lines[i + 1] || '', mt = meta(nx);
        if (mt) { i++; cur.id = mt.id || ''; cur.pantalla = (mt.pantalla || '').split(/[,\s]+/).filter(Boolean);
          cur.roles = (mt.roles || '').split(/[,\s]+/).filter(Boolean).map(function(r){ return r.toLowerCase(); }); cur.grupo = mt.grupo || ''; cur.resumen = mt.resumen || ''; }
        if (!cur.id) cur.id = slugify(cur.titulo);
        doc.temas.push(cur); continue;
      }
      if (cur) cur.lineas.push(l); else doc.intro.push(l);
    }
    var gPrev = 'General';
    doc.temas.forEach(function(t, k){ t.n = k + 1; if (t.grupo) gPrev = t.grupo; else t.grupo = gPrev;
      t.md = t.lineas.join('\n'); t.subs = t.lineas.filter(function(x){ return /^### /.test(x); }).map(function(x){ var s = x.slice(4).trim(); return { t: s, id: t.id + '--' + slugify(s) }; });
      t.texto = norm(t.titulo + ' ' + t.md.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/[#*>`|_]/g, ' ')); });
    return doc;
  }
  function inline(s, base){
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>');
    s = s.replace(/\[([^\]]+)\]\(#([a-z0-9\-]+)\)/g, '<a href="#" data-tema="$2">$1</a>');
    s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }
  function render(md, base, temaId){
    var L = md.replace(/\r/g, '').split('\n'), out = [], i = 0;
    function para(buf){ if (buf.length) out.push('<p>' + inline(buf.join(' '), base) + '</p>'); }
    var buf = [];
    while (i < L.length) {
      var l = L[i];
      if (!l.trim()) { para(buf); buf = []; i++; continue; }
      if (/^<!--/.test(l.trim())) { para(buf); buf = []; while (i < L.length && L[i].indexOf('-->') < 0) i++; i++; continue; }
      var img = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/.exec(l.trim());
      if (img) { para(buf); buf = []; var src = /^https?:|^\//.test(img[2]) ? img[2] : base + img[2];
        out.push('<figure><img loading="lazy" src="' + esc(src) + '" alt="' + esc(img[1]) + '"><figcaption>' + inline(img[1], base) + '</figcaption></figure>'); i++; continue; }
      var h = /^(###|####) (.+)$/.exec(l);
      if (h) { para(buf); buf = []; var tag = h[1] === '###' ? 'h4' : 'h5'; out.push('<' + tag + ' id="cmxm-' + esc((temaId || '') + '--' + slugify(h[2])) + '">' + inline(h[2], base) + '</' + tag + '>'); i++; continue; }
      if (/^>\s?/.test(l)) { para(buf); buf = []; var q = []; while (i < L.length && /^>\s?/.test(L[i])) { q.push(L[i].replace(/^>\s?/, '')); i++; }
        var tx = q.join(' '), cls = /^⚠️|^atenci/i.test(tx) ? 'warn' : /^🔒/.test(tx) ? 'pin' : /^💡|^consejo/i.test(tx) ? 'tip' : 'note';
        out.push('<div class="cmxm-call ' + cls + '">' + inline(tx, base) + '</div>'); continue; }
      if (/^\|/.test(l)) { para(buf); buf = []; var rows = []; while (i < L.length && /^\|/.test(L[i])) { rows.push(L[i]); i++; }
        var cells = function(r){ return r.replace(/^\||\|$/g, '').split('|').map(function(c){ return c.trim(); }); };
        var hd = cells(rows[0]), body = rows.slice(/^\|[\s:\-|]+\|$/.test(rows[1] || '') ? 2 : 1);
        out.push('<div class="cmxm-tw"><table><thead><tr>' + hd.map(function(c){ return '<th>' + inline(c, base) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          body.map(function(r){ return '<tr>' + cells(r).map(function(c){ return '<td>' + inline(c, base) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'); continue; }
      var ol = /^(\d+)[.)] (.+)$/, ul = /^[-*] (.+)$/, sub = /^\s{2,}[-*] (.+)$/, cont = /^\s{2,}\S/;
      if (ol.test(l) || ul.test(l)) { para(buf); buf = []; var isO = ol.test(l), items = [], start = isO ? +ol.exec(l)[1] : 1;
        while (i < L.length) {
          var x = L[i], m = isO ? ol.exec(x) : ul.exec(x), sm;
          if (m) items.push({ t: m[isO ? 2 : 1], s: [] });
          else if (items.length && (sm = sub.exec(x))) items[items.length - 1].s.push(sm[1]);
          else if (items.length && cont.test(x)) { var it = items[items.length - 1]; if (it.s.length) it.s[it.s.length - 1] += ' ' + x.trim(); else it.t += ' ' + x.trim(); }
          else break;
          i++; }
        out.push((isO ? '<ol class="cmxm-steps"' + (start > 1 ? ' style="counter-reset:s ' + (start - 1) + '"' : '') + '>' : '<ul>') + items.map(function(x){ return '<li>' + inline(x.t, base) +
          (x.s.length ? '<ul>' + x.s.map(function(y){ return '<li>' + inline(y, base) + '</li>'; }).join('') + '</ul>' : '') + '</li>'; }).join('') + (isO ? '</ol>' : '</ul>')); continue; }
      buf.push(l.trim()); i++;
    }
    para(buf);
    return out.join('\n');
  }

  // ───────── Estado ─────────
  var M = null, DOC = null, ST = { vista: 'indice', tema: null, q: '', soloRol: true, tab: 'temas', chat: [], enviando: false }, ROOT = null;
  function rolActual(){ try { return (M && M.rol()) || ''; } catch(e){ return ''; } }
  function temaVisible(t){ var r = rolActual(); return !ST.soloRol || !r || r === 'admin' || !t.roles.length || t.roles.indexOf('todos') >= 0 || t.roles.indexOf(r) >= 0; }
  // El tema de la pantalla actual: el que tenga la pantalla más específica que la contenga (a igualdad, el primero).
  function temaDePantalla(p){
    if (!DOC || !p) return null; var mejor = null, largo = -1;
    DOC.temas.forEach(function(t){ t.pantalla.forEach(function(q){ if (enPantalla(p, q) && q.length > largo) { mejor = t; largo = q.length; } }); });
    return mejor;
  }
  function cargar(){
    return fetch(BASE + M.slug + '.md?v=' + Date.now().toString().slice(0, -5), { cache: 'no-cache' })
      .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function(t){ DOC = parse(t); return DOC; });
  }

  // ───────── Interfaz ─────────
  var CSS = '' +
  '#cmxm-bg{position:fixed;inset:0;background:rgba(15,23,38,.28);z-index:2147483200;display:none}#cmxm-bg.on{display:block}' +
  '#cmxm{position:fixed;top:0;right:0;bottom:0;width:min(520px,100vw);background:#fbfaf7;color:#1c2536;z-index:2147483300;display:flex;flex-direction:column;' +
  "box-shadow:-10px 0 40px rgba(0,0,0,.22);font:400 14px/1.55 Inter,'Segoe UI',system-ui,sans-serif;transform:translateX(105%);transition:transform .22s ease}" +
  '#cmxm.on{transform:none}#cmxm *{box-sizing:border-box}' +
  '#cmxm .hd{background:#16243f;color:#fff;padding:14px 16px 0}#cmxm .hd .r1{display:flex;align-items:center;gap:8px}' +
  "#cmxm .hd .tt{font:700 16px/1.2 'Space Grotesk',Inter,sans-serif;flex:1}#cmxm .hd .tt small{display:block;font:500 11px Inter,sans-serif;color:#c9d3e3;margin-top:3px;letter-spacing:.2px}" +
  '#cmxm .hb{background:#24375a;color:#fff;border:1px solid #33496f;border-radius:8px;padding:6px 10px;font:600 12px Inter,sans-serif;cursor:pointer}#cmxm .hb:hover{background:#2e4670}' +
  '#cmxm .tabs{display:flex;gap:4px;margin-top:12px}#cmxm .tab{flex:1;background:transparent;border:0;color:#c9d3e3;padding:9px 6px;font:600 13px Inter,sans-serif;cursor:pointer;border-bottom:3px solid transparent}' +
  '#cmxm .tab.on{color:#fff;border-bottom-color:#c9a24b}' +
  '#cmxm .bd{flex:1;overflow:auto;padding:14px 16px 24px}' +
  '#cmxm input.q{width:100%;padding:10px 12px;border:1px solid #d9d2c3;border-radius:10px;font:14px Inter,sans-serif;background:#fff}' +
  '#cmxm .flt{display:flex;align-items:center;gap:6px;font-size:12px;color:#6b7689;margin:8px 0 4px;cursor:pointer}#cmxm .flt input{width:auto}' +
  "#cmxm .gl{font:700 11px Inter,sans-serif;letter-spacing:.7px;text-transform:uppercase;color:#a9842f;margin:16px 0 6px}" +
  '#cmxm .it{display:flex;gap:10px;align-items:flex-start;padding:9px 10px;border-radius:9px;cursor:pointer;border:1px solid transparent}#cmxm .it:hover{background:#f1ece1;border-color:#e7e2d6}' +
  "#cmxm .it .nn{font:700 11px 'Space Grotesk',sans-serif;color:#7c9cbf;min-width:20px;padding-top:2px}#cmxm .it b{display:block;color:#16243f;font-weight:600}#cmxm .it span.rs{font-size:12px;color:#6b7689}" +
  '#cmxm .it.aqui{background:#eef3fb;border-color:#c8d6ee}#cmxm .tagr{display:inline-block;font-size:10px;font-weight:600;background:#ece7dc;color:#6b5a32;border-radius:10px;padding:1px 7px;margin:2px 4px 0 0}' +
  '#cmxm .back{background:none;border:0;color:#3d5a80;font:600 13px Inter,sans-serif;cursor:pointer;padding:0;margin-bottom:10px}' +
  "#cmxm .art h3{font:700 20px/1.25 'Space Grotesk',Inter,sans-serif;color:#16243f;margin:0 0 6px}#cmxm .art h4{font:700 15px 'Space Grotesk',Inter,sans-serif;color:#16243f;margin:20px 0 6px}" +
  '#cmxm .art ol.cmxm-steps ul{padding-left:18px;margin:4px 0}#cmxm .art h5{font:600 14px Inter,sans-serif;color:#3d5a80;margin:14px 0 4px}#cmxm .art p{margin:8px 0}#cmxm .art ul{padding-left:20px;margin:8px 0}#cmxm .art li{margin:4px 0}' +
  '#cmxm .art ol.cmxm-steps{list-style:none;counter-reset:s;padding:0;margin:10px 0}#cmxm .art ol.cmxm-steps>li{counter-increment:s;position:relative;padding:4px 0 8px 38px;margin:0}' +
  "#cmxm .art ol.cmxm-steps>li::before{content:counter(s);position:absolute;left:0;top:2px;width:26px;height:26px;border-radius:50%;background:#16243f;color:#fff;font:700 12px/26px 'Space Grotesk',sans-serif;text-align:center}" +
  '#cmxm .art figure{margin:12px 0;background:#fff;border:1px solid #e7e2d6;border-radius:10px;padding:6px}#cmxm .art figure img{width:100%;display:block;border-radius:6px;cursor:zoom-in}' +
  '#cmxm .art figcaption{font-size:12px;color:#6b7689;padding:6px 4px 2px}#cmxm .art code{background:#efeae0;border-radius:5px;padding:1px 5px;font-size:12.5px}' +
  '#cmxm .cmxm-call{border-radius:10px;padding:9px 12px;margin:10px 0;font-size:13.5px;border:1px solid}#cmxm .cmxm-call.tip{background:#eef4ea;border-color:#cfe0c8}' +
  '#cmxm .cmxm-call.warn{background:#fdf3e2;border-color:#ecd5a8}#cmxm .cmxm-call.pin{background:#f3eefa;border-color:#d9cdee}#cmxm .cmxm-call.note{background:#eef3fb;border-color:#c8d6ee}' +
  '#cmxm .cmxm-tw{overflow:auto;margin:10px 0}#cmxm table{border-collapse:collapse;width:100%;font-size:13px;background:#fff}#cmxm th,#cmxm td{border:1px solid #e7e2d6;padding:6px 8px;text-align:left;vertical-align:top}#cmxm th{background:#f3efe6}' +
  '#cmxm .art a{color:#3d5a80;font-weight:600}#cmxm .acts{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 0;padding-top:12px;border-top:1px solid #e7e2d6}' +
  '#cmxm .btn{background:#fff;border:1px solid #d9d2c3;color:#16243f;border-radius:9px;padding:8px 12px;font:600 13px Inter,sans-serif;cursor:pointer}#cmxm .btn:hover{background:#f4f1ea}' +
  '#cmxm .btn.gold{background:#c9a24b;border-color:#a9842f;color:#111d35}#cmxm .btn.gold:hover{background:#d4b05c}#cmxm .btn[disabled]{opacity:.5;cursor:default}' +
  '#cmxm .toc{background:#fff;border:1px solid #e7e2d6;border-radius:10px;padding:8px 12px;margin:10px 0;font-size:13px}#cmxm .toc a{display:block;padding:2px 0;color:#3d5a80;text-decoration:none}' +
  '#cmxm .res{padding:9px 10px;border-radius:9px;cursor:pointer;border:1px solid #e7e2d6;background:#fff;margin-bottom:6px}#cmxm .res:hover{border-color:#c9a24b}#cmxm .res b{color:#16243f}#cmxm .res div{font-size:12.5px;color:#556}#cmxm mark{background:#fbe7a8;padding:0 1px}' +
  '#cmxm .empty{color:#6b7689;text-align:center;padding:24px 8px}' +
  '#cmxm .msg{margin:10px 0;display:flex}#cmxm .msg.yo{justify-content:flex-end}#cmxm .msg .bb{max-width:92%;border-radius:12px;padding:9px 12px}' +
  '#cmxm .msg.yo .bb{background:#16243f;color:#fff;border-bottom-right-radius:4px}#cmxm .msg.ia .bb{background:#fff;border:1px solid #e7e2d6;border-bottom-left-radius:4px}' +
  '#cmxm .msg.ia .bb p:first-child{margin-top:0}#cmxm .msg.ia .bb p:last-child{margin-bottom:0}#cmxm .chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}' +
  '#cmxm .chip{background:#eef3fb;border:1px solid #c8d6ee;color:#24406e;border-radius:14px;padding:3px 10px;font-size:12px;font-weight:600;cursor:pointer}' +
  '#cmxm .vote{margin-top:8px;font-size:12px;color:#6b7689;display:flex;gap:6px;align-items:center}#cmxm .vote button{background:none;border:1px solid #e7e2d6;border-radius:8px;cursor:pointer;padding:2px 8px}' +
  '#cmxm .ask{border-top:1px solid #e7e2d6;padding:10px 16px 14px;background:#fff;display:flex;gap:8px}#cmxm .ask textarea{flex:1;resize:none;height:44px;padding:10px 12px;border:1px solid #d9d2c3;border-radius:10px;font:14px Inter,sans-serif}' +
  '#cmxm .sug{display:flex;flex-direction:column;gap:6px;margin-top:10px}#cmxm .sug button{text-align:left}' +
  '#cmxm .spin{display:inline-block;width:12px;height:12px;border:2px solid #c9a24b;border-top-color:transparent;border-radius:50%;animation:cmxms .8s linear infinite;vertical-align:-2px;margin-right:6px}@keyframes cmxms{to{transform:rotate(360deg)}}' +
  '#cmxm-zoom{position:fixed;inset:0;background:rgba(10,15,25,.86);z-index:2147483400;display:none;align-items:center;justify-content:center;padding:20px;cursor:zoom-out}#cmxm-zoom.on{display:flex}#cmxm-zoom img{max-width:100%;max-height:100%;border-radius:8px;background:#fff}' +
  '@media print{#cmxm,#cmxm-bg,#cmxm-zoom{display:none!important}}' +
  /* impresión del manual completo (Descargar PDF) */
  'body.cmxm-printing>*:not(#cmxm-print){display:none!important}#cmxm-print{display:none}body.cmxm-printing #cmxm-print{display:block}' +
  /* algunos módulos ocultan todo al imprimir (visibility:hidden): el manual se fuerza visible */
  '@media print{html:has(body.cmxm-printing),body.cmxm-printing{background:#fff!important}body.cmxm-printing #cmxm-print,body.cmxm-printing #cmxm-print *{visibility:visible!important}}' +
  "#cmxm-print{font:400 11pt/1.5 Inter,Arial,sans-serif;color:#1c2536;background:#fff}#cmxm-print .cover{height:250mm;display:flex;flex-direction:column;justify-content:center;padding:0 12mm;page-break-after:always;break-after:page}" +
  "#cmxm-print .cover .logo{width:72mm;height:auto;display:block;margin:0 0 8mm -3mm}#cmxm-print .cover h1{font:700 34pt/1.1 'Space Grotesk',Inter,sans-serif;color:#16243f;margin:6mm 0}" +
  '#cmxm-print .cover .v{font-size:12pt;color:#556}#cmxm-print .cover .bar{height:3mm;width:40mm;background:#c9a24b;margin:8mm 0}' +
  "#cmxm-print .idx{page-break-after:always;break-after:page}#cmxm-print .idx h2{font:700 18pt 'Space Grotesk',sans-serif;color:#16243f}#cmxm-print .idx .g{font:700 9pt Inter;letter-spacing:1px;text-transform:uppercase;color:#a9842f;margin:5mm 0 1mm}" +
  '#cmxm-print .idx .t{display:flex;gap:4mm;padding:1mm 0;border-bottom:1px dotted #ccc}#cmxm-print .idx .t span{color:#7c9cbf;min-width:8mm}#cmxm-print .idx .t em{margin-left:auto;font-style:normal;font-size:9pt;color:#6b7689}' +
  "#cmxm-print .tema{page-break-before:always;break-before:page}#cmxm-print .tema h3{font:700 18pt/1.2 'Space Grotesk',sans-serif;color:#16243f;margin:0 0 2mm}#cmxm-print .tema .rl{font-size:9pt;color:#6b7689;margin-bottom:4mm}" +
  "#cmxm-print h4{font:700 12.5pt 'Space Grotesk',sans-serif;color:#16243f;margin:6mm 0 2mm;page-break-after:avoid;break-after:avoid}#cmxm-print h5{font:600 11pt Inter;color:#3d5a80;margin:4mm 0 1mm}" +
  '#cmxm-print figure{margin:3mm 0;page-break-inside:avoid;break-inside:avoid;border:1px solid #e7e2d6;border-radius:2mm;padding:1.5mm}#cmxm-print figure img{max-width:100%;max-height:120mm;display:block;margin:0 auto}#cmxm-print figcaption{font-size:9pt;color:#6b7689;padding-top:1mm}' +
  '#cmxm-print ol.cmxm-steps{list-style:none;counter-reset:s;padding:0}#cmxm-print ol.cmxm-steps>li{counter-increment:s;position:relative;padding:0 0 2mm 9mm;page-break-inside:avoid}' +
  "#cmxm-print ol.cmxm-steps>li::before{content:counter(s);position:absolute;left:0;top:0;width:6mm;height:6mm;border-radius:50%;background:#16243f;color:#fff;font:700 8.5pt/6mm 'Space Grotesk',sans-serif;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
  '#cmxm-print .cmxm-call{border:1px solid #ddd;border-left:4px solid #c9a24b;padding:2mm 3mm;margin:3mm 0;page-break-inside:avoid;background:#faf7f0;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
  '#cmxm-print table{border-collapse:collapse;width:100%;font-size:9.5pt;margin:3mm 0}#cmxm-print th,#cmxm-print td{border:1px solid #ccc;padding:1.5mm 2mm;text-align:left;vertical-align:top}#cmxm-print th{background:#f3efe6;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
  '#cmxm-print ol.cmxm-steps ul{padding-left:5mm;margin:1mm 0}#cmxm-print code{background:#f0ece2;padding:0 1mm;border-radius:1mm}#cmxm-print a{color:#1c2536;text-decoration:none}';

  function el(html){ var d = document.createElement('div'); d.innerHTML = html; return d.firstChild; }
  function montar(){
    if (ROOT) return;
    var st = document.createElement('style'); st.id = 'cmxm-css'; st.textContent = CSS; document.head.appendChild(st);
    document.body.appendChild(el('<div id="cmxm-bg"></div>'));
    document.body.appendChild(el('<div id="cmxm-zoom"><img alt=""></div>'));
    ROOT = el('<aside id="cmxm" role="dialog" aria-label="Manual del usuario"><div class="hd"><div class="r1"><div class="tt">📖 Manual del usuario<small id="cmxm-sub"></small></div>' +
      '<button class="hb" id="cmxm-pdf" title="Imprimir o guardar el manual completo como PDF">⬇ PDF</button><button class="hb" id="cmxm-x" title="Cerrar (Esc)">✕</button></div>' +
      '<div class="tabs"><button class="tab on" data-t="temas">📚 Temas</button><button class="tab" data-t="preg">💬 Preguntar</button></div></div><div class="bd" id="cmxm-bd"></div><div id="cmxm-ask"></div></aside>');
    document.body.appendChild(ROOT);
    document.getElementById('cmxm-bg').onclick = cerrar;
    document.getElementById('cmxm-x').onclick = cerrar;
    document.getElementById('cmxm-pdf').onclick = imprimir;
    document.getElementById('cmxm-zoom').onclick = function(){ this.classList.remove('on'); };
    [].forEach.call(ROOT.querySelectorAll('.tab'), function(b){ b.onclick = function(){ ST.tab = b.getAttribute('data-t'); pintar(); }; });
    ROOT.addEventListener('click', function(e){
      var a = e.target.closest('[data-tema]'); if (a) { e.preventDefault(); abrirTema(a.getAttribute('data-tema'), a.getAttribute('data-sub')); return; }
      var im = e.target.closest('.art figure img'); if (im) { var z = document.getElementById('cmxm-zoom'); z.querySelector('img').src = im.src; z.classList.add('on'); }
    });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && ROOT.classList.contains('on')) { var z = document.getElementById('cmxm-zoom'); if (z.classList.contains('on')) z.classList.remove('on'); else cerrar(); } });
  }
  function cerrar(){ ROOT.classList.remove('on'); document.getElementById('cmxm-bg').classList.remove('on'); }
  function rolTxt(){ var r = rolActual(); return ROLES[r] || r; }
  function tagsRol(t){ if (!t.roles.length) return ''; return t.roles.map(function(r){ return '<span class="tagr">' + esc(ROLES[r] || r) + '</span>'; }).join(''); }
  function pintar(){
    [].forEach.call(ROOT.querySelectorAll('.tab'), function(b){ b.classList.toggle('on', b.getAttribute('data-t') === ST.tab); });
    var sub = document.getElementById('cmxm-sub');
    sub.textContent = (DOC && (DOC.meta.modulo || M.nombre)) + (DOC && DOC.meta.version ? ' · versión ' + DOC.meta.version : '');
    var bd = document.getElementById('cmxm-bd'), ask = document.getElementById('cmxm-ask');
    if (ST.tab === 'preg') { pintarPreg(bd, ask); return; }
    ask.innerHTML = '';
    if (ST.vista === 'tema' && ST.tema) { pintarTema(bd); return; }
    pintarIndice(bd);
  }
  function pintarIndice(bd){
    var r = rolActual(), aqui = temaDePantalla(M.pantalla());
    var h = '<input class="q" id="cmxm-q" placeholder="🔎 Buscar en el manual… (ej: anular remito)" value="' + esc(ST.q) + '" autocomplete="off">';
    if (r && r !== 'admin') h += '<label class="flt"><input type="checkbox" id="cmxm-rol"' + (ST.soloRol ? ' checked' : '') + '> Mostrar solo los temas de mi rol (' + esc(rolTxt()) + ')</label>';
    h += '<div id="cmxm-list"></div>';
    bd.innerHTML = h;
    var q = document.getElementById('cmxm-q');
    q.oninput = function(){ ST.q = q.value; lista(); };
    var cb = document.getElementById('cmxm-rol'); if (cb) cb.onchange = function(){ ST.soloRol = cb.checked; lista(); };
    function lista(){
      var w = document.getElementById('cmxm-list'), qq = norm(ST.q).trim();
      if (qq) { w.innerHTML = buscar(qq); return; }
      var html = '', gr = '';
      if (aqui && temaVisible(aqui)) html += '<div class="gl">Estás en esta pantalla</div>' + itemHTML(aqui, true);
      (DOC.intro.join('').trim() ? [] : []).forEach(function(){});
      DOC.temas.filter(temaVisible).forEach(function(t){ if (t.grupo !== gr) { gr = t.grupo; html += '<div class="gl">' + esc(gr) + '</div>'; } html += itemHTML(t, false); });
      w.innerHTML = html || '<div class="empty">No hay temas para mostrar.</div>';
    }
    lista();
    setTimeout(function(){ try { q.focus(); } catch(e){} }, 60);
  }
  function itemHTML(t, aqui){ return '<div class="it' + (aqui ? ' aqui' : '') + '" data-tema="' + esc(t.id) + '"><span class="nn">' + t.n + '</span><div><b>' + esc(t.titulo) + '</b>' +
      (t.resumen ? '<span class="rs">' + esc(t.resumen) + '</span>' : '') + '</div></div>'; }
  function buscar(qq){
    var words = qq.split(/\s+/).filter(function(w){ return w.length > 1; }); if (!words.length) return '';
    var res = [];
    DOC.temas.forEach(function(t){
      var tt = norm(t.titulo), sc = 0, all = true;
      words.forEach(function(w){ var inT = tt.indexOf(w) >= 0, inB = t.texto.indexOf(w) >= 0; if (!inT && !inB) all = false; sc += (inT ? 10 : 0) + (inB ? 2 + Math.min(5, t.texto.split(w).length - 1) : 0); });
      if (!all) return;
      // mejor subtema y fragmento
      var sub = null, best = -1, cur = null, blocks = [];
      t.lineas.forEach(function(l){ if (/^### /.test(l)) { cur = { t: l.slice(4).trim(), txt: '' }; blocks.push(cur); } else if (cur) cur.txt += ' ' + l; else { blocks.length || blocks.push(cur = { t: '', txt: '' }); cur.txt += ' ' + l; } });
      blocks.forEach(function(b){ var n = norm(b.t + ' ' + b.txt), s = 0; words.forEach(function(w){ if (n.indexOf(w) >= 0) s += norm(b.t).indexOf(w) >= 0 ? 5 : 1; }); if (s > best) { best = s; sub = b; } });
      var raw = (sub ? sub.txt : t.md).replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/\*\*/g, '').replace(/(^|\s)(?:[-*]|\d+[.)])\s/g, ' ').replace(/[#*>`|]/g, ' ').replace(/\s+([:.,;])/g, '$1').replace(/\s+/g, ' ').trim();
      var chars = Array.from(raw), nr = chars.map(function(c){ var n = norm(c); return n.length === 1 ? n : c.toLowerCase().slice(0, 1) || ' '; }).join('');
      var pos = -1; words.forEach(function(w){ var p = nr.indexOf(w); if (p >= 0 && (pos < 0 || p < pos)) pos = p; });
      var from = Math.max(0, pos - 50); while (from > 0 && nr[from - 1] !== ' ') from--;
      var to = Math.min(chars.length, from + 180); while (to < chars.length && nr[to] !== ' ') to++;
      var mk = new Array(chars.length).fill(false); words.forEach(function(w){ var p = nr.indexOf(w, from); while (p >= 0 && p < to) { for (var k = p; k < p + w.length; k++) mk[k] = true; p = nr.indexOf(w, p + w.length); } });
      var fh = from > 0 ? '…' : '', on = false;
      for (var k = from; k < to; k++) { if (mk[k] && !on) { fh += '<mark>'; on = true; } if (!mk[k] && on) { fh += '</mark>'; on = false; } fh += esc(chars[k]); }
      if (on) fh += '</mark>'; if (to < chars.length) fh += '…';
      res.push({ t: t, sc: sc + (temaVisible(t) ? 1 : 0), sub: sub && sub.t ? sub.t : '', frag: fh });
    });
    res.sort(function(a, b){ return b.sc - a.sc; });
    if (!res.length) return '<div class="empty">No encontré nada con “' + esc(ST.q) + '”.<br><br><button class="btn gold" id="cmxm-q2ia">💬 Preguntárselo a la IA</button></div>' + qScript();
    return res.slice(0, 12).map(function(x){ return '<div class="res" data-tema="' + esc(x.t.id) + '"' + (x.sub ? ' data-sub="' + esc(x.t.id + '--' + slugify(x.sub)) + '"' : '') + '><b>' + esc(x.t.titulo) + '</b>' +
      (x.sub ? ' <span style="color:#6b7689">› ' + esc(x.sub) + '</span>' : '') + '<div>' + x.frag + '</div></div>'; }).join('') + qScript();
  }
  function qScript(){ setTimeout(function(){ var b = document.getElementById('cmxm-q2ia'); if (b) b.onclick = function(){ var p = ST.q; ST.tab = 'preg'; pintar(); var ta = document.getElementById('cmxm-ta'); if (ta) { ta.value = p; ta.focus(); } }; }, 0); return ''; }
  function abrirTema(id, sub){
    var t = DOC && DOC.temas.filter(function(x){ return x.id === id; })[0]; if (!t) return;
    ST.tab = 'temas'; ST.vista = 'tema'; ST.tema = t; pintar();
    var bd = document.getElementById('cmxm-bd');
    setTimeout(function(){ var a = sub && document.getElementById('cmxm-' + sub); if (a) a.scrollIntoView({ block: 'start' }); else bd.scrollTop = 0; }, 30);
  }
  function pintarTema(bd){
    var t = ST.tema, base = BASE;
    var toc = t.subs.length > 2 ? '<div class="toc"><b style="font-size:12px;color:#6b7689">En este tema</b>' + t.subs.map(function(s){ return '<a href="#" data-tema="' + esc(t.id) + '" data-sub="' + esc(s.id) + '">› ' + esc(s.t) + '</a>'; }).join('') + '</div>' : '';
    var p = t.pantalla[0], puede = p && M.ir && (!M.puedeVer || M.puedeVer(p)) && !enPantalla(M.pantalla(), p);
    var idx = DOC.temas.indexOf(t), prev = DOC.temas[idx - 1], next = DOC.temas[idx + 1];
    bd.innerHTML = '<button class="back" id="cmxm-back">← Todos los temas</button><div class="art"><div style="font-size:11px;font-weight:700;letter-spacing:.6px;color:#a9842f;text-transform:uppercase">' + esc(t.grupo) + ' · tema ' + t.n + '</div>' +
      '<h3>' + esc(t.titulo) + '</h3><div>' + tagsRol(t) + '</div>' + toc + render(t.md, base, t.id) + '</div>' +
      '<div class="acts">' + (puede ? '<button class="btn gold" id="cmxm-go">➜ Ir a esta pantalla</button>' : '') + '<button class="btn" id="cmxm-ia">💬 Tengo una duda sobre esto</button></div>' +
      '<div class="acts" style="border:0;padding-top:4px;justify-content:space-between">' + (prev ? '<button class="btn" data-tema="' + esc(prev.id) + '">‹ ' + esc(prev.titulo) + '</button>' : '<span></span>') + (next ? '<button class="btn" data-tema="' + esc(next.id) + '">' + esc(next.titulo) + ' ›</button>' : '') + '</div>';
    document.getElementById('cmxm-back').onclick = function(){ ST.vista = 'indice'; pintar(); };
    var go = document.getElementById('cmxm-go'); if (go) go.onclick = function(){ try { M.ir(p); } catch(e){} cerrar(); };
    document.getElementById('cmxm-ia').onclick = function(){ ST.tab = 'preg'; ST.ctxTema = t.id; pintar(); var ta = document.getElementById('cmxm-ta'); if (ta) { ta.placeholder = 'Tu duda sobre “' + t.titulo + '”…'; ta.focus(); } };
  }

  // ───────── Preguntas a la IA ─────────
  function sugerencias(){ var s = (DOC.meta.sugerencias || '').split(';').map(function(x){ return x.trim(); }).filter(Boolean); return s.length ? s : ['¿Cómo anulo algo que cargué mal?', '¿Para qué sirve el PIN de supervisor?']; }
  function pintarPreg(bd, ask){
    var h = '';
    if (!ST.chat.length) h += '<div class="art"><h3 style="font-size:17px">¿En qué te ayudo?</h3><p style="color:#556">Escribí tu duda como se la preguntarías a un compañero. La respuesta sale <b>solo de este manual</b>; si algo no está, te lo digo.</p></div>' +
      '<div class="sug">' + sugerencias().map(function(s){ return '<button class="btn" data-sug="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>';
    ST.chat.forEach(function(m, i){
      if (m.yo) { h += '<div class="msg yo"><div class="bb">' + esc(m.txt) + '</div></div>'; return; }
      h += '<div class="msg ia"><div class="bb art">' + (m.cargando ? '<span class="spin"></span>Buscando en el manual…' : m.err ? '<span style="color:#9b3b31">⚠️ ' + esc(m.err) + '</span>' : render(m.txt, BASE, 'r' + i)) +
        (m.temas && m.temas.length ? '<div class="chips">' + m.temas.map(function(id){ var t = DOC.temas.filter(function(x){ return x.id === id; })[0]; return t ? '<span class="chip" data-tema="' + esc(id) + '">📖 ' + esc(t.titulo) + '</span>' : ''; }).join('') + '</div>' : '') +
        (m.id && m.util == null ? '<div class="vote">¿Te sirvió? <button data-vote="' + i + '" data-v="1">👍</button><button data-vote="' + i + '" data-v="0">👎</button></div>' : m.util != null ? '<div class="vote">¡Gracias por avisar!</div>' : '') +
        (m.restantes != null && m.restantes <= 5 ? '<div class="vote">Quedan ' + m.restantes + ' preguntas hoy para tu empresa.</div>' : '') + '</div></div>';
    });
    bd.innerHTML = h; bd.scrollTop = bd.scrollHeight;
    if (!document.getElementById('cmxm-ta')) {
      ask.innerHTML = '<div class="ask"><textarea id="cmxm-ta" placeholder="Ej: ¿cómo anulo un remito?"></textarea><button class="btn gold" id="cmxm-send">Enviar</button></div>';
      var ta = document.getElementById('cmxm-ta');
      ta.addEventListener('keydown', function(e){ if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } });
      document.getElementById('cmxm-send').onclick = enviar;
    }
    document.getElementById('cmxm-send').disabled = ST.enviando;
    [].forEach.call(bd.querySelectorAll('[data-sug]'), function(b){ b.onclick = function(){ document.getElementById('cmxm-ta').value = b.getAttribute('data-sug'); enviar(); }; });
    [].forEach.call(bd.querySelectorAll('[data-vote]'), function(b){ b.onclick = function(){ votar(+b.getAttribute('data-vote'), b.getAttribute('data-v') === '1'); }; });
  }
  function cliente(){ try { return M.sb && M.sb(); } catch(e){ return null; } }
  function llamar(body){
    var sb = cliente(); if (!sb || !sb.functions) return Promise.reject(new Error('No encontré la conexión del sistema. Recargá la página e intentá de nuevo.'));
    return sb.functions.invoke('manual-ia', { body: body }).then(function(r){
      if (r.error) { var e = r.error, msg = e.message || 'Error';
        var p = (e.context && typeof e.context.json === 'function') ? e.context.json().then(function(j){ return (j && j.error) || msg; }, function(){ return msg; }) : Promise.resolve(msg);
        return p.then(function(m){ if (/Failed to send|not found|404|FunctionsFetch|Relay/i.test(m)) m = 'La función de preguntas (manual-ia) todavía no está instalada en Supabase. Mientras tanto, usá el buscador de Temas.'; throw new Error(m); }); }
      if (r.data && r.data.error) throw new Error(r.data.error);
      return r.data;
    });
  }
  function enviar(){
    var ta = document.getElementById('cmxm-ta'), q = (ta.value || '').trim(); if (!q || ST.enviando) return;
    if (q.length > 600) q = q.slice(0, 600);
    ta.value = ''; ST.enviando = true;
    var hist = ST.chat.filter(function(m){ return !m.cargando && !m.err; }).slice(-4).map(function(m){ return { rol: m.yo ? 'usuario' : 'asistente', texto: String(m.txt || '').slice(0, 1200) }; });
    ST.chat.push({ yo: true, txt: q }); var slot = { cargando: true }; ST.chat.push(slot); pintar();
    var t = temaDePantalla(M.pantalla());
    llamar({ modulo: M.slug, pregunta: q, pantalla: M.pantalla(), tema_pantalla: t ? t.id : '', tema_abierto: ST.ctxTema || '', rol: rolActual(), historial: hist })
      .then(function(d){ slot.cargando = false; slot.txt = d.respuesta || 'No tengo una respuesta para eso.'; slot.temas = d.temas || []; slot.id = d.id || null; slot.util = null; slot.restantes = d.restantes; })
      .catch(function(e){ slot.cargando = false; slot.err = e.message || String(e); })
      .then(function(){ ST.enviando = false; ST.ctxTema = ''; pintar(); });
  }
  function votar(i, util){ var m = ST.chat[i]; if (!m || !m.id) return; m.util = util; pintar(); llamar({ accion: 'voto', id: m.id, util: util }).catch(function(){}); }

  // ───────── Descargar PDF (imprime el manual completo) ─────────
  function htmlImpresion(){
    var gr = '', ix = '', body = '';
    DOC.temas.forEach(function(t){
      if (t.grupo !== gr) { gr = t.grupo; ix += '<div class="g">' + esc(gr) + '</div>'; }
      ix += '<div class="t"><span>' + t.n + '</span>' + esc(t.titulo) + '<em>' + esc(t.roles.map(function(r){ return ROLES[r] || r; }).join(' · ')) + '</em></div>';
      body += '<section class="tema"><div style="font:700 9pt Inter;letter-spacing:1px;text-transform:uppercase;color:#a9842f">' + esc(t.grupo) + ' · tema ' + t.n + '</div><h3>' + esc(t.titulo) + '</h3>' +
        (t.roles.length ? '<div class="rl">Para: ' + esc(t.roles.map(function(r){ return ROLES[r] || r; }).join(', ')) + '</div>' : '') + render(t.md, BASE, 'p' + t.id) + '</section>';
    });
    var m = DOC.meta;
    return '<div class="cover"><img class="logo" src="' + BASE + 'img/logo-control-max.png" alt="CONTROL MAX"><h1>Manual del usuario<br>' + esc(m.modulo || M.nombre) + '</h1><div class="bar"></div>' +
      '<div class="v">Versión del sistema: <b>' + esc(m.version || '') + '</b><br>Actualizado: ' + esc(m.actualizado || '') + '</div>' +
      (DOC.intro.join('\n').trim() ? '<div style="margin-top:14mm;max-width:150mm">' + render(DOC.intro.join('\n'), BASE, 'intro') + '</div>' : '') + '</div>' +
      '<div class="idx"><h2>Índice</h2>' + ix + '</div>' + body;
  }
  function imprimir(){
    if (!DOC) return;
    var p = document.getElementById('cmxm-print'); if (!p) { p = document.createElement('div'); p.id = 'cmxm-print'; document.body.appendChild(p); }
    p.innerHTML = htmlImpresion();
    var pg = document.createElement('style'); pg.id = 'cmxm-page'; pg.textContent = '@page{size:A4;margin:14mm 14mm 16mm}'; document.head.appendChild(pg);
    var imgs = [].slice.call(p.querySelectorAll('img')); imgs.forEach(function(i){ i.loading = 'eager'; });
    var listo = Promise.all(imgs.map(function(i){ return i.complete ? 0 : new Promise(function(ok){ i.onload = i.onerror = ok; setTimeout(ok, 4000); }); }));
    cerrar();
    listo.then(function(){
      document.body.classList.add('cmxm-printing');
      setTimeout(function(){ window.print(); document.body.classList.remove('cmxm-printing'); p.innerHTML = ''; var s = document.getElementById('cmxm-page'); if (s) s.remove(); }, 80);
    });
  }

  // ───────── API pública ─────────
  function abrir(opts){
    opts = opts || {};
    M = modActual(); if (!M) return;
    montar();
    ROOT.classList.add('on'); document.getElementById('cmxm-bg').classList.add('on');
    var bd = document.getElementById('cmxm-bd');
    var seguir = function(){
      if (opts.pdf) { imprimir(); return; }
      var p = M.pantalla(), cambio = p !== ST.ultPantalla; ST.ultPantalla = p;
      var t = opts.tema ? DOC.temas.filter(function(x){ return x.id === opts.tema; })[0] : (cambio ? temaDePantalla(p) : null);
      if (t) abrirTema(t.id); else { if (cambio) { ST.vista = 'indice'; ST.tab = 'temas'; } pintar(); }
    };
    if (DOC) return seguir();
    bd.innerHTML = '<div class="empty"><span class="spin"></span>Abriendo el manual…</div>';
    cargar().then(seguir).catch(function(e){ bd.innerHTML = '<div class="empty">⚠️ No se pudo abrir el manual de ' + esc(M.nombre) + '.<br><small>' + esc(e.message || e) + '</small><br><br>Revisá tu conexión e intentá de nuevo.</div>'; });
  }
  window.CMXManual = { version: VERSION, abrir: abrir, cerrar: function(){ if (ROOT) cerrar(); }, imprimir: function(){ abrir({ pdf: true }); },
    disponible: function(){ return !!modActual(); }, _parse: parse, _render: render,
    _impresion: function(){ return DOC ? htmlImpresion() : ''; } };
})();
