# Date in a custom format

This uses the [`chrono`](https://github.com/chronotope/chrono) crate to
serialize and deserialize JSON data containing a custom date format. The `with`
attribute is used to provide the logic for handling the custom representation.

```rust
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct StructWithCustomDate {
    // DateTime supports Serde out of the box, but uses RFC3339 format. Provide
    // some custom logic to make it use our desired format.
    #[serde(with = "my_date_format")]
    pub timestamp: DateTime<Utc>,

    // Any other fields in the struct.
    pub bidder: String,
}

mod my_date_format {
    use chrono::{DateTime, Utc, TimeZone};
    use serde::{self, Deserialize, Serializer, Deserializer};

    const FORMAT: &'static str = "%Y-%m-%d %H:%M:%S";

    // The signature of a serialize_with function must follow the pattern:
    //
    //    fn serialize<S>(&T, S) -> Result<S::Ok, S::Error>
    //    where
    //        S: Serializer
    //
    // although it may also be generic over the input types T.
    pub fn serialize<S>(
        date: &DateTime<Utc>,
        serializer: S,
    ) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let s = format!("{}", date.format(FORMAT));
        serializer.serialize_str(&s)
    }

    // The signature of a deserialize_with function must follow the pattern:
    //
    //    fn deserialize<'de, D>(D) -> Result<T, D::Error>
    //    where
    //        D: Deserializer<'de>
    //
    // although it may also be generic over the output types T.
    pub fn deserialize<'de, D>(
        deserializer: D,
    ) -> Result<DateTime<Utc>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        Utc.datetime_from_str(&s, FORMAT).map_err(serde::de::Error::custom)
    }
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
