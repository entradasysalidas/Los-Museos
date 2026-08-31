# LUNES — sobreviví a la jornada laboral

Adaptación para navegador del juego de mesa **Lunes**, de Julián Tunni y Aibel
Nassif (Super Noob). Un solo archivo HTML, sin dependencias, sin instalación y
sin backend. Gráficos vectoriales dibujados en canvas.

## Jugar

👉 **[Jugar online](https://entradasysalidas.github.io/Lunes/)**

O descargá `index.html` y abrilo con doble clic. Funciona offline.

## Objetivo

Sos un empleado holgazán un lunes a la mañana. Para irte a casa tenés que
cumplir **tres cosas, en este orden**:

1. **Entregar los 3 informes.** Se roban de las impresoras y cada uno va al
   compañero que lleva **ese mismo color**.
2. **Conseguir las 3 fichas de recompensa.** Te las da cada compañero al
   recibir su informe.
3. **Llegar a la escalera de emergencia** para marcar tarjeta e irte.

## Estructura del turno

Cada ronda tiene dos fases, igual que en el juego de mesa.

**Fase 1 · Turno del empleado.** Tenés **2 puntos de movimiento** (podés usar
menos). Se mueve en ortogonal, sin diagonales, y no se atraviesan paredes ni
escritorios. **No hay tecla de interactuar**: pasa lo que corresponda según
dónde *termines* el movimiento.

| Terminás sobre… | Qué pasa |
|---|---|
| Impresora activa | Robás un informe. La impresora se queda sin tóner unas rondas |
| Compañero que pide un informe que llevás | Se lo entregás y te da una ficha de recompensa |
| Cafetera | Te cargás un café: +3 de movimiento en la próxima ronda |
| Escalera de emergencia | Si cumpliste los 3 objetivos, ganaste |

**Fase 2 · Turno del Jefe.** Avanza automáticamente hacia vos por el camino más
corto, y después se da vuelta una carta de su mazo de **9 acciones**, que puede
hacerlo avanzar más, cambiar de rumbo o disparar un evento de oficina.

**La Ira.** Cuando el mazo del Jefe se agota, se baraja de nuevo y la Ira sube
1 nivel. Cuanta más Ira, más rápido camina.

## Cómo se pierde

- El Jefe entra en tu casilla y **no llevás ningún informe encima** → derrota
  inmediata: te agarró holgazaneando.
- Te atrapa **con informes encima** → amonestación: te acompaña hasta tu
  escritorio y se vuelve a su oficina. A la enésima amonestación (según el
  escenario), a la calle.
- El medidor de **Ira** supera el máximo del escenario.

> **La estrategia central:** los informes en la mano son un escudo. Conviene
> imprimir los 3 antes de empezar a repartirlos, y tener mucho cuidado en el
> tramo final, cuando ya entregaste todo y corrés a la escalera con las manos
> vacías.

## Controles

| Tecla | Acción |
|---|---|
| `← ↑ → ↓` / `WASD` | Moverse |
| `Espacio` | Terminar la ronda |
| `1` `2` `3` | Usar una ficha de recompensa |
| `R` | Reiniciar |
| `Esc` | Volver al menú |

También se juega con el mouse: clic en cualquier casilla resaltada y el
personaje camina hasta ahí.

En el tablero, la **zona roja** marca hasta dónde puede llegar el Jefe en su
próxima ronda, y las casillas celestes son las que alcanzás con el movimiento
que te queda.

## Fichas de recompensa

Se sortean 3 de estas 5 en cada partida:

| | Ficha | Efecto |
|---|---|---|
| ☕ | Café | +2 puntos de movimiento en tu próxima ronda |
| 🥃 | Whisky | El Jefe pierde su próxima ronda entera |
| 🍩 | Donas | Dejás la caja y el Jefe va hacia ella 3 rondas |
| 🗝️ | Llave maestra | Tu próximo paso atraviesa un escritorio |
| 🧯 | Simulacro | El Jefe vuelve de golpe a su oficina |

## Escenarios

| Escenario | Ira máxima | Amonestaciones |
|---|---|---|
| La planta baja *(fácil)* | 5 | 4 |
| Oficina abierta *(media)* | 6 | 3 |
| Piso ejecutivo *(difícil)* | 5 | 2 |
| Oficina al azar | 5 | 3 |

Los tres planos fijos están diseñados como circuitos cerrados: siempre se puede
seguir girando, nunca te encerrás solo en un callejón. La oficina al azar se
genera y se valida para que todos los elementos sean alcanzables.

## Diferencias con el reglamento original

Esta versión sigue la dinámica del manual, pero hubo que tomar decisiones donde
el reglamento no las fija o donde el balance no cerraba en pantalla:

- **La Ira acelera al Jefe cada 2 niveles**, no cada uno. Con incrementos de a
  uno el Jefe igualaba tu velocidad en la ronda 10 y la partida se volvía
  imposible: en simulación se ganaba el 0% de las veces.
- **La amonestación devuelve al Jefe a su oficina** además de mandarte a tu
  escritorio. Si no, te reatrapaba de inmediato y las amonestaciones se
  gastaban en cadena.
- **La cafetera da movimiento extra.** El manual la lista entre los componentes
  pero no fija su efecto.
- Efectos concretos de las fichas de recompensa, contenido de las 9 cartas del
  Jefe y planos de los escenarios: inventados para esta versión.

Los parámetros de balance están todos juntos en el objeto `TUNE`, arriba de
todo en el script, para poder retocarlos sin tocar la lógica.

## Estructura del código

Todo vive en `index.html`, en capas: datos → estado → lógica → render → input.
El piso y los muebles se cachean en un canvas aparte porque no cambian; los
sprites se dibujan en un espacio de casilla de 48 unidades y se escalan, así el
tamaño de casilla se puede cambiar sin retocar una sola coordenada.

## Créditos

Basado en el juego de mesa *Lunes*, de Julián Tunni y Aibel Nassif, editado por
Super Noob. Todos los derechos del juego original pertenecen a sus autores.
