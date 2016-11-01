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

// <!--player 2-->
$('#KEY_A2').bind("keyup", function (e) {
    $("#KEY_A2").val(e.keyCode);
    nes.keyboard.updateKEY_A2(e.keyCode);
    $("#KEY_UP2").focus();
});
$("#KEY_B2").bind("keyup", function (e) {
    $("#KEY_B2").val(e.keyCode);
    nes.keyboard.updateKEY_B2(e.keyCode);
    $("#KEY_A2").focus();
});
$("#KEY_SELECT2").bind("keyup", function (e) {
    $("#KEY_SELECT2").val(e.keyCode);
    nes.keyboard.updateKEY_SELECT2(e.keyCode);
    $("#KEY_START2").focus();
});
$("#KEY_START2").bind("keyup", function (e) {
    $("#KEY_START2").val(e.keyCode);
    nes.keyboard.updateKEY_START2(e.keyCode);
    $("#KEY_B2").focus();
});
$("#KEY_UP2").bind("keyup", function (e) {
    $("#KEY_UP2").val(e.keyCode);
    nes.keyboard.updateKEY_UP2(e.keyCode);
    $("#KEY_DOWN2").focus();
});
$("#KEY_DOWN2").bind("keyup", function (e) {
    $("#KEY_DOWN2").val(e.keyCode);
    nes.keyboard.updateKEY_DOWN2(e.keyCode);
    $("#KEY_LEFT2").focus();
});
$("#KEY_LEFT2").bind("keyup", function (e) {
    $("#KEY_LEFT2").val(e.keyCode);
    nes.keyboard.updateKEY_LEFT2(e.keyCode);
    $("#KEY_RIGHT2").focus();
});
$("#KEY_RIGHT2").bind("keyup", function (e) {
    $("#KEY_RIGHT2").val(e.keyCode);
    nes.keyboard.updateKEY_RIGHT2(e.keyCode);
    $("#KEY_SELECT2").focus();
});