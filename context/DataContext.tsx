'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// --- Interfaces ---

export interface Equipment {
  id: string;
  created_date: string;
  no_asset: string;
  category: string;
  location: string;
  item: string;
  brand: string;
  no: string;
  name: string;
  type_capacity: string;
  year: string;
  alias: string;
  product_identifier: string;
  status: 'Available' | 'Deployed' | 'Maintenance' | 'Damaged';
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

// --- Initial Data ---

const initialFleet: Equipment[] = [
  {
    id: '60a1e9c4',
    created_date: '3/8/2025 13:24:09',
    no_asset: 'CNR 1',
    category: 'EQUIPMENT',
    location: 'WAREHOUSE FACILITY',
    item: 'SMAW',
    brand: 'WEICO',
    no: '1',
    name: 'Mesinlas SMAW 400A',
    type_capacity: '20A/20.8V-400 A/36V',
    year: '2011',
    alias: 'WEICO 1',
    product_identifier: 'WEICO 1 20A/20.8V-400 A/36V',
    status: 'Available'
  },
  {
    id: '0d85973b',
    created_date: '3/8/2025 13:24:09',
    no_asset: 'CNR 4',
    category: 'EQUIPMENT',
    location: 'WAREHOUSE FACILITY',
    item: 'SMAW',
    brand: 'WEICO',
    no: '2',
    name: 'Mesinlas SMAW 400A',
    type_capacity: '20A/20.8V-400 A/36V',
    year: '2011',
    alias: 'WEICO 2',
    product_identifier: 'WEICO 2 20A/20.8V-400 A/36V',
    status: 'Available'
  },
  {
    id: '31769070',
    created_date: '3/8/2025 13:24:09',
    no_asset: 'CNR 8',
    category: 'EQUIPMENT',
    location: 'WAREHOUSE FACILITY',
    item: 'SMAW',
    brand: 'WEICO',
    no: '3',
    name: 'Mesinlas SMAW 400A',
    type_capacity: '20A/20.8V-400 A/36V',
    year: '2011',
    alias: 'WEICO 3',
    product_identifier: 'WEICO 3 20A/20.8V-400 A/36V',
    status: 'Available'
  },
  {
    id: '5270f287',
    created_date: '3/8/2025 13:24:09',
    no_asset: 'DAIDEN 1',
    category: 'EQUIPMENT',
    location: 'WAREHOUSE FACILITY',
    item: 'SMAW',
    brand: 'WEICO',
    no: '4',
    name: 'Mesinlas SMAW 400A',
    type_capacity: '20A/20.8V-400 A/36V',
    year: '2011',
    alias: 'WEICO 4',
    product_identifier: 'WEICO 4 20A/20.8V-400 A/36V',
    status: 'Available'
  },
  {
    id: '04e7dfc3',
    created_date: '3/8/2025 13:24:09',
    no_asset: 'DAIDEN 2',
    category: 'EQUIPMENT',
    location: 'WAREHOUSE FACILITY',
    item: 'SMAW',
    brand: 'WEICO',
    no: '5',
    name: 'Mesinlas SMAW 400A',
    type_capacity: '20A/20.8V-400 A/36V',
    year: '2011',
    alias: 'WEICO 5',
    product_identifier: 'WEICO 5 20A/20.8V-400 A/36V',
    status: 'Available'
  },
  {
    id: 'blw-1',
    created_date: '3/8/2025 13:24:09',
    no_asset: 'BLW 01',
    category: 'EQUIPMENT',
    location: 'WAREHOUSE FACILITY',
    item: 'Blower',
    brand: 'Industrial',
    no: '6',
    name: 'Industrial Blower 1',
    type_capacity: 'High Power',
    year: '2022',
    alias: 'BLW 1',
    product_identifier: 'BLW 1 High Power',
    status: 'Available'
  },
  {
    id: 'blw-2',
    created_date: '3/8/2025 13:24:09',
    no_asset: 'BLW 02',
    category: 'EQUIPMENT',
    location: 'WAREHOUSE FACILITY',
    item: 'Blower',
    brand: 'Industrial',
    no: '7',
    name: 'Industrial Blower 2',
    type_capacity: 'High Power',
    year: '2022',
    alias: 'BLW 2',
    product_identifier: 'BLW 2 High Power',
    status: 'Available'
  }
];

const initialLoans: LoanRequest[] = [
  {
    id: '3bcd0f4b',
    date_created: '9/4/2019 0:00:00',
    request_id: 'ERQ/2019/09/002/YWTS',
    project_id: 'DRP19BBBG005/YWTS',
    shipname: 'SALIKI LIMA',
    vendor: '',
    work_order: 'WO1909014/YWTS',
    date_start: '2019-09-04',
    date_finish: '2019-09-05',
    duration: 1,
    lampiran: '',
    change: '',
    status: 'Approved',
    items: [{ type: 'SMAW', quantity: 2, deployedQuantity: 0 }, { type: 'Blower', quantity: 1, deployedQuantity: 0 }],
    approval_steps: [
      { status: 'Draft', label: 'Request Created', date: '9/4/2019 08:00', user: 'Admin', isCompleted: true, isCurrent: false },
      { status: 'Pending', label: 'Department Approval', date: '9/4/2019 10:30', user: 'HOD Maintenance', comment: 'Verified requirements', isCompleted: true, isCurrent: false },
      { status: 'Approved', label: 'Final Approval', date: '9/4/2019 14:20', user: 'General Manager', comment: 'Approved for project', isCompleted: true, isCurrent: true }
    ]
  }
];

const initialUsers: User[] = [
  { id: '1', name: 'Adam Maulana', email: 'maulana.adam1@gmail.com', role: 'Admin' },
  { id: '2', name: 'John Manager', email: 'manager@shipyard.com', role: 'Manager' },
  { id: '3', name: 'Staff User', email: 'staff@shipyard.com', role: 'Staff' },
];

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
        supabase.from('equipment').select('*').order('created_date', { ascending: false }),
        supabase.from('loan_requests').select('*').order('date_created', { ascending: false }),
        supabase.from('deployment_records').select('*').order('create_date', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('vendors').select('*').order('vendor', { ascending: true }),
        supabase.from('companies').select('*').order('company_name', { ascending: true }),
        supabase.from('ships').select('*').order('shipname', { ascending: true }),
        supabase.from('projects').select('*').order('id_siaga', { ascending: false })
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
      if (!session || error) {
        clearTimeout(authTimeout);
        setIsAuthLoading(false);
      }
    }).catch(() => {
      clearTimeout(authTimeout);
      setIsAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      clearTimeout(authTimeout);
      if (session?.user) {
        const isDefaultAdmin = session.user.email === process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL || session.user.email === 'superadmin@shipyard.local';
        const isSuperAdmin = session.user.email === 'superadmin@shipyard.local';
        
        // 1. Optimistic Update (Fast!) - Dismiss loading screen immediately
        setCurrentUser(prev => {
          const existingRole = prev?.id === session.user.id ? prev.role : null;
          return {
            id: session.user.id,
            name: isSuperAdmin ? 'Super Admin' : (session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Unknown'),
            email: isSuperAdmin ? '' : (session.user.email || ''),
            role: isDefaultAdmin ? 'Admin' : (existingRole || session.user.user_metadata?.role || 'Staff'),
            avatar: session.user.user_metadata?.avatar_url
          };
        });
        setIsAuthLoading(false);

        try {
          // 2. Fetch profile in background to get accurate role and data
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching profile:', error.message);
          }

          if (profile) {
            // Enforce default admin role if it was changed somehow
            if (isDefaultAdmin && profile.role !== 'Admin') {
              await supabase.from('profiles').update({ role: 'Admin' }).eq('id', session.user.id);
              profile.role = 'Admin';
            }
            
            setCurrentUser(prev => prev ? {
              ...prev,
              name: profile.name || prev.name,
              role: profile.role || prev.role,
              avatar: profile.avatar_url || prev.avatar
            } : null);
          } else if (!error) {
            // Profile doesn't exist (e.g., first time Google Login). Create it.
            const newProfile = {
              id: session.user.id,
              name: isSuperAdmin ? 'Super Admin' : (session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Unknown'),
              email: isSuperAdmin ? '' : (session.user.email || ''),
              role: isDefaultAdmin ? 'Admin' : 'Staff',
              avatar_url: session.user.user_metadata?.avatar_url || ''
            };
            
            const { error: insertError } = await supabase.from('profiles').insert(newProfile);
            if (insertError) {
              console.error('Error creating new profile:', insertError.message);
            } else {
              setCurrentUser(prev => prev ? { ...prev, role: isDefaultAdmin ? 'Admin' : 'Staff' } : null);
            }
          }
        } catch (err) {
          console.error('Unexpected error fetching profile:', err);
        }
      } else {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => {
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
