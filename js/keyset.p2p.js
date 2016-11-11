$('#KEY_A').bind("keyup", function (e) {
    $("#KEY_A").val(e.keyCode);
    nes.keyboard.updateKEY_A(e.keyCode);
    $("#KEY_UP").focus();
});
$("#KEY_B").bind("keyup", function (e) {
    $("#KEY_B").val(e.keyCode);
    nes.keyboard.updateKEY_B(e.keyCode);
    $("#KEY_A").focus();
});
$("#KEY_SELECT").bind("keyup", function (e) {
    $("#KEY_SELECT").val(e.keyCode);
    nes.keyboard.updateKEY_SELECT(e.keyCode);
    $("#KEY_START").focus();
});
$("#KEY_START").bind("keyup", function (e) {
    $("#KEY_START").val(e.keyCode);
    nes.keyboard.updateKEY_START(e.keyCode);
    $("#KEY_B").focus();
});
$("#KEY_UP").bind("keyup", function (e) {
    $("#KEY_UP").val(e.keyCode);
    nes.keyboard.updateKEY_UP(e.keyCode);
    $("#KEY_DOWN").focus();
});
$("#KEY_DOWN").bind("keyup", function (e) {
    $("#KEY_DOWN").val(e.keyCode);
    nes.keyboard.updateKEY_DOWN(e.keyCode);
    $("#KEY_LEFT").focus();
});
$("#KEY_LEFT").bind("keyup", function (e) {
    $("#KEY_LEFT").val(e.keyCode);
    nes.keyboard.updateKEY_LEFT(e.keyCode);
    $("#KEY_RIGHT").focus();
});
$("#KEY_RIGHT").bind("keyup", function (e) {
    $("#KEY_RIGHT").val(e.keyCode);
    nes.keyboard.updateKEY_RIGHT(e.keyCode);
    $("#KEY_SELECT").focus();
});