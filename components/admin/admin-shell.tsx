import { AdminNav } from "@/components/admin/admin-nav";

type AdminShellProps = {
  children: React.ReactNode;
  username: string;
  roleName: string;
  roleLevel: number;
  teamName: string | null;
  csrfToken: string;
};

export function AdminShell({
  children,
  username,
  roleName,
  roleLevel,
  teamName,
  csrfToken,
}: AdminShellProps) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminNav
        username={username}
        roleName={roleName}
        roleLevel={roleLevel}
        teamName={teamName}
        csrfToken={csrfToken}
      />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}
