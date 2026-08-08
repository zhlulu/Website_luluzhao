---
layout: ../../layouts/NoteLayout.astro
title: "The Random Numbers Are the Physics: Generator Requirements of a Stochastic Transport Solver"
description: "Why a Monte Carlo transport solver outgrows every RNG in the framework, an empirical null that proves certification must be structural, and the fine print of xoshiro256+."
date: "2026-08-08"
topic: "numerical methods"
---
# The Random Numbers Are the Physics: Generator Requirements of a Stochastic Transport Solver

*Companion working note to the MITTENS series (
[Part 1](/notes/parker-to-sde) /
[Part 2](/notes/shock-grid-resolution) /
[Part 3](/notes/sde-timestep)), written while replacing the code's
random number generator with a portable xoshiro256+ implementation.
It records why none of the pre-existing generators in the framework can
drive a stochastic solver, what a defective generator does and does not
do to the physics, and an instructive failed attempt to demonstrate the
defect empirically.*

---

## 1. The reframe: the generator is a model component

A stochastic (SDE) solver replaces the diffusion operator of the Parker
equation with its microscopic equivalent: millions of pseudo-particles
receiving random kicks. The generator is therefore not infrastructure —
it *is* the scattering model. Every property ascribed to pitch-angle
scattering (independence of successive scatterings, Gaussian statistics,
correct variance) is inherited from the generator, not from the equation;
the theorem connecting the particle ensemble to the Parker equation has
the statistical quality of the noise among its hypotheses. A defective
generator does not add noise to the solution — it makes the code solve a
*different* transport equation, exactly and silently.

The contrast with full-orbit simulation sharpens the point. A full-orbit
code spends its randomness once, building the turbulence realization
($10^6$–$10^9$ draws for mode phases), after which the dynamics is
deterministic and chaotic — draws are filtered through a scrambling
dynamical system, and errors land in the *field statistics*, which can be
inspected. The SDE solver draws $10^{13}$ times per production run,
applies each draw directly as a displacement, and any defect lands in
the *assumptions of the method*, inspectable from no single realization.
Per draw, the SDE solver places orders of magnitude more trust in the
generator, and places it on the method's foundations. In a full-orbit
simulation the turbulence provides the randomness; in an SDE solver, the
random number generator *is* the turbulence.

## 2. The draw budget

One 4-day production run: $\sim 10^5$ particles, $\sim 10^5$–$10^7$ SDE
steps each (adaptive stepping; $7\times10^7$ per always-alive particle at
the legacy uniform step), two uniforms per Box–Muller normal — of order
$10^{13}$ draws per run, $10^9$–$10^{10}$ per MPI rank stream.

## 3. The pre-existing generators, audited

The framework offers three generators; none survives the budget.

- **`share` `random_real` — identically AMPS's `rnd()`** (the framework's
  existing Monte Carlo code): the Lehmer generator
  $s_{n+1} = 5^{11} s_n \bmod 2^{31}$. Its period is *exactly*
  $2^{29} = 536{,}870{,}912$ (the multiplicative order of $5^{11}$
  mod $2^{31}$) — one production run recycles the full sequence
  $\sim$18,000 times, and each rank stream exhausts it within a single
  benchmark run. Its low bits are not weak but *frozen*: with an odd
  seed, bit 0 is constant, bit 1 constant, bit 2 has period two. It also
  relies (in the `share` version) on signed-integer overflow —
  non-standard Fortran that traps under NAG bounds checking.
- **`share` `random_integer`** (Wichmann–Hill 1982): period
  $7\times10^{12}$ — reached by a single run, against the Monte Carlo
  rule of thumb of consuming at most a small fraction of a period — and
  its uniforms are assembled in single precision.
- **`share/Library` `RandNum.h`** (Park–Miller, used by the FLEKS PIC
  code for particle loading): period $2^{31}-2 \approx 2\times10^9$;
  adequate for PIC loading budgets, three orders short of SDE transport.

A survey of all components confirms these are the only generators in the
tree, and that the two particle codes with prior Monte Carlo elements
(AMPS, FLEKS) both run on $\lesssim 10^9$-period generators of
Numerical-Recipes vintage.

![Structural indictment: period, bits, tails](/notes/rng-for-sde/figures/rng_level1.png)

*(a) Periods against one run's draw budget (dashed). (b) The bottom six
bits of 96 successive draws: the $5^{11}$ LCG's bits are literal stripes
(bit 0 constant); xoshiro256+'s* worst *bits — its low bits — are
structureless. (c) Box–Muller converts the smallest representable
uniform into the largest possible kick,
$R_{\max}=\sqrt{2N\ln 2}$ for $N$-bit uniforms: a hard wall at
$5.77\sigma$ for single precision (the true process expects $\sim$80,000
kicks beyond it per production run; the generator delivers zero) versus
$8.57\sigma$ for double — a ceiling the run's budget never probes.*

## 4. The empirical null — and why it is the strongest argument

To make the indictment concrete we swapped the $5^{11}$ LCG into the
solver (a pinned throwaway binary; per-rank seeds into the one
$2^{29}$-draw cycle, each rank wrapping the full period about twice per
run) and ran six seeds of the best-characterized benchmark against eight
xoshiro256+ runs. Pre-registered signatures: slope-mean bias, ensemble
under-dispersion (recycled streams sharing subsequences), cutoff
anomalies. Result — **null on all three**: means $-3.924\pm0.006$ vs
$-3.928\pm0.008$; variance ratio $F=2.2$ in the predicted direction but
$p=0.4$; cutoff dispersions indistinguishable. In hindsight the null is
physical: draws are dealt round-robin across $\sim10^4$ particles, so a
recycled subsequence lands on different particles at different phases —
diluted beyond visibility in ensemble-averaged observables at
$\pm0.006$ precision.

This is the Ferrenberg–Landau–Wong lesson (PRL **69**, 3382, 1992)
inverted: generator corruption is observable-specific, and *empirical
spot-checks cannot certify a generator — they can only fail to convict
it on the observables you happened to try*. A generator with a proven
exhausted period, frozen bits and a kick ceiling produced
indistinguishable spectra on our headline benchmark. The case for a
sound generator must therefore rest on arithmetic — period, bit
structure, tail reach — certified by construction. That is what the
replacement provides.

## 5. The replacement, and its own fine print

xoshiro256+: period $2^{256}$; double-precision uniforms from the top 53
bits; each MPI rank a provably disjoint stream ($2^{128}$ draws apart via
the jump polynomial); a small standard-Fortran implementation that is
bit-identical under every compiler, making frozen-seed regression tests
portable across the toolchain for the first time. Two cautions now
documented in the code: the *low* bits of the `+` scrambler carry known
linear artifacts, so derived quantities must always go through the
53-bit uniform (never `mod` on raw output); and the unsigned-64-bit
emulation via masked signed arithmetic is load-bearing — "simplifying"
it to plain addition is non-standard on overflow and would silently
break cross-compiler reproducibility. Remaining honest limits: streams
attach to ranks, so results still depend on rank count (a per-particle
counter-based scheme would remove this); Box–Muller itself caps kicks at
$8.57\sigma$ — beyond the reach of any plausible budget; and the
statistics of the *method* (seed scatter $\sigma\!\sim\!0.3$ on steep
spectra at 400 particles) remain the price of Monte Carlo, payable in
compute and replicate discipline regardless of generator.
