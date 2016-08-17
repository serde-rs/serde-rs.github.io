# Codegen targetting stable compiler

The current stable Rust release does not support compiler plugins so Serde
codegen needs to be done through a [Cargo build
script](http://doc.crates.io/build-script.html) along with a code generation
framework called [Syntex](https://github.com/serde-rs/syntex) to generate
`Serialize` and `Deserialize` implementations. This relatively inconvenient
approach will no longer be necessary as Rust's compiler plugin support matures
in the future.

**Advantages of this approach**: supports stable (released) Rust compiler
versions because it does not depend on features that can only be enabled in the
nightly compiler; also works with nightly.

**Disadvantages of this approach**: one-time setup cost of using a build script;
keeping all Serde types in their own `serde_types.rs` file is annoying; the
large Syntex dependency increases compilation time; rustc will show certain
types of compiler errors pointing into the nasty generated code rather than to
where the error really is.

To start with, here is the `Cargo.toml` that informs Cargo about the build
script:

```toml
[package]
name = "my-crate"
version = "0.1.0"
authors = ["Me <user@rust-lang.org>"]
build = "build.rs"

[build-dependencies]
serde_codegen = "0.8"

[dependencies]
serde = "0.8"
serde_json = "0.8"  # just for the example, not required in general
```

Next create a file `src/serde_types.in.rs` to hold all the types for which we
need code generation. No other files should contain `#[derive(Serialize,
Deserialize)]`. Notice the ".in.rs" extension - this is not going to be used
like a normal module.

```rust
#[derive(Serialize, Deserialize, Debug)]
struct Point {
    x: i32,
    y: i32,
}
```

Here is the main code of the program in `src/main.rs`. The only unusual line
here is the `include!` line; everything else is just the rest of your crate as
usual.

```rust
extern crate serde;
extern crate serde_json;

include!(concat!(env!("OUT_DIR"), "/serde_types.rs"));

fn main() {
    let point = Point { x: 1, y: 2 };

    let serialized = serde_json::to_string(&point).unwrap();
    println!("serialized = {}", serialized);

    let deserialized: Point = serde_json::from_str(&serialized).unwrap();
    println!("deserialized = {:?}", deserialized);
}
```

The last step is to drive the code generation using `build.rs`. This file goes
in the same directory as `Cargo.toml`.

```rust
extern crate serde_codegen;

use std::env;
use std::path::Path;
use std::thread;

fn main() {
    thread::spawn(expand).join().unwrap();
}

fn expand() {
    let out_dir = env::var_os("OUT_DIR").unwrap();

    let src = Path::new("src/serde_types.in.rs");
    let dst = Path::new(&out_dir).join("serde_types.rs");

    serde_codegen::expand(&src, &dst).unwrap();
}
```

When run, the output is:

```
$ cargo run
serialized = {"x":1,"y":2}
deserialized = Point { x: 1, y: 2 }
```
