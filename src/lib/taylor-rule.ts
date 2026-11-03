// Classic Taylor (1993) rule with an Okun's-law output gap: gap = 2 × (NAIRU − unemployment).
export function taylorRate({ inflation, unemployment, neutral = 2, target = 2, nairu = 4.2 }: { inflation: number; unemployment: number; neutral?: number; target?: number; nairu?: number }) {
  const outputGap = 2 * (nairu - unemployment);
  return neutral + inflation + 0.5 * (inflation - target) + 0.5 * outputGap;
}
