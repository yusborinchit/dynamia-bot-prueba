import type { Unit } from '@wsp/contracts';

export const unitLabels: Record<Unit, string> = {
  crate: 'Cajón',
  bag: 'Bolsa',
  kg: 'Kg',
  unit: 'Unidad',
  bunch: 'Atado',
  dozen: 'Docena',
};

export const unitOptions = Object.entries(unitLabels) as [Unit, string][];
