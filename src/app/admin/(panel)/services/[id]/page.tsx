import { notFound } from "next/navigation";
import { currentAdmin } from "@/lib/supabase";
import type { Service } from "@/lib/services";
import ServiceForm from "../ServiceForm";
import s from "../../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function EditService({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db } = (await currentAdmin())!;
  const { data } = await db.from("services").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const service = data as Service;
  return (
    <>
      <div className={s.head}><div><h1>{service.name}</h1><p>Changes appear on the website as soon as you save.</p></div></div>
      <ServiceForm service={service} />
    </>
  );
}
