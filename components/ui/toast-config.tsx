"use client";

import { toast, Toaster } from 'sonner';
import { Check, X, AlertCircle, Info } from 'lucide-react';

type ToastProps = {
  message: string;
  description?: string;
};

// Enhanced toast notifications with icons
export const showToast = {
  success: ({ message, description }: ToastProps) => {
    toast.dismiss();
    toast.success(
      <div className="flex">
        <Check className="h-5 w-5 mr-2 text-green-500" />
        <div>
          <p className="font-medium">{message}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
    );
  },
  
  error: ({ message, description }: ToastProps) => {
    toast.dismiss();
    toast.error(
      <div className="flex">
        <X className="h-5 w-5 mr-2 text-red-500" />
        <div>
          <p className="font-medium">{message}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
    );
  },
  
  warning: ({ message, description }: ToastProps) => {
    toast.dismiss();
    toast(
      <div className="flex">
        <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
        <div>
          <p className="font-medium">{message}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
    );
  },
  
  info: ({ message, description }: ToastProps) => {
    toast.dismiss();
    toast.info(
      <div className="flex">
        <Info className="h-5 w-5 mr-2 text-blue-500" />
        <div>
          <p className="font-medium">{message}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
    );
  },
};

// Custom Toaster component
export function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        className: 'border shadow-lg rounded-xl px-5 py-4 bg-white backdrop-blur-sm',
        style: {
          marginTop: 16,
          marginRight: 16,
          backgroundColor: 'var(--background, #fff)',
          color: 'var(--foreground, #222)',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
        },
      }}
    />
  );
} 