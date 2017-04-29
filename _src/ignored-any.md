# Discarding data

The [`IgnoredAny`] type gives an efficient way of discarding data from a
deserializer.

[`IgnoredAny`]: https://docs.serde.rs/serde/de/struct.IgnoredAny.html

Think of this like `serde_json::Value` in that it can be deserialized from
any type, except that it does not store any information about the data that
gets deserialized.

```rust
extern crate serde;

#[macro_use]
extern crate serde_json;

use std::fmt;
use std::marker::PhantomData;

use serde::de::{self, Deserialize, DeserializeSeed, Deserializer, Visitor, SeqAccess, IgnoredAny};

// A seed that can be used to deserialize only the `n`th element of a sequence
// while efficiently discarding elements of any type before or after index `n`.
//
// For example to deserialize only the element at index 3:
//
//    NthElement::new(3).deserialize(deserializer)
pub struct NthElement<T> {
    n: usize,
    marker: PhantomData<T>,
}

impl<T> NthElement<T> {
    pub fn new(n: usize) -> Self {
        NthElement {
            n: n,
            marker: PhantomData,
        }
    }
}

impl<'de, T> Visitor<'de> for NthElement<T>
    where T: Deserialize<'de>
{
    type Value = T;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        write!(formatter, "a sequence in which we care about element {}", self.n)
    }

    fn visit_seq<V>(self, mut seq: V) -> Result<Self::Value, V::Error>
        where V: SeqAccess<'de>
    {
        // Skip over the first `n` elements.
        for i in 0..self.n {
            // It is an error if the sequence ends before we get to element `n`.
            if seq.next_element::<IgnoredAny>()?.is_none() {
                return Err(de::Error::invalid_length(i, &self));
            }
        }

        // Deserialize the one we care about.
        let nth = seq.next_element()?
                     .ok_or_else(|| de::Error::invalid_length(self.n, &self))?;

        // Skip over any remaining elements in the sequence after `n`.
        while let Some(IgnoredAny) = seq.next_element()? {
            // ignore
        }

        Ok(nth)
    }
}

impl<'de, T> DeserializeSeed<'de> for NthElement<T>
    where T: Deserialize<'de>
{
    type Value = T;

    fn deserialize<D>(self, deserializer: D) -> Result<Self::Value, D::Error>
        where D: Deserializer<'de>
    {
        deserializer.deserialize_seq(self)
    }
}

fn main() {
    let array = json!(["a", "b", "c", "d", "e"]);

    let nth: String = NthElement::new(3).deserialize(&array).unwrap();

    println!("{}", nth);
    assert_eq!(nth, array[3]);
}
```
