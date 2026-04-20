import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ScrollToTop from './components/layout/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import LandingPage from './pages/LandingPage';
import PublicLiveFixturePage from './pages/PublicLiveFixturePage';
import CompetitionOverviewPage from './pages/CompetitionOverviewPage';
import StandingsPage from './pages/StandingsPage';
import RankingsPage from './pages/RankingsPage';
import FixturesPage from './pages/FixturesPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlayerDashboardPage from './pages/PlayerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CaptainDashboardPage from './pages/CaptainDashboardPage';
import CaptainFixtureSetupPage from './pages/CaptainFixtureSetupPage';
import CaptainLiveScoringPage from './pages/CaptainLiveScoringPage';
import CaptainMatchupScoringPage from './pages/CaptainMatchupScoringPage';

export default function App() {
  return (
    <AppLayout>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/competition/overview" element={<CompetitionOverviewPage />} />
        <Route path="/competition/standings" element={<StandingsPage />} />
        <Route path="/competition/rankings" element={<RankingsPage />} />
        <Route path="/competition/fixtures" element={<FixturesPage />} />
        <Route path="/player/:playerId" element={<PlayerProfilePage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['player']}>
                <PlayerDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/captain"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['captain']}>
                <CaptainDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/captain/fixture/:fixtureId/setup"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['captain']}>
                <CaptainFixtureSetupPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/captain/fixture/:fixtureId/live"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['captain']}>
                <CaptainLiveScoringPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

<Route
          path="/live/:fixtureId"
          element={<PublicLiveFixturePage />}
        />

        <Route
          path="/captain/fixture/:fixtureId/matchup/:matchupId"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['captain']}>
                <CaptainMatchupScoringPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppLayout>
  );
}