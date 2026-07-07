// Variables del DOM
const listaFichas = document.getElementById("listaFichas");
const inputBuscar = document.getElementById("inputBuscar");
const filtrosMaterial = document.getElementById("filtrosMaterial");
const contadorResultados = document.getElementById("contadorResultados");

// Variables globales
let centros = [];
let filtroActivo = "Todos";

// Crea el HTML de una ficha de centro
function crearFicha(centro) {
  const materialesHTML = centro.materiales
    .map((m) => `<span class="material">${m}</span>`)
    .join("");

  const ficha = document.createElement("article");
  ficha.classList.add("ficha");

  ficha.innerHTML = `
    <div class="ficha-encabezado">
      <div class="ficha-icono">♻</div>
      <h3>${centro.nombre}</h3>
    </div>

    <div class="ficha-cuerpo">
      <p>📍 ${centro.direccion}</p>
      <p>🕒 ${centro.horario}</p>
    </div>

    <div class="ficha-materiales">
      ${materialesHTML}
    </div>

    <a href="mapa.html" class="btn btn-secondary ficha-btn">Ver en mapa</a>
  `;

  return ficha;
}

// Muestra las fichas en pantalla
function mostrarFichas(lista) {
  listaFichas.innerHTML = "";

  if (lista.length === 0) {
    listaFichas.innerHTML = `
      <div class="sin-resultados">
        <strong>No se encontraron centros</strong>
        <p>Intenta con otro nombre, dirección o tipo de material.</p>
      </div>
    `;
    contadorResultados.textContent = "Sin resultados.";
    return;
  }

  lista.forEach((centro) => {
    const ficha = crearFicha(centro);
    listaFichas.appendChild(ficha);
  });

  contadorResultados.textContent = `Mostrando ${lista.length} centro${lista.length === 1 ? "" : "s"}.`;
}

// Crea los botones de filtro según los materiales disponibles
function crearFiltros() {
  const todosLosMateriales = centros.flatMap((c) => c.materiales);
  const materiales = ["Todos", ...new Set(todosLosMateriales)];

  materiales.forEach((material) => {
    const btn = document.createElement("button");
    btn.classList.add("btn-filtro");
    btn.textContent = material;

    if (material === "Todos") {
      btn.classList.add("activo");
    }

    btn.addEventListener("click", () => {
      filtroActivo = material;

      // Marca el botón activo y quita el de los demás
      document.querySelectorAll(".btn-filtro").forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");

      aplicarFiltros();
    });

    filtrosMaterial.appendChild(btn);
  });
}

// Aplica búsqueda de texto y filtro de material al mismo tiempo
function aplicarFiltros() {
  const texto = inputBuscar.value.toLowerCase().trim();

  const resultado = centros.filter((centro) => {
    const nombre = centro.nombre.toLowerCase();
    const direccion = centro.direccion.toLowerCase();
    const materiales = centro.materiales.join(" ").toLowerCase();

    const coincideTexto =
      nombre.includes(texto) ||
      direccion.includes(texto) ||
      materiales.includes(texto);

    const coincideMaterial =
      filtroActivo === "Todos" ||
      centro.materiales.includes(filtroActivo);

    return coincideTexto && coincideMaterial;
  });

  mostrarFichas(resultado);
}

// Carga el archivo de datos
fetch("data/centros.js")
  .then((respuesta) => {
    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el archivo de centros.");
    }

    return respuesta.json();
  })
  .then((data) => {
    centros = data;

    crearFiltros();
    mostrarFichas(centros);
  })
  .catch((error) => {
    console.error("Error:", error);

    listaFichas.innerHTML = `
      <div class="sin-resultados">
        <strong>No se pudieron cargar los centros.</strong>
        <p>Revisa la ruta del archivo de datos.</p>
      </div>
    `;
  });

// Eventos
inputBuscar.addEventListener("input", aplicarFiltros);
