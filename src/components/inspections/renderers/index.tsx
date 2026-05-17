import type { InspectionItem } from '@/lib/inspections/types';
import { ChoiceRenderer } from './choice-renderer';
import { ConformRenderer } from './conform-renderer';
import { DateRenderer } from './date-renderer';
import { FallbackRenderer } from './fallback-renderer';
import { NumberRenderer } from './number-renderer';
import { PhotoRenderer } from './photo-renderer';
import { TextRenderer } from './text-renderer';
import type { ItemRendererProps } from './types';
import { YesNoRenderer } from './yes-no-renderer';

export type { AnswerInput, ItemRendererProps } from './types';

/** Switch único — escolhe o renderer por `item.type`. */
export function renderItem(item: InspectionItem, props: ItemRendererProps) {
  switch (item.type) {
    case 'yes_no':
      return <YesNoRenderer {...props} />;
    case 'conform_not_conform':
      return <ConformRenderer {...props} />;
    case 'text':
      return <TextRenderer {...props} />;
    case 'number':
      return <NumberRenderer {...props} />;
    case 'single_choice':
      return <ChoiceRenderer {...props} />;
    case 'multiple_choice':
      return <ChoiceRenderer {...props} multiple />;
    case 'date':
      return <DateRenderer {...props} />;
    case 'photo':
      return <PhotoRenderer {...props} />;
    case 'signature':
    case 'file':
      return <FallbackRenderer {...props} />;
    default: {
      // Exhaustiveness check.
      const _exhaustive: never = item.type;
      void _exhaustive;
      return null;
    }
  }
}
