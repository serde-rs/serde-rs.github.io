# Variant attributes

- ##### `#[serde(rename = "name")]` {#rename}

  Serialize and deserialize this variant with the given name instead of its Rust
  name.

  Allows specifying independent names for serialization vs deserialization:

  - `#[serde(rename(serialize = "ser_name"))]`
  - `#[serde(rename(deserialize = "de_name"))]`
  - `#[serde(rename(serialize = "ser_name", deserialize = "de_name"))]`

- ##### `#[serde(alias = "name")]` {#alias}

  Deserialize this variant from the given name *or* from its Rust name. May be
  repeated to specify multiple possible names for the same variant.

- ##### `#[serde(rename_all = "...")]` {#rename_all}

  Rename all the fields of this struct variant according to the given case
  convention. The possible values are `"lowercase"`, `"UPPERCASE"`,
  `"PascalCase"`, `"camelCase"`, `"snake_case"`, `"SCREAMING_SNAKE_CASE"`,
  `"kebab-case"`, `"SCREAMING-KEBAB-CASE"`.

  Allows specifying independent cases for serialization vs deserialization:

  - `#[serde(rename_all(serialize = "..."))]`
  - `#[serde(rename_all(deserialize = "..."))]`
  - `#[serde(rename_all(serialize = "...", deserialize = "..."))]`

- ##### `#[serde(skip)]` {#skip}

  Never serialize or deserialize this variant.

- ##### `#[serde(skip_serializing)]` {#skip_serializing}

  Never serialize this variant. Trying to serialize this variant is treated as
  an error.

- ##### `#[serde(skip_deserializing)]` {#skip_deserializing}

  Never deserialize this variant.

- ##### `#[serde(serialize_with = "path")]` {#serialize_with}

  Serialize this variant using a function that is different from its
  implementation of `Serialize`. The given function must be callable as
  `fn<S>(&FIELD0, &FIELD1, ..., S) -> Result<S::Ok, S::Error> where S:
  Serializer`, although it may also be generic over the `FIELD{n}` types.
  Variants used with `serialize_with` are not required to be able to derive
  `Serialize`.

  `FIELD{n}` exists for every field of the variant. So a unit variant has just
  the `S` argument, and tuple/struct variants have an argument for every field.

- ##### `#[serde(deserialize_with = "path")]` {#deserialize_with}

  Deserialize this variant using a function that is different from its
  implementation of `Deserialize`. The given function must be callable as
  `fn<'de, D>(D) -> Result<FIELDS, D::Error> where D: Deserializer<'de>`,
  although it may also be generic over the elements of `FIELDS`. Variants used
  with `deserialize_with` are not required be able to derive `Deserialize`.

  `FIELDS` is a tuple of all fields of the variant. A unit variant will have
  `()` as its `FIELDS` type.

- ##### `#[serde(with = "module")]` {#with}

  Combination of `serialize_with` and `deserialize_with`. Serde will use
  `$module::serialize` as the `serialize_with` function and
  `$module::deserialize` as the `deserialize_with` function.

- ##### `#[serde(bound = "T: MyTrait")]` {#bound}

  Where-clause for the `Serialize` and/or `Deserialize` impls. This replaces any
  trait bounds inferred by Serde for the current variant.

  Allows specifying independent bounds for serialization vs deserialization:

  - `#[serde(bound(serialize = "T: MySerTrait"))]`
  - `#[serde(bound(deserialize = "T: MyDeTrait"))]`
  - `#[serde(bound(serialize = "T: MySerTrait", deserialize = "T: MyDeTrait"))]`

- ##### `#[serde(borrow)]` and `#[serde(borrow = "'a + 'b + ...")]` {#borrow}

  Borrow data for this field from the deserializer by using zero-copy
  deserialization. See [this example][borrowing-data]. Only allowed on a newtype
  variant (a tuple variant with only one field).

  [borrowing-data]: lifetimes.md#borrowing-data-in-a-derived-impl

- ##### `#[serde(other)]` {#other}

  Deserialize this variant if the enum tag is anything other than the tag of one
  of the other variants in this enum. Only allowed on a unit variant inside of
  an internally tagged or adjacently tagged enum.

  For example if we have an internally tagged enum with `serde(tag = "variant")`
  containing variants `A`, `B`, and `Unknown` marked `serde(other)`, the
  `Unknown` variant would be deserialized any time the `"variant"` field of the
  input is neither `"A"` nor `"B"`.

- ##### `#[serde(untagged)]` {#untagged}

  Irrespective of the [enum representation], serialize and deserialize this
  variant as untagged, i.e. simply as the variant's data with no record of the
  variant name.

  Untagged variants must be ordered last in the enum definition.

  [enum representations]: enum-representations.md
