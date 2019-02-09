use glob::glob;

fn main() {
    let sources = glob("../_src/*.md")
        .unwrap()
        .map(|md| md.unwrap().to_str().unwrap().to_owned())
        .collect::<Vec<_>>();
    skeptic::generate_doc_tests(&sources);
}
