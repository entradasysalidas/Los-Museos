/* Sella la versión de un juego.
   Calcula un resumen del contenido del archivo —sin contar la propia línea
   de la versión, que si no cambiaría sola cada vez— y lo escribe en los dos
   lugares que tienen que coincidir: la constante VERSION del html y el
   archivo de versión que la página consulta al abrirse.

   Correr esto antes de cada commit que toque uno de los dos juegos:
       node scripts/sellar.js                  → index.html   y version.txt
       node scripts/sellar.js batalla.html     → batalla.html y version-batalla.txt

   Sin argumentos sella index.html, como siempre.                        */
const fs = require("fs"), crypto = require("crypto");
const NL = String.fromCharCode(10), CR = String.fromCharCode(13);

/* Cada juego tiene su archivo de versión, porque cada uno se recarga solo. */
const SALIDA = { "index.html":"version.txt", "batalla.html":"version-batalla.txt" };

const ruta = process.argv[2] || "index.html";
const salida = SALIDA[ruta];
if (!salida) {
  console.error("no sé en qué archivo de versión sellar " + ruta +
    " · los que sé son: " + Object.keys(SALIDA).join(", "));
  process.exit(1);
}

let s = fs.readFileSync(ruta, "utf8");
const eraCRLF = s.includes(CR + NL);
s = s.split(CR + NL).join(NL);

const linea = /const VERSION = "[^"]*";/;
if (!linea.test(s)) { console.error(ruta + " no tiene la constante VERSION"); process.exit(1); }

const sinVersion = s.replace(linea, 'const VERSION = "";');
const sello = crypto.createHash("sha1").update(sinVersion).digest("hex").slice(0, 10);

const antes = (s.match(/const VERSION = "([^"]*)";/) || [])[1];
if (antes === sello) { console.log("sin cambios · versión " + sello); process.exit(0); }

s = s.replace(linea, 'const VERSION = "' + sello + '";');
fs.writeFileSync(ruta, eraCRLF ? s.split(NL).join(CR + NL) : s);
fs.writeFileSync(salida, sello + NL);
console.log("versión " + sello + " · sellada en " + ruta + " y " + salida);
