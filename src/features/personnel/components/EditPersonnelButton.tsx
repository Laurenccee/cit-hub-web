'use client';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Edit01Icon } from '@hugeicons/core-free-icons';
import PersonnelCard from './PersonnelCard';
import DeletePersonnelButton from './DeletePersonnelButton';
import PersonnelEditTabs from './PersonnelEditTabs';
import { type PersonnelStepId } from './setup-steps/steps';
import { EditPersonnelButtonProps, PersonnelPreviewData } from '../types';
import { usePersonnelForm } from '../hooks/usePersonnelForm';
import { updatePersonnelAction } from '../action';
import { uploadAvatarAction } from '@/actions/image';

const FORM_ID = 'edit-personnel-form';

export default function EditPersonnelButton({ personnel, ranks, designations }: EditPersonnelButtonProps) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<PersonnelStepId>('profile');
    const [profilePreviewUrl, setProfilePreviewUrl] = useState(
        personnel.profile_picture_url || '',
    );

    const { control, isPending, pendingBlobRef, onSubmit } = usePersonnelForm({
        personnel,
        mode: 'edit',
        submitAction: updatePersonnelAction,
        uploadAvatarAction,
        onSuccess: () => setOpen(false),
    });

    // Derived during render from the live form values — no effect needed to
    // mirror the form state into the preview panel.
    const watched = useWatch({ control });
    const previewData: PersonnelPreviewData = {
        profile_picture_url: profilePreviewUrl || watched?.profilePictureUrl || '',
        first_name: watched?.firstName?.trim() || '',
        last_name: watched?.lastName?.trim() || '',
        office: watched?.office?.trim() || '',
        rank_id: watched?.rankId || null,
        designation_id: watched?.designationId ?? null,
        contact_number: watched?.contactNumber?.trim() || '',
        education: watched?.education?.length ? watched.education : [],
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon-xs" variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                    <HugeiconsIcon icon={Edit01Icon} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-7xl max-h-[85vh] p-0 overflow-hidden flex flex-row gap-0">
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
            </DialogContent>
        </Dialog>
    );
}
