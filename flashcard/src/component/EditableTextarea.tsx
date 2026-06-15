import type { TextareaHTMLAttributes } from "react";

interface EditableTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isEditable?: boolean;
  variant?: "default";
}

export const EditableTextarea = ({
  isEditable = true,
  variant,
  className = "",
  ...props
}: EditableTextareaProps) => {
  const baseStyles = variant
    ? "w-full px-5 py-4 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6c7df3]/20 focus:border-[#6c7df3] outline-none font-medium text-[#1a1a4b] shadow-sm resize-none transition-all"
    : "";

  return (
    <textarea
      readOnly={!isEditable}
      className={`${baseStyles} ${
        isEditable
          ? ""
          : "cursor-default caret-transparent focus:outline-none pointer-events-none"
      } ${className}`}
      {...props}
    />
  );
};
