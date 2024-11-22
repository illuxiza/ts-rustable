import { trait } from '../src/trait';
import { Into, into } from '../src/into';

// Example classes for testing
class Celsius {
    constructor(public value: number) {}
}

class Fahrenheit {
    constructor(public value: number) {}
}

// Implement Into<Fahrenheit> for Celsius
trait(Celsius, Into, {
    into(this: Celsius): Fahrenheit {
        return new Fahrenheit(this.value * 9/5 + 32);
    }
});

// Implement Into<Celsius> for Fahrenheit
trait(Fahrenheit, Into, {
    into(this: Fahrenheit): Celsius {
        return new Celsius((this.value - 32) * 5/9);
    }
});

describe('Into trait', () => {
    test('should convert Celsius to Fahrenheit', () => {
        const celsius = new Celsius(0);
        const fahrenheit = into(celsius, Fahrenheit);
        expect(fahrenheit.value).toBe(32);
    });

    test('should convert Fahrenheit to Celsius', () => {
        const fahrenheit = new Fahrenheit(32);
        const celsius = into(fahrenheit, Celsius);
        expect(celsius.value).toBe(0);
    });

    test('should throw error for non-implemented conversion', () => {
        class NoImpl {}
        const value = new NoImpl();
        expect(() => into(value, Celsius)).toThrow();
    });
});
