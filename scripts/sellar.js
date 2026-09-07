/* Sella la versión del juego.
   Calcula un resumen del contenido de index.html —sin contar la propia línea
   de la versión, que si no cambiaría sola cada vez— y lo escribe en los dos
   lugares que tienen que coincidir: la constante VERSION de index.html y el
   archivo version.txt que la página consulta al abrirse.

   Correr esto antes de cada commit que toque index.html:
       node scripts/sellar.js                                             */
const fs = require("fs"), crypto = require("crypto");
const NL = String.fromCharCode(10), CR = String.fromCharCode(13);

const ruta = "index.html";
let s = fs.readFileSync(ruta, "utf8");
const eraCRLF = s.includes(CR + NL);
s = s.split(CR + NL).join(NL);

const linea = /const VERSION = "[^"]*";/;
if (!linea.test(s)) { console.error("index.html no tiene la constante VERSION"); process.exit(1); }

const sinVersion = s.replace(linea, 'const VERSION = "";');
const sello = crypto.createHash("sha1").update(sinVersion).digest("hex").slice(0, 10);

const antes = (s.match(/const VERSION = "([^"]*)";/) || [])[1];
if (antes === sello) { console.log("sin cambios · versión " + sello); process.exit(0); }

s = s.replace(linea, 'const VERSION = "' + sello + '";');
fs.writeFileSync(ruta, eraCRLF ? s.split(NL).join(CR + NL) : s);
fs.writeFileSync("version.txt", sello + NL);
console.log("versión " + sello + " · sellada en index.html y version.txt");
