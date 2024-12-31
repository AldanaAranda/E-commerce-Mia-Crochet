const API_BASE_URL = 'https://api.mercadolibre.com/sites/MLA/search';
const API_ITEM_URL = 'https://api.mercadolibre.com/items';

async function fetchProducts(query) {
  try {
    const response = await fetch(`${API_BASE_URL}?q=${query}&limit=24`);
    const data = await response.json();
    const products = data.results.map(product => {
      const image = product.thumbnail.replace('-I.jpg', '-O.jpg');
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        imagen: image,
        cantidad: 1
      };
    });
    return products;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

let amigurumisList = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

async function loadData() {
  amigurumisList = await fetchProducts('amigurumis');
}

function mostrarListaProductos(products) {
  console.log("Lista de productos disponibles:");
  products.forEach(product => {
    console.log(`ID: ${product.id}, Nombre: ${product.title}, Precio: $${product.price.toLocaleString('es-AR')}`);
  });
}

loadData().then(() => {
  displayProducts(amigurumisList);
  mostrarCarrito();
  mostrarListaProductos(amigurumisList);
});

const contenedor = document.getElementById("productos");

function displayProducts(products) {
  products.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("card-group", "mt-5"); 
    const precio = product.price.toLocaleString('es-AR');
    card.innerHTML = `
      <div class="card text-center m-4 border-0" style="width: 18rem; data-aos="zoom-in"">
        <img src="${product.imagen}" class="card-img-top rounded-top-5" alt="${product.title}" width="18rem" height="250rem">
        <div class="card-body d-flex align-items-center flex-column justify-content-center">
          <h5 class="card-title">${product.title}</h5>
          <h4 class="card-text">$${precio}</h4>
        </div>
        <div class="card-footer border-0 bg-white mb-3 pt-0">
          <button class="btn boton" onclick='agregarAlCarrito(${JSON.stringify(product)})'>Añadir al carrito</button>
          <button class="btn ver-mas boton" data-id="${product.id}">Ver más</button>
        </div>
      </div>
    `;
    contenedor.appendChild(card);
  });
}

window.onload = function () {
  carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  actualizarContadorCarrito();
  mostrarTotalCarrito();
  mostrarCarrito();
};

function actualizarContadorCarrito() {
  const cartCountElement = document.getElementById('cart-count');
  const totalItems = carrito.reduce((total, producto) => total + producto.cantidad, 0);
  cartCountElement.textContent = totalItems;
  localStorage.setItem('cartCount', totalItems);
}

function calcularTotalCarrito() {
  return carrito.reduce((total, producto) => total + (producto.price * producto.cantidad), 0);
}

function mostrarTotalCarrito() {
  const total = calcularTotalCarrito();
  const totalElement = document.getElementsByClassName('total-carrito')[0];
  totalElement.textContent = `Total: $${total.toLocaleString('es-AR')}`;
  localStorage.setItem('cartTotal', total);
}

function agregarAlCarrito(producto) {
  const index = carrito.findIndex(e => e.id === producto.id);
  if (index === -1) {
    carrito.push(producto);
  } else {
    carrito[index].cantidad += 1;
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  Swal.fire({
    title: "¡Producto guardado!",
    icon: "success"
  });
  mostrarCarrito();
  actualizarContadorCarrito();
  mostrarTotalCarrito();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(producto => producto.id !== id);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  Swal.fire({
    title: "Producto eliminado correctamente.",
    icon: "success"
  });
  mostrarCarrito();
  actualizarContadorCarrito();
  mostrarTotalCarrito();
}

function ajustarCantidad(id, incremento) {
  const index = carrito.findIndex(producto => producto.id === id);
  if (index !== -1) {
    carrito[index].cantidad += incremento;
    if (carrito[index].cantidad <= 0) {
      eliminarDelCarrito(id);
    } else {
      localStorage.setItem('carrito', JSON.stringify(carrito));
      mostrarCarrito();
      actualizarContadorCarrito();
      mostrarTotalCarrito();
    }
  }
}

function mostrarCarrito() {
  const contenedorCarrito = document.querySelector("#lista-productos");
  contenedorCarrito.innerHTML = "";
  carrito.forEach(producto => {
    const item = document.createElement("li");
    item.classList.add("list-group-item", "d-flex", "align-items-start", "mb-5");
    const precio = (producto.price * producto.cantidad).toLocaleString('es-AR');
    item.innerHTML = `
      <img src="${producto.imagen}" alt="Imagen producto" class="producto-imagen me-3" width="30rem">
      <div>
        <h6>${producto.title}</h6>
        <div class="d-flex align-items-center">
          <p class="m-0">$${precio} (${producto.cantidad} unidades)</p>
          <button class="btn btn-light btn-sm ms-3" onclick="ajustarCantidad('${producto.id}', -1)"><i class="fa-solid fa-minus"></i></button>
          <button class="btn btn-light btn-sm ms-2" onclick="ajustarCantidad('${producto.id}', 1)"><i class="fa-solid fa-plus"></i></button>
        </div>
        <button class="btn boton btn-sm mt-2" style="margin: 0 auto;" onclick="eliminarDelCarrito('${producto.id}')">
          Eliminar
        </button>
      </div>
    `;
    contenedorCarrito.appendChild(item);
  });
}

async function fetchDescription(id) {
  try {
    const response = await fetch(`${API_ITEM_URL}/${id}/description`);
    const data = await response.json();
    return data.plain_text || " ";
  } catch (error) {
    console.error('Error fetching description:', error);
    return "Descripción no disponible.";
  }
}

function mostrarModal(product) {
  const modal = document.createElement("div");
  modal.classList.add("modal", "fade");
  modal.setAttribute("tabindex", "-1");
  modal.setAttribute("role", "dialog");
  modal.innerHTML =
    `<div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content text-center">
        <div class="modal-header">
          <h3 class="modal-title fs-5"><strong>${product.title}</strong></h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-0">
          <div class="text-center mt-3 px-5">
            <p>${product.descripcion}</p>
          </div>
          <h4 class="my-3">Precio: <strong>$${product.price.toLocaleString('es-AR')}</strong></h4>
        </div>
        <div class="modal-footer d-flex justify-content-center">
          <button class="btn btn-brand boton" onclick='agregarAlCarrito(${JSON.stringify(product)})'>
            Agregar al carrito
          </button>
        </div>
      </div>
  </div>`;
  document.body.appendChild(modal);
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
  modal.addEventListener("hidden.bs.modal", () => {
    modal.remove();
  });
}

function verificarFormulario() {
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const mensaje = document.getElementById('mensaje').value;

  if (nombre === "" || email === "" || mensaje === "") {
    console.log("No están completos los campos.");
  } else {
    console.log("Todos los campos están completos.");
  }
}

contenedor.addEventListener("click", async (e) => {
  if (e.target.classList.contains("ver-mas")) {
    const id = e.target.getAttribute("data-id");
    const product = amigurumisList.find(p => p.id === id);
    product.descripcion = await fetchDescription(id);
    mostrarModal(product);
  }
});

document.getElementById('formulario').addEventListener('submit', function (event) {
  event.preventDefault();
  verificarFormulario();
});