# LUNES — escapá de la oficina

Juego de escape por turnos para navegador, en un solo archivo HTML, sin dependencias
ni instalación. Inspirado en el juego de mesa **Lunes** de Julián Tunni y Aibel Nassif
(Super Noob). No es una adaptación oficial ni una reproducción del reglamento: es una
reinterpretación libre a partir del tema y los componentes de la caja.

## Jugar

👉 **[Jugar online](https://USUARIO.github.io/lunes/)**

O descargá `index.html` y abrilo con doble clic. Funciona offline.

## Cómo se juega

Sos un empleado holgazán un lunes a la mañana. Objetivo: imprimir **3 informes** y
escapar por la **puerta** antes de que la **ira del jefe** llegue al tope o te
encuentre en un pasillo.

| Tecla | Acción |
|---|---|
| `← ↑ → ↓` / `WASD` | Moverse |
| `E` | Interactuar: imprimir · cargar café · sobornar colega · salir |
| `1` – `5` | Usar objeto recompensa |
| `Espacio` | Terminar el turno |
| `R` | Reiniciar la partida |

También se juega con el mouse: clic en una casilla contigua para moverte, clic en la
tuya para interactuar.

### Reglas

- Tenés 3 o 4 **acciones** por turno según la dificultad. Al agotarlas juega el jefe.
- El **cono rojo** es el campo de visión del jefe. Si te ve: +1 de ira y te persigue
  dos turnos.
- Las **macetas 🪴** son escondites: parado ahí el jefe no te ve.
- Imprimir un informe hace ruido: **+2 de ira**.
- Sobornar a un colega 🧑‍💻 cuesta un **café ☕** y te da un objeto, además de bajarte
  1 de ira porque te cubre.
- El jefe juega una carta de un mazo de **9 acciones** (Patrulla, Reunión sorpresa,
  ¡Deadline!, Vigilancia…) que se baraja y se repone.

### Objetos recompensa

| | Objeto | Efecto |
|---|---|---|
| ☕ | Café triple | +2 acciones en este turno |
| 🎧 | Auriculares | El jefe no te ve durante 2 turnos |
| 🗝️ | Llave maestra | Tu próximo paso atraviesa un mueble |
| 📄 | Informe falso | −3 de ira del jefe |
| 🪑 | Silla con ruedas | Te deslizás hasta 3 casillas seguidas |

### Dificultades

- **Becario** — ira 14, el jefe ve poco y camina lento, 4 acciones
- **Empleado** — ira 11, el jefe ve 5 casillas, 3 acciones
- **Gerente** — ira 9, vista de halcón y te persigue sin piedad

La oficina se arma sola en cada partida combinando y rotando 6 losetas, y se valida
que siempre sea jugable (salida, impresoras y colegas alcanzables).

## Estructura

Todo vive en `index.html`: motor de juego, dibujo en canvas e interfaz.
Sin build, sin dependencias, sin backend.

## Créditos

Basado en el juego de mesa *Lunes*, de Julián Tunni y Aibel Nassif, editado por
Super Noob. Todos los derechos del juego original pertenecen a sus autores.
