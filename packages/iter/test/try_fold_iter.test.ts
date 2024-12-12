import { Break, Continue, None, Some } from '@rustable/enum';
import { iter } from '../src';

describe('TryFold', () => {
  test('should fold with early return', () => {
    const result = iter([1, 2, 3, 4, 5]).tryFold(0, (acc, x) => (x > 3 ? Break(None) : Continue(acc + x)));
    expect(result.breakValue()).toEqual(Some(None));
  });

  test('should complete fold when no early return', () => {
    const result = iter([1, 2, 3]).tryFold(0, (acc, x) => Continue(acc + x));
    expect(result.continueValue()).toEqual(Some(6));
  });

  test('should handle empty iterator', () => {
    const result = iter([]).tryFold(0, (acc, x) => Continue(acc + x));
    expect(result.continueValue()).toEqual(Some(0));
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    iter([1, 2, 3, 4])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .tryFold(0, (acc, x) => (x > 2 ? Break(None) : Continue(acc + x)));
    expect(sideEffects).toEqual([1, 2, 3]);
  });
});

describe('TryReduce', () => {
  test('should reduce with early return', () => {
    const result = iter([1, 2, 3, 4]).tryReduce((acc, x) => (x > 3 ? Break(None) : Continue(acc + x)));
    expect(result.breakValue()).toEqual(Some(None));
  });

  test('should complete reduction when no early return', () => {
    const result = iter([1, 2, 3]).tryReduce((acc, x) => Continue(acc + x));
    expect(result.continueValue()).toEqual(Some(6));
  });

  test('should handle empty iterator', () => {
    const result = iter([] as number[]).tryReduce((acc, x) => Continue(acc + x));
    expect(result.breakValue()).toEqual(Some(None));
  });
});

describe('TryForEach', () => {
  test('should process all elements when no early return', () => {
    const results: number[] = [];
    const result = iter([1, 2, 3]).tryForEach((x) => {
      results.push(x);
      return Continue(undefined);
    });

    expect(results).toEqual([1, 2, 3]);
    expect(result.continueValue()).toEqual(Some(undefined));
  });

  test('should stop early when Break is returned', () => {
    const results: number[] = [];
    const result = iter([1, 2, 3, 4, 5]).tryForEach((x) => {
      if (x > 3) {
        return Break('stopped');
      }
      results.push(x);
      return Continue(undefined);
    });

    expect(results).toEqual([1, 2, 3]);
    expect(result.breakValue()).toEqual(Some('stopped'));
  });

  test('should handle empty iterator', () => {
    const results: number[] = [];
    const result = iter([]).tryForEach((x) => {
      results.push(x);
      return Continue(undefined);
    });

    expect(results).toEqual([]);
    expect(result.continueValue()).toEqual(Some(undefined));
  });

  test('should be lazy and stop processing after Break', () => {
    const processed: number[] = [];
    const mapped = iter([1, 2, 3, 4, 5]).map((x) => {
      processed.push(x);
      return x * 2;
    });

    const results: number[] = [];
    mapped.tryForEach((x) => {
      if (x > 4) {
        return Break(undefined);
      }
      results.push(x);
      return Continue(undefined);
    });

    expect(processed).toEqual([1, 2, 3]); // Only processes until Break
    expect(results).toEqual([2, 4]); // Only collects values before Break
  });

  test('should handle async-like operations', () => {
    interface Result {
      success: boolean;
      data?: string;
      error?: string;
    }
    const operations = ['op1', 'op2', 'error', 'op4'];

    const results: Result[] = [];
    const result = iter(operations).tryForEach((op) => {
      if (op === 'error') {
        return Break({ success: false, error: 'Operation failed' });
      }
      results.push({ success: true, data: op });
      return Continue(undefined);
    });

    expect(results).toEqual([
      { success: true, data: 'op1' },
      { success: true, data: 'op2' },
    ]);
    expect(result.breakValue()).toEqual(Some({ success: false, error: 'Operation failed' }));
  });
});
