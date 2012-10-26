

test("Class loaded",function(){
    ok(Format!=undefined,"Passed!");
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