"use client";

import { H2, H3, P, B, UL, Code, Note, Tasks } from "@/components/Lesson";
import { M, MathBlock } from "@/components/Math";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import SVMMarginPlayground from "@/components/playgrounds/SVMMarginPlayground";

export const furtherReading = [
  {
    label: "StatQuest: Support Vector Machines",
    href: "https://www.youtube.com/watch?v=efR1C6CvhmE",
    note: "linear vs non-linear boundaries, clearly explained",
  },
  {
    label: "MachineLearningMastery: Support Vector Machines for ML",
    href: "https://machinelearningmastery.com/support-vector-machines-for-machine-learning/",
    note: "practical overview",
  },
  {
    label: "MIT OCW 6.034: SVM Lecture Notes",
    href: "https://ocw.mit.edu/courses/6-034-artificial-intelligence-fall-2010/resources/lecture-16-learning-support-vector-machines/",
    note: "the full derivation, including the dual",
  },
  {
    label: "Greitemann: Interactive SVM Demo",
    href: "https://greitemann.dev/svm-demo",
    note: "draw your own points and watch kernels work",
  },
];

export default function Content() {
  return (
    <>
      <H2>Why “any line that separates” isn&apos;t good enough</H2>
      <P>
        Logistic regression finds <em>a</em> boundary between two classes. But
        if the classes are separable, there are infinitely many boundaries that
        get 100% training accuracy — a line skimming just past the positive
        examples, one skimming the negatives, and everything in between. They
        all look equally good on the training set, but they are <B>not</B>{" "}
        equally good on data you haven&apos;t seen yet.
      </P>
      <P>
        Intuition: a boundary that nearly grazes a training point is living
        dangerously. A new example from the same class will land <em>near</em>{" "}
        that point, and “near” might be on the wrong side. The safest boundary
        is the one that stays <B>as far as possible from both classes</B> — it
        has the most room for error.
      </P>
      <P>
        That distance from the boundary to the nearest points is called the{" "}
        <B>margin</B>, and the Support Vector Machine is the classifier that{" "}
        <B>maximizes the margin</B>. The few training points that sit exactly
        on the margin edges — the ones that “hold up” the boundary like tent
        poles — are the <B>support vectors</B>. Delete every other training
        point and the boundary wouldn&apos;t move at all.
      </P>

      <SVMMarginPlayground />

      <H2>The math, at a comfortable altitude</H2>
      <P>
        The boundary is a hyperplane <M tex="\mathbf{w}^\top \mathbf{x} + b = 0" />
        . With labels <M tex="y_i \in \{-1, +1\}" />, a point is classified
        correctly with room to spare when{" "}
        <M tex="y_i(\mathbf{w}^\top \mathbf{x}_i + b) \ge 1" />. The geometric
        width of the margin works out to <M tex="2 / \lVert \mathbf{w} \rVert" />
        , so maximizing the margin means <em>minimizing</em>{" "}
        <M tex="\lVert \mathbf{w} \rVert" />:
      </P>
      <MathBlock tex="\min_{\mathbf{w},\, b} \; \frac{1}{2}\lVert \mathbf{w} \rVert^2 \quad \text{subject to} \quad y_i(\mathbf{w}^\top \mathbf{x}_i + b) \ge 1 \;\; \forall i" />
      <P>
        Don&apos;t let the notation intimidate you — in words it says:{" "}
        <B>“make the margin as wide as possible, while keeping every training
        point outside it on the correct side.”</B>
      </P>

      <H3>Hinge loss: the soft margin</H3>
      <P>
        Real data is messy — often no boundary separates it perfectly. So we
        relax the rules: points may violate the margin, but each violation
        costs us. The cost function is the <B>hinge loss</B>:
      </P>
      <MathBlock tex="\ell_{\text{hinge}}(x, y) = \max\big(0,\; 1 - y(\mathbf{w}^\top \mathbf{x} + b)\big)" />
      <P>The hinge has exactly the personality we want:</P>
      <UL>
        <li>
          Point safely outside the margin, correct side → loss is{" "}
          <B>exactly 0</B>. The SVM doesn&apos;t care about points it has
          already handled well — unlike logistic regression, which keeps
          squeezing every point for a bit more confidence.
        </li>
        <li>
          Point inside the margin or misclassified → loss grows{" "}
          <B>linearly</B> with how badly it violates.
        </li>
      </UL>
      <P>The full soft-margin objective balances the two desires:</P>
      <MathBlock tex="\min_{\mathbf{w},\, b}\; \underbrace{\frac{1}{2}\lVert \mathbf{w} \rVert^2}_{\text{wide margin}} \; + \; C \underbrace{\sum_i \max\big(0,\, 1 - y_i(\mathbf{w}^\top \mathbf{x}_i + b)\big)}_{\text{few violations}}" />
      <P>
        The hyperparameter <M tex="C" /> sets the exchange rate: large{" "}
        <M tex="C" /> says “violations are expensive, fit the training data
        tightly” (risking overfitting); small <M tex="C" /> says “a wide,
        calm margin matters more than a few mistakes.”
      </P>

      <H3>The kernel trick: separating the inseparable</H3>
      <P>
        Some datasets are hopeless for any straight line — imagine one class
        forming a ring around the other. The classic fix: <B>add dimensions</B>
        . Map each 2D point <M tex="(x_1, x_2)" /> to 3D as{" "}
        <M tex="(x_1, x_2, x_1^2 + x_2^2)" /> — now the inner cluster sits low
        and the ring sits high, and a flat plane separates them easily. A
        linear boundary in the lifted space is a <em>circle</em> back in the
        original space.
      </P>
      <P>
        The problem: useful lifted spaces can be enormous, even
        infinite-dimensional. Computing coordinates there would be impossibly
        expensive. The escape hatch comes from a remarkable fact: when you
        rewrite the SVM optimization in its <B>dual formulation</B>, the data
        only ever appears as <B>dot products between pairs of points</B>{" "}
        <M tex="\mathbf{x}_i^\top \mathbf{x}_j" /> — never as raw coordinates.
      </P>
      <P>
        So if we can compute the dot product <em>in the lifted space</em>{" "}
        directly from the original points, we never need the lifted
        coordinates at all. A function that does this is a <B>kernel</B>:
      </P>
      <MathBlock tex="K(\mathbf{x}_i, \mathbf{x}_j) = \phi(\mathbf{x}_i)^\top \phi(\mathbf{x}_j)" />
      <P>The two kernels you&apos;ll actually use:</P>
      <UL>
        <li>
          <B>Polynomial:</B>{" "}
          <M tex="K(\mathbf{a}, \mathbf{b}) = (\mathbf{a}^\top \mathbf{b} + c)^d" />{" "}
          — captures feature interactions up to degree <M tex="d" />.
        </li>
        <li>
          <B>RBF (Gaussian):</B>{" "}
          <M tex="K(\mathbf{a}, \mathbf{b}) = \exp\left(-\gamma \lVert \mathbf{a} - \mathbf{b} \rVert^2\right)" />{" "}
          — a smooth similarity score (1 for identical points, decaying to 0
          with distance), corresponding to an infinite-dimensional lift. This
          is the default for non-linear problems.
        </li>
      </UL>
      <Note title="The kernel trick in one sentence">
        Get all the power of working in a huge feature space while only ever
        computing cheap similarity scores between pairs of original points.
      </Note>

      <H3>How SVMs relate to neural networks</H3>
      <P>
        An SVM with a kernel is doing: <B>fixed feature transform</B>{" "}
        <M tex="\phi(x)" /> → linear classifier on top. A neural network does:{" "}
        <B>learned feature transform</B> (the hidden layers) → linear
        classifier on top (the final layer). That&apos;s the philosophical
        fork in the road: SVMs pick the transformation from a menu of kernels
        designed by mathematicians; networks <em>learn</em> the transformation
        from data. When data is scarce and features are decent, the
        hand-picked kernel often wins. When data is plentiful, learned
        features win — which is why the rest of this course is about neural
        networks. Hinge loss itself survives the transition: training a linear
        model with hinge loss and SGD is essentially an SVM, and you&apos;ll
        meet it again as a loss option in deep learning frameworks.
      </P>

      <H2>Implementation: a linear SVM via SGD on hinge loss</H2>
      <CodeBlock
        title="svm_sgd.py"
        code={`
import numpy as np

def train_linear_svm(X, y, C=1.0, lr=0.001, epochs=1000):
    """X: (N, d) features, y: (N,) labels in {-1, +1}."""
    N, d = X.shape
    w = np.zeros(d)
    b = 0.0

    for _ in range(epochs):
        margins = y * (X @ w + b)          # y(w·x + b) for every point
        violators = margins < 1            # inside margin or misclassified

        # subgradient of  0.5||w||^2 + C * sum(hinge)
        grad_w = w - C * (y[violators, None] * X[violators]).sum(axis=0)
        grad_b = -C * y[violators].sum()

        w -= lr * grad_w
        b -= lr * grad_b
    return w, b

# Pulsar / cancer data: load CSV, scale features, map labels to {-1, +1},
# then it's just:  w, b = train_linear_svm(X_train, y_train)
# Predict with:    np.sign(X_test @ w + b)
`}
      />
      <P>
        For the two implementation tasks below, it is fine (and standard
        practice) to use <Code>sklearn.svm.SVC</Code> with an RBF kernel for
        the real datasets, once you&apos;ve built the linear version yourself.
        Focus your energy on feature scaling — SVMs are very sensitive to it —
        and on tuning <M tex="C" /> and <M tex="\gamma" /> with a validation
        set.
      </P>

      <Tasks
        items={[
          "Implement the linear SVM above from scratch and verify it on a 2D toy dataset you can plot.",
          "SVM classification on the HTRU2 Pulsar Star dataset (predict whether a radio signal is a pulsar): https://archive.ics.uci.edu/dataset/372/htru2 — compare linear vs RBF kernels.",
          "SVM classification on a genomic cancer dataset (e.g., the Breast Cancer Wisconsin dataset or a gene-expression dataset): tune C and γ properly with cross-validation, and report precision/recall, not just accuracy.",
        ]}
      />

      <Quiz
        questions={[
          {
            question: "What makes a training point a 'support vector'?",
            options: [
              "It is the point farthest from the decision boundary",
              "It lies on or inside the margin, and removing it could move the boundary",
              "It was misclassified during the first epoch",
              "It has the largest feature values in the dataset",
            ],
            answer: 1,
            explanation:
              "The boundary is 'held up' only by the points on or violating the margin. Every other point has zero hinge loss and zero influence — delete them and nothing changes.",
          },
          {
            question: "What does the kernel trick let an SVM avoid computing?",
            options: [
              "The labels of the training data",
              "The explicit coordinates of points in the high-dimensional lifted space",
              "The dot products between training points",
              "The value of the hyperparameter C",
            ],
            answer: 1,
            explanation:
              "The dual formulation only needs dot products between points. A kernel computes those dot products as if in the lifted space — directly from the original coordinates — so the (possibly infinite-dimensional) lift never has to be materialized.",
          },
          {
            question:
              "A point is correctly classified and sits well outside the margin. What is its hinge loss?",
            options: [
              "A small positive number that shrinks with distance",
              "Exactly zero",
              "Negative, rewarding the model",
              "It depends on the kernel",
            ],
            answer: 1,
            explanation:
              "Hinge loss is max(0, 1 − y(w·x + b)). Once the functional margin exceeds 1, the loss is flatly zero — the SVM stops caring about points it already handles confidently.",
          },
        ]}
      />
    </>
  );
}
