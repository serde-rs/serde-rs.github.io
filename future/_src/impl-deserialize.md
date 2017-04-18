# Implementing Deserialize

The [`Deserialize`] trait looks like this:

[`Deserialize`]: https://docs.serde.rs/serde/de/trait.Deserialize.html

```rust
# extern crate serde;
#
# use serde::Deserializer;
#
pub trait Deserialize<'de>: Sized {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where D: Deserializer<'de>;
}
#
# fn main() {}
```

This method's job is to provide the [`Deserializer`] with a [`Visitor`] that can
be driven by the Deserializer to construct an instance of your type.

[`Deserializer`]: https://docs.serde.rs/serde/trait.Deserializer.html
[`Visitor`]: https://docs.serde.rs/serde/de/trait.Visitor.html

In most cases Serde's [derive] is able to generate an appropriate implementation
of `Deserialize` for structs and enums defined in your crate. Should you need to
customize the deserialization behavior for a type in a way that derive does not
support, you can implement `Deserialize` yourself. Implementing `Deserialize`
for a type tends to be more complicated than implementing `Serialize`.

[derive]: derive.md

The `Deserializer` trait supports two entry point styles which enables different
kinds of deserialization.

1. The `deserialize` method. Self-describing data formats like JSON are able to
   look at the serialized data and tell what it represents. For example the JSON
   deserializer may see an opening curly brace (`{`) and know that it is seeing
   a map. If the data format supports `Deserializer::deserialize`, it will drive
   the Visitor using whatever type it sees in the input. JSON uses this approach
   when deserializing `serde_json::Value` which is an enum that can represent
   any JSON document. Without knowing what is in a JSON document, we can
   deserialize it to `serde_json::Value` by going through
   `Deserializer::deserialize`.

2. The various `deserialize_*` methods. Non-self-describing formats like Bincode
   need to be told what is in the input in order to deserialize it. The
   `deserialize_*` methods are hints to the deserializer for how to interpret
   the next piece of input. Non-self-describing formats are not able to
   deserialize something like `serde_json::Value` which relies on
   `Deserializer::deserialize`.

When implementing `Deserialize`, you should avoid relying on
`Deserializer::deserialize` unless you need to be told by the Deserializer what
type is in the input. Know that relying on `Deserializer::deserialize` means
your data type will be able to deserialize from self-describing formats only,
ruling out Bincode and many others.

## The Visitor trait

A [`Visitor`] is instantiated by a `Deserialize` impl and passed to a
`Deserializer`. The `Deserializer` then calls a method on the `Visitor` in order
to construct the desired type.

Here is a `Visitor` that is able to deserialize a primitive `i32` from a variety
of types.

```rust
# extern crate serde;
#
use std::fmt;

use serde::de::{self, Visitor};

# #[allow(dead_code)]
struct I32Visitor;

impl<'de> Visitor<'de> for I32Visitor {
    type Value = i32;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("an integer between -2^31 and 2^31")
    }

    fn visit_i8<E>(self, value: i8) -> Result<i32, E>
        where E: de::Error
    {
        Ok(value as i32)
    }

    fn visit_i32<E>(self, value: i32) -> Result<i32, E>
        where E: de::Error
    {
        Ok(value)
    }

    fn visit_i64<E>(self, value: i64) -> Result<i32, E>
        where E: de::Error
    {
        use std::i32;
        if value >= i32::MIN as i64 && value <= i32::MAX as i64 {
            Ok(value as i32)
        } else {
            Err(E::custom(format!("i32 out of range: {}", value)))
        }
    }

    // Similar for other methods:
    //   - visit_i16
    //   - visit_u8
    //   - visit_u16
    //   - visit_u32
    //   - visit_u64
}
#
# fn main() {}
```

The `Visitor` trait has lots more methods that are not implemented for
`I32Visitor`. Leaving them unimplemented means a [type error] is returned if
they get called. For example `I32Visitor` does not implement
`Visitor::visit_map`, so trying to deserialize an i32 when the input contains a
map is a type error.

[type error]: https://docs.serde.rs/serde/de/trait.Error.html#method.invalid_type

## Driving a Visitor

Deserialize a value by passing a `Visitor` to the given `Deserializer`. The
`Deserializer` will call one of the `Visitor` methods depending on the input
data, which is known as "driving" the `Visitor`.

```rust
# extern crate serde;
#
# use std::fmt;
#
# use serde::de::{Deserialize, Deserializer, Visitor};
#
# #[allow(non_camel_case_types)]
# struct i32;
# struct I32Visitor;
#
# impl<'de> Visitor<'de> for I32Visitor {
#     type Value = i32;
#
#     fn expecting(&self, _: &mut fmt::Formatter) -> fmt::Result {
#         unimplemented!()
#     }
# }
#
impl<'de> Deserialize<'de> for i32 {
    fn deserialize<D>(deserializer: D) -> Result<i32, D::Error>
        where D: Deserializer<'de>
    {
        deserializer.deserialize_i32(I32Visitor)
    }
}
#
# fn main() {}
```

Note that a `Deserializer` will not necessarily follow the type hint, so the
call to `deserialize_i32` does not necessarily mean the `Deserializer` will call
`I32Visitor::visit_i32`. For example JSON treats all signed integer types alike.
The JSON `Deserializer` will call `visit_i64` for any signed integer and
`visit_u64` for any unsigned integer, even if hinted a different type.

## Other examples

- [Deserializing a map](deserialize-map.md)
- [Deserializing a struct](deserialize-struct.md)
