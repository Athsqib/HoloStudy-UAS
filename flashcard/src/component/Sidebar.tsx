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
    className={`w-full h-full md:h-auto flex flex-col items-center justify-center py-2 md:py-4 px-1 transition-colors group relative ${
      active ? "text-[#4b4b88]" : "text-gray-400 hover:text-gray-600"
    }`}
  >
    <Icon
      className={`w-5 h-5 md:w-6 md:h-6 mb-0.5 md:mb-1 ${active ? "fill-[#c5c8f2]/30" : ""}`}
      strokeWidth={active ? 2 : 1.5}
    />
    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-tight scale-90 md:scale-100 text-center">
      {label}
    </span>
    {active && (
      <>
        {/* Desktop Active Indicator */}
        <motion.div
          layoutId="activeTabIndicatorDesktop"
          className="hidden md:block absolute left-0 w-1 h-8 bg-[#6c7df3] rounded-r-full"
        />
        {/* Mobile Active Indicator */}
        <motion.div
          layoutId="activeTabIndicatorMobile"
          className="md:hidden absolute bottom-0 w-8 h-1 bg-[#6c7df3] rounded-t-full"
        />
      </>
    )}
  </button>
);

export const Sidebar = ({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <aside
      className={`bg-white border-gray-100 fixed z-50 transition-transform duration-300 ease-in-out
        /* Mobile: Top Navigation Bar */
        bottom-0 left-0 w-full h-16 flex flex-row items-center justify-evenly border-b shadow-sm
        /* Desktop: Left Sidebar */
        md:w-20 md:h-screen md:flex-col md:justify-start md:border-r md:border-b-0 md:shadow-none
        ${
          isOpen
            ? "translate-y-0 md:translate-x-0"
            : "-translate-y-full md:translate-y-0 md:-translate-x-full"
        }
      `}
    >
      {/* Hide the menu toggle button on mobile since space is tight */}
      <div className="hidden md:flex w-full flex-col items-center py-4 mb-4">
        <button
          onClick={onToggle}
          className="flex items-center justify-center p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 w-full flex flex-row md:flex-col items-center justify-center md:justify-start h-full">
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
        <div className="hidden md:block w-8 h-px bg-gray-100 my-4" />
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
