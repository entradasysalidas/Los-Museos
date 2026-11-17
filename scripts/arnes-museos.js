/* ==========================================================================
   Arnés de Los Museos · emula lo justo del navegador para correr el juego
   en node, sin navegador y sin dependencias.

   No se usa solo: lo cargan los revisores de scripts/ (revisar-portada.js y
   los que vengan). Todo el juego vive en index.html, así que acá se corta el
   JavaScript que está entre <script> y </script> y se lo levanta con:

   - stubs de document, canvas, localStorage, sessionStorage y fetch;
   - setTimeout reemplazado por una cola que se drena a mano, porque el juego
     encadena las fases con temporizadores y si no nunca avanzan;
   - el motor expuesto en un objeto, para poder jugar desde el script.

   Uso:
       const { cargar } = require("./arnes-museos.js");
       const j = cargar();
       j.api.newGame("n1"); j.drain();

   El azar queda sembrado (j.sembrar(123)) así dos corridas dan lo mismo.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const NADA = () => {};

/* un contexto de canvas que acepta todo y no dibuja nada */
function lienzo2d(){
  return new Proxy({}, {
    get(t, p){
      if(p === "canvas") return {width:0, height:0};
      if(p === "measureText") return () => ({width:0});
      if(p === "createRadialGradient" || p === "createLinearGradient" ||
         p === "createPattern")       return () => ({addColorStop:NADA});
      if(p === "getImageData")        return () => ({data:[0,0,0,0]});
      return typeof p === "string" ? (t[p] !== undefined ? t[p] : NADA) : NADA;
    },
    set(t, p, v){ t[p] = v; return true; },
  });
}

/* la lista de clases de un elemento, que el juego usa todo el tiempo */
function clases(){
  const s = new Set();
  return {
    add   : (...a) => a.forEach(x => s.add(x)),
    remove: (...a) => a.forEach(x => s.delete(x)),
    toggle: (x, f) => { if(f === undefined){ s.has(x) ? s.delete(x) : s.add(x); }
                        else { f ? s.add(x) : s.delete(x); } },
    contains: x => s.has(x),
    get lista(){ return [...s]; },
  };
}

function elemento(id){
  return {
    id, value:"", innerHTML:"", textContent:"", hidden:false,
    style:{setProperty:NADA, removeProperty:NADA},
    dataset:{}, children:[], firstChild:null,
    classList: clases(),
    getContext: () => lienzo2d(),
    querySelector: () => null,
    querySelectorAll: () => [],
    appendChild:NADA, removeChild:NADA, insertBefore:NADA, remove:NADA,
    addEventListener:NADA, removeEventListener:NADA,
    setAttribute:NADA, getAttribute:() => null, removeAttribute:NADA,
    focus:NADA, blur:NADA, select:NADA, setSelectionRange:NADA,
    animate: () => ({}), scrollIntoView:NADA, click:NADA,
    getBoundingClientRect: () => ({left:0, top:0, right:544, bottom:544, width:544, height:544}),
    offsetWidth:0, offsetHeight:0, scrollTop:0, scrollHeight:0,
  };
}

/* qué del motor queda a mano para los revisores */
const EXPUESTO = [
  "newGame", "cargarJuego", "bfsFrom", "key", "canStep", "step", "vecinasDe",
  "drinkMate", "canDrinkHere", "finishRound", "useObject", "buildBoard",
  "ponerDificultad", "DIFICULTADES", "JUEGOS", "PIECES", "TUNE", "CREW",
  "DIRS", "W", "H", "CX0", "CY0", "CW", "CH", "MARCO_BASE",
  "elJuegoEstaAbierto", "edicionesAbiertas", "elegirJuego", "tocarTapa",
  "entrar", "prepararPortal", "pedirNombre", "textoDelPie", "cerrarPedido",
  "leerLegajo", "guardarLegajo", "hechaEn", "anotarSala", "marcasDe",
  "menu", "ficha", "ropero", "salaDelDia", "generarTableroDia", "SEMILLAS_DIA",
  "aislados", "rngDia", "hermanaDe", "medallaDe",
];
/* las que son variables y cambian: van con getter */
const MIRADAS = ["S", "SALAS", "FOES", "JUEGO", "ELEGIDO", "DIFICULTAD",
                 "LEGAJO", "AZAR", "EPOCA", "FRAME_MAP", "SALAS_DIA"];

function cargar(opciones){
  const op = opciones || {};
  const ruta = op.html || path.join(__dirname, "..", "index.html");
  const html = fs.readFileSync(ruta, "utf8");
  const abre = html.indexOf("<script>");
  const cierra = html.lastIndexOf("</script>");
  if(abre < 0 || cierra < 0) throw new Error("no encontré el <script> de " + ruta);
  const codigo = html.slice(abre + "<script>".length, cierra);

  const elementos = {};
  const guardado = {};
  const sesion = {};
  const TIMERS = [];

  const doc = {
    getElementById: id => elementos[id] || (elementos[id] = elemento(id)),
    createElement : () => elemento("suelto"),
    body: {classList: clases(), style:{setProperty:NADA}, appendChild:NADA, removeChild:NADA},
    documentElement: {classList: clases(), style:{setProperty:NADA}},
    head: {appendChild:NADA},
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: NADA,
    execCommand: () => true,
    hidden: false, visibilityState: "visible",
  };

  const almacen = tabla => ({
    getItem   : k => (k in tabla ? tabla[k] : null),
    setItem   : (k, v) => { tabla[k] = String(v); },
    removeItem: k => { delete tabla[k]; },
    clear     : () => { for(const k in tabla) delete tabla[k]; },
  });

  Object.assign(globalThis, {
    document: doc,
    addEventListener: NADA, removeEventListener: NADA,
    requestAnimationFrame: NADA, cancelAnimationFrame: NADA,
    /* sin http:// el juego no pide version.txt, que es lo que queremos */
    location: {search: op.search || "", protocol: "file:", pathname: "/", href: "file:///",
               reload: NADA, replace: NADA},
    performance: {now: () => 0},
    matchMedia: () => ({matches:false, addEventListener:NADA, addListener:NADA}),
    fetch: () => Promise.reject(new Error("el arnés no tiene red")),
    localStorage: almacen(guardado),
    sessionStorage: almacen(sesion),
    setTimeout: fn => { TIMERS.push(fn); return TIMERS.length; },
    clearTimeout: NADA, setInterval: () => 0, clearInterval: NADA,
    alert: NADA, confirm: () => true,
  });
  if(!globalThis.navigator) Object.defineProperty(globalThis, "navigator", {
    value: {clipboard:null, serviceWorker:null, standalone:false, userAgent:"node"},
    configurable: true, writable: true,
  });
  globalThis.window = globalThis;

  const exportar =
    "\n;globalThis.__MUSEOS__ = {" +
    EXPUESTO.map(n => "get " + n + "(){ return typeof " + n + " === 'undefined' ? undefined : " + n + " }").join(",") +
    "," +
    MIRADAS.map(n => "get " + n + "(){ return typeof " + n + " === 'undefined' ? undefined : " + n + " }," +
                     "set " + n + "(v){ " + n + " = v }").join(",") +
    "};\n";

  vm.runInThisContext(codigo + exportar, {filename: "index.html (script)"});

  const api = globalThis.__MUSEOS__;

  /* corre los temporizadores pendientes: es lo que hace avanzar las fases */
  const drain = (tope) => {
    let i = 0, max = tope || 9000;
    while(TIMERS.length && i++ < max){
      const f = TIMERS.shift();
      try{ f(); }catch(e){ throw new Error("temporizador: " + e.message); }
    }
    return i;
  };

  /* azar sembrado, para que dos corridas den lo mismo */
  const sembrar = (semilla) => {
    let a = (semilla || 1) >>> 0;
    Math.random = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
    if(api.AZAR) api.AZAR = Math.random;
  };

  return {api, document: doc, elementos, guardado, TIMERS, drain, sembrar,
          codigo, ruta};
}

module.exports = {cargar};
