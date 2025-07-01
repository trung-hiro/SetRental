import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { getCalendarDays, getMonthName, formatDateRange } from "@/lib/date-utils";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const categoryColors = {
  "Đầm dạ hội": "calendar-event-blue",
  "Vest nam": "calendar-event-green", 
  "Áo cưới": "calendar-event-red",
  "Trang phục truyền thống": "calendar-event-purple",
  "Áo dài": "calendar-event-purple",
  "Suit nữ": "calendar-event-green",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("Tất cả bộ đồ");
  const [hoveredEvent, setHoveredEvent] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/calendar/events', currentDate.getFullYear(), currentDate.getMonth() + 1],
  });

  const { data: clothingSets = [] } = useQuery({
    queryKey: ['/api/clothing-sets'],
  });

  const calendarDays = getCalendarDays(currentDate);
  const categories = ["Tất cả bộ đồ", ...(clothingSets as any[]).map((set: any) => set.category).filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)];

  const filteredEvents = (events as any[]).filter((event: any) => {
    if (selectedCategory === "Tất cả bộ đồ") return true;
    return event.items.some((item: any) => item.category === selectedCategory);
  });

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return filteredEvents.filter((event: any) => {
      return event.date === dateString;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleEventHover = (event: any, mouseEvent: React.MouseEvent) => {
    setHoveredEvent(event);
    setTooltipPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
  };

  const handleEventLeave = () => {
    setHoveredEvent(null);
  };

  const getEventColor = (items: any[]) => {
    const category = items[0]?.category;
    return categoryColors[category as keyof typeof categoryColors] || "calendar-event-blue";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Lịch thuê</h2>
        <div className="flex items-center space-x-4">
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
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </Button>
            <span className="font-semibold text-gray-900 min-w-[140px] text-center">
              {getMonthName(currentDate)}
            </span>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <div key={day} className="p-4 text-center font-semibold text-gray-700 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0">
            {isLoading ? (
              Array.from({ length: 42 }).map((_, i) => (
                <div key={i} className="calendar-cell">
                  <Skeleton className="h-4 w-6 mb-2" />
                  <div className="space-y-1">
                    {Math.random() > 0.7 && <Skeleton className="h-4 w-full" />}
                    {Math.random() > 0.8 && <Skeleton className="h-4 w-3/4" />}
                  </div>
                </div>
              ))
            ) : (
              calendarDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                
                return (
                  <div
                    key={index}
                    className={`calendar-cell ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}`}
                  >
                    <div className="text-sm font-medium mb-2">{day.getDate()}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event: any) => (
                        <div
                          key={event.id}
                          className={`calendar-event ${getEventColor(event.items)}`}
                          onMouseEnter={(e) => handleEventHover(event, e)}
                          onMouseLeave={handleEventLeave}
                          title={`${event.customer} - ${event.title}`}
                        >
                          {event.items.length === 1 
                            ? event.items[0].name 
                            : `${event.items.length} bộ đồ`
                          }
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{dayEvents.length - 3} thêm
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">Chú thích:</h4>
          <div className="flex flex-wrap gap-4">
            {Object.entries(categoryColors).map(([category, colorClass]) => (
              <div key={category} className="flex items-center">
                <div className={`w-3 h-3 rounded mr-2 ${colorClass.replace('calendar-event-', 'bg-').replace('-800', '-100')}`}></div>
                <span className="text-sm text-gray-600">{category}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tooltip */}
      {hoveredEvent && (
        <div
          ref={tooltipRef}
          className="fixed bg-gray-900 text-white text-sm rounded-lg p-3 z-50 max-w-xs shadow-lg"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-medium mb-1">{hoveredEvent.title}</div>
          <div className="text-gray-300 mb-1">Khách: {hoveredEvent.customer}</div>
          <div className="text-gray-300 mb-1">SĐT: {hoveredEvent.phone}</div>
          <div className="text-gray-300">
            {formatDateRange(hoveredEvent.startDate, hoveredEvent.endDate)}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
