import { derive } from 'packages/utils/src/derive';
import { hasTrait, implTrait, macroTrait, trait, useTrait } from '../src';

describe('Static Trait Features', () => {
  @trait
  class StaticPrintTrait {
    static staticPrint(): string {
      return 'default static print';
    }
  }

  const StaticPrint = macroTrait(StaticPrintTrait);

  @derive([StaticPrint])
  class StaticClass {}

  test('should implement static trait methods', () => {
    expect(useTrait(StaticClass, StaticPrint).staticPrint()).toBe('default static print');
  });

  test('should check static trait implementation', () => {
    expect(hasTrait(StaticClass, StaticPrint)).toBe(true);
    expect(hasTrait({}, StaticPrint)).toBe(false);
  });

  test('should get static trait implementation', () => {
    const staticTrait = useTrait(StaticClass, StaticPrint);
    expect(staticTrait).toBeDefined();
    expect(staticTrait.staticPrint()).toBe('default static print');
  });

  test('should override existing static methods', () => {
    class ExistingStaticClass {
      static existingMethod(): string {
        return 'overridden method';
      }
    }

    @trait
    class OverrideTrait {
      static existingMethod(): string {
        return 'original method';
      }
    }

    implTrait(ExistingStaticClass, OverrideTrait);

    expect(ExistingStaticClass.existingMethod()).toBe('overridden method');
    expect(useTrait(ExistingStaticClass, OverrideTrait).existingMethod()).toBe('overridden method');
  });

  describe('Static Trait with Inheritance', () => {
    @trait
    class StaticInheritTrait {
      static inheritMethod(): string {
        return 'trait inherit method';
      }
    }

    class BaseClass {
      static inheritMethod(): string {
        return 'base inherit method';
      }
    }
    implTrait(BaseClass, StaticInheritTrait);

    test('should inherit static trait implementation', () => {
      class DerivedClass extends BaseClass {}
      implTrait(DerivedClass, StaticInheritTrait);

      expect(useTrait(BaseClass, StaticInheritTrait).inheritMethod()).toBe('base inherit method');
      expect(useTrait(DerivedClass, StaticInheritTrait).inheritMethod()).toBe(
        'base inherit method',
      );
      expect(hasTrait(DerivedClass, StaticInheritTrait)).toBe(true);
    });

    test('should allow overriding inherited static trait', () => {
      class DerivedClass extends BaseClass {
        static inheritMethod(): string {
          return 'derived inherit method';
        }
      }

      implTrait(DerivedClass, StaticInheritTrait);

      expect(useTrait(BaseClass, StaticInheritTrait).inheritMethod()).toBe('base inherit method');
      expect(useTrait(DerivedClass, StaticInheritTrait).inheritMethod()).toBe(
        'derived inherit method',
      );
    });
  });
});
