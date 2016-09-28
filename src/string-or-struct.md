# Deserialize either a string or a struct

The [`docker-compose.yml`](https://docs.docker.com/compose/compose-file/#/build)
configuration file has a "build" key which can be either a string or a struct.

```yaml
build: ./dir

# --- or ---

build:
  context: ./dir
  dockerfile: Dockerfile-alternate
  args:
    buildno: 1
```

The configuration file uses the same pattern in other places as well, typically
where a previously existing string field has been expanded to handle more
complex data.

We can use Rust's
[`FromStr`](https://doc.rust-lang.org/std/str/trait.FromStr.html) trait and
Serde's `deserialize_with` attribute to handle this pattern in a general way.

```rust
#![feature(rustc_macro)]

#[macro_use]
extern crate serde_derive;

extern crate serde;
extern crate serde_yaml;
extern crate void;

use std::collections::BTreeMap as Map;
use std::marker::PhantomData;
use std::str::FromStr;

use serde::de::{self, Deserialize, Deserializer};
use void::Void;

fn main() {
    let build_string = "
        build: ./dir
    ";
    let service: Service = serde_yaml::from_str(build_string).unwrap();

    // context="./dir"
    // dockerfile=None
    // args={}
    println!("{:?}", service);

    let build_struct = "
        build:
          context: ./dir
          dockerfile: Dockerfile-alternate
          args:
            buildno: '1'
    ";
    let service: Service = serde_yaml::from_str(build_struct).unwrap();

    // context="./dir"
    // dockerfile=Some("Dockerfile-alternate")
    // args={"buildno": "1"}
    println!("{:?}", service);
}

#[derive(Debug, Deserialize)]
struct Service {
    // The `string_or_struct` function delegates deserialization to a type's
    // `FromStr` impl if given a string, and to the type's `Deserialize` impl if
    // given a struct. The function is generic over the field type T (here T is
    // `Build`) so it can be reused for any field that implements both `FromStr`
    // and `Deserialize`.
    #[serde(deserialize_with = "string_or_struct")]
    build: Build,
}

#[derive(Debug, Deserialize)]
struct Build {
    // This is the only required field.
    context: String,

    dockerfile: Option<String>,

    // When `args` is not present in the input, this attribute tells Serde to
    // use `Default::default()` which in this case is an empty map. See the
    // "default value for a field" example for more about `#[serde(default)]`.
    #[serde(default)]
    args: Map<String, String>,
}

// The `string_or_struct` function uses this impl to instantiate a `Build` if
// the input file contains a string and not a struct. According to the
// docker-compose.yml documentation, a string by itself represents a `Build`
// with just the `context` field set.
//
// > `build` can be specified either as a string containing a path to the build
// > context, or an object with the path specified under context and optionally
// > dockerfile and args.
impl FromStr for Build {
    // This implementation of `from_str` can never fail, so use the impossible
    // `Void` type as the error type.
    type Err = Void;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Build {
            context: s.to_string(),
            dockerfile: None,
            args: Map::new(),
        })
    }
}

fn string_or_struct<T, D>(d: &mut D) -> Result<T, D::Error>
    where T: Deserialize + FromStr<Err = Void>,
          D: Deserializer
{
    // This is a Visitor that forwards string types to T's `FromStr` impl and
    // forwards map types to T's `Deserialize` impl. The `PhantomData` is to
    // keep the compiler from complaining about T being an unused generic type
    // parameter. We need T in order to know the Value type for the Visitor
    // impl.
    struct StringOrStruct<T>(PhantomData<T>);

    impl<T> de::Visitor for StringOrStruct<T>
        where T: Deserialize + FromStr<Err = Void>
    {
        type Value = T;

        fn visit_str<E>(&mut self, value: &str) -> Result<T, E>
            where E: de::Error
        {
            Ok(FromStr::from_str(value).unwrap())
        }

        fn visit_map<M>(&mut self, visitor: M) -> Result<T, M::Error>
            where M: de::MapVisitor
        {
            // `MapVisitorDeserializer` is a wrapper that turns a `MapVisitor`
            // into a `Deserializer`, allowing it to be used as the input to T's
            // `Deserialize` implementation. T then deserializes itself using
            // the entries from the map visitor.
            let mut mvd = de::value::MapVisitorDeserializer::new(visitor);
            Deserialize::deserialize(&mut mvd)
        }
    }

    d.deserialize(StringOrStruct(PhantomData))
}
```
