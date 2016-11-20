
// cpu初始化
NES.CPU = function() {
    // 中断初始化
    this.int = {
        BRKorIRQ: false,
        NMI: false,
        RESET: false,
    }
    // 寄存器初始化
    this.reg = {
        A: 0,
        X: 0,
        Y: 0,
        SP: 0x01FF,
        // P: 0x58, 分为下面8个标志位 // Processor Status Register (flags)
        flag: {
            Canny: 0,
            Zero: 1,
            IRQDisable: 1,
            Decimal: 0,
            BreakFlag: 1,
            NotUsed: 1,
            Overflow: 0,
            Sign: 0,
        },
        PC: 0x8000 - 1,
    };
    // cpu最大内存寻址能力为 64 KB
    this.mem = new Array(0x10000);

    this.cyclesToHalt = 0;

    // 每条指令可能有1，2或者3字节长，
    // 取决于地址模式的不同。
    // 其中第一个字节为操作码(opcode)，
    // 而剩余的字节为操作数(oprand)
    this.initOpdata();
    
    this.reset();
};

NES.CPU.prototype = {
    reset: function() {
        // 中断初始化
        this.int.BRKorIRQ = false;
        this.int.NMI = false;
        this.int.RESET = false;
        // 寄存器初始化
        this.reg.A = 0;
        this.reg.X = 0;
        this.reg.Y = 0;
        this.reg.SP = 0x01FF; // 0x0100 ~ 0x01FF
        this.reg.PC = 0x8000 -1;
        this.flag.Canny = 0;
        this.flag.Zero = 1;
        this.flag.IRQDisable = 1;
        this.flag.Decimal = 0;
        this.flag.BreakFlag = 1;
        this.flag.NotUsed = 1;
        this.flag.Overflow = 0;
        this.flag.Sign = 0;
        // 主内存初始化
        for (var i=0; i < 0x2000; i++) {
            this.mem[i] = 0xFF;
        }
        for (var p=0; p < 4; p++) {  //  初始化 $0000~$07FF 的镜像区域
            var i = p*0x800;
            this.mem[i+0x008] = 0xF7;
            this.mem[i+0x009] = 0xEF;
            this.mem[i+0x00A] = 0xDF;
            this.mem[i+0x00F] = 0xBF;
        }
        for (var i=0x2000; i < this.mem.length; i++) {
            this.mem[i] = 0;
        }
        this.cyclesToHalt = 0;
    },
    // 模拟 cpu 指令,
    // PC+1 决定了操作码opcode，寻址方式addrMod
    // returns the number of cycles
    emulate: function() {
        // 检查是否有中断
        if (this.int.RESET) {
            this.doResetInterrupt();
            this.int.RESET = false;
        } else if (this.int.NMI) {
            this.doNonMaskableInterrupt();
            this.int.NMI = false;
        } else if (this.int.BRKorIRQ) {
            if (this.reg.flag.IRQDisable==0)
                this.doIrq();
            this.int.BRKorIRQ = false;
        }
        // 获取指令信息
        var opinf = this.op[nes.mmap.load(this.reg.PC+1)];
        var opcode = opinf & 0xFF;
        var addrMode = (opinf >> 8) & 0xFF;
        this.reg.PC += ((opinf >> 16) & 0xFF); // PC 加上指令长度
        var cycleCount = (opinf>>24);
        var cycleAdd = 0;

        var addr = 0;
        switch (addrMode) {
            case this.AddrMode.ZP: // 0页地址寻址
                addr = nes.mmap.load(this.reg.PC+2);
                break;

            case this.AddrMode.REL: // 相对地址寻址
                addr = nes.mmap.load(this.reg.PC+2);
                if(addr<0x80)
                    addr += this.reg.PC;
                else
                    addr += this.reg.PC-0x100;
                break;

            case this.AddrMode.IMP: // 默认寻址，比如CLC 清除CF寄存器，不需要给出地址
                break;

            case this.AddrMode.ABS: // 绝对地址寻址
                addr = nes.mmap.load16bit(this.reg.PC+2);
                break;

            case this.AddrMode.ACC: // A寄存器寻址
                addr = this.reg.A;
                break;

            case this.AddrMode.IMM: // 立即数
                addr = this.reg.PC;
                break;

            case this.AddrMode.ZPX: // 0页地址寻址 再加上X寄存器
                addr = (nes.mmap.load(this.reg.PC+2)+this.reg.X)&0xFF;
                break;

            case this.AddrMode.ZPY: // 0页地址寻址 再加上Y寄存器
                addr = (nes.mmap.load(this.reg.PC+2)+this.reg.Y)&0xFF;
                break;

            case this.AddrMode.ABSX: // 绝对地址寻址 再加上X寄存器
                addr = nes.mmap.load16bit(this.reg.PC+2);
                if (this.pageCrossed(addr, addr+this.reg.X)) {
                    cycleAdd = 1;
                }
                addr+=this.reg.X;
                break;

            case this.AddrMode.ABSY: // 绝对地址寻址 再加上Y寄存器
                addr = nes.mmap.load16bit(this.reg.PC+2);
                if (this.pageCrossed(addr, addr+this.reg.Y)) {
                    cycleAdd = 1;
                }
                addr+=this.reg.Y;
                break;

            case this.AddrMode.PREIDXIND: // 间接寻址 先加上X寄存器 再获取地址
                addr = nes.mmap.load(this.reg.PC+2);
                if (this.pageCrossed(addr, addr+this.reg.X)) {
                    cycleAdd = 1;
                }
                addr+=this.reg.X;
                addr&=0xFF;
                addr = nes.mmap.load16bit(addr);
                break;

            case this.AddrMode.POSTIDXIND: // 间接寻址 先获取地址 再加上Y寄存器
                addr = nes.mmap.load16bit(
                    nes.mmap.load(this.reg.PC+2));
                if (this.pageCrossed(addr, addr+this.reg.Y)) {
                    cycleAdd = 1;
                }
                addr+=this.reg.Y;
                break;

            case this.AddrMode.INDABS: // 间接绝对寻址，只用在JMP指令，比如
                // JMP ($2345)   -- jump to the address in $2345 low and $2346 high
                addr = nes.mmap.load16bit(this.reg.PC+2);// Find op
                addr = nes.mmap.load(addr) +
                    (nes.mmap.load((addr & 0xFF00) | (((addr & 0xFF) + 1) & 0xFF)) << 8);
                break;
        }
        addr&=0xFFFF;

        // 执行指令
        switch(opcode) {
            case this.opcode.ADC: // Add with carry. 带进位加
                temp = this.reg.A + nes.mmap.load(addr) + this.reg.flag.Carry;
                this.reg.flag.Overflow = ((!(((this.reg.A ^ nes.mmap.load(addr)) & 0x80)!=0) && (((this.reg.A ^ temp) & 0x80))!=0)?1:0);
                this.reg.flag.Carry = (temp>255?1:0);
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp&0xFF;
                this.reg.A = (temp&255);
                cycleCount += cycleAdd;
                break;

            case this.opcode.AND: // AND memory with accumulator. 内存和A寄存器求与
                this.reg.A = this.reg.A & nes.mmap.load(addr);
                this.reg.flag.Sign = (this.reg.A>>7)&1;
                this.reg.flag.Zero = this.reg.A;
                if(addrMode!=this.AddrMode.POSTIDXIND)
                    cycleCount += cycleAdd;
                break;

            case this.opcode.ASL: // Shift left one bit 左移一位
                if(addrMode == this.AddrMode.ACC){ // ADDR_ACC = 4
                    this.reg.flag.Carry = (this.reg.A>>7)&1;
                    this.reg.A = (this.reg.A<<1)&255;
                    this.reg.flag.Sign = (this.reg.A>>7)&1;
                    this.reg.flag.Zero = this.reg.A;
                } else {
                    temp = nes.mmap.load(addr);
                    this.reg.flag.Carry = (temp>>7)&1;
                    temp = (temp<<1)&255;
                    this.reg.flag.Sign = (temp>>7)&1;
                    this.reg.flag.Zero = temp;
                    nes.mmap.write(addr, temp);
                }
                break;

            case this.opcode.BCC: // Branch on carry clear 跳转
                if(this.reg.flag.Carry == 0){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case this.opcode.BCS: // Branch on carry set 跳转
                if(this.reg.flag.Carry == 1){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case this.opcode.BEQ: // Branch on zero 跳转
                if(this.reg.flag.Zero == 0){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case this.opcode.BIT:
                temp = nes.mmap.load(addr);
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Overflow = (temp>>6)&1;
                temp &= this.reg.A;
                this.reg.flag.Zero = temp;
                break;

            case this.opcode.BMI: // Branch on negative result
                if(this.reg.flag.Sign == 1){
                    cycleCount++;
                    this.reg.PC = addr;
                }
                break;

            case this.opcode.BNE: // Branch on not zero
                if(this.reg.flag.Zero != 0){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case this.opcode.BPL: // Branch on positive result
                if(this.reg.flag.Sign == 0){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case this.opcode.BRK:
                this.reg.PC+=2;
                this.push((this.reg.PC>>8)&255);
                this.push(this.reg.PC&255);
                this.reg.flag.BreakFlag = 1;

                this.push(
                    (this.reg.flag.Carry)|
                    ((this.reg.flag.Zero==0?1:0)<<1)|
                    (this.reg.flag.IRQDisable<<2)|
                    (this.reg.flag.Decimal<<3)|
                    (this.reg.flag.BreakFlag<<4)|
                    (this.reg.flag.NotUsed<<5)|
                    (this.reg.flag.Overflow<<6)|
                    (this.reg.flag.Sign<<7)
                );

                this.reg.flag.IRQDisable = 1;
                this.reg.PC = nes.mmap.load16bit(0xFFFE);
                this.reg.PC--;
                break;

            case this.opcode.BVC: // Branch on overflow clear
                if(this.reg.flag.Overflow == 0){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case this.opcode.BVS: // Branch on overflow set
                if(this.reg.flag.Overflow == 1){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case this.opcode.CLC: // Clear carry flag
                this.reg.flag.Carry = 0;
                break;

            case this.opcode.CLD: // Clear decimal flag
                this.reg.flag.Decimal = 0;
                break;

            case this.opcode.CLI: // Clear interrupt flag
                this.reg.flag.IRQDisable = 0;
                break;

            case this.opcode.CLV: // Clear overflow flag
                this.reg.flag.Overflow = 0;
                break;

            case this.opcode.CMP: // Compare memory and accumulator:
                temp = this.reg.A - nes.mmap.load(addr);
                this.reg.flag.Carry = (temp>=0?1:0);
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp&0xFF;
                cycleCount+=cycleAdd;
                break;

            case this.opcode.CPX: // Compare memory and index X:
                temp = this.reg.X - nes.mmap.load(addr);
                this.reg.flag.Carry = (temp>=0?1:0);
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp&0xFF;
                break;

            case this.opcode.CPY: // Compare memory and index Y:
                temp = this.reg.Y - nes.mmap.load(addr);
                this.reg.flag.Carry = (temp>=0?1:0);
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp&0xFF;
                break;

            case this.opcode.DEC: // Decrement memory by one:
                temp = (nes.mmap.load(addr)-1)&0xFF;
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp;
                nes.mmap.write(addr, temp);
                break;

            case this.opcode.DEX: // Decrement index X by one:
                this.reg.X = (this.reg.X-1)&0xFF;
                this.reg.flag.Sign = (this.reg.X>>7)&1;
                this.reg.flag.Zero = this.reg.X;
                break;

            case this.opcode.DEY: // Decrement index Y by one:
                this.reg.Y = (this.reg.Y-1)&0xFF;
                this.reg.flag.Sign = (this.reg.Y>>7)&1;
                this.reg.flag.Zero = this.reg.Y;
                break;

            case this.opcode.EOR: // XOR Memory with accumulator, store in accumulator:
                this.reg.A = (nes.mmap.load(addr)^this.reg.A)&0xFF;
                this.reg.flag.Sign = (this.reg.A>>7)&1;
                this.reg.flag.Zero = this.reg.A;
                cycleCount+=cycleAdd;
                break;

            case this.opcode.INC: // Increment memory by one:
                temp = (nes.mmap.load(addr)+1)&0xFF;
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp;
                nes.mmap.write(addr, temp&0xFF);
                break;

            case this.opcode.INX: // Increment index X by one:
                this.reg.X = (this.reg.X+1)&0xFF;
                this.reg.flag.Sign = (this.reg.X>>7)&1;
                this.reg.flag.Zero = this.reg.X;
                break;

            case this.opcode.INY: // Increment index Y by one:
                this.reg.Y++;
                this.reg.Y &= 0xFF;
                this.reg.flag.Sign = (this.reg.Y>>7)&1;
                this.reg.flag.Zero = this.reg.Y;
                break;

            case this.opcode.JMP: // Jump to new location:
                this.reg.PC = addr-1;
                break;

            case this.opcode.JSR: // Jump to new location, saving return address.
                // Push return address on stack:
                this.push((this.reg.PC>>8)&255);
                this.push(this.reg.PC&255);
                this.reg.PC = addr-1;
                break;

            case this.opcode.LDA: // Load accumulator with memory:
                this.reg.A = nes.mmap.load(addr);
                this.reg.flag.Sign = (this.reg.A>>7)&1;
                this.reg.flag.Zero = this.reg.A;
                cycleCount+=cycleAdd;
                break;

            case this.opcode.LDX: // Load index X with memory:
                this.reg.X = nes.mmap.load(addr);
                this.reg.flag.Sign = (this.reg.X>>7)&1;
                this.reg.flag.Zero = this.reg.X;
                cycleCount+=cycleAdd;
                break;

            case this.opcode.LDY: // Load index Y with memory:
                this.reg.Y = nes.mmap.load(addr);
                this.reg.flag.Sign = (this.reg.Y>>7)&1;
                this.reg.flag.Zero = this.reg.Y;
                cycleCount+=cycleAdd;
                break;

            case this.opcode.LSR: // Shift right one bit:
                if(addrMode == this.AddrMode.ACC){
                    temp = (this.reg.A & 0xFF);
                    this.reg.flag.Carry = temp&1;
                    temp >>= 1;
                    this.reg.A = temp;
                }else{
                    temp = nes.mmap.load(addr) & 0xFF;
                    this.reg.flag.Carry = temp&1;
                    temp >>= 1;
                    nes.mmap.write(addr, temp);
                }
                this.reg.flag.Sign = 0;
                this.reg.flag.Zero = temp;
                break;

            case this.opcode.NOP: // No OPeration.
                // Ignore.
                break;

            case this.opcode.ORA: // OR memory with accumulator, store in accumulator.
                temp = (nes.mmap.load(addr)|this.reg.A)&255;
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp;
                this.reg.A = temp;
                if(addrMode!=11)cycleCount+=cycleAdd; // PostIdxInd = 11
                break;

            case this.opcode.PHA: // Push accumulator on stack
                this.push(this.reg.A);
                break;

            case this.opcode.PHP: // Push processor status on stack
                this.reg.flag.BreakFlag = 1;
                this.push(
                    (this.reg.flag.Carry)|
                    ((this.reg.flag.Zero==0?1:0)<<1)|
                    (this.reg.flag.IRQDisable<<2)|
                    (this.reg.flag.Decimal<<3)|
                    (this.reg.flag.BreakFlag<<4)|
                    (this.reg.flag.NotUsed<<5)|
                    (this.reg.flag.Overflow<<6)|
                    (this.reg.flag.Sign<<7)
                );
                break;

            case this.opcode.PLA: // Pull accumulator from stack
                this.reg.A = this.pull();
                this.reg.flag.Sign = (this.reg.A>>7)&1;
                this.reg.flag.Zero = this.reg.A;
                break;

            case this.opcode.PLP: // Pull processor status from stack
                temp = this.pull();
                this.reg.flag.Carry     = (temp   )&1;
                this.reg.flag.Zero      = (((temp>>1)&1)==1)?0:1;
                this.reg.flag.IRQDisable = (temp>>2)&1;
                this.reg.flag.Decimal   = (temp>>3)&1;
                this.reg.flag.BreakFlag       = (temp>>4)&1;
                this.reg.flag.NotUsed   = (temp>>5)&1;
                this.reg.flag.Overflow  = (temp>>6)&1;
                this.reg.flag.Sign      = (temp>>7)&1;

                this.reg.flag.NotUsed = 1;
                break;

            case this.opcode.ROL: // Rotate one bit left
                if(addrMode == this.AddrMode.ACC){
                    temp = this.reg.A;
                    add = this.reg.flag.Carry;
                    this.reg.flag.Carry = (temp>>7)&1;
                    temp = ((temp<<1)&0xFF)+add;
                    this.reg.A = temp;
                } else {
                    temp = nes.mmap.load(addr);
                    add = this.reg.flag.Carry;
                    this.reg.flag.Carry = (temp>>7)&1;
                    temp = ((temp<<1)&0xFF)+add;    
                    nes.mmap.write(addr, temp);
                }
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp;
                break;

            case this.opcode.ROR: // Rotate one bit right
                if(addrMode == this.AddrMode.ACC){
                    add = this.reg.flag.Carry<<7;
                    this.reg.flag.Carry = this.reg.A&1;
                    temp = (this.reg.A>>1)+add;   
                    this.reg.A = temp;
                } else {
                    temp = nes.mmap.load(addr);
                    add = this.reg.flag.Carry<<7;
                    this.reg.flag.Carry = temp&1;
                    temp = (temp>>1)+add;
                    nes.mmap.write(addr, temp);
                }
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp;
                break;

            case this.opcode.RTI: // Return from interrupt. Pull status and PC from stack.
                
                temp = this.pull();
                this.reg.flag.Carry     = (temp   )&1;
                this.reg.flag.Zero      = ((temp>>1)&1)==0?1:0;
                this.reg.flag.IRQDisable = (temp>>2)&1;
                this.reg.flag.Decimal   = (temp>>3)&1;
                this.reg.flag.BreakFlag       = (temp>>4)&1;
                this.reg.flag.NotUsed   = (temp>>5)&1;
                this.reg.flag.Overflow  = (temp>>6)&1;
                this.reg.flag.Sign      = (temp>>7)&1;

                this.reg.PC = this.pull();
                this.reg.PC += (this.pull()<<8);
                if(this.reg.PC==0xFFFF){
                    return;
                }
                this.reg.PC--;
                this.reg.flag.NotUsed = 1;
                break;

            case this.opcode.RTS: // Return from subroutine. Pull PC from stack.
                
                this.reg.PC = this.pull();
                this.reg.PC += (this.pull()<<8);
                
                if(this.reg.PC==0xFFFF){
                    return; // return from NSF play routine:
                }
                break;

            case this.opcode.SBC:
                temp = this.reg.A-nes.mmap.load(addr)-(1-this.reg.flag.Carry);
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp&0xFF;
                this.reg.flag.Overflow = ((((this.reg.A^temp)&0x80)!=0 && ((this.reg.A^nes.mmap.load(addr))&0x80)!=0)?1:0);
                this.reg.flag.Carry = (temp<0?0:1);
                this.reg.A = (temp&0xFF);
                if(addrMode!=11)cycleCount+=cycleAdd; // PostIdxInd = 11
                break;

            case this.opcode.SEC: // Set carry flag
                this.reg.flag.Carry = 1;
                break;

            case this.opcode.SED: // Set decimal mode
                this.reg.flag.Decimal = 1;
                break;

            case this.opcode.SEI: // Set interrupt disable status
                this.reg.flag.IRQDisable = 1;
                break;

            case this.opcode.STA: // Store accumulator in memory
                nes.mmap.write(addr, this.reg.A);
                break;

            case this.opcode.STX: // Store index X in memory
                nes.mmap.write(addr, this.reg.X);
                break;

            case this.opcode.STY: // Store index Y in memory:
                nes.mmap.write(addr, this.reg.Y);
                break;

            case this.opcode.TAX: // Transfer accumulator to index X:
                this.reg.X = this.reg.A;
                this.reg.flag.Sign = (this.reg.A>>7)&1;
                this.reg.flag.Zero = this.reg.A;
                break;

            case this.opcode.TAY: // Transfer accumulator to index Y:
                this.reg.Y = this.reg.A;
                this.reg.flag.Sign = (this.reg.A>>7)&1;
                this.reg.flag.Zero = this.reg.A;
                break;

            case this.opcode.TSX: // Transfer stack pointer to index X:
                this.reg.X = (this.reg.SP-0x0100);
                this.reg.flag.Sign = (this.reg.SP>>7)&1;
                this.reg.flag.Zero = this.reg.X;
                break;

            case this.opcode.TXA: // Transfer index X to accumulator:
                this.reg.A = this.reg.X;
                this.reg.flag.Sign = (this.reg.X>>7)&1;
                this.reg.flag.Zero = this.reg.X;
                break;

            case this.opcode.TXS: // Transfer index X to stack pointer:
                this.reg.SP = (this.reg.X+0x0100);
                this.reg.SP = 0x0100 | (this.reg.SP & 0xFF);
                break;

            case this.opcode.TYA: // Transfer index Y to accumulator:
                this.reg.A = this.reg.Y;
                this.reg.flag.Sign = (this.reg.Y>>7)&1;
                this.reg.flag.Zero = this.reg.Y;
                break;

            default:
                nes.stop();
                nes.crashMessage = "Game crashed, invalid opcode at address $"+opaddr.toString(16);
                document.getElementById("crashed").innerHTML = true;
                break;

        }// end of switch

        return cycleCount;
    },

    push: function(value){
        nes.mmap.write(this.reg.SP, value);
        this.reg.SP--;
        this.reg.SP = 0x0100 | (this.reg.SP&0xFF);
    },

    pull: function(){
        this.reg.SP++;
        this.reg.SP = 0x0100 | (this.reg.SP&0xFF);
        return nes.mmap.load(this.reg.SP);
    },

    pageCrossed: function(addr1, addr2){
        return ((addr1&0xFF00) != (addr2&0xFF00));
    },

    haltCycles: function(cycles){
        this.cyclesToHalt += cycles;
    },
    // 不可屏蔽中断,发生在每次刷新时(VBlank). 这些刷新的间隔依赖于所用的系统 (PAL/NTSC)
    doNonMaskableInterrupt: function(status){
        if((nes.mmap.load(0x2000) & 128) != 0) { // Check whether VBlank Interrupts are enabled
            var status =
                    (this.reg.flag.Carry)|
                    ((this.reg.flag.Zero===0?1:0)<<1)|
                    (this.reg.flag.IRQDisable<<2)|
                    (this.reg.flag.Decimal<<3)|
                    (this.reg.flag.BreakFlag<<4)|
                    (this.reg.flag.NotUsed<<5)|
                    (this.reg.flag.Overflow<<6)|
                    (this.reg.flag.Sign<<7);
            this.reg.PC++;
            this.push((this.reg.PC>>8)&0xFF);
            this.push(this.reg.PC&0xFF);
            this.push(status);

            this.reg.PC = nes.mmap.load(0xFFFA) | (nes.mmap.load(0xFFFB) << 8);
            this.reg.PC--;
        }
    },
    // reset 复位
    doResetInterrupt: function(){
        this.reg.PC = nes.mmap.load(0xFFFC) | (nes.mmap.load(0xFFFD) << 8);
        this.reg.PC--;
    },
    // 软件中断 BRK 和硬件中断 IRQ 共用
    doIrq: function(status){
        var status =
                (this.reg.flag.Carry)|
                ((this.reg.flag.Zero===0?1:0)<<1)|
                (this.reg.flag.IRQDisable<<2)|
                (this.reg.flag.Decimal<<3)|
                (this.reg.flag.BreakFlag<<4)|
                (this.reg.flag.NotUsed<<5)|
                (this.reg.flag.Overflow<<6)|
                (this.reg.flag.Sign<<7);
        this.reg.PC++;
        this.push((this.reg.PC>>8)&0xFF);
        this.push(this.reg.PC&0xFF);
        this.push(status);
        this.reg.flag.IRQDisable = 1;
        this.reg.flag.BreakFlag = 0;

        this.reg.PC = nes.mmap.load(0xFFFE) | (nes.mmap.load(0xFFFF) << 8);
        this.reg.PC--;
    },

    getStatus: function(){
        return (this.reg.flag.Carry)
                |(this.reg.flag.Zero<<1)
                |(this.reg.flag.IRQDisable<<2)
                |(this.reg.flag.Decimal<<3)
                |(this.reg.flag.BreakFlag<<4)
                |(this.reg.flag.NotUsed<<5)
                |(this.reg.flag.Overflow<<6)
                |(this.reg.flag.Sign<<7);
    },

    setStatus: function(s){
        this.reg.flag.Carry      = (s   )&1;
        this.reg.flag.Zero       = (s>>1)&1;
        this.reg.flag.IRQDisable = (s>>2)&1;
        this.reg.flag.Decimal    = (s>>3)&1;
        this.reg.flag.BreakFlag  = (s>>4)&1;
        this.reg.flag.NotUsed    = (s>>5)&1;
        this.reg.flag.Overflow   = (s>>6)&1;
        this.reg.flag.Sign       = (s>>7)&1;
    },
    
    JSON_PROPERTIES: [
        'mem', 'cyclesToHalt', 'irqRequested', 'irqType',
        // Registers
        'reg.A', 'reg.X', 'reg.Y', 'reg.SP', 'reg.PC', 'reg.PC',
        'reg.STATUS',
        // Status
        'reg.flag.Carry', 'reg.flag.Decimal', 'reg.flag.IRQDisable', 'reg.flag.IRQDisable', 'reg.flag.Overflow', 
        'reg.flag.Sign', 'reg.flag.Zero', 'reg.flag.NotUsed', 'reg.flag.NotUsed', 'reg.flag.BreakFlag', 'reg.flag.BreakFlag'
    ],
    
    toJSON: function() {
        return NES.Utils.toJSON(this);
    },
    
    fromJSON: function(s) {
        NES.Utils.fromJSON(this, s);
    },

    initOpdata: function() {
        this.opcode = {
            ADC: 0,
            AND: 1,
            ASL: 2,
            
            BCC: 3,
            BCS: 4,
            BEQ: 5,
            BIT: 6,
            BMI: 7,
            BNE: 8,
            BPL: 9,
            BRK: 10,
            BVC: 11,
            BVS: 12,
            
            CLC: 13,
            CLD: 14,
            CLI: 15,
            CLV: 16,
            CMP: 17,
            CPX: 18,
            CPY: 19,
            
            DEC: 20,
            DEX: 21,
            DEY: 22,
            
            EOR: 23,
            
            INC: 24,
            INX: 25,
            INY: 26,
            
            JMP: 27,
            JSR: 28,
            
            LDA: 29,
            LDX: 30,
            LDY: 31,
            LSR: 32,
            
            NOP: 33,
            
            ORA: 34,
            
            PHA: 35,
            PHP: 36,
            PLA: 37,
            PLP: 38,
            
            ROL: 39,
            ROR: 40,
            RTI: 41,
            RTS: 42,
            
            SBC: 43,
            SEC: 44,
            SED: 45,
            SEI: 46,
            STA: 47,
            STX: 48,
            STY: 49,
            
            TAX: 50,
            TAY: 51,
            TSX: 52,
            TXA: 53,
            TXS: 54,
            TYA: 55,
            
            DUMMY: 56, // dummy instruction used for 'halting' the processor some cycles
        }
        this.AddrMode = {
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
        }
        this.op = new Array(256);
        // 没有被设置过的指令就是非法指令
        for(var i=0;i<256;i++) this.op[i]=0xFF;
        // 填入指令的一些信息
		
		// ADC:
        this.setOpdata(0x69,this.opcode.ADC,this.AddrMode.IMM,2,2);
        this.setOpdata(0x65,this.opcode.ADC,this.AddrMode.ZP,2,3);
        this.setOpdata(0x75,this.opcode.ADC,this.AddrMode.ZPX,2,4);
        this.setOpdata(0x6D,this.opcode.ADC,this.AddrMode.ABS,3,4);
        this.setOpdata(0x7D,this.opcode.ADC,this.AddrMode.ABSX,3,4);
        this.setOpdata(0x79,this.opcode.ADC,this.AddrMode.ABSY,3,4);
        this.setOpdata(0x61,this.opcode.ADC,this.AddrMode.PREIDXIND,2,6);
        this.setOpdata(0x71,this.opcode.ADC,this.AddrMode.POSTIDXIND,2,5);
        
        // AND:
        this.setOpdata(0x29,this.opcode.AND,this.AddrMode.IMM,2,2);
        this.setOpdata(0x25,this.opcode.AND,this.AddrMode.ZP,2,3);
        this.setOpdata(0x35,this.opcode.AND,this.AddrMode.ZPX,2,4);
        this.setOpdata(0x2D,this.opcode.AND,this.AddrMode.ABS,3,4);
        this.setOpdata(0x3D,this.opcode.AND,this.AddrMode.ABSX,3,4);
        this.setOpdata(0x39,this.opcode.AND,this.AddrMode.ABSY,3,4);
        this.setOpdata(0x21,this.opcode.AND,this.AddrMode.PREIDXIND,2,6);
        this.setOpdata(0x31,this.opcode.AND,this.AddrMode.POSTIDXIND,2,5);
        
        // ASL:
        this.setOpdata(0x0A,this.opcode.ASL,this.AddrMode.ACC,1,2);
        this.setOpdata(0x06,this.opcode.ASL,this.AddrMode.ZP,2,5);
        this.setOpdata(0x16,this.opcode.ASL,this.AddrMode.ZPX,2,6);
        this.setOpdata(0x0E,this.opcode.ASL,this.AddrMode.ABS,3,6);
        this.setOpdata(0x1E,this.opcode.ASL,this.AddrMode.ABSX,3,7);
        
        // BCC:
        this.setOpdata(0x90,this.opcode.BCC,this.AddrMode.REL,2,2);
        
        // BCS:
        this.setOpdata(0xB0,this.opcode.BCS,this.AddrMode.REL,2,2);
        
        // BEQ:
        this.setOpdata(0xF0,this.opcode.BEQ,this.AddrMode.REL,2,2);
        
        // BIT:
        this.setOpdata(0x24,this.opcode.BIT,this.AddrMode.ZP,2,3);
        this.setOpdata(0x2C,this.opcode.BIT,this.AddrMode.ABS,3,4);
        
        // BMI:
        this.setOpdata(0x30,this.opcode.BMI,this.AddrMode.REL,2,2);
        
        // BNE:
        this.setOpdata(0xD0,this.opcode.BNE,this.AddrMode.REL,2,2);
        
        // BPL:
        this.setOpdata(0x10,this.opcode.BPL,this.AddrMode.REL,2,2);
        
        // BRK:
        this.setOpdata(0x00,this.opcode.BRK,this.AddrMode.IMP,1,7);
        
        // BVC:
        this.setOpdata(0x50,this.opcode.BVC,this.AddrMode.REL,2,2);
        
        // BVS:
        this.setOpdata(0x70,this.opcode.BVS,this.AddrMode.REL,2,2);
        
        // CLC:
        this.setOpdata(0x18,this.opcode.CLC,this.AddrMode.IMP,1,2);
        
        // CLD:
        this.setOpdata(0xD8,this.opcode.CLD,this.AddrMode.IMP,1,2);
        
        // CLI:
        this.setOpdata(0x58,this.opcode.CLI,this.AddrMode.IMP,1,2);
        
        // CLV:
        this.setOpdata(0xB8,this.opcode.CLV,this.AddrMode.IMP,1,2);
        
        // CMP:
        this.setOpdata(0xC9,this.opcode.CMP,this.AddrMode.IMM,2,2);
        this.setOpdata(0xC5,this.opcode.CMP,this.AddrMode.ZP,2,3);
        this.setOpdata(0xD5,this.opcode.CMP,this.AddrMode.ZPX,2,4);
        this.setOpdata(0xCD,this.opcode.CMP,this.AddrMode.ABS,3,4);
        this.setOpdata(0xDD,this.opcode.CMP,this.AddrMode.ABSX,3,4);
        this.setOpdata(0xD9,this.opcode.CMP,this.AddrMode.ABSY,3,4);
        this.setOpdata(0xC1,this.opcode.CMP,this.AddrMode.PREIDXIND,2,6);
        this.setOpdata(0xD1,this.opcode.CMP,this.AddrMode.POSTIDXIND,2,5);
        
        // CPX:
        this.setOpdata(0xE0,this.opcode.CPX,this.AddrMode.IMM,2,2);
        this.setOpdata(0xE4,this.opcode.CPX,this.AddrMode.ZP,2,3);
        this.setOpdata(0xEC,this.opcode.CPX,this.AddrMode.ABS,3,4);
        
        // CPY:
        this.setOpdata(0xC0,this.opcode.CPY,this.AddrMode.IMM,2,2);
        this.setOpdata(0xC4,this.opcode.CPY,this.AddrMode.ZP,2,3);
        this.setOpdata(0xCC,this.opcode.CPY,this.AddrMode.ABS,3,4);
        
        // DEC:
        this.setOpdata(0xC6,this.opcode.DEC,this.AddrMode.ZP,2,5);
        this.setOpdata(0xD6,this.opcode.DEC,this.AddrMode.ZPX,2,6);
        this.setOpdata(0xCE,this.opcode.DEC,this.AddrMode.ABS,3,6);
        this.setOpdata(0xDE,this.opcode.DEC,this.AddrMode.ABSX,3,7);
        
        // DEX:
        this.setOpdata(0xCA,this.opcode.DEX,this.AddrMode.IMP,1,2);
        
        // DEY:
        this.setOpdata(0x88,this.opcode.DEY,this.AddrMode.IMP,1,2);
        
        // EOR:
        this.setOpdata(0x49,this.opcode.EOR,this.AddrMode.IMM,2,2);
        this.setOpdata(0x45,this.opcode.EOR,this.AddrMode.ZP,2,3);
        this.setOpdata(0x55,this.opcode.EOR,this.AddrMode.ZPX,2,4);
        this.setOpdata(0x4D,this.opcode.EOR,this.AddrMode.ABS,3,4);
        this.setOpdata(0x5D,this.opcode.EOR,this.AddrMode.ABSX,3,4);
        this.setOpdata(0x59,this.opcode.EOR,this.AddrMode.ABSY,3,4);
        this.setOpdata(0x41,this.opcode.EOR,this.AddrMode.PREIDXIND,2,6);
        this.setOpdata(0x51,this.opcode.EOR,this.AddrMode.POSTIDXIND,2,5);
        
        // INC:
        this.setOpdata(0xE6,this.opcode.INC,this.AddrMode.ZP,2,5);
        this.setOpdata(0xF6,this.opcode.INC,this.AddrMode.ZPX,2,6);
        this.setOpdata(0xEE,this.opcode.INC,this.AddrMode.ABS,3,6);
        this.setOpdata(0xFE,this.opcode.INC,this.AddrMode.ABSX,3,7);
        
        // INX:
        this.setOpdata(0xE8,this.opcode.INX,this.AddrMode.IMP,1,2);
        
        // INY:
        this.setOpdata(0xC8,this.opcode.INY,this.AddrMode.IMP,1,2);
        
        // JMP:
        this.setOpdata(0x4C,this.opcode.JMP,this.AddrMode.ABS,3,3);
        this.setOpdata(0x6C,this.opcode.JMP,this.AddrMode.INDABS,3,5);
        
        // JSR:
        this.setOpdata(0x20,this.opcode.JSR,this.AddrMode.ABS,3,6);
        
        // LDA:
        this.setOpdata(0xA9,this.opcode.LDA,this.AddrMode.IMM,2,2);
        this.setOpdata(0xA5,this.opcode.LDA,this.AddrMode.ZP,2,3);
        this.setOpdata(0xB5,this.opcode.LDA,this.AddrMode.ZPX,2,4);
        this.setOpdata(0xAD,this.opcode.LDA,this.AddrMode.ABS,3,4);
        this.setOpdata(0xBD,this.opcode.LDA,this.AddrMode.ABSX,3,4);
        this.setOpdata(0xB9,this.opcode.LDA,this.AddrMode.ABSY,3,4);
        this.setOpdata(0xA1,this.opcode.LDA,this.AddrMode.PREIDXIND,2,6);
        this.setOpdata(0xB1,this.opcode.LDA,this.AddrMode.POSTIDXIND,2,5);
        
        
        // LDX:
        this.setOpdata(0xA2,this.opcode.LDX,this.AddrMode.IMM,2,2);
        this.setOpdata(0xA6,this.opcode.LDX,this.AddrMode.ZP,2,3);
        this.setOpdata(0xB6,this.opcode.LDX,this.AddrMode.ZPY,2,4);
        this.setOpdata(0xAE,this.opcode.LDX,this.AddrMode.ABS,3,4);
        this.setOpdata(0xBE,this.opcode.LDX,this.AddrMode.ABSY,3,4);
        
        // LDY:
        this.setOpdata(0xA0,this.opcode.LDY,this.AddrMode.IMM,2,2);
        this.setOpdata(0xA4,this.opcode.LDY,this.AddrMode.ZP,2,3);
        this.setOpdata(0xB4,this.opcode.LDY,this.AddrMode.ZPX,2,4);
        this.setOpdata(0xAC,this.opcode.LDY,this.AddrMode.ABS,3,4);
        this.setOpdata(0xBC,this.opcode.LDY,this.AddrMode.ABSX,3,4);
        
        // LSR:
        this.setOpdata(0x4A,this.opcode.LSR,this.AddrMode.ACC,1,2);
        this.setOpdata(0x46,this.opcode.LSR,this.AddrMode.ZP,2,5);
        this.setOpdata(0x56,this.opcode.LSR,this.AddrMode.ZPX,2,6);
        this.setOpdata(0x4E,this.opcode.LSR,this.AddrMode.ABS,3,6);
        this.setOpdata(0x5E,this.opcode.LSR,this.AddrMode.ABSX,3,7);
        
        // NOP:
        this.setOpdata(0xEA,this.opcode.NOP,this.AddrMode.IMP,1,2);
        
        // ORA:
        this.setOpdata(0x09,this.opcode.ORA,this.AddrMode.IMM,2,2);
        this.setOpdata(0x05,this.opcode.ORA,this.AddrMode.ZP,2,3);
        this.setOpdata(0x15,this.opcode.ORA,this.AddrMode.ZPX,2,4);
        this.setOpdata(0x0D,this.opcode.ORA,this.AddrMode.ABS,3,4);
        this.setOpdata(0x1D,this.opcode.ORA,this.AddrMode.ABSX,3,4);
        this.setOpdata(0x19,this.opcode.ORA,this.AddrMode.ABSY,3,4);
        this.setOpdata(0x01,this.opcode.ORA,this.AddrMode.PREIDXIND,2,6);
        this.setOpdata(0x11,this.opcode.ORA,this.AddrMode.POSTIDXIND,2,5);
        
        // PHA:
        this.setOpdata(0x48,this.opcode.PHA,this.AddrMode.IMP,1,3);
        
        // PHP:
        this.setOpdata(0x08,this.opcode.PHP,this.AddrMode.IMP,1,3);
        
        // PLA:
        this.setOpdata(0x68,this.opcode.PLA,this.AddrMode.IMP,1,4);
        
        // PLP:
        this.setOpdata(0x28,this.opcode.PLP,this.AddrMode.IMP,1,4);
        
        // ROL:
        this.setOpdata(0x2A,this.opcode.ROL,this.AddrMode.ACC,1,2);
        this.setOpdata(0x26,this.opcode.ROL,this.AddrMode.ZP,2,5);
        this.setOpdata(0x36,this.opcode.ROL,this.AddrMode.ZPX,2,6);
        this.setOpdata(0x2E,this.opcode.ROL,this.AddrMode.ABS,3,6);
        this.setOpdata(0x3E,this.opcode.ROL,this.AddrMode.ABSX,3,7);
        
        // ROR:
        this.setOpdata(0x6A,this.opcode.ROR,this.AddrMode.ACC,1,2);
        this.setOpdata(0x66,this.opcode.ROR,this.AddrMode.ZP,2,5);
        this.setOpdata(0x76,this.opcode.ROR,this.AddrMode.ZPX,2,6);
        this.setOpdata(0x6E,this.opcode.ROR,this.AddrMode.ABS,3,6);
        this.setOpdata(0x7E,this.opcode.ROR,this.AddrMode.ABSX,3,7);
        
        // RTI:
        this.setOpdata(0x40,this.opcode.RTI,this.AddrMode.IMP,1,6);
        
        // RTS:
        this.setOpdata(0x60,this.opcode.RTS,this.AddrMode.IMP,1,6);
        
        // SBC:
        this.setOpdata(0xE9,this.opcode.SBC,this.AddrMode.IMM,2,2);
        this.setOpdata(0xE5,this.opcode.SBC,this.AddrMode.ZP,2,3);
        this.setOpdata(0xF5,this.opcode.SBC,this.AddrMode.ZPX,2,4);
        this.setOpdata(0xED,this.opcode.SBC,this.AddrMode.ABS,3,4);
        this.setOpdata(0xFD,this.opcode.SBC,this.AddrMode.ABSX,3,4);
        this.setOpdata(0xF9,this.opcode.SBC,this.AddrMode.ABSY,3,4);
        this.setOpdata(0xE1,this.opcode.SBC,this.AddrMode.PREIDXIND,2,6);
        this.setOpdata(0xF1,this.opcode.SBC,this.AddrMode.POSTIDXIND,2,5);
        
        // SEC:
        this.setOpdata(0x38,this.opcode.SEC,this.AddrMode.IMP,1,2);
        
        // SED:
        this.setOpdata(0xF8,this.opcode.SED,this.AddrMode.IMP,1,2);
        
        // SEI:
        this.setOpdata(0x78,this.opcode.SEI,this.AddrMode.IMP,1,2);
        
        // STA:
        this.setOpdata(0x85,this.opcode.STA,this.AddrMode.ZP,2,3);
        this.setOpdata(0x95,this.opcode.STA,this.AddrMode.ZPX,2,4);
        this.setOpdata(0x8D,this.opcode.STA,this.AddrMode.ABS,3,4);
        this.setOpdata(0x9D,this.opcode.STA,this.AddrMode.ABSX,3,5);
        this.setOpdata(0x99,this.opcode.STA,this.AddrMode.ABSY,3,5);
        this.setOpdata(0x81,this.opcode.STA,this.AddrMode.PREIDXIND,2,6);
        this.setOpdata(0x91,this.opcode.STA,this.AddrMode.POSTIDXIND,2,6);
        
        // STX:
        this.setOpdata(0x86,this.opcode.STX,this.AddrMode.ZP,2,3);
        this.setOpdata(0x96,this.opcode.STX,this.AddrMode.ZPY,2,4);
        this.setOpdata(0x8E,this.opcode.STX,this.AddrMode.ABS,3,4);
        
        // STY:
        this.setOpdata(0x84,this.opcode.STY,this.AddrMode.ZP,2,3);
        this.setOpdata(0x94,this.opcode.STY,this.AddrMode.ZPX,2,4);
        this.setOpdata(0x8C,this.opcode.STY,this.AddrMode.ABS,3,4);
        
        // TAX:
        this.setOpdata(0xAA,this.opcode.TAX,this.AddrMode.IMP,1,2);
        
        // TAY:
        this.setOpdata(0xA8,this.opcode.TAY,this.AddrMode.IMP,1,2);
        
        // TSX:
        this.setOpdata(0xBA,this.opcode.TSX,this.AddrMode.IMP,1,2);
        
        // TXA:
        this.setOpdata(0x8A,this.opcode.TXA,this.AddrMode.IMP,1,2);
        
        // TXS:
        this.setOpdata(0x9A,this.opcode.TXS,this.AddrMode.IMP,1,2);
        
        // TYA:
        this.setOpdata(0x98,this.opcode.TYA,this.AddrMode.IMP,1,2);
    },
    setOpdata: function(opID, opcode, addrMode, length, cycles) {
        this.op[opID] = 
            ((opcode    &0xFF)    )| 
            ((addrMode  &0xFF)<< 8)| 
            ((length      &0xFF)<<16)| // length取决于addrMode的
            ((cycles    &0xFF)<<24);
    }
}