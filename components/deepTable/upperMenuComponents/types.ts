import { ColumnType } from "../types";

export type FilterableColumnType =
  | ColumnType.string
  | ColumnType.integer
  | ColumnType.boolean;

export function isFilterableColumnType(
  type: ColumnType
): type is FilterableColumnType {
  return (
    type === ColumnType.string ||
    type === ColumnType.integer ||
    type === ColumnType.boolean
  );
}

export type Filter = {
  [key: string]: string | number | boolean | null;
};
