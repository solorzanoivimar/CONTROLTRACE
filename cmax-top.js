/* CONTROL MAX — botón "Inicio / Portal" flotante para todos los módulos.
   Incluir en cada módulo con:  <script src="/cmax-top.js"></script>
   Cuando el portal pase a ser la raíz del sitio, cambiá PORTAL a '/'. */
(function(){
  var PORTAL='/portal.html';   // ← destino del portal CONTROL MAX
  try{
    var css=document.createElement('style');
    css.textContent=
      '#cmax-home{position:fixed;top:9px;left:50%;transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:6px;'+
      'background:#233246;color:#fff;border:1px solid #2e4159;border-radius:22px;padding:7px 14px;'+
      "font:700 12px/1 Inter,'Segoe UI',system-ui,sans-serif;letter-spacing:.3px;cursor:pointer;"+
      'box-shadow:0 4px 14px rgba(0,0,0,.28);text-decoration:none}'+
      '#cmax-home:hover{background:#2c4159}#cmax-home b{color:#e0a92a}'+
      '@media print{#cmax-home{display:none!important}}';
    document.head.appendChild(css);
    var mount=function(){
      if(document.getElementById('cmax-home'))return;
      var a=document.createElement('a');
      a.id='cmax-home';a.href=PORTAL;
      a.title='Volver al portal CONTROL MAX';
      a.innerHTML='🏠 CONTROL <b>MAX</b>';
      (document.body||document.documentElement).appendChild(a);
    };
    if(document.body)mount();
    else document.addEventListener('DOMContentLoaded',mount);
  }catch(e){}
})();
