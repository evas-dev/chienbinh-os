"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CreateMissionDialog, type MissionTarget } from "./create-mission-dialog";

export function CreateMissionButton({
  label,
  dialogTitle,
  isCampaign,
  targets,
  campaigns,
}: {
  label: ReactNode;
  dialogTitle: string;
  isCampaign: boolean;
  targets: MissionTarget[];
  campaigns: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {label}
      </Button>
      <CreateMissionDialog
        open={open}
        onOpenChange={setOpen}
        title={dialogTitle}
        isCampaign={isCampaign}
        targets={targets}
        campaigns={campaigns}
      />
    </>
  );
}
