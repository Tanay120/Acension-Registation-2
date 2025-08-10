// src/pages/Register.tsx
import { useEffect, useState, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { collection, addDoc, getDocs, Timestamp, query, where } from "firebase/firestore";

import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

// --- Type Definitions ---
type Player = {
  name: string;
  valorantId: string;
};

type FormValues = {
  teamName: string;
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  players: Player[]; // Array of 4 additional players
};

// --- Constants ---
const defaultPlayers = Array.from({ length: 4 }, () => ({ name: "", valorantId: "" }));
const REGISTRATION_CAPACITY = 16;

// --- Component ---
const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [registrationCount, setRegistrationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      players: defaultPlayers,
    },
  });

  // Fetch the current registration count from Firestore when the component mounts
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const registrationsCol = collection(db, "registrations");
        const snapshot = await getDocs(registrationsCol);
        setRegistrationCount(snapshot.size);
      } catch (error) {
        console.error("Error fetching registration count:", error);
        toast({
          title: "Error",
          description: "Could not fetch registration status. Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCount();
  }, [toast]);

  // Memoized values to prevent recalculating on every render
  const isRegistrationClosed = useMemo(() => registrationCount >= REGISTRATION_CAPACITY, [registrationCount]);
  const spotsFilledPercent = useMemo(
    () => Math.min(100, Math.round((registrationCount / REGISTRATION_CAPACITY) * 100)),
    [registrationCount]
  );

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (isRegistrationClosed) {
      toast({ title: "Registration Closed", description: "All 16 team slots have been filled." });
      return;
    }

    try {
      // 1. Check for duplicate team name before submitting
      const q = query(collection(db, "registrations"), where("teamName", "==", values.teamName.trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast({ title: "Team Name Taken", description: "This team name is already registered. Please choose another." });
        return;
      }

      // 2. Add the new team to the 'registrations' collection in Firestore
      await addDoc(collection(db, "registrations"), {
        teamName: values.teamName.trim(),
        captainName: values.captainName.trim(),
        captainEmail: values.captainEmail.trim(),
        captainPhone: values.captainPhone.trim(),
        players: values.players.map((p) => ({ name: p.name.trim(), valorantId: p.valorantId.trim() })),
        registeredAt: Timestamp.now(),
      });

      // 3. Show success message and navigate
      toast({ title: "Registration Successful!", description: `Welcome to Ascension, ${values.teamName}!` });
      navigate(`/success?team=${encodeURIComponent(values.teamName.trim())}`);
    } catch (e: any) {
      toast({
        title: "Unable to register",
        description: e?.message ?? "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="container py-10 md:py-14">
      <Helmet>
        <title>Register | Ascension Valorant Tournament</title>
        <meta name="description" content="Team registration for Ascension by IETE TSEC. 5 players per team, 16 slots only. Secure your spot." />
        <link rel="canonical" href="/register" />
      </Helmet>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-wide">Team Registration</h1>
        <p className="text-muted-foreground mt-2">5 players per team (exactly). Slots: {registrationCount}/{REGISTRATION_CAPACITY} filled.</p>
        <div className="mt-4 h-2 w-full bg-muted rounded">
          <div className="h-full rounded bg-primary transition-all duration-500" style={{ width: `${spotsFilledPercent}%` }} />
        </div>
        {isRegistrationClosed && !isLoading && (
          <p className="mt-3 text-sm text-destructive">Registration is closed. All team slots are filled.</p>
        )}
      </header>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-display">Enter Team Details</CardTitle>
          <CardDescription>Make sure all fields are accurate before submitting.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Team Name Section */}
            <section>
              <Label htmlFor="teamName">Team Name</Label>
              <Input id="teamName" placeholder="e.g., Phoenix Five" {...register("teamName", { required: "Team name is required." })} />
              {errors.teamName && <p className="text-xs text-destructive mt-1">{errors.teamName.message}</p>}
            </section>

            {/* Captain's Details Section */}
            <section className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="captainName">Captain’s Name</Label>
                <Input placeholder="Your name" {...register("captainName", { required: "Captain's name is required." })} />
                {errors.captainName && <p className="text-xs text-destructive mt-1">{errors.captainName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="captainEmail">Captain’s Email</Label>
                <Input type="email" placeholder="you@example.com" {...register("captainEmail", { required: "A valid email is required.", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address." } })} />
                {errors.captainEmail && <p className="text-xs text-destructive mt-1">{errors.captainEmail.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="captainPhone">Captain’s Phone</Label>
                <Input type="tel" placeholder="10-digit number" {...register("captainPhone", { required: "Phone number is required.", minLength: { value: 7, message: "Must be a valid phone number." } })} />
                {errors.captainPhone && <p className="text-xs text-destructive mt-1">{errors.captainPhone.message}</p>}
              </div>
            </section>

            {/* Other Players Section */}
            <section>
              <h2 className="font-display text-xl mb-3">Players 2–5</h2>
              <div className="grid gap-4">
                {defaultPlayers.map((_, i) => (
                  <div key={i} className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Player {i + 2} Name</Label>
                      {/* Using "as const" helps TypeScript infer the correct field name type */}
                      <Input placeholder={`Player ${i + 2} name`} {...register(`players.${i}.name` as const, { required: "Player name is required." })} />
                       {errors.players?.[i]?.name && <p className="text-xs text-destructive mt-1">{errors.players[i]?.name?.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Player {i + 2} Valorant ID</Label>
                      <Input placeholder="e.g., Duelist#1234" {...register(`players.${i}.valorantId` as const, { required: "Valorant ID is required." })} />
                      {errors.players?.[i]?.valorantId && <p className="text-xs text-destructive mt-1">{errors.players[i]?.valorantId?.message}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="pt-2">
              <Button size="xl" className="w-full md:w-auto" type="submit" disabled={isSubmitting || isRegistrationClosed || isLoading}>
                {isLoading ? "Checking status..." : isRegistrationClosed ? "Registration Closed" : isSubmitting ? "Submitting..." : "Submit Registration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Register;