# Implementing Serialize

The [`Serialize`] trait looks like this:

[`Serialize`]: https://docs.serde.rs/serde/ser/trait.Serialize.html

```rust
# extern crate serde;
#
# use serde::Serializer;
#
pub trait Serialize {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer;
}
#
# fn main() {}
```

This method's job is to take your type (`&self`) and map it into the [Serde data
model] by invoking exactly one of the methods on the given [`Serializer`].

[Serde data model]: data-model.md
[`Serializer`]: https://docs.serde.rs/serde/ser/trait.Serializer.html

In most cases Serde's [derive] is able to generate an appropriate implementation
of `Serialize` for structs and enums defined in your crate. Should you need to
customize the serialization behavior for a type in a way that derive does not
support, you can implement `Serialize` yourself.

[derive]: derive.md

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
#     where
#         S: Serializer;
# }
#
impl Serialize for i32 {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
#         impl Serialize2 for ActualI32 {
#             fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
#             where
#                 S: Serializer,
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

Serde provides such impls for all of Rust's [primitive types] so you are not
responsible for implementing them yourself, but `serialize_i32` and similar
methods may be useful if you have a type that needs to be represented as a
primitive in its serialized form. For example you could [serialize a C-like enum
as a primitive number].

[primitive types]: https://doc.rust-lang.org/book/primitive-types.html
[serialize a C-like enum as a primitive number]: https://serde.rs/enum-number.html

## Serializing a sequence or map

Compound types follow a three-step process of init, elements, end.

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
# struct MyMap<K, V>(PhantomData<K>, PhantomData<V>);
#
# impl<K, V> MyMap<K, V> {
#     fn len(&self) -> usize {
#         unimplemented!()
#     }
# }
#
# impl<'a, K, V> IntoIterator for &'a MyMap<K, V> {
#     type Item = (&'a K, &'a V);
#     type IntoIter = Box<Iterator<Item = (&'a K, &'a V)>>;
#
#     fn into_iter(self) -> Self::IntoIter {
#         unimplemented!()
#     }
# }
#
use serde::ser::{Serialize, Serializer, SerializeSeq, SerializeMap};

impl<T> Serialize for Vec<T>
where
    T: Serialize,
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut seq = serializer.serialize_seq(Some(self.len()))?;
        for e in self {
            seq.serialize_element(e)?;
        }
        seq.end()
    }
}

impl<K, V> Serialize for MyMap<K, V>
where
    K: Serialize,
    V: Serialize,
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut map = serializer.serialize_map(Some(self.len()))?;
        for (k, v) in self {
            map.serialize_entry(k, v)?;
        }
        map.end()
    }
}
#
# fn main() {}
```

## Serializing a tuple

The `serialize_tuple` method is a lot like `serialize_seq`. The distinction
Serde makes is that `serialize_tuple` is for sequences where the length does not
need to be serialized because it will be known at deserialization time. The
usual examples are Rust [tuples] and [arrays]. In non-self-describing formats a
`Vec<T>` needs to be serialized with its length in order to be able to
deserialize a `Vec<T>` back out. But a `[T; 16]` can be serialized using
`serialize_tuple` because the length will be known at deserialization time
without looking at the serialized bytes.

[tuples]: https://doc.rust-lang.org/std/primitive.tuple.html
[arrays]: https://doc.rust-lang.org/std/primitive.array.html

## Serializing a struct

Serde distinguishes between four types of structs. [Ordinary structs] and [tuple
structs] follow the three-step process of init, elements, end just like a
sequence or map. [Newtype structs] and [unit structs] are more like primitives.

[Ordinary structs]: https://doc.rust-lang.org/book/structs.html
[tuple structs]: https://doc.rust-lang.org/book/structs.html#tuple-structs
[Newtype structs]: https://doc.rust-lang.org/book/structs.html#tuple-structs
[unit structs]: https://doc.rust-lang.org/book/structs.html#unit-like-structs

```rust
# #![allow(dead_code)]
#
// An ordinary struct. Use three-step process:
//   1. serialize_struct
//   2. serialize_field
//   3. end
struct Color {
    r: u8,
    g: u8,
    b: u8,
}

// A tuple struct. Use three-step process:
//   1. serialize_tuple_struct
//   2. serialize_field
//   3. end
struct Point2D(f64, f64);

// A newtype struct. Use serialize_newtype_struct.
struct Inches(u64);

// A unit struct. Use serialize_unit_struct.
struct Instance;
#
# fn main() {}
```

Structs and maps may look similar in some formats, including JSON. The
distinction Serde makes is that structs have keys that are compile-time constant
strings and will be known at deserialization time without looking at the
serialized data. This condition enables some data formats to handle structs much
more efficiently and compactly than maps.

Data formats are encouraged to treat newtype structs as insignificant wrappers
around the inner value, serializing just the inner value. See for example
[JSON's treatment of newtype structs].

[JSON's treatment of newtype structs]: json.md

```rust
# #![allow(dead_code)]
#
# extern crate serde;
#
use serde::ser::{Serialize, Serializer, SerializeStruct};

struct Color {
    r: u8,
    g: u8,
    b: u8,
}

impl Serialize for Color {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // 3 is the number of fields in the struct.
        let mut state = serializer.serialize_struct("Color", 3)?;
        state.serialize_field("r", &self.r)?;
        state.serialize_field("g", &self.g)?;
        state.serialize_field("b", &self.b)?;
        state.end()
    }
}
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

There are two more special cases that are part of the Serializer trait.

There is a method `serialize_bytes` which serializes a `&[u8]`. Some formats
treat bytes like any other seq, but some formats are able to serialize bytes
more compactly. Currently Serde does not use `serialize_bytes` in the
`Serialize` impl for `&[u8]` or `Vec<u8>` but once [specialization] lands in
stable Rust we will begin using it. For now the [`serde_bytes`] crate can be
used to enable efficient handling of `&[u8]` and `Vec<u8>` through
`serialize_bytes`.

[specialization]: https://github.com/rust-lang/rust/issues/31844
[`serde_bytes`]: https://docs.serde.rs/serde_bytes/

Finally, `serialize_some` and `serialize_none` correspond to `Option::Some` and
`Option::None`. Users tend to have different expectations around the `Option`
enum compared to other enums. Serde JSON will serialize `Option::None` as `null`
and `Option::Some` as just the contained value.
