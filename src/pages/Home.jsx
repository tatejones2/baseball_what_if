import { Link } from 'react-router-dom'
import seasonData from '../data/season.json'
import StandingsTable from '../components/StandingsTable'
import TeamCard from '../components/TeamCard'
import {
  getMagicNumber,
  getStandings,
  isEliminatedMathematically,
} from '../utils/tournamentLogic'

function Home() {
  const standings = getStandings(seasonData.teams)
  const njit = standings.find((team) => team.id === 'njit')
  const sixth = standings[5]
  const magic = getMagicNumber(njit, sixth)
  const eliminated = isEliminatedMathematically(njit, sixth) || magic.isEliminated

  return (
    <>
      <section className="hero-section">
        <p className="eyebrow">America East Tournament Tracker</p>
        <h1>
          Can the Highlanders <em>Make It?</em>
        </h1>
        <p className="hero-subhead">
          2026 America East Conference Race — Updated {seasonData.meta.lastUpdated}
        </p>
        <div className="status-banner">
          {eliminated ? (
            <p>
              Season in Review: NJIT fought to the final stretch and will keep
              building into 2027.
            </p>
          ) : (
            <p>
              NJIT is still alive at {njit.confWins}-{njit.confLosses}, {njit.gamesBehind.toFixed(1)} GB of 6th.
              Magic number: {magic.magicNumber}.
            </p>
          )}
        </div>
      </section>

      <section className="quick-stats-grid">
        <TeamCard label="NJIT Conference Record" value={`${njit.confWins}–${njit.confLosses}`} />
        <TeamCard
          label="Games Behind 6th Place"
          value={`${njit.gamesBehind.toFixed(1)} GB`}
        />
        <TeamCard
          label="Conference Games Remaining"
          value={`${njit.confGamesRemaining} Games Left`}
        />
      </section>

      <section className="panel">
        <div className="section-bar" />
        <h2>Current Standings</h2>
        <StandingsTable
          teams={standings}
          highlightTeamId="njit"
          showDividerAfterRank={6}
          compact
        />
      </section>

      <section className="cta-row">
        <Link className="cta-button" to="/schedule">
          View Full Schedule
        </Link>
        <Link className="cta-button cta-secondary" to="/whatif">
          Run What-If Scenarios
        </Link>
      </section>
    </>
  )
}

export default Home
