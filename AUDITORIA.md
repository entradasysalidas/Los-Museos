# Auditoría de Los Museos · código y jugabilidad

Fecha: 4 de septiembre de 2026 · sobre `index.html` (4679 líneas, motor + arte + UI en
un solo archivo).

**Este informe no cambia nada.** Ningún bug de los que siguen está arreglado: es una
lista para decidir qué tocar y qué no.

## Cómo se hizo

Lectura completa del archivo más un arnés en memoria (stubs de `document`, `canvas` y
`localStorage`, `setTimeout` encolado y drenado a mano, `Math.random` sembrado) corrido
por stdin con node. No se escribió ningún archivo ni se tocó el repositorio durante las
pruebas. Cada punto marcado **[verificado]** se reprodujo corriendo el juego real; el
resto sale de lectura.

---

## 1 · Bugs confirmados corriendo el juego

### 1.1 Los timers de la partida anterior siguen vivos y pisan la nueva **[verificado]**
`index.html:1613`, `1747`, `1882`, `1936`, `2009`, `2029`, `4148`

Todas las fases encadenan con `setTimeout` y ninguna se cancela. `newGame()` arma un
`S` nuevo, pero los callbacks pendientes leen el `S` global, no el viejo: se despiertan
y le corren una ronda entera a la partida recién empezada.

Reproducción (tecla **R** en mitad de la persecución, sala n3):

```
timers en cola tras mover: 1 · ronda 1 · busy true
reiniciada: ronda 1, jefe en 5,0, mp 2
tras drenar los timers viejos -> ronda 2 · jefe en 2,0 · cartas jugadas 1 · mp 2
```

O sea: arrancás una sala "nueva" y el jefe ya se movió tres casilleros, ya jugó una
carta y estás en la ronda 2. Pasa con **R**, con "Seguir: <sala>" de la pantalla final
y con cualquier sala elegida del menú mientras algo está animando.

### 1.2 `picking` no se limpia: el juego queda muerto
`index.html:4252`, `4264`, `3964`

`askWhichPiece()` pone `picking = true` y sólo `pickPiece()` lo baja. La tecla **R**
se atiende *antes* del guard (`index.html:3964`) y hace `newGame()` + `closeModal(true)`
sin tocar `picking`. Después de eso, tanto el teclado (`index.html:3974`) como el clic
en el lienzo (`index.html:4111`) salen por el `return` y **no se puede jugar más hasta
recargar la página**. Lo mismo vale para `walking`, que tampoco se resetea.

### 1.3 El shopping se quedó sin las tres paredes del marco **[verificado]**
`index.html:936-939`, `1170`, `1583`, `3815`

`FRAME_WALLS` está indexado por `gris` / `madera`. Los pisos del juego 2 son `dia` y
`noche`, así que `FRAME_WALLS[sala.piso]` da `undefined` y cae en `|| []`.

```
JUEGO 1: todas las salas -> marco[3/3]
JUEGO 2: todas las salas -> marco[0/3]
```

Consecuencia concreta: en las diez salas del shopping no existe la pared `v:3:7` entre
tu baño y tu puesto, ni `v:2:0`/`v:3:0` en el pasillo de arriba. La empanada y el tercer
mate te dejan pegado a tu escritorio, y la salida queda pared con pared con el baño del
jefe. `dibujarPlano()` arrastra el mismo error, así que el mapita del menú también los
dibuja mal (al menos es consistente con lo que se juega).

Se midió el impacto en dificultad parcheando las tres paredes: **es chico** (±3 puntos
por sala, ver §3). Es un bug de corrección y de fidelidad al tablero, no de balance.

### 1.4 Mirar la agenda le sube la alerta al jefe **[verificado]**
`index.html:2117-2119`

`mirarAgenda()` llama `refillDeck()` si el mazo quedó vacío, y `refillDeck()` sube la
alerta como efecto secundario. Usar un objeto pasivo, que sólo debería *mirar*, le sube
un nivel de velocidad al antagonista una ronda antes de tiempo.

```
alerta antes 1 -> despues 2 | mazo rearmado a 10 cartas
```

### 1.5 La condición del celular está al revés del texto que imprime **[verificado]**
`index.html:1913-1916`

```js
if(S.celular && S.alert < TUNE.alertMax){ S.celular = null;
  say("📱 Con la alerta arriba ya no le importa el celular.","r"); }
```

Dice "con la alerta arriba" pero se ejecuta cuando la alerta **no** llegó al máximo.
Verificado: con alerta 3 el señuelo sobrevive para siempre; con alerta 1 se borra.
Justo al revés de lo que promete el mensaje y de lo que dice la ayuda del objeto.

---

## 2 · Bugs y errores de lógica por lectura

### 2.1 Dos poderes no hacen absolutamente nada

- **Marian · "Ojo de halcón"** (`index.html:981`, `1214`, `2054`). `S.peek` se calcula
  al empezar y en cada `nextRound()`, y **nunca se lee en ningún lado**. Ni `syncUI()`
  ni el panel del mazo lo muestran. Marian protagoniza el nivel 9 y la sala s9, las dos
  más duras, con un poder inexistente.
- **El Negro · "Oficio"** (`index.html:982`). Promete "ves el alcance del antagonista
  antes de moverte", pero `drawOverlays()` (`index.html:3512-3517`) pinta ese alcance
  **siempre, para todos los personajes**. El poder del tutorial es lo que ya tiene todo
  el mundo.

### 2.2 La ayuda nunca muestra el mazo, y etiqueta mal lo que sí muestra
`index.html:4371` (definida), `4409-4413` (donde debería usarse)

`cartasDelMazo()` está escrita, comentada y **jamás se llama**. Bajo el título
`Las 10 cartas del jefe` la ayuda imprime `objetosRecompensa()`, o sea la lista de
objetos. Resultado: el jugador nunca ve el mazo del antagonista —que es la información
táctica central del juego— y en cambio lee "mate, fernet, empanada…" bajo un título que
dice "cartas del jefe". Los objetos, además, se quedaron sin encabezado propio.

### 2.3 La banana es gratis si terminás el movimiento encima
`index.html:1627-1630`

```js
if(c.type==="banana"){ if(S.mp>0){ S.mp-=TUNE.bananaCost; … } return; }
```

Si pisás la cáscara como **último** paso del turno, `S.mp` ya es 0 y el castigo se
saltea entero: no pierde nada y en la ronda siguiente `S.mp` vuelve a 2. La banana sólo
duele si la pisás a mitad de camino, cosa que el jugador aprende a evitar enseguida.

### 2.4 La puerta con lector no puede ser el refugio que promete
`index.html:1242`, `1252`, consejo en `1555`

`puertaAbierta()` devuelve `COMO==="vos" && S.hand.length > 0`. Para ganar hay que
entregar las tres piezas, y entregar deja la mano vacía: **durante la corrida final la
puerta está siempre cerrada para vos**. El consejo de s3 dice literalmente "Guardala
como refugio para la corrida final".

Además se verificó que la puerta **nunca aísla nada**: con `COMO="jefe"` el antagonista
alcanza todas las casillas jugables de s3, s7 y s9 rodeándola. No hay refugio posible,
ni con pieza ni sin ella. Es un atajo, no un escondite.

### 2.5 El alcance rojo del jefe cruza la puerta; el jefe no
`index.html:3512` y `3403` vs `1761`

`chaseStep()` fija `COMO="jefe"` antes de llamar a `bfsFrom()`. Pero `drawOverlays()`
(el sombreado rojo de "hasta acá llega") y `elFoeEstaCerca()` (el globito "!") llaman a
`bfsFrom()` con `COMO="vos"`. Si llevás una pieza, la interfaz te muestra al jefe
llegando a casillas que en realidad no puede alcanzar. La información que el juego te
da para decidir es falsa en las tres salas con puerta.

### 2.6 Si terminás escondido, la cámara miente
`index.html:1737-1742` vs `1844-1848`

`endMovement()` evalúa la cámara y escribe *"📹 Te agarró la cámara: esta ronda avanza
un casillero más"*. Si además quedaste detrás de una planta, `chasePhase()` sale por el
`if(hidden)` y el jefe **no se mueve nada**. El relato anuncia un castigo que no ocurre.

### 2.7 El resaltado de casillas alcanzables casi no se ve en el shopping de día
`index.html:3535` (y el mismo síntoma en `2778`)

```js
ctx.fillStyle = S.sala.piso==="gris" ? `rgba(255,255,255,${.30+p*.14})`
                                     : `rgba(255,255,255,${.09+p*.06})`;
```

La condición pregunta por el nombre del piso, no por si es claro u oscuro. Los pisos
`dia` del shopping son claros y reciben el relleno del 9 % pensado para el parquet
oscuro: el indicador de a dónde podés llegar queda prácticamente invisible en s0, s1,
s4 y s5. `S.th.oscuro` ya existe y es la pregunta correcta.

### 2.8 Textos cableados con el nombre del antagonista equivocado
`index.html:1958`, `2187`, `2191`

En el shopping, El Repositor deshace tu entrega y el relato dice *"**El Restaurador**
deshizo tu entrega"*; El Auditor anota tus objetos y el relato dice *"**El Inspector**
lleva la cuenta"*. `S.foe.n` está a mano en las tres líneas.

### 2.9 El sello "🔒 Cerrado" queda viejo al abrir la página
`index.html:4472-4475` vs `4501-4508`

`elegirJuego()` recalcula el sello de la tapa 2, pero sólo corre **al hacer clic en una
tapa**. `prepararPortal()`, que es lo que corre al cargar, llama a `textoDelPie()` y no
al sello. El que ya pasó las diez salas abre el juego y ve "🔒 Cerrado" sobre la caja
que tiene ganada, hasta que toque una tapa.

### 2.10 Los objetos 4º y 5º prometen una tecla que no existe
`index.html:3651` vs `3980`

La ficha del objeto dice `"tecla " + (i+1)`, pero el teclado sólo atiende `/^[123]$/`.
Chupa ("Bolsillos grandes") y Tomy ("Termo propio") arrancan con un objeto extra, así
que con las tres entregas llegan a 4 o 5 objetos: los últimos dicen "tecla 4" / "tecla
5" y esas teclas no hacen nada. Sólo se pueden usar con el mouse.

### 2.11 Lamber deja el panel de piezas mintiendo
`index.html:1687-1692` y `1635-1647`

`offerDelivery()` entrega `S.hand[0]` al cómplice que esté abajo, pero `deliver()` hace
`S.delivered.push(c.want)` — el símbolo que el cómplice *pedía*, no el que le diste.
Si le das el rombo al que pide el triángulo: el triángulo figura "entregada" aunque siga
en su vitrina, y el rombo figura "en la vitrina" aunque ya no exista. La partida sigue
siendo ganable (tres entregas son tres entregas), pero el panel lateral y el mapa dicen
cualquier cosa.

### 2.12 Una pieza puede desaparecer del tablero
`index.html:2080-2087`

`losePiece()` busca la vitrina vacía **alcanzable** más lejana. Si el `for` no encuentra
ninguna (`pick` queda en `null`), la pieza ya salió de `S.hand`, se empujó a `S.pile`
—que después de `newGame()` no lo lee nadie— y no se coloca en ninguna casilla. Queda
una partida imposible de ganar sin ningún aviso. Con los niveles fijos actuales no se
dispara, pero es una bomba para cualquier sala nueva hecha con el editor.

### 2.13 Después de una captura la ronda avanza sin cobrar el temporizador
`index.html:2093-2100`

`resetPositions()` duplica el cierre de ronda de `nextRound()` pero se olvida de tres
cosas: no descuenta `S.reloj.quedan`, no refresca el peek de Marian y no limpia
`S.escondido` / `S.vistoPorCamara`. Si te agarran con la pieza del temporizador puesto
y te sacan **otra**, esa ronda es gratis para el reloj.

### 2.14 Cosas muertas o rotas de bajo impacto

| Dónde | Qué |
|---|---|
| `index.html:3094` | `const corriendo = !!(S.reloj && !c.alarm === false);` — precedencia rara y la variable no se usa nunca |
| `index.html:1644` | `c.x!==undefined?c.x:S.player.x` — las celdas de `buildBoard()` no guardan `x`/`y`, así que la rama nunca se toma |
| `index.html:1192`, `1851`, `2004`, `2095` | todo el soporte de "más de un antagonista" (`FOES[...].count`) es código muerto: ningún foe define `count` |
| `index.html:1697` | `canDrinkHere()` chequea `matesTurn>=3`, pero el tercer mate ya te manda al baño: rama inalcanzable |
| `index.html:4194-4199` | `clearWalls()` vacía `S.walls` (marco incluido) pero sólo persiste las del nivel: las del marco vuelven en el próximo `newGame()` |
| `index.html:2143-2151` | `useObject()` marca el objeto como usado *antes* de `mirarAgenda()`, y como esa rama hace `return`, la agenda nunca cuenta como "objeto ruidoso" para el Inspector/Auditor |
| `index.html:2372-2380` | `anotarMaraton()`: la primera corrida perdida en la sala 1 (0 salas, 0 rondas) da `mejor = true` y la pantalla anuncia "Récord nuevo" |
| `index.html:3964` | la tecla **R** se atiende siempre, también mientras escribís el nombre en el portal después de "Cambiar de nombre" (ahí `S` ya existe) |
| `index.html:3815` | `dibujarPlano()` ignora `sala.v` (vidrios), `sala.p` (puertas) y las paredes editadas: el mapita del menú no coincide con el tablero |
| `index.html:253-255` | `.hintbar` declara `font-size` dos veces (15px y 13px) |
| `index.html:300-316` | `.cajadibujada` es CSS muerto desde que existe `caja2.jpg` |

### 2.15 Riesgo de trabarse sin salida
`index.html:1723-1727`

`finishRound()` exige `S.awaitMate`, y `awaitMate` sólo se enciende si te quedás sin
pasos parado sobre un mate. Si alguna vez terminás en una casilla sin ninguna salida
legal y con `S.mp > 0`, no hay forma de cerrar la ronda: ni tecla, ni clic. Hoy no pasa
—ninguna casilla queda sellada— pero llegar por teletransporte (empanada, sopapa, tercer
mate, escalera) a una casilla que el editor selló lo produce. Un "cerrar ronda" siempre
disponible cuando no hay movimientos posibles lo cubriría.

---

## 3 · Jugabilidad: la curva medida

Bot codicioso (va siempre a la pieza/cómplice/salida más cercano por BFS, **sin usar
objetos, sin poderes activos y sin esconderse**), 300 partidas por sala, semilla fija.
Los números absolutos son bajos porque el bot juega mal a propósito; lo que importa es
la forma de la curva.

| Museo | % victorias | | Shopping | % victorias |
|---|---|---|---|---|
| tutorial | 25 | | s0 | 24 |
| n1 | 38 | | s1 | 48 |
| **n2** | **4** | | **s2** | **12** |
| n3 | 9 | | s3 | 7 |
| n4 | 11 | | s4 | **0** |
| n5 | 20 | | s5 | 12 |
| n6 | 16 | | s6 | 4 |
| n7 | 19 | | s7 | 8 |
| n8 | 3 | | s8 | 8 |
| n9 | 1 | | s9 | 1 |
| **total** | **15,3 %** | | **total** | **7,0 %** |

Tres lecturas:

1. **El nivel 2 es un pozo.** Va de 38 % a 4 % y después *sube* a 9 %, 11 %, 20 %. El
   Curador (se teletransporta a las vitrinas con cada carta de escritorio) es el primer
   antagonista con truco y aparece justo después de la sala más fácil del juego. La
   curva se recompone recién en n5. El mismo escalón está en s2.
2. **n8/n9 y s4/s9 son casi imposibles sin objetos.** Es coherente con el diseño (los
   consejos de esas salas hablan de guardar los objetos para la fuga), pero significa
   que el juego pasa de "se puede improvisar" a "hay que planificar" sin transición.
3. **El shopping es más duro que el museo de punta a punta** (7 % vs 15,3 %) con el
   mismo bot, y arranca en s0 más difícil que el tutorial del museo. Si la idea es que
   sea la segunda mitad de una progresión, está bien; si la idea era que fuera
   equivalente, hay medio juego de diferencia.

Nota: parchear las tres paredes del marco que faltan (§1.3) mueve estos números ±3
puntos por sala, sin cambiar la forma de la curva.

---

## 4 · Mejoras posibles (ninguna aplicada)

**Robustez**
- Un `epoch` (número de partida) en `S`, capturado por cada `setTimeout` y comparado al
  despertar. Resuelve §1.1 de raíz, que es de lejos el bug más grave.
- Una sola función `reiniciarBanderas()` que baje `walking`, `picking`, `busy` y
  `awaitMate`, llamada desde `newGame()`. Resuelve §1.2.
- `nextRound()` y `resetPositions()` comparten el 80 %: unificar el cierre de ronda
  elimina §2.13 y evita que se vuelvan a desincronizar.

**Corrección**
- `FRAME_WALLS` por juego (o indexado por los pisos reales de cada uno), §1.3.
- Cambiar `S.sala.piso==="gris"` por `!S.th.oscuro` en `index.html:2778` y `3535`, §2.7.
- Fijar `COMO="jefe"` también en `drawOverlays()` y `elFoeEstaCerca()`, §2.5.
- `S.foe.n` en lugar de los nombres cableados, §2.8.

**Jugabilidad**
- Mostrar el peek de Marian en el panel del mazo (la carta boca arriba con un rótulo
  "próxima") y darle a El Negro algo que no tenga el resto, §2.1.
- Llamar a `cartasDelMazo()` en la ayuda y ponerle su propio título a los objetos, §2.2.
- Cobrar la banana aunque termines encima (o decidir que es intencional y decirlo), §2.3.
- Repensar la puerta con lector: hoy se cierra justo cuando el consejo dice que la uses,
  §2.4. Alternativas: que lea también las piezas ya entregadas, o que el consejo cuente
  lo que la puerta hace de verdad (atajo mientras cargás mercadería).
- Suavizar el escalón del nivel 2 / s2, §3.
- Teclas 4 y 5, o no prometerlas en la ficha del objeto, §2.10.

**Accesibilidad y rendimiento**
- El modal no tiene `role="dialog"`, no atrapa el foco ni lo devuelve al cerrar.
- El `<canvas>` no tiene alternativa textual: el juego es inaccesible con lector de
  pantalla, y las casillas de objeto son `<div onclick>` sin foco por teclado.
- `@media (prefers-reduced-motion)` apaga las animaciones CSS pero no el bob, el
  temblor ni el latido dibujados en el lienzo.
- `frame()` corre a 60 fps con el portal o un modal tapando todo; y `drawOverlays()`
  hace un `bfsFrom()` completo por frame (memoizable como ya se hizo en `memoCerca`).

**Repositorio**
- `caja.png` y `caja2.png` suman ~6 MB versionados y no los sirve la página (sólo los
  `.jpg`). Si son los originales, un repo aparte o Git LFS.
- `lunes-oficina.html` (53 KB), `museos.html` (un redirect de 4 líneas) y
  `recordatorioivan` (10 bytes) están versionados sin cumplir ninguna función.
- El editor copia con `document.execCommand("copy")`, deprecado; `navigator.clipboard`
  con fallback sería más sano.

---

## 5 · Si después se decide arreglarlo, este orden

1. §1.1 timers viejos y §1.2 `picking` — son los dos que rompen partidas de verdad.
2. §1.3 paredes del marco del shopping — es fidelidad al tablero.
3. §2.1 y §2.2 — dos poderes y el mazo entero que el jugador nunca ve.
4. §1.4, §1.5, §2.5, §2.6, §2.7, §2.8 — lógica y textos que hoy mienten.
5. El resto, por gusto.

## Cómo reproducir las pruebas

El arnés es el que describe `CLAUDE.md`: extraer el JS de `index.html`, stubs de
`document` / `canvas` / `localStorage`, `setTimeout` encolado y drenado a mano,
`Math.random` sembrado. Los tres bloques que se corrieron fueron: estructura de las 20
salas (vitrinas, cómplices, escaleras, alcanzabilidad, paredes del marco), demostración
puntual de §1.1 / §1.4 / §1.5, y 300 partidas por sala con el bot codicioso para §3.
Ninguno escribió en disco.
