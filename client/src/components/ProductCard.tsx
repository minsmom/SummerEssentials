import { Product } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const handlePurchaseClick = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.badge && (
          <div className="absolute top-3 left-3 bg-secondary text-white px-2 py-1 rounded-full text-xs font-medium">
            {product.badge}
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
          <Heart className="w-4 h-4 text-gray-600" />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              ₩{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₩{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{product.rating}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {product.purchaseLinks.map((link, index) => (
            <Button
              key={index}
              onClick={() => handlePurchaseClick(link)}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                index === 0
                  ? "bg-primary text-white hover:bg-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {link.includes("aliexpress") ? "알리에서 보기" : 
               link.includes("coupang") ? "쿠팡 보기" : 
               `구매하기 ${index + 1}`}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
