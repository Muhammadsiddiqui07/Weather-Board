/**
 * Accessible confirmation dialog for destructive actions like removing a favourite.
 */

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../common/Button';

export function ConfirmDialog({
  isOpen,
  title = 'Confirm Removal',
  message = 'Are you sure you want to remove this item?',
  confirmText = 'Remove',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-left space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 id="dialog-title" className="text-base font-semibold text-zinc-100">
            {title}
          </h3>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
