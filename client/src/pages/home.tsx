import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import BottomNavigation from "@/components/BottomNavigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: searchQuery 
      ? ["/api/products/search", { q: searchQuery }]
      : activeCategory === "all" 
        ? ["/api/products"]
        : ["/api/products/category", activeCategory],
    queryFn: async ({ queryKey }) => {
      if (searchQuery) {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        return response.json();
      } else if (activeCategory === "all") {
        const response = await fetch('/api/products');
        return response.json();
      } else {
        const response = await fetch(`/api/products/category/${activeCategory}`);
        return response.json();
      }
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveCategory("all");
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🔥 2025 여름 인기템</h2>
              <p className="text-blue-100 font-medium">BEST 5 특가 모음</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "all", label: "전체" },
            { id: "cooling", label: "쿨링용품" },
            { id: "electronics", label: "전자제품" },
            { id: "appliances", label: "가전제품" },
            { id: "gaming", label: "게이밍" },
            { id: "office", label: "사무용품" },
            { id: "lighting", label: "조명" }
          ].map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4">
                  <Skeleton className="w-full h-48 mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </>
          ) : products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchQuery 
                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                : "상품이 없습니다."
              }
            </div>
          )}
        </div>

        {/* CTA Section */}
        {!searchQuery && (
          <div className="mt-8 bg-gradient-to-r from-success to-primary rounded-2xl p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-2">더 많은 여름 할인템 보기</h3>
            <p className="text-white/90 mb-4">매일 업데이트되는 특가 상품들을 확인하세요</p>
            <button className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              전체 상품 보기
            </button>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
