import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, InsertProduct, UpdateProduct, changePasswordSchema, type ChangePasswordData } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ArrowLeft, Upload, Download, Key, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

export default function Admin() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/all"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      toast({
        title: "로그아웃",
        description: "성공적으로 로그아웃되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      navigate("/login");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      await apiRequest("POST", "/api/auth/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      });
      setShowPasswordDialog(false);
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "비밀번호 변경에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/products/bulk-import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '파일 업로드에 실패했습니다');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "대량 등록 성공",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setUploadProgress("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: any) => {
      toast({
        title: "대량 등록 실패",
        description: error.message || "파일 업로드에 실패했습니다.",
        variant: "destructive",
      });
      setUploadProgress("");
    },
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/json'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "파일 형식 오류",
        description: "Excel (.xlsx, .xls), CSV (.csv), JSON (.json) 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    setUploadProgress("업로드 중...");
    bulkImportMutation.mutate(file);
  };

  const downloadTemplate = (format: string) => {
    const url = `/api/products/template?format=${format}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `product_template.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onPasswordSubmit = (data: ChangePasswordData) => {
    changePasswordMutation.mutate(data);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setIsCreating(false);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  if (!user || !user.isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">리디렉션 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                홈으로
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">상품 관리</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.username}님 환영합니다
            </span>
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Key className="h-4 w-4 mr-2" />
                  비밀번호 변경
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>비밀번호 변경</DialogTitle>
                </DialogHeader>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>현재 비밀번호</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>새 비밀번호</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>비밀번호 확인</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? "변경 중..." : "변경"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPasswordDialog(false)}
                      >
                        취소
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* Bulk Import Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              대량 상품 등록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">파일 업로드</h3>
                <div className="space-y-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    onChange={handleFileUpload}
                    disabled={bulkImportMutation.isPending}
                  />
                  {uploadProgress && (
                    <div className="text-sm text-blue-600">
                      {uploadProgress}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    지원 형식: Excel (.xlsx, .xls), CSV (.csv), JSON (.json)
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">템플릿 다운로드</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTemplate('excel')}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel 템플릿 다운로드
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTemplate('csv')}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV 템플릿 다운로드
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTemplate('json')}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JSON 템플릿 다운로드
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Management Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">등록된 상품</h2>
          <Button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            상품 추가
          </Button>
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
