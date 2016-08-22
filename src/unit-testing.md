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
extern crate linked_hash_map;
use linked_hash_map::LinkedHashMap;

extern crate serde_test;
use serde_test::{Token, assert_tokens};

#[test]
fn test_ser_de_empty() {
    let map = LinkedHashMap::<char, u32>::new();

    assert_tokens(&map, &[
        Token::MapStart(Some(0)),
        Token::MapEnd,
    ]);
}

#[test]
fn test_ser_de() {
    let mut map = LinkedHashMap::new();
    map.insert('b', 20);
    map.insert('a', 10);
    map.insert('c', 30);

    assert_tokens(&map, &[
        Token::MapStart(Some(3)),
            Token::MapSep,
            Token::Char('b'),
            Token::I32(20),

            Token::MapSep,
            Token::Char('a'),
            Token::I32(10),

            Token::MapSep,
            Token::Char('c'),
            Token::I32(30),
        Token::MapEnd,
    ]);
}
```
