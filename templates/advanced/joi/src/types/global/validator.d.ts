import { ValidatorJoiSchema } from '@novice1/validator-joi';

declare global {
    namespace NoviceRouting {
        interface MetaParameters {
            schema?: ValidatorJoiSchema;
        }
    }
}