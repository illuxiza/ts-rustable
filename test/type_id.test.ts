import { describe, expect, test } from '@jest/globals';
import { typeId, TypeIdMap } from '../src/type_id';

describe('TypeId System', () => {
    describe('typeId Generation', () => {
        test('should generate unique IDs for different types', () => {
            class Type1 {}
            class Type2 {}
            class Type3 {}

            const id1 = typeId(Type1);
            const id2 = typeId(Type2);
            const id3 = typeId(Type3);

            expect(id1).not.toBe(id2);
            expect(id2).not.toBe(id3);
            expect(id1).not.toBe(id3);
        });

        test('should return same ID for same type', () => {
            class TestType {}

            const id1 = typeId(TestType);
            const id2 = typeId(TestType);
            const id3 = typeId(TestType);

            expect(id1).toBe(id2);
            expect(id2).toBe(id3);
        });

        test('should work with object instances', () => {
            class TestType {}
            const instance1 = new TestType();
            const instance2 = new TestType();

            const id1 = typeId(TestType);
            const id2 = typeId(instance1);
            const id3 = typeId(instance2);

            expect(id1).toBe(id2);
            expect(id2).toBe(id3);
        });

        test('should throw for invalid inputs', () => {
            expect(() => typeId(null)).toThrow('Cannot get typeId of null or undefined');
            expect(() => typeId(undefined)).toThrow('Cannot get typeId of null or undefined');
        });

        test('should work with built-in types', () => {
            const stringId = typeId(String);
            const numberId = typeId(Number);
            const booleanId = typeId(Boolean);
            const arrayId = typeId(Array);
            const objectId = typeId(Object);

            expect(stringId).not.toBe(numberId);
            expect(numberId).not.toBe(booleanId);
            expect(booleanId).not.toBe(arrayId);
            expect(arrayId).not.toBe(objectId);
        });

        test('should work with primitive values', () => {
            const str = "test";
            const num = 42;
            const bool = true;

            const strId = typeId(str);
            const numId = typeId(num);
            const boolId = typeId(bool);

            expect(strId).toBe(typeId(String));
            expect(numId).toBe(typeId(Number));
            expect(boolId).toBe(typeId(Boolean));
        });
    });

    describe('TypeIdMap Operations', () => {
        test('should store and retrieve values', () => {
            class TestType {}
            const map = new TypeIdMap<string>();
            const id = typeId(TestType);

            map.set(id, 'test value');
            const value = map.get(id);

            expect(value.isSome()).toBe(true);
            expect(value.unwrap()).toBe('test value');
            expect(map.size).toBe(1);
        });

        test('should handle non-existent keys', () => {
            class TestType {}
            class NonExistentType {}
            const map = new TypeIdMap<string>();
            const id = typeId(TestType);
            const nonExistentId = typeId(NonExistentType);

            map.set(id, 'test value');
            expect(map.get(nonExistentId).isNone()).toBe(true);
            expect(map.has(nonExistentId)).toBe(false);
        });

        test('should support deletion operations', () => {
            class TestType {}
            const map = new TypeIdMap<string>();
            const id = typeId(TestType);

            // Test deletion of existing key
            map.set(id, 'test value');
            expect(map.delete(id)).toBe(true);
            expect(map.has(id)).toBe(false);
            expect(map.size).toBe(0);

            // Test deletion of non-existent key
            expect(map.delete(id)).toBe(false);
        });

        test('should support clear operation', () => {
            class Type1 {}
            class Type2 {}
            const map = new TypeIdMap<string>();
            
            map.set(typeId(Type1), 'value1');
            map.set(typeId(Type2), 'value2');
            expect(map.size).toBe(2);

            map.clear();
            expect(map.size).toBe(0);
            expect(map.has(typeId(Type1))).toBe(false);
            expect(map.has(typeId(Type2))).toBe(false);
        });

        test('should support iteration methods', () => {
            class Type1 {}
            class Type2 {}
            const map = new TypeIdMap<string>();
            const id1 = typeId(Type1);
            const id2 = typeId(Type2);

            map.set(id1, 'value1');
            map.set(id2, 'value2');

            // Test entries()
            const entries = Array.from(map.entries());
            expect(entries).toHaveLength(2);
            expect(entries).toEqual(expect.arrayContaining([
                [id1, 'value1'],
                [id2, 'value2']
            ]));

            // Test keys()
            const keys = Array.from(map.keys());
            expect(keys).toHaveLength(2);
            expect(keys).toEqual(expect.arrayContaining([id1, id2]));

            // Test values()
            const values = Array.from(map.values());
            expect(values).toHaveLength(2);
            expect(values).toEqual(expect.arrayContaining(['value1', 'value2']));
        });

        test('should support forEach', () => {
            class Type1 {}
            class Type2 {}
            const map = new TypeIdMap<string>();
            const id1 = typeId(Type1);
            const id2 = typeId(Type2);

            map.set(id1, 'value1');
            map.set(id2, 'value2');

            const entries: [string, string][] = [];
            map.forEach((value, key) => {
                entries.push([key, value]);
            });

            expect(entries).toHaveLength(2);
            expect(entries).toEqual(expect.arrayContaining([
                [id1, 'value1'],
                [id2, 'value2']
            ]));
        });

        test('should handle complex value types', () => {
            interface User {
                id: number;
                name: string;
            }

            class UserType {}
            const map = new TypeIdMap<User>();
            const id = typeId(UserType);
            const user: User = { id: 1, name: 'Test User' };

            map.set(id, user);
            const retrieved = map.get(id);

            expect(retrieved.isSome()).toBe(true);
            expect(retrieved.unwrap()).toEqual(user);
        });
    });
});
