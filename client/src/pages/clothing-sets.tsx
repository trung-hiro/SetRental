import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Shirt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ClothingSetModal from "@/components/clothing-set-modal";

const categories = [
  "Tất cả danh mục",
  "Đầm dạ hội",
  "Vest nam", 
  "Áo cưới",
  "Trang phục truyền thống",
  "Áo dài",
  "Suit nữ",
];

export default function ClothingSets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả danh mục");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clothingSets, isLoading } = useQuery({
    queryKey: ['/api/clothing-sets'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/clothing-sets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clothing-sets'] });
      toast({
        title: "Thành công",
        description: "Bộ đồ đã được xóa thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi xóa bộ đồ",
        variant: "destructive",
      });
    },
  });

  const filteredSets = clothingSets?.filter((set: any) => {
    const matchesSearch = set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         set.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả danh mục" || 
                           set.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleEdit = (set: any) => {
    setEditingSet(set);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bộ đồ này?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingSet(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Quản lý bộ đồ</h2>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2" size={16} />
          Thêm bộ đồ mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Tìm kiếm bộ đồ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clothing Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredSets.length > 0 ? (
          filteredSets.map((set: any) => (
            <Card key={set.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              {set.imageUrl ? (
                <img 
                  src={set.imageUrl} 
                  alt={set.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Shirt size={48} className="text-gray-400" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{set.name}</h3>
                  <Badge variant={set.isActive ? "default" : "secondary"}>
                    {set.isActive ? "Có sẵn" : "Không có sẵn"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {set.description || "Không có mô tả"}
                </p>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-600">Số lượng: <span className="font-medium">{set.quantity}</span></span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(parseFloat(set.pricePerDay))}/ngày
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(set)}
                  >
                    <Edit className="mr-1" size={14} />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(set.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Shirt size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== "Tất cả danh mục" 
                ? "Không tìm thấy bộ đồ nào phù hợp"
                : "Chưa có bộ đồ nào"
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <ClothingSetModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        clothingSet={editingSet}
      />
    </div>
  );
}
