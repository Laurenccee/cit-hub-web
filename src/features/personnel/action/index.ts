'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import {
    PersonnelFormData,
    PersonnelSchema,
    RegisterPersonnelData,
    RegisterPersonnelSchema,
    UpdatePersonnelFormData,
    UpdatePersonnelSchema,
} from '../schema/personnel';
import { createClient } from '@/lib/supabase/server';
import { ROLES } from '@/utils/constants/roles';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/utils/constants/routes';

async function getAuthorizedUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase.from('profiles').select('role_id').eq('id', user.id).single();

    if (profile?.role_id !== ROLES.ADMIN && profile?.role_id !== ROLES.FACULTY) {
        return null;
    }
    return user;
}

export async function DeleteAvatarAction(url: string) {
    const user = await getAuthorizedUser();
    if (!user) return { success: false, message: 'Authentication required.' };

    const supabase = await createClient();

    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/');
        const bucketIndex = parts.indexOf('cit_hub');

        if (bucketIndex === -1) {
            return { success: false, message: 'Invalid URL structure.' };
        }

        const path = parts.slice(bucketIndex + 1).join('/');

        const expectedPrefix = `profile-pictures/${user.id}/`;
        if (!path.startsWith(expectedPrefix)) {
            return { success: false, message: 'Unauthorized access.' };
        }

        const { error } = await supabase.storage.from('cit_hub').remove([path]);
        if (error) return { success: false, message: error.message };

        return { success: true };
    } catch {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function UploadAvatarAction(formData: FormData) {
    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) {
        return { success: false, message: 'No file provided.' };
    }

    const user = await getAuthorizedUser();
    if (!user) return { success: false, message: 'Authentication required.' };

    const supabaseAdmin = createAdminClient();

    const path = `profile-pictures/${user.id}/${Date.now()}.jpg`;

    const { data, error } = await supabaseAdmin.storage
        .from('cit_hub')
        .upload(path, file, { upsert: true, contentType: 'image/jpeg' });

    if (error || !data) {
        return { success: false, message: error?.message ?? 'Upload failed.' };
    }

    const {
        data: { publicUrl },
    } = supabaseAdmin.storage.from('cit_hub').getPublicUrl(data.path);

    return { success: true, url: publicUrl };
}

export async function RegisterPersonnelAction(values: RegisterPersonnelData) {
    const user = await getAuthorizedUser();
    if (!user) return { success: false, message: 'Unauthorized.' };

    const validatedFields = RegisterPersonnelSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.' };
    }

    const data = validatedFields.data;

    const supabaseAdmin = createAdminClient();

    try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: 'P@ssw0rd!',
            email_confirm: false,
        });

        if (authError || !authData.user) {
            return { success: false, message: authError?.message || 'Failed to create authentication user.' };
        }

        const { error: profileError } = await supabaseAdmin.from('profiles').insert({
            id: authData.user.id,
            email: data.email,
            role_id: 1,
            change_password: true,
        });

        if (profileError) {
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return { success: false, message: profileError.message };
        }

        const { error: emailError } = await supabaseAdmin.auth.resend({
            type: 'signup',
            email: data.email,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${ROUTES.SIGN_IN}`,
            },
        });

        if (emailError) {
            console.error('Verification email failed to send:', emailError.message);
            return {
                success: false,
                message: emailError.message || 'User created but failed to send verification email.',
            };
        }

        revalidatePath(ROUTES.PERSONNEL);
        return { success: true };
    } catch (error) {
        console.error('Registration Action Error:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function PersonnelSetupAction(values: PersonnelFormData) {
    const user = await getAuthorizedUser();
    if (!user) return { success: false, message: 'Unauthorized.' };

    const validatedFields = PersonnelSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.' };
    }

    const data = validatedFields.data;
    const supabase = await createClient();

    try {
        const { error: personnelError } = await supabase.from('personnel').insert({
            id: user.id,
            employee_id: data.employeeId,
            name: `${data.firstName} ${data.lastName}`,
            rank_id: data.rankId,
            designation_id: data.designationId ?? null,
            office: data.office,
            contact_number: data.contactNumber,
            social_media: data.socialMedia,
            education: data.education,
            profile_picture_url: data.profilePictureUrl,
        });

        if (personnelError) {
            console.error('❌ Supabase Profile Error:', {
                message: personnelError.message,
                details: personnelError.details,
                hint: personnelError.hint,
                code: personnelError.code,
            });
            return { success: false, message: personnelError.message };
        }

        revalidatePath(ROUTES.PERSONNEL);
        return { success: true };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function UpdatePersonnelAction(values: UpdatePersonnelFormData) {
    const user = await getAuthorizedUser();
    if (!user) return { success: false, message: 'Unauthorized.' };

    const validatedFields = UpdatePersonnelSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.' };
    }

    const data = validatedFields.data;
    const supabase = await createClient();

    try {
        const { data: avatarUrl, error: avatarError } = await supabase
            .from('personnel')
            .select('profile_picture_url')
            .eq('id', data.id)
            .single();

        if (avatarError) {
            return { success: false, message: avatarError.message };
        }

        const finalProfilePicture =
            data.profilePictureUrl !== undefined ? data.profilePictureUrl : avatarUrl?.profile_picture_url;

        const { error } = await supabase
            .from('personnel')
            .update({
                profile_picture_url: data.profilePictureUrl ?? null,
                employee_id: data.employeeId,
                name: `${data.firstName} ${data.lastName}`,
                rank_id: data.rankId,
                designation_id: data.designationId ?? null,
                office: data.office,
                contact_number: data.contactNumber,
                social_media: data.socialMedia,
                education: data.education,
            })
            .eq('id', data.id);

        if (error) return { success: false, message: error.message };

        if (
            avatarUrl?.profile_picture_url &&
            data.profilePictureUrl &&
            data.profilePictureUrl !== avatarUrl.profile_picture_url
        ) {
            await DeleteAvatarAction(avatarUrl.profile_picture_url);
        }

        revalidatePath(ROUTES.PERSONNEL);
        return { success: true, message: 'Personnel updated successfully.' };
    } catch (error) {
        console.error('Update Action Error:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function DeletePersonnelAction(id: string) {
    const user = await getAuthorizedUser();
    if (!user) return { success: false, message: 'Unauthorized.' };

    if (user.id === id) return { success: false, message: 'You cannot delete your own account from here.' };

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    try {
        const { data: existing } = await supabase.from('personnel').select('profile_picture_url').eq('id', id).single();

        const { error: personnelError } = await supabase.from('personnel').delete().eq('id', id);
        if (personnelError) throw personnelError;

        const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);
        if (profileError) throw profileError;

        if (existing?.profile_picture_url) {
            await DeleteAvatarAction(existing.profile_picture_url);
        }

        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authError) throw authError;

        revalidatePath(ROUTES.PERSONNEL);
        return { success: true };
    } catch (error: any) {
        console.error('Deletion Failed:', error);
        return { success: false, message: error?.message ?? 'An unexpected error occurred.' };
    }
}
