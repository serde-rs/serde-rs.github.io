# Transcode one format into another

The [`serde-transcode`] crate provides functionality to "transcode" from an
arbitrary Serde `Deserializer` to an arbitrary Serde `Serializer` without
needing to collect the entire input into an intermediate form in memory. This
provides a fully general way to convert any self-describing Serde data format
into any other Serde data format in a memory-efficient streaming way.

[`serde-transcode`]: https://github.com/sfackler/serde-transcode

For example you could transcode a stream of JSON data into a stream of CBOR
data, or transcode unformatted JSON into its pretty-printed form.

This example implements the equivalent of Go's [`json.Compact`] function which
removes insignificant whitespace from a JSON string in a streaming way.

[`json.Compact`]: https://golang.org/pkg/encoding/json/#Compact

```rust
use std::io;

fn main() {
    // A JSON input with plenty of whitespace.
    let input = r#"
      {
        "a boolean": true,
        "an array": [3, 2, 1]
      }
    "#;

    // A JSON deserializer. You can use any Serde Deserializer here.
    let mut deserializer = serde_json::Deserializer::from_str(input);

    // A compacted JSON serializer. You can use any Serde Serializer here.
    let mut serializer = serde_json::Serializer::new(io::stdout());

    // Prints `{"a boolean":true,"an array":[3,2,1]}` to stdout.
    // This line works with any self-describing Deserializer and any Serializer.
    serde_transcode::transcode(&mut deserializer, &mut serializer).unwrap();
}
```
