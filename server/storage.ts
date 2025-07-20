import { users, products, type User, type InsertUser, type Product, type InsertProduct, type UpdateProduct } from "@shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, newPassword: string): Promise<boolean>;
  validateUserPassword(username: string, password: string): Promise<User | null>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getActiveProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  createProducts(products: InsertProduct[]): Promise<Product[]>;
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
    
    // Initialize with default admin user and sample products
    this.initializeDefaultAdmin();
    this.initializeSampleProducts();
  }

  private async initializeDefaultAdmin() {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);
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
      },
      {
        name: "무선 이어폰 Pro",
        description: "노이즈 캔슬링 / 초장시간 배터리",
        price: 89900,
        originalPrice: 149900,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "electronics",
        badge: "🎵 고음질",
        purchaseLinks: ["https://s.click.aliexpress.com/e/_DBpqrHT"],
        isActive: 1
      },
      {
        name: "스마트 워치",
        description: "건강 관리 / 운동 트래킹 / 방수",
        price: 129900,
        originalPrice: 199900,
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1579586337278-3f436f25d4d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "electronics",
        badge: "💪 건강관리",
        purchaseLinks: ["https://link.coupang.com/a/AAAA"],
        isActive: 1
      },
      {
        name: "무선 충전기",
        description: "고속 충전 / 스탠드형 / iPhone & Android 호환",
        price: 39900,
        originalPrice: 59900,
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1616554994735-8e8b97eb9a7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "electronics",
        badge: "⚡ 고속충전",
        purchaseLinks: ["https://s.click.aliexpress.com/e/_DkMpQxV"],
        isActive: 1
      },
      {
        name: "LED 스트립 라이트",
        description: "RGB 컬러 조명 / 음성 제어 / 분위기 연출",
        price: 29900,
        originalPrice: 49900,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "lighting",
        badge: "🌈 RGB",
        purchaseLinks: ["https://link.coupang.com/a/BBBB"],
        isActive: 1
      },
      {
        name: "책상 정리함",
        description: "다용도 수납 / 펜꽂이 / 사무용품 정리",
        price: 15900,
        originalPrice: 25900,
        rating: 4.3,
        imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "office",
        badge: "📝 정리정돈",
        purchaseLinks: ["https://s.click.aliexpress.com/e/_DFhpWxN"],
        isActive: 1
      },
      {
        name: "에어프라이어 5L",
        description: "대용량 / 기름없이 요리 / 디지털 터치",
        price: 79900,
        originalPrice: 129900,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1556909114-4f6e83bb6b4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "appliances",
        badge: "👨‍🍳 요리",
        purchaseLinks: ["https://link.coupang.com/a/CCCC"],
        isActive: 1
      },
      {
        name: "블루투스 스피커",
        description: "방수 기능 / 360도 사운드 / 20시간 재생",
        price: 59900,
        originalPrice: 89900,
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "electronics",
        badge: "🎵 방수",
        purchaseLinks: ["https://s.click.aliexpress.com/e/_DmLpRxT"],
        isActive: 1
      },
      {
        name: "게이밍 마우스",
        description: "RGB 라이팅 / 12000 DPI / 프로게이머 추천",
        price: 45900,
        originalPrice: 69900,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "gaming",
        badge: "🎮 게이밍",
        purchaseLinks: ["https://link.coupang.com/a/DDDD"],
        isActive: 1
      },
      {
        name: "노트북 거치대",
        description: "각도 조절 / 방열 기능 / 넥 보호",
        price: 24900,
        originalPrice: 39900,
        rating: 4.4,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "office",
        badge: "💻 재택근무",
        purchaseLinks: ["https://s.click.aliexpress.com/e/_DnQpXvH"],
        isActive: 1
      },
      {
        name: "USB 허브 7포트",
        description: "고속 데이터 전송 / 개별 스위치 / LED 표시",
        price: 19900,
        originalPrice: 29900,
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1616554994735-8e8b97eb9a7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "electronics",
        badge: "🔌 확장",
        purchaseLinks: ["https://link.coupang.com/a/EEEE"],
        isActive: 1
      }
    ];

    sampleProducts.forEach(product => {
      const id = this.currentProductId++;
      const fullProduct: Product = {
        ...product,
        id,
        originalPrice: product.originalPrice ?? null,
        rating: product.rating ?? 0,
        badge: product.badge ?? null,
        isActive: product.isActive ?? 1
      };
      this.products.set(id, fullProduct);
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
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = { 
      ...insertUser, 
      id, 
      password: hashedPassword,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPassword(id: number, newPassword: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser: User = {
      ...user,
      password: hashedPassword,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return true;
  }

  async validateUserPassword(username: string, password: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(u => u.username === username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
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
    const product: Product = { 
      ...insertProduct, 
      id,
      originalPrice: insertProduct.originalPrice ?? null,
      rating: insertProduct.rating ?? 0,
      badge: insertProduct.badge ?? null,
      isActive: insertProduct.isActive ?? 1
    };
    this.products.set(id, product);
    return product;
  }

  async createProducts(insertProducts: InsertProduct[]): Promise<Product[]> {
    const createdProducts: Product[] = [];
    for (const insertProduct of insertProducts) {
      const product = await this.createProduct(insertProduct);
      createdProducts.push(product);
    }
    return createdProducts;
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
