# Date in a custom format

This uses the [`chrono`](https://github.com/chronotope/chrono) crate to
serialize and deserialize JSON data containing a custom date format. The
`serialize_with` and `deserialize_with` attributes are used to provide the logic
for handling the custom representation.

```rust
#[macro_use]
extern crate serde_derive;

extern crate chrono;
extern crate serde;
extern crate serde_json;

use chrono::{DateTime, UTC, TimeZone};
use serde::{Deserialize, Serializer, Deserializer};

const DATE_FORMAT: &'static str = "%Y-%m-%d %H:%M:%S";

#[derive(Serialize, Deserialize, Debug)]
pub struct StructWithCustomDate {
    // DateTime supports Serde out of the box, but uses RFC3339 format. Provide
    // some custom logic to make it use our desired format.
    #[serde(serialize_with = "date_as_string", deserialize_with = "date_from_string")]
    pub timestamp: DateTime<UTC>,

    // Any other fields in the struct.
    pub bidder: String,
}

// The signature of a serialize_with function must follow the pattern:
//
//    fn ser<S>(&T, S) -> Result<S::Ok, S::Error> where S: Serializer
//
// although it may also be generic over the input types T.
fn date_as_string<S>(date: &DateTime<UTC>, serializer: S) -> Result<S::Ok, S::Error>
    where S: Serializer
{
    let s = format!("{}", date.format(DATE_FORMAT));
    serializer.serialize_str(&s)
}

// The signature of a deserialize_with function must follow the pattern:
//
//    fn de<D>(D) -> Result<T, D::Error> where D: Deserializer
//
// although it may also be generic over the output types T.
fn date_from_string<D>(deserializer: D) -> Result<DateTime<UTC>, D::Error>
    where D: Deserializer
{
    let s = String::deserialize(deserializer)?;
    UTC.datetime_from_str(&s, DATE_FORMAT).map_err(serde::de::Error::custom)
}

fn main() {
    let json_str = r#"
      {
        "timestamp": "2017-02-16 21:54:30",
        "bidder": "Skrillex"
      }
    "#;

    let data: StructWithCustomDate = serde_json::from_str(json_str).unwrap();
    println!("{:#?}", data);

    let serialized = serde_json::to_string_pretty(&data).unwrap();
    println!("{}", serialized);
}
```
