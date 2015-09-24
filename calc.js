/***** Complex Number Calculator 3.3.0 *****/

/* require tools 4.7.1 */
/* require prec-math 4.3.2 */
/* require cmpl-math 1.2.3 */
/* require math-check 2.2.2 */
/* require math-parse 1.3.0 */
/* require math-exec 3.1.1 */

////// Import //////

var rem = $.rem;
var att = $.att;
var elm = $.elm;
var txt = $.txt;
var clr = $.clr;
var his = $.his;

////// Log Functions //////

var debug = $("debug");
function addToDebug(name, data){ // write to log
  att(elm("tr", elm("td", txt(name + ":")),
                elm("td", txt(data))), debug);
}

PMath.logfn(addToDebug);

////// GUI //////

document.body.onresize = checkSideWidth;

$("side").style.display = "none";

$("form").onsubmit = function (){
  var input = $("input").value;
  if (rem(/\s/g, input) != ""){
    addHist(input);
    $("input").value = "";
    clr($("debug"));
    try {
      display(input, PMath.calc(input));
    } catch (error){
      display(input, error);
    }
  }
  return false;
};

$("form").setAttribute("action", "javascript:" +
  "display($('input').value, 'Error: unknown (timeout?)');" + 
  "addToDebug('Error', 'unknown (timeout?)');");

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

var addHist = his($("input")).add;