import React from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div 
        className={`bg-white rounded-xl shadow-lg w-full ${maxWidth} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
