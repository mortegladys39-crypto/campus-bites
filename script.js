var defaultProducts=[
{id:1,name:"Cheeseburger",desc:"Beef patty, cheese",price:75,cat:"Foods",file:"1-cheeseburger.jpg"},
{id:2,name:"Chicken Burger",desc:"Crispy chicken",price:63,cat:"Foods",file:"2-chicken-burger.jpg"},
{id:3,name:"Pizza Slice",desc:"Cheesy slice",price:50,cat:"Foods",file:"3-pizza.jpg"},
{id:4,name:"Fried Chicken",desc:"Crispy, juicy",price:50,cat:"Foods",file:"4-fried-chicken.jpg"},
{id:5,name:"Chicken Rice",desc:"Much rice",price:85,cat:"Foods",file:"5-chicken-rice.jpg"},
{id:6,name:"Pork Adobo with rice",desc:"Filipino style",price:60,cat:"Foods",file:"6-adobo.jpg"},
{id:7,name:"Pancit Canton",desc:"Savory noodles",price:40,cat:"Foods",file:"7-pancit.jpg"},
{id:8,name:"Hotdog Sandwich",desc:"Hotdog w/ sauce",price:42,cat:"Foods",file:"8-hotdog.jpg"},
{id:9,name:"Siomai Rice",desc:"Siomai + rice",price:40,cat:"Foods",file:"9-siomai.jpg"},
{id:10,name:"French Fries",desc:"Golden crispy",price:30,cat:"Snacks",file:"10-fries.jpg"},
{id:11,name:"Chicken Nuggets",desc:"Crunchy bites",price:50,cat:"Snacks",file:"11-nuggets.jpg"},
{id:12,name:"Nachos",desc:"Chips cheese",price:40,cat:"Snacks",file:"12-nachos.jpg"},
{id:13,name:"Banana Cue",desc:"Sweet banana",price:10,cat:"Snacks",file:"13-banana-cue.jpg"},
{id:14,name:"Turon",desc:"Banana roll",price:10,cat:"Snacks",file:"14-turon.jpg"},
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

var products = JSON.parse(localStorage.getItem("cbProducts") || JSON.stringify(defaultProducts));
var productImages = JSON.parse(localStorage.getItem("cbProductImages") || "{}");
var orders = JSON.parse(localStorage.getItem("cbOrders") || "[]");
var cart = JSON.parse(localStorage.getItem("cbCart") || "[]");
var currentCat="All";
var payment="Cash";

function save(){
localStorage.setItem("cbProducts",JSON.stringify(products));
localStorage.setItem("cbProductImages",JSON.stringify(productImages));
localStorage.setItem("cbOrders",JSON.stringify(orders));
localStorage.setItem("cbCart",JSON.stringify(cart));
}

// FIXED - CLEAN - DILI NA MANGAPIN!
function showProducts(){
var filtered=currentCat==="All"?products:products.filter(p=>p.cat===currentCat);
var html="";
for(var p of filtered){
var hasReal = productImages[p.id];
var visual = "";
if(hasReal){
visual = `<img src="${hasReal}" alt="${p.name}">`;
}else{
visual = `<div class="no-pic" id="ph-${p.id}">📸<br>No Real Picture Yet<br><small>${p.name}<br>Upload in admin.html</small></div><img src="images/${p.file}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover" onload="document.getElementById('ph-${p.id}').style.display='none'" onerror="this.style.display='none'">`;
}
html+=`<div class="product" data-id="${p.id}"><div class="visual"><div class="price">₱${p.price}</div>${visual}</div><div class="p-info"><div style="font-weight:800;font-size:13px">${p.name}</div><div style="font-size:11px;color:#777">${p.desc}</div><div style="font-weight:900;margin-top:4px">₱${p.price}.00</div></div></div>`;
}
document.getElementById("products").innerHTML=html;
document.querySelectorAll(".product").forEach(el=>{
el.addEventListener("click",()=>{
var id=parseInt(el.getAttribute("data-id"));
var item=products.find(x=>x.id===id);
cart.push(item);save();showCart();
});
});
}

function showCart(){
var total=cart.reduce((s,i)=>s+i.price,0);
document.getElementById("tot").innerText=total;
document.getElementById("cartCount").innerText=cart.length;
document.getElementById("count").innerText=cart.length+" items";
var list=document.getElementById("cartList");
if(cart.length===0){list.innerHTML='<div style="background:#f9f9f9;padding:10px;border-radius:10px;text-align:center;font-size:12px">No items - Tap products!</div>';return;}
list.innerHTML=cart.map((item,i)=>`<span style="background:#0f2e1f;color:white;padding:6px 10px;border-radius:16px;font-size:11px;margin:4px;display:inline-block">${item.name} <b data-rm="${i}" style="cursor:pointer;background:rgba(255,255,255,.3);padding:2px 6px;border-radius:50%">x</b></span>`).join("");
document.querySelectorAll("[data-rm]").forEach(el=>el.addEventListener("click",e=>{e.stopPropagation();cart.splice(parseInt(el.getAttribute("data-rm")),1);save();showCart();}));
}

function showOrders(){
var pub=document.getElementById("publicOrders");
if(!pub) return;
if(orders.length===0){pub.innerHTML='<div style="color:#777;font-size:12px">No orders yet</div>';return;}
pub.innerHTML=orders.slice(-10).reverse().map(o=>{
var badge=o.status==="Pending"?'<span style="background:#FEF3C7;padding:4px 8px;border-radius:8px;font-size:11px">⏳ Pending</span>':o.status==="Preparing"?'<span style="background:#DBEAFE;padding:4px 8px;border-radius:8px;font-size:11px">🔥 Preparing</span>':'<span style="background:#D1FAE5;padding:4px 8px;border-radius:8px;font-size:11px">✅ Ready</span>';
return `<div class="order ${o.status.toLowerCase()}"><div style="display:flex;justify-content:space-between"><b>${o.name} - ${o.payment}</b>${badge}</div><div style="font-size:11px;margin-top:4px">${o.items.map(it=>it.name).join(", ")} - ₱${o.total}</div></div>`;
}).join("");
}

document.querySelectorAll(".cat").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".cat").forEach(b=>b.classList.remove("active"));btn.classList.add("active");currentCat=btn.getAttribute("data-cat");showProducts();}));
document.querySelectorAll(".pay").forEach(p=>p.addEventListener("click",()=>{document.querySelectorAll(".pay").forEach(x=>x.className="pay");document.getElementById("gcashBox").className="gcash";payment=p.getAttribute("data-pay");if(payment==="Cash"){p.className="pay active";}else{p.className="pay gcash-active";document.getElementById("gcashBox").className="gcash show";}}));
document.getElementById("placeBtn").addEventListener("click",()=>{
var name=document.getElementById("custName").value.trim();
if(!name){alert("Enter name!");return;}
if(cart.length===0){alert("Cart empty!");return;}
var ref=document.getElementById("gcashRef").value.trim();
var num=document.getElementById("gcashNum").value.trim();
if(payment==="GCash"){if(!ref){alert("Enter GCash ref!");return;}if(!num){alert("Enter GCash no!");return;}}
var total=cart.reduce((s,i)=>s+i.price,0);
var order={id:Date.now(),name:name,items:[...cart],total:total,status:"Pending",time:new Date().toLocaleString(),payment:payment,ref:ref,num:num};
orders.push(order);cart=[];save();showCart();showOrders();
document.getElementById("custName").value="";document.getElementById("gcashRef").value="";document.getElementById("gcashNum").value="";document.querySelectorAll(".pay").forEach(x=>x.className="pay");document.querySelectorAll(".pay")[0].className="pay active";document.getElementById("gcashBox").className="gcash";payment="Cash";
alert("✅ Order placed! "+payment+" ID #"+order.id);
});

var link=location.href;
var qrEl=document.getElementById("qrLink");
if(qrEl) qrEl.innerText=link;
var mainQR=document.getElementById("mainQR");
if(mainQR) mainQR.src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data="+encodeURIComponent(link);
var gcashQR=document.getElementById("gcashQR");
if(gcashQR) gcashQR.src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data="+encodeURIComponent("GCASH-09481114418-CAMPUSBITES");

showProducts();showCart();showOrders();