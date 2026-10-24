import { initialProducts, supplierCatalog } from "./products.js";
import { deliverOrders } from "./suppliers.js";

export function newGame() {
  return {
    version:1, cash:25000, day:1, products:structuredClone(initialProducts),
    suppliers:structuredClone(supplierCatalog), orders:[], nextOrderId:1,
    todayRevenue:0, todayCosts:0, todayProfit:0, todayCustomers:0,
    satisfaction:78, shelvesLevel:1, marketingLevel:0, fridgeLevel:0,
    lifetimeRevenue:0, lifetimeProfit:0, activities:[
      {day:1,icon:"＋",title:"Obchod byl otevřen",description:"Začínáš s malou prodejnou a základním sortimentem.",time:"Dnes"}
    ]
  };
}
export function normalizeGame(saved) {
  if (!saved || saved.version !== 1 || !Array.isArray(saved.products)) return newGame();
  const fresh = newGame();
  return {...fresh, ...saved, products:saved.products, suppliers:saved.suppliers || fresh.suppliers,
    orders:saved.orders || [], activities:saved.activities || []};
}
const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
export function stockValue(state) {
  return state.products.reduce((sum,p)=>sum+p.stock*p.cost,0);
}
export function openDay(state) {
  const deliveries = deliverOrders(state);
  let revenue=0, soldCost=0, customers=0, lostSales=0;
  const notes=[];
  for (const p of state.products) {
    const priceRatio = p.price / Math.max(1,p.cost);
    const priceFactor = clamp(1.35 - (priceRatio - 1.3) * 0.55, 0.28, 1.25);
    const marketingFactor = 1 + state.marketingLevel * 0.12;
    const dayDemand = Math.max(0, Math.round((3 + Math.random()*5) * p.demand * priceFactor * marketingFactor));
    const sold = Math.min(p.stock, dayDemand);
    p.stock -= sold;
    revenue += sold*p.price;
    soldCost += sold*p.cost;
    customers += Math.max(0, Math.round(sold * (0.65 + Math.random()*0.35)));
    lostSales += dayDemand-sold;
  }
  const operatingCost = 450 + state.shelvesLevel*75 + state.marketingLevel*120 + state.fridgeLevel*55;
  const spoiled = state.fridgeLevel ? 0 : state.products.filter(p=>p.perishable).reduce((sum,p)=>sum+Math.min(p.stock,Math.random()<0.35?1:0),0);
  for (const p of state.products.filter(p=>p.perishable)) p.stock=Math.max(0,p.stock-(state.fridgeLevel?0:(Math.random()<0.35?1:0)));
  const profit = revenue - soldCost - operatingCost;
  state.cash += revenue - operatingCost;
  state.todayRevenue = revenue;
  state.todayCosts = soldCost + operatingCost;
  state.todayProfit = profit;
  state.todayCustomers = customers;
  state.lifetimeRevenue += revenue;
  state.lifetimeProfit += profit;
  state.satisfaction = clamp(Math.round(state.satisfaction + (lostSales ? -Math.min(5,lostSales) : 1) + (state.products.some(p=>p.price>p.cost*2.2)?-1:0)),35,100);
  state.activities.unshift({day:state.day,icon:"↗",title:"Denní prodej uzavřen",description:`Tržby ${fmt(revenue)} · výsledek ${fmt(profit)}.`,time:`Den ${state.day}`});
  if (lostSales) state.activities.unshift({day:state.day,icon:"!",title:"Nedostatek zboží",description:`Část poptávky nebyla uspokojena (${lostSales} kusů).`,time:`Den ${state.day}`});
  if (deliveries.length) state.activities.unshift({day:state.day,icon:"✓",title:"Převzaté dodávky",description:`Doručeno objednávek: ${deliveries.length}.`,time:`Den ${state.day}`});
  if (spoiled) state.activities.unshift({day:state.day,icon:"−",title:"Ztráty potravin",description:`Bez chladicího vybavení se část potravin znehodnotila.`,time:`Den ${state.day}`});
  state.activities=state.activities.slice(0,30);
  state.day += 1;
  return {revenue, soldCost, operatingCost, profit, customers, lostSales, spoiled};
}
export const fmt = n => `${Math.round(n).toLocaleString("cs-CZ")} Kč`;
export const num = n => Math.round(n).toLocaleString("cs-CZ");
