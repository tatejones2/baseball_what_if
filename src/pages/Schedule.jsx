import seasonData from '../data/season.json'
import ScheduleTable from '../components/ScheduleTable'

const teamNameMap = Object.fromEntries(
  seasonData.teams.map((team) => [team.id, team.name]),
)

function Schedule() {
  return (
    <section className="panel">
      <div className="section-bar" />
      <h1>Remaining Schedule</h1>

      <h2>Remaining Conference Series</h2>
      <div className="series-grid">
        {seasonData.remainingConferenceSeries.map((series) => {
          const isNJITSeries = series.home === 'njit' || series.away === 'njit'
          const isComplete = series.gamesPlayed === series.gamesInSeries

          return (
            <article
              key={series.id}
              className={`series-card ${isNJITSeries ? 'is-njit-series' : ''}`}
            >
              <p className="series-weekend">{series.weekend}</p>
              <h3>
                {teamNameMap[series.away]} at {teamNameMap[series.home]}
              </h3>
              {isComplete ? (
                <p>
                  Final: {teamNameMap[series.home]} {series.homeWins} –{' '}
                  {teamNameMap[series.away]} {series.awayWins}
                </p>
              ) : (
                <span className="upcoming-badge">Upcoming</span>
              )}
            </article>
          )
        })}
      </div>

      <h2>NJIT Non-Conference Remaining</h2>
      <ScheduleTable games={seasonData.njitNonConferenceRemaining} />
    </section>
  )
}

export default Schedule
