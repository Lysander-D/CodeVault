export type CategoryType = string;

export interface CodeItem {
  id: string;
  value: string;
  prefix: string;
  category: CategoryType;
  isUsed: boolean;
  createdAt: number;
}

export type CodeGroup = {
  prefix: string;
  codes: CodeItem[];
};