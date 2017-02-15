exports.msgERR = (id, msg) => {
    document.getElementById(id).innerHTML = "<span style='color:red'>"+msg+"</span>";
}
exports.msgOK = (id, msg) => {
    document.getElementById(id).innerHTML = "<span style='color:green'>"+msg+"</span>";
}
exports.msgInfo = (id, msg) => {
    document.getElementById(id).innerHTML = "<span style='color:white'>"+msg+"</span>";
}