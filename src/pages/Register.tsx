// src/pages/Register.tsx
import { useState } from "react"; // <-- Add useState
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { collection, addDoc, Timestamp, query, where, getDocs, doc, updateDoc } from "firebase/firestore"; // <-- Add doc and updateDoc
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // <-- Add Firebase Storage imports

import { db, storage } from "@/firebase"; // <-- Import storage
import { useRegistrationStore } from "@/store/registrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { UploadCloud } from "lucide-react"; // <-- Optional: an icon for the button

// --- Type Definitions ---
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

// --- Constants ---
const defaultPlayers = Array.from({ length: 4 }, () => ({ name: "" }));

// --- Component ---
const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isClosed, count, capacity, addTeam } = useRegistrationStore();
  
  // --- NEW: State for the screenshot file ---
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

  const spotsFilledPercent = Math.min(100, Math.round((count() / capacity) * 100));
  
  // --- NEW: Handler for file input change ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (isClosed()) {
      toast({ title: "Registration Closed", description: "All team slots have been filled." });
      return;
    }
    
    // --- NEW: Check if a screenshot has been selected ---
    if (!screenshotFile) {
        toast({ title: "Screenshot Required", description: "Please upload your payment screenshot.", variant: "destructive" });
        return;
    }

    try {
      // Check for duplicate team name
      const q = query(collection(db, "registrations"), where("teamName", "==", values.teamName.trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast({ title: "Team Name Taken", description: "This team name is already registered." });
        return;
      }

      // 1. Add the team details to Firestore first (without screenshot URL)
      const docRef = await addDoc(collection(db, "registrations"), {
        teamName: values.teamName.trim(),
        captainName: values.captainName.trim(),
        captainEmail: values.captainEmail.trim(),
        captainPhone: values.captainPhone.trim(),
        players: values.players.map((p) => ({ name: p.name.trim() })),
        registeredAt: Timestamp.now(),
        paymentStatus: "pending_verification",
      });

      // 2. Upload the screenshot to Firebase Storage
      const filePath = `screenshots/${docRef.id}-${screenshotFile.name}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = await uploadBytes(storageRef, screenshotFile);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      // 3. Update the Firestore document with the screenshot URL
      await updateDoc(doc(db, "registrations", docRef.id), {
        screenshotURL: downloadURL,
      });

      addTeam({ id: docRef.id, teamName: values.teamName.trim() });

      toast({ title: "Registration Successful!", description: `Welcome, ${values.teamName}! We will verify your payment.` });
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

      {/* ... (Header section is the same) ... */}

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-display">Enter Team Details</CardTitle>
          <CardDescription>Make sure all fields are accurate before submitting.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* ... (Team Name, Captain, and Player sections are the same) ... */}

            {/* --- NEW: Payment and Upload Section --- */}
            <section className="space-y-4 pt-4 border-t">
               <h2 className="font-display text-xl mb-3">Payment</h2>
               <div className="grid md:grid-cols-2 gap-8 items-center bg-muted/40 p-4 rounded-lg">
                  <div className="text-center">
                    <Label className="font-semibold mb-2 block">Scan to Pay</Label>
                    {/* Make sure 'upi-qr-code.png' is in your /public folder */}
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
              <Button size="xl" type="submit" disabled={isSubmitting || isClosed()}>
                {isSubmitting ? "Submitting..." : <><UploadCloud className="mr-2 h-5 w-5" /> Submit Registration</>}
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