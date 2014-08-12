//////// Complex Number Calculator 1.1

function math(expr){
  try {
    expr = String(expr);
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
    expr = expr.replace(/(\b[0-9.]+)\b(?!i)/g, "‘$1,0’"); // real numbers
    expr = expr.replace(/(\b[0-9.]+)i\b/g, "‘0,$1’"); // imaginary numbers
    expr = expr.replace(/\bi\b/g, "‘0,1’"); // "i" or "-i"
    expr = expr.replace(/-/g, "‘-1,0’*"); // "-" (ex. "-(23)")
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
    expr = calcCharOnce(expr, "^", "pow", expr.lastIndexOf("^"));
  }
  
  var sign, func;
  while (expr.indexOf("*") != -1 || expr.indexOf("/") != -1){
    sign = String(expr.match(/[*\/]/));
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

var debug = document.getElementById("debug");
function clearLog(){
  while (debug.childNodes.length > 0){
    debug.removeChild(debug.childNodes[0]);
  }
}

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

  debug.appendChild(tr);
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

var prec = 16; // precision

var e = "2.71828182845904523536028747135266249775724709369996";
var pi = "3.14159265358979323846264338327950288419716939937511";

var variables = [];
variables.push(["e", e]);
variables.push(["pi", pi]);

var functions = [];
functions.push(["arg", "arg"]);
functions.push(["Arg", "arg"]);
functions.push(["ln", "ln"]);
functions.push(["abs", "abs"]);
functions.push(["exp", "exp"]);
functions.push(["sgn", "sgn"]);
functions.push(["sign", "sgn"]);
functions.push(["root", "root"]);
functions.push(["sqrt", "sqrt"]);
functions.push(["cbrt", "cbrt"]);
functions.push(["pow", "pow"]);
functions.push(["fact", "fact"]);
functions.push(["bin", "bin"]);
functions.push(["agm", "agm"]);
functions.push(["round", "round"]);
functions.push(["trunc", "trunc"]);
functions.push(["floor", "floor"]);
functions.push(["ceil", "ceil"]);

////// Complex Functions

function add(z, w){
  var a, b, c, d;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  var warr = openNum(w);
  c = warr[0]; d = warr[1];
  
  var resarr = [];
  resarr[0] = addr(a, c);
  resarr[1] = addr(b, d);
  
  return closeNum(resarr);
}

function mult(z, w){
  var a, b, c, d;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  var warr = openNum(w);
  c = warr[0]; d = warr[1];
  
  var resarr = [];
  resarr[0] = subr(multr(a, c), multr(b, d));
  resarr[1] = addr(multr(a, d), multr(b, c));
  
  return closeNum(resarr);
}

function div(z, w){
  var a, b, c, d;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  var warr = openNum(w);
  c = warr[0]; d = warr[1];
  
  var resarr = [];
  resarr[0] = divr(addr(multr(a,c), multr(b,d)), addr(powr(c,2), powr(d,2)));
  resarr[1] = divr(subr(multr(b,c), multr(a,d)), addr(powr(c,2), powr(d,2)));
  
  return closeNum(resarr);
}

function arg(z){
  var a, b;
  
  var zarr = openNum(z);
  zarr.num();
  a = zarr[0]; b = zarr[1];
  
  var resarr = [];
  resarr[0] = checkE(Math.atan2(b, a));
  resarr[1] = 0;
  
  return closeNum(resarr);
}

function abs(z){
  var a, b;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  
  var resarr = [];
  resarr[0] = sqrtr(addr(powr(a, 2), powr(b, 2)));
  resarr[1] = 0;
  
  return closeNum(resarr);
}

function ln(z){
  var resarr = [];
  resarr[0] = checkE(Math.log(openNum(abs(z))[0]));
  resarr[1] = openNum(arg(z))[0];
  
  return closeNum(resarr);
}

function exp(z){
  var a, b;
  
  var zarr = openNum(z);
  zarr.num();
  a = zarr[0]; b = zarr[1];
  
  var resarr = [];
  resarr[0] = multr(powr(e, a), checkE(Math.cos(b)));
  resarr[1] = multr(powr(e, a), checkE(Math.sin(b)));
  
  return closeNum(resarr);
}

function pow(z, w){
  return exp(mult(w, ln(z)));
}

function sgn(z){
  var a, b;
  
  var zarr = openNum(z);
  zarr.num();
  a = zarr[0]; b = zarr[1];
  
  if (a == 0 && b == 0)return closeNum([0, 0]);
  else return div(z, abs(z));
}

function root(n, z){
  var a, b, c, d;
  
  var narr = openNum(n);
  narr.num();
  a = narr[0]; b = narr[1];
  
  if (b != 0)throw "Error: root(n, z): n must be real";
  
  var zarr = openNum(z);
  zarr.num();
  c = zarr[0]; d = zarr[1];
  
  if (d != 0)return pow(z, div(closeNum([1, 0]), n));
  
  if ((a % 2) == 1){ // if n is odd return real root
    return mult(sgn(z), pow(abs(z), div(closeNum([1, 0]), n)));
  } else return pow(z, div(closeNum([1, 0]), n));
}

function sqrt(z){
  return root(closeNum([2, 0]), z);
}

function cbrt(z){
  return root(closeNum([3, 0]), z);
}

////// Complex Real Functions

function fact(x){
  var a, b;
  
  var xarr = openNum(x);
  a = xarr[0]; b = xarr[1];
  
  if (b != "0")throw "Error: fact(x): x must be real";
  
  var resarr = [];
  resarr[0] = factr(a);
  resarr[1] = 0;
  
  return closeNum(resarr);
}

function bin(x, y){
  var a, b, c, d;
  
  var xarr = openNum(x);
  a = xarr[0]; b = xarr[1];
  
  if (b != "0")throw "Error: bin(x, y): x must be real";
  
  var yarr = openNum(y);
  c = yarr[0]; d = yarr[1];
  
  if (d != "0")throw "Error: bin(x, y): y must be real";
  
  var resarr = [];
  resarr[0] = binr(a, c);
  resarr[1] = 0;
  
  return closeNum(resarr);
}

function agm(x, y){
  var a, b, c, d;
  
  var xarr = openNum(x);
  a = xarr[0]; b = xarr[1];
  
  if (b != "0")throw "Error: agm(x, y): x must be real";
  
  var yarr = openNum(y);
  c = yarr[0]; d = yarr[1];
  
  if (d != "0")throw "Error: agm(x, y): y must be real";
  
  var resarr = [];
  resarr[0] = agmr(a, c);
  resarr[1] = 0;
  
  return closeNum(resarr);
}

function round(x, nprec){
  var a, b, c, d;
  
  var xarr = openNum(x);
  a = xarr[0]; b = xarr[1];
  
  if (b != "0")throw "Error: round(x, nprec): x must be real";
  
  var narr = openNum(nprec);
  c = narr[0]; d = narr[1];
  
  if (d != "0")throw "Error: round(x, nprec): nprec must be real";
  
  var resarr = [];
  resarr[0] = roundr(a, c);
  resarr[1] = 0;
  
  return closeNum(resarr);
}

function trunc(x){
  var a, b;
  
  var xarr = openNum(x);
  a = xarr[0]; b = xarr[1];
  
  if (b != "0")throw "Error: trunc(x): x must be real";
  
  var resarr = [];
  resarr[0] = truncr(a);
  resarr[1] = 0;
  
  return closeNum(resarr);
}

function floor(x){
  var a, b;
  
  var xarr = openNum(x);
  a = xarr[0]; b = xarr[1];
  
  if (b != "0")throw "Error: floor(x): x must be real";
  
  var resarr = [];
  resarr[0] = floorr(a);
  resarr[1] = 0;
  
  return closeNum(resarr);
}

function ceil(x){
  var a, b;
  
  var xarr = openNum(x);
  a = xarr[0]; b = xarr[1];
  
  if (b != "0")throw "Error: ceil(x): x must be real";
  
  var resarr = [];
  resarr[0] = ceilr(a);
  resarr[1] = 0;
  
  return closeNum(resarr);
}

////// Real Functions

////// Processing Functions

function padZeros(a, b){
  a = String(a); b = String(b);
  a = trimZeros(a);
  b = trimZeros(b);
  
  var aToDot, bToDot;
  aToDot = a.substring(0, (a.indexOf(".") == -1)?a.length:a.indexOf("."));
  bToDot = b.substring(0, (b.indexOf(".") == -1)?b.length:b.indexOf("."));
  
  var dotToA, dotToB;
  dotToA = (a.indexOf(".") == -1)?"0":a.substring(a.indexOf(".")+1, a.length);
  dotToB = (b.indexOf(".") == -1)?"0":b.substring(b.indexOf(".")+1, b.length);
  
  while (aToDot.length < bToDot.length)aToDot = "0" + aToDot;
  while (bToDot.length < aToDot.length)bToDot = "0" + bToDot;
  
  while (dotToA.length < dotToB.length)dotToA = dotToA + "0";
  while (dotToB.length < dotToA.length)dotToB = dotToB + "0";
  
  a = aToDot + "." + dotToA;
  b = bToDot + "." + dotToB;
  
  return [a, b];
}

function trimZeros(a){
  a = String(a);
  var neg = "";
  if (a[0] == "-"){
    neg = "-";
    a = a.substring(1, a.length);
  }
  for (var i = 0; i <= a.length; i++){
    if (a[i] != "0"){
      a = a.substring(i, a.length);
      break;
    }
  }
  if (a[0] == ".")a = "0" + a;
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
  if (a != "0")a = neg + a;
  
  return a;
}

function gt(a, b){ // is (a > b) ?
  a = String(a); b = String(b);
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

function mDotBack(a, n){ // 32.44 -> 324.4
  a = String(a); n = Number(n);
  
  var posDot = (a.indexOf(".") == -1)?a.length:a.indexOf(".");
  var aToDot = a.substring(0, posDot);
  var dotToA = a.substring(posDot+1, a.length);
  
  var dot = ".";
  if (dotToA.length <= n)dot = "";
  while (dotToA.length < n)dotToA = dotToA + "0";
  
  a = aToDot + dotToA;
  
  a = a.substring(0, posDot+n) + dot + a.substring(posDot+n, a.length);
  
  return trimZeros(a);
}

function mDotForward(a, n){
  a = String(a); n = Number(n);
  
  var posDot = (a.indexOf(".") == -1)?a.length:a.indexOf(".");
  var posDotBack = (a.indexOf(".") == -1)?0:a.length-1-a.indexOf(".");
  var aToDot = a.substring(0, posDot);
  var dotToA = a.substring(posDot+1, a.length);
  
  var dot = ".";
  if (aToDot.length <= n)dot = "0.";
  if (dotToA.length == 0 && n == 0)dot = "";
  while (aToDot.length < n)aToDot = "0" + aToDot;
  
  a = aToDot + dotToA;
  
  a = a.substring(0, a.length-(posDotBack+n)) + dot + a.substring(a.length-(posDotBack+n), a.length);
  
  return trimZeros(a);
}

function getPrec(a, b, nprec){
  a = String(a); b = String(b);
  if (nprec == undefined)nprec = prec;
  var diff = absr(subr(a, b));
  
  if (diff == "0")return nprec+1;
  
  var zeros = String(diff.match(/^0.0+/));
  if (zeros == "null")return 0;
  zeros = zeros.substring(zeros.indexOf(".")+1, zeros.length);
  
  return zeros.length-1;
}

function checkE(a){
  a = String(a);
  
  var ePos = a.indexOf("e");
  if (ePos == -1)return a;
  var frontNum = a.substring(0, ePos);
  var sign = a.substr(ePos+1, 1);
  var backNum = a.substring(ePos+2, a.length);
  if (sign == "+")return multr(frontNum, powr(10, backNum));
  if (sign == "-")return divr(frontNum, powr(10, backNum));
  
  throw "Error: checkE(): ???";
}

function len(a){
  a = String(a);
  
  var fa = floorr(a);
  if (fa != "0")return fa.length;
  
  if (trimZeros(a) == "0")return 0;
  
  for (var i = 0; a[0] == "0"; i++){
    a = mDotBack(a, 1);
  }
  
  return -(i-1);
}

////// Operation Functions

function addr(a, b){
  a = String(a); b = String(b);
  
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
  
  return sum;
}

function subr(a, b){
  a = String(a); b = String(b);
  
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
  if (borrow == -1)throw "Error: subr(): ???";
  diff = neg + trimZeros(diff);
  
  return diff;
}

function multr(a, b, nprec){
  a = String(a); b = String(b);
  
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
  
  if (gt(b, a)){
    var c = a;
    a = b;
    b = c;
  }
  
  var posDotA = (a.indexOf(".") == -1)?(a.length-1):a.indexOf(".");
  var posDotB = (b.indexOf(".") == -1)?(b.length-1):b.indexOf(".");
  var posDotBef = (a.length-1 - posDotA) + (b.length-1 - posDotB);
  
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
  var prod = prodarr.addAll();
  
  while (prod.length < posDotBef+1)prod = "0" + prod;
  
  var posDotAft = prod.length - posDotBef; // one before where dot will go
  prod = prod.substring(0, posDotAft) + "." + prod.substring(posDotAft, prod.length);
  
  prod = neg + trimZeros(prod);
  if (prod == "-0")prod = "0";
  
  if (nprec == undefined)return prod;
  else return roundr(prod, nprec);
}

function divr(a, b, nprec){
  a = String(a); b = String(b);
  
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
  
  if (b == "0")throw "Error: divr(a, b, nprec): b cannot be 0";
  if (a == "0")return "0";
  
  while (a.indexOf(".") != -1 || b.indexOf(".") != -1){
    a = mDotBack(a, 1);
    b = mDotBack(b, 1);
  }
  
  var floor = 0;
  var smallDividend;
  var remain = "0";
  var quot = "";
  var subt = "0";
  for (var i = 0; i < a.length; i++){
    smallDividend = remain + a[i];
    for (var c = 1; le(subt, smallDividend); c++){
      subt = addr(subt, b);
    }
    subt = subr(subt, b);
    floor = c-2;
    remain = subr(smallDividend, subt);
    quot = quot + floor;
    subt = "0";
  }
  if (nprec == undefined)nprec = prec;
  if (remain != "0"){
    quot = quot + ".";
    for (var currprec = 0; currprec < nprec+1; currprec++){
      smallDividend = remain + "0";
      for (var c = 1; le(subt, smallDividend); c++){
        subt = addr(subt, b);
      }
      subt = subr(subt, b);
      floor = c-2;
      remain = subr(smallDividend, subt);
      quot = quot + floor;
      subt = "0";
    }
  }
  
  quot = neg + roundr(quot, nprec);
  
  return quot;
}

function powr(a, b, nprec){
  a = String(a); b = String(b);
  if (nprec == undefined)nprec = prec;
  var na = Number(a); var nb = Number(b);
  
  var mod;
  
  mod = nb % 2;
  if (mod != 1 && mod != 0)return checkE(Math.pow(na, nb));
  
  mod = na % 2;
  if (mod != 1 && mod != 0)return powrd(a, b, nprec);
  
  return powrn(a, b, nprec);
}

// http://en.wikipedia.org/wiki/Exponentiation_by_squaring
function powrn(a, n, nprec){
  a = String(a); n = Number(n);
  if (nprec == undefined)nprec = prec;
  
  var prod = "1";
  while (n > 0){
    if (n % 2 == 1){
      prod = multr(prod, a);
      n--;
    }
    a = multr(a, a);
    n = n/2;
  }
  
  return roundr(prod, nprec);
}

function powrd(a, n, nprec){
  a = String(a); n = Number(n);
  if (nprec == undefined)nprec = prec;
  
  var neg = "";
  if (a[0] == "-"){
    var mod = n % 2;
    if (mod == 1){
      neg = "-";
      a = a.replace("-", "");
    }
  }
  
  var length = len(a)+1;
  var d = [];
  d[n] = [];
  d[n][1] = nprec;
  for (var i = n-1; i >= 1; i--){
    d[i] = [];
    d[i][1] = d[i+1][1] + length;
  }
  var x = [];
  x[1] = a;
  for (var i = 1; i <= n-1; i++){
    d[i][2] = d[i+1][1] + len(x[i])+1;
    x[i+1] = multr(roundr(x[i], d[i][1]), roundr(x[1], d[i][2]));
    if (x[i+1] == "0")return "0";
  }
  
  var prod = neg + roundr(x[n], nprec);
  if (prod == "-0")prod = "0";
  
  return prod;
}

function sqrtr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  if (a[0] == "-")throw "Error: sqrtr(a, nprec): a cannot be negative";
  var x = [];
  x[0] = checkE(Math.sqrt(Number(a)));
  var currprec = 0;
  var func1, func2
  for (var i = 1; currprec < nprec+1; i++){ // Newton's method
    func1 = subr(powr(x[i-1], "2"), a);
    func2 = multr("2", x[i-1]);
    x[i] = subr(x[i-1], divr(func1, func2, nprec+1));
    currprec = getPrec(x[i-1], x[i], nprec);
  }
  
  return roundr(x[i-1], nprec);
}

function factr(a){
  a = String(a);
  
  var mod = Number(a) % 2;
  if (mod != 1 && mod != 0)throw "Error: factr(a): a must be an integer";
  
  var prod = "1";
  for (var i = a; i > 1; i--){
    prod = multr(prod, i);
  }
  
  return prod;
}

function floorr(a){
  a = String(a);
  a = trimZeros(a);
  if (a.indexOf(".") == -1)return a;
  a = a.substring(0, a.indexOf("."));
  if (a[0] == "-")a = subr(a, "1");
  a = trimZeros(a);
  
  return a;
}

function ceilr(a){
  a = String(a);
  a = trimZeros(a);
  if (a.indexOf(".") == -1)return a;
  a = a.substring(0, a.indexOf("."));
  if (a[0] != "-")a = addr(a, "1");
  a = trimZeros(a);
  
  return a;
}

function truncr(a){
  a = String(a);
  a = trimZeros(a);
  if (a.indexOf(".") == -1)a = a + ".0";
  a = a.substring(0, a.indexOf("."));
  a = trimZeros(a);
  
  return a;
}

function modr(a, b){
  a = String(a); b = String(b);
  var mod = subr(a, multr(b, truncr(divr(a,b))));
  
  return mod;
}

function absr(a){
  a = String(a);
  return a.replace("-", "");
}

function roundr(a, nprec){
  a = String(a);
  if (a.indexOf(".") == -1)return trimZeros(a);
  
  if (nprec == undefined){
    if (a[0] != "-"){
      if (Number(a[a.indexOf(".")+1]) >= 5)return ceilr(a);
      else return floorr(a);
    } else {
      if (Number(a[a.indexOf(".")+1]) >= 5)return floorr(a);
      else return ceilr(a);
    }
  }
  
  var neg = "";
  if (a[0] == "-")neg = "-";
  a = a.replace("-", "");
  
  var dotToA = a.substring(a.indexOf(".")+1, a.length);
  if (dotToA.length <= nprec)return neg + trimZeros(a);
  
  if (Number(dotToA[nprec]) >= 5){
    var zeros = "";
    for (var i = 0; i < nprec-1; i++){
      zeros = "0" + zeros;
    }
    a = addr(a, "0." + zeros + "1");
    dotToA = a.substring(a.indexOf(".")+1, a.length);
  }
  dotToA = dotToA.substring(0, nprec);
  a = a.substring(0, a.indexOf(".")+1) + dotToA;
  
  a = neg + trimZeros(a);
  if (a == "-0")a = "0";
  
  return a;
}

function binr(n, k){
  n = String(n); k = String(k);
  if (Number(k) > Number(n))throw "Error: binr(n, k): n must be > k";
  return divr(factr(n), multr(factr(k), factr(n-k)));
}

function agmr(a, b, nprec){
  a = String(a); b = String(b);
  if (nprec == undefined)nprec = prec;
  
  var currprec = 0;
  for (var i = 0; currprec < nprec+1; i++){
    c = divr(addr(a, b), 2, nprec+1);
    d = sqrtr(multr(a, b), nprec+1);
    currprec = getPrec(a, c, nprec);
    a = c; b = d;
  }
  
  return roundr(c, nprec);
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