/**
 * Monominoes QUnit testing.
 */

QUnit.test("Monominoes Arguments", function(assert) {
  assert.ok(Monominoes,"Monominoes object defined");
  assert.ok(Monominoes.util,"Monominoes util container defined");
  assert.ok(Monominoes.tags,"Monominoes tags container defined");
  assert.ok(Monominoes.renders,"Monominoes renders container defined");
});

QUnit.test("Append util function", function(assert) {
  var suite = new Komunalne.test.Suite();
  
  suite.add([],"","Call to append without arguments");
  suite.add([""],"","Call to append with empty string");
  suite.add(["Str"],"Str","Call to append with single string");
  suite.add(["A","B"],"A B","Call to append with two strings");
  suite.add(["A","B","C"],"ACB","Call to append with three strings");
  suite.add(["A",null],"A","Append null to string");
  suite.add(["A",null,"C"],"AC","Append null with separator");
  suite.add([null,"B"],"B","Append string to null");
  suite.add([null,"B","C"],"CB","Append string to null with separator");
  
  Komunalne.test.execute(suite, Monominoes.util.append, new Komunalne.helper.Method(assert.equal,assert));
});