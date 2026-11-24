import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Plus, Pencil, Trash2, Megaphone,
  Eye, MousePointerClick, Copy as CopyIcon, X,
} from 'lucide-react';
import { apiFetch, endpoints } from '@/lib/api';

interface BannerStats {
  views: number;
  clicks: number;
  copies: number;
  dismisses: number;
}

interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  coupon_code: string | null;
  cta_text: string | null;
  cta_link: string | null;
  bg_color: string;
  text_color: string;
  accent_color: string;
  priority: number;
  is_active: boolean | number;
  starts_at: string | null;
  ends_at: string | null;
  stats: BannerStats;
}

interface BannerSettings {
  isEnabled: boolean;
  permanentCloseOnLast: boolean;
}

const emptyForm = {
  title: '',
  description: '',
  image_url: '',
  coupon_code: '',
  cta_text: '',
  cta_link: '',
  bg_color: '#1a1a2e',
  text_color: '#ffffff',
  accent_color: '#e94560',
  priority: 0,
  is_active: true,
  starts_at: '',
  ends_at: '',
};

type FormState = typeof emptyForm;

const AdminBanners = () => {
  const { toast } = useToast();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<BannerSettings>({
    isEnabled: true,
    permanentCloseOnLast: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);

  /* ================= FETCH ================= */

  const fetchBanners = async () => {
    try {
      const data = await apiFetch<Banner[]>(endpoints.admin.banners);
      setBanners(data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await apiFetch<BannerSettings>(endpoints.admin.bannerSettings);
      setSettings(data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchSettings();
  }, []);

  /* ================= SETTINGS ================= */

  const updateSettings = async (next: BannerSettings) => {
    setSettings(next);
    try {
      await apiFetch(endpoints.admin.bannerSettings, {
        method: 'PUT',
        body: JSON.stringify(next),
      });
      toast({ title: 'Settings saved' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      fetchSettings();
    }
  };

  /* ================= FORM ================= */

  const resetForm = () => setFormData(emptyForm);

  const toFormState = (b: Banner): FormState => ({
    title: b.title,
    description: b.description || '',
    image_url: b.image_url || '',
    coupon_code: b.coupon_code || '',
    cta_text: b.cta_text || '',
    cta_link: b.cta_link || '',
    bg_color: b.bg_color || '#1a1a2e',
    text_color: b.text_color || '#ffffff',
    accent_color: b.accent_color || '#e94560',
    priority: Number(b.priority) || 0,
    is_active: !!b.is_active,
    starts_at: b.starts_at ? b.starts_at.slice(0, 16) : '',
    ends_at: b.ends_at ? b.ends_at.slice(0, 16) : '',
  });

  const handleEdit = (banner: Banner) => {
    setEditing(banner);
    setFormData(toFormState(banner));
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        starts_at: formData.starts_at || null,
        ends_at: formData.ends_at || null,
      };

      if (editing) {
        await apiFetch(endpoints.admin.banner, {
          args: [editing.id],
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Banner updated' });
      } else {
        await apiFetch(endpoints.admin.banners, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Banner created' });
      }

      setDialogOpen(false);
      setEditing(null);
      resetForm();
      fetchBanners();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  /* ================= ACTIONS ================= */

  const toggleActive = async (banner: Banner) => {
    try {
      await apiFetch(endpoints.admin.bannerToggle, {
        args: [banner.id],
        method: 'PATCH',
      });
      fetchBanners();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner and its metrics?')) return;
    try {
      await apiFetch(endpoints.admin.banner, { args: [id], method: 'DELETE' });
      fetchBanners();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  /* ================= UI ================= */

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Banners</h1>
            <p className="text-muted-foreground">
              Manage pop-up advertisement banners
            </p>
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditing(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 w-4 h-4" />
                Add Banner
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>
                  {editing ? 'Edit Banner' : 'Create Banner'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="banner-title">Title</Label>
                  <Input
                    id="banner-title"
                    placeholder="e.g. Monsoon Sale"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner-description">Description</Label>
                  <Textarea
                    id="banner-description"
                    placeholder="Banner content shown to users"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner-image">Image URL</Label>
                  <Input
                    id="banner-image"
                    placeholder="https://..."
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="banner-coupon">Coupon code</Label>
                    <Input
                      id="banner-coupon"
                      placeholder="e.g. SAVE20"
                      value={formData.coupon_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coupon_code: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="banner-priority">
                      Priority (higher shows first)
                    </Label>
                    <Input
                      id="banner-priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="banner-cta-text">CTA text</Label>
                    <Input
                      id="banner-cta-text"
                      placeholder="e.g. Shop now"
                      value={formData.cta_text}
                      onChange={(e) =>
                        setFormData({ ...formData, cta_text: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="banner-cta-link">CTA link</Label>
                    <Input
                      id="banner-cta-link"
                      placeholder="e.g. /shop"
                      value={formData.cta_link}
                      onChange={(e) =>
                        setFormData({ ...formData, cta_link: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(
                    [
                      ['bg_color', 'Background'],
                      ['text_color', 'Text'],
                      ['accent_color', 'Accent'],
                    ] as const
                  ).map(([key, label]) => (
                    <div className="space-y-2" key={key}>
                      <Label htmlFor={`banner-${key}`}>{label} color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          id={`banner-${key}`}
                          type="color"
                          value={formData[key]}
                          onChange={(e) =>
                            setFormData({ ...formData, [key]: e.target.value })
                          }
                          className="h-10 w-12 rounded border border-border bg-transparent cursor-pointer"
                        />
                        <Input
                          value={formData[key]}
                          onChange={(e) =>
                            setFormData({ ...formData, [key]: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="banner-starts">Starts at</Label>
                    <Input
                      id="banner-starts"
                      type="datetime-local"
                      value={formData.starts_at}
                      onChange={(e) =>
                        setFormData({ ...formData, starts_at: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="banner-ends">Ends at</Label>
                    <Input
                      id="banner-ends"
                      type="datetime-local"
                      value={formData.ends_at}
                      onChange={(e) =>
                        setFormData({ ...formData, ends_at: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Label htmlFor="banner-active">Active (published)</Label>
                    <p className="text-xs text-muted-foreground">
                      Visible to users while active and within schedule
                    </p>
                  </div>
                  <Switch
                    id="banner-active"
                    checked={formData.is_active}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_active: v })
                    }
                  />
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                  {editing ? 'Update Banner' : 'Create Banner'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* System settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Banner System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Label htmlFor="setting-enabled">Enable banner system</Label>
                <p className="text-xs text-muted-foreground">
                  Master switch for showing banners to users
                </p>
              </div>
              <Switch
                id="setting-enabled"
                checked={settings.isEnabled}
                onCheckedChange={(v) =>
                  updateSettings({ ...settings, isEnabled: v })
                }
              />
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Label htmlFor="setting-permanent">
                  Permanently close after last banner
                </Label>
                <p className="text-xs text-muted-foreground">
                  When a user views the final banner, hide banners for good
                </p>
              </div>
              <Switch
                id="setting-permanent"
                checked={settings.permanentCloseOnLast}
                onCheckedChange={(v) =>
                  updateSettings({ ...settings, permanentCloseOnLast: v })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Banners</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : banners.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No banners yet. Create your first banner above.
              </p>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>Coupon</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Metrics</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {banners.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div
                            className="rounded-lg p-3 min-w-[180px] max-w-[260px]"
                            style={{
                              backgroundColor: b.bg_color,
                              color: b.text_color,
                              border: `1px solid ${b.accent_color}`,
                            }}
                          >
                            <p className="font-semibold text-sm">{b.title}</p>
                            {b.description && (
                              <p className="text-xs opacity-80 line-clamp-2">
                                {b.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {b.coupon_code ? (
                            <Badge variant="secondary" className="font-mono">
                              {b.coupon_code}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{b.priority}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {b.stats.views}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MousePointerClick className="w-3 h-3" /> {b.stats.clicks}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <CopyIcon className="w-3 h-3" /> {b.stats.copies}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <X className="w-3 h-3" /> {b.stats.dismisses}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={!!b.is_active}
                            onCheckedChange={() => toggleActive(b)}
                          />
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" onClick={() => handleEdit(b)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(b.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                <div className="space-y-3 md:hidden">
                  {banners.map((b) => (
                    <article key={b.id} className="rounded-xl border bg-card p-4 shadow-sm">
                      <div
                        className="rounded-lg p-4"
                        style={{
                          backgroundColor: b.bg_color,
                          color: b.text_color,
                          border: `1px solid ${b.accent_color}`,
                        }}
                      >
                        <h3 className="break-words font-semibold">{b.title}</h3>
                        {b.description && (
                          <p className="mt-1 break-words text-sm opacity-80">{b.description}</p>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {b.coupon_code ? (
                          <Badge variant="secondary" className="max-w-full break-all font-mono">
                            {b.coupon_code}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">No coupon</span>
                        )}
                        <Badge variant="outline">Priority {b.priority}</Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {b.stats.views} views</span>
                        <span className="inline-flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> {b.stats.clicks} clicks</span>
                        <span className="inline-flex items-center gap-1"><CopyIcon className="h-3 w-3" /> {b.stats.copies} copies</span>
                        <span className="inline-flex items-center gap-1"><X className="h-3 w-3" /> {b.stats.dismisses} dismisses</span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border p-3">
                        <span className="text-sm font-medium">Active</span>
                        <Switch checked={!!b.is_active} onCheckedChange={() => toggleActive(b)} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4">
                        <Button variant="outline" className="min-h-11" onClick={() => handleEdit(b)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="min-h-11 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(b.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
