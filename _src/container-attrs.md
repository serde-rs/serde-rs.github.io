# Container attributes

- ##### `#[serde(rename = "name")]`

  Serialize and deserialize this struct or enum with the given name instead of
  its Rust name.

- ##### `#[serde(rename_all = "...")]`

  Rename all the fields (if this is a struct) or variants (if this is an enum)
  according to the given case convention. The possible values are `"lowercase"`,
  `"PascalCase"`, `"camelCase"`, `"snake_case"`, `"SCREAMING_SNAKE_CASE"`,
  `"kebab-case"`, `"SCREAMING-KEBAB-CASE"`.

- ##### `#[serde(deny_unknown_fields)]`

  Always error during deserialization when encountering unknown fields. When
  this attribute is not present, by default unknown fields are ignored for
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

- ##### `#[serde(remote = "...")]`

  This is used for deriving `Serialize` and `Deserialize` for [remote
  types](remote-derive.md).

- ##### `#[serde(transparent)]`

  Serialize and deserialize a newtype struct or a braced struct with one field
  exactly the same as if its one field were serialized and deserialized by
  itself. Analogous to `#[repr(transparent)]`.
