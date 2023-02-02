// http://wiki.nesdev.com/w/index.php/PPU_registers

var Register = function name(nes) {
  this.nes = nes;
}

Register.prototype = {

  // $2000: PPU Control Register #1 (W)
  // D7: Execute NMI on VBlank. 0 = Disable, 1 = Enable 
  executeNMIonVBlank() {
    return (this.nes.cpu.mem.load(0x2000) >> 7) & 1
  },
  // D6: PPU Master/Slave Selection. UNUSED. 0 = Master, 1 = Slave
  // D5: Sprite Size. 0 = 8x8, 1 = 8x16
  spriteSize() {
    return (this.nes.cpu.mem.load(0x2000) >> 5) & 1
  },
  // D4: Background Pattern Table Address. 0 = $0000 (VRAM), 1 = $1000 (VRAM)
  bgPatternTableAddr() {
    return (this.nes.cpu.mem.load(0x2000) >> 4) & 1
  },
  // D3: Sprite Pattern Table Address. 0 = $0000 (VRAM), 1 = $1000 (VRAM)
  spritPatternTableAddr() {
    return (this.nes.cpu.mem.load(0x2000) >> 3) & 1
  },
  // D2: PPU Address Increment. 0 = Increment by 1, 1 = Increment by 32
  ppuAddrInc() {
    return (this.nes.cpu.mem.load(0x2000) >> 2) & 1
  },
  // D1-D0: Name Table Address. 00 = $2000 (VRAM), 01 = $2400 (VRAM), 10 = $2800 (VRAM), 11 = $2C00 (VRAM)
  nameTableAddr() {
    return this.nes.cpu.mem.load(0x2000) & 0b11
  },
  writeNameTableAddr(value) {
    this.nes.cpu.mem.write(0x2000,
      this.nes.cpu.mem.load(0x2000) & (255 - 0b11) | (value & 0b11)
    )
  },

  // $2001: PPU Control Register #2 (W) 
  // D7-D5: Full Background Colour (when D0 == 1). 000 = None, 001 = Green, 010 = Blue. 100 = Red   NOTE: Do not use more
  // D7-D5: Colour Intensity (when D0 == 0). 000 = None, 001 = Intensify green, 010 = Intensify blue, 100 = Intensify red   NOTE: Do not use more
  colour() {
    return (this.nes.cpu.mem.load(0x2001) >> 5) & 0b111
  },
  // D4: Sprite Visibility. 0 = Sprites not displayed, 1 = Sprites visible
  spriteVisibility() {
    return (this.nes.cpu.mem.load(0x2001) >> 4) & 1
  },
  // D3: Background Visibility. 0 = Background not displayed, 1 = Background visible
  backgroundVisibility() {
    return (this.nes.cpu.mem.load(0x2001) >> 3) & 1
  },
  // D2: Sprite Clipping. 0 = Sprites invisible in left 8-pixel column, 1 = No clipping
  spriteClipping() {
    return (this.nes.cpu.mem.load(0x2001) >> 2) & 1
  },
  // D1: Background Clipping. 0 = BG invisible in left 8-pixel column, 1 = No clipping
  bgClipping() {
    return (this.nes.cpu.mem.load(0x2001) >> 1) & 1
  },
  // D0: Display Type. 0 = Colour display, 1 = Monochrome display
  displayType() {
    return this.nes.cpu.mem.load(0x2001) & 1
  },

  // $2002 PPU Status Register (R)
  // Status flags:
  STATUS_VRAMWRITE: 4,
  STATUS_SLSPRITECOUNT: 5,
  STATUS_SPRITE0HIT: 6,
  STATUS_VBLANK: 7,

  setStatus(flag, value) {
    var n = 1 << flag;
    this.nes.cpu.mem.write(0x2002,
      (this.nes.cpu.mem.load(0x2002) & (255 - n)) | (value ? n : 0));
  },


  // $2003: SPR-RAM Address Register (W)
  // D7-D0: 8-bit address in SPR-RAM to access via $2004.
  writeSramAddr: function (address) {
    this.nes.cpu.mem.write(0x2003, address);
  },

  sramAddr() {
    return this.nes.cpu.mem.load(0x2003);
  },

  reset() {

    // D7-D0: 8-bit data written to SPR-RAM.
  },

  // $2004: SPR-RAM I/O Register (R)
  // D7-D0: 8-bit data loaded from SPR-RAM.
  // The address should be set first.
  loadSram: function () {
    return this.nes.ppu.sram.load(this.sramAddr());
  },

  // $2004: SPR-RAM I/O Register (W)
  // D7-D0: 8-bit data written to SPR-RAM.
  // The address should be set first.
  writeSram: function (value) {
    var sramAddress = this.sramAddr()
    this.nes.ppu.sram.write(sramAddress, value);
    this.nes.ppu.spriteRamWriteUpdate(this.sramAddress, value);
    this.writeSramAddr(0x2003, (sramAddress + 1) & 0xff); // Increment address
  },

  // $4014: Sprite DMA Register (W)
  // Write 256 bytes of main memory
  // into Sprite RAM.
  sramDMA: function (value) {
    // console.log("sramDMA")
    var baseAddress = value * 0x100;
    var data;
    for (var i = this.sramAddr(); i < 256; i++) {
      data = this.nes.cpu.mem.load(baseAddress + i);
      this.nes.ppu.sram.load(i, data);
      this.nes.ppu.spriteRamWriteUpdate(i, data);
    }

    this.nes.cpu.haltCycles(513);
  },

}

module.exports = Register