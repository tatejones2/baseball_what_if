import { getCliNCHStatus } from '../utils/tournamentLogic'

const statusClass = {
  CLINCHED: 'badge-clinched',
  IN: 'badge-in',
  CHASING: 'badge-chasing',
  ELIMINATED: 'badge-eliminated',
}

function formatPct(pct) {
  return pct.toFixed(3)
}

function StandingsTable({
  teams,
  highlightTeamId,
  showDividerAfterRank,
  compact = false,
}) {
  const statuses = getCliNCHStatus(teams)
  const statusMap = Object.fromEntries(
    statuses.map(({ teamId, status }) => [teamId, status]),
  )

  return (
    <div className="table-wrap">
      <table className={`standings-table ${compact ? 'is-compact' : ''}`}>
        <thead>
          <tr>
            <th>Rk</th>
            <th>Team</th>
            <th>Conf</th>
            <th>Pct</th>
            <th>GB</th>
            {!compact && <th>Overall</th>}
            {!compact && <th>Rem</th>}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => {
            const status = statusMap[team.id] ?? 'CHASING'
            const rowClass = [
              team.id === highlightTeamId ? 'is-highlight' : '',
              showDividerAfterRank === team.rank ? 'cutline-row' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <tr key={team.id} className={rowClass}>
                <td>
                  <span className="rank-pill">{team.rank}</span>
                </td>
                <td>{team.name}</td>
                <td>
                  {team.confWins}-{team.confLosses}
                </td>
                <td>{formatPct(team.confPct)}</td>
                <td>{team.gamesBehindFirst.toFixed(1)}</td>
                {!compact && (
                  <td>
                    {team.overallWins}-{team.overallLosses}
                  </td>
                )}
                {!compact && <td>{team.confGamesRemaining}</td>}
                <td>
                  <span className={`status-badge ${statusClass[status]}`}>
                    {status}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default StandingsTable
