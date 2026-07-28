"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { CreateStaffDialog } from "./create-staff-dialog";

export function CreateStaffButton({ squads }: { squads: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-cb-gold text-cb-bg hover:bg-cb-gold-soft">
        <EmojiIcon glyph="➕" /> Tạo tài khoản
      </Button>
      <CreateStaffDialog open={open} onOpenChange={setOpen} squads={squads} />
    </>
  );
}
