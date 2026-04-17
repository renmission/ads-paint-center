import Link from "next/link";
import { Ruler } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";

const SETTINGS_AREAS = [
  {
    title: "Units",
    description: "Manage units of measure used in inventory products.",
    href: "/settings/units",
    icon: Ruler,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage system configuration and reference data.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_AREAS.map((area) => (
          <Link key={area.href} href={area.href}>
            <Card className="h-full transition-colors hover:bg-accent">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <area.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{area.title}</CardTitle>
                <CardDescription>{area.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
