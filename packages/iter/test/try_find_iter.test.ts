import { iter } from '../src';
import { Break, Continue, None, Some } from '@rustable/enum';

describe('tryFind', () => {
  test('should find first matching element', () => {
    const result = iter([1, 2, 3, 4, 5]).tryFind((x) => Continue(x % 2 === 0));
    expect(result).toEqual(Some(2));
  });

  test('should return None when no match found', () => {
    const result = iter([1, 3, 5, 7]).tryFind((x) => Continue(x % 2 === 0));
    expect(result).toEqual(None);
  });

  test('should break early with custom value', () => {
    const result = iter([1, 2, 3, 4, 5]).tryFind((x) => {
      if (x > 3) return Break('too large');
      return Continue(x % 2 === 0);
    });
    expect(result).toEqual(Some(2));
  });

  test('should break with custom value before finding match', () => {
    const result = iter([1, 3, 5, 4, 2]).tryFind((x) => {
      if (x > 3) return Break('too large');
      return Continue(x % 2 === 0);
    });
    expect(result).toEqual(Some('too large'));
  });

  test('should work with complex objects', () => {
    const users = [
      { id: 1, name: 'Alice', active: false },
      { id: 2, name: 'Bob', active: true },
      { id: 3, name: 'Charlie', active: true },
    ];

    const result = iter(users).tryFind((user) => {
      if (!user.active) return Continue(false);
      if (user.id > 2) return Break('high id');
      return Continue(true);
    });

    expect(result).toEqual(Some(users[1]));
  });

  test('should handle empty iterator', () => {
    const result = iter([]).tryFind(() => Continue(true));
    expect(result).toEqual(None);
  });

  test('should break immediately if first element triggers break', () => {
    let count = 0;
    const result = iter([1, 2, 3]).tryFind((_) => {
      count++;
      return Break('stopped');
    });

    expect(result).toEqual(Some('stopped'));
    expect(count).toBe(1);
  });

  test('should continue until match or break', () => {
    let count = 0;
    const result = iter([1, 2, 3, 4, 5]).tryFind((x) => {
      count++;
      if (x === 4) return Break('found 4');
      return Continue(false);
    });

    expect(result).toEqual(Some('found 4'));
    expect(count).toBe(4);
  });

  test('should handle mixed type returns', () => {
    const result = iter(['1', 'a', '2', 'b']).tryFind((x) => {
      const num = parseInt(x);
      if (isNaN(num)) return Continue(false);
      if (num > 1) return Break(num);
      return Continue(true);
    });

    expect(result).toEqual(Some('1'));
  });
});
