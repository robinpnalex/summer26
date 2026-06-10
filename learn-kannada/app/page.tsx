import curriculum from "@/content/curriculum.json";
import SkillTree from "@/components/SkillTree";
import type { Unit } from "@/types/curriculum";

export default function Home() {
  return <SkillTree curriculum={curriculum as Unit[]} />;
}
