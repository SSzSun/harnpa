export type PersonPalette = {
  /** Filled chip / avatar background. Always pairs with white text. */
  solid: string;
  /** Low-contrast background for resting chips, with a readable matching text color. */
  soft: string;
  /** Ring color for the selected state. */
  ring: string;
};

// Eight hues chosen to stay distinguishable side by side and to keep white text
// readable on the solid variant.
const PERSON_PALETTES: PersonPalette[] = [
  { solid: 'bg-[#B4471F] text-white', soft: 'bg-[#FBEAE3] text-[#8E3818]', ring: 'ring-[#B4471F]' },
  { solid: 'bg-[#0E6E68] text-white', soft: 'bg-[#E0F1EF] text-[#0B5852]', ring: 'ring-[#0E6E68]' },
  { solid: 'bg-[#A81D45] text-white', soft: 'bg-[#FBE6EC] text-[#851735]', ring: 'ring-[#A81D45]' },
  { solid: 'bg-[#5B34AE] text-white', soft: 'bg-[#ECE6F9] text-[#48298A]', ring: 'ring-[#5B34AE]' },
  { solid: 'bg-[#2F6B2A] text-white', soft: 'bg-[#E5F2E3] text-[#255621]', ring: 'ring-[#2F6B2A]' },
  { solid: 'bg-[#8E2382] text-white', soft: 'bg-[#F8E5F6] text-[#711B67]', ring: 'ring-[#8E2382]' },
  { solid: 'bg-[#1B4FA8] text-white', soft: 'bg-[#E4EBF8] text-[#153F85]', ring: 'ring-[#1B4FA8]' },
  { solid: 'bg-[#7A4A12] text-white', soft: 'bg-[#F5EBDD] text-[#613A0E]', ring: 'ring-[#7A4A12]' },
];

// djb2. Person ids are consecutive timestamps, so a plain charCode sum maps
// people added seconds apart onto the same bucket.
function hash(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getPersonPalette(id: string): PersonPalette {
  return PERSON_PALETTES[hash(id) % PERSON_PALETTES.length];
}

/** Back-compat helper: the filled chip classes on their own. */
export function getColorForPerson(id: string): string {
  return getPersonPalette(id).solid;
}

/**
 * Initials for an avatar. Takes the first character of up to two words, which
 * keeps Thai names sane — slicing two chars off a single Thai word can split a
 * consonant from its combining vowel or tone mark.
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return [...words[0]][0] ?? '?';
  return words
    .slice(0, 2)
    .map((w) => [...w][0] ?? '')
    .join('');
}
