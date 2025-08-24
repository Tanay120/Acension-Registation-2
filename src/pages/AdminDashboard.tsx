// src/pages/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/supabase';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) setTeams(data);
    if (error) console.error("Error fetching teams:", error);
  };

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
      }
    };
    checkUser();
    fetchTeams();
  }, [navigate]);

  const handleDelete = async (teamId: string, teamName: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', teamId);
      
      if (error) throw error;
      toast({ title: "Success", description: `Team "${teamName}" has been deleted.` });
      fetchTeams();
    } catch (error) {
      toast({ title: "Error", description: "Could not delete team.", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handlePaymentStatus = async (teamId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ paymentStatus: status })
        .eq('id', teamId);

      if (error) throw error;
      toast({ title: "Success", description: `Payment marked as ${status}.` });
      fetchTeams();
    } catch (error) {
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
    }
  };

  // CORRECTED: Restored the JSX inside the return statement
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