# Conventions

By convention a Serde data format crate provides the following in the root
module or re-exported from the root module:

  - An Error type common to both serialization and deserialization.
  - A Result typedef which is equivalent to std::result::Result<T, Error>.
  - A Serializer type which implements serde::Serializer.
  - A Deserializer type which implements serde::Deserializer.
  - One or more `to_abc` functions depending on what types the format supports
    serializing to. For example `to_string` which returns a String, `to_bytes`
    which returns a `Vec<u8>`, or `to_writer` which writes into an
    [`io::Write`].
  - One or more `from_xyz` functions depending on what types the format supports
    deserializing from. For example `from_str` which takes a &str, `from_bytes`
    which takes a &[u8], or `from_reader` which takes an [`io::Read`].

In addition, formats that provide serialization-specific or
deserialization-specific APIs beyond Serializer and Deserializer should expose
those under top-level `ser` and `de` modules. For example serde_json provides a
pluggable pretty-printer trait as [`serde_json::ser::Formatter`].

[`io::Write`]: https://doc.rust-lang.org/std/io/trait.Write.html
[`io::Read`]: https://doc.rust-lang.org/std/io/trait.Read.html
[`serde_json::ser::Formatter`]: https://docs.serde.rs/serde_json/ser/trait.Formatter.html

A basic data format begins like this. The three modules are discussed in more
detail on the following pages.

!FILENAME src/lib.rs
```rust
extern crate serde;

// The serde_derive crate provides the macros for #[derive(Serialize)] and
// #[derive(Deserialize)]. You won't need these for implementing a data format
// but your unit tests will probably use them - hence #[cfg(test)].
#[cfg(test)]
#[macro_use]
extern crate serde_derive;

# macro_rules! modules {
#     (mod error) => {
#         mod error {
#             pub type Error = ();
#             pub type Result = ();
#         }
#     };
#     (mod ser) => {
#         mod ser {
#             pub fn to_string() {}
#             pub type Serializer = ();
#         }
#     };
#     (mod de) => {
#         mod de {
#             pub fn from_str() {}
#             pub type Deserializer = ();
#         }
#     };
#     ($(mod $n:ident;)+) => {
#         $(
#             modules!(mod $n);
#         )+
#     };
# }
#
# modules! {
mod error;
mod ser;
mod de;
# }

pub use error::{Error, Result};
pub use ser::{to_string, Serializer};
pub use de::{from_str, Deserializer};
#
# fn main() {}
```
