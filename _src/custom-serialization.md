# Custom serialization

Serde's [derive macro] through `#[derive(Serialize, Deserialize)]` provides
reasonable default serialization behavior for structs and enums and it can be
customized to some extent using [attributes]. For unusual needs, Serde allows
full customization of the serialization behavior by manually implementing
[`Serialize`] and [`Deserialize`] traits for your type.

[derive macro]: derive.md
[attributes]: attributes.md
[`Serialize`]: https://docs.rs/serde/1/serde/ser/trait.Serialize.html
[`Deserialize`]: https://docs.rs/serde/1/serde/de/trait.Deserialize.html

The traits each have a single method:

```rust
# use serde::{Serializer, Deserializer};
#
pub trait Serialize {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer;
}

pub trait Deserialize<'de>: Sized {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>;
}
#
# fn main() {}
```

These methods are generic over the serialization format, represented by the
[`Serializer`] and [`Deserializer`] traits. For example there is one Serializer
type for JSON and a different one for Postcard.

[`Serializer`]: https://docs.rs/serde/1/serde/ser/trait.Serializer.html
[`Deserializer`]: https://docs.rs/serde/1/serde/de/trait.Deserializer.html

- [Implementing `Serialize`](impl-serialize.md)
- [Implementing `Deserialize`](impl-deserialize.md)
