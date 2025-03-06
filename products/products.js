import {
  saveForm,
  deleteProduct,
  updateProduct,
  getProduct
} from "../firebase.js";

document.addEventListener('DOMContentLoaded', async () => {
  const table = document.getElementById('table');
  const registerForm = document.getElementById('register-form');
  const editForm = document.getElementById('edit-form');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');

  // Cargar los productos al inicio
  await loadProducts();

  // Evento para el registro de un nuevo producto
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const newProduct = Object.fromEntries(formData);
    await saveForm(newProduct.name, newProduct.characteristics, newProduct.quantity, newProduct.size, newProduct.price, newProduct.img, newProduct.img2); // Asegúrate de que img sea una URL
    await loadProducts();
    registerForm.reset();
  });
  
 

  // Cargar productos desde Firestore
  async function loadProducts() {
    const productsSnapshot = await getProduct();
    table.innerHTML = ''; // Limpiar tabla

    // Agregar encabezados a la tabla
    const columnNames = ["Nombre", "Características", "Cantidad", "Talles", "Precio", "Imagen1", "Imagen2", "Acciones"];
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columnNames.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Agregar cuerpo de la tabla
    const tbody = document.createElement('tbody');

    if (productsSnapshot.empty) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = columnNames.length; // Cambiar a la cantidad de columnas
      cell.textContent = 'No hay productos disponibles';
      row.appendChild(cell);
      tbody.appendChild(row);
    } else {
      productsSnapshot.forEach(doc => {
        const product = doc.data();
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.characteristics}</td>
            <td>${product.quantity}</td>
            <td>${product.size}</td>
            <td>${product.price}</td>
            <td><img src="${product.img}" alt="${product.name}" style="width: 100px; height: auto;"></td>
            <td><img src="${product.img2}" alt="${product.name}" style="width: 100px; height: auto;"></td>
            <td>
              <button class="btn btn-info" data-id="${doc.id}" data-bs-toggle="modal" data-bs-target="#viewProduct"><i class="bi bi-eye"></i></button>
              <button class="btn btn-warning" data-id="${doc.id}" data-bs-toggle="modal" data-bs-target="#editCustomer"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-danger" data-id="${doc.id}"><i class="bi bi-trash"></i></button>
            </td>
          `;

        // Evento para ver producto
        row.querySelector('.btn-info').addEventListener('click', () => {
          fillViewProductModal(product);
        });

        // Evento para eliminar producto
        row.querySelector('.btn-danger').addEventListener('click', async (e) => {
          const productId = e.target.getAttribute('data-id');
          await deleteProduct(productId);
          await loadProducts();
        });

        // Evento para editar producto
        row.querySelector('.btn-warning').addEventListener('click', () => {
          fillEditForm(product, doc.id);
        });

        tbody.appendChild(row);
      });
    }
    table.appendChild(tbody);
  }

  // Llenar el formulario de edición
  function fillEditForm(product, id) {
    editForm.name.value = product.name;
    editForm.characteristics.value = product.characteristics;
    editForm.quantity.value = product.quantity;
    editForm.size.value = product.size;
    editForm.price.value = product.price;
    editForm.img.value = product.img;
    editForm.img2.value = product.img2;
    editForm.onsubmit = async (e) => {
      e.preventDefault();
      const updatedData = {
        name: editForm.name.value,
        characteristics: editForm.characteristics.value,
        quantity: editForm.quantity.value,
        size: editForm.size.value,
        price: editForm.price.value,
        img: editForm.img.value,
        img2: editForm.img2.value
      };
      await updateProduct(id, updatedData);
      await loadProducts();
    };
  }

  // Llenar el modal de vista de producto
  function fillViewProductModal(product) {
    document.getElementById('view-name').textContent = product.name;
    document.getElementById('view-characteristics').textContent = product.characteristics;
    document.getElementById('view-quantity').textContent = product.quantity;
    document.getElementById('view-size').textContent = product.size;
    document.getElementById('view-price').textContent = product.price;
  }

  // Evento de búsqueda
  searchButton.addEventListener('click', async () => {
    const searchValue = searchInput.value.toLowerCase();
    const productsSnapshot = await getProduct();
    table.innerHTML = ''; // Limpiar tabla   

    table.appendChild(tbody);
  });
});

