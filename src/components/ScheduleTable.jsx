function ScheduleTable({ games }) {
  return (
    <div className="table-wrap">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Opponent</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={`${game.date}-${game.opponent}`}>
              <td>{game.date}</td>
              <td>{game.opponent}</td>
              <td>{game.home ? 'Home' : 'Away'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ScheduleTable
