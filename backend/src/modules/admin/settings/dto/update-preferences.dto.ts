/*eslint-disable*/
import { z } from 'zod';
import {
  CurrencyCode,
  LanguageCode,
  DateFormatType,
} from '@prisma/client';

export const UpdatePreferencesSchema = z.object({
  prefCurrency: z.nativeEnum(CurrencyCode).optional(),

  prefLanguage: z.nativeEnum(LanguageCode).optional(),

  prefTimezoneAuto: z.boolean().optional(),

  prefTimezoneManual: z
    .string()
    .regex(
      /^[+-]\d{2}:\d{2}$/,
      'Timezone offset must be in +HH:MM or -HH:MM format',
    )
    .optional(),

  prefDateFormat: z.nativeEnum(DateFormatType).optional(),
});

export type UpdatePreferencesDto = z.infer<
  typeof UpdatePreferencesSchema
>;