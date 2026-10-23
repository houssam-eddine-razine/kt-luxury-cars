"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdministratorEmail } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export type LoginActionState = {
  message?: string;
};

export async function login(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  void _previousState;

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") ?? "",
  );

  if (!email || !password) {
    return {
      message: "Enter your email address and password.",
    };
  }

  /*
   * Use a generic error so the page does not reveal
   * which email addresses have administrator access.
   */
  if (!isAdministratorEmail(email)) {
    return {
      message:
        "The email address or password is incorrect.",
    };
  }

  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error || !data.user) {
    console.error(
      "Administrator login failed:",
      error?.code,
    );

    return {
      message:
        "The email address or password is incorrect.",
    };
  }

  if (!isAdministratorEmail(data.user.email)) {
    await supabase.auth.signOut();

    return {
      message:
        "The email address or password is incorrect.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}