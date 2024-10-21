pragma circom 2.0.0;
// include "node_modules/circomlib/circuits/sha256/sha256_2.circom";
include "node_modules/circomlib/circuits/poseidon.circom";


template MerkleTree(n) {
    signal input leaf;
    signal input pathElements[n];
    signal input pathIndices[n];
    signal output root;
    component hashes[n];
    signal inter[n+1];
    signal left[n];
    signal right[n];
    signal temp1[n];
    signal temp2[n];

    // Initialize the first intermediate value with the leaf
    inter[0] <== leaf;

    for (var i = 0; i < n; i++) {
        hashes[i] = Poseidon(2);

        // Compute the left and right child nodes based on the path index
        temp1[i] <== pathIndices[i] * pathElements[i];
        temp2[i] <== (1 - pathIndices[i]) * pathElements[i];
        left[i] <== pathIndices[i] * inter[i] + temp2[i];
        right[i] <== (1 - pathIndices[i]) * inter[i] + temp1[i];

        // Assign the inputs to the hash component
        hashes[i].inputs[0] <== left[i];
        hashes[i].inputs[1] <== right[i];

        // Update the intermediate value with the output of the current hash component
        inter[i + 1] <== hashes[i].out;
    }

    // Assign the final intermediate value as the root of the Merkle tree
    root <== inter[n];
}

