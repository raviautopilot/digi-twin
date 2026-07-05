export interface CfgModule {
  id?: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}

export interface CfgType {
  id?: number;
  code: string;
  module_code: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}

export interface CfgValue {
  id?: number;
  code: string;
  type_code: string;
  value: string;
  description: string;
  display_order?: number;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}

export interface CfgDependency {
  id?: number;
  parent_value_code: string;
  child_value_code: string;
  dependency_type: string;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
}
