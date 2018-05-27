# Writing a data format

The most important thing to understand before writing a data format is that
**Serde is not a parsing library**. Nothing in Serde is going to help you parse
whatever format you are implementing. The role of Serde is very specific:

- **Serialization** — taking arbitrary data structures from the user and
  rendering them in the format with maximum efficiency.
- **Deserialization** — interpreting the data that you parse into data
  structures of the user's choice with maximum efficiency.

Parsing is neither of these things and you will either be writing parsing code
from scratch or using a parsing library to implement your Deserializer.

The second most important thing to understand is the [**Serde data model**].

[**Serde data model**]: data-model.md

The following pages walk through a basic but functional JSON serializer and
deserializer implemented using Serde.

- [Conventions for what to export at the root of the crate](conventions.md)
- [Serde error traits and error handling](error-handling.md)
- [Implementing a Serializer](impl-serializer.md)
- [Implementing a Deserializer](impl-deserializer.md)

You can find these four source files all together as a buildable crate in [this
GitHub repository].

[this GitHub repository]: https://github.com/serde-rs/example-format
