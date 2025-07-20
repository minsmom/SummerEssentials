import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function ProductPage() {
  const [match, params] = useRoute("/product/:id");
  const productId = params?.id;

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('상품을 찾을 수 없습니다');
      }
      return response.json();
    },
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">상품을 찾을 수 없습니다</h1>
          <Link href="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-4 z-10">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-semibold truncate">{product.name}</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Product Image */}
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {product.badge && (
                  <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
                    {product.badge}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-1">
                ({product.rating}/5.0)
              </span>
            </div>

            {/* Price */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-red-600">
                    {product.price.toLocaleString()}원
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      {product.originalPrice.toLocaleString()}원
                    </span>
                  )}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="mt-2">
                    <span className="text-sm text-green-600 font-semibold">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% 할인
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Purchase Links */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">구매하기</h3>
              {product.purchaseLinks.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full justify-between" size="lg">
                    <span>
                      {link.includes('aliexpress') ? '알리익스프레스' : 
                       link.includes('coupang') ? '쿠팡' : 
                       `구매처 ${index + 1}`}에서 구매
                    </span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              ))}
            </div>

            {/* Additional Info */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>카테고리</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>상품 ID</span>
                    <span className="font-medium">#{product.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}