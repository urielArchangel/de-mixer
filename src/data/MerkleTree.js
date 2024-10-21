import { buildPoseidon } from "circomlibjs";
import BigNumber from "bignumber.js";

// Poseidon hash function wrapper
async function Phash(left, right) {
  const poseidon = await buildPoseidon();
  let leftV, rightV;
  if (left.length >= 18) {
    leftV = left;
  } else {
    leftV = new BigNumber(left);
  }

  if (right.length >= 18) {
    rightV = right;
  } else {
    rightV = new BigNumber(right);
  }

  return poseidon.F.toString(poseidon([leftV, rightV]));
}

 class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export class MerkleTree {
  constructor() {
    this.root = new TreeNode(""); // Root of the Merkle Tree
    this.pathElement = [];
    this.pathIndices = [];
    this.commitment=''
    this.originalCommitment=''
  }

  // Function to form the Merkle Tree from a breadth-first array of elements
  formMerkleTree(elements) {
    if (elements.length === 0) {
      throw new Error("No elements provided to form the Merkle tree.");
    }

    // Use a queue to construct the tree level by level
    const queue = [this.root];
    let i = 0; // Start from the first element in the array

    while (queue.length > 0 && i < elements.length) {
      const current = queue.shift();

      // Assign left child
      if (i < elements.length) {
        current.left = new TreeNode(elements[i]);
        queue.push(current.left);
        i++;
      }

      // Assign right child
      if (i < elements.length) {
        current.right = new TreeNode(elements[i]);
        queue.push(current.right);
        i++;
      }
    }

    return this.root;
  }

  async calculateRoot(node) {
    if (!this.root.left || !this.root.right) {
      throw new Error("Tree is not fully built or lacks sufficient nodes.");
    }
    if (!node.left) {
      return null;
    }

    const parentNodeLeft = await this.calculateRoot(node.left);

    if (!parentNodeLeft) {
      const left = node.left.value;
      const right = node.right.value;
      let hash = await Phash(left, right);
    

      if (node.right.left) {
        const parentNodeRight = await this.calculateRoot(
          node.right
        );
     
        if (!parentNodeRight) {
          node.value = await Phash(node.left.value, node.right.value);
          if (node.left.value == this.commitment) {
            this.pathElement.push(node.right.value);
            this.pathIndices.push("1");
            if (node.value != "") {
              this.commitment = await Phash(node.left.value, node.right.value);
            }
          }
    
          if (node.right && node.right.value == this.commitment) {
            this.pathElement.push(node.left.value);
            this.pathIndices.push("0");
            if (node.value != "") {
              this.commitment = await Phash(node.left.value, node.right.value);
            }
          }
    
          return null;
        }
      }

      // Await the Phash result
      if (node.value == "") {
        this.root.value = hash;

        return null;
      }

      node.value = hash;
      if (node.left.value == this.commitment) {
        this.pathElement.push(node.right.value);
        this.pathIndices.push("1");
        if (node.value != "") {
          this.commitment = await Phash(node.left.value, node.right.value);
        }
      }

      if (node.right && node.right.value == this.commitment) {
        this.pathElement.push(node.left.value);
        this.pathIndices.push("0");
        if (node.value != "") {
          this.commitment = await Phash(node.left.value, node.right.value);
        }
      }
      return null;
      //   this.root.value = hash; // Update the root value
    }
  }

  async recalculatePaddedRoot(){
    if(this.pathElement.length < 7){
      const l = 7-this.pathElement.length
      this.pathElement.push(...Array(l).fill("0"))
      this.pathIndices.push(...Array(l).fill("0"))
    }
    let temp = this.originalCommitment
    for(let i=0;i<7;i++){
      if(this.pathIndices[i] == 0){
        temp = await Phash(this.pathElement[i],temp)
      }else{
        temp = await Phash(temp,this.pathElement[i])

      }
    }
    this.root.value = temp
  }
}

// (async () => {
//   const a = new MerkleTree();
//   a.formMerkleTree(["1", "2", "3","4","5","7","8","9","10", "0"]);
//   a.commitment="10"
//   a.originalCommitment="10"
//   await a.calculateRoot(a.root);
  
//   await a.recalculatePaddedRoot()
//   console.log({root:a.root,pe:a.pathElement,pi:a.pathIndices})
// })();
