import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/tables/DataTable';
import { getCompetitionRankings } from '../services/competitionData';

const columns = [
  { key: 'position', label: '#', render: (_, index) => index + 1 },
  { key: 'displayName', label: 'Player' },
  { key: 'matchesPlayed', label: 'MP' },
  { key: 'matchesWon', label: 'W' },
  { key: 'threeDartAverage', label: 'Avg' },
  { key: 'highestCheckout', label: 'High CO' }
];

export default function RankingsPage() {
  const data = getCompetitionRankings();

  return (
    <div className="page-stack">
      <PageHeader
        title="Rankings"
        subtitle={`${data.competition.name} • ${data.competition.season}`}
      />
      <DataTable columns={columns} rows={data.rankings} />
    </div>
  );
}