import { Link, useLocation } from "wouter";
import { 
  Home, 
  Shirt, 
  Calendar, 
  ClipboardList, 
  ShoppingBag,
  Tag
} from "lucide-react";

const navigation = [
  { name: "Tổng quan", href: "/", icon: Home },
  { name: "Quản lý danh mục", href: "/categories", icon: Tag },
  { name: "Quản lý bộ đồ", href: "/clothing-sets", icon: Shirt },
  { name: "Lịch thuê", href: "/calendar", icon: Calendar },
  { name: "Đặt hàng mới", href: "/bookings", icon: ClipboardList },
  { name: "Quản lý đơn hàng", href: "/orders", icon: ShoppingBag },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex-shrink-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          <Shirt className="inline mr-2 text-blue-600" size={24} />
          Cho thuê đồ
        </h1>
      </div>
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a className={`nav-item ${isActive ? 'active' : ''}`}>
                <item.icon className="mr-3" size={20} />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
