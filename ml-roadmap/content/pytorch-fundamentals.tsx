"use client";

import { H2, P, B, UL, OL, Code, Note, Tasks } from "@/components/Lesson";
import { M } from "@/components/Math";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";

export const furtherReading = [
  {
    label: "PyTorch 101 Crash Course For Beginners (YouTube)",
    href: "https://www.youtube.com/watch?v=LyJtbe__2i0",
    note: "a full hands-on walkthrough",
  },
  {
    label: "PyTorch Official Tutorials: Learn the Basics",
    href: "https://pytorch.org/tutorials/beginner/basics/intro.html",
    note: "tensors → autograd → training, straight from the source",
  },
];

export default function Content() {
  return (
    <>
      <H2>Why bother with PyTorch when NumPy worked fine?</H2>
      <P>
        In Module 0 you computed gradients by hand. For a 2-parameter line
        that&apos;s a pleasant calculus exercise. For a 100-million-parameter
        network it is impossible — not “hard,” impossible. PyTorch exists to
        solve exactly two problems NumPy can&apos;t:
      </P>
      <UL>
        <li>
          <B>Autograd:</B> PyTorch watches every operation you perform and
          builds a computation graph behind the scenes. Call{" "}
          <Code>.backward()</Code> and it walks that graph in reverse, applying
          the chain rule automatically, and hands you the gradient of the loss
          with respect to <em>every</em> parameter. You never differentiate
          anything by hand again.
        </li>
        <li>
          <B>GPUs:</B> training is mostly giant matrix multiplications, which
          GPUs do hundreds of times faster than CPUs. In PyTorch, moving your
          whole computation to a GPU is one line: <Code>.to(&quot;cuda&quot;)</Code>.
        </li>
      </UL>
      <P>
        A bonus third reason: PyTorch builds its graph <B>dynamically</B>, as
        your Python code runs. Loops, if-statements, printing intermediate
        values, dropping into a debugger — everything just works, because the
        graph <em>is</em> your Python program. (Older frameworks made you
        declare a static graph up front, then feed data through it — miserable
        to debug.)
      </P>

      <H2>Tensors: NumPy arrays with superpowers</H2>
      <P>
        The tensor is PyTorch&apos;s core data structure — an n-dimensional
        array, deliberately designed to feel like NumPy. A 0-d tensor is a
        scalar, 1-d a vector, 2-d a matrix, and a batch of color images is a
        4-d tensor of shape <Code>(batch, channels, height, width)</Code>.
      </P>
      <CodeBlock
        title="tensors.py"
        code={`
import torch

a = torch.tensor([[1., 2.], [3., 4.]])   # from data
b = torch.zeros(2, 2)                     # like np.zeros
c = torch.randn(2, 2)                     # standard normal

# Arithmetic, broadcasting, slicing: all NumPy-flavored
d = a @ c            # matrix multiply
e = a * 2 + 1        # elementwise, broadcast
f = a[:, 0]          # first column

# The two superpowers:
g = a.to("cuda")               # 1) lives on the GPU now (if available)
h = torch.randn(2, 2, requires_grad=True)  # 2) tracked by autograd

# Friendly interop with NumPy
import numpy as np
n = a.numpy()                  # tensor -> ndarray (shares memory!)
t = torch.from_numpy(np.eye(2))  # ndarray -> tensor
`}
      />
      <Note title="Shapes are 90% of your bugs">
        Get in the habit of printing <Code>x.shape</Code> constantly.
        Most PyTorch errors are two tensors disagreeing about their
        dimensions, and most silent bugs are broadcasting doing something
        legal-but-unintended.
      </Note>

      <H2>Autograd: the chain rule as a service</H2>
      <P>
        Mark a tensor with <Code>requires_grad=True</Code> and every operation
        involving it gets recorded. The result is a directed graph from inputs
        to output. Calling <Code>.backward()</Code> on a scalar (your loss)
        traverses the graph backwards and deposits{" "}
        <M tex="\partial L / \partial \theta" /> into each parameter&apos;s{" "}
        <Code>.grad</Code> field.
      </P>
      <CodeBlock
        title="autograd_demo.py"
        code={`
import torch

x = torch.tensor(2.0, requires_grad=True)
y = x**2 + 3*x          # y = x² + 3x

y.backward()            # compute dy/dx
print(x.grad)           # 2x + 3 = 7.0  — no calculus done by you
`}
      />
      <P>
        That tiny example scales without modification to networks with
        billions of operations. The mathematical machinery is exactly the
        chain rule from Module 0 — we&apos;ll open the black box and derive it
        ourselves in Module 3 (backpropagation). For now, the key practical
        rule: <B>gradients accumulate</B>. PyTorch adds new gradients onto
        whatever is already in <Code>.grad</Code>, so you must call{" "}
        <Code>optimizer.zero_grad()</Code> every iteration or your gradients
        will be a running sum of all previous steps — a classic beginner bug.
      </P>

      <H2>The training loop pattern</H2>
      <P>
        Here is Module 0&apos;s linear regression, rewritten the PyTorch way.
        This structure — model, loss, optimizer, loop — is the pattern you
        will use in every project for the rest of this course (and career):
      </P>
      <CodeBlock
        title="linear_regression_torch.py"
        code={`
import torch
import torch.nn as nn

# Data (same synthetic line as Module 0)
X = torch.rand(100, 1) * 10
y = 3 * X + 2 + torch.randn(100, 1)

model = nn.Linear(1, 1)                 # w and b, created and tracked for us
loss_fn = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

for epoch in range(200):
    y_hat = model(X)                    # 1. forward pass
    loss = loss_fn(y_hat, y)            # 2. compute loss

    optimizer.zero_grad()               # 3. clear old gradients  (don't forget!)
    loss.backward()                     # 4. backprop: fill .grad everywhere
    optimizer.step()                    # 5. update parameters

[w], [b] = model.weight.item(), model.bias.item()
print(f"learned: y = {model.weight.item():.2f}x + {model.bias.item():.2f}")
`}
      />
      <P>
        Compare with the NumPy version: steps 1, 2, 5 are the same ideas, but
        the gradient formulas we derived by hand (<Code>dw</Code>,{" "}
        <Code>db</Code>) have been replaced by one call to{" "}
        <Code>loss.backward()</Code>. That is the entire value proposition —
        and it works identically when the model has a thousand layers.
      </P>

      <H2>Datasets and DataLoaders</H2>
      <P>
        Real datasets don&apos;t fit in one tensor on the GPU, and gradient
        descent works better on shuffled mini-batches anyway (more on why in
        Module 4). PyTorch splits the job in two:
      </P>
      <OL>
        <li>
          A <B>Dataset</B> answers two questions: “how many examples?”
          (<Code>__len__</Code>) and “give me example i” (
          <Code>__getitem__</Code>).
        </li>
        <li>
          A <B>DataLoader</B> wraps a Dataset and handles batching, shuffling
          each epoch, and loading in parallel worker processes.
        </li>
      </OL>
      <CodeBlock
        title="dataloader.py"
        code={`
from torch.utils.data import Dataset, DataLoader

class MyDataset(Dataset):
    def __init__(self, X, y):
        self.X, self.y = X, y
    def __len__(self):
        return len(self.X)
    def __getitem__(self, i):
        return self.X[i], self.y[i]

loader = DataLoader(MyDataset(X, y), batch_size=32, shuffle=True)

for epoch in range(10):
    for X_batch, y_batch in loader:        # 32 examples at a time, shuffled
        y_hat = model(X_batch)
        loss = loss_fn(y_hat, y_batch)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
`}
      />
      <Note title="Vocabulary check">
        One pass over a <B>batch</B> = one optimization <B>step</B>. One pass
        over the whole dataset = one <B>epoch</B>. With 1,000 examples and
        batch size 32, an epoch is 32 steps (the last batch is smaller).
      </Note>

      <Tasks
        items={[
          "Convert your Module 0 NumPy linear regression to PyTorch tensors with manual gradients first (use requires_grad + .backward(), update weights inside torch.no_grad()), then refactor to nn.Linear + optim.SGD.",
          "Do the same for logistic regression, using nn.BCEWithLogitsLoss.",
          "Wrap your data in a Dataset/DataLoader and train with mini-batches of 16; verify the loss curve still converges.",
        ]}
      />

      <Quiz
        questions={[
          {
            question:
              "What happens if you forget optimizer.zero_grad() in the training loop?",
            options: [
              "Nothing — PyTorch clears gradients automatically",
              "Training crashes with an error",
              "Gradients from every previous step accumulate, so each update uses a corrupted sum of old gradients",
              "The learning rate doubles every step",
            ],
            answer: 2,
            explanation:
              ".backward() *adds* to .grad rather than overwriting it. Without zeroing, your updates are based on a running total of all past gradients — training usually still runs, just badly. A classic silent bug.",
          },
          {
            question:
              "What are the two main reasons to use PyTorch over NumPy for deep learning?",
            options: [
              "Better plotting and faster CSV loading",
              "Automatic differentiation (autograd) and GPU acceleration",
              "Smaller memory usage and built-in datasets",
              "Stricter typing and immutability",
            ],
            answer: 1,
            explanation:
              "Autograd removes the need to hand-derive gradients, and GPU support makes the giant matrix multiplications of deep learning hundreds of times faster. Everything else is convenience.",
          },
          {
            question: "In PyTorch terminology, what is one 'epoch'?",
            options: [
              "One parameter update",
              "One complete pass through the entire training dataset",
              "One forward pass on one example",
              "One call to .backward()",
            ],
            answer: 1,
            explanation:
              "An epoch is a full pass over the dataset. Each mini-batch within it produces one optimization step (one forward, one backward, one update).",
          },
        ]}
      />
    </>
  );
}
