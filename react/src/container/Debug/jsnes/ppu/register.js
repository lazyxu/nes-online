
var Register = function name(nes) {
  this.nes = nes;
}

Register.prototype = {

  reset() {
    // $2000: PPU Control Register #1 (W) 
    this.f_nmiOnVblank = 0;    // D7: Execute NMI on VBlank. 0 = Disable, 1 = Enable
    //                            D6: PPU Master/Slave Selection. UNUSED. 0 = Master, 1 = Slave
    this.f_spriteSize = 0;     // D5: Sprite Size. 0 = 8x8, 1 = 8x16
    this.f_bgPatternTable = 0; // D4: Background Pattern Table Address. 0 = $0000 (VRAM), 1 = $1000 (VRAM)
    this.f_spPatternTable = 0; // D3: Sprite Pattern Table Address. 0 = $0000 (VRAM), 1 = $1000 (VRAM)
    this.f_addrInc = 0;        // D2: PPU Address Increment. 0 = Increment by 1, 1 = Increment by 32
    this.f_nTblAddress = 0;    // D1-D0: Name Table Address. 00 = $2000 (VRAM), 01 = $2400 (VRAM), 10 = $2800 (VRAM), 11 = $2C00 (VRAM)

    // $2001: PPU Control Register #2 (W) 
    this.f_color = 0;          // D7-D5: Full Background Colour (when D0 == 1). 000 = None, 001 = Green, 010 = Blue. 100 = Red   NOTE: Do not use more
    //                            D7-D5: Colour Intensity (when D0 == 0). 000 = None, 001 = Intensify green, 010 = Intensify blue, 100 = Intensify red   NOTE: Do not use more
    this.f_spVisibility = 0;   // D4: Sprite Visibility. 0 = Sprites not displayed, 1 = Sprites visible
    this.f_bgVisibility = 0;   // D3: Background Visibility. 0 = Background not displayed, 1 = Background visible
    this.f_spClipping = 0;     // D2: Sprite Clipping. 0 = Sprites invisible in left 8-pixel column, 1 = No clipping
    this.f_bgClipping = 0;     // D1: Background Clipping. 0 = BG invisible in left 8-pixel column, 1 = No clipping
    this.f_dispType = 0;       // D0: Display Type. 0 = Colour display, 1 = Monochrome display

    // $2002 PPU Status Register (R)
    
    // D7-D0: 8-bit data written to SPR-RAM.
  },

  // $2003: SPR-RAM Address Register (W)
  // D7-D0: 8-bit address in SPR-RAM to access via $2004.
  writeSramAddress: function (address) {
    this.nes.cpu.mem.write(0x2003, address);
  },

  // $2004: SPR-RAM I/O Register (W)
  // D7-D0: 8-bit data written to SPR-RAM.
  // The address should be set first.
  sramLoad: function () {
    /*short tmp = sprMem.load(sramAddress);
        sramAddress++; // Increment address
        sramAddress%=0x100;
        return tmp;*/
    return this.ppu.sram.load(this.nes.cpu.mem.load(0x2003));
  },

  // CPU Register $2004 (W):
  // Write to SPR-RAM (Sprite RAM).
  // The address should be set first.
  sramWrite: function (value) {
    this.sram.write(this.sramAddress, value);
    this.spriteRamWriteUpdate(this.sramAddress, value);
    this.sramAddress++; // Increment address
    this.sramAddress %= 0x100;
  },

}

module.exports = Register