# Technical details

### Syntex

Serde's [stable code generation](https://serde.rs/codegen-stable.html) is built
on a library called [Syntex](https://github.com/serde-rs/syntex). Syntex is a
registry of expansion operations along with the Rust compiler infrastructure to
apply those expansions to a piece of source code. This involves parsing Rust
source code, applying the expansions, and writing the expanded Rust code out to
a file as part of a Cargo [build
script](http://doc.crates.io/build-script.html).

The Rust compiler uses a private library called
[`libsyntax`](https://github.com/rust-lang/rust/tree/master/src/libsyntax) to
parse source code during ordinary compilation. There is a way to hook into
libsyntax from a crate but only when using a nightly compiler:
`#![feature(rustc_private)]`. Syntex therefore copies the entire libsyntax
library into a crate called
[`syntex_syntax`](https://crates.io/crates/syntex_syntax), backporting the
nightly compiler's parser so it can be used on older stable compilers. This copy
of libsyntax accounts for the slow compilation associated with Syntex, typically
around 60 seconds when building from scratch.

Syntex expansion has two main limitations:

- Certain types of compiler errors will be reported as occuring within the nasty
  generated code rather than the original source code, even if the problem is
  present in the original.
- Syntex is not able to expand macros it is responsible for inside of macros it
  is not responsible for (including built-in macros like `vec![]` and
  `println!()`). This does not apply to Serde which uses Syntex to expand
  `#[derive]` attributes only, but other Syntex-based
  [procedural macro](https://doc.rust-lang.org/book/compiler-plugins.html#syntax-extensions)
  libraries may run into this.
