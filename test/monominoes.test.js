/**
 * Monominoes QUnit testing.
 */

QUnit.test("Monominoes Arguments", function(assert) {
  assert.ok(Monominoes,"Monominoes object defined");
  assert.ok(Monominoes.util,"Monominoes util container defined");
  assert.ok(Monominoes.tags,"Monominoes tags container defined");
  assert.ok(Monominoes.renders,"Monominoes renders container defined");
  assert.ok(Monominoes.Tag,"Monominoes Tag class defined");
});

QUnit.test("Concrete method from util", function(assert) {
  var suite;
  
  suite = new Komunalne.test.Suite();
  suite.add([function(){ return -1; }],-1,"Function returning -1 passed as argument");
  suite.add([function(){ return this.a; },{a:1}],1,"Scope passed as argument");
  suite.add([function(a,b) { return a+b; },null,1,2],3,"Function with arguments");
  suite.add([function(a,b,c) { return this.d+c+a+b; },{d:4},1,2,3],10,"Function with arguments and scope");
  suite.add(["string"],"string","Non object passed as argument");
  suite.add(["string",{a:1},4,5],"string","Other arguments ignored if argument is a concrete object");
  suite.add(["string",null,4,5],"string","Other arguments ignored if argument is a concrete object with scope as null");
  
  suite.execute(Monominoes.util.concrete,assert.buildFor("strictEqual"));
  assert.strictEqual(Monominoes.util.concrete(),undefined,"Undefined returned if concrete is called with no arguments");
});
