# Next JS TypeScript Table Component

## Overview

The **DeepTable** component is a comprehensive, feature-rich data table solution built with React and TypeScript. It provides advanced functionality including sorting, filtering, searching, pagination, row selection, and CRUD operations with a modern, responsive design.

## Features

- ✅ **Responsive Design**: Automatically adapts to different screen sizes
- ✅ **Row Selection**: Single and multi-row selection with select all functionality
- ✅ **Pagination**: Configurable page size and navigation
- ✅ **Sorting**: Column-based sorting with visual indicators
- ✅ **Filtering**: Advanced filtering by column values
- ✅ **Searching**: Text-based search across searchable columns
- ✅ **CRUD Operations**: Built-in support for Create, Read, Update, Delete actions
- ✅ **Loading States**: Visual feedback during async operations
- ✅ **Error Handling**: Graceful error display and recovery
- ✅ **Customizable Appearance**: Dense/comfortable table layouts
- ✅ **Type Safety**: Full TypeScript support

## Installation & Usage

### Basic Usage

```tsx
import DeepTable from './deepTable/DeepTable';
import { TableColumn, ColumnType, CellTextAlign } from './deepTable/types';

// Define your columns
const columns: TableColumn[] = [
  {
    id: 'id',
    label: 'ID',
    type: ColumnType.string,
    align: CellTextAlign.left,
    isKey: true,
    isMandatory: true
  },
  {
    id: 'name',
    label: 'Name',
    type: ColumnType.string,
    canSearch: true
  }
];

// Define your data
const data = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' }
];

// Use the component
function MyComponent() {
  return (
    <DeepTable
      columnNames={columns}
      initialRowsValues={data}
    />
  );
}
```

### Advanced Usage with Row Selection and CRUD Operations

```tsx
import { useState } from 'react';
import DeepTable from './deepTable/DeepTable';
import { Dictionary } from './deepTable/types';

function AdvancedTable() {
  const [selectedRows, setSelectedRows] = useState<Set<Dictionary<unknown>>>(new Set());

  const handleAdd = async (columns: TableColumn[]) => {
    // Handle add operation
    console.log('Adding new row with columns:', columns);
  };

  const handleEdit = async (row: Dictionary<unknown>, columns: TableColumn[]) => {
    // Handle edit operation
    console.log('Editing row:', row);
  };

  const handleDelete = async (row: Dictionary<unknown>) => {
    // Handle delete operation
    console.log('Deleting row:', row);
  };

  const handleView = async (row: Dictionary<unknown>) => {
    // Handle view operation
    console.log('Viewing row:', row);
  };

  return (
    <DeepTable
      columnNames={columns}
      initialRowsValues={data}
      selectable={true}
      displayAddButton={true}
      displayEditAction={true}
      displayDeleteAction={true}
      displayViewAction={true}
      handleAddAction={handleAdd}
      handleEditAction={handleEdit}
      handleDeleteAction={handleDelete}
      handleViewAction={handleView}
      selectedRows={selectedRows}
      setSelectedRows={setSelectedRows}
      defaultNbrRowsPerPage={20}
      isDenseTable={false}
    />
  );
}
```

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `columnNames` | `TableColumn[]` | Array of column definitions that describe the table structure |
| `initialRowsValues` | `TableDataType` | Array of row data objects to display in the table |

### Optional Props

#### Display & Layout Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultNbrRowsPerPage` | `number` | `10` | Number of rows to display per page |
| `displayPagination` | `boolean` | `true` | Whether to show pagination controls |
| `isDenseTable` | `boolean` | `true` | Use compact row spacing when true, comfortable spacing when false |

#### Selection Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectable` | `boolean` | `false` | Enable row selection checkboxes |
| `selectedRows` | `Set<Dictionary<unknown>>` | `new Set()` | Set of currently selected rows |
| `setSelectedRows` | `React.Dispatch<React.SetStateAction<Set<Dictionary<unknown>>>>` | `() => {}` | Function to update selected rows state |

#### Action Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `displayAddButton` | `boolean` | `false` | Show the "Add New" button in the upper menu |
| `displayEditAction` | `boolean` | `false` | Show edit buttons for each row |
| `displayDeleteAction` | `boolean` | `false` | Show delete buttons for each row |
| `displayViewAction` | `boolean` | `false` | Show view buttons for each row |

#### Action Handler Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `handleAddAction` | `(columns: TableColumn[]) => void \| Promise<void>` | `() => {}` | Function called when add button is clicked |
| `handleEditAction` | `(row: Dictionary<unknown>, columns: TableColumn[]) => void \| Promise<void>` | `() => {}` | Function called when edit button is clicked |
| `handleDeleteAction` | `(row: Dictionary<unknown>) => void \| Promise<void>` | `() => {}` | Function called when delete button is clicked |
| `handleViewAction` | `(row: Dictionary<unknown>) => void \| Promise<void>` | `() => {}` | Function called when view button is clicked |

## TableColumn Type Reference

The `TableColumn` type defines the structure and behavior of each column:

```typescript
type TableColumn = {
  id: string;                    // Unique identifier for the column
  label: string;                 // Display name for the column header
  align?: CellTextAlign;         // Text alignment (left, center, right)
  type: ColumnType;              // Data type for proper handling
  isKey?: boolean;               // Mark as primary key column
  isMandatory?: boolean;         // Required field for forms
  default?: unknown;             // Default value for new rows
  format?: (value: unknown) => unknown;  // Custom formatting function
  highlight?: boolean;           // Apply visual highlighting
  invisible?: boolean;           // Hide column from display
  canFilter?: boolean;           // Enable filtering for this column
  canSearch?: boolean;           // Include in search functionality
  notOrder?: boolean;            // Disable sorting for this column
};
```

### Column Type Options

This section describes all supported column types in the DeepTable component and their display behaviors.

#### Basic Types

##### `ColumnType.boolean`
- **Display**: Rendered as disabled checkboxes
- **Values**: `true`, `false`, `"true"`, `"false"`, `1`, `0`, `"1"`, `"0"`
- **Null handling**: Shows `—` for `null` or `undefined` values
- **Example**: `is_dangerous: true` → ✓ (checked checkbox)

##### `ColumnType.integer`
- **Display**: Rendered as plain text
- **Values**: Whole numbers
- **Example**: `max_age: 12` → "12"

##### `ColumnType.float`
- **Display**: Rendered as plain text with decimal places
- **Values**: Decimal numbers
- **Example**: `hight: 24.5` → "24.5"

##### `ColumnType.string`
- **Display**: Rendered as plain text
- **Values**: Any text content
- **Example**: `name: "Golden Retriever"` → "Golden Retriever"

#### Date/Time Types

##### `ColumnType.timestamp_s`
- **Display**: Formatted date/time in German locale (de-DE)
- **Values**: Unix timestamp in seconds
- **Null handling**: Shows `—` for `null` or `undefined` values
- **Example**: `registration_timestamp_s: 1640995200` → "01.01.22, 00:00"

##### `ColumnType.timestamp_ms`
- **Display**: Formatted date/time in German locale (de-DE)
- **Values**: Unix timestamp in milliseconds
- **Null handling**: Shows `—` for `null` or `undefined` values
- **Example**: `last_checkup_timestamp_ms: 1704067200000` → "01.01.24, 00:00"

##### `ColumnType.date`
- **Display**: Formatted date/time in German locale (de-DE)
- **Values**: Date as epoch milliseconds
- **Null handling**: Shows `—` for `null` or `undefined` values
- **Example**: `birth_date: 1609459200000` → "01.01.21, 00:00"

#### Complex Types

##### `ColumnType.variant`
- **Display**: Smart rendering based on data type
- **Array values**: Shows "Array (length)" with preview of first 2 items
- **Object values**: Shows "Object" with truncated JSON representation
- **Primitive values**: Shows string representation
- **Null/undefined**: Shows "null" in italic gray text
- **Examples**:
  - `["Friendly", "Smart", "Loyal"]` → "Array (3) ["Friendly", "Smart"...]"
  - `{temperament: "Gentle"}` → "Object {"temperament":"Gentle"}"
  - `"Simple text"` → "Simple text"
  - `null` → "null" (italic gray)

#### Complete ColumnType Enum

```typescript
enum ColumnType {
  boolean = "Boolean",
  integer = "Integer", 
  float = "Float",
  string = "String",
  timestamp_s = "Timestamp in Seconds",
  timestamp_ms = "Timestamp in Milliseconds",
  date = "date",
  variant = "Array, object, etc."
}
```

#### Sample Data Structure with All Types

```typescript
{
  id: "1",                                 // ColumnType.string
  name: "Golden Retriever",                // ColumnType.string
  country: "Scotland",                     // ColumnType.string
  max_age: 12,                            // ColumnType.integer
  hight: 24.0,                            // ColumnType.float
  width: 65.0,                            // ColumnType.float
  is_dangerous: false,                     // ColumnType.boolean
  registration_timestamp_s: 1640995200,   // ColumnType.timestamp_s
  last_checkup_timestamp_ms: 1704067200000, // ColumnType.timestamp_ms
  birth_date: 1609459200000,              // ColumnType.date
  characteristics: {                       // ColumnType.variant
    temperament: ["Friendly", "Intelligent"],
    energy_level: "High"
  }
}
```

#### Column Configuration Example

When defining columns in your headers, specify the appropriate type:

```typescript
{
  id: "registration_timestamp_s",
  label: "Registration",
  align: CellTextAlign.center,
  type: ColumnType.timestamp_s,  // Automatically formats timestamps
}
```

#### Data Examples in the Project

The project includes comprehensive example data in:
- `src/app/data/dataList.ts` - Sample dog breed data with all column types
- `src/app/data/headers.ts` - Column definitions showing type usage  
- `src/app/data/dataTypeExamples.ts` - Comprehensive examples of each type

#### Null/Undefined Handling

All timestamp and date types show `—` for null/undefined values, while variant types show "null" in italic gray text. This provides consistent visual feedback for missing data across different column types.

### Text Alignment Options

```typescript
enum CellTextAlign {
  left = "text-left",
  center = "text-center", 
  right = "text-right"
}
```

## Data Structure

### Row Data Format

Each row should be a dictionary object where keys correspond to column `id` values:

```typescript
type Dictionary<T> = {
  [key: string]: T;
};

type TableDataType = Array<Dictionary<unknown>>;

// Example data
const rowData = [
  {
    id: "1",
    name: "Golden Retriever",
    country: "Scotland", 
    max_age: 15,
    height: 61.0,
    appearance_date: "1865"
  },
  {
    id: "2", 
    name: "Labrador",
    country: "Canada",
    max_age: 14,
    height: 57.0,
    appearance_date: "1830"
  }
];
```

## Component Features Explained

### 1. Row Selection

When `selectable={true}`, the table provides:
- Individual row checkboxes
- "Select All" checkbox in the header
- Visual feedback for selected rows
- Programmatic selection management

```tsx
// Managing selected rows
const [selectedRows, setSelectedRows] = useState<Set<Dictionary<unknown>>>(new Set());

// Access selected rows
console.log('Selected count:', selectedRows.size);
selectedRows.forEach(row => console.log('Selected row:', row));
```

### 2. Pagination

The pagination system automatically:
- Divides data into pages
- Provides navigation controls
- Maintains selection state across pages
- Updates when data changes

### 3. Sorting

Columns are sortable by default unless `notOrder: true` is set:
- Click column headers to sort
- Visual indicators show sort direction
- Supports multiple data types
- Maintains sort state during filtering

### 4. Filtering & Searching

- **Filtering**: Available for columns with `canFilter: true`
- **Searching**: Available for columns with `canSearch: true`
- Both features work together and maintain other table states

### 5. CRUD Operations

The component provides hooks for all CRUD operations:

```tsx
// Create
const handleAdd = async (columns: TableColumn[]) => {
  // columns contains the table structure
  // Implement your add logic here
};

// Read (View)
const handleView = async (row: Dictionary<unknown>) => {
  // row contains all the row data
  // Implement your view logic here
};

// Update (Edit)  
const handleEdit = async (row: Dictionary<unknown>, columns: TableColumn[]) => {
  // row contains current row data
  // columns contains the table structure
  // Implement your edit logic here
};

// Delete
const handleDelete = async (row: Dictionary<unknown>) => {
  // row contains the row to delete
  // Implement your delete logic here
};
```

### 6. Loading States & Error Handling

The component automatically handles:
- Loading overlays during async operations
- Error boundaries with recovery options
- Graceful fallbacks for invalid data

## Best Practices

### 1. Column Configuration

```tsx
// Good: Properly configured columns
const columns: TableColumn[] = [
  {
    id: 'id',
    label: 'ID', 
    type: ColumnType.string,
    isKey: true,          // Mark primary keys
    highlight: true       // Highlight important columns
  },
  {
    id: 'name',
    label: 'Full Name',
    type: ColumnType.string,
    canSearch: true,      // Enable search for text fields
    isMandatory: true     // Mark required fields
  },
  {
    id: 'price',
    label: 'Price ($)',
    type: ColumnType.float,
    align: CellTextAlign.right,  // Right-align numbers
    canFilter: true,             // Enable filtering for categories
    format: (value) => `$${value.toFixed(2)}`  // Custom formatting
  }
];
```

### 2. Performance Optimization

```tsx
// Use useMemo for large datasets
const memoizedData = useMemo(() => {
  return expensiveDataTransformation(rawData);
}, [rawData]);

// Use useCallback for action handlers
const handleEdit = useCallback(async (row, columns) => {
  await editRow(row);
  // Refresh data if needed
}, []);
```

### 3. Error Handling

```tsx
const handleDelete = async (row: Dictionary<unknown>) => {
  try {
    await deleteAPI(row.id);
    // Update your data source
    setData(prev => prev.filter(item => item.id !== row.id));
  } catch (error) {
    // Handle errors appropriately
    console.error('Delete failed:', error);
    // Consider showing user feedback
  }
};
```

## Common Use Cases

### 1. Read-Only Data Display

```tsx
<DeepTable
  columnNames={columns}
  initialRowsValues={data}
  displayPagination={true}
  defaultNbrRowsPerPage={25}
/>
```

### 2. Data Management Interface

```tsx
<DeepTable
  columnNames={columns}
  initialRowsValues={data}
  selectable={true}
  displayAddButton={true}
  displayEditAction={true}
  displayDeleteAction={true}
  handleAddAction={handleAdd}
  handleEditAction={handleEdit}
  handleDeleteAction={handleDelete}
  selectedRows={selectedRows}
  setSelectedRows={setSelectedRows}
/>
```

### 3. Report Viewer

```tsx
<DeepTable
  columnNames={reportColumns}
  initialRowsValues={reportData}
  displayViewAction={true}
  handleViewAction={handleViewDetails}
  isDenseTable={true}
  defaultNbrRowsPerPage={50}
/>
```

## Troubleshooting

### Common Issues

1. **Data not updating**: Ensure `initialRowsValues` is properly updated when your data source changes
2. **Selection not working**: Make sure to provide both `selectedRows` and `setSelectedRows` props
3. **Actions not triggering**: Verify that action handler functions are properly defined
4. **Performance issues**: Consider implementing virtual scrolling for very large datasets
5. **Styling conflicts**: The component uses Tailwind CSS classes - ensure they're available

### TypeScript Issues

```tsx
// Ensure proper typing for row data
interface MyRowType {
  id: string;
  name: string;
  value: number;
}

// Type your data properly
const typedData: MyRowType[] = [...];
const tableData: TableDataType = typedData;
```

## Dependencies

The DeepTable component requires:
- React 18+
- TypeScript 4.5+
- Tailwind CSS (for styling)

## Contributing

When extending the DeepTable component:
1. Maintain TypeScript strict mode compliance
2. Follow the existing naming conventions
3. Add proper JSDoc comments for new props
4. Update this documentation for any API changes
5. Test with various data sizes and types

---

*This documentation covers the core functionality of the DeepTable component. For specific implementation details or advanced customization, refer to the component source code.*

# DeepTable Color Configuration Guide

This guide explains how the DeepTable component's color system works and how to customize it for your project.

## Overview

The DeepTable component now uses a completely isolated color system that won't be affected by other project color schemes. All colors are defined using CSS custom properties with the `--deep-table-` prefix.

## Files Modified

1. **`tailwind.config.ts`** - Extended with DeepTable-specific color definitions
2. **`deep-table-theme.css`** - New CSS file containing all color variable definitions
3. **All DeepTable component files** - Updated to use the new color classes

## Color Scheme Structure

### Primary Colors
Used for headers, active states, and primary actions:
- `deep-table-primary` - Main brand color (#009ee3)
- `deep-table-primary-light` - Light variant for selections (#afd3e8)
- `deep-table-primary-medium` - Medium variant for hover states (#007caa)
- `deep-table-primary-dark` - Dark variant for text (#00597a)

### Secondary Colors
Used for borders, backgrounds, and secondary text:
- `deep-table-secondary-100` - Lightest gray (#e6ecf0)
- `deep-table-secondary-200` - Light gray for borders (#c3ced5)
- `deep-table-secondary-300` - Medium gray for borders (#8fa2ac)
- `deep-table-secondary-400` - Dark gray for text (#506671)
- `deep-table-secondary-500` - Darker gray for secondary text (#3d525a)

### Content Colors
Used for specific actions and highlights:
- `deep-table-content-yellow` - Sort indicators (#ffcc00)
- `deep-table-content-red` - Delete actions and errors (#d50c2f)
- `deep-table-content-orange` - Edit actions (#e94c0a)

### Background Colors
Used for various background contexts:
- `deep-table-bg-main` - Main container background (#f4f4f5)
- `deep-table-bg-white` - White backgrounds (#ffffff)
- `deep-table-bg-error` - Error state backgrounds (#fef2f2)

### Semantic Colors
Used for specific UI states:
- `deep-table-semantic-pink-text` - Clear/unselect actions (#9f1239)

## How to Customize Colors

### Method 1: Override CSS Variables (Recommended)

In your project's global CSS file, override the CSS custom properties:

```css
:root {
  /* Customize primary colors */
  --deep-table-primary: #your-brand-color;
  --deep-table-primary-light: #your-light-color;
  --deep-table-primary-medium: #your-medium-color;
  --deep-table-primary-dark: #your-dark-color;
  
  /* Customize secondary colors */
  --deep-table-secondary-100: #your-light-gray;
  --deep-table-secondary-200: #your-border-color;
  /* ... etc */
}
```

### Method 2: Modify the Theme File

Edit the `src/app/deepTable/deep-table-theme.css` file directly to change the default color values.

### Method 3: Tailwind Config Override

In your `tailwind.config.ts`, you can override the DeepTable colors:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        'deep-table': {
          primary: {
            DEFAULT: '#your-color',
            // ... other variants
          }
        }
      }
    }
  }
}
```

## Usage in Other Projects

When using the DeepTable component in other projects:

1. **Copy the theme file**: Include `deep-table-theme.css` in your project
2. **Import in your main component**: The DeepTable component automatically imports this file
3. **Customize as needed**: Override the CSS variables to match your brand colors

## Benefits of This Approach

1. **Isolation**: DeepTable colors won't conflict with your project's color scheme
2. **Consistency**: All DeepTable instances will use the same colors regardless of the parent project
3. **Customizable**: Easy to customize while maintaining the component's visual integrity
4. **Maintainable**: Centralized color definitions make updates easy
5. **Backward Compatible**: Legacy color classes are still supported for gradual migration

## Color Mapping Reference

| Component | Element | Color Class | CSS Variable |
|-----------|---------|-------------|--------------|
| Table Header | Background | `bg-deep-table-primary` | `--deep-table-primary` |
| Table Header | Text | `text-white` | Standard white |
| Table Header | Hover | `hover:bg-deep-table-primary-medium` | `--deep-table-primary-medium` |
| Table Row | Background | `bg-deep-table-bg-white` | `--deep-table-bg-white` |
| Table Row | Hover | `hover:bg-deep-table-secondary-100` | `--deep-table-secondary-100` |
| Table Row | Selected | `bg-deep-table-primary-light` | `--deep-table-primary-light` |
| Borders | Table/Input | `border-deep-table-secondary-200` | `--deep-table-secondary-200` |
| Text | Primary | `text-deep-table-primary-dark` | `--deep-table-primary-dark` |
| Text | Secondary | `text-deep-table-secondary-400` | `--deep-table-secondary-400` |
| Actions | Edit | `text-deep-table-content-orange` | `--deep-table-content-orange` |
| Actions | Delete | `text-deep-table-content-red` | `--deep-table-content-red` |
| Actions | View | `text-deep-table-primary` | `--deep-table-primary` |
| Sort Icons | Active | `text-deep-table-content-yellow` | `--deep-table-content-yellow` |

## Migration Notes

- All existing color classes have been replaced with the new namespaced versions
- The component now includes a `deep-table-container` class wrapper for scoping
- Legacy color support is maintained in the Tailwind config for backward compatibility
- The CSS file is automatically imported by the main DeepTable component

This color system ensures that your DeepTable component will maintain its visual consistency regardless of the project it's used in, while still allowing for easy customization when needed.
