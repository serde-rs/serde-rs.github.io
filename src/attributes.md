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

- ##### `#[serde(tag = "type")]`

  Use the internally tagged enum representation for this enum, with the given
  tag. See [enum representations](enum-representations.md) for details on this
  representation.

- ##### `#[serde(tag = "t", content = "c")]`

  Use the adjacently tagged enum representation for this enum, with the given
  field names for the tag and content. See [enum
  representations](enum-representations.md) for details on this representation.

- ##### `#[serde(untagged)]`

  Use the untagged enum representation for this enum. See [enum
  representations](enum-representations.md) for details on this representation.

- ##### `#[serde(bound = "T: MyTrait")]`

  Where-clause for the `Serialize` and `Deserialize` impls. This replaces any
  trait bounds inferred by Serde.

- ##### `#[serde(bound(serialize = "T: MyTrait"))]`

  Where-clause for the `Serialize` impl.

- ##### `#[serde(bound(deserialize  = "T: MyTrait"))]`

  Where-clause for the `Deserialize` impl.

- ##### `#[serde(default)]`

  When deserializing, any missing fields should be filled in from the struct's
  implementation of `Default`. Only allowed on structs.

- ##### `#[serde(default = "path")]`

  When deserializing, any missing fields should be filled in from the object
  returned by the given function or method. The function must be callable as
  `fn() -> T`. For example `default = "my_default"` would invoke `my_default()`
  and `default = "SomeTrait::some_default"` would invoke
  `SomeTrait::some_default()`. Only allowed on structs.

## Variant attributes

- ##### `#[serde(rename = "name")]`

  Serialize and deserialize this variant with the given name instead of its Rust
  name.

- ##### `#[serde(rename(serialize = "name"))]`

  Like `rename = "name"` but applies to serialization only.

- ##### `#[serde(rename(deserialize = "name"))]`

  Like `rename = "name"` but applies to deserialization only.

- ##### `#[serde(skip_serializing)]`

  Never serialize this variant, fail if it tries to be serialized.

- ##### `#[serde(skip_deserializing)]`

  Never deserialize this variant.

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
  `fn<S>(&T, S) -> Result<S::Ok, S::Error> where S: Serializer`, although it
  may also be generic over `T`. Fields used with `serialize_with` do not need to
  implement `Serialize`.

- ##### `#[serde(deserialize_with = "path")]`

  Deserialize this field using a function that is different from its
  implementation of `Deserialize`. The given function must be callable as
  `fn<D>(D) -> Result<T, D::Error> where D: Deserializer`, although it may
  also be generic over `T`. Fields used with `deserialize_with` do not need to
  implement `Deserialize`.

- ##### `#[serde(with = "module")]`

  Combination of `serialize_with` and `deserialize_with`. Serde will use
  `$module::serialize` as the `serialize_with` function and
  `$module::deserialize` as the `deserialize_with` function.

- ##### `#[serde(bound = "T: MyTrait")]`

  Where-clause for the `Serialize` and `Deserialize` impls. This replaces any
  trait bounds inferred by Serde for the current field.

- ##### `#[serde(bound(serialize = "T: MyTrait"))]`

  Where-clause for the `Serialize` impl.

- ##### `#[serde(bound(deserialize  = "T: MyTrait"))]`

  Where-clause for the `Deserialize` impl.
