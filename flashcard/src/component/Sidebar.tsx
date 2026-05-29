import React from "react";
import { Menu, Folder, Book, FilePlus } from "lucide-react";
import { motion } from "framer-motion";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex flex-col items-center justify-center py-4 px-1 transition-colors group relative ${
      active ? "text-[#4b4b88]" : "text-gray-400 hover:text-gray-600"
    }`}
  >
    <Icon
      className={`w-6 h-6 mb-1 ${active ? "fill-[#c5c8f2]/30" : ""}`}
      strokeWidth={active ? 2 : 1.5}
    />
    <span className="text-[10px] font-bold uppercase tracking-tight scale-90 text-center">
      {label}
    </span>
    {active && (
      <motion.div
        layoutId="activeTabIndicator"
        className="absolute left-0 w-1 h-8 bg-[#6c7df3] rounded-r-full"
      />
    )}
  </button>
);

export const Sidebar = ({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) => {
  return (
    <aside className="w-21 h-screen bg-white border-r border-gray-100 flex flex-col items-center fixed left-0 top-0 z-50">
      <div className="w-full flex flex-col items-center py-4 mb-4">
        <button
          onClick={() => onTabChange("dashboard")}
          className="flex items-center justify-center p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col items-center">
        <SidebarItem
          icon={Folder}
          label="Projects"
          active={activeTab === "projects"}
          onClick={() => onTabChange("projects")}
        />
        <SidebarItem
          icon={Book}
          label="Library"
          active={activeTab === "library"}
          onClick={() => onTabChange("library")}
        />
        <div className="w-8 h-px bg-gray-100 my-4" />
        <SidebarItem
          icon={FilePlus}
          label="Create"
          active={activeTab === "create"}
          onClick={() => onTabChange("create")}
        />
      </div>
    </aside>
  );
};
