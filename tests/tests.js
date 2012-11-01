/*jslint */
/*global test:true, ok: true, Format:true, equal:true */

test("Class loaded",function(){
    ok(Format!==undefined,"Passed!");
});

test( "Basic Function", function() {
  equal( Format.format("test {0} test",1),"test 1 test", "Passed!" );
  equal( Format.format("test {0} test"),"test {0} test", "Passed!" );
  equal( Format.format("test {0} {1} test",0,1),"test 0 1 test", "Passed!" );
});

test( "Value access test", function() {
    equal( Format.format("{0.test}",{test:"done"}),"done", "Passed!");
    equal( Format.format("{test}",{test:"done"}),"done", "Passed!");
    equal( Format.format("{1.test}",1,{test:"done"}),"done", "Passed!");
});

test( "Escape placeholder test",function(){
    equal( Format.format("{0}"),"{0}","no parameter" );
    equal( Format.format("{0}",null),"{0}","null parameter" );
    //equal( Format.format("\\{0}"),"{0}","escape parameter" ); not implemented jet
});

test( "Number formatting",function() {
    var val=12.124;
    
   equal( Format.format("{0:d#.##}", val),"12.12","2 decimal");
   equal( Format.format("{0:d#.##}", val),"12.12","2 decimal");
   equal( Format.format("{0:d###.##}", val),"012.12"," 3 head, 2 decimal");
});

test( "If formatting",function() {
    equal( Format.format("{0} {0:?==1|child|children}",1),"1 child","if" );
    equal( Format.format("{0} {0:?==1|child|children}",2),"2 children","if else" );
    equal( Format.format("{0} {0:?!=1|children|child}",2),"2 children","if not" );
});

test( "hexadec formatting",function(){
    equal( Format.format("{0:h}",255),"FF","FF");
});

test( "spaced formatting",function() {
   equal( Format.format("{0:sl8|.}","ab"),"ab......", "space right format" ); 
   equal( Format.format("{0:sr8|.}","ab"),"......ab", "space left format" ); 
   equal( Format.format("{0:sm8|.}","ab"),"...ab...", "space middle format" ); 
});