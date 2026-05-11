import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import CustomSelect from '../components/common/CustomSelect';
import { getSeasons } from '../services/adminSeasonService';
import { getCompetitions } from '../services/adminCompetitionService';
import { getDivisions } from '../services/adminDivisionService';
import { getTeams } from '../services/adminTeamService';
import { getMatchFormats } from '../services/adminMatchFormatService';
import {
  createAdminFixture,
  deleteAdminFixture,
  getAdminFixtures,
  updateAdminFixture
} from '../services/adminFixtureService';
import AdminStepNavigation from '../components/admin/AdminStepNavigation';
import { placementsFixturesData } from '../data/placementsFixturesData';
import { importedRegistryData } from '../data/importedRegistryData';

export default function AdminFixturesPage() {
  const [seasons, setSeasons] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matchFormats, setMatchFormats] = useState([]);
  const [fixtures, setFixtures] = useState([]);

  const [seasonId, setSeasonId] = useState('');
  const [competitionId, setCompetitionId] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [fixtureDate, setFixtureDate] = useState('');
  const [fixtureTime, setFixtureTime] = useState('');
  const [matchFormatId, setMatchFormatId] = useState('');

  const [message, setMessage] = useState('');
  const [fixtureToDelete, setFixtureToDelete] = useState(null);

  const [editingFixtureId, setEditingFixtureId] = useState('');
  const [editingSeasonId, setEditingSeasonId] = useState('');
  const [editingCompetitionId, setEditingCompetitionId] = useState('');
  const [editingDivisionId, setEditingDivisionId] = useState('');
  const [editingHomeTeamId, setEditingHomeTeamId] = useState('');
  const [editingAwayTeamId, setEditingAwayTeamId] = useState('');
  const [editingFixtureDate, setEditingFixtureDate] = useState('');
  const [editingFixtureTime, setEditingFixtureTime] = useState('19:30');
const [editingMatchFormatId, setEditingMatchFormatId] = useState('');
const [editingHomeLoanPlayerIds, setEditingHomeLoanPlayerIds] = useState([]);
const [editingAwayLoanPlayerIds, setEditingAwayLoanPlayerIds] = useState([]);

const [openFixtureSections, setOpenFixtureSections] = useState({});

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    const loadedSeasons = await getSeasons();
    const loadedCompetitions = await getCompetitions();
    const loadedDivisions = await getDivisions();
    const loadedTeams = await getTeams();
    const loadedFormats = await getMatchFormats();
    const loadedFixtures = await getAdminFixtures();

    setSeasons(loadedSeasons);
    setCompetitions(loadedCompetitions);
    setDivisions(loadedDivisions);
    setTeams(loadedTeams);
    setMatchFormats(loadedFormats);
    setFixtures(loadedFixtures);

    const activeSeason = loadedSeasons.find((season) => season.status === 'active');
    const activeCompetition = loadedCompetitions.find(
      (competition) => competition.status === 'active'
    );

    if (activeSeason) setSeasonId(activeSeason.id);
    if (activeCompetition) setCompetitionId(activeCompetition.id);
    if (loadedFormats[0]) setMatchFormatId(loadedFormats[0].id);
  }

  function getSeasonName(id) {
    return seasons.find((season) => season.id === id)?.name || 'No season';
  }

  function getCompetitionName(id) {
    return competitions.find((competition) => competition.id === id)?.name || 'No competition';
  }

  function getDivisionName(id) {
    return divisions.find((division) => division.id === id)?.name || 'No division';
  }

  function getTeamName(id) {
    return teams.find((team) => team.id === id)?.name || 'No team';
  }

  function getMatchFormatName(id) {
    return matchFormats.find((format) => format.id === id)?.name || 'No format';
  }

  function getRegistryPlayerName(playerId) {
    const player = importedRegistryData.players.find(
      (registryPlayer) => registryPlayer.playerId === playerId
    );
  
    return player?.fullName || 'Unknown player';
  }
  
  function normalizeClubName(value = '') {
    return String(value)
      .toLowerCase()
      .replace('dart club', '')
      .replace('darts club', '')
      .replace('east side', 'eastside')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  function getTeamClubName(teamId) {
    const team = teams.find((team) => team.id === teamId);
  
    return team?.clubName || team?.name || '';
  }
  
  function getClubLoanPlayerOptions(teamId, selectedIds = []) {
    const clubName = getTeamClubName(teamId);
    const normalizedClubName = normalizeClubName(clubName);
  
    return importedRegistryData.players
      .filter(
        (player) =>
          normalizeClubName(player.clubName) === normalizedClubName
      )
      .filter((player) => !selectedIds.includes(player.playerId))
      .map((player) => ({
        value: player.playerId,
        label: `${player.fullName} • DSA: ${player.dsaNumber}`
      }));
  }
  
  function addHomeLoanPlayer(playerId) {
    if (!playerId) return;
  
    setEditingHomeLoanPlayerIds((current) =>
      current.includes(playerId) ? current : [...current, playerId]
    );
  }
  
  function addAwayLoanPlayer(playerId) {
    if (!playerId) return;
  
    setEditingAwayLoanPlayerIds((current) =>
      current.includes(playerId) ? current : [...current, playerId]
    );
  }
  
  function removeHomeLoanPlayer(playerId) {
    setEditingHomeLoanPlayerIds((current) =>
      current.filter((id) => id !== playerId)
    );
  }
  
  function removeAwayLoanPlayer(playerId) {
    setEditingAwayLoanPlayerIds((current) =>
      current.filter((id) => id !== playerId)
    );
  }

  const availableDivisions = useMemo(() => {
    return divisions.filter(
      (division) =>
        division.seasonId === seasonId &&
        division.competitionId === competitionId
    );
  }, [divisions, seasonId, competitionId]);

  const availableTeams = useMemo(() => {
    return teams.filter(
      (team) =>
        team.seasonId === seasonId &&
        team.competitionId === competitionId &&
        team.divisionId === divisionId
    );
  }, [teams, seasonId, competitionId, divisionId]);

  const editingAvailableDivisions = useMemo(() => {
    return divisions.filter(
      (division) =>
        division.seasonId === editingSeasonId &&
        division.competitionId === editingCompetitionId
    );
  }, [divisions, editingSeasonId, editingCompetitionId]);

  const editingAvailableTeams = useMemo(() => {
    return teams.filter(
      (team) =>
        team.seasonId === editingSeasonId &&
        team.competitionId === editingCompetitionId &&
        team.divisionId === editingDivisionId
    );
  }, [teams, editingSeasonId, editingCompetitionId, editingDivisionId]);

  async function handleCreateFixture(event) {
    event.preventDefault();

    const selectedFormat = matchFormats.find((format) => format.id === matchFormatId);

    try {
      const newFixture = await createAdminFixture({
        seasonId,
        competitionId,
        divisionId,
        homeTeamId,
        awayTeamId,
        fixtureDate,
        fixtureTime,
        matchFormat: selectedFormat
      });

      setFixtures((current) => [newFixture, ...current]);
      setHomeTeamId('');
      setAwayTeamId('');
      setFixtureDate('');
      setMessage('Fixture created successfully.');
    } catch (error) {
      setMessage(error.message || 'Could not create fixture.');
    }
  }

  async function handleImportPlacementsFixtures() {
    try {
      setMessage('Importing fixtures...');
  
      function normalizeFixtureTeamName(value = '') {
        return String(value)
          .replace(/^BOO\s+/i, 'Best Of Order ')
          .replace(/^East Side\s+/i, 'Eastside ')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();
      }
  
      function getFixtureStatusByDate(dateValue) {
        const today = new Date();
        const fixtureDateObj = new Date(dateValue);
  
        today.setHours(0, 0, 0, 0);
        fixtureDateObj.setHours(0, 0, 0, 0);
  
        if (fixtureDateObj < today) return 'completed';
        if (fixtureDateObj > today) return 'upcoming';
  
        return 'ready_for_lineups';
      }
  
      const upperDivision = divisions.find(
        (division) =>
          division.name === 'Upper' &&
          competitions.find((c) => c.id === division.competitionId)?.name ===
            'Placements'
      );
  
      const lowerDivision = divisions.find(
        (division) =>
          division.name === 'Lower' &&
          competitions.find((c) => c.id === division.competitionId)?.name ===
            'Placements'
      );
  
      const placementsCompetition = competitions.find(
        (competition) => competition.name === 'Placements'
      );
  
      const activeSeason = seasons.find(
        (season) => season.status === 'active'
      );
  
      const format16 = matchFormats.find(
        (format) => Number(format.pointsSystem) === 16
      );
  
      const format32 = matchFormats.find(
        (format) => Number(format.pointsSystem) === 32
      );
  
      if (!upperDivision || !lowerDivision) {
        throw new Error('Upper or Lower division not found.');
      }
  
      if (!placementsCompetition) {
        throw new Error('Placements competition not found.');
      }
  
      if (!activeSeason) {
        throw new Error('No active season found.');
      }
  
      if (!format16 || !format32) {
        throw new Error('16 or 32 point match format missing.');
      }
  
      const divisionMap = {
        Upper: upperDivision,
        Lower: lowerDivision
      };
  
      for (const [divisionName, divisionData] of Object.entries(
        placementsFixturesData.divisions
      )) {
        const division = divisionMap[divisionName];
  
        for (const fixtureDate of divisionData.dates) {
          /*
            UPPER DIVISION
            Uses MATCH GROUPS
          */
  
          if (divisionName === 'Upper' && fixtureDate.matches) {
            for (const matchGroup of fixtureDate.matches) {
              const selectedFormat =
                Number(matchGroup.pointsSystem) === 32
                  ? format32
                  : format16;
  
              for (const pairing of matchGroup.pairings) {
                const [homeRank, awayRank] = pairing;
  
                const homeTeamName =
                  divisionData.teamsByRank[homeRank];
  
                const awayTeamName =
                  divisionData.teamsByRank[awayRank];
  
                const homeTeam = teams.find(
                  (team) =>
                    normalizeFixtureTeamName(team.name) ===
                      normalizeFixtureTeamName(homeTeamName) &&
                    team.divisionId === division.id
                );
  
                const awayTeam = teams.find(
                  (team) =>
                    normalizeFixtureTeamName(team.name) ===
                      normalizeFixtureTeamName(awayTeamName) &&
                    team.divisionId === division.id
                );
  
                if (!homeTeam || !awayTeam) {
                  console.log('TEAM NOT FOUND');
                  console.log(homeTeamName);
                  console.log(awayTeamName);
                  continue;
                }
  
                await createAdminFixture({
                  seasonId: activeSeason.id,
                  competitionId: placementsCompetition.id,
                  divisionId: division.id,
                  homeTeamId: homeTeam.id,
                  awayTeamId: awayTeam.id,
                  fixtureDate: fixtureDate.date,
                  fixtureTime: '20:30',
                  matchFormat: selectedFormat,
                  status: getFixtureStatusByDate(fixtureDate.date)
                });
              }
            }
          }
  
          /*
            LOWER DIVISION
            Standard pairings only
          */
  
          else {
            for (const pairing of fixtureDate.pairings) {
              const [homeRank, awayRank] = pairing;
  
              const homeTeamName =
                divisionData.teamsByRank[homeRank];
  
              const awayTeamName =
                divisionData.teamsByRank[awayRank];
  
              const homeTeam = teams.find(
                (team) =>
                  normalizeFixtureTeamName(team.name) ===
                    normalizeFixtureTeamName(homeTeamName) &&
                  team.divisionId === division.id
              );
  
              const awayTeam = teams.find(
                (team) =>
                  normalizeFixtureTeamName(team.name) ===
                    normalizeFixtureTeamName(awayTeamName) &&
                  team.divisionId === division.id
              );
  
              if (!homeTeam || !awayTeam) {
                console.log('TEAM NOT FOUND');
                console.log(homeTeamName);
                console.log(awayTeamName);
                continue;
              }
  
              await createAdminFixture({
                seasonId: activeSeason.id,
                competitionId: placementsCompetition.id,
                divisionId: division.id,
                homeTeamId: homeTeam.id,
                awayTeamId: awayTeam.id,
                fixtureDate: fixtureDate.date,
                fixtureTime: '20:30',
                matchFormat: format16,
                status: getFixtureStatusByDate(fixtureDate.date)
              });
            }
          }
        }
      }
  
      await loadPageData();
  
      setMessage('Placements fixtures imported successfully.');
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Could not import fixtures.');
    }
  }
  async function confirmDeleteFixture() {
    if (!fixtureToDelete) return;

    try {
      await deleteAdminFixture(fixtureToDelete.id);
      setFixtureToDelete(null);
      setMessage('Fixture deleted.');
      await loadPageData();
    } catch (error) {
      setMessage(error.message || 'Could not delete fixture.');
    }
  }

  function toggleFixtureSection(key) {
    setOpenFixtureSections((current) => ({
      ...current,
      [key]: !current[key]
    }));
  }

  const groupedFixtures = useMemo(() => {
    const groups = {
      today: {},
      upcoming: {},
      completed: {}
    };
  
    fixtures.forEach((fixture) => {
      const fixtureDateObj = new Date(fixture.fixtureDate);
      const today = new Date();
  
      fixtureDateObj.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
  
      let statusKey = 'upcoming';
  
      if (fixture.status === 'completed' || fixtureDateObj < today) {
        statusKey = 'completed';
      } else if (fixtureDateObj.getTime() === today.getTime()) {
        statusKey = 'today';
      }
  
      const monthKey = fixtureDateObj.toISOString().slice(0, 7);
      const monthLabel = fixtureDateObj.toLocaleString('en-ZA', {
        month: 'long',
        year: 'numeric'
      });
  
      const divisionName = getDivisionName(fixture.divisionId);
      const divisionKey =
        divisionName === 'Upper' || divisionName === 'Lower'
          ? divisionName
          : 'Other';
  
      const dayKey = fixture.fixtureDate;
      const dayLabel = fixtureDateObj.toLocaleDateString('en-ZA', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
  
      if (!groups[statusKey][monthKey]) {
        groups[statusKey][monthKey] = {
          label: monthLabel,
          divisions: {}
        };
      }
  
      if (!groups[statusKey][monthKey].divisions[divisionKey]) {
        groups[statusKey][monthKey].divisions[divisionKey] = {};
      }
  
      if (!groups[statusKey][monthKey].divisions[divisionKey][dayKey]) {
        groups[statusKey][monthKey].divisions[divisionKey][dayKey] = {
          label: dayLabel,
          fixtures: []
        };
      }
  
      groups[statusKey][monthKey].divisions[divisionKey][dayKey].fixtures.push(
        fixture
      );
    });
  
    return groups;
  }, [fixtures, divisions]);

  function renderStatusGroup(title, statusGroup) {
    const monthEntries = Object.entries(statusGroup).sort(
      ([monthA], [monthB]) => monthA.localeCompare(monthB)
    );
  
    if (!monthEntries.length) return null;
  
    return (
      <div style={{ marginBottom: '3rem' }}>
        <button
          type="button"
          className="secondary-btn"
          style={{
            width: '100%',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}
          onClick={() => toggleFixtureSection(`status-${title}`)}
        >
          <span>{title}</span>
          <span>{openFixtureSections[`status-${title}`] ? '▲' : '▼'}</span>
        </button>
  
        {openFixtureSections[`status-${title}`] ? (
          <>
            {monthEntries.map(([monthKey, monthData]) => {
              const monthOpenKey = `${title}-${monthKey}`;
  
              return (
                <div key={monthKey} style={{ marginBottom: '1.5rem' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{
                      width: '100%',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      color: '#ff8c42'
                    }}
                    onClick={() => toggleFixtureSection(monthOpenKey)}
                  >
                    <span>{monthData.label}</span>
                    <span>{openFixtureSections[monthOpenKey] ? '▲' : '▼'}</span>
                  </button>
  
                  {openFixtureSections[monthOpenKey] ? (
                    <>
                      {['Upper', 'Lower', 'Other'].map((division) => {
                        const days = monthData.divisions[division];
  
                        if (!days) return null;
  
                        const divisionOpenKey = `${monthOpenKey}-${division}`;
  
                        return (
                          <div key={division} style={{ marginBottom: '1rem' }}>
                            <button
                              type="button"
                              className="secondary-btn"
                              style={{
                                width: '100%',
                                justifyContent: 'space-between',
                                marginBottom: '0.75rem'
                              }}
                              onClick={() =>
                                toggleFixtureSection(divisionOpenKey)
                              }
                            >
                              <span>{division}</span>
                              <span>
                                {openFixtureSections[divisionOpenKey]
                                  ? '▲'
                                  : '▼'}
                              </span>
                            </button>
  
                            {openFixtureSections[divisionOpenKey] ? (
                              <>
                                {Object.entries(days)
                                  .sort(([dateA], [dateB]) =>
                                    dateA.localeCompare(dateB)
                                  )
                                  .map(([dayKey, dayData]) => {
                                    const dayOpenKey = `${divisionOpenKey}-${dayKey}`;
  
                                    return (
                                      <div
                                        key={dayKey}
                                        style={{ marginBottom: '0.75rem' }}
                                      >
                                        <button
                                          type="button"
                                          className="secondary-btn"
                                          style={{
                                            width: '100%',
                                            justifyContent: 'space-between',
                                            marginBottom: '0.75rem'
                                          }}
                                          onClick={() =>
                                            toggleFixtureSection(dayOpenKey)
                                          }
                                        >
                                          <span>{dayData.label}</span>
                                          <span>
                                            {openFixtureSections[dayOpenKey]
                                              ? '▲'
                                              : '▼'}
                                          </span>
                                        </button>
  
                                        {openFixtureSections[dayOpenKey]
                                          ? dayData.fixtures.map((fixture) =>
                                              renderFixtureRow(fixture)
                                            )
                                          : null}
                                      </div>
                                    );
                                  })}
                              </>
                            ) : null}
                          </div>
                        );
                      })}
                    </>
                  ) : null}
                </div>
              );
            })}
          </>
        ) : null}
      </div>
    );
  }

  function startEditingFixture(fixture) {
    setEditingFixtureId(fixture.id);
    setEditingSeasonId(fixture.seasonId || '');
    setEditingCompetitionId(fixture.competitionId || '');
    setEditingDivisionId(fixture.divisionId || '');
    setEditingHomeTeamId(fixture.homeTeamId || '');
    setEditingAwayTeamId(fixture.awayTeamId || '');
    setEditingFixtureDate(fixture.fixtureDate || '');
    setEditingFixtureTime(fixture.fixtureTime || '20:30');
    setEditingMatchFormatId(fixture.matchFormatId || fixture.templateId || '');
    setEditingHomeLoanPlayerIds(fixture.homeLoanPlayerIds || []);
    setEditingAwayLoanPlayerIds(fixture.awayLoanPlayerIds || []);
  }
  
  function cancelEditingFixture() {
    setEditingFixtureId('');
    setEditingSeasonId('');
    setEditingCompetitionId('');
    setEditingDivisionId('');
    setEditingHomeTeamId('');
    setEditingAwayTeamId('');
    setEditingFixtureDate('');
    setEditingFixtureTime('20:30');
    setEditingMatchFormatId('');
    setEditingHomeLoanPlayerIds([]);
    setEditingAwayLoanPlayerIds([]);
  }
  
  async function handleSaveFixture(fixture) {
    const selectedFormat = matchFormats.find(
      (format) => format.id === editingMatchFormatId
    );
  
    try {
      await updateAdminFixture({
        fixtureId: fixture.id,
        seasonId: editingSeasonId,
        competitionId: editingCompetitionId,
        divisionId: editingDivisionId,
        homeTeamId: editingHomeTeamId,
        awayTeamId: editingAwayTeamId,
        fixtureDate: editingFixtureDate,
        fixtureTime: editingFixtureTime,
        currentMatchFormatId: fixture.matchFormatId || fixture.templateId,
        matchFormat: selectedFormat,
        status: fixture.status || 'upcoming',
        homeLoanPlayerIds: editingHomeLoanPlayerIds,
        awayLoanPlayerIds: editingAwayLoanPlayerIds
      });
  
      cancelEditingFixture();
      setMessage('Fixture updated successfully.');
      await loadPageData();
    } catch (error) {
      setMessage(error.message || 'Could not update fixture.');
    }
  }

  function renderFixtureRow(fixture) {
    return (
      <div key={fixture.id} className="admin-season-row">
        <div className="admin-season-main competition-main-stacked">
          {editingFixtureId === fixture.id ? (
            <>
              <CustomSelect
                value={editingSeasonId}
                onChange={(value) => {
                  setEditingSeasonId(value);
                  setEditingDivisionId('');
                  setEditingHomeTeamId('');
                  setEditingAwayTeamId('');
                }}
                options={seasons.map((season) => ({
                  value: season.id,
                  label: season.name
                }))}
                placeholder="Select season"
              />
  
              <CustomSelect
                value={editingCompetitionId}
                onChange={(value) => {
                  setEditingCompetitionId(value);
                  setEditingDivisionId('');
                  setEditingHomeTeamId('');
                  setEditingAwayTeamId('');
                }}
                options={competitions.map((competition) => ({
                  value: competition.id,
                  label: `${competition.name} • ${getSeasonName(
                    competition.seasonId
                  )}`
                }))}
                placeholder="Select competition"
              />
  
              <CustomSelect
                value={editingDivisionId}
                onChange={(value) => {
                  setEditingDivisionId(value);
                  setEditingHomeTeamId('');
                  setEditingAwayTeamId('');
                }}
                options={editingAvailableDivisions.map((division) => ({
                  value: division.id,
                  label: division.name
                }))}
                placeholder="Select division"
              />
  
              <CustomSelect
                value={editingHomeTeamId}
                onChange={setEditingHomeTeamId}
                options={editingAvailableTeams.map((team) => ({
                  value: team.id,
                  label: team.name
                }))}
                placeholder="Select home team"
              />
  
              <CustomSelect
                value={editingAwayTeamId}
                onChange={setEditingAwayTeamId}
                options={editingAvailableTeams
                  .filter((team) => team.id !== editingHomeTeamId)
                  .map((team) => ({
                    value: team.id,
                    label: team.name
                  }))}
                placeholder="Select away team"
              />
  
              <CustomSelect
                value={editingMatchFormatId}
                onChange={setEditingMatchFormatId}
                options={matchFormats.map((format) => ({
                  value: format.id,
                  label: `${format.name} • ${format.pointsSystem} Point`
                }))}
                placeholder="Select match format"
              />
  
              <input
                className="form-input admin-season-edit-input"
                type="date"
                value={editingFixtureDate}
                onChange={(event) => setEditingFixtureDate(event.target.value)}
              />
  
              <input
                className="form-input admin-season-edit-input"
                type="time"
                value={editingFixtureTime}
                onChange={(event) => setEditingFixtureTime(event.target.value)}
              />

<div className="panel" style={{ marginTop: '1rem' }}>
  <h4 className="panel-title">Home Loan Players</h4>

  <CustomSelect
    value=""
    onChange={addHomeLoanPlayer}
    options={getClubLoanPlayerOptions(
      editingHomeTeamId,
      editingHomeLoanPlayerIds
    )}
    placeholder="Add home loan player"
  />

  <div className="competition-tags-row" style={{ marginTop: '0.75rem' }}>
    {editingHomeLoanPlayerIds.map((playerId) => (
      <button
        key={playerId}
        type="button"
        className="admin-season-status active"
        onClick={() => removeHomeLoanPlayer(playerId)}
      >
        {getRegistryPlayerName(playerId)} ×
      </button>
    ))}
  </div>
</div>

<div className="panel" style={{ marginTop: '1rem' }}>
  <h4 className="panel-title">Away Loan Players</h4>

  <CustomSelect
    value=""
    onChange={addAwayLoanPlayer}
    options={getClubLoanPlayerOptions(
      editingAwayTeamId,
      editingAwayLoanPlayerIds
    )}
    placeholder="Add away loan player"
  />

  <div className="competition-tags-row" style={{ marginTop: '0.75rem' }}>
    {editingAwayLoanPlayerIds.map((playerId) => (
      <button
        key={playerId}
        type="button"
        className="admin-season-status active"
        onClick={() => removeAwayLoanPlayer(playerId)}
      >
        {getRegistryPlayerName(playerId)} ×
      </button>
    ))}
  </div>
</div>
            </>
          ) : (
            <>
              <strong>
                {getTeamName(fixture.homeTeamId)} vs{' '}
                {getTeamName(fixture.awayTeamId)}
              </strong>
  
              <div className="competition-tags-row">
                <span className="admin-season-status inactive">
                  {getSeasonName(fixture.seasonId)}
                </span>
  
                <span className="admin-season-status inactive">
                  {getCompetitionName(fixture.competitionId)}
                </span>
  
                <span className="admin-season-status inactive">
                  {getDivisionName(fixture.divisionId)}
                </span>
  
                <span
  className="admin-season-status"
  style={{
    background:
      getMatchFormatName(
        fixture.matchFormatId || fixture.templateId
      )?.includes('32')
        ? 'rgba(255, 140, 66, 0.18)'
        : 'rgba(59, 130, 246, 0.18)',

    color:
      getMatchFormatName(
        fixture.matchFormatId || fixture.templateId
      )?.includes('32')
        ? '#ff8c42'
        : '#60a5fa',

    border:
      getMatchFormatName(
        fixture.matchFormatId || fixture.templateId
      )?.includes('32')
        ? '1px solid rgba(255, 140, 66, 0.4)'
        : '1px solid rgba(96, 165, 250, 0.4)'
  }}
>
  {getMatchFormatName(
    fixture.matchFormatId || fixture.templateId
  )}
</span>
  
                <span
                  className={`admin-season-status ${
                    fixture.status === 'completed' ? 'inactive' : 'active'
                  }`}
                >
                  {fixture.status || 'upcoming'}
                </span>
  
                <span className="admin-season-status inactive">
                  {fixture.fixtureDate || 'No date'} •{' '}
                  {fixture.fixtureTime || '20:30'}
                </span>

                {fixture.homeLoanPlayerIds?.length ? (
  <span className="admin-season-status active">
    Home Loans: {fixture.homeLoanPlayerIds.length}
  </span>
) : null}

{fixture.awayLoanPlayerIds?.length ? (
  <span className="admin-season-status active">
    Away Loans: {fixture.awayLoanPlayerIds.length}
  </span>
) : null}
              </div>
            </>
          )}
        </div>
  
        <div className="admin-season-actions">
          {editingFixtureId === fixture.id ? (
            <>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => handleSaveFixture(fixture)}
              >
                Save
              </button>
  
              <button
                type="button"
                className="secondary-btn"
                onClick={cancelEditingFixture}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => startEditingFixture(fixture)}
              >
                Edit
              </button>
  
              <button
                type="button"
                className="secondary-btn danger-btn"
                onClick={() => setFixtureToDelete(fixture)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack admin-fixtures-page">
      <PageHeader
        title="Fixture Manager"
        subtitle="Create and manage fixtures from saved match formats."
      />

<AdminStepNavigation
  previousTo="/admin/match-formats"
  previousLabel="Previous: Match Formats"
  finish
/>

      <section className="panel premium-panel">
      <div className="panel-header">
  <h3 className="panel-title">Create Fixture</h3>

  <div style={{ display: 'flex', gap: '0.75rem' }}>
    <button
      type="button"
      className="secondary-btn"
      onClick={handleImportPlacementsFixtures}
    >
      Import Placements Fixtures
    </button>

    <Link to="/admin" className="panel-link">
      Dashboard
    </Link>
  </div>
</div>

        <form className="auth-form" onSubmit={handleCreateFixture}>
          <div className="register-form-grid">
            <div className="form-row">
              <label className="form-label">Season</label>
              <CustomSelect
                value={seasonId}
                onChange={(value) => {
                  setSeasonId(value);
                  setDivisionId('');
                  setHomeTeamId('');
                  setAwayTeamId('');
                }}
                options={seasons.map((season) => ({
                  value: season.id,
                  label: season.name
                }))}
                placeholder="Select season"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Competition</label>
              <CustomSelect
                value={competitionId}
                onChange={(value) => {
                  setCompetitionId(value);
                  setDivisionId('');
                  setHomeTeamId('');
                  setAwayTeamId('');
                }}
                options={competitions.map((competition) => ({
                  value: competition.id,
                  label: `${competition.name} • ${getSeasonName(competition.seasonId)}`
                }))}
                placeholder="Select competition"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Division</label>
              <CustomSelect
                value={divisionId}
                onChange={(value) => {
                  setDivisionId(value);
                  setHomeTeamId('');
                  setAwayTeamId('');
                }}
                options={availableDivisions.map((division) => ({
                  value: division.id,
                  label: division.name
                }))}
                placeholder="Select division"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Home Team</label>
              <CustomSelect
                value={homeTeamId}
                onChange={setHomeTeamId}
                options={availableTeams.map((team) => ({
                  value: team.id,
                  label: team.name
                }))}
                placeholder="Select home team"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Away Team</label>
              <CustomSelect
                value={awayTeamId}
                onChange={setAwayTeamId}
                options={availableTeams
                  .filter((team) => team.id !== homeTeamId)
                  .map((team) => ({
                    value: team.id,
                    label: team.name
                  }))}
                placeholder="Select away team"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Match Format</label>
              <CustomSelect
                value={matchFormatId}
                onChange={setMatchFormatId}
                options={matchFormats.map((format) => ({
                  value: format.id,
                  label: `${format.name} • ${format.pointsSystem} Point`
                }))}
                placeholder="Select match format"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Fixture Date</label>
              <input
                className="form-input"
                type="date"
                value={fixtureDate}
                onChange={(event) => setFixtureDate(event.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label">Fixture Time</label>
              <input
                className="form-input"
                type="time"
                value={fixtureTime}
                onChange={(event) => setFixtureTime(event.target.value)}
              />
            </div>
          </div>

          {message ? <div className="form-success">{message}</div> : null}

          <button type="submit" className="primary-btn auth-submit-btn">
            Create Fixture
          </button>
        </form>
      </section>

      <section className="panel premium-panel">
  <div className="panel-header">
    <h3 className="panel-title">Existing Fixtures</h3>
  </div>

  <div className="admin-season-list">
    {fixtures.length === 0 ? (
      <p className="muted-text">No fixtures created yet.</p>
    ) : (
      <>
        {renderStatusGroup('Today', groupedFixtures.today)}
        {renderStatusGroup('Upcoming Fixtures', groupedFixtures.upcoming)}
        {renderStatusGroup('Completed Fixtures', groupedFixtures.completed)}
      </>
    )}
  </div>
</section>

      {fixtureToDelete ? (
        <div className="premium-confirm-backdrop">
          <div className="premium-confirm-modal">
            <div className="premium-confirm-kicker">Confirm Delete</div>

            <h3>Delete Fixture?</h3>

            <p>
              You are about to delete{' '}
              <strong>
                {getTeamName(fixtureToDelete.homeTeamId)} vs {getTeamName(fixtureToDelete.awayTeamId)}
              </strong>
              . This action cannot be undone.
            </p>

            <div className="premium-confirm-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setFixtureToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="secondary-btn danger-btn"
                onClick={confirmDeleteFixture}
              >
                Delete Fixture
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}