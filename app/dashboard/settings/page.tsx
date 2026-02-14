"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [name, setName] = useState("");
  const [reminderInterval, setReminderInterval] = useState(3);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [timezone, setTimezone] = useState("UTC");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      // Fetch full settings from a separate call since session may not have custom fields
      fetch("/api/settings/current")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            setReminderInterval(data.reminderIntervalDays ?? 3);
            setEmailNotifications(data.emailNotifications ?? true);
            setPushNotifications(data.pushNotifications ?? false);
            setTimezone(data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        reminderIntervalDays: reminderInterval,
        emailNotifications,
        pushNotifications,
        timezone,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    if (res.ok) {
      window.location.href = "/";
    }
    setDeleting(false);
  }

  if (isPending) return <div className="text-text-secondary">Loading...</div>;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Settings</h1>

      <Card>
        <h2 className="font-heading text-lg font-bold mb-4">Profile</h2>
        <div className="flex flex-col gap-4">
          <Input
            id="name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="timezone" className="text-sm text-text-secondary">
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="rounded-sm border border-border bg-bg-primary px-4 py-2.5 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
            >
              {Intl.supportedValuesOf("timeZone").map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-heading text-lg font-bold mb-4">Reminders</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reminder" className="text-sm text-text-secondary">
              Remind me if I haven&apos;t logged in
            </label>
            <div className="flex items-center gap-3">
              <input
                id="reminder"
                type="range"
                min={1}
                max={14}
                value={reminderInterval}
                onChange={(e) => setReminderInterval(parseInt(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="font-mono text-sm text-text-primary w-16 text-right">
                {reminderInterval} {reminderInterval === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-heading text-lg font-bold mb-4">Notifications</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between">
            <span className="text-sm">Email notifications</span>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="accent-accent h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm">Push notifications</span>
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="accent-accent h-4 w-4"
            />
          </label>
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
      </Button>

      <Card className="border-danger/30">
        <h2 className="font-heading text-lg font-bold text-danger mb-2">Danger zone</h2>
        <p className="text-sm text-text-secondary mb-4">
          This permanently deletes your account and all your data. There&apos;s no going back.
        </p>
        {!deleteConfirm ? (
          <Button variant="danger" onClick={() => setDeleteConfirm(true)}>
            Delete my account
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Yes, delete everything"}
            </Button>
            <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>
              Cancel
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
