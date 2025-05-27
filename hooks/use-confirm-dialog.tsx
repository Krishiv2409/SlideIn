"use client";

import React, { useState, useCallback } from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ReactNode;
  iconContainerClassName?: string;
  contentClassName?: string;
  hideCancel?: boolean;
};

type ConfirmDialogReturn = {
  openConfirmDialog: (props: ConfirmDialogProps) => Promise<boolean>;
  ConfirmDialog: React.ReactNode;
};

export const useConfirmDialog = (): ConfirmDialogReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dialogProps, setDialogProps] = useState<ConfirmDialogProps>({
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
    icon: null,
    iconContainerClassName: 'mx-auto mb-4',
    contentClassName: '',
    hideCancel: false
  });
  
  const [resolver, setResolver] = useState<(value: boolean) => void>(() => {});

  const openConfirmDialog = useCallback((props: ConfirmDialogProps): Promise<boolean> => {
    setDialogProps({ ...dialogProps, ...props });
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, [dialogProps]);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolver(true);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolver(false);
  }, [resolver]);

  const ConfirmDialog = (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className={dialogProps.contentClassName}>
        <AlertDialogHeader>
          {dialogProps.icon && (
            <div className={dialogProps.iconContainerClassName}>
              {dialogProps.icon}
            </div>
          )}
          <AlertDialogTitle className="text-center sm:text-left">{dialogProps.title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center sm:text-left">
            {dialogProps.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!dialogProps.hideCancel && (
            <AlertDialogCancel onClick={handleCancel} className="mt-2 sm:mt-0">
              {dialogProps.cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction 
            onClick={handleConfirm}
            className={dialogProps.variant === 'destructive' 
              ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
              : dialogProps.variant === 'outline' 
                ? 'bg-transparent border border-input hover:bg-accent hover:text-accent-foreground' 
                : 'bg-pink-500 text-white hover:bg-pink-600'
            }
          >
            {dialogProps.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    openConfirmDialog,
    ConfirmDialog,
  };
}; 