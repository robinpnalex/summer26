"use client";

import { H2, H3, P, B, UL, Code, Note, Tasks } from "@/components/Lesson";
import { M, MathBlock } from "@/components/Math";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import ConvolutionPlayground from "@/components/playgrounds/ConvolutionPlayground";

export const furtherReading = [
  {
    label: "CS231n: Convolutional Neural Networks",
    href: "https://cs231n.github.io/convolutional-networks/",
    note: "the definitive course notes, with animations",
  },
  {
    label: "Goodfellow, Bengio & Courville: Deep Learning, Ch. 9",
    href: "https://www.deeplearningbook.org/contents/convnets.html",
    note: "convolution from a mathematical standpoint, free online",
  },
  {
    label: "3Blue1Brown: But what is a convolution?",
    href: "https://www.youtube.com/watch?v=KuXjwB4LzSA",
    note: "beautiful visual treatment of the operation itself",
  },
];

export default function Content() {
  return (
    <>
      <H2>Why MLPs fail at images</H2>
      <P>
        In Module 4 you trained an MLP on CIFAR-10 and hit a wall around 55%.
        Here&apos;s why. Flattening a 32×32×3 image into a 3072-vector commits
        two sins:
      </P>
      <UL>
        <li>
          <B>It destroys spatial structure.</B> Pixels 5 and 6 are neighbors;
          pixels 5 and 500 are not. After flattening, the MLP has no idea —
          you could shuffle all pixel positions consistently and it would
          learn equally well. It must rediscover the concept of “nearby” from
          scratch.
        </li>
        <li>
          <B>It can&apos;t share knowledge across positions.</B> An MLP neuron
          that detects a cat ear in the top-left corner is useless for an ear
          in the bottom-right — separate weights must relearn the same
          concept at every location. Catastrophically wasteful.
        </li>
      </UL>
      <P>
        Convolutional networks fix both with one elegant idea:{" "}
        <B>learn small filters and slide them across the image.</B>
      </P>

      <H2>Convolution as an operation</H2>
      <P>
        A <B>filter</B> (or kernel) is a small grid of weights — typically
        3×3. Convolution slides the filter over every position of the input;
        at each position it multiplies the filter against the patch of pixels
        underneath, elementwise, and sums to a single number. For input{" "}
        <M tex="I" /> and kernel <M tex="K" />:
      </P>
      <MathBlock tex="S(i, j) = (I * K)(i, j) = \sum_{m}\sum_{n} I(i+m,\, j+n)\, K(m, n)" />
      <P>
        The grid of output numbers is a <B>feature map</B>: a picture of
        “where in the image does this filter&apos;s pattern appear?” A filter
        whose weights look like a tiny vertical edge produces a feature map
        that lights up wherever the image has vertical edges. Try it:
      </P>

      <ConvolutionPlayground />

      <P>
        A convolutional <em>layer</em> learns a whole bank of such filters
        (say 32 of them), producing 32 feature maps stacked into a new
        “image” with 32 channels. For multi-channel input, each filter spans
        all input channels: a 3×3 filter over an RGB image is really
        3×3×3 = 27 weights + 1 bias.
      </P>

      <H3>Weight sharing & translation equivariance</H3>
      <P>
        The same little filter is reused at every spatial position. Two huge
        consequences:
      </P>
      <UL>
        <li>
          <B>Parameter efficiency.</B> Connecting a 224×224 image to a same-size
          hidden layer fully would need ~2.5 <em>billion</em> weights; a 3×3
          conv filter needs <B>28</B>. The savings are spent on depth and many
          filters instead.
        </li>
        <li>
          <B>Translation equivariance.</B> Shift the cat two pixels right, and
          the feature map&apos;s response shifts two pixels right —
          automatically, by construction. “What an ear looks like” is learned
          once and works everywhere. The architecture itself encodes the prior
          that <em>the laws of imagery don&apos;t depend on position</em>, so
          the network doesn&apos;t have to learn it from data.
        </li>
      </UL>

      <H3>Receptive fields: how a 3×3 filter ends up seeing the whole image</H3>
      <P>
        A neuron&apos;s <B>receptive field</B> is the region of the original
        image that can influence its value. One 3×3 conv layer sees 3×3
        pixels. But stack a second 3×3 layer on top: each of its inputs
        already summarizes a 3×3 patch, so it sees 5×5 of the original. A
        third layer sees 7×7. Receptive fields <B>grow with depth</B> — and
        pooling/striding makes them grow much faster.
      </P>
      <P>
        This is the crucial mental model of CNNs:{" "}
        <B>early layers see tiny regions and learn primitive patterns</B>{" "}
        (edges, color blobs); middle layers combine those into textures and
        parts (fur, eyes); deep layers, whose receptive fields cover the whole
        image, recognize entire objects. A hierarchy of features, learned
        end-to-end — nobody told the network to organize itself this way; it
        emerges from gradient descent because hierarchy is what works. This is
        what “learning representations” means.
      </P>

      <H3>Pooling and stride: throwing away the right information</H3>
      <P>
        <B>Max pooling</B> slides a small window (usually 2×2, stride 2) and
        keeps only the maximum in each window, halving the spatial size. It
        keeps “the feature is here-ish” while discarding the exact pixel —
        buying a little translation <em>invariance</em>, shrinking
        computation, and doubling the rate at which receptive fields grow.
        <B> Strided convolutions</B> (jumping 2 pixels at a time) achieve
        similar downsampling and are common in modern architectures. Two
        bookkeeping knobs you&apos;ll meet constantly: <B>padding</B> (adding
        a border of zeros so the output stays the same size and edge pixels
        get seen) and <B>stride</B>. With input size <M tex="W" />, filter{" "}
        <M tex="F" />, padding <M tex="P" />, stride <M tex="S" />, the output
        size is <M tex="\lfloor (W - F + 2P)/S \rfloor + 1" />.
      </P>

      <H3>Backprop through a conv layer</H3>
      <P>
        Nothing new is needed — convolution is just multiplication and
        addition, so the chain rule applies as always. Two facts give it a
        pleasing symmetry. First, because each filter weight was used at{" "}
        <em>every</em> spatial position, its gradient is the <B>sum over all
        positions</B> of (upstream gradient at that position) × (the input
        pixel that the weight touched there) — weight sharing in the forward
        pass becomes gradient <em>summing</em> in the backward pass. Second,
        the gradient flowing back to the input is itself a convolution of the
        upstream gradient with the <B>flipped filter</B>. Backprop through a
        conv is another conv. (For max pooling, the gradient simply flows
        entirely to whichever input was the max; the others get zero.)
      </P>

      <H2>Implementation: convolution from scratch + a real CNN</H2>
      <CodeBlock
        title="conv_from_scratch.py"
        code={`
import numpy as np

def conv2d(image, kernel):
    """Naive 2D convolution (no padding, stride 1). image: (H, W), kernel: (k, k)."""
    H, W = image.shape
    k = kernel.shape[0]
    out = np.zeros((H - k + 1, W - k + 1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            patch = image[i:i+k, j:j+k]
            out[i, j] = np.sum(patch * kernel)   # elementwise mult, then sum
    return out

sobel_x = np.array([[1, 0, -1],
                    [2, 0, -2],
                    [1, 0, -1]])
# conv2d(your_image, sobel_x) lights up on vertical edges
`}
      />
      <CodeBlock
        title="cifar_cnn.py"
        code={`
import torch.nn as nn

model = nn.Sequential(
    # Block 1: 32x32x3 -> 16x16x32
    nn.Conv2d(3, 32, kernel_size=3, padding=1),
    nn.BatchNorm2d(32), nn.ReLU(),
    nn.Conv2d(32, 32, kernel_size=3, padding=1),
    nn.BatchNorm2d(32), nn.ReLU(),
    nn.MaxPool2d(2),

    # Block 2: 16x16x32 -> 8x8x64
    nn.Conv2d(32, 64, kernel_size=3, padding=1),
    nn.BatchNorm2d(64), nn.ReLU(),
    nn.Conv2d(64, 64, kernel_size=3, padding=1),
    nn.BatchNorm2d(64), nn.ReLU(),
    nn.MaxPool2d(2),

    # Head: global pool -> linear classifier
    nn.AdaptiveAvgPool2d(1),
    nn.Flatten(),
    nn.Linear(64, 10),
)
# Same training loop as always. Expect ~85%+ on CIFAR-10 —
# remember the MLP's 55% ceiling? That gap is the value of architecture.
`}
      />
      <Note title="Visualize your filters">
        After training, plot the first conv layer&apos;s weights as little
        images (<Code>model[0].weight</Code> — shape (32, 3, 3, 3)). You will
        see edge and color-blob detectors that nobody programmed. Deeper
        layers can be probed by finding the image patches that maximally
        activate each filter.
      </Note>

      <Tasks
        items={[
          "Implement conv2d from scratch in NumPy (above), apply Sobel filters to a real photo, and confirm it matches scipy.signal.correlate2d.",
          "Add padding and stride support to your conv2d, and verify the output-size formula.",
          "Train the CIFAR-10 CNN to ≥85% test accuracy, reusing your Module 4 toolkit (Adam, schedules, augmentation).",
          "Visualize the trained first-layer filters as images, and the feature maps each block produces for one sample image.",
        ]}
      />

      <Quiz
        questions={[
          {
            question:
              "What does 'weight sharing' mean in a convolutional layer?",
            options: [
              "All filters in a layer share the same weights",
              "The same small filter is applied at every spatial position, so one set of weights covers the entire image",
              "Weights are shared between the training and test sets",
              "Each pixel has its own copy of the network",
            ],
            answer: 1,
            explanation:
              "One 3×3 filter (a handful of weights) slides across all positions. This collapses billions of would-be MLP parameters into dozens, and gives translation equivariance for free.",
          },
          {
            question:
              "You stack three 3×3 conv layers (stride 1, no pooling). What is the receptive field of a neuron in the third layer?",
            options: ["3×3", "5×5", "7×7", "9×9"],
            answer: 2,
            explanation:
              "Each additional 3×3 layer extends the receptive field by 2 pixels per side: 3×3 → 5×5 → 7×7. Pooling or striding would make it grow much faster.",
          },
          {
            question:
              "During backprop, why is a conv filter's weight gradient a SUM over all spatial positions?",
            options: [
              "Because pooling layers require it",
              "Because the same weight participated in computing the output at every position, and gradients from multiple uses of a value always add",
              "Because images are stored as integers",
              "It isn't — only the center position contributes",
            ],
            answer: 1,
            explanation:
              "Module 3's rule: when one value feeds multiple paths to the loss, its gradient is the sum over paths. A shared filter weight is used at every position, so every position contributes a term.",
          },
          {
            question: "What is the main purpose of max pooling?",
            options: [
              "To add non-linearity to the network",
              "To increase the number of channels",
              "To downsample feature maps — keeping the strongest responses, gaining some translation invariance, and growing receptive fields faster",
              "To normalize activations across the batch",
            ],
            answer: 2,
            explanation:
              "Pooling deliberately discards exact positions ('the edge is around here') to shrink computation and make features more robust to small shifts. The non-linearity comes from ReLU, not pooling.",
          },
        ]}
      />
    </>
  );
}
