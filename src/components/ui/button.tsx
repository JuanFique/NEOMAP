import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[13px] font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-umng-blue focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-umng-blue text-white hover:bg-umng-navy',
        gold: 'bg-umng-yellow text-umng-blue hover:bg-[#FFD633]',
        destructive: 'bg-umng-red text-white hover:bg-[#C9261B]',
        outline: 'border border-umng-blue/30 bg-white text-umng-blue hover:bg-umng-ice',
        ghost: 'text-umng-blue hover:bg-umng-ice',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-8 px-3.5 text-[11px]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';
