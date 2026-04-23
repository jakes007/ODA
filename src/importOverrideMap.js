export const IMPORT_OVERRIDES = {
  '0::C.Roberts': {
    playerLookup: {
      fullName: 'Chesley Roberts'
    },
    note: 'Active player, no DSA yet'
  },
  
  '::Mahir Alexander': {
    playerLookup: {
      fullName: 'Mahir Alexander'
    },
    note: 'Inactive player'
  },
  
  '::Y.Boltman': {
    playerLookup: {
      fullName: 'Y Boltman'
    },
    note: 'Inactive player'
  },

  '120046::R.Adams': {
    playerLookup: {
      fullName: 'Daywin Adams'
    },
    note: 'Stats DSA does not match registry'
  },

  '::F.Olivier': {
    playerLookup: {
      fullName: 'Richard Olivier'
    },
    note: 'Missing DSA in stats'
  },

  '130156::S.Boyce': {
    playerLookup: {
      fullName: 'Sayt Boyce'
    },
    note: 'Manual association correction'
  },

  '230706::J.Theys': {
    playerLookup: {
      fullName: 'Jason Theys'
    },
    note: 'Manual association correction'
  },

  '::F.Miller': {
    playerLookup: {
      fullName: 'Franklin Miller'
    },
    note: 'Missing DSA in stats'
  },

  '190425::D.Van Der Speck': {
    playerLookup: {
      fullName: 'D. Van Der Speck'
    },
    note: 'Inactive association member, not present in yearly registry'
  },

  '230265::R.Solomon': {
    playerLookup: {
      fullName: 'Ricardo Solomon'
    },
    note: 'Stats DSA does not match registry'
  },

  '210500::C.Brown': {
    playerLookup: {
      fullName: 'Jeff Brown'
    },
    note: 'Stats DSA does not match registry'
  }

  
};

export function buildOverrideKey(dsaNumber, rawPlayerName) {
  const safeDsa = String(dsaNumber ?? '').trim();
  const safeName = String(rawPlayerName ?? '').trim();
  return `${safeDsa}::${safeName}`;
}