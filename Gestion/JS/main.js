// ====== APP STATE ======
const AppState = {
  currentView: 'vehiculos',
  vehiculos: [],
  conductores: [],
  cargas: [],
  rutas: []
};

// ====== SELECTORES ======
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

// ====== SPA NAVIGATION ======
function changeView(viewId) {
  AppState.currentView = viewId;
  navItems.forEach(i => i.classList.toggle('active', i.dataset.view === viewId));
  views.forEach(v => v.classList.toggle('active', v.id === viewId));
}

// Inicializa la vista inicial y listeners
navItems.forEach(item => item.addEventListener('click', () => changeView(item.dataset.view)));
changeView(AppState.currentView);

// ====== UTILIDADES ======
function clearInputs(container) {
  container.querySelectorAll('input, select').forEach(i => i.value = '');
}

function showAlert(message) {
  alert(message);
}

// ====== FORMULARIOS GENÉRICOS ======
function registerItem(formSelector, stateArray, mapFn, callback) {
  const form = document.querySelector(formSelector);
  form?.querySelector('button')?.addEventListener('click', () => {
    const item = mapFn(form);
    if (!item) return;
    stateArray.push(item);
    clearInputs(form);
    if (callback) callback();
  });
}

// ====== VEHÍCULOS ======
function mapVehicle(form) {
  const tipo = form.querySelector('#vehicle-type').value;
  const matricula = form.querySelector('#vehicle-plate').value.trim();
  const capacidad = parseFloat(form.querySelector('#vehicle-capacity').value);
  const estado = form.querySelector('#vehicle-status').value;
  if (!tipo || !matricula || isNaN(capacidad) || !estado) {
    showAlert('Completa todos los campos');
    return null;
  }
  return { tipo, matricula, capacidad, estado };
}

function renderVehiculos() {
  const container = document.getElementById('vehicle-list');
  if (!container) return;
  let vehicles = [...AppState.vehiculos];

  const filterType = document.getElementById('filter-type').value;
  const filterStatus = document.getElementById('filter-status').value;
  if (filterType) vehicles = vehicles.filter(v => v.tipo === filterType);
  if (filterStatus) vehicles = vehicles.filter(v => v.estado === filterStatus);

  if (vehicles.length === 0) return container.innerHTML = `<p class="empty-state">No hay vehículos registrados.</p>`;

  const badgeClass = estado => ({
    'Disponible': 'badge-disponible',
    'En viaje': 'badge-viaje',
    'Mantenimiento': 'badge-mantenimiento'
  }[estado] || '');

  container.innerHTML = `
    <table>
      <tr><th>Tipo</th><th>Matrícula</th><th>Capacidad (ton)</th><th>Estado</th></tr>
      ${vehicles.map(v => `<tr>
        <td>${v.tipo}</td>
        <td>${v.matricula}</td>
        <td>${v.capacidad}</td>
        <td><span class="badge ${badgeClass(v.estado)}">${v.estado}</span></td>
      </tr>`).join('')}
    </table>`;
}

// Filtrado de vehículos
document.getElementById('filter-type')?.addEventListener('change', renderVehiculos);
document.getElementById('filter-status')?.addEventListener('change', renderVehiculos);

// Registrar vehículo
registerItem('#vehiculos .card', AppState.vehiculos, mapVehicle, renderVehiculos);

// ====== CONDUCTORES ======
function mapDriver(form) {
  const nombre = form.querySelector('#driver-name').value.trim();
  const licencia = form.querySelector('#driver-license').value;
  if (!nombre || !licencia) { showAlert('Completa todos los campos'); return null; }
  if (AppState.conductores.find(d => d.nombre === nombre)) { showAlert('Conductor ya registrado'); return null; }
  return { nombre, licencia, historial: [] };
}

// Registrar carga
registerItem('#cargas .card', AppState.cargas, mapCargo, renderCargas);

// ====== DASHBOARD ======
function renderDashboard() {
  document.getElementById('stat-vehiculos-disponibles').textContent = AppState.vehiculos.filter(v=>v.estado==='Disponible').length;
  document.getElementById('stat-vehiculos-en-viaje').textContent = AppState.vehiculos.filter(v=>v.estado==='En viaje').length;
  document.getElementById('stat-conductores-activos').textContent = AppState.conductores.length;
  document.getElementById('stat-cargas-pendientes').textContent = AppState.cargas.filter(c=>!c.vehiculo).length;
}

// ====== FUNCIÓN DE ACTUALIZACIÓN GENERAL ======
function updateAll() {
  renderVehiculos();
  renderDrivers();
  renderCargas();
  renderAssignments();
  renderDashboard();
}

// Llamar después de acciones
['vehicle-save','driver-save','cargo-save','assign-save'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', updateAll);
});

// Inicializar
updateAll();
