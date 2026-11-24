import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  Tag,
  Users,
  LogOut,
  ChevronLeft,
  Package,
  Smartphone,
  Megaphone,
  X,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { apiFetch, endpoints } from '@/lib/api';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Tag, label: 'Coupons', path: '/admin/coupons' },
  { icon: Megaphone, label: 'Banners', path: '/admin/banners' },
  { icon: Smartphone, label: 'Phone Covers', path: '/admin/phone-covers' },
  { icon: Users, label: 'Users', path: '/admin/users' },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeMobileMenu = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleLogout = async () => {
    try {
      await apiFetch(endpoints.admin.logout, {
        method: 'POST',
      });

      localStorage.removeItem('adminToken');

      toast({
        title: 'Logged out',
        description: 'You have been signed out.',
      });

      setOpenMobile(false);
      navigate('/admin/login');
    } catch (err) {
      setOpenMobile(false);
      navigate('/admin/login');
    }
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 px-2 py-2 md:mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">G</span>
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold">The Design Hive</h1>
            <p className="truncate text-xs text-muted-foreground">Admin Panel</p>
          </div>
          <button
            type="button"
            onClick={() => setOpenMobile(false)}
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-label="Close admin navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-4 py-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'h-11 gap-3 rounded-lg px-3 py-2.5 text-base transition-colors md:h-10',
                        isActive
                          ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Link to={item.path} onClick={closeMobileMenu}>
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-11 gap-3 px-3 text-base text-muted-foreground hover:bg-muted hover:text-foreground md:h-10">
              <Link to="/" onClick={closeMobileMenu}>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back to Store</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-11 gap-3 px-3 text-base text-muted-foreground hover:text-destructive md:h-10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
