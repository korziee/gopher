# Gopher

<p align="center">
  <img src="https://media.giphy.com/media/F0uUtL7lmALCM/giphy.gif">
</p>

## What's Gopher?

> Gopher is inherently a very simple protocol that wraps around TCP and uses plain text communication. If you’re willing to stray away from what’s defined in the RFC you can use gopher for an array of cool things! You could build a JSON viewer in gopher, a solitaire game, a sports score viewer, a tic tac toe game, it really is endless.

For more on this, check out my [blog post](https://www.koryporter.com/2019/08/04/gopher-the-father-of-the-world-wide-web) on gopher.

## So what's in this repository?

This repository houses the `@korziee/gopher` package which defines the core logic and rules around using gopher with node, and also a collection of example use cases, like a file-server, json-viewer, etc.

## How do I get started using this?

The `@korziee/gopher` package exports a few key utility classes that will help you get started, namely [`GopherItem`](https://korziee.github.io/gopher/classes/_index_.gopheritem.html) and [`GopherServer`](https://korziee.github.io/gopher/classes/_index_.gopherserver.html)

### Getting going with a simple Gopher server

```typescript
import { GopherItem, GopherServer } from "@korziee/gopher`
// TODO: finish example
```

## Documentation

The rest of the documentation (including useful types) can be found [here](https://korziee.github.io/gopher/)
