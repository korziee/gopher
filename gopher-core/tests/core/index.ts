import test from "ava";
import { GopherCore } from "../../src/index";

test("isEmptyCRLF returns false if not CRLF", t => {
  const core = new GopherCore();
  t.is(core.isEmptyCRLF("sfsdf"), false);
});

test("isEmptyCRLF returns true if CRLF", t => {
  const core = new GopherCore();
  t.is(core.isEmptyCRLF("\r\n"), true);
});

test("isEmptyCRLF returns false with multiple CRLF signals", t => {
  const core = new GopherCore();
  t.is(core.isEmptyCRLF("\r\n\r\n"), false);
});
