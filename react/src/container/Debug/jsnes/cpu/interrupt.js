
var Interrput = function () {
  
}

Interrput.NORMAL = 0; // IRQ Types
Interrput.NMI = 1;
Interrput.RESET = 2;

Interrput.prototype = {

  reset() {
    this.requested = false; // Interrupt notification
    this.type = null;
  },
  
    requestNMI: function () {
      this.request(Interrput.NMI)
    },

  requestNormal: function () {
    this.request(Interrput.NMI)
  },

  requestReset: function () {
    this.request(Interrput.NMI)
  },

  request: function (type) {
    if (this.requested) {
      if (type == Interrput.NORMAL) {
        return;
      }
      // console.log("too fast irqs. type="+type);
    }
    this.requested = true;
    this.type = type;
  },

}

module.exports = Interrput;