import test from "ava";
import { myContainer } from "../../../inversify.config";
import { IGopherFileServer } from "../../../servers/file";
import { Symbols } from "../../../symbols";

test("throws without first being initiliased", async t => {
  // myContainer.rebind(Symbols.GopherFileServer).to(MockGopherFileServer);
  const server = myContainer.get<IGopherFileServer>(Symbols.GopherFileServer);
  t.throws(server.start);
});
