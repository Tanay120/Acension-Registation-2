// src/pages/Register.tsx
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/supabase";
import { useRegistrationStore } from "@/store/registrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { UploadCloud } from "lucide-react";

type Player = {
  name: string;
};

type FormValues = {
  teamName: string;
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  players: Player[];
};

const defaultPlayers = Array.from({ length: 4 }, () => ({ name: "" }));

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isClosed, count, capacity, addTeam } = useRegistrationStore();
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      players: defaultPlayers,
    },
  });

  const spotsFilledPercent = Math.min(100, Math.round((count / capacity) * 100)); // CORRECTED
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (isClosed) { // CORRECTED
      toast({ title: "Registration Closed", description: "All team slots have been filled." });
      return;
    }
    
    if (!screenshotFile) {
        toast({ title: "Screenshot Required", description: "Please upload your payment screenshot.", variant: "destructive" });
        return;
    }

    try {
      const { data: existingTeams, error: selectError } = await supabase
        .from('registrations')
        .select('teamName')
        .eq('teamName', values.teamName.trim());

      if (selectError) throw selectError;
      if (existingTeams && existingTeams.length > 0) {
        toast({ title: "Team Name Taken", description: "This team name is already registered." });
        return;
      }

      const filePath = `${Date.now()}-${screenshotFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, screenshotFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);
      
      const screenshotURL = urlData.publicUrl;

      const { data: newTeamData, error: insertError } = await supabase
        .from('registrations')
        .insert({
          teamName: values.teamName.trim(),
          captainName: values.captainName.trim(),
          captainEmail: values.captainEmail.trim(),
          captainPhone: values.captainPhone.trim(),
          players: values.players.map((p) => ({ name: p.name.trim() })),
          screenshotURL: screenshotURL,
        })
        .select('id, teamName')
        .single();

      if (insertError) throw insertError;

      if (newTeamData) {
        addTeam({ id: newTeamData.id, teamName: newTeamData.teamName });
      }

      toast({ title: "Registration Successful!", description: `Welcome, ${values.teamName}!` });
      reset();
      navigate(`/success?team=${encodeURIComponent(values.teamName.trim())}`);
      
    } catch (e: any) {
      toast({
        title: "Unable to register",
        description: e?.message ?? "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="container py-10 md:py-14">
      <Helmet>
        <title>Register | Ascension Valorant Tournament</title>
        <meta name="description" content="Team registration for Ascension by IETE TSEC. Secure your spot." />
        <link rel="canonical" href="/register" />
      </Helmet>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-wide">Team Registration</h1>
        <p className="text-muted-foreground mt-2">5 players per team. Slots: {count}/{capacity} filled.</p> {/* CORRECTED */}
        <div className="mt-4 h-2 w-full bg-muted rounded">
          <div className="h-full rounded bg-primary transition-all duration-500" style={{ width: `${spotsFilledPercent}%` }} />
        </div>
        {isClosed && ( // CORRECTED
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
            <section>
              <Label htmlFor="teamName">Team Name</Label>
              <Input id="teamName" placeholder="e.g., Phoenix Five" {...register("teamName", { required: "Team name is required." })} />
              {errors.teamName && <p className="text-xs text-destructive mt-1">{errors.teamName.message}</p>}
            </section>

            <section className="grid md:grid-cols-2 gap-6">
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
            
            <section>
              <h2 className="font-display text-xl mb-3">Players 2–5</h2>
              <div className="space-y-4">
                {defaultPlayers.map((_, i) => (
                  <div key={i}>
                    <Label>Player {i + 2} Name</Label>
                    <Input placeholder={`Player ${i + 2} name`} {...register(`players.${i}.name` as const, { required: "Player name is required." })} />
                    {errors.players?.[i]?.name && <p className="text-xs text-destructive mt-1">{errors.players[i]?.name?.message}</p>}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t">
               <h2 className="font-display text-xl mb-3">Payment</h2>
               <div className="grid md:grid-cols-2 gap-8 items-center bg-muted/40 p-4 rounded-lg">
                  <div className="text-center">
                    <Label className="font-semibold mb-2 block">Scan to Pay</Label>
                    <img src="/upi-qr-code.png" alt="UPI QR Code for payment" className="rounded-lg mx-auto border" />
                    <p className="text-sm text-muted-foreground mt-2">Pay the entry fee using any UPI app.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="screenshot" className="font-semibold">Upload Payment Screenshot</Label>
                    <Input id="screenshot" type="file" accept="image/*" required onChange={handleFileChange} disabled={isSubmitting} />
                    {screenshotFile && <p className="text-sm text-muted-foreground">Selected: {screenshotFile.name}</p>}
                  </div>
               </div>
            </section>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Button size="xl" type="submit" disabled={isSubmitting || isClosed}> {/* CORRECTED */}
                {isClosed ? "Registration Closed" : isSubmitting ? "Submitting..." : <><UploadCloud className="mr-2 h-5 w-5" /> Submit Registration</>} {/* CORRECTED */}
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Register;