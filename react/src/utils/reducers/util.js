
exports.copyState = state => {
  var newState = new Object();
  for (var i in state) {
    newState[i] = state[i];
  }
  return newState;
}