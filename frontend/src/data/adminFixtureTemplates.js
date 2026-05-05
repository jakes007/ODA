export const adminFixtureTemplates = [
    {
      templateId: 'oda_32_point_standard',
      name: 'ODA 32 Point Standard',
      pointsSystem: '32 Point',
      games: [
        { label: 'Singles 1', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 2 },
        { label: 'Singles 2', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 2 },
        { label: 'Singles 3', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 2 },
        { label: 'Singles 4', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 2 },
        { label: 'Doubles 1', type: 'doubles', startingScore: 701, legsMode: 'fixed', totalLegs: 1 },
        { label: 'Doubles 2', type: 'doubles', startingScore: 701, legsMode: 'fixed', totalLegs: 1 },
        { label: 'Team Game', type: 'team', startingScore: 1001, legsMode: 'fixed', totalLegs: 1 }
      ]
    },
    {
      templateId: 'oda_16_point_singles',
      name: 'ODA 16 Point Singles',
      pointsSystem: '16 Point',
      games: [
        { label: 'Singles 1', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 2 },
        { label: 'Singles 2', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 2 },
        { label: 'Singles 3', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 2 },
        { label: 'Singles 4', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 2 }
      ]
    }
  ];