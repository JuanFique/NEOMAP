import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const field =
  'w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-umng-ink placeholder:text-slate-400 focus-visible:border-umng-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-umng-blue/30 disabled:opacity-50';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(field, 'h-10', className)} {...props} />,
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(field, 'min-h-[76px] py-2', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={cn(field, 'h-10 pr-8', className)} {...props} />,
);
Select.displayName = 'Select';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1 block text-[11px] font-bold uppercase tracking-wide text-umng-blue', className)} {...props} />;
}
