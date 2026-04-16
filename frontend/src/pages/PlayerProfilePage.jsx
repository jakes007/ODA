import { useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import { getPlayerProfile } from '../services/playerData';

export default function PlayerProfilePage() {
  const { playerId } = useParams();
  const profile = getPlayerProfile(playerId);

  if (!profile) {
    return <EmptyState message="Player profile not found." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={profile.player.displayName}
        subtitle={`${profile.player.associationName} • ${profile.player.publicStatus}`}
      />

      <div className="stats-grid">
        <StatCard label="Matches Played" value={profile.aggregate.matchesPlayed} />
        <StatCard label="Wins" value={profile.aggregate.matchesWon} />
        <StatCard label="Average" value={profile.aggregate.threeDartAverage} />
        <StatCard label="High Checkout" value={profile.aggregate.highestCheckout} />
      </div>

      <section className="panel">
        <h3 className="panel-title">Match History</h3>

        {profile.history.map((entry) => {
          const playerRow = entry.summary.players.find((p) => p.isProfileOwner);

          return (
            <div key={entry.historyId} className="history-row">
              <div>
                <div className="history-title">{entry.competitionName}</div>
                <div className="muted-text">{entry.fixtureName}</div>
                <div className="muted-text">{entry.playedAt}</div>
              </div>

              <div className="history-stats">
                <span>{playerRow?.result}</span>
                <span>Avg {playerRow?.threeDartAverage}</span>
                <span>CO {playerRow?.highestCheckout}</span>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}