import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, InsertProduct, UpdateProduct } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Admin() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/all"],
  });

  const createMutation = useMutation({
    mutationFn: async (product: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsCreating(false);
      toast({
        title: "성공",
        description: "상품이 생성되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "상품 생성에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, product }: { id: number; product: UpdateProduct }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      toast({
        title: "성공",
        description: "상품이 업데이트되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "상품 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "성공",
        description: "상품이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "상품 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const purchaseLinks = formData.get("purchaseLinks") as string;
    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseInt(formData.get("price") as string),
      originalPrice: formData.get("originalPrice") ? parseInt(formData.get("originalPrice") as string) : undefined,
      rating: parseFloat(formData.get("rating") as string),
      imageUrl: formData.get("imageUrl") as string,
      category: formData.get("category") as string,
      badge: formData.get("badge") as string || undefined,
      purchaseLinks: purchaseLinks.split('\n').filter(link => link.trim()),
      isActive: formData.get("isActive") === "on" ? 1 : 0,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, product: productData });
    } else {
      createMutation.mutate(productData as InsertProduct);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              메인으로
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">상품 관리</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingProduct ? "상품 수정" : isCreating ? "상품 추가" : "상품 관리"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(isCreating || editingProduct) ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">상품명</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingProduct?.name}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingProduct?.description}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">가격 (원)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        defaultValue={editingProduct?.price}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">정가 (원)</Label>
                      <Input
                        id="originalPrice"
                        name="originalPrice"
                        type="number"
                        defaultValue={editingProduct?.originalPrice}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="rating">평점</Label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      defaultValue={editingProduct?.rating}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl">이미지 URL</Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      defaultValue={editingProduct?.imageUrl}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">카테고리</Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={editingProduct?.category}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="badge">배지</Label>
                    <Input
                      id="badge"
                      name="badge"
                      defaultValue={editingProduct?.badge}
                      placeholder="예: 🔥 인기"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="purchaseLinks">구매 링크 (줄바꿈으로 구분)</Label>
                    <Textarea
                      id="purchaseLinks"
                      name="purchaseLinks"
                      defaultValue={editingProduct?.purchaseLinks?.join('\n')}
                      placeholder="https://example.com/product1&#10;https://example.com/product2"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      name="isActive"
                      defaultChecked={editingProduct?.isActive === 1}
                    />
                    <Label htmlFor="isActive">활성 상태</Label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingProduct ? "수정" : "추가"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      취소
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">상품을 추가하거나 수정하세요</p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    새 상품 추가
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product List */}
          <Card>
            <CardHeader>
              <CardTitle>상품 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div>로딩 중...</div>
                ) : products && products.length > 0 ? (
                  products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{product.name}</h3>
                            {product.badge && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {product.badge}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              product.isActive 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {product.isActive ? "활성" : "비활성"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-semibold">₩{product.price.toLocaleString()}</span>
                            {product.originalPrice && (
                              <span className="text-gray-500 line-through">
                                ₩{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                            <span>⭐ {product.rating}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    상품이 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
