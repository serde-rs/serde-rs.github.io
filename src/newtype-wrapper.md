# Implement De/Serialize for type in a different crate

Rust's
[coherence rule](https://doc.rust-lang.org/book/traits.html#rules-for-implementing-traits)
requires that either the trait or the type for which you are implementing the
trait must be defined in the same crate as the impl, so it
is not possible to implement Serialize and Deserialize for a type in a different
crate directly. The
[newtype pattern](https://doc.rust-lang.org/book/structs.html#tuple-structs)
and
[Deref coercion](https://doc.rust-lang.org/book/deref-coercions.html)
provide a way to implement Serialize and Deserialize for a type that behaves the
same way as the one you wanted.

```rust
use serde::{Serialize, Serializer, Deserialize, Deserializer};
use std::ops::Deref;

// Pretend this module is from some other crate.
mod not_my_crate {
    pub struct Data { /* ... */ }
}

// This single-element tuple struct is called a newtype struct.
struct Data(not_my_crate::Data);

impl Serialize for Data {
    fn serialize<S>(&self, serializer: &mut S) -> Result<(), S::Error>
        where S: Serializer
    {
        // Any implementation of Serialize.
    }
}

impl Deserialize for Data {
    fn deserialize<D>(deserializer: &mut D) -> Result<Self, D::Error>
        where D: Deserializer
    {
        // Any implementation of Deserialize.
    }
}

// Enable `Deref` coercion.
impl Deref for Data {
    type Target = not_my_crate::Data;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

// Now `Data` can be used in ways that require it to implement
// Serialize and Deserialize.
#[derive(Serialize, Deserialize)]
struct Outer {
    id: u64,
    name: String,
    data: Data,
}
```
