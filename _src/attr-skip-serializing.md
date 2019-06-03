# Skip serializing field

**NOTE:** Using `skip_serializing` does not skip **de**serializing the field. If
you only add the `skip_serializing` attribute, and then attempt to deserialize
the data, it will fail, as it will still attempt to deserialize the skipped
field. Please use the `skip` attribute to skip **both** serializing and
deserializing (see [Field Attributes: `skip`][attr-skip]). Likewise, use
`skip_deserializing` to skip deserializing only.

[attr-skip]: field-attrs.md#skip

!PLAYGROUND b65f4a90bb11285574a1917b0f5e10aa
```rust
use serde::Serialize;

use std::collections::BTreeMap as Map;

#[derive(Serialize)]
struct Resource {
    // Always serialized.
    name: String,

    // Never serialized.
    #[serde(skip_serializing)]
    # #[allow(dead_code)]
    hash: String,

    // Use a method to decide whether the field should be skipped.
    #[serde(skip_serializing_if = "Map::is_empty")]
    metadata: Map<String, String>,
}

fn main() {
    let resources = vec![
        Resource {
            name: "Stack Overflow".to_string(),
            hash: "b6469c3f31653d281bbbfa6f94d60fea130abe38".to_string(),
            metadata: Map::new(),
        },
        Resource {
            name: "GitHub".to_string(),
            hash: "5cb7a0c47e53854cd00e1a968de5abce1c124601".to_string(),
            metadata: {
                let mut metadata = Map::new();
                metadata.insert("headquarters".to_string(),
                                "San Francisco".to_string());
                metadata
            },
        },
    ];

    let json = serde_json::to_string_pretty(&resources).unwrap();

    // Prints:
    //
    //    [
    //      {
    //        "name": "Stack Overflow"
    //      },
    //      {
    //        "name": "GitHub",
    //        "metadata": {
    //          "headquarters": "San Francisco"
    //        }
    //      }
    //    ]
    println!("{}", json);
}
```
