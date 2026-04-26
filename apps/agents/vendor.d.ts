// Type declarations for packages without bundled types

declare module "papaparse" {
  interface ParseConfig {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    dynamicTyping?: boolean;
    preview?: number;
    comments?: boolean | string;
    step?: (results: ParseResult<unknown>, parser: unknown) => void;
    complete?: (results: ParseResult<unknown>) => void;
    error?: (error: unknown) => void;
    skipEmptyLines?: boolean | "greedy";
    fastMode?: boolean;
    transform?: (value: string, field: string | number) => unknown;
    transformHeader?: (header: string, index: number) => string;
  }

  interface ParseResult<T> {
    data: T[];
    errors: Array<{
      type: string;
      code: string;
      message: string;
      row?: number;
    }>;
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      fields?: string[];
    };
  }

  export function parse<T = string[]>(
    input: string,
    config?: ParseConfig
  ): ParseResult<T>;

  export function unparse(
    data: unknown[][] | { fields: string[]; data: unknown[][] },
    config?: { delimiter?: string; newline?: string; quotes?: boolean }
  ): string;
}

declare module "react-data-grid" {
  import type { ComponentType } from "react";

  export interface Column<TRow = Record<string, unknown>> {
    key: string;
    name: string;
    width?: number | string;
    frozen?: boolean;
    resizable?: boolean;
    sortable?: boolean;
    renderCell?:
      | ComponentType<{ rowIdx: number; row: TRow }>
      | ((props: { rowIdx: number; row: TRow }) => React.ReactNode);
    renderEditCell?: ComponentType<unknown>;
    cellClass?: string;
    headerCellClass?: string;
  }

  export interface DataGridProps<TRow = Record<string, unknown>> {
    columns: Column<TRow>[];
    rows: TRow[];
    onRowsChange?: (rows: TRow[]) => void;
    onCellClick?: (args: {
      column: Column<TRow>;
      row: TRow;
      selectCell: (enableEditor: boolean) => void;
    }) => void;
    className?: string;
    style?: React.CSSProperties;
    defaultColumnOptions?: Partial<Column<TRow>>;
    enableVirtualization?: boolean;
  }

  declare const DataGrid: <TRow = Record<string, unknown>>(
    props: DataGridProps<TRow>
  ) => JSX.Element;
  export default DataGrid;
  export declare const textEditor: ComponentType<unknown>;
}

declare module "diff-match-patch" {
  class DiffMatchPatch {
    Edit_Cost: number;
    diff_main(text1: string, text2: string): Array<[number, string]>;
    diff_cleanupSemantic(diffs: Array<[number, string]>): void;
    diff_cleanupEfficiency(diffs: Array<[number, string]>): void;
  }
  export default DiffMatchPatch;
}

declare module "codemirror" {
  import type { Extension } from "@codemirror/state";
  export const basicSetup: Extension;
}
