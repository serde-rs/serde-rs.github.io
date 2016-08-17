# Setting up codegen

Serde provides a Rust compiler plugin to generate implementations of the
`Serialize` and `Deserialize` traits for structs defined in your crate, allowing
them to be used conveniently with all of Serde's data formats.

Codegen is based on Rust's `#[derive]` mechanism, just like what you would use
to automatically derive implementations of the built-in `Clone`, `Copy`, or
`Debug` traits. It is able to generate implementations for most structs
including ones with elaborate generic types or trait bounds. On rare occasions,
for an especially convoluted type you may need to implement Deserialize
manually.

There are two different ways of setting up the plugin depending on whether your
crate will be used with stable released versions of Rust or with unstable
nightly versions. The approach intended for the nightly compiler takes advantage
of Rust's experimental support for compiler plugins which can only be enabled on
nightly: `#![feature(plugin)]`. The approach intended for the stable compiler
instead uses a code generation library called
[Syntex](https://github.com/serde-rs/syntex) and a [Cargo build
script](http://doc.crates.io/build-script.html) to write out the generated code
to a file and include it into your crate.

There is also a third hybrid approach which uses Syntex by default but uses a
Cargo [feature](http://doc.crates.io/manifest.html#the-features-section) to
switch to the real plugin when running with nightly.

One downside of the Syntex (stable) approach is that errors and warnings emitted
by `rustc` will point into the nasty generated code and they can be difficult to
trace back to the true source of the problem. We recommend setting up the hybrid
approach but doing your primary development and debugging using a nightly
compiler.

* [Codegen targetting stable compiler](codegen-stable.md)
* [Codegen targetting nightly compiler](codegen-nightly.md)
* [Supporting both stable and nightly](codegen-hybrid.md)
