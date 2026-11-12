import type { HTMLAttributes } from 'react';
import { CATEGORIA_META } from '@/data/categories';
import type { Categoria } from '@/lib/types';
import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700',
        className,
      )}
      {...props}
    />
  );
}

export function CategoriaBadge({ categoria, className }: { categoria: Categoria; className?: string }) {
  const meta = CATEGORIA_META[categoria];
  return <Badge className={cn(meta.badge, className)}>{meta.label}</Badge>;
}
