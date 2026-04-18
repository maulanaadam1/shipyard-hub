'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// --- Interfaces ---

export interface Equipment {
  id: string;
  created_at?: string;
  updated_at?: string;
  source: string;
  no_asset: string;
  type: string;
  brand: string;
  name: string;
  capacity: string;
  year_invest: string;
  available: string; // Used to be status
  alias: string;
  price: string;
}

export interface RequestedItem {
  type: string;
  quantity: number;
  deployedQuantity?: number;
}

export interface ApprovalStep {
  status: string;
  label: string;
  date?: string;
  comment?: string;
  user?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface LoanRequest {
  id: string;
  date_created: string;
  request_id: string;
  project_id: string;
  shipname: string;
  vendor: string;
  work_order: string;
  date_start: string;
  date_finish: string;
  duration: number;
  lampiran: string;
  change: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed' | 'Deployed';
  items: RequestedItem[];
  approval_steps: ApprovalStep[];
}

export interface DeploymentRecord {
  unique_id: string;
  create_date: string;
  create_by: string;
  last_updated: string;
  request_id: string;
  year: number;
  month: number;
  item: string;
  product_id: string;
  product_name: string;
  code_project: string;
  project_name: string;
  shipname: string;
  vendor_list: string;
  vendor: string;
  start_date: string;
  finish_date: string;
  duration: number;
  duration_hour: number;
  return_date: string;
  return_status: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Staff';
  avatar?: string;
}

export interface Vendor {
  id: string;
  vendor: string;
  nama_pt: string;
  whatapps: string;
  category: string;
  jumlah_anggota: number;
}

export interface Company {
  id: string;
  company_type: string;
  company_name: string;
}

export interface Ship {
  id: string;
  type: string;
  shipname: string;
  company: string;
  loa: number;
  breadth: number;
  depth: number;
  draft: number;
  gt: number;
  buid: string;
}

export interface Project {
  id: string;
  id_siaga?: number;
  create_date?: string;
  updated_at?: string;
  idproject: string;
  shipname?: string;
  cust_company?: string;
  approval_status?: string;
  m_employee_id?: string;
  est_start?: string;
  est_finish?: string;
  est_docking_date?: string;
  est_undocking_date?: string;
  est_trial_date?: string;
  est_arrival_date?: string;
  est_departure_date?: string;
  docking?: string;
  undocking?: string;
  act_arrival_date?: string;
  actual_start?: string;
  actual_finish?: string;
  act_trial_date?: string;
  act_departure_date?: string;
  no?: number;
  year?: number;
  company?: string;
  docking_id?: string;
  docking_type?: string;
  number_project?: string;
  type?: string;
  width?: number;
  length?: number;
  location?: string;
  x_coordinate?: number;
  y_coordinate?: number;
  status_dock?: string;
  ship_visibility?: string;
  ship_condition?: string;
  status?: string;
  status_comercial?: string;
  duration_dock?: number;
  duration_project?: number;
  project_lead?: string;
  price_contract?: number;
  cost_actual?: number;
  gross_profit?: number;
  safetyman?: string;
  project_team?: string;
  vendor_team?: string;
  manpower_all?: number;
  manpower_in?: number;
  manpower_ven?: number;
  update_pdf?: string;
  print?: string;
}

// --- Context Type ---

interface DataContextType {
  fleet: Equipment[];
  setFleet: React.Dispatch<React.SetStateAction<Equipment[]>>;
  loans: LoanRequest[];
  setLoans: React.Dispatch<React.SetStateAction<LoanRequest[]>>;
  deployments: DeploymentRecord[];
  setDeployments: React.Dispatch<React.SetStateAction<DeploymentRecord[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  ships: Ship[];
  setShips: React.Dispatch<React.SetStateAction<Ship[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Provider ---

export function DataProvider({ children }: { children: ReactNode }) {
  const [fleet, setFleet] = useState<Equipment[]>([]);
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // --- Fetch Initial Data ---
  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    console.log('Starting data fetch from Supabase...');
    
    // Set a safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setHasInitialLoaded(true);
      console.warn('Data fetch is taking longer than expected. Continuing with current state.');
    }, 7000);

    try {
      const results = await Promise.allSettled([
        supabase.from('equipment').select('*').order('created_at', { ascending: false }),
        supabase.from('loan_requests').select('*').order('date_created', { ascending: false }),
        supabase.from('deployment_records').select('*').order('create_date', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('vendors').select('*').order('vendor', { ascending: true }),
        supabase.from('companies').select('*').order('company_name', { ascending: true }),
        supabase.from('ships').select('*').order('shipname', { ascending: true }),
        supabase.from('projects').select('*').order('create_date', { ascending: false })
      ]);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { data, error } = result.value;
          if (error) {
            console.error(`Error fetching table ${index}:`, error.message);
            return;
          }
          if (data) {
            if (index === 0) setFleet(data as Equipment[]);
            if (index === 1) setLoans(data as LoanRequest[]);
            if (index === 2) setDeployments(data as DeploymentRecord[]);
            if (index === 3) setUsers(data as User[]);
            if (index === 4) setVendors(data as Vendor[]);
            if (index === 5) setCompanies(data as Company[]);
            if (index === 6) setShips(data as Ship[]);
            if (index === 7) setProjects(data as Project[]);
          }
        } else {
          console.error(`Promise rejected for table ${index}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Unexpected error during fetchData:', error);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      setHasInitialLoaded(true);
      console.log('Data fetch completed.');
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData(true);

    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    // Throttle the activity update to avoid excessive writes
    let timeoutId: NodeJS.Timeout;
    const throttledUpdateActivity = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        updateActivity();
        timeoutId = undefined as any;
      }, 60000); // Only update once per minute max
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', throttledUpdateActivity);
      window.addEventListener('keydown', throttledUpdateActivity);
      window.addEventListener('click', throttledUpdateActivity);
      window.addEventListener('scroll', throttledUpdateActivity);
    }

    // --- Realtime Subscriptions ---
    const fleetSubscription = supabase
      .channel('fleet_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, () => fetchData())
      .subscribe();

    const loansSubscription = supabase
      .channel('loans_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loan_requests' }, () => fetchData())
      .subscribe();

    const deploymentsSubscription = supabase
      .channel('deployments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deployment_records' }, () => fetchData())
      .subscribe();

    const profilesSubscription = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        fetchData();
        if (payload.new && (payload.new as any).id) {
          setCurrentUser(prev => {
            if (prev && prev.id === (payload.new as any).id) {
              return {
                ...prev,
                name: (payload.new as any).name || prev.name,
                role: (payload.new as any).role || prev.role,
                avatar: (payload.new as any).avatar_url || prev.avatar
              };
            }
            return prev;
          });
        }
      })
      .subscribe();

    const vendorsSubscription = supabase
      .channel('vendors_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, () => fetchData())
      .subscribe();

    const companiesSubscription = supabase
      .channel('companies_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, () => fetchData())
      .subscribe();

    const shipsSubscription = supabase
      .channel('ships_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ships' }, () => fetchData())
      .subscribe();

    const projectsSubscription = supabase
      .channel('projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchData())
      .subscribe();

    // Safety timeout for auth loading
    const authTimeout = setTimeout(() => {
      setIsAuthLoading(false);
      console.warn('Auth check timed out. Continuing...');
    }, 5000);

    // Check initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('getSession Result:', { hasSession: !!session, error });
      if (!session || error) {
        clearTimeout(authTimeout);
        setIsAuthLoading(false);
      } else {
        // If we have a session, we should not immediately drop to login screen
        // In case onAuthStateChange is slow, set a fallback after 2s
        setTimeout(() => {
          if (isAuthLoading) {
            const defaultAdminUsername = process.env.NEXT_PUBLIC_DEFAULT_ADMIN_USERNAME || 'superadmin';
            const isDefaultAdmin = session.user.email === process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL || session.user.email === `${defaultAdminUsername}@shipyard.local`;
            
            let fallbackRole = 'Staff';
            if (isDefaultAdmin) fallbackRole = 'Admin';
            else if (session.user.user_metadata?.role) {
               let metaRole = session.user.user_metadata.role.toString().trim();
               metaRole = metaRole.charAt(0).toUpperCase() + metaRole.slice(1).toLowerCase();
               if (['Admin','Manager','Staff'].includes(metaRole)) fallbackRole = metaRole;
            }
            setCurrentUser({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Unknown',
              email: session.user.email || '',
              role: fallbackRole as 'Admin' | 'Manager' | 'Staff',
              avatar: session.user.user_metadata?.avatar_url
            });
            setIsAuthLoading(false);
            clearTimeout(authTimeout);
          }
        }, 2000);
      }
    }).catch((e) => {
      console.error('getSession Error:', e);
      clearTimeout(authTimeout);
      setIsAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('onAuthStateChange Triggered:', event, { hasSession: !!session, hasUser: !!session?.user });
      clearTimeout(authTimeout);
      
      // Idle Session Expiration Check
      if (session?.user && typeof window !== 'undefined') {
        const lastActivity = localStorage.getItem('lastActivity');
        const now = Date.now();
        const TWELVE_HOURS = 12 * 60 * 60 * 1000;
        
        if (lastActivity && ((now - parseInt(lastActivity)) > TWELVE_HOURS)) {
          // Session expired due to idle
          localStorage.removeItem('lastActivity');
          await supabase.auth.signOut();
          setCurrentUser(null);
          setIsAuthLoading(false);
          return;
        }
        // Update activity because log in/restore means user is active
        localStorage.setItem('lastActivity', now.toString());
      }

      if (session?.user) {
        // Fallback user function
        const setFallbackUser = () => {
          const defaultAdminUsername = process.env.NEXT_PUBLIC_DEFAULT_ADMIN_USERNAME || 'superadmin';
          const isDefaultAdmin = session.user.email === process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL || session.user.email === `${defaultAdminUsername}@shipyard.local`;
          
          let fallbackRole = 'Staff';
          if (isDefaultAdmin) fallbackRole = 'Admin';
          else if (session.user.user_metadata?.role) {
             let metaRole = session.user.user_metadata.role.toString().trim();
             metaRole = metaRole.charAt(0).toUpperCase() + metaRole.slice(1).toLowerCase();
             if (['Admin','Manager','Staff'].includes(metaRole)) fallbackRole = metaRole;
          }

          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Unknown',
            email: session.user.email || '',
            role: fallbackRole as 'Admin' | 'Manager' | 'Staff',
            avatar: session.user.user_metadata?.avatar_url
          });
          setIsAuthLoading(false);
        };

        // Set a local timeout for this specific auth state change to prevent hanging
        const localAuthTimeout = setTimeout(() => {
          console.warn('Profile fetch in auth state change timed out.');
          setFallbackUser();
        }, 8000);

        const defaultAdminUsername = process.env.NEXT_PUBLIC_DEFAULT_ADMIN_USERNAME || 'superadmin';
        const isDefaultAdmin = session.user.email === process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL || session.user.email === `${defaultAdminUsername}@shipyard.local`;
        const isSuperAdmin = session.user.email === `${defaultAdminUsername}@shipyard.local`;
        
        try {
          // Fetch profile first to get accurate role and data
          let profile = null;
          let fetchError = null;

          // 1. Try direct fetch
          const { data: directProfile, error: directError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (directProfile) {
            profile = directProfile;
          } else {
            // 2. Fallback to API route (bypasses RLS)
            try {
              const controller = new AbortController();
              const fetchTimeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for fallback
              
              const res = await fetch('/api/auth/get-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id }),
                signal: controller.signal
              });
              
              clearTimeout(fetchTimeoutId);
              
              if (res.ok) {
                const data = await res.json();
                profile = data.profile;
              } else {
                fetchError = await res.text();
              }
            } catch (e) {
              console.error('API fallback failed or timed out:', e);
              fetchError = e;
            }
          }

          if (!profile && directError) {
            console.error('Error fetching profile directly:', directError.message);
          }

          // Initial robust fallback
          let fallbackRole = 'Staff';
          if (isDefaultAdmin) fallbackRole = 'Admin';
          else if (session.user.user_metadata?.role) {
             let metaRole = session.user.user_metadata.role.toString().trim();
             metaRole = metaRole.charAt(0).toUpperCase() + metaRole.slice(1).toLowerCase();
             if (['Admin','Manager','Staff'].includes(metaRole)) fallbackRole = metaRole;
          }

          let finalRole: 'Admin' | 'Manager' | 'Staff' = fallbackRole as 'Admin' | 'Manager' | 'Staff';
          let finalName = isSuperAdmin ? 'Super Admin' : (session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Unknown');
          let finalAvatar = session.user.user_metadata?.avatar_url || '';

          if (profile) {
            // Enforce default admin role if it was changed somehow
            let dbRole = (profile.role || 'Staff').toString().trim();
            dbRole = dbRole.charAt(0).toUpperCase() + dbRole.slice(1).toLowerCase();
            
            if (isDefaultAdmin && dbRole !== 'Admin') {
              // Don't await this update to avoid blocking the UI
              supabase.from('profiles').update({ role: 'Admin' }).eq('id', session.user.id).then();
              finalRole = 'Admin';
            } else {
              finalRole = ['Admin', 'Manager', 'Staff'].includes(dbRole) ? (dbRole as 'Admin' | 'Manager' | 'Staff') : 'Staff';
            }
            finalName = profile.name || finalName;
            finalAvatar = profile.avatar_url || finalAvatar;
            
            // Sync database role to JWT user_metadata so hard refreshes have immediate access
            if (session.user.user_metadata?.role !== finalRole) {
              supabase.auth.updateUser({ data: { role: finalRole } }).then();
            }
          } else if (!directError && !fetchError) {
            // Profile truly doesn't exist (e.g., first time Google Login). Create it.
            const newProfile = {
              id: session.user.id,
              name: finalName,
              email: isSuperAdmin ? '' : (session.user.email || ''),
              role: finalRole,
              avatar_url: finalAvatar
            };
            
            // Don't await this insert to avoid blocking the UI
            supabase.from('profiles').insert(newProfile).then(({error: insertError}) => {
              if (insertError) console.error('Error creating new profile:', insertError.message);
            });
          }

          setCurrentUser({
            id: session.user.id,
            name: finalName,
            email: isSuperAdmin ? '' : (session.user.email || ''),
            role: finalRole,
            avatar: finalAvatar
          });
        } catch (err) {
          console.error('Unexpected error fetching profile:', err);
          // Fallback if fetch fails completely
          let fallbackRole2 = 'Staff';
          if (isDefaultAdmin) fallbackRole2 = 'Admin';
          else if (session.user.user_metadata?.role) {
             let metaRole = session.user.user_metadata.role.toString().trim();
             metaRole = metaRole.charAt(0).toUpperCase() + metaRole.slice(1).toLowerCase();
             if (['Admin','Manager','Staff'].includes(metaRole)) fallbackRole2 = metaRole;
          }

          setCurrentUser({
            id: session.user.id,
            name: isSuperAdmin ? 'Super Admin' : (session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Unknown'),
            email: isSuperAdmin ? '' : (session.user.email || ''),
            role: fallbackRole2 as 'Admin' | 'Manager' | 'Staff',
            avatar: session.user.user_metadata?.avatar_url
          });
        } finally {
          clearTimeout(localAuthTimeout);
          setIsAuthLoading(false);
        }
      } else {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', throttledUpdateActivity);
        window.removeEventListener('keydown', throttledUpdateActivity);
        window.removeEventListener('click', throttledUpdateActivity);
        window.removeEventListener('scroll', throttledUpdateActivity);
      }
      fleetSubscription.unsubscribe();
      loansSubscription.unsubscribe();
      deploymentsSubscription.unsubscribe();
      profilesSubscription.unsubscribe();
      vendorsSubscription.unsubscribe();
      companiesSubscription.unsubscribe();
      shipsSubscription.unsubscribe();
      projectsSubscription.unsubscribe();
      authSubscription.unsubscribe();
    };
  }, [fetchData]);

  if (!mounted) {
    return <div suppressHydrationWarning />;
  }

  return (
    <DataContext.Provider value={{ 
      fleet, setFleet, 
      loans, setLoans, 
      deployments, setDeployments,
      users, setUsers,
      vendors, setVendors,
      companies, setCompanies,
      ships, setShips,
      projects, setProjects,
      currentUser, setCurrentUser,
      isAuthLoading
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
