import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { getPlayerProfile } from '../services/playerData';
import { useAuth } from '../context/AuthContext';

export default function PlayerDashboardPage() {
  const { currentUser } = useAuth();
  const profile = currentUser?.playerId ? getPlayerProfile(currentUser.playerId) : null;

  return (
    <div className="page-stack">
      <PageHeader
        title="Player Dashboard"
        subtitle={`Welcome back, ${currentUser?.displayName ?? 'Player'}`}
      />

      {profile ? (
        <>
          <div className="stats-grid">
            <StatCard label="Matches Played" value={profile.aggregate.matchesPlayed} />
            <StatCard label="Wins" value={profile.aggregate.matchesWon} />
            <StatCard label="Average" value={profile.aggregate.threeDartAverage} />
            <StatCard label="High Checkout" value={profile.aggregate.highestCheckout} />
          </div>

          <section className="panel">
            <h3 className="panel-title">Quick Access</h3>
            <div className="landing-actions">
              <Link to={`/player/${currentUser.playerId}`} className="primary-btn">
                View My Profile
              </Link>
              <Link to="/competition/fixtures" className="secondary-btn">
                View Fixtures
              </Link>
              <Link to="/competition/rankings" className="secondary-btn">
                View Rankings
              </Link>
            </div>
          </section>
        </>
      ) : (
        <section className="panel">
          <p className="muted-text">No linked player profile found yet.</p>
        </section>
      )}
    </div>
  );
}