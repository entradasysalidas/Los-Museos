# Auditoría de Los Museos · código y jugabilidad

**Tercera pasada · 15 de septiembre de 2026.** Reemplaza a las del 4 y el 7.
Sobre `index.html`, 11 151 líneas, versión sellada `199a225f9d`.

Desde la pasada anterior entraron **71 commits**: cinco ediciones nuevas —Vacaciones,
el espacio, la montaña, la ciudad y Total disociación—, una habilidad distinta por
cabeza en la séptima, las medallas por sala, el desafío diario con dificultad propia por
día, y mucho ajuste de teléfono. El archivo pasó de 6273 a 11 151 líneas y el juego, de
20 salas a **70**.

**Este informe no cambia nada.** Ningún bug de los que siguen está arreglado.

## Cómo se hizo

Arnés en memoria que carga el `index.html` de verdad (stubs de `document`, `canvas`,
`localStorage`, `sessionStorage` y `fetch`; `setTimeout` encolado y drenado a mano).
Sobre eso: chequeo estructural de las 70 salas y las 365 semillas del diario; detector de
tableros repetidos entre ediciones; 10 400 partidas de fuzz usando objetos y poderes;
curva de dificultad de las 7 ediciones × 3 dificultades; renderizado de todas las
pantallas de todas las ediciones buscando texto roto; y una prueba puntual por hallazgo.
Nada se escribió en la carpeta del juego salvo este archivo.

---

## 1 · Lo que se arregló del informe anterior

Ocho de los diez que estaban abiertos. Todos re-verificados corriendo el juego.

| # anterior | Qué era | Cómo quedó |
|---|---|---|
| 2.1 | La banana era gratis si la pisabas con el último paso | **Arreglado.** Ahora la deuda queda en `S.resbalon` y la paga la ronda siguiente |
| 2.4 | Terminar escondido y que el relato anunciara igual el castigo de la cámara | **Arreglado.** `S.vistoPorCamara = … && !hidden` |
| 2.5 | Lamber dejaba el panel de piezas mintiendo | **Arreglado.** `deliver()` guarda lo que le diste de verdad (`S.delivered.push(id)`) y marca el cómplice con `c.recibio` |
| 2.3 | El poder de El Negro era lo que ya tenía todo el mundo | **Arreglado.** Ahora es «Siempre con el fernet»: arranca con uno en la mochila |
| 3.2 | El reparto de antagonistas del diario estaba roto (El Director General no salía nunca) | **Arreglado y verificado.** Semillas regeneradas: chi² = **18.3** con 18 gl —indistinguible del azar— y los 19 aparecen |
| 3.4 | «Un intento por día» se salteaba con Escape | **Arreglado.** Escape abre `pausaDiaria()`, que avisa y obliga a elegir; salir pasa por `abandonarDiaria()`, que anota la derrota |
| 3.5 | El ropero y la ficha decían «undefined» dentro del desafío | **Arreglado.** Todas las salidas pasan por `salirDelDiario()`. Rendericé las pantallas de las 7 ediciones y el diario: **cero** `undefined`, `NaN` o `[object Object]` |
| 3.6 | El ropero se vaciaba al cambiar de juego | **Arreglado.** Se fue el `=== JUEGO` de `tengoDisfraz()`, con el comentario explicando por qué |

## 2 · Lo que sigue abierto

### 2.1 «Duro» sigue sin ser un peldaño **[medido en las 7 ediciones]**

Es el hallazgo §3.1 del informe anterior, y ahora se puede medir sobre 70 salas en vez
de 20. La perilla no cambió. Totales del bot, 100 partidas por sala y dificultad:

| edición | normal | duro | manual |
|---|---|---|---|
| 1 · Los Museos | 14 % | 6 % | **6 %** |
| 2 · Los Museos 2 | 11 % | 8 % | **8 %** |
| 3 · Vacaciones | 18 % | 14 % | **14 %** |
| 4 · El espacio | 13 % | 9 % | **8 %** |
| 5 · La montaña | 20 % | 13 % | **11 %** |
| 6 · La ciudad | 17 % | 9 % | **9 %** |
| 7 · Total disociación | 14 % | 8 % | **8 %** |

Duro y Manual dan lo mismo en las siete. El mecanismo es el de siempre: `calmar()` sólo
actúa si `S.alert > pisoAlerta()`, y en Duro el piso es 2, así que la válvula **sólo
puede actuar con la alerta en 3** — que llega recién cuando el mazo se agota por segunda
vez. Medido: las partidas terminan con alerta 3 el 0-3 % de las veces en normal y hasta
el 14 % en manual, o sea que en la enorme mayoría Duro y Manual son el mismo juego línea
por línea.

El comentario del código (`index.html:4438`) sigue prometiendo `50% · 20% · 12%` y sigue
diciendo «sobre los mismos veinte tableros», que ahora son setenta.

### 2.2 Los objetos 4º y 5º prometen una tecla que no existe **[verificado]**
`index.html:9442` contra el handler de teclado

Con Chupa se llega a 4 objetos; la ficha del cuarto dice «tecla 4» y el teclado sólo
atiende `/^[123]$/`. Sigue igual desde la primera auditoría.

### 2.3 Cosas de bajo impacto, todas todavía ahí

| Dónde | Qué |
|---|---|
| `index.html:4732` | `resetPositions()` sube la ronda pero no descuenta `S.reloj.quedan`: después de una captura, esa ronda es gratis para el temporizador |
| `index.html:4706` | `losePiece()`: si no hay vitrina vacía alcanzable, la pieza desaparece del tablero. No se disparó en 10 400 partidas de fuzz, pero sigue sin red |
| `index.html:4234` | `finishRound()` exige `S.awaitMate`: no hay forma de cerrar la ronda si alguna vez quedás en una casilla sin salidas |
| `index.html:7692` | `const corriendo = !!(S.reloj && !c.alarm === false);` — precedencia rara, variable sin usar |
| `index.html:4099` | `c.x!==undefined?c.x:S.player.x` — las celdas no guardan `x`/`y`: la rama nunca se toma |
| `index.html:2256` | el soporte de más de un antagonista (`FOES[...].count`) sigue siendo código muerto |
| `anotarMaraton` | la primera corrida perdida (0 salas) sigue anunciando «Récord nuevo» |
| `index.html:2949` | el desafío diario se repite exacto cada 365 días: verificado, el 1-sep-2027 vuelve la sala del 1-sep-2026 (semilla 3022407, Matxi vs El Inspector) |

---

## 3 · Hallazgos nuevos

Los tres primeros son el mismo patrón: **una tabla de consulta que no creció con las
ediciones nuevas**. Vale la pena buscarlo a mano cada vez que se agrega una edición.

### 3.1 La regla de «con las tres afuera ya no se relaja» no existe en 5 de las 7 ediciones **[verificado]**
`index.html:4435`

```js
const PISO_FUGA = {"Pasantía":0, "Mini Pyme":0, "S.R.L.":0, "S.A.":2, "Multinacional":2,
                   "Local":0, "Franquicia":0, "Cadena":0, "Corporación":2, "Grupo inversor":2};
function pisoFuga(){ return PISO_FUGA[S.sala.wing] || 0; }
```

Diez claves, y las 70 salas usan **35 alas distintas**. Las 25 que faltan son todas de
las ediciones 3 a 7, y caen al `|| 0`, con lo cual la condición de `calmar()`
—`S.delivered.length >= 3 && S.alert <= pisoFuga()`— nunca se cumple. Probado sala por
sala, con tres entregadas y alerta 2:

```
J1 n8 · ala "Multinacional"  · pisoFuga=2 · la carta lo baja a 2   (aguanta)
J2 s8 · ala "Grupo inversor" · pisoFuga=2 · la carta lo baja a 2   (aguanta)
J3 v8 · ala "Atardecer"      · pisoFuga=0 · la carta lo baja a 1   (se relaja del todo)
J4 e8 · ala "El borde"       · pisoFuga=0 · la carta lo baja a 1   (se relaja del todo)
J5 m8 · ala "La cumbre"      · pisoFuga=0 · la carta lo baja a 1   (se relaja del todo)
J6 c8 · ala "La avenida"     · pisoFuga=0 · la carta lo baja a 1   (se relaja del todo)
J7 t8 · ala "El agujero"     · pisoFuga=0 · la carta lo baja a 1   (se relaja del todo)
```

En el museo y el shopping, las últimas cuatro salas aprietan en la fuga final. En las
cinco ediciones nuevas ese apriete no está, y la falla es silenciosa: no hay error, sólo
una regla que no se aplica.

### 3.2 El ropero no tiene ropa para 5 de las 7 ediciones **[verificado]**

```
juego 1 Los Museos                    9 salas numeradas · 9 disfraces   ok
juego 2 Los Museos 2                  9 salas numeradas · 9 disfraces   ok
juego 3 Los Museos de Vacaciones      9 salas numeradas · 0 disfraces   ⚠
juego 4 Los Museos en el espacio      9 salas numeradas · 0 disfraces   ⚠
juego 5 Los Museos en la montaña      9 salas numeradas · 0 disfraces   ⚠
juego 6 Los Museos en la ciudad       9 salas numeradas · 0 disfraces   ⚠
juego 7 Los Museos: Total disociación 9 salas numeradas · 0 disfraces   ⚠
```

Ganar una sala en las tres dificultades es el logro más caro del juego y en cinco
ediciones de siete no da nada. El ropero de esas ediciones muestra sólo los tres de
racha. (Ningún disfraz apunta a una sala inexistente, eso está bien.)

### 3.3 `LAMINAS` no tiene entrada para las ediciones 3 a 7

`index.html:5057`. Está comentado en el código —«el 3 es Vacaciones y todavía no tiene
lámina»— así que es un pendiente conocido, no un descuido. Lo anoto porque `lamina()`
devuelve `""` sin avisar: terminar el maratón completo de cinco ediciones no muestra
ninguna lámina, y desde afuera no se distingue de un bug.

### 3.4 Damián aguanta cuatro capturas, pero todos los contadores dicen «/3» **[verificado]**
`index.html:4722`, `5123` y `10162`

La habilidad está bien implementada (`S.aguanta = 4` en la sala t3, y `losePiece()` la
respeta). Lo que no se enteró es el texto. Forzando tres capturas en t3:

```
🚨 Te sacó Las llaves ▲ (1/3). …
🚨 Te sacó Las llaves ▲ (2/3). …
🚨 Te sacó Las llaves ▲ (3/3). …
🍷 Todavía puedo: con tres perdidas cualquiera se iba. Te queda una.
taken=3 · partida terminada? no
```

Dos renglones seguidos que se contradicen. Y el modal de elegir qué pieza entregás dice
fijo «Llevás X/3 recuperadas por él. **A la tercera, se termina**», que con Damián es
falso — justo en la pantalla donde el jugador está decidiendo cuánto arriesgar. La ficha
del final también muestra `Te recuperó X/3`.

### 3.5 El desafío diario sale casi siempre en el ajuste más duro **[medido]**

`dificultadDelDia()` reparte 25 % normal / 55 % duro / 20 % manual sobre los 365 días.
La intención se lee clara: que la mayoría de los días sean el peldaño del medio. Pero
como Duro y Manual son el mismo juego (§2.1), lo que queda es **75 % de los días en el
ajuste más duro y 25 % en normal**, sin nada en el medio. Los dos hallazgos por separado
son discutibles; juntos hacen que el modo que se juega todos los días sea más duro de lo
que se quiso.

### 3.6 El diario sólo usa los antagonistas del museo y el shopping

```
juego 1 Los Museos                     9 antagonistas · en el diario: 9
juego 2 Los Museos 2                  10 antagonistas · en el diario: 10
juegos 3 a 7                          50 antagonistas · en el diario: ~0
total: 21 de 69 aparecen en el desafío diario
```

`salaDelDia()` arma el elenco con `Object.assign({}, JUEGOS[1].foes, JUEGOS[2].foes)`.
Puede ser a propósito —el diario transcurre en una oficina y un socorrista en una oficina
es raro—, pero son 48 antagonistas dibujados que nunca aparecen ahí. Si la idea era que
el diario fuera el resumen del juego entero, hoy es el resumen de las dos primeras
ediciones.

---

## 4 · La curva, sala por sala

Bot codicioso —sin objetos ni poderes activos—, 100 partidas por sala en cada dificultad,
en normal:

```
J1  tutorial:35 n1:28 n2:3  n3:11 n4:13 n5:15 n6:15 n7:18 n8:2  n9:0
J2  s0:25 s1:41 s2:11 s3:5  s4:1  s5:7  s6:1  s7:6  s8:13 s9:1
J3  v0:24 v1:26 v2:40 v3:8  v4:33 v5:13 v6:12 v7:9  v8:4  v9:12
J4  e0:8  e1:0  e2:45 e3:5  e4:6  e5:10 e6:5  e7:17 e8:1  e9:31
J5  m0:34 m1:8  m2:43 m3:5  m4:30 m5:25 m6:20 m7:17 m8:2  m9:13
J6  c0:28 c1:17 c2:43 c3:11 c4:18 c5:15 c6:18 c7:17 c8:0  c9:6
J7  t0:24 t1:18 t2:21 t3:3  t4:27 t5:11 t6:12 t7:2  t8:17 t9:6
```

Dos observaciones:

1. **La curva no sube: serrucha.** Casi todas las ediciones tienen una sala fácil en el
   medio (v2 40 %, e2 45 %, m2 43 %, c2 43 %) rodeada de salas al 5 %. La sala 2 es la
   más fácil de cuatro ediciones y la más difícil del museo (n2, 3 %). Si el orden del
   menú es el orden en que se espera que se jueguen, el orden no acompaña.
2. **n9 es la sala más dura del juego por lejos.** El bot codicioso la ganó 1 de 500;
   dándole objetos y mates, 5 de 1500 (0,3 %). **No está rota** —lo verifiqué, se puede
   ganar— pero está un orden de magnitud por debajo de la siguiente. c8 y e1 le siguen.
   Contra un promedio de 14 % del museo.

Como siempre: mi bot juega mal a propósito, así que los absolutos no valen. Lo que vale
es la comparación entre salas y entre dificultades, que es con el mismo bot en todas.

---

## 5 · Lo que está sólido

Con cinco ediciones nuevas encima, esto es lo más importante del informe:

- **10 400 partidas de fuzz** —70 salas × 3 dificultades + 50 días del desafío— jugando
  al azar y usando objetos y poderes a lo loco: **cero errores de ejecución y cero
  invariantes rotas**. Se controlaba en cada turno que las tres piezas estén siempre en
  algún lado, que la alerta no se salga de rango, que los pasos no se vayan a negativo,
  que no haya entregas repetidas, que nadie termine fuera del tablero o en una casilla no
  jugable y que `objUsed` no apunte fuera de `objects`. Las diez habilidades nuevas de la
  séptima edición pasaron por ahí sin romper nada.
- **Estructura: 70 de 70 salas limpias**, más las 365 del desafío diario. Tres vitrinas,
  un cómplice de cada símbolo, escaleras en pares, todo lo imprescindible alcanzable
  desde tu puesto, las tres paredes del marco puestas, un solo antagonista, y cada
  vitrina comunicada con cada cómplice y cada cómplice con la salida. Los dos únicos
  «sueltos» que reporta son el mate encerrado de n2 y el de c2, que son la loseta de
  doble faz que explica `CLAUDE.md`.
- **70 tableros distintos de 70.** Busqué salas clonadas entre ediciones comparando
  elementos, paredes, vidrios y puertas: no hay ni una repetida. Tampoco repartos de
  elementos repetidos. Los recuentos de paredes se parecen entre ediciones porque el
  estilo de diseño es el mismo, no porque estén copiadas.
- **Todas las pantallas renderizan limpias**: menú, ficha, ropero, ayuda, victoria,
  derrota y maratón, en las siete ediciones, más el final del diario. Ni un `undefined`,
  `NaN` ni `[object Object]`.
- **69 pares protagonista-antagonista distintos de 70** (el único repetido es
  `negro vs turista` en v0 y c0, y son personajes distintos con la misma clave).
- El **sellado de versión** sigue correcto: `VERSION` y `version.txt` coinciden.

---

## 6 · Orden sugerido

1. **§3.1 `PISO_FUGA`** — 25 alas sin entrada. Es la más barata de las importantes y
   devuelve la tensión del final a cinco ediciones. Conviene además que `pisoFuga()`
   avise en vez de caer a 0 en silencio, para que la próxima edición no repita el
   descuido.
2. **§2.1 qué es «Duro»** — hoy el peldaño del medio es un no-op en la enorme mayoría de
   las partidas, y arrastra al desafío diario (§3.5). Una perilla que muerda temprano:
   alerta inicial 2, aflojar de a medio nivel, o un tope de veces por partida.
3. **§3.4 los contadores «/3» con Damián** — tres lugares, y uno de ellos es la pantalla
   donde se decide qué pieza entregar.
4. **§3.2 el ropero de las cinco ediciones nuevas** — es contenido, no código: hay que
   dibujar 45 disfraces o cambiar la regla del premio.
5. **§2.2 la tecla 4**, **§2.3 el temporizador después de una captura** y el resto de la
   lista de bajo impacto.
6. **§4 el orden de las salas** — mirar si la sala 2 de cada edición está donde debería.

## Cómo reproducir

Arnés en memoria, como el que describe `CLAUDE.md`: se corta el JS de `index.html`, se
levanta con stubs de `document`, `canvas`, `localStorage`, `sessionStorage` y `fetch`, y
se reemplaza `setTimeout` por una cola que se drena a mano. Los bloques que se corrieron:

- **estructura** — las 70 salas de las 7 ediciones + las 365 semillas del diario.
- **clones** — comparación de los 70 tableros entre sí.
- **fuzz** — 10 400 partidas al azar con objetos y poderes, controlando invariantes.
- **curva** — 100 partidas por sala y dificultad; 500 y 1500 en n9 para confirmar que se
  puede ganar.
- **tablas** — `PISO_FUGA`, `NOMBRE_JUEGO`, `RANGO_MAXIMO`, `LAMINAS`, `DISFRACES` y
  `CONSEJOS` contra las 70 salas.
- **pantallas** — menú, ficha, ropero, ayuda, victoria, derrota y maratón en las 7
  ediciones, buscando texto roto.
- **puntuales** — uno por hallazgo: el reparto del diario, el tope de capturas de Damián,
  la regla de fuga por edición, el cuarto objeto y el intento único del día.

Ninguno escribe en la carpeta del juego.
