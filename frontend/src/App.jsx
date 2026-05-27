import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ScrollToTop from './components/layout/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import LandingPage from './pages/LandingPage';
import PublicLiveFixturePage from './pages/PublicLiveFixturePage';
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
import FixtureDetailPage from './pages/FixtureDetailPage';
import ClubRankingsPage from './pages/ClubRankingsPage';
import AdminSeasonsPage from './pages/AdminSeasonsPage';
import AdminCompetitionsPage from './pages/AdminCompetitionsPage';
import AdminDivisionsPage from './pages/AdminDivisionsPage';
import AdminTeamsPage from './pages/AdminTeamsPage';
import AdminFixturesPage from './pages/AdminFixturesPage';
import AdminMatchFormatsPage from './pages/AdminMatchFormatsPage';
import AdminTeamDetailPage from './pages/AdminTeamDetailPage';
import AdminRegistryPage from './pages/AdminRegistryPage';
import PublicLiveHubPage from './pages/PublicLiveHubPage';
import PublicLiveBoardPage from './pages/PublicLiveBoardPage';

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route
          path="/live/:fixtureId/board/:matchupId"
          element={<PublicLiveBoardPage />}
        />

        <Route
          path="*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/live" element={<PublicLiveHubPage />} />
                <Route path="/live/:fixtureId" element={<PublicLiveFixturePage />} />

                <Route path="/competition/standings" element={<StandingsPage />} />
                <Route path="/competition/rankings" element={<RankingsPage />} />
                <Route path="/competition/fixtures" element={<FixturesPage />} />
                <Route path="/competition/fixtures/:fixtureId" element={<FixtureDetailPage />} />
                <Route path="/competition/club-rankings" element={<ClubRankingsPage />} />
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

                <Route
                  path="/admin/seasons"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminSeasonsPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/competitions"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminCompetitionsPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/divisions"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminDivisionsPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/teams"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminTeamsPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/teams/:teamId"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminTeamDetailPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/fixtures"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminFixturesPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/match-formats"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminMatchFormatsPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/registry"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminRegistryPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>
    </>
  );
}