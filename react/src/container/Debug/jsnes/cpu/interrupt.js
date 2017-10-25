
var INTERRUPT = function () {
  
}

INTERRUPT.NORMAL = 0; // IRQ Types
INTERRUPT.NMI = 1;
INTERRUPT.RESET = 2;

INTERRUPT.prototype = {

  reset() {
    this.requested = false; // Interrupt notification
    this.type = null;
  },

}

module.exports = INTERRUPT;