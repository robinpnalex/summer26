"use client";

import { H2, H3, P, B, UL, OL, Code, Note, Tasks } from "@/components/Lesson";
import { M } from "@/components/Math";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";

export const furtherReading = [
  {
    label: "Andrej Karpathy: A Recipe for Training Neural Networks",
    href: "https://karpathy.github.io/2019/04/25/recipe/",
    note: "read this before every serious project — seriously",
  },
  {
    label: "CS231n: Neural Networks Part 3 — tips, tricks, and pitfalls",
    href: "https://cs231n.github.io/neural-networks-3/",
    note: "sanity checks, gradient checks, babysitting training",
  },
  {
    label: "Stanford CS230: Deep Learning Debugging Checklist",
    href: "https://cs230.stanford.edu/files/Checklist.pdf",
    note: "a printable pre-flight checklist",
  },
];

export default function Content() {
  return (
    <>
      <H2>Debugging neural networks: a field guide</H2>
      <P>
        Neural networks fail <B>silently</B>. A web app with a bug throws an
        exception; a neural net with a bug trains happily and produces
        mediocre numbers, and nothing tells you whether the ceiling is your
        data, your architecture, or a transposed tensor. Debugging them is a
        skill of its own, and it is mostly discipline, not genius.
      </P>
      <H3>The pitfalls you will actually hit</H3>
      <UL>
        <li>
          <B>Vanishing gradients:</B> in deep stacks, gradients are products
          of many layer-derivatives; if those are typically &lt; 1 (hello,
          saturated sigmoids), the product shrinks exponentially and early
          layers stop learning. Fixes you already own: ReLU-family
          activations, He/Xavier init, BatchNorm/LayerNorm, and residual
          connections (the Transformer carries all four).
        </li>
        <li>
          <B>Exploding gradients:</B> same product, factors &gt; 1 — the loss
          suddenly spikes to NaN. Standard fix: <B>gradient clipping</B>{" "}
          (<Code>torch.nn.utils.clip_grad_norm_</Code>), plus a saner learning
          rate.
        </li>
        <li>
          <B>Overfitting:</B> Module 4&apos;s nemesis. Train/validation curves
          diverging is the signature; regularization, augmentation, early
          stopping, and more data are the medicine.
        </li>
        <li>
          <B>Silent data bugs:</B> the most common real-world cause of “model
          isn&apos;t learning”: mismatched labels, leaked test data,
          unnormalized inputs, wrong channel order. Always look at a batch of
          data <em>with your eyes</em> right before it enters the model.
        </li>
      </UL>
      <H3>The sanity-check ritual</H3>
      <P>
        Distilled from Karpathy&apos;s recipe — run these before believing any
        experiment:
      </P>
      <OL>
        <li>
          <B>Check the loss at initialization.</B> A 10-class classifier
          should start at about <M tex="-\ln(1/10) \approx 2.303" />. If not,
          something is wrong before step one.
        </li>
        <li>
          <B>Overfit a tiny subset.</B> Your network must reach ~zero loss on
          ~20 examples. If it can&apos;t memorize 20 points, there is a bug —
          full stop. (This single test catches a huge fraction of all bugs.)
        </li>
        <li>
          <B>Beat a dumb baseline.</B> Predict-the-most-common-class,
          logistic regression on raw features. If your deep model doesn&apos;t
          beat these, the architecture isn&apos;t the problem.
        </li>
        <li>
          <B>Change one thing at a time</B>, keep a log, and fix your random
          seeds while debugging.
        </li>
      </OL>
      <CodeBlock
        title="overfit_one_batch.py — the most valuable test in deep learning"
        code={`
X_small, y_small = next(iter(train_loader))
X_small, y_small = X_small[:20], y_small[:20]

for step in range(500):
    loss = loss_fn(model(X_small), y_small)
    opt.zero_grad(); loss.backward(); opt.step()
    if step % 100 == 0:
        print(f"step {step}: {loss.item():.4f}")

# Loss should approach ~0. If it plateaus, you have a bug:
# wrong loss/labels pairing, missing zero_grad, broken shapes, lr too low...
`}
      />

      <H2>Side quests: three strange phenomena</H2>
      <P>
        Three glimpses of how weird deep learning actually is — each is a
        doorway into current research.
      </P>

      <H3>Catastrophic forgetting</H3>
      <P>
        Train a network on task A, then train the <em>same</em> network on
        task B: performance on A collapses, often to near-random. Gradient
        descent has no loyalty — the weights that encoded task A were simply
        the most convenient clay for sculpting task B. Humans don&apos;t
        forget arithmetic when they learn to drive; networks do. This is the
        central obstacle to <B>continual learning</B>, and mitigation
        strategies (replaying old data, elastic weight consolidation that
        protects weights important to old tasks, freezing layers) are an
        active research area — and a key reason large models are trained once
        on everything rather than incrementally.
      </P>

      <H3>Double descent</H3>
      <P>
        Classical statistics promises a U-shaped test error curve: as models
        grow, error falls (less bias), then rises (more variance —
        overfitting). Deep learning broke the promise. Keep growing the model
        past the point where it exactly fits the training data (the
        “interpolation threshold” — where the U peaks) and test error{" "}
        <B>comes back down</B>, often below the classical sweet spot. A
        leading intuition: among the many huge models that all fit the data
        perfectly, gradient descent is biased toward the <em>smoothest</em>{" "}
        ones, and smoothness generalizes. The practical upshot of the modern
        regime: <B>bigger models, properly regularized, usually win</B> — the
        empirical engine behind scaling laws and ever-larger Transformers.
      </P>

      <H3>The Lottery Ticket Hypothesis</H3>
      <P>
        Take a trained network, prune 90%+ of its weights — accuracy barely
        moves. But here&apos;s the strange part (Frankle &amp; Carbin, 2019):
        inside the original <em>random initialization</em>, there already
        existed a sparse subnetwork — a “winning ticket” — that, trained{" "}
        <B>in isolation from its original initial values</B>, matches the
        full network&apos;s accuracy. Re-randomize that subnetwork&apos;s
        weights and it fails. The suggestion: giant networks succeed partly
        because they are lotteries — millions of candidate subnetworks, and
        SGD finds and amplifies the lucky ones. Why overparameterization
        helps, in one metaphor.
      </P>

      <Note title="You made it">
        From drawing a line through points to building the attention mechanism
        behind GPT — the entire path used one recipe: model, loss, gradient,
        step. When you read research papers now (and you should — start with
        the three linked below), you&apos;ll find they&apos;re all still
        playing the same game.
      </Note>

      <Tasks
        items={[
          "Adopt the ritual: on your next training run, check the init loss, overfit 20 examples, and beat a baseline — before any real experiment.",
          "Demonstrate catastrophic forgetting yourself: train an MLP on MNIST digits 0-4, then on 5-9, and plot accuracy on 0-4 collapsing during phase two.",
          "Reproduce a mini double descent: sweep hidden width on a small noisy dataset and plot test error vs. width past the interpolation threshold.",
          "Prune your MNIST MLP: zero the 90% smallest-magnitude weights and measure how little accuracy drops.",
        ]}
      />

      <Quiz
        questions={[
          {
            question:
              "Your 10-class classifier's loss at initialization is 8.7 instead of ~2.3. What does this tell you?",
            options: [
              "Nothing — initial loss is random",
              "The model is underfitting",
              "Something is broken before training even starts (e.g., wrong output scale, bad init, mismatched loss) — a random model should give ~uniform probabilities, hence loss ≈ ln(10) ≈ 2.3",
              "The learning rate is too high",
            ],
            answer: 2,
            explanation:
              "A randomly initialized classifier should assign ≈1/10 probability per class, giving cross-entropy −ln(0.1) ≈ 2.303. A wildly different value means a bug upstream of optimization — the cheapest bug-catch in deep learning.",
          },
          {
            question:
              "Why is 'overfit 20 examples' such a powerful debugging test?",
            options: [
              "Because 20 examples are enough to train a production model",
              "A correct model/loss/optimizer pipeline can always memorize a tiny dataset, so failure to reach ~zero loss proves a bug exists — independent of data quality or model size questions",
              "Because it tests generalization",
              "Because it is required before using a GPU",
            ],
            answer: 1,
            explanation:
              "It isolates 'is the pipeline mechanically correct?' from every other question. Memorizing 20 points requires no generalization — if that fails, no hyperparameter tuning will save you.",
          },
          {
            question: "What is 'catastrophic forgetting'?",
            options: [
              "When a model's weights are deleted from disk",
              "When training on a new task overwrites the weights encoding a previous task, destroying old-task performance",
              "When gradients vanish in deep networks",
              "When a model memorizes the training set",
            ],
            answer: 1,
            explanation:
              "Gradient descent optimizes only the current objective — weights crucial to task A are freely repurposed for task B. It's the core obstacle to training models incrementally.",
          },
          {
            question:
              "According to the double descent phenomenon, what can happen as you grow a model PAST the point of exactly fitting the training data?",
            options: [
              "Test error always increases — classical overfitting",
              "Training becomes impossible",
              "Test error can decrease again, sometimes below the classical optimum",
              "The model's bias increases",
            ],
            answer: 2,
            explanation:
              "Beyond the interpolation threshold, among all perfect-fit solutions SGD tends to find smooth ones that generalize — overturning the classical U-curve and motivating the 'bigger is better' era.",
          },
        ]}
      />
    </>
  );
}
