// src/pages/Success.tsx
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react"; // Import the icon

const Success = () => {
  // This hook reads the parameters from the URL (e.g., ?team=Phoenix%20Five)
  const [searchParams] = useSearchParams();
  const teamName = searchParams.get("team") ?? "Your Team";

  return (
    <main className="container flex items-center justify-center min-h-[80vh] py-10">
      <Helmet>
        <title>Registration Successful | Ascension</title>
        <meta name="description" content="Your team is registered for Ascension by IETE TSEC. See you on the battlefield!" />
        <link rel="canonical" href="/success" />
      </Helmet>

      <Card className="max-w-xl w-full mx-auto text-center animate-enter">
        <CardHeader className="items-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl font-display">Registration Confirmed!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Get ready to compete.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xl">
            Team <span className="font-semibold text-primary">{teamName}</span> has been successfully registered.
          </p>
          <p className="text-muted-foreground mt-2">
            We will contact your captain via email with the tournament brackets and schedule.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href="https://discord.com/invite/" target="_blank" rel="noopener noreferrer" aria-label="Join our Discord server">
                Join Discord for Updates
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Success;