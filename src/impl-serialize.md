# Implementing Serialize

The [`Serialize`](https://docs.serde.rs/serde/ser/trait.Serialize.html) trait
looks like this:

```rust
# extern crate serde;
#
# use serde::Serializer;
#
pub trait Serialize {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where S: Serializer;
}
#
# fn main() {}
```

This method's job is to take your type (`&self`) and turn it into a series of
method calls on the given
[`Serializer`](https://docs.serde.rs/serde/ser/trait.Serializer.html).

In most cases Serde's [codegen](codegen.md) is able to generate an appropriate
implementation of `Serialize` for structs and enums defined in your crate.
Should you need to customize the serialization behavior for a type in a way that
codegen does not support, you can implement `Serialize` yourself.

## Serializing a primitive

As the simplest example, here is the builtin `Serialize` impl for the primitive
`i32`.

```rust
# extern crate serde;
#
# use std::os::raw::c_int as ActualI32;
#
# use serde::{Serialize, Serializer};
#
# #[allow(dead_code, non_camel_case_types)]
# struct i32;
#
# trait Serialize2 {
#     fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
#         where S: Serializer;
# }
#
impl Serialize for i32 {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where S: Serializer
    {
#         impl Serialize2 for ActualI32 {
#             fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
#                 where S: Serializer
#             {
        serializer.serialize_i32(*self)
#             }
#         }
#
#         let _ = serializer;
#         unimplemented!()
    }
}
#
# fn main() {}
```

Serde provides such impls for all of Rust's [primitive
types](https://doc.rust-lang.org/book/primitive-types.html) so you are not
responsible for implementing them yourself, but `serialize_i32` and similar
methods may be useful if you have a type that needs to be represented as a
primitive in its serialized form. For example you could [serialize a C-like enum
as a primitive number](https://serde.rs/enum-number.html).

## Serializing a sequence or map

Complex types follow a three-step process of init, elements, end.

```rust
# extern crate serde;
#
# use std::marker::PhantomData;
#
# struct Vec<T>(PhantomData<T>);
#
# impl<T> Vec<T> {
#     fn len(&self) -> usize {
#         unimplemented!()
#     }
# }
#
# impl<'a, T> IntoIterator for &'a Vec<T> {
#     type Item = &'a T;
#     type IntoIter = Box<Iterator<Item = &'a T>>;
#
#     fn into_iter(self) -> Self::IntoIter {
#         unimplemented!()
#     }
# }
#
use serde::ser::{Serialize, Serializer, SerializeSeq};

impl<T> Serialize for Vec<T>
    where T: Serialize
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where S: Serializer
    {
        let mut seq = serializer.serialize_seq(Some(self.len()))?;
        for e in self {
            seq.serialize_element(e)?;
        }
        seq.end()
    }
}
#
# fn main() {}
```

[Serializing a map](serialize-map.md) works the same way but with separate calls
in the loop for `serialize_key` and `serialize_value`.

## Serializing a struct

Serde distinguishes between four types of structs. [Ordinary
structs](https://doc.rust-lang.org/book/structs.html) and [tuple
structs](https://doc.rust-lang.org/book/structs.html#tuple-structs) follow the
three-step process of init, elements, end just like a sequence or map. [Newtype
structs](https://doc.rust-lang.org/book/structs.html#tuple-structs) and [unit
structs](https://doc.rust-lang.org/book/structs.html#unit-like-structs) are more
like primitives.

Data formats are encouraged to treat newtype structs as insignificant wrappers
around the inner value, serializing just the inner value. See for example
[JSON's treatment of newtype structs](json.md).

```rust
// An ordinary struct. Use three-step process:
//   1. serialize_struct
//   2. serialize_field
//   3. end
# #[allow(dead_code)]
struct Color {
    r: u8,
    g: u8,
    b: u8,
}

// A tuple struct. Use three-step process:
//   1. serialize_tuple_struct
//   2. serialize_field
//   3. end
# #[allow(dead_code)]
struct Point2D(f64, f64);

// A newtype struct. Use serialize_newtype_struct.
# #[allow(dead_code)]
struct Inches(u64);

// A unit struct. Use serialize_unit_struct.
# #[allow(dead_code)]
struct Instance;
#
# fn main() {}
```

## Serializing an enum

Serializing enum variants is very similar to serializing structs.

```rust
# #[allow(dead_code)]
enum E {
    // Use three-step process:
    //   1. serialize_struct_variant
    //   2. serialize_field
    //   3. end
    Color { r: u8, g: u8, b: u8 },

    // Use three-step process:
    //   1. serialize_tuple_variant
    //   2. serialize_field
    //   3. end
    Point2D(f64, f64),

    // Use serialize_newtype_variant.
    Inches(u64),

    // Use serialize_unit_variant.
    Instance,
}
#
# fn main() {}
```

## Other special cases

There are three more special cases that are part of the Serializer trait.

There is a method `serialize_bytes` which serializes a `&[u8]`. Some formats
treat bytes like any other seq, but some formats are able to serialize bytes
more compactly. Currently Serde does not use `serialize_bytes` in the
`Serialize` impl for `&[u8]` or `Vec<u8>` but once
[specialization](https://github.com/rust-lang/rust/issues/31844) lands in stable
Rust we will begin using it. For now the
[`Bytes`](https://docs.serde.rs/serde/bytes/struct.Bytes.html) and
[`ByteBuf`](https://docs.serde.rs/serde/bytes/struct.ByteBuf.html) wrappers can
be used to wrap `&[u8]` and `Vec<u8>` respectively to call `serialize_bytes`.

There is `serialize_seq_fixed_size` which is like `serialize_seq` but for
sequences where the length does not need to be serialized because it will be
known at deserialization time. The usual example is
[arrays](https://doc.rust-lang.org/book/primitive-types.html#arrays). In
non-self-describing formats a `Vec<T>` needs to be serialized with its length in
order to be able to deserialize a `Vec<T>` back out. But a `[T; 16]` can be
serialized using `serialize_seq_fixed_size` because the length will be known at
deserialization time without looking at the serialized bytes.

Finally, `serialize_some` and `serialize_none` correspond to `Option::Some` and
`Option::None`. Users tend to have different expectations around the `Option`
enum compared to other enums. Serde JSON will serialize `Option::None` as `null`
and `Option::Some` as just the contained value.
