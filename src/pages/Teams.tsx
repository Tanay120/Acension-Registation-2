// src/pages/Teams.tsx
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useRegistrationStore } from "@/store/registrations";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Teams = () => {
  const { teams, isLoading, fetchTeams, count, capacity } = useRegistrationStore();

  useEffect(() => {
    if (teams.length === 0) {
      fetchTeams();
    }
  }, [teams.length, fetchTeams]);

  return (
    <main className="container py-10 md:py-14">
      <Helmet>
        <title>Registered Teams | Ascension</title>
        <meta name="description" content="View all the teams registered for the Ascension Valorant Tournament." />
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-wide">Registered Teams</h1>
          <p className="text-muted-foreground mt-2">{count()} of {capacity} teams have registered.</p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/register">Register a Team</Link>
          </Button>
          {/* 1. Added Back to Home button */}
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-center text-muted-foreground">Loading registered teams...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Slot</TableHead>
                  <TableHead>Team Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team, index) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-semibold">{team.teamName}</TableCell>
                  </TableRow>
                ))}
                {teams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="p-6 text-center text-muted-foreground">
                      No teams have registered yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default Teams;