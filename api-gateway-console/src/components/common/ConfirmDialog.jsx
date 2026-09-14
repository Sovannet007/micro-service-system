import React from "react";
import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  isDestructive = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-full shrink-0 ${isDestructive ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}
        >
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
            isDestructive
              ? "bg-rose-600 hover:bg-rose-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
