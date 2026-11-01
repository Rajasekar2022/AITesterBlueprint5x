import { faker } from '@faker-js/faker';

export interface Credentials {
  username: string;
  password: string;
}

export class DataGenerator {
  /** Random, well-formed but non-existent credentials for the negative scenario. */
  static invalidCredentials(): Credentials {
    return {
      username: faker.internet.email({ provider: 'example.com' }).toLowerCase(),
      password: faker.internet.password({ length: 12, prefix: 'Aa1#' }),
    };
  }
}
