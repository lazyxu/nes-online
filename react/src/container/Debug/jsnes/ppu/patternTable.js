
var PatternTable = function name(ppu) {
  this.ppu=ppu;
}

PatternTable.prototype = {

  lower2bitColorIndex(tIndex, x, y) {
    var vramIndex = tIndex * 8 * 2 + y;
    // console.log(vramIndex)
    var bitOffset = 7 - x;
    return ((this.ppu.load(vramIndex) >> bitOffset) & 1) |
      (((this.ppu.load(vramIndex + 8) >> bitOffset) & 1) << 1)
  },
}

module.exports = PatternTable