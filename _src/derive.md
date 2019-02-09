# Using derive

Serde provides a derive macro to generate implementations of the `Serialize` and
`Deserialize` traits for data structures defined in your crate, allowing them to
be represented conveniently in all of Serde's data formats.

**You only need to set this up if your code is using `#[derive(Serialize,
Deserialize)]`.**

This functionality is based on Rust's `#[derive]` mechanism, just like what you
would use to automatically derive implementations of the built-in `Clone`,
`Copy`, `Debug`, or other traits. It is able to generate implementations for
most structs and enums including ones with elaborate generic types or trait
bounds. On rare occasions, for an especially convoluted type you may need to
[implement the traits manually](custom-serialization.md).

These derives require a Rust compiler version 1.15 or newer.

!CHECKLIST
- Add `serde = { version = "1.0", features = ["derive"] }` as a dependency in
  Cargo.toml.
- Ensure that all other Serde-based dependencies (for example serde_json) are on
  a version that is compatible with serde 1.0.
- On structs and enums that you want to serialize, import the derive macro as
  `use serde::Serialize;` within the same module and write
  `#[derive(Serialize)]` on the struct or enum.
- Similarly import `use serde::Deserialize;` and write `#[derive(Deserialize)]`
  on structs and enums that you want to deserialize.

Here is the `Cargo.toml`:

!FILENAME Cargo.toml
```toml
[package]
name = "my-crate"
version = "0.1.0"
authors = ["Me <user@rust-lang.org>"]

[dependencies]
serde = { version = "1.0", features = ["derive"] }

# serde_json is just for the example, not required in general
serde_json = "1.0"
```

Now the `src/main.rs` which uses Serde's custom derives:

!FILENAME src/main.rs
!PLAYGROUND 1dbc76000e9875fac72c2865748842d7
```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let point = Point { x: 1, y: 2 };

    let serialized = serde_json::to_string(&point).unwrap();
    println!("serialized = {}", serialized);

    let deserialized: Point = serde_json::from_str(&serialized).unwrap();
    println!("deserialized = {:?}", deserialized);
}
```

Here is the output:

```
$ cargo run
serialized = {"x":1,"y":2}
deserialized = Point { x: 1, y: 2 }
```

### Troubleshooting

Sometimes you may see compile-time errors that tell you:

```
the trait `serde::ser::Serialize` is not implemented for `...`
```

even though the struct or enum clearly has `#[derive(Serialize)]` on it.

This almost always means that you are using libraries that depend on
incompatible versions of Serde. You may be depending on serde 1.0 and
serde_derive 1.0 in your Cargo.toml but using some other library that depends on
serde 0.9. So the `Serialize` trait from serde 1.0 may be implemented, but the
library expects an implementation of the `Serialize` trait from serde 0.9. From
the Rust compiler's perspective these are totally different traits.

The fix is to upgrade or downgrade libraries as appropriate until the Serde
versions match. The [`cargo tree -d`] command is helpful for finding all the
places that duplicate dependencies are being pulled in.

[`cargo tree -d`]: https://github.com/sfackler/cargo-tree
