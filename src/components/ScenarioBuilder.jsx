import seasonData from '../data/season.json'

const teamNameMap = Object.fromEntries(
  seasonData.teams.map((team) => [team.id, team.name]),
)

function ScenarioBuilder({ series, scenarioResults, onSeriesChange }) {
  return (
    <div className="scenario-list">
      {series.map((item) => {
        const result = scenarioResults[item.id]
        const awayWins = result?.awayWins ?? null
        const homeWins = result?.homeWins ?? null

        return (
          <article key={item.id} className="scenario-series-card">
            <p className="series-weekend">{item.weekend}</p>
            <div className="series-team-row">
              <span>{teamNameMap[item.away]}</span>
              <div className="selector-group">
                {[0, 1, 2, 3].map((wins) => (
                  <button
                    key={`${item.id}-away-${wins}`}
                    type="button"
                    className={`selector-btn ${
                      awayWins === wins ? 'is-selected' : ''
                    }`}
                    onClick={() =>
                      onSeriesChange(item.id, item.gamesInSeries - wins, wins)
                    }
                  >
                    {wins}
                  </button>
                ))}
              </div>
            </div>
            <div className="series-team-row">
              <span>{teamNameMap[item.home]}</span>
              <div className="selector-group selector-group-home">
                {[3, 2, 1, 0].map((wins) => (
                  <button
                    key={`${item.id}-home-${wins}`}
                    type="button"
                    className={`selector-btn ${
                      homeWins === wins ? 'is-selected' : ''
                    }`}
                    onClick={() =>
                      onSeriesChange(item.id, wins, item.gamesInSeries - wins)
                    }
                  >
                    {wins}
                  </button>
                ))}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default ScenarioBuilder
