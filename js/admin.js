// ============================================
// ECOMAP ADMIN PANEL - JAVASCRIPT
// ============================================

// State Management
let appState = {
  isLoggedIn: false,
  currentUser: null,
  centros: [],
  editingId: null,
  materialesDisponibles: [
    'Papel', 'Cartón', 'Plástico', 'Vidrio', 'Aluminio', 
    'Latas', 'Electrónicos', 'Baterías', 'Metal', 'Ropa'
  ]
};

// Demo credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@ecomap.com',
  password: '123456'
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  loadCentros();
  attachEventListeners();
});

function initializeApp() {
  // Check if already logged in
  const savedUser = localStorage.getItem('ecomap_user');
  if (savedUser) {
    showDashboard(JSON.parse(savedUser));
  }
}

// ============================================
// LOGIN FUNCTIONALITY
// ============================================

document.getElementById('loginForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const user = { email, name: 'Administrador' };
    localStorage.setItem('ecomap_user', JSON.stringify(user));
    showDashboard(user);
  } else {
    showMessage('Error de Autenticación', 'Correo o contraseña incorrectos', 'error');
  }
});

function showDashboard(user) {
  appState.isLoggedIn = true;
  appState.currentUser = user;
  
  document.getElementById('loginContainer').style.display = 'none';
  document.getElementById('adminContainer').style.display = 'block';
  document.getElementById('userDisplay').textContent = user.name;
  
  updateDashboard();
}

document.getElementById('logoutBtn')?.addEventListener('click', function() {
  if (confirm('¿Está seguro de que desea cerrar sesión?')) {
    localStorage.removeItem('ecomap_user');
    location.reload();
  }
});

// ============================================
// TAB NAVIGATION
// ============================================

document.querySelectorAll('.nav-item, .action-btn, [data-tab]').forEach(element => {
  element.addEventListener('click', function(e) {
    // Skip if it's a form button
    if (this.type === 'submit' || this.type === 'reset') return;
    
    const tabName = this.getAttribute('data-tab');
    if (tabName) {
      switchTab(tabName);
    }
  });
});

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab
  const activeTab = document.getElementById(tabName);
  if (activeTab) {
    activeTab.classList.add('active');
  }

  // Update sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-tab') === tabName) {
      item.classList.add('active');
    }
  });

  // Reset form if switching to "agregar"
  if (tabName === 'agregar') {
    resetForm();
    document.getElementById('formTitle').textContent = 'Nuevo Centro de Reciclaje';
    document.getElementById('centroId').value = '';
  }

  // Load data if switching to "centros"
  if (tabName === 'centros') {
    loadCentrosTable();
  }

  // Load stats if switching to "estadisticas"
  if (tabName === 'estadisticas') {
    loadEstadisticas();
  }
}

// ============================================
// LOAD & DISPLAY CENTROS
// ============================================

function loadCentros() {
  if (typeof centros !== 'undefined') {
    appState.centros = centros;
  }
}

function loadCentrosTable() {
  const tbody = document.getElementById('centrosTableBody');
  tbody.innerHTML = '';

  appState.centros.forEach(centro => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${centro.id}</td>
      <td><strong>${centro.nombre}</strong></td>
      <td>${centro.direccion}</td>
      <td>${centro.horario}</td>
      <td>
        <div class="material-tags">
          ${centro.materiales.slice(0, 2).map(m => `<span class="tag">${m}</span>`).join('')}
          ${centro.materiales.length > 2 ? `<span class="tag">+${centro.materiales.length - 2}</span>` : ''}
        </div>
      </td>
      <td>
        <div class="action-buttons">
          <button class="action-btn-small" onclick="editCentro(${centro.id})">✏️ Editar</button>
          <button class="action-btn-small delete" onclick="deleteCentro(${centro.id})">🗑️ Eliminar</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ============================================
// FORM FUNCTIONALITY
// ============================================

document.getElementById('centroForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  saveCentro();
});

function saveCentro() {
  const id = document.getElementById('centroId').value;
  const formData = getFormData();

  if (id) {
    // Update existing
    const index = appState.centros.findIndex(c => c.id == id);
    if (index !== -1) {
      appState.centros[index] = { ...appState.centros[index], ...formData };
    }
    showMessage('Éxito', 'Centro actualizado correctamente', 'success');
  } else {
    // Create new
    const newId = Math.max(...appState.centros.map(c => c.id), 0) + 1;
    appState.centros.push({ id: newId, ...formData });
    showMessage('Éxito', 'Centro agregado correctamente', 'success');
  }

  resetForm();
  setTimeout(() => switchTab('centros'), 1500);
}

function getFormData() {
  const materiales = [];
  document.querySelectorAll('input[name="materiales"]:checked').forEach(checkbox => {
    materiales.push(checkbox.value);
  });

  return {
    nombre: document.getElementById('nombre').value,
    direccion: document.getElementById('direccion').value,
    horario: document.getElementById('horario').value,
    contacto: document.getElementById('contacto').value || 'No disponible',
    lat: parseFloat(document.getElementById('latitud').value),
    lng: parseFloat(document.getElementById('longitud').value),
    materiales: materiales,
    observaciones: document.getElementById('observaciones').value
  };
}

function resetForm() {
  document.getElementById('centroForm').reset();
  document.getElementById('centroId').value = '';
  document.getElementById('formTitle').textContent = 'Nuevo Centro de Reciclaje';
  document.querySelectorAll('input[name="materiales"]').forEach(cb => cb.checked = false);
}

function editCentro(id) {
  const centro = appState.centros.find(c => c.id == id);
  if (!centro) return;

  // Fill form
  document.getElementById('centroId').value = centro.id;
  document.getElementById('nombre').value = centro.nombre;
  document.getElementById('direccion').value = centro.direccion;
  document.getElementById('horario').value = centro.horario;
  document.getElementById('contacto').value = centro.contacto || '';
  document.getElementById('latitud').value = centro.lat;
  document.getElementById('longitud').value = centro.lng;
  document.getElementById('observaciones').value = centro.observaciones || '';

  // Check materials
  document.querySelectorAll('input[name="materiales"]').forEach(cb => {
    cb.checked = centro.materiales.includes(cb.value);
  });

  document.getElementById('formTitle').textContent = `Editar: ${centro.nombre}`;
  switchTab('agregar');
}

let deletingId = null;

function deleteCentro(id) {
  deletingId = id;
  const centro = appState.centros.find(c => c.id == id);
  
  const modal = document.getElementById('deleteModal');
  modal.classList.add('active');
}

document.getElementById('confirmDelete')?.addEventListener('click', function() {
  appState.centros = appState.centros.filter(c => c.id != deletingId);
  document.getElementById('deleteModal').classList.remove('active');
  showMessage('Éxito', 'Centro eliminado correctamente', 'success');
  loadCentrosTable();
});

document.getElementById('cancelDelete')?.addEventListener('click', function() {
  document.getElementById('deleteModal').classList.remove('active');
});

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

document.getElementById('searchCentros')?.addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  const tbody = document.getElementById('centrosTableBody');
  
  document.querySelectorAll('#centrosTableBody tr').forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
});

// ============================================
// DASHBOARD UPDATE
// ============================================

function updateDashboard() {
  document.getElementById('totalCentros').textContent = appState.centros.length;
  document.getElementById('centrosActivos').textContent = appState.centros.length;
  document.getElementById('ultimaActualizacion').textContent = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// ============================================
// ESTADÍSTICAS
// ============================================

function loadEstadisticas() {
  document.getElementById('statTotalRegistros').textContent = appState.centros.length;
  
  // Unique regions count
  const regiones = new Set();
  appState.centros.forEach(c => {
    const region = c.direccion.split(',').pop().trim();
    regiones.add(region);
  });
  document.getElementById('statRegiones').textContent = regiones.size;

  // Material stats
  loadMaterialesChart();
  loadHorariosInfo();
}

function loadMaterialesChart() {
  const materiales = {};
  
  appState.centros.forEach(centro => {
    centro.materiales.forEach(material => {
      materiales[material] = (materiales[material] || 0) + 1;
    });
  });

  // Sort by count
  const sorted = Object.entries(materiales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const container = document.getElementById('materialesChart');
  container.innerHTML = sorted.map(([material, count]) => `
    <div class="material-item">
      <span class="material-name">${material}</span>
      <span class="material-count">${count} centros</span>
    </div>
  `).join('');
}

function loadHorariosInfo() {
  const horarios = {};
  
  appState.centros.forEach(centro => {
    const horario = centro.horario;
    horarios[horario] = (horarios[horario] || 0) + 1;
  });

  const container = document.getElementById('horariosInfo');
  container.innerHTML = Object.entries(horarios).map(([horario, count]) => `
    <div class="info-row">
      <strong>${horario}</strong>
      <span>${count} centro${count > 1 ? 's' : ''}</span>
    </div>
  `).join('');
}

// ============================================
// MODALS & MESSAGES
// ============================================

function showMessage(title, text, type = 'success') {
  const modal = document.getElementById('messageModal');
  const icon = document.getElementById('messageIcon');
  
  if (type === 'error') {
    icon.textContent = '❌';
  } else if (type === 'warning') {
    icon.textContent = '⚠️';
  } else {
    icon.textContent = '✅';
  }

  document.getElementById('messageTitle').textContent = title;
  document.getElementById('messageText').textContent = text;
  modal.classList.add('active');
}

document.getElementById('closeMessage')?.addEventListener('click', function() {
  document.getElementById('messageModal').classList.remove('active');
});

// Close modals on escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.getElementById('deleteModal').classList.remove('active');
    document.getElementById('messageModal').classList.remove('active');
  }
});

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function attachEventListeners() {
  // Material checkbox tag styling
  document.querySelectorAll('input[name="materiales"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      this.parentLabel = this.closest('.checkbox-group');
      if (this.checked) {
        this.parentLabel.style.background = 'rgba(46, 139, 87, 0.1)';
        this.parentLabel.style.borderColor = 'var(--primary)';
      } else {
        this.parentLabel.style.background = 'var(--surface)';
        this.parentLabel.style.borderColor = 'var(--border)';
      }
    });
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Add inline styling for material tags in table
const style = document.createElement('style');
style.textContent = `
  .material-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .tag {
    display: inline-block;
    background: linear-gradient(90deg, var(--primary), #3aa66e);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }
`;
document.head.appendChild(style);

// Auto-load dashboard on login
if (localStorage.getItem('ecomap_user') && appState.isLoggedIn) {
  updateDashboard();
}
