function math(expr){
  try {
    expr = new String(expr);
    log("Input:", expr);
    
    //// clear whitespace
    expr = expr.replace(/\s/g, "");
    
    //// check for illegal characters
    var illchars = expr.match(/[^a-zA-Z0-9,*+^=()\/-]/);
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
      varexpr = expr;
    }
    
    //// replace variables with their values
    var i, varregex;
    for (i in variables){
      varregex = eval("/\\b" + variables[i][0] + "\\b/g");
      if (varregex.test(expr)){
        expr = expr.replace(varregex, "(" + variables[i][1] + ")");
        log("Variable " + variables[i][0] + ":", expr);
      }
    }
    
    //// changes all - to +- when there is a number before it
    expr = expr.replace(/([i0-9)])-/g, "$1+-");
    log("\"-\" -> \"+-\" :", expr);
    
    //// changes all numbers to ‘a,b’ (ex. -6i -> ‘0,-6’)
    expr = expr.replace(/(-?\b[0-9.]+)\b(?!i)/g, "‘$1,0’"); // real numbers
    expr = expr.replace(/(-?\b[0-9.]+)i\b/g, "‘0,$1’"); // imaginary numbers
    expr = expr.replace(/(-?)\bi\b/g, "‘0,$11’"); // "i" or "-i"
    expr = expr.replace(/-(?![0-9])/g, "‘-1,0’*"); // "-" (ex. "-(23)")
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
        run = functions[funcindex][1] + "(\"" + argarr.join("\",\"") + "\")";
        log("Function:", run);
        result = eval(run);
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
    expr = expr.replace(/1i/g, "i");
    expr = expr.replace(/\+-/g, "-");
    expr = expr.replace(/(\+|-)0i/g, "");
    expr = expr.replace(/0\+/g, "");
    expr = expr.replace(/0-/g, "-");
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
    
    return expr;
    
  } catch (err){ // catch "throw ..."
    log("", err);
    return err;
  }
}

function calc(expr){ // calculate expr without brackets
  log("Start Calc:", expr);
  
  while (expr.indexOf("^") != -1)expr = calcCharOnce(expr, "^", "pow");
  
  var sign, func;
  while (expr.indexOf("*") != -1 || expr.indexOf("/") != -1){
    sign = new String(expr.match(/[*\/]/));
    func = (sign == "*")?"mult":"div";
    
    expr = calcCharOnce(expr, sign, func);
  }
  
  while (expr.indexOf("+") != -1)expr = calcCharOnce(expr, "+", "add");
  
  return expr;
}

function calcCharOnce(expr, sign, func){
  var before, after, result;
  before = getNumBefore(expr, sign);
  after = getNumAfter(expr, sign);
  result = eval(func + "(\"" + before + "\",\"" + after + "\")");
  expr = expr.replace(before + sign + after, result); // replace is okay
  log(sign + " :", expr);           // because it only replaces the first one
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

function getNumBefore(expr, ch){ // gets "3" from "3+4"
  ch = "\\" + ch;
  expr = new String(expr.match(eval("/‘[^’]*’(?=" + ch + ")/")));
  if (expr == "null")throw "Syntax Error: No number before \"" + ch + "\"";
  return expr;
}

function getNumAfter(expr, ch){ // gets "4" from "3+4"
  ch = "\\" + ch;
  expr = new String(expr.match(eval("/" + ch + "‘[^’]*’/")));
  if (expr == "null")throw "Syntax Error: No number before \"" + ch + "\"";
  expr = expr.substring(1, expr.length); // remove ch
  return expr;
}

////// Log Functions

function clearLog(){
  var debug = document.getElementById("debug");
  debug.innerHTML = "";
}

function log(descr, data){ // write to log
  var debug = document.getElementById("debug");
  var write = "";
  
  write += "<tr>";
  write += "<td>";
  write += descr;
  write += "</td>";
  write += "<td>";
  write += data;
  write += "</td>";
  write += "</tr>";
  
  debug.innerHTML += write;
}

////// ‘a,b’ Functions

function openNum(expr){
  expr = expr.replace(/[‘’]/g, "");
  var exprarr = expr.split(",");
  
  return exprarr;
}

function closeNum(exprarr){
  var expr = "‘" + exprarr.join(",") + "’";
  
  return expr;
}

////// Array Prototypes

Array.prototype.num = function (){ // makes all values of array into numbers
  for (var i = 0; i < this.length; i++){
    this[i] = Number(this[i]);
  }
}

Array.prototype.calcAll = function (){ // calc() all values of array
  for (var i = 0; i < this.length; i++){
    this[i] = calc(this[i]);
  }
}

Array.prototype.indexOf2 = function (data, index){
  var newarr = [];
  for (var i = 0; i < this.length; i++)newarr.push(this[i][index]);
  
  return newarr.indexOf(data);
}

Array.prototype.join2 = function (sep, index){
  var newarr = [];
  for (var i = 0; i < this.length; i++)newarr.push(this[i][index]);

  return newarr.join(sep);
}

////// Math Functions

var e = Math.E;
var pi = Math.PI;

var variables = [];
variables[0] = ["e", e];
variables[1] = ["pi", pi];

var functions = [];
functions[0] = ["sqrt", "sqrt"];
functions[1] = ["Arg", "Arg"];
functions[2] = ["ln", "ln"];
functions[3] = ["abs", "abs"];
functions[4] = ["exp", "exp"];
functions[5] = ["sgn", "sgn"];
functions[6] = ["sign", "sgn"];
functions[7] = ["root", "root"];
functions[8] = ["sqrt", "sqrt"];
functions[9] = ["cbrt", "cbrt"];
functions[10] = ["pow", "pow"];

function add(before, after){
  var a, b, c, d;
  var befarr = openNum(before);
  befarr.num();
  a = befarr[0]; b = befarr[1];
  
  var aftarr = openNum(after);
  aftarr.num();
  c = aftarr[0]; d = aftarr[1];
  
  var resarr = [];
  resarr[0] = a + c;
  resarr[1] = b + d;
  
  return closeNum(resarr);
}

function mult(before, after){
  var a, b, c, d;
  var befarr = openNum(before);
  befarr.num();
  a = befarr[0]; b = befarr[1];
  
  var aftarr = openNum(after);
  aftarr.num();
  c = aftarr[0]; d = aftarr[1];
  
  var resarr = [];
  resarr[0] = a*c - b*d;
  resarr[1] = a*d + b*c;
  
  return closeNum(resarr);
}

function div(before, after){
  var a, b, c, d;
  var befarr = openNum(before);
  befarr.num();
  a = befarr[0]; b = befarr[1];
  
  var aftarr = openNum(after);
  aftarr.num();
  c = aftarr[0]; d = aftarr[1];
  
  var resarr = [];
  resarr[0] = (a*c + b*d)/(Math.pow(c, 2) + Math.pow(d, 2));
  resarr[1] = (b*c - a*d)/(Math.pow(c, 2) + Math.pow(d, 2));
  
  return closeNum(resarr);
}

function Arg(num){
  var a, b;
  var numarr = openNum(num);
  numarr.num();
  a = numarr[0]; b = numarr[1];
  
  var resarr = [];
  resarr[0] = Math.atan2(b, a);
  resarr[1] = 0;
  
  return closeNum(resarr);
}

function abs(num){
  var a, b;
  var numarr = openNum(num);
  numarr.num();
  a = numarr[0]; b = numarr[1];
  
  var resarr = [];
  resarr[0] = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  resarr[1] = 0;
  
  return closeNum(resarr);
}

function ln(num){
  var resarr = [];
  resarr[0] = Math.log(openNum(abs(num))[0]);
  resarr[1] = openNum(Arg(num))[0];
  
  return closeNum(resarr);
}

function exp(num){
  var a, b;
  var numarr = openNum(num);
  numarr.num();
  a = numarr[0]; b = numarr[1];
  
  var resarr = [];
  resarr[0] = Math.pow(e, a)*Math.cos(b);
  resarr[1] = Math.pow(e, a)*Math.sin(b);
  
  return closeNum(resarr);
}

function pow(before, after){
  return exp(mult(after, ln(before)));
}

function sgn(num){
  var a, b;
  var numarr = openNum(num);
  numarr.num();
  a = numarr[0]; b = numarr[1];
  
  if (a == 0 && b == 0)return closeNum([0, 0]);
  else return div(num, abs(num));
}

function root(num, expr){
  var a, b, c, d;
  var numarr = openNum(num);
  numarr.num();
  
  a = numarr[0]; b = numarr[1];
  if (b != 0)throw "Error: ???";
  
  var exprarr = openNum(expr);
  exprarr.num();
  c = exprarr[0]; d = exprarr[1];
  if (d != 0)return pow(expr, div(closeNum([1, 0]), num));
  
  if ((a % 2) == 1){
    return mult(sgn(expr), pow(abs(expr), div(closeNum([1, 0]), num)));
  } else return pow(expr, div(closeNum([1, 0]), num));
}

function sqrt(expr){
  return root(closeNum([2, 0]), expr);
}

function cbrt(expr){
  return root(closeNum([3, 0]), expr);
}

////// GUI

function display(origExpr, expr){
  var results = document.getElementById("results")
  var write = "";
  
  write += "<p>";
  write += "<span class=\"b\">" + origExpr + "</span>";
  write += "<br>";
  write += "= " + expr;
  write += "</p>";
  
  results.innerHTML += write;
}

var side = document.getElementById("side");
var results = document.getElementById("results");
var sideOpen = false;
function toggleSide(tab){
  if (!sideOpen){
    side.style.display = "table-cell";
    results.style.marginRight = (side.offsetWidth - 1) + "px";
    sideOpen = true;
  } else {
    side.style.display = "none";
    results.style.marginRight = "0";
    sideOpen = false;
  }
}

function checkSideWidth(){
  if ((side.offsetWidth - 1) != -1){
    results.style.marginRight = (side.offsetWidth - 1) + "px";
  } else results.style.marginRight = "0";
}

var history = [];
var histpos = -1;
function addHist(input){
  history.push(input);
  histpos = history.length-1;
}

function checkHist(field, event){
  var code = (event.key == undefined)?event.keyCode:event.key;
  if ((code == "Up" || code == 38) && (histpos-1) > -1){ // up key
    histpos = histpos-1;
    field.value = history[histpos];
    return false;
  }
  if ((code == "Down" || code == 40) && (histpos+1) < history.length){ // down
    histpos = histpos+1;
    field.value = history[histpos];
    return false;
  }
  return true;
}