import LessonComplete from "@/components/LessonComplete";

type Props = { searchParams: Promise<{ xp?: string }> };

export default async function CompletePage({ searchParams }: Props) {
  const { xp } = await searchParams;
  return <LessonComplete xp={Number(xp ?? 0)} />;
}
