import { notFound } from "next/navigation";
import curriculum from "@/content/curriculum.json";
import LessonFlow from "@/components/LessonFlow";
import type { Unit, Question } from "@/types/curriculum";

type Props = { params: Promise<{ unitId: string; lessonId: string }> };

export function generateStaticParams() {
  const params: { unitId: string; lessonId: string }[] = [];
  for (const unit of curriculum as Unit[]) {
    for (const lesson of unit.lessons) {
      params.push({ unitId: unit.id, lessonId: lesson.id });
    }
  }
  return params;
}

export default async function LessonPage({ params }: Props) {
  const { unitId, lessonId } = await params;
  const unit = (curriculum as Unit[]).find((u) => u.id === unitId);
  const lesson = unit?.lessons.find((l) => l.id === lessonId);
  if (!unit || !lesson) notFound();

  return (
    <LessonFlow
      unitId={unitId}
      lessonId={lessonId}
      questions={lesson.questions as Question[]}
    />
  );
}
