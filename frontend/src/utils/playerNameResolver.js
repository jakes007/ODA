import { importedRegistryData } from '../data/importedRegistryData';

function clean(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z\s.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getNameSignature(name) {
  const cleaned = clean(name);

  if (!cleaned) return '';

  if (cleaned.includes('.')) {
    const [initialPart, surnamePart] = cleaned.split('.');
    const initial = clean(initialPart)[0] || '';
    const surname = clean(surnamePart).replace(/[^a-z]/g, '');
    return `${initial}${surname}`;
  }

  const parts = cleaned.split(' ').filter(Boolean);
  const firstInitial = parts[0]?.[0] || '';
  const surname = parts[parts.length - 1] || '';

  return `${firstInitial}${surname}`;
}

export function resolvePlayerDisplayName(rawName) {
  const originalName = String(rawName || '').trim();

  if (!originalName) return originalName;

  const rawSignature = getNameSignature(originalName);

  if (!rawSignature) return originalName;

  const matches = (importedRegistryData.players || []).filter((player) => {
    return getNameSignature(player.fullName) === rawSignature;
  });

  if (matches.length !== 1) {
    return originalName;
  }

  return matches[0].fullName || originalName;
}