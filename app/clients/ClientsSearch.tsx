"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/ui/input";

export function ClientsSearch({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set("q", value);
      } else {
        next.delete("q");
      }
      router.replace(next.size ? `/clients?${next.toString()}` : "/clients");
    }, 300);

    return () => clearTimeout(handle);
  }, [value, router, params]);

  return (
    <Input
      className="w-64"
      placeholder="Search clients"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}
