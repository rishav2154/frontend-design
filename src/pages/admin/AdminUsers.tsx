import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Users, Shield, ShieldOff, MoreHorizontal,
  Mail, Calendar, Zap
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiFetch, endpoints } from '@/lib/api';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

// Enhanced Interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    users: 0,
    recent: 0
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const data = await apiFetch(endpoints.admin.users);
      setUsers(data);
      
      // Calculate stats
      const admins = data.filter(u => u.role === 'admin').length;
      setStats({
        total: data.length,
        admins,
        users: data.length - admins,
        recent: data.filter(u => 
          new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdmin = async (userId: string) => {
    try {
      await apiFetch(endpoints.admin.userToggleAdmin, {
        args: [userId],
        method: 'PATCH',
      });
      toast({ 
        title: '✅ Role updated successfully!',
        duration: 2000 
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: '❌ Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name && name !== 'No name') {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25' 
      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="text-lg text-muted-foreground animate-pulse">Loading users...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 🎨 ENHANCED HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="break-words bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                User Management
              </h1>
              <p className="text-muted-foreground">Advanced user analytics and role management</p>
            </div>
          </div>
          
          {/* 🔢 STATS GRID */}
          <div className="grid w-full grid-cols-1 gap-3 min-[420px]:grid-cols-3 md:w-auto">
            <HoverCard>
              <HoverCardTrigger>
                <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 sm:px-6">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs font-medium text-blue-500 uppercase tracking-wider">Total Users</div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 p-4 bg-gradient-to-b from-background to-muted/50 backdrop-blur-sm border-0 shadow-2xl">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Admins</span>
                    <Badge className={getRoleColor('admin')}> {stats.admins} </Badge>
                  </div>
                  <Progress value={(stats.admins / stats.total) * 100} className="h-2" />
                </div>
              </HoverCardContent>
            </HoverCard>

            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 sm:px-6">
              <div className="text-2xl font-bold text-emerald-600">{stats.users}</div>
              <div className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Regular Users</div>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 sm:px-6">
              <div className="text-2xl font-bold text-purple-600">{stats.recent}</div>
              <div className="text-xs font-medium text-purple-500 uppercase tracking-wider">New This Month</div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* 🎨 PREMIUM TABLE CARD */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-background via-card to-muted/20 backdrop-blur-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-blue-50/50 to-indigo-50/50 pb-6 sm:pb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="break-words bg-gradient-to-r from-foreground to-primary bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                All Users ({users.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="min-h-11 w-full border-dashed hover:bg-primary/5 sm:w-auto">
                  <Zap className="w-4 h-4 mr-2" />
                  Bulk Actions
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Users className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No users yet</h3>
                <p className="text-sm text-muted-foreground/70 mb-6">Users will appear here as they sign up.</p>
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg hover:shadow-primary/20">
                  Invite Users
                </Button>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <Table>
                  <TableHeader className="border-b border-border/50">
                    <TableRow className="hover:bg-transparent border-b-2 border-primary/20">
                      <TableHead className="font-bold text-primary tracking-tight pl-8">User Details</TableHead>
                      <TableHead className="font-bold text-muted-foreground/80 hidden md:table-cell">Email</TableHead>
                      <TableHead className="font-bold text-muted-foreground/80 hidden lg:table-cell pr-8 text-right">Joined</TableHead>
                      <TableHead className="font-bold text-muted-foreground/80">Role</TableHead>
                      <TableHead className="font-bold text-muted-foreground/80 text-right pr-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow 
                        key={user.id} 
                        className={`group hover:bg-gradient-to-r hover:from-muted/50 hover:to-primary/5 transition-all duration-300 border-l-4 ${
                          index % 2 === 0 ? 'border-l-primary/20' : 'border-l-indigo/20'
                        }`}
                      >
                        {/* ✨ ENHANCED USER CELL */}
                        <TableCell className="pl-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar className="w-14 h-14 ring-4 ring-background/50 shadow-2xl group-hover:ring-primary/30 transition-all duration-300">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/90 via-purple-500/90 to-pink-500/90 text-primary-foreground border-2 border-white/20 font-bold text-lg shadow-2xl">
                                  {getInitials(user.name, user.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-background rounded-full flex items-center justify-center shadow-lg">
                                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-lg bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent mb-1 truncate">
                                {user.name}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(user.created_at).toLocaleDateString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="hidden md:table-cell py-6">
                          <div className="font-mono text-sm bg-muted/50 px-3 py-1 rounded-full truncate max-w-[200px]">
                            {user.email}
                          </div>
                        </TableCell>

                        <TableCell className="hidden lg:table-cell py-6 pr-8 text-right">
                          <div className="text-sm font-mono text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </TableCell>

                        {/* ✨ ENHANCED ROLE BADGE */}
                        <TableCell className="py-6">
                          <Badge 
                            className={`${getRoleColor(user.role)} text-sm px-4 py-2 shadow-lg font-semibold tracking-wide backdrop-blur-sm`}
                          >
                            {user.role === 'admin' ? 'ADMIN' : 'USER'}
                          </Badge>
                        </TableCell>

                        {/* ✨ ENHANCED ACTION BUTTON */}
                        <TableCell className="pr-8 py-6 text-right">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`group/btn border-2 h-12 px-6 font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 ${
                                  user.role === 'admin' 
                                    ? 'border-destructive/50 text-destructive bg-destructive/5 hover:bg-destructive/10 shadow-destructive/10' 
                                    : 'border-emerald-500/50 text-emerald-700 bg-emerald-500/5 hover:bg-emerald-500/10 shadow-emerald-500/10'
                                }`}
                                onClick={() => toggleAdmin(user.id)}
                              >
                                <div className="flex items-center gap-2 group-hover/btn:scale-110 transition-transform duration-200">
                                  {user.role === 'admin' ? (
                                    <>
                                      <ShieldOff className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                                      <span>Remove Admin</span>
                                    </>
                                  ) : (
                                    <>
                                      <Shield className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                                      <span>Make Admin</span>
                                    </>
                                  )}
                                </div>
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-72 p-4 bg-gradient-to-r from-destructive/5 to-destructive/2 border-destructive/20">
                              <div className="space-y-2">
                                <h4 className="font-bold text-destructive">{user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {user.role === 'admin' 
                                    ? 'Remove admin privileges and full access'
                                    : 'Grant full admin access and privileges'
                                  }
                                </p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-12 px-4 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                <div className="space-y-3 p-4 md:hidden">
                  {users.map((user) => (
                    <article key={user.id} className="rounded-xl border bg-card p-4 shadow-sm">
                      <div className="flex min-w-0 items-start gap-3">
                        <Avatar className="h-12 w-12 shrink-0 ring-2 ring-background shadow-lg">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/90 via-purple-500/90 to-pink-500/90 font-bold text-primary-foreground">
                            {getInitials(user.name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words font-bold">{user.name}</h3>
                          <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 shrink-0" />
                            Joined {new Date(user.created_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <Badge className={`${getRoleColor(user.role)} px-3 py-1.5 text-xs font-semibold`}>
                          {user.role === 'admin' ? 'ADMIN' : 'USER'}
                        </Badge>
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <Button
                          variant="outline"
                          className={`min-h-11 w-full font-semibold ${
                            user.role === 'admin'
                              ? 'border-destructive/50 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive'
                              : 'border-emerald-500/50 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700'
                          }`}
                          onClick={() => toggleAdmin(user.id)}
                        >
                          {user.role === 'admin' ? (
                            <ShieldOff className="mr-2 h-5 w-5" />
                          ) : (
                            <Shield className="mr-2 h-5 w-5" />
                          )}
                          {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 🎨 FOOTER STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-border/50">
          <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm border border-primary/20">
            <div className="text-3xl font-black text-primary mb-2">{stats.total}</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Users</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/20">
            <div className="text-3xl font-black text-emerald-600 mb-2">{stats.admins}</div>
            <div className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Admin Users</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20">
            <div className="text-3xl font-black text-purple-600 mb-2">{stats.recent}</div>
            <div className="text-sm font-medium text-purple-600 uppercase tracking-wider">New This Month</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
