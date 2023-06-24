# Feature flags

The `serde` crate defines some [Cargo features] to enable using Serde in a
variety of freestanding environments.

Building Serde with `default-features = false`, you will receive a stock
`no_std` Serde with no support for any of the collection types.

[Cargo features]: https://doc.rust-lang.org/cargo/reference/manifest.html#the-features-section

#### features = ["derive"] {#derive}

Provide derive macros for the Serialize and Deserialize traits.

This is behind a feature because the derive macro implementation takes some
extra time to compile.

#### features = ["std"] {#std}

*This feature is enabled by default.*

Provide impls for common standard library types like Vec&lt;T&gt; and
HashMap&lt;K, V&gt;. Requires a dependency on the Rust standard library.

See [no-std support] for details.

[no-std support]: no-std.md

#### features = ["unstable"] {#unstable}

Provide impls for types that require unstable functionality. For tracking and
discussion of unstable functionality please refer to [serde-rs/serde#812].

[serde-rs/serde#812]: https://github.com/serde-rs/serde/issues/812

#### features = ["alloc"] {#alloc}

Provide impls for types in the Rust core allocation and collections library
including String, Box&lt;T&gt;, Vec&lt;T&gt;, and Cow&lt;T&gt;. This is a subset
of std but may be enabled without depending on all of std.

Requires a dependency on the [core allocation library].

See [no-std support] for details.

[core allocation library]: https://doc.rust-lang.org/alloc/

#### features = ["rc"] {#rc}

Opt into impls for Rc&lt;T&gt; and Arc&lt;T&gt;. Serializing and deserializing
these types does not preserve identity and may result in multiple copies of the
same data. Be sure that this is what you want before enabling this feature.

Serializing a data structure containing reference-counted pointers will
serialize a copy of the inner value of the pointer each time a pointer is
referenced within the data structure. Serialization will not attempt to
deduplicate these repeated data.

Deserializing a data structure containing reference-counted pointers will not
attempt to deduplicate references to the same data. Every deserialized pointer
will end up with a strong count of 1.
