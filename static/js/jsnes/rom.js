/*
JSNES, based on Jamie Sanders' vNES
Copyright (C) 2010 Ben Firshman

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

JSNES.ROM = function(nes) {
    this.nes = nes;
};

JSNES.ROM.prototype = {
    // Mirroring types:
    VERTICAL_MIRRORING: 0,
    HORIZONTAL_MIRRORING: 1,
    FOURSCREEN_MIRRORING: 2,
    SINGLESCREEN_MIRRORING: 3,
    SINGLESCREEN_MIRRORING2: 4,
    SINGLESCREEN_MIRRORING3: 5,
    SINGLESCREEN_MIRRORING4: 6,
    CHRROM_MIRRORING: 7,
    
    header: null,
    rom: null,
    vrom: null,
    vromTile: null,
    
    romCount: null,
    vromCount: null,
    mirroring: null,
    batteryRam: null,
    trainer: null,
    fourScreen: null,
    mapperType: null,
    valid: false,
    
    load: function(data) {
        var i, j, v;
        
        if (data.indexOf("NES\x1a") === -1) {
            this.nes.ui.updateStatus("Not a valid NES ROM.");
            return;
        }
        this.header = new Array(16);
        for (i = 0; i < 16; i++) {
            this.header[i] = data.charCodeAt(i) & 0xFF;
        }
        this.romCount = this.header[4];
        this.vromCount = this.header[5]*2; // Get the number of 4kB banks, not 8kB
        this.mirroring = ((this.header[6] & 1) !== 0 ? 1 : 0);
        this.batteryRam = (this.header[6] & 2) !== 0;
        this.trainer = (this.header[6] & 4) !== 0;
        this.fourScreen = (this.header[6] & 8) !== 0;
        this.mapperType = (this.header[6] >> 4) | (this.header[7] & 0xF0);
        /* TODO
        if (this.batteryRam)
            this.loadBatteryRam();*/
        // Check whether byte 8-15 are zero's:
        var foundError = false;
        for (i=8; i<16; i++) {
            if (this.header[i] !== 0) {
                foundError = true;
                break;
            }
        }
        if (foundError) {
            this.mapperType &= 0xF; // Ignore byte 7
        }
        // Load PRG-ROM banks:
        this.rom = new Array(this.romCount);
        var offset = 16;
        for (i=0; i < this.romCount; i++) {
            this.rom[i] = new Array(16384);
            for (j=0; j < 16384; j++) {
                if (offset+j >= data.length) {
                    break;
                }
                this.rom[i][j] = data.charCodeAt(offset + j) & 0xFF;
            }
            offset += 16384;
        }
        // Load CHR-ROM banks:
        this.vrom = new Array(this.vromCount);
        for (i=0; i < this.vromCount; i++) {
            this.vrom[i] = new Array(4096);
            for (j=0; j < 4096; j++) {
                if (offset+j >= data.length){
                    break;
                }
                this.vrom[i][j] = data.charCodeAt(offset + j) & 0xFF;
            }
            offset += 4096;
        }
        
        // mapper 不为 0 的时候才用到
        // Create VROM tiles:
        this.vromTile = new Array(this.vromCount);
        for (i=0; i < this.vromCount; i++) {
            this.vromTile[i] = new Array(256);
            for (j=0; j < 256; j++) {
                this.vromTile[i][j] = new JSNES.PPU.Tile();
            }
        }
        
        // Convert CHR-ROM banks to tiles:
        var tileIndex;
        var leftOver;
        for (v=0; v < this.vromCount; v++) {
            for (i=0; i < 4096; i++) {
                tileIndex = i >> 4;
                leftOver = i % 16;
                if (leftOver < 8) { // 
                    this.vromTile[v][tileIndex].setScanline(
                        leftOver,
                        this.vrom[v][i],
                        this.vrom[v][i+8]
                    );
                }
                else {
                    this.vromTile[v][tileIndex].setScanline(
                        leftOver-8,
                        this.vrom[v][i-8],
                        this.vrom[v][i]
                    );
                }
            }
        }
        
        this.valid = true;
    },
    
    getMirroringType: function() {
        if (this.fourScreen) {
            return this.FOURSCREEN_MIRRORING;
        }
        if (this.mirroring === 0) {
            return this.HORIZONTAL_MIRRORING;
        }
        return this.VERTICAL_MIRRORING;
    },
    
    createMapper: function() {
        if (typeof JSNES.Mappers[this.mapperType] !== 'undefined') {
            return new JSNES.Mappers[this.mapperType](this.nes);
        }
        else {
            this.nes.ui.updateStatus("This ROM uses a mapper not supported by JSNES: "+"("+this.mapperType+")");
            return null;
        }
    }
};
