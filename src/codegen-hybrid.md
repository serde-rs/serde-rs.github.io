# Hybrid codegen approach

The [stable approach](codegen-stable.md) and the [nightly
approach](codegen-nightly.md) both come with significant downsides. This hybrid
approach is similar to the stable approach but enables active development to
happen on nightly in order to receive more useful error messages.

Here is the `Cargo.toml` that depends on `serde_codegen` by default but exposes
a [feature](http://doc.crates.io/manifest.html#the-features-section) to depend
on `serde_macros` instead.

```toml
[package]
name = "testing"
version = "0.1.0"
authors = ["David Tolnay <dtolnay@gmail.com>"]
build = "build.rs"

[features]
default = ["serde_codegen"]
unstable = ["serde_macros"]

[build-dependencies]
serde_codegen = { version = "0.8", optional = true }

[dependencies]
serde = "0.8"
serde_json = "0.8"  # just for the example, not required in general
serde_macros = { version = "0.8", optional = true }
```

The `src/serde_types.in.rs` is the same as in the [stable
approach](codegen-stable.md). This file is the input to the build script and no
other files should contain `#[derive(Serialize, Deserialize)]`.

```rust
#[derive(Serialize, Deserialize, Debug)]
struct Point {
    x: i32,
    y: i32,
}
```

Here is the main code of the program in `src/main.rs`.

```rust
#![cfg_attr(feature = "serde_macros", feature(plugin, custom_derive))]
#![cfg_attr(feature = "serde_macros", plugin(serde_macros))]

extern crate serde;
extern crate serde_json;

#[cfg(feature = "serde_macros")]
include!("serde_types.in.rs");

#[cfg(feature = "serde_codegen")]
include!(concat!(env!("OUT_DIR"), "/serde_types.rs"));

fn main() {
    let point = Point { x: 1, y: 2 };

    let serialized = serde_json::to_string(&point).unwrap();
    println!("serialized = {}", serialized);

    let deserialized: Point = serde_json::from_str(&serialized).unwrap();
    println!("deserialized = {:?}", deserialized);
}
```

And here is `build.rs` which drives the code generation if necessary and
otherwise does nothing, falling back to nightly's support for compiler plugins.
This file goes in the same directory as `Cargo.toml`.

```rust
#[cfg(feature = "serde_codegen")]
fn main() {
    extern crate serde_codegen;

    use std::env;
    use std::path::Path;
    use std::thread;

    fn expand() {
        let out_dir = env::var_os("OUT_DIR").unwrap();

        let src = Path::new("src/serde_types.in.rs");
        let dst = Path::new(&out_dir).join("serde_types.rs");

        serde_codegen::expand(&src, &dst).unwrap();
    }

    thread::spawn(expand).join().unwrap();
}

#[cfg(not(feature = "serde_codegen"))]
fn main() {
    // do nothing
}
```

To build with stable Rust:

```
$ cargo build
```

To build with nightly Rust:

```
$ cargo build --no-default-features --features unstable
```

The nightly compiler will generally produce better error messages so we
recommend doing most of your development that way.
