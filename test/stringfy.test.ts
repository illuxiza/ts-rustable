import { stringify, stringifyObject } from '../src/stringfy';

describe('stringifyObject', () => {
  test('should handle simple objects', () => {
    const obj = { a: 1, b: 'test', c: true };
    const result = stringifyObject(obj);
    expect(result).toBe('{a:1,b:"test",c:true}');
  });

  test('should handle nested objects', () => {
    const obj = { a: { b: { c: 1 } } };
    const result = stringifyObject(obj);
    expect(result).toBe('{a:{b:{c:1}}}');
  });

  test('should handle arrays', () => {
    const obj = { arr: [1, 2, { a: 3 }] };
    const result = stringifyObject(obj);
    expect(result).toBe('{arr:[1,2,{a:3}]}');
  });

  test('should handle circular references', () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    const result = stringifyObject(obj);
    expect(result).toBe('#0{a:1,self:#0}');
  });

  test('should handle complex circular references', () => {
    const obj1: any = { a: 1 };
    const obj2: any = { b: 2 };
    obj1.ref = obj2;
    obj2.ref = obj1;
    const result = stringifyObject(obj1);
    expect(result).toBe('#0{a:1,ref:{b:2,ref:#0}}');
  });

  test('should handle arrays with circular references', () => {
    const obj: any = { a: 1 };
    obj.arr = [obj];
    const result = stringifyObject(obj);
    expect(result).toBe('{a:1,arr:#1[{a:1,arr:#1}]}');
  });

  test('should sort object keys', () => {
    const obj = { c: 3, a: 1, b: 2 };
    const result = stringifyObject(obj);
    expect(result).toBe('{a:1,b:2,c:3}');
  });
});

describe('stringify', () => {
  test('should handle primitive types', () => {
    expect(stringify(123)).toBe('123');
    expect(stringify('test')).toBe('test');
    expect(stringify(true)).toBe('true');
    expect(stringify(false)).toBe('false');
    expect(stringify(null)).toBe('');
    expect(stringify(undefined)).toBe('');
  });

  test('should handle objects', () => {
    const obj = { a: 1, b: 'test' };
    expect(stringify(obj)).toBe('{a:1,b:"test"}');
  });

  test('should handle arrays', () => {
    const arr = [1, 'test', { a: 1 }];
    expect(stringify(arr)).toBe('[1,"test",{a:1}]');
  });

  test('should handle functions', () => {
    const func = () => 123;
    expect(stringify(func)).toBe(func.toString());
  });

  test('should handle symbols', () => {
    const sym = Symbol('test');
    expect(stringify(sym)).toBe(sym.toString());
  });

  test('should handle bigint', () => {
    const big = BigInt(123);
    expect(stringify(big)).toBe(big.toString());
  });

  test('should handle circular references', () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    expect(stringify(obj)).toBe('#0{a:1,self:#0}');
  });

  test('should handle complex mixed types', () => {
    const complex = {
      num: 123,
      str: 'test',
      bool: true,
      arr: [1, { nested: true }],
      obj: { a: 1, b: [2, 3] },
    };
    const result = stringify(complex);
    expect(result).toBe('{arr:[1,{nested:true}],bool:true,num:123,obj:{a:1,b:[2,3]},str:"test"}');
  });
});
