import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SetSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (set: any) => void;
  selectedSet?: any;
  startDate?: string;
  endDate?: string;
}

export default function SetSelectionModal({ 
  open, 
  onOpenChange, 
  onSelect, 
  selectedSet,
  startDate,
  endDate
}: SetSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelected, setTempSelected] = useState<any>(selectedSet);

  const { data: clothingSets = [], isLoading } = useQuery({
    queryKey: ['/api/clothing-sets'],
    enabled: open,
  });

  const filteredSets = (clothingSets as any[]).filter((set: any) =>
    set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSetSelect = (set: any) => {
    setTempSelected(set);
  };

  const handleConfirm = () => {
    if (tempSelected) {
      onSelect(tempSelected);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setTempSelected(selectedSet);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Chọn bộ đồ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Tìm kiếm bộ đồ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-auto">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <Skeleton className="w-full h-32 mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : (
              filteredSets.map((set: any) => {
                const isSelected = tempSelected?.id === set.id;
                
                return (
                  <div
                    key={set.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => handleSetSelect(set)}
                  >
                    <div className="relative">
                      {set.imageUrl && (
                        <img 
                          src={set.imageUrl} 
                          alt={set.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-1">{set.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{set.description}</p>
                    
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="secondary">{set.category}</Badge>
                      <span className="text-sm text-gray-600">Còn {set.quantity} bộ</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(parseFloat(set.pricePerDay))}/ngày
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {tempSelected && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Đã chọn:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-sm">
                  {tempSelected.name}
                </Badge>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
            <Button onClick={handleConfirm} disabled={!tempSelected}>
              Xác nhận
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
