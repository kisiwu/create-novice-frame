import { ValidatorZodSchema } from '@novice1/validator-zod';

declare global {
    namespace NoviceRouting {
        interface MetaParameters {
            schema?: ValidatorZodSchema;
        }
    }
}