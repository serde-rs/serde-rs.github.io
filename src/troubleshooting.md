# Troubleshooting

### Stack overflow

If you are using a [build script](codegen-stable.md), the
`serde_codegen::expand` call can use a lot of stack space. You may see output
like this when building your crate:

```
--- stderr
thread '<main>' has overflowed its stack
fatal runtime error: stack overflow
```

It may help to increase the stack size available to the build script, especially
if the failure is platform-dependent (the build works on Linux and Windows but
not OS X). Try using a 16 MB stack by setting the following environment variable
before invoking `cargo build`:

```
RUST_MIN_STACK=16777216
```
