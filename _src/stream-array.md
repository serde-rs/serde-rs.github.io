# Process an array of values without buffering into a Vec

Suppose we have an array of integers and we want to figure out the maximum value
without holding the whole array in memory all at once. This approach can be
adapted to handle a variety of other situations in which data needs to be
processed while being deserialized instead of after.

!PLAYGROUND d35e2dd6160991bc2f1c80e3519ccf73
```rust
#[macro_use]
extern crate serde_derive;

extern crate serde;
extern crate serde_json;
use serde::de::{self, Deserialize, Deserializer, Visitor, SeqAccess};

use std::{cmp, fmt};
use std::marker::PhantomData;

#[derive(Deserialize)]
struct Outer {
    # #[allow(dead_code)]
    id: String,

    // Deserialize this field by computing the maximum value of a sequence
    // (JSON array) of values.
    #[serde(deserialize_with = "deserialize_max")]
    // Despite the struct field being named `max_value`, it is going to come
    // from a JSON field called `values`.
    #[serde(rename(deserialize = "values"))]
    max_value: u64,
}

/// Deserialize the maximum of a sequence of values. The entire sequence
/// is not buffered into memory as it would be if we deserialize to Vec<T>
/// and then compute the maximum later.
///
/// This function is generic over T which can be any type that implements
/// Ord. Above, it is used with T=u64.
fn deserialize_max<'de, T, D>(deserializer: D) -> Result<T, D::Error>
where
    T: Deserialize<'de> + Ord,
    D: Deserializer<'de>,
{
    struct MaxVisitor<T>(PhantomData<fn() -> T>);

    impl<'de, T> Visitor<'de> for MaxVisitor<T>
    where
        T: Deserialize<'de> + Ord,
    {
        /// Return type of this visitor. This visitor computes the max of a
        /// sequence of values of type T, so the type of the maximum is T.
        type Value = T;

        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("a nonempty sequence of numbers")
        }

        fn visit_seq<S>(self, mut seq: S) -> Result<T, S::Error>
        where
            S: SeqAccess<'de>,
        {
            // Start with max equal to the first value in the seq.
            let mut max = seq.next_element()?.ok_or_else(||
                // Cannot take the maximum of an empty seq.
                de::Error::custom("no values in seq when looking for maximum")
            )?;

            // Update the max while there are additional values.
            while let Some(value) = seq.next_element()? {
                max = cmp::max(max, value);
            }

            Ok(max)
        }
    }

    // Create the visitor and ask the deserializer to drive it. The
    // deserializer will call visitor.visit_seq() if a seq is present in
    // the input data.
    let visitor = MaxVisitor(PhantomData);
    deserializer.deserialize_seq(visitor)
}

fn main() {
    let j = r#"
        {
          "id": "demo-deserialize-max",
          "values": [
            256,
            100,
            384,
            314,
            271
          ]
        }
    "#;

    let out: Outer = serde_json::from_str(j).unwrap();

    // Prints "max value: 384"
    println!("max value: {}", out.max_value);
}
```
