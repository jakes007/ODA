import { useMemo, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import CustomSelect from '../components/common/CustomSelect';
import { importedRegistryData } from '../data/importedRegistryData';
import { Link } from 'react-router-dom';

export default function AdminRegistryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clubFilter, setClubFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const players = useMemo(() => {
    return importedRegistryData?.players || [];
  }, []);

  const clubOptions = useMemo(() => {
    return (importedRegistryData?.clubs || []).map((club) => ({
      value: club.clubName,
      label: club.clubName
    }));
  }, []);
  
  const categoryOptions = useMemo(() => {
    const categories = [
      ...new Set(
        players
          .map((player) => player.category)
          .filter(Boolean)
      )
    ];
  
    return categories.map((category) => ({
      value: category,
      label: category
    }));
  }, [players]);



  const filteredPlayers = players.filter((player) => {
    const matchesSearch = [
      player.fullName,
      player.firstNames,
      player.callingName,
      player.surname,
      player.clubName,
      player.dsaNumber,
      player.membershipNo,
      player.playerId,
      player.category
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  
    const matchesClub = clubFilter
      ? player.clubName === clubFilter
      : true;
  
    const matchesCategory = categoryFilter
      ? player.category === categoryFilter
      : true;
  
    return (
      matchesSearch &&
      matchesClub &&
      matchesCategory
    );
  });

  const missingDsa = players.filter(
    (player) => !player.dsaNumber && !player.membershipNo
  ).length;

  return (
    <div className="page-stack">
      <PageHeader
        title="Registry & Players"
        subtitle="View registry-linked players, clubs, DSA numbers, and player records."
      />

      <div className="admin-status-grid">
        <div className="admin-status-item">
          <span className="admin-status-label">Total Players</span>
          <strong>{players.length}</strong>
        </div>

        <div className="admin-status-item">
          <span className="admin-status-label">Filtered Players</span>
          <strong>{filteredPlayers.length}</strong>
        </div>

        <div className="admin-status-item">
          <span className="admin-status-label">Missing DSA Numbers</span>
          <strong>{missingDsa}</strong>
        </div>
      </div>

      <section className="panel premium-panel">
      <div className="panel-header">
  <h3 className="panel-title">Player Registry</h3>

  <Link to="/admin" className="panel-link">
    Back to Dashboard
  </Link>
</div>

        <div className="register-form-grid">
          <div className="form-row">
            <label className="form-label">Search</label>
            <input
              className="form-input"
              type="text"
              placeholder="Search player, club, DSA number, or category..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="form-row">
            <label className="form-label">Club</label>
            <CustomSelect
              value={clubFilter}
              onChange={setClubFilter}
              options={[
                { value: '', label: 'All Clubs' },
                ...clubOptions
              ]}
              placeholder="All Clubs"
            />
          </div>

          <div className="form-row">
  <label className="form-label">Category</label>

  <CustomSelect
    value={categoryFilter}
    onChange={setCategoryFilter}
    options={[
      { value: '', label: 'All Categories' },
      ...categoryOptions
    ]}
    placeholder="All Categories"
  />
</div>

        </div>

        <div className="admin-season-list" style={{ marginTop: '1rem' }}>
          {filteredPlayers.map((player) => (
            <div key={player.playerId} className="admin-season-row">
              <div className="admin-season-main competition-main-stacked">
                <strong>{player.fullName}</strong>

                <div className="competition-tags-row">
                  <span className="admin-season-status inactive">
                    {player.clubName}
                  </span>

                  <span className="admin-season-status inactive">
                    DSA: {player.dsaNumber || player.membershipNo || 'Missing'}
                  </span>

                  <span className="admin-season-status inactive">
                    Category: {player.category || 'N/A'}
                  </span>

                  <span className="admin-season-status inactive">
                    {player.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {!filteredPlayers.length ? (
            <p className="muted-text">No players found.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}