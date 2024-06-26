# Validating containers on deserialization

When a struct must meet certain conditions across its fields, it is
useful to ensure deserialization enforces those conditions.

We can implement this pattern by introducing an intermediate type whose
deserialization is derived by `serde`, then use the `try_from` directive
on the user-facing type.

For example, suppose we have a struct `MyType` with two `Option` fields,
and we want to ensure every `MyType` value has at least one `Some` field:

```
use serde::Deserialize;
use serde_json;

// The target is to not allow deserialization if option1 & option2 are none
#[derive(Deserialize, Debug)]
#[serde(try_from = "MyTypeShadow")]
pub struct MyType {
    option1: Option<usize>,
    option2: Option<usize>,
}

// The shadow type only has to implement Deserialize
#[derive(Deserialize)]
struct MyTypeShadow {
    option1: Option<usize>,
    option2: Option<usize>,
}

pub struct MyTypeValidationError;

// The error type has to implement Display
impl std::fmt::Display for MyTypeValidationError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(formatter, "option1 and option2 cannot be null")
    }
}

impl std::convert::TryFrom<MyTypeShadow> for MyType {
    type Error = MyTypeValidationError;
    fn try_from(shadow: MyTypeShadow) -> Result<Self, Self::Error> {
        let MyTypeShadow { option1, option2 } = shadow;
        if option1.is_none() && option2.is_none() {
            return Err(MyTypeValidationError);
        }
        // Any other validations
        Ok(MyType { option1, option2 })
    }
}

fn main() {
    // This will return an Err
    println!("{:?}", serde_json::from_str::<MyType>(r##"{}"##));
    // This will work
    println!(
        "{:?}",
        serde_json::from_str::<MyType>(r##"{"option1": 20}"##)
    );
}
```
