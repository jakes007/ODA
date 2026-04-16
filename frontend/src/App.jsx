import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import CompetitionOverviewPage from './pages/CompetitionOverviewPage';
import StandingsPage from './pages/StandingsPage';
import RankingsPage from './pages/RankingsPage';
import FixturesPage from './pages/FixturesPage';
import PlayerProfilePage from './pages/PlayerProfilePage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/competition/overview" replace />} />
        <Route path="/competition/overview" element={<CompetitionOverviewPage />} />
        <Route path="/competition/standings" element={<StandingsPage />} />
        <Route path="/competition/rankings" element={<RankingsPage />} />
        <Route path="/competition/fixtures" element={<FixturesPage />} />
        <Route path="/player/:playerId" element={<PlayerProfilePage />} />
      </Routes>
    </AppLayout>
  );
}