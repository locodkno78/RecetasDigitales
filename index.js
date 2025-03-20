import { obtenerPedidos, actualizarEstadoPedido, deletePedido, auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const tbody = document.getElementById('tbody');

// Función para actualizar la tabla en el DOM
function updateTable(pedidos) {
    const columnNames = [
        "Apellido",
        "Nombre",
        "Domicilio",
        "Teléfono",
        "Obra Social",
        "Receta",
        "Estado del pedido",
        "Acciones"
    ];

    let html = `
        <thead>
            <tr>${columnNames.map(columnName => `<th>${columnName}</th>`).join('')}</tr>
        </thead>
        <tbody>`;

    pedidos.forEach((pedido) => {

        // Acceder a los campos directamente desde 'pedido'
        const apellido = pedido.apellido || 'No disponible';
        const nombre = pedido.nombre || 'No disponible';
        const domicilio = pedido.domicilio || 'No disponible';
        const telefono = pedido.telefono || 'No disponible';
        const obraSocial = pedido.obraSocial || 'No disponible';
        const estado = pedido.estado || 'Sin acción';
        const receta = pedido.receta || 'No disponible';



        html += `
            <tr>
                <td class="apellido table">${apellido}</td>
                <td class="nombre table">${nombre}</td>
                <td class="domicilio table">${domicilio}</td>
                <td class="telefono table">${telefono}</td>
                <td class="obraSocial table">${obraSocial}</td>
                <td class="receta table">${receta}</td>                    
                <td class="estado table" data-id="${pedido.id || ''}">${estado}</td>
                <td class="table">
                    <button type="button" class="btn btn-warning button-edit" data-bs-toggle="modal" data-id="${pedido.id}" data-bs-target="#modal" data-bs-placement="top" title="Estado del Pedido">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button type="button" class="btn btn-danger button-delete" data-id="${pedido.id}" data-bs-toggle="tooltip" data-bs-placement="top" title="Eliminar Pedido">
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
const cargarPedidosEnTabla = async () => {
    try {
        const pedidos = await obtenerPedidos();
        if (pedidos && pedidos.length > 0) {
            updateTable(pedidos); // Llenar la tabla con los pedidos
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
            const pedidoId = this.getAttribute('data-id');
            const pedidoEstado = document.querySelector(`.estado[data-id="${pedidoId}"]`).textContent;

            document.getElementById('estadoPedido').value = pedidoEstado;
            document.getElementById('editarEstadoForm').dataset.pedidoId = pedidoId;
        });
    });

    document.querySelectorAll('.button-delete').forEach(button => {
        button.addEventListener('click', async function () {
            const pedidoId = this.getAttribute('data-id');
            if (confirm("¿Seguro que deseas eliminar este pedido?")) {
                try {
                    await deletePedido(pedidoId);
                    cargarPedidosEnTabla(); // Recargar la tabla después de eliminar
                } catch (error) {
                    console.error("Error al eliminar el pedido:", error);
                }
            }
        });
    });
}

// Evento para actualizar el estado del pedido
document.getElementById('editarEstadoForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const pedidoId = this.dataset.pedidoId;
    const nuevoEstado = document.getElementById('estadoPedido').value;

    try {
        await actualizarEstadoPedido(pedidoId, nuevoEstado);
        cargarPedidosEnTabla(); // Recargar la tabla después de actualizar

        // Cerrar modal
        const editModal = document.getElementById("modal");
        editModal.classList.remove("is-active");
    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
    }
});

// Cargar pedidos al iniciar
cargarPedidosEnTabla();

// Cerrar sesión
document.querySelector("#logout").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        console.log('Usuario ha cerrado sesión');
        window.location.href = "./login/login.html";
    } catch (error) {
        console.log('Error al cerrar sesión:', error);
    }
});
