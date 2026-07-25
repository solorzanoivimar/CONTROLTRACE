(function() {
  // ── Sesión del portal (el portal guarda en 'fmn'; dejamos fallback por compatibilidad) ──
  function getSesion() {
    try { return JSON.parse(sessionStorage.getItem('fmn') || sessionStorage.getItem('fmn_sesion')); }
    catch(e) { return null; }
  }
  const sesion = getSesion();
  const rol = (sesion && sesion.rol) ? String(sesion.rol).toLowerCase() : null;

  // ── Todos los módulos ──
  const TODOS = [
    { id:'trace', label:'CONTROL TRACE', ico:'🏭', url:'/CONTROLTRACE/index.html' },
    { id:'agro',  label:'CONTROLAGRO',   ico:'🌿', url:'/CONTROLTRACE/controlagro/index.html' },
    { id:'plus',  label:'CONTROL PLUS',  ico:'🧾', url:null, prox:true },
  ];

  // ── Permisos por rol ──
  const PERMISOS = {
    admin:  ['trace','agro','plus'],
    dueno:  ['trace','agro','plus'],
    dueño:  ['trace','agro','plus'],
    galpon: ['trace'],
    finca:  ['agro'],
  };
  // Si hay rol conocido, filtra; si no hay sesión/rol, muestra todo (fallback)
  const permitidos = (rol && PERMISOS[rol]) ? PERMISOS[rol] : ['trace','agro','plus'];
  const modulos = TODOS.filter(m => permitidos.includes(m.id));

  // ── Detectar módulo actual ──
  const path = window.location.pathname;
  let actual = 'trace';
  if(path.includes('controlagro')) actual = 'agro';

  // ── Estilos ──
  const style = document.createElement('style');
  style.textContent = `
    #cm-navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
      background: #111D35;
      border-bottom: 2px solid rgba(201,168,76,0.4);
      display: flex; align-items: center;
      height: 44px; padding: 0 16px;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    }
    #cm-navbar .cm-brand {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 800; color: #fff;
      text-decoration: none; margin-right: 20px; white-space: nowrap;
      letter-spacing: 0.3px;
    }
    #cm-navbar .cm-brand .cm-max { color: #C9A84C; }
    #cm-navbar .cm-tabs { display: flex; gap: 4px; flex: 1; }
    #cm-navbar .cm-tab {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 14px; border-radius: 6px;
      font-size: 12px; font-weight: 600; letter-spacing: 0.3px;
      cursor: pointer; text-decoration: none;
      transition: background 0.15s, color 0.15s;
      color: rgba(255,255,255,0.6); white-space: nowrap;
      border: 1px solid transparent;
    }
    #cm-navbar .cm-tab:hover { background: rgba(255,255,255,0.08); color: #fff; }
    #cm-navbar .cm-tab.active {
      background: rgba(201,168,76,0.15);
      color: #C9A84C;
      border-color: rgba(201,168,76,0.35);
    }
    #cm-navbar .cm-tab.prox { opacity: 0.38; cursor: default; pointer-events: none; }
    #cm-navbar .cm-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    #cm-navbar .cm-usuario {
      font-size: 11px; color: rgba(255,255,255,0.5);
      white-space: nowrap; max-width: 180px;
      overflow: hidden; text-overflow: ellipsis;
    }
    #cm-navbar .cm-rol {
      font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
      text-transform: uppercase; color: #C9A84C;
      background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3);
      border-radius: 4px; padding: 2px 7px; white-space: nowrap;
    }
    #cm-navbar .cm-btn-portal {
      font-size: 11px; font-weight: 600;
      background: rgba(201,168,76,0.12);
      color: #C9A84C; border: 1px solid rgba(201,168,76,0.3);
      border-radius: 5px; padding: 4px 10px; cursor: pointer;
      font-family: inherit; transition: background 0.15s;
      text-decoration: none; white-space: nowrap;
    }
    #cm-navbar .cm-btn-portal:hover { background: rgba(201,168,76,0.22); }
    body { padding-top: 44px !important; }
    @media print { #cm-navbar { display:none !important; } body { padding-top:0 !important; } }
  `;
  document.head.appendChild(style);

  // ── Construir barra ──
  const nav = document.createElement('div');
  nav.id = 'cm-navbar';

  const brand = document.createElement('a');
  brand.href = '/';
  brand.className = 'cm-brand';
  brand.innerHTML = '<span>CONTROL <span class="cm-max">MAX</span></span>';

  const tabs = document.createElement('div');
  tabs.className = 'cm-tabs';
  modulos.forEach(m => {
    const a = document.createElement('a');
    a.className = 'cm-tab' + (m.id === actual ? ' active' : '') + (m.prox ? ' prox' : '');
    a.href = m.url || '#';
    a.innerHTML = m.ico + ' ' + m.label;
    if(m.prox) a.title = 'Próximamente';
    tabs.appendChild(a);
  });

  const right = document.createElement('div');
  right.className = 'cm-right';

  if(sesion) {
    if(rol) {
      const rb = document.createElement('span');
      rb.className = 'cm-rol';
      rb.textContent = {admin:'Admin', dueno:'Dueño', 'dueño':'Dueño', galpon:'Galpón', finca:'Finca'}[rol] || rol;
      right.appendChild(rb);
    }
    const usr = document.createElement('span');
    usr.className = 'cm-usuario';
    usr.textContent = sesion.nombre || sesion.email || '';
    right.appendChild(usr);
  }

  const btnSalir = document.createElement('a');
  btnSalir.href = '#';
  btnSalir.className = 'cm-btn-portal';
  btnSalir.textContent = '⎋ Salir';
  btnSalir.title = 'Cerrar sesión';
  btnSalir.onclick = function(e){
    e.preventDefault();
    try { sessionStorage.removeItem('fmn'); sessionStorage.removeItem('fmn_sesion'); } catch(_){ }
    try { Object.keys(localStorage).forEach(function(k){ if(k.indexOf('sb-')===0) localStorage.removeItem(k); }); } catch(_){ }
    window.location.href = '/';
  };
  right.appendChild(btnSalir);

  nav.appendChild(brand);
  nav.appendChild(tabs);
  nav.appendChild(right);

  document.body.insertBefore(nav, document.body.firstChild);
})();
