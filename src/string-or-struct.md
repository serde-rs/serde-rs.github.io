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
#![feature(plugin, custom_derive)]
#![plugin(serde_macros)]

extern crate serde;
extern crate serde_yaml;
extern crate void;

use std::collections::BTreeMap as Map;
use std::marker::PhantomData;
use std::str::FromStr;

use serde::{de, Deserialize, Deserializer};
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
    #[serde(deserialize_with = "string_or_struct")]
    build: Build,
}

#[derive(Debug, Deserialize)]
struct Build {
    context: String,
    dockerfile: Option<String>,
    #[serde(default)]
    args: Map<String, String>,
}

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
    // This is a Visitor that forwards string types to T's FromStr impl and
    // forwards map types to T's Deserialize impl.
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
            let mut mvd = de::value::MapVisitorDeserializer::new(visitor);
            Deserialize::deserialize(&mut mvd)
        }
    }

    d.deserialize(StringOrStruct(PhantomData))
}
```
