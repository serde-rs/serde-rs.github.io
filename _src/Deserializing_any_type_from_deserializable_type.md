# (De)serializing any type from a (de)serializable type

Sometime it's practical to (de)serialize a field of a type that does not implement (de)serialize itself from a field that does.

Example:

```rust
use std::sync::atomic::AtomicU64;
use serde::Deserializer;

fn deserialize_atomic_u64<'de, D>(deserializer: D) -> Result<T, D::Error> where D: Deserializer<'de> {
    // Note: Option<u64> implements Deserialize, so we can just tell serde to deserialize an Option<u64> and use the result
    let value = Option::<u64>::deserialize(deserializer)?;
    AtomicU64::new(value.unwrap_or_default())
}

# #[allow(dead_code)]
struct Foo {
    // Note: the same trick works for serialize_with as well
    #[serde(deserialize_with="deserialize_atomic_u64")]
    atomic: AtomicU64,
}
#
# fn main() {}
```
