# Unit testing

The [`serde_test`](https://docs.serde.rs/serde_test/) crate provides a
convenient concise way to write unit tests for implementations of `Serialize`
and `Deserialize`.

The `Serialize` impl for a value can be characterized by the sequence of
[`Serializer`](https://docs.serde.rs/serde/ser/trait.Serializer.html) calls that
are made in the course of serializing the value, so `serde_test` provides a
[`Token`](https://docs.serde.rs/serde_test/enum.Token.html) abstraction which
corresponds roughly to `Serializer` method calls. It provides an
`assert_ser_tokens` funtion to test that a value serializes into a particular
sequence of method calls, an `assert_de_tokens` function to test that a value
can be deserialized from a particular sequence of method calls, and an
`assert_tokens` function to test both directions. It also provides functions to
test expected failure conditions.

Here is an example from the
[`linked-hash-map`](https://github.com/contain-rs/linked-hash-map) crate.

```rust
# extern crate serde;
#
extern crate linked_hash_map;
# #[allow(unused_imports)]
use linked_hash_map::LinkedHashMap;

extern crate serde_test;
#
# mod test {
#     use std::fmt;
#     use std::marker::PhantomData;
#
#     use serde::ser::{Serialize, Serializer, SerializeMap};
#     use serde::de::{Deserialize, Deserializer, Visitor, MapAccess};
#
use serde_test::{Token, assert_tokens};
#
#     // The version of linked-hash-map used by yaml-rust is not compatible
#     // with Serde 0.9, and Skeptic tests cannot have more than one version
#     // of any dependency. Reimplement a dumb immitation here.
#     #[derive(PartialEq, Debug)]
#     struct LinkedHashMap<K, V>(Vec<(K, V)>);
#
#     impl<K, V> LinkedHashMap<K, V> {
#         fn new() -> Self {
#             LinkedHashMap(Vec::new())
#         }
#
#         fn insert(&mut self, k: K, v: V) {
#             self.0.push((k, v));
#         }
#     }
#
#     impl<K, V> Serialize for LinkedHashMap<K, V>
#         where K: Serialize,
#               V: Serialize
#     {
#         fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
#             where S: Serializer
#         {
#             let mut map = serializer.serialize_map(Some(self.0.len()))?;
#             for &(ref k, ref v) in &self.0 {
#                 map.serialize_entry(k, v)?;
#             }
#             map.end()
#         }
#     }
#
#     struct LinkedHashMapVisitor<K, V>(PhantomData<fn() -> (K, V)>);
#
#     impl<'de, K, V> Visitor<'de> for LinkedHashMapVisitor<K, V>
#         where K: Deserialize<'de>,
#               V: Deserialize<'de>
#     {
#         type Value = LinkedHashMap<K, V>;
#
#         fn expecting(&self, _: &mut fmt::Formatter) -> fmt::Result {
#             unimplemented!()
#         }
#
#         fn visit_map<M>(self, mut access: M) -> Result<Self::Value, M::Error>
#             where M: MapAccess<'de>
#         {
#             let mut map = LinkedHashMap::new();
#             while let Some((key, value)) = access.next_entry()? {
#                 map.insert(key, value);
#             }
#             Ok(map)
#         }
#     }
#
#     impl<'de, K, V> Deserialize<'de> for LinkedHashMap<K, V>
#         where K: Deserialize<'de>,
#               V: Deserialize<'de>
#     {
#         fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
#             where D: Deserializer<'de>
#         {
#             deserializer.deserialize_map(LinkedHashMapVisitor(PhantomData))
#         }
#     }

#[test]
# fn skeptic_test_ser_de_empty() {}
fn test_ser_de_empty() {
    let map = LinkedHashMap::<char, u32>::new();

    assert_tokens(&map, &[
        Token::Map { len: Some(0) },
        Token::MapEnd,
    ]);
}

#[test]
# fn skeptic_test_ser_de() {}
fn test_ser_de() {
    let mut map = LinkedHashMap::new();
    map.insert('b', 20);
    map.insert('a', 10);
    map.insert('c', 30);

    assert_tokens(&map, &[
        Token::Map { len: Some(3) },
        Token::Char('b'),
        Token::I32(20),

        Token::Char('a'),
        Token::I32(10),

        Token::Char('c'),
        Token::I32(30),
        Token::MapEnd,
    ]);
}
#
#     pub fn run_tests() {
#         test_ser_de_empty();
#         test_ser_de();
#     }
# }
#
# fn main() {
#     test::run_tests();
# }
```
