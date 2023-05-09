use dep::std;

fn hashStuff(solution : [Field; 5], solutionHash : Field) -> bool {

    let hash1 = std::hash::poseidon::bn254::hash_2([1, 2]);
    constrain hash1 == 0x115cc0f5e7d690413df64c6b9662e9cf2a3617f2743245519e19607a4417189a;

    let hash = std::hash::poseidon::bn254::hash_5(solution);
    std::println(hash);
    constrain hash == solutionHash;
    hash == solutionHash
}
