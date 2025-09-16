import { redirect } from "next/navigation";

export default function StudentIndexRedirect() {
  redirect("/student/dashboard");
}