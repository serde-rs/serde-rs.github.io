# Error handling

During serialization, the [`Serialize`] trait maps a Rust data structure into
Serde's [data model] and the [`Serializer`] trait maps the data model into the
output format. During deserialization, the [`Deserializer`] maps the input data
into Serde's data model and the [`Deserialize`] and [`Visitor`] traits map the
data model into the resulting data structure. Any of these steps can fail.

- `Serialize` can fail, for example when a `Mutex<T>` is being serialized and
  the mutex happens to be poisoned.
- `Serializer` can fail, for example the Serde data model allows maps with
  non-string keys but JSON does not.
- `Deserializer` can fail, especially if the input data is syntactically
  invalid.
- `Deserialize` can fail, usually because the input is the wrong type for the
  value it is being deserialized into.

In Serde, errors from the `Serializer` and `Deserializer` work just like they
would in any other Rust library. The crate defines an error type, public
functions return a Result with that error type, and there are variants for the
various possible failure modes.

Handling of errors from the `Serialize` and `Deserialize`, the data structure
being processed by the library, is built around the [`ser::Error`] and
[`de::Error`] traits. These traits allow the data format to expose constructors
for its error type for the data structure to use in various situations.

[`Deserialize`]: https://docs.serde.rs/serde/trait.Deserialize.html
[`Deserializer`]: https://docs.serde.rs/serde/trait.Deserializer.html
[`Serialize`]: https://docs.serde.rs/serde/trait.Serialize.html
[`Serializer`]: https://docs.serde.rs/serde/ser/trait.Serializer.html
[`Visitor`]: https://docs.serde.rs/serde/de/trait.Visitor.html
[`de::Error`]: https://docs.serde.rs/serde/de/trait.Error.html
[`ser::Error`]: https://docs.serde.rs/serde/ser/trait.Error.html
[data model]: data-model.md

!FILENAME src/error.rs
```rust
# extern crate serde;
#
# macro_rules! ignore {
#     ($($tt:tt)*) => {}
# }
#
# ignore! {
use std;
# }
use std::fmt::{self, Display};

use serde::{ser, de};

pub type Result<T> = std::result::Result<T, Error>;

// This is a bare-bones implementation. A real library would provide additional
// information in its error type, for example the line and column at which the
// error occurred, the byte offset into the input, or the current key being
// processed.
#[derive(Clone, Debug, PartialEq)]
pub enum Error {
    // One or more variants that can be created by data structures through the
    // `ser::Error` and `de::Error` traits. For example the Serialize impl for
    // Mutex<T> might return an error because the mutex is poisoned, or the
    // Deserialize impl for a struct may return an error because a required
    // field is missing.
    Message(String),

    // Zero or more variants that can be created directly by the Serializer and
    // Deserializer without going through `ser::Error` and `de::Error`. These
    // are specific to the format, in this case JSON.
    Eof,
    Syntax,
    ExpectedBoolean,
    ExpectedInteger,
    ExpectedString,
    ExpectedNull,
    ExpectedArray,
    ExpectedArrayComma,
    ExpectedArrayEnd,
    ExpectedMap,
    ExpectedMapColon,
    ExpectedMapComma,
    ExpectedMapEnd,
    ExpectedEnum,
    TrailingCharacters,
}

impl ser::Error for Error {
    fn custom<T: Display>(msg: T) -> Self {
        Error::Message(msg.to_string())
    }
}

impl de::Error for Error {
    fn custom<T: Display>(msg: T) -> Self {
        Error::Message(msg.to_string())
    }
}

impl Display for Error {
    fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str(std::error::Error::description(self))
    }
}

impl std::error::Error for Error {
    fn description(&self) -> &str {
        match *self {
            Error::Message(ref msg) => msg,
            Error::Eof => "unexpected end of input",
            /* and so forth */
#             _ => unimplemented!(),
        }
    }
}
#
# fn main() {}
```
