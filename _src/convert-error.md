# Converting error types

In some situations, values in some format must be contained inside of data in
some other format. For example an [IAM policy in Terraform] is represented as a
JSON string contained inside of an HCL config.

[IAM policy in Terraform]: https://www.terraform.io/docs/providers/aws/r/iam_policy.html

It would be simple to treat the inner value as just a String, but if we are
going to be manipulating both the inner and outer value it can often be
convenient to serialize and deserialize them all at once.

One occasional stumbling block in such situations is correctly handling errors.
The two formats may (probably do) have different Error types, so some conversion
is necessary.

This example shows a simplified HCL resource containing a simplified IAM policy.
The policy document is represented as a JSON string when serialized.

```rust
#[macro_use]
extern crate serde_derive;

extern crate serde;
extern crate serde_json;
extern crate serde_yaml;

#[derive(Serialize, Deserialize)]
struct Resource {
    name: String,

    #[serde(with = "as_json_string")]
    policy: Policy,
}

#[derive(Serialize, Deserialize)]
struct Policy {
    effect: String,
    action: String,
    resource: String,
}

// Serialize and deserialize logic for dealing with nested values reprsented as
// JSON strings.
mod as_json_string {
    use serde_json;
    use serde::ser::{Serialize, Serializer};
    use serde::de::{Deserialize, DeserializeOwned, Deserializer};

    // Serialize to a JSON string, then serialize the string to the output
    // format.
    pub fn serialize<T, S>(value: &T, serializer: S) -> Result<S::Ok, S::Error>
    where
        T: Serialize,
        S: Serializer,
    {
        use serde::ser::Error;
        let j = serde_json::to_string(value).map_err(Error::custom)?;
        j.serialize(serializer)
    }

    // Deserialize a string from the input format, then deserialize the content
    // of that string as JSON.
    pub fn deserialize<'de, T, D>(deserializer: D) -> Result<T, D::Error>
    where
        T: DeserializeOwned,
        D: Deserializer<'de>,
    {
        use serde::de::Error;
        let j = String::deserialize(deserializer)?;
        serde_json::from_str(&j).map_err(Error::custom)
    }
}

fn main() {
    let resource = Resource {
        name: "test_policy".to_owned(),
        policy: Policy {
            effect: "Allow".to_owned(),
            action: "s3:ListBucket".to_owned(),
            resource: "arn:aws:s3:::example_bucket".to_owned(),
        },
    };

    let y = serde_yaml::to_string(&resource).unwrap();
    println!("{}", y);
}
```
