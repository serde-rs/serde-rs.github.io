# Borrowing data

Fields of type `&str` and `&[u8]` are implicitly borrowed from the input data by
Serde. Any other type of field can opt in to borrowing by using the
`#[serde(borrow)]` attribute.

```rust
# #![allow(dead_code)]
#
extern crate serde;

#[macro_use]
extern crate serde_derive;

use std::borrow::Cow;

#[derive(Deserialize)]
struct Inner<'a, 'b> {
    // &str and &[u8] are implicitly borrowed.
    username: &'a str,

    // Other types must be borrowed explicitly.
    #[serde(borrow)]
    comment: Cow<'b, str>,
}

#[derive(Deserialize)]
struct Outer<'a, 'b, 'c> {
    owned: String,

    #[serde(borrow)]
    inner: Inner<'a, 'b>,

    // This field is never borrowed.
    not_borrowed: Cow<'c, str>,
}
#
# fn main() {}
```

This attribute works by placing bounds on the [`'de` lifetime] of the generated
`Deserialize` impl. For example the impl for the struct `Outer` defined above
looks like this:

[`'de` lifetime]: lifetimes.md

```rust
# #![allow(dead_code)]
#
# use std::borrow::Cow;
#
# trait Deserialize<'de> {}
#
# struct Inner<'a, 'b> {
#     username: &'a str,
#     comment: Cow<'b, str>,
# }
#
# struct Outer<'a, 'b, 'c> {
#     owned: String,
#     inner: Inner<'a, 'b>,
#     not_borrowed: Cow<'c, str>,
# }
#
// The lifetimes 'a and 'b are borrowed while 'c is not.
impl<'de: 'a + 'b, 'a, 'b, 'c> Deserialize<'de> for Outer<'a, 'b, 'c> {
    /* ... */
}
#
# fn main() {}
```

The attribute may specify explicitly which lifetimes should be borrowed.

```rust
# #![allow(dead_code)]
#
# #[macro_use]
# extern crate serde_derive;
#
use std::marker::PhantomData;

// This struct borrows the first two lifetimes but not the third.
#[derive(Deserialize)]
struct Three<'a, 'b, 'c> {
    a: &'a str,
    b: &'b str,
    c: PhantomData<&'c str>,
}

#[derive(Deserialize)]
struct Example<'a, 'b, 'c> {
    // Borrow 'a and 'b only, not 'c.
    #[serde(borrow = "'a + 'b")]
    three: Three<'a, 'b, 'c>,
}
#
# fn main() {}
```
