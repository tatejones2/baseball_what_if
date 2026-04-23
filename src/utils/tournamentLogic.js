import seasonData from '../data/season.json'

const CONF_GAMES = seasonData.meta.conferenceGamesPerTeam
const HEAD_TO_HEAD = seasonData.tieBreakers?.headToHead ?? {}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const toPct = (wins, losses) => {
  const total = wins + losses
  if (total === 0) {
    return 0
  }
  return Number((wins / total).toFixed(3))
}

const getHeadToHeadKey = (teamAId, teamBId) =>
  [teamAId, teamBId].sort().join('__')

const compareHeadToHead = (teamA, teamB) => {
  const key = getHeadToHeadKey(teamA.id, teamB.id)
  const record = HEAD_TO_HEAD[key]

  if (!record) {
    return 0
  }

  const teamAWins = Number(record[teamA.id] ?? 0)
  const teamBWins = Number(record[teamB.id] ?? 0)

  if (teamAWins === teamBWins) {
    return 0
  }

  // Negative means teamA should sort above teamB.
  return teamBWins - teamAWins
}

export function getStandings(teams) {
  const sorted = [...teams]
    .map((team) => {
      const confGamesPlayed = team.confWins + team.confLosses
      const overallGamesPlayed = team.overallWins + team.overallLosses
      return {
        ...team,
        confPct: toPct(team.confWins, team.confLosses),
        confGamesPlayed,
        confGamesRemaining: Math.max(CONF_GAMES - confGamesPlayed, 0),
        overallPct:
          overallGamesPlayed === 0
            ? 0
            : Number((team.overallWins / overallGamesPlayed).toFixed(3)),
      }
    })
    .sort((a, b) => {
      if (b.confPct !== a.confPct) {
        return b.confPct - a.confPct
      }

      const headToHeadResult = compareHeadToHead(a, b)
      if (headToHeadResult !== 0) {
        return headToHeadResult
      }

      if (b.overallPct !== a.overallPct) {
        return b.overallPct - a.overallPct
      }

      if (b.overallWins !== a.overallWins) {
        return b.overallWins - a.overallWins
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

export function estimateNjitTournamentOdds(
  teams,
  remainingSeries,
  njitGameWinners,
  simulations = 4000,
  options = {},
) {
  const {
    njitNonConferenceGames = [],
    njitNonConferencePicks = {},
  } = options

  const baselinePct = Object.fromEntries(
    teams.map((team) => {
      const total = team.confWins + team.confLosses
      return [team.id, total === 0 ? 0.5 : team.confWins / total]
    }),
  )

  const safeSimulations = Math.max(Number(simulations) || 0, 1)
  let makeCount = 0
  let totalNjitWins = 0
  let totalNjitLosses = 0

  for (let sim = 0; sim < safeSimulations; sim += 1) {
    const projection = teams.map((team) => ({ ...team }))
    const teamMap = new Map(projection.map((team) => [team.id, team]))

    remainingSeries.forEach((series) => {
      let homeWins = 0
      let awayWins = 0

      const homeStrength = baselinePct[series.home] ?? 0.5
      const awayStrength = baselinePct[series.away] ?? 0.5
      const homeWinProbability = clamp(
        0.5 + (homeStrength - awayStrength) * 0.35 + 0.03,
        0.15,
        0.85,
      )

      for (let game = 1; game <= series.gamesInSeries; game += 1) {
        const winnerKey = `${series.id}-g${game}`
        const forcedWinner = njitGameWinners?.[winnerKey]

        let homeWon
        if (forcedWinner === series.home) {
          homeWon = true
        } else if (forcedWinner === series.away) {
          homeWon = false
        } else {
          homeWon = Math.random() < homeWinProbability
        }

        if (homeWon) {
          homeWins += 1
        } else {
          awayWins += 1
        }
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

    // Non-conference games only affect overall record (2nd tie-breaker).
    const njitTeam = teamMap.get('njit')
    if (njitTeam) {
      const njitOverallPct =
        njitTeam.overallWins + njitTeam.overallLosses === 0
          ? 0.5
          : njitTeam.overallWins / (njitTeam.overallWins + njitTeam.overallLosses)

      njitNonConferenceGames.forEach((game, index) => {
        const key = `${game.date}-${game.opponent}-${index}`
        const forcedWinner = njitNonConferencePicks?.[key]

        let njitWon
        if (forcedWinner === 'njit') {
          njitWon = true
        } else if (forcedWinner === 'opponent') {
          njitWon = false
        } else {
          // Slight underdog baseline so this remains a small factor.
          const winProbability = clamp(njitOverallPct - 0.04, 0.2, 0.8)
          njitWon = Math.random() < winProbability
        }

        if (njitWon) {
          njitTeam.overallWins += 1
        } else {
          njitTeam.overallLosses += 1
        }
      })
    }

    const finalStandings = getStandings(projection)
    const njit = finalStandings.find((team) => team.id === 'njit')

    if (!njit) {
      continue
    }

    if (njit.rank <= seasonData.meta.tournamentBerths) {
      makeCount += 1
    }

    totalNjitWins += njit.confWins
    totalNjitLosses += njit.confLosses
  }

  const makePct = (makeCount / safeSimulations) * 100

  return {
    makePct: Number(makePct.toFixed(1)),
    missPct: Number((100 - makePct).toFixed(1)),
    avgWins: Number((totalNjitWins / safeSimulations).toFixed(1)),
    avgLosses: Number((totalNjitLosses / safeSimulations).toFixed(1)),
    sampleSize: safeSimulations,
  }
}
