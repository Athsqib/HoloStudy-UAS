import type { ReactNode } from "react";

interface CreateButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  viewMode?: "grid" | "list";
  variant?: "default" | "full";
}

export const CreateButton = ({
  label,
  icon,
  onClick,
  viewMode,
  variant = "default",
}: CreateButtonProps) => {
  const isFull = variant === "full";

  return (
    <button
      onClick={onClick}
      className={`rounded-4xl border-2 border-dashed flex items-center justify-center gap-4 transition-all group cursor-pointer

      text-[#6c7df3] md:text-gray-300
      border-[#6c7df3]/30 md:border-gray-100
      hover:border-[#6c7df3] hover:text-[#6c7df3] hover:bg-[#6c7df3]/5
      ${
        isFull
          ? "w-full py-6 sm:py-12 flex-col"
          : viewMode === "grid"
            ? "flex-col h-64"
            : "flex-row h-24 px-8 w-full justify-start"
      }`}
    >
      <div
        className={`rounded-full flex items-center justify-center transition-colors shrink-0
        bg-[#6c7df3]/10 md:bg-gray-50
        ${isFull ? "w-10 h-10" : "w-12 h-12"}`}
      >
        {icon}
      </div>
      <span className="font-bold text-xs uppercase tracking-widest">
        {label}
      </span>
    </button>
  );
};
