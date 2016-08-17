# Custom serialization

Serde [code generation](codegen.md) through `#[derive(Serialize, Deserialize)]`
provides reasonable default serialization behavior for structs and enums and it
can be customized to some extent using [attributes](attributes.md). For unusual
needs, Serde allows full customization of the serialization behavior by manually
implementing [`Serialize`](http://docs.serde.rs/serde/ser/trait.Serialize.html)
and [`Deserialize`](http://docs.serde.rs/serde/de/trait.Deserialize.html) traits
for your type.

The traits each have a single method:

```rust
pub trait Serialize {
    fn serialize<S>(&self, serializer: &mut S) -> Result<(), S::Error>
        where S: Serializer;
}

pub trait Deserialize: Sized {
    fn deserialize<D>(deserializer: &mut D) -> Result<Self, D::Error>
        where D: Deserializer;
}
```

These methods are generic over the serialization format, represented by the
[`Serializer`](http://docs.serde.rs/serde/ser/trait.Serializer.html) and
[`Deserializer`](http://docs.serde.rs/serde/de/trait.Deserializer.html) traits.
For example there is one Serializer type for JSON and a different one for
Bincode.

- [Implementing `Serialize`](impl-serialize.md)
- [Implementing `Deserialize`](impl-deserialize.md)
