'use client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import PersonnelForm from './PersonnelForm';
import PersonnelCard from './PersonnelCard';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { EditPersonnelButtonProps, PersonnelPreviewData } from '../types';
import DeletePersonnelButton from './DeletePersonnelButton';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Edit01Icon } from '@hugeicons/core-free-icons';

const FORM_ID = 'edit-personnel-form';

export default function EditPersonnelButton({ personnel, ranks, designations }: EditPersonnelButtonProps) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [previewData, setPreviewData] = useState<PersonnelPreviewData>({
        profile_picture_url: personnel.profile_picture_url || '',
        first_name: personnel.first_name,
        last_name: personnel.last_name,
        office: personnel.office,
        rank_id: personnel.rank_id ?? null,
        designation_id: personnel.designation_id ?? null,
        contact_number: personnel.contact_number || '',
        education: personnel.education,
    });

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
                        <PersonnelForm
                            id={FORM_ID}
                            mode="edit"
                            personnel={personnel}
                            onPendingChange={setIsPending}
                            onPreviewChange={setPreviewData}
                            onSuccess={() => setOpen(false)}
                            ranks={ranks}
                            designations={designations}
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
