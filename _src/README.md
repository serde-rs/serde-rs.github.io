<span style="float:right">
  <a href="https://github.com/serde-rs/serde" target="_blank"><img src="img/github.svg" alt="GitHub"></a>
  <a href="https://docs.serde.rs/serde/" target="_blank"><img src="img/rustdoc.svg" alt="rustdoc"></a>
  <a href="https://crates.io/crates/serde" target="_blank"><img src="https://img.shields.io/crates/v/serde.svg?style=social" alt="Latest Version"></a>
</span>

<div style="clear:both"></div>

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
`Serialize` and `Deserialize` traits (or uses Serde's derive attribute to
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
- [YAML], a self-proclaimed human-friendly configuration language that ain't
  markup language.
- [MessagePack], an efficient binary format that resembles a compact JSON.
- [TOML], a minimal configuration format used by [Cargo].
- [Pickle], a format common in the Python world.
- [RON], a Rusty Object Notation.
- [BSON], the data storage and network transfer format used by MongoDB.
- [Avro], a binary format used within Apache Hadoop, with support for schema
  definition.
- [JSON5], a superset of JSON including some productions from ES5.
- [Postcard], a no\_std and embedded-systems friendly compact binary format.
- [URL] query strings, in the x-www-form-urlencoded format.
- [Envy], a way to deserialize environment variables into Rust structs.
  *(deserialization only)*
- [Envy Store], a way to deserialize [AWS Parameter Store] parameters into Rust
  structs. *(deserialization only)*
- [S-expressions], the textual representation of code and data used by the Lisp
  language family.
- [D-Bus]'s binary wire format.
- [FlexBuffers], the schemaless cousin of Google's FlatBuffers zero-copy
  serialization format.
- [Bencode], a simple binary format used in the BitTorrent protocol.
- [DynamoDB Items], the format used by [rusoto_dynamodb] to transfer data to
  and from DynamoDB.
- [Hjson], a syntax extension to JSON designed around human reading and editing.
  *(deserialization only)*

[JSON]: https://github.com/serde-rs/json
[Bincode]: https://github.com/bincode-org/bincode
[CBOR]: https://github.com/enarx/ciborium
[YAML]: https://github.com/dtolnay/serde-yaml
[MessagePack]: https://github.com/3Hren/msgpack-rust
[TOML]: https://github.com/alexcrichton/toml-rs
[Pickle]: https://github.com/birkenfeld/serde-pickle
[RON]: https://github.com/ron-rs/ron
[BSON]: https://github.com/mongodb/bson-rust
[Avro]: https://github.com/flavray/avro-rs
[JSON5]: https://github.com/callum-oakley/json5-rs
[URL]: https://docs.rs/serde_qs
[Postcard]: https://github.com/jamesmunns/postcard
[Envy]: https://github.com/softprops/envy
[Envy Store]: https://github.com/softprops/envy-store
[Cargo]: http://doc.crates.io/manifest.html
[AWS Parameter Store]: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html
[S-expressions]: https://github.com/rotty/lexpr-rs
[D-Bus]: https://docs.rs/zvariant
[FlexBuffers]: https://github.com/google/flatbuffers/tree/master/rust/flexbuffers
[Bencode]: https://github.com/P3KI/bendy
[DynamoDB Items]: https://docs.rs/serde_dynamo
[rusoto_dynamodb]: https://docs.rs/rusoto_dynamodb
[Hjson]: https://github.com/Canop/deser-hjson

### Data structures

Out of the box, Serde is able to serialize and deserialize common Rust data
types in any of the above formats. For example `String`, `&str`, `usize`,
`Vec<T>`, `HashMap<K,V>` are all supported. In addition, Serde provides a derive
macro to generate serialization implementations for structs in your own program.
Using the derive macro goes like this:

```rust
use serde::{Serialize, Deserialize};

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
