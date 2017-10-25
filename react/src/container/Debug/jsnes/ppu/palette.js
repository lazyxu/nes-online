
var Palette = function (ppu) {
  this.ppu = ppu;
}

Palette.prototype = {

  loadImage(index) {
    return this.ppu.paletteTable.getColor(
      this.ppu.vram.load(0x3f00 + index) & (this.ppu.f_dispType === 0 ? 63 : 32)
    );
  },

  loadSprit(index) {
    return this.ppu.paletteTable.getColor(
      this.ppu.vram.load(0x3f10 + index) & (this.ppu.f_dispType === 0 ? 63 : 32)
    );
  }
}

module.exports = Palette