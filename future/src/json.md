# Structs and enums in JSON

A Serde `Serializer` is responsible for selecting the convention by which Rust
structs and enums are represented in that format. Here are the conventions
selected by the [`serde_json`](https://github.com/serde-rs/json) data format.
For consistency other formats are encouraged to develop analogous conventions
where possible.

```rust
# #![allow(dead_code, unused_variables)]
#
# fn main() {
#
struct W {
    a: i32,
    b: i32,
}
let w = W { a: 0, b: 0 }; // Represented as `{"a":0,"b":0}`

struct X(i32, i32);
let x = X(0, 0); // Represented as `[0,0]`

struct Y(i32);
let y = Y(0); // Represented as just the inner value `0`

struct Z;
let z = Z; // Represented as `null`

enum E {
    W { a: i32, b: i32 },
    X(i32, i32),
    Y(i32),
    Z,
}
let w = E::W { a: 0, b: 0 }; // Represented as `{"W":{"a":0,"b":0}}`
let x = E::X(0, 0);          // Represented as `{"X":[0,0]}`
let y = E::Y(0);             // Represented as `{"Y":0}`
let z = E::Z;                // Represented as `"Z"`
                             // but can also be deserialized from `{"Z":null}`
                             //                               and `{"Z":[]}`
#
# }
```
