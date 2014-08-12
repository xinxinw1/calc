/***** Complex Number Calculator 2.1.1 *****/

/* requires "tools.js" */
  /* functions $, clearChildren */
/* requires "complex-math.js" */
  /* requires "tools.js" */
  /* requires "prec-math.js" */
  /* requires "prec-math-check.js" */

////// Log Functions

var debug = $("debug");
function addToDebug(name, data){ // write to log
  var tr = document.createElement("tr");
  var td1 = document.createElement("td");
  var text1 = document.createTextNode(name);
  td1.appendChild(text1);
  tr.appendChild(td1);
  var td2 = document.createElement("td");
  var text2 = document.createTextNode(data);
  td2.appendChild(text2);
  tr.appendChild(td2);

  debug.appendChild(tr);
}

CMath.setLogCallback(addToDebug);

////// GUI

document.body.onresize = checkSideWidth;

$("side").style.display = "none";

$("form").onsubmit = function (){
  var input = $("input").value;
  if (input.replace(/\s/g, "") != ""){
    addHist(input);
    $.clearChildren($("debug"));
    try {
      display(input, CMath.calc(input));
    } catch (error){
      display(input, error);
    }
  }
  return false;
};

$("form").setAttribute("action", "javascript:" +
  "display($('input').value,'Error: unknown (timeout?)');");

$("input").onkeydown = function (e){
  return checkHist(this, e);
};

$("input").value = "-(53*3-2/(4i))+((34+53i)/(23-34i))*(-i)";
$("input").style.lineHeight = "34px"; // IE

$("debug-link").href = "javascript:void(0)";
$("debug-link").onclick = function (){
  toggleSide('debug');
};


var results = $("results");
function display(orig, expr){
  var write = "";
  
  write += "<p>";
  write += "<span class=\"b\">";
  write += orig;
  write += "</span>";
  write += "<br>";
  write += "<span>= ";
  write += expr;
  write += "</span></p>";
  
  results.innerHTML += write;
  results.scrollTop = results.scrollHeight;
  results.scrollLeft = 0;
  checkSideWidth();
}

var side = $("side");
var sideOpen = false;
function toggleSide(tab){
  if (!sideOpen){
    side.style.display = "block";
    results.style.marginRight = (side.offsetWidth - 1) + "px";
    sideOpen = true;
  } else {
    side.style.display = "none";
    results.style.marginRight = "0";
    sideOpen = false;
  }
}

function checkSideWidth(){
  if (side.offsetWidth != 0){
    results.style.marginRight = (side.offsetWidth - 1) + "px";
  } else results.style.marginRight = "0";
}

var inhist = [];
var histpos = -1;
function addHist(input){
  inhist.push(input);
  histpos = inhist.length-1;
}

function checkHist(field, event){
  var code = (event.key == undefined)?event.keyCode:event.key;
  if ((code == "Up" || code == 38) && (histpos-1) > -1){ // up key
    histpos = histpos-1;
    field.value = inhist[histpos];
    return false;
  }
  if ((code == "Down" || code == 40) && (histpos+1) < inhist.length){ // down
    histpos = histpos+1;
    field.value = inhist[histpos];
    return false;
  }
  return true;
}