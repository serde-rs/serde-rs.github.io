# Attributes

[Attributes](https://doc.rust-lang.org/book/attributes.html) are used to
customize the `Serialize` and `Deserialize` implementations produced by Serde's
code generation.

There are three categories of attributes:

- *Container attributes* apply to a struct or enum declaration.
- *Variant attributes* apply to a variant of an enum, as in `Option::None` or
  `Option::Some`.
- *Field attributes* apply to one field in a struct or in an enum variant.

```rust
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]  // <-- this is a container attribute
struct S {
    #[serde(default)]  // <-- this is a field attribute
    f: i32,
}

#[derive(Serialize, Deserialize)]
#[serde(rename = "e")]  // <-- this is also a container attribute
enum E {
    #[serde(rename = "a")]  // <-- this is a variant attribute
    A(String),
}
```

Note that a single struct, enum, variant, or field may have multiple attributes
on it.

## Container attributes

- ##### `#[serde(rename = "name")]`

  Serialize and deserialize this struct or enum with the given name instead of
  its Rust name.

- ##### `#[serde(rename(serialize = "name"))]`

  Like `rename = "name"` but applies to serialization only.

- ##### `#[serde(rename(deserialize = "name"))]`

  Like `rename = "name"` but applies to deserialization only.

- ##### `#[serde(deny_unknown_fields)]`

  Always error during serialization when encountering unknown fields. When this
  attribute is not present, by default unknown fields are ignored for
  self-describing formats like JSON.

- ##### `#[serde(bound = "T: MyTrait")]`

  Where-clause for the `Serialize` and `Deserialize` impls. This replaces any
  trait bounds inferred by Serde.

- ##### `#[serde(bound(serialize = "T: MyTrait"))]`

  Where-clause for the `Serialize` impl.

- ##### `#[serde(bound(deserialize  = "T: MyTrait"))]`

  Where-clause for the `Deserialize` impl.

## Variant attributes

- ##### `#[serde(rename = "name")]`

  Serialize and deserialize this variant with the given name instead of its Rust
  name.

- ##### `#[serde(rename(serialize = "name"))]`

  Like `rename = "name"` but applies to serialization only.

- ##### `#[serde(rename(deserialize = "name"))]`

  Like `rename = "name"` but applies to deserialization only.

## Field attributes

- ##### `#[serde(rename = "name")]`

  Serialize and deserialize this field with the given name instead of its Rust
  name. This is useful for [serializing fields as camelCase](attr-rename.md) or
  serializing fields with names that are reserved Rust keywords.

- ##### `#[serde(rename(serialize = "name"))]`

  Like `rename = "name"` but applies to serialization only.

- ##### `#[serde(rename(deserialize = "name"))]`

  Like `rename = "name"` but applies to deserialization only.

- ##### `#[serde(default)]`

  If the value is not present when deserializing, use the `Default::default()`.

- ##### `#[serde(default = "path")]`

  If the value is not present when deserializing, call a function to get a
  default value. The given function must be callable as `fn() -> T`. For example
  `default = "empty_value"` would invoke `empty_value()` and `default =
  "SomeTrait::some_default"` would invoke `SomeTrait::some_default()`.

- ##### `#[serde(skip_serializing)]`

  Do not serialize this value.

- ##### `#[serde(skip_deserializing)]`

  Always use `Default::default()` or the function given by `default = "..."`
  instead of ever deserializing this value.

- ##### `#[serde(skip_serializing_if = "path")]`

  Call a function to determine whether to skip serializing this field. The given
  function must be callable as `fn(&T) -> bool`, although it may be generic over
  `T`. For example `skip_serializing_if = "Option::is_none"` would skip an
  Option that is None.

- ##### `#[serde(serialize_with = "path")]`

  Serialize this field using a function that is different from its
  implementation of `Serialize`. The given function must be callable as
  `fn<S>(&T, &mut S) -> Result<(), S::Error> where S: Serializer`, although it
  may also be generic over `T`. Fields used with `serialize_with` do not need to
  implement `Serialize`.

- ##### `#[serde(deserialize_with = "path")]`

  Deserialize this field using a function that is different from its
  implementation of `Deserialize`. The given function must be callable as
  `fn<D>(&mut D) -> Result<T, D::Error> where D: Deserializer`, although it may
  also be generic over `T`. Fields used with `deserialize_with` do not need to
  implement `Deserialize`.

- ##### `#[serde(bound = "T: MyTrait")]`

  Where-clause for the `Serialize` and `Deserialize` impls. This replaces any
  trait bounds inferred by Serde for the current field.

- ##### `#[serde(bound(serialize = "T: MyTrait"))]`

  Where-clause for the `Serialize` impl.

- ##### `#[serde(bound(deserialize  = "T: MyTrait"))]`

  Where-clause for the `Deserialize` impl.
