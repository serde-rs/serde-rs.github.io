<span style="float:right">
  [![GitHub]][repo]
  [![rustdoc]][docs]
  [![Latest Version]][crates.io]
</span>

[GitHub]: /img/github.svg
[repo]: https://github.com/serde-rs/serde
[rustdoc]: /img/rustdoc.svg
[docs]: https://docs.serde.rs/serde/
[Latest Version]: https://img.shields.io/crates/v/serde.svg?style=social
[crates.io]: https://crates.io/crates/serde

# Serde

Serde is a framework for ***ser***ializing and ***de***serializing Rust data
structures efficiently and generically.

The Serde ecosystem consists of data structures that know how to serialize and
deserialize themselves along with data formats that know how to serialize and
deserialize other things. Serde provides the layer by which these two groups
interact with each other, allowing any supported data structure to be serialized
and deserialized using any supported data format.

### Design

Where many other languages rely on runtime reflection for serializing data,
Serde is instead built on Rust's powerful trait system. A data structure that
knows how to serialize and deserialize itself is one that implements Serde's
[`Serialize`](https://docs.serde.rs/serde/trait.Serialize.html) and 
[`Deserialize`](https://docs.serde.rs/serde/trait.Deserialize.html)
traits (or uses Serde's derive attribute to
automatically generate implementations at compile time). This avoids any
overhead of reflection or runtime type information. In fact in many situations
the interaction between data structure and data format can be completely
optimized away by the Rust compiler, leaving Serde serialization to perform
the same speed as a handwritten serializer for the specific selection of data
structure and data format.

### Data formats

The following is a partial list of data formats that have been implemented for
Serde by the community.

- [JSON], the ubiquitous JavaScript Object Notation used by many HTTP APIs.
- [Bincode], a compact binary format used for IPC within the Servo rendering
  engine.
- [CBOR], a Concise Binary Object Representation designed for small message size
  without the need for version negotiation.
- [YAML], a popular human-friendly configuration language that ain't markup
  language.
- [MessagePack], an efficient binary format that resembles a compact JSON.
- [TOML], a minimal configuration format used by [Cargo].
- [Pickle], a format common in the Python world.
- [Hjson], a variant of JSON designed to be readable and writable by humans.
- [BSON], the data storage and network transfer format used by MongoDB.
- [URL], the x-www-form-urlencoded format.
- [XML], the flexible machine-friendly W3C standard.
  *(deserialization only)*
- [Envy], a way to deserialize environment variables into Rust structs.
  *(deserialization only)*
- [Redis], deserialize values from Redis when using [redis-rs].
  *(deserialization only)*

[JSON]: https://github.com/serde-rs/json
[Bincode]: https://github.com/TyOverby/bincode
[CBOR]: https://github.com/pyfisch/cbor
[YAML]: https://github.com/dtolnay/serde-yaml
[MessagePack]: https://github.com/3Hren/msgpack-rust
[TOML]: https://github.com/alexcrichton/toml-rs
[Pickle]: https://github.com/birkenfeld/serde-pickle
[Hjson]: https://github.com/laktak/hjson-rust
[BSON]: https://github.com/zonyitoo/bson-rs
[URL]: https://github.com/nox/serde_urlencoded
[XML]: https://github.com/RReverser/serde-xml-rs
[Envy]: https://github.com/softprops/envy
[Redis]: https://github.com/OneSignal/serde-redis
[Cargo]: http://doc.crates.io/manifest.html
[redis-rs]: https://crates.io/crates/redis

### Data structures

Out of the box, Serde is able to serialize and deserialize common Rust data
types in any of the above formats. For example `String`, `&str`, `usize`,
`Vec<T>`, `HashMap<K,V>` are all supported. In addition, Serde provides a derive
macro to generate serialization implementations for structs in your own program.
Using the derive macro goes like this:

!PLAYGROUND a58fc361e02c4c0a08fd99cacd9567d1
```rust
#[macro_use]
extern crate serde_derive;

extern crate serde;
extern crate serde_json;

#[derive(Serialize, Deserialize, Debug)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let point = Point { x: 1, y: 2 };

    // Convert the Point to a JSON string.
    let serialized = serde_json::to_string(&point).unwrap();

    // Prints serialized = {"x":1,"y":2}
    println!("serialized = {}", serialized);

    // Convert the JSON string back to a Point.
    let deserialized: Point = serde_json::from_str(&serialized).unwrap();

    // Prints deserialized = Point { x: 1, y: 2 }
    println!("deserialized = {:?}", deserialized);
}
```
