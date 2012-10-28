/*jslint */
/*global test:true, ok: true, Format:true, equal:true */

test("Class loaded",function(){
    ok(Format!==undefined,"Passed!");
});

test( "Basic Function", function() {
  ok( Format.format("test {0} test",1)=="test 1 test", "Passed!" );
  ok( Format.format("test {0} test")=="test {0} test", "Passed!" );
  ok( Format.format("test {0} {1} test",0,1)=="test 0 1 test", "Passed!" );
});

test( "Value access test", function() {
    ok( Format.format("{0.test}",{test:"done"})=="done", "Passed!");
    ok( Format.format("{test}",{test:"done"})=="done", "Passed!");
    ok( Format.format("{1.test}",1,{test:"done"})=="done", "Passed!");
});

test( "Number formatting",function() {
    var val=12.124;
    
   equal( Format.format("{0:d#.##}", val),"12.12","2 decimal");
   equal( Format.format("{0:d#.##}", val),"12.12","2 decimal");
   equal( Format.format("{0:d###.##}", val),"012.12"," 3 head, 2 decimal");
});