import seasonData from '../data/season.json'
import MagicNumber from '../components/MagicNumber'
import StandingsTable from '../components/StandingsTable'
import {
  getMagicNumber,
  getStandings,
  isEliminatedMathematically,
} from '../utils/tournamentLogic'

function Standings() {
  const standings = getStandings(seasonData.teams)
  const njit = standings.find((team) => team.id === 'njit')
  const sixth = standings[5]
  const magic = getMagicNumber(njit, sixth)
  const eliminated = isEliminatedMathematically(njit, sixth) || magic.isEliminated

  return (
    <section className="panel">
      <div className="section-bar" />
      <h1>Full Conference Standings</h1>
      <StandingsTable
        teams={standings}
        highlightTeamId="njit"
        showDividerAfterRank={6}
      />

      <div className="needs-grid">
        <MagicNumber njitTeam={njit} sixthPlaceTeam={sixth} />
        <article className="needs-card">
          <p className="eyebrow">What NJIT Needs</p>
          <h3>Quick Breakdown</h3>
          {eliminated ? (
            <p>
              NJIT is out if they can no longer catch UMass Lowell in conference wins.
            </p>
          ) : (
            <>
              <p>
                NJIT needs <strong>{magic.magicNumber}</strong> combined NJIT wins +
                UMass Lowell losses to lock in a top-6 spot.
              </p>
              <p>
                NJIT is eliminated if their elimination number reaches 0 (currently{' '}
                <strong>{magic.eliminationNumber}</strong>).
              </p>
            </>
          )}
        </article>
      </div>
    </section>
  )
}

export default Standings
