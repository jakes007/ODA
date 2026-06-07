import { Radio, Trophy } from 'lucide-react';
import { GiDart } from 'react-icons/gi';
import guardiansLogo from '../../assets/guardians-logo.png';
import seagullsLogo from '../../assets/seagulls-logo.png';
import defaultTeamLogo from '../../assets/default-team-logo.png';

export function TeamCrest({ teamName, side = 'home', size = 'medium' }) {
  return (
    <div className={`pb-team-crest ${side} ${size}`}>
      <img src={getTeamLogo(teamName)} alt={`${teamName} crest`} />
    </div>
  );
}

export function LivePulse({ label = 'Live' }) {
  return (
    <span className="pb-live-pulse">
      <i />
      {label}
    </span>
  );
}

export function GlowDart({ side = 'cyan', size = 24 }) {
  return <GiDart className={`pb-glow-dart ${side}`} size={size} aria-hidden="true" />;
}

export function BroadcastHeading({ title, subtitle, action }) {
  return (
    <header className="pb-heading">
      <div>
        <div className="pb-heading-title">
          <Radio size={25} />
          <h1>{title}</h1>
        </div>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function FixtureScoreboard({ fixture, compact = false }) {
  const score = getScoreParts(fixture.scoreText);
  const homeName = fixture.homeTeam?.teamName || 'Home Team';
  const awayName = fixture.awayTeam?.teamName || 'Away Team';

  return (
    <section className={`pb-fixture-scoreboard ${compact ? 'compact' : ''}`}>
      <div className="pb-score-team home">
        <TeamCrest teamName={homeName} side="home" size={compact ? 'medium' : 'large'} />
        <div>
          <strong>{homeName}</strong>
          <span>Home</span>
        </div>
      </div>

      <div className="pb-score-centre">
        <LivePulse label={fixture.status === 'completed' ? 'Final' : 'Live'} />
        <div className="pb-score-value">
          <b>{score.home}</b>
          <em>-</em>
          <b>{score.away}</b>
        </div>
        <span>{fixture.format?.name || 'Fixture Format'}</span>
      </div>

      <div className="pb-score-team away">
        <div>
          <strong>{awayName}</strong>
          <span>Away</span>
        </div>
        <TeamCrest teamName={awayName} side="away" size={compact ? 'medium' : 'large'} />
      </div>
    </section>
  );
}

export function CompetitionLabel({ fixture }) {
  return (
    <span className="pb-competition-label">
      <Trophy size={17} />
      {getFixtureDivisionLabel(fixture)} / {fixture.competition?.season || '2026'}
    </span>
  );
}

export function getTeamLogo(name = '') {
  const cleanName = name.toLowerCase();
  if (cleanName.includes('guardian')) return guardiansLogo;
  if (cleanName.includes('seagull')) return seagullsLogo;
  return defaultTeamLogo;
}

export function getScoreParts(scoreText) {
  const scores = String(scoreText || '0 - 0').match(/\d+/g) || [];
  return { home: scores[0] || '0', away: scores[1] || '0' };
}

export function getFixtureDivisionLabel(fixture) {
  const text = [
    fixture?.division,
    fixture?.divisionName,
    fixture?.competition?.division,
    fixture?.competition?.divisionName,
    fixture?.competition?.name,
    fixture?.fixtureName,
    fixture?.homeTeam?.teamName,
    fixture?.awayTeam?.teamName
  ].filter(Boolean).join(' ').toLowerCase();
  const competition = fixture?.competition?.name || 'Placements';

  if (text.includes('upper') || /\b1\b/.test(text)) return `Upper ${competition}`;
  if (text.includes('lower') || /\b[23]\b/.test(text)) return `Lower ${competition}`;
  return competition;
}

export function getMatchupPlayers(matchup) {
  const home = matchup.homePlayers?.map((player) => player.displayName).filter(Boolean).join(' & ');
  const away = matchup.awayPlayers?.map((player) => player.displayName).filter(Boolean).join(' & ');
  const labelParts = String(matchup.label || '').split(' vs ');

  return {
    home: home || labelParts[0]?.trim() || 'Home Player',
    away: away || labelParts[1]?.trim() || 'Away Player'
  };
}
