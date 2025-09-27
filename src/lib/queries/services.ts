import { createClient } from "@/lib/supabase/server";

export interface ServiceListItem {
  id: string;
  slug: string;
  icon: string | null;
  sort_order: number | null;
  title: string;
  summary: string | null;
}

export async function getServicesByLocale(locale: string): Promise<ServiceListItem[]> {
  const supabase = await createClient();

  // services + services_i18n join by locale
  const { data, error } = await supabase
    .from("services")
    .select(`
      id, 
      slug, 
      icon, 
      active,
      sort_order,
      services_i18n!inner(
        title, 
        summary, 
        locale
      )
    `)
    .eq("active", true)
    .eq("services_i18n.locale", locale)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getServicesByLocale error", error);
    return [];
  }

  // Map joined rows
  return (data || []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    icon: row.icon ?? null,
    sort_order: row.sort_order ?? null,
    title: row.services_i18n?.[0]?.title ?? row.slug,
    summary: row.services_i18n?.[0]?.summary ?? null,
  }));
}
