import { MODULES } from "./modules";
import { slugify } from "./slugify";

/** Headings as they appear in each module's content (anchors are derived
 *  with the same slugify the heading components use), plus extra keywords
 *  so searches like "adam" or "kernel trick" land in the right section. */
const MODULE_SECTIONS: Record<string, { h: string; k?: string }[]> = {
  "linear-logistic-regression": [
    { h: "What does it mean for a machine to “learn”?", k: "model loss optimizer parameters weights" },
    { h: "Linear Regression: predicting numbers with a line", k: "slope intercept continuous" },
    { h: "Measuring wrongness: Mean Squared Error", k: "mse loss function" },
    { h: "Gradient Descent: walking downhill blindfolded", k: "learning rate eta step diverge" },
    { h: "Implementation: Linear Regression from scratch", k: "numpy code" },
    { h: "Logistic Regression: predicting probabilities", k: "sigmoid classification spam" },
    { h: "Why not MSE? Enter Cross-Entropy", k: "bce binary cross entropy log loss" },
    { h: "MSE vs. Cross-Entropy: which loss when?", k: "loss choice" },
  ],
  "support-vector-machines": [
    { h: "Why “any line that separates” isn't good enough", k: "margin decision boundary" },
    { h: "The math, at a comfortable altitude", k: "hyperplane support vectors optimization" },
    { h: "Hinge loss: the soft margin", k: "slack C violations" },
    { h: "The kernel trick: separating the inseparable", k: "rbf gaussian polynomial dual formulation dot product feature space" },
    { h: "How SVMs relate to neural networks", k: "learned features fixed transform" },
    { h: "Implementation: a linear SVM via SGD on hinge loss", k: "pulsar cancer genomic sklearn code" },
  ],
  "pytorch-fundamentals": [
    { h: "Why bother with PyTorch when NumPy worked fine?", k: "gpu cuda dynamic graph" },
    { h: "Tensors: NumPy arrays with superpowers", k: "tensor shape broadcasting" },
    { h: "Autograd: the chain rule as a service", k: "backward grad requires_grad zero_grad" },
    { h: "The training loop pattern", k: "optimizer step nn.Linear MSELoss" },
    { h: "Datasets and DataLoaders", k: "batch epoch shuffle mini-batch" },
  ],
  "multi-layer-perceptrons": [
    { h: "The problem with lines (and the XOR story)", k: "linearly separable" },
    { h: "The architecture of an MLP", k: "hidden layer neuron weight matrix" },
    { h: "Why the non-linearity is non-negotiable", k: "relu sigmoid tanh activation function universal approximation" },
    { h: "Backpropagation: blame, distributed fairly", k: "backprop chain rule gradient" },
    { h: "The intuition: a chain of responsibility", k: "assembly line" },
    { h: "The chain rule, concretely", k: "local derivative upstream" },
    { h: "Implementation: an MLP that learns XOR", k: "code nn.Sequential" },
    { h: "Scaling up: MNIST", k: "digits classifier cross entropy softmax" },
  ],
  "optimization-and-regularization": [
    { h: "Why vanilla SGD isn't enough", k: "ravine zig-zag noisy mini-batch" },
    { h: "Momentum: a heavy ball rolling downhill", k: "velocity beta" },
    { h: "RMSProp: a personal learning rate for every parameter", k: "adaptive squared gradient" },
    { h: "Adam: momentum + RMSProp together", k: "adamw bias correction default optimizer" },
    { h: "The Bias–Variance Tradeoff", k: "overfitting underfitting generalization" },
    { h: "L2 regularization (weight decay)", k: "penalty shrink weights" },
    { h: "Dropout: training an ensemble by sabotage", k: "p=0.5 co-adaptation model.eval" },
    { h: "Batch Normalization", k: "batchnorm covariate shift normalize gamma beta" },
    { h: "Weight initialization", k: "xavier glorot he kaiming symmetry" },
    { h: "Learning rate schedules", k: "cosine annealing warmup step decay" },
  ],
  "convolutional-neural-networks": [
    { h: "Why MLPs fail at images", k: "spatial structure flatten cifar" },
    { h: "Convolution as an operation", k: "filter kernel feature map slide" },
    { h: "Weight sharing & translation equivariance", k: "parameter efficiency" },
    { h: "Receptive fields: how a 3×3 filter ends up seeing the whole image", k: "hierarchy edges textures objects representations" },
    { h: "Pooling and stride: throwing away the right information", k: "max pooling downsample padding output size" },
    { h: "Backprop through a conv layer", k: "flipped filter gradient sum" },
    { h: "Implementation: convolution from scratch + a real CNN", k: "sobel cifar-10 code visualize filters" },
  ],
  transformers: [
    { h: "The bottleneck that attention destroyed", k: "rnn lstm recurrent sequential vanishing gradient parallel" },
    { h: "Self-attention: queries, keys, and values", k: "qkv query key value softmax scaled dot product sqrt dk" },
    { h: "Multi-head attention: several conversations at once", k: "heads concatenate" },
    { h: "Positional encoding: telling a parallel model about order", k: "sine cosine position rope word order" },
    { h: "Assembling the full Transformer", k: "encoder decoder bert gpt residual layernorm masked cross-attention" },
    { h: "Implementation: self-attention in PyTorch", k: "causal mask code karpathy" },
  ],
  "advanced-challenges": [
    { h: "Debugging neural networks: a field guide", k: "silent failure" },
    { h: "The pitfalls you will actually hit", k: "vanishing exploding gradients clipping nan overfitting data bugs" },
    { h: "The sanity-check ritual", k: "overfit one batch init loss baseline karpathy recipe" },
    { h: "Side quests: three strange phenomena", k: "research" },
    { h: "Catastrophic forgetting", k: "continual learning task" },
    { h: "Double descent", k: "interpolation threshold overparameterization scaling" },
    { h: "The Lottery Ticket Hypothesis", k: "pruning sparse subnetwork winning ticket" },
  ],
};

export interface SearchItem {
  title: string; // what's shown big
  context: string; // module label shown small
  href: string;
  haystack: string; // lowercase text to match against
}

export const SEARCH_INDEX: SearchItem[] = MODULES.flatMap((m) => {
  const moduleItem: SearchItem = {
    title: m.title,
    context: "Module",
    href: `/modules/${m.slug}`,
    haystack: `${m.title} ${m.description} ${m.label}`.toLowerCase(),
  };
  const sectionItems = (MODULE_SECTIONS[m.slug] ?? []).map((s) => ({
    title: s.h,
    context: m.label,
    href: `/modules/${m.slug}#${slugify(s.h)}`,
    haystack: `${s.h} ${s.k ?? ""} ${m.label}`.toLowerCase(),
  }));
  return [moduleItem, ...sectionItems];
});

export function search(query: string, limit = 10): SearchItem[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return SEARCH_INDEX.filter((item) =>
    terms.every((t) => item.haystack.includes(t))
  ).slice(0, limit);
}
