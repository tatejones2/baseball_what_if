import {
  getMagicNumber,
  isEliminatedMathematically,
} from '../utils/tournamentLogic'

function MagicNumber({ njitTeam, sixthPlaceTeam }) {
  const { magicNumber, eliminationNumber } = getMagicNumber(njitTeam, sixthPlaceTeam)
  const eliminated = isEliminatedMathematically(njitTeam, sixthPlaceTeam)

  return (
    <article className="magic-card">
      <p className="eyebrow">Tournament Chase</p>
      <p className="magic-value">{eliminated ? '—' : magicNumber}</p>
      <h3>Magic Number</h3>
      <p>
        {eliminated
          ? 'NJIT is mathematically eliminated from a top-6 finish.'
          : `NJIT needs ${magicNumber} combined NJIT wins + UMass Lowell losses to clinch.`}
      </p>
      <p className="magic-subtle">
        Elimination number: {eliminationNumber}
      </p>
    </article>
  )
}

export default MagicNumber
