const API_URL = "/api";

const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");

const productsTbody = document.getElementById("products-tbody");
const productModal = document.getElementById("product-modal");
const productForm = document.getElementById("product-form");
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const categorySelect = document.getElementById("prod-category");

let allProducts = [];
let allCategories = [];

// Init
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    showDashboard();
    fetchCategories();
    fetchProducts();
  } else {
    showLogin();
  }
});

// Auth
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("adminToken", data.token);
      showDashboard();
      fetchCategories();
      fetchProducts();
    } else {
      loginError.classList.remove("hidden");
    }
  } catch (err) {
    loginError.classList.remove("hidden");
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  showLogin();
});

function showLogin() {
  loginSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
}

function showDashboard() {
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
}

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

// Data Fetching
async function fetchCategories() {
  const res = await fetch(`${API_URL}/categories`);
  allCategories = await res.json();
  categorySelect.innerHTML = allCategories
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");
}

async function fetchProducts() {
  const res = await fetch(`${API_URL}/products`);
  allProducts = await res.json();
  renderProducts();
}

function renderProducts() {
  productsTbody.innerHTML = allProducts
    .map(
      (p) => `
    <tr class="hover:bg-gray-50 transition-colors group">
      <td class="px-6 py-4 flex items-center gap-4">
        <img src="${p.image}" class="w-12 h-12 rounded object-cover">
        <span class="font-bold text-gray-900">${p.title}</span>
      </td>
      <td class="px-6 py-4">$${p.price.toFixed(2)}</td>
      <td class="px-6 py-4"><span class="px-2 py-1 bg-gray-100 rounded text-sm">${p.category}</span></td>
      <td class="px-6 py-4">
        ${p.isFeatured ? '<span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold">Featured</span>' : ""}
      </td>
      <td class="px-6 py-4 text-right space-x-2">
        <button onclick="editProduct('${p.id}')" class="text-blue-600 hover:underline text-sm font-bold">Edit</button>
        <button onclick="deleteProduct('${p.id}')" class="text-red-600 hover:underline text-sm font-bold">Delete</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

// Modal Logic
openModalBtn.addEventListener("click", () => {
  productForm.reset();
  document.getElementById("prod-id").value = "";
  document.getElementById("modal-title").innerText = "Add Product";
  productModal.classList.remove("hidden");
});

const closeModal = () => productModal.classList.add("hidden");
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

window.editProduct = (id) => {
  const p = allProducts.find((x) => x.id === id);
  if (!p) return;

  document.getElementById("modal-title").innerText = "Edit Product";
  document.getElementById("prod-id").value = p.id;
  document.getElementById("prod-title").value = p.title;
  document.getElementById("prod-price").value = p.price;
  document.getElementById("prod-image").value = p.image;
  document.getElementById("prod-affiliate").value = p.affiliateLink || "";
  document.getElementById("prod-desc").value = p.description || "";
  document.getElementById("prod-featured").checked = p.isFeatured;

  // find Category id
  const cat = allCategories.find((c) => c.name === p.category);
  if (cat) categorySelect.value = cat.id;

  productModal.classList.remove("hidden");
};

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("prod-id").value;
  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;

  const payload = {
    title: document.getElementById("prod-title").value,
    price: document.getElementById("prod-price").value,
    categoryId: document.getElementById("prod-category").value,
    image: document.getElementById("prod-image").value,
    affiliateLink: document.getElementById("prod-affiliate").value,
    description: document.getElementById("prod-desc").value,
    isFeatured: document.getElementById("prod-featured").checked,
  };

  await fetch(url, {
    method,
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  closeModal();
  fetchProducts();
});

window.deleteProduct = async (id) => {
  if (confirm("Delete this product?")) {
    await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    fetchProducts();
  }
};
