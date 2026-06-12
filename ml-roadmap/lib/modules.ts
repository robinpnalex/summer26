export interface ModuleMeta {
  slug: string;
  label: string; // short sidebar label
  title: string; // full page title
  description: string;
  est: string; // estimated effort
}

export const MODULES: ModuleMeta[] = [
  {
    slug: "linear-logistic-regression",
    label: "0 · The Bedrock",
    title: "Module 0: The Bedrock — Linear & Logistic Regression",
    description:
      "Learning from data, loss functions, and the single most important idea in ML: gradient descent.",
    est: "~1 week",
  },
  {
    slug: "support-vector-machines",
    label: "1 · Kernels",
    title: "Module 1: Kernels, but not from Popcorn — SVMs",
    description:
      "Margin-based classifiers, the kernel trick, hinge loss, and how SVMs relate to neural networks.",
    est: "~1 week",
  },
  {
    slug: "pytorch-fundamentals",
    label: "2 · PyTorch",
    title: "Module 2: Getting Started with PyTorch",
    description:
      "Tensors, autograd, DataLoaders, and the training loop pattern you will use forever.",
    est: "~1 week",
  },
  {
    slug: "multi-layer-perceptrons",
    label: "3 · MLPs",
    title: "Module 3: Put Your Brains into Your PC — Multi-Layer Perceptrons",
    description:
      "Non-linearities, the math of MLPs, and a truly intuitive walkthrough of backpropagation.",
    est: "~2 weeks",
  },
  {
    slug: "optimization-and-regularization",
    label: "4 · Training Deep",
    title: "Module 4: Rolling in the Deep — Optimization & Regularization",
    description:
      "Momentum, RMSProp, Adam, bias-variance, dropout, batch norm, initialization, and LR schedules.",
    est: "~2 weeks",
  },
  {
    slug: "convolutional-neural-networks",
    label: "5 · CNNs",
    title: "Module 5: Convolutional Neural Networks & Learning Representations",
    description:
      "Convolution as an operation, weight sharing, receptive fields, pooling, and backprop through convs.",
    est: "~2 weeks",
  },
  {
    slug: "transformers",
    label: "6 · Transformers",
    title: "Module 6: Transformers — Attention Is All You Need",
    description:
      "Self-attention from first principles: queries, keys, values, multi-head attention, and positional encoding.",
    est: "~2-3 weeks",
  },
  {
    slug: "advanced-challenges",
    label: "★ Side Quests",
    title: "Advanced Challenges & Neural Network Debugging",
    description:
      "Vanishing gradients, overfitting, catastrophic forgetting, double descent, and the lottery ticket hypothesis.",
    est: "ongoing",
  },
];

export function getModule(slug: string): ModuleMeta | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getAdjacent(slug: string): {
  prev: ModuleMeta | null;
  next: ModuleMeta | null;
} {
  const i = MODULES.findIndex((m) => m.slug === slug);
  return {
    prev: i > 0 ? MODULES[i - 1] : null,
    next: i >= 0 && i < MODULES.length - 1 ? MODULES[i + 1] : null,
  };
}
