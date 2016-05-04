/***** Complex Number Calculator *****/

/* require tools */
/* require prec-math */
/* require cmpl-math */
/* require math-check */
/* require math-parse */
/* require math-exec */

////// Import //////

var rem = $.rem;
var att = $.att;
var elm = $.elm;
var txt = $.txt;
var clr = $.clr;
var his = $.his;
var bot = $.bot;
var lat = $.lat;
var sli = $.sli;
var apl = $.apl;
var stf = $.stf;
var foc = $.foc;
var dspStack = $.dspStack;

////// Log Functions //////

var debug = $("debug");
function addToDebug(name, data){ // write to log
  att(debug, elm("tr", elm("td", name + ":"),
             elm("td", data)));
}

function log(subj){
  var rst = sli(arguments, 1);
  return addToDebug(subj, apl(stf, rst));
}

////// GUI //////

document.body.onresize = checkSideWidth;

$("side").style.display = "none";

$("form").onsubmit = function (){
  lat(procSubmit);
  return false;
};

function procSubmit(){
  var input = $("input").value;
  if (rem(/\s/g, input) != ""){
    addHist(input);
    clr($("debug"));
    try {
      display(input, PMath.calc(input, log));
    } catch (error){
      display(input, error.toString());
      addToDebug('Error', error.message);
      console.log(dspStack(error));
    }
    $("input").value = "";
  }
}

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
  $('input').value += this.innerHTML;
  foc($('input'));
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
