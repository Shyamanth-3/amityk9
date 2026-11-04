// CSV helpers for admin exports.
//
// Spreadsheet apps (Excel, LibreOffice, Google Sheets) run a cell as a
// formula when it starts with = + - @ (or their full-width forms), and a
// leading tab or carriage return is also a trigger. Some apps skip leading
// whitespace or control characters before looking for the formula character,
// so "  =HYPERLINK(...)" is just as dangerous. Following OWASP's CSV-injection
// guidance, any such cell gets a leading single quote so it is shown as text.
// Every cell is wrapped in double quotes with embedded quotes doubled, so
// commas and newlines inside a value stay in one cell.

// Leading run of whitespace (\s covers NBSP, ideographic space, BOM and line
// separators), C0/C1 control characters and zero-width characters, followed by
// a formula trigger: = + - @, their full-width forms, small plus/hyphen and
// the minus sign.
const DANGEROUS = new RegExp(
  "^[\\s\\x00-\\x1f\\x7f-\\x9f\\u200b-\\u200f\\u2060]*" +
    "[=+\\-@\\uff1d\\uff0b\\uff0d\\uff20\\ufe62\\ufe63\\u2212]",
);
// A leading tab or carriage return is treated as a trigger on its own.
const LEADING_TAB_CR = /^[\t\r]/;
// Plain phone numbers such as "+919876543210" or "+91 98765 43210" stay
// untouched: digits and spaces after a single plus cannot form a function call.
const PHONE = /^\+?\d[\d ]*$/;

export function neutraliseFormula(value: string): string {
  if (PHONE.test(value)) return value;
  if (LEADING_TAB_CR.test(value) || DANGEROUS.test(value)) return "'" + value;
  return value;
}

export function csvCell(v: unknown): string {
  return `"${neutraliseFormula(String(v ?? "")).replace(/"/g, '""')}"`;
}
