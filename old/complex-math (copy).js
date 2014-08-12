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
    var varregex;
    for (var i = 0; i < variables.length; i++){
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
  
  while (expr.indexOf("^") != -1){ // x^x^x is calculated x^(x^x)
    expr = calcCharOnce(expr, "^", "pow", expr.lastIndexOf("^"));
  }
  
  var sign, func;
  while (expr.indexOf("*") != -1 || expr.indexOf("/") != -1){
    sign = new String(expr.match(/[*\/]/));
    func = (sign == "*")?"mult":"div";
    
    expr = calcCharOnce(expr, sign, func, expr.indexOf(sign));
  }
  
  while (expr.indexOf("+") != -1){
    expr = calcCharOnce(expr, "+", "add", expr.indexOf("+"));
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
  
  var result = eval(func + "(\"" + befnum + "\",\"" + aftnum + "\")");
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
  expr = new String(expr);
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
  expr = new String(expr);
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

Array.prototype.addAll = function (){
  var sum = "0";
  for (var i = 0; i < this.length; i++){
    sum = addr(sum, this[i]);
  }

  return sum;
}

////// Math Functions

var prec = 16;

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
  a = befarr[0]; b = befarr[1];
  
  var aftarr = openNum(after);
  c = aftarr[0]; d = aftarr[1];
  
  var resarr = [];
  resarr[0] = addr(a, c);
  resarr[1] = addr(b, d);
  
  return closeNum(resarr);
}

function mult(before, after){
  var a, b, c, d;
  var befarr = openNum(before);
  a = befarr[0]; b = befarr[1];
  
  var aftarr = openNum(after);
  c = aftarr[0]; d = aftarr[1];
  
  var resarr = [];
  resarr[0] = subr(multr(a, c), multr(b, d));
  resarr[1] = addr(multr(a, d), multr(b, c));
  
  return closeNum(resarr);
}

function div(before, after){
  var a, b, c, d;
  var befarr = openNum(before);
  a = befarr[0]; b = befarr[1];
  
  var aftarr = openNum(after);
  c = aftarr[0]; d = aftarr[1];
  
  var resarr = [];
  resarr[0] = divr(addr(multr(a,c), multr(b,d)), addr(powr(c,2), powr(d,2)));
  resarr[1] = divr(subr(multr(b,c), multr(a,d)), addr(powr(c,2), powr(d,2)));
  
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
  a = numarr[0]; b = numarr[1];
  
  var resarr = [];
  resarr[0] = sqrtr(addr(powr(a, 2), powr(b, 2)));
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
  resarr[0] = multr(powr(e, a), Math.cos(b));
  resarr[1] = multr(powr(e, a), Math.sin(b));
  
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

////// Real Math Functions

function padZeros(a, b){
  if (a.indexOf(".") == -1)a = a + ".0";
  if (b.indexOf(".") == -1)b = b + ".0";
  
  var aToDot, bToDot;
  aToDot = a.substring(0, a.indexOf("."));
  bToDot = b.substring(0, b.indexOf("."));
  
  var dotToA, dotToB;
  dotToA = a.substring(a.indexOf(".")+1, a.length);
  dotToB = b.substring(b.indexOf(".")+1, b.length);
  
  while (aToDot.length < bToDot.length)aToDot = "0" + aToDot;
  while (bToDot.length < aToDot.length)bToDot = "0" + bToDot;
  
  while (dotToA.length < dotToB.length)dotToA = dotToA + "0";
  while (dotToB.length < dotToA.length)dotToB = dotToB + "0";
  
  a = aToDot + "." + dotToA;
  b = bToDot + "." + dotToB;
  
  return [a, b];
}

function trimZeros(a){
  for (var i = 0; i < a.length; i++){
    if (a[i] != "0"){
      a = a.substring(i, a.length);
      break;
    }
  }
  if (a[0] == ".")a = "0." + a.substring(1, a.length);
  if (a.indexOf(".") != -1){
    for (var i = a.length-1; i >= 0; i--){
      if (a[i] != "0"){
        a = a.substring(0, i+1);
        break;
      }
    }
  }
  if (a[a.length-1] == ".")a = a.substring(0, a.length-1);
  if (a == "")a = "0";
  
  return a;
}

function addr(a, b){
  a = new String(a); b = new String(b);
  
  var neg = "";
  if (a[0] == "-" && b[0] != "-")return subr(b, a.replace("-", ""));
  if (a[0] != "-" && b[0] == "-")return subr(a, b.replace("-", ""));
  if (a[0] == "-" && b[0] == "-")neg = "-";
  
  a = a.replace("-", "");
  b = b.replace("-", "");
  
  var zeroArr = padZeros(a, b);
  a = zeroArr[0]; b = zeroArr[1];
  
  var posDot = a.indexOf(".");
  a = a.replace(".", "");
  b = b.replace(".", "");
  
  var smallSum;
  var sum = "";
  var carry = 0;
  for (var i = a.length-1; i >= 0; i--){
    smallSum = String(Number(a[i]) + Number(b[i]) + carry);
    sum = smallSum[smallSum.length-1] + sum;
    if (i == posDot)sum = "." + sum;
    if (smallSum.length == 2)carry = 1;
    else carry = 0;
  }
  if (carry == 1)sum = "1" + sum;
  sum = neg + trimZeros(sum);
  if (sum == "-0")sum = "0";
  
  //log("addr:", sum);
  return sum;
}

function gt(a, b){ // is (a > b) ?
  var zeroArr = padZeros(a, b);
  a = zeroArr[0]; b = zeroArr[1];
  
  a = a.replace(".", "");
  b = b.replace(".", "");
  
  if (a == b)return false;
  
  for (var i = 0; i < a.length; i++){
    if (a[i] != b[i])return (Number(a[i]) > Number(b[i]));
  }
  
  return false;
}

function le(a, b){ // is (a <= b) ?
  return !gt(a, b);
}

function subr(a, b){
  a = new String(a); b = new String(b);
  
  if (a[0] == "-" && b[0] != "-")return addr(a, "-" + b);
  if (a[0] != "-" && b[0] == "-")return addr(a, b.replace("-", ""));
  if (a[0] == "-" && b[0] == "-"){
    var c = a;
    a = b.replace("-", "");
    b = c.replace("-", "");
  }
  
  var zeroArr = padZeros(a, b);
  a = zeroArr[0]; b = zeroArr[1];
  
  var neg = "";
  if (gt(b, a)){
    var c = a;
    a = b;
    b = c;
    neg = "-";
  }
  
  var posDot = a.indexOf(".");
  a = a.replace(".", "");
  b = b.replace(".", "");
  
  var smallDiff;
  var diff = "";
  var borrow = 0;
  for (var i = a.length-1; i >= 0; i--){
    smallDiff = String((10 + Number(a[i])) - Number(b[i]) + borrow);
    diff = smallDiff[smallDiff.length-1] + diff;
    if (i == posDot)diff = "." + diff;
    if (smallDiff.length == 1)borrow = -1;
    else borrow = 0;
  }
  if (borrow == -1)throw "Error: subr ???";
  diff = neg + trimZeros(diff);
  
  //log("subr:", diff);
  return diff;
}

function multr(a, b){
  a = new String(a); b = new String(b);
  
  var neg = "";
  if (a[0] == "-" && b[0] == "-"){
    a = a.replace("-", "");
    b = b.replace("-", "");
  }
  if (a[0] == "-" || b[0] == "-"){
    neg = "-";
    a = a.replace("-", "");
    b = b.replace("-", "");
  }
  
  var zeroArr = padZeros(a, b);
  a = zeroArr[0]; b = zeroArr[1];
  
  var posDotBef = (a.length-1 - a.indexOf(".")) * 2; // # of decimal places
  a = a.replace(".", ""); // (a.length-1 - a.indexOf(".")) gets the position of
  b = b.replace(".", ""); // the character before the "." from the end starting
                          // at 1 and "* 2" doubles the number of decimal places
  var smallProd;
  var prodarr = [];
  var carry = 0;
  for (var d = b.length-1; d >= 0; d--){
    if (b[d] == "0"){
      prodarr[d] = "0";
      continue;
    }
    prodarr[d] = "";
    while (prodarr[d].length < (b.length-1 - d))prodarr[d] = "0" + prodarr[d];
    for (var i = a.length-1; i >= 0; i--){
      smallProd = String(Number(b[d]) * Number(a[i]) + carry);
      prodarr[d] = smallProd[smallProd.length-1] + prodarr[d];
      if (smallProd.length == 2)carry = Number(smallProd[0]);
      else carry = 0;
    }
    if (carry != 0)prodarr[d] = carry + prodarr[d];
    carry = 0;
  }
  var prod = "";
  prod = prodarr.addAll();
  
  while (prod.length < posDotBef+1)prod = "0" + prod;
  
  var posDotAft = prod.length - posDotBef; // one before where dot will go
  prod = prod.substring(0, posDotAft) + "." + prod.substring(posDotAft, prod.length);
  
  prod = neg + trimZeros(prod);
  if (prod == "-0")prod = "0";
  
  //log("multr:", prod);
  return prod;
}

function powr(a, b){
  a = new String(a); b = new String(b);
  
  var mod = Number(b) % 2;
  if (mod != 1 && mod != 0)return Math.pow(Number(a), Number(b));
  
  var prod = "1";
  for (var i = 0; i < b; i++){
    prod = multr(prod, a);
  }
  
  //log("powr:", prod);
  return prod;
}

function floor(a){
  a = new String(a);
  a = trimZeros(a);
  if (a.indexOf(".") == -1)a = a + ".0";
  a = a.substring(0, a.indexOf("."));
  if (a[0] == "-")a = subr(a, "1");
  
  return a;
}

function trunc(a){
  a = new String(a);
  a = trimZeros(a);
  if (a.indexOf(".") == -1)a = a + ".0";
  a = a.substring(0, a.indexOf("."));
  
  return a;
}

function mod(a, b){
  a = new String(a); b = new String(b);
  var mod = subr(a, multr(b, trunc(divr(a,b))));
  
  return mod;
}

function divr(a, b){
  a = new String(a); b = new String(b);
  
  var neg = "";
  if (a[0] == "-" && b[0] == "-"){
    a = a.replace("-", "");
    b = b.replace("-", "");
  }
  if (a[0] == "-" || b[0] == "-"){
    neg = "-";
    a = a.replace("-", "");
    b = b.replace("-", "");
  }
  
  a = trimZeros(a);
  b = trimZeros(b);
  
  if (b == "0")throw "Error: Division by Zero";
  
  while (a.indexOf(".") != -1 || b.indexOf(".") != -1){
    a = multr(a, "10");
    b = multr(b, "10");
  }
  
  var floor = 0;
  var smallDividend;
  var remain = "0";
  var quot = "";
  var subt = "0";
  for (var i = 0; i < a.length; i++){
    //alert("i: " + i);
    smallDividend = remain + a[i];
    for (var c = 1; le(subt, smallDividend); c++){
      subt = multr(b, c);
      //alert("subt1: " + subt);
    }
    subt = multr(b, c-2);
    floor = c-2;
    remain = subr(smallDividend, subt);
    quot = quot + floor;
    subt = "0";
  }
  if (remain != "0"){
    quot = quot + ".";
    for (var currprec = 0; currprec-1 < prec; currprec++){
      //alert("currprec: " + currprec);
      smallDividend = remain + "0";
      for (var c = 1; le(subt, smallDividend); c++){
        subt = multr(b, c);
        //alert("subt2: " + subt);
      }
      subt = multr(b, c-2);
      floor = c-2;
      remain = subr(smallDividend, subt);
      quot = quot + floor;
      subt = "0";
    }
  }
  
  quot = neg + trimZeros(quot);
  
  //log("divr:", quot);
  return quot;
}

function absr(a){
  a = new String(a);
  return a.replace("-", "");
}

function getPrec(a, b){
  a = new String(a); b = new String(b);
  var diff = subr(a, b);
  diff = absr(diff);
  
  if (diff == "0")return prec;
  
  var zeros = String(diff.match(/0.0+/));
  if (zeros == "null")return 0;
  zeros = zeros.substring(zeros.indexOf(".")+1, zeros.length);
  
  return zeros.length-1;
}  

function sqrtr(a){
  a = new String(a);
  
  if (a[0] == "-")throw "Error: Cannot sqrtr() a negative number";
  var x = [];
  x[0] = String(Math.sqrt(Number(a)));
  var currprec = 0;
  var func1, func2
  for (var i = 1; currprec < prec; i++){
    func1 = subr(powr(x[i-1], "2"), a);
    func2 = multr("2", x[i-1]);
    x[i] = subr(x[i-1], divr(func1, func2));
    currprec = getPrec(x[i-1], x[i]);
  }
  
  return x[i-1];
}

////// Speed Tests

function comp(expr1, expr2){
  var d, t1, t2;
  var ta, tb;
  
  d = new Date();
  t1 = d.getTime();
  eval(expr1);
  d = new Date();
  t2 = d.getTime();
  ta = t2-t1;
  
  d = new Date();
  t1 = d.getTime();
  eval(expr2);
  d = new Date();
  t2 = d.getTime();
  tb = t2-t1;
  
  alert("expr1: " + ta + " expr2: " + tb);
}

comp("var a='534353453453453.25453453453534';a = a.replace('.', '');", "var a='534353453453453.25453453453534';var posDot=a.indexOf('.');a = a.substring(0,posDot) + a.substring(posDot+1, a.length);");
//alert(pow(closeNum([-1, 0]), closeNum([0.5, 0])));
//alert(exp(mult(closeNum([0.5, 0]), closeNum([0, "3.14159265358979323846264338327950288419716939937511"]))));
//alert(Math.cos(1.570796326794896619231321691639751442098584699687555));
//alert(ln(closeNum([-1, 0])));
//alert(mult(closeNum([0.5, 0]), closeNum([0, "3.14159265358979323846264338327950288419716939937511"])));
//alert(div(closeNum([1, 0]), closeNum([2, 0])));

//alert(sqrtr("2"));
//alert(subr(powr(1.4142135623730951, 2), 2));
//alert(divr(subr(powr(1.4142135623730951, 2), 2), (2*1.4142135623730951)));
//alert(divr("0", "0"));

//alert(divr(-1020, 1685));
//alert(sqrtr("-1"));
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