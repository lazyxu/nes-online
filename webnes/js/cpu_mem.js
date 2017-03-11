// 主内存
// 0x0000-0x00FF: Zero Page
// 0x0100-0x01FF: Stack
// 0x0200-0x07FF: RAM
// 0x0800-0x1FFF: mirrors of 0x0000-0x07FF (three times)

// 0x2000-0x2007: I/O Registers
// 0x2008-0x3FFF: mirrors of 0x2000-0x2007
// 0x4000-0x401F: I/O Registers

// 0X4020=0X5FFF: Expansion ROM

// 0x6000-0x7FFF: SRAM
// 0x8000-0xBFFF: RPG-ROM Lower Bank
// 0xC000-0xFFFF: RPG-ROM Upper Bank
MAINMEM = function(nes) {
    this.nes = nes;

    // JS Number类型统一按浮点数处理，64位存储，整数是按最大54位来算最大最小数的，否则会丧失精度；某些操作（如数组索引还有位操作）是按32位处理的
    this.mem = new Array(0x10000); // 主内存，每个元素8位，共64KB，而实际上js用了512KB...
    
    for (var i=0; i < 0x2000; i++) { // 初始化RAM
        this.set(i, 0xFF);
    }

    for (var p=0; p < 4; p++) {
        var i = p*0x800;
        this.set(i+0x008, 0xF7);
        this.set(i+0x009, 0xEF);
        this.set(i+0x00A, 0xDF);
        this.set(i+0x00F, 0xBF);
    }
    
    for (var i=0x2001; i < this.mem.length; i++) {
        this.set(i, 0);
    }
}

MAINMEM.prototype = {
    set: function(address, value) {
        this.mem[address] = value;
    },
    get: function(address) {
        return this.mem[address];
    },
}