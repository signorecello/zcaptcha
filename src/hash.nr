use dep::std;

fn hashStuff(solution : [Field; 5], solutionHash : Field) -> bool {
    let hash = std::hash::poseidon::bn254::hash_5(solution);
    std::println(hash);
    constrain hash == solutionHash;
    hash == solutionHash
}
