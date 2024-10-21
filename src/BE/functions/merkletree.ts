import { MerkleTree } from "@/src/data/MerkleTree";

export const calculateSpecificRoot = async (
  commitments: string[],
  c: string
) => {
  console.log("hi", String(c));

  const m = new MerkleTree();

  m.formMerkleTree(commitments);

  m.commitment = String(c);
  m.originalCommitment = String(c);
  await m.calculateRoot(m.root);

  await m.recalculatePaddedRoot();
  return m.root.value;
};

export const buildPathToRoot = async (
  commitmentLong: string,
  commitments: string[]
) => {
  const m = new MerkleTree();
  m.formMerkleTree(commitments);

  m.commitment = commitmentLong;
  m.originalCommitment = commitmentLong;
  await m.calculateRoot(m.root);

  await m.recalculatePaddedRoot();
  return {
    root: m.root.value,
    pathElements: m.pathElement,
    pathIndices: m.pathIndices,
  };
};
