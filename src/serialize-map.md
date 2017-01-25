# Implement Serialize for a custom map type

```rust
impl<K, V> Serialize for MyMap<K, V>
    where K: Serialize,
          V: Serialize
{
    fn serialize<S>(&self, serializer: S) -> Result<(), S::Error>
        where S: Serializer
    {
        let mut map = serializer.serialize_map(Some(self.len()))?;
        for (k, v) in self {
            map.serialize_key(k)?;
            map.serialize_value(v)?;
        }
        map.end()
    }
}
```
