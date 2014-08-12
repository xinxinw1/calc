/***** Math Executor 3.1.0 *****/

/* require tools 4.1.5 */
/* require prec-math 4.3.0 */
/* require cmpl-math 1.2.1 */
/* require math-parse 1.2.0 */
/* require math-check 2.2.0 */

(function (udf){
  ////// Import //////
  
  var nodep = $.nodep;
  
  var arrp = $.arrp;
  
  var las = $.las;
  
  var apl = $.apl;
  var map = $.map;
  var has = $.has;
  
  var sli = $.sli;
  var app = $.app;
  
  var each = $.each;
  var mrem = $.mrem;
  var psh = $.psh;
  
  var att = $.att;
  
  var stf = $.stf;
  
  var oref = $.oref;
  var oset = $.oset;
  var osetp = $.osetp;
  var odel = $.odel;
  
  var err = $.err;
  
  var varp = Parser.varp;
  var prs = Parser.prs;
  
  var proc = Checker.proc;
  
  var dsp = C.dsp;
  
  ////// Evaluator //////
  
  function vars(a){
    if (arrp(a)){
      var f = a[0];
      if (f == "set"){
        var nm = a[1];
        if (!varp(nm))err(vars, "set: Invalid variable name $1", nm);
        if (has(/^(i|pi|e|phi)$/, nm)){
          err(vars, "set: Can't set special var $1", nm);
        }
        var data = vset(nm, vars(a[2]));
        log("Set Variable " + nm, "$1", data);
        return data;
      }
      if (f == "unset"){
        var nm = a[1];
        if (has(/^(i|pi|e|phi)$/, nm)){
          err(vars, "unset: Can't unset special var $1", nm);
        }
        var data = vdel(nm);
        if (!data)err(vars, "unset: Variable $1 is already unset", nm);
        log("Unset Variable " + nm, "$1", data);
        return data;
      }
      if (f == "progn"){
        var args = map(vars, sli(a, 1));
        log("Finish progn", "$1", a);
        return las(args);
      }
      return app([f], map(vars, sli(a, 1)));
    }
    if (varp(a)){
      if (!vsetp(a))err(vars, "Variable $1 is undefined", a);
      var data = vref(a);
      log("Get Variable " + a, "$1", data);
      return data;
    }
    return a;
  }
  
  // evaluates lisp array into a number
  function evl(a){
    if (arrp(a)){
      if (!varp(a[0]))return a;
      if (!fsetp(a[0]))err(evl, "Fn $1 not found", a[0]);
      var r = apl(fref(a[0]), map(evl, sli(a, 1)));
      log("Finish evl", "$1 -> $2", a, r);
      return r;
    }
    return a;
  }
  
  ////// Calculator //////
  
  // converts math expr -> a+bi
  function calc(a){
    log("Input", "$1", a);
    a = prs(a);
    a = vars(a);
    log("Finish vars", "$1", a);
    a = evl(a);
    log("Finish evl", "$1", a);
    a = dsp(a);
    log("Finish dsp", "$1", a);
    
    return a;
  }
  
  ////// Variables //////
  
  var vs = {};
  
  function vref(name){
    return oref(vs, name);
  }
  
  function vset(name, data){
    return oset(vs, name, data);
  }
  
  function vsetp(name){
    return osetp(vs, name);
  }
  
  function vdel(name){
    return odel(vs, name);
  }
  
  var funcs = {};
  
  // gets function reference from functions list given name as string
  
  function fref(name){
    return oref(funcs, name);
  }
  
  function fset(name, fnref){
    return oset(funcs, name, fnref);
  }
  
  function fsetp(name){
    return osetp(funcs, name);
  }
  
  function chkfn(name, fnref){
    fset(name, proc(fnref));
  }
  
  vset("e", ["e"]);
  vset("pi", ["pi"]);
  vset("phi", ["phi"]);
  vset("ln2", ["ln2"]);
  vset("ln5", ["ln5"]);
  vset("ln10", ["ln10"]);
  
  fset("num", C.num);
  
  chkfn("add", C.add);
  chkfn("sub", C.sub);
  chkfn("mul", C.mul);
  chkfn("div", C.div);
  
  chkfn("rnd", C.rnd);
  chkfn("cei", C.cei);
  chkfn("flr", C.flr);
  chkfn("trn", C.trn);
  
  chkfn("round", C.rnd);
  chkfn("ceil", C.cei);
  chkfn("floor", C.flr);
  chkfn("trunc", C.trn);
  
  chkfn("exp", C.exp);
  chkfn("ln", C.ln);
  chkfn("pow", C.pow);
  chkfn("root", C.root);
  chkfn("sqrt", C.sqrt);
  chkfn("cbrt", C.cbrt);
  chkfn("fact", C.fact);
  chkfn("bin", C.bin);
  chkfn("agm", C.agm);
  chkfn("sin", C.sin);
  chkfn("cos", C.cos);
  chkfn("sinh", C.sinh);
  chkfn("cosh", C.cosh);
  
  chkfn("abs", C.abs);
  chkfn("arg", C.arg);
  chkfn("sgn", C.sgn);
  chkfn("sign", C.sgn);
  chkfn("re", C.re);
  chkfn("Re", C.re);
  chkfn("im", C.im);
  chkfn("Im", C.im);
  chkfn("conj", C.conj);
  
  chkfn("pi", C.pi);
  chkfn("e", C.e);
  chkfn("phi", C.phi);
  chkfn("ln2", C.ln2);
  chkfn("ln5", C.ln5);
  chkfn("ln10", C.ln10);
  
  ////// Logging //////
  
  var loggers = [];
  
  function log(subj){
    var rst = sli(arguments, 1);
    each(loggers, function (f){
      f(subj, apl(stf, rst));
    });
  }
  
  function logfn(f){
    psh(f, loggers);
  }
  
  function rlogfn(f){
    mrem(f, loggers);
  }
  
  Parser.logfn(log);
  $.sefn(function (e){
    log("Error", e.s + ": " + e.a);
  });
  
  ////// Object exposure //////
  
  var PMath = {
    vars: vars,
    evl: evl,
    calc: calc,
    
    logfn: logfn,
    rlogfn: rlogfn
  };
  
  if (nodep)module.exports = PMath;
  else window.PMath = PMath;
  
  ////// Testing //////
  
  
  
})();