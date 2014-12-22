/***** Complex Number Math Library 1.2.1 *****/

/* require tools 4.1.5 */
/* require prec-math 4.2.1 */

(function (udf){
  ////// Import //////
  
  var num = Number;
  var str = String;
  
  var nodep = $.nodep;
  
  var arrp = $.arrp;
  var len = $.len;
  
  var al = $.al;
  var spd = $.spd;
  
  var realr = R.real;
  var realintr = R.realint;
  
  var vldpr = R.vldp;
  var trimr = R.trim;
  
  var negp = R.negp;
  var intp = R.intp;
  var oddp = R.oddp;
  
  var sign = R.sign;
  var siz = R.siz;
  var nsiz = R.nsiz;
  
  var addr = R.add;
  var subr = R.sub;
  var mulr = R.mul;
  var divr = R.div;
  
  var rndr = R.rnd;
  var ceir = R.cei;
  var flrr = R.flr;
  var trnr = R.trn;
  
  var expr = R.exp;
  var lnr = R.ln;
  var powr = R.pow;
  var sqrtr = R.sqrt;
  var factr = R.fact;
  var binr = R.bin;
  var agmr = R.agm;
  var sinr = R.sin;
  var cosr = R.cos;
  var sinhr = R.sinh;
  var coshr = R.cosh;
  var atanr = R.atan;
  var atan2r = R.atan2;
  
  var negr = R.neg;
  var absr = R.abs;
  
  var pir = R.pi;
  var er = R.e;
  var phir = R.phi;
  var ln2r = R.ln2;
  var ln5r = R.ln5;
  var ln10r = R.ln10;
  
  var prec = R.gprec;
  var log = R.log;
  
  ////// Javascript number constants //////
  
  // Javascript largest integer: 2^53 = 9007199254740992
  // Javascript largest float ≈ 1.79769313486231580793728e+308
  // shortened to 1.7976931348623157e+308
  
  ////// Complex number functions //////
  
  //// Converters ////
  
  function cmpl(z){
    if (vldp(z))return trim(z);
    z = realr(z);
    if (z === false)return false;
    return N(z, "0");
  }
  
  function cmplreal(z){
    if (vldp(z)){
      if (realp(z))return trim(z);
      return false;
    }
    z = realr(z);
    if (z === false)return false;
    return N(z, "0");
  }
  
  function real(a){
    if (vldp(a)){
      if (realp(a))return A(a);
      return false;
    }
    return realr(a);
  }
  
  function realint(a){
    if (vldp(a)){
      if (realp(a))return realintr(A(a));
      return false;
    }
    return realintr(a);
  }
  
  //// Validators ////
  
  function vldp(z){
    return arrp(z) && len(z) == 2 && vldpr(z[0]) && vldpr(z[1]);
  }
  
  /*! All comp num functions past here assumes all inputs are validated !*/
  
  //// [a, b] functions ////
  
  function N(a, b){
    return [a, b];
  }
  
  function A(z){
    return z[0];
  }
  
  function B(z){
    return z[1];
  }
  
  function dsp(z){
    if (z == "")return z;
    var re = A(z);
    var b = B(z);
    var im = absr(b);
    switch (im){
      case "0": return re;
      case "1": im = "i"; break;
      default: im += "i"; break;
    }
    var sign = negp(b);
    if (re == "0")return sign?"-"+im:im;
    return re + (sign?"-":"+") + im;
  }
  
  //// Canonicalizers ////
  
  function trim(z){
    return N(trimr(A(z)), trimr(B(z)));
  }
  
  //// is... functions ////
  
  function realp(z){
    return B(z) == "0";
  }
  
  /*! All comp num functions past here assumes all inputs are trimmed !*/
  
  function intpc(z){
    return realp(z) && intp(A(z));
  }
  
  //// Processing functions ////
  
  //// Basic operation functions ////
  
  function add(z, w, p){
    return N(addr(A(z), A(w), p),
             addr(B(z), B(w), p));
  }
  
  function sub(z, w, p){
    return N(subr(A(z), A(w), p),
             subr(B(z), B(w), p));
  }
  
  function mul(z, w, p){
    var a, b, c, d;
    a = A(z); b = B(z);
    c = A(w); d = B(w);
    
    return N(subr(mulr(a, c), mulr(b, d), p),
             addr(mulr(a, d), mulr(b, c), p));
  }
  
  function div(z, w, p){
    if (p == udf)p = prec();
    
    var a, b, c, d;
    a = A(z); b = B(z);
    c = A(w); d = B(w);
    
    if (c == "0" && d == "0")err(div, "w cannot be 0");
    
    var sum = addr(powr(c, "2"), powr(d, "2"));
    return N(divr(addr(mulr(a, c), mulr(b, d)), sum, p),
             divr(subr(mulr(b, c), mulr(a, d)), sum, p));
  }
  
  //// Rounding functions ////
  
  function rnd(z, p){
    return N(rndr(A(z), p),
             rndr(B(z), p));
  }
  
  function cei(z, p){
    return N(ceir(A(z), p),
             ceir(B(z), p));
  }
  
  function flr(z, p){
    return N(flrr(A(z), p),
             flrr(B(z), p));
  }
  
  function trn(z, p){
    return N(trnr(A(z), p),
             trnr(B(z), p));
  }
  
  //// Extended operation functions ////
  
  function exp(z, p){
    if (p == udf)p = prec();
    
    var a, b;
    a = A(z); b = B(z);
    
    var ex = expr(a, p+2);
    return N(mulr(ex, cosr(b, p+2+siz(ex)), p),
             mulr(ex, sinr(b, p+2+siz(ex)), p));
  }
  
  function ln(z, p){
    if (p == udf)p = prec();
    return N(lnr(A(abs(z, p+2)), p),
             A(arg(z, p)));
  }
  
  function pow(z, w, p){
    if (p == udf)p = prec();
    
    var a, b, c, d;
    a = A(z); b = B(z);
    c = A(w); d = B(w);
    
    if (b == "0" && d == "0" && (intp(c) || !negp(a))){
      return N(powr(a, c, p), "0");
    }
    
    var n = Math.abs(num(c))*siz(str(Math.abs(num(a))+Math.abs(num(b))))+2*Math.abs(num(d));
    
    var pd = mul(w, ln(z, p+n+4), p+n+2);
    return exp(pd, p);
  }
  
  // @param String n
  function root(n, z, p){
    if (p == udf)p = prec();
    
    // if z is real and n is odd, return real root
    if (B(z) == "0" && oddp(n)){
      var c = A(z);
      return N(sign(c) + powr(absr(c), divr("1", n, p+2), p), "0");
    }
    
    return pow(z, N(divr("1", n, p+2), "0"), p);
  }
  
  function sqrt(z, p){
    if (p == udf)p = prec();
    
    var a, b;
    a = A(z); b = B(z);
    
    var absz = A(abs(z, p+4));
    return N(sqrtr(divr(addr(a, absz), "2", p+2), p),
             sign(b) + sqrtr(divr(addr(negr(a), absz), "2", p+2), p));
  }
  
  function cbrt(z, p){
    return root("3", z, p);
  }
  
  function fact(x, p){
    return N(factr(x, p), "0");
  }
  
  function bin(x, y, p){
    return N(binr(x, y, p), "0");
  }
  
  function agm(x, y, p){
    return N(agmr(x, y, p), "0");
  }
  
  function sin(z, p){
    if (p == udf)p = prec();
    
    var a, b;
    a = A(z); b = B(z);
    
    var cosh = coshr(b, p+2);
    var sinh = sinhr(b, p+2);
    return N(mulr(sinr(a, p+2+siz(cosh)), cosh, p),
             mulr(cosr(a, p+2+siz(sinh)), sinh, p));
  }
  
  function cos(z, p){
    if (p == udf)p = prec();
    
    var a, b;
    a = A(z); b = B(z);
    
    var cosh = coshr(b, p+2);
    var sinh = sinhr(b, p+2);
    return N(mulr(cosr(a, p+2+siz(cosh)), cosh, p),
             negr(mulr(sinr(a, p+2+siz(sinh)), sinh, p)));
  }
  
  function sinh(z, p){
    if (p == udf)p = prec();
    
    var a, b;
    a = A(z); b = B(z);
    
    var sinh = sinhr(a, p+2);
    var cosh = coshr(a, p+2);
    return N(mulr(sinh, cosr(b, p+2+siz(sinh)), p),
             mulr(cosh, sinr(b, p+2+siz(cosh)), p));
  }
  
  function cosh(z, p){
    if (p == udf)p = prec();
    
    var a, b;
    a = A(z); b = B(z);
    
    var cosh = coshr(a, p+2);
    var sinh = sinhr(a, p+2);
    return N(mulr(cosh, cosr(b, p+2+siz(cosh)), p),
             mulr(sinh, sinr(b, p+2+siz(sinh)), p));
  }
  
  //// Other operation functions ////
  
  function abs(z, p){
    if (p == udf)p = prec();
    return N(sqrtr(addr(powr(A(z), "2"),
                        powr(B(z), "2")), p), "0");
  }
  
  function arg(z, p){
    if (p == udf)p = prec();
    return N(atan2r(B(z), A(z), p), "0");
  }
  
  function sgn(z, p){
    if (p == udf)p = prec();
    if (A(z) == "0" && B(z) == "0")return z;
    return div(z, abs(z, p+2), p);
  }
  
  function re(z){
    return N(A(z), "0");
  }
  
  function im(z){
    return N(B(z), "0");
  }
  
  function conj(z){
    return N(A(z), negr(B(z)));
  }
  
  //// Mathematical constants ////
  
  function pi(p){
    return N(pir(p), "0");
  }
  
  function e(p){
    return N(er(p), "0");
  }
  
  function phi(p){
    return N(phir(p), "0");
  }
  
  function ln2(p){
    return N(ln2r(p), "0");
  }
  
  function ln5(p){
    return N(ln5r(p), "0");
  }
  
  function ln10(p){
    return N(ln10r(p), "0");
  }
  
  //// C object exposure ////
  
  var C = {
    cmpl: cmpl,
    cmplreal: cmplreal,
    real: real,
    realint: realint,
    
    vldp: vldp,
    trim: trim,
    
    realp: realp,
    intp: intpc,
    
    num: N,
    getA: A,
    getB: B,
    dsp: dsp,
    
    add: add,
    sub: sub,
    mul: mul,
    div: div,
    
    rnd: rnd,
    cei: cei,
    flr: flr,
    trn: trn,
    
    round: rnd,
    ceil: cei,
    floor: flr,
    trunc: trn,
    
    exp: exp,
    ln: ln,
    pow: pow,
    root: root,
    sqrt: sqrt,
    cbrt: cbrt,
    fact: fact,
    bin: bin,
    agm: agm,
    sin: sin,
    cos: cos,
    sinh: sinh,
    cosh: cosh,
    
    abs: abs,
    arg: arg,
    sgn: sgn,
    re: re,
    im: im,
    conj: conj,
    
    pi: pi,
    e: e,
    phi: phi,
    ln2: ln2,
    ln5: ln5,
    ln10: ln10
  };
  
  if (nodep)module.exports = C;
  else window.C = C;
  
  ////// Speed tests //////
  
  function a(){
    
  }
  
  function b(){
    
  }
  
  //al("");
  //spd(a, b, 10000);
  
  ////// Testing //////
  
  
  
})();
