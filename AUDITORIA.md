# Auditoría de Los Museos · código y jugabilidad

**Segunda pasada · 7 de septiembre de 2026.** Reemplaza a la del 4 de septiembre.
Sobre `index.html`, 6273 líneas, versión sellada `93a9aa195d`.

Entre las dos auditorías entraron **62 commits**: las tres dificultades, el desafío
diario, el ropero, las láminas del final, la versión instalable y el chequeo de copia
vieja. El archivo pasó de 4679 a 6273 líneas.

**Este informe no cambia nada.** Ningún bug de los que siguen está arreglado.

## Cómo se hizo

Lectura del diff completo y del código nuevo, más un arnés en memoria (stubs de
`document`, `canvas`, `localStorage` y `fetch`; `setTimeout` encolado y drenado a mano)
que carga el `index.html` de verdad. Sobre eso corrieron cuatro cosas: chequeo
estructural de las 20 salas fijas y de las 365 semillas del diario; un bot codicioso
para la curva; un fuzz de 6000 partidas al azar usando objetos y poderes; y pruebas
puntuales para cada hallazgo. Nada se escribió en la carpeta del juego salvo este
archivo.

**Nota:** el `index.html` cambió mientras se auditaba (commit `b03d3e3`, la chapita de
dificultad en la tarjeta del final). Es cosmético y no toca la lógica; las mediciones se
revalidaron contra la versión actual.

---

## 1 · Lo que se arregló del informe anterior

Trece de los veintiséis. Los cinco primeros se volvieron a probar corriendo el juego.

| # anterior | Qué era | Cómo quedó |
|---|---|---|
| 1.1 | Los timers viejos le corrían una ronda entera a la partida nueva | **Arreglado y verificado.** `EPOCA` + `luego()` (`index.html:1688`): cada temporizador anota su número de partida y se calla si al despertar ya no es el suyo. Probado: reiniciar en mitad de la persecución ahora deja ronda 1, jefe quieto, cero cartas jugadas. Quedan 3 `setTimeout` crudos y los tres son inofensivos |
| 1.2 | `picking` dejaba el juego muerto hasta recargar | **Arreglado.** `reiniciarBanderas()` (`index.html:5197`), llamado desde `newGame()` |
| 1.3 | El shopping sin las tres paredes del marco | **Arreglado y verificado.** `MARCO_BASE` con valor por defecto y claves `dia`/`noche` (`index.html:1270`). Medido: `marco 3/3` en las 20 salas y en las 365 del diario |
| 1.4 | Mirar la agenda le subía la alerta | **Arreglado.** Ahora baraja sin cobrar |
| 1.5 | La condición del celular estaba al revés del texto | **Arreglado.** `S.alert >= TUNE.alertMax` |
| 2.1 | El poder de Marian no se veía en ningún lado | **Arreglado.** El ojo de halcón se dibuja en el panel del mazo (`index.html:4782`), y encima muestra la carta *honesta* |
| 2.2 | La ayuda nunca mostraba el mazo | **Arreglado.** `cartasDelMazo()` se llama (`index.html:5682`) |
| 2.4 | La puerta con lector se cerraba justo en la fuga final | **Arreglado.** Abre también con las tres entregadas (`index.html:1678`), y se repartió de 3 salas a 7 |
| 2.7 | El resaltado invisible en el shopping de día | **Arreglado.** `!S.th.oscuro` en lugar de `piso==="gris"` |
| 2.8 | «El Inspector» y «El Restaurador» cableados en el shopping | **Arreglado.** Sale `S.foe.n` |
| 2.9 | El sello «🔒 Cerrado» quedaba viejo al abrir | **Arreglado.** `sellarTapaDos()` dentro de `prepararPortal()` |
| — | (mejora sugerida) la linterna del guardia era la única amenaza invisible | **Hecha.** `casillasAlumbradas()` la pinta como el cono de la cámara |
| — | (mejora sugerida) `document.execCommand` deprecado | **Hecha a medias.** `copiarResultado()` usa `navigator.clipboard` con respaldo; el editor sigue con `execCommand` |

## 2 · Lo que sigue abierto del informe anterior

### 2.1 La banana es gratis si terminás el movimiento encima **[verificado hoy]**
`index.html:2394`

```
con mp=1 (último paso): mp 1 -> 0   (no cobró: la banana salió gratis)
con mp=2 (queda uno):   mp 2 -> 0   (cobró el resbalón)
```

`if(S.mp>0)` saltea el castigo justo cuando ya no quedan pasos. Pisarla último no cuesta
nada, y en la ronda siguiente `S.mp` vuelve a 2.

### 2.2 Los objetos 4º y 5º prometen una tecla que no existe **[verificado hoy]**
`index.html:4859` contra `5238`

Con Chupa y con Tomy se llega a **4 objetos**; la ficha del cuarto dice «tecla 4» y el
teclado sólo atiende `/^[123]$/`. Ahora hay botones en pantalla para el mate y para el
poder, pero no para el cuarto objeto: sigue siendo sólo mouse.

### 2.3 El poder de El Negro es lo que ya tiene todo el mundo
`index.html:1328` contra `4673`

«Oficio · ves el alcance del antagonista antes de moverte». `drawOverlays()` pinta ese
alcance siempre, para todos. Es el único de los diez poderes que no hace nada. El de
Marian ya se arregló; éste quedó.

### 2.4 Si terminás escondido, la cámara miente
`index.html:2518` contra `2650`

`endMovement()` escribe «📹 Te agarró la cámara: esta ronda avanza un casillero más». Si
además quedaste detrás de una planta, `chasePhase()` sale por el `if(hidden)` y el jefe
no se mueve nada. El relato anuncia un castigo que no ocurre.

### 2.5 Lamber deja el panel de piezas mintiendo
`index.html:2405`

`deliver()` sigue haciendo `S.delivered.push(c.want)` — lo que el cómplice *pedía*, no lo
que le diste. Con Lamber, la pieza que entregaste figura «en la vitrina» y la que no
tocaste figura «entregada».

### 2.6 Una pieza puede desaparecer del tablero
`index.html:2921`

Si `losePiece()` no encuentra vitrina vacía alcanzable, `pick` queda `null` y la pieza
sale de la mano sin volver a ninguna casilla: partida imposible sin aviso. **No se
disparó en las 6000 partidas del fuzz**, así que con los tableros actuales —incluidos los
365 del diario— no ocurre. Sigue siendo una bomba para salas nuevas del editor.

### 2.7 Después de una captura la ronda avanza sin cobrar el temporizador
`index.html:2934`

`resetPositions()` sube `S.round` pero no descuenta `S.reloj.quedan`. (La parte del peek
de Marian se resolvió sola: ahora se recalcula en `syncUI()`.)

### 2.8 Corrección al informe anterior: el alcance rojo y la puerta

El 4 dije que `drawOverlays()` y `elFoeEstaCerca()` calculan el alcance del jefe con
`COMO="vos"` y que por eso «la información que el juego te da para decidir es falsa».
**La inconsistencia de código es real; el efecto que le atribuí, no.** Lo medí en las
tres salas con puerta:

```
s3: casillas que el overlay pinta y el jefe no alcanza: 0
s7: 0     s9: 0
```

El jefe siempre puede rodear la puerta, y dentro de los tres casilleros del alcance los
dos cálculos dan lo mismo. Queda como deuda de prolijidad, no como bug visible.

### 2.9 Cosas muertas o rotas de bajo impacto, todas todavía ahí

| Dónde | Qué |
|---|---|
| `index.html:4162` | `const corriendo = !!(S.reloj && !c.alarm === false);` — precedencia rara, variable sin usar |
| `index.html:2411` | `c.x!==undefined?c.x:S.player.x` — las celdas no guardan `x`/`y`: la rama nunca se toma |
| `index.html:2478` | `canDrinkHere()` chequea `matesTurn>=3`, rama inalcanzable |
| `index.html:5432` | `clearWalls()` no persiste el borrado de las paredes del marco |
| `index.html:3325` | `anotarMaraton()`: la primera corrida perdida (0 salas) sigue anunciando «Récord nuevo» |
| `index.html:3038` | `useObject()` marca el objeto como usado antes de `mirarAgenda()`, y la agenda nunca cuenta como objeto ruidoso para el Inspector/Auditor |
| varios | el soporte de más de un antagonista (`FOES[...].count`) sigue siendo código muerto |

### 2.10 Sin salida de emergencia para cerrar la ronda
`index.html:2508`

`finishRound()` sigue exigiendo `S.awaitMate`. Con los tableros actuales no se dispara
—el fuzz no encontró ni una casilla sin salidas—, pero el desafío diario ahora **genera
tableros**, así que la superficie creció: hoy depende de que `generarTableroDia()` nunca
selle una casilla, no de que alguien lo haya mirado.

---

## 3 · Hallazgos nuevos

### 3.1 «Duro» no es un peldaño intermedio: es casi igual a «Como el manual» **[medido]**

El comentario del código (`index.html:2700`) anuncia la escalera `bot 50% · 20% · 12%`.
Medido con el mismo bot en las tres, 800 partidas por celda:

```
sala        normal      duro     manual
tutorial  30.3%±1.6  29.1%±1.6  30.5%±1.6
n1        36.6%±1.7  20.5%±1.4  21.4%±1.4
n5        23.3%±1.5   5.5%±0.8   4.8%±0.8
s1        43.3%±1.8  36.9%±1.7  40.5%±1.7
```

Duro y Manual son **estadísticamente indistinguibles** en las cuatro. Y en el tutorial
las tres dificultades dan lo mismo: elegir ahí no cambia nada.

El mecanismo se ve en el código y se confirma midiendo. `calmar()` sólo actúa si
`S.alert > pisoAlerta()`. En Duro el piso es 2, así que la válvula **sólo puede actuar
con la alerta en 3**. Y la alerta llega a 3 recién cuando el mazo se agota por segunda
vez, sobre la ronda 21:

```
dif 1 (Normal) · rondas medias 14.1 · partidas que terminan en alerta 3:  3%
dif 2 (Duro  ) · rondas medias 13.4 · partidas que terminan en alerta 3:  7%
dif 3 (Manual) · rondas medias 13.2 · partidas que terminan en alerta 3: 11%
```

En el **93 %** de las partidas la alerta nunca llega a 3, y en ésas Duro y Manual son el
mismo juego, línea por línea. La escalera real tiene dos escalones, no tres.

Por construcción, además, Duro nunca puede ser más difícil que Manual: su alerta es
siempre menor o igual. Cualquier lectura que diga lo contrario es ruido de medición.

### 3.2 El reparto de antagonistas del desafío diario está roto **[medido]**

Sobre las 365 semillas, contando cada una una vez:

```
perro       34   #####################
seguridad2  32   ####################
auditor     26   ################
limpieza    25   ################
...
gerente     14   #########
repositor   14   #########
becario      1   #
general      0   <<< NUNCA SALE
chi² = 68 con 18 grados de libertad   (al azar daría ~18)
```

**El Director General no aparece ni un solo día del año**, y El Becario aparece una vez.
El Perro y El de Seguridad salen casi el doble de lo que les tocaría. El reparto de
protagonistas, en cambio, está bien (chi² 11.8 con 9 gl, normal).

La causa más probable no es el generador sino el filtro: las semillas se curaron
corriendo el bot y quedándose con las que caen en cierta banda de dificultad, y la
dificultad depende justamente de qué antagonista salió. El Director General arranca en
alerta 2 y se teletransporta a las vitrinas: sus semillas no pasaron el filtro. El filtro
de dificultad se comió dos antagonistas enteros sin que se notara.

### 3.3 El desafío diario se repite exacto cada 365 días
`index.html:2252`

`SEMILLAS_DIA[((n % cuantas) + cuantas) % cuantas]` con 365 semillas: el 1 de septiembre
de 2027 vuelve el tablero del 1 de septiembre de 2026, con el mismo protagonista, el
mismo antagonista y el mismo orden del mazo. Falta un año, pero está.

### 3.4 «Un intento por día» se saltea con Escape **[verificado]**

La tecla **R** está bloqueada en el desafío (`index.html:5215`) y la pantalla final
vuelve al museo. Pero **Escape** en mitad del desafío abre el menú, y ahí está la
tarjeta del día:

```
el menú que abre Escape con JUEGO=3:
  tarjetas de sala: 1 · botones: ["startSala(&quot;hoy&quot;)"]
después de tocar la tarjeta:
  ronda -> 1 · anotado hoy? false
  ==> el desafío del día se REINICIA sin gastar el intento
```

Como el intento se anota recién al ganar o perder, se puede reiniciar todas las veces que
quieras mientras no termines. La racha, que es lo que le da sentido al modo, se puede
inflar así.

### 3.5 Escape en el desafío deja los menús del museo con `JUEGO = 3` **[verificado]**

El mismo camino tiene otro efecto. `salirDelDiario()` devuelve el juego a 1, pero Escape
no pasa por ahí, así que el ropero y la ficha se dibujan con `JUEGO = 3`, y no hay
entrada 3 en `NOMBRE_JUEGO` ni en `RANGO_MAXIMO`:

```
ropero() -> "Llevás 0 de 3 en undefined."
ficha()  -> "Rango · undefined"
menu()   -> "Las diez salas" con una sola tarjeta, y el botón de maratón
            (que correría un maratón de una sala rotulado "de 10")
```

### 3.6 El ropero se vacía al cambiar de juego **[verificado]**
`index.html:1394`

```js
function tengoDisfraz(id){
  ...
  return (d.juego || 1) === JUEGO && salaEntera(d.de);
}
```

Probado: gané `n1` en las tres dificultades y

```
JUEGO=1 -> salaEntera(n1)=true · tengoDisfraz(overolEnc)=true
JUEGO=2 -> salaEntera(n1)=true · tengoDisfraz(overolEnc)=false
JUEGO=3 -> salaEntera(n1)=true · tengoDisfraz(overolEnc)=false
```

Si te ponés el overol del Encargado y te vas al shopping, `disfrazPuesto()` devuelve
vacío y el disfraz se te cae solo, sin decir nada. Las claves de sala no se pisan entre
juegos (`n1` contra `s1`), así que la condición `=== JUEGO` no hace falta para
desambiguar: sobra. Que el ropero **muestre** sólo la ropa del juego en curso está bien y
está comentado; que **dejes de tenerla** es otra cosa.

### 3.7 El diario es bastante más duro que las salas fijas, y la banda no es angosta

El comentario dice que las semillas se filtraron para que «ninguna sala del día salga
regalada ni imposible». Como el tablero del día es fijo y mi bot es determinista, para
medirlo hay que variar al jugador, no al tablero: 60 días × 120 jugadores con desempate
al azar sobre el mismo tablero.

```
min 0% · p25 0% · mediana 0% · p75 3% · max 100%
en 0%: 44 de 60      ·      arriba de 80%: 1 de 60
```

Contra un promedio de 15 % en las salas fijas del museo con el mismo bot. Dos salvedades
honestas: mi bot no usa objetos ni poderes y es flojo, así que los absolutos no valen; y
el jugador con ruido no es un jugador humano. Pero el **rango** —de 0 % a 100 % entre
días— es demasiado ancho para llamarlo banda, y el conjunto es claramente más duro que
las salas hechas a mano.

---

## 4 · Lo que está sólido

No todo es hallazgo. Vale decir lo que aguantó:

- **Fuzz de 6000 partidas** —las 20 salas fijas × 3 dificultades + 40 días del desafío—
  jugando al azar y usando objetos y poderes a lo loco: **cero errores de ejecución y
  cero invariantes rotas**. Se controlaba en cada turno que las tres piezas siempre estén
  en algún lado, que la alerta no se salga de 1..3, que los pasos no se vayan a negativo,
  que no haya entregas repetidas y que nadie termine fuera del tablero o en una casilla
  no jugable.
- **Estructura**: las 20 salas fijas y las **365** del desafío diario pasan todos los
  chequeos —3 vitrinas, un cómplice de cada símbolo, escaleras siempre en pares, todo
  alcanzable desde tu puesto, las tres paredes del marco puestas, un solo antagonista—.
  Ninguna sala generada quedó rota en 365 intentos, que para un generador es un buen
  número.
- El **sellado de versión** (`scripts/sellar.js`) es correcto: recalcula el hash sin
  contar la propia línea, y `VERSION` y `version.txt` coinciden.
- La **carta honesta** (`cartaHonesta()` + `vitrinaDeLaCarta()`) es consistente con lo que
  después hace `applyCard()`: lo que se anuncia es lo que pasa.
- El **escape del nombre del jugador** hacia HTML sigue cubierto en los tres lugares
  donde va a `innerHTML`.

---

## 5 · Orden sugerido

1. **§3.4 y §3.5** — Escape durante el desafío: reinicia el intento del día y deja los
   menús en `undefined`. Es un solo camino y arregla las dos cosas.
2. **§3.1** — decidir qué es «Duro». Hoy el peldaño del medio es un no-op en el 93 % de
   las partidas. Una perilla que sí muerda temprano: alerta inicial 2, o que la válvula
   afloje de a medio nivel, o un tope de veces por partida.
3. **§3.2** — el filtro de semillas se comió dos antagonistas. Filtrar por dificultad
   *dentro de cada antagonista* en vez de sobre el total.
4. **§3.6** — sacar `=== JUEGO` de `tengoDisfraz()`: una línea.
5. **§2.1, §2.2, §2.3, §2.4** — banana gratis, tecla 4, el poder de El Negro y la cámara
   que miente. Todos chicos y todos visibles.
6. **§2.10** — un «cerrar ronda» de emergencia, ahora que el diario genera tableros.
7. El resto, por gusto.

## Cómo reproducir

Arnés en memoria, como el que describe `CLAUDE.md`: se corta el JS de `index.html`, se
levanta con stubs de `document`, `canvas`, `localStorage` y `fetch`, y se reemplaza
`setTimeout` por una cola que se drena a mano. Los bloques que se corrieron:

- **estructura** — 20 salas fijas + las 365 semillas del diario.
- **curva** — bot codicioso, 150 partidas por sala y dificultad; y 800 por celda en las
  cuatro salas de §3.1.
- **fuzz** — 6000 partidas al azar con objetos y poderes, controlando invariantes.
- **puntuales** — un chequeo por hallazgo: la banana, los cuatro objetos, el alcance del
  jefe contra la puerta, el ropero al cambiar de juego, el reinicio del desafío.

Ninguno escribe en la carpeta del juego.
