// src/pages/Index.tsx
import { useEffect } from "react";
import { useRegistrationStore } from "@/store/registrations"; // <-- Change this import
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
// ... other imports

const Index = () => {
  // Use the store's state and actions
  const { teams, count, capacity, isClosed, isLoading, fetchTeams } = useRegistrationStore();

  // Fetch the teams when the component first loads
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return (
    <main>
      {/* ... Your Helmet and Hero section ... */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button asChild variant="hero" size="xl" className="hover-scale">
          <Link to="/register">{isClosed() ? "Registration Closed" : "Register Now"}</Link>
        </Button>
        <Link to="/teams" className="hover-scale">
          <Button variant="secondary" size="xl">View Registered Teams</Button>
        </Link>
      </div>
      <div className="text-sm text-muted-foreground mt-2">
        Slots filled: <span className="text-foreground">{count()}/{capacity}</span>
      </div>
      {/* ... The rest of your homepage JSX ... */}
      {/* Replace the final "Registered Teams" section with this: */}
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
// ... PrizeCard component ...
export default Index;