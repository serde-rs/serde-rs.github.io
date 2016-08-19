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
not macOS). Serde codegen uses a 16 MB stack by default but it is configurable
by the `RUST_MIN_STACK` environment variable. A larger value may be necessary.

```
RUST_MIN_STACK=33554432
```
