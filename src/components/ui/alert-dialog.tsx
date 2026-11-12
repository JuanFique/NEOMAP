import * as AlertPrimitive from '@radix-ui/react-alert-dialog';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '@/lib/utils';

export const AlertDialog = AlertPrimitive.Root;
export const AlertDialogTitle = AlertPrimitive.Title;
export const AlertDialogDescription = AlertPrimitive.Description;
export const AlertDialogCancel = AlertPrimitive.Cancel;
export const AlertDialogAction = AlertPrimitive.Action;

export const AlertDialogContent = forwardRef<
  ElementRef<typeof AlertPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AlertPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertPrimitive.Portal>
    <AlertPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/50" />
    <AlertPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none',
        className,
      )}
      {...props}
    />
  </AlertPrimitive.Portal>
));
AlertDialogContent.displayName = 'AlertDialogContent';
