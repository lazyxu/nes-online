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

JSNES.CPU = function(nes) {
    this.nes = nes;
    
    // Keep Chrome happy
    this.mem = null;
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
    this.opdata = null;
    this.cyclesToHalt = null;
    this.irqRequested = null;
    this.irqType = null;
    
    this.reset();
};

JSNES.CPU.prototype = {
    // IRQ Types
    IRQ_NORMAL: 0,
    IRQ_NMI: 1,
    IRQ_RESET: 2,
    
    reset: function() {
        // Main memory 
        this.mem = new Array(0x10000);
        
        for (var i=0; i < 0x2000; i++) {
            this.mem[i] = 0xFF;
        }
        for (var p=0; p < 4; p++) {
            var i = p*0x800;
            this.mem[i+0x008] = 0xF7;
            this.mem[i+0x009] = 0xEF;
            this.mem[i+0x00A] = 0xDF;
            this.mem[i+0x00F] = 0xBF;
        }
        for (var i=0x2001; i < this.mem.length; i++) {
            this.mem[i] = 0;
        }
        
        // CPU Registers:
        this.reg.A = 0;
        this.reg.X = 0;
        this.reg.Y = 0;
        this.reg.SP = 0x01FF;
        this.reg.PC = 0x8000-1;
        this.reg.flag.Canny = 0;
        this.reg.flag.Zero = 1;
        this.reg.flag.IRQDisable = 1;
        this.reg.flag.Decimal = 0;
        this.reg.flag.BreakFlag = 1;
        this.reg.flag.NotUsed = 1;
        this.reg.flag.Overflow = 0;
        this.reg.flag.Sign = 0;
        
        this.opdata = new JSNES.CPU.OpData().opdata;
        this.cyclesToHalt = 0;
        
        // Interrupt notification:
        this.irqRequested = false;
        this.irqType = null;

    },
    
    // Emulates a single CPU instruction, returns the number of cycles
    emulate: function() {
        var temp;
        var add;
        
        // Check interrupts:
        if(this.irqRequested){
            temp =
                (this.reg.flag.Canny)|
                ((this.reg.flag.Zero===0?1:0)<<1)|
                (this.reg.flag.IRQDisable<<2)|
                (this.reg.flag.Decimal<<3)|
                (this.reg.flag.BreakFlag<<4)|
                (this.reg.flag.NotUsed<<5)|
                (this.reg.flag.Overflow<<6)|
                (this.reg.flag.Sign<<7);

            switch(this.irqType){
                case 0:
                    // Normal IRQ:
                    if(this.reg.flag.IRQDisable!=0){
                        ////System.out.println("Interrupt was masked.");
                        break;
                    }
                    this.doIrq(temp);
                    ////System.out.println("Did normal IRQ. I="+this.reg.flag.IRQDisable);
                    break;
                case 1:
                    // NMI:
                    this.doNonMaskableInterrupt(temp);
                    break;

                case 2:
                    // Reset:
                    this.doResetInterrupt();
                    break;
            }

            this.irqRequested = false;
        }

        var opinf = this.opdata[this.nes.mmap.load(this.reg.PC+1)];
        var cycleCount = (opinf>>24);
        var cycleAdd = 0;

        // Find address mode:
        var addrMode = (opinf >> 8) & 0xFF;

        // Increment PC by number of op bytes:
        var opaddr = this.reg.PC;
        this.reg.PC += ((opinf >> 16) & 0xFF);
        
        var addr = 0;
        switch(addrMode) {
            case 0:
                // Zero Page mode. Use the address given after the opcode, 
                // but without high byte.
                addr = this.load(opaddr+2);
                break;

            case 1:
                // Relative mode.
                addr = this.load(opaddr+2);
                if(addr<0x80){
                    addr += this.reg.PC;
                }else{
                    addr += this.reg.PC-256;
                }
                break;
            case 2:
                // Ignore. Address is implied in instruction.
                break;
            case 3:
                // Absolute mode. Use the two bytes following the opcode as 
                // an address.
                addr = this.load16bit(opaddr+2);
                break;
            case 4:
                // Accumulator mode. The address is in the accumulator 
                // register.
                addr = this.reg.A;
                break;
            case 5:
                // Immediate mode. The value is given after the opcode.
                addr = this.reg.PC;
                break;
            case 6:
                // Zero Page Indexed mode, X as index. Use the address given 
                // after the opcode, then add the
                // X register to it to get the final address.
                addr = (this.load(opaddr+2)+this.reg.X)&0xFF;
                break;
            case 7:
                // Zero Page Indexed mode, Y as index. Use the address given 
                // after the opcode, then add the
                // Y register to it to get the final address.
                addr = (this.load(opaddr+2)+this.reg.Y)&0xFF;
                break;
            case 8:
                // Absolute Indexed Mode, X as index. Same as zero page 
                // indexed, but with the high byte.
                addr = this.load16bit(opaddr+2);
                if((addr&0xFF00)!=((addr+this.reg.X)&0xFF00)){
                    cycleAdd = 1; // Add one cycle if indexing crosses a page boundary
                }
                addr+=this.reg.X;
                break;
            case 9:
                // Absolute Indexed Mode, Y as index. Same as zero page 
                // indexed, but with the high byte.
                addr = this.load16bit(opaddr+2);
                if((addr&0xFF00)!=((addr+this.reg.Y)&0xFF00)){
                    cycleAdd = 1;
                }
                addr+=this.reg.Y;
                break;
            case 10:
                // Pre-indexed Indirect mode. Find the 16-bit address 
                // starting at the given location plus
                // the current X register. The value is the contents of that 
                // address.
                addr = this.load(opaddr+2);
                if((addr&0xFF00)!=((addr+this.reg.X)&0xFF00)){
                    cycleAdd = 1;
                }
                addr+=this.reg.X;
                addr&=0xFF;
                addr = this.load16bit(addr);
                break;
            case 11:
                // Post-indexed Indirect mode. Find the 16-bit address 
                // contained in the given location
                // (and the one following). Add to that address the contents 
                // of the Y register. Fetch the value
                // stored at that adress.
                addr = this.load16bit(this.load(opaddr+2));
                if((addr&0xFF00)!=((addr+this.reg.Y)&0xFF00)){
                    cycleAdd = 1;
                }
                addr+=this.reg.Y;
                break;
            case 12:
                // Indirect Absolute mode. Find the 16-bit address contained 
                // at the given location.
                addr = this.load16bit(opaddr+2);// Find op
                if(addr < 0x1FFF) {
                    addr = this.mem[addr] + (this.mem[(addr & 0xFF00) | (((addr & 0xFF) + 1) & 0xFF)] << 8);// Read from address given in op
                }
                else{
                    addr = this.nes.mmap.load(addr) + (this.nes.mmap.load((addr & 0xFF00) | (((addr & 0xFF) + 1) & 0xFF)) << 8);
                }
                break;
        }
        // Wrap around for addresses above 0xFFFF:
        addr&=0xFFFF;

        // ----------------------------------------------------------------------------------------------------
        // Decode & execute instruction:
        // ----------------------------------------------------------------------------------------------------

        // This should be compiled to a jump table.
        switch(opinf&0xFF) {
            case 0:
                // *******
                // * ADC *
                // *******

                // Add with carry.
                temp = this.reg.A + this.load(addr) + this.reg.flag.Canny;
                this.reg.flag.Overflow = ((!(((this.reg.A ^ this.load(addr)) & 0x80)!=0) && (((this.reg.A ^ temp) & 0x80))!=0)?1:0);
                this.reg.flag.Canny = (temp>255?1:0);
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp&0xFF;
                this.reg.A = (temp&255);
                cycleCount+=cycleAdd;
                break;

            case 1:
                // *******
                // * AND *
                // *******

                // AND memory with accumulator.
                this.reg.A = this.reg.A & this.load(addr);
                this.reg.flag.Sign = (this.reg.A>>7)&1;
                this.reg.flag.Zero = this.reg.A;
                //this.reg.A = temp;
                if(addrMode!=11)cycleCount+=cycleAdd; // PostIdxInd = 11
                break;
            case 2:
                // *******
                // * ASL *
                // *******

                // Shift left one bit
                if(addrMode == 4){ // ADDR_ACC = 4

                    this.reg.flag.Canny = (this.reg.A>>7)&1;
                    this.reg.A = (this.reg.A<<1)&255;
                    this.reg.flag.Sign = (this.reg.A>>7)&1;
                    this.reg.flag.Zero = this.reg.A;

                }else{

                    temp = this.load(addr);
                    this.reg.flag.Canny = (temp>>7)&1;
                    temp = (temp<<1)&255;
                    this.reg.flag.Sign = (temp>>7)&1;
                    this.reg.flag.Zero = temp;
                    this.write(addr, temp);

                }
                break;

            case 3:

                // *******
                // * BCC *
                // *******

                // Branch on carry clear
                if(this.reg.flag.Canny == 0){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case 4:

                // *******
                // * BCS *
                // *******

                // Branch on carry set
                if(this.reg.flag.Canny == 1){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case 5:

                // *******
                // * BEQ *
                // *******

                // Branch on zero
                if(this.reg.flag.Zero == 0){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case 6:

                // *******
                // * BIT *
                // *******

                temp = this.load(addr);
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Overflow = (temp>>6)&1;
                temp &= this.reg.A;
                this.reg.flag.Zero = temp;
                break;

            case 7:

                // *******
                // * BMI *
                // *******

                // Branch on negative result
                if(this.reg.flag.Sign == 1){
                    cycleCount++;
                    this.reg.PC = addr;
                }
                break;

            case 8:

                // *******
                // * BNE *
                // *******

                // Branch on not zero
                if(this.reg.flag.Zero != 0){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case 9:

                // *******
                // * BPL *
                // *******

                // Branch on positive result
                if(this.reg.flag.Sign == 0){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case 10:

                // *******
                // * BRK *
                // *******

                this.reg.PC+=2;
                this.push((this.reg.PC>>8)&255);
                this.push(this.reg.PC&255);
                this.reg.flag.BreakFlag = 1;

                this.push(
                    (this.reg.flag.Canny)|
                    ((this.reg.flag.Zero==0?1:0)<<1)|
                    (this.reg.flag.IRQDisable<<2)|
                    (this.reg.flag.Decimal<<3)|
                    (this.reg.flag.BreakFlag<<4)|
                    (this.reg.flag.NotUsed<<5)|
                    (this.reg.flag.Overflow<<6)|
                    (this.reg.flag.Sign<<7)
                );

                this.reg.flag.IRQDisable = 1;
                //this.reg.PC = load(0xFFFE) | (load(0xFFFF) << 8);
                this.reg.PC = this.load16bit(0xFFFE);
                this.reg.PC--;
                break;

            case 11:

                // *******
                // * BVC *
                // *******

                // Branch on overflow clear
                if(this.reg.flag.Overflow == 0){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case 12:

                // *******
                // * BVS *
                // *******

                // Branch on overflow set
                if(this.reg.flag.Overflow == 1){
                    cycleCount += ((opaddr&0xFF00)!=(addr&0xFF00)?2:1);
                    this.reg.PC = addr;
                }
                break;

            case 13:

                // *******
                // * CLC *
                // *******

                // Clear carry flag
                this.reg.flag.Canny = 0;
                break;

            case 14:

                // *******
                // * CLD *
                // *******

                // Clear decimal flag
                this.reg.flag.Decimal = 0;
                break;

            case 15:

                // *******
                // * CLI *
                // *******

                // Clear interrupt flag
                this.reg.flag.IRQDisable = 0;
                break;

            case 16:

                // *******
                // * CLV *
                // *******

                // Clear overflow flag
                this.reg.flag.Overflow = 0;
                break;

            case 17:

                // *******
                // * CMP *
                // *******

                // Compare memory and accumulator:
                temp = this.reg.A - this.load(addr);
                this.reg.flag.Canny = (temp>=0?1:0);
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp&0xFF;
                cycleCount+=cycleAdd;
                break;

            case 18:

                // *******
                // * CPX *
                // *******

                // Compare memory and index X:
                temp = this.reg.X - this.load(addr);
                this.reg.flag.Canny = (temp>=0?1:0);
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp&0xFF;
                break;

            case 19:

                // *******
                // * CPY *
                // *******

                // Compare memory and index Y:
                temp = this.reg.Y - this.load(addr);
                this.reg.flag.Canny = (temp>=0?1:0);
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp&0xFF;
                break;

            case 20:

                // *******
                // * DEC *
                // *******

                // Decrement memory by one:
                temp = (this.load(addr)-1)&0xFF;
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp;
                this.write(addr, temp);
                break;

            case 21:

                // *******
                // * DEX *
                // *******

                // Decrement index X by one:
                this.reg.X = (this.reg.X-1)&0xFF;
                this.reg.flag.Sign = (this.reg.X>>7)&1;
                this.reg.flag.Zero = this.reg.X;
                break;

            case 22:

                // *******
                // * DEY *
                // *******

                // Decrement index Y by one:
                this.reg.Y = (this.reg.Y-1)&0xFF;
                this.reg.flag.Sign = (this.reg.Y>>7)&1;
                this.reg.flag.Zero = this.reg.Y;
                break;

            case 23:

                // *******
                // * EOR *
                // *******

                // XOR Memory with accumulator, store in accumulator:
                this.reg.A = (this.load(addr)^this.reg.A)&0xFF;
                this.reg.flag.Sign = (this.reg.A>>7)&1;
                this.reg.flag.Zero = this.reg.A;
                cycleCount+=cycleAdd;
                break;

            case 24:

                // *******
                // * INC *
                // *******

                // Increment memory by one:
                temp = (this.load(addr)+1)&0xFF;
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp;
                this.write(addr, temp&0xFF);
                break;

            case 25:

                // *******
                // * INX *
                // *******

                // Increment index X by one:
                this.reg.X = (this.reg.X+1)&0xFF;
                this.reg.flag.Sign = (this.reg.X>>7)&1;
                this.reg.flag.Zero = this.reg.X;
                break;

            case 26:

                // *******
                // * INY *
                // *******

                // Increment index Y by one:
                this.reg.Y++;
                this.reg.Y &= 0xFF;
                this.reg.flag.Sign = (this.reg.Y>>7)&1;
                this.reg.flag.Zero = this.reg.Y;
                break;

            case 27:

                // *******
                // * JMP *
                // *******

                // Jump to new location:
                this.reg.PC = addr-1;
                break;

            case 28:

                // *******
                // * JSR *
                // *******

                // Jump to new location, saving return address.
                // Push return address on stack:
                this.push((this.reg.PC>>8)&255);
                this.push(this.reg.PC&255);
                this.reg.PC = addr-1;
                break;

            case 29:

                // *******
                // * LDA *
                // *******

                // Load accumulator with memory:
                this.reg.A = this.load(addr);
                this.reg.flag.Sign = (this.reg.A>>7)&1;
                this.reg.flag.Zero = this.reg.A;
                cycleCount+=cycleAdd;
                break;

            case 30:

                // *******
                // * LDX *
                // *******

                // Load index X with memory:
                this.reg.X = this.load(addr);
                this.reg.flag.Sign = (this.reg.X>>7)&1;
                this.reg.flag.Zero = this.reg.X;
                cycleCount+=cycleAdd;
                break;

            case 31:

                // *******
                // * LDY *
                // *******

                // Load index Y with memory:
                this.reg.Y = this.load(addr);
                this.reg.flag.Sign = (this.reg.Y>>7)&1;
                this.reg.flag.Zero = this.reg.Y;
                cycleCount+=cycleAdd;
                break;

            case 32:

                // *******
                // * LSR *
                // *******

                // Shift right one bit:
                if(addrMode == 4){ // ADDR_ACC

                    temp = (this.reg.A & 0xFF);
                    this.reg.flag.Canny = temp&1;
                    temp >>= 1;
                    this.reg.A = temp;

                }else{

                    temp = this.load(addr) & 0xFF;
                    this.reg.flag.Canny = temp&1;
                    temp >>= 1;
                    this.write(addr, temp);

                }
                this.reg.flag.Sign = 0;
                this.reg.flag.Zero = temp;
                break;

            case 33:

                // *******
                // * NOP *
                // *******

                // No OPeration.
                // Ignore.
                break;

            case 34:

                // *******
                // * ORA *
                // *******

                // OR memory with accumulator, store in accumulator.
                temp = (this.load(addr)|this.reg.A)&255;
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp;
                this.reg.A = temp;
                if(addrMode!=11)cycleCount+=cycleAdd; // PostIdxInd = 11
                break;

            case 35:

                // *******
                // * PHA *
                // *******

                // Push accumulator on stack
                this.push(this.reg.A);
                break;

            case 36:

                // *******
                // * PHP *
                // *******

                // Push processor status on stack
                this.reg.flag.BreakFlag = 1;
                this.push(
                    (this.reg.flag.Canny)|
                    ((this.reg.flag.Zero==0?1:0)<<1)|
                    (this.reg.flag.IRQDisable<<2)|
                    (this.reg.flag.Decimal<<3)|
                    (this.reg.flag.BreakFlag<<4)|
                    (this.reg.flag.NotUsed<<5)|
                    (this.reg.flag.Overflow<<6)|
                    (this.reg.flag.Sign<<7)
                );
                break;

            case 37:

                // *******
                // * PLA *
                // *******

                // Pull accumulator from stack
                this.reg.A = this.pull();
                this.reg.flag.Sign = (this.reg.A>>7)&1;
                this.reg.flag.Zero = this.reg.A;
                break;

            case 38:

                // *******
                // * PLP *
                // *******

                // Pull processor status from stack
                temp = this.pull();
                this.reg.flag.Canny     = (temp   )&1;
                this.reg.flag.Zero      = (((temp>>1)&1)==1)?0:1;
                this.reg.flag.IRQDisable = (temp>>2)&1;
                this.reg.flag.Decimal   = (temp>>3)&1;
                this.reg.flag.BreakFlag       = (temp>>4)&1;
                this.reg.flag.NotUsed   = (temp>>5)&1;
                this.reg.flag.Overflow  = (temp>>6)&1;
                this.reg.flag.Sign      = (temp>>7)&1;

                this.reg.flag.NotUsed = 1;
                break;

            case 39:

                // *******
                // * ROL *
                // *******

                // Rotate one bit left
                if(addrMode == 4){ // ADDR_ACC = 4

                    temp = this.reg.A;
                    add = this.reg.flag.Canny;
                    this.reg.flag.Canny = (temp>>7)&1;
                    temp = ((temp<<1)&0xFF)+add;
                    this.reg.A = temp;

                }else{

                    temp = this.load(addr);
                    add = this.reg.flag.Canny;
                    this.reg.flag.Canny = (temp>>7)&1;
                    temp = ((temp<<1)&0xFF)+add;    
                    this.write(addr, temp);

                }
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp;
                break;

            case 40:

                // *******
                // * ROR *
                // *******

                // Rotate one bit right
                if(addrMode == 4){ // ADDR_ACC = 4

                    add = this.reg.flag.Canny<<7;
                    this.reg.flag.Canny = this.reg.A&1;
                    temp = (this.reg.A>>1)+add;   
                    this.reg.A = temp;

                }else{

                    temp = this.load(addr);
                    add = this.reg.flag.Canny<<7;
                    this.reg.flag.Canny = temp&1;
                    temp = (temp>>1)+add;
                    this.write(addr, temp);

                }
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp;
                break;

            case 41:

                // *******
                // * RTI *
                // *******

                // Return from interrupt. Pull status and PC from stack.
                
                temp = this.pull();
                this.reg.flag.Canny     = (temp   )&1;
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

            case 42:

                // *******
                // * RTS *
                // *******

                // Return from subroutine. Pull PC from stack.
                
                this.reg.PC = this.pull();
                this.reg.PC += (this.pull()<<8);
                
                if(this.reg.PC==0xFFFF){
                    return; // return from NSF play routine:
                }
                break;

            case 43:

                // *******
                // * SBC *
                // *******

                temp = this.reg.A-this.load(addr)-(1-this.reg.flag.Canny);
                this.reg.flag.Sign = (temp>>7)&1;
                this.reg.flag.Zero = temp&0xFF;
                this.reg.flag.Overflow = ((((this.reg.A^temp)&0x80)!=0 && ((this.reg.A^this.load(addr))&0x80)!=0)?1:0);
                this.reg.flag.Canny = (temp<0?0:1);
                this.reg.A = (temp&0xFF);
                if(addrMode!=11)cycleCount+=cycleAdd; // PostIdxInd = 11
                break;

            case 44:

                // *******
                // * SEC *
                // *******

                // Set carry flag
                this.reg.flag.Canny = 1;
                break;

            case 45:

                // *******
                // * SED *
                // *******

                // Set decimal mode
                this.reg.flag.Decimal = 1;
                break;

            case 46:

                // *******
                // * SEI *
                // *******

                // Set interrupt disable status
                this.reg.flag.IRQDisable = 1;
                break;

            case 47:

                // *******
                // * STA *
                // *******

                // Store accumulator in memory
                this.write(addr, this.reg.A);
                break;

            case 48:

                // *******
                // * STX *
                // *******

                // Store index X in memory
                this.write(addr, this.reg.X);
                break;

            case 49:

                // *******
                // * STY *
                // *******

                // Store index Y in memory:
                this.write(addr, this.reg.Y);
                break;

            case 50:

                // *******
                // * TAX *
                // *******

                // Transfer accumulator to index X:
                this.reg.X = this.reg.A;
                this.reg.flag.Sign = (this.reg.A>>7)&1;
                this.reg.flag.Zero = this.reg.A;
                break;

            case 51:

                // *******
                // * TAY *
                // *******

                // Transfer accumulator to index Y:
                this.reg.Y = this.reg.A;
                this.reg.flag.Sign = (this.reg.A>>7)&1;
                this.reg.flag.Zero = this.reg.A;
                break;

            case 52:

                // *******
                // * TSX *
                // *******

                // Transfer stack pointer to index X:
                this.reg.X = (this.reg.SP-0x0100);
                this.reg.flag.Sign = (this.reg.SP>>7)&1;
                this.reg.flag.Zero = this.reg.X;
                break;

            case 53:

                // *******
                // * TXA *
                // *******

                // Transfer index X to accumulator:
                this.reg.A = this.reg.X;
                this.reg.flag.Sign = (this.reg.X>>7)&1;
                this.reg.flag.Zero = this.reg.X;
                break;

            case 54:

                // *******
                // * TXS *
                // *******

                // Transfer index X to stack pointer:
                this.reg.SP = (this.reg.X+0x0100);
                this.stackWrap();
                break;

            case 55:

                // *******
                // * TYA *
                // *******

                // Transfer index Y to accumulator:
                this.reg.A = this.reg.Y;
                this.reg.flag.Sign = (this.reg.Y>>7)&1;
                this.reg.flag.Zero = this.reg.Y;
                break;

            default:

                // *******
                // * ??? *
                // *******

                this.nes.stop();
                // this.nes.crashMessage = "Game crashed, invalid opcode at address $"+opaddr.toString(16);
                // document.getElementById("crashed").innerHTML = true;
                break;

        }// end of switch

        return cycleCount;

    },
    
    load: function(addr){
        if (addr < 0x2000) {
            return this.mem[addr & 0x7FF];
        }
        else {
            return this.nes.mmap.load(addr);
        }
    },
    
    load16bit: function(addr){
        if (addr < 0x1FFF) {
            return this.mem[addr&0x7FF] 
                | (this.mem[(addr+1)&0x7FF]<<8);
        }
        else {
            return this.nes.mmap.load(addr) | (this.nes.mmap.load(addr+1) << 8);
        }
    },
    
    write: function(addr, val){
        if(addr < 0x2000) {
            this.mem[addr&0x7FF] = val;
        }
        else {
            this.nes.mmap.write(addr,val);
        }
    },

    requestIrq: function(type){
        if(this.irqRequested){
            if(type == this.IRQ_NORMAL){
                return;
            }
            ////System.out.println("too fast irqs. type="+type);
        }
        this.irqRequested = true;
        this.irqType = type;
    },

    push: function(value){
        this.nes.mmap.write(this.reg.SP, value);
        this.reg.SP--;
        this.reg.SP = 0x0100 | (this.reg.SP&0xFF);
    },

    stackWrap: function(){
        this.reg.SP = 0x0100 | (this.reg.SP&0xFF);
    },

    pull: function(){
        this.reg.SP++;
        this.reg.SP = 0x0100 | (this.reg.SP&0xFF);
        return this.nes.mmap.load(this.reg.SP);
    },

    pageCrossed: function(addr1, addr2){
        return ((addr1&0xFF00) != (addr2&0xFF00));
    },

    haltCycles: function(cycles){
        this.cyclesToHalt += cycles;
    },

    doNonMaskableInterrupt: function(status){
        if((this.nes.mmap.load(0x2000) & 128) != 0) { // Check whether VBlank Interrupts are enabled

            this.reg.PC++;
            this.push((this.reg.PC>>8)&0xFF);
            this.push(this.reg.PC&0xFF);
            //this.reg.flag.IRQDisable = 1;
            this.push(status);

            this.reg.PC = this.nes.mmap.load(0xFFFA) | (this.nes.mmap.load(0xFFFB) << 8);
            this.reg.PC--;
        }
    },

    doResetInterrupt: function(){
        this.reg.PC = this.nes.mmap.load(0xFFFC) | (this.nes.mmap.load(0xFFFD) << 8);
        this.reg.PC--;
    },

    doIrq: function(status){
        this.reg.PC++;
        this.push((this.reg.PC>>8)&0xFF);
        this.push(this.reg.PC&0xFF);
        this.push(status);
        this.reg.flag.IRQDisable = 1;
        this.reg.flag.BreakFlag = 0;

        this.reg.PC = this.nes.mmap.load(0xFFFE) | (this.nes.mmap.load(0xFFFF) << 8);
        this.reg.PC--;
    },

    getStatus: function(){
        return (this.reg.flag.Canny)
                |(this.reg.flag.Zero<<1)
                |(this.reg.flag.IRQDisable<<2)
                |(this.reg.flag.Decimal<<3)
                |(this.reg.flag.BreakFlag<<4)
                |(this.reg.flag.NotUsed<<5)
                |(this.reg.flag.Overflow<<6)
                |(this.reg.flag.Sign<<7);
    },
    
    JSON_PROPERTIES: [
        'mem', 'cyclesToHalt', 'irqRequested', 'irqType', 'reg',
    ],
    
    toJSON: function() {
        return JSNES.Utils.toJSON(this);
    },
    
    fromJSON: function(s) {
        JSNES.Utils.fromJSON(this, s);
    }
}

// Generates and provides an array of details about instructions
JSNES.CPU.OpData = function() {
    this.opdata = new Array(256);
    
    // Set all to invalid instruction (to detect crashes):
    for(var i=0;i<256;i++) this.opdata[i]=0xFF;
    
    // Now fill in all valid opcodes:
    
    // ADC:
    this.setOp(this.INS_ADC,0x69,this.ADDR_IMM,2,2);
    this.setOp(this.INS_ADC,0x65,this.ADDR_ZP,2,3);
    this.setOp(this.INS_ADC,0x75,this.ADDR_ZPX,2,4);
    this.setOp(this.INS_ADC,0x6D,this.ADDR_ABS,3,4);
    this.setOp(this.INS_ADC,0x7D,this.ADDR_ABSX,3,4);
    this.setOp(this.INS_ADC,0x79,this.ADDR_ABSY,3,4);
    this.setOp(this.INS_ADC,0x61,this.ADDR_PREIDXIND,2,6);
    this.setOp(this.INS_ADC,0x71,this.ADDR_POSTIDXIND,2,5);
    
    // AND:
    this.setOp(this.INS_AND,0x29,this.ADDR_IMM,2,2);
    this.setOp(this.INS_AND,0x25,this.ADDR_ZP,2,3);
    this.setOp(this.INS_AND,0x35,this.ADDR_ZPX,2,4);
    this.setOp(this.INS_AND,0x2D,this.ADDR_ABS,3,4);
    this.setOp(this.INS_AND,0x3D,this.ADDR_ABSX,3,4);
    this.setOp(this.INS_AND,0x39,this.ADDR_ABSY,3,4);
    this.setOp(this.INS_AND,0x21,this.ADDR_PREIDXIND,2,6);
    this.setOp(this.INS_AND,0x31,this.ADDR_POSTIDXIND,2,5);
    
    // ASL:
    this.setOp(this.INS_ASL,0x0A,this.ADDR_ACC,1,2);
    this.setOp(this.INS_ASL,0x06,this.ADDR_ZP,2,5);
    this.setOp(this.INS_ASL,0x16,this.ADDR_ZPX,2,6);
    this.setOp(this.INS_ASL,0x0E,this.ADDR_ABS,3,6);
    this.setOp(this.INS_ASL,0x1E,this.ADDR_ABSX,3,7);
    
    // BCC:
    this.setOp(this.INS_BCC,0x90,this.ADDR_REL,2,2);
    
    // BCS:
    this.setOp(this.INS_BCS,0xB0,this.ADDR_REL,2,2);
    
    // BEQ:
    this.setOp(this.INS_BEQ,0xF0,this.ADDR_REL,2,2);
    
    // BIT:
    this.setOp(this.INS_BIT,0x24,this.ADDR_ZP,2,3);
    this.setOp(this.INS_BIT,0x2C,this.ADDR_ABS,3,4);
    
    // BMI:
    this.setOp(this.INS_BMI,0x30,this.ADDR_REL,2,2);
    
    // BNE:
    this.setOp(this.INS_BNE,0xD0,this.ADDR_REL,2,2);
    
    // BPL:
    this.setOp(this.INS_BPL,0x10,this.ADDR_REL,2,2);
    
    // BRK:
    this.setOp(this.INS_BRK,0x00,this.ADDR_IMP,1,7);
    
    // BVC:
    this.setOp(this.INS_BVC,0x50,this.ADDR_REL,2,2);
    
    // BVS:
    this.setOp(this.INS_BVS,0x70,this.ADDR_REL,2,2);
    
    // CLC:
    this.setOp(this.INS_CLC,0x18,this.ADDR_IMP,1,2);
    
    // CLD:
    this.setOp(this.INS_CLD,0xD8,this.ADDR_IMP,1,2);
    
    // CLI:
    this.setOp(this.INS_CLI,0x58,this.ADDR_IMP,1,2);
    
    // CLV:
    this.setOp(this.INS_CLV,0xB8,this.ADDR_IMP,1,2);
    
    // CMP:
    this.setOp(this.INS_CMP,0xC9,this.ADDR_IMM,2,2);
    this.setOp(this.INS_CMP,0xC5,this.ADDR_ZP,2,3);
    this.setOp(this.INS_CMP,0xD5,this.ADDR_ZPX,2,4);
    this.setOp(this.INS_CMP,0xCD,this.ADDR_ABS,3,4);
    this.setOp(this.INS_CMP,0xDD,this.ADDR_ABSX,3,4);
    this.setOp(this.INS_CMP,0xD9,this.ADDR_ABSY,3,4);
    this.setOp(this.INS_CMP,0xC1,this.ADDR_PREIDXIND,2,6);
    this.setOp(this.INS_CMP,0xD1,this.ADDR_POSTIDXIND,2,5);
    
    // CPX:
    this.setOp(this.INS_CPX,0xE0,this.ADDR_IMM,2,2);
    this.setOp(this.INS_CPX,0xE4,this.ADDR_ZP,2,3);
    this.setOp(this.INS_CPX,0xEC,this.ADDR_ABS,3,4);
    
    // CPY:
    this.setOp(this.INS_CPY,0xC0,this.ADDR_IMM,2,2);
    this.setOp(this.INS_CPY,0xC4,this.ADDR_ZP,2,3);
    this.setOp(this.INS_CPY,0xCC,this.ADDR_ABS,3,4);
    
    // DEC:
    this.setOp(this.INS_DEC,0xC6,this.ADDR_ZP,2,5);
    this.setOp(this.INS_DEC,0xD6,this.ADDR_ZPX,2,6);
    this.setOp(this.INS_DEC,0xCE,this.ADDR_ABS,3,6);
    this.setOp(this.INS_DEC,0xDE,this.ADDR_ABSX,3,7);
    
    // DEX:
    this.setOp(this.INS_DEX,0xCA,this.ADDR_IMP,1,2);
    
    // DEY:
    this.setOp(this.INS_DEY,0x88,this.ADDR_IMP,1,2);
    
    // EOR:
    this.setOp(this.INS_EOR,0x49,this.ADDR_IMM,2,2);
    this.setOp(this.INS_EOR,0x45,this.ADDR_ZP,2,3);
    this.setOp(this.INS_EOR,0x55,this.ADDR_ZPX,2,4);
    this.setOp(this.INS_EOR,0x4D,this.ADDR_ABS,3,4);
    this.setOp(this.INS_EOR,0x5D,this.ADDR_ABSX,3,4);
    this.setOp(this.INS_EOR,0x59,this.ADDR_ABSY,3,4);
    this.setOp(this.INS_EOR,0x41,this.ADDR_PREIDXIND,2,6);
    this.setOp(this.INS_EOR,0x51,this.ADDR_POSTIDXIND,2,5);
    
    // INC:
    this.setOp(this.INS_INC,0xE6,this.ADDR_ZP,2,5);
    this.setOp(this.INS_INC,0xF6,this.ADDR_ZPX,2,6);
    this.setOp(this.INS_INC,0xEE,this.ADDR_ABS,3,6);
    this.setOp(this.INS_INC,0xFE,this.ADDR_ABSX,3,7);
    
    // INX:
    this.setOp(this.INS_INX,0xE8,this.ADDR_IMP,1,2);
    
    // INY:
    this.setOp(this.INS_INY,0xC8,this.ADDR_IMP,1,2);
    
    // JMP:
    this.setOp(this.INS_JMP,0x4C,this.ADDR_ABS,3,3);
    this.setOp(this.INS_JMP,0x6C,this.ADDR_INDABS,3,5);
    
    // JSR:
    this.setOp(this.INS_JSR,0x20,this.ADDR_ABS,3,6);
    
    // LDA:
    this.setOp(this.INS_LDA,0xA9,this.ADDR_IMM,2,2);
    this.setOp(this.INS_LDA,0xA5,this.ADDR_ZP,2,3);
    this.setOp(this.INS_LDA,0xB5,this.ADDR_ZPX,2,4);
    this.setOp(this.INS_LDA,0xAD,this.ADDR_ABS,3,4);
    this.setOp(this.INS_LDA,0xBD,this.ADDR_ABSX,3,4);
    this.setOp(this.INS_LDA,0xB9,this.ADDR_ABSY,3,4);
    this.setOp(this.INS_LDA,0xA1,this.ADDR_PREIDXIND,2,6);
    this.setOp(this.INS_LDA,0xB1,this.ADDR_POSTIDXIND,2,5);
    
    
    // LDX:
    this.setOp(this.INS_LDX,0xA2,this.ADDR_IMM,2,2);
    this.setOp(this.INS_LDX,0xA6,this.ADDR_ZP,2,3);
    this.setOp(this.INS_LDX,0xB6,this.ADDR_ZPY,2,4);
    this.setOp(this.INS_LDX,0xAE,this.ADDR_ABS,3,4);
    this.setOp(this.INS_LDX,0xBE,this.ADDR_ABSY,3,4);
    
    // LDY:
    this.setOp(this.INS_LDY,0xA0,this.ADDR_IMM,2,2);
    this.setOp(this.INS_LDY,0xA4,this.ADDR_ZP,2,3);
    this.setOp(this.INS_LDY,0xB4,this.ADDR_ZPX,2,4);
    this.setOp(this.INS_LDY,0xAC,this.ADDR_ABS,3,4);
    this.setOp(this.INS_LDY,0xBC,this.ADDR_ABSX,3,4);
    
    // LSR:
    this.setOp(this.INS_LSR,0x4A,this.ADDR_ACC,1,2);
    this.setOp(this.INS_LSR,0x46,this.ADDR_ZP,2,5);
    this.setOp(this.INS_LSR,0x56,this.ADDR_ZPX,2,6);
    this.setOp(this.INS_LSR,0x4E,this.ADDR_ABS,3,6);
    this.setOp(this.INS_LSR,0x5E,this.ADDR_ABSX,3,7);
    
    // NOP:
    this.setOp(this.INS_NOP,0xEA,this.ADDR_IMP,1,2);
    
    // ORA:
    this.setOp(this.INS_ORA,0x09,this.ADDR_IMM,2,2);
    this.setOp(this.INS_ORA,0x05,this.ADDR_ZP,2,3);
    this.setOp(this.INS_ORA,0x15,this.ADDR_ZPX,2,4);
    this.setOp(this.INS_ORA,0x0D,this.ADDR_ABS,3,4);
    this.setOp(this.INS_ORA,0x1D,this.ADDR_ABSX,3,4);
    this.setOp(this.INS_ORA,0x19,this.ADDR_ABSY,3,4);
    this.setOp(this.INS_ORA,0x01,this.ADDR_PREIDXIND,2,6);
    this.setOp(this.INS_ORA,0x11,this.ADDR_POSTIDXIND,2,5);
    
    // PHA:
    this.setOp(this.INS_PHA,0x48,this.ADDR_IMP,1,3);
    
    // PHP:
    this.setOp(this.INS_PHP,0x08,this.ADDR_IMP,1,3);
    
    // PLA:
    this.setOp(this.INS_PLA,0x68,this.ADDR_IMP,1,4);
    
    // PLP:
    this.setOp(this.INS_PLP,0x28,this.ADDR_IMP,1,4);
    
    // ROL:
    this.setOp(this.INS_ROL,0x2A,this.ADDR_ACC,1,2);
    this.setOp(this.INS_ROL,0x26,this.ADDR_ZP,2,5);
    this.setOp(this.INS_ROL,0x36,this.ADDR_ZPX,2,6);
    this.setOp(this.INS_ROL,0x2E,this.ADDR_ABS,3,6);
    this.setOp(this.INS_ROL,0x3E,this.ADDR_ABSX,3,7);
    
    // ROR:
    this.setOp(this.INS_ROR,0x6A,this.ADDR_ACC,1,2);
    this.setOp(this.INS_ROR,0x66,this.ADDR_ZP,2,5);
    this.setOp(this.INS_ROR,0x76,this.ADDR_ZPX,2,6);
    this.setOp(this.INS_ROR,0x6E,this.ADDR_ABS,3,6);
    this.setOp(this.INS_ROR,0x7E,this.ADDR_ABSX,3,7);
    
    // RTI:
    this.setOp(this.INS_RTI,0x40,this.ADDR_IMP,1,6);
    
    // RTS:
    this.setOp(this.INS_RTS,0x60,this.ADDR_IMP,1,6);
    
    // SBC:
    this.setOp(this.INS_SBC,0xE9,this.ADDR_IMM,2,2);
    this.setOp(this.INS_SBC,0xE5,this.ADDR_ZP,2,3);
    this.setOp(this.INS_SBC,0xF5,this.ADDR_ZPX,2,4);
    this.setOp(this.INS_SBC,0xED,this.ADDR_ABS,3,4);
    this.setOp(this.INS_SBC,0xFD,this.ADDR_ABSX,3,4);
    this.setOp(this.INS_SBC,0xF9,this.ADDR_ABSY,3,4);
    this.setOp(this.INS_SBC,0xE1,this.ADDR_PREIDXIND,2,6);
    this.setOp(this.INS_SBC,0xF1,this.ADDR_POSTIDXIND,2,5);
    
    // SEC:
    this.setOp(this.INS_SEC,0x38,this.ADDR_IMP,1,2);
    
    // SED:
    this.setOp(this.INS_SED,0xF8,this.ADDR_IMP,1,2);
    
    // SEI:
    this.setOp(this.INS_SEI,0x78,this.ADDR_IMP,1,2);
    
    // STA:
    this.setOp(this.INS_STA,0x85,this.ADDR_ZP,2,3);
    this.setOp(this.INS_STA,0x95,this.ADDR_ZPX,2,4);
    this.setOp(this.INS_STA,0x8D,this.ADDR_ABS,3,4);
    this.setOp(this.INS_STA,0x9D,this.ADDR_ABSX,3,5);
    this.setOp(this.INS_STA,0x99,this.ADDR_ABSY,3,5);
    this.setOp(this.INS_STA,0x81,this.ADDR_PREIDXIND,2,6);
    this.setOp(this.INS_STA,0x91,this.ADDR_POSTIDXIND,2,6);
    
    // STX:
    this.setOp(this.INS_STX,0x86,this.ADDR_ZP,2,3);
    this.setOp(this.INS_STX,0x96,this.ADDR_ZPY,2,4);
    this.setOp(this.INS_STX,0x8E,this.ADDR_ABS,3,4);
    
    // STY:
    this.setOp(this.INS_STY,0x84,this.ADDR_ZP,2,3);
    this.setOp(this.INS_STY,0x94,this.ADDR_ZPX,2,4);
    this.setOp(this.INS_STY,0x8C,this.ADDR_ABS,3,4);
    
    // TAX:
    this.setOp(this.INS_TAX,0xAA,this.ADDR_IMP,1,2);
    
    // TAY:
    this.setOp(this.INS_TAY,0xA8,this.ADDR_IMP,1,2);
    
    // TSX:
    this.setOp(this.INS_TSX,0xBA,this.ADDR_IMP,1,2);
    
    // TXA:
    this.setOp(this.INS_TXA,0x8A,this.ADDR_IMP,1,2);
    
    // TXS:
    this.setOp(this.INS_TXS,0x9A,this.ADDR_IMP,1,2);
    
    // TYA:
    this.setOp(this.INS_TYA,0x98,this.ADDR_IMP,1,2);
}

JSNES.CPU.OpData.prototype = {
    INS_ADC: 0,
    INS_AND: 1,
    INS_ASL: 2,
    
    INS_BCC: 3,
    INS_BCS: 4,
    INS_BEQ: 5,
    INS_BIT: 6,
    INS_BMI: 7,
    INS_BNE: 8,
    INS_BPL: 9,
    INS_BRK: 10,
    INS_BVC: 11,
    INS_BVS: 12,
    
    INS_CLC: 13,
    INS_CLD: 14,
    INS_CLI: 15,
    INS_CLV: 16,
    INS_CMP: 17,
    INS_CPX: 18,
    INS_CPY: 19,
    
    INS_DEC: 20,
    INS_DEX: 21,
    INS_DEY: 22,
    
    INS_EOR: 23,
    
    INS_INC: 24,
    INS_INX: 25,
    INS_INY: 26,
    
    INS_JMP: 27,
    INS_JSR: 28,
    
    INS_LDA: 29,
    INS_LDX: 30,
    INS_LDY: 31,
    INS_LSR: 32,
    
    INS_NOP: 33,
    
    INS_ORA: 34,
    
    INS_PHA: 35,
    INS_PHP: 36,
    INS_PLA: 37,
    INS_PLP: 38,
    
    INS_ROL: 39,
    INS_ROR: 40,
    INS_RTI: 41,
    INS_RTS: 42,
    
    INS_SBC: 43,
    INS_SEC: 44,
    INS_SED: 45,
    INS_SEI: 46,
    INS_STA: 47,
    INS_STX: 48,
    INS_STY: 49,
    
    INS_TAX: 50,
    INS_TAY: 51,
    INS_TSX: 52,
    INS_TXA: 53,
    INS_TXS: 54,
    INS_TYA: 55,
    
    INS_DUMMY: 56, // dummy instruction used for 'halting' the processor some cycles
    
    // -------------------------------- //
    
    // Addressing modes:
    ADDR_ZP        : 0,
    ADDR_REL       : 1,
    ADDR_IMP       : 2,
    ADDR_ABS       : 3,
    ADDR_ACC       : 4,
    ADDR_IMM       : 5,
    ADDR_ZPX       : 6,
    ADDR_ZPY       : 7,
    ADDR_ABSX      : 8,
    ADDR_ABSY      : 9,
    ADDR_PREIDXIND : 10,
    ADDR_POSTIDXIND: 11,
    ADDR_INDABS    : 12,
    
    setOp: function(inst, op, addr, size, cycles){
        this.opdata[op] = 
            ((inst  &0xFF)    )| 
            ((addr  &0xFF)<< 8)| 
            ((size  &0xFF)<<16)| 
            ((cycles&0xFF)<<24);
    }
};
