"use client";

import { H2, P, B, UL, OL, Note, Tasks } from "@/components/Lesson";
import { M, MathBlock } from "@/components/Math";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import AttentionPlayground from "@/components/playgrounds/AttentionPlayground";

export const furtherReading = [
  {
    label: "Attention Is All You Need (Vaswani et al., 2017)",
    href: "https://arxiv.org/abs/1706.03762",
    note: "the original paper — surprisingly readable after this module",
  },
  {
    label: "The Illustrated Transformer (Jay Alammar)",
    href: "https://jalammar.github.io/illustrated-transformer/",
    note: "the classic visual walkthrough",
  },
  {
    label: "Andrej Karpathy: Let's build GPT from scratch (YouTube)",
    href: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
    note: "code a working GPT in ~2 hours — the perfect capstone",
  },
];

export default function Content() {
  return (
    <>
      <H2>The bottleneck that attention destroyed</H2>
      <P>
        Before 2017, sequences (sentences, audio, code) were processed by{" "}
        <B>recurrent networks</B> (RNNs, LSTMs): read one token at a time,
        left to right, maintaining a running “memory” vector that summarizes
        everything seen so far. Two crippling problems:
      </P>
      <UL>
        <li>
          <B>The memory bottleneck.</B> The entire past — however long — must
          be squeezed into one fixed-size vector. By the end of a long
          paragraph, details from the beginning have been overwritten.
          Information from word 3 reaches word 300 only by surviving 297
          hops, and gradients flowing back through those hops shrink toward
          zero (the vanishing gradient problem, in its nastiest form). LSTMs
          relieved this with gating; they did not cure it.
        </li>
        <li>
          <B>No parallelism.</B> Step 57 can&apos;t be computed before step
          56. Training cannot exploit the GPU&apos;s massive parallelism along
          the sequence dimension — a deal-breaker for scaling to huge data.
        </li>
      </UL>
      <P>
        The Transformer&apos;s radical answer: <B>delete the recurrence
        entirely.</B> Let every token look directly at every other token, in
        one parallel step. Any word is one hop from any other — no bottleneck
        vector, no 297-step gradient gauntlet, and the whole sequence is
        processed simultaneously. The mechanism that does the “looking” is{" "}
        <B>attention</B>.
      </P>

      <H2>Self-attention: queries, keys, and values</H2>
      <P>
        Consider: <em>“The cat sat because it was tired.”</em> To represent
        “it” well, the model must figure out that “it” refers to “cat” and
        pull information from there. Self-attention turns this into a soft
        database lookup. Each token&apos;s embedding{" "}
        <M tex="\mathbf{x}_i" /> is projected through three learned matrices
        into three roles:
      </P>
      <UL>
        <li>
          <B>Query</B> <M tex="\mathbf{q}_i = W_Q \mathbf{x}_i" /> — “what am
          I looking for?” (For “it”: <em>a recent noun I might refer to.</em>)
        </li>
        <li>
          <B>Key</B> <M tex="\mathbf{k}_i = W_K \mathbf{x}_i" /> — “what can I
          be found by?” (For “cat”: <em>I&apos;m a singular animal noun.</em>)
        </li>
        <li>
          <B>Value</B> <M tex="\mathbf{v}_i = W_V \mathbf{x}_i" /> — “if you
          pick me, here&apos;s the information I&apos;ll actually give you.”
        </li>
      </UL>
      <P>The lookup proceeds in three steps for each token <M tex="i" />:</P>
      <OL>
        <li>
          <B>Score:</B> dot the query against every key —{" "}
          <M tex="s_{ij} = \mathbf{q}_i \cdot \mathbf{k}_j" />. A big score
          means “token j has what token i is looking for.”
        </li>
        <li>
          <B>Normalize:</B> softmax the scores into weights that are positive
          and sum to 1 — a probability distribution over where to look.
        </li>
        <li>
          <B>Aggregate:</B> output the weighted average of all the{" "}
          <em>values</em>: <M tex="\mathbf{z}_i = \sum_j \alpha_{ij} \mathbf{v}_j" />
          .
        </li>
      </OL>
      <P>In matrix form — the most famous equation in modern ML:</P>
      <MathBlock tex="\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V" />
      <P>
        The <M tex="\sqrt{d_k}" /> is a small but vital detail: dot products
        of high-dimensional vectors are naturally large, and large scores push
        softmax into its saturated zone where one weight is ~1, the rest ~0,
        and gradients die. Dividing by <M tex="\sqrt{d_k}" /> (the key
        dimension) keeps scores at a healthy scale. Play with the effect —
        the sharpness slider below does exactly this in reverse:
      </P>

      <AttentionPlayground />

      <Note title="Why 'self'-attention?">
        Because queries, keys, and values all come from the <em>same</em>{" "}
        sequence — the sentence attends to itself. In the original
        encoder-decoder, there is also <B>cross-attention</B>, where the
        queries come from the output sequence but keys/values come from the
        input sequence (the decoder interrogating the encoder).
      </Note>

      <H2>Multi-head attention: several conversations at once</H2>
      <P>
        One attention pattern is one kind of relationship. But “it” → “cat”
        (coreference), “sat” → “cat” (subject-verb), “tired” → “was”
        (predicate) are all happening in the same sentence. So instead of one
        attention with dimension <M tex="d" />, run <M tex="h" /> independent
        “heads,” each with its own learned{" "}
        <M tex="W_Q, W_K, W_V" /> projecting into a smaller dimension{" "}
        <M tex="d/h" />. Each head learns its own notion of relevance; their
        outputs are concatenated and mixed by a final linear layer. Total
        compute stays roughly the same as one full-size head — you&apos;re
        splitting the model&apos;s attention budget across several
        specialists rather than one generalist.
      </P>

      <H2>Positional encoding: telling a parallel model about order</H2>
      <P>
        Here&apos;s the catch with deleting recurrence: attention is a
        weighted average over a <em>set</em>. Shuffle the input tokens and the
        outputs shuffle identically — the model literally cannot tell “dog
        bites man” from “man bites dog.” Word order has to be injected back
        in, and the fix is to <B>add a position-dependent vector to each
        token&apos;s embedding</B> before any attention happens.
      </P>
      <P>
        The original paper used fixed sine/cosine waves of geometrically
        increasing wavelengths — for position <M tex="pos" /> and embedding
        dimension <M tex="i" />:
      </P>
      <MathBlock tex="PE_{(pos,\, 2i)} = \sin\!\left(\frac{pos}{10000^{2i/d}}\right) \qquad PE_{(pos,\, 2i+1)} = \cos\!\left(\frac{pos}{10000^{2i/d}}\right)" />
      <P>
        Why this odd choice? Think of it as a <B>smooth binary odometer</B>:
        fast-spinning dimensions (small wavelengths) distinguish neighboring
        positions, slow-spinning ones (wavelengths up to 10000) distinguish
        distant regions — together they give every position a unique,
        smoothly-varying fingerprint. Two bonus properties: values stay
        bounded in [−1, 1] no matter how long the sequence, and the encoding
        of position <M tex="pos + k" /> is a fixed linear function of the
        encoding of <M tex="pos" /> — so “k tokens apart” looks the same
        everywhere, making <em>relative</em> offsets easy for attention to
        learn. (Modern models often use learned position embeddings or RoPE
        instead, but the job is identical.)
      </P>

      <H2>Assembling the full Transformer</H2>
      <P>Each <B>encoder block</B> is the same sandwich, stacked N times:</P>
      <OL>
        <li>Multi-head self-attention — tokens exchange information.</li>
        <li>
          A small two-layer MLP applied to each token independently — tokens
          digest what they gathered. (Your Module 3 skills, verbatim.)
        </li>
      </OL>
      <P>
        Both layers are wrapped with two stabilizers you met in Module 4&apos;s
        spirit: <B>residual connections</B> (<M tex="x + \text{Layer}(x)" /> —
        gradient superhighways that let 100-layer stacks train) and{" "}
        <B>layer normalization</B> (BatchNorm&apos;s sequence-friendly cousin,
        normalizing across features instead of across the batch).
      </P>
      <P>
        The original machine-translation architecture pairs an <B>encoder</B>{" "}
        (reads the source sentence with full bidirectional self-attention)
        with a <B>decoder</B> (generates the target one token at a time, using{" "}
        <B>masked</B> self-attention so position t cannot peek at future
        positions, plus cross-attention into the encoder). The famous
        descendants each keep one half: <B>BERT</B> is encoder-only
        (understanding), <B>GPT</B> is decoder-only (generation). A GPT is,
        honestly: token embeddings + positions → a stack of
        (masked attention + MLP) blocks → a linear layer predicting the next
        token. Every single piece is now something you know.
      </P>

      <H2>Implementation: self-attention in PyTorch</H2>
      <CodeBlock
        title="self_attention.py"
        code={`
import torch
import torch.nn as nn
import torch.nn.functional as F

class SelfAttention(nn.Module):
    """Single-head self-attention, written for clarity."""
    def __init__(self, d_model, d_head):
        super().__init__()
        self.W_q = nn.Linear(d_model, d_head, bias=False)
        self.W_k = nn.Linear(d_model, d_head, bias=False)
        self.W_v = nn.Linear(d_model, d_head, bias=False)
        self.scale = d_head ** 0.5

    def forward(self, x, causal=False):
        # x: (batch, seq_len, d_model)
        Q, K, V = self.W_q(x), self.W_k(x), self.W_v(x)

        scores = Q @ K.transpose(-2, -1) / self.scale   # (B, T, T)

        if causal:  # GPT-style: position t may not see positions > t
            T = x.size(1)
            mask = torch.triu(torch.ones(T, T, dtype=torch.bool), diagonal=1)
            scores = scores.masked_fill(mask, float("-inf"))

        weights = F.softmax(scores, dim=-1)             # rows sum to 1
        return weights @ V                              # (B, T, d_head)

x = torch.randn(2, 7, 64)            # batch of 2, seq of 7 tokens, d=64
attn = SelfAttention(d_model=64, d_head=32)
out = attn(x)
print(out.shape)                     # torch.Size([2, 7, 32])
`}
      />
      <P>
        Multi-head is a loop (or a clever reshape) over several of these with
        outputs concatenated; a full Transformer block adds the MLP,
        residuals, and LayerNorm. From here, Karpathy&apos;s “Let&apos;s build
        GPT” video takes you the rest of the way to a working language model —
        the recommended capstone for this entire course.
      </P>

      <Tasks
        items={[
          "Implement the SelfAttention block above and verify the attention weights: each row of softmax(QKᵀ/√d) should sum to 1.",
          "Add the causal mask and confirm position t's output doesn't change when you alter future tokens (a real test you can write!).",
          "Extend to multi-head attention, then a full Transformer block (attention + MLP + residuals + LayerNorm).",
          "Capstone: follow Karpathy's video and train a character-level GPT on Shakespeare.",
        ]}
      />

      <Quiz
        questions={[
          {
            question:
              "What are the two fundamental problems with RNNs that Transformers solve?",
            options: [
              "Too many parameters and slow inference",
              "A fixed-size memory bottleneck (with vanishing gradients over long distances) and the inability to parallelize across the sequence during training",
              "They can't handle words and only work on images",
              "They require labeled data and Transformers don't",
            ],
            answer: 1,
            explanation:
              "An RNN squeezes the whole past into one vector and must process tokens serially. Attention gives every token a direct, one-hop connection to every other, computed for all tokens in parallel.",
          },
          {
            question:
              "In the sentence 'The cat sat because it was tired,' when the token 'it' resolves its referent via self-attention, what role do the OTHER tokens' vectors play?",
            options: [
              "They provide the queries; 'it' provides the keys",
              "Their keys are matched against 'it's query, and the winners' values are blended into 'it's new representation",
              "They are masked out entirely",
              "Only their positional encodings matter",
            ],
            answer: 1,
            explanation:
              "'it' broadcasts a query; every token offers a key (for matching) and a value (the payload). High query-key scores — like with 'cat' — mean that token's value dominates the weighted average.",
          },
          {
            question: "Why divide attention scores by √d_k before the softmax?",
            options: [
              "To make the matrix multiplication cheaper",
              "To keep dot products from growing with dimension and saturating the softmax, which would kill gradients",
              "To normalize the values V",
              "To enforce the causal mask",
            ],
            answer: 1,
            explanation:
              "Dot products of d-dimensional vectors scale like √d. Unscaled, softmax becomes near one-hot and its gradients vanish — the same saturation disease as sigmoid in Module 3.",
          },
          {
            question:
              "Why do Transformers need positional encodings at all?",
            options: [
              "To reduce the number of parameters",
              "Because attention is a weighted average over a set — without injected position information, shuffling the input tokens would just shuffle the outputs",
              "Because GPUs require sorted inputs",
              "To prevent overfitting on long sequences",
            ],
            answer: 1,
            explanation:
              "Deleting recurrence deleted the model's sense of order. Adding a unique positional fingerprint (sine/cosine waves, or learned embeddings) to each token restores it.",
          },
          {
            question:
              "What distinguishes the decoder's self-attention from the encoder's?",
            options: [
              "It uses a different softmax temperature",
              "It is causally masked: position t can only attend to positions ≤ t, so the model can't cheat by looking at tokens it hasn't generated yet",
              "It has no value vectors",
              "It runs twice per layer",
            ],
            answer: 1,
            explanation:
              "Generation is left-to-right, so training must hide the future: scores to later positions are set to −∞ before softmax. GPT models are stacks of exactly these masked blocks.",
          },
        ]}
      />
    </>
  );
}
