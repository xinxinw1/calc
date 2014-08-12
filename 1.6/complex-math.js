//////// Complex Number Calculator 1.6

var clone;
function math(expr){
  try {
    expr = String(expr);
    var origExpr = expr;
    
    var debug = document.getElementById("debug");
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
      varregex = new RegExp("\\b" + variables[i][0] + "\\b", "g");
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
    expr = round(calc(expr), N(prec, 0));
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

////// ‘a,b’ Functions

function getA(expr){
  return expr.substring(1, expr.indexOf(","));
}

function getB(expr){
  return expr.substring(expr.indexOf(",")+1, expr.length-1);
}

function N(a, b){
  return ("‘" + a + "," + b + "’");
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

Array.prototype.addAll = function (){
  var sum = "0";
  for (var i = 0; i < this.length; i++){
    sum = addr(sum, this[i]);
  }

  return sum;
}

////// Other Functions

function checkUndefined(funcName, argNames, args){
  for (var i = 0, len = args.length; i < len; i++){
    if (args[i] == undefined){
      throw "Error: " + funcName + ": " + argNames[i] + " is undefined";
    }
  }
}

////// Math Functions

var prec = 16; // precision

var e = "2.71828182845904523536028747135266249775724709369996";
var pi = "3.14159265358979323846264338327950288419716939937511";

var variables = [];
variables.push(["e", e]);
variables.push(["pi", pi]);

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

////// Complex Functions

function add(z, w){
  checkUndefined("add(z, w)", ["z", "w"], [z, w]);
  
  var a, b, c, d, ra, rb;
  a = getA(z); b = getB(z);
  c = getA(w); d = getB(w);
  
  ra = addr(a, c);
  rb = addr(b, d);
  
  return N(ra, rb);
}

function mult(z, w){
  checkUndefined("mult(z, w)", ["z", "w"], [z, w]);
  
  var a, b, c, d, ra, rb;
  a = getA(z); b = getB(z);
  c = getA(w); d = getB(w);
  
  ra = subr(multr(a, c), multr(b, d));
  rb = addr(multr(a, d), multr(b, c));
  
  return N(ra, rb);
}

function div(z, w){
  checkUndefined("div(z, w)", ["z", "w"], [z, w]);
  
  var a, b, c, d, ra, rb;
  a = getA(z); b = getB(z);
  c = getA(w); d = getB(w);
  
  var sum = addr(powr(c, 2), powr(d, 2));
  ra = divr(addr(multr(a, c), multr(b, d)), sum);
  rb = divr(subr(multr(b, c), multr(a, d)), sum);
  
  return N(ra, rb);
}

function arg(z){
  checkUndefined("arg(z)", ["z"], [z]);
  
  var a, b, ra;
  a = Number(getA(z)); b = Number(getB(z));
  
  ra = checkE(Math.atan2(b, a));
  
  return N(ra, 0);
}

function abs(z){
  checkUndefined("abs(z)", ["z"], [z]);
  
  var a, b, ra;
  a = getA(z); b = getB(z);
  
  ra = sqrtr(addr(powr(a, 2), powr(b, 2)));
  
  return N(ra, 0);
}

function ln(z, nprec){
  checkUndefined("ln(z)", ["z"], [z]);
  if (nprec == undefined)nprec = prec;
  
  var ra, rb;
  ra = lnr(getA(abs(z), nprec));
  rb = getA(arg(z));
  
  return N(ra, rb);
}

function exp(z){
  checkUndefined("exp(z)", ["z"], [z]);
  
  var a, b, ra, rb;
  a = getA(z); b = getB(z);
  
  var expra = expr(a);
  ra = multr(expra, cosr(b));
  rb = multr(expra, sinr(b));
  
  return N(ra, rb);
}

function pow(z, w){
  checkUndefined("pow(z, w)", ["z", "w"], [z, w]);
  
  var a, b, c, d, ra, rb;
  a = getA(z); b = getB(z);
  c = getA(w); d = getB(w);
  
  if (b == "0" && d == "0" && isInt(c)){
    return N(powr(a, c), 0);
  } else {
    return exp(mult(w, ln(z, prec)));
  }
}

function sgn(z){
  checkUndefined("sgn(z)", ["z"], [z]);

  if (getA(z) == "0" && getB(z) == "0")return N(0, 0);
  else return div(z, abs(z));
}

function root(n, z){
  checkUndefined("root(n, z)", ["n", "z"], [n, z]);
  
  var a, b, c, d;
  a = getA(n); b = getB(n);
  c = getA(z); d = getB(z);
  
  if (b != "0")throw "Error: root(n, z): n must be real";
  if (d != "0")return pow(z, div(N(1, 0), n));
  
  if (!isEven(a)){ // if n is odd return real root
    return mult(sgn(z), pow(abs(z), div(N(1, 0), n)));
  } else return pow(z, div(N(1, 0), n));
}

function sqrt(z){
  checkUndefined("sqrt(z)", ["z"], [z]);
  return root(N(2, 0), z);
}

function cbrt(z){
  checkUndefined("cbrt(z)", ["z"], [z]);
  return root(N(3, 0), z);
}

function sin(z, nprec){
  checkUndefined("sin(z, nprec)", ["z"], [z]);
  if (nprec == undefined)nprec = prec;
  
  var a, b, ra, rb;
  a = getA(z); b = getB(z);
  
  ra = multr(sinr(a), coshr(b));
  rb = multr(cosr(a), sinhr(b));
  
  return N(ra, rb);
}

function cos(z, nprec){
  checkUndefined("cos(z, nprec)", ["z"], [z]);
  if (nprec == undefined)nprec = prec;
  
  var a, b, ra, rb;
  a = getA(z); b = getB(z);
  
  ra = multr(cosr(a), coshr(b));
  rb = negn(multr(sinr(a), sinhr(b)));
  
  return N(ra, rb);
}

function round(z, nprec){
  checkUndefined("round(z)", ["z"], [z]);
  
  var a, b, c, ra, rb;
  a = getA(z); b = getB(z);
  c = 0;
  
  if (nprec != undefined){
    c = Number(getA(nprec));
    if (getB(nprec) != "0")throw "Error: round(z, nprec): nprec must be real";
  }
  
  ra = roundr(a, c);
  rb = roundr(b, c);
  
  return N(ra, rb);
}

function trunc(z){
  checkUndefined("trunc(z)", ["z"], [z]);
  
  var a, b, ra, rb;
  a = getA(z); b = getB(z);
  
  ra = truncr(a);
  rb = truncr(b);
  
  return N(ra, rb);
}

function floor(z){
  checkUndefined("floor(z)", ["z"], [z]);
  
  var a, b, ra, rb;
  a = getA(z); b = getB(z);
  
  ra = floorr(a);
  rb = floorr(b);
  
  return N(ra, rb);
}

function ceil(z){
  checkUndefined("ceil(z)", ["z"], [z]);
  
  var a, b, ra, rb;
  a = getA(z); b = getB(z);
  
  ra = ceilr(a);
  rb = ceilr(b);
  
  return N(ra, rb);
}

////// Complex Real Functions

function fact(x){
  checkUndefined("fact(x)", ["x"], [x]);
  
  if (getB(x) != "0")throw "Error: fact(x): x must be real";
  
  return N(factr(getA(x)), 0);
}

function bin(x, y){
  checkUndefined("bin(x, y)", ["x", "y"], [x, y]);
  
  if (getB(x) != "0")throw "Error: bin(x, y): x must be real";
  if (getB(y) != "0")throw "Error: bin(x, y): y must be real";
  
  return N(binr(getA(x), getA(y)), 0);
}

function agm(x, y){
  checkUndefined("agm(x, y)", ["x", "y"], [x, y]);
  
  if (getB(x) != "0")throw "Error: agm(x, y): x must be real";
  if (getB(y) != "0")throw "Error: agm(x, y): y must be real";
  
  return N(agmr(getA(x), getA(y)), 0);
}

////// Real Functions

////// Processing Functions

function padZeros(a, b){
  a = String(a); b = String(b);
  a = trimZeros(a);
  b = trimZeros(b);
  
  if (a.indexOf(".") == -1)a += ".0";
  if (b.indexOf(".") == -1)b += ".0";
  
  var alen = a.length;
  var blen = b.length;
  var adot = a.indexOf(".");
  var bdot = b.indexOf(".");
  
  for (var i = (alen-adot)-(blen-bdot); i >= 1; i--)b += "0";
  for (var i = (blen-bdot)-(alen-adot); i >= 1; i--)a += "0";
  
  for (var i = adot-bdot; i >= 1; i--)b = "0" + b;
  for (var i = bdot-adot; i >= 1; i--)a = "0" + a;
  
  return [a, b];
}

function trimZeros(a){
  a = String(a);
  
  var neg = "";
  if (isNeg(a)){
    a = a.replace("-", "");
    neg = "-";
  }
  
  for (var i = 0; i <= a.length; i++){
    if (a[i] != '0'){
      a = a.substring(i, a.length);
      break;
    }
  }
  
  if (a.indexOf(".") != -1){
    if (a[0] == '.')a = "0" + a;
    for (var i = a.length-1; i >= 0; i--){
      if (a[i] != '0'){
        a = a.substring(0, i+1);
        break;
      }
    }
    if (a[a.length-1] == '.')a = a.substring(0, a.length-1);
  }
  
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

function mDotRight(a, n){ // 32.44 -> 324.4
  a = String(a); n = Number(n);
  a = trimZeros(a);
  
  var alen = a.length;
  var adot = a.indexOf(".");
  
  if (adot != -1){
    var numZeros = n-(alen-(adot+1));
    if (numZeros >= 0){
      for (var i = numZeros; i >= 1; i--)a += "0";
      a = a.substring(0, adot) + a.substr(adot+1, n);
    } else {
      a = a.substring(0, adot) + a.substr(adot+1, n) + "." + a.substring(adot+1+n, alen);
    }
  } else {
    for (var i = n; i >= 1; i--)a += "0";
  }
  
  return a;
}

function mDotLeft(a, n){ // 32.44 -> 3.244
  a = String(a); n = Number(n);
  a = trimZeros(a);
  
  var alen = a.length;
  var adot = a.indexOf(".");
  if (adot == -1)adot = alen;
  
  var numZeros = n-adot;
  if (numZeros >= 0){
    a = a.replace(".", "");
    for (var i = numZeros; i >= 1; i--)a = "0" + a;
    a = "0." + a;
  } else {
    if (adot == alen)a = a.substring(0, adot-n) + "." + a.substr(adot-n, n);
    else {
      a = a.substring(0, adot-n) + "." + a.substr(adot-n, n) + a.substring(adot+1, alen);
    }
  }
  
  return a;
}

function getPrec(a, b, nprec){
  a = String(a); b = String(b);
  if (nprec == undefined)nprec = prec;
  
  if (isNeg(a)){
    if (!isNeg(b)){
      b = addr(a.replace("-", ""), b);
      a = "0";
    } else {
      a = a.replace("-", "");
      b = b.replace("-", "");
    }
  } else if (isNeg(b)){
    a = addr(a, b.replace("-", ""));
    b = "0";
  }
  
  var padArr = padZeros(a, b);
  a = padArr[0]; b = padArr[1];
  
  if (a == b)return nprec+1;
  
  var len = a.length;
  var dot = a.indexOf(".");
  for (var i = 0; i < len; i++){
    if (a[i] != b[i])return i-dot-2;
  }
}

function checkE(a){
  a = String(a);
  
  var ePos = a.indexOf("e");
  if (ePos == -1)return a;
  
  var frontNum = a.substring(0, ePos);
  var sign = a[ePos+1];
  var backNum = a.substring(ePos+2, a.length);
  
  if (sign == '+')return mDotRight(frontNum, backNum);
  if (sign == '-')return mDotLeft(frontNum, backNum);
}

function len(a){
  a = String(a);
  
  if (isNeg(a))a = a.replace("-", "");
  var fa = floorr(a);
  if (fa != "0")return fa.length;
  
  if (trimZeros(a) == "0")return 0;
  
  for (var i = 0; a[0] == '0'; i++){
    a = mDotRight(a, 1);
  }
  
  return -(i-1);
}

function isZero(a, nprec){ // (roundr(a, nprec) == "0")?
  a = String(a);
  
  a = a.replace("-", "");
  var posDot = a.indexOf(".");
  if (posDot == -1){
    if (a != "0")return false;
    else return true;
  }
  if (a.substring(0, posDot) != "0")return false;
  
  var end = (nprec+2 <= a.length)?nprec+2:a.length;
  for (var i = posDot+1; i < end; i++){
    if (a[i] != '0')return false;
  }
  if (i == a.length)return true;
  if (Number(a[i]) >= 5)return false;
  
  return true;
}

function negn(a){
  a = String(a);
  
  if (a == "0")return a;
  
  if (isNeg(a))return a.replace("-", "");
  else return "-" + a;
}

function isEven(a){
  a = String(a);
  
  if (!isInt(a))return false;
  
  var last = a[a.length-1];
  return (last == '0' || last == '2' || last == '4' || last == '6' || last == '8');
}

function isInt(a){
  a = String(a);
  return (a.indexOf(".") == -1);
}

function isNeg(a){
  a = String(a);
  return (a[0] == '-');
}

////// Operation Functions

function addr(a, b, nprec){
  a = String(a); b = String(b);
  
  var neg = "";
  if (isNeg(a)){
    if (!isNeg(b))return subr(b, a.replace("-", ""));
    else {
      neg = "-";
      a = a.replace("-", "");
      b = b.replace("-", "");
    }
  } else if (isNeg(b))return subr(a, b.replace("-", ""));
  
  var zeroArr = padZeros(a, b);
  a = zeroArr[0]; b = zeroArr[1];
  
  var smallSum;
  var sum = "";
  var carry = 0;
  for (var i = a.length-1; i >= 0; i--){
    if (a[i] == '.'){
      sum = "." + sum;
      continue;
    }
    smallSum = Number(a[i]) + Number(b[i]) + carry;
    if (smallSum >= 10){
      sum = (smallSum-10) + sum;
      carry = 1;
    } else {
      sum = smallSum + sum;
      carry = 0;
    }
  }
  if (carry == 1)sum = "1" + sum;
  sum = trimZeros(neg + sum);
  
  return (nprec == undefined)?sum:roundr(sum, nprec);
}

function subr(a, b, nprec){
  a = String(a); b = String(b);
  
  if (isNeg(a)){
    if (!isNeg(b))return addr(a, "-" + b);
    else {
      var c = a;
      a = b.replace("-", "");
      b = c.replace("-", "");
    }
  } else if (isNeg(b))return addr(a, b.replace("-", ""));
  
  var zeroArr = padZeros(a, b);
  a = zeroArr[0]; b = zeroArr[1];
  
  var neg = "";
  if (gt(b, a)){
    var c = a;
    a = b;
    b = c;
    neg = "-";
  }
  
  var smallDiff;
  var diff = "";
  var borrow = 0;
  for (var i = a.length-1; i >= 0; i--){
    if (a[i] == '.'){
      diff = "." + diff;
      continue;
    }
    smallDiff = 10 + Number(a[i]) - Number(b[i]) + borrow;
    if (smallDiff >= 10){
      diff = (smallDiff-10) + diff;
      borrow = 0;
    } else {
      diff = smallDiff + diff;
      borrow = -1;
    }
  }
  diff = trimZeros(neg + diff);
  
  return (nprec == undefined)?diff:roundr(diff, nprec);
}

function multr(a, b, nprec){
  a = String(a); b = String(b);
  
  var neg = "";
  if (isNeg(a) ^ isNeg(b))neg = "-";
  
  a = a.replace("-", "");
  b = b.replace("-", "");
  
  a = trimZeros(a);
  b = trimZeros(b);
  
  if (b.length > a.length){
    var c = a;
    a = b;
    b = c;
  }
  
  var aDotBack = (a.indexOf(".") == -1)?0:a.length-(a.indexOf(".")+1);
  var bDotBack = (b.indexOf(".") == -1)?0:b.length-(b.indexOf(".")+1);
  var origDotBack = aDotBack + bDotBack;
  a = a.replace(".", "");
  b = b.replace(".", "");
  
  var aarr = [];
  var barr = [];
  for (var i = a.length-7; i > -7; i = i-7){
    aarr.unshift(Number(a.substring(i, i+7)));
  }
  for (var i = b.length-7; i > -7; i = i-7){
    barr.unshift(Number(b.substring(i, i+7)));
  }
  
  var smallProd, sPLen;
  var prodarr = [];
  var carry = 0;
  for (var d = barr.length-1, g = 0; d >= 0; d--, g++){
    if (barr[d] == 0){
      prodarr[g] = "0";
      continue;
    }
    prodarr[g] = "";
    for (var f = g; f >= 1; f--)prodarr[g] += "0000000";
    for (var i = aarr.length-1; i >= 0; i--){
      smallProd = String(barr[d] * aarr[i] + carry);
      sPLen = smallProd.length;
      prodarr[g] = smallProd.substring(sPLen-7, sPLen) + prodarr[g];
      if (sPLen > 7){
        carry = Number(smallProd.substring(0, sPLen-7));
      } else {
        carry = 0;
        for (var h = 7-sPLen; h > 0; h--){
          prodarr[g] = "0" + prodarr[g];
        }
      }
    }
    if (carry != 0){
      prodarr[g] = carry + prodarr[g];
      carry = 0;
    }
  }
  var prod = prodarr.addAll();
  
  for (var i = origDotBack-prod.length+1; i >= 1; i--)prod = "0" + prod;
  var newPosDot = prod.length-origDotBack;
  prod = prod.substring(0, newPosDot) + "." + prod.substring(newPosDot, prod.length);
  
  prod = trimZeros(neg + prod);
  
  return (nprec == undefined)?prod:roundr(prod, nprec);
}

function divr(a, b, nprec){
  a = String(a); b = String(b);
  if (nprec == undefined)nprec = prec;
  
  var neg = "";
  if (isNeg(a) ^ isNeg(b))neg = "-";
  
  a = a.replace("-", "");
  b = b.replace("-", "");
  
  a = trimZeros(a);
  b = trimZeros(b);
  
  if (b == "0")throw "Error: divr(a, b, nprec): b cannot be 0";
  if (a == "0")return "0";
  
  while (a.indexOf(".") != -1 || b.indexOf(".") != -1){
    a = mDotRight(a, 1);
    b = mDotRight(b, 1);
  }
  
  var smallDividend;
  var bMultArr = ["0", b];
  var quot = "";
  var remain = "0";
  for (var i = 0; i < a.length; i++){
    smallDividend = remain + a[i];
    while (smallDividend.length < b.length && i+1 < a.length){
      i++;
      smallDividend += a[i];
      quot += "0";
    }
    for (var c = 1; le(bMultArr[c], smallDividend); c++){
      if (c+1 == bMultArr.length)bMultArr[c+1] = addr(bMultArr[c], b);
    }
    remain = subr(smallDividend, bMultArr[c-1]);
    quot += c-1;
  }
  if (remain != "0"){
    quot += ".";
    for (var currprec = 0; currprec < nprec+1; currprec++){
      if (remain == "0")break;
      smallDividend = remain + "0";
      while (smallDividend.length < b.length){
        smallDividend += "0";
        quot += "0";
      }
      for (var c = 1; le(bMultArr[c], smallDividend); c++){
        if (c+1 == bMultArr.length)bMultArr[c+1] = addr(bMultArr[c], b);
      }
      remain = subr(smallDividend, bMultArr[c-1]);
      quot += c-1;
    }
  }
  
  quot = trimZeros(neg + quot);
  
  return roundr(quot, nprec);
}

function powr(a, b, nprec){
  a = String(a); b = String(b);
  
  var neg = false;
  if (isNeg(b)){
    neg = true;
    b = b.replace("-", "");
  }
  
  var pow;
  if (isInt(b)){
    if (isInt(a) || nprec == undefined)pow = powrn(a, b);
    else pow = powrd(a, b, nprec);
  } else pow = checkE(Math.pow(Number(a), Number(b)));
  
  return (neg)?divr(1, pow):pow;
}

// http://en.wikipedia.org/wiki/Exponentiation_by_squaring
function powrn(a, n){
  a = String(a); n = Number(n);
  
  var prod = "1";
  while (n > 0){
    if (n % 2 == 1){
      prod = multr(prod, a);
      n--;
    }
    a = multr(a, a);
    n = n/2;
  }
  
  return prod;
}

function powrd(a, n, nprec){
  a = String(a); n = Number(n);
  if (nprec == undefined)nprec = prec;
  
  if (n == 0)return "1";
  
  var neg = "";
  if (isNeg(a) && n % 2 == 1){
    neg = "-";
    a = a.replace("-", "");
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
  x[0] = "1";
  x[1] = a;
  for (var i = 1; i <= n-1; i++){
    d[i][2] = d[i+1][1] + len(x[i])+1;
    x[i+1] = multr(roundr(x[i], d[i][1]), roundr(x[1], d[i][2]));
    if (x[i+1] == '0')return "0";
  }
  
  var prod = trimZeros(neg + x[n]);
  
  return roundr(prod, nprec);
}

// Newton's method
function sqrtr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  if (isNeg(a))throw "Error: sqrtr(a, nprec): a cannot be negative";
  var sqrt = checkE(Math.sqrt(Number(a)));
  var func1;
  while (true){
    func1 = subr(multr(sqrt, sqrt, nprec+2), a);
    func1 = divr(func1, multr("2", sqrt), nprec+1);
    if (isZero(func1, nprec+1))break;
    sqrt = subr(sqrt, func1);
  }
  
  return roundr(sqrt, nprec);
}

function factr(a){
  a = String(a);
  
  if (!isInt(a) || isNeg(a)){
    throw "Error: factr(a): a must be a positive integer";
  }
  
  var prod = "1";
  for (var i = a; i > 1; i--){
    prod = multr(prod, i);
  }
  
  return prod;
}

function expr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var neg = false;
  if (isNeg(a)){
    a = a.replace("-", "");
    neg = true;
  }
  
  if (a.indexOf(".") == -1){
    var exp = powr(e, a, nprec+1);
  } else {
    var i = floorr(a);
    a = subr(a, i);
    if (gt(a, "0.5")){
      a = subr(a, 1);
      i = addr(i, 1);
    }
    
    var exp = expsmall(a, nprec + len(powr(e, i, 2))+1);
    exp = multr(exp, powr(e, i, nprec + len(exp)+1));
  }
  
  if (neg)return divr(1, exp, nprec);
  else return roundr(exp, nprec);
}

// Taylor Series
function expsmall(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var frac1 = a;
  var frac2 = "1";
  var frac = "1";
  var exp = addr(a, 1);
  for (var i = 2; true; i++){
    frac1 = powr(a, i, nprec+2);
    frac2 = multr(frac2, i);
    frac = divr(frac1, frac2, nprec+2);
    if (isZero(frac, nprec+1))break;
    exp = addr(exp, frac);
  }
  
  return roundr(exp, nprec);
}

// Newton's method
function lnr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  if (isNeg(a))throw "Error: lnr(a, nprec): a cannot be negative";
  if (a == "0")throw "Error: lnr(a, nprec): a cannot be zero";
  
  var ln = checkE(Math.log(Number(a)));
  var func1, func2;
  for (var i = 1; true; i++){
    func1 = subr(divr(a, expr(ln, nprec+2), nprec+2), 1);
    if (isZero(func1, nprec+1))break;
    ln = addr(func1, ln);
  }
  
  return roundr(ln, nprec);
}

function floorr(a){
  a = String(a);
  a = trimZeros(a);
  
  var adot = a.indexOf(".");
  if (adot == -1)return a;
  
  a = a.substring(0, adot);
  
  if (isNeg(a)){
    a = a.replace("-", "");
    var alen = a.length;
    for (var i = alen-1; i >= 0; i--){
      if (a[i] != '9'){
        a = a.substring(0, i) + (Number(a[i])+1);
        for (var d = alen-(i+1); d >= 1; d--)a += 0;
        break;
      }
    }
    if (i == -1){
      a = "1";
      for (var d = alen; d >= 1; d--)a += 0;
    }
    a = "-" + a;
  }
  
  return trimZeros(a);
}

function ceilr(a){
  a = String(a);
  a = trimZeros(a);
  
  var adot = a.indexOf(".");
  if (adot == -1)return a;
  
  a = a.substring(0, adot);
  
  if (!isNeg(a)){
    var alen = a.length;
    for (var i = alen-1; i >= 0; i--){
      if (a[i] != '9'){
        a = a.substring(0, i) + (Number(a[i])+1);
        for (var d = alen-(i+1); d >= 1; d--)a += 0;
        break;
      }
    }
    if (i == -1){
      a = "1";
      for (var d = alen; d >= 1; d--)a += 0;
    }
  }
  
  return trimZeros(a);
}

function truncr(a){
  a = String(a);
  a = trimZeros(a);
  
  var adot = a.indexOf(".");
  if (adot == -1)return a;
  
  a = a.substring(0, adot);
  
  return a;
}

function modr(a, b){
  a = String(a); b = String(b);
  a = trimZeros(a); b = trimZeros(b);
  
  var bMultArr = ["0", b];
  for (var c = 1; le(bMultArr[c], a); c++){
    bMultArr[c+1] = addr(bMultArr[c], b);
  }
  
  return subr(a, bMultArr[c-1]);
}

function absr(a){
  a = String(a);
  return a.replace("-", "");
}

function roundr(a, nprec){
  a = String(a);
  a = trimZeros(a);
  
  var neg = "";
  if (isNeg(a)){
    a = a.replace("-", "");
    neg = "-";
  }
  
  var alen = a.length;
  var adot = a.indexOf(".");
  
  if (adot == -1)return neg + a;
  
  if (nprec == undefined || nprec == 0){
    if (Number(a[adot+1]) >= 5)return trimZeros(neg + ceilr(a));
    else return trimZeros(neg + floorr(a));
  }
  
  if (adot == -1 || adot+nprec+1 >= alen)return neg + a;
  
  if (Number(a[adot+nprec+1]) >= 5){
    for (var i = adot+nprec; i >= 0; i--){
      if (a[i] == '.')continue;
      if (a[i] != '9'){
        a = a.substring(0, i) + (Number(a[i])+1);
        for (var d = adot-(i+1); d >= 1; d--)a += 0;
        break;
      }
    }
    if (i == -1){
      a = "1";
      for (var d = adot; d >= 1; d--)a += 0;
    }
  } else {
    a = a.substring(0, adot+nprec+1);
  }
  
  return trimZeros(neg + a);
}

function binr(n, k){
  n = String(n); k = String(k);
  
  if (gt(k, n))throw "Error: binr(n, k): k must be <= n";
  if (!isInt(k) || !isInt(n) || isNeg(k) || isNeg(n)){
    throw "Error: binr(n, k): n and k must be positive integers";
  }
  
  return divr(factr(n), multr(factr(k), factr(subr(n, k))));
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

function sinr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var neg = false;
  if (isNeg(a)){
    a = a.replace("-", "");
    neg = !neg;
  }
  
  var tPI = multr(2, pi);
  a = subr(a, multr(divr(a, tPI, 0), tPI));
  
  if (isNeg(a)){
    a = a.replace("-", "");
    neg = !neg;
  }
  
  var hPI = divr(pi, 2, nprec+2);
  var numhPIs = divr(a, hPI, 0);
  // a = subr(a, multr(numhPI, hPI));
  var sin;
  switch (numhPIs){
    case "0":
      sin = sinsmall(a, nprec+1);
      break;
    case "1":
      a = subr(a, hPI);
      sin = cossmall(a, nprec+1);
      break;
    case "2":
      a = subr(a, addr(hPI, hPI));
      sin = sinsmall(a, nprec+1);
      neg = !neg;
      break;
    case "3":
      a = subr(a, addr(hPI, pi));
      sin = cossmall(a, nprec+1);
      neg = !neg;
      break;
  }
  
  sin = roundr(sin, nprec);
  
  if (neg)sin = negn(sin);
  
  return sin;
}

function sinsmall(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var isInt = (a.indexOf(".") == -1);
  var frac1 = a;
  var frac2 = "1";
  var frac;
  var sin = a;
  var neg = true;
  var a2 = multr(a, a);
  for (var i = 3; true; i += 2, neg = !neg){
    if (isInt)frac1 = multr(frac1, a2);
    else frac1 = powrd(a, i, nprec+2);
    frac2 = multr(frac2, multr(i, i-1));
    frac = divr(frac1, frac2, nprec+2);
    if (isZero(frac, nprec+1))break;
    if (neg)sin = subr(sin, frac);
    else sin = addr(sin, frac);
  }
  
  return roundr(sin, nprec);
}

function cosr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var neg = false;
  if (isNeg(a)){
    a = a.replace("-", "");
  }
  
  var tPI = multr(2, pi);
  a = subr(a, multr(divr(a, tPI, 0), tPI));
  
  if (isNeg(a)){
    a = a.replace("-", "");
  }
  
  var hPI = divr(pi, 2, nprec+2);
  var numhPIs = divr(a, hPI, 0);
  // a = subr(a, multr(numhPI, hPI));
  var cos;
  switch (numhPIs){
    case "0":
      cos = cossmall(a, nprec+1);
      break;
    case "1":
      a = subr(a, hPI);
      cos = sinsmall(a, nprec+1);
      neg = !neg;
      break;
    case "2":
      a = subr(a, addr(hPI, hPI));
      cos = cossmall(a, nprec+1);
      neg = !neg;
      break;
    case "3":
      a = subr(a, addr(hPI, pi));
      cos = sinsmall(a, nprec+1);
      break;
  }
  
  cos = roundr(cos, nprec);
  
  if (neg)cos = negn(cos);
  
  return cos;
}

function cossmall(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var isInt = (a.indexOf(".") == -1);
  var frac1 = "1";
  var frac2 = "1";
  var frac;
  var cos = "1";
  var neg = true;
  var a2 = multr(a, a);
  for (var i = 2; true; i += 2, neg = !neg){
    if (isInt)frac1 = multr(frac1, a2);
    else frac1 = powrd(a, i, nprec+2);
    frac2 = multr(frac2, multr(i, i-1));
    frac = divr(frac1, frac2, nprec+2);
    if (isZero(frac, nprec+1))break;
    if (neg)cos = subr(cos, frac);
    else cos = addr(cos, frac);
  }
  
  return roundr(cos, nprec);
}

function sinhr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var exp = expr(a, nprec+2);
  var recexp = divr(1, exp, nprec+1);
  
  var sinh = divr(subr(exp, recexp), 2, nprec+1);
  
  return roundr(sinh, nprec);
}

function coshr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var exp = expr(a, nprec+2);
  var recexp = divr(1, exp, nprec+1);
  
  var cosh = divr(addr(exp, recexp), 2, nprec+1);
  
  return roundr(cosh, nprec);
}

////// GUI

var results = document.getElementById("results");
function display(origExpr, expr){
  var write = "";
  
  write += "<p>";
  write += "<span class=\"b\">";
  write += origExpr;
  write += "</span>";
  write += "<br>";
  write += "= ";
  write += expr;
  write += "</p>";
  
  results.innerHTML += write;
  results.scrollTop = results.scrollHeight;
}

var side = document.getElementById("side");
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