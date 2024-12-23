const API_BASE_URL = 'https://api.mercadolibre.com/sites/MLA/search';

// Función para obtener los productos de cada categoría
async function fetchProducts(query) {
  try {
    const response = await fetch(`${API_BASE_URL}?q=${query}&limit=48`);
    const data = await response.json();
    const products = data.results.map(product => {
        const image = product.thumbnail.replace('-I.jpg', '-O.jpg');
        return {
            title: product.title,
            price: product.price,
            imagen: image
        };
    });
    return products;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Listas para almacenar productos de diferentes categorías
let amigurumisList = [];

// Llamar a la API para cada categoría
async function loadData() {
  amigurumisList = await fetchProducts('amigurumis');
}

// Ejecutar la carga de datos
loadData();

const contenedor = document.getElementById("productos");

function displayProducts(products) {
    products.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("card-group");
        card.classList.add("mt-5");
        const precio = product.price.toLocaleString('es-AR');
        card.innerHTML = `
            <div class="card text-center m-4 border-0" style="width: 18rem;">
                <img src="${product.imagen}" class="card-img-top" alt="${product.title}" width: 15rem height= 250rem>
                <div class="card-body d-flex align-items-center flex-column justify-content-center">
                    <h5 class="card-title">${product.title}</h5>
                    <h5 class="card-text">$${precio}</h5>
                </div>
                <div class="card-footer border-0 bg-white mb-3">
                    <a href="#" class="btn boton">Añadir al carrito</a>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
  }
  
  // Mostrar productos de cada lista en la página
  loadData().then(() => {
    displayProducts(amigurumisList);
  });
  