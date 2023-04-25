// This file is purposefully NOT called main.nr because I want to show
// how to use entry_point when compiling via Typescript
mod hash;

// I know I could just have the body of hashStuff here, but I want to
// show how to use a module in Noir
fn main(solution : [Field; 5], solutionHash : pub Field) -> pub bool {
    hash::hashStuff(solution, solutionHash)
}

#[test]
fn test() {
    let solutionHash = 0x1ea96412c20f51694407d443ffa90ec014fb7054065928f14a9bb9f4aaf7828f;
    let solution = [ 52, 49, 50, 54, 54 ];
    constrain main(solution, solutionHash) == true;

}
