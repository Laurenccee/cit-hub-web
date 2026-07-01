import type React from 'react';

export interface Rank {
    id: string;
    name: string;
    description?: string | null;
    created_at?: string;
}

export interface Designation {
    id: string;
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

export interface Personnel {
    id?: string;
    first_name: string;
    last_name: string;
    office: string;
    employee_id: string;
    contact_number?: string | null;
    social_media: SocialMedia;
    profile_picture_url?: string;
    rank_id?: string | null;
    designation_id?: string | null;
    ranks?: Rank | null;
    designations?: Designation | null;
    education: EducationEntry[];
    is_active?: boolean;
    must_change_password?: boolean;
    created_at?: string;
    updated_at?: string;
}

type PersonnelBase = {
    first_name: string;
    last_name: string;
    education: EducationEntry[];
};

export type CardData = PersonnelBase & {
    profile_picture_url?: string | null;
    office?: string | null;
    rank_id?: string | null;
    designation_id?: string | null;
    contact_number?: string | null;
    ranks?: Rank | null;
    designations?: Designation | null;
};

export type PersonnelPreviewData = PersonnelBase & {
    profile_picture_url: string;
    office: string;
    rank_id: string | null;
    designation_id: string | null;
    contact_number: string;
};

export interface PersonnelCardProps {
    data: CardData;
    ranks: Rank[];
    designations: Designation[];
    editTarget?: Personnel;
    actions?: React.ReactNode;
}

export interface SetupPersonnelCardProps {
    ranks: Rank[];
    designations: Designation[];
    initialPreview?: PersonnelPreviewData;
}

export interface EditPersonnelButtonProps {
    personnel: Personnel;
    ranks: Rank[];
    designations: Designation[];
}

export interface PersonnelFormProps {
    id?: string;
    mode: 'setup' | 'edit';
    personnel?: Personnel;
    ranks: Rank[];
    designations: Designation[];
    onPreviewChange?: (preview: PersonnelPreviewData) => void;
    onPendingChange?: (isPending: boolean) => void;
    onSuccess?: () => void;
}

export interface UsePersonnelFormProps {
    personnel?: Personnel;
    mode: 'setup' | 'edit';
    onPendingChange?: (isPending: boolean) => void;
    onSuccess?: () => void;
    submitAction: (data: any) => Promise<any>;
    uploadAvatarAction: (formData: FormData, oldUrl?: string | null) => Promise<any>;
}
