import { Search, LayoutGrid, List } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  placeholder?: string;
}

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  placeholder = "Search...",
}: FilterBarProps) => {
  return (
    <div className="w-full max-w-3xl mb-12 flex flex-col sm:flex-row gap-4">
      {/* Search Bar */}
      <div className="relative w-full flex-1 h-14">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-[#7b81ff]/20 focus:border-[#7b81ff] outline-none shadow-sm text-gray-600 font-medium"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
      </div>

      {/* Grid / List Toggle */}
      <div className="flex bg-white border border-gray-200 rounded-full p-1.5 shadow-sm shrink-0">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`p-2.5 rounded-full transition-all ${
            viewMode === "grid"
              ? "bg-[#6c7df3]/10 text-[#6c7df3]"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          }`}
          title="Grid View"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`p-2.5 rounded-full transition-all ${
            viewMode === "list"
              ? "bg-[#6c7df3]/10 text-[#6c7df3]"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          }`}
          title="List View"
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
