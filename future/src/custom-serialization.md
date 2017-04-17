# Custom serialization

Serde [code generation](codegen.md) through `#[derive(Serialize, Deserialize)]`
provides reasonable default serialization behavior for structs and enums and it
can be customized to some extent using [attributes](attributes.md). For unusual
needs, Serde allows full customization of the serialization behavior by manually
implementing [`Serialize`](https://docs.serde.rs/serde/ser/trait.Serialize.html)
and [`Deserialize`](https://docs.serde.rs/serde/de/trait.Deserialize.html)
traits for your type.

The traits each have a single method:

```rust
# extern crate serde;
#
# use serde::{Serializer, Deserializer};
#
pub trait Serialize {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where S: Serializer;
}

pub trait Deserialize: Sized {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where D: Deserializer;
}
#
# fn main() {}
```

These methods are generic over the serialization format, represented by the
[`Serializer`](https://docs.serde.rs/serde/ser/trait.Serializer.html) and
[`Deserializer`](https://docs.serde.rs/serde/de/trait.Deserializer.html) traits.
For example there is one Serializer type for JSON and a different one for
Bincode.

- [Implementing `Serialize`](impl-serialize.md)
- [Implementing `Deserialize`](impl-deserialize.md)
