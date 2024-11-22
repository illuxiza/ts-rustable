import { trait, doesImplement, useTrait } from '../src/trait';
import { MyClass } from './trait.class';

// Define trait interfaces
declare module './trait.class' {
    interface MyClass {
        print(): string;
        debug(): string;
        format(prefix: string): string;
        transform<T>(value: T): string;
        add(a: number, b: number): number;
        multiply(a: number, b: number): number;
        concat(...strings: string[]): string;
        replace(text: string, searchValue: string | RegExp, replaceValue: string): string;
    }
}

// Define traits as classes
class Print {
    print(): string {
        return "default print";
    }

    format(prefix: string): string {
        return `${prefix}: ${this.print()}`;
    }

    transform<T>(value: T): string {
        return `transformed: ${String(value)}`;
    }
}

class Debug {
    debug(): string {
        return "default debug";
    }
}

class MathOps {
    add(a: number, b: number): number {
        return a + b;
    }

    multiply(a: number, b: number): number {
        return a * b;
    }
}

class StringOps {
    concat(...strings: string[]): string {
        return strings.join("");
    }

    replace(text: string, searchValue: string | RegExp, replaceValue: string): string {
        return text.replace(searchValue, replaceValue);
    }
}

// Implement traits
trait(MyClass, Print);
trait(MyClass, Debug, {
    debug(this: MyClass) {
        return `custom debug for: ${this.value}`;
    }
});
trait(MyClass, MathOps);
trait(MyClass, StringOps, {
    concat(this: MyClass, ...strings: string[]): string {
        return `[${this.value}] ${strings.join(" + ")}`;
    }
});

describe('Trait System', () => {
    it('should allow direct method calls on class', () => {
        const obj = new MyClass("test");
        expect(obj.print()).toBe("default print");
        expect(obj.debug()).toBe("custom debug for: test");
    });

    it('should check trait implementation', () => {
        const obj = new MyClass("test");
        expect(doesImplement(obj, Print)).toBe(true);
        expect(doesImplement(obj, Debug)).toBe(true);
        expect(doesImplement({}, Print)).toBe(false);
    });

    it('should get trait implementation', () => {
        const obj = new MyClass("test");
        const printTrait = useTrait(obj, Print);
        const debugTrait = useTrait(obj, Debug);
        
        expect(printTrait).toBeDefined();
        expect(debugTrait).toBeDefined();
        expect(printTrait?.print()).toBe("default print");
        expect(debugTrait?.debug()).toBe("custom debug for: test");
    });

    it('should handle multiple traits', () => {
        const obj = new MyClass("test");
        expect(obj.print()).toBe("default print");
        expect(obj.debug()).toBe("custom debug for: test");
    });

    it('should allow custom implementation with typed this', () => {
        interface CustomClass {
            print(): string;
            format(prefix: string): string;
            transform<T>(value: T): string;
        }
        
        class CustomClass {
            constructor(private prefix: string, private suffix: string) {}

            getPrefix(): string {
                return this.prefix;
            }

            getSuffix(): string {
                return this.suffix;
            }
        }

        trait(CustomClass, Print, {
            print(this: CustomClass) {
                return `${this.getPrefix()} - print - ${this.getSuffix()}`;
            },
            format(this: CustomClass, prefix: string) {
                return `${prefix} [${this.getPrefix()}] - ${this.getSuffix()}`;
            }
        });

        const obj = new CustomClass("start", "end");
        expect(obj.print()).toBe("start - print - end");
        expect(obj.format("test")).toBe("test [start] - end");
        // 未覆盖的方法应该使用默认实现
        expect(obj.transform(123)).toBe("transformed: 123");
    });

    it('should support generic methods with typed this', () => {
        // 基类定义通用的数据访问接口
        abstract class DataContainer {
            abstract getData(): unknown;
        }

        // 具体类实现
        class NumberData extends DataContainer {
            constructor(private data: number) {
                super();
            }

            getData(): number {
                return this.data;
            }
        }

        class StringData extends DataContainer {
            constructor(private data: string) {
                super();
            }

            getData(): string {
                return this.data;
            }
        }

        interface StringData {
            print(): string;
            transform<U>(value: U): string;
        }

        interface NumberData {
            print(): string;
            transform<U>(value: U): string;
        }

        // 为基类实现trait
        trait(StringData, Print, {
            print(this: StringData) {
                return `Data: ${String(this.getData())}`;
            },
            transform<U>(this: StringData, value: U): string {
                const data = this.getData();
                return `transform(${String(data)}, ${String(value)})`;
            }
        });

        // 为基类实现trait
        trait(NumberData, Print, {
            print(this: NumberData) {
                return `Data: ${String(this.getData())}`;
            },
            transform<U>(this: NumberData, value: U): string {
                const data = this.getData();
                return `transform(${String(data)}, ${String(value)})`;
            }
        });

        // 创建具体实例
        const numberData = new NumberData(42);
        const stringData = new StringData("hello");

        expect(numberData.print()).toBe("Data: 42");
        expect(stringData.print()).toBe("Data: hello");
        expect(numberData.transform("test")).toBe("transform(42, test)");
        expect(stringData.transform(123)).toBe("transform(hello, 123)");
    });

    it('should handle complex trait interactions with typed this', () => {
        interface ComplexClass {
            print(): string;
            debug(): string;
            format(prefix: string): string;
        }
        
        class ComplexClass {
            constructor(private prefix: string, private counter: number = 0) {}
            
            getPrefix(): string {
                return this.prefix;
            }

            incrementCounter(): number {
                return ++this.counter;
            }
        }

        // 扩展现有的Print trait
        trait(ComplexClass, Print, {
            print(this: ComplexClass) {
                const count = this.incrementCounter();
                return `${this.getPrefix()} - print #${count}`;
            }
        });

        // 使用Print trait的方法实现Debug trait
        trait(ComplexClass, Debug, {
            debug(this: ComplexClass) {
                const count = this.incrementCounter();
                return `debug(#${count}): ${this.print()}`;
            }
        });

        const obj = new ComplexClass("test");
        expect(obj.print()).toBe("test - print #1");
        expect(obj.debug()).toBe("debug(#2): test - print #3");
        expect(obj.format("prefix")).toBe("prefix: test - print #4");
    });

    it('should return undefined for non-implemented trait', () => {
        class EmptyClass {}
        const obj = new EmptyClass();
        const printTrait = useTrait(obj, Print);
        expect(printTrait).toBeUndefined();
    });

    it('should handle multiple parameters in trait methods', () => {
        const obj = new MyClass("test");
        
        // Test math operations
        expect(obj.add(2, 3)).toBe(5);
        expect(obj.multiply(4, 5)).toBe(20);
        
        // Test string operations with default implementation
        expect(obj.replace("hello world", "world", "TypeScript")).toBe("hello TypeScript");
        
        // Test string operations with custom implementation
        expect(obj.concat("a", "b", "c")).toBe("[test] a + b + c");
    });
});
