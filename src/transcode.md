# Transcode one format into another

The [`serde-transcode`](https://github.com/sfackler/serde-transcode) crate
provides functionality to "transcode" from an arbitrary Serde `Deserializer` to
an arbitrary Serde `Serializer` without needing to collect the entire input into
an intermediate form in memory. This provides a fully general way to convert any
self-describing Serde data format into any other Serde data format in a
memory-efficient streaming way.

For example you could transcode a stream of JSON data into a stream of CBOR
data, or transcode unformatted JSON into its pretty-printed form.

This example implements the equivalent of Go's
[`json.Compact`](https://golang.org/pkg/encoding/json/#Compact) function which
removes insignificant whitespace from a JSON string in a streaming way.

```rust
extern crate serde;
extern crate serde_json;
extern crate serde_transcode;

use serde::Serialize;
use serde_transcode::Transcoder;

use std::io;

fn main() {
    // A JSON input with plenty of whitespace.
    let input = r#"
        {
            "a boolean": true,
            "an array": [3, 2, 1]
        }
        "#;

    // Iterator over the bytes of the input JSON.
    let iter = input.bytes().map(Ok);

    // A JSON deserializer. You can use any Serde Deserializer here.
    let mut deserializer = serde_json::Deserializer::new(iter);

    // A compacted JSON serializer. You can use any Serde Serializer here.
    let mut serializer = serde_json::Serializer::new(io::stdout());

    // Prints `{"a boolean":true,"an array":[3,2,1]}` to stdout.
    // This line works with any self-describing Deserializer and any Serializer.
    Transcoder::new(&mut deserializer).serialize(&mut serializer).unwrap();
}
```
