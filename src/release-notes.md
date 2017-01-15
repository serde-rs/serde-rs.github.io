# Release notes

## v0.8.22

- Remove `#![feature(proc_macro)]` feature gates to support serde_derive on the
  beta channel!
- Support deserializing a
  [`ByteBuf`](https://docs.serde.rs/serde/bytes/struct.ByteBuf.html) from a
  string ([#645](https://github.com/serde-rs/serde/pull/645))

## v0.8.21

- Implement skip_serializing for enum variants
  ([#653](https://github.com/serde-rs/serde/pull/653), thanks @shinglyu)

  ```rust
  #[derive(Serialize)]
  enum E {
      A(bool),
      B(String),
      #[serde(skip_serializing)]
      C(NotSerializable),
  }
  ```

  Serialization will fail with a message if that particular variant is the one
  being serialized.

  > "The enum variant E::C cannot be serialized"

## v0.8.20

- Implement skip_deserializing for enum variants
  ([#641](https://github.com/serde-rs/serde/pull/641), thanks @shinglyu)

  ```rust
  #[derive(Deserialize)]
  enum E {
      A(bool),
      B(String),
      #[serde(skip_deserializing)]
      C(NotDeserializable),
  }
  ```

## v0.8.19

*Support for rustc 1.15.0-nightly (7b3eeea22 2016-11-21)*

## v0.8.18

*Support for rustc 1.15.0-nightly (ac635aa95 2016-11-18)*

## v0.8.17

*Support for rustc 1.14.0-nightly (7c69b0d5a 2016-11-01)*

## v0.8.16

- Fix possible warning when building with `#![warn(unused_results)]`
  ([#599](https://github.com/serde-rs/serde/pull/599), thanks @TheCatPlusPlus)

## v0.8.15

- Use [post-expansion](https://github.com/dtolnay/post-expansion) tricks to make
  serde attributes available to other custom derives  like
  [elastic_types_derive](https://github.com/elastic-rs/elastic-types)
  ([#592](https://github.com/serde-rs/serde/pull/592))

## v0.8.14

- Fix corrupted deserialization code being generated randomly when using
  serde_codegen (did not affect serde_derive)
  [#590](https://github.com/serde-rs/serde/issues/590)

## v0.8.13

- The empty array `[T; 0]` now supports deserializing from formats that handle
  fixed-sized arrays only ([#582](https://github.com/serde-rs/serde/issues/582))
- The empty array `[T; 0]` no longer requires `T: Default` in order to
  deserialize ([#583](https://github.com/serde-rs/serde/issues/583))

## v0.8.12

- Update the serde_derive crate type from "rustc-macro" to "proc-macro" to match
  the blanket rename in Rust (https://github.com/rust-lang/rust/pull/36945).
  Rustc 1.14.0-nightly (6e8f92f11 2016-10-07) is the first version containing
  the rename.

## v0.8.11

- Impl `Serialize` and `Deserialize` for
  [`IpAddr`](https://doc.rust-lang.org/std/net/enum.IpAddr.html) without
  requiring the `unstable` feature
  ([#568](https://github.com/serde-rs/serde/pull/568))

## v0.8.10

**This release deprecates the old Serde compiler plugin `serde_macros` in favor of the [Macros 1.1](https://github.com/rust-lang/rfcs/blob/master/text/1681-macros-1.1.md)-based implementation [`serde_derive`](https://crates.io/crates/serde_derive).**

We do not intend to release any further version of `serde_macros`, not even to fix breakage in future nightly versions. The design of Macros 1.1 is such that we do not expect to see the regular breakage with `serde_derive` that we used to see with `serde_macros`, as it depends on a far more limited set of unstable compiler internals.

See https://serde.rs/codegen-nightly.html for steps to set up `serde_derive`, or https://serde.rs/codegen-hybrid.html for steps to set up a hybrid `serde_codegen`/`serde_derive` approach that works on stable.

### Old approach

```toml
[dependencies]
serde_macros = "0.8"
```

```rust
#![feature(plugin, custom_derive)]
#![plugin(serde_macros)]
```

### New approach

```toml
[dependencies]
serde_derive = "0.8"
```

```rust
#![feature(rustc_macro)]

#[macro_use]
extern crate serde_derive;

// everything else is the same
```

## v0.8.9

*Support for rustc 1.13.0-nightly (1265cbf4e 2016-09-15)*

## v0.8.8

- Fix faulty generated code when using a `serialize_with` field attribute along
  with a nonstandard `Result` type in the same module
  ([#546](https://github.com/serde-rs/serde/pull/546))

## v0.8.7

- Add a `forward_to_deserialize!` macro to simplify JSON-like `Deserializer`
  implementations that want to ignore type hints given by `Deserialize`
  ([#525](https://github.com/serde-rs/serde/pull/525))

    ```rust
    impl Deserializer for MyDeserializer {
        fn deserialize<V>(&mut self, visitor: V) -> Result<V::Value, Self::Error>
            where V: Visitor
        {
            /* ... */
        }

        forward_to_deserialize! {
            bool usize u8 u16 u32 u64 isize i8 i16 i32 i64 f32 f64 char str string
            unit option seq seq_fixed_size bytes map unit_struct newtype_struct
            tuple_struct struct struct_field tuple enum ignored_any
        }
    }
    ```

- Add constructors for the `Bytes` and `ByteBuf` helpers
  ([#520](https://github.com/serde-rs/serde/pull/520))
- Allow `MapDeserializer` to be deserialized as a sequence of pairs instead of a
  map ([#527](https://github.com/serde-rs/serde/pull/527))
- Fix warnings in generated code for a non-unit struct with no fields
  ([#536](https://github.com/serde-rs/serde/pull/536))
- Minor cleanup of generated serialization code
  ([#538](https://github.com/serde-rs/serde/pull/538))

## v0.8.6

- Add a `serde_derive` crate which provides a  [Macros
  1.1](https://github.com/rust-lang/rfcs/blob/master/text/1681-macros-1.1.md)
  implementation of `#[derive(Serialize, Deserialize)]`
  ([#530](https://github.com/serde-rs/serde/pull/530))
- Add `serde_codegen::expand_str` which is necessary for Macros 1.1

Using Macros 1.1 requires rustc support (not in nightly yet but available in
https://github.com/rust-lang/rust/pull/35957) and cargo support (available in
https://github.com/rust-lang/cargo/pull/3064). Using Macros 1.1 looks like this:

**Cargo.toml**

```rust
[dependencies]
serde = "0.8"
serde_derive = "0.8"
```

**src/main.rs**

```rust
#![feature(rustc_macro)]

#[macro_use]
extern crate serde_derive;

#[derive(Serialize, Deserialize)]
struct ItWorks {
    exciting: bool,
}
```

Advantages of this approach:

- We expect Macros 1.1 to be stabilized much sooner than the features that
  serde_macros relies on, so we are finally in sight of having ergonomic Serde
  code generation available on stable Rust.
- Even on nightly Rust, serde_derive is built in a way that is much more stable
  than serde_macros. It will not be affected by breaking libsyntax changes in
  the nightly compiler.

## v0.8.5

*Support for rustc 1.13.0-nightly (eac41469d 2016-08-30)*

## v0.8.4

- Implement ValueDeserializer for `Cow<str>`
  ([#513](https://github.com/serde-rs/serde/pull/513))
- Support maps of unknown size in MapDeserializer
  ([#514](https://github.com/serde-rs/serde/pull/514))

## v0.8.3

- Fixes codegen for structs that have a lifetime parameter but no generic type
  parameter ([#507](https://github.com/serde-rs/serde/issues/507))

## v0.8.2

- Using Syntex, `serde_codegen::expand` now runs with a 16 MB stack by default
  because the previous default was often insufficient
  ([#494](https://github.com/serde-rs/serde/issues/494),
  [#503](https://github.com/serde-rs/serde/pull/503))

## v0.8.1

- Impl Serialize and Deserialize for std::time::Duration
  ([#476](https://github.com/serde-rs/serde/pull/476))
- Use a thread in the build script of serde_codegen to allow env vars to control
  the stack size ([#488](https://github.com/serde-rs/serde/pull/488))

## v0.8.0

*This release contains significant breaking changes compared to v0.7.x.*

#### Traits

- The Serializer trait has been modified to allow for streaming serialization -
  serializing seq and map elements before knowing what the end of the seq or map
  will be. ([#437](https://github.com/serde-rs/serde/pull/437))
- Reduced boilerplate (no more SeqVisitor and MapVisitor) when implementing Serialize for most types.
    ```rust
    // OLD API
    struct MySeqVisitor { /* ... */ }
    impl /* pages of boilerplate */
    try!(serializer.serialize_seq(MySeqVisitor::new(iter, len)));

    // NEW API
    let mut state = try!(serializer.serialize_seq(len));
    for e in iter {
        try!(serializer.serialize_seq_elt(&mut state, e));
    }
    try!(serializer.serialize_seq_end(state));
    ```

- The Serializer and Deserializer traits no longer provide default
  implementations for any methods. The old defaults were JSON-centric and
  inappropriate for most other formats. Every Serializer and Deserializer should
  mindfully implement all of the methods.
  ([#437](https://github.com/serde-rs/serde/pull/437),
  [#452](https://github.com/serde-rs/serde/pull/452))

#### Codegen

- No more public dependency on Syntex. The `serde_codegen::register` function
  which was deprecated in
  [v0.7.9](https://github.com/serde-rs/serde/releases/tag/v0.7.9) has been
  removed. Users should use `serde_codegen::expand`. See the readme for sample
  code, and see [this forum
  topic](https://users.rust-lang.org/t/here-is-how-to-avoid-being-broken-by-syntex-updates/6189?u=dtolnay)
  for exposition. ([#445](https://github.com/serde-rs/serde/pull/445))
- Adjusted heuristic for generating bounds on generic type parameters
  ([#456](https://github.com/serde-rs/serde/pull/456)). This fixes a number of
  issues relating to bounds on recursive types, bounds involving references, and
  bounds involving private types
  ([#435](https://github.com/serde-rs/serde/issues/435),
  [#436](https://github.com/serde-rs/serde/issues/436),
  [#441](https://github.com/serde-rs/serde/issues/441),
  [#443](https://github.com/serde-rs/serde/issues/443))

#### Impls

- The Deserialize impl for `PhantomData<T>` has been expanded to all `T`, not
  just `T: Deserialize` ([#457](https://github.com/serde-rs/serde/pull/457),
  [#459](https://github.com/serde-rs/serde/pull/459))
- Add Deserialize impl for `Box<str>`
  ([#454](https://github.com/serde-rs/serde/pull/454))

#### Nightly

- The `nightly` feature has been renamed to `unstable` to align with community
  practices. ([#404](https://github.com/serde-rs/serde/issues/404))
