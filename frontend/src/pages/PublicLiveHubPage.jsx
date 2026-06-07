import { createElement, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Clock3,
  Radio,
  RefreshCw,
  Target,
  UsersRound
} from 'lucide-react';
import { GiDart } from 'react-icons/gi';
import EmptyState from '../components/common/EmptyState';
import {
  BroadcastHeading,
  CompetitionLabel,
  FixtureScoreboard,
  LivePulse,
  TeamCrest,
  getFixtureDivisionLabel,
  getScoreParts
} from '../components/public/PublicBroadcast';
import { getActivePublicLiveFixtures } from '../services/captainFixtureService';

export default function PublicLiveHubPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFixtures();
    const intervalId = setInterval(loadFixtures, 5000);
    return () => clearInterval(intervalId);
  }, []);

  async function loadFixtures() {
    setFixtures(sortLiveFixtures(await getActivePublicLiveFixtures()));
    setLoading(false);
  }

  const hubStats = useMemo(() => ({
    activeBoards: fixtures.reduce(
      (total, fixture) => total + Number(fixture.liveSession?.activeBoardCount || 0),
      0
    ),
    totalMatchups: fixtures.reduce(
      (total, fixture) => total + Number(fixture.liveSession?.games?.length || 0),
      0
    )
  }), [fixtures]);

  if (loading) return <EmptyState message="Loading live fixtures..." />;

  const featuredFixture = fixtures[0];
  const otherFixtures = fixtures.slice(1);

  return (
    <div className="pb-page pb-live-hub">
      <BroadcastHeading
        title="Live Match Centre"
        subtitle={<>Matches happening <strong>now</strong></>}
        action={
          <div className="pb-auto-refresh">
            <RefreshCw size={16} /> Auto-refresh <span>5s</span><i />
          </div>
        }
      />

      {featuredFixture ? (
        <section className="pb-featured-fixture">
          <div className="pb-featured-label"><Radio size={18} /> Featured Live</div>
          <FixtureScoreboard fixture={featuredFixture} />
          <div className="pb-featured-footer">
            <CompetitionLabel fixture={featuredFixture} />
            <span><Target size={18} /> {featuredFixture.liveSession?.activeBoardCount || 0} active board</span>
            <span><UsersRound size={18} /> {featuredFixture.liveSession?.games?.length || 0} matchups</span>
            <Link to={`/live/${featuredFixture.fixtureId}`} className="pb-primary-action">
              <Radio size={20} /><span>Watch Live</span><ArrowRight size={22} />
            </Link>
          </div>
        </section>
      ) : (
        <section className="pb-empty-state">
          <Radio size={35} />
          <h2>No fixtures are currently live</h2>
          <p>Live fixtures will appear here automatically once scoring starts.</p>
        </section>
      )}

      {featuredFixture && (
        <section className="pb-live-list-section">
          <div className="pb-section-heading">
            <div><Radio size={20} /><h2>Other Live Fixtures</h2></div>
            <span>{fixtures.length} live now</span>
          </div>

          <div className="pb-live-fixture-list">
            {otherFixtures.length
              ? otherFixtures.map((fixture) => <CompactFixtureRow key={fixture.fixtureId} fixture={fixture} />)
              : <div className="pb-empty-state compact"><Radio size={25} /><p>No other fixtures are live right now.</p></div>}
          </div>
        </section>
      )}

      <section className="pb-activity-strip">
        <div className="pb-activity-title"><Activity size={19} /><strong>Live Activity</strong></div>
        <ActivityItem icon={GiDart} value="Live" label={`${hubStats.activeBoards} active boards`} />
        <ActivityItem icon={UsersRound} value={hubStats.totalMatchups} label="matchups scheduled" />
        <ActivityItem icon={Clock3} value="5s" label="score refresh" />
      </section>
    </div>
  );
}

function CompactFixtureRow({ fixture }) {
  const score = getScoreParts(fixture.scoreText);

  return (
    <article className="pb-live-fixture-row">
      <LivePulse />
      <div className="pb-row-team home">
        <TeamCrest teamName={fixture.homeTeam.teamName} side="home" size="small" />
        <strong>{fixture.homeTeam.teamName}</strong>
      </div>
      <div className="pb-row-score"><b>{score.home}</b><span>-</span><b>{score.away}</b></div>
      <div className="pb-row-team away">
        <TeamCrest teamName={fixture.awayTeam.teamName} side="away" size="small" />
        <strong>{fixture.awayTeam.teamName}</strong>
      </div>
      <div className="pb-row-meta">
        <span>{getFixtureDivisionLabel(fixture)}</span>
        <small>{fixture.liveSession?.activeBoardCount || 0} active board</small>
      </div>
      <Link to={`/live/${fixture.fixtureId}`} className="pb-outline-action">
        Watch <ArrowRight size={17} />
      </Link>
    </article>
  );
}

function ActivityItem({ icon, value, label }) {
  return (
    <div className="pb-activity-item">
      {createElement(icon, { size: 20 })}
      <div><strong>{value}</strong><span>{label}</span></div>
    </div>
  );
}

function sortLiveFixtures(fixtures) {
  return [...fixtures].sort((a, b) => {
    const labels = [getFixtureDivisionLabel(a), getFixtureDivisionLabel(b)];
    const priorities = labels.map((label) => label.toLowerCase().includes('upper') ? 1 : label.toLowerCase().includes('lower') ? 2 : 3);
    return priorities[0] - priorities[1] || String(a.fixtureName || '').localeCompare(String(b.fixtureName || ''));
  });
}
