"use client";

import { H2, H3, P, B, OL, Code, Note, Tasks } from "@/components/Lesson";
import { M, MathBlock } from "@/components/Math";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import ActivationPlayground from "@/components/playgrounds/ActivationPlayground";

export const furtherReading = [
  {
    label: "3Blue1Brown: Neural Networks (series)",
    href: "https://www.3blue1brown.com/topics/neural-networks",
    note: "the best visual intuition ever made for backprop",
  },
  {
    label: "Andrej Karpathy: Neural Networks: Zero to Hero",
    href: "https://karpathy.ai/zero-to-hero.html",
    note: "build micrograd — backprop from absolute scratch",
  },
  {
    label: "Michael Nielsen: Neural Networks and Deep Learning, Ch. 1–2",
    href: "http://neuralnetworksanddeeplearning.com/",
    note: "free book; chapter 2 derives backprop carefully",
  },
  {
    label: "CS231n: Neural Networks Part 1",
    href: "https://cs231n.github.io/neural-networks-1/",
    note: "Stanford's course notes",
  },
];

export default function Content() {
  return (
    <>
      <H2>The problem with lines (and the XOR story)</H2>
      <P>
        Every model so far — linear regression, logistic regression, the
        linear SVM — draws a <B>straight</B> boundary. Kernels worked around
        this by hand-picking a transformation into a space where a straight
        boundary suffices. The neural network&apos;s proposal is bolder:{" "}
        <B>learn the transformation itself.</B>
      </P>
      <P>
        The classic demonstration of why we need this is <B>XOR</B>: four
        points where (0,0) and (1,1) are class 0, while (0,1) and (1,0) are
        class 1. Try to draw one straight line separating them — you can&apos;t
        (this observation famously chilled neural network research for years).
        Yet a network with a single hidden layer of two neurons solves it
        easily, by first <em>bending</em> the space so the classes become
        separable, then drawing a line. That two-step move — transform, then
        separate — is the whole game.
      </P>

      <H2>The architecture of an MLP</H2>
      <P>
        A <B>Multi-Layer Perceptron</B> is a stack of layers, where each layer
        does two things: a linear transformation (a matrix multiply plus bias
        — exactly Module 0&apos;s machinery, many copies in parallel), followed
        by a simple <B>non-linear function</B> applied elementwise:
      </P>
      <MathBlock tex="\mathbf{h}_1 = \sigma(W_1 \mathbf{x} + \mathbf{b}_1) \qquad \mathbf{h}_2 = \sigma(W_2 \mathbf{h}_1 + \mathbf{b}_2) \qquad \hat{y} = W_3 \mathbf{h}_2 + \mathbf{b}_3" />
      <P>
        Each row of a weight matrix is one <B>neuron</B>: it computes a
        weighted sum of everything in the previous layer (a tiny logistic
        regression!) and fires through the non-linearity. A “hidden layer of
        128 neurons” just means <M tex="W" /> has 128 rows.
      </P>

      <H3>Why the non-linearity is non-negotiable</H3>
      <P>
        Stack linear layers without activations and something deflating
        happens: <M tex="W_2(W_1\mathbf{x}) = (W_2 W_1)\mathbf{x}" /> — two
        matrices collapse into one. A 100-layer purely-linear network has
        exactly the power of a single linear layer. The activation function is
        the ingredient that prevents the collapse, and it&apos;s what lets
        depth buy you anything at all. With non-linearities, an MLP with
        enough hidden units can approximate <em>any</em> continuous function
        (the universal approximation theorem).
      </P>

      <ActivationPlayground />

      <P>
        In practice: use <B>ReLU</B> as your default hidden activation
        (cheap, doesn&apos;t saturate for positive inputs), and reserve
        sigmoid/softmax for the <em>output</em> layer when you need
        probabilities.
      </P>

      <H2>Backpropagation: blame, distributed fairly</H2>
      <P>
        Training an MLP is the same recipe as always — predict, measure loss,
        step downhill. The only new question is:{" "}
        <B>how do we get the gradient of the loss with respect to a weight
        buried five layers deep?</B> The answer is backpropagation, and it is
        nothing more than the chain rule applied systematically.
      </P>
      <H3>The intuition: a chain of responsibility</H3>
      <P>
        Think of the network as an assembly line, and the final loss as a
        defect in the product. To fix the line you need to know how much each
        station contributed to the defect. Backprop answers this by walking{" "}
        <em>backwards</em> from the defect: the loss tells the output layer
        how it should have been different; the output layer, knowing how it
        depends on the layer before it, translates that message for the
        previous layer; and so on, station by station, all the way back to the
        first layer. Each weight ends up with a personal answer to the
        question <B>“if I changed by a tiny bit, how much would the loss
        change?”</B> — which is precisely its gradient.
      </P>
      <H3>The chain rule, concretely</H3>
      <P>
        For one neuron computing <M tex="z = wx + b" />, then{" "}
        <M tex="a = \sigma(z)" />, feeding a loss <M tex="L" />, the chain
        rule strings together the local sensitivities:
      </P>
      <MathBlock tex="\frac{\partial L}{\partial w} = \underbrace{\frac{\partial L}{\partial a}}_{\text{from above}} \cdot \underbrace{\frac{\partial a}{\partial z}}_{\sigma'(z)} \cdot \underbrace{\frac{\partial z}{\partial w}}_{x}" />
      <P>Three observations turn this formula into the full algorithm:</P>
      <OL>
        <li>
          Every factor is <B>local</B>: each operation only needs to know its
          own derivative. A multiply node, an add node, a ReLU — each knows
          how to pass a gradient through itself.
        </li>
        <li>
          The “from above” factor is <B>shared</B>: every weight in a layer
          reuses the same upstream gradient, so we compute it once per layer,
          not once per weight. This reuse is why backprop is fast — one
          backward pass costs about as much as one forward pass.
        </li>
        <li>
          Gradients at a fork <B>add up</B>: if a value feeds two paths to the
          loss, its gradient is the sum of both paths&apos; contributions.
        </li>
      </OL>
      <P>
        Notice <M tex="\partial z / \partial w = x" /> — the gradient of a
        weight is (upstream signal) × (its input). The “error × input”
        pattern from Module 0, alive and well in deep networks.
      </P>
      <Note title="This is exactly what autograd does">
        PyTorch&apos;s <Code>loss.backward()</Code> from Module 2 is this
        algorithm, mechanized: record each local operation during the forward
        pass, then sweep backwards multiplying local derivatives. No magic —
        just the chain rule with good bookkeeping. To prove it to yourself,
        build Karpathy&apos;s micrograd (linked below): ~100 lines of Python.
      </Note>

      <H2>Implementation: an MLP that learns XOR</H2>
      <CodeBlock
        title="xor_mlp.py"
        code={`
import torch
import torch.nn as nn

X = torch.tensor([[0.,0.], [0.,1.], [1.,0.], [1.,1.]])
y = torch.tensor([[0.], [1.], [1.], [0.]])   # XOR truth table

model = nn.Sequential(
    nn.Linear(2, 8),    # 2 inputs -> 8 hidden neurons
    nn.ReLU(),          # the crucial non-linearity
    nn.Linear(8, 1),    # 8 hidden -> 1 output (a logit)
)
loss_fn = nn.BCEWithLogitsLoss()
opt = torch.optim.Adam(model.parameters(), lr=0.01)

for epoch in range(2000):
    loss = loss_fn(model(X), y)
    opt.zero_grad()
    loss.backward()
    opt.step()

print(torch.sigmoid(model(X)).round().squeeze())  # tensor([0., 1., 1., 0.])
`}
      />
      <P>
        Delete the <Code>nn.ReLU()</Code> line and rerun it — the model{" "}
        <em>cannot</em> learn XOR no matter how long you train, because
        without the non-linearity it collapses to a single line. Best possible
        empirical proof of the collapse argument above.
      </P>

      <H3>Scaling up: MNIST</H3>
      <P>
        The same shape of code classifies handwritten digits. The image
        (28×28 pixels) is flattened to a 784-vector, and the output is 10
        logits — one per digit — trained with cross-entropy (the multi-class
        sibling of Module 0&apos;s BCE, paired with softmax internally):
      </P>
      <CodeBlock
        title="mnist_mlp.py"
        code={`
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

train_ds = datasets.MNIST("data", train=True, download=True,
                          transform=transforms.ToTensor())
train_loader = DataLoader(train_ds, batch_size=64, shuffle=True)

model = nn.Sequential(
    nn.Flatten(),          # (B, 1, 28, 28) -> (B, 784)
    nn.Linear(784, 256), nn.ReLU(),
    nn.Linear(256, 128), nn.ReLU(),
    nn.Linear(128, 10),    # 10 logits, one per digit
)
loss_fn = nn.CrossEntropyLoss()
opt = torch.optim.Adam(model.parameters(), lr=1e-3)

for epoch in range(5):
    for images, labels in train_loader:
        loss = loss_fn(model(images), labels)
        opt.zero_grad()
        loss.backward()
        opt.step()
    print(f"epoch {epoch}: loss {loss.item():.4f}")
# ~97-98% test accuracy from this tiny script
`}
      />

      <Tasks
        items={[
          "Build the XOR MLP, then remove the ReLU and confirm it fails — write one sentence explaining why.",
          "Build the MNIST classifier and reach ≥97% test accuracy. Plot a few misclassified digits and look at them: are they genuinely ambiguous?",
          "Stretch goal: follow Karpathy's micrograd video and implement backprop yourself in ~100 lines — after this, autograd will never feel like magic again.",
        ]}
      />

      <Quiz
        questions={[
          {
            question:
              "Why can't a network made only of linear layers (no activations) learn XOR?",
            options: [
              "It doesn't have enough parameters",
              "Stacked linear layers collapse into a single linear layer, which can only draw a straight boundary — and no straight line separates XOR",
              "XOR requires at least 10 layers",
              "Linear layers can't process binary inputs",
            ],
            answer: 1,
            explanation:
              "W₂(W₁x) = (W₂W₁)x: composition of linear maps is linear. Without a non-linearity in between, depth adds nothing, and XOR is the smallest dataset that defeats a linear boundary.",
          },
          {
            question:
              "In backpropagation, the gradient of the loss with respect to a weight w (where z = wx + b) is the upstream gradient multiplied by…",
            options: [
              "the learning rate",
              "the weight w itself",
              "the input x that the weight was multiplied with",
              "the number of layers above it",
            ],
            answer: 2,
            explanation:
              "∂z/∂w = x, so the local contribution is the input. 'Error from above × input from below' — the same pattern as linear regression's gradient in Module 0.",
          },
          {
            question:
              "Why is one backward pass roughly as cheap as one forward pass?",
            options: [
              "Because GPUs run backward operations in half precision",
              "Because each layer's upstream gradient is computed once and reused by all its weights, instead of recomputing per weight",
              "Because gradients are sparse",
              "It isn't — backprop is N times slower for N weights",
            ],
            answer: 1,
            explanation:
              "Naively differentiating per-weight would re-walk the network millions of times. Backprop sweeps once, layer by layer, sharing the upstream gradient — that reuse is the algorithmic insight that makes deep learning trainable.",
          },
        ]}
      />
    </>
  );
}
