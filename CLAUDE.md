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

## Probar

No hay framework. En `scratchpad/` de la sesión hay un arnés que emula el DOM y el
canvas en node y corre un bot que juega solo:

- `nchecks.js` — estructura de las diez salas, paredes como aristas, alcanzabilidad,
  un solo antagonista por sala, que cada nivel se pueda ganar.
- `revision.js` — invariantes sobre cientos de partidas simuladas.
- `curva3.js` — la curva de dificultad, sala por sala.

Para correrlos hay que sacar el JavaScript del html primero, porque el juego vive
adentro de `index.html`:

```
node extraer.js index.html juego.js      # corta lo que hay entre <script> y </script>
node drun.js juego.js nchecks.js         # el arnés carga los archivos que le pasés
```

Si el arnés no está, se rehace: son stubs de `document`, `canvas` y `localStorage`
más un `eval` de los archivos que se le pasen.
