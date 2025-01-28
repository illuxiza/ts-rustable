import { From, Into } from 'packages/commons/src/traits';

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

describe('Type Conversion', () => {
  beforeAll(() => {
    // Implement From<Celsius> for Fahrenheit
    From(Celsius).implInto(Fahrenheit, {
      from(celsius: Celsius): Fahrenheit {
        return new Fahrenheit((celsius.value * 9) / 5 + 32);
      },
    });

    // Implement From<Fahrenheit> for Celsius
    From(Fahrenheit).implInto(Celsius, {
      from(fahrenheit: Fahrenheit): Celsius {
        return new Celsius(((fahrenheit.value - 32) * 5) / 9);
      },
    });

    // Implement From<Celsius> for Kelvin
    From(Celsius).implInto(Kelvin, {
      from(celsius: Celsius): Kelvin {
        return new Kelvin(celsius.value + 273.15);
      },
    });

    // Implement From<Fahrenheit> for Kelvin
    From(Fahrenheit).implInto(Kelvin, {
      from(fahrenheit: Fahrenheit): Kelvin {
        const celsius = new Celsius(((fahrenheit.value - 32) * 5) / 9);
        return new Kelvin(celsius.value + 273.15);
      },
    });

    // Implement From<Celsius> for Temperature
    From(Celsius).implInto(Temperature, {
      from(celsius: Celsius): Temperature {
        return new Temperature(celsius.value);
      },
    });

    // Implement From<Fahrenheit> for Temperature
    From(Fahrenheit).implInto(Temperature, {
      from(fahrenheit: Fahrenheit): Temperature {
        const celsius = new Celsius(((fahrenheit.value - 32) * 5) / 9);
        return new Temperature(celsius.value);
      },
    });

    // Implement From<Kelvin> for Temperature
    From(Kelvin).implInto(Temperature, {
      from(kelvin: Kelvin): Temperature {
        return new Temperature(kelvin.value - 273.15);
      },
    });
  });

  test('should convert between types using into method', () => {
    const celsius = new Celsius(100);
    const fahrenheit = Into(Fahrenheit).wrap(celsius).into();

    expect(fahrenheit).toBeInstanceOf(Fahrenheit);
    expect(fahrenheit.value).toBe(212);
  });

  test('should support bidirectional conversion', () => {
    const celsius = new Celsius(0);
    const fahrenheit = Into(Fahrenheit).wrap(celsius).into();
    const backToCelsius = Into(Celsius).wrap(fahrenheit).into();

    expect(fahrenheit.value).toBe(32);
    expect(backToCelsius.value).toBe(0);
  });

  test('should throw error when conversion is not implemented', () => {
    class Kelvin {
      constructor(public value: number) {}
    }

    const celsius = new Celsius(100);
    expect(() => Into(Kelvin).wrap(celsius).into()).toThrow();
  });

  test('should work with primitive types', () => {
    // Implement From<number> for Celsius
    From(Number).implInto(Celsius, {
      from(value): Celsius {
        return new Celsius(value.valueOf());
      },
    });

    const temp = 100;
    const celsius = Into(Celsius).wrap(temp).into();

    expect(celsius).toBeInstanceOf(Celsius);
    expect(celsius.value).toBe(100);
  });

  test('should support multiple From implementations for the same type', () => {
    const celsius = new Celsius(0);

    // Convert to Fahrenheit
    const fahrenheit = Into(Fahrenheit).wrap(celsius).into();
    expect(fahrenheit.value).toBe(32);

    // Convert to Kelvin
    const kelvin = Into(Kelvin).wrap(celsius).into();
    expect(kelvin.value).toBe(273.15);

    // Convert to Temperature
    const temp = Into(Temperature).wrap(celsius).into();
    expect(temp.value).toBe(0);
  });

  test('should support chained conversions', () => {
    const fahrenheit = new Fahrenheit(32);

    // Convert Fahrenheit -> Celsius -> Kelvin
    const kelvin = Into(Kelvin).wrap(fahrenheit).into();
    expect(kelvin.value).toBeCloseTo(273.15);

    // Convert Kelvin -> Temperature
    const temp = Into(Temperature).wrap(kelvin).into();
    expect(temp.value).toBeCloseTo(0);
  });
});
