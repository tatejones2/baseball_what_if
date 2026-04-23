import { useMemo, useState } from 'react'
import ScenarioBuilder from '../components/ScenarioBuilder'
import StandingsTable from '../components/StandingsTable'
import seasonData from '../data/season.json'
import { getStandings, runWhatIfScenario } from '../utils/tournamentLogic'

function getDefaultScenario() {
  return {}
}

function WhatIf() {
  const [scenarioResults, setScenarioResults] = useState(getDefaultScenario)

  const baseStandings = useMemo(() => getStandings(seasonData.teams), [])

  const projectedStandings = useMemo(
    () => runWhatIfScenario(seasonData.teams, scenarioResults),
    [scenarioResults],
  )

  const currentRankMap = useMemo(
    () => Object.fromEntries(baseStandings.map((team) => [team.id, team.rank])),
    [baseStandings],
  )

  const projectedNJIT = projectedStandings.find((team) => team.id === 'njit')
  const njitMakesIt = projectedNJIT.rank <= 6

  const handleSeriesChange = (seriesId, homeWins, awayWins) => {
    setScenarioResults((prev) => ({
      ...prev,
      [seriesId]: { homeWins, awayWins },
    }))
  }

  const applyPreset = (preset) => {
    if (preset === 'reset') {
      setScenarioResults({})
      return
    }

    const next = {}

    seasonData.remainingConferenceSeries.forEach((series) => {
      if (preset === 'homeSweeps') {
        next[series.id] = { homeWins: 3, awayWins: 0 }
      }

      if (preset === 'worstCase') {
        if (series.home === 'njit') {
          next[series.id] = { homeWins: 0, awayWins: 3 }
        } else if (series.away === 'njit') {
          next[series.id] = { homeWins: 3, awayWins: 0 }
        } else {
          next[series.id] = { homeWins: 3, awayWins: 0 }
        }
      }

      if (preset === 'bestCase') {
        if (series.home === 'njit') {
          next[series.id] = { homeWins: 3, awayWins: 0 }
        } else if (series.away === 'njit') {
          next[series.id] = { homeWins: 0, awayWins: 3 }
        } else if (series.home === 'umasslowell') {
          next[series.id] = { homeWins: 0, awayWins: 3 }
        } else if (series.away === 'umasslowell') {
          next[series.id] = { homeWins: 3, awayWins: 0 }
        } else {
          next[series.id] = { homeWins: 3, awayWins: 0 }
        }
      }
    })

    setScenarioResults(next)
  }

  return (
    <section className="panel">
      <div className="section-bar" />
      <h1>What-If Scenario Builder</h1>

      <div className="preset-row">
        <button type="button" className="pill-btn" onClick={() => applyPreset('bestCase')}>
          Best Case
        </button>
        <button type="button" className="pill-btn" onClick={() => applyPreset('worstCase')}>
          Worst Case
        </button>
        <button type="button" className="pill-btn" onClick={() => applyPreset('homeSweeps')}>
          Series Sweeps
        </button>
        <button type="button" className="pill-btn" onClick={() => applyPreset('reset')}>
          Reset
        </button>
      </div>

      <div className="whatif-grid">
        <div>
          <h2>Set Series Results</h2>
          <ScenarioBuilder
            series={seasonData.remainingConferenceSeries}
            scenarioResults={scenarioResults}
            onSeriesChange={handleSeriesChange}
          />
        </div>

        <div>
          <div
            className={`whatif-summary ${
              njitMakesIt ? 'whatif-summary-in' : 'whatif-summary-out'
            }`}
          >
            <h3>
              In this scenario, NJIT finishes {projectedNJIT.rank}
              {projectedNJIT.rank === 1
                ? 'st'
                : projectedNJIT.rank === 2
                  ? 'nd'
                  : projectedNJIT.rank === 3
                    ? 'rd'
                    : 'th'}{' '}
              at {projectedNJIT.confWins}-{projectedNJIT.confLosses}
            </h3>
            <p>{njitMakesIt ? '✅ NJIT Makes the Tournament' : '❌ NJIT Misses the Tournament'}</p>
          </div>

          <div className="table-wrap">
            <table className="standings-table is-compact">
              <thead>
                <tr>
                  <th>Rk</th>
                  <th>Team</th>
                  <th>Conf</th>
                  <th>Pct</th>
                  <th>Move</th>
                </tr>
              </thead>
              <tbody>
                {projectedStandings.map((team) => {
                  const rankDelta = currentRankMap[team.id] - team.rank
                  return (
                    <tr key={team.id} className={team.id === 'njit' ? 'is-highlight' : ''}>
                      <td>{team.rank}</td>
                      <td>{team.name}</td>
                      <td>
                        {team.confWins}-{team.confLosses}
                      </td>
                      <td>{team.confPct.toFixed(3)}</td>
                      <td>
                        {rankDelta > 0 && <span className="move-up">▲ {rankDelta}</span>}
                        {rankDelta < 0 && (
                          <span className="move-down">▼ {Math.abs(rankDelta)}</span>
                        )}
                        {rankDelta === 0 && <span>—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhatIf
