// 1. Define raw Supabase structures
export interface Rank {
    id: string; // or number, matching your Supabase PK
    name: string;
    description?: string | null;
    created_at?: string;
}

export interface Designation {
    id: string; // or number, matching your Supabase PK
    name: string;
    code?: string | null;
    created_at?: string;
}

export interface SocialMedia {
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
}

export interface EducationEntry {
    degree: string;
    major?: string;
    institution: string;
    yearGraduated?: string;
    onGoing: boolean;
}

// 2. Main Personnel Interface using raw relation schemas
export interface Personnel {
    id: string;
    name: string;
    email: string;
    office: string;

    employee_id: string;
    contact_number: string;
    social_media: SocialMedia;
    profile_picture_url?: string;

    ranks: Rank | null;
    designations?: Designation | null;

    education: EducationEntry[];

    is_active?: boolean;
    must_change_password?: boolean;
    created_at?: string;
}
