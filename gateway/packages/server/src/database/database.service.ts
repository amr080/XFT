import { Contact } from '@centrifuge/gateway-lib/models/contact';
import { Document } from '@centrifuge/gateway-lib/models/document';
import { Organization } from '@centrifuge/gateway-lib/models/organization';
import { Schema } from '@centrifuge/gateway-lib/models/schema';
import { User } from '@centrifuge/gateway-lib/models/user';
import { DatabaseRepository } from './database.repository';

export class DatabaseService {
  constructor(
    public users: DatabaseRepository<User>,
    public contacts: DatabaseRepository<Contact>,
    public schemas: DatabaseRepository<Schema>,
    public documents: DatabaseRepository<Document>,
    public organizations: DatabaseRepository<Organization>,
  ) {}
}
