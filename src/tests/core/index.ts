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

test("filterInput returns CRLF if that is all the input is", t => {
  const core = myContainer.get<IGopherCore>(Symbols.GopherCore);
  t.deepEqual(core.filterInput("\r\n"), "\r\n");
});

test("filterInput strips away the CRLF if the input is more than that", t => {
  const core = myContainer.get<IGopherCore>(Symbols.GopherCore);
  t.deepEqual(core.filterInput("hello world\r\n"), "hello world");
  t.deepEqual(
    core.filterInput("hello sdfjslfghtesting\t\r\n"),
    "hello sdfjslfghtesting\t"
  );
});
