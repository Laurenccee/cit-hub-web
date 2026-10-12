'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/utils/constants/routes';
import {
    PersonnelFormData,
    PersonnelSchema,
    RegisterPersonnelData,
    RegisterPersonnelSchema,
    UpdatePersonnelSchema,
} from '../schema/personnel';

import { getAuthorizedUser } from '@/actions';
import { runMutation } from '@/actions/mutation';
import { deleteStorageFileAction } from '@/actions/image';
import { ROLES } from '@/utils/constants/roles';
import { getErrorMessage } from '@/utils/errors';
import { registerUserWithRole, unregisterUser } from '@/actions/auth/register';
import type { PersonnelSubmitPayload } from '../types';

type PersonnelPayloadData = PersonnelFormData | PersonnelSubmitPayload;

/** Maps the camelCase form fields onto their snake_case `personnel` columns. */
function toPersonnelPayload(data: PersonnelPayloadData) {
    return {
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
}

export async function personnelSetupAction(values: PersonnelFormData) {
    return runMutation({
        values,
        schema: PersonnelSchema,
        authorize: getAuthorizedUser,
        revalidate: [ROUTES.PERSONNEL],
        successMessage: 'Personnel setup completed successfully!',
        execute: (data, { supabase, userId }) => supabase.from('personnel').insert({ id: userId, ...toPersonnelPayload(data) }),
    });
}

export async function updatePersonnelAction(values: PersonnelSubmitPayload) {
    return runMutation({
        values,
        schema: UpdatePersonnelSchema,
        authorize: getAuthorizedUser,
        revalidate: [ROUTES.PERSONNEL],
        successMessage: 'Personnel profile updated successfully.',
        execute: (data, { supabase, userId }) => supabase.from('personnel').update(toPersonnelPayload(data)).eq('id', userId),
    });
}

export async function registerPersonnelAction(values: RegisterPersonnelData) {
    const authorized = await getAuthorizedUser();
    if (!authorized) return { success: false, message: 'Unauthorized.' };

    const validatedFields = RegisterPersonnelSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.' };
    }

    const data = validatedFields.data;
    return registerUserWithRole({
        email: data.email,
        roleId: ROLES.FACULTY,
        revalidatePath: ROUTES.PERSONNEL,
    });
}

export async function deletePersonnelAction(id: string) {
    const authorized = await getAuthorizedUser();
    if (!authorized) return { success: false, message: 'Unauthorized.' };

    if (authorized.user.id === id) return { success: false, message: 'You cannot delete your own account from here.' };

    const supabase = await createClient();

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

        await unregisterUser(id);

        revalidatePath(ROUTES.PERSONNEL);
        return { success: true, message: 'Personnel successfully deleted.' };
    } catch (error) {
        console.error('Deletion Failed:', error);
        return { success: false, message: getErrorMessage(error, 'An unexpected error occurred.') };
    }
}
