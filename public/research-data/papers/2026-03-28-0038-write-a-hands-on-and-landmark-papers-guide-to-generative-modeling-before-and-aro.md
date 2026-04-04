# Research Brief: Write a hands-on and landmark-papers guide to generative modeling before and around the transformer era. Cover autoregressive language modeling, autoencoders, variational autoencoders, GANs, diffusion models, and their major milestone papers. Explain what each family is trying to learn, what problem shape it fits, why certain approaches rose or fell, and what beginner-scale experiments best teach the differences.

- Queue ID: 38
- Generated: 2026-03-28T18:43:18+00:00

# Generative Modeling Before and Around the Transformer Era: A Hands-On and Landmark-Papers Guide
**Date:** March 28, 2026  
**Scope:** Generative modeling from pre-transformer neural methods through the early transformer era, with a short current-state update.

## Executive Summary
Before transformers became the default architecture for language and many multimodal systems, modern generative modeling was shaped by four major ideas: factorized likelihood modeling, latent-variable modeling, adversarial learning, and denoising-based generation. Those ideas did not disappear when transformers arrived; they were recombined. Today’s strongest systems often mix them: autoregressive transformers for sequence prediction, autoencoders or tokenizers for compression, and diffusion or flow-style decoders for high-fidelity media.

Each family optimizes a different compromise. Autoregressive models learn exact next-step conditionals and fit discrete sequences especially well. Autoencoders learn compressed representations but are not, by themselves, strong generative models. VAEs add a probabilistic latent prior and stable training, but historically traded away sharpness. GANs produced strikingly sharp samples and fast generation, but their training instability and weak coverage made them brittle as general-purpose foundation-model objectives. Diffusion models rose because they were stable, covered data modes better, conditioned well, and scaled cleanly for images and video, despite slow sampling.

Around the transformer era, the decisive shift was architectural and computational: self-attention made long-range dependency modeling easier than RNNs, and large-scale pretraining made autoregressive language modeling the dominant route for text. In images and video, diffusion eventually displaced GANs as the default frontier method; more recently, diffusion has itself been pressured by rectified flow, diffusion transformers, and hybrid autoregressive-plus-decoder systems.

For a beginner, the fastest way to understand the field is not to read everything in chronological order. It is to run five small experiments: a character-level autoregressive model, a plain autoencoder, a VAE, a GAN, and a tiny diffusion model. The point is to see the failure modes. Autoregressive models sample coherently but slowly. Plain autoencoders reconstruct but do not sample well. VAEs interpolate smoothly but blur. GANs look sharp until they collapse. Diffusion models are robust and controllable but expensive at inference. Those differences explain most of the field’s historical rise-and-fall cycle.

## Assumptions and Uncertainty
- “Current landscape” means **as of March 28, 2026**.
- For closed commercial systems, internals are sometimes only partially disclosed. Where I describe a system as “hybrid” or “autoregressive + decoder,” that is based on official product or research descriptions, not full open weights or full training details.
- Vendor benchmark claims in product posts should be treated as directional unless independently replicated.

## Background and Core Concepts
Generative modeling tries to learn a distribution over data, usually written as \(p(x)\), \(p(x \mid c)\), or \(p(x,z)\).

### Four core objective shapes
| Family | What it tries to learn | Best fit | Typical tradeoff |
|---|---|---|---|
| Autoregressive | Exact factorization of joint probability into next-step conditionals | Text, code, audio tokens, any ordered discrete sequence | Strong likelihood, slow sampling |
| Autoencoder | Compressed representation that reconstructs input | Compression, denoising, representation learning | Good reconstructions, weak standalone generation |
| VAE | Latent-variable generative model with approximate posterior | Structured latent spaces, controllable generation, compression | Stable training, softer samples |
| GAN | Generator that fools a discriminator | High-fidelity perceptual synthesis | Sharp outputs, unstable training, weak coverage |
| Diffusion / score-based | Reverse a noising process or follow score field back to data | Images, video, audio, inverse problems, editing | Very robust and controllable, slower inference |

### Why the transformer era mattered
Transformers changed generative modeling less by inventing a new objective than by making scaling work better:
- In language, self-attention beat RNN recurrence on parallelism and long-range context.
- In vision and media, transformers later became backbones inside diffusion systems.
- The older model families survived, but often in support roles: VAEs as latent compressors, diffusion as decoder, autoregressive transformers as prior.

## Landmark Timeline
- **1993:** Hinton and Zemel connect autoencoders to coding length and probabilistic thinking.
- **2000:** Bengio et al. show neural probabilistic language modeling with distributed word representations.
- **2006:** Hinton and Salakhutdinov revive deep autoencoders for nonlinear dimensionality reduction.
- **2010–2014:** RNN language modeling, LSTM seq2seq, and attention become the pre-transformer sequence stack.
- **2013–2014:** VAE papers make latent-variable deep generative models practical via reparameterization.
- **2014:** GANs arrive.
- **2015–2019:** DCGAN, WGAN, progressive GANs, StyleGAN; GANs dominate image synthesis mindshare.
- **2015 / 2020:** Diffusion appears early, then becomes practical with DDPM.
- **2017:** Transformer paper changes sequence modeling.
- **2021–2023:** latent diffusion and diffusion transformers make diffusion the default frontier image recipe.
- **2024–2026:** rectified flow, multimodal diffusion transformers, and hybrid autoregressive media systems intensify convergence across families.

## Family-by-Family Guide

### 1. Autoregressive Language Modeling
**What it learns:**  
A factorization of the joint distribution, e.g. \(p(x)=\prod_t p(x_t \mid x_{<t})\).

**Problem shape it fits:**  
Ordered discrete data: language, code, MIDI, tokenized images, speech tokens.

**Why it rose:**  
- Exact likelihood objective.
- Straightforward scaling law behavior.
- Fits text naturally.
- Sampling quality improves predictably with scale.

**Why pre-transformer versions faded:**  
RNN/LSTM models had optimization bottlenecks, limited parallelism, and fragile long-context handling. Transformers replaced the recurrent architecture, not the autoregressive objective.

**Milestone papers:**
- Bengio, Ducharme, Vincent, *A Neural Probabilistic Language Model* (2000): distributed word embeddings plus neural next-word prediction. <https://papers.nips.cc/paper/2000/hash/728f206c2a01bf572b5940d7d9a8fa4c-Abstract.html>
- Mikolov et al., *Recurrent Neural Network Based Language Model* (2010): RNNs for LM at practical scale. Reference surfaced in later sources; canonical citation is Interspeech 2010.
- Sutskever, Vinyals, Le, *Sequence to Sequence Learning with Neural Networks* (2014): encoder-decoder LSTM showed end-to-end sequence transduction. <https://research.google/pubs/sequence-to-sequence-learning-with-neural-networks/>
- Bahdanau, Cho, Bengio, *Neural Machine Translation by Jointly Learning to Align and Translate* (2014/2015): attention removes fixed-length bottleneck.
- Vaswani et al., *Attention Is All You Need* (2017): transformer architecture makes autoregressive LM scale cleanly. <https://proceedings.mlr.press/v70/vaswani17a.html>
- Radford et al., *Improving Language Understanding by Generative Pre-Training* (2018): transformer autoregressive pretraining becomes the dominant language recipe. <https://openai.com/index/language-unsupervised/>

**Beginner experiment:**  
Train a character-level model on Tiny Shakespeare.
- `GRU/LSTM`: teaches recurrence, vanishing context, sampling temperature.
- Small transformer: teaches parallel training and better long-range structure.
- Compare: validation loss, sample coherence, and tokens/sec at generation.

### 2. Autoencoders
**What they learn:**  
A map \(x \to z \to \hat{x}\) that reconstructs the input through a bottleneck or regularized code.

**Problem shape it fits:**  
Compression, denoising, anomaly detection, representation learning, latent compression for downstream generators.

**Why they rose:**  
They turned unsupervised learning into a practical engineering object: learn a useful code without labels.

**Why plain autoencoders fell as headline generators:**  
A plain autoencoder does not specify a good sampling distribution over latent space. Reconstruction quality does not imply good novel samples.

**Milestone papers:**
- Rumelhart, Hinton, Williams, *Learning Representations by Back-Propagating Errors* (1986): foundational representation-learning frame. <https://www.nature.com/articles/323533a0>
- Hinton, Zemel, *Autoencoders, Minimum Description Length and Helmholtz Free Energy* (1993): ties autoencoding to probabilistic coding ideas. <https://papers.nips.cc/paper/1993/hash/9e3cfc48eccf81a0d57663e129aef3cb-Abstract.html>
- Hinton, Salakhutdinov, *Reducing the Dimensionality of Data with Neural Networks* (2006): deep autoencoders for nonlinear dimensionality reduction. <https://www.science.org/doi/10.1126/science.1127647>
- Vincent et al., *Extracting and Composing Robust Features with Denoising Autoencoders* (2008): denoising objective as representation learning. <https://jmlr.org/beta/papers/v11/vincent10a.html>

**Beginner experiment:**  
Train an undercomplete convolutional autoencoder on MNIST or Fashion-MNIST.
- Inspect latent interpolations.
- Corrupt inputs with noise and compare plain AE vs denoising AE.
- Then try random latent sampling; the poor sample quality teaches why “reconstruction model” is not the same as “good generative model.”

### 3. Variational Autoencoders
**What they learn:**  
A probabilistic latent-variable model \(p_\theta(x,z)\) with an approximate posterior \(q_\phi(z \mid x)\), optimized via the ELBO.

**Problem shape it fits:**  
Data where smooth latent structure matters: interpolation, controllable generation, semi-supervised learning, compression, and as a latent stage for bigger generators.

**Why they rose:**  
- Stable training.
- Explicit latent space with approximate likelihood.
- Scales better than earlier latent-variable deep models because of the reparameterization trick.

**Why they lost ground as final image generators:**  
Pixel-space VAEs often produced over-smoothed outputs because the objective rewards average reconstructions and because decoder/likelihood choices mattered.

**Milestone papers:**
- Kingma, Welling, *Auto-Encoding Variational Bayes* (2013/2014): reparameterization trick and amortized inference. <https://arxiv.org/abs/1312.6114>
- Rezende, Mohamed, Wierstra, *Stochastic Backpropagation and Approximate Inference in Deep Generative Models* (2014): parallel formulation of scalable stochastic latent inference. <https://arxiv.org/abs/1401.4082>
- Higgins et al., *beta-VAE* (2017): disentanglement via stronger KL pressure. <https://openreview.net/forum?id=Sy2fzU9gl>

**Beginner experiment:**  
Train a VAE on MNIST, then a `beta`-VAE.
- Log reconstruction loss and KL separately.
- Interpolate in latent space.
- Compare with a plain autoencoder: VAEs sample better globally, but reconstructions are softer.
- Best lesson: posterior collapse and the reconstruction-vs-structure tradeoff.

### 4. GANs
**What they learn:**  
An implicit data generator trained through a game: a generator tries to fool a discriminator.

**Problem shape it fits:**  
Perceptual synthesis where sample sharpness matters more than calibrated density: faces, image translation, super-resolution, style synthesis.

**Why they rose:**  
GANs solved the “VAE blur” problem in public perception. They produced much sharper samples and sampled in one pass.

**Why they fell as the default frontier objective:**  
- Training instability.
- Mode collapse.
- No tractable likelihood.
- Harder to scale and evaluate reliably for broad-coverage generation.
- Conditioning and editing pipelines became less straightforward than with diffusion.

**Milestone papers:**
- Goodfellow et al., *Generative Adversarial Nets* (2014). <https://papers.nips.cc/paper/5423-generative-adversarial-nets>
- Radford, Metz, Chintala, *DCGAN* (2015): practical convolutional GAN recipe. <https://arxiv.org/abs/1511.06434>
- Salimans et al., *Improved Techniques for Training GANs* (2016): stabilization tricks. <https://proceedings.neurips.cc/paper/2016/hash/8a3363abe792db2d8761d6403605aeb7-Abstract.html>
- Arjovsky, Chintala, Bottou, *Wasserstein GAN* (2017): better optimization geometry. <https://arxiv.org/abs/1701.07875>
- Karras et al., *A Style-Based Generator Architecture for GANs* (2018/2019): StyleGAN becomes the canonical high-fidelity face generator. <https://arxiv.org/abs/1812.04948>

**Beginner experiment:**  
Train DCGAN or WGAN-GP on CIFAR-10 or CelebA 64.
- Track FID only if convenient; visual grids already teach a lot.
- Watch for mode collapse by counting repeated motifs.
- Compare one-pass sampling speed against diffusion later.
- Best lesson: GANs can look amazing before they are actually learning the whole data distribution.

### 5. Diffusion and Score-Based Models
**What they learn:**  
A reverse process from noise to data, either as a Markov denoising chain or as a learned score field / reverse-time SDE.

**Problem shape it fits:**  
High-dimensional perceptual data, conditional generation, editing, inpainting, inverse problems, image/video/audio synthesis.

**Why they rose:**  
- Stable likelihood-based or score-based training.
- Better mode coverage than GANs.
- Conditioning works very well.
- Generation quality improved steadily with scale and architecture advances.

**Why they were initially resisted:**  
Sampling was slow. Early diffusion models needed many denoising steps.

**Why they remain strong:**  
Sampling is getting cheaper via distillation, latent spaces, rectified flow, and stronger backbones.

**Milestone papers:**
- Sohl-Dickstein et al., *Deep Unsupervised Learning using Nonequilibrium Thermodynamics* (2015): early diffusion formulation. <https://arxiv.org/abs/1503.03585>
- Ho, Jain, Abbeel, *Denoising Diffusion Probabilistic Models* (2020). <https://arxiv.org/abs/2006.11239>
- Song et al., *Score-Based Generative Modeling through Stochastic Differential Equations* (2021). <https://arxiv.org/abs/2011.13456>
- Rombach et al., *High-Resolution Image Synthesis with Latent Diffusion Models* (2022): diffusion becomes economically practical through latent-space generation. <https://arxiv.org/abs/2112.10752>
- Peebles, Xie, *Scalable Diffusion Models with Transformers* (DiT, 2023): transformer backbones for diffusion. <https://arxiv.org/abs/2212.09748>
- Esser et al., *Scaling Rectified Flow Transformers for High-Resolution Image Synthesis* (2024): rectified flow strengthens the case for straighter, faster trajectories. <https://proceedings.mlr.press/v235/esser24a.html>

**Beginner experiment:**  
Train a tiny DDPM on MNIST or CIFAR-10 32x32.
- First on 2D moons or Swiss roll to visualize forward and reverse processes.
- Then on images with 100–200 steps.
- Compare sample quality after 20, 50, and 100 steps.
- Best lesson: diffusion is forgiving to train and excellent for coverage, but compute shifts from training instability to inference cost.

## Why Approaches Rose or Fell
- **Autoregressive** rose wherever data has a natural order and exact conditional prediction matters; language is the clearest case.
- **Autoencoders** remained foundational, but mostly as representation learners or latent compressors rather than standalone generators.
- **VAEs** persisted where latent structure and stable probabilistic learning matter; they are now often infrastructure inside larger systems.
- **GANs** peaked when sharpness dominated evaluation and fell when reliability, mode coverage, conditioning, and scale mattered more.
- **Diffusion** rose because it matched the practical needs of modern media generation: stability, controllability, and scaling.

## Current Landscape, Key Players, and Recent Developments
**As of March 28, 2026:**

### Language
The frontier in language remains overwhelmingly **autoregressive transformer-based**.
- **OpenAI**: GPT family; recent official model pages and releases show continued emphasis on long-context autoregressive models and multimodal tooling. <https://openai.com/index/gpt-4-1/> <https://platform.openai.com/docs/models/gpt-4.1>
- **Anthropic**: Claude family remains a leading autoregressive text model line. <https://docs.anthropic.com/en/docs/models-overview>
- **Google DeepMind**: Gemini 2.5 line emphasizes native multimodality and long context. <https://deepmind.google/en/models/gemini/flash/>

### Images and video
The frontier is more mixed.
- **Diffusion and flow-derived methods** remain dominant in open and many closed visual systems.
- **Stability AI**: Stable Diffusion 3 introduced **MMDiT** and public discussion of **rectified flow**. <https://stability.ai/news/stable-diffusion-3-research-paper>
- **Black Forest Labs**: FLUX.1 positions rectified-flow transformers as a top open image stack. <https://blackforestlabs.io/flux-1/> <https://huggingface.co/black-forest-labs/FLUX.1-dev>
- **OpenAI**: the March 25, 2025 GPT-4o image release explicitly described a hybrid framing of transformer modeling plus diffusion-style decoding, which is a strong signal that the old family boundaries are collapsing in products. <https://openai.com/index/introducing-4o-image-generation/>
- **Google DeepMind**: Veo shows the current push in video generation toward stronger control, realism, and multimodal outputs; these are vendor claims but directionally important. <https://deepmind.google/technologies/veo/veo-2>

### Recent developments that matter
- **Transformers moved inside diffusion**: DiT and MMDiT replaced older U-Net assumptions in many high-end systems.
- **Rectified flow / flow matching** is pressuring classical diffusion because straighter trajectories can reduce sampling cost.
- **Hybrid systems are growing**: autoregressive priors, learned tokenizers/VAEs, and diffusion or flow decoders are increasingly combined.
- **VAEs did not die**: they became critical infrastructure for latent compression in image pipelines.
- **GANs are no longer the default frontier recipe**, but remain useful in niche perceptual tasks, lightweight generation, and some restoration pipelines.

## Practical Opportunities
- Build intuition for likelihood vs sample quality vs controllability with small side-by-side experiments.
- Use **autoregressive models** for text/code and any discrete-sequence domain.
- Use **VAEs/autoencoders** when you need compact latent spaces, retrieval, interpolation, anomaly detection, or tokenizer-style compression.
- Use **diffusion/flow** for image generation, editing, restoration, and inverse problems.
- Use **GANs** selectively when latency is strict and the task rewards perceptual sharpness over calibrated coverage.

## Risks and Challenges
- **Autoregressive**: slow generation, exposure bias, expensive long-context inference.
- **Autoencoders**: latent spaces can be useful without being generative; easy to overclaim.
- **VAEs**: posterior collapse, oversmoothing, weak likelihood assumptions in practice.
- **GANs**: instability, collapse, evaluation ambiguity, unreliable coverage.
- **Diffusion**: inference cost, prompt sensitivity, safety filtering complexity, and increasingly opaque hybrid stacks in commercial systems.

## Open Questions
- Will **rectified flow / flow matching** materially displace standard diffusion, or mostly refine it?
- Can **autoregressive visual generation** catch up in fidelity and editing convenience without losing efficiency?
- What is the right interface between **latent tokenizers/VAEs** and **foundation-model priors**?
- How should we evaluate **coverage, controllability, and edit consistency** jointly, not just “pretty samples”?
- For multimodal products, which pieces should be **shared across modalities** and which should remain specialized decoders?

## What to Monitor in the Next 12 Months
- Whether image and video leaders continue shifting from classic diffusion to **rectified-flow or flow-matching** training.
- Whether more top systems disclose **hybrid autoregressive-plus-decoder** designs.
- Sampling-speed breakthroughs: distillation, consistency-style methods, and lower-step flow samplers.
- Whether open-weight visual models from **Black Forest Labs** and **Stability AI** keep narrowing the gap to closed systems.
- Better evaluation standards for **editing fidelity**, **character consistency**, and **mode coverage**.
- Whether language-model vendors integrate stronger learned compression stages for media generation rather than raw-token approaches.

## Actionable Next Steps
1. Reproduce one toy model from each family: char-level LM, denoising autoencoder, VAE, WGAN-GP, and tiny DDPM.
2. Keep a single comparison sheet with these metrics: sample quality, coverage, controllability, training stability, and sampling latency.
3. Read the landmark papers in this order: Bengio 2000, Hinton-Salakhutdinov 2006, AEVB 2013, GAN 2014, DDPM 2020, DiT 2023.
4. For images, study **latent diffusion** and **MMDiT/DiT** before spending time on older GAN stabilization literature.
5. For language, focus on the continuity from **neural LM -> RNN LM -> seq2seq + attention -> transformer autoregression**, because the objective continuity matters more than the architecture break.
6. If you want one practical modern build path, implement a small **VAE tokenizer + transformer prior** or a **latent diffusion** model; both teach why old families now coexist inside one stack.
7. Revisit GANs only after you have trained a diffusion model, so the sharpness-vs-stability tradeoff is obvious from experience.

## Sources and Further Reading
**Primary papers**
- Bengio et al. 2000, *A Neural Probabilistic Language Model*: <https://papers.nips.cc/paper/2000/hash/728f206c2a01bf572b5940d7d9a8fa4c-Abstract.html>
- Sutskever et al. 2014, *Sequence to Sequence Learning with Neural Networks*: <https://research.google/pubs/sequence-to-sequence-learning-with-neural-networks/>
- Vaswani et al. 2017, *Attention Is All You Need*: <https://proceedings.mlr.press/v70/vaswani17a.html>
- Hinton & Zemel 1993, *Autoencoders, MDL and Helmholtz Free Energy*: <https://papers.nips.cc/paper/1993/hash/9e3cfc48eccf81a0d57663e129aef3cb-Abstract.html>
- Hinton & Salakhutdinov 2006, *Reducing the Dimensionality of Data with Neural Networks*: <https://www.science.org/doi/10.1126/science.1127647>
- Kingma & Welling 2013/2014, *Auto-Encoding Variational Bayes*: <https://arxiv.org/abs/1312.6114>
- Rezende et al. 2014, *Stochastic Backpropagation...*: <https://arxiv.org/abs/1401.4082>
- Goodfellow et al. 2014, *Generative Adversarial Nets*: <https://papers.nips.cc/paper/5423-generative-adversarial-nets>
- Arjovsky et al. 2017, *Wasserstein GAN*: <https://arxiv.org/abs/1701.07875>
- Ho et al. 2020, *Denoising Diffusion Probabilistic Models*: <https://arxiv.org/abs/2006.11239>
- Song et al. 2021, *Score-Based Generative Modeling through SDEs*: <https://arxiv.org/abs/2011.13456>
- Rombach et al. 2022, *Latent Diffusion Models*: <https://arxiv.org/abs/2112.10752>
- Peebles & Xie 2023, *DiT*: <https://arxiv.org/abs/2212.09748>
- Esser et al. 2024, *Scaling Rectified Flow Transformers*: <https://proceedings.mlr.press/v235/esser24a.html>

**Current landscape**
- OpenAI, *Introducing 4o Image Generation* (March 25, 2025): <https://openai.com/index/introducing-4o-image-generation/>
- OpenAI, *Introducing GPT-4.1 in the API* (April 14, 2025): <https://openai.com/index/gpt-4-1/>
- Anthropic, *Models Overview*: <https://docs.anthropic.com/en/docs/models-overview>
- Google DeepMind, *Gemini 2.5 Flash*: <https://deepmind.google/en/models/gemini/flash/>
- Google DeepMind, *Veo*: <https://deepmind.google/technologies/veo/veo-2>
- Stability AI, *Stable Diffusion 3 Research Paper*: <https://stability.ai/news/stable-diffusion-3-research-paper>
- Black Forest Labs, *FLUX.1*: <https://blackforestlabs.io/flux-1/>
- Hugging Face model card, *FLUX.1-dev*: <https://huggingface.co/black-forest-labs/FLUX.1-dev>

If you want, I can turn this into a longer 8–10 page Markdown brief with figures/tables formatted for a repo `README` or save it as a `.md` file in the workspace.
