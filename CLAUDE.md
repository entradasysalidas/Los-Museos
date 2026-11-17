# Los Museos

Juego de un solo archivo, sin dependencias ni compilación, servido por GitHub Pages
en https://entradasysalidas.github.io/Los-Museos/

## index.html es la única fuente

Todo el juego vive en `index.html`: el HTML, el CSS y el JavaScript. **Editalo
directo.** No lo generes juntando pedazos guardados fuera del repositorio: varias
sesiones y varios dispositivos tocan este archivo, y quien compile encima le borra
el trabajo al otro sin enterarse. Ya pasó una vez.

`caja.jpg` es la tapa que se sirve (la pantalla de entrada, el ícono y la vista
previa del link). `caja.png` es el original sin comprimir.

## Los tableros vienen del manual impreso

Las paredes y los objetos de las diez salas fueron transcriptos a mano del juego de
mesa real por el autor, mirando las losetas. **No los "corrijas" por deducción.** Si
algo parece un error de diseño, preguntá antes: casi siempre es así en el tablero de
verdad, y varias veces lo que parecía un bug era una regla.

Dos cosas que ya se verificaron y son intencionales:
- El nivel 2 tiene un mate encerrado sin acceso.
- Las cinco salas de parquet (5 a 9) no tienen ningún mate.

### Por qué hay un mate encerrado

El juego de mesa **no trae diez tableros**: trae **seis losetas de cartón impresas de
los dos lados**, un lado fácil y el otro difícil. Los mapas se arman acomodando esas
mismas seis losetas de distintas maneras, y cada nivel del manual es una disposición
distinta de las mismas piezas.

Eso quiere decir que **las paredes de cada loseta están dibujadas para encastrar con
la loseta de al lado**, no para cerrar una sala que se juega sola. El mate encerrado
del nivel 2 no es una decisión de diseño: es lo que queda cuando una loseta pensada
para tener compañía se transcribe tal cual. En el juego de mesa, esa pared da contra
la loseta vecina y el mate se alcanza desde el otro lado.

Por eso no se toca. Y por eso, si aparece otra rareza parecida —una casilla que no se
alcanza, una pared que no cierra nada—, lo más probable es que sea lo mismo y no un
error de transcripción.

Lo que sí es un error y hay que arreglar: que quede suelto algo **que haga falta para
ganar** —una vitrina, un cómplice, la salida o tu puesto—. Eso rompe la sala. La
prueba de las ediciones hace justo esa distinción: una casilla encerrada de las que no
hacen falta se reporta como nota, y una imprescindible falla.

## Cómo está armado el tablero

- Grilla de 8×8. El núcleo jugable es de 6×4 y arranca en `CX0=1, CY0=2`.
- Alrededor hay un marco con la salida, el baño y la oficina del jefe arriba, y tu
  baño y tu puesto abajo.
- **Las paredes son aristas entre casillas, nunca casillas enteras.** `"v:x:y"` es la
  pared entre `(x,y)` y `(x+1,y)`; `"h:x:y"` la que va entre `(x,y)` y `(x,y+1)`.
- Las paredes del borde entre la loseta y el marco pertenecen a **cada sala**, porque
  están impresas en cada loseta. Del marco son sólo las tres que quedan enteras
  dentro del pasillo: `v:2:0`, `v:3:0` y `v:3:7`.

## El editor

Escondido a propósito: se abre con `?editor` en la dirección o con `Ctrl+Shift+E`.
Los diez niveles ya están fijos; el editor queda para crear salas nuevas.

Lo que el editor guarda queda en el navegador y **sólo se lee con el editor
abierto**. Al jugar manda siempre lo que dice el código. Fue a propósito: antes lo
guardado le ganaba al código y cada uno veía una sala distinta.

## La válvula de la alerta: regla propia, a conciencia

El turno del antagonista **es fiel al manual y está cerrado**: camina tantos casilleros
como marque su ira y **después** da vuelta una carta de acción. Las dos cosas, en ese
orden, cada ronda. El autor lo confirmó contra el reglamento impreso, así que no hay que
volver a preguntarlo ni «arreglarlo».

Lo que **sí** es agregado de esta versión: la alerta **baja** un nivel cuando una carta
lo manda al baño o a su oficina, sin bajar nunca del piso propio de cada uno. Eso no
está en el manual. Sin esa válvula la alerta sólo sube, el antagonista termina caminando
3 casilleros contra los 2 del jugador y el juego da 5% de victorias contra 54% con ella.

**No la saques.** Es una decisión tomada, no un parche esperando la regla verdadera: el
juego de mesa es así de duro y esta adaptación eligió ser jugable. Si alguna vez se
quiere la versión cruda, va como modo aparte, nunca reemplazando a ésta.

## Las siete ediciones están abiertas: decisión tomada

Antes cada edición se ganaba terminando las diez salas de la anterior, y el que ya la
había pasado en otro teléfono entraba escribiendo una palabra clave (`candombe`,
`caipirinha`, …). **Se sacaron las dos cosas el 17/11/2026 y no vuelven.** Dos razones: la
palabra viajaba en el código de una página pública, así que no guardaba ningún secreto, y
obligar a pasar seis ediciones para poder mirar la séptima era una traba y nada más —el
link ya circula entre los nueve—.

Queda `elJuegoEstaAbierto(n)`, que devuelve `true` siempre. **No la borres:** la miran el
pie de la portada, la ficha y el aviso de edición nueva. Si algún día se quiere volver a
cerrar algo, se cambia esa función y nada más.

`scripts/revisar-portada.js` existe justamente para que esto no vuelva sin querer.

## Sellar la versión antes de subir

GitHub Pages sirve la página con `Cache-Control: max-age=600` y no deja cambiar
esa cabecera, así que el teléfono se queda hasta diez minutos con la copia vieja.
Agregado a la pantalla de inicio, además, no hay botón de recargar. El `<meta`
`http-equiv="Cache-Control">` que se suele recomendar **no lo respeta ningún
navegador**: no sirve.

La página lo resuelve preguntando. Al abrirse pide `version.txt` con la hora
pegada al final —una dirección que nunca estuvo en la caché— y si no coincide
con su propia `VERSION` se recarga una sola vez.

Para que eso funcione hay que correr esto **antes de cada commit que toque**
**`index.html`**:

```
node scripts/sellar.js
```

Calcula un resumen del contenido y lo escribe en los dos lugares que tienen que
coincidir. Si te olvidás no se rompe nada: simplemente esa vez no hay recarga
automática, como antes.

## Probar

No hay framework. Se prueba corriendo el juego en node, con un arnés que emula lo justo
del navegador y un bot que juega solo.

**Lo que se arma queda en `scripts/`, versionado.** No en la carpeta temporal de la
sesión: esa se borra al cerrar, y el arnés de `index.html` ya se rehizo de cero tres
veces porque esta sección mandaba a buscarlo ahí.

### Aura (`batalla.html`) ya tiene el suyo

```
node scripts/balance-aura.js
```

Juega miles de batallas de la máquina contra sí misma. Lo que hay que mirar: que gane
cerca del 50%, que ninguna pelea quede sin terminar y que entre la mejor y la peor de
las diez no haya un abismo. Se apoya en `scripts/arnes-aura.js`, que no se usa solo.
Que el motor de Aura no toque el DOM es a propósito y hay que mantenerlo así: es lo
único que permite probarlo sin navegador.

### Los Museos (`index.html`) ya tiene arnés

```
node scripts/revisar-portada.js
```

Comprueba que las siete ediciones estén libres y que no haya vuelto el candado ni la
palabra clave: 19 comprobaciones, y además arranca una sala de cada edición. Se le puede
pasar otro html para comparar (`node scripts/revisar-portada.js copia-vieja.html`), que es
la forma de confirmar que la prueba todavía detecta el error.

Se apoya en `scripts/arnes-museos.js`, que no se usa solo. Ése es el arnés: corta el
JavaScript que está entre `<script>` y `</script>`, lo levanta con stubs de `document`,
`canvas`, `localStorage` y `fetch`, reemplaza `setTimeout` por una cola que se drena a
mano —el juego encadena las fases con temporizadores— y deja el motor a mano para jugar
solo. `cargar()` devuelve `{api, document, TIMERS, drain, sembrar}`.

**Ojo: se puede cargar una sola vez por proceso.** El juego declara todo con `const` y
`let` arriba de todo, así que un segundo `cargar()` choca con las declaraciones del
primero. Si hace falta probar dos versiones, van en dos corridas.

**Lo que falta medir** (se escribe con el mismo arnés, un revisor por tema):

- **estructura** — que cada sala tenga 3 vitrinas, un cómplice de cada símbolo, las
  escaleras en pares, un solo antagonista, y que todo lo que hace falta para ganar se
  alcance desde tu puesto. Vale para las salas fijas y para las del desafío diario.
- **invariantes** — cientos de partidas al azar usando objetos y poderes, controlando
  que las tres piezas estén siempre en algún lado, que la alerta no se salga de 1 a 3,
  que los pasos no se vayan a negativo y que nadie termine fuera del tablero.
- **la curva** — el porcentaje de victorias, sala por sala y dificultad por dificultad.

Dos trampas conocidas:

- El **desafío diario** fija el azar en la semilla del día, así que un bot determinista
  juega siempre la misma partida y da 0% o 100%. Para medirlo hay que variar al jugador
  (desempate al azar), no el tablero.
- Las rutas con **espacios** rompen los comandos: la carpeta del proyecto tiene uno.
