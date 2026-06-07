import React from "react";

interface EditableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isEditable: boolean;
}

export const EditableInput = ({
  isEditable,
  className = "",
  ...props
}: EditableInputProps) => {
  return (
    <input
      readOnly={!isEditable}
      className={`bg-transparent w-full ${
        isEditable
          ? "border-b border-gray-300 focus:border-[#6c7df3]" // Your normal edit styles
          : "cursor-default caret-transparent focus:outline-none" // Hidden styles
      } ${className}`}
      {...props}
    />
  );
};
