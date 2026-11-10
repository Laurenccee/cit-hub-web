'use client';
import { useState } from 'react';
import { useWatch, type FieldValues } from 'react-hook-form';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import PersonnelCard from './PersonnelCard';
import DeletePersonnelButton from './DeletePersonnelButton';
import PersonnelEditTabs from './PersonnelEditTabs';
import { type PersonnelStepId } from './setup-steps/steps';
import type { EditPersonnelButtonProps, PersonnelPreviewData } from '../types';
import { usePersonnelForm } from '../hooks/usePersonnelForm';
import { updatePersonnelAction } from '../action';
import { uploadAvatarAction } from '@/actions/image';

const FORM_ID = 'edit-personnel-form';

function trimmedOrEmpty(value?: string) {
    return value?.trim() || '';
}

function buildPreviewData(watched: FieldValues | undefined, profilePreviewUrl: string): PersonnelPreviewData {
    const values = watched ?? {};
    return {
        profile_picture_url: profilePreviewUrl || values.profilePictureUrl || '',
        first_name: trimmedOrEmpty(values.firstName),
        last_name: trimmedOrEmpty(values.lastName),
        office: trimmedOrEmpty(values.office),
        rank_id: values.rankId || null,
        designation_id: values.designationId ?? null,
        contact_number: trimmedOrEmpty(values.contactNumber),
        education: values.education?.length ? values.education : [],
    };
}

interface EditPersonnelBodyProps extends EditPersonnelButtonProps {
    onSuccess: () => void;
}

export default function EditPersonnelBody({ personnel, ranks, designations, onSuccess }: EditPersonnelBodyProps) {
    const [activeTab, setActiveTab] = useState<PersonnelStepId>('profile');
    const [profilePreviewUrl, setProfilePreviewUrl] = useState(personnel.profile_picture_url || '');

    const { control, isPending, pendingBlobRef, onSubmit } = usePersonnelForm({
        personnel,
        mode: 'edit',
        submitAction: updatePersonnelAction,
        uploadAvatarAction,
        onSuccess,
    });

    // Derived during render from the live form values — no effect needed to
    // mirror the form state into the preview panel.
    const watched = useWatch({ control });
    const previewData = buildPreviewData(watched, profilePreviewUrl);

    return (
        <>
            {/* LEFT: Live preview panel */}
            <div className="w-72 shrink-0 flex flex-col gap-4 p-8 border-r bg-muted/10 overflow-y-auto">
                <div className="flex flex-col gap-0.5 shrink-0">
                    <p className="text-sm font-semibold">Preview</p>
                    <p className="text-xs text-muted-foreground">Updates live as you edit.</p>
                </div>
                <PersonnelCard data={previewData} ranks={ranks} designations={designations} />
            </div>
            <div className="flex flex-col flex-1 min-w-0 min-h-0">
                <DialogHeader className="p-8 pb-2 shrink-0">
                    <DialogTitle>Edit Personnel</DialogTitle>
                    <DialogDescription>
                        Update the details for {`${personnel.first_name} ${personnel.last_name}`}.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-8 flex-1 pb-4 min-h-0 overflow-y-auto">
                    <PersonnelEditTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        formId={FORM_ID}
                        onSubmit={onSubmit}
                        control={control}
                        isPending={isPending}
                        ranks={ranks}
                        designations={designations}
                        profilePreviewUrl={profilePreviewUrl}
                        onProfilePreviewChange={setProfilePreviewUrl}
                        pendingBlobRef={pendingBlobRef}
                    />
                </div>
                <DialogFooter className="flex gap-2 px-6 py-4 border-t shrink-0">
                    <DeletePersonnelButton
                        id={personnel.id || ''}
                        name={`${personnel.first_name} ${personnel.last_name}`}
                    />
                    <Button type="submit" form={FORM_ID} size="lg" disabled={isPending}>
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </div>
        </>
    );
}
