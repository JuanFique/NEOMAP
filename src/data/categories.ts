import type { Categoria } from '../lib/types';

export interface CategoriaMeta {
  label: string;
  color: string;
  tint: string;
  pillOn: string;
  pillOff: string;
  badge: string;
}

export const CATEGORIA_META: Record<Categoria, CategoriaMeta> = {
  laboratorios: {
    label: 'Laboratorios',
    color: '#2563EB',
    tint: '#DBEAFE',
    pillOn: 'bg-blue-600 text-white border-blue-600',
    pillOff: 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  aulas_especiales: {
    label: 'Aulas Especiales',
    color: '#7C3AED',
    tint: '#EDE9FE',
    pillOn: 'bg-violet-600 text-white border-violet-600',
    pillOff: 'bg-white text-violet-700 border-violet-200 hover:bg-violet-50',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  oficinas_administrativas: {
    label: 'Oficinas Administrativas',
    color: '#059669',
    tint: '#D1FAE5',
    pillOn: 'bg-emerald-600 text-white border-emerald-600',
    pillOff: 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  servicios: {
    label: 'Servicios',
    color: '#D97706',
    tint: '#FEF3C7',
    pillOn: 'bg-amber-500 text-white border-amber-500',
    pillOff: 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};
