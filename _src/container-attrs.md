# Container attributes

- ##### `#[serde(rename = "name")]` {#rename}

  Serialize and deserialize this struct or enum with the given name instead of
  its Rust name.

  Allows specifying independent names for serialization vs deserialization:

  - `#[serde(rename(serialize = "ser_name"))]`
  - `#[serde(rename(deserialize = "de_name"))]`
  - `#[serde(rename(serialize = "ser_name", deserialize = "de_name"))]`

- ##### `#[serde(rename_all = "...")]` {#rename_all}

  Rename all the fields (if this is a struct) or variants (if this is an enum)
  according to the given case convention. The possible values are `"lowercase"`,
  `"UPPERCASE"`, `"PascalCase"`, `"camelCase"`, `"snake_case"`,
  `"SCREAMING_SNAKE_CASE"`, `"kebab-case"`, `"SCREAMING-KEBAB-CASE"`.

  Allows specifying independent cases for serialization vs deserialization:

  - `#[serde(rename_all(serialize = "..."))]`
  - `#[serde(rename_all(deserialize = "..."))]`
  - `#[serde(rename_all(serialize = "...", deserialize = "..."))]`
 
- ##### `#[serde(rename_all_fields = "...")]` {#rename_all_fields}

  Apply a `rename_all` on every struct variant of an enum according to the
  given case convention. The possible values are `"lowercase"`,
  `"UPPERCASE"`, `"PascalCase"`, `"camelCase"`, `"snake_case"`,
  `"SCREAMING_SNAKE_CASE"`, `"kebab-case"`, `"SCREAMING-KEBAB-CASE"`.

  Allows specifying independent cases for serialization vs deserialization:

  - `#[serde(rename_all_fields(serialize = "..."))]`
  - `#[serde(rename_all_fields(deserialize = "..."))]`
  - `#[serde(rename_all_fields(serialize = "...", deserialize = "..."))]`

- ##### `#[serde(deny_unknown_fields)]` {#deny_unknown_fields}

  Always error during deserialization when encountering unknown fields. When
  this attribute is not present, by default unknown fields are ignored for
  self-describing formats like JSON.

  *Note:* this attribute is not supported in combination with [`flatten`],
  neither on the outer struct nor on the flattened field.

  [`flatten`]: field-attrs.md#flatten

- ##### `#[serde(tag = "type")]` {#tag}

  On an enum: Use the internally tagged enum representation, with the given tag.
  See [enum representations](enum-representations.md) for details on this
  representation.

  On a struct with named fields: Serialize the struct's name (or value of
  `serde(rename)`) as a field with the given key, in front of all the real
  fields of the struct.

- ##### `#[serde(tag = "t", content = "c")]` {#tag--content}

  Use the adjacently tagged enum representation for this enum, with the given
  field names for the tag and content. See [enum
  representations](enum-representations.md) for details on this representation.

- ##### `#[serde(untagged)]` {#untagged}

  Use the untagged enum representation for this enum. See [enum
  representations](enum-representations.md) for details on this representation.

- ##### `#[serde(variant_identifier)]` {#variant_identifier}

  Use an identifier representation for this enum. This can only be applied to enums that are C-like (containing only unit variants), and forces them to always be represented as strings, regardless of the underlying data format's representation of enums.

- ##### `#[serde(field_identifier)]` {#field_identifier}

  Identical to [`variant_identifier`](#variant_identifier), but also allows for the last variant to be a newtype variant, which will be used if none of the other variants match (similar to [`#[serde(other)]`](../variant-attrs.html#other)). Like `variant_identifier`, this forces the enum to always be represented as a string, regardless of the underlying data format's representation of enums.

- ##### `#[serde(bound = "T: MyTrait")]` {#bound}

  Where-clause for the `Serialize` and `Deserialize` impls. This replaces any
  trait bounds inferred by Serde.

  Allows specifying independent bounds for serialization vs deserialization:

  - `#[serde(bound(serialize = "T: MySerTrait"))]`
  - `#[serde(bound(deserialize = "T: MyDeTrait"))]`
  - `#[serde(bound(serialize = "T: MySerTrait", deserialize = "T: MyDeTrait"))]`

- ##### `#[serde(default)]` {#default}

  When deserializing, any missing fields should be filled in from the struct's
  implementation of `Default`. Only allowed on structs.

- ##### `#[serde(default = "path")]` {#default--path}

  When deserializing, any missing fields should be filled in from the object
  returned by the given function or method. The function must be callable as
  `fn() -> T`. For example `default = "my_default"` would invoke `my_default()`
  and `default = "SomeTrait::some_default"` would invoke
  `SomeTrait::some_default()`. Only allowed on structs.

- ##### `#[serde(remote = "...")]` {#remote}

  This is used for deriving `Serialize` and `Deserialize` for [remote
  types](remote-derive.md).

- ##### `#[serde(transparent)]` {#transparent}

  Serialize and deserialize a newtype struct or a braced struct with one field
  exactly the same as if its one field were serialized and deserialized by
  itself. Analogous to `#[repr(transparent)]`.

- ##### `#[serde(from = "FromType")]` {#from}

  Deserialize this type by deserializing into `FromType`, then converting. This
  type must implement `From<FromType>`, and `FromType` must implement
  `Deserialize`.

- ##### `#[serde(try_from = "FromType")]` {#try_from}

  Deserialize this type by deserializing into `FromType`, then converting
  fallibly. This type must implement `TryFrom<FromType>` with an error type that
  implements `Display`, and `FromType` must implement `Deserialize`.

- ##### `#[serde(into = "IntoType")]` {#into}

  Serialize this type by converting it into the specified `IntoType` and
  serializing that. This type must implement `Clone` and `Into<IntoType>`, and
  `IntoType` must implement `Serialize`.

- ##### `#[serde(crate = "...")]` {#crate}

  Specify a path to the `serde` crate instance to use when referring to Serde
  APIs from generated code. This is normally only applicable when invoking
  re-exported Serde derives from a public macro in a different crate.

- ##### `#[serde(expecting = "...")]` {#expecting}

  Specify a custom type expectation text for deserialization error messages.
  This is used by the generated `expecting` method for the container `Visitor`,
  and as a fallthrough error message for untagged enums.
