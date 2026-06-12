"use client";

import { H2, H3, P, B, UL, Note, Tasks } from "@/components/Lesson";
import { M, MathBlock } from "@/components/Math";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import GradientDescentPlayground from "@/components/playgrounds/GradientDescentPlayground";

export const furtherReading = [
  {
    label: "StatQuest: Linear Regression, Clearly Explained",
    href: "https://www.youtube.com/watch?v=nk2CQITm_eo",
    note: "the friendliest possible introduction",
  },
  {
    label: "StatQuest: Logistic Regression",
    href: "https://www.youtube.com/watch?v=yIYKR4sgzI8",
    note: "same energy, for classification",
  },
];

export default function Content() {
  return (
    <>
      <H2>What does it mean for a machine to “learn”?</H2>
      <P>
        Strip away the hype and machine learning is one simple idea:{" "}
        <B>instead of writing rules by hand, we write a program with blank
        knobs and let data turn the knobs.</B> A “model” is just a function
        with adjustable numbers in it (called <B>parameters</B> or{" "}
        <B>weights</B>), and “learning” means automatically adjusting those
        numbers so the function&apos;s outputs match reality as closely as
        possible.
      </P>
      <P>
        Everything in this course — SVMs, neural networks, even
        billion-parameter Transformers — follows the same three-step recipe:
      </P>
      <UL>
        <li>
          <B>A model:</B> a function <M tex="f_\theta(x)" /> that maps inputs
          to predictions, controlled by parameters <M tex="\theta" />.
        </li>
        <li>
          <B>A loss function:</B> a single number that measures how wrong the
          predictions are. Lower = better.
        </li>
        <li>
          <B>An optimizer:</B> a procedure that nudges the parameters to make
          the loss smaller. Almost always some flavor of gradient descent.
        </li>
      </UL>
      <P>
        Master this recipe on the simplest possible model — a straight line —
        and you have genuinely understood the core of deep learning. The rest
        of the course is “the same recipe, fancier functions.”
      </P>

      <H2>Linear Regression: predicting numbers with a line</H2>
      <P>
        Suppose you want to predict a house&apos;s price from its size. You
        suspect bigger houses cost more, roughly proportionally. The simplest
        model that captures “roughly proportionally” is a line:
      </P>
      <MathBlock tex="\hat{y} = wx + b" />
      <P>
        Here <M tex="x" /> is the input (size), <M tex="\hat{y}" /> is the
        prediction (price), and the two knobs are <M tex="w" /> (the slope —
        how much price rises per square foot) and <M tex="b" /> (the intercept
        — the baseline price). With many input features the idea is identical,
        we just take a weighted sum:{" "}
        <M tex="\hat{y} = w_1 x_1 + w_2 x_2 + \dots + w_n x_n + b = \mathbf{w}^\top \mathbf{x} + b" />
        .
      </P>

      <H3>Measuring wrongness: Mean Squared Error</H3>
      <P>
        To tune <M tex="w" /> and <M tex="b" /> we first need a score for how
        bad a given line is. For regression the classic choice is{" "}
        <B>Mean Squared Error (MSE)</B>: for each training example, take the
        difference between the prediction and the true value, square it, and
        average over all <M tex="N" /> examples.
      </P>
      <MathBlock tex="L_{\text{MSE}} = \frac{1}{N}\sum_{i=1}^{N} \left(\hat{y}_i - y_i\right)^2" />
      <P>
        Why square? Two reasons. It makes all errors positive (overshooting by
        5 is as bad as undershooting by 5), and it punishes big mistakes much
        more than small ones — an error of 10 contributes 100, while ten errors
        of 1 contribute only 10 total. It also makes the loss a smooth bowl
        shape, which is exactly what gradient descent loves.
      </P>

      <H2>Gradient Descent: walking downhill blindfolded</H2>
      <P>
        Picture the loss as a landscape: every possible setting of the
        parameters is a location, and the loss value is the altitude there.
        Training means finding the lowest valley. The catch: the landscape can
        have millions of dimensions, so we can&apos;t just look at it.
      </P>
      <P>
        But we can do something almost as good. Standing at any point, calculus
        gives us the <B>gradient</B> — the direction of steepest <em>uphill</em>{" "}
        slope under our feet. So the strategy is beautifully dumb:{" "}
        <B>feel the slope, step in the opposite direction, repeat.</B>
      </P>
      <MathBlock tex="\theta \leftarrow \theta - \eta \, \frac{\partial L}{\partial \theta}" />
      <P>
        The Greek letter <M tex="\eta" /> (eta) is the <B>learning rate</B> —
        the step size. It is the single most important number you will ever
        tune. Too small and training takes forever; too large and you leap
        across the valley and climb the opposite wall, getting{" "}
        <em>worse</em> each step. Try it yourself:
      </P>

      <GradientDescentPlayground />

      <H3>The gradients for linear regression</H3>
      <P>
        For our line, the chain rule gives clean closed-form gradients of the
        MSE loss:
      </P>
      <MathBlock tex="\frac{\partial L}{\partial w} = \frac{2}{N}\sum_i (\hat{y}_i - y_i)\,x_i \qquad \frac{\partial L}{\partial b} = \frac{2}{N}\sum_i (\hat{y}_i - y_i)" />
      <P>
        Read them intuitively: the error <M tex="(\hat{y}_i - y_i)" /> says how
        far off each prediction is and in which direction, and multiplying by{" "}
        <M tex="x_i" /> says “blame the slope in proportion to how big the
        input was.” That&apos;s all backpropagation will ever be — bookkeeping
        for blame.
      </P>

      <H2>Implementation: Linear Regression from scratch</H2>
      <P>
        No libraries doing the thinking for us — just NumPy arrays and the two
        gradient formulas above. This is the first implementation task of the
        course; type it out yourself rather than copy-pasting.
      </P>
      <CodeBlock
        title="linear_regression.py"
        code={`
import numpy as np

# Synthetic data: y = 3x + 2 plus noise
rng = np.random.default_rng(0)
X = rng.uniform(0, 10, size=100)
y = 3 * X + 2 + rng.normal(0, 1, size=100)

# Knobs, starting at zero
w, b = 0.0, 0.0
lr = 0.01

for epoch in range(200):
    y_hat = w * X + b                    # 1. predict
    error = y_hat - y
    loss = np.mean(error ** 2)           # 2. measure (MSE)

    dw = 2 * np.mean(error * X)          # 3. gradients
    db = 2 * np.mean(error)

    w -= lr * dw                         # 4. step downhill
    b -= lr * db

    if epoch % 40 == 0:
        print(f"epoch {epoch:3d}  loss={loss:8.3f}  w={w:.3f}  b={b:.3f}")

print(f"learned: y = {w:.2f}x + {b:.2f}   (true: y = 3x + 2)")
`}
      />
      <Note title="The four-step loop is universal">
        Predict → measure loss → compute gradients → update. Every training
        loop you will ever write, including for GPT-style models, is this loop
        with a fancier step 1 and automated step 3.
      </Note>

      <H2>Logistic Regression: predicting probabilities</H2>
      <P>
        Now change the question. Instead of “what price?” ask “is this email
        spam — yes or no?” A raw line is a bad fit: it happily outputs −4 or
        +250, which are meaningless as yes/no answers. We want a{" "}
        <B>probability</B>: a number between 0 and 1.
      </P>
      <P>
        The fix is to keep the linear part but squash its output through the{" "}
        <B>sigmoid</B> function, which smoothly maps any real number into
        (0, 1):
      </P>
      <MathBlock tex="\sigma(z) = \frac{1}{1 + e^{-z}} \qquad \hat{y} = \sigma(\mathbf{w}^\top \mathbf{x} + b)" />
      <P>
        Large positive <M tex="z" /> gives a probability near 1 (“definitely
        spam”), large negative gives near 0, and <M tex="z = 0" /> gives
        exactly 0.5 (“no idea”). Despite the name, logistic{" "}
        <em>regression</em> is a <B>classification</B> algorithm — the
        “regression” part is historical baggage.
      </P>

      <H3>Why not MSE? Enter Cross-Entropy</H3>
      <P>
        You could train this with MSE, but it works poorly: combining MSE with
        a sigmoid produces a lumpy loss surface with flat plateaus where
        gradients nearly vanish. The principled loss for probabilities is{" "}
        <B>binary cross-entropy</B>, which scores how much probability the
        model assigned to the truth:
      </P>
      <MathBlock tex="L_{\text{BCE}} = -\frac{1}{N}\sum_{i=1}^{N} \Big[ y_i \log \hat{y}_i + (1 - y_i)\log(1 - \hat{y}_i) \Big]" />
      <P>
        The intuition: if the true label is 1, only the{" "}
        <M tex="\log \hat{y}_i" /> term is active, and the loss is small when{" "}
        <M tex="\hat{y}_i" /> is near 1 but blows up toward infinity as{" "}
        <M tex="\hat{y}_i \to 0" />. In plain words:{" "}
        <B>being confidently wrong is penalized brutally hard.</B> That harsh
        penalty is exactly what produces strong gradients when the model
        misbehaves.
      </P>
      <P>
        A small miracle of the math: with sigmoid + cross-entropy, the gradient
        comes out to the <em>same shape</em> as linear regression&apos;s —{" "}
        <M tex="\frac{\partial L}{\partial w} = \frac{1}{N}\sum_i (\hat{y}_i - y_i)x_i" />{" "}
        — prediction minus truth, times input. This tidy pattern (“error ×
        input”) will keep reappearing throughout the course.
      </P>

      <CodeBlock
        title="logistic_regression.py (the diff from linear)"
        code={`
def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

for epoch in range(500):
    z = w * X + b
    y_hat = sigmoid(z)                       # probabilities in (0, 1)

    # binary cross-entropy (with a tiny epsilon for numerical safety)
    eps = 1e-12
    loss = -np.mean(y * np.log(y_hat + eps)
                    + (1 - y) * np.log(1 - y_hat + eps))

    dw = np.mean((y_hat - y) * X)            # same "error × input" pattern!
    db = np.mean(y_hat - y)

    w -= lr * dw
    b -= lr * db
`}
      />

      <H2>MSE vs. Cross-Entropy: which loss when?</H2>
      <UL>
        <li>
          <B>Predicting a continuous quantity</B> (price, temperature,
          rating)? Use <B>MSE</B> — it measures distance.
        </li>
        <li>
          <B>Predicting a category / probability</B> (spam or not, which
          digit)? Use <B>cross-entropy</B> — it measures surprise, and it
          pairs with sigmoid/softmax to give clean, strong gradients.
        </li>
      </UL>
      <Note title="Why this module matters">
        Linear regression is a one-layer neural network with no activation.
        Logistic regression is a one-layer neural network with a sigmoid. When
        we get to MLPs in Module 3, you&apos;ll see that a deep network is
        literally logistic regression stacked on top of learned features.
        Nothing you just learned gets thrown away.
      </Note>

      <Tasks
        items={[
          "Implement linear regression from scratch with raw Python/NumPy (use the skeleton above, then extend it to multiple features using vectors: y_hat = X @ w + b).",
          "Plot loss vs. epoch and watch it fall; then deliberately set the learning rate too high and watch it diverge.",
          "Implement logistic regression from scratch and test it on a simple 2-class dataset (e.g., sklearn's make_blobs — using sklearn only to generate data, not to train).",
        ]}
      />

      <Quiz
        questions={[
          {
            question:
              "What does the learning rate η control in gradient descent?",
            options: [
              "The number of training examples used per epoch",
              "The size of each step taken in the direction opposite to the gradient",
              "How many parameters the model has",
              "The direction in which parameters are updated",
            ],
            answer: 1,
            explanation:
              "The gradient gives the direction; η scales how far we move along it. Too small = slow, too large = divergence (try it in the playground above).",
          },
          {
            question:
              "Your model must predict the probability that a transaction is fraudulent. Which loss should you reach for?",
            options: [
              "Mean Squared Error, because probabilities are numbers too",
              "Hinge loss",
              "Binary cross-entropy, paired with a sigmoid output",
              "No loss is needed for classification",
            ],
            answer: 2,
            explanation:
              "Cross-entropy is the natural loss for probabilities: it heavily punishes confident wrong answers and gives strong gradients through the sigmoid, where MSE would create flat plateaus.",
          },
          {
            question:
              "Why do we square the errors in MSE instead of just averaging them?",
            options: [
              "Squaring makes computation faster on GPUs",
              "Raw errors can cancel each other out (+5 and −5 average to 0), and squaring also penalizes large errors more heavily",
              "Because the data is always positive",
              "It is an arbitrary historical convention",
            ],
            answer: 1,
            explanation:
              "Without squaring, a model that overshoots half the time and undershoots the other half could score a perfect 0. Squaring fixes the sign problem and emphasizes large mistakes.",
          },
        ]}
      />
    </>
  );
}
