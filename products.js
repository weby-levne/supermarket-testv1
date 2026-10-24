export const initialProducts = [
  { id:"milk", name:"Mléko 1 l", category:"Mléčné výrobky", icon:"▱", supplierId:"fresh", baseCost:18, cost:18, price:27, stock:36, minStock:12, demand:0.92, perishable:true },
  { id:"bread", name:"Chléb konzumní", category:"Pečivo", icon:"▰", supplierId:"bakery", baseCost:22, cost:22, price:32, stock:24, minStock:8, demand:0.78, perishable:true },
  { id:"apples", name:"Jablka 1 kg", category:"Ovoce a zelenina", icon:"●", supplierId:"farm", baseCost:24, cost:24, price:39, stock:28, minStock:10, demand:0.65, perishable:true },
  { id:"eggs", name:"Vejce 10 ks", category:"Mléčné výrobky", icon:"◉", supplierId:"fresh", baseCost:38, cost:38, price:52, stock:18, minStock:6, demand:0.48, perishable:false },
  { id:"pasta", name:"Těstoviny 500 g", category:"Trvanlivé potraviny", icon:"〰", supplierId:"bulk", baseCost:16, cost:16, price:25, stock:42, minStock:12, demand:0.58, perishable:false },
  { id:"water", name:"Voda 1,5 l", category:"Nápoje", icon:"♢", supplierId:"bulk", baseCost:9, cost:9, price:15, stock:48, minStock:15, demand:0.88, perishable:false },
  { id:"cheese", name:"Eidam 100 g", category:"Mléčné výrobky", icon:"▦", supplierId:"fresh", baseCost:21, cost:21, price:32, stock:16, minStock:6, demand:0.52, perishable:true },
  { id:"coffee", name:"Mletá káva 250 g", category:"Trvanlivé potraviny", icon:"◒", supplierId:"bulk", baseCost:69, cost:69, price:89, stock:12, minStock:4, demand:0.28, perishable:false }
];

export const supplierCatalog = [
  {id:"fresh",name:"FreshLine Distribuce",type:"Mléčné výrobky a chlazené zboží",icon:"F",reliability:94,delivery:1,discount:0,products:["Mléko, vejce, sýry"],description:"Spolehlivé dodávky chlazených potravin."},
  {id:"bakery",name:"Pekařství U Mlýna",type:"Čerstvé pečivo",icon:"U",reliability:97,delivery:1,discount:0,products:["Chléb a pečivo"],description:"Čerstvé pečivo s každodenní dodávkou."},
  {id:"farm",name:"Zelená Farma",type:"Ovoce a zelenina",icon:"Z",reliability:86,delivery:1,discount:0,products:["Sezónní ovoce a zelenina"],description:"Lokální produkce a proměnlivá dostupnost."},
  {id:"bulk",name:"Velkoobchod Central",type:"Trvanlivé potraviny a nápoje",icon:"C",reliability:91,delivery:1,discount:0,products:["Nápoje, těstoviny, káva"],description:"Široký sortiment a výhodnější nákup ve velkém."}
];
