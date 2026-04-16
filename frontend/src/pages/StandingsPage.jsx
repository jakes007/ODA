import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/tables/DataTable';
import { standingsRows } from '../data/mockCompetitionData';

const columns = [
  { key: 'position', label: '#' , render: (_, index) => index + 1 },
  { key: 'teamName', label: 'Team' },
  { key: 'played', label: 'P' },
  { key: 'won', label: 'W' },
  { key: 'drawn', label: 'D' },
  { key: 'lost', label: 'L' },
  { key: 'pointsFor', label: 'PF' },
  { key: 'pointsAgainst', label: 'PA' },
  { key: 'difference', label: 'Diff' },
  { key: 'leaguePoints', label: 'Pts' }
];

export default function StandingsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Standings"
        subtitle="Competition table"
      />
      <DataTable columns={columns} rows={standingsRows} />
    </div>
  );
}