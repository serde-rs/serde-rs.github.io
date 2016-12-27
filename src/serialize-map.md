# Implement Serialize for a custom map type

```rust
impl<K, V> Serialize for MyMap<K, V>
    where K: Serialize,
          V: Serialize
{
    fn serialize<S>(&self, serializer: &mut S) -> Result<(), S::Error>
        where S: Serializer
    {
        let mut state = serializer.serialize_map(Some(self.len()))?;
        for (k, v) in self {
            serializer.serialize_map_key(&mut state, k)?;
            serializer.serialize_map_value(&mut state, v)?;
        }
        serializer.serialize_map_end(state)
    }
}
```
