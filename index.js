// ENUMS (diagram: Role, OrderStatus)

/** enum Role { STUDENT; STAFF } */
export const Role = Object.freeze({
  STUDENT: "STUDENT",
  STAFF: "STAFF",
});

/** enum OrderStatus { RECEIVED; PREPARING; READY; PICKED_UP } */
export const OrderStatus = Object.freeze({
  RECEIVED: "RECEIVED",
  PREPARING: "PREPARING",
  READY: "READY",
  PICKED_UP: "PICKED_UP",
});

// DOMAIN CLASSES (diagram: User, MenuItem, CartItem, Cart, Order)

/** class User { id: string; name: string; role: Role } */
export class User {
  constructor(id, name, role) {
    /* initialize user properties (id, name, role) */
  }
}

/** class MenuItem { id: string; name: string; price: number; category: string; tags: string[]; available: boolean } */
export class MenuItem {
  constructor(id, name, price, category, tags, available) {
    /* initialize menu item properties (id, name, price, category, tags, available) */
  }
}

/** class CartItem { menuItemId: string; quantity: number } */
export class CartItem {
  constructor(menuItemId, quantity) {
    /* initialize cart item properties (menuItemId, quantity) */
  }
}

/** class Cart { -items: CartItem[]; addItem(menuItemId: string, qty: number); removeItem(menuItemId: string); getItems(): CartItem[] } */
export class Cart {
  constructor() {
    /* create items array to hold CartItem[] */
  }

  addItem(menuItemId, qty) {
    /* add a CartItem with (menuItemId, qty) to items */
  }

  removeItem(menuItemId) {
    /* remove CartItem(s) matching menuItemId from items */
  }

  getItems() {
    /* return a list/array of CartItem entries */
  }
}

/**
 * class Order {
 *   id: string; userId: string; items: CartItem[]; status: OrderStatus; pickupTime: Date; total: number;
 *   calculateTotal(pricing: PricingStrategy): number;
 *   advanceStatus();
 * }
 */
export class Order {
  constructor({ id, userId, items, status, pickupTime, total }) {
    /* initialize order properties per diagram */
  }

  calculateTotal(pricing /*: PricingStrategy */) {
    /* use provided PricingStrategy to compute and/or return total (no implementation) */
  }

  advanceStatus() {
    /* move order status along RECEIVED → PREPARING → READY → PICKED_UP (no implementation) */
  }
}

// INTERFACES & PATTERNS (diagram: PricingStrategy, SimplePricingStrategy, ComboPricingStrategy)

/** interface PricingStrategy { computeTotal(items: CartItem[], menu: MenuItem[]): number } */
export class PricingStrategy {
  computeTotal(items, menu) {
    /* abstract method: compute a numeric total from items and menu; no implementation here */
  }
}

/** class SimplePricingStrategy implements PricingStrategy */
export class SimplePricingStrategy extends PricingStrategy {
  computeTotal(items, menu) {
    /* simple summation strategy placeholder (no implementation) */
  }
}

/** class ComboPricingStrategy implements PricingStrategy */
export class ComboPricingStrategy extends PricingStrategy {
  computeTotal(items, menu) {
    /* combo/discount strategy placeholder (no implementation) */
  }
}

// OBSERVER PATTERN (diagram: OrderObserver, OrderSubject)

/** interface OrderObserver { onStatusChanged(orderId: string, status: OrderStatus) } */
export class OrderObserver {
  onStatusChanged(orderId, status) {
    /* react to order status change (no implementation) */
  }
}

/**
 * class OrderSubject {
 *   observers: OrderObserver[];
 *   attach(o: OrderObserver);
 *   detach(o: OrderObserver);
 *   notify(orderId: string, status: OrderStatus);
 * }
 */
export class OrderSubject {
  constructor() {
    /* initialize observers array */
  }

  attach(observer /*: OrderObserver */) {
    /* add observer to observers list */
  }

  detach(observer /*: OrderObserver */) {
    /* remove observer from observers list */
  }

  notify(orderId, status /*: OrderStatus */) {
    /* iterate observers and call onStatusChanged(orderId, status) */
  }
}

// REPOSITORIES (diagram: MenuRepository, OrderRepository, SqliteMenuRepository, SqliteOrderRepository)

/**
 * interface MenuRepository {
 *   findAll(): MenuItem[];
 *   findById(id: string): MenuItem;
 *   save(item: MenuItem): void;
 *   toggleAvailability(id: string, available: boolean): void;
 * }
 */
export class MenuRepository {
  findAll() {
    /* return all MenuItem entries (no implementation) */
  }

  findById(id) {
    /* return a single MenuItem by id (no implementation) */
  }

  save(item) {
    /* create or update a MenuItem (no implementation) */
  }

  toggleAvailability(id, available) {
    /* set MenuItem availability flag (no implementation) */
  }
}

/**
 * interface OrderRepository {
 *   save(order: Order): void;
 *   findById(id: string): Order;
 *   findByStatus(status: OrderStatus): Order[];
 *   updateStatus(id: string, status: OrderStatus): void;
 * }
 */
export class OrderRepository {
  save(order) {
    /* persist a new Order (no implementation) */
  }

  findById(id) {
    /* fetch an Order by id (no implementation) */
  }

  findByStatus(status) {
    /* fetch Orders by status (no implementation) */
  }

  updateStatus(id, status) {
    /* update the status of an existing Order (no implementation) */
  }
}

/** class SqliteMenuRepository implements MenuRepository */
export class SqliteMenuRepository extends MenuRepository {
  constructor(/* seed?: MenuItem[] */) {
    super();
    /* optionally accept seed data / setup (no implementation) */
  }

  findAll() {
    /* concrete impl placeholder (no implementation) */
  }

  findById(id) {
    /* concrete impl placeholder (no implementation) */
  }

  save(item) {
    /* concrete impl placeholder (no implementation) */
  }

  toggleAvailability(id, available) {
    /* concrete impl placeholder (no implementation) */
  }
}

/** class SqliteOrderRepository implements OrderRepository */
export class SqliteOrderRepository extends OrderRepository {
  constructor() {
    super();
    /* setup internal storage / connection (no implementation) */
  }

  save(order) {
    /* concrete impl placeholder (no implementation) */
  }

  findById(id) {
    /* concrete impl placeholder (no implementation) */
  }

  findByStatus(status) {
    /* concrete impl placeholder (no implementation) */
  }

  updateStatus(id, status) {
    /* concrete impl placeholder (no implementation) */
  }
}
