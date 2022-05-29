const { colors } = require("./constants");
function getStartPositions() {
  const startPositions = [];
  for (let i = 0; i < 16; i++) {
    let pawn = {};
    pawn.basePos = i;
    pawn.position = i;
    if (i < 4) pawn.color = colors[0];
    else if (i < 8) pawn.color = colors[1];
    else if (i < 12) pawn.color = colors[2];
    else if (i < 16) pawn.color = colors[3];
    startPositions.push(pawn);
  }
  return startPositions;
}
module.exports = { getStartPositions };
