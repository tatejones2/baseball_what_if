function TeamCard({ label, value }) {
  return (
    <article className="stat-card fade-in-card">
      <h3>{value}</h3>
      <p>{label}</p>
    </article>
  )
}

export default TeamCard
