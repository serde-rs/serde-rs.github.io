# Serde data model

The Serde data model is the API by which data structures and data formats
interact. You can think of it as Serde's type system.

In code, the serialization half of the Serde data model is defined by the
[`Serializer`] trait and the deserialization half is defined by the
[`Deserializer`] trait. These are a way of mapping every Rust data structure
into one of 27 possible types. Each method of the `Serializer` trait corresponds
to one of the types of the data model.

When serializing a data structure to some format, the [`Serialize`]
implementation for the data structure is responsible for mapping the data
structure into the Serde data model by invoking exactly one of the `Serializer`
methods, while the `Serializer` implementation for the data format is
responsible for mapping the Serde data model into the intended output
representation.

When deserializing a data structure from some format, the [`Deserialize`]
implementation for the data structure is responsible for mapping the data
structure into the Serde data model by passing to the `Deserializer` a
[`Visitor`] implementation that can receive the various types of the data model,
while the `Deserializer` implementation for the data format is responsible for
mapping the input data into the Serde data model by invoking exactly one of the
`Visitor` methods.

[`Serializer`]: https://docs.serde.rs/serde/trait.Serializer.html
[`Deserializer`]: https://docs.serde.rs/serde/trait.Deserializer.html
[`Serialize`]: https://docs.serde.rs/serde/trait.Serialize.html
[`Deserialize`]: https://docs.serde.rs/serde/trait.Deserialize.html
[`Visitor`]: https://docs.serde.rs/serde/de/trait.Visitor.html

## Types

The Serde data model is a simplified form of Rust's type system. It consists of
the following 27 types:

- **12 primitive types**
  - bool
  - i8, i16, i32, i64
  - u8, u16, u32, u64
  - f32, f64
  - char
- **string**
  - UTF-8 bytes with a length and no null terminator.
  - When serializing, all strings are handled equally. When deserializing, there
    are three flavors of strings: transient, owned, and borrowed. This
    distinction is explained in [Understanding deserializer lifetimes] and is a
    key way that Serde enabled efficient zero-copy deserialization.
- **byte array** - [u8]
  - Similar to strings, during deserialization byte arrays can be transient,
    owned, or borrowed.
- **option**
  - Either none or some value.
- **unit**
  - The type of `()` in Rust. It represents an anonymous value containing no
    data.
- **unit_struct**
  - For example `struct Unit` or `PhantomData<T>`. It represents a named value
    containing no data.
- **unit_variant**
  - For example the `E::A` and `E::B` in `enum E { A, B }`.
- **newtype_struct**
  - For example `struct Millimeters(u8)`.
- **newtype_variant**
  - For example the `E::N` in `enum E { N(u8) }`.
- **seq**
  - A variably sized heterogeneous sequence of values, for example `Vec<T>` or
    `HashSet<T>`. When serializing, the length may or may not be known before
    iterating through all the data. When deserializing, the length is determined
    by looking at the serialized data.
- **tuple**
  - A statically sized heterogeneous sequence of values for which the length
    will be known at deserialization time without looking at the serialized
    data, for example `(u8,)` or `(String, u64, Vec<T>)` or `[u64; 10]`.
- **tuple_struct**
  - A named tuple, for example `struct Rgb(u8, u8, u8)`.
- **tuple_variant**
  - For example the `E::T` in `enum E { T(u8, u8) }`.
- **map**
  - A variably sized heterogeneous key-value pairing, for example `BTreeMap<K,
    V>`. When serializing, the length may or may not be known before iterating
    through all the entries. When deserializing, the length is determined by
    looking at the serialized data.
- **struct**
  - A statically sized heterogeneous key-value pairing in which the keys are
    compile-time constant strings and will be known at deserialization time
    without looking at the serialized data, for example `struct S { r: u8, g:
    u8, b: u8 }`.
- **struct_variant**
  - For example the `E::S` in `enum E { S { r: u8, g: u8, b: u8 } }`.

[Understanding deserializer lifetimes]: lifetimes.md
