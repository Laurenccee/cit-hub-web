import { useRef, useTransition, useEffect } from 'react';
import { useForm, useFieldArray, useWatch, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PersonnelSchema, UpdatePersonnelSchema } from '../schema/personnel';
import { Personnel } from '../types';
import { deleteStorageFileAction } from '@/actions/image';

interface UsePersonnelFormProps {
    personnel?: Personnel;
    mode: 'setup' | 'edit';
    onPendingChange?: (isPending: boolean) => void;
    onSuccess?: () => void;
    submitAction: (data: any) => Promise<any>;
    uploadAvatarAction: (formData: FormData, oldUrl?: string | null) => Promise<any>;
}

export function usePersonnelForm({
    personnel,
    mode,
    onPendingChange,
    onSuccess,
    submitAction,
    uploadAvatarAction,
}: UsePersonnelFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const pendingBlobRef = useRef<Blob | null>(null);

    // Compute pre-filled states if we are editing an existing profile

    const defaultValues =
        mode === 'edit' && personnel
            ? {
                  id: personnel.id,
                  employeeId: personnel.employee_id,
                  firstName: personnel.first_name,
                  lastName: personnel.last_name,
                  rankId: personnel.ranks?.id,
                  designationId: personnel.designations?.id,
                  office: personnel.office,
                  contactNumber: personnel.contact_number,
                  education:
                      personnel.education.length > 0
                          ? personnel.education
                          : [{ degree: '', major: '', institution: '', onGoing: false }],
                  socialMedia: {
                      facebook: personnel.social_media?.facebook ?? '',
                      twitter: personnel.social_media?.twitter ?? '',
                      instagram: personnel.social_media?.instagram ?? '',
                      linkedin: personnel.social_media?.linkedin ?? '',
                  },
                  profilePictureUrl: personnel.profile_picture_url ?? '',
              }
            : {
                  employeeId: '',
                  firstName: '',
                  lastName: '',
                  rankId: '',
                  designationId: null,
                  office: '',
                  contactNumber: '',
                  education: [{ degree: '', major: '', institution: '', yearGraduated: '', onGoing: false }],
                  socialMedia: { facebook: '', twitter: '', instagram: '', linkedin: '' },
              };

    const { control, handleSubmit } = useForm<any>({
        resolver: zodResolver(mode === 'edit' ? UpdatePersonnelSchema : PersonnelSchema),
        defaultValues,
    });

    useEffect(() => {
        onPendingChange?.(isPending);
    }, [isPending, onPendingChange]);

    const educationValues = useWatch({ control, name: 'education' });
    const { fields, append, remove } = useFieldArray({ control, name: 'education' });

    const handleFormSubmit: SubmitHandler<any> = async (data) => {
        startTransition(async () => {
            let profilePictureUrl = personnel?.profile_picture_url || undefined;
            try {
                if (pendingBlobRef.current) {
                    const fd = new FormData();
                    fd.append('file', pendingBlobRef.current, 'profile.jpg');

                    const uploadResult = await uploadAvatarAction(fd, profilePictureUrl);
                    if (!uploadResult.success) {
                        throw new Error(uploadResult.message ?? 'Failed to upload photo.');
                    }
                    profilePictureUrl = uploadResult.url;
                }

                const result = await submitAction({ ...data, profilePictureUrl });
                if (!result.success) {
                    toast.error(result.message ?? 'Failed to save personnel profile.');
                    return;
                }

                toast.success(
                    mode === 'edit' ? 'Personnel updated successfully.' : 'Personnel profile created successfully!',
                );
                onSuccess?.();
                if (mode === 'setup') router.replace('/home');
            } catch (error: any) {
                if (profilePictureUrl && mode === 'setup') {
                    await deleteStorageFileAction(profilePictureUrl, 'avatar-images');
                }
                toast.error(error.message || 'An unexpected error occurred.');
            }
        });
    };

    return {
        control,
        isPending,
        fields,
        append,
        remove,
        educationValues,
        pendingBlobRef,
        onSubmit: handleSubmit(handleFormSubmit, (errors) => console.log('❌ Validation Errors:', errors)),
    };
}
