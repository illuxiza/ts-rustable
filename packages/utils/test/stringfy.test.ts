import { stringify } from '../src/stringify';

describe('stringifyObject', () => {
  test('should handle simple objects', () => {
    const obj = { a: 1, b: 'test', c: true };
    const result = stringify(obj);
    expect(result).toBe('{a:1,b:"test",c:true}');
  });

  test('should handle nested objects', () => {
    const obj = { a: { b: { c: 1 } } };
    const result = stringify(obj);
    expect(result).toBe('{a:{b:{c:1}}}');
  });

  test('should handle arrays', () => {
    const obj = { arr: [1, 2, { a: 3 }] };
    const result = stringify(obj);
    expect(result).toBe('{arr:[1,2,{a:3}]}');
  });

  test('should handle circular references', () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    const result = stringify(obj);
    expect(result).toBe('#0{a:1,self:#0}');
  });

  test('should handle complex circular references', () => {
    const obj1: any = { a: 1 };
    const obj2: any = { b: 2 };
    obj1.ref = obj2;
    obj2.ref = obj1;
    const result = stringify(obj1);
    expect(result).toBe('#0{a:1,ref:{b:2,ref:#0}}');
  });

  test('should handle arrays with circular references', () => {
    const obj: any = { a: 1 };
    obj.arr = [obj];
    const result = stringify(obj);
    expect(result).toBe('#0{a:1,arr:[#0]}');
  });

  test('should handle array with direct self-reference', () => {
    const arr: any[] = [];
    arr.push(arr);
    const result = stringify(arr);
    expect(result).toBe('#0[#0]');
  });

  test('should handle array with multiple self-references', () => {
    const arr: any[] = [];
    arr.push(arr, arr);
    const result = stringify(arr);
    expect(result).toBe('#0[#0,#0]');
  });

  test('should sort object keys', () => {
    const obj = { c: 3, a: 1, b: 2 };
    const result = stringify(obj);
    expect(result).toBe('{a:1,b:2,c:3}');
  });

  test('should handle NaN values', () => {
    const obj = { a: NaN, b: [NaN], c: { d: NaN } };
    const result = stringify(obj);
    expect(result).toBe('{a:NaN,b:[NaN],c:{d:NaN}}');
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
    expect(stringify(sym)).toBe('Symbol(test)');
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

  test('should handle NaN', () => {
    expect(stringify(NaN)).toBe('NaN');
  });

  test('should handle objects with NaN', () => {
    const obj = { value: NaN };
    expect(stringify(obj)).toBe('{value:NaN}');
  });

  it('should handle special iterables', () => {
    class CustomIterable implements Iterable<number> {
      constructor(private data: number[]) {}
      *[Symbol.iterator]() {
        yield* this.data;
      }
    }
    const custom = new CustomIterable([1, 2, 3]);
    expect(stringify(custom)).toBe('CustomIterable{1,2,3}');
  });

  it('should handle Map with complex keys and values', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const map = new Map<{ id: number }, any>([
      [obj1, 'value1'],
      [obj2, { nested: true }],
    ]);
    expect(stringify(map)).toBe('Map{[{id:1},"value1"],[{id:2},{nested:true}]}');
  });

  it('should handle recursive structures with Maps', () => {
    const map = new Map<string, any>();
    const obj = { map };
    map.set('self', obj);
    expect(stringify(obj)).toMatch(/#0\{map:Map\{\["self",#0\]\}\}/);
  });

  it('should handle special number values', () => {
    expect(stringify(NaN)).toBe('NaN');
    expect(stringify(Infinity)).toBe('Infinity');
    expect(stringify(-Infinity)).toBe('-Infinity');
  });

  it('should handle typed arrays', () => {
    const int32Array = new Int32Array([1, 2, 3]);
    expect(stringify(int32Array)).toBe('Int32Array{1,2,3}');
  });

  it('should handle Set with complex values', () => {
    const set = new Set([{ a: 1 }, [1, 2], new Map<string, string>([['key', 'value']])]);
    expect(stringify(set)).toBe('Set{{a:1},[1,2],Map{["key","value"]}}');
  });

  it('should handle empty iterables', () => {
    expect(stringify(new Set())).toBe('Set{}');
    expect(stringify(new Map())).toBe('Map{}');
  });

  it('should handle Date objects', () => {
    const date = new Date('2023-01-01T00:00:00.000Z');
    expect(stringify(date)).toBe(`Date("${date.getTime()}")`);
  });

  it('should handle null prototype objects', () => {
    const obj = Object.create(null);
    obj.test = 'value';
    expect(stringify(obj)).toBe('{test:"value"}');
  });
});

describe('stringify special types', () => {
  test('should stringify bigint values', () => {
    const big = BigInt('9007199254740991');
    expect(stringify(big)).toBe('9007199254740991');
  });
});
