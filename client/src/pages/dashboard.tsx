import { useQuery } from "@tanstack/react-query";
import { 
  Shirt, 
  CalendarCheck, 
  Clock, 
  TrendingUp 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: clothingSets, isLoading: setsLoading } = useQuery({
    queryKey: ['/api/clothing-sets'],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const recentOrders = orders?.slice(0, 5) || [];
  const popularSets = clothingSets?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Tổng bộ đồ"
              value={stats?.totalSets || 0}
              icon={Shirt}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              title="Đang cho thuê"
              value={stats?.activeRentals || 0}
              icon={CalendarCheck}
              color="bg-green-100 text-green-600"
            />
            <StatCard
              title="Chờ trả"
              value={stats?.pendingReturns || 0}
              icon={Clock}
              color="bg-amber-100 text-amber-600"
            />
            <StatCard
              title="Doanh thu tháng"
              value={stats?.monthlyRevenue ? formatCurrency(stats.monthlyRevenue) : "0đ"}
              icon={TrendingUp}
              color="bg-emerald-100 text-emerald-600"
            />
          </>
        )}
      </div>

      {/* Recent Orders and Popular Sets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng gần đây</h3>
            <div className="space-y-4">
              {ordersLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {order.items[0]?.clothingSet?.imageUrl ? (
                        <img 
                          src={order.items[0].clothingSet.imageUrl} 
                          alt={order.items[0].clothingSet.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Shirt size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-sm text-gray-600">
                          {order.items.map((item: any) => item.clothingSet.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'active' ? 'bg-green-100 text-green-800' :
                      order.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'returned' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'active' ? 'Đang thuê' :
                       order.status === 'upcoming' ? 'Sắp tới' :
                       order.status === 'returned' ? 'Đã trả' : 'Đã hủy'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có đơn hàng nào</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Sets */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ đồ có sẵn</h3>
            <div className="space-y-4">
              {setsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : popularSets.length > 0 ? (
                popularSets.map((set: any) => (
                  <div key={set.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {set.imageUrl ? (
                        <img 
                          src={set.imageUrl} 
                          alt={set.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Shirt size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{set.name}</p>
                        <p className="text-sm text-gray-600">{set.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Còn {set.quantity} bộ</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có bộ đồ nào</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
