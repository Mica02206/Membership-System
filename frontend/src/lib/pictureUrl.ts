const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export function getPictureUrl(pictureUrl?: string) {
  if (!pictureUrl) return "";
  if (pictureUrl.startsWith("http") || pictureUrl.startsWith("data:")) return pictureUrl;
  const fileName = pictureUrl.split("/").pop() ?? pictureUrl;
  return `${SUPABASE_URL}/storage/v1/object/public/member-photos/members/${encodeURIComponent(fileName)}`;
}
