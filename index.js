const Role = Object.freeze({
  STUDENT: "STUDENT",
  STAFF: "STAFF",
});

const OrderStatus = Object.freeze({
  RECEIVED: "RECEIVED",
  PREPARING: "PREPARING",
  READY: "READY",
  PICKED_UP: "PICKED_UP",
});

// ===== DOMAIN CLASSES =====

class User {
  constructor(id, name, role) {
    this.id = id;
    this.name = name;
    this.role = role;
  }
}

class MenuItem {
  constructor(id, name, price, category, tags, available = true) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.category = category;
    this.tags = tags || [];
    this.available = available;
  }
}

class CartItem {
  constructor(menuItemId, quantity = 1) {
    this.menuItemId = menuItemId;
    this.quantity = quantity;
  }
}

class Cart {
  constructor() {
    this.items = [];
  }

  addItem(menuItemId, qty = 1) {
    if (qty <= 0) return;
    const existing = this.items.find((ci) => ci.menuItemId === menuItemId);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.items.push(new CartItem(menuItemId, qty));
    }
  }

  removeItem(menuItemId) {
    this.items = this.items.filter((ci) => ci.menuItemId !== menuItemId);
  }

  getItems() {
    return [...this.items];
  }

  clear() {
    this.items = [];
  }
}

class Order {
  constructor({ id, userId, items, status, pickupTime, total = 0 }) {
    this.id = id;
    this.userId = userId;
    this.items = items;
    this.status = status;
    this.pickupTime = pickupTime;
    this.total = total;
  }

  calculateTotal(pricing, menu) {
    this.total = pricing.computeTotal(this.items, menu);
    return this.total;
  }

  advanceStatus() {
    const flow = [
      OrderStatus.RECEIVED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.PICKED_UP,
    ];
    const idx = flow.indexOf(this.status);
    if (idx >= 0 && idx < flow.length - 1) {
      this.status = flow[idx + 1];
    }
  }
}

// ===== STRATEGY PATTERN =====

class PricingStrategy {
  computeTotal(_items, _menu) {
    throw new Error("computeTotal must be implemented");
  }
}

class SimplePricingStrategy extends PricingStrategy {
  computeTotal(items, menu) {
    let total = 0;
    for (const ci of items) {
      const mi = menu.find((m) => m.id === ci.menuItemId);
      if (mi && mi.available) {
        total += mi.price * ci.quantity;
      }
    }
    return total;
  }
}

// optional combo strategy if you want it later
class ComboPricingStrategy extends PricingStrategy {
  computeTotal(items, menu) {
    let total = 0;
    let qtySum = 0;
    for (const ci of items) {
      const mi = menu.find((m) => m.id === ci.menuItemId);
      if (mi && mi.available) {
        total += mi.price * ci.quantity;
        qtySum += ci.quantity;
      }
    }
    if (qtySum >= 3) {
      total *= 0.9;
    }
    return total;
  }
}

// ===== OBSERVER PATTERN =====

class OrderObserver {
  onStatusChanged(_orderId, _status) {
    // abstract
  }
}

class OrderSubject {
  constructor() {
    this.observers = [];
  }

  attach(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer) {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  notify(orderId, status) {
    for (const o of this.observers) {
      o.onStatusChanged(orderId, status);
    }
  }
}

// ===== REPOSITORIES (in-memory) =====

class MenuRepository {
  findAll() { throw new Error("Not implemented"); }
  findById(_id) { throw new Error("Not implemented"); }
  save(_item) { throw new Error("Not implemented"); }
  toggleAvailability(_id, _available) { throw new Error("Not implemented"); }
}

class OrderRepository {
  save(_order) { throw new Error("Not implemented"); }
  findById(_id) { throw new Error("Not implemented"); }
  findByStatus(_status) { throw new Error("Not implemented"); }
  updateStatus(_id, _status) { throw new Error("Not implemented"); }
}

class SqliteMenuRepository extends MenuRepository {
  constructor(seed = []) {
    super();
    this._items = [...seed];
  }

  findAll() {
    return [...this._items];
  }

  findById(id) {
    return this._items.find((m) => m.id === id) || null;
  }

  save(item) {
    const idx = this._items.findIndex((m) => m.id === item.id);
    if (idx >= 0) {
      this._items[idx] = item;
    } else {
      this._items.push(item);
    }
  }

  toggleAvailability(id, available) {
    const item = this.findById(id);
    if (item) {
      item.available = available;
    }
  }
}

class SqliteOrderRepository extends OrderRepository {
  constructor() {
    super();
    this._orders = [];
  }

  save(order) {
    const idx = this._orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this._orders[idx] = order;
    } else {
      this._orders.push(order);
    }
  }

  findById(id) {
    return this._orders.find((o) => o.id === id) || null;
  }

  findByStatus(status) {
    return this._orders.filter((o) => o.status === status);
  }

  findAll() {
    return [...this._orders];
  }

  updateStatus(id, status) {
    const order = this.findById(id);
    if (order) {
      order.status = status;
    }
  }
}

// ===== APP SETUP =====

// one logged-in user
const currentStudent = new User("u1", "Student Alice", Role.STUDENT);

// simple demo menu
const seedMenu = [
  new MenuItem("m1", "Burger", 3.5, "MAIN", ["HALAL"], true),
  new MenuItem("m2", "Pizza Slice", 2.0, "MAIN", [], true),
  new MenuItem("m3", "French Fries", 1.2, "SIDE", ["VEG"], true),
  new MenuItem("m4", "Salad Bowl", 1.8, "SIDE", ["VEGAN"], true),
  new MenuItem("m5", "Coca-Cola", 1.0, "DRINK", [], true),
  new MenuItem("m6", "Chocolate Muffin", 1.5, "DESSERT", [], true),
];

const menuRepo = new SqliteMenuRepository(seedMenu);
const orderRepo = new SqliteOrderRepository();
const cart = new Cart();
const pricing = new SimplePricingStrategy();
const orderSubject = new OrderSubject();

// Concrete observer for UI updates
class UiOrderObserver extends OrderObserver {
  onStatusChanged(orderId, status) {
    console.log(`Order ${orderId} -> ${status}`);
    renderOrders();
  }
}
orderSubject.attach(new UiOrderObserver());

// ===== DOM REFERENCES =====

const currentUserNameEl = document.getElementById("current-user-name");
const currentUserRoleEl = document.getElementById("current-user-role");

const categoryFilterEl = document.getElementById("category-filter");
const tagFilterEl = document.getElementById("tag-filter");

const menuListEl = document.getElementById("menu-list");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const pickupTimeEl = document.getElementById("pickup-time");
const placeOrderBtn = document.getElementById("place-order-btn");
const studentMessageEl = document.getElementById("student-message");
const ordersListEl = document.getElementById("orders-list");

// init user display
if (currentUserNameEl) currentUserNameEl.textContent = currentStudent.name;
if (currentUserRoleEl)
  currentUserRoleEl.textContent = `(${currentStudent.role.toLowerCase()})`;


// show all items grouped by HALAL / VEG / VEGAN / OTHER
function renderMenu() {
  if (!menuListEl) return;
  menuListEl.innerHTML = "";

  const all = menuRepo.findAll().filter((i) => i.available);

  if (all.length === 0) {
    menuListEl.innerHTML = "<li>No items available.</li>";
    return;
  }

  const groups = {
    HALAL: [],
    VEG: [],
    VEGAN: [],
    OTHER: [],
  };

  for (const item of all) {
    if (item.tags.includes("HALAL")) {
      groups.HALAL.push(item);
    } else if (item.tags.includes("VEG")) {
      groups.VEG.push(item);
    } else if (item.tags.includes("VEGAN")) {
      groups.VEGAN.push(item);
    } else {
      groups.OTHER.push(item);
    }
  }

  const groupOrder = [
    { key: "HALAL", label: "Halal Options" },
    { key: "VEG", label: "Vegetarian Options" },
    { key: "VEGAN", label: "Vegan Options" },
    { key: "OTHER", label: "Other Meals" },
  ];

  for (const group of groupOrder) {
    const items = groups[group.key];
    if (!items || items.length === 0) continue;

    const headerLi = document.createElement("li");
    headerLi.className = "small";
    headerLi.style.fontWeight = "bold";
    headerLi.style.marginTop = "0.5rem";
    headerLi.textContent = group.label;
    menuListEl.appendChild(headerLi);

    for (const item of items) {
      const li = document.createElement("li");
      li.className = "menu-item";

      const nameDiv = document.createElement("div");
      nameDiv.innerHTML = `<strong>${item.name}</strong> (${item.category}) - ${item.price.toFixed(
        2
      )} €`;

      const tagsDiv = document.createElement("div");
      tagsDiv.className = "small";
      tagsDiv.textContent = item.tags.length ? item.tags.join(", ") : "No special tags";

      const addBtn = document.createElement("button");
      addBtn.textContent = "Add";
      addBtn.className = "primary";
      addBtn.addEventListener("click", () => {
        cart.addItem(item.id, 1);
        renderCart();
      });

      li.appendChild(nameDiv);
      li.appendChild(tagsDiv);
      li.appendChild(addBtn);
      menuListEl.appendChild(li);
    }
  }
}

function renderCart() {
  if (!cartItemsEl || !cartTotalEl) return;

  cartItemsEl.innerHTML = "";
  const items = cart.getItems();
  const menu = menuRepo.findAll();

  if (items.length === 0) {
    cartItemsEl.innerHTML = "<li class='small'>Cart is empty.</li>";
  } else {
    for (const ci of items) {
      const mi = menu.find((m) => m.id === ci.menuItemId);
      if (!mi) continue;

      const li = document.createElement("li");
      li.className = "cart-item";

      li.innerHTML = `<strong>${mi.name}</strong> x ${ci.quantity}`;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.className = "danger";
      removeBtn.addEventListener("click", () => {
        cart.removeItem(mi.id);
        renderCart();
      });

      li.appendChild(document.createTextNode(" "));
      li.appendChild(removeBtn);

      cartItemsEl.appendChild(li);
    }
  }

  const total = pricing.computeTotal(items, menu);
  cartTotalEl.textContent = total.toFixed(2);
}

function renderOrders() {
  if (!ordersListEl) return;

  ordersListEl.innerHTML = "";

  const allOrders = orderRepo.findAll();
  const menu = menuRepo.findAll();

  if (allOrders.length === 0) {
    ordersListEl.innerHTML = "<li class='small'>No orders yet.</li>";
    return;
  }

  for (const order of allOrders) {
    const li = document.createElement("li");
    li.className = "order-item";

    const header = document.createElement("div");
    const pickupStr = order.pickupTime
      ? order.pickupTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

    header.innerHTML = `
      <strong>Order #${order.id}</strong><br/>
      <span class="small">User: ${order.userId}</span><br/>
      <span class="small">Pickup: ${pickupStr}</span>
    `;

    const statusSpan = document.createElement("span");
    statusSpan.className = `status-badge status-${order.status}`;
    statusSpan.textContent = order.status;

    const advanceBtn = document.createElement("button");
    advanceBtn.textContent = "Next status";
    if (order.status === OrderStatus.PICKED_UP) {
      advanceBtn.disabled = true;
    }
    advanceBtn.addEventListener("click", () => {
      order.advanceStatus();
      orderRepo.save(order);
      orderSubject.notify(order.id, order.status);
    });

    const statusDiv = document.createElement("div");
    statusDiv.appendChild(statusSpan);
    statusDiv.appendChild(advanceBtn);

    const topRow = document.createElement("div");
    topRow.className = "row";
    topRow.appendChild(header);
    topRow.appendChild(statusDiv);

    const itemsP = document.createElement("p");
    itemsP.className = "small";
    const itemLines = order.items
      .map((ci) => {
        const mi = menu.find((m) => m.id === ci.menuItemId);
        const name = mi ? mi.name : "Unknown";
        return `${name} x ${ci.quantity}`;
      })
      .join(", ");
    itemsP.textContent = itemLines || "No items";

    const totalP = document.createElement("p");
    totalP.className = "small";
    totalP.textContent = `Total: ${order.total.toFixed(2)} €`;

    li.appendChild(topRow);
    li.appendChild(itemsP);
    li.appendChild(totalP);
    ordersListEl.appendChild(li);
  }
}

// ===== EVENTS =====

if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", () => {
    if (studentMessageEl) studentMessageEl.textContent = "";

    const items = cart.getItems();
    if (items.length === 0) {
      if (studentMessageEl) studentMessageEl.textContent = "Cart is empty.";
      return;
    }

    const menu = menuRepo.findAll();
    const total = pricing.computeTotal(items, menu);

    let pickupDate;
    if (pickupTimeEl && pickupTimeEl.value) {
      const [h, m] = pickupTimeEl.value.split(":").map(Number);
      pickupDate = new Date();
      pickupDate.setHours(h, m, 0, 0);
    } else {
      pickupDate = new Date(Date.now() + 30 * 60 * 1000);
    }

    const orderId = `o${Date.now()}`;
    const order = new Order({
      id: orderId,
      userId: currentStudent.id,
      items,
      status: OrderStatus.RECEIVED,
      pickupTime: pickupDate,
      total,
    });

    orderRepo.save(order);
    orderSubject.notify(order.id, order.status);
    cart.clear();
    renderCart();

    if (studentMessageEl)
      studentMessageEl.textContent = `Order placed! Your order id is ${orderId}.`;
  });
}

if (categoryFilterEl) {
  categoryFilterEl.addEventListener("change", renderMenu);
}
if (tagFilterEl) {
  tagFilterEl.addEventListener("change", renderMenu);
}

renderMenu();
renderCart();
renderOrders();

