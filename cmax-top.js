/* CONTROL MAX — barra flotante común a todos los módulos (y al portal).
   · 🏠 CONTROL MAX: vuelve al portal.
   · ⧉ Ventana: abre otra ventana de CONTROL MAX (esta misma pantalla, el portal o cualquier módulo)
     sin tener que ir a la barra del navegador. La sesión es la misma, no pide volver a entrar.
   Incluir en cada módulo con:  <script src="/cmax-top.js"></script>
   Cuando el portal pase a ser la raíz del sitio, cambiá PORTAL a '/'.
   v2 · 2026-10: botón de ventanas nuevas; no se muestra dentro de iframes (reportes embebidos en TOTAL). */
(function(){
  var PORTAL='/portal.html';   // ← destino del portal CONTROL MAX
  var MODS=[
    ['🏭','CONTROL TRACE','/CONTROLTRACE/controltrace/index.html'],
    ['🧾','CONTROL PLUS','/CONTROLTRACE/controlplus/index.html'],
    ['📊','CONTROL TOTAL','/CONTROLTRACE/controltotal/index.html'],
    ['🌿','CONTROLAGRO','/CONTROLTRACE/controlagro/index.html'],
    ['⚙️','Configuración','/CONTROLTRACE/controlconfig/index.html']
  ];
  try{
    if(window.self!==window.top) return;               // dentro de un iframe (p. ej. reportes de TRACE en TOTAL): nada
    var enPortal=/portal\.html$|^\/$/.test(location.pathname);
    var css=document.createElement('style');
    css.textContent=
      '#cmax-bar{position:fixed;top:9px;left:50%;transform:translateX(-50%);z-index:2147483000;display:flex;gap:6px;align-items:center}'+
      '#cmax-bar .cmx{display:flex;align-items:center;gap:6px;background:#233246;color:#fff;border:1px solid #2e4159;border-radius:22px;padding:7px 14px;'+
      "font:700 12px/1 Inter,'Segoe UI',system-ui,sans-serif;letter-spacing:.3px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.28);text-decoration:none}"+
      '#cmax-bar .cmx:hover{background:#2c4159}#cmax-bar .cmx b{color:#e0a92a}'+
      '#cmax-win-menu{position:absolute;top:38px;left:50%;transform:translateX(-50%);min-width:250px;background:#fff;color:#1A2E45;border:1px solid #d5dde7;border-radius:10px;'+
      "box-shadow:0 10px 30px rgba(0,0,0,.22);padding:6px;display:none;font:500 13px/1.2 Inter,'Segoe UI',system-ui,sans-serif}"+
      '#cmax-win-menu.open{display:block}'+
      '#cmax-win-menu .it{display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:7px;cursor:pointer;white-space:nowrap}'+
      '#cmax-win-menu .it:hover{background:#eef3f8}#cmax-win-menu .sep{height:1px;background:#e3e9f0;margin:5px 4px}'+
      '#cmax-win-menu .hd{font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#7a8899;padding:6px 10px 4px}'+
      '@media print{#cmax-bar,#cmax-home{display:none!important}}';
    document.head.appendChild(css);
    var abrir=function(url){
      var w=Math.round((screen.availWidth||1280)*0.92), h=Math.round((screen.availHeight||800)*0.9);
      var l=Math.round(((screen.availWidth||w)-w)/2)+24*(Math.floor(Math.random()*4)), t=Math.round(((screen.availHeight||h)-h)/2)+18;
      var v=window.open(url,'_blank','popup=yes,width='+w+',height='+h+',left='+l+',top='+t);
      if(!v){ alert('El navegador bloqueó la ventana nueva. Permití las ventanas emergentes para este sitio (ícono en la barra de direcciones) y volvé a intentar.'); }
    };
    var mount=function(){
      if(document.getElementById('cmax-bar'))return;
      var bar=document.createElement('div'); bar.id='cmax-bar';
      if(!enPortal){
        var a=document.createElement('a'); a.id='cmax-home'; a.className='cmx'; a.href=PORTAL;
        a.title='Volver al portal CONTROL MAX'; a.innerHTML='🏠 CONTROL <b>MAX</b>'; bar.appendChild(a);
      }
      var b=document.createElement('div'); b.className='cmx'; b.id='cmax-win'; b.title='Abrir otra ventana de CONTROL MAX';
      b.innerHTML='⧉ <span>Ventana</span>'; bar.appendChild(b);
      var m=document.createElement('div'); m.id='cmax-win-menu';
      var html='<div class="hd">Abrir en otra ventana</div>'+
        (enPortal?'':'<div class="it" data-u="__aqui">🗗 Esta misma pantalla</div>')+
        '<div class="it" data-u="'+PORTAL+'">🏠 Portal CONTROL MAX</div><div class="sep"></div>';
      MODS.forEach(function(x){ html+='<div class="it" data-u="'+x[2]+'">'+x[0]+' '+x[1]+'</div>'; });
      m.innerHTML=html; bar.appendChild(m);
      b.addEventListener('click',function(e){ e.stopPropagation(); m.classList.toggle('open'); });
      m.addEventListener('click',function(e){ var it=e.target.closest('.it'); if(!it)return; e.stopPropagation(); m.classList.remove('open');
        var u=it.getAttribute('data-u'); abrir(u==='__aqui'?location.href:u); });
      document.addEventListener('click',function(){ m.classList.remove('open'); });
      document.addEventListener('keydown',function(e){ if(e.key==='Escape') m.classList.remove('open'); });
      (document.body||document.documentElement).appendChild(bar);
    };
    if(document.body)mount();
    else document.addEventListener('DOMContentLoaded',mount);
  }catch(e){}
})();
