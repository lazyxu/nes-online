
var Palette = function (ppu) {
  this.ppu = ppu;

  this.emphTable = new Array(64);
  for (var i = 0; i < 64; i++) {
    this.emphTable[i] = new Array(8);
  }
  var curTable = [
    0x525252, 0xB40000, 0xA00000, 0xB1003D, 0x740069, 0x00005B, 0x00005F, 0x001840,
    0x002F10, 0x084A08, 0x006700, 0x124200, 0x6D2800, 0x000000, 0x000000, 0x000000,
    0xC4D5E7, 0xFF4000, 0xDC0E22, 0xFF476B, 0xD7009F, 0x680AD7, 0x0019BC, 0x0054B1,
    0x006A5B, 0x008C03, 0x00AB00, 0x2C8800, 0xA47200, 0x000000, 0x000000, 0x000000,
    0xF8F8F8, 0xFFAB3C, 0xFF7981, 0xFF5BC5, 0xFF48F2, 0xDF49FF, 0x476DFF, 0x00B4F7,
    0x00E0FF, 0x00E375, 0x03F42B, 0x78B82E, 0xE5E218, 0x787878, 0x000000, 0x000000,
    0xFFFFFF, 0xFFF2BE, 0xF8B8B8, 0xF8B8D8, 0xFFB6FF, 0xFFC3FF, 0xC7D1FF, 0x9ADAFF,
    0x88EDF8, 0x83FFDD, 0xB8F8B8, 0xF5F8AC, 0xFFFFB0, 0xF8D8F8, 0x000000, 0x000000
  ];
  var factor = [
    1.000, 1.000, 1.000,
    0.743, 0.915, 1.239,
    0.882, 1.086, 0.794,
    0.653, 0.980, 1.019,
    1.277, 1.026, 0.905,
    0.979, 0.908, 1.023,
    1.001, 0.987, 0.741,
    0.750, 0.750, 0.750
  ];
  for (var emph = 0; emph < 8; emph++) {
    for (var i = 0; i < 64; i++) {
      var rgb = curTable[i];
      var r = Math.floor(((rgb >> 16) & 0xFF) * factor[emph * 3]);
      var g = Math.floor(((rgb >> 8) & 0xFF) * factor[emph * 3 + 1]);
      var b = Math.floor((rgb & 0xFF) * factor[emph * 3 + 2]);
      this.emphTable[i][emph] = (r << 16) | (g << 8) | (b);
    }
  }
}

Palette.prototype = {

  getColor(yiq) {
    return this.emphTable[yiq][
      this.ppu.reg.displayType()==0?this.ppu.reg.colour():0
    ];
  },

  loadImage(index) {
    return this.getColor(
      this.ppu.vram.load(0x3f00 + index) & (this.ppu.reg.displayType() === 0 ? 63 : 32)
    );
  },

  loadSprit(index) {
    return this.getColor(
      this.ppu.vram.load(0x3f10 + index) & (this.ppu.reg.displayType() === 0 ? 63 : 32)
    );
  }
}

module.exports = Palette