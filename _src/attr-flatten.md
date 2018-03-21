# Struct flattening

Limited support for flattening of data is supported by serde through the `#[serde(flatten)]`
attribute.  It can be used for a variety of common purposes when working with JSON data
in particular.

## Refactor common elements

For instance flatten can be used to move common

```rust
#[derive(Serialize, Deserialize, Debug)]
struct PaginatedResponse<U> {
    #[serde(flatten)]
    pagination: Pagination,
    items: Vec<U>
}

#[derive(Serialize, Deserialize, Debug)]
struct Pagination {
    limit: u64,
    offset: u64,
    total: u64,
}

#[derive(Serialize, Deserialize, Debug)]
struct User {
    id: String,
    username: String,
    email: Option<String>,
}
```

Then `PaginatedResponse<User>` can be deserialized from this data:

```json
{
  "limit": 100,
  "offset": 200,
  "total": 10553,
  "items": [
    {"id": "49824073-979f-4814-be10-5ea416ee1c2f", username": "john_doe"},
    ...
  ]
}
```

## Capture additional data

A second common usecase for flatten is to collect all remaining data in a struct
into a hashmap:

```rust

#[derive(Serialize, Deserialize, Debug)]
struct Object {
    id: String,
    #[serde(rename = "type")]
    ty: String,
    #[serde(flatten)]
    extra: HashMap<String, String>,
}
```

This way additional data in an object can be collected into the `extra` hash map
for later processing.
