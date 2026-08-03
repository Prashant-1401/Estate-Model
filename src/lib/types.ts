export type Role = "admin" | "manager" | "agent";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export type ProjectStatus = "Planning" | "Under Construction" | "Completed" | "On Hold";

export interface Project {
  id: string;
  name: string;
  developer: string;
  location: string;
  status: ProjectStatus;
  total_units: number;
  units_sold: number;
  launch_date: string;
  completion_date: string;
  price_range: string;
  description: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: "Active" | "Inactive";
  created: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  budget: string;
  area: string;
  type: string;
  source: string;
  status: "Hot" | "Warm" | "New" | "Cold";
  assigned: string;
  date: string;
  requirement?: string;
  property_id?: string;
  assigned_to?: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  type: string;
  status: "Available" | "Reserved" | "Sold";
  images: string[];
  featured?: boolean;
  project_id?: string;
}

export interface DashboardStats {
  total_leads: number;
  today_leads: number;
  hot_leads: number;
  total_properties: number;
  total_projects: number;
  total_users: number;
  revenue_mtd: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: string;
  initials: string;
}

export type FollowUpStatus = "Today" | "Tomorrow" | "This Week" | "Decision Pending";

export interface FollowUp {
  id: string;
  lead_id: string;
  lead_name: string;
  property_title: string;
  assigned_to: string;
  status: FollowUpStatus;
  time: string;
  note: string;
  created_at?: string;
  updated_at?: string;
}

// ── Configurable System Types ──────────────────────────────────

export interface Module {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at?: string;
}

export interface Permission {
  id: string;
  module_id: string;
  module_name?: string;
  action: "view" | "create" | "edit" | "delete" | "export";
  name: string;
  description: string;
  created_at?: string;
}

export interface RoleConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  hierarchy_level: number;
  is_system: boolean;
  is_active: boolean;
  permissions: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface FieldOption {
  id: string;
  field_id: string;
  label: string;
  value: string;
  sort_order: number;
  is_active?: boolean;
}

export interface FormField {
  id: string;
  section_id: string;
  field_type: string;
  label: string;
  placeholder: string;
  help_text: string;
  default_value: string;
  is_required: boolean;
  is_read_only: boolean;
  is_hidden: boolean;
  sort_order: number;
  validation_rules: Record<string, any>;
  metadata?: Record<string, any>;
  options?: FieldOption[];
  is_active?: boolean;
  created_at?: string;
}

export interface FormSection {
  id: string;
  form_id: string;
  name: string;
  description: string;
  sort_order: number;
  fields: FormField[];
  is_active?: boolean;
  created_at?: string;
}

export interface FormConfig {
  id: string;
  name: string;
  entity_type: "lead" | "property" | "project";
  description: string;
  is_active: boolean;
  sections: FormSection[];
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  gst_number: string;
  currency: string;
  timezone: string;
  working_hours: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionMatrix {
  modules: { id: string; name: string; slug: string }[];
  actions: string[];
  matrix: Record<string, Record<string, boolean>>;
}

// ── Workflow Types ──────────────────────────────────────────────

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  name: string;
  step_type: string;
  action: string;
  config: Record<string, any>;
  sort_order: number;
  is_active?: boolean;
  created_at?: string;
}

export interface Workflow {
  id: string;
  name: string;
  entity_type: string;
  description: string;
  trigger_event: string;
  is_active: boolean;
  steps: WorkflowStep[];
  created_at?: string;
  updated_at?: string;
}

// ── Notification Types ──────────────────────────────────────────

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  trigger_event: string;
  template_id: string;
  recipients: string[];
  conditions: Record<string, any>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Status & Lead Source Types ──────────────────────────────────

export interface StatusConfig {
  id: string;
  entity_type: string;
  name: string;
  slug: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface LeadSource {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

// ── Dashboard Widget Types ──────────────────────────────────────

export interface DashboardWidget {
  id: string;
  name: string;
  widget_type: string;
  description: string;
  config: Record<string, any>;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserDashboard {
  id: string;
  user_id: string;
  widgets: { widget_id: string; config?: Record<string, any> }[];
  layout: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}