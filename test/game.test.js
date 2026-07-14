const test = require("node:test");
const assert = require("node:assert/strict");

const { determineWinner, playRound } = require("../src/game");

test("merge beats cherry-pick", () => {
  assert.deepEqual(determineWinner("merge", "cherry-pick"), {
    result: "player",
    message: "merge beats cherry-pick. You win this silly merge!",
  });
});

test("cherry-pick beats rebase", () => {
  assert.equal(determineWinner("cherry-pick", "rebase").result, "player");
});

test("rebase beats merge", () => {
  assert.equal(determineWinner("rebase", "merge").result, "player");
});

test("matching moves draw", () => {
  assert.equal(determineWinner("merge", "merge").result, "draw");
});

test("playRound includes both moves and result", () => {
  assert.deepEqual(playRound("merge", () => 0), {
    playerMove: "merge",
    computerMove: "merge",
    result: "draw",
    message: "Both picked merge. History remains gloriously confusing.",
  });
});

test("invalid moves are rejected", () => {
  assert.throws(() => determineWinner("stash", "merge"), {
    message: "Moves must be one of: merge, rebase, cherry-pick",
  });
});
