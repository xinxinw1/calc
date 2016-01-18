/***** Complex Number Calculator 4.0.0 *****/

/* require tools 4.12.0 */
/* require prec-math 5.0.0 */
/* require cmpl-math 2.0.0 */
/* require math-check 3.0.0 */
/* require math-parse 2.0.0 */
/* require math-exec 4.0.0 */

////// Import //////

var rem = $.rem;
var att = $.att;
var elm = $.elm;
var txt = $.txt;
var clr = $.clr;
var his = $.his;
var bot = $.bot;

////// Log Functions //////

var debug = $("debug");
function addToDebug(name, data){ // write to log
  att(debug, elm("tr", elm("td", name + ":"),
             elm("td", data)));
}

PMath.logfn(addToDebug);

////// GUI //////

document.body.onresize = checkSideWidth;

$("side").style.display = "none";

$("form").onsubmit = function (){
  var input = $("input").value;
  if (rem(/\s/g, input) != ""){
    addHist(input);
    clr($("debug"));
    try {
      display(input, PMath.calc(input));
    } catch (error){
      display(input, error);
    }
    $("input").value = "";
  }
  return false;
};

$("form").setAttribute("action", "javascript:" +
  "display($('input').value, 'Error: unknown (timeout?)');" + 
  "$('input').value = '';" +
  "addToDebug('Error', 'unknown (timeout?)');");

$("input").value = "-(53*3-2/(4i))+((34+53i)/(23-34i))*(-i)";
$("input").style.lineHeight = "34px"; // IE

$("debug-link").href = "javascript:void(0)";
$("debug-link").onclick = function (){
  toggleSide('debug');
};

function inputCont(){
  $('input').value = this.innerHTML;
  return false;
}

var results = $("results");
function display(orig, expr){
  att(results,
    elm("p",
      elm("a", {class: "b link", href: "#", onclick: inputCont}, orig),
      elm("br"),
      "= ",
      elm("a", {class: "link", href: "#", onclick: inputCont}, expr)));
  bot(results);
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