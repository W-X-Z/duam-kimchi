import { requireAdmin } from "@/lib/auth";
import { adminGetSettings } from "@/lib/data";
import AdminShell from "@/components/admin/AdminShell";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await adminGetSettings();
  return (
    <AdminShell active="settings">
      <h1 className="mb-5 text-xl font-bold">가게 정보</h1>
      <SettingsForm settings={settings} />
    </AdminShell>
  );
}
