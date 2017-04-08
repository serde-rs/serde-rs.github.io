# Implement Serialize for a custom map type

```rust
# extern crate serde;
#
# use std::marker::PhantomData;
#
# struct MyMap<K, V>(PhantomData<K>, PhantomData<V>);
#
# impl<K, V> MyMap<K, V> {
#     fn len(&self) -> usize {
#         unimplemented!()
#     }
# }
#
# impl<'a, K, V> IntoIterator for &'a MyMap<K, V> {
#     type Item = (&'a K, &'a V);
#     type IntoIter = Box<Iterator<Item = (&'a K, &'a V)>>;
#
#     fn into_iter(self) -> Self::IntoIter {
#         unimplemented!()
#     }
# }
#
use serde::ser::{Serialize, Serializer, SerializeMap};

impl<K, V> Serialize for MyMap<K, V>
    where K: Serialize,
          V: Serialize
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
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
#
# fn main() {}
```
