export enum CellTextAlign {
  right = "text-right",
  center = "text-center",
  left = "text-left",
}
export enum ColumnType {
  boolean = "Boolean",
  integer = "Integer",
  float = "Float",
  string = "String",
  timestamp_s = "Timestamp in Seconds",
  timestamp_ms = "Timestamp in Milliseconds",
  date = "date",
  variant = "Array, object, etc.",
}

export type TableColumn = {
  id: string;
  label: string;
  align?: CellTextAlign;
  type: ColumnType;
  isKey?: boolean;
  isMandatory?: boolean;
  default?: unknown;
  format?: (_value: unknown) => unknown;
  highlight?: boolean;
  invisible?: boolean;
  canFilter?: boolean;
  canSearch?: boolean;
  notOrder?: boolean;
};

export interface Dictionary<T> {
  [key: string]: T;
}

export type TableDataType = Array<Dictionary<unknown>>;

export interface DeepTableProps {
  columnNames: TableColumn[];
  initialRowsValues: TableDataType;
  defaultNbrRowsPerPage?: number;
  displayHeader?: boolean;
  displayPagination?: boolean;
  selectable?: boolean;
  isDenseTable?: boolean;
  displayEditAction?: boolean;
  displayDeleteAction?: boolean;
  displayAddButton?: boolean;
  displayViewAction?: boolean;
  handleAddAction?: (_columnNames: TableColumn[]) => void | Promise<void>;
  handleEditAction?: (_currentRow: Dictionary<unknown>) => void | Promise<void>;
  handleDeleteAction?: (
    _currentRow: Dictionary<unknown>
  ) => void | Promise<void>;
  handleViewAction?: (_currentRow: Dictionary<unknown>) => void | Promise<void>;
  handleRefreshAction?: () => void | Promise<void>;
  selectedRows?: Set<Dictionary<unknown>>;
  setSelectedRows?: React.Dispatch<
    React.SetStateAction<Set<Dictionary<unknown>>>
  >;
  isLoading?: boolean;
  fetchError?: string | null;
}

export interface TableActionHandlers {
  handleAdd: (_columnNames: TableColumn[]) => void | Promise<void>;
  handleEdit: (
    _currentRow: Dictionary<unknown>,
    _columnNames: TableColumn[]
  ) => void | Promise<void>;
  handleDelete: (_currentRow: Dictionary<unknown>) => void | Promise<void>;
  handleView: (_currentRow: Dictionary<unknown>) => void | Promise<void>;
}
