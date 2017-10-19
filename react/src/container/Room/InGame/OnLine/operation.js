// 32 bit in total
// 31~8: frameCount
// 7~5: 8 id
// 4~1: 16 command
// 0: 2 state: set/unset

exports.COMMAND_BUTTON_BEGIN = 0
exports.COMMAND_BUTTON_A = 0
exports.COMMAND_BUTTON_B = 1
exports.COMMAND_BUTTON_SELECT = 2
exports.COMMAND_BUTTON_START = 3
exports.COMMAND_BUTTON_UP = 4
exports.COMMAND_BUTTON_DOWN = 5
exports.COMMAND_BUTTON_LEFT = 6
exports.COMMAND_BUTTON_RIGHT = 7
exports.COMMAND_BUTTON_X = 8
exports.COMMAND_BUTTON_Y = 9
exports.COMMAND_BUTTON_END = 9

exports.COMMAND_SOUND = 12
exports.COMMAND_STOPGAME = 13
exports.COMMAND_RESTART = 14
exports.COMMAND_ENDGAME = 15

exports.STATE_SET = 1
exports.STATE_UNSET = 0

exports.encode = function (frameCount, id, command, state) {
    return (frameCount << 8) |(id << 5) |(command << 1) |state
}

exports.frameCount = function (log) {
    return log >> 8
}
exports.id = function (log) {
    return (log >> 5) & 0b111
}
exports.command = function (log) {
    return (log >> 1) & 0b1111
}
exports.state = function (log) {
    return log & 1
}