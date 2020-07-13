# Serialize enum as number

The [serde\_repr] crate provides alternative derive macros that derive the same
Serialize and Deserialize traits but delegate to the underlying representation
of a C-like enum. This allows C-like enums to be formatted as integers rather
than strings in JSON, for example.

[serde\_repr]: https://github.com/dtolnay/serde-repr

```toml
[dependencies]
serde = "1.0"
serde_json = "1.0"
serde_repr = "0.1"
```

```rust
use serde_repr::*;

#[derive(Serialize_repr, Deserialize_repr, PartialEq, Debug)]
#[repr(u8)]
enum SmallPrime {
    Two = 2,
    Three = 3,
    Five = 5,
    Seven = 7,
}

fn main() {
    use SmallPrime::*;
    let nums = vec![Two, Three, Five, Seven];

    // Prints [2,3,5,7]
    println!("{}", serde_json::to_string(&nums).unwrap());

    assert_eq!(Two, serde_json::from_str("2").unwrap());
}
```
