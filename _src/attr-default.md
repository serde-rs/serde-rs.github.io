# Default value for a field

!PLAYGROUND 0e4e49413b9704f03b0bfefb7e980123
```rust
use serde::Deserialize;

#[derive(Deserialize, Debug)]
struct Request {
    // Use the result of a function as the default if "resource" is
    // not included in the input.
    #[serde(default = "default_resource")]
    resource: String,

    // Use the type's implementation of std::default::Default if
    // "timeout" is not included in the input.
    #[serde(default)]
    timeout: Timeout,

    // #[serde(default)] on a field calls Default::default() for that field's type.
    // For enums, #[derive(Default)] requires exactly one variant marked #[default].
    #[serde(default)]
    method: RequestMethod,

    // If you can't use #[derive(Default)], specify a different constructor
    // method from the type as the default if "priority" is not
    // included in the input. This may also be a trait method.
    #[serde(default = "Priority::lowest")]
    priority: Priority,
}

fn default_resource() -> String {
    "/".to_string()
}

/// Timeout in seconds.
#[derive(Deserialize, Debug)]
struct Timeout(u32);
impl Default for Timeout {
    fn default() -> Self {
        Timeout(30)
    }
}

#[derive(Deserialize, Debug, Default)] // Notice: Default derived.
enum RequestMethod {
    #[default] // Marked variant is picked as default.
    Get,
    Post,
    Put,
    Patch,
    Delete,
}

#[derive(Deserialize, Debug)]
enum Priority { ExtraHigh, High, Normal, Low, ExtraLow }
impl Priority {
    fn lowest() -> Self { Priority::ExtraLow }
}

fn main() {
    let json = r#"
        [
          {
            "resource": "/user/1",
            "method": "Delete"
          },
          {
            "timeout": 5,
            "priority": "High"
          }
        ]
    "#;

    let requests: Vec<Request> = serde_json::from_str(json).unwrap();

    // The first request has resource="/user/1", timeout=30, method=Delete, priority=ExtraLow
    println!("{:?}", requests[0]);

    // The second request has resource="/", timeout=5, method=Get, priority=High
    println!("{:?}", requests[1]);
}
```
