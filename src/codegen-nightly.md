# Codegen targetting nightly compiler

The [codegen setup for a stable compiler](codegen-stable.md) is more complicated
than it needs to be due to custom derives being unstable in the current version
of Rust. However if you are using a nightly compiler anyway, you can use
`serde_derive` which has a much simpler interface. This is a preview of what
the future will look like once custom derives are stabilized.

**Advantages of this approach**: trivial to set up - just a `#![feature(...)]`
line and an extern crate; none of the disadvantages of the [stable
approach](codegen-stable.md).

**Disadvantages of this approach**: depends on an unstable Rust feature so it
only works if you are building with a nightly compiler; this feature will be
stabilized in Rust 1.15 in February 2017; stabilization is tracked in
[rust-lang/rust#35900](https://github.com/rust-lang/rust/issues/35900).

Here is the `Cargo.toml`:

```toml:Cargo.toml
[package]
name = "my-crate"
version = "0.1.0"
authors = ["Me <user@rust-lang.org>"]

[dependencies]
serde = "0.8"
serde_derive = "0.8"
serde_json = "0.8"  # just for the example, not required in general
```

Note that it does not need a build script. Now the `src/main.rs` which enables
the unstable `proc_macro` feature and sets up Serde's custom derive:

```rust:src/main.rs
#![feature(proc_macro)]

#[macro_use]
extern crate serde_derive;

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
