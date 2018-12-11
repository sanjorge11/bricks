

//------------------------------------------------------------------------
//
//  This JavaScript code implements an API for AST analysis
//    the analysis is intended for simple auto grading 
//    and for enforcing basic programming structure and style guidelines 
//    for an intro programming class
//
//  We use the Acorn parser to generate an AST 
//    The AST is a JSON object, in Mozilla SpiderMonkey format
//
//  To adapt this API to another language you will have to
//   -- get an AST for the target language in SpiderMonkey format 
//   -- rewrite the code bodies
//   -- or write adapter functions
//
//  David Stotts, 5/16/2014
//  Yuxin Mo: myx@cs.unc.edu in 4/1/2015 
//
//------------------------------------------------------------------------


// global "package" name is pnut

var pnut = (function () {  

//------------------------------------------------------------------------
//   - traverse the AST and collect all the interesting facts
//   - store facts in an object and return the object
//   - data object will be sent to the server for analysis/grading
//------------------------------------------------------------------------

  function collectStructureStyleFacts(ast) {

    var dObj  = {

    /******************************************************************/
    /* 1. Style Grading for Declaration and Use of Variable           */
    /*    a. numDecVars(ast)               ==> integer >= 0           */
    /*    b. numUndecVars(ast)             ==> integer >= 0           */
    /*    c. numVarsUsed(ast)              ==> integer >= 0           */
    /*    d. numVarsInFuncsUseGloVars(ast) ==> integer >= 0           */
    /*    e. isAnyFuncVar(ast)             ==> boolean ? true:false   */
    /******************************************************************/
      nDV      : numDecVars(ast),
      nVU      : numVarsUsed(ast),
      nUUDV    : numUnUsedDecVars(ast),
      nUDV     : numUndecVars(ast),
      nVFUGV   : numVarsInFuncsUseGloVars(ast),
      isFV     : isAnyFuncVar(ast),
      nVW      : numVarsWritten(ast),  // pds add
      nVR      : numVarsRead(ast),     // pds add


    /******************************************************************/
    /* 2. Style Grading for Declaration and Use of Array              */
    /*    a. numDecArrs(ast)      ==> integer >= 0                    */
    /*    b. numUndecArrs(ast)    ==> integer >= 0                    */
    /*    c. numArrsUsed(ast)     ==> integer >= 0                    */
    /******************************************************************/
      nDA      : numDecArrs(ast),
      nUDA     : numUndecArrs(ast),
      nAU      : numArrsUsed(ast),

    /******************************************************************/
    /* 3. Style Grading for Declaration and Use of Object             */
    /*    a. numDecObjs(ast)                 ==> integer >= 0         */
    /*    b. numUndecObjs(ast)               ==> integer >= 0         */
    /*    c. numObjsUsed(ast)                ==> integer >= 0         */
    /*    d. isAnyFuncBoundToAFuncRtnObj(ast)==> boolean ? true:false */
    /******************************************************************/    
      nDO      : numDecObjs(ast),
      nUDO     : numUndecObjs(ast),
      nOU      : numObjsUsed(ast),
      isFBAFRO : isAnyFuncBoundToAFuncRtnObj(ast),

    /******************************************************************/
    /* 4. Style Grading for Use of While Loop                         */
    /*    a. numWhileLoopsInGloLev(ast)       ==> integer >= 0        */
    /*    b. numNestedWhileLoopsInGloLev(ast) ==> integer >= 0        */
    /*    c. numWhileLoopsInFuncs(ast)        ==> integer >= 0        */
    /*    d. numNestedWhileLoopsInFuncs(ast)  ==> integer >= 0        */
    /*    e. numWhileLoopsInAProgram(ast)     ==> integer >= 0        */
    /******************************************************************/  
      nWLGL    : numWhileLoopsInGloLev(ast),
      nNWLGL   : numNestedWhileLoopsInGloLev(ast),
      nWLF     : numWhileLoopsInFuncs(ast),
      nNWLF    : numNestedWhileLoopsInFuncs(ast),
      nWLAP    : numWhileLoopsInAProgram(ast),

    /******************************************************************/
    /* 5. Style Grading for Use of For Loop                           */
    /*    a. numForLoopsInGloLev(ast)            ==> integer >= 0     */
    /*    b. numNestedForLoopsInGloLev(ast)      ==> integer >= 0     */
    /*    c. numForLoopsInFuncs(ast)             ==> integer >= 0     */
    /*    d. numNestedForLoopsInFuncs(ast)       ==> integer >= 0     */
    /*    e. numForLoopsInAProgram(ast)          ==> integer >= 0     */
    /******************************************************************/   
      nFLGL    : numForLoopsInGloLev(ast),
      nNFLGL   : numNestedForLoopsInGloLev(ast),
      nFLF     : numForLoopsInFuncs(ast),
      nNFLF    : numNestedForLoopsInFuncs(ast),
      nFLAP    : numForLoopsInAProgram(ast),

    /******************************************************************/
    /* 6. Style Grading for Declaration and Use of Function           */
    /*    a. numDecFuncs(ast)               ==> integer >= 0          */
    /*    b. areCallExpsAllValid(ast)       ==> integer >= 0          */
    /*    c. areDecFuncsCalled(ast)         ==> boolean ? true:false  */
    /*    d. areDecFuncsCalledOnce(ast)     ==> boolean ? true:false  */
    /*    e. isAnyDecFuncPassedByRef(ast)   ==> boolean ? true:false  */
    /*    f. isAnyFuncReturnObj(ast)        ==> boolean ? true:false  */
    /******************************************************************/
      nDF      : numDecFuncs(ast),
      areCEAV  : areCallExpsAllValid(ast),
      areDFC   : areDecFuncsCalled(ast),
      areDFCO  : areDecFuncsCalledOnce(ast),
      isADFPBR : isAnyDecFuncPassedByRef(ast),
      isAFRO   : isAnyFuncReturnObj(ast),

    /******************************************************************/
    /* 7. Style Grading for Recursive Function                        */
    /*    a. isRecursiveFunction(ast)  ==> boolean ? true:false       */
    /******************************************************************/   
      isRF     : isRecursiveFunction(ast),

    /******************************************************************/
    /* Stotts' old pnut API                                           */
    /******************************************************************/
      hasUSF    : hasUseStrictFirst(ast),
      isAFD1C   : isAllFuncDeclsPlusOneCall(ast),
      nBGD      : numBadGlobalDecls(ast),
      nBGU      : numBadGlobalUses(ast),
      nTFC      : numTopFuncCalls(ast),
      nTNC      : numTopNumberCalls(ast),
      nTLFC     : numTopLHSFuncCalls(ast),
      nTFL      : numForLoops(ast),
      nTWL      : numWhileLoops(ast),
      uBGV      : usesBadGlobalVars(ast),
      nAFL      : numForLoopsInAllFuncDecls(ast),
      nAWL      : numWhileLoopsInAllFuncDecls(ast),
      isJOTFC   : isJustOneTopFuncCall(ast),
      isJTTFC   : isJustTwoTopFuncCall(ast),
      nTAOV     : numTopAlertOnVar(ast),
      nTAOL     : numTopAlertOnLit(ast),
      nTAOBE    : numTopAlertOnBinExp(ast),
      hasOTAOV  : hasOneTopAlertOnVar(ast),
      hasOTAOBE : hasOneTopAlertOnBinExp(ast),
      hasOTAOL  : hasOneTopAlertOnLit(ast),
      hasTTAOV  : hasTwoTopAlertOnVar(ast),
      hasTTAOBE : hasTwoTopAlertOnBinExp(ast),
      nTFD      : numTopFuncDecls(ast),
      nAFD      : numTotFuncDecls(ast),
      hasFIF    : hasFuncInFunc(ast)
    };

    return dObj;
  }



/******************************************************************/
/* 1. Style Grading for Declaration and Use of Variable           */
/*    a. numDecVars(ast)            ==> integer >= 0              */
/*    b. numUndecVars(ast)          ==> integer >= 0              */
/*    c. isAnyFuncVar(ast)          ==> boolean ? true:false      */
/*    d. isAnyGloVarUsedInFuns(ast) ==> boolean ? true:false      */
/******************************************************************/

//------------------------------------------------------------------------
// 1-a. calculate total number of declared variables in a program
//      ex: function bar() {
//            var d = 0;
//    
//            for(var i=0; i<10; i++) {
//              while(d==0) {
//                var d=1;
//              }
//            }
//          }
//------------------------------------------------------------------------  
  function numDecVars(ast) {
    var lm_dv = listVarsDeclared(ast);
    var l_dv = lm_dv.list;
    var m_dv = lm_dv.map;
    var n_dv = l_dv.length;
    console.log("numDecVars: " + n_dv + " : " + JSON.stringify(l_dv) );
    console.log("numDecVars: map :" + JSON.stringify(m_dv) );
    return n_dv;
  }

//------------------------------------------------------------------------
// 1-b. calculate total number of undeclared variables 
//      that get used in a program
//------------------------------------------------------------------------  
  function numUndecVars(ast) {
    //console.log("in numUndecVars, loc 1");
    var l_udv = listVarsUndeclared(ast);
    //console.log("in numUndecVars, loc 2");
    var n_udv = l_udv.length;
    //console.log("in numUndecVars, loc 3");
    console.log("numUndecVars: " + n_udv + " : " + JSON.stringify(l_udv) );
    return n_udv;
  } 

//------------------------------------------------------------------------
// 1-b1. calculate total number of declared variables
//      that get NOT used in a program
//------------------------------------------------------------------------
  function numUnUsedDecVars(ast) {
    var l_uudv = listVarsDeclaredNotUsed(ast);
    var n_uudv = l_uudv.length;
    console.log("numUnUsedDecVars: " + n_uudv + " : " + JSON.stringify(l_uudv) );
    return n_uudv;
  }


//------------------------------------------------------------------------
// 1-c. calculate total number of variables used in a program
//      ex. (array) arr.push(val)
//          alert(val)
//          var num = val + 1 (val gets used)
//          num = val + 1 (num and val both get used)
//------------------------------------------------------------------------
  function numVarsUsed(ast) {
    //console.log("in numVarsUsed, loc 1");
    var lm_vu = listVarsUsed(ast);

    //console.log("in numVarsUsed, loc 2");
    var l_vu = lm_vu.list;

    //console.log("in numVarsUsed, loc 3");
    var m_vu = lm_vu.map;

    //console.log("in numVarsUsed, loc 4");
    var n_vu = l_vu.length;

    console.log("numVarsUsed: " + n_vu + " : " + JSON.stringify(l_vu) );
    console.log("numVarsUsed: map: " + JSON.stringify(m_vu) );
    return n_vu;
  }

  function numVarsRead(ast) {  // pds added
    //console.log("in numVarsRead, loc 1");
    var lm_vr = listVarsUsed(ast);

    //console.log("in numVarsRead, loc 2");
    var l_vr = lm_vr.list;

    //console.log("in numVarsRead, loc 3");
    var m_vr = lm_vr.map;

    //console.log("in numVarsRead, loc 4");
    var n_vr = l_vr.length;

    console.log("numVarsRead: " + n_vr + " : " + JSON.stringify(l_vr) );
    console.log("numVarsRead: map: " + JSON.stringify(m_vr) );
    return n_vr;
  }

  function numVarsWritten(ast) {  // pds add
    //console.log("in numVarsWritten, loc 1");
    var lm_vw = listVarsWritten(ast);

    //console.log("in numVarsWritten, loc 2");
    var l_vw = lm_vw.list;

    //console.log("in numVarsWritten, loc 3");
    var m_vw = lm_vw.map;

    //console.log("in numVarsWritten, loc 4");
    var n_vw = l_vw.length;

    console.log("numVarsWritten: " + n_vw + " : " + JSON.stringify(l_vw) );
    console.log("numVarsWritten: map: " + JSON.stringify(m_vw) );
    return n_vw;
  } 



//------------------------------------------------------------------------
// 1-d. calculate the number of variables in functions that uses 
//      global declared variables
//      ex: 
//          var globj = {name: "xxx", age:20};
//          function bar() {
//            var num = globj;
//            alert(globj.name);
//          }
//------------------------------------------------------------------------
  function numVarsInFuncsUseGloVars(ast) {
    console.log("numVarsInFuncsUseGloVars (hack pds): " + 0); // pds hack
    return 0; // pds hack
    var l_vifugv = listVarsInFuncsUseGloVars(ast);
    var n_vifugv = l_vifugv.length;
    console.log( "numVarsInFuncsUseGloVars: " + n_vifugv );
    return n_vifugv;
  }


//------------------------------------------------------------------------
// 1-e. exam if any function gets assigned to a variable in global level
//      ex: function bar() { }
//          var f2 = bar;
//------------------------------------------------------------------------
  function isAnyFuncVar(ast) {
    var d_fv =  dictFuncVars(ast);
    var n_fv =  d_fv.useds.keys().length;
    console.log("isAnyFuncVar: " + (n_fv>0) );
    return (n_fv>0);
  }


//------------------------------------------------------------------------
// private function:
// list all declared variables in a program
//------------------------------------------------------------------------ 
  function listVarsDeclared(ast, decVars) {
    var map, nd, m, n, decs;
    var list    = [];
    var floop    = " <= for { }";
    var wloop    = " <= while { }";
    var ifblock  = " <= if { }";
    var funblock = " <= Function ";

    if(arguments.length==2) { map = decVars; } else { map = new HashMap(); }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":  // base case for a variable declaration
          decs = nd.declarations;

          for(n in decs) {

            var added = false;

            if(decs[n].init != null) { 
              // has an initialization
              if(decs[n].init.type != "FunctionExpression") { 
                // this includes
                //   var x = 12;       Literal
                //   var x = y;        Identifier
                //   var x = y*12;     BinaryExpression
                //   var x = y++;      UpdateExpression
                //   var x = foo(12);  CallExpression
                list.push("var " + decs[n].id.name); 
                added = true;
              }
            }
            else if(decs[n].id.type=="Identifier"){ 
              // no initialization
              // includes
              //   var x;
              //   var x, y, m;
              list.push("var " + decs[n].id.name); 
              added = true;
            }
            if(added && map.getItem(decs[n].id.name)==undefined) {
              map.setItem(decs[n].id.name, [ast.start, ast.end]);
            }

          } // end for each decl
          break;

        case "ForStatement":
          // check vars in loop initilization
          if(nd.init!=null                      && 
            nd.init.type=="VariableDeclaration" &&
            nd.init.declarations[0].init!= null) {
            var dec = nd.init.declarations[0];
            var add = 0;

            if(dec.init.type=="Literal") {
              list.push(dec.id.name + " <= " + floop);
              add = 1;
            }
            else if(dec.init.type=="Identifier") {
              var pos = map.getItem(dec.init.name);

              // exam if a declared var is in a calling scope or not
              if(pos!=undefined && pos[0]<nd.start && pos[1]>nd.end) {
                list.push(dec.id.name + floop);
                add = 1;
              }
            }

            if(add==1 && map.getItem(dec.id.name)==undefined) { 
              // a var declaration has a wider scoping range than a var usage
              map.setItem(dec.id.name, [ast.start, ast.end]); 
            }
          }

          // check vars in loop body
          if(nd.body.body.length > 0) { 
            var obj    = listVarsDeclared(nd.body, map);
            var lpVars = obj.list;
            map        = obj.map;

            for(n in lpVars) { list.push(lpVars[n] + floop); }
          }
          break;

        case "WhileStatement":
          if(nd.body.body.length > 0) { 
            var obj    = listVarsDeclared(nd.body, map);
            var wpVars = obj.list;
            map        = obj.map;

            for(n in wpVars) { list.push(wpVars[n] + wloop); }
          }
          break;

        case "IfStatement":
          if(nd.consequent.body.length > 0) {
            var obj    = listVarsDeclared(nd.consequent, map);
            var ifVars = obj.list;
            map        = obj.map;

            for(n in ifVars) { list.push(ifVars[n] + ifblock); }
          }
          break;

        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.id.name;
            var obj    = listVarsDeclared(nd.body, map);
            var ndVars = obj.list;
            map        = obj.map;

            for(n in ndVars) { list.push(ndVars[n] + funblock + ndName + "()"); }
          }
          break;
        case "SwitchStatement":
          break;
        case "BlockStatement":
          break;
      }
    }

    return {list: list, map: map};
  }


//------------------------------------------------------------------------
// private function:
// list all operator variables (right-hand side variables)
//------------------------------------------------------------------------ 
  function listOperatorVars(nd, map) {
    var list = [];

    //console.log("(listOperatorVars) switch nd.type: "+nd.type);
    switch(nd.type) {
      case "Identifier":
        list.push(nd.name);

        if(map.getItem(nd.name)==undefined) {
          map.setItem(nd.name, [nd.start, nd.end]);
        }
        break;
      case "BinaryExpression":
        var left      = listOperatorVars(nd.left, map);
        var right     = listOperatorVars(nd.right, map);
        var lMap      = left.map;
        var rMap      = right.map;
        var lMapKeys  = lMap.keys();
        var rMapKeys  = rMap.keys();

        list = list.concat(left.list);
        list = list.concat(right.list);

        for(m in lMapKeys) {
          if(map.getItem(lMapKeys[m])==undefined) {
            map.setItem(lMapKeys[m], lMap.getItem(lMapKeys[m]));
          }
        }

        for(m in rMapKeys) {
          if(map.getItem(rMapKeys[m])==undefined) {
            map.setItem(rMapKeys[m], rMap.getItem(rMapKeys[m]));
          }
        }
        break;
      case "Literal":
        break;
      case "CallExpression":
        break;
    }
    //console.log("(listOperatorVars) return");
    return {list:list, map:map};
  }


//------------------------------------------------------------------------
// private function:
// list all undeclared variables that get used in a program
//------------------------------------------------------------------------ 
  function listVarsUndeclared(ast) {
    var decVars  = listVarsDeclared(ast).map;
    console.log("in listVarsUndeclared: decVars map: " + JSON.stringify(decVars) );
    var usedVars = listVarsUsed(ast).map;
    console.log("in listVarsUndeclared: usedVars map: " + JSON.stringify(usedVars) );
    var keys     = usedVars.keys();
    console.log("in listVarsUndeclared: usedVars keys: " + JSON.stringify(keys) );
    var list     = [];

    // check for the use of undeclared vars
    for(m in keys) { 
      var scopeDecVar  = decVars.getItem(keys[m]);
      var scopeUsedVar = usedVars.getItem(keys[m]);

      if(scopeDecVar == undefined) {
        list.push(keys[m]);
      } 
      else if(scopeUsedVar[0]<scopeDecVar[0] || scopeUsedVar[0]>scopeDecVar[1] ||
        scopeUsedVar[1]<scopeDecVar[0] || scopeUsedVar[1]>scopeDecVar[1]) {
        list.push(keys[m]);
      }
    }
    return list;
  } 



//------------------------------------------------------------------------
// private function:
// list all variables that are used in a program
//------------------------------------------------------------------------ 
  function listVarsUsed(ast, varMap) {

    // we want to really look for vars that are read...
    //
    // vars that have values retrieved from memory
    // this includes
    //    var x = y;  decls with init (RHS is read)
    //    x = y + z;  RHS of assignment
    //    foo(z);     arg lists of calls
    //    if (x==4) {}     if conditionals
    //    while (x==4) {}  while conditionals
    //    for (x=1; x<10; x++) {}  for structures
    //    x++;                     update expressions

    var list    = [];
    var nd, args, cal, left, right, lList, rList, map;
    var floop    = " <= for { }";
    var wloop    = " <= while { }";
    var ifblock  = " <= if { }";
    var funblock = " <= Function ";

    if (arguments.length==2) { map = varMap; } else { map = new HashMap(); }

    for(var m in ast.body) {
      nd = ast.body[m];

      //console.log("(listVarsUsed) switch on:"+nd.type);
      switch(nd.type) { // base case
        case "VariableDeclaration":
          decs = nd.declarations;
          for(var d in decs) {
            if (decs[d].init!=null) { 
              // there is initialization 
              // LHS is used via init
              list.push(decs[d].id.name);
              if(map.getItem(decs[d].id.name)==undefined) {
                map.setItem(decs[d].id.name, [nd.start, nd.end]);
              }
              
              // now deal with RHS
              if(decs[d].init.type=="Literal") { 
                // ex: x = 12;
                // nothing to do
              }
              else if(decs[d].init.type=="Identifier") { 
                // ex: x = y;
                list.push(decs[d].init.name); // y is used
              }
              else if(decs[d].init.type=="BinaryExpression") { 
                // ex: x = 12*y;
                left   = listOperatorVars(decs[d].init.left, map);
                map    = left.map;
                right  = listOperatorVars(decs[d].init.right, map);
                map    = right.map;
                list   = list.concat(left.list);
                list   = list.concat(right.list);
              }
              else if(decs[d].init.type=="UpdateExpression") { 
                // ex: x = y++;
                // need to do this one
              }
              else if(decs[d].init.type=="CallExpression") { 
                // ex: x = foo(m);
                // need to do this one
                //console.log("got a funccall in init");
              }

            } // end has initialization 

          }
          break;
        case "ExpressionStatement":
          exp = nd.expression;

          switch(exp.type) {
            case "UpdateExpression":
              list.push(exp.argument.name);
              if(map.getItem(exp.argument.name)==undefined) {
                map.setItem(exp.argument.name, [nd.start, nd.end]);
              }
              break;
            case "AssignmentExpression":
              left   = listOperatorVars(exp.left, map);
              map    = left.map;
              right  = listOperatorVars(exp.right, map);
              map    = right.map;
              list   = list.concat(left.list);
              list   = list.concat(right.list);
              break;
            case "CallExpression":
              cal = exp.callee;

              // check for passing arguments in call functions
              if(cal.type=="Identifier") {
                args = exp.arguments;

                if(args.length>0) {
                  for(n in args) {
                    if(args[n].type=="Identifier") { // ex: foo( x );
                      list.push(args[n].name); // x is used

                      if(map.getItem(args[n].name)==undefined) {
                        map.setItem(args[n].name, [nd.start, nd.end]);
                      }
                    }
                    else if(args[n].type=="BinaryExpression") { // ex: foo( 12*x );
                      // pds added this
                      left   = listOperatorVars(args[n].left, map);
                      map    = left.map;
                      right  = listOperatorVars(args[n].right, map);
                      map    = right.map;
                      list   = list.concat(left.list);
                      list   = list.concat(right.list);
                    }
                  }
                }
              }
              else if(cal.type=="MemberExpression") {
                args = exp.arguments;

                // check for objects that calls their property functions
                if(cal.object=="Identifier") {
                  list.push(cal.object.name);

                  if(map.getItem(cal.object.name)==undefined) {
                    map.setItem(cal.object.name, [nd.start, nd.end]);
                  }
                }

                // check for passing arguments in call functions
                if(args.length>0) {
                  for(n in args) {
                    if(args[n].type=="Identifier") {
                      list.push(args[n].name);

                      if(map.getItem(args[n].name)==undefined) {
                        map.setItem(args[n].name, [nd.start, nd.end]);
                      }
                    }
                  }
                }
              }
              break;
          }
          break;
        case "ForStatement":

          /* check vars in loop initilization */
  
          if (nd.init == null) { 
            // for ( ; ; ) { }
          }
          else if(nd.init != null && nd.init.type=="Identifier") { 
            // for (n; ; ) { }
          }
          else if(nd.init != null && nd.init.type=="AssignmentExpression") { 
            left   = listOperatorVars(nd.init.left, map);
            map    = left.map;
            right  = listOperatorVars(nd.init.right, map);
            map    = right.map;
            lList  = left.list;
            rList  = right.list;

            for(n in lList) { list.push(lList[n] + floop); }
            for(n in rList) { list.push(rList[n] + floop); }
          }
          else if(nd.init != null && nd.init.type=="VariableDeclaration") { 

            // left-hand side var declaration
            var varName  = nd.init.declarations[0].id.name;
            list.push(varName + floop);
            if(map.getItem(varName)==undefined) { 
              map.setItem(varName, [nd.start, nd.end]); 
            }

            // right-hand side possilble var assignment
            if(nd.init.declarations[0].init.type=="BinaryExpression") {
              left   = listOperatorVars(nd.init.declarations[0].init.left, map);
              map    = left.map;
              right  = listOperatorVars(nd.init.declarations[0].init.right, map);
              map    = right.map;
              lList  = left.list;
              rList  = right.list;

              for(n in lList) { list.push(lList[n] + floop); }
              for(n in rList) { list.push(rList[n] + floop); }
            }
          } 

          // check vars in loop body
          if(nd.body.body.length > 0) { 
            var obj     = listVarsUsed(nd.body, map);
            var lpVars  = obj.list;
            map         = obj.map;

            for(n in lpVars) { list.push(lpVars[n] + floop); }
          }
          break;
        case "WhileStatement":
          /* skip conditional vars in while test bracket */

          // check vars in loop body
          if(nd.body.body.length > 0) { 
            var obj    = listVarsUsed(nd.body, map);
            var wpVars = obj.list;
            map        = obj.map;

            for(n in wpVars) { list.push(wpVars[n] + wloop); }
          }

          break;
        case "IfStatement":
          if(nd.consequent.body.length > 0) {
            var obj    = listVarsUsed(nd.consequent, map);
            var ifVars = obj.list;
            map        = obj.map;

            for(n in ifVars) { list.push(ifVars[n] + ifblock); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName  = nd.id.name;
            var obj     = listVarsUsed(nd.body, map);
            var ndVars  = obj.list;
            map         = obj.map;

            for(n in ndVars) { list.push(ndVars[n] + funblock + ndName + "()"); }
          }
          break;
      }
    }
    //console.log("(listVarsUsed) return");
    return {list:list, map:map};
  } 



//------------------------------------------------------------------------
// private function:
// list all variables that are written in a program
//------------------------------------------------------------------------ 

  function listVarsWritten(ast, varMap) {
    
    // look for vars that are addigned to or have value changed...
    //
    // vars that have values put into memory
    // this includes
    //    var x = y;  LHS of decls with init (RHS is read)
    //    x = y + z;  LHS of assignment
    //    x++;                     update expressions
    //    for (x=1; x<10; x++) {}  for structures, in init and update

    var list    = [];
    var nd, args, cal, add, left, right, lList, rList, map;
    var floop    = " <= for { }";
    var wloop    = " <= while { }";
    var ifblock  = " <= if { }";
    var funblock = " <= Function ";

    //console.log(" >>IN listVarsWritten (start)");

    if(arguments.length==2) { map=varMap; } else { map=new HashMap(); }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) { // base case

        case "VariableDeclaration":
          //console.log(" >>IN listVarsWritten (case VarDecl)");
          decs = nd.declarations;
          for(dc=0; dc<decs.length; dc++) {
            if (decs[dc].init!=null) { 
              // there is initialization so LHS is written
              list.push(decs[dc].id.name); 
            } 
          }
          break;

        case "ExpressionStatement":
          //console.log(" >>IN listVarsWritten (case ExprStmnt)");
          exp = nd.expression;

          switch(exp.type) {
            case "UpdateExpression":
              //console.log(" >>IN listVarsWritten (case ExprStmnt.Update)");
              list.push(exp.argument.name);
              // if(map.getItem(exp.argument.name)==undefined) {
              //  map.setItem(exp.argument.name, [nd.start, nd.end]);
              // }
              break;
            case "AssignmentExpression":
              //console.log(" >>IN listVarsWritten (case ExprStmnt.Assn)");
              list.push(exp.left.name);
              break;
            case "CallExpression":
              //console.log(" >>IN listVarsWritten (case ExprStmnt.Call)");
              // nothing to do... func call doesnt write to a var
              break;
          }
          break;

        case "ForStatement":
          //console.log(" >>IN listVarsWritten (case For)");
          // check for writes in loop init
          // then check loop body

          /* check vars in loop initilization */

          if(nd.init != null && nd.init.type=="AssignmentExpression") { 
            left   = listOperatorVars(nd.init.left, map);
            map    = left.map;
            right  = listOperatorVars(nd.init.right, map);
            map    = right.map;
            lList  = left.list;
            rList  = right.list;

            for(n in lList) { list.push(lList[n] + floop); }
            for(n in rList) { list.push(rList[n] + floop); }
          }
          else if(nd.init != null && nd.init.type=="VariableDeclaration") { 

            // left-hand side var declaration
            var varName  = nd.init.declarations[0].id.name;
            list.push(varName + floop);
            if(map.getItem(varName)==undefined) { 
              map.setItem(varName, [nd.start, nd.end]); 
            }

            // right-hand side possilble var assignment
            if(nd.init.declarations[0].init.type=="BinaryExpression") {
              left   = listOperatorVars(nd.init.declarations[0].init.left, map);
              map    = left.map;
              right  = listOperatorVars(nd.init.declarations[0].init.right, map);
              map    = right.map;
              lList  = left.list;
              rList  = right.list;

              for(n in lList) { list.push(lList[n] + floop); }
              for(n in rList) { list.push(rList[n] + floop); }
            }
          } 

          // check vars in loop body
          if(nd.body.body.length > 0) { 
            var obj     = listVarsUsed(nd.body, map);
            var lpVars  = obj.list;
            map         = obj.map;

            for(n in lpVars) { list.push(lpVars[n] + floop); }
          }
          break;

        case "WhileStatement":
          //console.log(" >>IN listVarsWritten (case While)");
          /* skip conditional vars in while test bracket */

          // check vars in loop body
          if(nd.body.body.length > 0) { 
            var obj    = listVarsUsed(nd.body, map);
            var wpVars = obj.list;
            map        = obj.map;

            for(n in wpVars) { list.push(wpVars[n] + wloop); }
          }

          break;

        case "IfStatement":
          //console.log(" >>IN listVarsWritten (case If)");
          if(nd.consequent.body.length > 0) {
            var obj    = listVarsUsed(nd.consequent, map);
            var ifVars = obj.list;
            map        = obj.map;

            for(n in ifVars) { list.push(ifVars[n] + ifblock); }
          }
          break;

        case "FunctionDeclaration":
          //console.log(" >>IN listVarsWritten (case FuncDecl)");
          if(nd.body.body.length > 0) {
            var ndName  = nd.id.name;
            var obj     = listVarsUsed(nd.body, map);
            var ndVars  = obj.list;
            map         = obj.map;

            for(n in ndVars) { list.push(ndVars[n] + funblock + ndName + "()"); }
          }
          break;
      }
    } // end for loop
    return {list:list, map:map};
  } 



//------------------------------------------------------------------------
// private function:
// list all declared but unused variables in a program
//------------------------------------------------------------------------ 
// pds not done

  function listVarsDeclaredNotUsed(ast) {
    var decVars  = listVarsDeclared(ast).map;
    var usedVars = listVarsUsed(ast).map;
    //var ukeys     = usedVars.keys();
    var dkeys     = decVars.keys();
    var list     = [];


    // pds // check for the use of each declared var
    for(m in dkeys) { 
      var scopeDecVar  = decVars.getItem(dkeys[m]);
      var scopeUsedVar = usedVars.getItem(dkeys[m]);

      if(scopeUsedVar == undefined) {
        list.push(dkeys[m]);
      } 
/*
// pds not sure what this scope is
      else if(scopeUsedVar[0]<scopeDecVar[0] || scopeUsedVar[0]>scopeDecVar[1] ||
        scopeUsedVar[1]<scopeDecVar[0] || scopeUsedVar[1]>scopeDecVar[1]) {
        list.push(dkeys[m]);
      }
*/
    }
    return list;
  }


//------------------------------------------------------------------------
// private function:
// list global variables in which directly points to a function
//      ex: function bar() { }
//          var f2 = bar;
//------------------------------------------------------------------------ 
  function dictFuncVars(ast, funcNames, funcVars) {
    var nd, temp, obj, funcs, useds;
    var list = [];

    if(arguments.length==3) { 
      funcs = funcNames; 
      useds = funcVars;
    } else {
      funcs = new HashMap(); 
      useds = new HashMap();
    }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "FunctionDeclaration":
          funcs.setItem(nd.id.name, [nd.start, nd.end]); // collect declared functions into funcs
        case "VariableDeclaration":

          /* loop through the program to validate each var-to-func pair */
          
          var sbnd = nd.declarations;
          for(n in sbnd) {    
            if(sbnd[n].init!=null && sbnd[n].init.type=="Identifier") {
              if(funcs.hasItem(sbnd[n].init.name) && !useds.hasItem(sbnd[n].id.name)){
                useds.setItem(sbnd[n].id.name, [nd.start, nd.end]);
              }
            } 
          }
          break;
        case "ExpressionStatement":

          /* loop through the program to validate each var-to-func pair */

          var exp = nd.expression;
          if(exp.type=="AssignmentExpression" && 
            exp.left.type=="Identifier" && exp.right.type=="Identifier") {
            if(funcs.hasItem(exp.right.name) && !useds.hasItem(exp.left.name)) { 
              useds.setItem(exp.left.name, [nd.start, nd.end]);
            }                    
          }
          break;
        case "WhileStatement":
          if(nd.body.body.length>0) {
            obj = dictFuncVars(nd.body, funcs, useds);
            useds = obj.useds;
            funcs = obj.funcs;
          }
          break;
        case "IfStatement":
          if(nd.consequent.body.length>0) {
            obj = dictFuncVars(nd.consequent, funcs, useds);
            useds = obj.useds;
            funcs = obj.funcs;
          }
          break;
        case "ForStatement":
          if(nd.body.body.length>0) {
            obj = dictFuncVars(nd.body, funcs, useds);
            useds = obj.useds;
            funcs = obj.funcs;
          }
          break;
      }
    }

    // console.log("ListFuncVars: " +arr);
    return {useds: useds, funcs: funcs};
  }

//------------------------------------------------------------------------
// private function:
// list global variables in a program
//      ex: var f2 = 100; // f2 is a global var
//          function bar() {
//            var a = f2;  
//          }
//------------------------------------------------------------------------ 
  function dictGloVars(ast) {
    var map = new HashMap();
    var nd, decs;

    for(m in ast.body) {
      nd = ast.body[m];

      if(nd.type=="VariableDeclaration") {
        decs = nd.declarations;

        for(n in decs) {
          var add = 0;
          if(decs[n].init!=null) { // make sure a declaration trys to bind a var with a value;

            if(decs[n].init.type=="Identifier") {  // check for variable pointer 
              var pos = map.getItem(decs[n].init.name);

              if(pos!=undefined && pos[0]<nd.start && pos[1]>nd.end &&
                map.getItem(decs[n].id.name)==undefined) {
                map.setItem(decs[n].id.name, [ast.start, ast.end]);
              }
            } 
            else if(decs[n].init.type=="Literal" &&
              map.getItem(decs[n].id.name)==undefined) {// check for variable initialization    
              map.setItem(decs[n].id.name, [ast.start, ast.end]);
            }
          }
          else if(decs[n].id.type=="Identifier" && 
            map.getItem(decs[n].id.name)==undefined){
            map.setItem(decs[n].id.name, [ast.start, ast.end]);
          }
        }
      }
    }

    return map;
  }

//------------------------------------------------------------------------
// private function:
// list global variables that are used in functions
//      ex: var f2 = 100;
//          function bar() {
//            var a = f2;  
//          }
//------------------------------------------------------------------------ 
  function listVarsInFuncsUseGloVars(ast, gloVars) {
    var mapGloVars, nd, m, n, decs;
    var list     = [];
    var floop    = " <= for { }";
    var wloop    = " <= while { }";
    var ifblock  = " <= if { }";
    var funblock = " <= Function ";

    if(arguments.length==2) { 
      mapGloVars = gloVars; 

      for(m in ast.body) {
        nd = ast.body[m];

        switch(nd.type) {
          case "VariableDeclaration":  // base case for a variable declaration
            decs = nd.declarations;

            for(n in decs) {
              if(decs[n].init!=null && decs[n].init.type=="Identifier") { // make sure a declaration trys to bind a var with a value;
                var pos = mapGloVars.getItem(decs[n].init.name);

                if(pos!=undefined && pos[0]<nd.start) {
                  list.push("var " + decs[n].id.name); 
                }
              }
            }
            break;
          case "ForStatement":

            // check vars in loop initilization
            if(nd.init!=null                      && 
              nd.init.type=="VariableDeclaration" &&
              nd.init.declarations[0].init!= null) {
              var dec = nd.init.declarations[0];

              if(dec.init.type=="Identifier") {
                var pos = map.getItem(dec.init.name);

                // exam if a declared var is in a calling scope or not
                if(pos!=undefined && pos[0]<nd.start) {
                  list.push(dec.id.name + floop);
                }
              }
            }

            // check vars in loop body
            if(nd.body.body.length > 0) { 
              var lpList = list.concat(listVarsInFuncsUseGloVars(nd.body, mapGloVars));

              for(n in lpList) { list.push(lpList[n] + floop); }
            }
            break;
          case "WhileStatement":
            if(nd.body.body.length > 0) { 
              var wlList = list.concat(listVarsInFuncsUseGloVars(nd.body, mapGloVars));

              for(n in list) { list.push(wlList[n] + wloop); }
            }
            break;
          case "IfStatement":
            if(nd.consequent.body.length > 0) {
              var ifList = list.concat(listVarsInFuncsUseGloVars(nd.consequent, mapGloVars));

              for(n in ifList) { list.push(ifList[n] + ifblock); }
            }
            break;
        }
      }
    } else {
      mapGloVars = dictGloVars(ast); 

      for(m in ast.body) {
        nd = ast.body[m];

        if(nd.type=="FunctionDeclaration" && nd.body.body.length>0) {
          list = list.concat(listVarsInFuncsUseGloVars(nd.body, mapGloVars));
        }
      }
    }
    return list;
  }




/******************************************************************/
/* 2. Style Grading for Declaration and Use of Array              */
/*    a. numDecArrs(ast)      ==> integer >= 0                    */
/*    b. numUndecArrs(ast)    ==> integer >= 0                    */
/*    c. numArrsUsed(ast)     ==> integer >= 0                    */
/******************************************************************/

//------------------------------------------------------------------------
// 2-a. calculate total number of declared arrays in a program
//      ex: 
//          var a, e=[], f="empty";
//          var b = [one, two, three];
//          var c = new Array();
//------------------------------------------------------------------------  
  function numDecArrs(ast) {
    console.log("numDecArrs: " + listDecArrs(ast).arr.length);
    return listDecArrs(ast).arr.length;
  } 


//------------------------------------------------------------------------
// 2-b. calculate total number of undeclared arrays 
//      that get used in a program
//      ex:
//        (undeclared p) p.push("p");
//        (undeclared a) a = [one, two, three];
//        (undeclared b) b = new Array({});
//        (undeclared c) c = [];
//------------------------------------------------------------------------  
  function numUndecArrs(ast) {
    console.log("numUndecArrs: " + listUndecArrs(ast).length);
    return listUndecArrs(ast).length;
  } 



//------------------------------------------------------------------------
// 2-c. calculate total number of arrays that are used in a program
//      ex:
//        p.push("p"), p.sort(), p.shift()...
//        a = [one, two, three];
//        b = new Array({});
//        c = [];
//------------------------------------------------------------------------  
  function numArrsUsed(ast) {
    console.log("numArrsUsed: " + listArrsUsed(ast).arr.length);
    return listArrsUsed(ast).arr.length;
  } 



//------------------------------------------------------------------------
// private function:
// list declared arrays in a program
//      ex: 
//          var a, e=[], f="empty";
//          var b = [one, two, three];
//          var c = new Array();
//------------------------------------------------------------------------ 
  function listDecArrs(ast, decArrs) {
    var map, nd, m, n;
    var arr      = [];
    var floop    = " <= for { }";
    var wloop    = " <= while { }";
    var ifblock  = " <= if { }";
    var funblock = " <= Function ";

    if(arguments.length==2) { 
      map = decArrs; 
    }
    else {
      map = new HashMap(); 
    }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":
          decs = nd.declarations;
          for(n in decs) {
            if(decs[n].init != null) {
              var add = 0;
              if(decs[n].init.type=="ArrayExpression") {
                arr.push(decs[n].id.name);
                add = 1;
              }
              else if(decs[n].init.type=="NewExpression" && 
                decs[n].init.callee.name=="Array") {
                arr.push(decs[n].id.name);
                add = 1;
              }
              else if(decs[n].init.type=="Identifier") {
                var pos = map.getItem(decs[n].init.name);

                if(pos!=undefined && pos[0]<nd.start && pos[1]>nd.end) {
                  arr.push(decs[n].id.name);
                  add = 1;
                }
              }

              if(add==1 && map.getItem(decs[n].id.name)==undefined) {
                map.setItem(decs[n].id.name, [ast.start, ast.end]);
              }
            }
          }
          break;
        case "ForStatement":
          // check var in loop body
          if(nd.body.body.length > 0) {
            var obj     = listDecArrs(nd.body, map);
            var lpArrs  = obj.arr;
            map         = obj.map;

            for(n in lpArrs) { arr.push(lpArrs[n] + floop); }
          }
          break;
        case "WhileStatement":
          if(nd.body.body.length > 0) { 
            var obj    = listDecArrs(nd.body, map);
            var wpArrs = obj.arr;
            map        = obj.map;

            for(n in wpArrs) { arr.push(wpArrs[n] + wloop); }
          }
          break;
        case "IfStatement":
          if(nd.consequent.body.length > 0) {
            var obj     = listDecArrs(nd.consequent, map);
            var ifVars  = obj.arr;
            map         = obj.map;

            for(n in ifVars) { arr.push(ifVars[n] + ifblock); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName  = nd.id.name;
            var obj     = listDecArrs(nd.body, map);
            var ndArrs  = obj.arr;
            map         = obj.map;

            for(n in ndArrs) { arr.push(ndArrs[n] + funblock + ndName + "()"); }
          }
          break;
      }
    }

    return {arr: arr, map: map};
  } 


//------------------------------------------------------------------------
// private function:
// list all undeclared arrays that get used in a program
//      ex:
//        (undeclared p) p.push("p");
//        (undeclared a) a = [one, two, three];
//        (undeclared b) b = new Array({});
//        (undeclared c) c = [];
//------------------------------------------------------------------------ 
  function listUndecArrs(ast) {
    var decArrs  = listDecArrs(ast).map;
    var usedArrs = listArrsUsed(ast).map;
    var keys     = usedArrs.keys();
    var list     = [];

    // check for the use of undelcared arrs
    for(m in keys) { 
      var scopeDecArr  = decArrs.getItem(keys[m]);
      var scopeUsedArr = usedArrs.getItem(keys[m]);
      
      if(scopeDecArr == undefined) {
        list.push(keys[m]);
      } 
      else if(scopeUsedArr[0]<scopeDecArr[0] || scopeUsedArr[0]>scopeDecArr[1] ||
        scopeUsedArr[1]<scopeDecArr[0] || scopeUsedArr[1]>scopeDecArr[1]) {
        list.push(keys[m]);
      }
    }

    // console.log("listUndecArrs: " + list);
    return list;
  } 


//------------------------------------------------------------------------
// private function:
// list all arrays that are used in a program 
//      ex:
//        p.push("p"), p.sort(), p.shift()...
//        a = [one, two, three];
//        b = new Array({});
//        c = [];
//------------------------------------------------------------------------  
  function listArrsUsed(ast, usedArrs) {
    var arr      = [];
    var floop    = " <= for { }";
    var wloop    = " <= while { }";
    var ifblock  = " <= if { }";
    var funblock = " <= Function ";
    var nd, m, exp, func, map, add;

    if(arguments.length==2) { 
      map = usedArrs; 
    }
    else {
      map = new HashMap(); 
    }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "ExpressionStatement":
          exp = nd.expression;

          switch(exp.type) {
            case "AssignmentExpression":
              add = 0;
              if(exp.right.type=="ArrayExpression") { 
                arr.push(exp.left.name); 
                add = 1;
              }
              else if(exp.right.type=="NewExpression" && exp.right.callee.name=="Array") {
                arr.push(exp.left.name);
                add = 1;
              }              

              if(add==1 && map.getItem(exp.left.name)==undefined) {
                map.setItem(exp.left.name, [nd.start, nd.end]);
              }
              break;
            case "CallExpression":
              if(exp.callee.type=="MemberExpression") {
                method = exp.callee.property.name;

                if(method=="push" || method=="sort"  || method=="join" || method=="valueOf" ||
                   method=="pop"  || method=="shift" || method=="unshift") {
                  arr.push(exp.callee.object.name);
              
                  if(map.getItem(exp.callee.object.name)==undefined) {
                    map.setItem(exp.callee.object.name, [nd.start, nd.end]);
                  }
                } 
              }
              break;
          }
          break;
        case "ForStatement":
          var floop = "for loop";
          // check vars in loop body
          if(nd.body.body.length > 0) { 
            var obj    = listArrsUsed(nd.body, map);
            var lpArrs = obj.arr
            map        = obj.map;

            for(n in lpArrs) { arr.push(lpArrs[n] + " <= " + floop); }
          }
          break;
        case "WhileStatement":
          /* skip testing vars*/

          // check vars in loop body
          var wloop = "while loop";
          if(nd.body.body.length > 0) { 
            var obj    = listArrsUsed(nd.body, map);
            var wpArrs = obj.arr;
            map        = obj.map;

            for(n in wpArrs) { arr.push(wpArrs[n] + " <= " + wloop); }
          }
          break;
        case "IfStatement":
          if(nd.consequent.body.length > 0) {
            var obj    = listArrsUsed(nd.consequent, map);
            var ifVars = obj.arr;
            map        = obj.map;

            for(n in ifVars) { arr.push(ifVars[n] + ifblock); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.id.name;
            var obj    = listArrsUsed(nd.body, map);
            var ndArrs = obj.arr;
            map        = obj.map;
            for(n in ndArrs) { arr.push(ndArrs[n] + funblock + ndName + "()"); }
          }
          break;
      }
    }
    // console.log("listArrsUsed: " + arr);
    return {arr:arr, map:map};
  } 



/******************************************************************/
/* 3. Style Grading for Declaration and Use of Object             */
/*    a. numDecObjs(ast)                 ==> integer >= 0         */
/*    b. numUndecObjs(ast)               ==> integer >= 0         */
/*    c. numObjsUsed(ast)                ==> integer >= 0         */
/*    d. isAnyFuncBoundToAFuncRtnObj(ast)==> boolean ? true:false */
/******************************************************************/    

//------------------------------------------------------------------------
// 3-a. calculate total number of declared objects in a program
//      ex: 
//          var car = {name:"Tom", age:20};
//          var obj = new Object();
//          
//      the followings do not count as objects:
//          var x = new String();       
//          var y = new Number();    
//          var z = new Boolean(); 
//------------------------------------------------------------------------  
  function numDecObjs(ast) {
    console.log("numDecObjs: "+ dictDecObjs(ast).keys().length);
    return dictDecObjs(ast).keys().length;
  } 

//------------------------------------------------------------------------
// 3-b. calculate total number of undeclared objects 
//      that get used in a program
//      ex:
//        (undeclared obj) objName.methodName() ==> car.name() 
//        (undeclared a)   a = { name: "A", age:20 }
//------------------------------------------------------------------------  
  function numUndecObjs(ast) {
    console.log("numUndecObjs: "+ listUndecObjs(ast).length);
    return listUndecObjs(ast).length;
  } 


//------------------------------------------------------------------------
// 3-c. calculate total number of objects that are used in a program
//      ex:
//        objName.methodName() ==> car.name() 
//        a = { name: "A", age:20 }
//------------------------------------------------------------------------  
  function numObjsUsed(ast) {
    console.log("numObjsUsed: " +dictUsedObjs(ast).keys().length);
    return dictUsedObjs(ast).keys().length;
  } 


//------------------------------------------------------------------------
// 3-d. identify if any function return object is bound to a function
//      ex:
//        function foo() {
//          var ob = {
//            someField: 5,
//            someFn : function () {}
//          };
//          return ob;
//        }
//
//        OR
//
//        function bar() {
//          function inner() {}
//
//          var ob = {
//            someFn : inner,
//            someField: 5
//          };
//          return ob;
//        }
//------------------------------------------------------------------------  
  function isAnyFuncBoundToAFuncRtnObj(ast) {
    var list  = [];
    var nd, bodys, decs, props, funcs, funcObjs;
    var check = false;

    for(m in ast.body) {
      nd = ast.body[m];

      if(nd.type=="FunctionDeclaration") {
        bodys    = nd.body.body;
        funcs    = new Set();
        funcObjs = new Set();

        for(n in bodys) {
          switch(bodys[n].type) {
            case "FunctionDeclaration":
              funcs.add(bodys[n].id.name);
              break;
            case "VariableDeclaration":
              decs = bodys[n].declarations;

              for(d in decs) {
                if(decs[d].init!=null && decs[d].init.type=="ObjectExpression") {
                  props = decs[d].init.properties;

                  for(p in props) {
                    if(props[p].value.type=="FunctionExpression") {
                      funcObjs.add(decs[d].id.name);
                    }
                    else if(props[p].value.type=="Identifier") {
                      if(funcs.has(props[p].value.name)) {
                        funcObjs.add(decs[d].id.name);
                      }
                    }
                  }
                }
              }
              break;
            case "ReturnStatement":
              if (bodys[n].argument !== null) {
                if(bodys[n].argument.type=="Identifier" && 
                  funcObjs.has(bodys[n].argument.name)) {
                  check = true;
                }
              }
              break;
          }
        }
      }
    }
    console.log("isAnyFuncBoundToAFuncRtnObj: " + check);
    return check;
  }

//------------------------------------------------------------------------
// private function:
// create a dictionary that maps all declared objects 
// with their occurance orders  
//      ex: 
//          var car = {name:"Tom", age:20};
//          var obj = new Object();
//          
//      the followings do not count as objects:
//          var x = new String();       
//          var y = new Number();    
//          var z = new Boolean(); 
//------------------------------------------------------------------------  
  function dictDecObjs(ast, decObjs) {
    var dict, nd, m, n, name, keys;

    // a naive way to do function overloading 
    if(arguments.length==2) { 
      dict = decObjs; 
    }
    else {
      dict = new HashMap(); 
    }

    // look through the input program body
    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":
          decs = nd.declarations;

          for(n in decs) {
            if(decs[n].init != null) {
              var add = 0;

              if(decs[n].init.type=="ObjectExpression") { add = 1; }
              else if(decs[n].init.type=="NewExpression" && 
                decs[n].init.callee.name == "Object") {
                add = 1;
              }
              else if(decs[n].init.type=="Identifier") {
                var pos = dict.getItem(decs[n].init.name);

                if(pos!=undefined && pos[0]<nd.start && pos[1]>nd.end) {
                  add = 1;
                }
              }

              if(add==1 && dict.getItem(decs[n].id.name)==undefined) {
                dict.setItem(decs[n].id.name, [ast.start, ast.end]);
              }
            }
          } 
          break;
        case "ForStatement":
          dict = (nd.body.body.length>0) ? dictDecObjs(nd.body, dict): dict;
          break;
        case "WhileStatement":
          dict = (nd.body.body.length>0) ? dictDecObjs(nd.body, dict): dict;
          break;
        case "IfStatement":
          dict = (nd.consequent.body.length>0) ? dictDecObjs(nd.consequent, dict): dict;
          break;
        case "FunctionDeclaration":
          dict = (nd.body.body.length>0) ? dictDecObjs(nd.body, dict): dict;
          break;
      }
    } 
    return dict;   
  }


//------------------------------------------------------------------------
// private function:
// create a dictionary that maps all used objects with occurance orders
//      ex:
//        a = { name: "A", age:20 }
//------------------------------------------------------------------------  
  function dictUsedObjs(ast, objs) {
    var usedObjs, nd, name, keys, decs;

    // a naive way to do function overloading 
    if(arguments.length==2) { 
      usedObjs = objs; 
    }
    else {
      usedObjs = new HashMap(); 
    }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "ExpressionStatement":
          exp = nd.expression;

          if(exp.type=="AssignmentExpression") {
            if(exp.right.type=="ObjectExpression" && exp.left.type=="Identifier"){
              usedObjs.setItem(exp.left.name, [nd.start, nd.end]);
            }
            else if(exp.right.type=="NewExpression" && exp.left.type=="Identifier") {
              usedObjs.setItem(exp.left.name, [nd.start, nd.end]);
            }
            else if(exp.left.type=="MemberExpression") {
              usedObjs.setItem(exp.left.object.name, [nd.start, nd.end]);
            }
          }
          else if(exp.type=="CallExpression" &&
            exp.callee.type=="MemberExpression") {
            usedObjs.setItem(exp.callee.object.name, [nd.start, nd.end]);
          }
          break;
        case "VariableDeclaration":
          decs = nd.declarations;

          for(d in decs) {
            if(decs[d].init!=null && decs[d].init.type=="Identifier") {
              usedObjs.setItem(decs[d].init.name, [nd.start, nd.end]);
            }
          }
          break;
        case "IfStatement":
            usedObjs = (nd.consequent.body.length>0) ? dictUsedObjs(nd.consequent, usedObjs):usedObjs;
          break;
        case "ForStatement":
            usedObjs = (nd.body.body.length>0) ? dictUsedObjs(nd.body, usedObjs):usedObjs;
          break;
        case "WhileStatement":
            usedObjs = (nd.body.body.length>0) ? dictUsedObjs(nd.body, usedObjs):usedObjs;
          break;
        case "FunctionDeclaration":
            usedObjs = (nd.body.body.length>0) ? dictUsedObjs(nd.body, usedObjs):usedObjs;
          break;
      }
    }
    return usedObjs;   
  }


//------------------------------------------------------------------------
// private function:
// list all undeclared objects that get used in a program
//      that get used in a program
//      ex:
//        (undeclared obj) objName.methodName() ==> car.name() 
//        (undeclared a)   a = { name: "A", age:20 }
//------------------------------------------------------------------------  
  function listUndecObjs(ast) {
    var decObjs  = dictDecObjs(ast);
    var usedObjs = dictUsedObjs(ast);
    var dict     = new HashMap();
    var keys     = usedObjs.keys();
    var dec, use;

    for(m in keys) {
      dec = decObjs.getItem(keys[m]);
      use = usedObjs.getItem(keys[m]);

      if(dec==undefined) {
        dict.setItem(keys[m], usedObjs.getItem(keys[m]));
      }
      else if(use[0]<dec[0] || dec[1]<use[1] || dec[1]<use[0] || use[1]<dec[0]) {
        dict.setItem(keys[m], usedObjs.getItem(keys[m]));
      }
    }
    return dict.keys();
  } 


//------------------------------------------------------------------------
// private function:
// list all declared functions in a function   
//------------------------------------------------------------------------  
  function setFuncsInAFunc(nd) {
    var s = new Set();
    var snd;
    for(m in nd.body) {
      snd = nd.body[m];

      if(snd.type=="FunctionDeclaration") {
        s.add(snd.id.name);
      }
    }

    return s;
  }

//------------------------------------------------------------------------
// private function:
// list all declared objects in a function   
//------------------------------------------------------------------------  
  function setObjsInAFunc(nd) {
    var s = new Set();
    var snd, decs;
    for(m in nd.body) {
      snd = nd.body[m];

      if(snd.type=="VariableDeclaration") {
        for(n in snd.declarations) {
          decs = snd.declarations[n];

          if(decs.init.type=="ObjectExpression") {
            s.add(decs.id.name);
          }
        }
      }
    }

    return s;
  }




/******************************************************************/
/* 4. Style Grading for Use of While Loop                         */
/*    a. numWhileLoopsInGloLev(ast)       ==> integer >= 0        */
/*    b. numNestedWhileLoopsInGloLev(ast) ==> integer >= 0        */
/*    c. numWhileLoopsInFuncs(ast)        ==> integer >= 0        */
/*    d. numNestedWhileLoopsInFuncs(ast)  ==> integer >= 0        */
/*    e. numWhileLoopsInAProgram(ast)     ==> integer >= 0        */
/******************************************************************/    

//------------------------------------------------------------------------
// 4-a. calculate total number of while loops in global level
//      ex.
//         var a = 0;
//         while(a<2) {
//           while(a<a) {
//             alert(a;)
//           }
//           alert(a);
//           a++;
//         }
//
//         while(a<2) {
//           alert(a);
//           a++;
//        }
//------------------------------------------------------------------------  
  function numWhileLoopsInGloLev(ast) {
    console.log("numWhileLoopsInGloLev: " +countWhileLoops(ast).wltl);
    return countWhileLoops(ast).wltl;
  }


//------------------------------------------------------------------------
// 4-b. calculate total number of nested while loops in global level
//      ex.
//         var a = 0;
//         while(a<2) {
//           while(a<a) {
//             alert(a);
//           }
//           alert(a);
//           a++;
//         }
//
//         while(a<2) {
//           alert(a);
//           a++;
//        }
//------------------------------------------------------------------------  
  function numNestedWhileLoopsInGloLev(ast) {
    console.log("numNestedWhileLoopsInGloLev: " +countWhileLoops(ast).nwltl);
    return countWhileLoops(ast).nwltl;
  }


//------------------------------------------------------------------------
// 4-c. calculate total number of while loops in functions (local level)
//      ex.
//          function bar(){
//            var a = 0;
//            while(a<2) {
//              while(a<a) {
//                alert(a);
//              }
//              alert(a);
//              a++;
//            }
//            while(a<2) {
//              alert(a);
//              a++;
//            }
//          }
//------------------------------------------------------------------------  
  function numWhileLoopsInFuncs(ast) {
    console.log("numWhileLoopsInFuncs: " +countWhileLoops(ast).wlf);
    return countWhileLoops(ast).wlf;
  }


//------------------------------------------------------------------------
// 4-d. calculate total number of nested while loops in functions (local)
//------------------------------------------------------------------------  
  function numNestedWhileLoopsInFuncs(ast) {
    console.log("numNestedWhileLoopsInFuncs: " +countWhileLoops(ast).nwlf);
    return countWhileLoops(ast).nwlf;
  }


//------------------------------------------------------------------------
// 4-e. calculate total number of while loops in a program
//------------------------------------------------------------------------  
  function numWhileLoopsInAProgram(ast) {
    console.log("numWhileLoopsInAProgram: " +(countWhileLoops(ast).wltl+countWhileLoops(ast).wlf));
    return (countWhileLoops(ast).wltl+countWhileLoops(ast).wlf);
  }


//------------------------------------------------------------------------
// private function:
// calculate total number of while loops in a calling scope
//------------------------------------------------------------------------  
  function countWhileLoops(ast) {
    var counts = {wltl:0, nwltl:0, wlf:0, nwlf:0};
    var nd, snd, lowLevLoops;

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "WhileStatement":
          lowLevLoops = countWhileLoops(nd.body);

          // number of while loop in top level of a calling scope
          counts.wltl = counts.wltl + lowLevLoops.wltl + 1;

          // number of nested while loop in top level of a calling scope
          counts.nwltl = (lowLevLoops.wltl>0) ? counts.nwltl+1:counts.nwltl;

          // keep examming if there has a multiple level nested loop
          counts.nwltl = (lowLevLoops.nwltl>0) ? counts.nwltl+lowLevLoops.nwltl:counts.nwltl;
          break;
        case "ForStatement":
            counts = (nd.body.body.length>0) ? countWhileLoops(nd.body):counts;
          break;
        case "IfStatement":
          counts = (nd.consequent.body.length>0) ? countWhileLoops(nd.consequent):counts;
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length>0) {
            lowLevLoops = countWhileLoops(nd.body);

            // numWhileLoopsInFuncs
            counts.wlf = counts.wlf + lowLevLoops.wltl;

            // numNestedWhileLoopsInFuncs
            counts.nwlf = (lowLevLoops.nwltl>0) ? counts.nwlf+lowLevLoops.nwltl:counts.nwlf;
          }
          break;
      }
    }
    return counts;
  }


/******************************************************************/
/* 5. Style Grading for Use of For Loop                           */
/*    a. numForLoopsInGloLev(ast)            ==> integer >= 0     */
/*    b. numNestedForLoopsInGloLev(ast)      ==> integer >= 0     */
/*    c. numForLoopsInFuncs(ast)             ==> integer >= 0     */
/*    d. numNestedForLoopsInFuncs(ast)       ==> integer >= 0     */
/*    e. numForLoopsInAProgram(ast)          ==> integer >= 0     */
/******************************************************************/ 

//------------------------------------------------------------------------
// 5-a. calculate total number of for loops in global level
//      ex.
//         var a = 0;
//         for(;a<2;a++) {
//           for(;a<1;a++) {
//             alert(a;)
//           }
//           alert(a);
//         }
//
//         for(;a<2;a++) {
//           alert(a);
//        }
//------------------------------------------------------------------------  
  function numForLoopsInGloLev(ast) {
    var counts = countForLoops(ast);
    console.log("numForLoopsInGloLev: " +counts.fltl);
    return counts.fltl;
  }


//------------------------------------------------------------------------
// 5-b. calculate total number of nested for loops in global level
//      ex.
//         var a = 0;
//         for(;a<2;a++) {
//           for(;a<1;a++) {
//             alert(a;)
//           }
//           alert(a);
//         }
//
//         for(;a<2;a++) {
//           alert(a);
//        }
//------------------------------------------------------------------------  
  function numNestedForLoopsInGloLev(ast) {
    var counts = countForLoops(ast);
    console.log("numNestedForLoopsInGloLev: " +counts.nfltl);
    return counts.nfltl;
  }


//------------------------------------------------------------------------
// 5-c. calculate total number of for loops in functions (local level)
//      ex.
//          function bar(){
//            var a = 0;
//            for(;a<2;a++) {
//              for(;a<1;a++) {
//                alert(a);
//              }
//              alert(a);
//            }
//            for(;a<1; a++) {
//              alert(a);
//            }
//          }
//------------------------------------------------------------------------  
  function numForLoopsInFuncs(ast) {
    var counts = countForLoops(ast);
    console.log("numForLoopsInFuncs: " +counts.flf);
    return counts.flf;
  }

//------------------------------------------------------------------------
// 5-d. calculate total number of nested for loops in functions (local)
//      ex.
//          function bar(){
//            var a = 0;
//            for(;a<2;a++) {
//              for(;a<1;a++) {
//                alert(a);
//              }
//              alert(a);
//            }
//            for(;a<1; a++) {
//              alert(a);
//            }
//          }
//------------------------------------------------------------------------  
  function numNestedForLoopsInFuncs(ast) {
    var counts = countForLoops(ast);
    console.log("numNestedForLoopsInFuncs: " +counts.nflf);
    return counts.nflf;
  }

//------------------------------------------------------------------------
// 5-e. calculate total number of for loops in a program
//------------------------------------------------------------------------  
  function numForLoopsInAProgram(ast) {
    var counts = countForLoops(ast);
    console.log("numForLoopsInAProgram: " +(counts.fltl+counts.flf) );
    return (counts.fltl+counts.flf);
  }

//------------------------------------------------------------------------
// private function:
// calculate total number of for loops in a calling scope
//------------------------------------------------------------------------  
  function countForLoops(ast) {
    var counts = {fltl:0, nfltl:0, flf:0, nflf:0};
    var cts;
    var nd, snd;

    //console.log("(countForLoops) start");
    //console.log("(countForLoops) end");
    //return counts;  // pds hack

    for(m in ast.body) {  // assumes ast is object, 
      nd = ast.body[m];   // with body field an array of statement objects

      //console.log("(countForLoops) nd.type: "+nd.type);
      switch(nd.type) {
        case "ForStatement":
          lowLevLoops = countForLoops(nd.body);

          // number of for loop in top level of a calling scope
          counts.fltl = counts.fltl + lowLevLoops.fltl + 1;

          // number of nested for loop in top level of a calling scope
          //counts.nfltl = (lowLevLoops.fltl>0) ? counts.nfltl+1:counts.nfltl;
          if (lowLevLoops.fltl>0) { 
            counts.nfltl = counts.nfltl + 1; 
          }

          // keep examming if there has a multiple level nested loop
          //counts.nfltl=(lowLevLoops.nfltl>0)?counts.nfltl+lowLevLoops.nfltl:counts.nfltl;
          if (lowLevLoops.nfltl>0) { 
            counts.nfltl = counts.nfltl + lowLevLoops.nfltl; 
          }
          break;

        case "WhileStatement":
          //counts = (nd.body.body.length>0) ? countForLoops(nd.body):counts;
          if (nd.body.body.length>0) { counts = countForLoops(nd.body); }
          break;

        case "IfStatement":
          // if part
          //counts = (nd.consequent.body.length>0) ? countForLoops(nd.consequent):counts;
          if (nd.consequent.body.length>0) { counts = countForLoops(nd.consequent); }

          // else part
          if (nd.alternate != null) {
            if (nd.alternate.type==="BlockStatement") {
              if (nd.alternate.body.length>0) {
                cts = countForLoops(nd.alternate);
                counts.fltl  += cts.fltl;
                counts.nfltl += cts.nfltl;
                counts.flf   += cts.flf;
                counts.nflf  += cts.nflf;
              }
            }
            else { // all other are single statements
              cts = countForLoops( { body:[ nd.alternate ] } );
              counts.fltl  += cts.fltl;
              counts.nfltl += cts.nfltl;
              counts.flf   += cts.flf;
              counts.nflf  += cts.nflf;
            }
          }
          //console.log("done if (else)");
          break;

        case "FunctionDeclaration":
          if(nd.body.body.length>0) {
            lowLevLoops = countForLoops(nd.body);

            // numForLoopsInFuncs
            counts.flf  = counts.flf + lowLevLoops.fltl;

            // numNestedForLoopsInFuncs
            //counts.nflf = (lowLevLoops.nfltl>0) ? counts.nflf + lowLevLoops.nfltl
            //                                    : counts.nflf;
            if (lowLevLoops.nfltl>0) { 
              counts.nflf = counts.nflf+lowLevLoops.nfltl; 
            }
          }
          break;
      }
    }
    //console.log("(countForLoops) end");
    return counts;
  }





/******************************************************************/
/* 6. Style Grading for Declaration and Use of Function           */
/*    a. numDecFuncs(ast)               ==> integer >= 0          */
/*    b. areCallExpsAllValid(ast)       ==> integer >= 0          */
/*    c. areDecFuncsCalled(ast)         ==> boolean ? true:false  */
/*    d. areDecFuncsCalledOnce(ast)     ==> boolean ? true:false  */
/*    e. isAnyDecFuncPassedByRef(ast)   ==> boolean ? true:false  */
/*    f. isAnyFuncReturnObj(ast)        ==> boolean ? true:false  */
/******************************************************************/

//------------------------------------------------------------------------
// 6-a. calculate the number of declared functions in global level:
//      ex:
//        function a() {}
//        var a = function() {}
//------------------------------------------------------------------------
  function numDecFuncs(ast) {
    console.log("numDecFuncs: "+dictDecFuncs(ast).keys().length);
    return dictDecFuncs(ast).keys().length;
  }


//------------------------------------------------------------------------
// 6-b. exam call expressions that all call declared functions in which 
//      functions are declared on the top of call expressions.
//      ex:
//        CORRECT: function myMain() { return 5; }
//                 myMain();
//        WRONG:   1. function myMain() { return 5; }
//                    foo();
//                 2. foo();
//                    function foo() { return 5; }
//------------------------------------------------------------------------
  function areCallExpsAllValid(ast) {
    console.log("areCallExpsAllValid: " + (listInvalidFuncCallExps(ast).length==0));
    return listInvalidFuncCallExps(ast).length==0;
  }



//------------------------------------------------------------------------
// 6-c. exam all declared functions get called in a program
//      * the number that a function gets called is regardless
//      ex: function bar() { return 5; }
//          function foo() { return 5; }
//          bar(); bar();
//          foo(); foo();
//------------------------------------------------------------------------
  function areDecFuncsCalled(ast) {
    console.log("areDecFuncsCalled(hack): " + true );
    return(true); // pds hack
/*
    var nums = dictDecFuncsAndCallNum(ast).values(); // num of each function gets called

    for(m in nums) {
      if(nums[m]==0) {
        console.log("areDecFuncsCalled: " + false);
        return false;
      }
    }
    console.log("areDecFuncsCalled: " + true);
    return true;
*/
  }


//------------------------------------------------------------------------
// 6-d. exam all declared functions get called exactly once in a program
//      ex: function bar() { return 5; }
//          function foo() { return 5; }
//          bar();
//          foo();
//------------------------------------------------------------------------
  function areDecFuncsCalledOnce(ast) {
   
    console.log("areDecFuncsCalledOnce(hack): "+true);
    return true; // pds hack

    var nums  = dictDecFuncsAndCallNum(ast).values(); // num of each function gets called

    for(m in nums) {
      if(nums[m]!=1) { 
        console.log("areDecFuncsCalledOnce: "+false);
        return false; 
      }
    }

    console.log("areDecFuncsCalledOnce: "+true);
    return true;
  }


//------------------------------------------------------------------------
// 6-e. exam if any function is a pass-by-reference function or not
//      ex: CORRECT: function bar(x) { return x; }
//          WRONG:   function bar()  { return 5; }
//------------------------------------------------------------------------
  function isAnyDecFuncPassedByRef(ast) {
    var nd;

    for(m in ast.body) {
      nd = ast.body[m];
      if(nd.type=="FunctionDeclaration" && nd.params.length>0) {
        console.log("isAnyDecFuncPassedByRef: " + true);
        return true;
      }
    }
    console.log("isAnyDecFuncPassedByRef: " + false);
    return false;
  }


//------------------------------------------------------------------------
// 6-f. identify if any function returns an object in a program
//      ex:
//        function foo() {
//          var ob = { a:3, b:5 };
//          return ob;
//        }
//
//        function foo() {
//          return { a:3, b:5 }; 
//        }
//------------------------------------------------------------------------  
  function isAnyFuncReturnObj(ast) {
    console.log("isAnyFuncReturnObj(hack): true");
    return true; /// pds hack to avoid bad code

    var nd;
    for(m in ast.body) {
      nd = ast.body[m];

      if(nd.type=="FunctionDeclaration" && nd.body.body.length>0) {
        var rtn  = nd.body.body[nd.body.body.length-1];

        if(rtn.type=="ReturnStatement") {
          if(rtn.argument !== null) {
            //console.log(">> in isAnyFuncReturnObj: doing switch");
            switch(rtn.argument.type) {
              case "Identifier":
                var set = setObjsInAFunc(nd.body);
                if(set.has(rtn.argument.name)) { 
                  console.log("isAnyFuncReturnObj: " + true);
                  return true; 
                }
                break;
              case "ObjectExpression":
                if(rtn.argument.properties.length>0) { 
                  console.log("isAnyFuncReturnObj: " + true);
                  return true; 
                }
                break;
            } // end switch
          } // end if
        }
      }
    }
    console.log("isAnyFuncReturnObj: " + false);
    return false;
  } 


//------------------------------------------------------------------------
// private function:
// create a dictionary to map declared funcionts with 
// their occurrence order.
//      ex:
//        function a() {}
//        function b(x) {}
//        function b(x, y) {}
//        var a = function() {}
//------------------------------------------------------------------------
  function dictDecFuncs(ast, funcs) {
    var dict, nd, name;

    if(arguments.length==2) { 
      dict = funcs; 
    }
    else {
      dict = new HashMap(); 
    }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "FunctionDeclaration":
          name = nd.id.name + "("+ nd.params.length+" params)";

          if(dict.getItem(name)==undefined) {
            dict.setItem(name, [nd.start, nd.end]);
          }
          break;
        case "VariableDeclaration":
          var decs = nd.declarations;
          for(n in decs) {
            if(decs[n].init!=null && decs[n].init.type=="FunctionExpression") {
              name = decs[n].id.name + "("+ decs[n].init.params.length+" params)";

              if(dict.getItem(name)==undefined) {
                dict.setItem(name, [nd.start, nd.end]);
              }
            }
          }
          break;
        case "IfStatement":
          var csqt = nd.consequent;
          dict = dictDecFuncs(csqt, dict);

          if(csqt.type=="FunctionDeclaration") {
            name = csqt.id.name + "("+ csqt.params.length+" params)";
            
            if(dict.getItem(name)==undefined) {
              dict.setItem(name, [nd.start, nd.end]);
            }          
          }
          break;
        case "WhileStatement":
          dict = dictDecFuncs(nd.body, dict);
          break;
        case "ForStatement":
          dict = dictDecFuncs(nd.body, dict);
          break;
      }
    }
    return dict;  
  }


//------------------------------------------------------------------------
// private function:
// create a dictionary to map function calls with their occurrence order.
//------------------------------------------------------------------------
  function dictFuncCalls(ast, fCalls) {
    var calls, nd, dec, name, exp;

    if(arguments.length==2) { 
      calls = fCalls; 
    }
    else {
      calls = new HashMap(); 
    }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":
          for(n in nd.declarations) {
            dec = nd.declarations[n];
            if(dec.init!=null && dec.init.type=="CallExpression") {
              name = dec.init.callee.name + "("+ dec.init.arguments.length+" params)";

              if(calls.getItem(name)==undefined) {
                calls.setItem(name, [nd.start, nd.end]);
              }
            }
          }
          break;
        case "ExpressionStatement":
          exp = nd.expression;
          if(exp.type=="CallExpression") {
            name = exp.callee.name + "("+ exp.arguments.length+" params)";
            if(calls.getItem(name)==undefined) {
              calls.setItem(name, [nd.start, nd.end]);
            }
          }
          break;
        case "IfStatement":
          calls = dictFuncCalls(nd.consequent, calls);
          break;
      }
    }
    return calls;
  }


//------------------------------------------------------------------------
// private function:
// create a list to collect function calls based on their occurrence order.
//------------------------------------------------------------------------
  function listFuncCalls(ast, fCalls) {
    var calls, nd, dec, name, exp;

    if(arguments.length==2) { 
      calls = fCalls; 
    }
    else {
      calls = []; 
    }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":
          for(n in nd.declarations) {
            dec = nd.declarations[n];
            if(dec.init!=null && dec.init.type=="CallExpression") {
              name = dec.init.callee.name + "("+ dec.init.arguments.length+" params)";
              calls.push(name);
            }
          }
          break;
        case "ExpressionStatement":
          exp = nd.expression;
          if(exp.type=="CallExpression") {
            name = exp.callee.name + "("+ exp.arguments.length+" params)";
            calls.push(name);
          }
          break;
        case "IfStatement":
          csqt = nd.consequent;
          altn = nd.alternate;

          if(csqt.body!=undefined) {
            calls = listFuncCalls(csqt, calls);
          } else {
            exp = csqt.expression;
            if(exp.type=="CallExpression") {
              name = exp.callee.name + "("+ exp.arguments.length+" params)";
              calls.push(name);
            }
          }

          if(altn!=null) {
            if(altn.body!=undefined) {
              calls = listFuncCalls(altn, calls);
            } else {
              exp = altn.expression;
              if(exp.type=="CallExpression") {
                name = exp.callee.name + "("+ exp.arguments.length+" params)";
                calls.push(name);
              }
            }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length>0) { calls = listFuncCalls(nd.body, calls); }
          break;
      }
    }
    return calls;
  }


//------------------------------------------------------------------------
// private function:
// create a dictionary to map declared functions with the number 
// how many times they get called in a program.
//------------------------------------------------------------------------
  function dictDecFuncsAndCallNum(ast) {
    var funcs = dictDecFuncs(ast).keys();
    var calls = listFuncCalls(ast); 
    var dict  = new HashMap();

    for(m in funcs) { dict.setItem(funcs[m], 0); }

    for(m in calls) {
      if(dict.getItem(calls[m])!=undefined) {
        dict.setItem(calls[m], dict.getItem(calls[m])+1);
      }
    }
    return dict;
  }


//------------------------------------------------------------------------
// private function:
// list invalid function call expressions in which a call expression calls 
// an undeclared function
//      ex:
//        CORRECT: function myMain() { return 5; }
//                 myMain();
//        WRONG:   1. function myMain() { return 5; }
//                    foo();
//                 2. foo();
//                    function foo() { return 5; }
//------------------------------------------------------------------------
  function listInvalidFuncCallExps(ast) {
    var decs  = dictDecFuncs(ast); 
    var calls = dictFuncCalls(ast); 
    var exps  = calls.keys();
    var list  = [];

    for(m in exps) {
      var dec = decs.getItem(exps[m]);
      var use = calls.getItem(exps[m]);

      if(dec==undefined) {
        list.push(exps[m]);
      } 
      else if(use[0]<dec[0] || use[1]<dec[0]) {
        list.push(exps[m]);
      }
    }

    return list;
  }


//------------------------------------------------------------------------
// private function:
// create a dictionary to map declared functions with its 
// declared return object
//------------------------------------------------------------------------
  function dictDecFuncsAndDecRtnObj(ast) {
    var map = new HashMap();
    var nd;

    for(m in ast.body) {
      nd = ast.body[m];

      if(nd.type=="FunctionDeclaration") {
        var rtn  = nd.body.body[nd.body.body.length-1];

        if(rtn.type=="ReturnStatement") {
          var set = setObjsInAFunc(nd.body);

          if(rtn.argument.type=="Identifier") {
            map.setItem(nd.id.name, rtn.argument.name);
          }
        }
      }
    }
    return map;
  }




/******************************************************************/
/* 7. Style Grading for Recursive Function                        */
/*    a. isRecursiveFunction(ast)  ==> boolean ? true:false        */
/******************************************************************/ 

//------------------------------------------------------------------------------
// 7-a. exam if a function is recursive or not by checking its return statement
//      ex: CORRECT: function myMain() {
//                      var x = foo(3);
//                      alert(x);
//                   }
//
//                   function foo(x) {
//                      if (x==1) return 1;
//                      return x*foo(x-1);
//                   }
//                   myMain();
//
//           WRONG:  function myMain() {
//                      var x = foo(3);
//                      alert(x);
//                   }
//
//                   function foo(x) {
//                      var prod=1;
//                      for (var i=x; i>1; i--) { prod *= i; }
//                      return prod;
//                   }
//                   myMain();
//------------------------------------------------------------------------------
  function isRecursiveFunction(ast) { 
    console.log("isRecursiveFunction(hack): false");
    return false; // pds hack

    var func, nds, subnd, block, name;

    for(m in ast.body) {
      func = ast.body[m];

      if(func.type == "FunctionDeclaration") {
        nds = func.body.body;
        name = func.id.name + "("+ func.params.length+" params)";

        for(n in nds) {
          subnd = nds[n];

          if(subnd.type=="ReturnStatement") {
            if(recursionDetector(subnd.argument, name)) { 
              console.log("isRecursiveFunction: true");
              return true; 
            }
          }
          else if(subnd.type=="IfStatement") {
            csqt = subnd.consequent;
            altn = subnd.alternate; 

            // two checking cases: if(xxx) yyy or if(xxx) { yyy } 
            if(csqt.body==undefined && recursionDetector(csqt.argument, name)) {             
              console.log("isRecursiveFunction: true");
              return true; 
            }
            else if(csqt.body!=undefined && csqt.body.length>0) {
              csqt = csqt.body;

              for(c in csqt) {
                if(csqt[c].type=="ReturnStatement"&&recursionDetector(csqt[c].argument, name)) {
                  console.log("isRecursiveFunction: true");
                  return true;
                }
              }
            }

            if(altn!=null) {
              // two checking cases: if(xxx) yyy or if(xxx) { yyy } 
              if(altn.argument!=undefined && recursionDetector(altn.argument, name)) {
                console.log("isRecursiveFunction: true");
                return true;
              }
              else if(altn.body!=undefined && altn.body.length>0) {
                altn = altn.body;

                for(a in altn) {
                  if(altn[a].type=="ReturnStatement"&&recursionDetector(altn[a].argument, name)) {
                    console.log("isRecursiveFunction: true");
                    return true;
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log("isRecursiveFunction: false");
    return false;
  }

//------------------------------------------------------------------------------
// private function:
// check a funciton's returnstatement if it is a call of the function or not
//------------------------------------------------------------------------------
  function recursionDetector(nd, funcName) {
    if(nd.type=="Identifier") { return false; }
    else if(nd.type=="Literal") { return false; }
    else if(nd.type=="CallExpression") { 
      var call = nd.callee.name + "(" + nd.arguments.length + " params)";
      return (call==funcName); 
    }

    return recursionDetector(nd.left, funcName)||recursionDetector(nd.right, funcName);
  }




//------------------------------------------------------------------------
// private function:
//  HashMap:
//    1. setItem(key, value) ==> map a new key to a value in the map
//    2. getItem(key)        ==> retrieve a value of a key
//    3. hasItem(key)        ==> check if a key is in the dic or not
//    4. removeItem(key)     ==> remove a key with its associative value
//    5. keys()              ==> a list of all keys in the map
//    6. values()            ==> a list of all values in the map
//    7. clear()             ==> clear the map
//------------------------------------------------------------------------
  function HashMap(obj) {
      this.length = 0;
      this.items = {};

      for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
          this.items[p] = obj[p];
          this.length++;
        }
      }

      this.setItem = function(key, value) {
        var previous = undefined;
        if (this.hasItem(key)) { previous = this.items[key];
        } else { this.length++; }

        this.items[key] = value;
        return previous;
      }

      this.getItem = function(key) {
        return this.hasItem(key) ? this.items[key] : undefined;
      }

      this.hasItem = function(key) {
        return this.items.hasOwnProperty(key);
      }
     
      this.removeItem = function(key) {
        if (this.hasItem(key)) {
          previous = this.items[key];
          this.length--;
          delete this.items[key];
          return previous;
        } else {
          return undefined;
        }
      }

      this.keys = function() {
        var keys = [];
        for (var k in this.items) {
          if (this.hasItem(k)) { keys.push(k); }
        }
        return keys;
      }

      this.values = function() {
        var values = [];
        for (var k in this.items) {
          if (this.hasItem(k)) { values.push(this.items[k]); }
        }
        return values;
      }

      this.clear = function() {
        this.items = {}
        this.length = 0;
      }
  }


/******************************************************************/ 
/*
/* Stotts' old API functions
/*
/*   numBadGlobalDecls (ast)          ==>  integer >= 0
/*   numBadGlobalUses (ast)           ==>  integer >= 0
/*   usesBadGlobalVars (ast)          ==>  boolean
/*   numForLoops (ast)                ==>  integer >= 0
/*   numWhileLoops (ast)              ==>  integer >= 0
/*   numForLoopsInAllFuncDecls(ast)   ==>  integer >= 0
/*   numWhileLoopsInAllFuncDecls(ast) ==>  integer >= 0
/*   numForNestLevels (ast)           ==>  integer >= 0
/*   numWhileNestLevels (ast)         ==>  integer >= 0
/*   numTotFuncDecls (ast)            ==>  integer >= 0
/*   numTopFuncDecls (ast)            ==>  integer >= 0
/*   numTopFuncCalls (ast)            ==>  integer >= 0
/*   numTopNumberCalls (ast)          ==>  integer >= 0
/*   numTopLHSFuncCalls (ast)         ==>  integer >= 0
/*   nFuncCall (obj)                  ==>  boolean
/*   nNumberCall (obj)                ==>  boolean
/*   nLHSFuncCall (obj)               ==>  boolean
/*   listTopLevelTypes (ast)          ==>  [ string ]
/*   isAllFuncDeclsPlusOneCall (ast)  ==>  boolean
/*   isJustOneTopFuncCall (ast)       ==>  boolean
/*   isJustTwoTopFuncCall (ast)       ==>  boolean
/*   hasUSF(ast)                      ==>  boolean
/*   numTopAlertOnVar(ast)            ==>  integer >= 0
/*   numTopAlertOnLit(ast)            ==>  integer >= 0
/*   numTopAlertOnBinExp(ast)         ==>  integer >= 0
/*   hasOneTopAlertOnVar(ast)         ==>  boolean
/*   hasTwoTopAlertOnVar(ast)         ==>  boolean
/*   hasOneTopAlertOnLit(ast)         ==>  boolean
/*   hasOneTopAlertOnBinExp(ast)      ==>  boolean
/*   hasTwoTopAlertOnBinExp(ast)      ==>  boolean
/*
/******************************************************************/ 


//------------------------------------------------------------------------
//   global variables, declaration and use
//-----------------------------------------------------------------------

  function numBadGlobalDecls (ast) {
    // global var decl
    // but we exclude function value assignments to global
    //console.log("in numBadGlobalDecls, loc a" );
    var count = 0;
    var nst = ast.body.length;
    //console.log("in numBadGlobalDecls, len is "+ nst );
    var st;
    for (var i=0; i<nst; i++) {
      st = ast.body[i]; 
      //console.log("in numBadGlobalDecls, st.type is " +st.type);
      if (st.type == "VariableDeclaration") {
        var decs = st.declarations; // an array of obj
        //console.log("in numBadGlobalDecls,  decs len is " +decs.length);
 
        for (var d=0; d<decs.length; d++) {
          if (decs[d].init == null) { count++; } 
          else { 
            // init not null here
            if (decs[d].init.type != "FunctionExpression") { count++; }
          } // end ite
        } // end for
      } // end var decls
    } // end for
    console.log("numBadGlobalDecls: "+count);
    return count;
  }


  function numBadGlobalUses(ast) {
    // global var on left of assignment
    // but we exclude function value assignments to global
    var count = 0;
    var nst = ast.body.length;
    var st;
    for (var i=0; i<nst; i++) {
      st = ast.body[i]; 
      if (st.type == "ExpressionStatement") {
        // assign, update, call, member, literal, identifier
        if ((st.expression.type != "CallExpression")
            && (st.expression.type != "Literal")) { count++; }
      }
    }
    console.log("numBadGlobalUses: "+count);
    return count;
  }


  function usesBadGlobalVars(ast) { 
    var boo = (numBadGlobalDecls(ast) > 0 || numBadGlobalUses(ast) > 0); 
    console.log("usesBadGlobalVars: "+boo);
    return boo; 
  }



//------------------------------------------------------------------------
//   loops (top level)
//------------------------------------------------------------------------

  function numForLoops (ast) {
    // only counts for loops at the global level for now
    var count = 0;
    var nst = ast.body.length;
    for (var i=0; i<nst; i++) {
      if (ast.body[i].type == "ForStatement") { count++; }
    }
    console.log("numForLoops: "+count);
    return count;
  }


  function numWhileLoops (ast) {
    // only counts while loops at the global level for now
    var count = 0;
    var nst = ast.body.length;
    for (var i=0; i<nst; i++) {
      if (ast.body[i].type == "WhileStatement") { count++; }
    }
    console.log("numWhileLoops: "+count);
    return count;
  }


  function numForNestLevels (ast) { 
    // yet to be implemented
    return 0; 
  }


  function numWhileNestLevels (ast) { 
    // yet to be implemented
    return 0; 
  }


//------------------------------------------------------------------------
//   loops in functions
//------------------------------------------------------------------------

  function numForLoopsInAllFuncDecls(ast) {
    // search tree and when find a func decl we do the loop count 
    // skips global level
    var count = 0;
    var nst = ast.body.length;
    for (var i=0; i<nst; i++) {
      if (ast.body[i].type == "FunctionDeclaration") { 
         count += numForLoops( ast.body[i].body);
      }
    }
    console.log("numForLoopsInAllFuncDecls: "+count);
    return count;
  }


  function numWhileLoopsInAllFuncDecls(ast) {
    // search tree and when find a func decl we do the loop count 
    // skips global level
    var count = 0;
    var nst = ast.body.length;
    for (var i=0; i<nst; i++) {
      if (ast.body[i].type == "FunctionDeclaration") { 
         count += numWhileLoops( ast.body[i].body);
      }
    }
    console.log("numWhileLoopsInAllFuncDecls: "+count);
    return count;
  }



//------------------------------------------------------------------------
//   function declarations (top level)
//   function calls (top level)
//------------------------------------------------------------------------

  function numTopFuncDecls (ast) {
    // counts top level function foo () { ... } syntax
    // also counts top level var foo = function () { ... }
    var count = 0;
    var nst = ast.body.length;
    var st;
    for (var i=0; i<nst; i++) {
      st = ast.body[i];
      if (st.type == "FunctionDeclaration") {
        // syntax: function foo(n) { ... }
        count++; 
      } 
      else if (st.type == "VariableDeclaration") {
        // syntax: var foo = function (n) { ... } 
        var decs = st.declarations; // an array of obj
        for (var d=0; d<decs.length; d++) {
          if (decs[d].init != null) {
            if (decs[d].init.type == "FunctionExpression") { count++; }
          }
        }
      } 
      else { // move along to next statement, nothing to do for now
      }
    } // end for loop
    console.log("numTopFuncDecls: "+count);
    return count;
  }

  function numTotFuncDecls (ast) {
    // counts top level function foo () { ... } syntax
    // also counts top level var foo = function () { ... }
    var count = 0;
    var nst = ast.body.length;
    var st;
    for (var i=0; i<nst; i++) {
      st = ast.body[i];
      if (st.type == "FunctionDeclaration") {
        // syntax: function foo(n) { ... }
        count++; 
        count += numTotFuncDecls(st.body);
      } 
      else if (st.type == "VariableDeclaration") {
        // syntax: var foo = function (n) { ... } 
        var decs = st.declarations; // an array of obj
        for (var d=0; d<decs.length; d++) {
          if (decs[d].init != null) {
            if (decs[d].init.type == "FunctionExpression") { 
              count++; 
              count += numTotFuncDecls(decs[d].init.body);
            }
          }
        }
      } 
      else { // move along to next statement, nothing to do for now
      }
    } // end for loop
    console.log("numTotFuncDecls: "+count);
    return count;
  }

  function hasFuncInFunc(ast) {
    var res = !(numTopFuncDecls(ast)===numTotFuncDecls(ast));
    console.log("hasFuncInFunc: "+res);
    return res;
  }

  function nNumberCall (ob) { 
    // return 0 or 1 or 2 or...
    // returning a 0 means false, it is not a func call
    // returning 1 means true it is
    // returning >1 will happen in var decl with several on a line
    var count = 0;
    switch (ob.type) {
      case "FunctionDeclaration":
        var x = numTopNumberCalls(ob.body);
        //console.log("  >> ob.body len: "+ ob.body.body.length);
        //console.log("  >> Number calls: "+x);
        count += x;
        break;
      case "CallExpression":
        if ( ob.callee.name == "Number") count++;
        // now check the arg list)
        var args = ob.arguments;
        for (var d=0; d<args.length; d++) {
          count += nNumberCall(args[d]); 
        }
        //console.log("  >>IN nNumberCall a, ret: "+ count);
        return count;
        break;
      case "ExpressionStatement":
        if (ob.expression.type === "CallExpression") {
          if (ob.expression.callee.name == "Number") count++;
          // now check the arg list
          var args = ob.expression.arguments;
          for (var ds=0; ds<args.length; ds++) { 
            count += nNumberCall(args[ds]); 
          }
          //console.log("nNumberCall b: "+count );
          return count;
        }
        if (ob.expression.type === "AssignmentExpression") {
          if (ob.expression.right.type === "CallExpression") {
            if (ob.expression.right.callee.name == "Number") count++;
            // now check args
            var aargs = ob.expression.right.arguments;
            for (var dds=0; dds<aargs.length; dds++) { 
              count += nNumberCall(aargs[dds]); 
            }
            //console.log("  >>IN nNumberCall c, ret: "+ count);
            return count;
          }
          if (ob.expression.right.type === "BinaryExpression") {
            count += nNumberCall(ob.expression.right.right);
            count += nNumberCall(ob.expression.right.left);
            //console.log("  >>IN nNumberCall d, ret: "+ count);
            return count;
          }
        }
        break;
      case "BinaryExpression":
        // pds look for Calls on each side 
        count += nNumberCall(ob.left);
        count += nNumberCall(ob.right);
        //console.log("  >>IN nNumberCall e, ret: "+ count);
        return count;
        break;
      case "VariableDeclaration":
        var decls = ob.declarations;
        //console.log("length: "+decls.length);
        for (var i=0; i<decls.length; i++) { 
          //console.log("   type: "+decls[i].type);
          if (decls[i].init != null) {
            if (decls[i].init.type == "CallExpression")  {
              if (decls[i].init.callee.name == "Number") count++; 
              // now check the arg list
              var args = decls[i].init.arguments;
              for (var dd=0; dd<args.length; dd++) {
                count += nNumberCall(args[dd]); 
              }
            }
            else if (decls[i].init.type == "BinaryExpression")  {
              count += nNumberCall(decls[i].init.left);
              count += nNumberCall(decls[i].init.right);
            }
          }
        }
        //console.log("  >>IN nNumberCall f, ret: "+ count);
        return count;
        break;
      default: 
        //console.log("  >>IN nNumberCall g, ret: "+ count);
        return count;
    }
    //console.log("  >>IN nNumberCall h, ret: "+ count);
    return count; 
  }


  function nFuncCall (ob) { 
    // return 0 or 1 or 2 or...
    // returning a 0 means false, it is not a func call
    // returning 1 means true it is
    // returning >1 will happen in var decl with several on a line
    var count = 0;
    switch (ob.type) {
      case "CallExpression":
        count++;
        // now check the arg list)
        var args = ob.arguments;
        for (var d=0; d<args.length; d++) {
          count += nFuncCall(args[d]); 
        }
        //console.log("  >>IN nFuncCall a, ret: "+ count);
        return count;
        break;
      case "ExpressionStatement":
        if (ob.expression.type === "CallExpression") {
          count++;
          // now check the arg list
          var args = ob.expression.arguments;
          for (var ds=0; ds<args.length; ds++) { 
            count += nFuncCall(args[ds]); 
          }
          //console.log("nFuncCall b: "+count );
          return count;
        }
        if (ob.expression.type === "AssignmentExpression") {
          if (ob.expression.right.type === "CallExpression") {
            count++;
            // now check args
            var aargs = ob.expression.right.arguments;
            for (var dds=0; dds<aargs.length; dds++) { 
              count += nFuncCall(aargs[dds]); 
            }
            //console.log("  >>IN nFuncCall c, ret: "+ count);
            return count;
          }
          if (ob.expression.right.type === "BinaryExpression") {
            count += nFuncCall(ob.expression.right.right);
            count += nFuncCall(ob.expression.right.left);
            //console.log("  >>IN nFuncCall d, ret: "+ count);
            return count;
          }
        }
        break;
      case "BinaryExpression":
        // pds look for Calls on each side 
        count += nFuncCall(ob.left);
        count += nFuncCall(ob.right);
        //console.log("  >>IN nFuncCall e, ret: "+ count);
        return count;
        break;
      case "VariableDeclaration":
        var decls = ob.declarations;
        //console.log("length: "+decls.length);
        for (var i=0; i<decls.length; i++) { 
          //console.log("   type: "+decls[i].type);
          if (decls[i].init != null) {
            if (decls[i].init.type == "CallExpression")  {
              count++; 
              // now check the arg list
              var args = decls[i].init.arguments;
              for (var dd=0; dd<args.length; dd++) {
                count += nFuncCall(args[dd]); 
              }
            }
          }
        }
        //console.log("  >>IN nFuncCall f, ret: "+ count);
        return count;
        break;
      default: 
        //console.log("  >>IN nFuncCall g, ret: "+ count);
        return count;
    }
    //console.log("  >>IN nFuncCall h, ret: "+ count);
    return count; 
  }

  function nLHSFuncCall (ob) { 
    // return 0 or 1 or 2 or...
    // returning a 0 means false, it is not a func call
    // returning 1 means true it is
    // returning >1 will happen in var decl with several on a line
    // 
    // ex:  alert(x);
    // ex:  subProg(a,b,12);
    //
    // calling a function and ignoring the return val 
    //
    var count = 0;
    switch (ob.type) {
      case "ExpressionStatement":
        if (ob.expression.type === "CallExpression") {
          count++;
          //console.log("  >>IN nLHSFuncCall a, ret: "+count );
          return count;
        }
/*
        if (ob.expression.type === "AssignmentExpression") {
          if (ob.expression.right.type === "CallExpression") {
            count++;
            //console.log("  >>IN nLHSFuncCall b, ret: "+ count);
            return count;
          }
        }
        break;
*/
/*
      case "VariableDeclaration":
        var decls = ob.declarations;
        //console.log("length: "+decls.length);
        for (var i=0; i<decls.length; i++) { 
          //console.log("   type: "+decls[i].type);
          if (decls[i].init != null) {
            if (decls[i].init.type == "CallExpression")  count++; 
          }
        }
        //console.log("  >>IN nLHSFuncCall c, ret: "+ count);
        return count;
        break;
*/
      default:
        //console.log("  >>IN nLHSFuncCall d, ret: "+ count);
        return count; 
        break;
    }
    //console.log("  >>IN nLHSFuncCall e, ret: "+ count);
    return count; 
  }


  function numTopNumberCalls (ast) {
    var count = 0;
    var nst = ast.body.length;
    var st;
    //console.log(" >> in numTopNumberCalls: body length is "+nst);
    for (var i=0; i<nst; i++) {
      st = ast.body[i];
      //console.log(" >> item "+i+": "+st.type);
      count += nNumberCall(st);
    }
      
    console.log("numTopNumberCalls: "+count);
    return count;
  }


  function numTopFuncCalls (ast) {
    var count = 0;
    var nst = ast.body.length;
    var st;
    //console.log("in numTopFuncCalls: body length is "+nst);
    for (var i=0; i<nst; i++) {
      st = ast.body[i];
      //console.log("item "+i+": "+st.type);
      count += nFuncCall(st);
    }
      
    console.log("numTopFuncCalls: "+count);
    return count;
  }


  function numTopLHSFuncCalls (ast) {
    var count = 0;
    var nst = ast.body.length;
    var st;
    //console.log("in numTopLHSFuncCalls: body length is "+nst);
    for (var i=0; i<nst; i++) {
      st = ast.body[i];
      //console.log("item "+i+": "+st.type);
      count += nLHSFuncCall(st);
    }
      
    console.log("numTopLHSFuncCalls: "+count);
    return count;
  }


//------------------------------------------------------------------------
//   top level structure check
//   is it nothing but func decls and one func call?
//------------------------------------------------------------------------


  function listTopLevelTypes (ast) {
    // what are the main top level statements in the program
    var nst = ast.body.length;
    var list = [];
    for (var i=0; i<nst; i++) { list[i] = ast.body[i].type ; }
    return list; // array of strings
  }

 
  function numVarsInExp(ob) {
    // ob is an expression
    // return number of var uses in the expression
    // includes looking at function call args
    count = 0;
    if (ob.type == "Literal") {  // do nothing
    }
    else if (ob.type == "Identifier") {  // gotcha
      count++; 
    }
    else if (ob.type == "CallExpression") {  // check args for vars
      for (var da=0; da<ob.arguments.length; da++) {
        count += numVarsInExp(ob.arguments[da]);
      }
    }
    else if (ob.type == "BinaryExpression") {  // check both sides
      count += numVarsInExp(ob.right);
      count += numVarsInExp(ob.left);
    } 
    console.log("numVarsInExp ret: " + count);
    return count;
  }


  function numTopAlertOnLitExp (ast) {

    // pds adding not done yet

    // alert with expression as param, but the expression
    // has nothing but literals in it
    var count=0;
    var stList = listTopLevelTypes(ast); // array of strings

    for (var s=0; s<stList.length; s++) {
      if (stList[s] == "ExpressionStatement") {
        var st = ast.body[s];
        if (st.expression.type == "CallExpression") {
          if (st.expression.callee.name == "alert") {
            if (st.expression.arguments.length==1) {
              if ( (st.expression.arguments[0].type == "BinaryExpression")
                   || (st.expression.arguments[0].type == "LogicalExpression")
                   || (st.expression.arguments[0].type == "CallExpression")  ) 
                 { count++; }
            }
          }
        }
      } 
    } // end for loop

    console.log("numTopAlertOnLitExp ret: "+ count);
    return count;
  }

  function numTopAlertOnBinExp (ast) {
    var count=0;
    var stList = listTopLevelTypes(ast); // array of strings

    for (var s=0; s<stList.length; s++) {
      if (stList[s] == "ExpressionStatement") {
        var st = ast.body[s];
        if (st.expression.type == "CallExpression") {
          if (st.expression.callee.name == "alert") {
            if (st.expression.arguments.length==1) {
              if ( (st.expression.arguments[0].type == "BinaryExpression")
                   || (st.expression.arguments[0].type == "LogicalExpression")
                   || (st.expression.arguments[0].type == "CallExpression")  ) 
                 { count++; }
            }
          }
        }
      } 
    } // end for loop

    console.log("numTopAlertOnBinExp ret: "+ count);
    return count;
  }

  function numTopAlertOnVar (ast) {
    var count=0;
    var stList = listTopLevelTypes(ast); // array of strings

    for (var s=0; s<stList.length; s++) {
      if (stList[s] == "ExpressionStatement") {
        var st = ast.body[s];
        if (st.expression.type == "CallExpression") {
          if (st.expression.callee.name == "alert") {
            if (st.expression.arguments.length==1) {
              if (st.expression.arguments[0].type == "Identifier") { count++; }
            }
          }
        }
      } 
    } // end for loop

    console.log("numTopAlertOnVar ret: "+ count);
    return count;
  }

  function numTopAlertOnLit (ast) {
    var count=0;
    var stList = listTopLevelTypes(ast); // array of strings

    for (var s=0; s<stList.length; s++) {
      if (stList[s] == "ExpressionStatement") {
        var st = ast.body[s];
        if (st.expression.type == "CallExpression") {
          if (st.expression.callee.name == "alert") {
            if (st.expression.arguments.length==1) {
              if (st.expression.arguments[0].type == "Literal") { count++; }
            }
          }
        }
      } 
    } // end for loop

    console.log("numTopAlertOnLit ret: "+ count);
    return count;
  }


  function hasOneTopAlertOnLit (ast) {
    if (numTopLHSFuncCalls(ast) != 1) {
      console.log("hasOneTopAlertOnLit: "+ false);
      return false;
    }
    
    var stList = listTopLevelTypes(ast); // array of strings

    for (var s=0; s<stList.length; s++) {
      if (stList[s] == "ExpressionStatement") {
        var st = ast.body[s];
        if (st.expression.type == "CallExpression") {
          if (st.expression.callee.name == "alert") {
            if (st.expression.arguments.length==1) {
              if (st.expression.arguments[0].type == "Literal") { 
                console.log("hasOneTopAlertOnLit: "+ true);
                return true;
              }
            }
          }
        }
      } 
    } // end for loop

    console.log("hasOneTopAlertOnLit: "+ false);
    return false ;
  }



  function hasOneTopAlertOnVar (ast) {
    
    if (numTopLHSFuncCalls(ast) != 1) {
      console.log("hasOneTopAlertOnVar: "+ false);
      return false;
    }
    
    var stList = listTopLevelTypes(ast); // array of strings

    for (var s=0; s<stList.length; s++) {
      if (stList[s] == "ExpressionStatement") {
        var st = ast.body[s];
        if (st.expression.type == "CallExpression") {
          if (st.expression.callee.name == "alert") {
            if (st.expression.arguments.length==1) {
              if (st.expression.arguments[0].type == "Identifier") { 
                console.log("hasOneTopAlertOnVar: "+ true);
                return true;
              }
            }
          }
        }
      } 
    } // end for loop

    console.log("hasOneTopAlertOnVar: "+ false);
    return false ;

  }


  function hasTwoTopAlertOnVar (ast) {
    
    if (numTopLHSFuncCalls(ast) != 2) {
      console.log("hasTwoTopAlertOnVar: "+ false);
      return false;
    }
    
    var stList = listTopLevelTypes(ast); // array of strings
    var count=0;

    for (var s=0; s<stList.length; s++) {
      if (stList[s] == "ExpressionStatement") {
        var st = ast.body[s];
        if (st.expression.type == "CallExpression") {
          if (st.expression.callee.name == "alert") {
            if (st.expression.arguments.length==1) {
              if (st.expression.arguments[0].type == "Identifier") { 
                count++;
              }
            }
          }
        }
      } 
    } // end for loop

    console.log("hasTwoTopAlertOnVar: "+ (count==2));
    return (count==2);

  }


  function hasOneTopAlertOnBinExp (ast) {
    
    if (numTopLHSFuncCalls(ast) != 1) {
      console.log("hasOneTopAlertOnBinExp: "+ false);
      return false;
    }
    
    var stList = listTopLevelTypes(ast); // array of strings

    for (var s=0; s<stList.length; s++) {
      if (stList[s] == "ExpressionStatement") {
        var st = ast.body[s];
        if (st.expression.type == "CallExpression") {
          if (st.expression.callee.name == "alert") {
            if (st.expression.arguments.length==1) {
              if ( (st.expression.arguments[0].type == "BinaryExpression")
                   || (st.expression.arguments[0].type == "LogicalExpression")
                   || (st.expression.arguments[0].type == "CallExpression")     ) { 
                console.log("hasOneTopAlertOnBinExp: "+ true);
                return true;
              }
            }
          }
        }
      } 
    } // end for loop

    console.log("hasOneTopAlertOnBinExp: "+ false);
    return false ;

  }


  function hasTwoTopAlertOnBinExp (ast) {
    
    if (numTopLHSFuncCalls(ast) != 2) {
      console.log("hasTwoTopAlertOnBinExp: "+ false);
      return false;
    }
    
    var stList = listTopLevelTypes(ast); // array of strings
    var count=0;

    for (var s=0; s<stList.length; s++) {
      if (stList[s] == "ExpressionStatement") {
        var st = ast.body[s];
        if (st.expression.type == "CallExpression") {
          if (st.expression.callee.name == "alert") {
            if (st.expression.arguments.length==1) {
              if ( (st.expression.arguments[0].type == "BinaryExpression") 
                   || (st.expression.arguments[0].type == "LogicalExpression") 
                   || (st.expression.arguments[0].type == "CallExpression")    ) { 
                count++;
              }
            }
          }
        }
      } 
    } // end for loop

    console.log("hasTwoTopAlertOnBinExp: "+ (count==2));
    return (count==2) ;

  }


  function isAllFuncDeclsPlusOneCall (ast) {
    
    if (numTopFuncCalls(ast) != 1) {
      console.log("isAllFuncDeclsPlusOneCall: "+ false);
      return false;
    }
    
    var numFuncDecls = 0;
    var stList = listTopLevelTypes(ast); // array of strings

    for (var s=0; s<stList.length; s++) {
       var st = ast.body[s];
       switch (stList[s]) {
          case "FunctionDeclaration":
             // cool this is ok, so count and just keep going
             numFuncDecls += 1;
             break;
          case "VariableDeclaration":
             // is this var decl really a func decl?
             if (st.declarations[0].init != null) { 
               if (st.declarations[0].init.type == "FunctionExpression") { 
                 numFuncDecls += 1; 
               }
             } 
             else { 
               console.log("isAllFuncDeclsPlusOneCall: "+ false);
               return false; 
             }
             break;
          case "ExpressionStatement":
             // is this the opening "use strict" ?
             if (st.expression.type == "Literal") {
               if (st.expression.value =="use strict") { break; } 
             }
             // is this expression a single func call?
             var nfc = nFuncCall(st);
             if (nfc != 1 ) {
               console.log("isAllFuncDeclsPlusOneCall: "+ false);
               return false;
             }
             break;
          default: 
             console.log("isAllFuncDeclsPlusOneCall: "+ false);
             return false;
       } // end switch
    } // end for loop
    console.log("isAllFuncDeclsPlusOneCall: "+ (numFuncDecls>0));
    return ( numFuncDecls > 0 ) ;
  }


  function hasUseStrictFirst(ast) {
    var boo = false;
    if (ast.body[0].type=="ExpressionStatement") {
      if (ast.body[0].expression.type=="Literal") {
        if (ast.body[0].expression.value=="use strict") {
          boo = true;
        }
      }
    } 
    console.log("hasUseStrictFirst: " + boo);
    return boo;
  }

  function isJustOneTopFuncCall (ast) {
    //if (numTopFuncCalls(ast) != 1) return false;
    
    var numFuncCalls = 0;
    var stList = listTopLevelTypes(ast); // array of strings

    for (var s=0; s<stList.length; s++) {
       switch (stList[s]) {
          case "ExpressionStatement":
             // is this expression a single func call?
             var nfc = nFuncCall(ast.body[s]);
             if (nfc > 0) { 
               numFuncCalls += nfc;
               if (numFuncCalls > 1) {
                 console.log("isJustOneTopFuncCall: "+ false);
                 return false;
               }
             }
             else { 
               console.log("isJustOneTopFuncCall: "+ false);
               return false; 
             }
             break;
          default: 
             console.log("isJustOneTopFuncCall: "+ false);
             return false;
       } // end switch
    } // end for loop
    console.log("isJustOneTopFuncCall: "+ (numFuncCalls==1));
    return ( numFuncCalls == 1 ) ;
  }

  function isJustTwoTopFuncCall (ast) {
    //if (numTopFuncCalls(ast) != 1) return false;
    
    var numFuncCalls = 0;
    var stList = listTopLevelTypes(ast); // array of strings

    for (var s=0; s<stList.length; s++) {
       switch (stList[s]) {
          case "ExpressionStatement":
             // is this expression a single func call?
             var nfc = nFuncCall(ast.body[s]);
             if (nfc > 0) { 
               numFuncCalls += nfc;
               if (numFuncCalls > 2) {
                 console.log("isJustTwoTopFuncCall: "+ false);
                 return false;
               }
             }
             else { 
               console.log("isJustTwoTopFuncCall: "+ false);
               return false; 
             }
             break;
          default: 
             console.log("isJustTwoTopFuncCall: "+ false);
             return false;
       } // end switch
    } // end for loop
    console.log("isJustTwoTopFuncCall: "+ (numFuncCalls==2));
    return ( numFuncCalls == 2 ) ;
  }


// all functions have been declared local to this anonymous function
// now put them all into an object as methods and send that object back

  return {
    collectStructureStyleFacts : collectStructureStyleFacts,

    /* 1. Style Grading for Declaration and Use of Variable   */
    numDecVars                 : numDecVars,
    numUndecVars               : numUndecVars,
    numVarsUsed                : numVarsUsed,
    numVarsInFuncsUseGloVars   : numVarsInFuncsUseGloVars,
    isAnyFuncVar               : isAnyFuncVar,
    numVarsWritten             : numVarsWritten,  // pds add
    numVarsRead                : numVarsRead,     // pds add

    /* 2. Style Grading for Declaration and Use of Array      */
    numDecArrs                 : numDecArrs,
    numUndecArrs               : numUndecArrs,
    numArrsUsed                : numArrsUsed,

    /* 3. Style Grading for Declaration and Use of Object     */
    numDecObjs                 : numDecObjs,
    numUndecObjs               : numUndecObjs,
    numObjsUsed                : numObjsUsed,
    isAnyFuncBoundToAFuncRtnObj: isAnyFuncBoundToAFuncRtnObj,

    /* 4. Style Grading for Use of While Loop                 */
    numWhileLoopsInGloLev      : numWhileLoopsInGloLev,
    numNestedWhileLoopsInGloLev: numNestedWhileLoopsInGloLev,
    numWhileLoopsInFuncs       : numWhileLoopsInFuncs,
    numNestedWhileLoopsInFuncs : numNestedWhileLoopsInFuncs,
    numWhileLoopsInAProgram    : numWhileLoopsInAProgram,

    /* 5. Style Grading for Use of For Loop                   */
    numForLoopsInGloLev        : numForLoopsInGloLev,
    numNestedForLoopsInGloLev  : numNestedForLoopsInGloLev,
    numForLoopsInFuncs         : numForLoopsInFuncs,
    numNestedForLoopsInFuncs   : numNestedForLoopsInFuncs,
    numForLoopsInAProgram      : numForLoopsInAProgram,

    /* 6. Style Grading for Declaration and Use of Function   */
    numDecFuncs                : numDecFuncs,
    areCallExpsAllValid        : areCallExpsAllValid,
    areDecFuncsCalled          : areDecFuncsCalled,
    areDecFuncsCalledOnce      : areDecFuncsCalledOnce,
    isAnyDecFuncPassedByRef    : isAnyDecFuncPassedByRef,
    isAnyFuncReturnObj         : isAnyFuncReturnObj,

    /* 7. Style Grading for Recursive Function                */
    isRecursiveFunction        : isRecursiveFunction,

    /* 8. Stotts' Old API Functions                           */
    numBadGlobalDecls          : numBadGlobalDecls,
    numBadGlobalUses           : numBadGlobalUses,
    usesBadGlobalVars          : usesBadGlobalVars,
    numForLoops                : numForLoops, 
    numWhileLoops              : numWhileLoops, 
    numForNestLevels           : numForNestLevels, 
    numWhileNestLevels         : numWhileNestLevels, 
    numForLoopsInAllFuncDecls  : numForLoopsInAllFuncDecls,
    numWhileLoopsInAllFuncDecls: numWhileLoopsInAllFuncDecls,
    numTotFuncDecls            : numTotFuncDecls, 
    numTopFuncDecls            : numTopFuncDecls, 
    hasFuncInFunc              : hasFuncInFunc,
    numTopFuncCalls            : numTopFuncCalls, 
    numTopNumberCalls          : numTopNumberCalls, 
    numTopLHSFuncCalls         : numTopLHSFuncCalls, 
    listTopLevelTypes          : listTopLevelTypes, 
    isAllFuncDeclsPlusOneCall  : isAllFuncDeclsPlusOneCall, 
    isJustOneTopFuncCall       : isJustOneTopFuncCall, 
    isJustTwoTopFuncCall       : isJustTwoTopFuncCall, 
    hasUseStrictFirst          : hasUseStrictFirst,
    numTopAlertOnVar           : numTopAlertOnVar, 
    numTopAlertOnLit           : numTopAlertOnLit, 
    numTopAlertOnBinExp        : numTopAlertOnBinExp, 
    hasOneTopAlertOnVar        : hasOneTopAlertOnVar, 
    hasOneTopAlertOnBinExp     : hasOneTopAlertOnBinExp, 
    hasOneTopAlertOnLit        : hasOneTopAlertOnLit,
    hasTwoTopAlertOnVar        : hasTwoTopAlertOnVar,
    hasTwoTopAlertOnBinExp     : hasTwoTopAlertOnBinExp 

  }

})  // end anonymous function declaration 
(); // now run it to create and return the object with all the methods
