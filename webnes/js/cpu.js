// cpu 基于6502的2A03，增加了pAPU，取消BCD模式
// little－endian  0x1234 => 0x34 0x12 将低序字节存储在起始地址（低位编址）
// 数据总线8bit，地址总线是16bit，寻址空间是64KB
CPU = function(nes) {
    this.nes = nes;
    this.addressingMode = { // 13种寻址方式
        ZP        : 0,
        REL       : 1,
        IMP       : 2,
        ABS       : 3,
        ACC       : 4,
        IMM       : 5,
        ZPX       : 6,
        ZPY       : 7,
        ABSX      : 8,
        ABSY      : 9,
        PREIDXIND : 10,
        POSTIDXIND: 11,
        INDABS    : 12,
    };
    this.instruction = { // 56种指令
        ADC: 0, AND: 1, ASL: 2,
        BCC: 3, BCS: 4, BEQ: 5, BIT: 6, BMI: 7, BNE: 8, BPL: 9, BRK: 10, BVC: 11, BVS: 12, 
        CLC: 13, CLD: 14, CLI: 15, CLV: 16, CMP: 17, CPX: 18, CPY: 19, 
        DEC: 20, DEX: 21, DEY: 22, 
        EOR: 23, 
        INC: 24, INX: 25, INY: 26, 
        JMP: 27, JSR: 28, 
        LDA: 29, LDX: 30, LDY: 31, LSR: 32, 
        NOP: 33, 
        ORA: 34, 
        PHA: 35, PHP: 36, PLA: 37, PLP: 38, 
        ROL: 39, ROR: 40, RTI: 41, RTS: 42, 
        SBC: 43, SEC: 44, SED: 45, SEI: 46, STA: 47, STX: 48, STY: 49, 
        TAX: 50, TAY: 51, TSX: 52, TXA: 53, TXS: 54, TYA: 55, 
        DUMMY: 56, // dummy instruction used for 'halting' the processor some cycles
    };
    this.opcode = [ // 151个合法操作码 opcode
        // 0xff instruction 指令 
        // 0xff00 addressing mode 寻址方式 
        // 0xff0000 size 指令在内存中的大小，占多少字节 
        // 0xff000000 cycles 运行该指令需要多少个cpu周期
        0x0701020a, 0x06020a22, 0x000000ff, 0x000000ff, 0x000000ff, 0x03020022, 0x05020002, 0x000000ff, 
        0x03010224, 0x02020522, 0x02010402, 0x000000ff, 0x000000ff, 0x04030322, 0x06030302, 0x000000ff, 
        0x02020109, 0x05020b22, 0x000000ff, 0x000000ff, 0x000000ff, 0x04020622, 0x06020602, 0x000000ff, 
        0x0201020d, 0x04030922, 0x000000ff, 0x000000ff, 0x000000ff, 0x04030822, 0x07030802, 0x000000ff, 
        0x0603031c, 0x06020a01, 0x000000ff, 0x000000ff, 0x03020006, 0x03020001, 0x05020027, 0x000000ff, 
        0x04010226, 0x02020501, 0x02010427, 0x000000ff, 0x04030306, 0x04030301, 0x06030327, 0x000000ff, 
        0x02020107, 0x05020b01, 0x000000ff, 0x000000ff, 0x000000ff, 0x04020601, 0x06020627, 0x000000ff, 
        0x0201022c, 0x04030901, 0x000000ff, 0x000000ff, 0x000000ff, 0x04030801, 0x07030827, 0x000000ff, 
        0x06010229, 0x06020a17, 0x000000ff, 0x000000ff, 0x000000ff, 0x03020017, 0x05020020, 0x000000ff, 
        0x03010223, 0x02020517, 0x02010420, 0x000000ff, 0x0303031b, 0x04030317, 0x06030320, 0x000000ff, 
        0x0202010b, 0x05020b17, 0x000000ff, 0x000000ff, 0x000000ff, 0x04020617, 0x06020620, 0x000000ff, 
        0x0201020f, 0x04030917, 0x000000ff, 0x000000ff, 0x000000ff, 0x04030817, 0x07030820, 0x000000ff, 
        0x0601022a, 0x06020a00, 0x000000ff, 0x000000ff, 0x000000ff, 0x03020000, 0x05020028, 0x000000ff, 
        0x04010225, 0x02020500, 0x02010428, 0x000000ff, 0x05030c1b, 0x04030300, 0x06030328, 0x000000ff, 
        0x0202010c, 0x05020b00, 0x000000ff, 0x000000ff, 0x000000ff, 0x04020600, 0x06020628, 0x000000ff, 
        0x0201022e, 0x04030900, 0x000000ff, 0x000000ff, 0x000000ff, 0x04030800, 0x07030828, 0x000000ff, 
        0x000000ff, 0x06020a2f, 0x000000ff, 0x000000ff, 0x03020031, 0x0302002f, 0x03020030, 0x000000ff, 
        0x02010216, 0x000000ff, 0x02010235, 0x000000ff, 0x04030331, 0x0403032f, 0x04030330, 0x000000ff, 
        0x02020103, 0x06020b2f, 0x000000ff, 0x000000ff, 0x04020631, 0x0402062f, 0x04020730, 0x000000ff, 
        0x02010237, 0x0503092f, 0x02010236, 0x000000ff, 0x000000ff, 0x0503082f, 0x000000ff, 0x000000ff, 
        0x0202051f, 0x06020a1d, 0x0202051e, 0x000000ff, 0x0302001f, 0x0302001d, 0x0302001e, 0x000000ff, 
        0x02010233, 0x0202051d, 0x02010232, 0x000000ff, 0x0403031f, 0x0403031d, 0x0403031e, 0x000000ff, 
        0x02020104, 0x05020b1d, 0x000000ff, 0x000000ff, 0x0402061f, 0x0402061d, 0x0402071e, 0x000000ff, 
        0x02010210, 0x0403091d, 0x02010234, 0x000000ff, 0x0403081f, 0x0403081d, 0x0403091e, 0x000000ff, 
        0x02020513, 0x06020a11, 0x000000ff, 0x000000ff, 0x03020013, 0x03020011, 0x05020014, 0x000000ff, 
        0x0201021a, 0x02020511, 0x02010215, 0x000000ff, 0x04030313, 0x04030311, 0x06030314, 0x000000ff, 
        0x02020108, 0x05020b11, 0x000000ff, 0x000000ff, 0x000000ff, 0x04020611, 0x06020614, 0x000000ff, 
        0x0201020e, 0x04030911, 0x000000ff, 0x000000ff, 0x000000ff, 0x04030811, 0x07030814, 0x000000ff, 
        0x02020512, 0x06020a2b, 0x000000ff, 0x000000ff, 0x03020012, 0x0302002b, 0x05020018, 0x000000ff, 
        0x02010219, 0x0202052b, 0x02010221, 0x000000ff, 0x04030312, 0x0403032b, 0x06030318, 0x000000ff, 
        0x02020105, 0x05020b2b, 0x000000ff, 0x000000ff, 0x000000ff, 0x0402062b, 0x06020618, 0x000000ff, 
        0x0201022d, 0x0403092b, 0x000000ff, 0x000000ff, 0x000000ff, 0x0403082b, 0x07030818, 0x000000ff
    ];
    this.flagsOffset =  {             // 位于寄存器 P 的第 n 位
        Canny:      0, // Carry Flag (C) 无符号计算时的上溢和下溢，可以被SEC (Set Carry Flag) 和 CLC (Clear Carry Flag)指令设置和取消
        Zero:       1, // Zero Flag (Z) 上一个指令的计算结果为0则设置
        IRQDisable: 2, // Interrupt Disable (I) 用来防止系统响应IRQs中断，可以被SEI (Set Interrupt Disable) 和 CLI (Clear Interrupt Disable)指令设置和取消
        Decimal:    3, // Decimal Mode (D) 转换为BCD模式，但是2A03不支持，可以忽略，可以被SED (Set Decimal Flag) 和 CLD (Clear Decimal Flag)指令设置和取消
        Break:      4, // Break Command (B) 说明 Break Command (B) BRK (Break) 执行了，造成中断
        NotUsed:    5,
        Overflow:   6, // Overflow Flag (V) 有符号数的计算超出范围
        Sign:       7, // Negative Flag (N) 第7位如果是1则为负数，如果为0则为正数
    };
    this.reset();
};

CPU.prototype = {
    reset: function() {

        this.int = {      // 中断初始化，中断向量表位于 0xFFFA-0xFFFF，RTI (Return From Interrupt) 指令表示结束中断
            IRQs:  false, // (maskable interrupts) 被特定的memory mappers触发，可以被BRK (Break)指令触发，中断发生时跳转到0xFFFE 和 0xFFFF中存的地址
            NMI:   false, // NMI (Non-Maskable Interrupt) 当PPU发生V-Blank的时候产生中断，可以被PPU Control Register 1(0x2000)的di7位阻止，中断发生时跳转到0xFFFA 和 0xFFFB中存的地址
            RESET: false, // 游戏开始或者按下reset键的时候触发，中断发生时跳转到0xFFFC 和 0xFFFD中存的地址
        };                // 优先级 RESET > NMI > IRQs 中断等待时间为7个CPU周期

        this.reg = {    // 寄存器初始化
            PC: 0x7FFF, // 16bit Program Counter 下一个指令的地址
            SP:   0xFF, // 8bit Stack Pointer 栈位于内存的 0x0100-0x01FF
            A:    0x00, // 8bit Accumulator 存储算术和逻辑运算结果，或者从内存中取回的值
            X:    0x00, // 8bit Index Register X 存储寻址模式中的计数和偏移，可以从内存中取值，可以读取和设置SP
            Y:    0x00, // 8bit Index Register Y 存储寻址模式中的计数和偏移，可以从内存中取值，不能影响SP
            P:    0x58, // 8bit Processor Status Register (flags) 标志寄存器，8个标志位
        };
        
        this.mem = new MAINMEM(this);
    },    
    
    doInterrupt() {
                // Check interrupts:
        if(this.irqRequested){
            temp =
                (this.F_CARRY)|
                ((this.F_ZERO===0?1:0)<<1)|
                (this.F_INTERRUPT<<2)|
                (this.F_DECIMAL<<3)|
                (this.F_BRK<<4)|
                (this.F_NOTUSED<<5)|
                (this.F_OVERFLOW<<6)|
                (this.F_SIGN<<7);

            this.REG_PC_NEW = this.REG_PC;
            this.F_INTERRUPT_NEW = this.F_INTERRUPT;
            switch(this.irqType){
                case 0: {
                    // Normal IRQ:
                    if(this.F_INTERRUPT!=0){
                        ////System.out.println("Interrupt was masked.");
                        break;
                    }
                    this.doIrq(temp);
                    ////System.out.println("Did normal IRQ. I="+this.F_INTERRUPT);
                    break;
                }case 1:{
                    // NMI:
                    this.doNonMaskableInterrupt(temp);
                    break;

                }case 2:{
                    // Reset:
                    this.doResetInterrupt();
                    break;
                }
            }

            this.REG_PC = this.REG_PC_NEW;
            this.F_INTERRUPT = this.F_INTERRUPT_NEW;
            this.F_BRK = this.F_BRK_NEW;
            this.irqRequested = false;
        }
    },
    // 每条指令可能有1，2或者3字节长，
    // 取决于寻址模式的不同。
    // 其中第一个字节为操作码(opcode)，
    // 而剩余的字节为操作数(oprand)
    emulate: function() { // Emulates a single CPU instruction, returns the number of cycles
        // 检查中断
        if(this.irqRequested){
            this.doInterrupt();
        }
    }
}