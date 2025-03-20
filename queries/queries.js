import { obtenerConsultas, actualizarEstadoConsulta, deleteConsulta, auth } from "../firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const tbody = document.getElementById('tbody');

// Función para actualizar la tabla en el DOM
function updateTable(consultas) {
    const columnNames = [
        "Apellido",
        "Nombre",
        "Teléfono",        
        "Consulta",
        "Estado de la consulta",
        "Acciones"
    ];

    let html = `
        <thead>
            <tr>${columnNames.map(columnName => `<th>${columnName}</th>`).join('')}</tr>
        </thead>
        <tbody>`;

    consultas.forEach((consulta) => {

        // Acceder a los campos directamente desde 'consulta'
        const apellido = consulta.apellido || 'No disponible';
        const nombre = consulta.nombre || 'No disponible';        
        const telefono = consulta.telefono || 'No disponible';
        const consultas = consulta.consulta || 'No disponible';
        const estado = consulta.estado || 'Ingrese una respuesta';



        html += `
            <tr>
                <td class="apellido table">${apellido}</td>
                <td class="nombre table">${nombre}</td>                
                <td class="telefono table">${telefono}</td>
                <td class="consulta table">${consultas}</td>                                 
                <td class="estado table" data-id="${consulta.id || ''}">${estado}</td>
                <td class="table">
                    <button type="button" class="btn btn-warning button-edit" data-bs-toggle="modal" data-id="${consulta.id}" data-bs-target="#modal" data-bs-placement="top" title="Estado de la Consulta">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button type="button" class="btn btn-danger button-delete" data-id="${consulta.id}" data-bs-toggle="tooltip" data-bs-placement="top" title="Eliminar Consulta">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    });

    html += `</tbody>`;
    tbody.innerHTML = html;  // Agregar la tabla al DOM
    agregarEventosBotones(); // Agregar eventos a los botones
}

// Función para cargar los pedidos en la tabla
const cargarConsultasEnTabla = async () => {
    try {
        const consultas = await obtenerConsultas();
        if (consultas && consultas.length > 0) {
            updateTable(consultas); // Llenar la tabla con los pedidos
        } else {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay pedidos disponibles.</td></tr>';
        }
    } catch (error) {
        console.error("Error al cargar los pedidos:", error);
    }
};

// Función para agregar eventos a los botones de editar y eliminar
function agregarEventosBotones() {
    document.querySelectorAll('.button-edit').forEach(button => {
        button.addEventListener('click', function () {
            const consultaId = this.getAttribute('data-id');
            const consultaEstado = document.querySelector(`.estado[data-id="${consultaId}"]`).textContent;

            document.getElementById('estadoConsulta').value = consultaEstado;
            document.getElementById('editarEstadoForm').dataset.consultaId = consultaId;
        });
    });

    document.querySelectorAll('.button-delete').forEach(button => {
        button.addEventListener('click', async function () {
            const consultaId = this.getAttribute('data-id');
            if (confirm("¿Seguro que deseas eliminar esta consulta?")) {
                try {
                    await deleteConsulta(consultaId);
                    cargarConsultasEnTabla(); // Recargar la tabla después de eliminar
                } catch (error) {
                    console.error("Error al eliminar la consulta:", error);
                }
            }
        });
    });
}

// Evento para actualizar el estado del pedido
document.getElementById('editarEstadoForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const consultaId = this.dataset.consultaId;
    const nuevoEstado = document.getElementById('estadoConsulta').value;

    try {
        await actualizarEstadoConsulta(consultaId, nuevoEstado);
        cargarConsultasEnTabla(); // Recargar la tabla después de actualizar

        // Cerrar modal
        const editModal = document.getElementById("modal");
        editModal.classList.remove("is-active");
    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
    }
});

// Cargar pedidos al iniciar
cargarConsultasEnTabla();

// Cerrar sesión
document.querySelector("#logout").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        console.log('Usuario ha cerrado sesión');
        window.location.replace("../login/login.html");
    } catch (error) {
        console.log('Error al cerrar sesión:', error);
    }
});
