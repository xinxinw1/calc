function multr2(a, b, nprec){ // slow mult
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

function divr(a, b, nprec){ // long div function
  a = String(a); b = String(b);
  if (nprec == undefined)nprec = prec;
  
  var sign = "";
  if (isNeg(a)){
    a = remNeg(a);
    if (!isNeg(b))sign = "-";
    else b = remNeg(b);
  } else if (isNeg(b)){
    sign = "-";
    b = remNeg(b);
  }
  
  a = trimZeros(a);
  b = trimZeros(b);
  
  if (b == "0")throw "Error: divr(a, b, nprec): b cannot be 0";
  if (a == "0")return "0";
  
  while (isDec(a) || isDec(b)){
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
  
  return roundr(sign + quot, nprec);
}

function quotAndRem(a, b){
  a = String(a); b = String(b);
  
  var sign = "";
  if (isNeg(a)){
    a = remNeg(a);
    if (!isNeg(b))sign = "-";
    else b = remNeg(b);
  } else if (isNeg(b)){
    sign = "-";
    b = remNeg(b);
  }
  
  a = trimZeros(a);
  b = trimZeros(b);
  
  if (b == "0")throw "Error: modr(a, b): b cannot be 0";
  if (a == "0")return ["0", "0"];
  
  while (isDec(a) || isDec(b)){
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
  
  return [trimZeros(quot), remain];
}



function tr4of1(nprec){
  var currRoot = sqrtr("2", nprec+6);
  var prod = currRoot;
  var sum = "-1"; // i ends n-1
  for (var i = 3; i > 0; i--){
    sum = subr(sum, prod);
    currRoot = sqrtr(addr("2", currRoot), nprec+i+2);
    prod = multr(prod, currRoot, nprec+i+2);
  }
  return roundr(addr(sum, prod), nprec);
}

// using atanTrans
function pi2(nprec){
  var a = tr4of1(nprec+3);
  var atan = atansm2(a, nprec+2);
  return roundr(multr(64, atan), nprec);
}

// using pi/4 = 12*atan(1/49)+32*atan(1/57)-5*atan(1/239)+12*atan(1/110443)
function pi3(nprec){
  var nprec1 = nprec+4;
  var nprec2 = nprec+3;
  var a1 = multr(48, atansm2(divr(1, 49, nprec1), nprec2));
  var a2 = multr(128, atansm2(divr(1, 57, nprec1), nprec2));
  var a3 = multr(20, atansm2(divr(1, 239, nprec1), nprec2));
  var a4 = multr(48, atansm2(divr(1, 110443, nprec1), nprec2));
  
  return roundr(addr(subr(addr(a1, a2), a3), a4), nprec);
}

// using pi/4 = atan(1/2)+atan(1/3)
function pi4(nprec){
  var nprec1 = nprec+4;
  var nprec2 = nprec+3;
  var a1 = atansm(0.5, nprec2);
  var a2 = atansm(divr(1, 3, nprec1), nprec2);
  
  return roundr(multr(4, addr(a1, a2)), nprec);
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
  
  return roundr(neg + x[n], nprec);
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
  
  if (adot+nprec+1 >= alen)return neg + a;
  
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

// Ramanujan's PI formula
function pir2(nprec){
  if (nprec == undefined)nprec = prec;
  var c = divr(multr(2, sqrtr(2, nprec+1)), "9801", nprec+5);
  
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
  
  var pi = divr(1, multr(c, sum), nprec+2);
  
  return roundr(pi, nprec);
}

function sinr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var sign = false;
  if (isNeg(a)){
    a = a.replace("-", "");
    sign = !sign;
  }
  
  var pi = pir(nprec+1+len(divr(a, 5, 0)));
  var tPI = multr(2, pi);
  a = subr(a, multr(divr(a, tPI, 0), tPI));
  
  if (isNeg(a)){
    a = a.replace("-", "");
    sign = !sign;
  }
  
  var hPI = divr(pi, 2, nprec+2);
  var numhPIs = divr(a, hPI, 0);
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
      sign = !sign;
      break;
    case "3":
      a = subr(a, addr(hPI, pi));
      sin = cossmall(a, nprec+1);
      sign = !sign;
      break;
  }
  
  sin = roundr(sin, nprec);
  
  if (sign)sin = negr(sin);
  
  return sin;
}

function cosr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var sign = false;
  if (isNeg(a)){
    a = a.replace("-", "");
  }
  
  var pi = pir(nprec+1+len(divr(a, 5, 0)));
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
      sign = !sign;
      break;
    case "2":
      a = subr(a, addr(hPI, hPI));
      cos = cossmall(a, nprec+1);
      sign = !sign;
      break;
    case "3":
      a = subr(a, addr(hPI, pi));
      cos = sinsmall(a, nprec+1);
      break;
  }
  
  cos = roundr(cos, nprec);
  
  if (sign)cos = negr(cos);
  
  return cos;
}

function expr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var sign = false;
  if (isNeg(a)){
    a = a.replace("-", "");
    sign = true;
  }
  
  if (a.indexOf(".") == -1){
    var exp = powr(er(nprec+1+(Number(a)-1)*(len(a)+1)), a, nprec+1);
  } else {
    var i = floorr(a);
    a = subr(a, i);
    if (gt(a, "0.5")){
      a = subr(a, 1);
      i = addr(i, 1);
    }
    
    var eprec = (Number(i)-1)*(len(i)+1);
    var exp = exprsm2(a, nprec + len(powr(er(2+eprec), i, 2))+1);
    exp = multr(exp, powr(er(nprec+len(exp)+1+eprec), i, nprec+len(exp)+1));
  }
  
  if (sign)return divr(1, exp, nprec);
  else return roundr(exp, nprec);
}

// Newton's method
function lnr(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  if (isNeg(a))throw "Error: lnr(a, nprec): a cannot be negative";
  if (a == "0")throw "Error: lnr(a, nprec): a cannot be zero";
  
  var ln = checkE(Math.log(Number(a)));
  var func1;
  for (var i = 1; true; i++){
    func1 = subr(divr(a, expr(ln, nprec+2), nprec+2), 1);
    if (isZero(func1, nprec+1))break;
    ln = addr(func1, ln);
  }
  
  return roundr(ln, nprec);
}



// Babylonian Method (slow)
function sqrtrd2(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  if (isNeg(a))throw "Error: sqrtrd(a, nprec): a cannot be negative";
  var sqrt = checkE(Math.sqrt(Number(a)));
  if (sqrt == "0")return "0";
  var last = sqrt;
  while (true){
    sqrt = divr(addr(sqrt, divr(a, sqrt, nprec+2)), 2, nprec+2);
    if (getPrec(sqrt, last, nprec) >= nprec+1)break;
    last = sqrt;
  }
  
  return roundr(sqrt, nprec);
}

// Taylor Series adding term by term
function exprsm3(a, nprec){
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

function exprl(a, nprec){
  a = String(a);
  if (nprec == undefined)nprec = prec;
  
  var exp = exprappr(a);
  var func1;
  for (var i = 1; true; i++){
    func1 = multr(exp, subr(a, lnr(exp, nprec+2+len(exp))), nprec+2);
    //alert(func1);
    if (isZero(func1, nprec+1))break;
    exp = addr(exp, func1);
    //alert(exp);
  }
  
  return roundr(exp, nprec);
}

function exprappr(a){
  a = String(a);
  
  a = numToFloat(a);
  a[0] = Number(a[0]);
  a[0] = a[0] / Math.log(10);
  a[0] = String(a[0]);
  a = floatToNum(a);
  
  var intp = floorr(a);
  var decp = Number("0." + decPart(a));
  
  return mDotRight(Math.pow(10, decp), intp);
}
