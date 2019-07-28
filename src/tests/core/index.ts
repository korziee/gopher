import test from "ava";
import { IGopherCore } from "../../core";
import { myContainer } from "../../inversify";
// import { IPreGopher } from "../../models/IPreGopher";
import { Symbols } from "../../symbols";

test("isEmptyCRLF returns false if not CRLF", t => {
  const core = myContainer.get<IGopherCore>(Symbols.GopherCore);
  t.is(core.isEmptyCRLF("sfsdf"), false);
});

test("isEmptyCRLF returns true if CRLF", t => {
  const core = myContainer.get<IGopherCore>(Symbols.GopherCore);
  t.is(core.isEmptyCRLF("\r\n"), true);
});

test("isEmptyCRLF returns false with multiple CRLF signals", t => {
  const core = myContainer.get<IGopherCore>(Symbols.GopherCore);
  t.is(core.isEmptyCRLF("\r\n\r\n"), false);
});
