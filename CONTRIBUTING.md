## Content changes

When contributing content, please only make your changes in the markdown files
under the `_src` directory. The person merging your pull request will deal with
re-generating the html files at the root of the repo.

<!---
Here is what I run:

$ node_modules/.bin/gitbook build && rm -rf gitbook styles && mv _book/* .
-->

If your contribution touches example code inside a <code>```rust</code> code
block which has a `!PLAYGROUND` on the previous line, the hash on that line
needs to be updated by pasting the new code into play.rust-lang.org, clicking
Share, and grabbing the new hash from the generated "Permalink to the
playground" link.
