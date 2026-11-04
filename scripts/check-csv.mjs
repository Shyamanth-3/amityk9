// Quick check for the CSV export's formula-injection guard and quoting.
// Run: npm run check:csv   (needs Node 22.6+ for TypeScript type stripping)
import assert from "node:assert/strict";
import { csvCell } from "../src/lib/csv.ts";

const cases = [
  // formula triggers get a leading quote
  ["=1+1", `"'=1+1"`],
  ["+cmd|' /C calc'!A0", `"'+cmd|' /C calc'!A0"`],
  ["-2+3", `"'-2+3"`],
  ["@SUM(A1)", `"'@SUM(A1)"`],
  ["\uff20SUM(A1)", `"'\uff20SUM(A1)"`], // full-width @
  ["\uff1d1+1", `"'\uff1d1+1"`], // full-width =
  // tab / CR at the start, alone or before a formula
  ["\t=1+1", `"'\t=1+1"`],
  ["\tplain", `"'\tplain"`],
  ["\r=1+1", `"'\r=1+1"`],
  ["\rplain", `"'\rplain"`],
  // whitespace / control characters before a formula character
  ['   =HYPERLINK("http://x")', `"'   =HYPERLINK(""http://x"")"`],
  ["\u00a0\n=1", `"'\u00a0\n=1"`],
  ["\u0000@x", `"'\u0000@x"`],
  ["\u200b+1", `"'\u200b+1"`],
  // quoting of embedded quotes, commas and newlines
  ['say "hi"', `"say ""hi"""`],
  ["line1\nline2", `"line1\nline2"`],
  ["line1\r\nline2", `"line1\r\nline2"`],
  ["a,b", `"a,b"`],
  // normal values stay intact
  ["9876543210", `"9876543210"`],
  ["+919876543210", `"+919876543210"`],
  ["+91 98765 43210", `"+91 98765 43210"`],
  ["  Rex", `"  Rex"`],
  ["Rex", `"Rex"`],
  ["2026-11-04", `"2026-11-04"`],
  ["email@example.com", `"email@example.com"`],
  [null, `""`],
  [undefined, `""`],
  [42, `"42"`],
];

for (const [input, expected] of cases) {
  assert.equal(csvCell(input), expected, `csvCell(${JSON.stringify(input)})`);
}
console.log(`csv check: ${cases.length} cases passed`);
