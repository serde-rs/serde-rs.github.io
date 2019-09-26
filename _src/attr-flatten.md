# Struct flattening

The `flatten` attribute inlines keys from a field into the parent struct.
`flatten` may be used any number of times within the same struct. It is
supported only within structs that have named fields, and the field to which it
is applied must be a struct or map type.

The `flatten` attribute serves the following two common use cases:

### Factor out frequently grouped keys

Consider a paginated API which returns a page of results along with pagination
metadata that identifies how many results were requested, how far into the total
set of results we are looking at, and how many results exist in total. If we are
paging through a total of 1053 results 100 at a time, the third page may look
like this.

```json
{
  "limit": 100,
  "offset": 200,
  "total": 1053,
  "users": [
    {"id": "49824073-979f-4814-be10-5ea416ee1c2f", "username": "john_doe"},
    ...
  ]
}
```

This same scheme with `"limit"` and `"offset"` and `"total"` fields may be
shared across lots of different API queries. For example we may want paginated
results when querying for users, for issues, for projects, etc.

In this case it can be convenient to factor the common pagination metadata fields
into a shared struct that can be flattened into each API response object.

```rust
# use serde::{Serialize, Deserialize};
#
#[derive(Serialize, Deserialize)]
struct Pagination {
    limit: u64,
    offset: u64,
    total: u64,
}

#[derive(Serialize, Deserialize)]
struct Users {
    users: Vec<User>,

    #[serde(flatten)]
    pagination: Pagination,
}
#
# #[derive(Serialize, Deserialize)]
# struct User;
#
# fn main() {}
```

### Capture additional fields

A field of map type can be flattened to hold additional data that is not
captured by any other fields of the struct.

```rust
use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use serde_json::Value;

#[derive(Serialize, Deserialize)]
struct User {
    id: String,
    username: String,

    #[serde(flatten)]
    extra: HashMap<String, Value>,
}
#
# fn main() {}
```

For example if we fill the flattened `extra` field with the key `"mascot":
"Ferris"`, it would serialize to the following JSON representation.

```json
{
  "id": "49824073-979f-4814-be10-5ea416ee1c2f",
  "username": "john_doe",
  "mascot": "Ferris"
}
```

Deserialization of this data would populate `"mascot"` back into the flattened
`extra` field. This way additional data in an object can be collected for later
processing.
