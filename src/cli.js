const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const { MOVES, playRound } = require("./game");

function printRules() {
  console.log("Welcome to merge-stack, the silly merge game.");
  console.log("Pick a move:");
  console.log("- merge beats cherry-pick");
  console.log("- cherry-pick beats rebase");
  console.log("- rebase beats merge");
}

async function getPlayerMove() {
  const arg = process.argv[2];

  if (arg === "--rules") {
    printRules();
    return null;
  }

  if (arg) {
    return arg.trim().toLowerCase();
  }

  if (!input.isTTY) {
    throw new Error(`Provide a move: ${MOVES.join(", ")}`);
  }

  const rl = readline.createInterface({ input, output });

  try {
    const answer = await rl.question(
      `Choose your move (${MOVES.join(", ")}): `,
    );
    return answer.trim().toLowerCase();
  } finally {
    rl.close();
  }
}

async function main() {
  const playerMove = await getPlayerMove();

  if (!playerMove) {
    return;
  }

  const round = playRound(playerMove);
  console.log(`You played: ${round.playerMove}`);
  console.log(`Computer played: ${round.computerMove}`);
  console.log(round.message);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
