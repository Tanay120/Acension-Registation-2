// src/pages/Index.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useRegistrationStore } from "@/store/registrations";
import heroImage from "@/assets/ascension-hero.jpg";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CountdownTimer } from "@/components/CountdownTimer";

const registrationDeadline = "2025-09-01T18:00:00+05:30";

const Index = () => {
  // Use the store's state and actions via the hook
  const { teams, capacity, isClosed, isLoading, fetchTeams, count } = useRegistrationStore();

  // Fetch team data when the component first loads
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return (
    <main>
      <Helmet>
        <title>Ascension Valorant Tournament | IETE TSEC</title>
        <meta name="description" content="Ascension is a 16-team Valorant tournament by IETE TSEC. Neon-futurist vibes. Register your 5-player team before slots fill up." />
        <link rel="canonical" href="/" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: 'Ascension Valorant Tournament',
          organizer: { '@type': 'Organization', name: 'IETE TSEC' },
          eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
          startDate: '2025-09-01T12:00:00+05:30',
          endDate: '2025-09-07T20:00:00+05:30',
          location: { '@type': 'VirtualLocation', url: '/' },
          maximumAttendeeCapacity: capacity,
          remainingAttendeeCapacity: Math.max(0, capacity - count()),
          description: 'Register your 5-player Valorant team for Ascension by IETE TSEC. 16 slots only.'
        })}</script>
      </Helmet>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_20%,hsl(var(--primary)/0.08)_40%,transparent_70%)]" aria-hidden="true" />
        <img src={heroImage} alt="Futuristic neon arena background for Ascension Valorant tournament" className="absolute inset-0 w-full h-full object-cover opacity-50" loading="eager" />
        <div className="relative">
          <div className="container min-h-[70vh] md:min-h-[75vh] flex items-center">
            <div className="max-w-3xl animate-enter">
              <p className="uppercase tracking-widest text-sm text-accent">IETE TSEC presents</p>
              <h1 className="text-5xl md:text-7xl font-display font-semibold leading-tight mt-3">Ascension</h1>
              <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl">A 16-team competitive Valorant tournament. Neon vibes. Bold plays. Only the best ascend.</p>

              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Button asChild variant="hero" size="xl" className="hover-scale">
                  <Link to="/register">{isClosed() ? "Registration Closed" : "Register Now"}</Link>
                </Button>
                <Button asChild variant="secondary" size="xl" className="hover-scale">
                  <Link to="/teams">View Registered Teams</Link>
                </Button>
              </div>

              <div className="mt-2 text-sm text-muted-foreground">
                Slots filled: <span className="text-foreground font-semibold">{count()}/{capacity}</span>
              </div>

              <div className="mt-8">
                <CountdownTimer target={registrationDeadline} label="Countdown to registration deadline" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <Tabs defaultValue="rules" className="w-full">
          <TabsList className="bg-secondary/60">
            <TabsTrigger value="rules">Tournament Rules</TabsTrigger>
            <TabsTrigger value="prizes">Prizes</TabsTrigger>
          </TabsList>
          <TabsContent value="rules" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Rules</CardTitle>
                <CardDescription>Play fair. Play fierce. Follow the rules below.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 list-disc pl-5 text-sm md:text-base">
                  <li>Exactly 5 players per team, including the captain.</li>
                  <li>Captain must be reachable via provided email and phone.</li>
                  <li>Valorant IDs must be accurate. Smurfing is prohibited.</li>
                  <li>Single elimination. Match rules and brackets shared post registration.</li>
                  <li>Admins’ decisions are final. Toxicity may result in disqualification.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="prizes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Prizes</CardTitle>
                <CardDescription>Glory. Bragging rights. And more.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                <PrizeCard place="Champions" details="Trophy + Certificates + Goodies" />
                <PrizeCard place="Runners-up" details="Certificates + Goodies" />
                <PrizeCard place="MVP" details="Special recognition" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <section className="container pb-20">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Registered Teams ({count()}/{capacity})</CardTitle>
            <CardDescription>Public list of teams registered so far.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading teams...</p>
            ) : teams.length === 0 ? (
              <p className="text-muted-foreground">No teams registered yet. Be the first!</p>
            ) : (
              <ol className="grid md:grid-cols-2 gap-3 list-decimal pl-5">
                {teams.map((t) => (
                  <li key={t.id} className="bg-secondary/40 border border-border rounded px-3 py-2">{t.teamName}</li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

const PrizeCard = ({ place, details }: { place: string; details: string }) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <div className="text-lg font-display">{place}</div>
    <div className="text-muted-foreground text-sm mt-1">{details}</div>
  </div>
);

export default Index;