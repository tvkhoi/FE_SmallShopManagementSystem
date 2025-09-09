export interface TreeNode {
  key: string;
  title: string;
  children?: TreeNode[];
  isLeaf?: boolean;
  checked?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  id?: number;
}