import { 
  clothingSets, 
  orders, 
  orderItems,
  categories,
  type ClothingSet, 
  type InsertClothingSet,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type OrderWithItems,
  type Category,
  type InsertCategory
} from "@shared/schema";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Clothing Sets
  getClothingSets(): Promise<ClothingSet[]>;
  getClothingSet(id: number): Promise<ClothingSet | undefined>;
  createClothingSet(set: InsertClothingSet): Promise<ClothingSet>;
  updateClothingSet(id: number, set: Partial<InsertClothingSet>): Promise<ClothingSet | undefined>;
  deleteClothingSet(id: number): Promise<boolean>;
  
  // Orders
  getOrders(): Promise<OrderWithItems[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Inventory
  getAvailableQuantity(clothingSetId: number, startDate: Date, endDate: Date): Promise<number>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalSets: number;
    activeRentals: number;
    pendingReturns: number;
    monthlyRevenue: number;
  }>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private clothingSets: Map<number, ClothingSet>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private currentCategoryId: number;
  private currentClothingSetId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentOrderNumber: number;

  constructor() {
    this.categories = new Map();
    this.clothingSets = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentCategoryId = 1;
    this.currentClothingSetId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentOrderNumber = 1;
    
    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories = [
      { name: "Đầm dạ hội", description: "Váy đầm sang trọng cho các sự kiện đặc biệt" },
      { name: "Vest nam", description: "Bộ vest lịch lãm cho nam giới" },
      { name: "Áo cưới", description: "Trang phục cưới hỏi truyền thống và hiện đại" },
      { name: "Trang phục truyền thống", description: "Các loại trang phục truyền thống Việt Nam" },
      { name: "Áo dài", description: "Áo dài truyền thống Việt Nam" },
      { name: "Suit nữ", description: "Bộ suit công sở cho nữ" },
    ];

    defaultCategories.forEach(cat => {
      const category: Category = {
        id: this.currentCategoryId++,
        name: cat.name,
        description: cat.description,
        isActive: true,
        createdAt: new Date(),
      };
      this.categories.set(category.id, category);
    });
  }

  // Categories methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.isActive);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = {
      id,
      name: insertCategory.name,
      description: insertCategory.description || null,
      isActive: insertCategory.isActive !== undefined ? insertCategory.isActive : true,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, updateCategory: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    
    const updated: Category = { 
      ...existing, 
      ...updateCategory,
      description: updateCategory.description !== undefined ? updateCategory.description : existing.description
    };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const existing = this.categories.get(id);
    if (!existing) return false;
    
    // Check if category is being used by clothing sets
    const setsUsingCategory = Array.from(this.clothingSets.values()).filter(
      set => set.category === existing.name && set.isActive
    );
    
    if (setsUsingCategory.length > 0) {
      throw new Error("Không thể xóa danh mục đang được sử dụng bởi bộ đồ");
    }
    
    const updated: Category = { ...existing, isActive: false };
    this.categories.set(id, updated);
    return true;
  }

  async getClothingSets(): Promise<ClothingSet[]> {
    return Array.from(this.clothingSets.values()).filter(set => set.isActive);
  }

  async getClothingSet(id: number): Promise<ClothingSet | undefined> {
    return this.clothingSets.get(id);
  }

  async createClothingSet(insertSet: InsertClothingSet): Promise<ClothingSet> {
    const id = this.currentClothingSetId++;
    const set: ClothingSet = {
      id,
      name: insertSet.name,
      description: insertSet.description || null,
      category: insertSet.category,
      quantity: insertSet.quantity || 1,
      pricePerDay: insertSet.pricePerDay,
      imageUrl: insertSet.imageUrl || null,
      isActive: insertSet.isActive !== undefined ? insertSet.isActive : true,
      createdAt: new Date(),
    };
    this.clothingSets.set(id, set);
    return set;
  }

  async updateClothingSet(id: number, updateSet: Partial<InsertClothingSet>): Promise<ClothingSet | undefined> {
    const existing = this.clothingSets.get(id);
    if (!existing) return undefined;
    
    const updated: ClothingSet = { ...existing, ...updateSet };
    this.clothingSets.set(id, updated);
    return updated;
  }

  async deleteClothingSet(id: number): Promise<boolean> {
    const existing = this.clothingSets.get(id);
    if (!existing) return false;
    
    const updated: ClothingSet = { ...existing, isActive: false };
    this.clothingSets.set(id, updated);
    return true;
  }

  async getOrders(): Promise<OrderWithItems[]> {
    const allOrders = Array.from(this.orders.values());
    const ordersWithItems: OrderWithItems[] = [];
    
    for (const order of allOrders) {
      const items = Array.from(this.orderItems.values())
        .filter(item => item.orderId === order.id)
        .map(item => ({
          ...item,
          clothingSet: this.clothingSets.get(item.clothingSetId)!
        }));
      
      ordersWithItems.push({ ...order, items });
    }
    
    return ordersWithItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => ({
        ...item,
        clothingSet: this.clothingSets.get(item.clothingSetId)!
      }));
    
    return { ...order, items };
  }

  async createOrder(insertOrder: InsertOrder, insertItems: InsertOrderItem[]): Promise<OrderWithItems> {
    const id = this.currentOrderId++;
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(this.currentOrderNumber++).padStart(3, '0')}`;
    
    const order: Order = {
      id,
      orderNumber,
      customerName: insertOrder.customerName,
      customerPhone: insertOrder.customerPhone,
      customerEmail: insertOrder.customerEmail || null,
      startDate: insertOrder.startDate,
      endDate: insertOrder.endDate,
      status: insertOrder.status || "upcoming",
      totalAmount: insertOrder.totalAmount,
      notes: insertOrder.notes || null,
      createdAt: new Date(),
    };
    
    this.orders.set(id, order);
    
    const items: (OrderItem & { clothingSet: ClothingSet })[] = [];
    for (const insertItem of insertItems) {
      const itemId = this.currentOrderItemId++;
      const item: OrderItem = {
        id: itemId,
        orderId: id,
        clothingSetId: insertItem.clothingSetId,
        quantity: insertItem.quantity || 1,
        pricePerDay: insertItem.pricePerDay,
      };
      this.orderItems.set(itemId, item);
      
      const clothingSet = this.clothingSets.get(item.clothingSetId)!;
      items.push({ ...item, clothingSet });
    }
    
    return { ...order, items };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    
    const updated: Order = { ...existing, status };
    this.orders.set(id, updated);
    return updated;
  }

  async getAvailableQuantity(clothingSetId: number, startDate: Date, endDate: Date): Promise<number> {
    const clothingSet = this.clothingSets.get(clothingSetId);
    if (!clothingSet) return 0;
    
    // Get all orders that overlap with the requested date range
    const overlappingOrders = Array.from(this.orders.values()).filter(order => {
      if (order.status === 'cancelled' || order.status === 'returned') return false;
      
      const orderStart = new Date(order.startDate);
      const orderEnd = new Date(order.endDate);
      
      return (orderStart <= endDate && orderEnd >= startDate);
    });
    
    // Calculate total quantity booked for this clothing set
    let bookedQuantity = 0;
    for (const order of overlappingOrders) {
      const items = Array.from(this.orderItems.values()).filter(item => 
        item.orderId === order.id && item.clothingSetId === clothingSetId
      );
      bookedQuantity += items.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    return Math.max(0, clothingSet.quantity - bookedQuantity);
  }

  async getDashboardStats(): Promise<{
    totalSets: number;
    activeRentals: number;
    pendingReturns: number;
    monthlyRevenue: number;
  }> {
    const totalSets = Array.from(this.clothingSets.values()).filter(set => set.isActive).length;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Active rentals: orders that are currently ongoing (today is between start and end date)
    const activeRentals = Array.from(this.orders.values()).filter(order => {
      if (order.status === 'cancelled') return false;
      const startDate = new Date(order.startDate);
      const endDate = new Date(order.endDate);
      return today >= startDate && today <= endDate;
    }).length;
    
    // Pending returns: active orders that have passed their end date
    const pendingReturns = Array.from(this.orders.values()).filter(order => {
      if (order.status === 'cancelled' || order.status === 'returned') return false;
      const endDate = new Date(order.endDate);
      return today > endDate;
    }).length;
    
    // Monthly revenue: total revenue from orders created this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthlyOrders = Array.from(this.orders.values()).filter(order => {
      if (order.status === 'cancelled') return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfMonth && orderDate <= endOfMonth;
    });
    
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => 
      sum + parseFloat(order.totalAmount.toString()), 0
    );
    
    return {
      totalSets,
      activeRentals,
      pendingReturns,
      monthlyRevenue
    };
  }
}

export const storage = new MemStorage();
