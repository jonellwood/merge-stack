const MOVES = ["merge", "rebase", "cherry-pick"];

const WINS_AGAINST = {
  merge: "cherry-pick",
  rebase: "merge",
  "cherry-pick": "rebase",
};

function isValidMove(move) {
  return MOVES.includes(move);
}

function determineWinner(playerMove, computerMove) {
  if (!isValidMove(playerMove) || !isValidMove(computerMove)) {
    throw new Error(`Moves must be one of: ${MOVES.join(", ")}`);
  }

  if (playerMove === computerMove) {
    return {
      result: "draw",
      message: `Both picked ${playerMove}. History remains gloriously confusing.`,
    };
  }

  if (WINS_AGAINST[playerMove] === computerMove) {
    return {
      result: "player",
      message: `${playerMove} beats ${computerMove}. You win this silly merge!`,
    };
  }

  return {
    result: "computer",
    message: `${computerMove} beats ${playerMove}. The repo wins this round.`,
  };
}

function pickComputerMove(random = Math.random) {
  return MOVES[Math.floor(random() * MOVES.length)];
}

function playRound(playerMove, random = Math.random) {
  const computerMove = pickComputerMove(random);
  return {
    playerMove,
    computerMove,
    ...determineWinner(playerMove, computerMove),
  };
}

module.exports = {
  MOVES,
  determineWinner,
  isValidMove,
  pickComputerMove,
  playRound,
};
