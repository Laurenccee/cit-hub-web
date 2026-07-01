'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PersonnelCard from './PersonnelCard';
import PersonnelForm from './PersonnelForm';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRightIcon, Loading02Icon } from '@hugeicons/core-free-icons';
import { Designation, PersonnelPreviewData, Rank, SetupPersonnelCardProps } from '../types';

const DEFAULT_PREVIEW: PersonnelPreviewData = {
    profile_picture_url: '',
    first_name: '',
    last_name: '',
    office: '',
    rank_id: null,
    designation_id: null,
    contact_number: '',
    education: [],
};

export default function SetupPersonnelCard({ ranks, designations, initialPreview }: SetupPersonnelCardProps) {
    const [previewData, setPreviewData] = useState<PersonnelPreviewData>(initialPreview || DEFAULT_PREVIEW);
    const [isPending, setIsPending] = useState(false);

    return (
        <Card className="w-full max-w-7xl max-h-full min-h-0 mx-auto bg-background flex flex-col">
            <CardContent className="flex-1 min-h-0 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:h-full lg:min-h-0">
                    {/* LEFT: Scrollable form (main column) */}
                    <div className="flex flex-col gap-4 lg:col-span-3 lg:h-full lg:min-h-0">
                        <CardHeader className="p-0 gap-0 shrink-0">
                            <CardTitle>Setup Personnel</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Fill in the details for the new personnel member.
                            </CardDescription>
                        </CardHeader>

                        {/* The ONLY scrollable region in the page */}
                        <div className="lg:flex-1 lg:min-h-0 overflow-y-auto pr-2 pb-4 custom-scrollbar">
                            <PersonnelForm
                                mode={'setup'}
                                ranks={ranks}
                                designations={designations}
                                onPreviewChange={setPreviewData}
                                onPendingChange={setIsPending}
                            />
                        </div>
                    </div>

                    {/* RIGHT: Live preview card (sticky within the grid) */}
                    <div className="flex flex-col gap-4 lg:col-span-2 lg:h-full lg:min-h-0 lg:overflow-y-auto">
                        <CardHeader className="p-0 gap-0 shrink-0">
                            <CardTitle>Preview</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Updates live as you fill in the form.
                            </CardDescription>
                        </CardHeader>

                        <div className="bg-muted/30 rounded-xl border w-full p-6 flex items-start justify-center">
                            <div className="w-full max-w-65">
                                <PersonnelCard data={previewData} ranks={ranks} designations={designations} />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t p-4 flex justify-end shrink-0">
                <Button form="personnel-form" type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Personnel'}
                    <HugeiconsIcon
                        icon={isPending ? Loading02Icon : ArrowRightIcon}
                        className={isPending ? 'animate-spin' : ''}
                    />
                </Button>
            </CardFooter>
        </Card>
    );
}
