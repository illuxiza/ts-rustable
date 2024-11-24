import { implTrait } from '../src/trait';
import { From } from '../src/from';

// Example classes for testing
class Celsius {
  constructor(public value: number) {}
}

class Fahrenheit {
  constructor(public value: number) {}
}

class Temperature {
  constructor(public value: number) {}
}

class Kelvin {
  constructor(public value: number) {}
}

class NoImpl {}

describe('Type Conversion', () => {
  beforeAll(() => {
    // Implement From<Celsius> for Fahrenheit
    implTrait(Fahrenheit, From, Celsius, {
      from(celsius: Celsius): Fahrenheit {
        return new Fahrenheit((celsius.value * 9) / 5 + 32);
      },
    });

    // Implement From<Fahrenheit> for Celsius
    implTrait(Celsius, From, Fahrenheit, {
      from(fahrenheit: Fahrenheit): Celsius {
        return new Celsius(((fahrenheit.value - 32) * 5) / 9);
      },
    });

    // Implement From<Celsius> for Kelvin
    implTrait(Kelvin, From, Celsius, {
      from(celsius: Celsius): Kelvin {
        return new Kelvin(celsius.value + 273.15);
      },
    });

    // Implement From<Fahrenheit> for Kelvin
    implTrait(Kelvin, From, Fahrenheit, {
      from(fahrenheit: Fahrenheit): Kelvin {
        const celsius = new Celsius(((fahrenheit.value - 32) * 5) / 9);
        return new Kelvin(celsius.value + 273.15);
      },
    });

    // Implement From<Celsius> for Temperature
    implTrait(Temperature, From, Celsius, {
      from(celsius: Celsius): Temperature {
        return new Temperature(celsius.value);
      },
    });

    // Implement From<Fahrenheit> for Temperature
    implTrait(Temperature, From, Fahrenheit, {
      from(fahrenheit: Fahrenheit): Temperature {
        const celsius = new Celsius(((fahrenheit.value - 32) * 5) / 9);
        return new Temperature(celsius.value);
      },
    });

    // Implement From<Kelvin> for Temperature
    implTrait(Temperature, From, Kelvin, {
      from(kelvin: Kelvin): Temperature {
        return new Temperature(kelvin.value - 273.15);
      },
    });
  });

  test('should convert between types using into method', () => {
    const celsius = new Celsius(100);
    const fahrenheit = celsius.into(Fahrenheit);

    expect(fahrenheit).toBeInstanceOf(Fahrenheit);
    expect(fahrenheit.value).toBe(212);
  });

  test('should support bidirectional conversion', () => {
    const celsius = new Celsius(0);
    const fahrenheit = celsius.into(Fahrenheit);
    const backToCelsius = fahrenheit.into(Celsius);

    expect(fahrenheit.value).toBe(32);
    expect(backToCelsius.value).toBe(0);
  });

  test('should throw error when conversion is not implemented', () => {
    class Kelvin {
      constructor(public value: number) {}
    }

    const celsius = new Celsius(100);
    expect(() => celsius.into(Kelvin)).toThrow();
  });

  test('should work with primitive types', () => {
    // Implement From<number> for Celsius
    implTrait(Celsius, From, Number, {
      from(value: number): Celsius {
        return new Celsius(value);
      },
    });

    const temp = 100;
    const celsius = temp.into(Celsius);

    expect(celsius).toBeInstanceOf(Celsius);
    expect(celsius.value).toBe(100);
  });

  test('should support multiple From implementations for the same type', () => {
    const celsius = new Celsius(0);

    // Convert to Fahrenheit
    const fahrenheit = celsius.into(Fahrenheit);
    expect(fahrenheit.value).toBe(32);

    // Convert to Kelvin
    const kelvin = celsius.into(Kelvin);
    expect(kelvin.value).toBe(273.15);

    // Convert to Temperature
    const temp = celsius.into(Temperature);
    expect(temp.value).toBe(0);
  });

  test('should support chained conversions', () => {
    const fahrenheit = new Fahrenheit(32);

    // Convert Fahrenheit -> Celsius -> Kelvin
    const kelvin = fahrenheit.into(Kelvin);
    expect(kelvin.value).toBeCloseTo(273.15);

    // Convert Kelvin -> Temperature
    const temp = kelvin.into(Temperature);
    expect(temp.value).toBeCloseTo(0);
  });
});
