export type MultipleChoiceQuestion = {
  type: "translate" | "meaning" | "context";
  prompt: string;
  options: { text: string; correct: boolean }[];
  explanation: string;
};

export type FillBlankQuestion = {
  type: "fill-blank";
  prompt: string;
  answer: string;
  hint: string;
};

export type Question = MultipleChoiceQuestion | FillBlankQuestion;

export type Lesson = {
  id: string;
  title: string;
  questions: Question[];
};

export type Unit = {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
};
