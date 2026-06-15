import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  hideCancel?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText = "Cancel",
  isDestructive,
  hideCancel = false,
}: ConfirmModalProps) => {
  const resolvedConfirmText = confirmText ?? (hideCancel ? "OK" : "Delete");
  const resolvedDestructive = isDestructive ?? !hideCancel;
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          {/* Backdrop (Clicking it can also cancel if you want, but for deletes it's safer to require a button click) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onCancel}
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden z-10 border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-3">
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    resolvedDestructive
                      ? "bg-red-50 text-red-500"
                      : "bg-indigo-50 text-[#6c7df3]"
                  }`}
                >
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a4b]">{title}</h3>
              </div>

              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                {message}
              </p>

              <div className="flex gap-3">
                {!hideCancel && (
                  <Button
                    onClick={onCancel}
                    variant="tertiary"
                    rounded="2xl"
                    className="flex-1 focus:ring-2 focus:ring-gray-200"
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  onClick={onConfirm}
                  variant="primary"
                  rounded="2xl"
                  destructive={resolvedDestructive}
                  className={`${hideCancel ? "w-full" : "flex-1"} focus:ring-2 focus:ring-offset-2 ${resolvedDestructive ? "focus:ring-red-500" : "focus:ring-[#6c7df3]"}`}
                >
                  {resolvedConfirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
