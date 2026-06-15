import React from "react";

interface EditableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isEditable: boolean;
  variant?: "default" | "auth";
}

export const EditableInput = ({
  isEditable,
  variant,
  className = "",
  ...props
}: EditableInputProps) => {
  const baseStyles = variant
    ? variant === "auth"
      ? "w-full py-4 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6c7df3]/50 focus:border-[#6c7df3] transition-all"
      : "w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6c7df3]/20 focus:border-[#6c7df3] outline-none font-medium text-[#1a1a4b] shadow-sm"
    : "bg-transparent w-full border-b border-gray-300 focus:border-[#6c7df3]";

  return (
    <input
      readOnly={!isEditable}
      className={`${baseStyles} ${
        isEditable ? "" : "cursor-default caret-transparent focus:outline-none"
      } ${className}`}
      {...props}
    />
  );
};
