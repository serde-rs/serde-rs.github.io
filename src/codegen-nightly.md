# Codegen targetting nightly compiler

The [codegen setup for a stable compiler](codegen-stable.md) is more complicated
than it needs to be due to compiler plugins being unstable in the current
version of Rust. However if you are using a nightly compiler anyway, you can
use `serde_macros` which has a much simpler interface. This is a preview of what
the future will look like once compiler plugins are stabilized.

**Advantages of this approach**: trivial to set up - basically just two
`#![...]` lines; none of the disadvantages of the [stable
approach](codegen-stable.md).

**Disadvantages of this approach**: depends on unstable Rust features so it only
works if you are building with a nightly compiler.

Here is the `Cargo.toml`:

```toml:Cargo.toml
[package]
name = "my_crate"
version = "0.1.0"
authors = ["Me <user@rust-lang.org>"]

[dependencies]
serde = "0.8"
serde_json = "0.8"  # just for the example, not required in general
serde_macros = "0.8"
```

Note that it does not need a build script. Now the `src/main.rs` which enables
the plugin feature and registers the `serde_macros` plugin:

```rust:src/main.rs
#![feature(plugin, custom_derive)]
#![plugin(serde_macros)]

extern crate serde_json;

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
