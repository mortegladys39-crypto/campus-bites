var defaultProducts=[
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

var products = JSON.parse(localStorage.getItem("cbProducts") || JSON.stringify(defaultProducts));
var productImages = JSON.parse(localStorage.getItem("cbProductImages") || "{}");
var orders = JSON.parse(localStorage.getItem("cbOrders") || "[]");

function save(){
localStorage.setItem("cbProducts",JSON.stringify(products));
localStorage.setItem("cbProductImages",JSON.stringify(productImages));
localStorage.setItem("cbOrders",JSON.stringify(orders));
}

function showProductManager(){
var container=document.getElementById("productManager");
container.innerHTML=products.map(p=>{
var hasImg=productImages[p.id];
var status=hasImg?"✅ Has Real Picture":"❌ No Real Picture Yet";
var color=hasImg?"#16a34a":"#ef4444";
return `<div class="prod-item">
<div style="text-align:center">
<div style="width:70px;height:70px;background:#f3f4f6;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #ddd">${hasImg?`<img src="${hasImg}" style="width:100%;height:100%;object-fit:cover">`:`<div style="font-size:9px;color:#999;text-align:center">No Pic<br>${p.id}</div>`}</div>
<div style="font-size:9px;margin-top:4px;color:${color};font-weight:800">${status}</div>
</div>
<div style="flex:1">
<div style="font-weight:800;font-size:12px">${p.id}. ${p.name} - ₱${p.price}</div>
<div style="font-size:10px;color:#777">File: images/${p.file} | Cat: ${p.cat}</div>
<input type="file" accept="image/*" data-upload="${p.id}" style="margin-top:6px;font-size:11px;width:100%">
<div style="font-size:9px;color:#0f2e1f;margin-top:2px">↑ Click to upload REAL PICTURE for ${p.name}!</div>
</div>
</div>`;
}).join("");
container.querySelectorAll("[data-upload]").forEach(el=>{
el.addEventListener("change",e=>{
var id=parseInt(el.getAttribute("data-upload"));
var file=e.target.files[0];
if(!file) return;
var reader=new FileReader();
reader.onload=ev=>{
productImages[id]=ev.target.result;
save();
showProductManager();
alert("✅ Real picture saved for "+products.find(x=>x.id===id).name+"! Now check index.html - picture will show!");
};
reader.readAsDataURL(file);
});
});
}

function showOrders(){
var adm=document.getElementById("adminOrders");
if(orders.length===0){adm.innerHTML='<div style="color:#777;text-align:center;padding:20px">No orders yet - Orders from index.html will appear here!</div>';return;}
adm.innerHTML=orders.map((o,idx)=>{
var badge=o.status==="Pending"?'<span style="background:#FEF3C7;padding:4px 8px;border-radius:8px">Pending</span>':o.status==="Preparing"?'<span style="background:#DBEAFE;padding:4px 8px;border-radius:8px">Preparing</span>':'<span style="background:#D1FAE5;padding:4px 8px;border-radius:8px">Ready</span>';
return `<div class="order ${o.status.toLowerCase()}"><b>#${o.id} ${o.name} ₱${o.total}</b><br><small>${o.time}</small><div style="font-size:11px;margin:4px 0">${o.items.map(it=>it.name).join(", ")}</div><div style="font-size:11px;background:${o.payment==="GCash"?"#DBEAFE":"#FEF3C7"};padding:6px;border-radius:8px">Payment: ${o.payment}${o.payment==="GCash"?`<br>Ref: ${o.ref}<br>No: ${o.num}`:""}</div><div style="margin-top:6px">${badge}</div><div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap"><button class="btn" data-status="${idx}-Pending" style="background:#ddd;font-size:11px">Pending</button><button class="btn" data-status="${idx}-Preparing" style="background:#3b82f6;color:white;font-size:11px">Accept - Preparing</button><button class="btn" data-status="${idx}-Done" style="background:#16a34a;color:white;font-size:11px">Done - Ready</button><button class="btn" data-del="${idx}" style="background:red;color:white;font-size:11px">Delete</button></div></div>`;
}).join("");
adm.querySelectorAll("[data-status]").forEach(el=>el.addEventListener("click",()=>{var parts=el.getAttribute("data-status").split("-");var idx=parseInt(parts[0]);var s=parts[1];orders[idx].status=s;save();showOrders();}));
adm.querySelectorAll("[data-del]").forEach(el=>el.addEventListener("click",()=>{var idx=parseInt(el.getAttribute("data-del"));if(confirm("Delete order?")){orders.splice(idx,1);save();showOrders();}}));
}

function login(){
var pin=document.getElementById("pin").value;
if(pin==="1234"||pin==="admin123"){
document.getElementById("loginSection").style.display="none";
document.getElementById("adminPanel").style.display="block";
showProductManager();
showOrders();
}else alert("Wrong PIN! Use 1234");
}

document.getElementById("loginBtn").addEventListener("click",login);
document.getElementById("pin").addEventListener("keypress",e=>{if(e.key==="Enter") login();});
document.getElementById("logoutBtn").addEventListener("click",()=>{document.getElementById("adminPanel").style.display="none";document.getElementById("loginSection").style.display="block";document.getElementById("pin").value="";});
document.getElementById("clearPicsBtn").addEventListener("click",()=>{if(confirm("Delete all real pictures?")){productImages={};save();showProductManager();alert("All real pictures cleared!");}});
document.getElementById("showNamesBtn").addEventListener("click",()=>{var list="File names for images/ folder:\n\n"+products.map(p=>p.file+" - "+p.name).join("\n");alert(list);});
document.getElementById("refreshBtn").addEventListener("click",()=>{products=JSON.parse(localStorage.getItem("cbProducts")||JSON.stringify(defaultProducts));productImages=JSON.parse(localStorage.getItem("cbProductImages")||"{}");orders=JSON.parse(localStorage.getItem("cbOrders")||"[]");showProductManager();showOrders();alert("Refreshed!");});

// QR
var link=location.href.replace("admin.html","index.html");
document.getElementById("adminQrLink").innerText=link;
document.getElementById("adminQR").src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data="+encodeURIComponent(link);