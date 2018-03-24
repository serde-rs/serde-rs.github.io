# Feature flags

The `serde` crate defines some [Cargo features] to enable using Serde in a
variety of freestanding environments.

Building Serde with `default-features = false`, you will receive a stock
`no_std` Serde with no support for any of the collection types.

[Cargo features]: https://doc.rust-lang.org/cargo/reference/manifest.html#the-features-section

#### --feature derive

Re-export the derive(Serialize, Deserialize) macros. This is specifically
intended for library crates that provide optional Serde impls behind a Cargo cfg
of their own. All other crates should depend on serde_derive directly.

Please refer to the long comment above the line `pub use serde_derive::*` in
src/lib.rs before enabling this feature. If you think you need this feature and
your use case does not precisely match the one described in the comment, please
open an issue to let us know about your use case.

#### --feature std

*This feature is enabled by default.*

Provide impls for common standard library types like Vec&lt;T&gt; and
HashMap&lt;K, V&gt;. Requires a dependency on the Rust standard library.

See [no-std support] for details.

[no-std support]: no-std.md

#### --feature unstable

Provide impls for types that require unstable functionality. For tracking and
discussion of unstable functionality please refer to [this issue].

[this issue]: https://github.com/serde-rs/serde/issues/812

#### --features alloc

*Implies unstable.*

Provide impls for types in the Rust core allocation and collections library
including String, Box&lt;T&gt;, Vec&lt;T&gt;, and Cow&lt;T&gt;. This is a subset
of std but may be enabled without depending on all of std.

Requires a dependency on the unstable [core allocation library].

See [no-std support] for details.

[core allocation library]: https://doc.rust-lang.org/alloc/

#### --features rc

Opt into impls for Rc&lt;T&gt; and Arc&lt;T&gt;. Serializing and deserializing
these types does not preserve identity and may result in multiple copies of the
same data. Be sure that this is what you want before enabling this feature.
