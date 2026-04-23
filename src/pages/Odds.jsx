import { useMemo, useState } from 'react'
import seasonData from '../data/season.json'
import { estimateNjitTournamentOdds } from '../utils/tournamentLogic'

function Odds() {
  const [njitGameWinners, setNjitGameWinners] = useState({})
  const [njitNonConferencePicks, setNjitNonConferencePicks] = useState({})

  const teamNameMap = useMemo(
    () => Object.fromEntries(seasonData.teams.map((team) => [team.id, team.name])),
    [],
  )

  const njitSeries = useMemo(
    () =>
      seasonData.remainingConferenceSeries.filter(
        (series) => series.home === 'njit' || series.away === 'njit',
      ),
    [],
  )

  const tournamentOdds = useMemo(
    () =>
      estimateNjitTournamentOdds(
        seasonData.teams,
        seasonData.remainingConferenceSeries,
        njitGameWinners,
        4000,
        {
          njitNonConferenceGames: seasonData.njitNonConferenceRemaining,
          njitNonConferencePicks,
        },
      ),
    [njitGameWinners, njitNonConferencePicks],
  )

  const setGameWinner = (seriesId, gameNumber, winnerId) => {
    const key = `${seriesId}-g${gameNumber}`
    setNjitGameWinners((prev) => ({
      ...prev,
      [key]: winnerId,
    }))
  }

  const clearNjitPicks = () => {
    setNjitGameWinners({})
    setNjitNonConferencePicks({})
  }

  const setNonConferenceWinner = (key, winner) => {
    setNjitNonConferencePicks((prev) => ({
      ...prev,
      [key]: winner,
    }))
  }

  return (
    <section className="panel">
      <div className="section-bar" />
      <h1>NJIT Tournament Odds</h1>

      <section className="odds-panel">
        <div className="odds-header">
          <div>
            <p className="eyebrow">NJIT Game Picker</p>
            <h2>Pick every NJIT game winner</h2>
            <p>
              We simulate all other remaining conference games 4,000 times to estimate NJIT's
              tournament odds.
            </p>
            <p>
              Non-conference picks are included as a small factor through overall-record
              tiebreak scenarios.
            </p>
          </div>
          <button type="button" className="pill-btn" onClick={clearNjitPicks}>
            Clear NJIT Picks
          </button>
        </div>

        <div className="odds-stats-grid">
          <article className="odds-stat-card">
            <p className="eyebrow">Tournament Odds</p>
            <h3>{tournamentOdds.makePct}%</h3>
            <p>Chance NJIT makes top 6</p>
          </article>
          <article className="odds-stat-card">
            <p className="eyebrow">Miss Odds</p>
            <h3>{tournamentOdds.missPct}%</h3>
            <p>Chance NJIT misses top 6</p>
          </article>
          <article className="odds-stat-card">
            <p className="eyebrow">Expected NJIT Finish</p>
            <h3>
              {tournamentOdds.avgWins}-{tournamentOdds.avgLosses}
            </h3>
            <p>Average simulated conference record</p>
          </article>
        </div>

        <div className="njit-game-grid">
          {njitSeries.map((series) => {
            const opponentId = series.home === 'njit' ? series.away : series.home
            const opponentName = teamNameMap[opponentId]
            const venueLabel = series.home === 'njit' ? 'vs' : 'at'

            return (
              <article key={series.id} className="scenario-series-card is-njit-series">
                <p className="series-weekend">{series.weekend}</p>
                <h3>
                  NJIT {venueLabel} {opponentName}
                </h3>
                <div className="njit-games-row">
                  {[1, 2, 3].map((gameNumber) => {
                    const key = `${series.id}-g${gameNumber}`
                    const selectedWinner = njitGameWinners[key]

                    return (
                      <div key={key} className="njit-game-pick">
                        <p>Game {gameNumber}</p>
                        <div className="selector-group">
                          <button
                            type="button"
                            className={`selector-btn ${
                              selectedWinner === 'njit' ? 'is-selected' : ''
                            }`}
                            onClick={() => setGameWinner(series.id, gameNumber, 'njit')}
                          >
                            NJIT
                          </button>
                          <button
                            type="button"
                            className={`selector-btn ${
                              selectedWinner === opponentId ? 'is-selected' : ''
                            }`}
                            onClick={() => setGameWinner(series.id, gameNumber, opponentId)}
                          >
                            {teamNameMap[opponentId]}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>

        <h3>NJIT Non-Conference Picks (Tiebreak Impact)</h3>
        <div className="njit-game-grid">
          {seasonData.njitNonConferenceRemaining.map((game, index) => {
            const key = `${game.date}-${game.opponent}-${index}`
            const selectedWinner = njitNonConferencePicks[key]

            return (
              <article key={key} className="scenario-series-card">
                <p className="series-weekend">{game.date}</p>
                <h3>
                  NJIT {game.home ? 'vs' : 'at'} {game.opponent}
                </h3>
                <div className="selector-group">
                  <button
                    type="button"
                    className={`selector-btn ${selectedWinner === 'njit' ? 'is-selected' : ''}`}
                    onClick={() => setNonConferenceWinner(key, 'njit')}
                  >
                    NJIT
                  </button>
                  <button
                    type="button"
                    className={`selector-btn ${
                      selectedWinner === 'opponent' ? 'is-selected' : ''
                    }`}
                    onClick={() => setNonConferenceWinner(key, 'opponent')}
                  >
                    {game.opponent}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </section>
  )
}

export default Odds
