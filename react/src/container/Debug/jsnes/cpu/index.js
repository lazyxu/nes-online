var utils = require("../utils");
var MEMORY = require("./memory");
var REGISTER = require("./register");
var INTERRUPT = require("./interrupt");
var OPCODE = require("./opcode");

var CPU = function (nes) {
  this.nes = nes;
  this.opcode = new OPCODE();
  this.mem = new MEMORY();
  this.reg = new REGISTER();
  this.irq = new INTERRUPT();
  this.reset();
};

CPU.prototype = {
  reset() {
    this.mem.reset();
    this.reg.reset();
    this.irq.reset();
    this.cyclesToHalt = 0;
  },

  // Emulates a single CPU instruction, returns the number of cycles
  // 模拟一个CPU指令，返回运行的周期数 1.检查中断 2.设置寻址方式 3.执行指令
  emulate: function () {
    var temp;
    var add;

    // Check interrupts:
    if (this.irq.requested) {
      temp =
        (this.reg.F_CARRY) |
        ((this.reg.F_ZERO === 0 ? 1 : 0) << 1) |
        (this.reg.F_IRQDISABLE << 2) |
        (this.reg.F_DECIMAL << 3) |
        (this.reg.F_BRK << 4) |
        (this.reg.F_NOTUSED << 5) |
        (this.reg.F_OVERFLOW << 6) |
        (this.reg.F_SIGN << 7);
      switch (this.irq.type) {
        case 0: // Normal IRQ:
          if (this.reg.F_IRQDISABLE != 0) {
            // console.log("Interrupt was masked.");
            break;
          }
          this.doIrq(temp);
          // console.log("Did normal IRQ. I="+this.reg.F_IRQDISABLE);
          break;
        case 1: // NMI:
          this.doNonMaskableInterrupt(temp);
          break;
        case 2: // Reset:
          this.doResetInterrupt();
          break;
      }
      this.irq.requested = false;
    }

    var opinf = this.opcode.table[this.nes.mmap.load(this.reg.PC + 1)];
    var cycleCount = (opinf >> 24);
    var cycleAdd = 0;

    // Find address mode:
    var addrMode = (opinf >> 8) & 0xFF;

    // Increment PC by number of op bytes:
    var opaddr = this.reg.PC;
    this.reg.PC += ((opinf >> 16) & 0xFF);

    var addr = 0;
    switch (addrMode) {
      case 0: // Zero Page mode. Use the address given after the opcode, but without high byte.
        addr = this.load(opaddr + 2);
        break;
      case 1: // Relative mode.
        addr = this.load(opaddr + 2);
        if (addr < 0x80) {
          addr += this.reg.PC;
        } else {
          addr += this.reg.PC - 256;
        }
        break;
      case 2: // Ignore. Address is implied in instruction.
        break;
      case 3: // Absolute mode. Use the two bytes following the opcode as an address.
        addr = this.load16bit(opaddr + 2);
        break;
      case 4: // Accumulator mode. The address is in the accumulator register.
        addr = this.reg.ACC;
        break;
      case 5: // Immediate mode. The value is given after the opcode.
        addr = this.reg.PC;
        break;
      case 6: // Zero Page Indexed mode, X as index. Use the address given after the opcode, then add the X register to it to get the final address.
        addr = (this.load(opaddr + 2) + this.reg.X) & 0xFF;
        break;
      case 7: // Zero Page Indexed mode, Y as index. Use the address given after the opcode, then add the Y register to it to get the final address.
        addr = (this.load(opaddr + 2) + this.reg.Y) & 0xFF;
        break;
      case 8: // Absolute Indexed Mode, X as index. Same as zero page indexed, but with the high byte.
        addr = this.load16bit(opaddr + 2);
        if ((addr & 0xFF00) != ((addr + this.reg.X) & 0xFF00)) {
          cycleAdd = 1;
        }
        addr += this.reg.X;
        break;
      case 9: // Absolute Indexed Mode, Y as index. Same as zero page indexed, but with the high byte.
        addr = this.load16bit(opaddr + 2);
        if ((addr & 0xFF00) != ((addr + this.reg.Y) & 0xFF00)) {
          cycleAdd = 1;
        }
        addr += this.reg.Y;
        break;
      case 10: // Pre-indexed Indirect mode. Find the 16-bit address starting at the given location plus the current X register. The value is the contents of that address.
        addr = this.load(opaddr + 2);
        if ((addr & 0xFF00) != ((addr + this.reg.X) & 0xFF00)) {
          cycleAdd = 1;
        }
        addr += this.reg.X;
        addr &= 0xFF;
        addr = this.load16bit(addr);
        break;
      case 11: // Post-indexed Indirect mode. Find the 16-bit address contained in the given location (and the one following). Add to that address the contents of the Y register. Fetch the value stored at that adress.
        addr = this.load16bit(this.load(opaddr + 2));
        if ((addr & 0xFF00) != ((addr + this.reg.Y) & 0xFF00)) {
          cycleAdd = 1;
        }
        addr += this.reg.Y;
        break;
      case 12: // Indirect Absolute mode. Find the 16-bit address contained at the given location.
        addr = this.load16bit(opaddr + 2);// Find op
        if (addr < 0x1FFF) {
          addr = this.mem.load(addr) + (this.mem.load((addr & 0xFF00) | (((addr & 0xFF) + 1) & 0xFF)) << 8);// Read from address given in op
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
        temp = this.reg.ACC + this.load(addr) + this.reg.F_CARRY;
        this.reg.F_OVERFLOW = ((!(((this.reg.ACC ^ this.load(addr)) & 0x80) != 0) && (((this.reg.ACC ^ temp) & 0x80)) != 0) ? 1 : 0);
        this.reg.F_CARRY = (temp > 255 ? 1 : 0);
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.F_ZERO = temp & 0xFF;
        this.reg.ACC = (temp & 255);
        cycleCount += cycleAdd;
        break;
      case 1: // AND: AND memory with accumulator.
        this.reg.ACC = this.reg.ACC & this.load(addr);
        this.reg.F_SIGN = (this.reg.ACC >> 7) & 1;
        this.reg.F_ZERO = this.reg.ACC;
        //this.reg.ACC = temp;
        if (addrMode != 11) cycleCount += cycleAdd; // PostIdxInd = 11
        break;
      case 2: // ASL: Shift left one bit
        if (addrMode == 4) { // ADDR_ACC = 4
          this.reg.F_CARRY = (this.reg.ACC >> 7) & 1;
          this.reg.ACC = (this.reg.ACC << 1) & 255;
          this.reg.F_SIGN = (this.reg.ACC >> 7) & 1;
          this.reg.F_ZERO = this.reg.ACC;
        } else {
          temp = this.load(addr);
          this.reg.F_CARRY = (temp >> 7) & 1;
          temp = (temp << 1) & 255;
          this.reg.F_SIGN = (temp >> 7) & 1;
          this.reg.F_ZERO = temp;
          this.write(addr, temp);
        }
        break;
      case 3: // BCC: Branch on carry clear
        if (this.reg.F_CARRY == 0) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.reg.PC = addr;
        }
        break;
      case 4: // BCS: Branch on carry set
        if (this.reg.F_CARRY == 1) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.reg.PC = addr;
        }
        break;
      case 5: // BEQ: Branch on zero
        if (this.reg.F_ZERO == 0) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.reg.PC = addr;
        }
        break;
      case 6: // BIT
        temp = this.load(addr);
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.F_OVERFLOW = (temp >> 6) & 1;
        temp &= this.reg.ACC;
        this.reg.F_ZERO = temp;
        break;
      case 7: // BMI: Branch on negative result
        if (this.reg.F_SIGN == 1) {
          cycleCount++;
          this.reg.PC = addr;
        }
        break;
      case 8: // BNE: Branch on not zero
        if (this.reg.F_ZERO != 0) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.reg.PC = addr;
        }
        break;
      case 9: // BPL: Branch on positive result
        if (this.reg.F_SIGN == 0) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.reg.PC = addr;
        }
        break;
      case 10: // BRK
        this.reg.PC += 2;
        this.push((this.reg.PC >> 8) & 255);
        this.push(this.reg.PC & 255);
        this.reg.F_BRK = 1;
        this.push(
          (this.reg.F_CARRY) |
          ((this.reg.F_ZERO == 0 ? 1 : 0) << 1) |
          (this.reg.F_IRQDISABLE << 2) |
          (this.reg.F_DECIMAL << 3) |
          (this.reg.F_BRK << 4) |
          (this.reg.F_NOTUSED << 5) |
          (this.reg.F_OVERFLOW << 6) |
          (this.reg.F_SIGN << 7)
        );
        this.reg.F_IRQDISABLE = 1;
        //this.reg.PC = load(0xFFFE) | (load(0xFFFF) << 8);
        this.reg.PC = this.load16bit(0xFFFE);
        this.reg.PC--;
        break;
      case 11: // BVC: Branch on overflow clear
        if (this.reg.F_OVERFLOW == 0) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.reg.PC = addr;
        }
        break;
      case 12: // BVS: Branch on overflow set
        if (this.reg.F_OVERFLOW == 1) {
          cycleCount += ((opaddr & 0xFF00) != (addr & 0xFF00) ? 2 : 1);
          this.reg.PC = addr;
        }
        break;
      case 13: // CLC: Clear carry flag
        this.reg.F_CARRY = 0;
        break;
      case 14: // CLD: Clear decimal flag
        this.reg.F_DECIMAL = 0;
        break;
      case 15: // CLI: Clear interrupt flag
        this.reg.F_IRQDISABLE = 0;
        break;
      case 16: // CLV: Clear overflow flag
        this.reg.F_OVERFLOW = 0;
        break;
      case 17: // CMP: Compare memory and accumulator:
        temp = this.reg.ACC - this.load(addr);
        this.reg.F_CARRY = (temp >= 0 ? 1 : 0);
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.F_ZERO = temp & 0xFF;
        cycleCount += cycleAdd;
        break;
      case 18: // CPX: Compare memory and index X:
        temp = this.reg.X - this.load(addr);
        this.reg.F_CARRY = (temp >= 0 ? 1 : 0);
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.F_ZERO = temp & 0xFF;
        break;
      case 19: // CPY: Compare memory and index Y:
        temp = this.reg.Y - this.load(addr);
        this.reg.F_CARRY = (temp >= 0 ? 1 : 0);
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.F_ZERO = temp & 0xFF;
        break;
      case 20: // DEC: Decrement memory by one:
        temp = (this.load(addr) - 1) & 0xFF;
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.F_ZERO = temp;
        this.write(addr, temp);
        break;
      case 21: // DEX: Decrement index X by one:
        this.reg.X = (this.reg.X - 1) & 0xFF;
        this.reg.F_SIGN = (this.reg.X >> 7) & 1;
        this.reg.F_ZERO = this.reg.X;
        break;
      case 22: // DEY: Decrement index Y by one:
        this.reg.Y = (this.reg.Y - 1) & 0xFF;
        this.reg.F_SIGN = (this.reg.Y >> 7) & 1;
        this.reg.F_ZERO = this.reg.Y;
        break;
      case 23: // EOR: XOR Memory with accumulator, store in accumulator:
        this.reg.ACC = (this.load(addr) ^ this.reg.ACC) & 0xFF;
        this.reg.F_SIGN = (this.reg.ACC >> 7) & 1;
        this.reg.F_ZERO = this.reg.ACC;
        cycleCount += cycleAdd;
        break;
      case 24: // INC: Increment memory by one:
        temp = (this.load(addr) + 1) & 0xFF;
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.F_ZERO = temp;
        this.write(addr, temp & 0xFF);
        break;
      case 25: // INX: Increment index X by one:
        this.reg.X = (this.reg.X + 1) & 0xFF;
        this.reg.F_SIGN = (this.reg.X >> 7) & 1;
        this.reg.F_ZERO = this.reg.X;
        break;
      case 26: // INY: Increment index Y by one:
        this.reg.Y++;
        this.reg.Y &= 0xFF;
        this.reg.F_SIGN = (this.reg.Y >> 7) & 1;
        this.reg.F_ZERO = this.reg.Y;
        break;
      case 27: // JMP: Jump to new location:
        this.reg.PC = addr - 1;
        break;
      case 28: // JSR: Jump to new location, saving return address. Push return address on stack:
        this.push((this.reg.PC >> 8) & 255);
        this.push(this.reg.PC & 255);
        this.reg.PC = addr - 1;
        break;
      case 29: // LDA: Load accumulator with memory:
        this.reg.ACC = this.load(addr);
        this.reg.F_SIGN = (this.reg.ACC >> 7) & 1;
        this.reg.F_ZERO = this.reg.ACC;
        cycleCount += cycleAdd;
        break;
      case 30: // LDX: Load index X with memory:
        this.reg.X = this.load(addr);
        this.reg.F_SIGN = (this.reg.X >> 7) & 1;
        this.reg.F_ZERO = this.reg.X;
        cycleCount += cycleAdd;
        break;
      case 31: // LDY: Load index Y with memory:
        this.reg.Y = this.load(addr);
        this.reg.F_SIGN = (this.reg.Y >> 7) & 1;
        this.reg.F_ZERO = this.reg.Y;
        cycleCount += cycleAdd;
        break;
      case 32: // LSR: Shift right one bit:
        if (addrMode == 4) { // ADDR_ACC
          temp = (this.reg.ACC & 0xFF);
          this.reg.F_CARRY = temp & 1;
          temp >>= 1;
          this.reg.ACC = temp;
        } else {
          temp = this.load(addr) & 0xFF;
          this.reg.F_CARRY = temp & 1;
          temp >>= 1;
          this.write(addr, temp);
        }
        this.reg.F_SIGN = 0;
        this.reg.F_ZERO = temp;
        break;
      case 33: // NOP: No OPeration. Ignore.
        break;
      case 34: // ORA: OR memory with accumulator, store in accumulator.
        temp = (this.load(addr) | this.reg.ACC) & 255;
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.F_ZERO = temp;
        this.reg.ACC = temp;
        if (addrMode != 11) cycleCount += cycleAdd; // PostIdxInd = 11
        break;
      case 35: // PHA: Push accumulator on stack
        this.push(this.reg.ACC);
        break;
      case 36: // PHP: Push processor status on stack
        this.reg.F_BRK = 1;
        this.push(
          (this.reg.F_CARRY) |
          ((this.reg.F_ZERO == 0 ? 1 : 0) << 1) |
          (this.reg.F_IRQDISABLE << 2) |
          (this.reg.F_DECIMAL << 3) |
          (this.reg.F_BRK << 4) |
          (this.reg.F_NOTUSED << 5) |
          (this.reg.F_OVERFLOW << 6) |
          (this.reg.F_SIGN << 7)
        );
        break;
      case 37: // PLA: Pull accumulator from stack
        this.reg.ACC = this.pull();
        this.reg.F_SIGN = (this.reg.ACC >> 7) & 1;
        this.reg.F_ZERO = this.reg.ACC;
        break;
      case 38: // PLP: Pull processor status from stack
        temp = this.pull();
        this.reg.F_CARRY = (temp) & 1;
        this.reg.F_ZERO = (((temp >> 1) & 1) == 1) ? 0 : 1;
        this.reg.F_IRQDISABLE = (temp >> 2) & 1;
        this.reg.F_DECIMAL = (temp >> 3) & 1;
        this.reg.F_BRK = (temp >> 4) & 1;
        this.reg.F_NOTUSED = (temp >> 5) & 1;
        this.reg.F_OVERFLOW = (temp >> 6) & 1;
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.F_NOTUSED = 1;
        break;
      case 39: // ROL: Rotate one bit left
        if (addrMode == 4) { // ADDR_ACC = 4
          temp = this.reg.ACC;
          add = this.reg.F_CARRY;
          this.reg.F_CARRY = (temp >> 7) & 1;
          temp = ((temp << 1) & 0xFF) + add;
          this.reg.ACC = temp;
        } else {
          temp = this.load(addr);
          add = this.reg.F_CARRY;
          this.reg.F_CARRY = (temp >> 7) & 1;
          temp = ((temp << 1) & 0xFF) + add;
          this.write(addr, temp);
        }
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.F_ZERO = temp;
        break;
      case 40: // ROR: Rotate one bit right
        if (addrMode == 4) { // ADDR_ACC = 4
          add = this.reg.F_CARRY << 7;
          this.reg.F_CARRY = this.reg.ACC & 1;
          temp = (this.reg.ACC >> 1) + add;
          this.reg.ACC = temp;
        } else {
          temp = this.load(addr);
          add = this.reg.F_CARRY << 7;
          this.reg.F_CARRY = temp & 1;
          temp = (temp >> 1) + add;
          this.write(addr, temp);
        }
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.F_ZERO = temp;
        break;
      case 41: // RTI: Return from interrupt. Pull status and PC from stack.
        temp = this.pull();
        this.reg.F_CARRY = (temp) & 1;
        this.reg.F_ZERO = ((temp >> 1) & 1) == 0 ? 1 : 0;
        this.reg.F_IRQDISABLE = (temp >> 2) & 1;
        this.reg.F_DECIMAL = (temp >> 3) & 1;
        this.reg.F_BRK = (temp >> 4) & 1;
        this.reg.F_NOTUSED = (temp >> 5) & 1;
        this.reg.F_OVERFLOW = (temp >> 6) & 1;
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.PC = this.pull();
        this.reg.PC += (this.pull() << 8);
        if (this.reg.PC == 0xFFFF) {
          return;
        }
        this.reg.PC--;
        this.reg.F_NOTUSED = 1;
        break;
      case 42: // RTS: Return from subroutine. Pull PC from stack.
        this.reg.PC = this.pull();
        this.reg.PC += (this.pull() << 8);
        if (this.reg.PC == 0xFFFF) {
          return; // return from NSF play routine:
        }
        break;
      case 43: // SBC
        temp = this.reg.ACC - this.load(addr) - (1 - this.reg.F_CARRY);
        this.reg.F_SIGN = (temp >> 7) & 1;
        this.reg.F_ZERO = temp & 0xFF;
        this.reg.F_OVERFLOW = ((((this.reg.ACC ^ temp) & 0x80) != 0 && ((this.reg.ACC ^ this.load(addr)) & 0x80) != 0) ? 1 : 0);
        this.reg.F_CARRY = (temp < 0 ? 0 : 1);
        this.reg.ACC = (temp & 0xFF);
        if (addrMode != 11) cycleCount += cycleAdd; // PostIdxInd = 11
        break;
      case 44: // SEC: Set carry flag
        this.reg.F_CARRY = 1;
        break;
      case 45: // SED: Set decimal mode
        this.reg.F_DECIMAL = 1;
        break;
      case 46: // SEI: Set interrupt disable status
        this.reg.F_IRQDISABLE = 1;
        break;
      case 47: // STA: Store accumulator in memory
        this.write(addr, this.reg.ACC);
        break;
      case 48: // STX: Store index X in memory
        this.write(addr, this.reg.X);
        break;
      case 49: // STY: Store index Y in memory:
        this.write(addr, this.reg.Y);
        break;
      case 50: // TAX: Transfer accumulator to index X:
        this.reg.X = this.reg.ACC;
        this.reg.F_SIGN = (this.reg.ACC >> 7) & 1;
        this.reg.F_ZERO = this.reg.ACC;
        break;
      case 51: // TAY: Transfer accumulator to index Y:
        this.reg.Y = this.reg.ACC;
        this.reg.F_SIGN = (this.reg.ACC >> 7) & 1;
        this.reg.F_ZERO = this.reg.ACC;
        break;
      case 52: // TSX: Transfer stack pointer to index X:
        this.reg.X = (this.reg.SP - 0x0100);
        this.reg.F_SIGN = (this.reg.SP >> 7) & 1;
        this.reg.F_ZERO = this.reg.X;
        break;
      case 53: // TXA: Transfer index X to accumulator:
        this.reg.ACC = this.reg.X;
        this.reg.F_SIGN = (this.reg.X >> 7) & 1;
        this.reg.F_ZERO = this.reg.X;
        break;
      case 54: // TXS: Transfer index X to stack pointer:
        this.reg.SP = (this.reg.X + 0x0100);
        this.reg.SP = 0x0100 | (this.reg.SP & 0xFF);
        break;
      case 55: // TYA: Transfer index Y to accumulator:
        this.reg.ACC = this.reg.Y;
        this.reg.F_SIGN = (this.reg.Y >> 7) & 1;
        this.reg.F_ZERO = this.reg.Y;
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
      return this.mem.load(addr & 0x7FF);
    } else {
      return this.nes.mmap.load(addr);
    }
  },

  load16bit: function (addr) {
    if (addr < 0x1FFF) {
      return this.mem.load(addr & 0x7FF) | (this.mem.load((addr + 1) & 0x7FF) << 8);
    } else {
      return this.nes.mmap.load(addr) | (this.nes.mmap.load(addr + 1) << 8);
    }
  },

  write: function (addr, val) {
    if (addr < 0x2000) {
      this.mem.write(addr & 0x7FF, val);
    } else {
      this.nes.mmap.write(addr, val);
    }
  },

  requestIrq: function (type) {
    if (this.irq.requested) {
      if (type == INTERRUPT.NORMAL) {
        return;
      }
      // console.log("too fast irqs. type="+type);
    }
    this.irq.requested = true;
    this.irq.type = type;
  },

  push: function (value) {
    this.nes.mmap.write(this.reg.SP, value);
    this.reg.SP--;
    this.reg.SP = 0x0100 | (this.reg.SP & 0xFF);
  },

  pull: function () {
    this.reg.SP++;
    this.reg.SP = 0x0100 | (this.reg.SP & 0xFF);
    return this.nes.mmap.load(this.reg.SP);
  },

  haltCycles: function (cycles) {
    this.cyclesToHalt += cycles;
  },

  doNonMaskableInterrupt: function (status) {
    if ((this.nes.mmap.load(0x2000) & 0x80) != 0) { // Check whether VBlank Interrupts are enabled
      this.reg.PC++;
      this.push((this.reg.PC >> 8) & 0xFF);
      this.push(this.reg.PC & 0xFF);
      //this.reg.F_IRQDISABLE = 1;
      this.push(status);

      this.reg.PC = this.nes.mmap.load(0xFFFA) | (this.nes.mmap.load(0xFFFB) << 8);
      this.reg.PC--;
    }
  },

  doResetInterrupt: function () {
    this.reg.PC = this.nes.mmap.load(0xFFFC) | (this.nes.mmap.load(0xFFFD) << 8);
    this.reg.PC--;
  },

  doIrq: function (status) {
    this.reg.PC++;
    this.push((this.reg.PC >> 8) & 0xFF);
    this.push(this.reg.PC & 0xFF);
    this.push(status);
    this.reg.F_IRQDISABLE = 1;
    this.reg.F_BRK = 0;

    this.reg.PC = this.nes.mmap.load(0xFFFE) | (this.nes.mmap.load(0xFFFF) << 8);
    this.reg.PC--;
  },

  JSON_PROPERTIES: [
    'mem', 'cyclesToHalt', 'irqRequested', 'irqType',
    // Registers
    'REGISTER_ACC', 'REGISTER_X', 'REGISTER_Y', 'REGISTER_SP', 'REGISTER_PC',
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
