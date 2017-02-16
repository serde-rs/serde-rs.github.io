# Deserialize a struct with a custom date format
This uses the `chrono` crate to deserialize and serialize
JSON data containing a custom date format. The `serialize_wth`
and `deserialize_with` are used to provide the custom functions
(`serialize_date` and `deserialize_date` respectively).

```rust
extern crate serde;
extern crate serde_json;
#[macro_use]
extern crate serde_derive;
extern crate chrono;

use serde::{Deserialize, Serializer, Deserializer};
use chrono::{DateTime, UTC, TimeZone};

const DATE_FORMAT: &'static str = "%Y-%m-%d %H:%M:%S";

fn deserialize_date<D>(deserializer: D) -> Result<DateTime<UTC>, D::Error>
    where D: Deserializer
{
    use serde::de::Error;

    String::deserialize(deserializer).and_then(|s| {
        UTC.datetime_from_str(&s, DATE_FORMAT)
            .map_err(|err| Error::custom(err.to_string()))
    })
}

fn serialize_date<S>(date: &DateTime<UTC>, serializer: S) -> Result<S::Ok, S::Error>
    where S: Serializer
{
    serializer.serialize_str(&format!("{}", date.format(DATE_FORMAT)))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StructWithCustomDate {
    #[serde(serialize_with = "serialize_date", deserialize_with = "deserialize_date")]
    pub date: DateTime<UTC>,
    pub id: i32,
}

fn main() {
    let json_str = r#"{"date":"2017-02-16 21:54:30","id":1}"#;
    let thing: StructWithCustomDate = serde_json::from_str(json_str).unwrap();
    let deserialized = serde_json::to_string(&thing).unwrap();

    assert_eq!(deserialized, json_str)
}
```