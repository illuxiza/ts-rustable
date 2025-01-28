import { Trait } from '../src/trait';

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

  class Display extends Trait implements Displayable {
    display(): string {
      return 'base display';
    }
  }

  class FormattedDisplay extends Display implements FormattedDisplayable {
    formatDisplay(style: string): string {
      return `${style}: ${this.display()}`;
    }
  }

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

    // Basic trait implementation
    Display.implFor(BasicItem);

    // Extended trait implementation
    Display.implFor(FormattedItem, {
      display(this: FormattedItem) {
        return `Value: ${this.getValue()}`;
      },
    });
    FormattedDisplay.implFor(FormattedItem);

    // Rich trait implementation
    Display.implFor(RichItem, {
      display(this: RichItem) {
        return `Value: ${this.getValue()}`;
      },
    });
    FormattedDisplay.implFor(RichItem);
    RichDisplay.implFor(RichItem);

    it('should handle trait inheritance chain correctly', () => {
      const basicItem = new BasicItem('basic');
      const formattedItem = new FormattedItem('formatted');
      const richItem = new RichItem({ type: 'rich' });

      // Test trait presence
      expect(Display.isImplFor(basicItem)).toBe(true);
      expect(FormattedDisplay.isImplFor(basicItem)).toBe(false);
      expect(RichDisplay.isImplFor(basicItem)).toBe(false);

      expect(Display.isImplFor(formattedItem)).toBe(true);
      expect(FormattedDisplay.isImplFor(formattedItem)).toBe(true);
      expect(RichDisplay.isImplFor(formattedItem)).toBe(false);

      expect(Display.isImplFor(richItem)).toBe(true);
      expect(FormattedDisplay.isImplFor(richItem)).toBe(true);
      expect(RichDisplay.isImplFor(richItem)).toBe(true);

      // Test functionality
      expect(basicItem.display()).toBe('base display');

      expect(formattedItem.display()).toBe('Value: formatted');
      expect(formattedItem.formatDisplay('bold')).toBe('bold: Value: formatted');

      expect(richItem.display()).toBe('Value: [object Object]');
      expect(richItem.formatDisplay('italic')).toBe('italic: Value: [object Object]');
      expect(richItem.displayWithMetadata({ author: 'user' })).toBe(
        'rich: Value: [object Object] [{"author":"user"}]',
      );
    });
  });

  describe('Method Override', () => {
    class CustomDisplay extends Display implements FormattedDisplayable {
      formatDisplay(style: string): string {
        return `${style} -> ${this.display()}`;
      }
    }

    interface CustomItem extends FormattedDisplayable {}
    class CustomItem extends Container {}

    Display.implFor(CustomItem, {
      display(this: CustomItem) {
        return `custom: ${this.getValue()}`;
      },
    });
    CustomDisplay.implFor(CustomItem);

    it('should preserve method overrides in inheritance chain', () => {
      const item = new CustomItem('test');
      expect(item.display()).toBe('custom: test');
      expect(item.formatDisplay('styled')).toBe('styled -> custom: test');
    });
  });
});
