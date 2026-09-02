"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CookingMemoryForm } from "@/components/memories/CookingMemoryForm";
import type { Recipe } from "@/lib/types";

export function LogMemoryButton({ recipes, members }: { recipes: Recipe[]; members: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Log a memory</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Log a cooking memory" wide>
        <CookingMemoryForm
          recipes={recipes}
          members={members}
          onDone={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
}
