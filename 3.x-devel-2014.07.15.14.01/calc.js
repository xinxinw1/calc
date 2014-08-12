/***** Complex Number Calculator Devel *****/

/* require tools */
/* require math-parse */
/* require cmpl-math */
/* require prec-math */
/* require prec-math-check */

////// Import //////

var rem = $.rem;
var att = $.att;
var elm = $.elm;
var txt = $.txt;
var clr = $.clr;

////// Log Functions //////

var debug = $("debug");
function addToDebug(name, data){ // write to log
  att(elm("tr", elm("td", txt(name)),
                elm("td", txt(data))), debug);
}

PMath.slogfn(addToDebug);

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
  }
  return false;
};

$("form").setAttribute("action", "javascript:" +
  "display($('input').value,'Error: unknown (timeout?)');" + 
  "PMath.logfn()('Error: ', 'unknown (timeout?)');");

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