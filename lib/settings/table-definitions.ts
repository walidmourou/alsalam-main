import {
  CellTextAlign,
  ColumnType,
  TableColumn,
} from "@/components/deepTable/types";

export const tableOptions = [
  { key: "classRooms", label: "Class Rooms" },
  { key: "educationLevels", label: "Education Levels" },
  { key: "educationYears", label: "Education Years" },
  { key: "incomingTypes", label: "Incoming Types" },
  { key: "membershipStatuses", label: "Membership Statuses" },
  { key: "membershipTypes", label: "Membership Types" },
  { key: "purchaseCategories", label: "Purchase Categories" },
  { key: "relationshipTypes", label: "Relationship Types" },
] as const;

export type TableKey = (typeof tableOptions)[number]["key"];

export type TableDefinition = {
  label: string;
  columns: TableColumn[];
};

export const tableDefinitions: Record<TableKey, TableDefinition> = {
  classRooms: {
    label: "Class Rooms",
    columns: [
      {
        id: "id",
        label: "ID",
        type: ColumnType.integer,
        align: CellTextAlign.left,
        isKey: true,
      },
      {
        id: "label",
        label: "Label",
        align: CellTextAlign.left,
        type: ColumnType.string,
        canSearch: true,
        canFilter: true,
        isMandatory: true,
      },
    ],
  },
  educationLevels: {
    label: "Education Levels",
    columns: [
      {
        id: "id",
        label: "ID",
        type: ColumnType.integer,
        align: CellTextAlign.left,
        isKey: true,
      },
      {
        id: "label",
        label: "Label",
        type: ColumnType.string,
        align: CellTextAlign.left,
        canSearch: true,
        canFilter: true,
        isMandatory: true,
      },
      {
        id: "description",
        label: "Description",
        type: ColumnType.string,
        align: CellTextAlign.left,
      },
      {
        id: "sortOrder",
        label: "Sort Order",
        type: ColumnType.integer,
        canFilter: true,
      },
    ],
  },
  educationYears: {
    label: "Education Years",
    columns: [
      {
        id: "id",
        label: "ID",
        type: ColumnType.integer,
        align: CellTextAlign.left,
        isKey: true,
      },
      {
        id: "label",
        label: "Label",
        type: ColumnType.string,
        align: CellTextAlign.left,
        canSearch: true,
        canFilter: true,
        isMandatory: true,
      },
      {
        id: "startDate",
        label: "Start Date",
        type: ColumnType.date,
        canFilter: true,
      },
      {
        id: "endDate",
        label: "End Date",
        type: ColumnType.date,
        canFilter: true,
      },
    ],
  },
  incomingTypes: {
    label: "Incoming Types",
    columns: [
      {
        id: "id",
        label: "ID",
        type: ColumnType.integer,
        align: CellTextAlign.left,
        isKey: true,
      },
      {
        id: "label",
        label: "Label",
        type: ColumnType.string,
        align: CellTextAlign.left,
        canSearch: true,
        canFilter: true,
        isMandatory: true,
      },
    ],
  },
  membershipStatuses: {
    label: "Membership Statuses",
    columns: [
      {
        id: "id",
        label: "ID",
        type: ColumnType.integer,
        align: CellTextAlign.left,
        isKey: true,
      },
      {
        id: "label",
        label: "Label",
        type: ColumnType.string,
        align: CellTextAlign.left,
        canSearch: true,
        canFilter: true,
        isMandatory: true,
      },
    ],
  },
  membershipTypes: {
    label: "Membership Types",
    columns: [
      {
        id: "id",
        label: "ID",
        type: ColumnType.integer,
        align: CellTextAlign.left,
        isKey: true,
      },
      {
        id: "label",
        label: "Label",
        type: ColumnType.string,
        align: CellTextAlign.left,
        canSearch: true,
        canFilter: true,
        isMandatory: true,
      },
      {
        id: "description",
        label: "Description",
        type: ColumnType.string,
        align: CellTextAlign.left,
      },
      {
        id: "monthlyFee",
        label: "Monthly Fee",
        type: ColumnType.float,
        canFilter: true,
      },
      {
        id: "annualFee",
        label: "Annual Fee",
        type: ColumnType.float,
        canFilter: true,
      },
    ],
  },
  purchaseCategories: {
    label: "Purchase Categories",
    columns: [
      {
        id: "id",
        label: "ID",
        type: ColumnType.integer,
        align: CellTextAlign.left,
        isKey: true,
      },
      {
        id: "label",
        label: "Label",
        type: ColumnType.string,
        align: CellTextAlign.left,
        canSearch: true,
        canFilter: true,
        isMandatory: true,
      },
      {
        id: "parentCategoryId",
        label: "Parent Category ID",
        type: ColumnType.integer,
        canFilter: true,
      },
    ],
  },
  relationshipTypes: {
    label: "Relationship Types",
    columns: [
      {
        id: "id",
        label: "ID",
        type: ColumnType.integer,
        align: CellTextAlign.left,
        isKey: true,
      },
      {
        id: "label",
        label: "Label",
        type: ColumnType.string,
        align: CellTextAlign.left,
        canSearch: true,
        canFilter: true,
        isMandatory: true,
      },
    ],
  },
};

export const tableDisplayName = (key: TableKey) => tableDefinitions[key].label;

export const parseValue = (input: string, type: ColumnType): unknown => {
  const trimmed = input.trim();
  if (trimmed === "") return null;

  switch (type) {
    case ColumnType.integer: {
      const parsed = Number(trimmed);
      return Number.isInteger(parsed) ? parsed : trimmed;
    }
    case ColumnType.float: {
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : trimmed;
    }
    case ColumnType.boolean: {
      const lowered = trimmed.toLowerCase();
      if (lowered === "true" || lowered === "1") return true;
      if (lowered === "false" || lowered === "0") return false;
      return trimmed;
    }
    default:
      return trimmed;
  }
};
