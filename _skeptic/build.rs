fn main() {
    let sources = skeptic::markdown_files_of_directory("../_src");
    skeptic::generate_doc_tests(&sources);
}
