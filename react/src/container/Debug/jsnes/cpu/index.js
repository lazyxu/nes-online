var utils = require("../utils");
var mem = require("./mem");

var CPU = function (nes) {
  this.nes = nes;
  this.opdata = new Uint32Array([ // 151个合法操作码 opcode
    // 0x000000ff instruction 指令  0xff 表示非法指令
    // 0x0000ff00 addressing mode 寻址方式 
    // 0x00ff0000 size 指令在内存中的大小，占多少字节
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
  ]);
  // this.mem = new CPU_MEM();
  // mem.init.call(this);
  this.mem = new Uint8Array(new ArrayBuffer(0x10000)); // Main memory 64KB
  this.IRQ_NORMAL = 0; // IRQ Types
  this.IRQ_NMI = 1;
  this.IRQ_RESET = 2;
  this.reset();
};

CPU.prototype = {
  reset() {
    // mem.reset.call(this);
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
    
    this.cyclesToHalt = 0;
    this.irqRequested = false; // Interrupt notification
    this.irqType = null;

    // 6 registers
    this.REG_ACC = 0x00;       // 8bit Accumulator 存储算术和逻辑运算结果，或者从内存中取回的值
    this.REG_X = 0x00;         // 8bit Index Register X 存储寻址模式中的计数和偏移，可以从内存中取值，可以读取和设置SP
    this.REG_Y = 0x00;         // 8bit Index Register Y 存储寻址模式中的计数和偏移，可以从内存中取值，不能影响SP
    this.REG_SP = 0x01FF;      // 16bit Stack Pointer 栈位于内存的 0x0100-0x01FF
    this.REG_PC = 0x8000 - 1;  // 16bit Program Counter 下一个指令的地址
    // this.REG_STATUS = 0x28;    8bit Processor Status Register (flags) 状态／标志寄存器，8个标志位
    this.F_CARRY = 0;      // Carry Flag (C) 无符号计算时的上溢和下溢，可以被SEC (Set Carry Flag) 和 CLC (Clear Carry Flag)指令设置和取消
    this.F_ZERO = 1;       // Zero Flag (Z) 上一个指令的计算结果为0则设置
    this.F_IRQDISABLE = 1; // Interrupt Disable (I) 用来防止系统响应IRQs中断，可以被SEI (Set Interrupt Disable) 和 CLI (Clear Interrupt Disable)指令设置和取消
    this.F_DECIMAL = 0;    // Decimal Mode (D) 转换为BCD模式，但是2A03不支持，可以忽略，可以被SED (Set Decimal Flag) 和 CLD (Clear Decimal Flag)指令设置和取消
    this.F_BRK = 1;        // Break Command (B) 说明 Break Command (B) BRK (Break) 执行了，造成中断
    this.F_NOTUSED = 1;    // 未被使用，任何时候都假定是逻辑1
    this.F_OVERFLOW = 0;   // Overflow Flag (V) 有符号数的计算超出范围
    this.F_SIGN = 0;       // Negative Flag (N) 第7位如果是1则为负数，如果为0则为正数
  },

  // Emulates a single CPU instruction, returns the number of cycles
  // 模拟一个CPU指令，返回运行的周期数 1.检查中断 2.设置寻址方式 3.执行指令
  emulate: function () {
    var temp;
    var add;

    // Check interrupts:
    if (this.irqRequested) {
      temp =
        (this.F_CARRY) |
        ((this.F_ZERO === 0 ? 1 : 0) << 1) |
        (this.F_IRQDISABLE << 2) |
        (this.F_DECIMAL << 3) |
        (this.F_BRK << 4) |
        (this.F_NOTUSED << 5) |
        (this.F_OVERFLOW << 6) |
        (this.F_SIGN << 7);
      switch (this.irqType) {
        case 0: // Normal IRQ:
          if (this.F_IRQDISABLE != 0) {
            // console.log("Interrupt was masked.");
            break;
          }
          this.doIrq(temp);
          // console.log("Did normal IRQ. I="+this.F_IRQDISABLE);
          break;
        case 1: // NMI:
          this.doNonMaskableInterrupt(temp);
          break;
        case 2: // Reset:
          this.doResetInterrupt();
          break;
      }
      this.irqRequested = false;
    }

    var opinf = this.opdata[this.nes.mmap.load(this.REG_PC + 1)];
    var cycleCount = (opinf >> 24);
    var cycleAdd = 0;

    // Find address mode:
    var addrMode = (opinf >> 8) & 0xFF;

    // Increment PC by number of op bytes:
    var opaddr = this.REG_PC;
    this.REG_PC += ((opinf >> 16) & 0xFF);

    var addr = 0;
    switch (addrMode) {
      case 0: // Zero Page mode. Use the address given after the opcode, but without high byte.
        addr = this.load(opaddr + 2);
        break;
      case 1: // Relative mode.
        addr = this.load(opaddr + 2);
        if (addr < 0x80) {
          addr += this.REG_PC;
        } else {
          addr += this.REG_PC - 256;
        }
        break;
      case 2: // Ignore. Address is implied in instruction.
        break;
      case 3: // Absolute mode. Use the two bytes following the opcode as an address.
        addr = this.load16bit(opaddr + 2);
        break;
      case 4: // Accumulator mode. The address is in the accumulator register.
        addr = this.REG_ACC;
        break;
      case 5: // Immediate mode. The value is given after the opcode.
        addr = this.REG_PC;
        break;
      case 6: // Zero Page Indexed mode, X as index. Use the address given after the opcode, then add the X register to it to get the final address.
        addr = (this.load(opaddr + 2) + this.REG_X) & 0xFF;
        break;
      case 7: // Zero Page Indexed mode, Y as index. Use the address given after the opcode, then add the Y register to it to get the final address.
        addr = (this.load(opaddr + 2) + this.REG_Y) & 0xFF;
        break;
      case 8: // Absolute Indexed Mode, X as index. Same as zero page indexed, but with the high byte.
        addr = this.load16bit(opaddr + 2);
        if ((addr & 0xFF00) != ((addr + this.REG_X) & 0xFF00)) {
          cycleAdd = 1;
        }
        addr += this.REG_X;
        break;
      case 9: // Absolute Indexed Mode, Y as index. Same as zero page indexed, but with the high byte.
        addr = this.load16bit(opaddr + 2);
        if ((addr & 0xFF00) != ((addr + this.REG_Y) & 0xFF00)) {
          cycleAdd = 1;
        }
        addr += this.REG_Y;
        break;
      case 10: // Pre-indexed Indirect mode. Find the 16-bit address starting at the given location plus the current X register. The value is the contents of that address.
        addr = this.load(opaddr + 2);
        if ((addr & 0xFF00) != ((addr + this.REG_X) & 0xFF00)) {
          cycleAdd = 1;
        }
        addr += this.REG_X;
        addr &= 0xFF;
        addr = this.load16bit(addr);
        break;
      case 11: // Post-indexed Indirect mode. Find the 16-bit address contained in the given location (and the one following). Add to that address the contents of the Y register. Fetch the value stored at that adress.
        addr = this.load16bit(this.load(opaddr + 2));
        if ((addr & 0xFF00) != ((addr + this.REG_Y) & 0xFF00)) {
          cycleAdd = 1;
        }
        addr += this.REG_Y;
        break;
      case 12: // Indirect Absolute mode. Find the 16-bit address contained at the given location.
        addr = this.load16bit(opaddr + 2);// Find op
        if (addr < 0x1FFF) {
          addr = this.mem[addr] + (this.mem[(addr & 0xFF00) | (((addr & 0xFF) + 1) & 0xFF)] << 8);// Read from address given in op
        } else {
          addr = this.nes.mmap.load(addr) + (this.nes.mmap.load((addr & 0xFF00) | (((addr & 0xFF) + 1) & 0xFF)) << 8);
        }
        break;
    }
    // Wrap around for addresses above 0xFFFF:
    addr &= 0xFFFF;

    // ----------------------------------------------------------------------------------------------------
    // Decode & execute instruction:
    // ----------------------------------------------------------------------------------------------------

    // This should be compiled to a jump table.
    switch (opinf & 0xFF) {
      case 0: // ADC: Add with carry.
        temp = this.REG_ACC + this.load(addr) + this.F_CARRY;
        this.F_OVERFLOW = ((!(((this.REG_ACC ^ this.load(addr)) & 0x80) != 0) && (((this.REG_ACC ^ temp) & 0x80)) != 0) ? 1 : 0);
        this.F_CARRY = (temp > 255 ? 1 : 0);
        this.F_SIGN = (temp >> 7) & 1;
        this.F_ZERO = temp & 0xFF;
        this.REG_ACC = (temp & 255);
        cycleCount += cycleAdd;
        break;
      case 1: // AND: AND memory with accumulator.
        this.REG_ACC = this.REG_ACC & this.load(addr);
        this.F_SIGN = (this.REG_ACC >> 7) & 1;
        this.F_ZERO = this.REG_ACC;
        //this.REG_ACC = temp;
        if (addrMode != 11) cycleCount += cycleAdd; // PostIdxInd = 11
        break;
      case 2: // ASL: Shift left one bit
        if (addrMode == 4) { // ADDR_ACC = 4
          this.F_CARRY = (this.REG_ACC >> 7) & 1;
          this.REG_ACC = (this.REG_ACC << 1) & 255;
          this.F_SIGN = (this.REG_ACC >> 7) & 1;
          this.F_ZERO = this.REG_ACC;
        } else {
          temp = this.load(addr);
          this.F_CARRY = (temp >> 7) & 1;
          temp = (temp << 1) & 255;
          this.F_SIGN = (temp >> 7) & 1;
          this.F_ZERO = temp;
          this.write(addr, temp);
        }
        break;
      case 3: // BCC: Branch on carry clear
        if (this.F_CARRY == 0) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.REG_PC = addr;
        }
        break;
      case 4: // BCS: Branch on carry set
        if (this.F_CARRY == 1) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.REG_PC = addr;
        }
        break;
      case 5: // BEQ: Branch on zero
        if (this.F_ZERO == 0) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.REG_PC = addr;
        }
        break;
      case 6: // BIT
        temp = this.load(addr);
        this.F_SIGN = (temp >> 7) & 1;
        this.F_OVERFLOW = (temp >> 6) & 1;
        temp &= this.REG_ACC;
        this.F_ZERO = temp;
        break;
      case 7: // BMI: Branch on negative result
        if (this.F_SIGN == 1) {
          cycleCount++;
          this.REG_PC = addr;
        }
        break;
      case 8: // BNE: Branch on not zero
        if (this.F_ZERO != 0) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.REG_PC = addr;
        }
        break;
      case 9: // BPL: Branch on positive result
        if (this.F_SIGN == 0) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.REG_PC = addr;
        }
        break;
      case 10: // BRK
        this.REG_PC += 2;
        this.push((this.REG_PC >> 8) & 255);
        this.push(this.REG_PC & 255);
        this.F_BRK = 1;
        this.push(
          (this.F_CARRY) |
          ((this.F_ZERO == 0 ? 1 : 0) << 1) |
          (this.F_IRQDISABLE << 2) |
          (this.F_DECIMAL << 3) |
          (this.F_BRK << 4) |
          (this.F_NOTUSED << 5) |
          (this.F_OVERFLOW << 6) |
          (this.F_SIGN << 7)
        );
        this.F_IRQDISABLE = 1;
        //this.REG_PC = load(0xFFFE) | (load(0xFFFF) << 8);
        this.REG_PC = this.load16bit(0xFFFE);
        this.REG_PC--;
        break;
      case 11: // BVC: Branch on overflow clear
        if (this.F_OVERFLOW == 0) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.REG_PC = addr;
        }
        break;
      case 12: // BVS: Branch on overflow set
        if (this.F_OVERFLOW == 1) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.REG_PC = addr;
        }
        break;
      case 13: // CLC: Clear carry flag
        this.F_CARRY = 0;
        break;
      case 14: // CLD: Clear decimal flag
        this.F_DECIMAL = 0;
        break;
      case 15: // CLI: Clear interrupt flag
        this.F_IRQDISABLE = 0;
        break;
      case 16: // CLV: Clear overflow flag
        this.F_OVERFLOW = 0;
        break;
      case 17: // CMP: Compare memory and accumulator:
        temp = this.REG_ACC - this.load(addr);
        this.F_CARRY = (temp >= 0 ? 1 : 0);
        this.F_SIGN = (temp >> 7) & 1;
        this.F_ZERO = temp & 0xFF;
        cycleCount += cycleAdd;
        break;
      case 18: // CPX: Compare memory and index X:
        temp = this.REG_X - this.load(addr);
        this.F_CARRY = (temp >= 0 ? 1 : 0);
        this.F_SIGN = (temp >> 7) & 1;
        this.F_ZERO = temp & 0xFF;
        break;
      case 19: // CPY: Compare memory and index Y:
        temp = this.REG_Y - this.load(addr);
        this.F_CARRY = (temp >= 0 ? 1 : 0);
        this.F_SIGN = (temp >> 7) & 1;
        this.F_ZERO = temp & 0xFF;
        break;
      case 20: // DEC: Decrement memory by one:
        temp = (this.load(addr) - 1) & 0xFF;
        this.F_SIGN = (temp >> 7) & 1;
        this.F_ZERO = temp;
        this.write(addr, temp);
        break;
      case 21: // DEX: Decrement index X by one:
        this.REG_X = (this.REG_X - 1) & 0xFF;
        this.F_SIGN = (this.REG_X >> 7) & 1;
        this.F_ZERO = this.REG_X;
        break;
      case 22: // DEY: Decrement index Y by one:
        this.REG_Y = (this.REG_Y - 1) & 0xFF;
        this.F_SIGN = (this.REG_Y >> 7) & 1;
        this.F_ZERO = this.REG_Y;
        break;
      case 23: // EOR: XOR Memory with accumulator, store in accumulator:
        this.REG_ACC = (this.load(addr) ^ this.REG_ACC) & 0xFF;
        this.F_SIGN = (this.REG_ACC >> 7) & 1;
        this.F_ZERO = this.REG_ACC;
        cycleCount += cycleAdd;
        break;
      case 24: // INC: Increment memory by one:
        temp = (this.load(addr) + 1) & 0xFF;
        this.F_SIGN = (temp >> 7) & 1;
        this.F_ZERO = temp;
        this.write(addr, temp & 0xFF);
        break;
      case 25: // INX: Increment index X by one:
        this.REG_X = (this.REG_X + 1) & 0xFF;
        this.F_SIGN = (this.REG_X >> 7) & 1;
        this.F_ZERO = this.REG_X;
        break;
      case 26: // INY: Increment index Y by one:
        this.REG_Y++;
        this.REG_Y &= 0xFF;
        this.F_SIGN = (this.REG_Y >> 7) & 1;
        this.F_ZERO = this.REG_Y;
        break;
      case 27: // JMP: Jump to new location:
        this.REG_PC = addr - 1;
        break;
      case 28: // JSR: Jump to new location, saving return address. Push return address on stack:
        this.push((this.REG_PC >> 8) & 255);
        this.push(this.REG_PC & 255);
        this.REG_PC = addr - 1;
        break;
      case 29: // LDA: Load accumulator with memory:
        this.REG_ACC = this.load(addr);
        this.F_SIGN = (this.REG_ACC >> 7) & 1;
        this.F_ZERO = this.REG_ACC;
        cycleCount += cycleAdd;
        break;
      case 30: // LDX: Load index X with memory:
        this.REG_X = this.load(addr);
        this.F_SIGN = (this.REG_X >> 7) & 1;
        this.F_ZERO = this.REG_X;
        cycleCount += cycleAdd;
        break;
      case 31: // LDY: Load index Y with memory:
        this.REG_Y = this.load(addr);
        this.F_SIGN = (this.REG_Y >> 7) & 1;
        this.F_ZERO = this.REG_Y;
        cycleCount += cycleAdd;
        break;
      case 32: // LSR: Shift right one bit:
        if (addrMode == 4) { // ADDR_ACC
          temp = (this.REG_ACC & 0xFF);
          this.F_CARRY = temp & 1;
          temp >>= 1;
          this.REG_ACC = temp;
        } else {
          temp = this.load(addr) & 0xFF;
          this.F_CARRY = temp & 1;
          temp >>= 1;
          this.write(addr, temp);
        }
        this.F_SIGN = 0;
        this.F_ZERO = temp;
        break;
      case 33: // NOP: No OPeration. Ignore.
        break;
      case 34: // ORA: OR memory with accumulator, store in accumulator.
        temp = (this.load(addr) | this.REG_ACC) & 255;
        this.F_SIGN = (temp >> 7) & 1;
        this.F_ZERO = temp;
        this.REG_ACC = temp;
        if (addrMode != 11) cycleCount += cycleAdd; // PostIdxInd = 11
        break;
      case 35: // PHA: Push accumulator on stack
        this.push(this.REG_ACC);
        break;
      case 36: // PHP: Push processor status on stack
        this.F_BRK = 1;
        this.push(
          (this.F_CARRY) |
          ((this.F_ZERO == 0 ? 1 : 0) << 1) |
          (this.F_IRQDISABLE << 2) |
          (this.F_DECIMAL << 3) |
          (this.F_BRK << 4) |
          (this.F_NOTUSED << 5) |
          (this.F_OVERFLOW << 6) |
          (this.F_SIGN << 7)
        );
        break;
      case 37: // PLA: Pull accumulator from stack
        this.REG_ACC = this.pull();
        this.F_SIGN = (this.REG_ACC >> 7) & 1;
        this.F_ZERO = this.REG_ACC;
        break;
      case 38: // PLP: Pull processor status from stack
        temp = this.pull();
        this.F_CARRY = (temp) & 1;
        this.F_ZERO = (((temp >> 1) & 1) == 1) ? 0 : 1;
        this.F_IRQDISABLE = (temp >> 2) & 1;
        this.F_DECIMAL = (temp >> 3) & 1;
        this.F_BRK = (temp >> 4) & 1;
        this.F_NOTUSED = (temp >> 5) & 1;
        this.F_OVERFLOW = (temp >> 6) & 1;
        this.F_SIGN = (temp >> 7) & 1;
        this.F_NOTUSED = 1;
        break;
      case 39: // ROL: Rotate one bit left
        if (addrMode == 4) { // ADDR_ACC = 4
          temp = this.REG_ACC;
          add = this.F_CARRY;
          this.F_CARRY = (temp >> 7) & 1;
          temp = ((temp << 1) & 0xFF) + add;
          this.REG_ACC = temp;
        } else {
          temp = this.load(addr);
          add = this.F_CARRY;
          this.F_CARRY = (temp >> 7) & 1;
          temp = ((temp << 1) & 0xFF) + add;
          this.write(addr, temp);
        }
        this.F_SIGN = (temp >> 7) & 1;
        this.F_ZERO = temp;
        break;
      case 40: // ROR: Rotate one bit right
        if (addrMode == 4) { // ADDR_ACC = 4
          add = this.F_CARRY << 7;
          this.F_CARRY = this.REG_ACC & 1;
          temp = (this.REG_ACC >> 1) + add;
          this.REG_ACC = temp;
        } else {
          temp = this.load(addr);
          add = this.F_CARRY << 7;
          this.F_CARRY = temp & 1;
          temp = (temp >> 1) + add;
          this.write(addr, temp);
        }
        this.F_SIGN = (temp >> 7) & 1;
        this.F_ZERO = temp;
        break;
      case 41: // RTI: Return from interrupt. Pull status and PC from stack.
        temp = this.pull();
        this.F_CARRY = (temp) & 1;
        this.F_ZERO = ((temp >> 1) & 1) == 0 ? 1 : 0;
        this.F_IRQDISABLE = (temp >> 2) & 1;
        this.F_DECIMAL = (temp >> 3) & 1;
        this.F_BRK = (temp >> 4) & 1;
        this.F_NOTUSED = (temp >> 5) & 1;
        this.F_OVERFLOW = (temp >> 6) & 1;
        this.F_SIGN = (temp >> 7) & 1;
        this.REG_PC = this.pull();
        this.REG_PC += (this.pull() << 8);
        if (this.REG_PC == 0xFFFF) {
          return;
        }
        this.REG_PC--;
        this.F_NOTUSED = 1;
        break;
      case 42: // RTS: Return from subroutine. Pull PC from stack.
        this.REG_PC = this.pull();
        this.REG_PC += (this.pull() << 8);
        if (this.REG_PC == 0xFFFF) {
          return; // return from NSF play routine:
        }
        break;
      case 43: // SBC
        temp = this.REG_ACC - this.load(addr) - (1 - this.F_CARRY);
        this.F_SIGN = (temp >> 7) & 1;
        this.F_ZERO = temp & 0xFF;
        this.F_OVERFLOW = ((((this.REG_ACC ^ temp) & 0x80) != 0 && ((this.REG_ACC ^ this.load(addr)) & 0x80) != 0) ? 1 : 0);
        this.F_CARRY = (temp < 0 ? 0 : 1);
        this.REG_ACC = (temp & 0xFF);
        if (addrMode != 11) cycleCount += cycleAdd; // PostIdxInd = 11
        break;
      case 44: // SEC: Set carry flag
        this.F_CARRY = 1;
        break;
      case 45: // SED: Set decimal mode
        this.F_DECIMAL = 1;
        break;
      case 46: // SEI: Set interrupt disable status
        this.F_IRQDISABLE = 1;
        break;
      case 47: // STA: Store accumulator in memory
        this.write(addr, this.REG_ACC);
        break;
      case 48: // STX: Store index X in memory
        this.write(addr, this.REG_X);
        break;
      case 49: // STY: Store index Y in memory:
        this.write(addr, this.REG_Y);
        break;
      case 50: // TAX: Transfer accumulator to index X:
        this.REG_X = this.REG_ACC;
        this.F_SIGN = (this.REG_ACC >> 7) & 1;
        this.F_ZERO = this.REG_ACC;
        break;
      case 51: // TAY: Transfer accumulator to index Y:
        this.REG_Y = this.REG_ACC;
        this.F_SIGN = (this.REG_ACC >> 7) & 1;
        this.F_ZERO = this.REG_ACC;
        break;
      case 52: // TSX: Transfer stack pointer to index X:
        this.REG_X = (this.REG_SP - 0x0100);
        this.F_SIGN = (this.REG_SP >> 7) & 1;
        this.F_ZERO = this.REG_X;
        break;
      case 53: // TXA: Transfer index X to accumulator:
        this.REG_ACC = this.REG_X;
        this.F_SIGN = (this.REG_X >> 7) & 1;
        this.F_ZERO = this.REG_X;
        break;
      case 54: // TXS: Transfer index X to stack pointer:
        this.REG_SP = (this.REG_X + 0x0100);
        this.REG_SP = 0x0100 | (this.REG_SP & 0xFF);
        break;
      case 55: // TYA: Transfer index Y to accumulator:
        this.REG_ACC = this.REG_Y;
        this.F_SIGN = (this.REG_Y >> 7) & 1;
        this.F_ZERO = this.REG_Y;
        break;
      default: // ???
        this.nes.stop();
        this.nes.crashMessage = "Game crashed, invalid opcode at address $" + opaddr.toString(16);
        break;
    }
    return cycleCount;
  },

  load: function (addr) {
    if (addr < 0x2000) {
      return this.mem[addr & 0x7FF];
    } else {
      return this.nes.mmap.load(addr);
    }
  },

  load16bit: function (addr) {
    if (addr < 0x1FFF) {
      return this.mem[addr & 0x7FF] | (this.mem[(addr + 1) & 0x7FF] << 8);
    } else {
      return this.nes.mmap.load(addr) | (this.nes.mmap.load(addr + 1) << 8);
    }
  },

  write: function (addr, val) {
    if (addr < 0x2000) {
      this.mem[addr & 0x7FF] = val;
    } else {
      this.nes.mmap.write(addr, val);
    }
  },

  requestIrq: function (type) {
    if (this.irqRequested) {
      if (type == this.IRQ_NORMAL) {
        return;
      }
      // console.log("too fast irqs. type="+type);
    }
    this.irqRequested = true;
    this.irqType = type;
  },

  push: function (value) {
    this.nes.mmap.write(this.REG_SP, value);
    this.REG_SP--;
    this.REG_SP = 0x0100 | (this.REG_SP & 0xFF);
  },

  pull: function () {
    this.REG_SP++;
    this.REG_SP = 0x0100 | (this.REG_SP & 0xFF);
    return this.nes.mmap.load(this.REG_SP);
  },

  haltCycles: function (cycles) {
    this.cyclesToHalt += cycles;
  },

  doNonMaskableInterrupt: function (status) {
    if ((this.nes.mmap.load(0x2000) & 0x80) != 0) { // Check whether VBlank Interrupts are enabled
      this.REG_PC++;
      this.push((this.REG_PC >> 8) & 0xFF);
      this.push(this.REG_PC & 0xFF);
      //this.F_IRQDISABLE = 1;
      this.push(status);

      this.REG_PC = this.nes.mmap.load(0xFFFA) | (this.nes.mmap.load(0xFFFB) << 8);
      this.REG_PC--;
    }
  },

  doResetInterrupt: function () {
    this.REG_PC = this.nes.mmap.load(0xFFFC) | (this.nes.mmap.load(0xFFFD) << 8);
    this.REG_PC--;
  },

  doIrq: function (status) {
    this.REG_PC++;
    this.push((this.REG_PC >> 8) & 0xFF);
    this.push(this.REG_PC & 0xFF);
    this.push(status);
    this.F_IRQDISABLE = 1;
    this.F_BRK = 0;

    this.REG_PC = this.nes.mmap.load(0xFFFE) | (this.nes.mmap.load(0xFFFF) << 8);
    this.REG_PC--;
  },

  JSON_PROPERTIES: [
    'mem', 'cyclesToHalt', 'irqRequested', 'irqType',
    // Registers
    'REG_ACC', 'REG_X', 'REG_Y', 'REG_SP', 'REG_PC',
    // Status
    'F_CARRY', 'F_ZERO', 'F_IRQDISABLE', 'F_DECIMAL',
    'F_BRK', 'F_OVERFLOW', 'F_SIGN', 'F_NOTUSED'
  ],
  toJSON: function () {
    return JSNES.Utils.toJSON(this);
  },
  fromJSON: function (s) {
    JSNES.Utils.fromJSON(this, s);
  }
}

module.exports = CPU;
