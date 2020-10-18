Next steps

- bring all of the core logic into the core folder
  - remove the class, no need
  - make sure all types are exported so that other gopher servers can import them
  - GopherItem class
    - takes in type, description, handler, host, port, isRaw (?)
    - has methods:
      - public transformToText()
        following two lines are optional: you could just have separate funcs
      - static generateInfoItem()
      - static generateEmptyItem()
- bring the core server logic into core

  - it should be configurable like it is now
  - the handleInput function of the extendable servers should return an array of GopherItems or a string.
  - it should accept either one IGopherServer or an array of IGopherServer's. if it is only one, it does not need a root handler for that item.

  TODO:

- publish core on NPM
- write documentation
- bring the other servers over

---

Instead of PreGopher, what should it be called?

- GopherDescriber
- GopherDesc
- GopherJSON
- GopherItem?

what does it do?

- it describes the type of gopher entry, i.e. html, text, etc.

---

lets say we have the file server being used on it's own (without mutliple plugins), as a consu
