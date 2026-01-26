// Type definitions for the application
import type { RowDataPacket } from "mysql2/promise";

// User types
export interface User extends RowDataPacket {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  birth_date?: Date;
  gender_id?: number;
  phone?: string;
  address?: string;
  marital_status_id?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

// Article types
export interface Article extends RowDataPacket {
  id: number;
  title_de: string;
  title_fr: string;
  title_ar: string;
  content_de: string;
  content_fr: string;
  content_ar: string;
  image_url: string | null;
  status: "draft" | "published" | "archived";
  author_id: number;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

// Membership types
export interface Membership extends RowDataPacket {
  id: number;
  user_id: number;
  membership_id: string;
  membership_type_id: number;
  membership_status_id: number;
  start_date: Date;
  end_date?: Date | null;
  monthly_fee: number;
  sepa_account_holder: string;
  sepa_iban: string;
  sepa_bic?: string;
  sepa_bank: string;
  sepa_mandate_signed: boolean;
  sepa_mandate_date?: Date;
  confirmation_token?: string;
  confirmed_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Student types
export interface Student extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: Date;
  gender_id: number;
  guardian_id: number;
  created_at: Date;
  updated_at: Date;
}

// Auth token types
export interface AuthToken extends RowDataPacket {
  id: number;
  user_id: number;
  token: string;
  token_type: "magic_link" | "password_reset" | "email_verification";
  expires_at: Date;
  used_at?: Date | null;
  created_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

// Form types
export interface MembershipFormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: "male" | "female";
  address: string;
  email: string;
  phone: string;
  maritalStatus: "single" | "married" | "divorced" | "widowed";
  sepaAccountHolder: string;
  sepaIban: string;
  sepaBic?: string;
  sepaBank: string;
  sepaMandate: boolean;
  statutesAccepted: boolean;
  lang: "de" | "ar" | "fr";
}

export interface EducationRegistrationChild {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: "male" | "female";
  allergiesConditions: string;
}

export interface EducationRegistrationFormData {
  requesterFirstName: string;
  requesterLastName: string;
  requesterAddress: string;
  requesterEmail: string;
  requesterPhone: string;
  responsibleFirstName?: string;
  responsibleLastName?: string;
  responsibleAddress?: string;
  responsibleEmail?: string;
  responsiblePhone?: string;
  children: EducationRegistrationChild[];
  totalAmount: number;
  consentMediaOnline: boolean;
  consentMediaPrint: boolean;
  consentMediaPromotion: boolean;
  schoolRulesAccepted: boolean;
  sepaAccountHolder: string;
  sepaIban: string;
  sepaBic?: string;
  sepaBank: string;
  sepaMandate: boolean;
  lang: "de" | "ar" | "fr";
}

// Params types
export interface LocaleParams {
  params: Promise<{ lang: string }>;
}

export interface ArticleParams {
  params: Promise<{ lang: string; id: string }>;
}
