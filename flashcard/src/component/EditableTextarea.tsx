import type { TextareaHTMLAttributes } from "react";

interface EditableTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isEditable?: boolean;
}

export const EditableTextarea = ({
  isEditable = true,
  className = "",
  ...props
}: EditableTextareaProps) => {
  return (
    <textarea
      readOnly={!isEditable}
      className={`${
        isEditable
          ? ""
          : "cursor-default caret-transparent focus:outline-none pointer-events-none"
      } ${className}`}
      {...props}
    />
  );
};
