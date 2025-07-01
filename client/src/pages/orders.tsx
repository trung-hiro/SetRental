import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, Check, Shirt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatDateRange } from "@/lib/date-utils";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "upcoming", label: "Sắp tới" },
  { value: "shipped", label: "Đã ship" },
  { value: "active", label: "Đang thuê" },
  { value: "returned", label: "Đã trả" },
  { value: "cancelled", label: "Đã hủy" },
];

const statusColors = {
  upcoming: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  active: "bg-green-100 text-green-800",
  returned: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  upcoming: "Sắp tới",
  shipped: "Đã ship",
  active: "Đang thuê",
  returned: "Đã trả",
  cancelled: "Đã hủy",
};

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest('PATCH', `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Thành công",
        description: "Trạng thái đơn hàng đã được cập nhật",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi cập nhật trạng thái",
        variant: "destructive",
      });
    },
  });

  const filteredOrders = (orders as any[]).filter((order: any) => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerPhone.includes(searchTerm) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleMarkAsShipped = (orderId: number) => {
    if (confirm("Xác nhận đánh dấu đơn hàng này đã ship?")) {
      updateStatusMutation.mutate({ id: orderId, status: "shipped" });
    }
  };

  const handleMarkAsReturned = (orderId: number) => {
    if (confirm("Xác nhận đánh dấu đơn hàng này đã trả?")) {
      updateStatusMutation.mutate({ id: orderId, status: "returned" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Quản lý đơn hàng</h2>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Tìm theo tên hoặc SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bộ đồ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Skeleton className="w-10 h-10 rounded-lg mr-3" />
                          <div>
                            <Skeleton className="h-4 w-28 mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-8 w-16" />
                      </td>
                    </tr>
                  ))
                ) : paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {order.items[0]?.clothingSet?.imageUrl ? (
                            <img 
                              src={order.items[0].clothingSet.imageUrl} 
                              alt={order.items[0].clothingSet.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                              <Shirt size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.items.length === 1 
                                ? order.items[0].clothingSet.name
                                : `${order.items.length} bộ đồ`
                              }
                            </div>
                            <div className="text-sm text-gray-500">
                              Tổng SL: {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(order.startDate)}</div>
                        <div className="text-sm text-gray-500">đến {formatDate(order.endDate)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`${statusColors[order.status as keyof typeof statusColors]} text-xs font-medium`}>
                          {statusLabels[order.status as keyof typeof statusLabels]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(parseFloat(order.totalAmount))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-800">
                            <Eye className="mr-1" size={14} />
                            Xem
                          </Button>
                          {order.status === 'upcoming' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-purple-600 hover:text-purple-800"
                              onClick={() => handleMarkAsShipped(order.id)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <Shirt className="mr-1" size={14} />
                              Đã ship
                            </Button>
                          )}
                          {(order.status === 'shipped' || order.status === 'active') && order.status !== 'returned' && order.status !== 'cancelled' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 hover:text-green-800"
                              onClick={() => handleMarkAsReturned(order.id)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <Check className="mr-1" size={14} />
                              Đã trả
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Shirt size={48} className="text-gray-400 mb-4" />
                        <p className="text-gray-500">
                          {searchTerm || statusFilter !== "all" 
                            ? "Không tìm thấy đơn hàng nào phù hợp"
                            : "Chưa có đơn hàng nào"
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {Math.min((currentPage - 1) * itemsPerPage + 1, filteredOrders.length)}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
                  </span>{" "}
                  của <span className="font-medium">{filteredOrders.length}</span> đơn hàng
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => {
                      if (index > 0 && array[index - 1] !== page - 1) {
                        return (
                          <span key={`ellipsis-${page}`} className="px-2">...</span>
                        );
                      }
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
