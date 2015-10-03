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
  var cases = [];
  
  cases.push({ "args": [], "expected": "", "msg": "Call to append without arguments" });
  cases.push({ "args": [""], "expected": "", "msg": "Call to append with empty string" });
  cases.push({ "args": ["Str"], "expected": "Str", "msg": "Call to append with single string" });
  cases.push({ "args": ["A","B"], "expected": "A B", "msg": "Call to append with two strings" });
  cases.push({ "args": ["A","B","C"], "expected": "ACB", "msg": "Call to append with three strings" });
  cases.push({ "args": ["A",null], "expected": "A", "msg": "Append null to string" });
  cases.push({ "args": ["A",null,"C"], "expected": "AC", "msg": "Append null with separator" });
  cases.push({ "args": [null,"B"], "expected": "B", "msg": "Append string to null" });
  cases.push({ "args": [null,"B","C"], "expected": "CB", "msg": "Append string to null with separator" });
  
  Komunalne.test.execute(cases, Monominoes.util.append, { "fn": assert.equal, "scope": assert });
});