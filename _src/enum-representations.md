# Enum representations

Consider the following enum type:

```rust
# #[macro_use]
# extern crate serde_derive;
#
# type Params = ();
# type Value = ();
#
#[derive(Serialize, Deserialize)]
enum Message {
    Request { id: String, method: String, params: Params },
    Response { id: String, result: Value },
}
#
# fn main() {}
```

## Externally tagged

The default representation for this enum in Serde is called the externally
tagged enum representation. Written in JSON syntax it looks like:

```json
{"Request": {"id": "...", "method": "...", "params": {...}}}
```

The externally tagged representation is characterized by being able to know
which variant we are dealing with before beginning to parse the content of the
variant. This property allows it to work across a broad range of text and binary
formats. The `Serializer::serialize_*_variant` and
`Deserializer::deserialize_enum` methods use an externally tagged
representation.

This representation can handle any type of variant: struct variants like above,
tuple variants, newtype variants, and unit variants.

In JSON and other self-describing formats, the externally tagged representation
is often not ideal for readability. Serde provides attributes to select two
other possible representations.

## Internally tagged

```rust
# #[macro_use]
# extern crate serde_derive;
#
# type Params = ();
# type Value = ();
#
#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
enum Message {
    Request { id: String, method: String, params: Params },
    Response { id: String, result: Value },
}
#
# fn main() {}
```

Written in JSON syntax, the internally tagged representation looks like this:

```json
{"type": "Request", "id": "...", "method": "...", "params": {...}}
```

The tag identifying which variant we are dealing with is now inside of the
content, next to any other fields of the variant. This representation is common
in Java libraries.

This representation works for struct variants, newtype variants containing
structs or maps, and unit variants but does not work for enums containing tuple
variants. Using a `#[serde(tag = "...")]` attribute on an enum containing a
tuple variant is an error at compile time.

## Adjacently tagged

```rust
# #[macro_use]
# extern crate serde_derive;
#
# type Inline = ();
#
#[derive(Serialize, Deserialize)]
#[serde(tag = "t", content = "c")]
enum Block {
    Para(Vec<Inline>),
    Str(String),
}
#
# fn main() {}
```

This representation is common the Haskell world. Written in JSON syntax:

```json
{"t": "Para", "c": [{...}, {...}]}
{"t": "Str", "c": "the string"}
```

The tag and the content are adjacent to each other as two fields within the same
object.

## Untagged

```rust
# #[macro_use]
# extern crate serde_derive;
#
# type Params = ();
# type Value = ();
#
#[derive(Serialize, Deserialize)]
#[serde(untagged)]
enum Message {
    Request { id: String, method: String, params: Params },
    Response { id: String, result: Value },
}
#
# fn main() {}
```

Written in JSON syntax, the untagged representation looks like this:

```json
{"id": "...", "method": "...", "params": {...}}
```

There is no explicit tag identifying which variant the data contains. Serde will
try to match the data against each variant in order and the first one that
deserializes successfully is the one returned.

This representation can handle enums containing any type of variant.

As another example of an untagged enum, this enum can be deserialized from
either an integer or an array of two strings:

```rust
# #[macro_use]
# extern crate serde_derive;
#
#[derive(Serialize, Deserialize)]
#[serde(untagged)]
enum Data {
    Integer(u64),
    Pair(String, String),
}
#
# fn main() {}
```

## Renaming Enums

Consider the following enum type:

```rust
# #[macro_use]
# extern crate serde_derive;
#
#[derive(Serialize, Deserialize)]
enum Colour {
    Red,
    Green,
    Blue,
}

#[derive(Serialize, Deserialize)]
struct House {
    address: String,
    colour: Colour,
}
#
# fn main() {}
```

This will serialize to:

```json
{"address": "123 Main St", "colour": "Blue"}
```

We might want our serialized value of `colour` to be different. We can do that by making use of `rename`:

```rust
# #[macro_use]
# extern crate serde_derive;
#
#[derive(Serialize, Deserialize)]
enum Colour {
    #[serde(rename="#FF0000")]
    Red,
    #[serde(rename="#008000")]
    Green,
    #[serde(rename="#0000FF")]
    Blue,
}
#
# fn main() {}
```

This would now serialize to:

```json
{"address": "123 Main St", "colour": "#0000FF"}
```

Finally, if we wanted to simply make the enums lowercase, we can use `#[serde(rename_all="lowercase")]`:

```rust
# #[macro_use]
# extern crate serde_derive;
#
#[derive(Serialize, Deserialize)]
#[serde(rename_all="lowercase")]
enum Colour {
    Red,
    Green,
    Blue,
}
#
# fn main() {}
```

Resulting in:

```json
{"address": "123 Main St", "colour": "blue"}
```
