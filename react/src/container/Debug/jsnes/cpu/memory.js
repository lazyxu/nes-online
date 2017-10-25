
var MEMORY = function () {
  this.data = new Uint8Array(new ArrayBuffer(0x10000)); // Main memory 64KB
}

MEMORY.prototype = {

  reset() {
    for (var i = 0; i < 0x2000; i++) {
      this.data[i] = 0xFF;
    }
    for (var p = 0; p < 4; p++) {
      var i = p * 0x800;
      this.data[i + 0x008] = 0xF7;
      this.data[i + 0x009] = 0xEF;
      this.data[i + 0x00A] = 0xDF;
      this.data[i + 0x00F] = 0xBF;
    }
    for (var i = 0x2001; i < this.data.length; i++) {
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

module.exports = MEMORY;