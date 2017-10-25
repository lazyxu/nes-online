
exports.init = function () {
  this.mem = new Uint8Array(new ArrayBuffer(0x10000)); // Main memory 64KB
}

exports.reset = function () {
  for (var i = 0; i < 0x2000; i++) {
    this.mem[i] = 0xFF;
  }
  for (var p = 0; p < 4; p++) {
    var i = p * 0x800;
    this.mem[i + 0x008] = 0xF7;
    this.mem[i + 0x009] = 0xEF;
    this.mem[i + 0x00A] = 0xDF;
    this.mem[i + 0x00F] = 0xBF;
  }
  for (var i = 0x2001; i < this.mem.length; i++) {
    this.mem[i] = 0;
  }
}

exports.load = function (addr) {
  return this.mem[addr]
}

exports.write = function (addr, val) {
  this.mem[addr] = val
}
