# Variant attributes

- ##### `#[serde(rename = "name")]`

  Serialize and deserialize this variant with the given name instead of its Rust
  name.

- ##### `#[serde(rename_all = "...")]`

  Rename all the fields of this struct variant according to the given case
  convention. The possible values are `"lowercase"`, `"PascalCase"`,
  `"camelCase"`, `"snake_case"`, `"SCREAMING_SNAKE_CASE"`, `"kebab-case"`.

- ##### `#[serde(skip_serializing)]`

  Never serialize this variant, fail if it tries to be serialized.

- ##### `#[serde(skip_deserializing)]`

  Never deserialize this variant.
