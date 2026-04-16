import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/tables/DataTable';
import { rankingsRows } from '../data/mockCompetitionData';

const columns = [
  { key: 'position', label: '#', render: (_, index) => index + 1 },
  { key: 'displayName', label: 'Player' },
  { key: 'matchesPlayed', label: 'MP' },
  { key: 'matchesWon', label: 'W' },
  { key: 'threeDartAverage', label: 'Avg' },
  { key: 'highestCheckout', label: 'High CO' }
];

export default function RankingsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Rankings"
        subtitle="Player competition rankings"
      />
      <DataTable columns={columns} rows={rankingsRows} />
    </div>
  );
}