# Implementing Serialize

The [`Serialize`] trait looks like this:

[`Serialize`]: https://docs.serde.rs/serde/ser/trait.Serialize.html

```rust
# extern crate serde;
#
# use serde::Serializer;
#
pub trait Serialize {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer;
}
#
# fn main() {}
```

This method's job is to take your type (`&self`) and map it into the [Serde data
model] by invoking exactly one of the methods on the given [`Serializer`].

[Serde data model]: data-model.md
[`Serializer`]: https://docs.serde.rs/serde/ser/trait.Serializer.html

In most cases Serde's [derive] is able to generate an appropriate implementation
of `Serialize` for structs and enums defined in your crate. Should you need to
customize the serialization behavior for a type in a way that derive does not
support, you can implement `Serialize` yourself.

[derive]: derive.md

## Serializing a primitive

As the simplest example, here is the builtin `Serialize` impl for the primitive
`i32`.

```rust
# extern crate serde;
#
# use std::os::raw::c_int as ActualI32;
#
# use serde::{Serialize, Serializer};
#
# #[allow(dead_code, non_camel_case_types)]
# struct i32;
#
# trait Serialize2 {
#     fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
#     where
#         S: Serializer;
# }
#
impl Serialize for i32 {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
#         impl Serialize2 for ActualI32 {
#             fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
#             where
#                 S: Serializer,
#             {
        serializer.serialize_i32(*self)
#             }
#         }
#
#         let _ = serializer;
#         unimplemented!()
    }
}
#
# fn main() {}
```

Serde provides such impls for all of Rust's [primitive types] so you are not
responsible for implementing them yourself, but `serialize_i32` and similar
methods may be useful if you have a type that needs to be represented as a
primitive in its serialized form. For example you could [serialize a C-like enum
as a primitive number].

[primitive types]: https://doc.rust-lang.org/book/primitive-types.html
[serialize a C-like enum as a primitive number]: https://serde.rs/enum-number.html

## Serializing a sequence or map

Compound types follow a three-step process of init, elements, end.

```rust
# extern crate serde;
#
# use std::marker::PhantomData;
#
# struct Vec<T>(PhantomData<T>);
#
# impl<T> Vec<T> {
#     fn len(&self) -> usize {
#         unimplemented!()
#     }
# }
#
# impl<'a, T> IntoIterator for &'a Vec<T> {
#     type Item = &'a T;
#     type IntoIter = Box<Iterator<Item = &'a T>>;
#
#     fn into_iter(self) -> Self::IntoIter {
#         unimplemented!()
#     }
# }
#
# struct MyMap<K, V>(PhantomData<K>, PhantomData<V>);
#
# impl<K, V> MyMap<K, V> {
#     fn len(&self) -> usize {
#         unimplemented!()
#     }
# }
#
# impl<'a, K, V> IntoIterator for &'a MyMap<K, V> {
#     type Item = (&'a K, &'a V);
#     type IntoIter = Box<Iterator<Item = (&'a K, &'a V)>>;
#
#     fn into_iter(self) -> Self::IntoIter {
#         unimplemented!()
#     }
# }
#
use serde::ser::{Serialize, Serializer, SerializeSeq, SerializeMap};

impl<T> Serialize for Vec<T>
where
    T: Serialize,
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut seq = serializer.serialize_seq(Some(self.len()))?;
        for e in self {
            seq.serialize_element(e)?;
        }
        seq.end()
    }
}

impl<K, V> Serialize for MyMap<K, V>
where
    K: Serialize,
    V: Serialize,
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut map = serializer.serialize_map(Some(self.len()))?;
        for (k, v) in self {
            map.serialize_entry(k, v)?;
        }
        map.end()
    }
}
#
# fn main() {}
```

## Serializing a tuple

The `serialize_tuple` method is a lot like `serialize_seq`. The distinction
Serde makes is that `serialize_tuple` is for sequences where the length does not
need to be serialized because it will be known at deserialization time. The
usual examples are Rust [tuples] and [arrays]. In non-self-describing formats a
`Vec<T>` needs to be serialized with its length in order to be able to
deserialize a `Vec<T>` back out. But a `[T; 16]` can be serialized using
`serialize_tuple` because the length will be known at deserialization time
without looking at the serialized bytes.

[tuples]: https://doc.rust-lang.org/std/primitive.tuple.html
[arrays]: https://doc.rust-lang.org/std/primitive.array.html

## Serializing a struct

Serde distinguishes between four types of structs:

1. [Ordinary structs] and [tuple structs] follow the three-step process of init, elements, end just like a
sequence or map.
2. [Newtype structs] and [unit structs] are more like primitives.

[Ordinary structs]: https://doc.rust-lang.org/book/structs.html
[tuple structs]: https://doc.rust-lang.org/book/structs.html#tuple-structs
[Newtype structs]: https://doc.rust-lang.org/book/structs.html#tuple-structs
[unit structs]: https://doc.rust-lang.org/book/structs.html#unit-like-structs

Structs and maps may look similar in some formats, including JSON. The
distinction Serde makes is that structs have keys that are compile-time constant
strings and will be known at deserialization time without looking at the
serialized data. This condition enables some data formats to handle structs much
more efficiently and compactly than maps.

Data formats are encouraged to treat newtype structs as insignificant wrappers
around the inner value, serializing just the inner value. See for example
[JSON's treatment of newtype structs].

[JSON's treatment of newtype structs]: json.md

### Ordinary structs

Regarding the following struct:

```rust
struct Color {
    r: u8,
    g: u8,
    b: u8,
}
```

The equivalent of the automatic implementation for `Serialize` would be:

```rust
impl Serialize for Color {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // 1. serialize_struct => 3 is the number of fields in the struct.
        let mut state = serializer.serialize_struct("Color", 3)?;

        // 2. serialize_field is called for each field
        state.serialize_field("r", &self.r)?;
        state.serialize_field("g", &self.g)?;
        state.serialize_field("b", &self.b)?;

        // 3. end is called to notify the end of the serialization process
        state.end()
    }
}
```

### Tuple structs

Regarding the following tuple struct:

```rust
struct Point2D(f64, f64);
```

The equivalent of the automatic implementation for `Serialize` would be:

```rust
impl Serialize for Point2D {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // 1. serialize_tuple_struct => 2 is the number of fields in the tuple.
        let mut state = serializer.serialize_tuple_struct("Point2D", 2)?;

        // 2. serialize_field is called for each field
        state.serialize_field(&self.0)?;
        state.serialize_field(&self.1)?;

        // 3. end is called to notify the end of the serialization process
        state.end()
    }
}
```

### Newtype structs

Regarding the following newtype struct:

```rust
struct Inches(u64);
```

The equivalent of the automatic implementation for `Serialize` would be:

```rust
impl Serialize for Inches {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // Only a call to serialize_tuple_struct is required
        serializer.serialize_newtype_struct("Inches", &self.0)?;
    }
}
```

### Unit structs

Regarding the following unit struct:

```rust
struct Instance;
```

The equivalent of the automatic implementation for `Serialize` would be:

```rust
impl Serialize for Inches {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // Only a call to serialize_unit_struct is required
       serializer.serialize_unit_struct("Instance")
    }
}
```

### Nested structs types

When a type implements the `Serialize` trait, it's responsability is to handle the serialization
at **it's own level** only. This means that it is **impossible** to treat the serialization of
different structs levels inside one implementation of `Serialize`.

In the case of JSON serialization, let's imagine the following object representing a search query of an
arbitrary API :

```json
{
"limit": 100,
"filters": {
    "category": {
        "id": "9"
    },
    "location": {
        "city_zipcodes": [
            {
                "city": "London",
            }
        ],
    },
    "ranges": {
        "price": {
            "min": 0,
            "max": 100000
        },
        "rooms": {
            "min": 3,
            "max": 5
                }
            }
        }
}
```

Handling the serialization manually will require as many `Serialize` implementations as the
number of different types of JSON objects:

```json
{
// Search object
"limit": 100,
"filters": { // Filters object
    "category": { // Category Object
        "id": "9"
    },
    "location": { // Location Object
        "city_zipcodes": [ // Zip Codes object
            {
                "city": "London",
            }
        ],
    },
    "ranges": {
        "price": { // PriceRange Object
            "min": 0,
            "max": 100000
        },
        "rooms": { // RoomRange Object
            "min": 3,
            "max": 5
                }
            }
        }
}
```

We can benefit from the ability of Rust to declare inline structs to split the objects that we want to keep hidden and those we may want to reuse somewhere else:

```rust
/// Main root object
#[derive(Debug, Clone)]
pub struct SearchBody {
    limit: usize,
    category_id: String,
    keyword: Option<String>,
    locations: Vec<Location>,
    ranges: Vec<NamedRange>,
}

/// Location may be reused in the create
#[derive(Debug, Clone)]
pub struct Location {
    name: String,
    zip: Option<u32>,
}

/// Custom serialization for Location
impl Serialize for Location {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let has_zip = self.zip.is_some();
        let field_count = if has_zip { 2 } else { 3 };
        let mut state = serializer.serialize_struct("Location", field_count)?;
        state.serialize_field("city", &self.name)?;

        if has_zip {
            let str_zip = format!("{}", self.zip.unwrap());
            state.serialize_field("zipcode", &str_zip)?;
        }
        state.end()
    }
}

/// NamedRange may be reused in the crate
#[derive(Debug, Clone, Serialize)]
pub struct NamedRange {
    name: String,
    range: Range<usize>,
}


impl Serialize for SearchBody {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        /// Definition of the `Category`, `Loc`, `RangeLimits`,
        /// `Filters` and `JSON` private helpers.

        #[derive(Debug, Serialize)]
        struct Category {
            id: String,
        }

        #[derive(Debug, Serialize)]
        struct Loc {
            city_zipcodes: Vec<Location>,
        }

        #[derive(Debug, Serialize)]
        struct RangeLimits {
            min: usize,
            max: usize,
        }

        #[derive(Debug, Serialize)]
        struct Filters {
            category: Category,
            location: Loc,
            ranges: Map<String, RangeLimits>,
        }

        #[derive(Debug, Serialize)]
        struct JSON {
            limit: usize,
            filters: Filters,
        }

        let mut ranges_map = Map::new();
        for r in &self.ranges {
            ranges_map.insert(
                r.name.clone(),
                RangeLimits {
                    min: r.range.start,
                    max: r.range.end,
                },
            );
        }

        let filters = Filters {
            category: Category {
                id: self.category_id.clone(),
            },
            location: Loc {
                city_zipcodes: self.locations.clone(),
            },
            ranges: ranges_map,
        };

        let js = JSON {
            limit: self.limit,
            filters: filters,
        };

        js.serialize(serializer)
    }
}
```

## Serializing an enum

Serializing enum variants is very similar to serializing structs.

```rust
# #[allow(dead_code)]
enum E {
    // Use three-step process:
    //   1. serialize_struct_variant
    //   2. serialize_field
    //   3. end
    Color { r: u8, g: u8, b: u8 },

    // Use three-step process:
    //   1. serialize_tuple_variant
    //   2. serialize_field
    //   3. end
    Point2D(f64, f64),

    // Use serialize_newtype_variant.
    Inches(u64),

    // Use serialize_unit_variant.
    Instance,
}
#
# fn main() {}
```

## Other special cases

There are two more special cases that are part of the Serializer trait.

There is a method `serialize_bytes` which serializes a `&[u8]`. Some formats
treat bytes like any other seq, but some formats are able to serialize bytes
more compactly. Currently Serde does not use `serialize_bytes` in the
`Serialize` impl for `&[u8]` or `Vec<u8>` but once [specialization] lands in
stable Rust we will begin using it. For now the [`serde_bytes`] crate can be
used to enable efficient handling of `&[u8]` and `Vec<u8>` through
`serialize_bytes`.

[specialization]: https://github.com/rust-lang/rust/issues/31844
[`serde_bytes`]: https://docs.serde.rs/serde_bytes/

Finally, `serialize_some` and `serialize_none` correspond to `Option::Some` and
`Option::None`. Users tend to have different expectations around the `Option`
enum compared to other enums. Serde JSON will serialize `Option::None` as `null`
and `Option::Some` as just the contained value.
