import { obtenerPedidos, actualizarEstadoPedido, deletePedido, auth } from "./firebase.js";
import {signOut} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const tbody = document.getElementById('tbody');

function updateTable(querySnapshot) {
    const columnNames = [
        "Apellido",
        "Nombre",
        "Domicilio",
        "Teléfono",
        "Email",        
        "Estado del pedido",
        "Acciones"
    ];

    let html = `
        <thead>
            <tr>${columnNames.map(columnName => `<th>${columnName}</th>`).join('')}</tr>
        </thead>
        <tbody>`;

    if (querySnapshot) {
        querySnapshot.forEach((doc) => {
            const pedido = doc.data();
            

            // Convertir el objeto de productos a una cadena legible
            const productosString = pedido.productos.map(producto => `PRODUCTO: ${producto.nombre} <br> CANTIDAD: ${producto.cantidad}<br> TALLE: ${producto.talle} <br> PRECIO: $${producto.precio} <br> SUBTOTAL: $${producto.subtotal}<br>`).join('<br>');

            html += `
                <tr>
                    <td class="apellido table-primary">${pedido.usuario.apellido || ''}</td>
                    <td class="nombre table-primary">${pedido.usuario.nombre || ''}</td>
                    <td class="domicilio table-primary">${pedido.usuario.domicilio || ''}</td>
                    <td class="telefono table-primary">${pedido.usuario.telefono || ''}</td>
                    <td class="email table-primary">${pedido.usuario.email || ''}</td>
                    <td class="total table-primary">$${pedido.total || ''}</td>                    
                    <td class="estado table-primary" data-id="${doc.id}">${pedido.usuario.estado || ''}</td>
                    <td class="table-primary">
                        <button type="button" class="btn btn-warning button-edit" data-bs-toggle="modal" data-id="${doc.id}" data-bs-target="#modal" data-bs-placement="top" title="Estado del Pedido">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button type="button" class="btn btn-danger button-delete" data-bs-toggle="modal" data-id=${doc.id} data-bs-toggle="tooltip" data-bs-placement="top" title="Eliminar Pedido">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
                <tr>
                    <td class="pedido table-light" colspan="${columnNames.length + 1}">
                        ${productosString || ''}
                    </td>
                </tr>`;
        });
    }

    html += `</tbody>`;

    return html;
}

// Función para cargar los pedidos en la tabla
const cargarPedidosEnTabla = async () => {
    try {
        // Obtener los pedidos desde Firestore
        const querySnapshot = await obtenerPedidos();

        // Limpiar el contenido actual de la tabla
        tbody.innerHTML = '';

        // Agregar los datos a la tabla
        tbody.innerHTML = updateTable(querySnapshot);       
        
        // Agregar manejador de eventos para cada botón button-delete
        const botonesEliminar = document.querySelectorAll('.button-delete');
        botonesEliminar.forEach((boton) => {
            boton.addEventListener('click', async (e) => {
                const pedidoId = e.currentTarget.getAttribute('data-id');
                console.log("Pedido ID a eliminar:", pedidoId);

                // Llamar a la función deleteProducto que ya está definida
                await deletePedido(pedidoId);

                // Volver a cargar la tabla después de eliminar el producto
                cargarPedidosEnTabla();
            });
        });

    } catch (error) {
        console.error('Error al cargar los pedidos:', error);
    }

    document.querySelectorAll('.button-edit').forEach(button => {
        button.addEventListener('click', function () {
            const pedidoId = this.getAttribute('data-id');
            const pedidoEstado = document.querySelector(`.estado[data-id="${pedidoId}"]`).textContent;
    
            document.getElementById('estadoPedido').value = pedidoEstado;
    
            // Almacena el pedidoId en un atributo del formulario
            editarEstadoForm.dataset.pedidoId = pedidoId;
        });
    });
    
    // En el evento submit, obtén el pedidoId almacenado en el formulario
    const editarEstadoForm = document.getElementById('editarEstadoForm');
    editarEstadoForm.addEventListener('submit', async function (event) {
        event.preventDefault();
    
        const pedidoId = this.dataset.pedidoId;
        const nuevoEstado = document.getElementById('estadoPedido').value;
    
        try {
            await actualizarEstadoPedido(pedidoId, nuevoEstado);
            cargarPedidosEnTabla();
    
            const editModal = document.getElementById("modal");
            editModal.classList.remove("is-active");
        } catch (error) {
            console.error('Error al actualizar el estado del pedido:', error);
        }
    });
    
    
        
   
    
};
// Llamar a la función para cargar los pedidos al cargar la página
cargarPedidosEnTabla();

const logout = document.querySelector("#logout");

logout.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    // Cerrar sesión con Firebase
    await signOut(auth);
    console.log('Usuario ha cerrado sesión');
    
    // Redirigir al login
    window.location.href = "./login/login.html";
  } catch (error) {
    console.log('Error al cerrar sesión:', error);
  }
});
