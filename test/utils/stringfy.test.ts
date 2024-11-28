import { stringify, stringifyObject } from '../../src/utils/stringfy';
import { HashMap } from '../../src/map';

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
    expect(result).toBe('#0{a:1,arr:[#0]}');
  });

  test('should handle array with direct self-reference', () => {
    const arr: any[] = [];
    arr.push(arr);
    const result = stringifyObject(arr);
    expect(result).toBe('#0[#0]');
  });

  test('should handle array with multiple self-references', () => {
    const arr: any[] = [];
    arr.push(arr, arr);
    const result = stringifyObject(arr);
    expect(result).toBe('#0[#0,#0]');
  });

  test('should sort object keys', () => {
    const obj = { c: 3, a: 1, b: 2 };
    const result = stringifyObject(obj);
    expect(result).toBe('{a:1,b:2,c:3}');
  });

  test('should handle NaN values', () => {
    const obj = { a: NaN, b: [NaN], c: { d: NaN } };
    const result = stringifyObject(obj);
    expect(result).toBe('{a:NaN,b:[NaN],c:{d:NaN}}');
  });
});

describe('HashMap Stringification', () => {
  test('should stringify empty HashMap', () => {
    const map = new HashMap();
    expect(stringifyObject(map)).toBe('HashMap{}');
  });

  test('should stringify HashMap with primitive values', () => {
    const map = new HashMap<string, number>();
    map.set('one', 1);
    map.set('two', 2);
    expect(stringifyObject(map)).toBe('HashMap{["one",1],["two",2]}');
  });

  test('should stringify HashMap with object values', () => {
    const map = new HashMap<string, object>();
    map.set('user', { name: 'John', age: 30 });
    expect(stringifyObject(map)).toBe('HashMap{["user",{age:30,name:"John"}]}');
  });

  test('should stringify HashMap with custom toString objects', () => {
    const key1 = { toString: () => 'CustomKey1' };
    const key2 = { toString: () => 'CustomKey2' };
    const map = new HashMap<object, string>();
    map.set(key1, 'value1');
    map.set(key2, 'value2');
    expect(stringifyObject(map)).toMatch(/HashMap{.*CustomKey1.*"value1".*CustomKey2.*"value2".*}/);
  });

  test('should stringify nested HashMaps', () => {
    const innerMap = new HashMap<string, number>();
    innerMap.set('inner', 42);

    const outerMap = new HashMap<string, HashMap<string, number>>();
    outerMap.set('outer', innerMap);

    expect(stringifyObject(outerMap)).toBe('HashMap{["outer",HashMap{["inner",42]}]}');
  });

  test('should handle circular references in HashMap', () => {
    const map = new HashMap<string, any>();
    const obj: any = { name: 'circular' };
    obj.self = obj;
    map.set('circular', obj);

    expect(stringifyObject(map)).toMatch(/HashMap{.*"circular",#0{name:"circular",self:#0.*}/);
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
});

describe('stringify special types', () => {
  test('should stringify bigint values', () => {
    const big = BigInt('9007199254740991');
    expect(stringify(big)).toBe('9007199254740991');
  });
});
