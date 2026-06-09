import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; // If true, makes the button red. If false, makes it your primary indigo theme.
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true,
}: ConfirmModalProps) => {
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
                    isDestructive
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
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-3 px-4 rounded-2xl font-bold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isDestructive
                      ? "bg-red-500 hover:bg-red-600 focus:ring-red-500 shadow-lg shadow-red-500/20"
                      : "bg-[#6c7df3] hover:bg-[#5a6be0] focus:ring-[#6c7df3] shadow-lg shadow-indigo-900/20"
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
