import multer from "multer";
import * as XLSX from "xlsx";
import csv from "csv-parser";
import { Readable } from "stream";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept Excel, CSV, and JSON files
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/json' // .json
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원되지 않는 파일 형식입니다. Excel (.xlsx, .xls), CSV (.csv), JSON (.json) 파일만 업로드 가능합니다.'));
    }
  }
});

// Parse Excel files
export async function parseExcelFile(buffer: Buffer): Promise<InsertProduct[]> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  return parseProductData(jsonData);
}

// Parse CSV files
export async function parseCsvFile(buffer: Buffer): Promise<InsertProduct[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        try {
          const products = parseProductData(results);
          resolve(products);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Parse JSON files
export async function parseJsonFile(buffer: Buffer): Promise<InsertProduct[]> {
  const jsonData = JSON.parse(buffer.toString());
  const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
  return parseProductData(dataArray);
}

// Common function to parse and validate product data
function parseProductData(data: any[]): InsertProduct[] {
  const products: InsertProduct[] = [];
  const errors: string[] = [];

  data.forEach((row, index) => {
    try {
      // Map common column names to our schema
      const mappedRow = {
        name: row.name || row['상품명'] || row['제품명'] || row['이름'],
        description: row.description || row['설명'] || row['상품설명'] || row['제품설명'],
        price: parsePrice(row.price || row['가격'] || row['판매가']),
        originalPrice: parsePrice(row.originalPrice || row['원가'] || row['정가'] || row['기존가격']) || null,
        rating: parseFloat(row.rating || row['평점'] || row['별점']) || 0,
        imageUrl: row.imageUrl || row['이미지URL'] || row['이미지주소'] || row['image_url'] || '',
        category: row.category || row['카테고리'] || row['분류'] || '',
        badge: row.badge || row['뱃지'] || row['태그'] || null,
        purchaseLinks: parsePurchaseLinks(row.purchaseLinks || row['구매링크'] || row['링크'] || row['purchase_links']),
        isActive: parseActive(row.isActive || row['활성화'] || row['상태'] || row['is_active'])
      };

      // Validate the mapped data
      const validatedProduct = insertProductSchema.parse(mappedRow);
      products.push(validatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(`행 ${index + 1}: ${error.errors.map(e => e.message).join(', ')}`);
      } else {
        errors.push(`행 ${index + 1}: 데이터 파싱 오류`);
      }
    }
  });

  if (errors.length > 0) {
    throw new Error(`데이터 검증 오류:\n${errors.join('\n')}`);
  }

  return products;
}

// Helper functions
function parsePrice(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove currency symbols and parse
    const cleaned = value.replace(/[^\d.]/g, '');
    const parsed = parseInt(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function parsePurchaseLinks(value: any): string[] {
  if (Array.isArray(value)) return value.filter(link => typeof link === 'string');
  if (typeof value === 'string') {
    // Split by comma, semicolon, or newline
    return value.split(/[,;\n]/).map(link => link.trim()).filter(link => link.length > 0);
  }
  return [];
}

function parseActive(value: any): number {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return value === 1 ? 1 : 0;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '활성' || lower === '1' || lower === 'active') return 1;
    return 0;
  }
  return 1; // default to active
}

// Generate sample template data
export function generateSampleTemplate() {
  return [
    {
      name: "무선 냉풍기",
      description: "USB 충전식 / LED 조명 / 여름 필수템!",
      price: 49900,
      originalPrice: 79900,
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      category: "cooling",
      badge: "🔥 인기",
      purchaseLinks: "https://s.click.aliexpress.com/e/_DehZACB,https://link.coupang.com/a/XXXX",
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
      purchaseLinks: "https://link.coupang.com/a/YYYY",
      isActive: 1
    }
  ];
}