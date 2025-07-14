import { users, products, type User, type InsertUser, type Product, type InsertProduct, type UpdateProduct } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getActiveProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: UpdateProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private currentUserId: number;
  private currentProductId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    
    // Initialize with sample products
    this.initializeSampleProducts();
  }

  private initializeSampleProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "무선 냉풍기",
        description: "USB 충전식 / LED 조명 / 여름 필수템!",
        price: 49900,
        originalPrice: 79900,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "cooling",
        badge: "🔥 인기",
        purchaseLinks: ["https://s.click.aliexpress.com/e/_DehZACB", "https://link.coupang.com/a/XXXX"],
        isActive: 1
      },
      {
        name: "핸디 선풍기",
        description: "가볍고 강력한 바람 / 출퇴근 필수템",
        price: 24900,
        originalPrice: 39900,
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "cooling",
        badge: "⚡ 빠른배송",
        purchaseLinks: ["https://link.coupang.com/a/YYYY"],
        isActive: 1
      },
      {
        name: "넥밴드 선풍기",
        description: "목에 걸고 다니는 무선 선풍기",
        price: 69900,
        originalPrice: 89900,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "cooling",
        badge: "🆕 신상품",
        purchaseLinks: ["https://s.click.aliexpress.com/e/_DlUdrDV"],
        isActive: 1
      },
      {
        name: "미니 냉장고",
        description: "차박 & 캠핑용 미니 냉장고",
        price: 149900,
        originalPrice: 199900,
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "appliances",
        badge: "🏕️ 캠핑추천",
        purchaseLinks: ["https://link.coupang.com/a/ZZZZ"],
        isActive: 1
      },
      {
        name: "쿨링 방석",
        description: "시원한 젤 방석 / 여름 필수템",
        price: 19900,
        originalPrice: 29900,
        rating: 4.4,
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "cooling",
        badge: "❄️ 시원함",
        purchaseLinks: ["https://s.click.aliexpress.com/e/_DFQxJmL"],
        isActive: 1
      }
    ];

    sampleProducts.forEach(product => {
      const id = this.currentProductId++;
      this.products.set(id, { ...product, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getActiveProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive === 1);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updateProduct: UpdateProduct): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated: Product = { ...existing, ...updateProduct };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(p => 
      p.isActive === 1 && (
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      )
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => 
      p.isActive === 1 && p.category === category
    );
  }
}

export const storage = new MemStorage();
