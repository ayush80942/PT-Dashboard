"use client";

import React from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children, footer }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      {/* Dialog Container */}
      <div className="bg-white p-6 rounded shadow-lg z-10 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end space-x-2">{footer}</div>
      </div>
    </div>
  );
}
