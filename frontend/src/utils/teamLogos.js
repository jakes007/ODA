import bestOfOrderLogo from '../assets/clubs/best-of-order.webp';
import brisdelLogo from '../assets/clubs/brisdel.webp';
import cathkinLogo from '../assets/clubs/cathkin.webp';
import eastSideLogo from '../assets/clubs/east-side.webp';
import guardiansLogo from '../assets/clubs/guardians.webp';
import pdcLogo from '../assets/clubs/pdc.webp';
import seagullsLogo from '../assets/clubs/seagulls.webp';
import stallionLogo from '../assets/clubs/stallion.webp';
import westPointLogo from '../assets/clubs/west-point.webp';
import defaultTeamLogo from '../assets/default-team-logo.png';

const clubLogoMatchers = [
  { matches: (name) => /\bboo\b/.test(name) || name.includes('best of order'), logo: bestOfOrderLogo },
  { matches: (name) => name.includes('brisdel'), logo: brisdelLogo },
  { matches: (name) => name.includes('cathkin'), logo: cathkinLogo },
  { matches: (name) => name.includes('east side') || name.includes('eastside'), logo: eastSideLogo },
  { matches: (name) => name.includes('guardian'), logo: guardiansLogo },
  { matches: (name) => /\bpdc\b/.test(name), logo: pdcLogo },
  { matches: (name) => name.includes('seagull'), logo: seagullsLogo },
  { matches: (name) => name.includes('stallion'), logo: stallionLogo },
  { matches: (name) => name.includes('west point') || name.includes('westpoint'), logo: westPointLogo }
];

export function getTeamLogo(name = '') {
  const normalizedName = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  return clubLogoMatchers.find(({ matches }) => matches(normalizedName))?.logo || defaultTeamLogo;
}
