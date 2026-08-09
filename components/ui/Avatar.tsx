'use client';

import { getInitials, getPersonPalette } from '@/lib/personColors';

type AvatarProps = {
  name: string;
  personId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * Use inside an element already painted in this person's solid color —
   * a same-color avatar would be invisible there.
   */
  inverted?: boolean;
};

const SIZES = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
};

export function Avatar({ name, personId, size = 'sm', inverted = false }: AvatarProps) {
  const palette = getPersonPalette(personId);

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold leading-none ${
        SIZES[size]
      } ${inverted ? 'bg-white/25 text-white' : palette.solid}`}
    >
      {getInitials(name)}
    </span>
  );
}
