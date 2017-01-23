//定义一个change方法，将来把它绑定到props上
exports.setMask = (mask) => {
    return{
        type: "setMask",
        mask: mask
    }
}