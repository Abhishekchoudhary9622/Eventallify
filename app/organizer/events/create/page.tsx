"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  HelpCircle,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  FileText,
  UserCheck,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ARTWORK_GALLERY, getEventImage } from "@/lib/event-images";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const CATEGORIES = [
  "Technical",
  "Cultural",
  "Workshop",
  "Hackathon",
  "Sports",
  "Academic",
  "Seminar",
  "Social",
];

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);

  // Step 1: Basic Info
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Technical");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(ARTWORK_GALLERY.Technical[0]);
  const [customImage, setCustomImage] = useState("");

  // Step 2: Date, Venue, Capacity
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [venue, setVenue] = useState("");
  const [capacity, setCapacity] = useState<number>(100);
  const [organizerName, setOrganizerName] = useState("CodeChef VIT Club");
  const [organizerDepartment, setOrganizerDepartment] = useState("SCOPE");

  // Step 3: Schedule & Rules
  const [schedule, setSchedule] = useState<{ time: string; activity: string; speaker?: string }[]>([
    { time: "09:30 AM", activity: "Check-in & Welcome Kit Distribution" },
    { time: "10:00 AM", activity: "Keynote Session & Overview" },
    { time: "01:00 PM", activity: "Hands-on Workshop / Coding Challenge" },
    { time: "04:30 PM", activity: "Prize Distribution & Closing Ceremony" },
  ]);
  const [rules, setRules] = useState<string[]>([
    "Carry your College Student ID card and Eventallify Digital QR Pass.",
    "Laptops and chargers are required for the hands-on session.",
    "Maintain decorum inside the venue.",
  ]);
  const [newRule, setNewRule] = useState("");

  // Step 4: Speakers & Prizes
  const [speakers, setSpeakers] = useState<{ name: string; role: string; organization?: string; bio?: string }[]>([
    { name: "Dr. Arvind Ramesh", role: "Keynote Speaker", organization: "Senior AI Researcher", bio: "Ex-Google Research" },
  ]);
  const [prizes, setPrizes] = useState<{ place: string; prize: string; perks?: string }[]>([
    { place: "1st Place (Winner)", prize: "₹15,000 Cash + Trophy", perks: "Internship Opportunity + Swag Kit" },
    { place: "2nd Place (Runner Up)", prize: "₹8,000 Cash + Certificate of Excellence", perks: "Swag Kit" },
  ]);

  // Step 5: FAQs & Custom Form Fields
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([
    { question: "Is this event open to all branches and years?", answer: "Yes! Students from all departments and years are welcome to participate." },
    { question: "Will participation certificates be provided?", answer: "Yes, verified certificates will be issued on your Eventallify profile upon QR check-in." },
  ]);
  const [customFields, setCustomFields] = useState<
    { id: string; label: string; type: "text" | "select" | "checkbox"; required: boolean; options?: string[] }[]
  >([
    { id: "github_handle", label: "GitHub Profile URL (Optional)", type: "text", required: false },
    { id: "experience_level", label: "Prior Experience Level", type: "select", required: true, options: ["Beginner", "Intermediate", "Advanced"] },
  ]);

  // AI Helper generator
  const triggerAiGeneration = async (type: string) => {
    if (!title) {
      toast.error("Please enter an Event Title first before using AI generation");
      return;
    }

    setAiGenerating(type);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          category,
          context: `Venue: ${venue || "Campus Auditorium"}, Organizer: ${organizerName}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        if (type === "description") {
          setDescription(data.result);
          if (!shortDescription) {
            setShortDescription(data.result.split(".")[0] + ".");
          }
          toast.success("AI generated full event description!");
        } else if (type === "schedule" && Array.isArray(data.result)) {
          setSchedule(data.result);
          toast.success("AI generated comprehensive event schedule!");
        } else if (type === "rules" && Array.isArray(data.result)) {
          setRules(data.result);
          toast.success("AI generated event rules & guidelines!");
        } else if (type === "faqs" && Array.isArray(data.result)) {
          setFaqs(data.result);
          toast.success("AI generated helpful attendee FAQs!");
        }
      } else {
        toast.error(data.error || "Failed to generate AI content");
      }
    } catch {
      toast.error("Error communicating with Eventallify AI");
    } finally {
      setAiGenerating(null);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!title.trim()) return toast.error("Event title is required");
      if (!description.trim()) return toast.error("Event description is required");
    }
    if (currentStep === 2) {
      if (!startDate) return toast.error("Start Date & Time is required");
      if (!venue.trim()) return toast.error("Venue location is required");
      if (!capacity || capacity <= 0) return toast.error("Capacity must be greater than 0");
    }
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitEvent = async () => {
    setSubmitting(true);
    try {
      const eventPayload = {
        title: title.trim(),
        category,
        shortDescription: shortDescription || description.slice(0, 150) + "...",
        description,
        image: customImage || selectedImage,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : undefined,
        venue: venue.trim(),
        capacity: Number(capacity),
        organizer: {
          name: organizerName.trim(),
          department: organizerDepartment.trim(),
        },
        schedule: schedule.filter((s) => s.activity.trim() !== ""),
        rules: rules.filter((r) => r.trim() !== ""),
        speakers: speakers.filter((sp) => sp.name.trim() !== ""),
        prizes: prizes.filter((p) => p.prize.trim() !== ""),
        faqs: faqs.filter((f) => f.question.trim() !== ""),
        customFields,
        status: "approved", // Auto-approved for verified organizers, or pending
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Event created and published successfully!");
        router.push(`/events/${data.eventId}`);
      } else {
        toast.error(data.error || "Failed to create event");
      }
    } catch {
      toast.error("An error occurred while creating the event");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Basic Info", icon: FileText },
    { num: 2, label: "Date & Venue", icon: Calendar },
    { num: 3, label: "Schedule & Rules", icon: Clock },
    { num: 4, label: "Speakers & Prizes", icon: Trophy },
    { num: 5, label: "FAQs & Form", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/organizer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="size-3.5" /> Back to Organizer Hub
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-primary mb-1 font-medium">
                <Sparkles className="size-4" /> AI-Assisted Event Builder
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Campus Event</h1>
            </div>
            <Badge variant="outline" className="self-start sm:self-auto py-1 px-3 text-xs">
              Step {currentStep} of 5
            </Badge>
          </div>

          {/* Stepper Wizard Bar */}
          <div className="grid grid-cols-5 gap-2 mt-8">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;

              return (
                <div
                  key={step.num}
                  onClick={() => isCompleted && setCurrentStep(step.num)}
                  className={`flex flex-col items-center text-center p-2 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary/10 border border-primary/40 text-primary font-semibold"
                      : isCompleted
                      ? "text-foreground hover:bg-muted/40"
                      : "text-muted-foreground/60 cursor-default"
                  }`}
                >
                  <div
                    className={`size-8 rounded-full flex items-center justify-center text-xs mb-1.5 transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : isCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="size-4" /> : step.num}
                  </div>
                  <span className="text-[11px] sm:text-xs line-clamp-1">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-6 sm:p-8 space-y-6 shadow-xl shadow-primary/5">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">1. Event Basics & Branding</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Define your event title, category, description, and visual poster artwork.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold">Event Title *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. HackVIT 2026: 36-Hour Hackathon"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      const gallery = (ARTWORK_GALLERY as any)[e.target.value] || ARTWORK_GALLERY.General;
                      setSelectedImage(gallery[0]);
                    }}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Short Tagline / Summary</label>
                <input
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="One sentence summary for event cards"
                  className="w-full px-4 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">Full Event Description *</label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10 h-7"
                    onClick={() => triggerAiGeneration("description")}
                    disabled={!!aiGenerating}
                  >
                    {aiGenerating === "description" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5 text-amber-400" />
                    )}
                    Generate with AI
                  </Button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Comprehensive event details, learning outcomes, eligibility, and perks..."
                  className="w-full px-4 py-3 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Artwork Selection */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold">Select Curated Cover Artwork</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {((ARTWORK_GALLERY as any)[category] || ARTWORK_GALLERY.General).map((imgUrl: string, idx: number) => {
                    const isSelected = selectedImage === imgUrl && !customImage;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedImage(imgUrl);
                          setCustomImage("");
                        }}
                        className={`relative h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/30 scale-102"
                            : "border-border/60 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image src={imgUrl} alt="Cover option" fill className="object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                            <CheckCircle2 className="size-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2">
                  <input
                    value={customImage}
                    onChange={(e) => setCustomImage(e.target.value)}
                    placeholder="Or enter custom image URL (https://...)"
                    className="w-full px-4 py-2 text-xs rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Date, Venue, Capacity */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">2. Date, Time, Venue & Capacity</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set event timing, seat limits, venue hall, and organizer credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Max Participant Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Venue / Campus Location *</label>
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Anna Auditorium, MG Auditorium, or Smart Classroom 402"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Host Club / Organization Name</label>
                  <input
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    placeholder="e.g. IEEE Student Branch"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Department / School</label>
                  <input
                    value={organizerDepartment}
                    onChange={(e) => setOrganizerDepartment(e.target.value)}
                    placeholder="e.g. SCOPE / SENSE"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Schedule & Rules */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">3. Schedule Timeline & Event Rules</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Structure event agenda and clear guidelines for students.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5 text-primary border-primary/30"
                    onClick={() => triggerAiGeneration("schedule")}
                    disabled={!!aiGenerating}
                  >
                    {aiGenerating === "schedule" ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 text-amber-400" />}
                    AI Schedule
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5 text-primary border-primary/30"
                    onClick={() => triggerAiGeneration("rules")}
                    disabled={!!aiGenerating}
                  >
                    {aiGenerating === "rules" ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 text-amber-400" />}
                    AI Rules
                  </Button>
                </div>
              </div>

              {/* Schedule Builder */}
              <div className="space-y-3">
                <label className="text-xs font-semibold flex items-center justify-between">
                  <span>Event Timeline Schedule</span>
                  <button
                    type="button"
                    onClick={() => setSchedule([...schedule, { time: "00:00", activity: "" }])}
                    className="text-primary text-xs hover:underline flex items-center gap-1"
                  >
                    <Plus className="size-3" /> Add Slot
                  </button>
                </label>

                <div className="space-y-2">
                  {schedule.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={item.time}
                        onChange={(e) => {
                          const updated = [...schedule];
                          updated[idx].time = e.target.value;
                          setSchedule(updated);
                        }}
                        placeholder="09:00 AM"
                        className="w-28 px-3 py-2 text-xs rounded-lg border bg-background"
                      />
                      <input
                        value={item.activity}
                        onChange={(e) => {
                          const updated = [...schedule];
                          updated[idx].activity = e.target.value;
                          setSchedule(updated);
                        }}
                        placeholder="Activity or talk description"
                        className="flex-1 px-3 py-2 text-xs rounded-lg border bg-background"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setSchedule(schedule.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules Builder */}
              <div className="space-y-3 pt-4 border-t">
                <label className="text-xs font-semibold">Rules & Regulations</label>
                <div className="space-y-2">
                  {rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs">
                      <span>• {rule}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-6 text-muted-foreground hover:text-destructive"
                        onClick={() => setRules(rules.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-1">
                    <input
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newRule.trim()) {
                          e.preventDefault();
                          setRules([...rules, newRule.trim()]);
                          setNewRule("");
                        }
                      }}
                      placeholder="Add rule and press Enter..."
                      className="flex-1 px-3 py-2 text-xs rounded-lg border bg-background"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (newRule.trim()) {
                          setRules([...rules, newRule.trim()]);
                          setNewRule("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Speakers & Prizes */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">4. Keynote Speakers & Competition Prizes</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Highlight esteemed guests, industry mentors, cash prizes, and winner perks.
                </p>
              </div>

              {/* Speakers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">Featured Speakers & Guests</label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() =>
                      setSpeakers([...speakers, { name: "", role: "Speaker", organization: "" }])
                    }
                  >
                    <Plus className="size-3 mr-1" /> Add Speaker
                  </Button>
                </div>

                <div className="space-y-3">
                  {speakers.map((sp, idx) => (
                    <div key={idx} className="p-3 rounded-xl border bg-muted/20 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          value={sp.name}
                          onChange={(e) => {
                            const updated = [...speakers];
                            updated[idx].name = e.target.value;
                            setSpeakers(updated);
                          }}
                          placeholder="Speaker Name"
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border bg-background"
                        />
                        <input
                          value={sp.role}
                          onChange={(e) => {
                            const updated = [...speakers];
                            updated[idx].role = e.target.value;
                            setSpeakers(updated);
                          }}
                          placeholder="Role / Title"
                          className="w-36 px-3 py-1.5 text-xs rounded-lg border bg-background"
                        />
                        <input
                          value={sp.organization || ""}
                          onChange={(e) => {
                            const updated = [...speakers];
                            updated[idx].organization = e.target.value;
                            setSpeakers(updated);
                          }}
                          placeholder="Company / Org"
                          className="w-36 px-3 py-1.5 text-xs rounded-lg border bg-background"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setSpeakers(speakers.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prizes */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">Prizes & Bounties (Optional)</label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => setPrizes([...prizes, { place: "Special Mention", prize: "Goodies & Swag" }])}
                  >
                    <Plus className="size-3 mr-1" /> Add Prize
                  </Button>
                </div>

                <div className="space-y-2">
                  {prizes.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={p.place}
                        onChange={(e) => {
                          const updated = [...prizes];
                          updated[idx].place = e.target.value;
                          setPrizes(updated);
                        }}
                        placeholder="1st Place"
                        className="w-40 px-3 py-2 text-xs rounded-lg border bg-background"
                      />
                      <input
                        value={p.prize}
                        onChange={(e) => {
                          const updated = [...prizes];
                          updated[idx].prize = e.target.value;
                          setPrizes(updated);
                        }}
                        placeholder="₹10,000 Cash + Trophy"
                        className="flex-1 px-3 py-2 text-xs rounded-lg border bg-background"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setPrizes(prizes.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: FAQs & Registration Form */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">5. FAQs & Custom Registration Fields</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Prepare attendee questions and configure custom registration prompts.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5 text-primary border-primary/30"
                  onClick={() => triggerAiGeneration("faqs")}
                  disabled={!!aiGenerating}
                >
                  {aiGenerating === "faqs" ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 text-amber-400" />}
                  AI Generate FAQs
                </Button>
              </div>

              {/* FAQs */}
              <div className="space-y-3">
                <label className="text-xs font-semibold">Frequently Asked Questions</label>
                <div className="space-y-3">
                  {faqs.map((f, idx) => (
                    <div key={idx} className="p-3 rounded-xl border bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          value={f.question}
                          onChange={(e) => {
                            const updated = [...faqs];
                            updated[idx].question = e.target.value;
                            setFaqs(updated);
                          }}
                          placeholder="Question..."
                          className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border bg-background"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                      <textarea
                        value={f.answer}
                        onChange={(e) => {
                          const updated = [...faqs];
                          updated[idx].answer = e.target.value;
                          setFaqs(updated);
                        }}
                        rows={2}
                        placeholder="Answer..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border bg-background"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Form Fields */}
              <div className="space-y-3 pt-4 border-t">
                <label className="text-xs font-semibold">Attendee Registration Questions</label>
                <p className="text-xs text-muted-foreground">
                  Collect student details (e.g. GitHub profile, dietary requirements, experience level) during ticket booking.
                </p>

                <div className="space-y-2">
                  {customFields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20 text-xs">
                      <span className="font-medium flex-1">{field.label}</span>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {field.type}
                      </Badge>
                      {field.required && (
                        <Badge variant="destructive" className="text-[10px]">
                          Required
                        </Badge>
                      )}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-6 text-muted-foreground hover:text-destructive"
                        onClick={() => setCustomFields(customFields.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="size-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <Button type="button" onClick={handleNext} className="gap-2 shadow-md shadow-primary/20">
                Continue <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmitEvent}
                disabled={submitting}
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Publish Campus Event
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
