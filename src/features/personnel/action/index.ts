'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/utils/constants/routes';
import { PostgrestError } from '@supabase/supabase-js';
import {
    PersonnelFormData,
    PersonnelSchema,
    RegisterPersonnelData,
    RegisterPersonnelSchema,
    UpdatePersonnelFormData,
    UpdatePersonnelSchema,
} from '../schema/personnel';

import { getAuthorizedUser } from '@/actions';
import { deleteStorageFileAction } from '@/actions/image';

async function executePersonnelMutation(
    values: PersonnelFormData | UpdatePersonnelFormData,
    schema: typeof PersonnelSchema | typeof UpdatePersonnelSchema,
    successMessage: string,
    dbOperation: (supabase: any, payload: any, userId: string) => Promise<{ error: PostgrestError | null }>,
) {
    const authorized = await getAuthorizedUser();
    if (!authorized) return { success: false as const, message: 'Unauthorized.' };

    const validatedFields = schema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false as const, message: 'Invalid form data.' };
    }

    const data = validatedFields.data;
    const supabase = await createClient();

    const payload = {
        employee_id: data.employeeId,
        first_name: data.firstName,
        last_name: data.lastName,
        rank_id: data.rankId,
        designation_id: data.designationId ?? null,
        office: data.office,
        contact_number: data.contactNumber,
        social_media: data.socialMedia,
        education: data.education,
        profile_picture_url: data.profilePictureUrl ?? null,
    };

    try {
        const { error: dbError } = await dbOperation(supabase, payload, authorized.user.id);
        if (dbError) throw dbError;

        revalidatePath(ROUTES.PERSONNEL);
        return { success: true as const, message: successMessage };
    } catch (error: any) {
        return {
            success: false as const,
            message: error?.message || 'An unexpected database error occurred.',
        };
    }
}

export async function personnelSetupAction(values: PersonnelFormData) {
    return executePersonnelMutation(
        values,
        PersonnelSchema,
        'Personnel setup completed successfully!',
        (supabase, payload, userId) => supabase.from('personnel').insert({ id: userId, ...payload }),
    );
}

export async function updatePersonnelAction(values: UpdatePersonnelFormData) {
    return executePersonnelMutation(
        values,
        UpdatePersonnelSchema,
        'Personnel profile updated successfully.',
        (supabase, payload, userId) => supabase.from('personnel').update(payload).eq('id', userId),
    );
}

export async function registerPersonnelAction(values: RegisterPersonnelData) {
    const authorized = await getAuthorizedUser();
    if (!authorized) return { success: false, message: 'Unauthorized.' };

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

export async function deletePersonnelAction(id: string) {
    const authorized = await getAuthorizedUser();
    if (!authorized) return { success: false, message: 'Unauthorized.' };

    if (authorized.user.id === id) return { success: false, message: 'You cannot delete your own account from here.' };

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    try {
        const { data: personnelRow } = await supabase
            .from('personnel')
            .select('profile_picture_url')
            .eq('id', id)
            .single();

        if (personnelRow?.profile_picture_url) {
            const storageResult = await deleteStorageFileAction(personnelRow.profile_picture_url, 'avatar-images');

            if (!storageResult.success) {
                console.error('Storage deletion failed:', storageResult.message);
            }
        }

        const { error: personnelError } = await supabase.from('personnel').delete().eq('id', id);
        if (personnelError) throw personnelError;

        const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);
        if (profileError) throw profileError;

        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authError) throw authError;

        revalidatePath(ROUTES.PERSONNEL);
        return { success: true, message: 'Personnel successfully deleted.' };
    } catch (error: any) {
        console.error('Deletion Failed:', error);
        return { success: false, message: error?.message ?? 'An unexpected error occurred.' };
    }
}
