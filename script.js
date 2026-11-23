import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// FIREBASE CONFIGURATION
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// PRODUCTS - LATEST PRICES
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

let cart = {};
let currentCategory = "All";
let paymentMethod = "Cash";
let currentUser = null;
let orderListenersStarted = false;
let myOrders = {};

const money = amount => Number(amount).toFixed(2);

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  })[char]);
}

function message(text, color = "#0f2e1f") {
  const el = document.getElementById("orderMessage");
  if (el) {
    el.textContent = text;
    el.style.color = color;
  }
}

// PRODUCT DISPLAY
function showProducts() {
  const container = document.getElementById("products");
  if (!container) return;

  const visible = defaultProducts.filter(product =>
    currentCategory === "All" || product.cat === currentCategory
  );

  container.innerHTML = visible.map(product => `
    <div class="product" data-add="${product.id}">
      <div class="visual">
        <span class="price">₱${product.price}</span>
        <img
          src="images/${encodeURIComponent(product.file)}"
          alt="${escapeHTML(product.name)}"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        >
        <div class="no-pic" style="display:none">
          🍽️<br>${escapeHTML(product.name)}<br>
          <small>Image not found</small>
        </div>
      </div>
      <div class="p-info">
        <b>${escapeHTML(product.name)}</b>
        <div style="font-size:11px;color:#777;margin:4px 0">
          ${escapeHTML(product.desc)}
        </div>
        <div style="font-weight:900;color:#0f2e1f">
          ₱${product.price}
        </div>
        <div style="font-size:10px;color:#16a34a;font-weight:800;margin-top:5px">
          TAP TO ADD +
        </div>
      </div>
    </div>
  `).join("");
}

document.querySelectorAll(".cat").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".cat").forEach(item =>
      item.classList.remove("active")
    );
    button.classList.add("active");
    currentCategory = button.dataset.cat;
    showProducts();
  });
});

document.getElementById("products").addEventListener("click", event => {
  const card = event.target.closest("[data-add]");
  if (!card) return;

  const id = Number(card.dataset.add);
  cart[id] = (cart[id] || 0) + 1;
  showCart();
});

// CART
function showCart() {
  const container = document.getElementById("cartList");
  let total = 0;
  let count = 0;

  const items = defaultProducts.filter(product => cart[product.id]);

  if (!items.length) {
    container.innerHTML = "No items";
  } else {
    container.innerHTML = items.map(product => {
      const qty = cart[product.id];
      const subtotal = qty * product.price;
      total += subtotal;
      count += qty;

      return `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:1px solid #eee;padding:8px 0">
          <div style="flex:1">
            <b>${escapeHTML(product.name)}</b>
            <div style="font-size:11px;color:#777">
              ₱${product.price} × ${qty} = ₱${subtotal}
            </div>
          </div>
          <div style="display:flex;gap:5px;align-items:center">
            <button class="btn" data-change="${product.id}:-1">−</button>
            <b>${qty}</b>
            <button class="btn" data-change="${product.id}:1">+</button>
          </div>
        </div>
      `;
    }).join("");
  }

  document.getElementById("tot").textContent = money(total);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("count").textContent =
    count + (count === 1 ? " item" : " items");
}

document.getElementById("cartList").addEventListener("click", event => {
  const button = event.target.closest("[data-change]");
  if (!button) return;

  const [idText, amountText] = button.dataset.change.split(":");
  const id = Number(idText);
  cart[id] = (cart[id] || 0) + Number(amountText);

  if (cart[id] <= 0) delete cart[id];

  showCart();
});

// PAYMENT METHOD
document.querySelectorAll(".pay").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".pay").forEach(item =>
      item.classList.remove("active", "gcash-active")
    );

    paymentMethod = button.dataset.pay;

    if (paymentMethod === "GCash") {
      button.classList.add("gcash-active");
      document.getElementById("gcashBox").classList.add("show");
    } else {
      button.classList.add("active");
      document.getElementById("gcashBox").classList.remove("show");
    }
  });
});

// CUSTOMER'S OWN ORDERS
function getSavedOrderIds() {
  if (!currentUser) return [];

  try {
    return JSON.parse(
      localStorage.getItem("cbOrderIds_" + currentUser.uid) || "[]"
    );
  } catch {
    return [];
  }
}

function saveOrderId(id) {
  const ids = getSavedOrderIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(
      "cbOrderIds_" + currentUser.uid,
      JSON.stringify(ids)
    );
  }
}

function showMyOrders() {
  const container = document.getElementById("publicOrders");
  if (!container) return;

  const entries = Object.entries(myOrders);

  if (!entries.length) {
    container.innerHTML = `
      <div style="color:#777;text-align:center;padding:12px">
        You have no orders yet.
      </div>
    `;
    return;
  }

  container.innerHTML = entries
    .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0))
    .map(([id, order]) => {
      const status = order.status || "Pending";
      const safeStatus = escapeHTML(status);

      return `
        <div class="order ${status.toLowerCase()}">
          <b>Order #${escapeHTML(id.slice(-7))}</b>
          <span style="float:right;font-weight:900">₱${money(order.total)}</span>
          <div style="font-size:12px;margin-top:5px">
            ${escapeHTML(order.time || "")}
          </div>
          <div style="font-size:12px;margin-top:5px">
            ${Array.isArray(order.items) ? order.items.map(item =>
              `${escapeHTML(item.name)} × ${Number(item.qty)}`
            ).join(", ") : ""}
          </div>
          <div style="margin-top:8px;font-weight:900">
            Status: ${safeStatus}
          </div>
        </div>
      `;
    }).join("");
}

function listenToMyOrders() {
  if (!currentUser || orderListenersStarted) return;
  orderListenersStarted = true;

  const ids = getSavedOrderIds();

  if (!ids.length) {
    showMyOrders();
    return;
  }

  ids.forEach(id => {
    onValue(ref(db, "orders/" + id), snapshot => {
      if (snapshot.exists()) {
        myOrders[id] = snapshot.val();
      } else {
        delete myOrders[id];
      }
      showMyOrders();
    }, error => {
      console.error("Order read error:", error);
    });
  });

  showMyOrders();
}

// PLACE ORDER
document.getElementById("placeBtn").addEventListener("click", async () => {
  const button = document.getElementById("placeBtn");

  if (!currentUser) {
    message("Please wait. Connecting to the ordering system...", "red");
    return;
  }

  const name = document.getElementById("custName").value.trim();

  if (name.length < 2 || name.length > 60) {
    message("Please enter your name (2 to 60 characters).", "red");
    return;
  }

  const selectedProducts = defaultProducts.filter(
    product => cart[product.id]
  );

  if (!selectedProducts.length) {
    message("Please add food to your cart first.", "red");
    return;
  }

  const total = selectedProducts.reduce(
    (sum, product) => sum + product.price * cart[product.id], 0
  );

  const refNumber = document.getElementById("gcashRef").value.trim();
  const gcashNumber = document.getElementById("gcashNum").value.trim();

  if (paymentMethod === "GCash") {
    if (!/^[0-9]{6,30}$/.test(refNumber)) {
      message("Please enter a valid GCash reference number.", "red");
      return;
    }

    if (!/^09[0-9]{9}$/.test(gcashNumber)) {
      message("Please enter a valid 11-digit GCash number.", "red");
      return;
    }
  }

  const orderItems = selectedProducts.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    qty: cart[product.id],
    subtotal: product.price * cart[product.id]
  }));

  const now = new Date();

  const order = {
    ownerUid: currentUser.uid,
    name: name,
    items: orderItems,
    total: total,
    status: "Pending",
    payment: paymentMethod,
    ref: paymentMethod === "GCash" ? refNumber : "",
    num: paymentMethod === "GCash" ? gcashNumber : "",
    time: now.toLocaleString(),
    createdAt: Date.now()
  };

  button.disabled = true;
  button.textContent = "SENDING ORDER...";
  message("Sending your order...");

  try {
    const newOrderRef = push(ref(db, "orders"));
    await set(newOrderRef, order);

    saveOrderId(newOrderRef.key);

    myOrders[newOrderRef.key] = order;
    showMyOrders();

    cart = {};
    showCart();

    document.getElementById("gcashRef").value = "";
    document.getElementById("gcashNum").value = "";

    message("✅ Order placed successfully! Check your order status below.");

    document.getElementById("publicOrders").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  } catch (error) {
    console.error(error);
    message("Order failed. Please check your internet connection and try again.", "red");
  } finally {
    button.disabled = false;
    button.textContent = "🛒 PLACE ORDER";
  }
});

// CUSTOMER AUTHENTICATION
onAuthStateChanged(auth, async user => {
  if (!user) {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous login error:", error);
      message("Cannot connect to Firebase. Please try again.", "red");
    }
    return;
  }

  currentUser = user;
  listenToMyOrders();
});

// QR CODE
const websiteLink = location.href.split("?")[0].split("#")[0];

document.getElementById("qrLink").textContent = websiteLink;
document.getElementById("mainQR").src =
  "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" +
  encodeURIComponent(websiteLink);

// INITIAL DISPLAY
showProducts();
showCart();
showMyOrders();
  
