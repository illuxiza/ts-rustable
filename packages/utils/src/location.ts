/**
 * Represents information about a caller in the stack trace
 */
interface Caller {
  /** Function name or file name if anonymous */
  name: string;
  /** Full file path with line and column */
  path: string;
  /** File name without path */
  file: string;
  /** Line number */
  line: number;
  /** Column number */
  column: number;
}

/**
 * Utility class for getting stack trace and caller information
 */
export class Location {
  private _stack: Caller[];

  constructor() {
    // Skip first two lines: Error and Location constructor
    const stack = new Error().stack?.split('\n').slice(2) || [];
    this._stack = stack.map((s) => this.parseStackLine(s));
  }

  /**
   * Parse a single line from the stack trace
   */
  private parseStackLine(stackLine: string): Caller {
    const reg = /\(([^)]*)\)/g;
    const matches = [...stackLine.matchAll(reg)].map((m) => m[1].trim());
    let path = matches[matches.length - 1];

    // Handle case where path is not in parentheses
    if (!path) {
      path = stackLine.replace('at', '').trim();
    }

    // Parse file information - handle both Windows and Unix paths
    const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    const fileInfo = path.substring(lastSlashIndex + 1).split(':');
    const file = fileInfo[0];
    const line = parseInt(fileInfo[1]);
    const column = parseInt(fileInfo[2]);

    // Extract function name
    let name = stackLine.replace(`(${path})`, '').replace('at', '').trim();
    if (path === name) {
      name = file;
    }

    return {
      name,
      path,
      file,
      line,
      column,
    };
  }

  /**
   * Gets the caller at a specific depth in the stack
   * @param depth Stack depth (0 = current function, 1 = immediate caller, etc.)
   * @returns Caller information or undefined if depth exceeds stack size
   *
   * @example
   * ```typescript
   * const loc = new Location();
   * const immediate = loc.caller(1);  // immediate caller
   * const deeper = loc.caller(2);     // caller's caller
   * ```
   */
  caller(depth: number = 1): Caller | undefined {
    if (depth < 0) {
      throw new Error('Depth must be non-negative');
    }
    return this._stack[depth];
  }

  /**
   * Gets the current location in the code
   * @returns Current caller information
   *
   * @example
   * ```typescript
   * const loc = new Location();
   * const current = loc.current();  // {name: 'currentFunction', ...}
   * ```
   */
  current(): Caller {
    return this._stack[0];
  }

  /**
   * Gets all callers in the stack trace
   * @returns Array of all callers
   *
   * @example
   * ```typescript
   * const loc = new Location();
   * const fullStack = loc.getStack();  // [{name: 'current'}, {name: 'caller'}, ...]
   * ```
   */
  stack(): Caller[] {
    return [...this._stack];
  }
}
