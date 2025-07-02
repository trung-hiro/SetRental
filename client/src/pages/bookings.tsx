import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { calculateDaysBetween } from "@/lib/date-utils";

import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SetSelectionModal from "@/components/set-selection-modal";

const formSchema = z.object({
  customerName: z.string().min(1, "Tên khách hàng là bắt buộc"),
  customerPhone: z.string().min(10, "Số điện thoại không hợp lệ"),
  customerEmail: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  notes: z.string().optional(),
});

export default function Bookings() {
  const [selectedSet, setSelectedSet] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      startDate: "",
      endDate: "",
      notes: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/orders', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Thành công",
        description: "Đơn hàng đã được tạo thành công",
      });
      form.reset();
      setSelectedSet(null);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi tạo đơn hàng",
        variant: "destructive",
      });
    },
  });

  const checkAvailabilityMutation = useMutation({
    mutationFn: async (data: { clothingSetId: number; startDate: string; endDate: string }) => {
      const response = await apiRequest('POST', '/api/availability/check', data);
      return response.json();
    },
  });

  const handleSetSelection = (set: any) => {
    setSelectedSet(set);
  };

  const handleRemoveSet = () => {
    setSelectedSet(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const calculateTotal = () => {
    const { startDate, endDate } = form.getValues();
    if (!startDate || !endDate || !selectedSet) return 0;

    const days = calculateDaysBetween(startDate, endDate);
    // return parseFloat(selectedSet.pricePerDay) * days;
    return parseFloat(selectedSet.pricePerDay);
  };

  const getRentalDays = () => {
    const { startDate, endDate } = form.getValues();
    if (!startDate || !endDate) return 0;
    return calculateDaysBetween(startDate, endDate);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!selectedSet) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn một bộ đồ",
        variant: "destructive",
      });
      return;
    }

    if (new Date(data.endDate) <= new Date(data.startDate)) {
      toast({
        title: "Lỗi", 
        description: "Ngày kết thúc phải sau ngày bắt đầu",
        variant: "destructive",
      });
      return;
    }

    // Check availability before creating order
    try {
      const availability = await checkAvailabilityMutation.mutateAsync({
        clothingSetId: selectedSet.id,
        startDate: data.startDate,
        endDate: data.endDate,
      });

      if (!availability.available) {
        toast({
          title: "Lỗi",
          description: "Bộ đồ này đã được đặt trong khoảng thời gian bạn chọn. Vui lòng chọn ngày khác.",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kiểm tra tình trạng đặt hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = calculateTotal();
    const order = {
      ...data,
      status: "upcoming",
      totalAmount,
    };

    const items = [{
      clothingSetId: selectedSet.id,
      quantity: 1,
      pricePerDay: parseFloat(selectedSet.pricePerDay),
    }];

    createOrderMutation.mutate({ order, items });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Tạo đơn đặt hàng mới</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên khách hàng *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên khách hàng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số điện thoại" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Nhập email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bắt đầu *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày kết thúc *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Clothing Set Selection */}
              <div className="col-span-2">
                <FormLabel>Chọn bộ đồ *</FormLabel>
                <div className="space-y-3 mt-2">
                  {selectedSet ? (
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {selectedSet.imageUrl && (
                          <img 
                            src={selectedSet.imageUrl} 
                            alt={selectedSet.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{selectedSet.name}</h4>
                          <p className="text-sm text-gray-600">{selectedSet.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-blue-600">
                          {formatCurrency(parseFloat(selectedSet.pricePerDay))}/ngày
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSet()}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full p-4 border-2 border-dashed border-gray-300 hover:border-blue-500"
                      onClick={() => setModalOpen(true)}
                    >
                      <Plus className="mr-2" size={16} />
                      Chọn bộ đồ
                    </Button>
                  )}
                </div>
              </div>

              {/* Summary */}
              {selectedSet && (
                <div className="border-t border-gray-200 pt-6">
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Tóm tắt đơn hàng</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Số ngày thuê:</span>
                          <span>{getRentalDays()} ngày</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bộ đồ:</span>
                          <span>{selectedSet.name}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t border-gray-300 pt-2 mt-2">
                          <span>Tổng tiền:</span>
                          <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ghi chú thêm về đơn hàng..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    form.reset();
                    setSelectedSet(null);
                  }}
                >
                  Xóa tất cả
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createOrderMutation.isPending || checkAvailabilityMutation.isPending}
                >
                  {createOrderMutation.isPending || checkAvailabilityMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {checkAvailabilityMutation.isPending ? "Đang kiểm tra..." : "Đang tạo..."}
                    </>
                  ) : (
                    "Tạo đơn hàng"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <SetSelectionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={handleSetSelection}
        selectedSet={selectedSet}
        startDate={form.getValues("startDate")}
        endDate={form.getValues("endDate")}
      />
    </div>
  );
}