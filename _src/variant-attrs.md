# Variant attributes

- ##### `#[serde(rename = "name")]`

  Serialize and deserialize this variant with the given name instead of its Rust
  name.

- ##### `#[serde(rename_all = "...")]`

  Rename all the fields of this struct variant according to the given case
  convention. The possible values are `"lowercase"`, `"PascalCase"`,
  `"camelCase"`, `"snake_case"`, `"SCREAMING_SNAKE_CASE"`, `"kebab-case"`.

- ##### `#[serde(skip)]`

  Never serialize or deserialize this variant.

- ##### `#[serde(skip_serializing)]`

  Never serialize this variant. Trying to serialize this variant is treated as
  an error.

- ##### `#[serde(skip_deserializing)]`

  Never deserialize this variant.

- ##### `#[serde(serialize_with = "path")]`

  Serialize this variant using a function that is different from its
  implementation of `Serialize`. The given function must be callable as
  `fn<S>(&FIELD0, &FIELD1, ..., S) -> Result<S::Ok, S::Error> where S:
  Serializer`, although it may also be generic over the `FIELD{n}` types.
  Variants used with `serialize_with` are not required to be able to derive
  `Serialize`.

  `FIELD{n}` exists for every field of the variant. So a unit variant has just
  the `S` argument, and tuple/struct variants have an argument for every field.

- ##### `#[serde(deserialize_with = "path")]`

  Deserialize this variant using a function that is different from its
  implementation of `Deserialize`. The given function must be callable as
  `fn<'de, D>(D) -> Result<FIELDS, D::Error> where D: Deserializer<'de>`,
  although it may also be generic over the elements of `FIELDS`. Variants used
  with `deserialize_with` are not required be able to derive `Deserialize`.

  `FIELDS` is a tuple of all fields of the variant. A unit variant will have
  `()` as its `FIELDS` type.

- ##### `#[serde(with = "module")]`

  Combination of `serialize_with` and `deserialize_with`. Serde will use
  `$module::serialize` as the `serialize_with` function and
  `$module::deserialize` as the `deserialize_with` function.
