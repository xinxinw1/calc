/***** Complex Number Calculator 1.9 *****/

/* requires "prec-math.js" */

function $(a){
  return document.getElementById(a);
}

var clone;
function math(expr){
  try {
    expr = String(expr);
    var origExpr = expr;
    
    var debug = $("debug");
    clone = debug.cloneNode(false);
    
    log("Input:", expr);
    
    //// clear whitespace
    expr = expr.replace(/\s/g, "");
    
    //// check for illegal characters
    var illchars = expr.match(/[^a-zA-Z0-9,!*+^.=()\/-]/);
    if (illchars != null){
      throw "Syntax Error: Illegal Character \"" + illchars[0] + "\"";
    }
    
    //// check for unknown variables
    var vars = expr.match(/\b[a-zA-Z0-9]+\b(?!(=|\())/g);
    if (vars != null){
      for (var i = 0; i < vars.length; i++){
        if (!(/^[0-9]*i?$/).test(vars[i]) && variables.indexOf2(vars[i], 0) == -1){
          throw "Syntax Error: Unknown Variable \"" + vars[i] + "\"";
        }
      }
    }
    
    //// check for unknown functions
    var funcs = expr.match(/\b[a-zA-Z0-9]+(?=\()/g);
    if (funcs != null){
      for (var i = 0; i < funcs.length; i++){
        if (functions.indexOf2(funcs[i], 0) == -1){
          throw "Syntax Error: Unknown Function \"" + funcs[i] + "\"";
        }
      }
    }
    
    //// check if set variables ("x=132")
    var vararr, varname, varpos, varexpr, illnames;
    var equpos = expr.indexOf("=");
    if (equpos != -1){
      vararr = getWordBefore(expr, equpos);
      varname = vararr[0]; varpos = vararr[1];
      
      if (varpos != 0 || /\d/.test(varname.charAt(0)))throw "Syntax Error: Invalid Variable Name \"" + expr.substring(0, equpos) + "\"";
      
      if (varname.match(/^(i|pi|e)$/))throw "Error: Illegal Variable Name \"" + varname + "\"";
      
      if (functions.indexOf2(varname, 0) != -1)throw "Error: Variable Name \"" + varname + "\" Conflicts With Function Name";
      
      expr = expr.substring(equpos+1, expr.length);
    }
    
    //// replace variables with their values
    var varregex;
    for (var i = 0; i < variables.length; i++){
      varregex = new RegExp("\\b" + variables[i][0] + "(?!\\()\\b", "g");
      if (varregex.test(expr)){
        expr = expr.replace(varregex, "(" + variables[i][1] + ")");
        log("Variable " + variables[i][0] + ":", expr);
      }
    }
    
    if (varname != undefined)varexpr = expr;
    
    //// changes all - to +- when there is a number or a '(' before it
    expr = expr.replace(/([i0-9)])-/g, "$1+-");
    log("\"-\" -> \"+-\" :", expr);
    
    //// changes all numbers to ‘a,b’ (ex. -6i -> ‘0,-6’)
    //// Test: -234i^(24i)+3+-2^4+root(5,-23+-3i)+-(243+-500)+-i
    expr = expr.replace(/-([0-9.]+i?)\^/g, "-1*$1^"); // -234i^4 -> -1*234i^4
    expr = expr.replace(/(-?\b[0-9.]+)(?![i0-9.])/g, "‘$1,0’"); // real numbers
    expr = expr.replace(/(-?\b[0-9.]+)i/g, "‘0,$1’"); // imaginary numbers
    expr = expr.replace(/(-?\b)i\b/g, "‘0,$11’"); // "i" or "-i"
    expr = expr.replace(/-(?![0-9.])/g, "‘-1,0’*"); // "-" (ex. "-(23)")
    log("a -> ‘a,0’ :", expr);
    
    //// process brackets
    var start, end, substr, argarr, funcarr, func, pos, result, funcindex, run;
    while (expr.indexOf("(") != -1 && expr.indexOf(")") != -1){
      start = expr.search(/\([^(]*\)/); // last "(" before first ")"
      end = expr.indexOf(")") + 1;      // first ")"
      
      substr = expr.substring(start+1, end-1); // part between ()
      argarr = substr.split(/,(?=‘)/); // function arguments array
      argarr.calcAll(); // calc() all parts of array
      
      funcarr = getWordBefore(expr, start);
      func = funcarr[0]; // function name
      pos = funcarr[1];  // position of start of function name
      if (func == ""){
        if (argarr.length == 1)result = argarr[0];
        else throw "Syntax Error: Unexpected \",\"";
      } else {           // if there is a function name
        funcindex = functions.indexOf2(func, 0); // find index of the function
        log("Function:", func + "(\"" + argarr.join("\",\"") + "\")");
        result = functions[funcindex][1].apply(this, argarr);
        log("Result:", result);
      }
      expr = expr.substring(0, pos) + result + expr.substring(end, expr.length);
      log("Remove Brackets:", expr);
    }
    
    //// catch missing brackets
    var match = expr.match(/[()]/);
    if (match == "(")throw "Syntax Error: Missing \")\"";
    if (match == ")")throw "Syntax Error: Missing \"(\"";
    
    //// perform last calculation
    expr = calc(expr);
    log("Calculations Finished:", expr);
    
    //// change ‘a,b’ to a+bi
    expr = expr.replace(/‘(-?[0-9.]+),(-?[0-9.]+)’/g, "$1+$2i");
    expr = expr.replace(/(\+|-)1i/g, "$1i");
    expr = expr.replace(/\+-/g, "-");
    expr = expr.replace(/(\+|-)0i/g, "");
    expr = expr.replace(/^0\+/g, "");
    expr = expr.replace(/^0-/g, "-");
    log("Finished:", expr);
    
    //// set variables if there is x=
    if (varname != undefined){
      var pastvarpos = variables.indexOf2(varname, 0); // remove old variable
      if (pastvarpos != -1){
        variables.splice(pastvarpos, 1);
      }
      variables.unshift([varname, varexpr, expr]);
      log("Set Variable " + varname + ":", varexpr);
    }
    
    debug.parentNode.replaceChild(clone, debug);
    display(origExpr, expr);
    
  } catch (err){ // catch "throw ..."
    log("", err);
    
    debug.parentNode.replaceChild(clone, debug);
    display(origExpr, err);
  }
}

function calc(expr){ // calculate expr without brackets
  log("Start Calc:", expr);
  
  while (expr.indexOf("!") != -1){
    var pos = expr.indexOf("!");
    var befarr, befnum, befpos;
    befarr = getNumBefore(expr, pos);
    befnum = befarr[0];
    befpos = befarr[1];
    
    var result = fact(befnum);
    expr = expr.substring(0, befpos) + result + expr.substring(pos+1, expr.length);
    log("! :", expr);
  }
  
  while (expr.indexOf("^") != -1){ // x^x^x is calculated x^(x^x)
    expr = calcCharOnce(expr, "^", function (z, w){return pow(z, w);}, expr.lastIndexOf("^"));
  }
  
  var sign, func;
  while (expr.indexOf("*") != -1 || expr.indexOf("/") != -1){
    sign = String(expr.match(/[*\/]/));
    if (sign == "*"){
      func = function (z, w){return mult(z, w);};
    } else {
      func = function (z, w){return div(z, w);};
    }
    
    expr = calcCharOnce(expr, sign, func, expr.indexOf(sign));
  }
  
  while (expr.indexOf("+") != -1){
    expr = calcCharOnce(expr, "+", function (z, w){return add(z, w);}, expr.indexOf("+"));
  }
  
  return expr;
}

function calcCharOnce(expr, sign, func, pos){
  var befarr, befnum, befpos;
  befarr = getNumBefore(expr, pos);
  befnum = befarr[0];
  befpos = befarr[1];
  
  var aftarr, aftnum, aftpos;
  aftarr = getNumAfter(expr, pos);
  aftnum = aftarr[0];
  aftpos = aftarr[1];
  
  var result = func(befnum, aftnum);
  expr = expr.substring(0, befpos) + result + expr.substring(aftpos, expr.length);
  log(sign + " :", expr);
  return expr;
}

////// Get Words or Numbers

function getWordBefore(expr, pos){ // finds function name
  for (var i = pos-1; i >= 0; i--){
    if ((/[^a-zA-Z0-9]/).test(expr.charAt(i))){
      return ([expr.substring(i+1, pos), i+1]);
    }
  }
  return [expr.substring(0, pos), 0];
}

function getNumBefore(expr, pos){ // gets "3" from "3+4"
  expr = String(expr);
  if (expr.charAt(pos-1) != "’"){ // error if "3**4"
    throw "Syntax Error: No number before \"" + expr.charAt(pos) + "\"";
  }
  for (var a = pos-1; a >= 0; a--){
    if (expr.charAt(a) == "‘"){
      return [expr.substring(a, pos), a];
    }
  }
  throw "Syntax Error: No number before \"" + expr.charAt(pos) + "\"";
}

function getNumAfter(expr, pos){ // gets "4" from "3+4"
  expr = String(expr);
  if (expr.charAt(pos+1) != "‘"){ // error if "3**4"
    throw "Syntax Error: No number after \"" + expr.charAt(pos) + "\"";
  }
  for (var a = pos+1; a < expr.length; a++){
    if (expr.charAt(a) == "’"){
      return [expr.substring(pos+1, a+1), a+1];
    }
  }
  throw "Syntax Error: No number after \"" + expr.charAt(pos) + "\"";
}

////// Log Functions

function log(descr, data){ // write to log
  var tr = document.createElement("tr");
  var td1 = document.createElement("td");
  var text1 = document.createTextNode(descr);
  td1.appendChild(text1);
  tr.appendChild(td1);
  var td2 = document.createElement("td");
  var text2 = document.createTextNode(data);
  td2.appendChild(text2);
  tr.appendChild(td2);

  clone.appendChild(tr);
}

////// Array Prototypes

Array.prototype.calcAll = function (){ // calc() all values of array
  for (var i = 0; i < this.length; i++){
    this[i] = calc(this[i]);
  }
}

Array.prototype.indexOf2 = function (data, index){
  for (var i = 0; i < this.length; i++){
    if (this[i][index] == data)return i;
  }
  
  return -1;
}

Array.prototype.join2 = function (sep, index){
  var newarr = [];
  for (var i = 0; i < this.length; i++)newarr.push(this[i][index]);

  return newarr.join(sep);
}

////// Math Functions

var prec = 16; // precision

var variables = [];
variables.push(["e", er(prec+5)]);
variables.push(["pi", pir(prec+5)]);
variables.push(["phi", phir(prec+5)]);

var functions = [];
functions.push(["arg", arg]);
functions.push(["Arg", arg]);
functions.push(["ln", ln]);
functions.push(["abs", abs]);
functions.push(["exp", exp]);
functions.push(["sgn", sgn]);
functions.push(["sign", sgn]);
functions.push(["root", root]);
functions.push(["sqrt", sqrt]);
functions.push(["cbrt", cbrt]);
functions.push(["pow", pow]);
functions.push(["fact", fact]);
functions.push(["bin", bin]);
functions.push(["agm", agm]);
functions.push(["round", round]);
functions.push(["trunc", trunc]);
functions.push(["floor", floor]);
functions.push(["ceil", ceil]);
functions.push(["sin", sin]);
functions.push(["cos", cos]);
functions.push(["pi", pi]);
functions.push(["e", e]);
functions.push(["phi", phi]);

////// GUI

document.body.onresize = checkSideWidth;

$("side").style.display = "none";

$("form").onsubmit = function (){
  try {
    if ($("input").value.replace(/\s/g, "") != ""){
      addHist($("input").value);
      math($("input").value);
      checkSideWidth();
    }
  } catch (e){}
  return false;
}

$("form").setAttribute("action", "javascript:" +
  "void(debug = $('debug'));" +
  "debug.parentNode.replaceChild(debug.cloneNode(false), debug);" +
  "display($('input').value,'Error: unknown (timeout?)');" +
  "checkSideWidth();");

$("input").onkeydown = function (e){
  return checkHist(this, e);
}

$("input").value = "-(53*3-2/(4i))+((34+53i)/(23-34i))*(-i)";
$("input").style.lineHeight = "34px"; // IE


var results = $("results");
function display(origExpr, expr){
  var write = "";
  
  write += "<p>";
  write += "<span class=\"b\">";
  write += origExpr;
  write += "</span>";
  write += "<br>";
  write += "<span>= ";
  write += expr;
  write += "</span></p>";
  
  results.innerHTML += write;
  results.scrollTop = results.scrollHeight;
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