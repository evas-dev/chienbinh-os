"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  phone: z.string().trim().min(1, "Phải nhập số điện thoại"),
  password: z.string().min(1, "Phải nhập mật khẩu"),
});

export type LoginState = { error?: string } | null;

// Giữ nguyên trick phone-as-email: email = <sđt>@chienbinh.local
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: `${parsed.data.phone}@chienbinh.local`,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Sai số điện thoại hoặc mật khẩu, chiến binh!" };
  }

  redirect("/");
}
