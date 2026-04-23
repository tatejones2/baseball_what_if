const teamLogoFiles = {
  binghamton: 'binghamton.png',
  umbc: 'umbc.png',
  maine: 'maine.png',
  bryant: 'bryant.png',
  ualbany: 'albany.png',
  umasslowell: 'UMLowell.png',
  njit: 'njit.png',
}

function TeamLogo({ teamId, teamName }) {
  const fileName = teamLogoFiles[teamId]

  if (!fileName) {
    return <span className="team-logo-fallback">{teamName.slice(0, 2)}</span>
  }

  return (
    <span className="team-logo-chip" aria-hidden="true">
      <img
        className="team-logo-img"
        src={`/images/${fileName}`}
        alt=""
        loading="lazy"
      />
    </span>
  )
}

export default TeamLogo
