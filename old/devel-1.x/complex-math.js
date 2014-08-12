//////// Complex Number Calculator Devel

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
    
    //// changes all - to +- when there is a number before it
    expr = expr.replace(/([i0-9)])-/g, "$1+-");
    log("\"-\" -> \"+-\" :", expr);
    
    //// changes all numbers to ‘a,b’ (ex. -6i -> ‘0,-6’)
    expr = expr.replace(/\b([0-9.]+)\b(?![i0-9.])/g, "‘$1,0’"); // real numbers
    expr = expr.replace(/\b([0-9.]+)i\b/g, "‘0,$1’"); // imaginary numbers
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

function openNum(expr){
  expr = expr.replace(/[‘’]/g, "");
  var exprarr = expr.split(",");
  
  return exprarr;
}

function closeNum(exprarr){
  var expr = "‘" + exprarr.join(",") + "’";
  
  return expr;
}

function N(a,b){
  return closeNum([a, b]);
}

function roundNum(exprarr, nprec){
  exprarr[0] = roundr(exprarr[0], nprec);
  exprarr[1] = roundr(exprarr[1], nprec);
  return exprarr;
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
functions.push(["asin", asin]);
functions.push(["acos", acos]);
functions.push(["atan", atan]);

////// Complex Functions

function add(z, w, nprec){
  checkUndefined("add(z, w, nprec)", ["z", "w"], [z, w]);
  
  var a, b, c, d;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  
  var warr = openNum(w);
  c = warr[0]; d = warr[1];
  
  if (nprec != undefined){
    var narr = openNum(nprec);
    var na = narr[0]; var nb = narr[1];
    if (nb != "0")throw "Error: add(z, w, nprec): nprec must be real";
  }
  
  var resarr = [];
  resarr[0] = addr(a, c);
  resarr[1] = addr(b, d);
  
  if (nprec != undefined)resarr = roundNum(resarr, na);
  return closeNum(resarr);
}

function sub(z, w, nprec){
  checkUndefined("sub(z, w)", ["z", "w"], [z, w]);
  
  var a, b, c, d;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  
  var warr = openNum(w);
  c = warr[0]; d = warr[1];
  
  if (nprec != undefined){
    var narr = openNum(nprec);
    var na = narr[0]; var nb = narr[1];
    if (nb != "0")throw "Error: sub(z, w, nprec): nprec must be real";
  }
  
  var resarr = [];
  resarr[0] = subr(a, c);
  resarr[1] = subr(b, d);
  
  if (nprec != undefined)resarr = roundNum(resarr, na);
  return closeNum(resarr);
}

function mult(z, w, nprec){
  checkUndefined("mult(z, w)", ["z", "w"], [z, w]);
  
  var a, b, c, d;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  
  var warr = openNum(w);
  c = warr[0]; d = warr[1];
  
  if (nprec != undefined){
    var narr = openNum(nprec);
    var na = narr[0]; var nb = narr[1];
    if (nb != "0")throw "Error: mult(z, w, nprec): nprec must be real";
  }
  
  var resarr = [];
  resarr[0] = subr(multr(a, c), multr(b, d));
  resarr[1] = addr(multr(a, d), multr(b, c));
  
  if (nprec != undefined)resarr = roundNum(resarr, na);
  return closeNum(resarr);
}

function div(z, w, nprec){
  checkUndefined("div(z, w)", ["z", "w"], [z, w]);
  if (nprec == undefined)nprec = N(prec,0);
  
  var a, b, c, d;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  
  var warr = openNum(w);
  c = warr[0]; d = warr[1];
  
  var narr = openNum(nprec);
  var na = narr[0]; var nb = narr[1];
  if (nb != "0")throw "Error: div(z, w, nprec): nprec must be real";
  
  var resarr = [];
  var sum = addr(powr(c,2), powr(d,2));
  resarr[0] = divr(addr(multr(a,c), multr(b,d)), sum, na);
  resarr[1] = divr(subr(multr(b,c), multr(a,d)), sum, na);
  
  return closeNum(roundNum(resarr, na));
}

function arg(z, nprec){
  checkUndefined("arg(z)", ["z"], [z]);
  if (nprec == undefined)nprec = N(prec,0);
  
  var a, b;
  
  var zarr = openNum(z);
  zarr.num();
  a = zarr[0]; b = zarr[1];
  
  var narr = openNum(nprec);
  var na = narr[0]; var nb = narr[1];
  if (nb != "0")throw "Error: arg(z, nprec): nprec must be real";
  
  var resarr = [];
  resarr[0] = checkE(Math.atan2(b, a));
  resarr[1] = 0;
  
  return closeNum(roundNum(resarr, na));
}

function abs(z, nprec){
  checkUndefined("abs(z)", ["z"], [z]);
  if (nprec == undefined)nprec = N(prec,0);
  
  var a, b;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  
  var narr = openNum(nprec);
  var na = narr[0]; var nb = narr[1];
  if (nb != "0")throw "Error: abs(z, nprec): nprec must be real";
  
  var resarr = [];
  resarr[0] = sqrtr(addr(powr(a, 2), powr(b, 2)), na);
  resarr[1] = 0;
  
  return closeNum(roundNum(resarr, na));
}

function ln(z, nprec){
  checkUndefined("ln(z)", ["z"], [z]);
  if (nprec == undefined)nprec = N(prec,0);
  
  var narr = openNum(nprec);
  var na = narr[0]; var nb = narr[1];
  if (nb != "0")throw "Error: ln(z, nprec): nprec must be real";
  
  var resarr = [];
  resarr[0] = lnr(openNum(abs(z, na+1))[0], na);
  resarr[1] = openNum(arg(z, na+1))[0];
  
  return closeNum(roundNum(resarr, na));
}

function exp(z, nprec){
  checkUndefined("exp(z)", ["z"], [z]);
  if (nprec == undefined)nprec = N(prec,0);
  
  var a, b;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  
  var narr = openNum(nprec);
  var na = narr[0]; var nb = narr[1];
  if (nb != "0")throw "Error: ln(z, nprec): nprec must be real";
  
  var resarr = [];
  var expra = expr(a, na+1+Math.max(len(cosr(b, 2)), len(sinr(b))));
  resarr[0] = multr(expra, cosr(b, na+1+len(expra)));
  resarr[1] = multr(expra, sinr(b, na+1+len(expra)));
  
  return closeNum(roundNum(resarr, na));
}

function pow(z, w, nprec){
  checkUndefined("pow(z, w)", ["z", "w"], [z, w]);
  
  var a, b, c, d;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  
  var warr = openNum(w);
  c = warr[0]; d = warr[1];
  
  if (b == "0" && d == "0" && (a[0] != "-" || c[0] != "0")){
    var na, nb;
    if (nprec != undefined){
      var narr = openNum(nprec);
      na = narr[0]; nb = narr[1];
      if (nb != "0")throw "Error: pow(z, w, nprec): nprec must be real";
    }
  
    var resarr = [];
    resarr[0] = powr(a, c, na);
    resarr[1] = 0;
    
    if (nprec != undefined)resarr = roundNum(resarr, na);
    return closeNum(resarr);
  } else {
    if (nprec == undefined)nprec = N(prec,0);
    
    var narr = openNum(nprec);
    na = narr[0]; nb = narr[1];
    if (nb != "0")throw "Error: pow(z, w, nprec): nprec must be real";
    
    return exp(mult(w, ln(z, nprec+1)), nprec);
  }
}

function sgn(z, nprec){
  checkUndefined("sgn(z)", ["z"], [z]);
  if (nprec == undefined)nprec = N(prec,0);
  
  var a, b;
  
  var zarr = openNum(z);
  zarr.num();
  a = zarr[0]; b = zarr[1];
  
  var narr = openNum(nprec);
  var na = narr[0]; var nb = narr[1];
  if (nb != "0")throw "Error: sgn(z, nprec): nprec must be real";
  
  if (a == 0 && b == 0)return N(0,0);
  else return div(z, abs(z, nprec+1), nprec);
}

function root(n, z){
  checkUndefined("root(n, z)", ["n", "z"], [n, z]);
  var a, b, c, d;
  
  var narr = openNum(n);
  narr.num();
  a = narr[0]; b = narr[1];
  
  if (b != 0)throw "Error: root(n, z): n must be real";
  
  var zarr = openNum(z);
  zarr.num();
  c = zarr[0]; d = zarr[1];
  
  if (d != 0)return pow(z, div(N(1,0), n));
  
  if ((a % 2) == 1){ // if n is odd return real root
    return mult(sgn(z), pow(abs(z), div(N(1,0), n)));
  } else return pow(z, div(N(1,0), n));
}

function sqrt(z){
  checkUndefined("sqrt(z)", ["z"], [z]);
  return root(N(2,0), z);
}

function cbrt(z){
  checkUndefined("cbrt(z)", ["z"], [z]);
  return root(N(3,0), z);
}

function sin(z, nprec){
  checkUndefined("sin(z, nprec)", ["z"], [z]);
  if (nprec == undefined)nprec = prec;
  
  var a, b;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  
  var resarr = [];
  resarr[0] = multr(sinr(a), coshr(b));
  resarr[1] = multr(cosr(a), sinhr(b));
  
  return closeNum(resarr);
}

function cos(z, nprec){
  checkUndefined("cos(z, nprec)", ["z"], [z]);
  if (nprec == undefined)nprec = prec;
  
  var a, b;
  
  var zarr = openNum(z);
  a = zarr[0]; b = zarr[1];
  
  var resarr = [];
  resarr[0] = multr(cosr(a), coshr(b));
  resarr[1] = negn(multr(sinr(a), sinhr(b)));
  
  return closeNum(resarr);
}

function asin(z, nprec){
  checkUndefined("asin(z, nprec)", ["z"], [z]);
  
  var sqrt2 = sqrt(sub(N(1,0), pow(z, N(2,0))));
  var ln2 = ln(add(mult(N(0,1), z), sqrt2));
  return mult(N(0,-1), ln2);
}

function acos(z, nprec){
  checkUndefined("acos(z, nprec)", ["z"], [z]);
  
  var sqrt2 = sqrt(sub(N(1,0), pow(z, N(2,0))));
  var ln2 = ln(add(z, mult(N(0,1), sqrt2)));
  return mult(N(0,-1), ln2);
}

function atan(z, w){
  checkUndefined("atan(z, w)", ["z"], [z]);
  
  var ln1 = ln(sub(N(1,0), mult(N(0,1), z)));
  var ln2 = ln(add(N(1,0), mult(N(0,1), z)));
  return mult(N(0,0.5), sub(ln1, ln2));
}

////// Complex Real Functions

function fact(x){
  checkUndefined("fact(x)", ["x"], [x]);
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
  checkUndefined("bin(x, y)", ["x", "y"], [x, y]);
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
  checkUndefined("agm(x, y)", ["x", "y"], [x, y]);
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
  checkUndefined("round(x)", ["x"], [x]);
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
  checkUndefined("trunc(x)", ["x"], [x]);
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
  checkUndefined("floor(x)", ["x"], [x]);
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
  checkUndefined("ceil(x)", ["x"], [x]);
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
    a = a.substring(1, a.length);
    neg = "-";
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

function lt(a, b){ // is (a < b) ?
  a = String(a); b = String(b);
  var zeroArr = padZeros(a, b);
  a = zeroArr[0]; b = zeroArr[1];
  
  a = a.replace(".", "");
  b = b.replace(".", "");
  
  if (a == b)return false;
  
  for (var i = 0; i < a.length; i++){
    if (a[i] != b[i])return (Number(a[i]) < Number(b[i]));
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
  
  if (a[0] == "-")a = a.substring(1, a.length);
  var fa = floorr(a);
  if (fa != "0")return fa.length;
  
  if (trimZeros(a) == "0")return 0;
  
  for (var i = 0; a[0] == "0"; i++){
    a = mDotBack(a, 1);
  }
  
  return -(i-1);
}

function nlen(a){
  a = String(a);
  
  if (a[0] == "-")a = a.substring(1, a.length);
  var fa = floorr(a);
  if (fa != "0")return fa.length-1;
  
  if (trimZeros(a) == "0")return 0;
  
  for (var i = 0; a[0] == "0"; i++){
    a = mDotBack(a, 1);
  }
  
  return -i;
}

function isZero(a, nprec){
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
    if (a[i] != "0")return false;
  }
  if (i == a.length)return true;
  if (Number(a[i]) >= 5)return false;
  
  return true;
}

function negn(a){
  a = String(a);
  
  if (a == "0")return a;
  
  if (a[0] == "-")return a.substring(1, a.length);
  else return "-" + a;
}

////// Operation Functions

function addr(a, b, nprec){
  a = String(a); b = String(b);
  
  var neg = "";
  if (a[0] == "-"){
    if (b[0] != "-")return subr(b, a.replace("-", ""));
    else neg = "-";
  } else if (b[0] == "-")return subr(a, b.replace("-", ""));
  
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
  
  if (nprec != undefined)sum = roundr(sum, nprec);
  return sum;
}

function subr(a, b, nprec){
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
  
  if (nprec != undefined)diff = roundr(diff, nprec);
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
  
  var aarr = [];
  var barr = []
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
      prodarr[d] = "0";
      continue;
    }
    prodarr[d] = "";
    for (var f = g; f > 0; f--)prodarr[d] = "0000000" + prodarr[d];
    for (var i = aarr.length-1; i >= 0; i--){
      smallProd = String(barr[d] * aarr[i] + carry);
      sPLen = smallProd.length;
      prodarr[d] = smallProd.substring(sPLen-7, sPLen) + prodarr[d];
      if (sPLen > 7){
        carry = Number(smallProd.substring(0, sPLen-7));
      } else {
        carry = 0;
        for (var h = 7-sPLen; h > 0; h--){
          prodarr[d] = "0" + prodarr[d];
        }
      }
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
  
  if (nprec != undefined)prod = roundr(prod, nprec);
  return prod;
}

function divr(a, b, nprec){
  a = String(a); b = String(b);
  if (nprec == undefined)nprec = prec;
  
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
  if (quot == "-0")quot = "0";
  
  return quot;
}

function powr(a, b, nprec){
  a = String(a); b = String(b);
  var na = Number(a); var nb = Number(b);
  
  var mod;
  
  mod = nb % 2;
  if (mod != 1 && mod != 0)return checkE(Math.pow(na, nb));
  
  mod = na % 2;
  if (mod != 1 && mod != 0 && nprec != undefined)return powrd(a, b, nprec);
  
  return powrn(a, b);
}

// http://en.wikipedia.org/wiki/Exponentiation_by_squaring
function powrn(a, n, nprec){
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
  
  if (nprec != undefined)prod = roundr(prod, nprec);
  return prod;
}

function powrd(a, n, nprec){
  a = String(a); n = Number(n);
  if (nprec == undefined)nprec = prec;
  
  if (n == 0)return "1";
  
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
  x[0] = "1";
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

// Newton's method
function sqrtr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  if (a[0] == "-")throw "Error: sqrtr(a, nprec): a cannot be negative";
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

function rootr(n, a){
  a = String(a);
  
  if (a[0] == "-")throw "Error: Cannot rootr() a negative number";
  var x = [];
  x[0] = String(Math.pow(Number(a), 1/Number(n)));
  var currprec = 0;
  var func1, func2
  for (var i = 1; currprec < prec+1; i++){ // Newton's method
    func1 = multr(subr(n, 1), x[i-1]);
    func2 = divr(a, powr(x[i-1], subr(n, 1)));
    x[i] = divr(addr(func1, func2), n);
    currprec = getPrec(x[i-1], x[i]);
  }
  
  return roundr(x[i-1], prec);
}

// http://chemistrydaily.com/chemistry/John_Gabriel%27s_Nth_root_algorithm
function rootr2(n, a){
  a = String(a);
  
  if (a[0] == "-")throw "Error: Cannot rootr() a negative number";
  var x = [];
  x[0] = String(Math.pow(Number(a), 1/Number(n)));
  var currprec = 0;
  var func1, func2
  for (var i = 1; currprec < prec+1; i++){ // John Gabriel's Nth root algorithm
    func1 = divr(a, powr(x[i-1], n-1));
    func2 = multr(n-1, x[i-1]);
    x[i] = divr(addr(func1, func2), n);
    currprec = getPrec(x[i-1], x[i]);
  }
  
  return roundr(x[i-1], prec);
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

function expr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var neg = false;
  if (a[0] == "-"){
    a = a.substring(1, a.length);
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

function e2(nprec){
  if (nprec == undefined)nprec = prec;
  
  var frac2 = "1";
  var frac = "1";
  var exp = "2";
  for (var i = 2; true; i++){
    frac2 = multr(frac2, i);
    frac = divr(1, frac2, nprec+2);
    if (isZero(frac, nprec+1))break;
    exp = addr(exp, frac);
  }
  alert(i);
  return roundr(exp, nprec);
}

function e3(nprec){
  if (nprec == undefined)nprec = prec;
  
  var frac2 = "1";
  var frac = "0";
  var exp = "0";
  for (var i = 2, neg = false; true; i++, neg=!neg){
    frac2 = multr(frac2, i);
    frac = divr(1, frac2, nprec+2);
    if (isZero(frac, nprec+2))break;
    if (neg)exp = subr(exp, frac);
    else exp = addr(exp, frac);
  }
  alert(i);
  exp = divr(1, exp, nprec+1);
  
  return roundr(exp, nprec);
}

function lnr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  if (a[0] == "-")throw "Error: lnr(a, nprec): a cannot be negative";
  if (a == "0")throw "Error: lnr(a, nprec): a cannot be zero";
  
  var ln = checkE(Math.log(Number(a)));
  var func1, func2;
  for (var i = 1; true; i++){ // Newton's method
    func1 = subr(divr(a, expr(ln, nprec+2), nprec+2), 1);
    if (isZero(func1, nprec+1))break;
    ln = addr(func1, ln);
  }
  
  return roundr(ln, nprec);
}

function floorr(a){
  a = String(a);
  if (a.indexOf(".") == -1)return a;
  a = a.substring(0, a.indexOf("."));
  if (a[0] == "-")a = subr(a, "1");
  a = trimZeros(a);
  
  return a;
}

function ceilr(a){
  a = String(a);
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
  
  if (nprec == undefined || nprec == 0){
    if (a[0] != "-"){
      if (Number(a[a.indexOf(".")+1]) >= 5)return ceilr(a);
      else return floorr(a);
    } else {
      if (Number(a[a.indexOf(".")+1]) >= 5)return floorr(a);
      else return ceilr(a);
    }
  }
  
  var neg = "";
  if (a[0] == "-"){
    a = a.substring(1, a.length);
    neg = "-";
  }
  
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

function sinr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var neg = false;
  if (a[0] == "-"){
    a = a.substring(1, a.length);
    neg = !neg;
  }
  
  var tPI = multr(2, pi);
  a = subr(a, multr(divr(a, tPI, 0), tPI));
  
  if (a[0] == "-"){
    a = a.substring(1, a.length);
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
  
  if (a.indexOf(".") == -1){
    var frac1 = a;
    var frac2 = "1";
    var frac;
    var sin = a;
    var neg = true;
    for (var i = 3; true; i += 2, neg = !neg){
      frac1 = multr(frac1, multr(a, a));
      frac2 = multr(frac2, multr(i, i-1));
      frac = divr(frac1, frac2, nprec+2);
      if (isZero(frac, nprec+1))break;
      if (neg)sin = subr(sin, frac);
      else sin = addr(sin, frac);
    }
  } else {
    var frac1, frac;
    var frac2 = "1";
    var sin = a;
    var neg = true;
    for (var i = 3; true; i += 2, neg = !neg){
      frac1 = powr(a, i, nprec+2);
      frac2 = multr(frac2, multr(i, i-1));
      frac = divr(frac1, frac2, nprec+2);
      if (isZero(frac, nprec+1))break;
      if (neg)sin = subr(sin, frac);
      else sin = addr(sin, frac);
    }
  }
  
  return roundr(sin, nprec);
}

function cosr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var neg = false;
  if (a[0] == "-"){
    a = a.substring(1, a.length);
    neg = !neg;
  }
  
  var tPI = multr(2, pi);
  a = subr(a, multr(divr(a, tPI, 0), tPI));
  
  if (a[0] == "-"){
    a = a.substring(1, a.length);
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
  
  if (a.indexOf(".") == -1){
    var frac1 = "1";
    var frac2 = "1";
    var frac;
    var cos = "1";
    var neg = true;
    for (var i = 2; true; i += 2, neg = !neg){
      frac1 = multr(frac1, multr(a, a));
      frac2 = multr(frac2, multr(i, i-1));
      frac = divr(frac1, frac2, nprec+2);
      if (isZero(frac, nprec+1))break;
      if (neg)cos = subr(cos, frac);
      else cos = addr(cos, frac);
    }
  } else {
    var frac1, frac;
    var frac2 = "1";
    var cos = "1";
    var neg = true;
    for (var i = 2; true; i += 2, neg = !neg){
      frac1 = powr(a, i, nprec+2);
      frac2 = multr(frac2, multr(i, i-1));
      frac = divr(frac1, frac2, nprec+2);
      if (isZero(frac, nprec+1))break;
      if (neg)cos = subr(cos, frac);
      else cos = addr(cos, frac);
    }
  }
  
  return roundr(cos, nprec);
}

function tanr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var negs = false;
  var negc = false;
  if (a[0] == "-"){
    a = a.substring(1, a.length);
    negs = !negs;
    negc = !negc;
  }
  
  var tPI = multr(2, pi);
  a = subr(a, multr(divr(a, tPI, 0), tPI));
  
  if (a[0] == "-"){
    a = a.substring(1, a.length);
    negs = !negs;
  }
  
  var hPI = divr(pi, 2, nprec+7);
  var numhPIs = divr(a, hPI, 0);
  // a = subr(a, multr(numhPI, hPI));
  var sin, cos, ylen;
  switch (numhPIs){
    case "0":
      ylen = nlen(cossmall(a, nprec+2));
      sin = sinsmall(a, (nprec+2)+1-ylen);
      cos = cossmall(a, (nprec+2)+1+len(sin)-2*ylen);
      break;
    case "1":
      a = subr(a, hPI);
      ylen = nlen(sinsmall(a, nprec+2));
      sin = cossmall(a, (nprec+2)+1-ylen);
      cos = sinsmall(a, (nprec+2)+1+len(sin)-2*ylen);
      negc = !negc;
      break;
    case "2":
      a = subr(a, addr(hPI, hPI));
      ylen = nlen(cossmall(a, nprec+2));
      sin = sinsmall(a, (nprec+4)+1-ylen);
      cos = cossmall(a, (nprec+4)+1+len(sin)-2*ylen);
      negs = !negs;
      negc = !negc;
      break;
    case "3":
      a = subr(a, addr(hPI, pi));
      ylen = nlen(sinsmall(a, nprec+2));
      sin = cossmall(a, (nprec+1)+1-ylen);
      cos = sinsmall(a, (nprec+1)+1+len(sin)-2*ylen);
      negs = !negs;
      break;
  }
  
  if (negs)sin = negn(sin);
  if (negc)cos = negn(cos);
  
  if (isZero(cos, nprec+1))throw "Error: tanr(a, nprec): cosr(a) cannot be 0";
  
  var tan = divr(sin, cos, nprec+1);
                   
  return roundr(tan, nprec);
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

// Ramanujan's PI formula
function pi2(nprec){
  if (nprec == undefined)nprec = prec;
  var c = divr(multr(2, sqrtr(2, nprec+1)), "9801", nprec+4);
  
  var sum = "0";
  var iter;
  for (var k = 0; true; k++){
    iter = divr(multr(factr(4*k), (addr(1103, multr(26390, k)))), multr(powr(factr(k), 4), powr(396, (4*k))), nprec+1);
    if (isZero(iter, nprec+1))break;
    sum = addr(sum, iter);
  }
  
  var pi = divr(1, multr(c, sum), nprec+1);
  
  return roundr(pi, nprec);
}

function pi3(nprec){
  if (nprec == undefined)nprec = prec;
  var c = divr(multr(2, sqrtr(2, nprec+1)), "9801", nprec+4);
  
  var sum = "1103";
  var iter;
  var fact1 = "1";
  var part1 = "1103";
  var fact2 = "1";
  var n396p4 = "24591257856";
  var part2 = "1";
  for (var k = 1, k4 = 4; true; k++, k4 += 4){
    fact1 = multr(fact1, multr(multr(multr(k4, k4-1), k4-2), k4-3));
    part1 = addr(part1, "26390");
    fact2 = multr(fact2, powrn(k, 4));
    part2 = multr(part2, n396p4);
    iter = divr(multr(fact1, part1), multr(fact2, part2), nprec+1);
    if (isZero(iter, nprec+1))break;
    sum = addr(sum, iter);
  }
  
  var pi = divr(1, multr(c, sum), nprec+1);
  
  return roundr(pi, nprec);
}

function arctan1(x, nprec){
  if (nprec == undefined)nprec = prec;
  
  var sum0 = "0";
  var fracbot = 1;
  var prod = x;
  var currprec = 0;
  var even = true;
  var i = 0;
  while (true){
    i++;
    if (even)sum1 = addr(sum0, divr(prod, fracbot, nprec+1));
    else sum1 = subr(sum0, divr(prod, fracbot, nprec+1));
    currprec = getPrec(sum0, sum1, nprec+1);
    if (currprec >= nprec+1)break;
    prod = multr(prod, powr(x, 2));
    fracbot = fracbot + 2;
    even = !even;
    sum0 = sum1;
    //alert(sum1);
  }
  //alert(i);
  return roundr(sum1, nprec);
}

function pi22(nprec){
  if (nprec == undefined)nprec = prec;
  
  var part1 = multr(12, arctan1(divr(1, 18, nprec+3), nprec+3));
  var part2 = multr(8, arctan1(divr(1, 57, nprec+3), nprec+3));
  var part3 = multr(5, arctan1(divr(1, 239, nprec+3), nprec+3));
  var pi = multr(4, subr(addr(part1, part2), part3));
  
  return roundr(pi, nprec);
}

function ln2(nprec){
  if (nprec == undefined)nprec = prec;
  
  var sum = "0";
  var iter, last;
  var currprec = 0;
  for (var k = 0; currprec < nprec+1; k++){
    last = sum;
    iter = divr(1, multr(powr(9, k), 2*k+1), nprec+4);
    sum = addr(sum, iter);
    currprec = getPrec(last, sum, nprec+4);
  }
  
  var ln2 = multr(divr(2, 3, nprec+4), sum);
  
  return roundr(ln2, nprec);
}

function expr35(a){
  a = String(a);
  
  var x = [];
  x[0] = String(Math.exp(Number(a)));
  var currprec = 0;
  var func1 = addr(a, 1);
  var func2;
  for (var i = 1; currprec < prec+1; i++){
    func2 = subr(func1, lnr(x[i-1]));
    x[i] = multr(x[i-1], func2);
    currprec = getPrec(x[i-1], x[i]);
  }
  
  return roundr(x[i-1], prec);
}

function sub1(a){
  a = String(a);
  
  if (a[0] == "-")throw "Error: sub1(a): a cannot be negative";
  a = (a.indexOf(".") != -1)?a.substring(0, a.indexOf(".")):a;
  var dotToA = (a.indexOf(".") != -1)?a.substring(a.indexOf(".")+1, a.length):"";
  if (a == "0")throw "Error: sub1(a): a cannot be < 1";
  
  return subr(a, 1) + dotToA;
}

////// Speed Tests

function comp(prep, expr1, expr2){
  var ta = 0;
  var tb = 0;
  var h;
  
  for (h = 0; h < 1; h++)ta += comp2(prep, expr1);
  ta = ta/1;
  
  for (h = 0; h < 1; h++)tb += comp2(prep, expr2);
  tb = tb/1;
  
  alert("expr1: " + ta + " expr2: " + tb);
}

function comp2(prep, expr){
  var t1, t2, f;
  
  prep();
  t1 = (new Date()).getTime();
  for (f = 0; f < 1; f++)expr();
  t2 = (new Date()).getTime();
  
  return t2-t1;
}

function p(){
  
}

function a(){
  expsmall(1, 200)
}

function b(){
  e2(200);
}

alert("");
//alert(roundr(subr(powr(coshr(8, 20), 2), powr(sinhr(8, 20), 2)), 16));
//comp(p, a, b);
//alert(add(N("2.343241",0), N("3.243342",0), 3));
//alert(e3(100));
alert(cosr(negn(divr(pi, 3))));
//alert(nlen("0.00001000010000100001000010000100001000010000100001"));
//alert(asin(N(1,0)));
//alert(ceilr("-00000002342.612849240"));
//alert(expr2("400.23432425211"));
//alert(pi3(120));
//alert(pi3(120));
//alert(tanr(243));
//alert(cosr(243));
//alert(sqrtr2(253));
//alert(multr(divr(25, multr(2, pi), 0), multr(2, pi)));
//alert(subr(25, multr(divr(25, multr(2, pi), 0), multr(2, pi))));
//alert(sqrtr2("0.025", 30));
//alert(sqrtr2("4"));
//trimZeros2("000000000000000000000000000000000000000000.100000000000000000000000000000000000000");
//alert(powr("14.001", "247"));
//alert(powr("14.001", "0.00023"));
//comp('var a = "343.234"; var b = "12";', 'var posDotBef = (a.length-1 - (a.indexOf(".") == -1)?(a.length-1):a.indexOf(".")) + (b.length-1 - (b.indexOf(".") == -1)?(b.length-1):b.indexOf("."));', 'var posDotA = (a.indexOf(".") == -1)?(a.length-1):a.indexOf(".");var posDotB = (b.indexOf(".") == -1)?(b.length-1):b.indexOf(".");var posDotBef = (a.length-1 - posDotA) + (b.length-1 - posDotB)');
//comp('', 'padZeros("1.00000000000000", "1");', 'padZeros2("1.00000000000000", "1");');
//alert(padZeros("23423", "1.3343"));
//alert(roundr("0000000000000000.1", prec));
//comp("", "10*2", "multr(10, 2)");
//alert(trimZeros2("2.343400000"));
//alert(pow(N(-1,0), N(0.5,0)));
//alert(exp(mult(N(0.5,0), N(0,"3.14159265358979323846264338327950288419716939937511"))));
//alert(Math.cos(1.570796326794896619231321691639751442098584699687555));
//alert(ln(N(-1,0)));
//alert(ln(N("23",0)));
//comp('var a = "325";', 'sqrtr(a)', 'sqrtr2(a)');
//alert(powr("2", "141"));
//alert(powr("2.1", "10000"));
//alert(powr("2", "100"));
//lert(sqrtr("25"));
//alert(exp(mult("2", ln("23"))));
//alert(mult(N(0.5,0), N(0,"3.14159265358979323846264338327950288419716939937511")));
//alert(div(N(1,0), N(2,0)));
//alert(expr(400));
//alert(sqrtr("2"));
//alert(subr(powr(1.4142135623730951, 2), 2));
//alert(divr(subr(powr(1.4142135623730951, 2), 2), (2*1.4142135623730951)));
//alert(divr("0", "0"));
//comp("", "bin(4,0)", "");
//alert(expr(4.134324));
//alert(addr2("3.00000000000", "5000000000"));
//comp("", 'addr("3453437664110293847574647628749382756627582910932345878980866431354124133258", "3434.21098419891213984943857657625032894938759116063487978738947331648296")', 'addr2("3453437664110293847574647628749382756627582910932345878980866431354124133258", "3434.21098419891213984943857657625032894938759116063487978738947331648296")')
//alert(bin(4,0));
//alert(ln2(40));
//alert(lnr("1"));
//alert(divr(-1020, 1685));
//alert(sqrtr("-1"));
//alert(powr3("2", "10000"));
//alert("");
//alert(expr("400"));
//alert(powr("2.71828182845904523536028747135266249775724709369996", 234, 2));
//alert(multr("20.085537", "2.7182818"));
//alert(multr("2.71828182845904523536028747135266249775724709369996", "2.71828182845904523536028747135266249775724709369996"));
//alert(sqrtr2("2.34827942341247982137491287498237497492374324710402348013298402", 30));
//alert(powr(-0.4, 51));
//alert(powr("6", "257"));
//alert("");
//alert("");
//alert(mult(closeNum(["3.135494215929149691", 2))
//alert(expr("15.94238515287874211659633879"));
//alert(sqrtr("2.718281828459"));
//comp('', 'expsmall(7)', 'expsmall2(7)');
//alert(powr(e, 5));

//alert(lnr(0));
//alert(multr(expr(0.02342352), powr(e, 5), 16));
//alert(roundr(divr(1324, 3, 123234), 16));
//alert(prec + (100-1)*(len(divr(1324, 3, 1))));
//alert(powr(divr(1324, 3, 16), 100));
//alert(powr(divr(1, 19999, (24 + (10000-1)*(len(divr(1, 19999, 5))))), 10000, 24));
//alert(len(0.02));
//comp('var x = divr(1324, 3, 50);', 'powra(x, 30)', 'powr(x, 30, 16)');
//alert(powr(multr(expr(0.02342352, 30), powr(e, 5), 30), 10));
//alert(expr(100000));
//comp('', 'expra(1)', 'exprx(1)');
//alert(powr("2.345634", "100"));
//alert(powr("2", "10000"));
//alert(rootr("100", "2"));
//comp('', 'sqrtr2("5345352.34534535", 40)', 'sqrtr("5345352.34534535", 40)');
//comp('', 'powr("2.45455453434", 100)', '');
//alert(sqrtr("234343.534932849324"));
//comp('', 'agm("2", "0.00000000000234", 40)', 'agm2("2", "0.00000000000234", 40)');
//alert(pi2(32));
//alert(ln2(32));
//alert(agm(1, "0.00000000000000005551115123125783", 32));
//comp('', 'pi2(32); ln2(32); agm(1, "0.00000000000000005551115123125783", 32);', '');
//alert(pi22(40));
//alert(pi2(40));
//alert(arctan1(divr(1, 239, 40), 40));
//alert(divr(1, 239, 40));
//alert(nums());
//alert(mDotBack("2", -3));
//alert(ln2(32));
//alert(ln2());
//alert(sqrtr("0.00000000000036", 16));
//alert(checkE(Math.sqrt(0.00000000000036)));
//alert(ln2(16));
//alert(sqrtr(multr("2.4746804362363046", "2.4746804362363045"), 16));
//alert(multr("2.4746804362363046", "2.4746804362363045"));
//alert(sqrtr("6.1240432614907065897014074403507"));
//comp('', 'pi2(32)', 'ln2(32)');
//alert(divr("0", "0"));
//comp('', 'divr("0.234343434534534534", "0.454343223422342375")', 'divr("0.234343434534534534", "0.454343223422342375")');
//comp('', 'multr("23453134.2343454", "100000")', 'mDotBack("23453134.2343454", 5)');
//comp('', 'mDotBack("23453134.2343454", 5)', 'multr("23453134.2343454", "100000")');
//alert(expr(0));
//checkUndefined("agm(x, y, nprec)", ["x", "y"], [2, 3]);

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