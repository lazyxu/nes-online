
var Vram = function () {
  this.data = new Array(0x8000);
}

Vram.prototype = {
  reset() {
    for (var i = 0; i < this.data.length; i++) {
      this.data[i] = 0;
    }
  },

  load(addr) {
    return this.data[addr]
  },

  write(addr, val) {
    this.data[addr] = val
  }
}

module.exports = Vram