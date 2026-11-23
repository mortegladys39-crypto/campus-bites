import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// =====================================
// FIREBASE CONFIGURATION
// =====================================

const firebaseConfig = {
  apiKey: "AIzaSyDXK31-88ftLzLDPFUBCKWLAeD4zIpcIxQ",
  authDomain: "campus--bites.firebaseapp.com",
  databaseURL: "https://campus--bites-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "campus--bites",
  storageBucket: "campus--bites.firebasestorage.app",
  messagingSenderId: "699180723559",
  appId: "1:699180723559:web:fe5db0dc8e127fbf9353c2",
  measurementId: "G-WEPGSVYD9V"
};

// AUTHORIZED ADMIN UID
const ADMIN_UID = "RerNqFRiO8T3mya9l1i7qlYD3Fc2";

// INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

console.log("Firebase initialized successfully.");

let stopOrdersListener = null;
let ordersData = {};

// =====================================
// HTML ELEMENTS
// =====================================

const $ = id => document.getElementById(id);

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function loginMessage(message, color = "red") {
  $("loginMessage").textContent = message;
  $("loginMessage").style.color = color;
}

// =====================================
// PRODUCTS
// =====================================

const defaultProducts = [
  {id:1,name:"Cheeseburger",desc:"Beef patty, cheese",price:75,cat:"Foods",file:"1-cheeseburger.jpg"},
  {id:2,name:"Chicken Burger",desc:"Crispy chicken",price:63,cat:"Foods",file:"2-chicken-burger.jpg"},
  {id:3,name:"Pizza Slice",desc:"Cheesy slice",price:70,cat:"Foods",file:"3-pizza.jpg"},
  {id:4,name:"Fried Chicken",desc:"Crispy, juicy",price:80,cat:"Foods",file:"4-fried-chicken.jpg"},
  {id:5,name:"Chicken Rice",desc:"Much rice",price:85,cat:"Foods",file:"5-chicken-rice.jpg"},
  {id:6,name:"Pork Adobo",desc:"Filipino style",price:75,cat:"Foods",file:"6-adobo.jpg"},
  {id:7,name:"Pancit Canton",desc:"Savory noodles",price:56,cat:"Foods",file:"7-pancit.jpg"},
  {id:8,name:"Hotdog Sandwich",desc:"Hotdog w/ sauce",price:42,cat:"Foods",file:"8-hotdog.jpg"},
  {id:9,name:"Siomai Rice",desc:"Siomai + rice",price:58,cat:"Foods",file:"9-siomai.jpg"},
  {id:10,name:"French Fries",desc:"Golden crispy",price:35,cat:"Snacks",file:"10-fries.jpg"},
  {id:11,name:"Chicken Nuggets",desc:"Crunchy bites",price:60,cat:"Snacks",file:"11-nuggets.jpg"},
  {id:12,name:"Nachos",desc:"Chips cheese",price:50,cat:"Snacks",file:"12-nachos.jpg"},
  {id:13,name:"Banana Cue",desc:"Sweet banana",price:20,cat:"Snacks",file:"13-banana-cue.jpg"},
  {id:14,name:"Turon",desc:"Banana roll",price:20,cat:"Snacks",file:"14-turon.jpg"},
  {id:15,name:"Cookies",desc:"Sweet cookies",price:25,cat:"Snacks",file:"15-cookies.jpg"},
  {id:16,name:"Coca-Cola",desc:"Cold soft drink",price:20,cat:"Drinks",file:"16-coca-cola.jpg"},
  {id:17,name:"Sprite",desc:"Lemon soda",price:20,cat:"Drinks",file:"17-sprite.jpg"},
  {id:18,name:"Royal",desc:"Orange soda",price:20,cat:"Drinks",file:"18-royal.jpg"},
  {id:19,name:"Iced Tea",desc:"Chilled tea",price:25,cat:"Drinks",file:"19-iced-tea.jpg"},
  {id:20,name:"Milk Tea",desc:"With pearls",price:35,cat:"Drinks",file:"20-milk-tea.jpg"},
  {id:21,name:"Water",desc:"Water",price:15,cat:"Drinks",file:"21-water.jpg"},
  {id:22,name:"Orange Juice",desc:"Fresh juice",price:25,cat:"Drinks",file:"22-orange-juice.jpg"},
  {id:23,name:"Coffee",desc:"Hot coffee",price:25,cat:"Drinks",file:"23-coffee.jpg"}
];

// =====================================
// PRODUCT PICTURE MANAGER
// =====================================

function showProductManager() {
  const container = $("productManager");

  container.innerHTML = defaultProducts.map(product => `
    <div class="prod-item">
      <div style="text-align:center">
        <div style="width:70px;height:70px;background:#f3f4f6;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #ddd">
          <img
            src="images/${encodeURIComponent(product.file)}"
            alt="${escapeHTML(product.name)}"
            style="width:100%;height:100%;object-fit:cover"
            onerror="this.style.display='none';this.nextElementSibling.style.display='block'"
          >
          <div style="display:none;font-size:10px;color:#999;text-align:center">
            No Picture
          </div>
        </div>
      </div>

      <div style="flex:1">
        <div style="font-weight:800;font-size:12px">
          ${product.id}. ${escapeHTML(product.name)} - ₱${product.price}
        </div>

        <div style="font-size:10px;color:#777">
          File: images/${escapeHTML(product.file)}
        </div>

        <div style="font-size:10px;color:#0f2e1f;margin-top:5px">
          Category: ${escapeHTML(product.cat)}
        </div>
      </div>
    </div>
  `).join("");
}

$("showNamesBtn").addEventListener("click", () => {
  const names = defaultProducts.map(product =>
    product.file + " - " + product.name
  ).join("\n");

  alert("IMAGE FILE NAMES:\n\n" + names);
});

$("refreshBtn").addEventListener("click", () => {
  showProductManager();
  renderOrders();
});

// =====================================
// ORDER MANAGEMENT
// =====================================

function renderOrders() {
  const container = $("adminOrders");
  const entries = Object.entries(ordersData);

  if (!entries.length) {
    container.innerHTML = `
      <div style="color:#777;text-align:center;padding:20px">
        No orders yet. Customer orders will appear here.
      </div>
    `;
    return;
  }

  entries.sort((a, b) =>
    (b[1].createdAt || 0) - (a[1].createdAt || 0)
  );

  container.innerHTML = entries.map(([id, order]) => {
    const status = order.status || "Pending";

    const statusColor = {
      Pending: "#FEF3C7",
      Preparing: "#DBEAFE",
      Ready: "#D1FAE5",
      Completed: "#E5E7EB",
      Cancelled: "#FEE2E2"
    }[status] || "#E5E7EB";

    const items = Array.isArray(order.items)
      ? order.items.map(item =>
          `${escapeHTML(item.name)} × ${Number(item.qty) || 0}`
        ).join(", ")
      : "No item details";

    const payment = order.payment === "GCash"
      ? `
        <br>Reference: ${escapeHTML(order.ref)}
        <br>Customer GCash No.: ${escapeHTML(order.num)}
      `
      : "";

    return `
      <div class="order ${escapeHTML(status.toLowerCase())}">
        <b>Order #${escapeHTML(id.slice(-7))}</b>

        <span style="float:right;font-weight:900">
          ₱${Number(order.total || 0).toFixed(2)}
        </span>

        <div style="font-size:12px;margin-top:6px">
          Customer: <b>${escapeHTML(order.name)}</b>
        </div>

        <div style="font-size:11px;color:#777;margin-top:4px">
          ${escapeHTML(order.time || "")}
        </div>

        <div style="font-size:12px;margin:8px 0">
          ${items}
        </div>

        <div style="font-size:11px;background:${order.payment === "GCash" ? "#DBEAFE" : "#FEF3C7"};padding:8px;border-radius:8px">
          Payment: <b>${escapeHTML(order.payment)}</b>
          ${payment}
        </div>

        <div style="margin-top:8px">
          <span style="background:${statusColor};padding:5px 10px;border-radius:8px;font-size:11px;font-weight:900">
            ${escapeHTML(status)}
          </span>
        </div>

        <div style="margin-top:8px;display:flex;gap:5px;flex-wrap:wrap">

          <button class="btn" data-status="Pending" data-id="${escapeHTML(id)}"
            style="background:#ddd;font-size:11px">
            Pending
          </button>

          <button class="btn" data-status="Preparing" data-id="${escapeHTML(id)}"
            style="background:#3b82f6;color:white;font-size:11px">
            Accept - Preparing
          </button>

          <button class="btn" data-status="Ready" data-id="${escapeHTML(id)}"
            style="background:#16a34a;color:white;font-size:11px">
            Ready
          </button>

          <button class="btn" data-status="Completed" data-id="${escapeHTML(id)}"
            style="background:#6b7280;color:white;font-size:11px">
            Completed
          </button>

          <button class="btn" data-delete="${escapeHTML(id)}"
            style="background:red;color:white;font-size:11px">
            Delete
          </button>

        </div>
      </div>
    `;
  }).join("");
}

// =====================================
// CHANGE ORDER STATUS / DELETE ORDER
// =====================================

$("adminOrders").addEventListener("click", async event => {
  const statusButton = event.target.closest("[data-status]");
  const deleteButton = event.target.closest("[data-delete]");

  if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) {
    alert("Unauthorized access.");
    return;
  }

  if (statusButton) {
    const id = statusButton.dataset.id;
    const status = statusButton.dataset.status;

    try {
      await update(ref(db, "orders/" + id), {
        status: status,
        updatedAt: Date.now()
      });

    } catch (error) {
      console.error("UPDATE ORDER ERROR:", error);
      alert("Could not update order: " + error.code);
    }
  }

  if (deleteButton) {
    const id = deleteButton.dataset.delete;

    if (!confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      await remove(ref(db, "orders/" + id));

    } catch (error) {
      console.error("DELETE ORDER ERROR:", error);
      alert("Could not delete order: " + error.code);
    }
  }
});

// =====================================
// REAL-TIME FIREBASE ORDERS
// =====================================

function startOrdersListener() {
  if (stopOrdersListener) {
    stopOrdersListener();
  }

  const ordersRef = ref(db, "orders");

  stopOrdersListener = onValue(
    ordersRef,

    snapshot => {
      ordersData = snapshot.exists() ? snapshot.val() : {};
      renderOrders();
      console.log("Orders loaded successfully.");
    },

    error => {
      console.error("ORDERS FIREBASE ERROR:", error);

      $("adminOrders").textContent =
        "Unable to load orders: " + error.code;
    }
  );
}

// =====================================
// ADMIN LOGIN
// =====================================

$("loginBtn").addEventListener("click", async () => {
  const email = $("adminEmail").value.trim();
  const password = $("adminPassword").value;
  const button = $("loginBtn");

  if (!email || !password) {
    loginMessage("Please enter your email and password.");
    return;
  }

  button.disabled = true;
  button.textContent = "LOGGING IN...";
  loginMessage("");

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (result.user.uid !== ADMIN_UID) {
      await signOut(auth);
      loginMessage("This account is not authorized as admin.");
      return;
    }

    loginMessage("Login successful!", "#0f2e1f");
    console.log("Admin login successful.");

  } catch (error) {
    console.error("FIREBASE LOGIN ERROR:", error);

    loginMessage("Login failed: " + error.code);

  } finally {
    button.disabled = false;
    button.textContent = "🔓 LOGIN";
  }
});

// LOGIN USING ENTER KEY
$("adminPassword").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    $("loginBtn").click();
  }
});

// =====================================
// AUTHORIZATION CHECK
// =====================================

onAuthStateChanged(auth, async user => {

  if (!user) {
    if (stopOrdersListener) {
      stopOrdersListener();
      stopOrdersListener = null;
    }

    ordersData = {};

    $("adminPanel").style.display = "none";
    $("loginSection").style.display = "block";

    return;
  }

  // ONLY AUTHORIZED ADMIN
  if (user.uid !== ADMIN_UID) {
    await signOut(auth);
    loginMessage("Unauthorized account.");
    return;
  }

  $("loginSection").style.display = "none";
  $("adminPanel").style.display = "block";

  showProductManager();
  startOrdersListener();

  console.log("Authorized admin detected.");
});

// =====================================
// LOGOUT
// =====================================

$("logoutBtn").addEventListener("click", async () => {
  try {
    if (stopOrdersListener) {
      stopOrdersListener();
      stopOrdersListener = null;
    }

    await signOut(auth);

    $("adminPassword").value = "";

    loginMessage("You have logged out.", "#0f2e1f");

  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    alert("Logout failed: " + error.code);
  }
});

// =====================================
// ADMIN QR CODE
// =====================================

const websiteLink = location.href
  .split("?")[0]
  .replace(/admin\.html$/, "index.html");

$("adminQrLink").textContent = websiteLink;

$("adminQR").src =
  "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" +
  encodeURIComponent(websiteLink);

console.log("ADMIN JS FINISHED LOADING.");
  
