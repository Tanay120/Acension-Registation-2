// src/pages/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs, orderBy, query, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import { db } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// CORRECTED: Updated interface to include all fields
interface Team {
  id: string;
  teamName: string;
  captainName: string;
  captainEmail: string;
  screenshotURL?: string;
  paymentStatus?: string;
}

const AdminDashboard = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = getAuth();

  const fetchTeams = async () => {
    const q = query(collection(db, "registrations"), orderBy("registeredAt", "asc"));
    const querySnapshot = await getDocs(q);
    const teamsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
    setTeams(teamsList);
  };

  useEffect(() => {
    fetchTeams();
  }, []);
  
  // CORRECTED: Moved handleDelete and handleLogout inside the component
  const handleDelete = async (teamId: string, teamName: string) => {
    try {
      await deleteDoc(doc(db, "registrations", teamId));
      toast({ title: "Success", description: `Team "${teamName}" has been deleted.` });
      fetchTeams(); // Refresh the list after deleting
    } catch (error) {
      toast({ title: "Error", description: "Could not delete team.", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  // Optional but recommended: function to approve/reject payments
  const handlePaymentStatus = async (teamId: string, status: "approved" | "rejected") => {
    try {
      const teamDocRef = doc(db, "registrations", teamId);
      await updateDoc(teamDocRef, { paymentStatus: status });
      toast({ title: "Success", description: `Payment marked as ${status}.` });
      fetchTeams(); // Refresh the list
    } catch (error) {
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
    }
  };

  return (
    <main className="container py-10 md:py-14">
      <Helmet><title>Admin Dashboard | Ascension</title></Helmet>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-semibold">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Captain</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="font-semibold">{team.teamName}</TableCell>
              <TableCell>{team.captainName}</TableCell>
              <TableCell>{team.captainEmail}</TableCell>
              <TableCell>
                {team.screenshotURL ? (
                  <a href={team.screenshotURL} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                    View Screenshot
                  </a>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
                <p className="text-xs capitalize text-muted-foreground">{team.paymentStatus?.replace('_', ' ')}</p>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  {team.paymentStatus === 'pending_verification' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handlePaymentStatus(team.id, 'approved')}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => handlePaymentStatus(team.id, 'rejected')}>Reject</Button>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    {/* CORRECTED: The content for the AlertDialog was missing */}
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the registration for "{team.teamName}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(team.id, team.teamName)}>
                          Yes, delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
};

export default AdminDashboard;