# Understanding deserializer lifetimes

The [`Deserialize`] and [`Deserializer`] traits both have a lifetime called
`'de`, as do some of the other deserialization-related traits.

[`Deserialize`]: https://docs.serde.rs/serde/trait.Deserialize.html
[`Deserializer`]: https://docs.serde.rs/serde/trait.Deserializer.html

```rust
# extern crate serde;
#
# use serde::Deserializer;
#
trait Deserialize<'de>: Sized {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where D: Deserializer<'de>;
}
#
# fn main() {}
```

This lifetime is what enables Serde to safely perform efficient zero-copy
deserialization across a variety of data formats, something that would be
impossible or recklessly unsafe in languages other than Rust.

```rust
# #![allow(dead_code)]
#
# #[macro_use]
# extern crate serde_derive;
#
#[derive(Deserialize)]
struct User<'a> {
    id: u32,
    name: &'a str,
    screen_name: &'a str,
    location: &'a str,
}
#
# fn main() {}
```

Zero-copy deserialization means deserializing into a data structure, like the
`User` struct above, that borrows string or byte array data from the string or
byte array holding the input. This avoids allocating memory to store a string
for each individual field and then copying string data out of the input over to
the newly allocated field. Rust guarantees that the input data outlives the
period during which the output data structure is in scope, meaning it is
impossible to have dangling pointer errors as a result of losing the input data
while the output data structure still refers to it.

## Trait bounds

There are two main ways to write `Deserialize` trait bounds, whether on an impl
block or a function or anywhere else.

- **`<'de, T> where T: Deserialize<'de>`**

    This means "T can be deserialized from **some** lifetime." The caller gets
    to decide what lifetime that is. Typically this is used when the caller also
    provides the data that is being deserialized from, for example in a function
    like [`serde_json::from_str`]. In that case the input data must also have
    lifetime `'de`, for example it could be `&'de str`.

- **`<T> where T: DeserializeOwned`**

    This means "T can be deserialized from **any** lifetime." The callee gets to
    decide what lifetime. Usually this is because the data that is being
    deserialized from is going to be thrown away before the function returns, so
    T must not be allowed to borrow from it. For example a function that accepts
    base64-encoded data as input, decodes it from base64, deserializes a value
    of type T, then throws away the result of base64 decoding. Another common
    use of this bound is functions that deserialize from an IO stream, such as
    [`serde_json::from_reader`].

    To say it more technically, the [`DeserializeOwned`] trait is equivalent to
    the [higher-rank trait bound] `for<'de> Deserialize<'de>`. The only
    difference is `DeserializeOwned` is more intuitive to read. It means T owns
    all the data that gets deserialized.

[`serde_json::from_str`]: https://docs.serde.rs/serde_json/fn.from_str.html
[`serde_json::from_reader`]: https://docs.serde.rs/serde_json/fn.from_reader.html
[higher-rank trait bound]: https://doc.rust-lang.org/nomicon/hrtb.html

## Transient, borrowed, and owned data

The Serde data model has three flavors of strings and byte arrays during
deserialization. They correspond to different methods on the [`Visitor`] trait.

[`Visitor`]: https://docs.serde.rs/serde/de/trait.Visitor.html

- **Transient** — [`visit_str`] accepts a `&str`.
- **Borrowed** — [`visit_borrowed_str`] accepts a `&'de str`.
- **Owned** — [`visit_string`] accepts a `String`.

[`visit_str`]: https://docs.serde.rs/serde/de/trait.Visitor.html#method.visit_str
[`visit_borrowed_str`]: https://docs.serde.rs/serde/de/trait.Visitor.html#method.visit_borrowed_str
[`visit_string`]: https://docs.serde.rs/serde/de/trait.Visitor.html#method.visit_string

Transient data is not guaranteed to last beyond the method call it is passed to.
Often this is sufficient, for example when deserializing something like an IP
address from a Serde string using the [`FromStr`] trait. When it is not
sufficient, the data can be copied by calling [`to_owned()`]. Deserializers
commonly use transient data when input from an IO stream is being buffered in
memory before being passed to the `Visitor`, or when escape sequences are being
processed so the resulting string is not present verbatim in the input.

[`FromStr`]: https://doc.rust-lang.org/std/str/trait.FromStr.html
[`to_owned()`]: https://doc.rust-lang.org/std/borrow/trait.ToOwned.html

Borrowed data is guaranteed to live at least as long as the `'de` lifetime
parameter of the `Deserializer`. Not all deserializers support handing out
borrowed data. For example when deserializing from an IO stream no data can be
borrowed.

Owned data is guaranteed to live as long as the [`Visitor`] wants it to. Some
visitors benefit from receiving owned data. For example the `Deserialize` impl
for Rust's `String` type benefits from being given ownership of the Serde string
data that has been deserialized.

## The Deserialize&lt;'de&gt; lifetime

This lifetime records the constraints on how long data borrowed by this type
must be valid.

Every lifetime of data borrowed by this type must be a bound on the `'de`
lifetime of its `Deserialize` impl. If this type borrows data with lifetime
`'a`, then `'de` must be constrained to outlive `'a`.

```rust
# #![allow(dead_code)]
#
# trait Deserialize<'de> {}
#
struct S<'a, 'b, T> {
    a: &'a str,
    b: &'b str,
    bb: &'b str,
    t: T,
}

impl<'de: 'a + 'b, 'a, 'b, T> Deserialize<'de> for S<'a, 'b, T>
    where T: Deserialize<'de>
{
    /* ... */
}
#
# fn main() {}
```

If this type does not borrow any data from the `Deserializer`, there are simply
no bounds on the `'de` lifetime. Such types automatically implement the
[`DeserializeOwned`] trait.

[`DeserializeOwned`]: https://docs.serde.rs/serde/de/trait.DeserializeOwned.html

```rust
# #![allow(dead_code)]
#
# pub trait Deserialize<'de> {}
#
struct S {
    owned: String,
}

impl<'de> Deserialize<'de> for S {
    /* ... */
}
#
# fn main() {}
```

The `'de` lifetime **should not** appear in the type to which the `Deserialize`
impl applies.

```diff
- // Do not do this. Sooner or later you will be sad.
- impl<'de> Deserialize<'de> for Q<'de> {

+ // Do this instead.
+ impl<'de: 'a, 'a> Deserialize<'de> for Q<'a> {
```

## The Deserializer&lt;'de&gt; lifetime

This is the lifetime of data that can be borrowed from the `Deserializer`.

```rust
# #![allow(dead_code)]
#
# pub trait Deserializer<'de> {}
#
struct MyDeserializer<'de> {
    input_data: &'de [u8],
    pos: usize,
}

impl<'de> Deserializer<'de> for MyDeserializer<'de> {
    /* ... */
}
#
# fn main() {}
```

If the `Deserializer` never invokes [`visit_borrowed_str`] or
[`visit_borrowed_bytes`], the `'de` lifetime should be unconstrained and should
be named `'x`.

[`visit_borrowed_str`]: https://docs.serde.rs/serde/de/trait.Visitor.html#method.visit_borrowed_str
[`visit_borrowed_bytes`]: https://docs.serde.rs/serde/de/trait.Visitor.html#method.visit_borrowed_bytes

```rust
# #![allow(dead_code)]
#
# use std::io;
#
# pub trait Deserializer<'de> {}
#
struct MyDeserializer<R> {
    read: R,
}

impl<'x, R> Deserializer<'x> for MyDeserializer<R>
    where R: io::Read
{
    /* ... */
}
#
# fn main() {}
```
