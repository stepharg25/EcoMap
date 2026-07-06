const mapa = L.map("mapaInteractivo").setView([9.9281, -84.0907], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(mapa);

const listaCentros = document.getElementById("listaCentros");
const buscarCentro = document.getElementById("buscarCentro");
const btnUbicacion = document.getElementById("btnUbicacion");

let centros = [];
let marcadores = [];
let marcadorUsuario = null;

function crearPopup(centro) {
  return `
    <h3>${centro.nombre}</h3>
    <p><strong>Dirección:</strong> ${centro.direccion}</p>
    <p><strong>Horario:</strong> ${centro.horario}</p>
    <p><strong>Materiales:</strong></p>
    <ul>
      ${centro.materiales.map(material => `<li>${material}</li>`).join("")}
    </ul>
  `;
}

function cargarMarcadores(lista) {
  marcadores.forEach(marker => mapa.removeLayer(marker));
  marcadores = [];

  lista.forEach(centro => {
    const marker = L.marker([centro.lat, centro.lng])
      .addTo(mapa)
      .bindPopup(crearPopup(centro));

    marcadores.push(marker);
  });
}

function cargarLista(lista) {
  listaCentros.innerHTML = "";

  lista.forEach((centro, index) => {
    const card = document.createElement("div");
    card.classList.add("centro");

    card.innerHTML = `
      <h3>${centro.nombre}</h3>
      <p><strong>Dirección:</strong> ${centro.direccion}</p>
      <p><strong>Horario:</strong> ${centro.horario}</p>
      <div class="materiales">
        ${centro.materiales.map(material => `<span class="material">${material}</span>`).join("")}
      </div>
    `;

    card.addEventListener("click", () => {
      mapa.setView([centro.lat, centro.lng], 14);
      marcadores[index].openPopup();
    });

    listaCentros.appendChild(card);
  });
}

function filtrarCentros() {
  const texto = buscarCentro.value.toLowerCase();

  const filtrados = centros.filter(centro =>
    centro.nombre.toLowerCase().includes(texto) ||
    centro.direccion.toLowerCase().includes(texto) ||
    centro.materiales.join(" ").toLowerCase().includes(texto)
  );

  cargarMarcadores(filtrados);
  cargarLista(filtrados);
}

btnUbicacion.addEventListener("click", () => {
  if (!navigator.geolocation) {
    btnUbicacion.textContent = "Ubicación no disponible";
    return;
  }

  btnUbicacion.textContent = "Buscando ubicación...";

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      mapa.setView([lat, lng], 14);

      if (marcadorUsuario) {
        mapa.removeLayer(marcadorUsuario);
      }

      marcadorUsuario = L.marker([lat, lng])
        .addTo(mapa)
        .bindPopup("<h3>Tu ubicación actual</h3>")
        .openPopup();

      btnUbicacion.textContent = "📌 Ubicación activa";
    },
    () => {
      btnUbicacion.textContent = "No se pudo obtener ubicación";
    }
  );
});

buscarCentro.addEventListener("input", filtrarCentros);

fetch("data/centros.json")
  .then(response => response.json())
  .then(data => {
    centros = data;
    cargarMarcadores(centros);
    cargarLista(centros);
  })
  .catch(error => {
    console.error("Error cargando centros:", error);
    listaCentros.innerHTML = "<p>No se pudieron cargar los centros.</p>";
  });