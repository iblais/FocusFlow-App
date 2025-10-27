import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to the app dashboard immediately
  redirect("/home");
}
