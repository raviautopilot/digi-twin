export interface CoreEntity {
  id?: number;
  entity_type: 'PERSON' | 'ORGANIZATION';
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}

export interface CorePerson {
  id?: number;
  entity_id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  preferred_name?: string;
  gender: string;
  date_of_birth?: string;
  national_id?: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}

export interface CoreOrganization {
  id?: number;
  entity_id: number;
  legal_name: string;
  trade_name?: string;
  organization_type: string;
  registration_number?: string;
  tax_identifier?: string;
  industry?: string;
  website?: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}

export interface CoreRelationship {
  id?: number;
  source_entity_id: number;
  target_entity_id: number;
  relationship_type: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}

export interface PersonAddress {
  id?: number;
  person_id: number;
  address_type: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}

export interface OrganizationAddress {
  id?: number;
  organization_id: number;
  address_type: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}

export interface PersonContact {
  id?: number;
  person_id: number;
  contact_type: string;
  contact_value: string;
  is_primary: boolean;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}

export interface OrganizationContact {
  id?: number;
  organization_id: number;
  contact_type: string;
  contact_value: string;
  is_primary: boolean;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}

export interface PrimaryContact {
  id?: number;
  organization_id: number;
  person_id: number;
  role: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}
