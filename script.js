const api = "http://localhost:5000/products";
const productForm = document.getElementById("productForm");
const tableBody = document.getElementById("productTableBody");

async function loadProducts() {
  const category = document.getElementById("categoryFilter").value;
  const inStock = document.getElementById("stockFilter").value;

  const query = new URLSearchParams();
  if (category) query.append("category", category.trim());
  if (inStock) query.append("inStock", inStock);

  try {
    const res = await axios.get(`${api}?${query}`);
    const products = res.data;

    tableBody.innerHTML = products.map(p => `
      <tr>
        <td>${p.title}</td>
        <td>₹${p.price}</td>
        <td>${p.stock}</td>
        <td>${p.category || "-"}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick='editProduct(${JSON.stringify(p)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteProduct("${p._id}")'>Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error("Failed to load products", error);
  }
}

async function deleteProduct(id) {
  if (confirm("Delete this product?")) {
    try {
      await axios.delete(`${api}/${id}`);
      loadProducts();
    } catch (err) {
      console.error("Delete failed", err);
    }
  }
}

function editProduct(p) {
  document.getElementById("productId").value = p._id;
  document.getElementById("title").value = p.title;
  document.getElementById("price").value = p.price;
  document.getElementById("stock").value = p.stock;
  document.getElementById("category").value = p.category || '';
}

productForm.onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById("productId").value;
  const data = {
    title: document.getElementById("title").value.trim(),
    price: Number(document.getElementById("price").value),
    stock: Number(document.getElementById("stock").value),
    category: document.getElementById("category").value.trim()
  };

  try {
    if (id) {
      await axios.put(`${api}/${id}`, data);
    } else {
      await axios.post(api, data);
    }

    productForm.reset();
    loadProducts();
  } catch (err) {
    console.error("Submit failed", err);
  }
};

window.onload = loadProducts;