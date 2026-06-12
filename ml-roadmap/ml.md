# Prompt for Claude: Machine Learning Interactive Course Platform

**Role:** Expert Frontend Architect, Technical Writer, and UI/UX Designer.
**Goal:** Build a complete, functional, and visually clean "Machine Learning Course" website. This site should serve as a comprehensive "one-stop-shop" learning resource. It must NOT just be a list of links. Instead, you must act as an educator: synthesize the provided curriculum into actual readable lessons, explanatory content, math intuitions, and code snippets directly on the page, with the original links provided alongside as "Further Reading".

## 1. Tone and Writing Style
- **Simple & Accessible:** The language must be extremely simple to grasp. Avoid overly dense academic jargon unless you are immediately defining it. Use analogies where helpful.
- **Beginner-Friendly yet Deep:** Start with the "why" and build up to the "how" and the math. The goal is to build deep intuition without overwhelming the reader.

## 2. Design & UI/UX Guidelines
The site must feel like a modern, premium documentation site or interactive textbook (similar to Nextra, Stripe docs, or Vercel's design).
- **Theme:** Clean, minimal dark mode. A simple deep gray/black background (e.g., `#111111` or `#000000`) with high-contrast, readable text (soft whites and light grays). No purple "AI" themes, no neon, no cyberpunk aesthetics.
- **Layout:** 	
  - A persistent sidebar navigation on the left containing the course modules (Nodes/Tasks).
  - A main content area on the right where the actual learning material is rendered.
- **Progress Tracking:** Implement a state persistence system (using React state + `localStorage`). Include "Mark as Complete" buttons at the end of each module, checkmarks in the sidebar, and a global progress bar so users can track their journey across multiple sessions.
- **Interactive Quizzes & Checkpoints:** Include small, interactive "Knowledge Check" components at the end of every module (e.g., multiple choice questions that give immediate feedback).
- **Interactive Playgrounds:** Go beyond static images. Where applicable (especially for Activation Functions, Gradient Descent, or SVM boundaries), build interactive React components that act as mini "Playgrounds" where users can tweak a slider or input value and see the visual output change in real-time.
- **Typography:** Use highly legible, modern fonts. A clean sans-serif (e.g., Inter, Roboto, or system-ui) for body text and headers. A strict monospace font (e.g., JetBrains Mono, Fira Code) for code.
- **Content Formatting:** 
  - Well-spaced paragraphs, bullet points, and blockquotes for important notes.
  - Syntax-highlighted code blocks for implementation examples.
  - Clean "Further Reading" or "Reference" sections at the bottom of each module for the external links.

## 3. Technical Stack & Deployment
- **Framework:** React (Next.js App Router). Next.js is strictly required.
- **Styling:** Tailwind CSS (preferred for clean, utility-first design). Keep it minimal and elegant.
- **Math Rendering:** Use `react-katex` (or a similar LaTeX rendering library) to perfectly format all ML formulas (e.g., Hinge Loss, Backprop derivations) so they look like a real textbook. Do NOT use plain text for math.
- **Icons & Visuals:** `lucide-react` for simple iconography. Include `recharts` (or similar) for rendering interactive educational graphs.
- **Deployment:** The code provided must be perfectly structured for a zero-config push to GitHub and immediate deployment on **Vercel**. Use standard Next.js conventions.

## 4. Implementation Instructions for Claude
When generating the code, you must actually WRITE the educational content for each section based on the curriculum below. 
1. **Explain the Concepts:** For example, when creating the SVM section, write paragraphs explaining what an SVM is, what the kernel trick does, and the intuition behind hinge loss in simple terms.
2. **Provide Visuals & Graphs:** Incorporate visual aids wherever possible to reinforce understanding. Render charts (using Recharts or native SVG/CSS) for concepts like SVM decision boundaries, activation function curves, loss over epochs, or attention mechanisms.
3. **Provide Code Examples:** Include basic code snippets (e.g., a simple PyTorch tensor creation snippet in the PyTorch section, or a skeleton MLP class).
4. **Structure the Curriculum:** Embed the provided data as a rich state or JSON object containing `title`, `content` (the educational text/markdown you write), `codeSnippets`, `tasks`, and `furtherReading`.

---

## 5. The Curriculum Data (To be expanded into simple, clear content by you)

### Module 0: The Bedrock (Linear & Logistic Regression)
- **Topic:** Foundational Machine Learning & Gradient Descent
- **What you must write about:** Explain the absolute basics of learning from data. Define Linear Regression (predicting continuous values) and Logistic Regression (predicting probabilities). Introduce the concept of a Loss Function (MSE vs. Cross-Entropy) and provide a highly intuitive, visual explanation of standard Gradient Descent (taking steps down a hill). This is crucial context before jumping into margin-based classifiers or PyTorch.
- **Implementation Tasks:** Implement a basic Linear Regression model from scratch using only raw Python/NumPy.
- **Further Reading:** StatQuest: Linear Regression, StatQuest: Logistic Regression.

### Module 1: Kernels but not from popcorns
- **Topic:** Support Vector Machines (SVMs)
- **What you must write about:** Explain why we need margin-based classifiers. Explain SVM math at a high level (kernels, hinge loss, dual formulation). Explain how SVMs relate to Neural Networks.
- **Implementation Tasks:** Implement SVM classification on Pulsar Star and Genomic Data for cancer.
- **Further Reading:** StatQuest: Linear vs Non-Linear Boundaries, MachineLearningMastery blog on SVMs, MIT OCW SVM Notes, Greitemann Visual Demo.

### Module 2: Getting Started with PyTorch
- **Topic:** PyTorch Fundamentals
- **What you must write about:** Explain PyTorch tensors, operations, and autograd. Discuss why we use Torch over NumPy (GPUs, dynamic graphs). Explain DataLoaders and the training loop pattern.
- **Implementation Tasks:** Convert NumPy regressions to use Torch tensors.
- **Further Reading:** PyTorch 101 Crash Course (YouTube), PyTorch Official Tutorials.

### Module 3: Put your brains into your PC - Multi Layer Perceptrons
- **Topic:** MLPs and Backpropagation
- **What you must write about:** Transition from kernels to non-linearities. Explain MLP math simply. Provide a highly intuitive explanation of Backpropagation and the chain rule.
- **Implementation Tasks:** Build an MLP to learn XOR, and build an MNIST digit classifier.
- **Further Reading:** 3Blue1Brown Neural Networks, Andrej Karpathy's Neural Networks from Scratch, Michael Nielsen's Deep Learning book (Ch 1&2), CS231n Part 1.

### Module 4: Rolling in the Deep - but with MLPs
- **Topic:** Optimization, Training Dynamics, and Regularization
- **What you must write about:** Why vanilla SGD isn't enough. Explain Adaptive Optimizers (Momentum, RMSProp, Adam) simply. Explain the Bias-Variance Tradeoff, Dropout, Batch Normalization (and covariate shift), Weight Initialization, and Learning Rate Scheduling.
- **Implementation Tasks:** Implement SGD, Momentum, and Adam from scratch. Add L2, Dropout, and BatchNorm to an MLP. Train on CIFAR-10.
- **Further Reading:** Sebastian Ruder's Gradient Descent Overview, Adam Paper (Kingma & Ba), Dropout Paper, BatchNorm Paper.

### Module 5: Convolutional Neural Networks & Learning Representations
- **Topic:** CNNs
- **What you must write about:** Convolution as a mathematical operation. Weight sharing, translation equivariance, receptive fields (crucial), and pooling. How backprop works through conv layers.
- **Implementation Tasks:** Implement a CNN from scratch and visualize filters.
- **Further Reading:** CS231n CNNs, Goodfellow Deep Learning Book Ch 9, 3Blue1Brown Convolution video.

### Module 6: Transformers (Attention is All You Need)
- **Topic:** Transformers and Self-Attention
- **What you must write about:** A fairly in-depth but easy-to-grasp explanation of the Transformer architecture. Explain the bottleneck of RNNs/LSTMs. Explain the concept of Attention and specifically **Self-Attention** (Query, Key, Value vectors). Break down **Multi-Head Attention**, **Positional Encoding** (why we need it and how sine/cosine waves give sequence context), and the overarching **Encoder-Decoder** architecture.
- **Implementation Tasks:** Build a basic Self-Attention block in PyTorch.
- **Further Reading:** 
  - "Attention Is All You Need" (Vaswani et al., 2017): https://arxiv.org/abs/1706.03762
  - The Illustrated Transformer (Jay Alammar): https://jalammar.github.io/illustrated-transformer/
  - Andrej Karpathy: Let's build GPT (YouTube).se

### Section: Advanced Challenges & Debugging
- **Topic:** Side Quests and Neural Network Debugging
- **What you must write about:** Common pitfalls (Vanishing/exploding gradients, overfitting). Brief summaries of Catastrophic Forgetting, Double Descent, and the Lottery Ticket Hypothesis.
- **Further Reading:** Karpathy's Recipe for Training NNs, CS231n Common Pitfalls, Stanford Debugging Checklist.

---
**Final Request to Claude:** Generate the full Next.js application codebase. The output must be ready to copy-paste, push to GitHub, and immediately deploy to Vercel with zero additional configuration. Prioritize writing the in-depth, beginner-friendly educational content for the course modules (especially the new Transformers module) directly into the React components or a localized markdown/JSON data structure.
