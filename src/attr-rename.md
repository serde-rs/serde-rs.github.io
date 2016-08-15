# Serialize fields as camelCase

```rust
#![feature(plugin, custom_derive)]
#![plugin(serde_macros)]

extern crate serde;
extern crate serde_json;

#[derive(Serialize)]
struct Person {
    #[serde(rename = "firstName")]
    first_name: String,
    #[serde(rename = "lastName")]
    last_name: String,
}

fn main() {
    let person = Person {
        first_name: "Joel".to_string(),
        last_name: "Spolsky".to_string(),
    };

    let json = serde_json::to_string_pretty(&person).unwrap();

    // Prints:
    //
    //    {
    //      "firstName": "Joel",
    //      "lastName": "Spolsky"
    //    }
    println!("{}", json);
}
```
