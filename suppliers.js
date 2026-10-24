import { supplierCatalog } from "./products.js";

export function getSupplier(state, id) {
  return state.suppliers.find(s => s.id === id) || supplierCatalog.find(s => s.id === id);
}
export function quoteOrder(state, productId, qty, supplierId) {
  const product = state.products.find(p => p.id === productId);
  const supplier = getSupplier(state, supplierId);
  if (!product || !supplier || !Number.isFinite(qty) || qty < 1) return null;
  const multiplier = supplier.id === product.supplierId ? 1 : 1.18;
  const unitCost = Math.max(1, Math.round(product.baseCost * multiplier));
  return { product, supplier, qty, unitCost, total: unitCost * qty };
}
export function createOrder(state, productId, qty, supplierId) {
  const quote = quoteOrder(state, productId, qty, supplierId);
  if (!quote) return { ok:false, message:"Zkontroluj produkt a množství." };
  if (qty > 500) return { ok:false, message:"Jedna objednávka může obsahovat maximálně 500 kusů." };
  if (state.cash < quote.total) return { ok:false, message:"Na tuto objednávku nemáš dostatek hotovosti." };
  state.cash -= quote.total;
  const order = {
    id: state.nextOrderId++, supplierId, productId, qty, unitCost:quote.unitCost,
    total:quote.total, orderedDay:state.day, dueDay:state.day + Math.max(1, quote.supplier.delivery),
    status:"Čeká na doručení"
  };
  state.orders.unshift(order);
  state.todayCosts += quote.total;
  state.activities.unshift({day:state.day,icon:"▣",title:"Objednávka vytvořena",description:`${quote.qty}× ${quote.product.name} od ${quote.supplier.name}.`,time:`Den ${state.day}`});
  return {ok:true,order,message:"Objednávka byla potvrzena."};
}
export function deliverOrders(state) {
  const delivered = [];
  for (const order of state.orders) {
    if (order.status === "Čeká na doručení" && order.dueDay <= state.day) {
      const product = state.products.find(p => p.id === order.productId);
      if (product) {
        product.stock += order.qty;
        product.cost = order.unitCost;
        order.status = "Doručeno";
        delivered.push(order);
        state.activities.unshift({day:state.day,icon:"✓",title:"Zboží dorazilo",description:`${order.qty}× ${product.name} je připraveno k prodeji.`,time:`Den ${state.day}`});
      }
    }
  }
  return delivered;
}
