use dep::std;

fn hashStuff(solution : [u8; 32], solutionHash : [u8; 32]) -> bool {
    let hash = std::hash::sha256(solution);
    constrain hash == solutionHash;
    hash == solutionHash
}
