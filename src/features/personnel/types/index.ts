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
    id?: string;
    first_name: string;
    last_name: string;
    office: string;

    employee_id: string;
    contact_number?: string | null;
    social_media: SocialMedia;
    profile_picture_url?: string;

    // 1. The raw IDs (what your form uses and saves to the database)
    rank_id?: string | null;
    designation_id?: string | null;

    // 2. The expanded joined objects (what Supabase returns when you query relations)
    ranks?: Rank | null;
    designations?: Designation | null;

    education: EducationEntry[];

    is_active?: boolean;
    must_change_password?: boolean;
    created_at?: string;
    updated_at?: string;
}

export type PersonnelPreviewData = {
    profile_picture_url: string;
    first_name: string;
    last_name: string;
    office: string;
    rank_id: string | null;
    designation_id: string | null;
    contact_number: string;
    education: EducationEntry[]; // Or your specific Education type
};
