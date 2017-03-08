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

var JSNES = function(opts) {
    this.opts = {
        ui: JSNES.DummyUI,
        swfPath: 'lib/',
        
        preferredFrameRate: 60,
        fpsInterval: 500, // Time between updating FPS in ms
        showDisplay: true,

        emulateSound: true,
        sampleRate: 44100, // Sound sample rate in hz
        
        CPU_FREQ_NTSC: 1789772.5, //1789772.72727272d;
        CPU_FREQ_PAL: 1773447.4
    };
    if (typeof opts != 'undefined') {
        var key;
        for (key in this.opts) {
            if (typeof opts[key] != 'undefined') {
                this.opts[key] = opts[key];
            }
        }
    }
    
    this.frameTime = 1000 / this.opts.preferredFrameRate;
    
    this.ui = new this.opts.ui(this);
    this.cpu = new JSNES.CPU(this);
    this.ppu = new JSNES.PPU(this);
    this.papu = new JSNES.PAPU(this);
    this.mmap = null; // set in loadRom()
    this.keyboard = new JSNES.Keyboard();
    this.gamepad = new JSNES.Gamepad(this);
    
    this.ui.updateStatus("Ready to load a ROM.");
};

JSNES.VERSION = "<%= version %>";

JSNES.prototype = {
    isRunning: false,
    fpsFrameCount: 0,
    romData: null,
    
    // Resets the system
    reset: function() {
        if (this.mmap !== null) {
            this.mmap.reset();
        }
        
        this.cpu.reset();
        this.ppu.reset();
        this.papu.reset();
        this.frameCount = 0;
        this.frameDelay = 6;
        this.frameSend = 1;
    },
    
    start: function() {
        var self = this;
        
        if (this.rom !== null && this.rom.valid) {
            if (!this.isRunning) {
                this.isRunning = true;
                this.waitCount = 0;
                this.keyboardLog = [];
                var idInRoom = window.store.getState().user.idInRoom;
                for (i=0; i<this.frameSend; i++) {
                    this.keyboardLog.push([]);
                    window.keyboardAction[idInRoom].push([]);
                }
                this.frameInterval = setInterval( ()=> {
                    if ((this.frameCount+1)%this.frameSend==0) { // 如果是关键帧
                        if (this.frameCount >= this.frameDelay) { // 等待按键信息到达
                            var players = window.store.getState().room.players;
                            for (var i in players) {
                                if (players[i]!=null) { // 等待其他玩家按键到达
                                    if (i != idInRoom && typeof window.keyboardAction[i][0]==="undefined") {
                                        this.waitCount++;
                                        return
                                    }
                                }
                            }
                            if (this.waitCount != 0) {
                                console.log(this.frameCount+': '+this.waitCount);
                            }
                        }
                    }
                    var playerCount = 0;
                    for (var i in players) { // 触发玩家按键
                        if (players[i]!=null) {
                            playerCount++;
                            var action = window.keyboardAction[i][0];
                            // var downloadLog = document.getElementById("downloadLog");
                            // downloadLog.setAttribute("href", downloadLog.getAttribute("href")+JSON.stringify(action));
                            if (action) {
                                console.log(i);
                                for (var j=0;j<action.length;j++) {
                                    this.keyboard.setKey(
                                        i,
                                        action[j].key,
                                        action[j].value
                                    );
                                }
                            }
                        }
                    }
                    self.frame(); // 模拟当前帧的cpu和画面
                    if ((this.frameCount+1)%this.frameSend==0) { // 如果是关键帧
                        if (playerCount > 1) {
                            window.ws.send(JSON.stringify({ // 发送当前帧的按键信息
                                "type": "keyboard",
                                "frameID": this.frameCount+this.frameDelay,
                                "idInRoom": idInRoom,
                                "keyboard": this.keyboardLog,
                            }));
                        }
                        for (i=0; i<this.frameSend; i++) { // 清空本地存储的按键信息
                            this.keyboardLog[i] = [];
                        }
                    }
                    this.frameCount++; // 下一帧的准备工作
                    this.ui.updateFrameCount(this.frameCount);
                    window.keyboardAction[idInRoom].push([]);
                    for (var i in players) {
                        if (players[i]!=null) {
                            window.keyboardAction[i].shift();
                        }
                    }
                    this.waitCount = 0;
                }, this.frameTime);
                this.resetFps();
                this.printFps();
                this.fpsInterval = setInterval( () => {
                    self.printFps();
                    this.ui.updatePing((this.frameDelay+this.waitCount)*this.frameTime);
                }, this.opts.fpsInterval);
            }
        }
        else {
            this.ui.updateStatus("There is no ROM loaded, or it is invalid.");
        }
    },
    
    frame: function() {
        this.ppu.startFrame();
        var cycles = 0;
        var emulateSound = this.opts.emulateSound;
        var cpu = this.cpu;
        var ppu = this.ppu;
        var papu = this.papu;
        FRAMELOOP: for (;;) {
            if (cpu.cyclesToHalt === 0) {
                // Execute a CPU instruction
                cycles = cpu.emulate();
                if (emulateSound) {
                    papu.clockFrameCounter(cycles);
                }
                cycles *= 3;
            }
            else {
                if (cpu.cyclesToHalt > 8) {
                    cycles = 24;
                    if (emulateSound) {
                        papu.clockFrameCounter(8);
                    }
                    cpu.cyclesToHalt -= 8;
                }
                else {
                    cycles = cpu.cyclesToHalt * 3;
                    if (emulateSound) {
                        papu.clockFrameCounter(cpu.cyclesToHalt);
                    }
                    cpu.cyclesToHalt = 0;
                }
            }
            
            for (; cycles > 0; cycles--) {
                if(ppu.curX === ppu.spr0HitX &&
                        ppu.f_spVisibility === 1 &&
                        ppu.scanline - 21 === ppu.spr0HitY) {
                    // Set sprite 0 hit flag:
                    ppu.setStatusFlag(ppu.STATUS_SPRITE0HIT, true);
                }

                if (ppu.requestEndFrame) {
                    ppu.nmiCounter--;
                    if (ppu.nmiCounter === 0) {
                        ppu.requestEndFrame = false;
                        ppu.startVBlank();
                        break FRAMELOOP;
                    }
                }

                ppu.curX++;
                if (ppu.curX === 341) {
                    ppu.curX = 0;
                    ppu.endScanline();
                }
            }
        }
        this.fpsFrameCount++;
    },
    
    printFps: function() {
        var now = +new Date();
        var s = 'Running';
        if (this.lastFpsTime) {
            s += ': '+(
                this.fpsFrameCount / ((now - this.lastFpsTime) / 1000)
            ).toFixed(2)+' FPS';
        }
        this.ui.updateStatus(s);
        this.fpsFrameCount = 0;
        this.lastFpsTime = now;
    },
    
    stop: function() {
        clearInterval(this.frameInterval);
        clearInterval(this.fpsInterval);
        this.isRunning = false;
    },
    
    restart: function() {
        this.reloadRom();
        this.start();
    },
    reloadRom: function() {
        if (this.romData !== null) {
            this.loadRom(this.romData);
        }
    },
    
    // Loads a ROM file into the CPU and PPU.
    // The ROM file is validated first.
    loadRom: function(data) {
        if (this.isRunning) {
            this.stop();
        }
        
        this.ui.updateStatus("Loading ROM...");
        
        // Load ROM file:
        this.rom = new JSNES.ROM(this);
        this.rom.load(data);
        
        if (this.rom.valid) {
            this.reset();
            this.mmap = this.rom.createMapper();
            if (!this.mmap) {
                return;
            }
            this.mmap.loadROM();
            this.ppu.setMirroring(this.rom.getMirroringType());
            this.romData = data;
            
            this.ui.updateStatus("Successfully loaded. Ready to be started.");
        }
        else {
            this.ui.updateStatus("Invalid ROM!");
        }
        return this.rom.valid;
    },
    
    resetFps: function() {
        this.lastFpsTime = null;
        this.fpsFrameCount = 0;
    },
    
    setFramerate: function(rate){
        this.opts.preferredFrameRate = rate;
        this.frameTime = 1000 / rate;
        this.papu.setSampleRate(this.opts.sampleRate, false);
    },
    
    toJSON: function() {
        return {
            'romData': this.romData,
            'cpu': this.cpu.toJSON(),
            'mmap': this.mmap.toJSON(),
            'ppu': this.ppu.toJSON()
        };
    },
    
    fromJSON: function(s) {
        this.loadRom(s.romData);
        this.cpu.fromJSON(s.cpu);
        this.mmap.fromJSON(s.mmap);
        this.ppu.fromJSON(s.ppu);
    }
};