import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import {
  getCaptainFixtureSetupData,
  submitCaptainLineup,
  validateCaptainLineup
} from '../services/captainData';

export default function CaptainFixtureSetupPage() {
  const { fixtureId } = useParams();
  const { currentUser } = useAuth();

  const fixture = currentUser?.playerId
    ? getCaptainFixtureSetupData(currentUser.playerId, fixtureId)
    : null;

  const [lineup, setLineup] = useState(fixture?.currentLineup ?? []);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const lineupPlayers = useMemo(() => {
    if (!fixture) return [];

    return lineup
      .map((playerId) => fixture.squad.find((player) => player.playerId === playerId))
      .filter(Boolean);
  }, [fixture, lineup]);

  if (!fixture) {
    return <EmptyState message="Fixture setup data not found." />;
  }

  function handleLineupChange(index, nextPlayerId) {
    const nextLineup = [...lineup];
    nextLineup[index] = nextPlayerId;

    setLineup(nextLineup);
    setSuccessMessage('');

    const validation = validateCaptainLineup(fixture, nextLineup);
    setErrors(validation.valid ? [] : validation.errors);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const result = submitCaptainLineup(currentUser.playerId, fixtureId, lineup);

    if (!result.success) {
      setErrors(result.errors ?? [result.message]);
      setSuccessMessage('');
      return;
    }

    setErrors([]);
    setSuccessMessage(result.message);
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Captain Fixture Setup"
        subtitle={`${fixture.fixtureName} • ${fixture.competition.name} ${fixture.competition.season}`}
      />

      <section className="panel">
        <div className="section-heading-row">
          <h3 className="panel-title">Fixture Details</h3>
          <Link to="/captain" className="text-link">
            Back to Captain Dashboard
          </Link>
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">My Team</div>
            <div className="muted-text">{fixture.team.teamName}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Opponent</div>
            <div className="muted-text">{fixture.opponent.teamName}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Fixture Status</div>
            <div className="muted-text">{formatStatus(fixture.status)}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Required Lineup Size</div>
            <div className="muted-text">{fixture.requiredLineupSize}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Notes</div>
            <div className="muted-text">{fixture.notes}</div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Set Playing Order</h3>

        <form className="auth-form" onSubmit={handleSubmit}>
          {lineup.map((selectedPlayerId, index) => (
            <div key={`lineup-slot-${index}`} className="form-row">
              <label className="form-label" htmlFor={`lineup-slot-${index}`}>
                Player {index + 1}
              </label>

              <select
                id={`lineup-slot-${index}`}
                className="form-input"
                value={selectedPlayerId}
                onChange={(event) => handleLineupChange(index, event.target.value)}
                disabled={fixture.status === 'completed'}
              >
                {fixture.squad.map((player) => (
                  <option key={player.playerId} value={player.playerId}>
                    {player.displayName}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {errors.length > 0 ? (
            <div className="form-error-list">
              {errors.map((error, index) => (
                <div key={`${error}-${index}`} className="form-error">
                  {error}
                </div>
              ))}
            </div>
          ) : null}

          {successMessage ? (
            <div className="form-success">{successMessage}</div>
          ) : null}

          <button
            type="submit"
            className="primary-btn auth-submit-btn"
            disabled={fixture.status === 'completed'}
          >
            Submit Lineup
          </button>
        </form>
      </section>

      <section className="panel">
        <h3 className="panel-title">Current Selected Order</h3>

        <div className="feature-list">
          {lineupPlayers.map((player, index) => (
            <div key={player.playerId} className="feature-item">
              <div className="feature-title">
                {index + 1}. {player.displayName}
              </div>
              <div className="muted-text">{player.playerId}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Ready-to-Play Flow</h3>
        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">Validation</div>
            <div className="muted-text">
              Duplicate players and invalid squad selections are blocked before submission.
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Fixture Progress</div>
            <div className="muted-text">
              Once a valid lineup is submitted, the fixture status becomes Ready To Play.
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Next Step</div>
            <div className="muted-text">
              The next phase will allow captains to launch fixture-driven live scoring.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatStatus(status) {
  const labels = {
    ready_for_lineup: 'Ready For Lineup',
    ready_to_play: 'Ready To Play',
    completed: 'Completed'
  };

  return labels[status] ?? status;
}