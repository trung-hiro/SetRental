import { Bell, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="text-gray-500 hover:text-gray-700 cursor-pointer" size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=32&h=32&auto=format&fit=crop&crop=face" />
              <AvatarFallback>
                <User size={16} />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">Quản trị viên</span>
          </div>
        </div>
      </div>
    </header>
  );
}
