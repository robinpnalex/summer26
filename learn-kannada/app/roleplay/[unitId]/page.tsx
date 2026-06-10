import { notFound } from "next/navigation";
import { roleplayPrompts } from "@/content/roleplayPrompts";
import RoleplayChat from "@/components/RoleplayChat";

type Props = { params: Promise<{ unitId: string }> };

export function generateStaticParams() {
  return Object.keys(roleplayPrompts).map((unitId) => ({ unitId }));
}

export default async function RoleplayPage({ params }: Props) {
  const { unitId } = await params;
  const character = roleplayPrompts[unitId];
  if (!character) notFound();

  return <RoleplayChat unitId={unitId} character={character} />;
}
