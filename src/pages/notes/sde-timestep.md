---
layout: ../../layouts/NoteLayout.astro
title: "How Small Must a Timestep Be? The dt Ledger of a Stochastic Transport Solver"
description: "Every timescale that constrains the timestep of an SDE solver of the Parker equation, what a real code does about each, and the measured cost of getting it wrong."
date: "2026-08-04"
topic: "numerical methods"
---
# How Small Must a Timestep Be? The dt Ledger of a Stochastic Transport Solver

*Part 3 of a three-part series on stochastic SEP transport — Part 1: [From the Parker Equation to a Stochastic Solver](/notes/parker-to-sde); Part 2: [Shock Width, Diffusion Length, and What a Grid Must Resolve](/notes/shock-grid-resolution).*

*Companion working notes to* [From the Parker Equation to a Stochastic
Solver](/notes/parker-to-sde) *and* [Shock Width, Diffusion Length, and
What a Grid Must Resolve](/notes/shock-grid-resolution)*, developed while
profiling and validating the MITTENS stochastic SEP transport code. They
collect the complete list of timescales that constrain the timestep of a
stochastic-differential-equation (SDE) solver of the Parker equation, what a
real code does about each, the measurements that separate timestep error from
other error sources — and the asymmetry that makes such solvers dramatically
cheaper than a fixed global timestep suggests.*

---

## 1. The setting

An SDE solver advances pseudo-particles with the Euler–Maruyama step

$$
x_{n+1} = x_n + a(x_n)\,\Delta t + b(x_n)\,\sqrt{\Delta t}\;\mathcal{N}(0,1),
\qquad
P_{n+1} = P_n\,\big(1 + \dot{(\ln\rho)}\,\Delta t\big),
$$

with drift $a$, noise amplitude $b = \sqrt{2\kappa}/\Delta S$, and the
adiabatic momentum "kick" driven by the local compression rate. All
coefficients are evaluated *at the start of the step* (the Itô convention)
and held frozen while the particle jumps. Every timestep constraint below is
a statement about when that freezing is harmless.

## 2. The ledger: every upper bound theory imposes

**1. Feature resolution.** The step's random displacement
$b\sqrt{\Delta t}$ must be small compared to the scale $\ell$ over which the
coefficients vary, or the particle leaps structures and samples fields it
never traversed:

$$
\Delta t \ll \ell^2 / 2\kappa_{\rm eff}.
$$

At a shock, $\ell$ = the transition width $W$; in smooth backgrounds, the
gradient scale; in uniform plasma, $\infty$ — no constraint at all.

**2. Drift subordination.** Freezing the coefficients is legitimate while
the stochastic displacement dominates the deterministic one:

$$
\Delta t \lesssim 2\kappa_{\rm eff}/a^2 .
$$

**3. Drift feature-crossing.** The deterministic push must not leap a
feature either: $\Delta t \ll W/|a|$.

**4. Kick-rate resolution.** The per-step momentum increment must be small,
$\Delta t \ll 1/|\dot{(\ln\rho)}|$, or the linearized update $1 + x$
systematically under-delivers the true $e^{x}$.

**5. Background time-dependence.** Coefficients are known only per
data-coupling interval; a step must not outlive its inputs:
$\Delta t \le$ the coupling cadence.

**(6. Boundaries.** Near reflecting/absorbing boundaries the step must be
small compared to the distance to the wall, or crossing statistics acquire
$O(\sqrt{\Delta t})$ errors.)*

## 3. The other side of the ledger: there is no lower bound

Every entry above is an upper bound. **There is no $\Delta t \gg$ requirement
for correctness**: Euler–Maruyama converges monotonically as
$\Delta t \to 0$, and in uniform regions the Gaussian step is *exact* at any
size. Three soft floors exist, none of them correctness:

- **The physical-meaning floor**, $\Delta t \sim \lambda/v$ (the scattering
  time): below it each step resolves motion the real particle does not
  perform — sub-scattering-scale trajectories are the diffusion picture's
  own fiction, and individual step "speeds" $b/\sqrt{\Delta t}$ become
  superballistic. This does **not** corrupt the ensemble (it still solves
  the Parker equation exactly); it merely buys accuracy of a fiction.
- **The cost floor**: halving $\Delta t$ doubles the bill, with zero gain
  wherever the upper bounds were not binding.
- **The roundoff floor** (theoretical curiosity): increments below machine
  precision relative to the coordinate silently freeze motion — reachable
  only at $\Delta t$ tens of orders of magnitude below practice.

The rule that follows is clean and asymmetric: **choose the largest
$\Delta t$ satisfying every applicable upper bound at the particle's current
location.** The upper bounds are laws; running below them is charity to the
electricity company.

## 4. What a real code implements

MITTENS computes a per-particle adaptive candidate and then applies two user
knobs:

$$
\Delta t = \min\big(\Delta t_{\rm adaptive}\times\texttt{TimeStepFactor},\;
\texttt{MaxTimeStep}\big),
$$

clipped finally to the coupling-interval boundary (ledger entry 5,
structurally enforced). The adaptive candidate is ledger entry 2 far from
the shock, and the minimum of entries 1–3 (with $\ell = $ the *detected*
shock-zone width) inside it. Scoring the implementation against the ledger:

| # | theory | implementation | verdict |
|---|---|---|---|
| 1 | $\Delta t \ll W^2/2\kappa$ at features | $W^2/b^2$, zone-only | right formula; **no safety factor**, and a **hole in the approach region** (one cell outside the detected zone, the constraint vanishes) |
| 2 | $\Delta t \lesssim 2\kappa/a^2$ | $b^2/a^2$ | correct |
| 3 | $\Delta t \ll W/\lvert a\rvert$ | $W/\lvert a\rvert$, zone-only | same defects as 1 |
| 4 | $\Delta t \ll 1/\lvert\dot{(\ln\rho)}\rvert$ | — | **missing** (satisfied by accident when the global cap is small) |
| 5 | $\Delta t \le$ coupling cadence | hard clamp + time interpolation | correct |
| 6 | boundary-aware step | — | missing; benign while boundaries are far from the action |

Two practical observations complete the picture. First, in conservative
*test* configurations the global cap is set so low that it binds everywhere
— the sophisticated ledger never gets to act, and every particle marches at
one tiny uniform $\Delta t$. Second, the statistical machinery already
permits per-particle variable timesteps: the distribution estimate is an
occupation-time average in which each step deposits weight
$\times\,\Delta t$, so a mixture of long and short steps remains unbiased.
The door to adaptivity was always open.

## 5. Separating timestep error from everything else: measurements

Three experiments on the analytic $r=4$ shock (see
[Shock Width, Diffusion Length, and What a Grid Must Resolve](/notes/shock-grid-resolution)
for the setup) isolate what $\Delta t$ does and does not cause:

1. **A timestep-convergence series** (global cap 0.03 / 0.01 / 0.001 s at
   fixed output time) showed the large spectral bias of an *unresolved*
   (one-cell) shock to be **dt-independent**: refining the timestep tenfold
   moved the fitted slope by only $0.09 \pm 0.09$. Conclusion: that bias is
   field-representation error (ledger entry 1 violated by the *data*, not
   the clock), and no timestep can cure it.

![Timestep-convergence of the shock spectrum](/notes/sde-timestep/figures/convergence_dt.png)

*Shock spectra and fitted slope versus the global timestep cap at fixed
output time, for the one-cell shock: the discretization bias survives
$\Delta t \to 0$ essentially unchanged — the defect is in the represented
fields, not the integration.*

2. **With the shock properly resolved** (smooth, several cells wide), the
   remaining small deficit of the spectrum *is* mostly timestep error: a
   single run at one-third the cap recovered most of it (slope
   $-4.13 \to -4.04$ against the theoretical $-4.00$). The near-shock
   criteria target step $\approx$ zone rather than step $\ll$ zone — the
   missing safety factor of ledger entry 1 — and a factor ~3 supplies it.

3. **The cost anatomy**: with continuous injection, particle count grows
   linearly in time, so runtime grows as $t^2$; and at late times ~97% of
   particles reside in the far-downstream plateau — uniform plasma, ledger
   entry 1 at $\ell = \infty$ — taking steps orders of magnitude below any
   binding bound. Nearly the entire bill is charity.

## 6. The operational consequences

Ordered by effort:

- **Configuration only**: raise the global cap so the adaptive ledger
  (entries 1–3) becomes the binding constraint near the shock while far
  particles step at the coupling cadence; use the global multiplier as the
  missing safety factor (it scales the adaptive candidate, so it tightens
  the shock zone without touching the far regime). Expected order-of-
  magnitude speedups with no code change — subject to one risk: the binary
  far/zone split leaves the *approach region* (the diffusive foot outside
  the detected zone) stepping at the full cap.
- **A graduated distance rule** (small code change): allow
  $\Delta t \le \alpha\, d^2/2\kappa_{\rm eff}$ at distance $d$ from the
  nearest structure — closing the approach-region hole and making the
  far-field ceiling ramp smoothly instead of switching.
- **A kick-rate guard** (one line): ledger entry 4, currently unprotected on
  realistic data.

The deepest lesson generalizes beyond this code: in stochastic transport
solvers the timestep is not a global accuracy dial but a *local contract* —
each particle owes each upper bound only where that bound applies, and
almost everywhere, almost none apply.

## 7. Postscript: the configuration-only experiment

The cheapest option was tested directly: the resolved-shock benchmark run
with the global cap raised, nothing else changed. Three caps, same physics,
same analysis:

| cap [s] | advance time | speedup | slope (40–200 keV) | amplitude vs baseline |
|---|---|---|---|---|
| 0.01 (baseline, 4 seeds) | 5833 s ≈ 1.6 h | 1× | $-4.13 \pm 0.05$ | 1 |
| 0.1 | 646 s ≈ 11 min | ≈ 9× | $-4.35 \pm 0.07$ | 0.88 |
| 1.0 | 109 s | ≈ 53× | $-4.74 \pm 0.11$ | 0.90 |

(Times are the summed per-iteration advance-loop cost from the runlogs,
which excludes I/O; an earlier draft overstated the baseline at 2.5 h and
hence the speedups at 14×/80×.)

The speedup is as large as promised — and the spectrum degrades
monotonically with the cap, already ~3σ outside the replicate band at 0.1 s.
The mechanism is the predicted approach-region hole: the binary far/zone
test leaves particles in the diffusive foot — *outside* the detected shock
zone but *inside* the region where return statistics are decided — stepping
at the full cap, with jumps comparable to the foot itself. Notably, even a
cap giving upstream steps of "only" ~1.4 cells against a 10-cell foot
already costs 0.2 in slope: the cycle statistics are more fragile than a
crude step-versus-foot estimate suggests.

Conclusion, measured rather than argued: **configuration alone cannot buy
the large speedup — the graduated distance rule
$\Delta t \le \alpha\,d^2/2\kappa_{\rm eff}$ is required**, so that the
step length ramps down smoothly on approach and no particle ever jumps a
significant fraction of its distance to the front. The ~50× ceiling
measured here is what that rule stands to reclaim, legitimately.

![Cap-scan summary: fitted slope and spectra versus the global timestep cap](/notes/sde-timestep/figures/param_cap_scan.png)

*The cap scan of the table above. Left: fitted slope versus the cap, with
the baseline replicate band — the speedup annotations (1×, 9×, 53×) ride
down the degradation curve. Right: spectra divided by the analytic $p^{-4}$
reference; the deficit grows with energy, the compound-interest signature.*

![Per-particle timestep versus position from the shock for the three caps](/notes/sde-timestep/figures/dt_profile.png)

*Where the mechanism lives: the timestep each particle actually takes
versus Lagrangian distance from the shock. The adaptive ledger bites only
inside the detected shock zone (gray, $W = 3$); in the upstream foot
(green, $L = 10$) — the region that decides return statistics — the step
already sits at the full cap, giving upstream jumps of 1.4 and 4.5 cells
for the raised caps. The approach-region hole, made visible.*

## 8. Postscript II: the graduated ramp, implemented and measured

The rule Section 6 called for now exists in the code: `#DISTANCETIMESTEP`
enables a distance ramp

$$
\Delta t \;\le\; \alpha\,\frac{d^{2}}{2\kappa_{\rm lagr}},
$$

where $d$ is each particle's Lagrangian distance to the **shock center**
(floored at one cell, and also limited by the distance to either end of
the line), together with a shock-motion guard
$\Delta t \le d/2V_{\rm sh}$ and a compression-rate guard
$\Delta t \le \alpha/|d\ln\rho/d\tau|$. One knob, $\alpha = 0.1$ by
default: a step's diffusive displacement never exceeds
$\sqrt{\alpha} \approx 1/3$ of the gap to the nearest structure. Since
$\kappa$ enters the denominator, the rule is automatically energy-aware:
every energy gets its own parabolic funnel.

![Baseline uniform step versus the adaptive ramp at three energies](/notes/sde-timestep/figures/dt_baseline_vs_adaptive.png)

*The uniform baseline charges everyone the worst-case price (black); the
ramp prices each particle by distance and energy. A 1 MeV particle at the
kick steps 20× finer than the baseline — that is where the accuracy
improvement lives; far away it steps at the coupling cadence — that is
where the speedup lives.*

Two design lessons were paid for on the way:

1. **Anchor at the center, not the detected zone edge.** The first
   implementation trusted the threshold-walk width of the shock zone and
   failed exactly like the no-ramp configuration: on smooth shocks the
   detected zone (compression above threshold) is an order of magnitude
   wider than the kick structure, so the "protected" region started tens
   of cells out. The arg-max of the compression is robust for every
   profile shape; the width is not. Strictness by geometry (a monotone
   function of distance to a robust anchor) degrades gracefully;
   strictness by classification (zone membership) fails categorically
   when the classifier is wrong.
2. **Verify parameter ingestion, not file contents.** One "failure" of
   the scheme was a run whose `#DISTANCETIMESTEP` block had been appended
   after `#END`, where the reader never looks — the run silently executed
   the known-broken uniform-cap configuration and faithfully reproduced
   its fingerprint (both the wall time and the slope). Pre-registered
   expectations caught it within one diagnosis cycle.

Validation, 21 runs across three compression ratios (all slopes are
momentum-space, $t = 1200$ s, 40–200 keV fit):

| configuration | slope | expectation | advance time |
|---|---|---|---|
| $r=4$, adaptive $\alpha=0.1$ (3 seeds) | $-4.036 \pm 0.007$ | dt/3-converged $-4.03$ | 957 s (6.1×) |
| $r=4$, adaptive $\alpha=0.3$ | $-4.122 \pm 0.022$ | baseline $-4.126$ | 334 s (17×) |
| $r=4$, adaptive, cap 0.1 s | $-3.996 \pm 0.021$ | unchanged vs cap 1.0 | 1443 s |
| $r=3$, adaptive (7 seeds) | $-4.695 \pm 0.025$ | uniform-converged $-4.75 \pm 0.05$ | 608 s (11.8×) |
| $r=2$, adaptive (8 seeds) | $-6.140 \pm 0.057$ | theory $-6.0$ − finite-$W$ residual | ~360 s |

The safety factor has a clean dose–response ($\alpha$: 0.1 = converged,
0.3 = baseline-grade at 17×), and the cap probe settles the design
question of Section 6 in the strongest way: with the ramp active, varying
the global cap by 10× changes nothing — the bound ledger is complete, and
the cap reverts to what it should be, a structural backstop at the
coupling cadence. Nothing that changes the answer lives in a hand-set
constant.

One measured subtlety deserves the last word. The adaptive runs book
$\sim$7% less occupation weight below 30 keV than the $\Delta t = 10^{-2}$ s
baseline. Every probe says this offset is *convergence, not loss*: it
tracks the near-shock resolution knob in lockstep with the slope
correction, is untouched by the far-field cap, and the refined uniform
run sits partway between. The under-resolved baseline leaves too many
particles lingering unaccelerated at injection energies; resolving the
kick promotes them out of the band. The lesson mirrors the note's theme:
when a cheaper and a dearer calculation disagree, the disagreement itself
is not evidence of which one is wrong — dose–response along the
resolution axis is.
