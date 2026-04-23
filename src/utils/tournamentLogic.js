import seasonData from '../data/season.json'

const CONF_GAMES = seasonData.meta.conferenceGamesPerTeam

const toPct = (wins, losses) => {
  const total = wins + losses
  if (total === 0) {
    return 0
  }
  return Number((wins / total).toFixed(3))
}

export function getStandings(teams) {
  const sorted = [...teams]
    .map((team) => {
      const confGamesPlayed = team.confWins + team.confLosses
      return {
        ...team,
        confPct: toPct(team.confWins, team.confLosses),
        confGamesPlayed,
        confGamesRemaining: Math.max(CONF_GAMES - confGamesPlayed, 0),
      }
    })
    .sort((a, b) => {
      if (b.confPct !== a.confPct) {
        return b.confPct - a.confPct
      }
      return b.confWins - a.confWins
    })

  const sixthPlace = sorted[5] ?? sorted[sorted.length - 1]

  return sorted.map((team, index) => ({
    ...team,
    rank: index + 1,
    isTournamentPosition: index + 1 <= seasonData.meta.tournamentBerths,
    gamesBehind:
      sixthPlace == null
        ? 0
        : Number(
            (
              ((sixthPlace.confWins - team.confWins) +
                (team.confLosses - sixthPlace.confLosses)) /
              2
            ).toFixed(1),
          ),
    gamesBehindFirst: Number(
      (
        ((sorted[0].confWins - team.confWins) +
          (team.confLosses - sorted[0].confLosses)) /
        2
      ).toFixed(1),
    ),
  }))
}

export function getMagicNumber(njitTeam, sixthPlaceTeam) {
  if (!njitTeam || !sixthPlaceTeam) {
    return {
      magicNumber: null,
      eliminationNumber: null,
      isClinched: false,
      isEliminated: false,
    }
  }

  // NJIT clinches a top-6 spot once:
  // njitWins + sixthPlaceLosses > total conference games
  const magicNumber =
    CONF_GAMES + 1 - (njitTeam.confWins + sixthPlaceTeam.confLosses)

  // NJIT is eliminated once:
  // sixthPlaceWins + njitLosses > total conference games
  const eliminationNumber =
    CONF_GAMES + 1 - (sixthPlaceTeam.confWins + njitTeam.confLosses)

  return {
    magicNumber,
    eliminationNumber,
    isClinched: magicNumber <= 0,
    isEliminated: eliminationNumber <= 0,
  }
}

export function isEliminatedMathematically(njitTeam, sixthPlaceTeam) {
  if (!njitTeam || !sixthPlaceTeam) {
    return false
  }

  const njitMaxPossibleWins = njitTeam.confWins + njitTeam.confGamesRemaining
  const sixthPlaceMinPossibleWins = sixthPlaceTeam.confWins

  return njitMaxPossibleWins < sixthPlaceMinPossibleWins
}

export function runWhatIfScenario(teams, seriesResults) {
  const projection = teams.map((team) => ({ ...team }))
  const teamMap = new Map(projection.map((team) => [team.id, team]))

  seasonData.remainingConferenceSeries.forEach((series) => {
    const result = seriesResults[series.id]
    if (!result) {
      return
    }

    const homeWins = Number(result.homeWins)
    const awayWins = Number(result.awayWins)

    if (
      Number.isNaN(homeWins) ||
      Number.isNaN(awayWins) ||
      homeWins < 0 ||
      awayWins < 0 ||
      homeWins + awayWins !== series.gamesInSeries
    ) {
      return
    }

    const homeTeam = teamMap.get(series.home)
    const awayTeam = teamMap.get(series.away)

    if (!homeTeam || !awayTeam) {
      return
    }

    homeTeam.confWins += homeWins
    homeTeam.confLosses += awayWins
    awayTeam.confWins += awayWins
    awayTeam.confLosses += homeWins
  })

  return getStandings(projection)
}

export function getCliNCHStatus(teams) {
  const standings = getStandings(teams)
  const sixthPlace = standings[5]
  const lastPlace = standings[standings.length - 1]

  return standings.map((team) => {
    const maxPossibleWins = team.confWins + team.confGamesRemaining

    const eliminated =
      sixthPlace != null && maxPossibleWins < sixthPlace.confWins

    const clinched =
      lastPlace != null &&
      team.confWins > lastPlace.confWins + lastPlace.confGamesRemaining

    let status = 'CHASING'

    if (clinched) {
      status = 'CLINCHED'
    } else if (eliminated) {
      status = 'ELIMINATED'
    } else if (team.rank <= seasonData.meta.tournamentBerths) {
      status = 'IN'
    }

    return {
      teamId: team.id,
      status,
    }
  })
}
