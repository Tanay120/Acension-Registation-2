// src/pages/Teams.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import { db } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Define the structure of a team document from Firestore
interface Team {
  id: string;
  teamName: string;
  captainName: string;
  registeredAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Create a query to get all documents from the 'registrations' collection,
        // ordered by when they were registered.
        const q = query(collection(db, "registrations"), orderBy("registeredAt", "asc"));
        const querySnapshot = await getDocs(q);

        const teamsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Team));
        
        setTeams(teamsList);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (isLoading) {
    return <p className="text-center py-10">Loading registered teams...</p>;
  }

  return (
    <main className="container py-10 md:py-14">
      <Helmet>
        <title>Registered Teams | Ascension</title>
        <meta name="description" content="View all the teams registered for the Ascension Valorant Tournament." />
      </Helmet>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-wide">Registered Teams</h1>
          <p className="text-muted-foreground mt-2">{teams.length} of 16 teams have registered.</p>
        </div>
        <Button asChild>
            <Link to="/register">Register a Team</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Slot</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead>Captain</TableHead>
                <TableHead className="text-right">Registered On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team, index) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-semibold">{team.teamName}</TableCell>
                  <TableCell>{team.captainName}</TableCell>
                  <TableCell className="text-right">
                    {new Date(team.registeredAt.seconds * 1000).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {teams.length === 0 && (
             <p className="p-6 text-center text-muted-foreground">No teams have registered yet.</p>
           )}
        </CardContent>
      </Card>
    </main>
  );
};

export default Teams;