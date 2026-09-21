/* El balance de Los Museos: Aura.
   Juega miles de batallas de la máquina contra sí misma y dice si el juego
   está parejo. Correr desde la raíz del repositorio:

       node scripts/balance-aura.js

   Lo que hay que mirar: que gane cerca del 50%, que ninguna pelea quede sin
   terminar, y que entre el mejor y el peor de los diez no haya un abismo. */
require("./arnes-aura.js");

/* azar con semilla, para que el resultado se pueda repetir */
let sem = 12345;
ponerAzar(() => { sem = (sem*1664525 + 1013904223) >>> 0; return sem / 4294967296; });

const TOPE = 400;                      // más que esto es una pelea que no termina
function unaBatalla(mios, suyos){
  const est = nuevaBatalla(mios, suyos);
  let vueltas = 0;
  while(!est.fin && vueltas < TOPE){
    vueltas++;
    resolverRonda(est, elegirMaquina(est, "a"), elegirMaquina(est, "b"));
    if(est.fin) break;
    for(const l of ["a","b"]) if(activo(est, l).caido) entraSolo(est, l);
    for(const l of ["a","b"]){
      const p = activo(est, l);
      if(p.vida < 0 || Number.isNaN(p.vida)) throw new Error("vida rota: " + p.n + " " + p.vida);
      if(p.aura < 0 || p.aura > p.auraMax) throw new Error("aura fuera de rango: " + p.aura);
    }
  }
  return {gana:est.fin, rondas:vueltas, colgada:!est.fin};
}

const mios = Object.keys(CREW), suyos = Object.keys(OTROS);
const tres = (lista, r) => {
  const c = lista.slice();
  for(let i = c.length-1; i > 0; i--){ const j = (r()*(i+1))|0; [c[i],c[j]] = [c[j],c[i]]; }
  return c.slice(0,3);
};
const azar = () => { sem = (sem*1664525 + 1013904223) >>> 0; return sem/4294967296; };

let ganeA = 0, colgadas = 0, sumaRondas = 0;
const porCabeza = {};
for(const k of mios) porCabeza[k] = {jugo:0, gano:0};
const N = 4000;
for(let i = 0; i < N; i++){
  const eq = tres(mios, azar), ri = tres(suyos, azar);
  const r = unaBatalla(eq, ri);
  if(r.colgada) colgadas++;
  if(r.gana === "a") ganeA++;
  sumaRondas += r.rondas;
  for(const k of eq){ porCabeza[k].jugo++; if(r.gana === "a") porCabeza[k].gano++; }
}
console.log(N + " batallas · equipo propio gana el " + (100*ganeA/N).toFixed(1) + "%");
console.log("rondas promedio: " + (sumaRondas/N).toFixed(1) + " · sin terminar: " + colgadas);
console.log("\nuno por uno (cuánto gana el equipo que lo lleva):");
Object.entries(porCabeza)
  .map(([k,v]) => [CREW[k].n, 100*v.gano/v.jugo, v.jugo])
  .sort((a,b) => b[1]-a[1])
  .forEach(([n,p,j]) => console.log("  " + n.padEnd(11) + p.toFixed(1) + "%  (" + j + " batallas)"));
