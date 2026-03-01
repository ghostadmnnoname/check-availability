/**
 * Location Model for Supabase
 * 
 * This represents the structure of the locations table in Supabase
 * Table: public.locations
 */

const locationSchema = {
  id: {
    type: 'UUID',
    primaryKey: true,
    default: 'gen_random_uuid()',
    description: 'Unique identifier for the location record'
  },
  info: {
    type: 'TEXT',
    unique: true,
    notNull: true,
    description: 'The IP address or query parameter used to fetch location data'
  },
  description: {
    type: 'JSONB',
    nullable: true,
    description: 'The JSON response from ip-api.com containing location details'
  },
  created_at: {
    type: 'TIMESTAMP WITH TIME ZONE',
    default: 'NOW()',
    description: 'When the record was created'
  },
  updated_at: {
    type: 'TIMESTAMP WITH TIME ZONE',
    default: 'NOW()',
    description: 'When the record was last updated'
  }
};

module.exports = locationSchema;
