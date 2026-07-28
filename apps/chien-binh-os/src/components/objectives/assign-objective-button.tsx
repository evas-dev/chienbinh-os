"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AssignObjectiveDialog } from "./assign-objective-dialog";
import { EmojiIcon } from "@/components/chung/emoji-icon";

export function AssignObjectiveButton({ ownerId, ownerName }: { ownerId: string; ownerName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-cb-gold text-cb-bg hover:bg-cb-gold-soft"
      >
        <EmojiIcon glyph="➕" /> Giao thêm KPI
      </Button>
      <AssignObjectiveDialog open={open} onOpenChange={setOpen} ownerId={ownerId} ownerName={ownerName} />
    </>
  );
}
