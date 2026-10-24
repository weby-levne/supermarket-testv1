import { newGame, normalizeGame, openDay, stockValue, fmt, num } from "./game.js";
import { createOrder, quoteOrder, getSupplier } from "./suppliers.js";
import { saveGame, loadGame } from "./storage.js";
import { initStore3D } from "./store3d.js";

let state = normalizeGame(loadGame());
let activeView = "overview";
let toastTimer;
const $ = id => document.getElementById(id);
const escapeHTML = s => String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const titles = {
  overview:["Přehled prodejny","Kontroluj provoz a rozhoduj, kam obchod posuneš dál."],
  products:["Produkty a ceny","Řiď sortiment, zásoby a ziskovost jednotlivých položek."],
  suppliers:["Dodavatelé","Vyber si obchodní partnery a plánuj zásobování."],
  orders:["Objednávky","Objednávej zboží a sleduj jeho cestu do skladu."],
  expansion:["Rozvoj obchodu","Investuj do kapacity a přilákej více zákazníků."]
};
function toast(message) {
  const el=$("toast");el.textContent=message;el.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600);
}
function persist(show=false) {
  const ok=saveGame(state);
  if(show) toast(ok?"Hra byla uložena do tohoto zařízení.":"Uložení se nezdařilo. Zkontroluj nastavení prohlížeče.");
  return ok;
}
function productById(id){return state.products.find(p=>p.id===id)}
function supplierById(id){return getSupplier(state,id)}
function renderHeader(){
  $("cash").textContent=fmt(state.cash);$("revenue").textContent=fmt(state.todayRevenue);$("day").textContent=state.day;
  $("orderCount").textContent=state.orders.filter(o=>o.status==="Čeká na doručení").length;
}
function renderOverview(){
  $("stockValue").textContent=fmt(stockValue(state));
  $("productCount").textContent=state.products.length;
  $("pendingOrders").textContent=state.orders.filter(o=>o.status==="Čeká na doručení").length;
  $("satisfaction").textContent=state.satisfaction;
  $("satisfactionBar").style.width=`${state.satisfaction}%`;
  $("metricRevenue").textContent=fmt(state.todayRevenue);
  $("metricCosts").textContent=fmt(state.todayCosts);
  $("metricProfit").textContent=fmt(state.todayProfit);
  $("metricProfit").style.color=state.todayProfit<0?"var(--red)":"var(--ink)";
  $("customers").textContent=num(state.todayCustomers);
  $("revenueHint").textContent=state.todayRevenue?"Dnešní prodané zboží":"Zatím bez prodejů";
  const low=state.products.filter(p=>p.stock<=p.minStock).sort((a,b)=>a.stock-b.stock);
  $("lowStockList").innerHTML=(low.length?low:state.products.slice().sort((a,b)=>a.stock-b.stock).slice(0,4)).slice(0,5).map(p=>`
    <div class="stock-row"><div class="product-ident"><span class="product-icon">${escapeHTML(p.icon)}</span><div><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.category)}</small></div></div><span class="stock-count ${p.stock<=p.minStock?'low':''}">${p.stock} ks</span><span class="stock-status ${p.stock<=p.minStock?'low':''}">${p.stock<=p.minStock?'Doplnit':'Skladem'}</span></div>`).join("");
  $("activityList").innerHTML=state.activities.slice(0,5).map(a=>`
    <div class="activity-row"><span class="activity-symbol">${escapeHTML(a.icon)}</span><div><strong>${escapeHTML(a.title)}</strong><p>${escapeHTML(a.description)}</p></div><time>${escapeHTML(a.time)}</time></div>`).join("");
}
function renderProducts(){
  $("productsTable").innerHTML=state.products.map(p=>{
    const supplier=supplierById(p.supplierId),margin=p.price-p.cost,percent=p.price?Math.round(margin/p.price*100):0;
    return `<tr><td><div class="table-product"><span class="product-icon">${escapeHTML(p.icon)}</span><div><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.category)}</small></div></div></td><td>${escapeHTML(supplier?.name||"Neznámý dodavatel")}</td><td><input class="qty-input" type="number" min="0" max="9999" value="${p.stock}" data-stock="${p.id}" aria-label="Zásoba ${escapeHTML(p.name)}"> ks ${p.stock<=p.minStock?'<span class="status-pill pending">Nízká zásoba</span>':''}</td><td>${fmt(p.cost)}</td><td><input class="price-input" type="number" min="1" max="9999" value="${p.price}" data-price="${p.id}" aria-label="Prodejní cena ${escapeHTML(p.name)}"> Kč</td><td class="${margin>=0?'margin-positive':'margin-negative'}">${fmt(margin)} <small>(${percent} %)</small></td></tr>`;
  }).join("");
  document.querySelectorAll("[data-price]").forEach(input=>input.addEventListener("change",()=>{
    const p=productById(input.dataset.price),value=Math.round(Number(input.value));
    if(!p||!Number.isFinite(value)||value<1||value>9999){input.value=p?.price||1;toast("Cena musí být v rozmezí 1 až 9 999 Kč.");return;}
    p.price=value;renderAll();persist();toast(`Cena produktu ${p.name} byla změněna.`);
  }));
  document.querySelectorAll("[data-stock]").forEach(input=>input.addEventListener("change",()=>{
    const p=productById(input.dataset.stock),value=Math.round(Number(input.value));
    if(!p||!Number.isFinite(value)||value<0||value>9999){input.value=p?.stock||0;toast("Zásoba musí být mezi 0 a 9 999 kusy.");return;}
    p.stock=value;renderAll();persist();toast("Stav zásob byl upraven.");
  }));
}
function renderSuppliers(){
  $("suppliersGrid").innerHTML=state.suppliers.map(s=>{
    const supplied=state.products.filter(p=>p.supplierId===s.id);
    const avg=supplied.length?Math.round(supplied.reduce((n,p)=>n+p.cost,0)/supplied.length):0;
    return `<article class="supplier-card"><div class="supplier-top"><span class="supplier-logo">${escapeHTML(s.icon)}</span><div><h3>${escapeHTML(s.name)}</h3><p>${escapeHTML(s.type)}</p></div></div><p class="supplier-products">${escapeHTML(s.description)}<br>Sortiment: ${supplied.map(p=>escapeHTML(p.name)).join(", ")||"Zatím bez přiřazených produktů"}</p><div class="supplier-meta"><div><small>Spolehlivost</small><strong>${s.reliability} %</strong></div><div><small>Dodání</small><strong>${s.delivery} herní den</strong></div><div><small>Průměrná nákupní cena</small><strong>${fmt(avg)}</strong></div><div><small>Dodávané produkty</small><strong>${supplied.length}</strong></div></div><button class="secondary-btn" data-order-supplier="${s.id}">Vytvořit objednávku →</button></article>`;
  }).join("");
  document.querySelectorAll("[data-order-supplier]").forEach(b=>b.addEventListener("click",()=>{setView("orders");$("orderSupplier").value=b.dataset.orderSupplier;syncOrderProducts();updateOrderTotal();}));
}
function renderOrders(){
  $("ordersTable").innerHTML=state.orders.length?state.orders.map(o=>{
    const p=productById(o.productId),s=supplierById(o.supplierId);
    const cls=o.status==="Doručeno"?"":o.status==="Stornováno"?"cancelled":"pending";
    return `<tr><td><strong>#${String(o.id).padStart(4,"0")}</strong><br><small>Den ${o.orderedDay}</small></td><td>${escapeHTML(s?.name||"—")}</td><td>${escapeHTML(p?.name||"Odstraněný produkt")}</td><td>${o.qty} ks</td><td>${fmt(o.total)}</td><td><span class="status-pill ${cls}">${escapeHTML(o.status)}</span></td></tr>`;
  }).join(""):'<tr><td colspan="6" class="muted">Zatím nemáš žádné objednávky.</td></tr>';
}
function renderExpansion(){
  $("shelvesStatus").textContent=`ÚROVEŇ ${state.shelvesLevel}`;
  $("marketingStatus").textContent=`ÚROVEŇ ${state.marketingLevel}`;
  $("fridgeStatus").textContent=`ÚROVEŇ ${state.fridgeLevel}`;
  $("shelvesCost").textContent=fmt(8000*state.shelvesLevel);
  $("marketingCost").textContent=fmt(5000*(state.marketingLevel+1));
  $("upgradeShelves").disabled=state.shelvesLevel>=5;
  $("upgradeShelves").textContent=state.shelvesLevel>=5?"Maximum":"Vylepšit";
  $("upgradeMarketing").disabled=state.marketingLevel>=5;
  $("upgradeMarketing").textContent=state.marketingLevel>=5?"Maximum":"Spustit";
  $("upgradeFridge").disabled=state.fridgeLevel>=1;
  $("upgradeFridge").textContent=state.fridgeLevel>=1?"Pořízeno":"Pořídit";
}
function syncOrderProducts(){
  const supplierId=$("orderSupplier").value;
  const current=$("orderProduct").value;
  const relevant=state.products.filter(p=>p.supplierId===supplierId);
  const list=relevant.length?relevant:state.products;
  $("orderProduct").innerHTML=list.map(p=>`<option value="${p.id}">${escapeHTML(p.name)} · ${fmt(Math.max(1,Math.round(p.baseCost*(p.supplierId===supplierId?1:1.18))))}/ks</option>`).join("");
  if(list.some(p=>p.id===current))$("orderProduct").value=current;
}
function updateOrderTotal(){
  const qty=Math.max(1,Math.min(500,Math.round(Number($("orderQty").value)||1)));
  const quote=quoteOrder(state,$("orderProduct").value,qty,$("orderSupplier").value);
  $("orderTotal").textContent=quote?fmt(quote.total):"—";
}
function renderAll(){
  renderHeader();renderOverview();renderProducts();renderSuppliers();renderOrders();renderExpansion();
  if($("orderSupplier").options.length===0){
    $("orderSupplier").innerHTML=state.suppliers.map(s=>`<option value="${s.id}">${escapeHTML(s.name)}</option>`).join("");
    syncOrderProducts();
  }
  updateOrderTotal();
}
function setView(view){
  if(!titles[view])return;
  activeView=view;
  document.querySelectorAll(".view").forEach(el=>el.classList.add("hidden"));
  $(`${view}View`).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $("pageTitle").textContent=titles[view][0];$("pageSubtitle").textContent=titles[view][1];
  if(view==="overview")initStore3D($("storeScene"));
}
function showModal(title,text,confirmLabel,onConfirm){
  $("modalTitle").textContent=title;$("modalText").textContent=text;$("modalConfirm").textContent=confirmLabel;
  $("modalBackdrop").classList.remove("hidden");
  const close=()=>{$("modalBackdrop").classList.add("hidden");$("modalConfirm").removeEventListener("click",yes);$("modalCancel").removeEventListener("click",no);};
  const yes=()=>{close();onConfirm();},no=()=>close();
  $("modalConfirm").addEventListener("click",yes);$("modalCancel").addEventListener("click",no);
}
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.goto)));
$("saveBtn").addEventListener("click",()=>persist(true));
$("orderSupplier").addEventListener("change",()=>{syncOrderProducts();updateOrderTotal();});
$("orderProduct").addEventListener("change",updateOrderTotal);
$("orderQty").addEventListener("input",updateOrderTotal);
$("placeOrderBtn").addEventListener("click",()=>{
  const qty=Math.round(Number($("orderQty").value));
  if(!Number.isFinite(qty)||qty<1||qty>500){toast("Zadej množství od 1 do 500 kusů.");return;}
  const result=createOrder(state,$("orderProduct").value,qty,$("orderSupplier").value);
  if(!result.ok){toast(result.message);return;}
  renderAll();persist();toast(`${result.message} Odečteno ${fmt(result.order.total)}.`);
});
$("restockLowBtn").addEventListener("click",()=>{
  let count=0;
  for(const p of state.products.filter(p=>p.stock<=p.minStock)){
    const qty=Math.max(p.minStock*2-p.stock, p.minStock);
    const result=createOrder(state,p.id,qty,p.supplierId);
    if(result.ok)count++;
  }
  renderAll();persist();toast(count?`Vytvořeno ${count} objednávek na kritické zásoby.`:"Na objednávky nemáš dost hotovosti nebo jsou zásoby v pořádku.");
});
$("nextDayBtn").addEventListener("click",()=>showModal("Ukončit den?",`Uzavřeš den ${state.day}. Proběhne simulace prodejů, provozních nákladů a zákaznické poptávky.`,`Ukončit den ${state.day}`,()=>{
  const result=openDay(state);renderAll();persist();
  toast(`Den uzavřen · tržby ${fmt(result.revenue)} · výsledek ${fmt(result.profit)}.`);
  setView("overview");
}));
$("upgradeShelves").addEventListener("click",()=>{
  const cost=8000*state.shelvesLevel;
  if(state.shelvesLevel>=5){toast("Regály už jsou na maximální úrovni.");return;}
  if(state.cash<cost){toast("Na toto vylepšení nemáš dost hotovosti.");return;}
  state.cash-=cost;state.shelvesLevel++;state.satisfaction=Math.min(100,state.satisfaction+2);
  state.activities.unshift({day:state.day,icon:"↗",title:"Rozšířené regály",description:`Prodejna získala úroveň regálů ${state.shelvesLevel}.`,time:`Den ${state.day}`});
  renderAll();persist();toast("Regály byly vylepšeny.");
});
$("upgradeMarketing").addEventListener("click",()=>{
  const cost=5000*(state.marketingLevel+1);
  if(state.marketingLevel>=5){toast("Marketing už je na maximální úrovni.");return;}
  if(state.cash<cost){toast("Na tuto investici nemáš dost hotovosti.");return;}
  state.cash-=cost;state.marketingLevel++;
  state.activities.unshift({day:state.day,icon:"✳",title:"Marketingová kampaň",description:`Marketing je nyní na úrovni ${state.marketingLevel}.`,time:`Den ${state.day}`});
  renderAll();persist();toast("Marketingová kampaň byla spuštěna.");
});
$("upgradeFridge").addEventListener("click",()=>{
  if(state.fridgeLevel){toast("Chladicí vybavení už máš.");return;}
  if(state.cash<6500){toast("Na chladicí vybavení nemáš dost hotovosti.");return;}
  state.cash-=6500;state.fridgeLevel=1;
  state.activities.unshift({day:state.day,icon:"▥",title:"Chladicí vybavení",description:"Sníží se ztráty u rychle se kazících potravin.",time:`Den ${state.day}`});
  renderAll();persist();toast("Chladicí vybavení bylo pořízeno.");
});
window.addEventListener("beforeunload",()=>persist());
renderAll();setView(activeView);
