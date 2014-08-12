/***** Math Validity Checker 2.2.1 *****/

/* require tools 4.4.1 */
/* optional prec-math 4.3.0 */
/* optional cmpl-math 1.2.1 */

(function (udf){
  ////// Import //////
  
  var nodep = $.nodep;
  
  var apl = $.apl;
  var att = $.att;
  
  var oref = $.oref;
  var oset = $.oset;
  
  var prms = $.prms;
  
  var err = $.err;
  
  var hasC = typeof C !== "undefined";
  var hasR = typeof R !== "undefined";
  
  function cmpl(a){
    if (hasC)return C.cmpl(a);
    err(cmpl, "C not loaded");
  }
  
  function real(a){
    if (hasC)return C.real(a);
    if (hasR)return R.real(a);
    err(real, "R not loaded");
  }
  
  function realint(a){
    if (hasC)return C.realint(a);
    if (hasR)return R.realint(a);
    err(realint, "R not loaded");
  }
  
  ////// General processors //////
  
  var func; // dynamic variables
  var prm;
  var i;
  
  function proc(f){
    var tps = types(f);
    if (tps == "spec")return sref(f)();
    var p = prms(f);
    return function f2(){
      func = f; prm = p;
      var a = arguments;
      var arr = [];
      for (i = 0; i < tps.length; i++){
        arr[i] = process(a[i], tps[i]);
      }
      var ret = apl(f, arr);
      att(f, f2);
      return ret;
    };
  }
  
  function process(arg, type){
    if (arg == udf){
      if (type == "nprec")return arg;
      err(func, prm[i] + " is undefined");
    }
    switch (type){
      case "comp": return processComp(arg);
      case "real": return processReal(arg);
      case "nprec":
      case "int": return processInt(arg);
      default: err(process, "Unknown type $1 in function $2", type, func);
    }
  }
  
  function processComp(arg){
    var r = cmpl(arg);
    if (r !== false)return r;
    err(func, prm[i] + " = $1 is an invalid complex number", arg);
  }
  
  function processReal(arg){
    var r = real(arg);
    if (r !== false)return r;
    err(func, prm[i] + " = $1 is an invalid real number", arg);
  }
  
  function processInt(arg){
    var r = realint(arg);
    if (r !== false)return r;
    err(func, prm[i] + " = $1 is an invalid integer", arg);
  }
  
  ////// Functions //////
  
  var funcs = {};
  
  function fref(ref){
    return oref(funcs, ref);
  }
  
  function fn(ref, params){
    return oset(funcs, ref, params);
  }
  
  function types(ref){
    var tp = fref(ref);
    if (tp === udf)err(types, "Unknown function $1", ref);
    return tp;
  }
  
  //// Complex ////
  
  if (hasC){
    fn(C.add, ["comp", "comp", "nprec"]);
    fn(C.sub, ["comp", "comp", "nprec"]);
    fn(C.mul, ["comp", "comp", "nprec"]);
    fn(C.div, ["comp", "comp", "nprec"]);
    
    fn(C.rnd, ["comp", "nprec"]);
    fn(C.cei, ["comp", "nprec"]);
    fn(C.flr, ["comp", "nprec"]);
    fn(C.trn, ["comp", "nprec"]);
    
    fn(C.exp, ["comp", "nprec"]);
    fn(C.ln, ["comp", "nprec"]);
    fn(C.pow, ["comp", "comp", "nprec"]);
    fn(C.root, ["real", "comp", "nprec"]);
    fn(C.sqrt, ["comp", "nprec"]);
    fn(C.cbrt, ["comp", "nprec"]);
    fn(C.fact, ["real", "nprec"]);
    fn(C.bin, ["real", "real", "nprec"]);
    fn(C.agm, ["real", "real", "nprec"]);
    fn(C.sin, ["comp", "nprec"]);
    fn(C.cos, ["comp", "nprec"]);
    fn(C.sinh, ["comp", "nprec"]);
    fn(C.cosh, ["comp", "nprec"]);
    
    fn(C.abs, ["comp", "nprec"]);
    fn(C.arg, ["comp", "nprec"]);
    fn(C.sgn, ["comp", "nprec"]);
    fn(C.re, ["comp"]);
    fn(C.im, ["comp"]);
    fn(C.conj, ["comp"]);
    
    fn(C.pi, ["nprec"]);
    fn(C.e, ["nprec"]);
    fn(C.phi, ["nprec"]);
    fn(C.ln2, ["nprec"]);
    fn(C.ln5, ["nprec"]);
    fn(C.ln10, ["nprec"]);
  }
  
  //// Real ////
  
  if (hasR){
    fn(R.intp, ["real"]);   
    fn(R.decp, ["real"]);
    fn(R.negp, ["real"]);
    fn(R.evnp, ["real"]);
    fn(R.oddp, ["real"]);
    fn(R.div5p, ["real"]);
    
    fn(R.pad, ["real", "real"]);
    fn(R.zero, ["real", "nprec"]);
    fn(R.diff, ["real", "real", "nprec"]);
    
    fn(R.left, ["real", "int"]);
    fn(R.right, ["real", "int"]);
    
    fn(R.gt, ["real", "real"]);
    fn(R.lt, ["real", "real"]);
    fn(R.ge, ["real", "real"]);
    fn(R.le, ["real", "real"]);
    
    fn(R.add, ["real", "real", "nprec"]);
    fn(R.sub, ["real", "real", "nprec"]);
    fn(R.mul, ["real", "real", "nprec"]);
    fn(R.div, ["real", "real", "nprec"]);
    
    fn(R.rnd, ["real", "nprec"]);
    fn(R.cei, ["real", "nprec"]);
    fn(R.flr, ["real", "nprec"]);
    fn(R.trn, ["real", "nprec"]);
    
    fn(R.exp, ["real", "nprec"]);
    fn(R.ln, ["real", "nprec"]);
    fn(R.pow, ["real", "real", "nprec"]);
    fn(R.sqrt, ["real", "nprec"]);
    fn(R.fact, ["real", "nprec"]);
    fn(R.bin, ["real", "real", "nprec"]);
    fn(R.agm, ["real", "real", "nprec"]);
    fn(R.sin, ["real", "nprec"]);
    fn(R.cos, ["real", "nprec"]);
    fn(R.sinh, ["real", "nprec"]);
    fn(R.cosh, ["real", "nprec"]);
    
    fn(R.neg, ["real"]);
    fn(R.abs, ["real"]);
    
    fn(R.pi, ["nprec"]);
    fn(R.e, ["nprec"]);
    fn(R.phi, ["nprec"]);
    fn(R.ln2, ["nprec"]);
    fn(R.ln5, ["nprec"]);
    fn(R.ln10, ["nprec"]);
    
    fn(R.qar, ["real", "real"]);
    fn(R.mulran, ["int", "int"]);
  }
  
  ////// Special //////
  
  var specs = {};
  
  function sref(f){
    return oref(specs, f);
  }
  
  function spec(f, proc){
    fn(f, "spec");
    return oset(specs, f, proc);
  }
  
  if (hasR){
    function procfrac(){
      return function frac(a, b, p){
        var an = function (n){
          var an = a(n);
          if (an === null)return an;
          var r = real(an);
          if (r !== false)return r;
          err(frac, "a($1) = $2 is an invalid real number", n, an);
        }
        
        var bn = function (n){
          var bn = b(n);
          if (bn === null)return bn;
          var r = real(bn);
          if (r !== false)return r;
          err(frac, "b($1) = $2 is an invalid real number", n, bn);
        }
        
        var r = R.frac(an, bn, p);
        att(R.frac, frac);
        return r;
      };
    }
    
    function procsfrac(){
      return function sfrac(a, p){
        var an = function (n){
          var an = a(n);
          if (an === null)return an;
          var r = real(an);
          if (r !== false)return r;
          err(sfrac, "a($1) = $2 is an invalid real number", n, an);
        }
        
        var r = R.sfrac(an, p);
        att(R.sfrac, sfrac);
        return r;
      };
    }
    
    spec(R.frac, procfrac);
    spec(R.sfrac, procsfrac);
  }
  
  ////// Object exposure //////
  
  var Checker = {
    proc: proc,
    fn: fn,
    spec: spec
  };
  
  if (nodep)module.exports = Checker;
  else window.Checker = Checker;
  
  ////// Testing //////
  
  
  
})();
