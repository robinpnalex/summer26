"use client";

import { H2, H3, P, B, UL, Code, Note, Tasks } from "@/components/Lesson";
import { M, MathBlock } from "@/components/Math";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import OptimizerPlayground from "@/components/playgrounds/OptimizerPlayground";

export const furtherReading = [
  {
    label: "Sebastian Ruder: An Overview of Gradient Descent Optimization Algorithms",
    href: "https://www.ruder.io/optimizing-gradient-descent/",
    note: "the canonical survey of SGD variants",
  },
  {
    label: "Adam: A Method for Stochastic Optimization (Kingma & Ba, 2014)",
    href: "https://arxiv.org/abs/1412.6980",
    note: "the original Adam paper",
  },
  {
    label: "Dropout: A Simple Way to Prevent Neural Networks from Overfitting (Srivastava et al., 2014)",
    href: "https://jmlr.org/papers/v15/srivastava14a.html",
  },
  {
    label: "Batch Normalization (Ioffe & Szegedy, 2015)",
    href: "https://arxiv.org/abs/1502.03167",
  },
];

export default function Content() {
  return (
    <>
      <H2>Why vanilla SGD isn&apos;t enough</H2>
      <P>
        Module 0&apos;s gradient descent worked beautifully on a smooth bowl.
        Real loss landscapes are nothing like a bowl. They are
        million-dimensional terrains full of <B>ravines</B> (steep in one
        direction, nearly flat in another), plateaus, and saddle points. Two
        problems bite immediately:
      </P>
      <UL>
        <li>
          <B>One learning rate can&apos;t fit all directions.</B> In a ravine,
          a rate small enough not to bounce off the steep walls is far too
          small to make progress along the flat valley floor. SGD ends up
          zig-zagging across the ravine while inching forward.
        </li>
        <li>
          <B>Mini-batch gradients are noisy.</B> Each batch sees only a sliver
          of the data, so its gradient is a noisy estimate of the true
          one — the path jitters even on smooth terrain.
        </li>
      </UL>

      <H3>Momentum: a heavy ball rolling downhill</H3>
      <P>
        Instead of stepping exactly where the current gradient points, keep a
        running <B>velocity</B> — an exponentially decaying average of recent
        gradients — and step along that:
      </P>
      <MathBlock tex="v_t = \beta v_{t-1} - \eta \nabla L(\theta_t) \qquad \theta_{t+1} = \theta_t + v_t" />
      <P>
        Picture a heavy ball rolling down the ravine: the zig-zag components
        of the gradient point in alternating directions, so they{" "}
        <B>cancel out</B> in the average, while the consistent
        down-the-valley component <B>accumulates</B> and the ball picks up
        speed. Typical <M tex="\beta = 0.9" /> means roughly “average over the
        last ~10 steps.”
      </P>

      <H3>RMSProp: a personal learning rate for every parameter</H3>
      <P>
        Different parameters live on different scales — some see huge
        gradients, some tiny ones. RMSProp tracks a running average of each
        parameter&apos;s <em>squared</em> gradient and divides the step by its
        square root:
      </P>
      <MathBlock tex="s_t = \beta s_{t-1} + (1-\beta)\big(\nabla L\big)^2 \qquad \theta_{t+1} = \theta_t - \frac{\eta}{\sqrt{s_t} + \epsilon} \nabla L" />
      <P>
        Parameters with consistently large gradients get their steps shrunk;
        parameters with tiny gradients get boosted. Every parameter
        effectively gets its own auto-tuned learning rate.
      </P>

      <H3>Adam: momentum + RMSProp together</H3>
      <P>
        Adam (<B>Ada</B>ptive <B>m</B>oment estimation) simply keeps both
        running averages — the mean of gradients (momentum,{" "}
        <M tex="m_t" />) and the mean of squared gradients (RMSProp,{" "}
        <M tex="v_t" />) — plus a bias correction for the early steps when the
        averages are still warming up:
      </P>
      <MathBlock tex="\hat{m}_t = \frac{m_t}{1-\beta_1^t}, \quad \hat{v}_t = \frac{v_t}{1-\beta_2^t}, \qquad \theta_{t+1} = \theta_t - \frac{\eta \, \hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}" />
      <P>
        With its default settings (<M tex="\beta_1{=}0.9, \beta_2{=}0.999, \eta{=}10^{-3}" />
        ), Adam works well on almost everything with almost no tuning — which
        is why it (and its weight-decay-corrected variant <B>AdamW</B>) is the
        default optimizer for most of modern deep learning.
      </P>

      <OptimizerPlayground />

      <CodeBlock
        title="optimizers_from_scratch.py"
        code={`
import numpy as np

class SGD:
    def __init__(self, lr=0.01): self.lr = lr
    def update(self, w, grad):
        return w - self.lr * grad

class Momentum:
    def __init__(self, lr=0.01, beta=0.9):
        self.lr, self.beta, self.v = lr, beta, 0
    def update(self, w, grad):
        self.v = self.beta * self.v - self.lr * grad
        return w + self.v

class Adam:
    def __init__(self, lr=0.001, b1=0.9, b2=0.999, eps=1e-8):
        self.lr, self.b1, self.b2, self.eps = lr, b1, b2, eps
        self.m, self.v, self.t = 0, 0, 0
    def update(self, w, grad):
        self.t += 1
        self.m = self.b1 * self.m + (1 - self.b1) * grad
        self.v = self.b2 * self.v + (1 - self.b2) * grad**2
        m_hat = self.m / (1 - self.b1**self.t)   # bias correction
        v_hat = self.v / (1 - self.b2**self.t)
        return w - self.lr * m_hat / (np.sqrt(v_hat) + self.eps)
`}
      />

      <H2>The Bias–Variance Tradeoff</H2>
      <P>
        Optimization gets the training loss down. But the goal was never
        training loss — it&apos;s performance on <B>new</B> data. The classic
        lens for this gap is bias vs. variance:
      </P>
      <UL>
        <li>
          <B>High bias (underfitting):</B> the model is too simple to capture
          the pattern — a straight line through curved data. Symptom: training
          error is high, and test error is about the same.
        </li>
        <li>
          <B>High variance (overfitting):</B> the model is flexible enough to
          memorize noise and quirks of the particular training set. Symptom:
          training error near zero, test error much worse — and you&apos;d get
          a very different model from a different sample of training data.
        </li>
      </UL>
      <P>
        Deep networks have millions of parameters, so their natural failure
        mode is variance. Everything in the rest of this module —{" "}
        <B>regularization</B> — is a technique for taming variance without
        giving up capacity.
      </P>

      <H3>L2 regularization (weight decay)</H3>
      <P>
        Add the size of the weights to the loss:{" "}
        <M tex="L' = L + \lambda \lVert \mathbf{w} \rVert^2" />. The optimizer
        now trades off fitting the data against keeping weights small. Small
        weights mean the output changes gently as inputs change — smooth,
        boring functions that generalize better than wild ones. (Sound
        familiar? Minimizing <M tex="\lVert \mathbf{w} \rVert^2" /> was exactly
        the SVM&apos;s margin-maximization term.)
      </P>

      <H3>Dropout: training an ensemble by sabotage</H3>
      <P>
        During training, randomly zero out each hidden neuron with probability{" "}
        <M tex="p" /> (often 0.5) — a different random subset every batch. A
        neuron can no longer rely on any specific teammate existing, so
        fragile co-dependencies can&apos;t form, and each neuron must learn
        features that are useful on their own. Equivalently: you&apos;re
        cheaply training an enormous ensemble of subnetworks that share
        weights. At test time dropout is turned off and activations are scaled
        to compensate (frameworks handle this — but it&apos;s why{" "}
        <Code>model.train()</Code> vs <Code>model.eval()</Code> matters!).
      </P>

      <H3>Batch Normalization</H3>
      <P>
        As lower layers learn, the distribution of inputs arriving at upper
        layers keeps shifting under their feet (the original paper called this{" "}
        <B>internal covariate shift</B>). BatchNorm re-standardizes each
        layer&apos;s pre-activations using the current batch&apos;s mean and
        variance, then lets the network re-scale and re-shift with two learned
        parameters:
      </P>
      <MathBlock tex="\hat{x} = \frac{x - \mu_{\text{batch}}}{\sqrt{\sigma^2_{\text{batch}} + \epsilon}} \qquad y = \gamma \hat{x} + \beta" />
      <P>
        In practice BatchNorm makes training dramatically more forgiving: you
        can use larger learning rates, initialization matters less, and
        convergence is faster. (Researchers now debate whether “covariate
        shift” is the true mechanism — smoothing the loss landscape is a
        leading alternative explanation — but the empirical benefits are not
        in dispute.) At test time it uses running averages of mean/variance
        collected during training — the second reason{" "}
        <Code>model.eval()</Code> matters.
      </P>

      <H3>Weight initialization</H3>
      <P>
        Initialize all weights to zero and every neuron in a layer computes
        the same thing, receives the same gradient, and stays identical
        forever — the network never gets off the ground. Initialize too large
        and activations/gradients explode as they multiply through layers; too
        small and they shrink to nothing. The fix is to scale random initial
        weights by layer width so the signal variance stays constant from
        layer to layer: <B>Xavier/Glorot</B> initialization{" "}
        (<M tex="\text{Var}(w) = 1/n_{\text{in}}" />, for tanh/sigmoid) and{" "}
        <B>He/Kaiming</B> initialization (<M tex="2/n_{\text{in}}" />, for
        ReLU, which kills half the signal). PyTorch&apos;s defaults are
        sensible, but know what they&apos;re doing.
      </P>

      <H3>Learning rate schedules</H3>
      <P>
        The best learning rate early in training (big, bold steps) is not the
        best one late (fine adjustments near a minimum). So we decay it over
        time: step decay (drop 10× every N epochs), <B>cosine annealing</B>{" "}
        (smooth decay to ~0, very popular), and <B>warmup</B> (start tiny for
        a few hundred steps while Adam&apos;s statistics stabilize — standard
        for Transformers, as you&apos;ll see in Module 6).
      </P>

      <CodeBlock
        title="regularized_mlp.py — everything in one model"
        code={`
import torch.nn as nn
import torch

model = nn.Sequential(
    nn.Flatten(),
    nn.Linear(784, 256),
    nn.BatchNorm1d(256),     # normalize pre-activations
    nn.ReLU(),
    nn.Dropout(0.5),         # random sabotage, train-time only
    nn.Linear(256, 128),
    nn.BatchNorm1d(128),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(128, 10),
)

opt = torch.optim.AdamW(model.parameters(), lr=1e-3,
                        weight_decay=1e-2)          # L2-style regularization
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=50)

# In the loop:  model.train() before training, model.eval() before testing,
# and sched.step() once per epoch.
`}
      />
      <Note title="model.train() vs model.eval()">
        Dropout and BatchNorm behave differently at training vs. test time.
        Forgetting <Code>model.eval()</Code> before evaluation — leaving
        dropout on and batch statistics live — is among the most common bugs
        in all of deep learning. Make it a reflex.
      </Note>

      <Tasks
        items={[
          "Implement SGD, Momentum, and Adam from scratch (skeleton above) and race them on the same MLP — reproduce the playground's ranking on real data.",
          "Add L2 (weight_decay), Dropout, and BatchNorm to your Module 3 MNIST MLP. Ablate: train with each one removed and tabulate test accuracy.",
          "Train an MLP on CIFAR-10. It will plateau around 50-55% accuracy — feel that ceiling. Module 5 explains exactly why MLPs hit it and CNNs don't.",
        ]}
      />

      <Quiz
        questions={[
          {
            question:
              "Why does momentum help in ravine-shaped loss landscapes?",
            options: [
              "It increases the learning rate over time",
              "Oscillating gradient components cancel in the running average while the consistent direction accumulates, damping zig-zag and speeding progress",
              "It skips small gradients entirely",
              "It computes exact second derivatives",
            ],
            answer: 1,
            explanation:
              "The velocity is an average of recent gradients: alternating cross-ravine components sum to ~zero, while the steady along-valley component compounds — like a heavy ball gathering speed.",
          },
          {
            question:
              "Your model reaches 99.8% training accuracy but only 71% test accuracy. What's the diagnosis, and which is NOT a sensible fix?",
            options: [
              "Overfitting (high variance); sensible fixes include dropout and weight decay",
              "Overfitting; a sensible fix is getting more training data",
              "Overfitting; a sensible fix is making the network much larger",
              "Overfitting; a sensible fix is early stopping",
            ],
            answer: 2,
            explanation:
              "A large train-test gap is the signature of high variance. More capacity typically makes memorization easier, not harder — every other listed option attacks variance directly.",
          },
          {
            question:
              "Why must you call model.eval() before computing test accuracy?",
            options
            : [
              "It enables gradient computation for evaluation",
              "It moves the model to the CPU",
              "It switches Dropout off and makes BatchNorm use its running statistics instead of batch statistics",
              "It resets the model's weights to their best checkpoint",
            ],
            answer: 2,
            explanation:
              "Dropout and BatchNorm are train/test asymmetric. In eval mode, dropout becomes a no-op and BatchNorm normalizes with the running averages collected during training — otherwise your test numbers are noisy and wrong.",
          },
          {
            question:
              "What goes wrong if you initialize every weight in a network to zero?",
            options: [
              "Gradients explode immediately",
              "Every neuron in a layer computes identical outputs and receives identical gradients, so they remain forever identical — the network can't learn distinct features",
              "The loss becomes undefined",
              "Nothing — zero is the recommended initialization",
            ],
            answer: 1,
            explanation:
              "Symmetry is the killer: identical neurons get identical updates and never differentiate. Random initialization (scaled à la Xavier/He) breaks the symmetry while keeping signal variance stable across layers.",
          },
        ]}
      />
    </>
  );
}
