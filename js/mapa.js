// Variables principales del DOM
const listaCentros = document.getElementById("listaCentros");
const buscarCentro = document.getElementById("buscarCentro");
const btnUbicacion = document.getElementById("btnUbicacion");
const btnUbicacionHeader = document.getElementById("btnUbicacionHeader");

// Mapa centrado en Costa Rica
const mapa = L.map("mapaInteractivo").setView([9.9281, -84.0907], 10);

// Capa base de OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(mapa);

// Variables globales
let centros = [];
let marcadores = [];
let marcadorUsuario = null;

// Icono personalizado para los centros
const iconoCentro = L.divIcon({
  className: "custom-marker",
  html: "♻",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -35]
});

// Icono personalizado para la ubicación del usuario
const iconoUsuario = L.divIcon({
  className: "user-marker",
  html: "📍",
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -36]
});

// Crea el contenido de la ventana emergente
function crearPopup(centro) {
  const listaMateriales = centro.materiales
    .map((material) => `<li>${material}</li>`)
    .join("");

  return `
    <h3>${centro.nombre}</h3>
    <p><strong>Dirección:</strong> ${centro.direccion}</p>
    <p><strong>Horario:</strong> ${centro.horario}</p>
    <p><strong>Materiales aceptados:</strong></p>
    <ul>${listaMateriales}</ul>
  `;
}

// Limpia marcadores anteriores
function limpiarMarcadores() {
  marcadores.forEach((marcador) => {
    mapa.removeLayer(marcador);
  });

  marcadores = [];
}

// Carga marcadores al mapa
function cargarMarcadores(lista) {
  limpiarMarcadores();

  lista.forEach((centro) => {
    const marcador = L.marker([centro.lat, centro.lng], {
      icon: iconoCentro
    })
      .addTo(mapa)
      .bindPopup(crearPopup(centro));

    marcadores.push({
      id: centro.id,
      marker: marcador
    });
  });
}

// Carga las tarjetas del panel lateral
function cargarLista(lista) {
  listaCentros.innerHTML = "";

  if (lista.length === 0) {
    listaCentros.innerHTML = `
      <div class="mensaje-vacio">
        No se encontraron centros con esa búsqueda.
      </div>
    `;
    return;
  }

  lista.forEach((centro) => {
    const card = document.createElement("article");
    card.classList.add("centro");

    const materialesHTML = centro.materiales
      .map((material) => `<span class="material">${material}</span>`)
      .join("");

    card.innerHTML = `
      <h3>${centro.nombre}</h3>
      <p><strong>Dirección:</strong> ${centro.direccion}</p>
      <p><strong>Horario:</strong> ${centro.horario}</p>
      <div class="materiales">${materialesHTML}</div>
    `;

    card.addEventListener("click", () => {
      mapa.setView([centro.lat, centro.lng], 15);

      const marcadorEncontrado = marcadores.find(
        (item) => item.id === centro.id
      );

      if (marcadorEncontrado) {
        marcadorEncontrado.marker.openPopup();
      }
    });

    listaCentros.appendChild(card);
  });
}

// Filtra centros por nombre, dirección o materiales
function filtrarCentros() {
  const texto = buscarCentro.value.toLowerCase().trim();

  const filtrados = centros.filter((centro) => {
    const nombre = centro.nombre.toLowerCase();
    const direccion = centro.direccion.toLowerCase();
    const materiales = centro.materiales.join(" ").toLowerCase();

    return (
      nombre.includes(texto) ||
      direccion.includes(texto) ||
      materiales.includes(texto)
    );
  });

  cargarMarcadores(filtrados);
  cargarLista(filtrados);
}

// Usa la ubicación actual del usuario
function usarUbicacion() {
  if (!navigator.geolocation) {
    btnUbicacion.textContent = "Ubicación no disponible";
    btnUbicacionHeader.textContent = "No disponible";
    return;
  }

  btnUbicacion.textContent = "Buscando ubicación...";
  btnUbicacionHeader.textContent = "Buscando...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      mapa.setView([lat, lng], 15);

      if (marcadorUsuario) {
        mapa.removeLayer(marcadorUsuario);
      }

      marcadorUsuario = L.marker([lat, lng], {
        icon: iconoUsuario
      })
        .addTo(mapa)
        .bindPopup("<h3>Tu ubicación actual</h3>")
        .openPopup();

      btnUbicacion.textContent = "📌 Ubicación activa";
      btnUbicacionHeader.textContent = "Ubicación activa";
    },
    () => {
      btnUbicacion.textContent = "No se pudo obtener ubicación";
      btnUbicacionHeader.textContent = "Error ubicación";
    }
  );
}

// Carga el JSON de centros
fetch("data/centros.js")
  .then((respuesta) => {
    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el archivo centros.json");
    }

    return respuesta.json();
  })
  .then((data) => {
    centros = data;

    cargarMarcadores(centros);
    cargarLista(centros);
  })
  .catch((error) => {
    console.error("Error:", error);

    listaCentros.innerHTML = `
      <div class="error-centros">
        No se pudieron cargar los centros. Revisa la ruta data/centros.json.
      </div>
    `;
  });

// Eventos
buscarCentro.addEventListener("input", filtrarCentros);
btnUbicacion.addEventListener("click", usarUbicacion);
btnUbicacionHeader.addEventListener("click", usarUbicacion);