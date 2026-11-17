/* ==========================================================================
   Revisa la portada: que las siete ediciones estén libres y que no quede
   nada del candado ni de la palabra clave.

   Correr:
       node scripts/revisar-portada.js
       node scripts/revisar-portada.js otro-index.html     (para comparar)

   La segunda forma sirve para comprobar que la prueba detecta el error: si se
   la corre contra una copia vieja de index.html, tiene que fallar.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const {cargar} = require("./arnes-museos.js");

const ruta = process.argv[2] || path.join(__dirname, "..", "index.html");
let bien = 0;
const mal = [];

function ok(que, condicion, detalle){
  if(condicion){ bien++; return true; }
  mal.push(que + (detalle ? " — " + detalle : ""));
  return false;
}

console.log("Revisando " + path.basename(ruta) + "\n");

/* ---------- 1. el HTML: que no queden el sello ni el campo de la clave ---- */
const html = fs.readFileSync(ruta, "utf8");
const portada = html.slice(html.indexOf('<div id="portal">'), html.indexOf("<script>"));

ok("la portada no tiene sellos de candado", !/id="sello\d"/.test(portada),
    "quedó " + (portada.match(/id="sello\d"/g) || []).join(" "));
ok("ninguna tapa nace cerrada", !/class="tapa cerrada"/.test(portada),
    (portada.match(/class="tapa cerrada"/g) || []).length + " tapas con la clase cerrada");
ok("no hay campo para la palabra clave", !/id="clave"/.test(portada) && !/id="filaclave"/.test(portada));
ok("no dice Cerrado en la portada", !/Cerrado/.test(portada));
ok("no pide una palabra clave en la portada", !/[Pp]alabra clave/.test(portada));
ok("las siete tapas siguen estando",
    [1,2,3,4,5,6,7].every(n => portada.indexOf('id="tapa' + n + '"') > 0));

/* ---------- 2. el motor: que no quede ninguna clave escrita ------------- */
const js = html.slice(html.indexOf("<script>"), html.lastIndexOf("</script>"));
ok("no quedó ninguna palabra clave en el código", !/const PALABRA/.test(js),
    (js.match(/const PALABRA\w*/g) || []).join(" "));
ok("no quedaron las funciones de desbloqueo por edición",
    !/function el(Dos|Tres|Cuatro|Cinco|Seis)EstaAbierto/.test(js));

/* ---------- 3. el juego cargado ---------------------------------------- */
let j;
try{
  j = cargar({html: ruta});
  j.sembrar(12345);
  bien++;
}catch(e){
  mal.push("el juego no se pudo cargar — " + e.message);
  console.log("✗ " + mal.join("\n✗ "));
  process.exit(1);
}
const api = j.api;
const doc = j.document;
const ediciones = Object.keys(api.JUEGOS).filter(n => +n !== 9).map(Number);

ok("están las siete ediciones más el desafío", ediciones.length === 7,
    "encontré " + ediciones.length + ": " + ediciones.join(","));

/* todas abiertas, incluso con un legajo recién nacido */
api.LEGAJO = {nombre:"Prueba", salas:{}, maratones:{}, dif:1};
const cerradas = ediciones.filter(n => !api.elJuegoEstaAbierto(n));
ok("las siete ediciones están abiertas sin haber jugado nada", cerradas.length === 0,
    "siguen cerradas: " + cerradas.join(","));

ok("edicionesAbiertas() devuelve las siete",
    api.edicionesAbiertas().length === ediciones.length,
    "devolvió " + api.edicionesAbiertas().length);

/* ---------- 4. tocar cada tapa no pide nada ---------------------------- */
const pedido = doc.getElementById("pedido");
pedido.classList.add("off");
let pidio = [];
for(const n of ediciones){
  api.elegirJuego(1);                        // para que el toque sea el primero
  pedido.classList.add("off");
  if(n === 1) continue;
  api.tocarTapa(n);
  if(!pedido.classList.contains("off")) pidio.push(n);
}
ok("tocar una tapa no abre ningún cartel pidiendo clave", pidio.length === 0,
    "pidió algo en la edición " + pidio.join(","));

const tit = doc.getElementById("pedidotit");
ok("el cartel no habla de ediciones cerradas", !/cerrada/i.test(tit.textContent || ""),
    "decía: " + tit.textContent);

const btn = doc.getElementById("pedidobtn");
ok("el botón no quedó en «Abrir»", (btn.textContent || "") !== "Abrir",
    "decía: " + btn.textContent);

/* ---------- 5. el pie de cada tapa cuenta la edición, no cómo abrirla --- */
const pies = [];
for(const n of ediciones){
  api.elegirJuego(n);
  api.textoDelPie();
  const t = doc.getElementById("portalpie").innerHTML || "";
  if(/se abre|palabra clave/i.test(t)) pies.push(n + ": " + t.slice(0, 60));
}
ok("ningún pie dice cómo desbloquear", pies.length === 0, pies.join(" | "));

/* ---------- 6. cada edición arranca de verdad -------------------------- */
const fallaron = [];
for(const n of ediciones){
  try{
    api.cargarJuego(n);
    const primera = Object.keys(api.SALAS)[0];
    j.TIMERS.length = 0;
    api.newGame(primera);
    j.drain();
    const S = api.S;
    if(!S || S.round !== 1) fallaron.push(n + " (no arrancó)");
    else if(S.marks.vitrinas.length !== 3) fallaron.push(n + " (" + S.marks.vitrinas.length + " vitrinas)");
  }catch(e){ fallaron.push(n + " (" + e.message + ")"); }
}
ok("las siete ediciones arrancan una sala", fallaron.length === 0, fallaron.join(" | "));

/* ---------- 7. un legajo viejo con claves guardadas no molesta --------- */
try{
  api.cargarJuego(1);
  j.guardado["museos.legajo.v1"] = JSON.stringify(
    {nombre:"Viejo", salas:{}, clave2:true, clave3:true, clave6:true, dif:2});
  const l = api.leerLegajo();
  ok("un legajo viejo con claves se lee igual", l.nombre === "Viejo" && l.dif === 2);
  api.LEGAJO = l;
  api.anotarSala("tutorial", 12, true);
  /* queda anotada en la dificultad EN CURSO, no en la que traía el legajo */
  ok("anotar una sala no explota con todo abierto",
      api.hechaEn("tutorial", api.DIFICULTAD),
      "no quedó anotada en la dificultad " + api.DIFICULTAD);
}catch(e){
  mal.push("el legajo viejo rompió algo — " + e.message);
}

/* ---------- resultado -------------------------------------------------- */
console.log(bien + " comprobaciones pasaron");
if(mal.length){
  console.log("\n" + mal.length + " fallaron:");
  mal.forEach(m => console.log("  ✗ " + m));
  process.exit(1);
}
console.log("Todo bien: las siete ediciones están libres y no quedó nada del candado.");
