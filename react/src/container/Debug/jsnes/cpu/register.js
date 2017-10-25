
var Register = function () {
}

Register.prototype = {

  reset() {
    // 6 registers
    this.ACC = 0x00;       // 8bit Accumulator 存储算术和逻辑运算结果，或者从内存中取回的值
    this.X = 0x00;         // 8bit Index Register X 存储寻址模式中的计数和偏移，可以从内存中取值，可以读取和设置SP
    this.Y = 0x00;         // 8bit Index Register Y 存储寻址模式中的计数和偏移，可以从内存中取值，不能影响SP
    this.SP = 0x01FF;      // 16bit Stack Pointer 栈位于内存的 0x0100-0x01FF
    this.PC = 0x8000 - 1;  // 16bit Program Counter 下一个指令的地址
    // this.STATUS = 0x28;    8bit Processor Status Register (flags) 状态／标志寄存器，8个标志位
    this.F_CARRY = 0;      // Carry Flag (C) 无符号计算时的上溢和下溢，可以被SEC (Set Carry Flag) 和 CLC (Clear Carry Flag)指令设置和取消
    this.F_ZERO = 1;       // Zero Flag (Z) 上一个指令的计算结果为0则设置
    this.F_IRQDISABLE = 1; // Interrupt Disable (I) 用来防止系统响应IRQs中断，可以被SEI (Set Interrupt Disable) 和 CLI (Clear Interrupt Disable)指令设置和取消
    this.F_DECIMAL = 0;    // Decimal Mode (D) 转换为BCD模式，但是2A03不支持，可以忽略，可以被SED (Set Decimal Flag) 和 CLD (Clear Decimal Flag)指令设置和取消
    this.F_BRK = 1;        // Break Command (B) 说明 Break Command (B) BRK (Break) 执行了，造成中断
    this.F_NOTUSED = 1;    // 未被使用，任何时候都假定是逻辑1
    this.F_OVERFLOW = 0;   // Overflow Flag (V) 有符号数的计算超出范围
    this.F_SIGN = 0;       // Negative Flag (N) 第7位如果是1则为负数，如果为0则为正数
  },

}

module.exports = Register;