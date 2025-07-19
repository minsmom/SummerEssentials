import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, updateProductSchema, loginSchema, changePasswordSchema } from "@shared/schema";
import { sessionMiddleware, requireAuth, requireAdmin } from "./auth";
import { upload, parseExcelFile, parseCsvFile, parseJsonFile, generateSampleTemplate } from "./fileUpload";
import * as XLSX from "xlsx";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(sessionMiddleware);

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.validateUserPassword(username, password);
      
      if (!user) {
        return res.status(401).json({ error: "잘못된 사용자명 또는 비밀번호입니다" });
      }

      if (!user.isAdmin) {
        return res.status(403).json({ error: "관리자 권한이 필요합니다" });
      }

      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      
      res.json({ 
        message: "로그인 성공", 
        user: { 
          id: user.id, 
          username: user.username, 
          isAdmin: user.isAdmin 
        } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "입력값이 올바르지 않습니다", details: error.errors });
      }
      res.status(500).json({ error: "로그인 처리 중 오류가 발생했습니다" });
    }
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "로그아웃 처리 중 오류가 발생했습니다" });
      }
      res.json({ message: "로그아웃되었습니다" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });
      }
      res.json({ 
        id: user.id, 
        username: user.username, 
        isAdmin: user.isAdmin 
      });
    } catch (error) {
      res.status(500).json({ error: "사용자 정보 조회 중 오류가 발생했습니다" });
    }
  });

  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });
      }

      const validUser = await storage.validateUserPassword(user.username, currentPassword);
      if (!validUser) {
        return res.status(401).json({ error: "현재 비밀번호가 올바르지 않습니다" });
      }

      const success = await storage.updateUserPassword(user.id, newPassword);
      if (!success) {
        return res.status(500).json({ error: "비밀번호 변경에 실패했습니다" });
      }

      res.json({ message: "비밀번호가 성공적으로 변경되었습니다" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "입력값이 올바르지 않습니다", details: error.errors });
      }
      res.status(500).json({ error: "비밀번호 변경 중 오류가 발생했습니다" });
    }
  });

  // File upload and bulk import routes
  app.post("/api/products/bulk-import", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "파일을 선택해주세요" });
      }

      let products;
      const { mimetype, buffer } = req.file;

      if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          mimetype === 'application/vnd.ms-excel') {
        products = await parseExcelFile(buffer);
      } else if (mimetype === 'text/csv') {
        products = await parseCsvFile(buffer);
      } else if (mimetype === 'application/json') {
        products = await parseJsonFile(buffer);
      } else {
        return res.status(400).json({ error: "지원되지 않는 파일 형식입니다" });
      }

      if (products.length === 0) {
        return res.status(400).json({ error: "유효한 상품 데이터가 없습니다" });
      }

      const createdProducts = await storage.createProducts(products);
      
      res.json({ 
        message: `${createdProducts.length}개의 상품이 성공적으로 등록되었습니다`,
        count: createdProducts.length,
        products: createdProducts
      });
    } catch (error) {
      console.error("Bulk import error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "대량 등록 중 오류가 발생했습니다" 
      });
    }
  });

  app.get("/api/products/template", requireAdmin, (req, res) => {
    try {
      const format = req.query.format as string || 'excel';
      const sampleData = generateSampleTemplate();

      if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "상품목록");
        
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=product_template.xlsx');
        res.send(buffer);
      } else if (format === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const csvData = XLSX.utils.sheet_to_csv(worksheet);
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=product_template.csv');
        res.send('\uFEFF' + csvData); // Add BOM for proper Korean display
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=product_template.json');
        res.json(sampleData);
      } else {
        res.status(400).json({ error: "지원되지 않는 형식입니다. excel, csv, json 중 선택해주세요" });
      }
    } catch (error) {
      res.status(500).json({ error: "템플릿 생성 중 오류가 발생했습니다" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getActiveProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/all", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all products" });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      const products = await storage.searchProducts(q);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "상품 데이터가 올바르지 않습니다", details: error.errors });
      }
      res.status(500).json({ error: "상품 생성에 실패했습니다" });
    }
  });

  app.put("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "올바르지 않은 상품 ID입니다" });
      }
      const updateData = updateProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, updateData);
      if (!product) {
        return res.status(404).json({ error: "상품을 찾을 수 없습니다" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "상품 데이터가 올바르지 않습니다", details: error.errors });
      }
      res.status(500).json({ error: "상품 수정에 실패했습니다" });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "올바르지 않은 상품 ID입니다" });
      }
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ error: "상품을 찾을 수 없습니다" });
      }
      res.json({ message: "상품이 성공적으로 삭제되었습니다" });
    } catch (error) {
      res.status(500).json({ error: "상품 삭제에 실패했습니다" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
