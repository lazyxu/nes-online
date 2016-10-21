function gs(d){var t=document.getElementById(d);if (t){return t.style;}else{return null;}}
function gs2(d,a){
  if (d.currentStyle){ 
    var curVal=d.currentStyle[a]
  }else{ 
    var curVal=document.defaultView.getComputedStyle(d, null)[a]
  } 
  return curVal;
}
function ChatHidden(){$("#ChatBody").display = "none";}
function ChatShow(){$("#ChatBody").display = "";}
function ChatClose(){$("#Chat").display = "none";}

function BoardHidden(){$("#BoardBody").display = "none";}
function BoardShow(){$("#BoardBody").display = "";}
function BoardClose(){$("#Board").display = "none";}

if  (document.getElementById){
  (
    function(){
      if (window.opera){ document.write("<input type='hidden' id='Q' value=' '>"); }
    
      var n = 500;
      var dragok = false;
      var y,x,d,dy,dx;
      
      function move(e)
      {
        if (!e) e = window.event;
        if (dragok){
          d.style.left = dx + e.clientX - x + "px";
          d.style.top  = dy + e.clientY - y + "px";
          return false;
        }
      }
      
      function down(e){
        if (!e) e = window.event;
        var temp = (typeof e.target != "undefined")?e.target:e.srcElement;
        if (temp.tagName != "HTML"|"BODY" && temp.className != "dragclass"){
          temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
        }
        if('TR'==temp.tagName){
          temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
          temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
          temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
        }
      
        if (temp.className == "dragclass"){
          if (window.opera){ document.getElementById("Q").focus(); }
          dragok = true;
          temp.style.zIndex = n++;
          d = temp;
          dx = parseInt(gs2(temp,"left"))|0;
          dy = parseInt(gs2(temp,"top"))|0;
          x = e.clientX;
          y = e.clientY;
          document.onmousemove = move;
          return false;
        }
      }
      
      function up(){
        dragok = false;
        document.onmousemove = null;
      }
      
      document.onmousedown = down;
      document.onmouseup = up;
    
    }
  )();
}