/* El arnés de Los Museos: Aura.
   Emula lo justo del navegador —document, canvas, window, location— para que
   batalla.html corra en node, y deja el motor a mano para jugar miles de
   batallas solas. No dibuja nada: el canvas es un Proxy que se traga todo.

   No se usa solo: lo carga scripts/balance-aura.js.

   Que el motor no toque el DOM es a propósito y hay que mantenerlo así: es lo
   único que permite probar el juego sin navegador. */
const fs = require("fs");

function ctxFalso(){
  return new Proxy({}, {
    get(t, k){
      if(k === "canvas") return {width:0, height:0};
      if(k in t) return t[k];
      return () => ({addColorStop(){}});
    },
    set(t, k, v){ t[k] = v; return true; },
  });
}
function elemento(){
  const el = {
    style:{}, classList:{toggle(){}, add(){}, remove(){}, contains(){return false;}},
    innerHTML:"", textContent:"", hidden:false, disabled:false, width:0, height:0,
    addEventListener(){}, appendChild(){}, getContext:() => ctxFalso(),
    getBoundingClientRect:() => ({width:390, height:520, left:0, top:0}),
    querySelector:() => elemento(), querySelectorAll:() => [elemento(), elemento()],
  };
  el.parentElement = el;                 // el lienzo le pregunta el tamaño al padre
  return el;
}
global.document = { getElementById:() => elemento(), createElement:() => elemento(), body:elemento() };
global.window = { devicePixelRatio:1, addEventListener(){}, fetch:null };
global.location = { protocol:"file:", search:"", pathname:"/batalla.html" };
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => 0;
global.setTimeout = () => 0;
global.clearTimeout = () => {};

const html = fs.readFileSync(process.env.AURA || "batalla.html", "utf8");
const codigo = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const salida = ["nuevaBatalla","resolverRonda","elegirMaquina","activo","enPie","entraSolo",
                "calcularDanio","armarPeleador","CREW","OTROS","GOLPES","PERFILES","PERFILES_OTROS"];
eval(codigo + "\n;Object.assign(globalThis, {" + salida.join(",") + "});" +
     "globalThis.ponerAzar = f => { AZAR = f; };");
module.exports = {};
