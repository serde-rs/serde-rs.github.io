# Attributes

[Attributes] are used to customize the `Serialize` and `Deserialize`
implementations produced by Serde's derive. They require a Rust compiler version
1.15 or newer.

[Attributes]: https://doc.rust-lang.org/book/attributes.html

There are three categories of attributes:

- [**Container attributes**] — apply to a struct or enum declaration.
- [**Variant attributes**] — apply to a variant of an enum.
- [**Field attributes**] — apply to one field in a struct or in an enum variant.

[**Container attributes**]: container-attrs.md
[**Variant attributes**]: variant-attrs.md
[**Field attributes**]: field-attrs.md

```rust
# use serde::{Serialize, Deserialize};
#
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
#
# fn main() {}
```

Note that a single struct, enum, variant, or field may have multiple attributes
on it.
