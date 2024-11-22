import { hasTrait, implTrait, trait } from '../src/trait';

describe('Trait Inheritance', () => {
  // Base container class
  class Container {
    constructor(protected value: any) {}
    protected getValue(): any {
      return this.value;
    }
  }

  // Trait interfaces
  interface Displayable {
    display(): string;
  }

  interface FormattedDisplayable extends Displayable {
    formatDisplay(style: string): string;
  }

  interface RichDisplayable extends FormattedDisplayable {
    displayWithMetadata(metadata: Record<string, unknown>): string;
  }

  // Trait implementations
  @trait
  class Display implements Displayable {
    display(): string {
      return 'base display';
    }
  }

  @trait
  class FormattedDisplay extends Display implements FormattedDisplayable {
    formatDisplay(style: string): string {
      return `${style}: ${this.display()}`;
    }
  }

  @trait
  class RichDisplay extends FormattedDisplay implements RichDisplayable {
    displayWithMetadata(metadata: Record<string, unknown>): string {
      return `${this.formatDisplay('rich')} [${JSON.stringify(metadata)}]`;
    }
  }

  describe('Trait Inheritance Chain', () => {
    // Test classes
    interface BasicItem extends Displayable {}
    class BasicItem extends Container {}

    interface FormattedItem extends FormattedDisplayable {}
    class FormattedItem extends Container {}

    interface RichItem extends RichDisplayable {}
    class RichItem extends Container {}

    beforeAll(() => {
      // Basic trait implementation
      implTrait(BasicItem, Display);

      // Extended trait implementation
      implTrait(FormattedItem, Display, {
        display(this: FormattedItem) {
          return `Value: ${this.getValue()}`;
        },
      });
      implTrait(FormattedItem, FormattedDisplay);

      // Rich trait implementation
      implTrait(RichItem, Display, {
        display(this: RichItem) {
          return `Value: ${this.getValue()}`;
        },
      });
      implTrait(RichItem, FormattedDisplay);
      implTrait(RichItem, RichDisplay);
    });

    it('should handle trait inheritance chain correctly', () => {
      const basicItem = new BasicItem('basic');
      const formattedItem = new FormattedItem('formatted');
      const richItem = new RichItem({ type: 'rich' });

      // Test trait presence
      expect(hasTrait(basicItem, Display)).toBe(true);
      expect(hasTrait(basicItem, FormattedDisplay)).toBe(false);
      expect(hasTrait(basicItem, RichDisplay)).toBe(false);

      expect(hasTrait(formattedItem, Display)).toBe(true);
      expect(hasTrait(formattedItem, FormattedDisplay)).toBe(true);
      expect(hasTrait(formattedItem, RichDisplay)).toBe(false);

      expect(hasTrait(richItem, Display)).toBe(true);
      expect(hasTrait(richItem, FormattedDisplay)).toBe(true);
      expect(hasTrait(richItem, RichDisplay)).toBe(true);

      // Test functionality
      expect(basicItem.display()).toBe('base display');

      expect(formattedItem.display()).toBe('Value: formatted');
      expect(formattedItem.formatDisplay('bold')).toBe('bold: Value: formatted');

      expect(richItem.display()).toBe('Value: [object Object]');
      expect(richItem.formatDisplay('italic')).toBe('italic: Value: [object Object]');
      expect(richItem.displayWithMetadata({ author: 'user' })).toBe('rich: Value: [object Object] [{"author":"user"}]');
    });
  });

  describe('Method Override', () => {
    @trait
    class CustomDisplay extends Display implements FormattedDisplayable {
      formatDisplay(style: string): string {
        return `${style} -> ${this.display()}`;
      }
    }

    interface CustomItem extends FormattedDisplayable {}
    class CustomItem extends Container {}

    beforeAll(() => {
      implTrait(CustomItem, Display, {
        display(this: CustomItem) {
          return `custom: ${this.getValue()}`;
        },
      });
      implTrait(CustomItem, CustomDisplay);
    });

    it('should preserve method overrides in inheritance chain', () => {
      const item = new CustomItem('test');
      expect(item.display()).toBe('custom: test');
      expect(item.formatDisplay('styled')).toBe('styled -> custom: test');
    });
  });
});
