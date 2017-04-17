# Feature flags

### Using in `no_std` crates

The core `serde` package defines a number of [Cargo
features](http://doc.crates.io/manifest.html#the-features-section) to enable
usage in a variety of freestanding environments. Enable any or none of the
following features, and use `default-features = false` in your `Cargo.toml`:

- `alloc` (implies `nightly`)
- `collections` (implies `alloc` and `nightly`)
- `std` (default)

If you only use `default-features = false`, you will receive a stock `no_std`
Serde with no support for any of the collection types.
