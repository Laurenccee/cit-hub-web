'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Building2, GraduationCap, Phone, Mail, MapPin, User, Briefcase, Clock, BookOpen, ChevronRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Personnel } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import { Linkedin02Icon, FacebookIcon, TwitterIcon, InstagramIcon, ArrowRight01Icon, ExternalLinkIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

interface PersonnelProfileProps {
    personnel: Personnel;
}

export default function PersonnelProfile({ personnel }: PersonnelProfileProps) {
    const rankName = personnel.ranks?.name ?? null;
    const designationName = personnel.designations?.name ?? null;

    const getRoleBadgeColor = () => {
        if (designationName?.toLowerCase().includes('head')) return 'bg-[#8B1A1A]';
        if (designationName?.toLowerCase().includes('staff')) return 'bg-gray-600';
        return 'bg-[#8B1A1A]';
    };

    const socialLinks = [
        { label: 'LinkedIn', url: personnel.social_media?.linkedin, icon: Linkedin02Icon, color: 'bg-blue-600 text-white hover:bg-blue-700' },
        { label: 'Facebook', url: personnel.social_media?.facebook, icon: FacebookIcon, color: 'bg-blue-700 text-white hover:bg-blue-800' },
        { label: 'Twitter/X', url: personnel.social_media?.twitter, icon: TwitterIcon, color: 'bg-sky-500 text-white hover:bg-sky-600' },
        { label: 'Instagram', url: personnel.social_media?.instagram, icon: InstagramIcon, color: 'bg-pink-500 text-white hover:bg-pink-600' },
    ].filter((s) => s.url);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Breadcrumb */}
            <div className="border-b bg-card">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/personnel" className="hover:text-foreground transition-colors">Directory</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span>{personnel.office || 'CIT Department'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-[#8B1A1A] font-medium">Faculty Profile</span>
                    </nav>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-card border-b">
                <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-10 sm:px-6 lg:px-8">
                    {/* Profile Image */}
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                        {personnel.profile_picture_url ? (
                            <Image
                                src={personnel.profile_picture_url}
                                alt={`${personnel.first_name} ${personnel.last_name}`}
                                fill
                                className="object-cover rounded-full ring-4 ring-[#8B1A1A]/20"
                                priority
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted ring-4 ring-[#8B1A1A]/20">
                                <User className="w-14 h-14 text-muted-foreground/50" />
                            </div>
                        )}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                            <Badge className={`${getRoleBadgeColor()} text-white text-[10px] px-2.5 py-0.5 uppercase`}>
                                {designationName || 'Faculty'}
                            </Badge>
                        </div>
                    </div>

                    {/* Name & Title */}
                    <div className="text-center mt-2">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
                            {personnel.first_name} {personnel.last_name}
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground flex items-center justify-center gap-2">
                            <span>{rankName || 'Instructor'}</span>
                            <span className="text-[#8B1A1A]">•</span>
                            <span>{personnel.office || 'College of Information Technology'}</span>
                        </p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
                            <Badge className="w-4 h-4 rounded-full bg-[#8B1A1A] text-white text-[9px] flex items-center justify-center">ID</Badge>
                            Employee ID: #{personnel.employee_id}
                        </Badge>
                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
                            <Building2 className="w-4 h-4 text-[#8B1A1A]" />
                            {personnel.office || 'CIT Department'}
                        </Badge>
                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm border-green-300 bg-green-50 text-green-700">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Regular Active Status
                        </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-2">
                        <Button className="bg-[#8B1A1A] hover:bg-[#6B1515] text-white gap-2 px-6">
                            <Clock className="w-4 h-4" />
                            Schedule Consultation
                        </Button>
                        <Button variant="outline" className="gap-2 px-6 border-[#8B1A1A] text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white">
                            <Mail className="w-4 h-4" />
                            Send Message
                        </Button>
                    </div>
                </div>
            </section>

            {/* Content Sections */}
            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Contact & Office Information */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B1A1A]/10">
                                            <Phone className="w-4 h-4 text-[#8B1A1A]" />
                                        </div>
                                        Contact & Office Information
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs">Official Channel</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {personnel.contact_number && (
                                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1A1A]/10">
                                                    <Phone className="w-5 h-5 text-[#8B1A1A]" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Mobile Phone</p>
                                                    <p className="text-sm font-semibold">{personnel.contact_number}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1A1A]/10">
                                                <Mail className="w-5 h-5 text-[#8B1A1A]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Institutional Email</p>
                                                <p className="text-sm font-semibold text-[#8B1A1A]">
                                                    {personnel.first_name.toLowerCase()}.{personnel.last_name.toLowerCase()}@cit.edu.ph
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1A1A]/10">
                                                <MapPin className="w-5 h-5 text-[#8B1A1A]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Office Assignment</p>
                                                <p className="text-sm font-semibold">{personnel.office || 'CIT Dept - Faculty Room 204, Tech Wing'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1A1A]/10">
                                                <Clock className="w-5 h-5 text-[#8B1A1A]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Consultation Hours</p>
                                                <p className="text-sm font-semibold">Mon / Wed / Fri 1:00 PM – 4:00 PM</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Education & Credentials */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B1A1A]/10">
                                            <GraduationCap className="w-4 h-4 text-[#8B1A1A]" />
                                        </div>
                                        Education & Credentials
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {personnel.education && personnel.education.length > 0 ? (
                                        <div className="space-y-4">
                                            {personnel.education.map((edu, index) => (
                                                <div key={index} className="flex gap-4 p-4 bg-muted/30 rounded-lg border-l-4 border-[#8B1A1A]">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="secondary" className="text-xs gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {edu.onGoing ? 'Currently Pursuing' : `Class of ${edu.yearGraduated || 'N/A'}`}
                                                            </Badge>
                                                            {edu.onGoing && <Badge className="bg-[#8B1A1A] text-white text-[10px]">Ongoing</Badge>}
                                                        </div>
                                                        <h4 className="font-bold text-foreground">{edu.degree}</h4>
                                                        {edu.major && (
                                                            <p className="text-sm text-[#8B1A1A] font-medium">Major in {edu.major}</p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                            <Building2 className="w-3 h-3" />
                                                            {edu.institution}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No education information available.</p>
                                    )}

                                    {/* Academic Fields of Expertise */}
                                    <div className="pt-4 border-t">
                                        <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Academic Fields of Expertise</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {['Software Engineering', 'Web Development', 'Database Management', 'UI/UX Systems Design', 'Object-Oriented Programming'].map((field) => (
                                                <Badge key={field} variant="outline" className="text-xs">{field}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Current Semester Teaching Load */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B1A1A]/10">
                                                <BookOpen className="w-4 h-4 text-[#8B1A1A]" />
                                            </div>
                                            Current Semester Teaching Load
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">1st Semester Academic Year 2025-2026</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700 text-xs">2 Sections Active</Badge>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-[#8B1A1A] text-white text-[10px] px-2 py-0.5">IT 101</Badge>
                                            <div>
                                                <p className="text-sm font-semibold">Introduction to Software Engineering</p>
                                                <p className="text-xs text-muted-foreground">Section BSIT 2-A • Lecture & Laboratory (3 Units)</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium">Tue / Thu 9:00 AM – 11:30 AM</p>
                                            <p className="text-xs text-muted-foreground">Lab Room 302</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-[#8B1A1A] text-white text-[10px] px-2 py-0.5">CS 204</Badge>
                                            <div>
                                                <p className="text-sm font-semibold">Modern Web Systems & Technologies</p>
                                                <p className="text-xs text-muted-foreground">Section BSIT 3-B • Web Dev Track (3 Units)</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium">Mon / Wed 10:00 AM – 12:00 PM</p>
                                            <p className="text-xs text-muted-foreground">Multimedia Lab 1</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Right Column */}
                        <div className="space-y-6">
                            {/* Profile Details */}
                            <Card>
                                <CardContent className="pt-5">
                                    <h3 className="font-bold text-foreground mb-4">Profile Details</h3>
                                    <dl className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-dashed">
                                            <dt className="text-sm text-muted-foreground">Academic Rank</dt>
                                            <dd className="text-sm font-semibold text-foreground">{rankName || 'Instructor'}</dd>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-dashed">
                                            <dt className="text-sm text-muted-foreground">Designation</dt>
                                            <dd className="text-sm font-semibold text-[#8B1A1A]">{designationName || 'Faculty'}</dd>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-dashed">
                                            <dt className="text-sm text-muted-foreground">Department</dt>
                                            <dd className="text-sm font-semibold text-foreground">{personnel.office || 'CIT Department'}</dd>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-dashed">
                                            <dt className="text-sm text-muted-foreground">Employee ID</dt>
                                            <dd className="text-sm font-semibold text-foreground">{personnel.employee_id}</dd>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-dashed">
                                            <dt className="text-sm text-muted-foreground">Primary Contact</dt>
                                            <dd className="text-sm font-semibold text-foreground">{personnel.contact_number || 'N/A'}</dd>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <dt className="text-sm text-muted-foreground">Advisory Group</dt>
                                            <dd className="text-sm font-semibold text-foreground">Junior CS / IT Council</dd>
                                        </div>
                                    </dl>
                                </CardContent>
                            </Card>

                            {/* Book Consultation */}
                            <Card>
                                <CardContent className="pt-5">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1">Book Consultation</h3>
                                    <h4 className="font-bold text-foreground mb-1">Upcoming Open Slot</h4>
                                    <p className="text-xs text-muted-foreground mb-4">Select an open slot for academic advisory or project consultation.</p>
                                    
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                                <div>
                                                    <p className="text-sm font-semibold">Friday, Oct 24</p>
                                                    <p className="text-xs text-muted-foreground">01:30 PM – 02:15 PM</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 text-[10px]">AVAILABLE</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-gray-300" />
                                                <div>
                                                    <p className="text-sm font-semibold">Monday, Oct 27</p>
                                                    <p className="text-xs text-muted-foreground">02:00 PM – 02:45 PM</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[10px]">OPEN</Badge>
                                        </div>
                                    </div>
                                    
                                        <Button className="w-full bg-[#8B1A1A] hover:bg-[#6B1515] text-white gap-2">
                                            Confirm Consultation Slot
                                            <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
                                        </Button>
                                </CardContent>
                            </Card>

                            {/* Academic Resources */}
                            <Card>
                                <CardContent className="pt-5">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Academic Resources</h3>
                                    <div className="space-y-2">
                                        <a href="#" className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-[#8B1A1A]" />
                                                <span className="text-sm">CIT Course Syllabus Repository</span>
                                            </div>
                                            <HugeiconsIcon icon={ExternalLinkIcon} className="w-3.5 h-3.5 text-muted-foreground" />
                                        </a>
                                        <a href="#" className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-[#8B1A1A]" />
                                                <span className="text-sm">Consultation Request Policy</span>
                                            </div>
                                            <HugeiconsIcon icon={ExternalLinkIcon} className="w-3.5 h-3.5 text-muted-foreground" />
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-card">
                <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
                    <p>CIT Personnel Directory © 2026 CIT Hub • Central Institute of Technology</p>
                </div>
            </footer>
        </div>
    );
}