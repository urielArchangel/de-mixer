pragma circom 2.1.0;
include "merkleTree.circom";

template Mixer(n) {
    signal input leaf;
    signal input pathElements[n];
    signal input pathIndices[n];
    signal input root;
    signal output isValidRoot;



    // Compute the root of the Merkle tree from the provided leaf and path
    component tree = MerkleTree(n);
    tree.leaf <== leaf;
    for (var i = 0; i < n; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }


    // log(root,tree.root);

// Enforce the difference to be zero
isValidRoot <== tree.root - root;


}

component main = Mixer(7);


