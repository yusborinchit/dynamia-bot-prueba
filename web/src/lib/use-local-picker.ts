import { useState } from 'react';
import type { PickerOption } from '#/components/ui/picker';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function useLocalPicker(options: PickerOption[]) {
  const [search, setSearch] = useState('');
  const term = normalize(search.trim());
  const filtered = term
    ? options.filter((option) => normalize(option.label).includes(term))
    : options;

  return { search, onSearchChange: setSearch, options: filtered };
}
