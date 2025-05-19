import { ValidatorTypeboxSchema } from '@novice1/validator-typebox';

declare global {
    namespace NoviceRouting {
        interface MetaParameters {
            schema?: ValidatorTypeboxSchema;
        }
    }
}