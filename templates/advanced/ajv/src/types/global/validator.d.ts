import { ValidatorJsonSchema } from '@novice1/validator-json';

declare global {
    namespace NoviceRouting {
        interface MetaParameters {
            schema?: ValidatorJsonSchema;
        }
    }
}