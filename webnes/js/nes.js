var WEBNES = function(opts) {
    // 获取默认配置
    this.opts = {
        ui: "",
        romPath: '',
        frameTime: 1000/60, // 每一帧的时间
        fpsInterval: 500, // 更新显示fps的时间
        muted: false, // 静音
        sampleRate: 44100, // Sound sample rate in hz
        CPU_FREQ_NTSC: 1789772.5, //1789772.72727272d;
        CPU_FREQ_PAL: 1773447.4
    };
    if (typeof opts != 'undefined') {
        for (var key in this.opts) {
            if (typeof opts[key] != 'undefined') {
                this.opts[key] = opts[key];
            }
        }
    }
    
    this.cpu = new CPU(this);
}
