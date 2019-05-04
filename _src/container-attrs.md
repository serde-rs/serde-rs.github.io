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

- ##### `#[serde(deny_unknown_fields)]` {#deny_unknown_fields}

  Always error during deserialization when encountering unknown fields. When
  this attribute is not present, by default unknown fields are ignored for
  self-describing formats like JSON.

- ##### `#[serde(tag = "type")]` {#tag}

  Use the internally tagged enum representation for this enum, with the given
  tag. See [enum representations](enum-representations.md) for details on this
  representation.

- ##### `#[serde(tag = "t", content = "c")]` {#tag--content}

  Use the adjacently tagged enum representation for this enum, with the given
  field names for the tag and content. See [enum
  representations](enum-representations.md) for details on this representation.

- ##### `#[serde(untagged)]` {#untagged}

  Use the untagged enum representation for this enum. See [enum
  representations](enum-representations.md) for details on this representation.

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

- ##### `#[serde(crate = "...")]` {#crate}

  Specify a path to the `serde` crate instance to use when deriving `Serialize`
  and/or `Deserialize` for this type.

- ##### `#[serde(from = "FromType")]` {#from}

  Deserialize this type by deserializing into `FromType`, then converting. This
  type must implement `From<FromType>`, and `FromType` must implement
  `Deserialize`.

- ##### `#[serde(into = "IntoType")]` {#into}

  Serialize this type by converting it into the specified `IntoType` and
  serializing that. This type must implement `Clone` and `Into<IntoType>`, and
  `IntoType` must implement `Serialize`.

- ##### `#[serde(field_identifier)]` {#field_identifier}

  Denotes that this enum represents the field names of a struct type. Used when
  [manually implementing `Deserialize` for the struct
  type.](deserialize_struct.md)

  This attribute is probably not useful if you are automatically deriving your
  own types.

  Variants for the field_identifier enum may either all be units, or the last
  variant may be a newtype struct, which is selected when an unlisted field name
  is encountered during deserialization. Cannot be set if
  `#[serde(variant_identifier)]` is also set.

- ##### `#[serde(variant_identifier)]` {#variant_identifier}

  Denotes that this enum represents the variant names of another enum type.
  Used when manually implementing `Deserialize` for the other enum type.

  This attribute is probably not useful if you are automatically deriving your
  own types.

  Only valid for enums where all variants are units. Cannot be set if
  `#[serde(field_identifier)]` is also set.
