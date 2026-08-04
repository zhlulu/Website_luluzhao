---
layout: ../../layouts/NoteLayout.astro
title: "Diffusive Shock Acceleration, the Parker Equation, and Its Limits"
description: "Working notes on the diffusion coefficient, the diffusion length, the SDE formulation of the Parker equation, and the validity criteria for Parker-type SEP models at shocks."
date: "2026-08-02"
topic: "SEP physics"
---
# Diffusive Shock Acceleration, the Parker Equation, and Its Limits: Working Notes
# Diffusive Shock Acceleration, the Parker Equation, and Its Limits: Working Notes

*Notes developed while validating the MITTENS stochastic SEP transport code
against analytic shock-acceleration solutions and real CME-event field-line
data. They collect, in one place, the physical meaning of the diffusion
coefficient and diffusion length, the derivation of the stochastic
differential equations (SDEs) from the Parker transport equation, and the
hierarchy of validity criteria that decide at which particle energies a
Parker-type model can be trusted at a shock.*

---

## 1. The Parker transport equation

Solar energetic particles (SEPs) at the energies of interest scatter on
magnetic turbulence frozen into the solar wind. When the scattering is strong
enough that the particle distribution is nearly isotropic, transport is
described by the Parker equation for the isotropic phase-space density
$f(\mathbf{x}, p, t)$:

$$
\frac{\partial f}{\partial t}
  = \nabla\cdot(\kappa\,\nabla f)
  \;-\; \mathbf{u}\cdot\nabla f
  \;+\; \frac{p}{3}\,(\nabla\cdot\mathbf{u})\,\frac{\partial f}{\partial p}
  \;+\; Q .
$$

The four terms:

| term | physics |
|---|---|
| $\nabla\cdot(\kappa\nabla f)$ | spatial diffusion (random walk from scattering) |
| $-\mathbf{u}\cdot\nabla f$ | advection with the solar wind |
| $\frac{p}{3}(\nabla\cdot\mathbf{u})\,\partial f/\partial p$ | adiabatic momentum change: compression accelerates, expansion cools |
| $Q$ | injection (source) |

Two features deserve emphasis, because everything later turns on them:

1. **The particle speed $v$ does not appear** in the transport operator. It
   enters only through the diffusion coefficient $\kappa(p)$ and through the
   validity conditions of the equation itself (Section 7).
2. There is no explicit "shock acceleration term." Diffusive shock
   acceleration (DSA) emerges from the *interplay* of the diffusion term and
   the compression term at a velocity jump.

---

## 2. What the diffusion coefficient means

A particle moves at speed $v$ in a straight line until turbulence deflects
it — on average after one **mean free path** $\lambda$, i.e. every scattering
time $\tau = \lambda/v$. The trajectory is a random walk of straight segments
with (nearly) random directions.

The master fact of random walks: after $N$ steps the net displacement is not
$N\lambda$ but $\sqrt{N}\,\lambda$ — the steps mostly cancel. Displacement
grows as the square root of time:

$$
\langle x^2\rangle = 2\kappa t,
\qquad
\kappa = \frac{\lambda v}{3},
$$

the $1/3$ coming from averaging over pitch angles in three dimensions.

**Read $\kappa$ [m²/s] as "territory explored per unit time."** It is a
statistical summary of *many* scattering steps and is meaningful only on
scales coarser than one step: distances $\gg \lambda$, times $\gg \tau$.
Within a single step there is no diffusion — there is a particle flying in a
straight line. This fine print becomes load-bearing in Section 7.

The momentum dependence of $\kappa$ comes from both factors:
$v(p)$ trivially, and $\lambda(p)$ through **gyroresonance**: a particle is
deflected mainly by turbulent fluctuations with wavelength comparable to its
gyroradius $r_g \propto p/(qB)$. Higher momentum → larger gyroradius → the
particle resonates with the weaker, larger-scale part of the turbulent
cascade → scattered less, longer stride. For a Kolmogorov spectrum,
quasi-linear theory gives $\lambda \propto p^{1/3}$, hence
$\kappa \propto p^{1/3} v(p)$ — rising steeply with energy.

---

## 3. The diffusion length $L = \kappa/U_1$

### 3.1 Derivation: a random stagger vs a steady conveyor

Work in the shock frame. Upstream plasma — with the turbulence the particle
scatters on — streams *into* the shock at speed $U_1$. The particle is a
passenger on a moving walkway, staggering randomly. How far upstream can a
random stagger beat a steady conveyor?

The two transport modes cover distance differently:

- conveyor (advection): distance $= U_1 t$ — linear in time;
- stagger (diffusion): distance $\simeq \sqrt{2\kappa t}$ — square root.

A worked race with $\kappa = 10$, $U_1 = 1$ (arbitrary units):

| time | diffusion reach $\sqrt{2\kappa t}$ | advection drag $U_1 t$ | winner |
|---|---|---|---|
| 1 | 4.5 | 1 | diffusion |
| 10 | 14 | 10 | diffusion, barely |
| 20 | 20 | 20 | dead heat |
| 100 | 45 | 100 | advection, hopelessly |

The square root starts steep and always loses to the straight line
eventually. Setting $\sqrt{2\kappa t} = U_1 t$ gives the crossover time
$t \sim 2\kappa/U_1^2$ and crossover distance $\sim 2\kappa/U_1$. Up to
order-unity factors,

$$
\boxed{\;L = \frac{\kappa}{U_1}\;}
$$

is the farthest a diffusing particle can typically hold against the flow.
The steady-state balance of diffusive flux against advective flux,
$\kappa\,\partial f/\partial x = U_1 f$, gives the same length as the
e-folding of the upstream particle profile:

$$
f(x) = f_{\rm shock}\, e^{-x/L}.
$$

### 3.2 Four physical readings of $L$

1. **Reach.** $L$ is the typical depth of upstream excursions. Positions
   within $\sim L$ of the front are visited routinely; a few $L$ out, only by
   exponentially rare lucky streaks. Note carefully: for a planar shock,
   *return to the shock from any upstream distance is guaranteed* — the flow
   always wins eventually. $L$ marks a **reach**, not a point of no return.
   The genuine "no return" lives on the *downstream* side, where each
   excursion carries a small probability ($\sim 4U_2/v$ per cycle) of being
   advected away for good — that is the escape channel that terminates
   acceleration.
2. **The measurable halo.** The exponential foot $e^{-x/L}$ is the standing
   "atmosphere" of energetic particles the shock pushes ahead of itself.
   Spacecraft crossing interplanetary shocks record it directly as the
   upstream intensity ramp of energetic storm particle (ESP) events — and
   the measured e-folding, multiplied by $U_1$, is a standard *in situ
   measurement of $\kappa$*.
3. **The engine room.** Acceleration happens only where particles remain
   coupled to the front — within $\sim L$ upstream and $\sim\kappa/U_2$
   downstream. The upstream residence per Fermi cycle, $L/U_1 = \kappa/U_1^2$,
   dominates the acceleration timescale $t_{\rm acc}\sim \kappa/U_1^2$.
4. **The perception pixel.** A diffusing particle cannot respond to flow
   structure finer than its own excursion range: it experiences the velocity
   field *smoothed over $L$*. This single sentence contains the entire
   shock-width criterion of Section 6.

Finally, the composition to remember:

$$
L = \lambda \cdot \frac{v}{3U_1}
$$

— the leash equals *one stride times the number of strides the particle can
afford before the flow reclaims it*. The dimensionless ratio $v/3U_1$ will
reappear as the master validity parameter.

---

## 4. From the Parker equation to stochastic differential equations

MITTENS solves the Parker equation by the Monte Carlo/SDE method: follow
pseudo-particles whose random trajectories are engineered so that their
density in phase space equals $f$. The engineering rests on a theorem, not an
approximation.

### 4.1 The Fokker–Planck ↔ SDE equivalence

For any PDE in forward-Kolmogorov (Fokker–Planck) form

$$
\frac{\partial \rho}{\partial t}
 = -\frac{\partial}{\partial x}\big[A(x)\,\rho\big]
   + \frac{\partial^2}{\partial x^2}\big[B(x)\,\rho\big],
$$

the density of walkers obeying the Itô SDE

$$
dx = A\,dt + \sqrt{2B}\;dW
$$

is exactly $\rho$. So the task is to massage the Parker equation into that
divergence form and read off $A$ (drift) and $B$ (noise) by inspection.

### 4.2 The measure trick: work in $P \equiv p^3/3$

$f$ is density per $d^3x\,d^3p$; Monte Carlo particles sample *number*. For
isotropic $f$, $d^3p = 4\pi p^2\,dp$. Choosing $P = p^3/3$ as the momentum
variable makes $dP = p^2\,dp$, so

$$
dN = f\; d^3x \; 4\pi\, dP
$$

— the measure is flat in $(x,P)$ and pseudo-particle density *is* $4\pi f$,
with no Jacobian bookkeeping anywhere. (This is why MITTENS stores particle
momentum as $p^3/3$.)

### 4.3 The derivation in 1-D

Start from

$$
\frac{\partial f}{\partial t} + u\frac{\partial f}{\partial x}
 = \frac{\partial}{\partial x}\Big(\kappa\frac{\partial f}{\partial x}\Big)
 + \frac{p}{3}\frac{\partial u}{\partial x}\frac{\partial f}{\partial p}
$$

and rewrite each term as a divergence, collecting leftovers:

- diffusion:
  $\partial_x(\kappa\,\partial_x f)
   = \partial_x^2(\kappa f) - \partial_x[(\partial_x\kappa) f]$.
  Moving $\kappa$ inside the second derivative — required by the FP form —
  costs a first-derivative term: **this identity is what creates the drift**.
- advection:
  $-u\,\partial_x f = -\partial_x(u f) + f\,\partial_x u$.
- momentum term, using $p\,\partial_p = 3P\,\partial_P$:
  $(\partial_x u) P\,\partial_P f
   = \partial_P[(\partial_x u) P f] - (\partial_x u) f$.

The two non-divergence leftovers, $+f\,\partial_x u$ and
$-f\,\partial_x u$, **cancel exactly** — compression simultaneously does work
on particles and concentrates them in space, and only the combination is
conservative. What remains is pure Fokker–Planck:

$$
\frac{\partial f}{\partial t}
 = -\partial_x\big[(u + \partial_x\kappa) f\big]
   -\partial_P\big[(-P\,\nabla\cdot u)\, f\big]
   +\partial_x^2\big[\kappa f\big],
$$

from which the SDE follows by inspection:

$$
dx = \big(u + \partial_x \kappa\big)\,dt + \sqrt{2\kappa}\; dW,
\qquad
dP = -P\,(\nabla\cdot u)\,dt .
$$

By mass conservation along the flow, $-\nabla\cdot u = d\ln\rho/dt$, so the
momentum equation reads $dP = P\,(d\ln\rho/dt)\,dt$: **where plasma is
compressed, every particle's momentum rises**, at the same logarithmic rate
regardless of energy. There is no separate "shock acceleration" update —
first-order Fermi acceleration emerges from diffusion plus this localized
compression kick, applied over many stochastic re-crossings.

The vocabulary that results:

| name | SDE piece | Parker origin | character |
|---|---|---|---|
| noise / diffusion | $\sqrt{2\kappa}\,dW$ | $\kappa$ moved inside $\partial_x^2$ | random |
| drift | $(\partial_x\kappa)\,dt$ | integration-by-parts remainder | deterministic |
| advection | $u\,dt$ | $-u\partial_x f$ | deterministic (exact) |
| kick | $P\,(d\ln\rho/dt)\,dt$ | adiabatic term in $P$ | deterministic |

### 4.4 The intuitive meaning of the drift

The drift $\partial_x\kappa$ is not a force. Random walkers with
position-dependent step size $\sqrt{2\kappa(x)dt}$ spontaneously pile up
where steps are small (they leave slowly); a uniform population would develop
spurious density gradients. Physics requires that uniform $f$ produce zero
flux for *any* $\kappa(x)$. The drift, pointing toward increasing $\kappa$,
exactly cancels the artificial pile-up. It is the price of variable-step
random walking, tuned so the ensemble solves the true diffusion equation.

### 4.5 Lagrangian field-line coordinates and the flux-tube operator

Field-line SEP models use a coordinate $s$ that *rides with the plasma*
(Lagrangian labels). Advection then costs nothing — a particle at rest in
these coordinates is already carried by the wind — and cannot be discretized
wrongly. The payment appears in the metric. Diffusion along a magnetic flux
tube of cross-section $\mathcal{A}\propto 1/B$, with physical length per
label $dS$, obeys

$$
\frac{\partial f}{\partial t}
 = \frac{B}{dS}\,\frac{\partial}{\partial s}
   \Big[\frac{\kappa}{B\,dS}\,\frac{\partial f}{\partial s}\Big].
$$

Anatomy: one factor $1/dS$ per spatial derivative (label ↔ length
conversion); $1/B$ inside is the tube cross-section weighting the flux;
$B$ outside converts flux difference back to concentration change. The
walker density per label is $F = f\,dS/B$ (content of one Lagrangian cell),
and repeating the Section 4.3 manipulation on this operator gives the
field-line SDE coefficients used in practice:

$$
\text{noise } \frac{\sqrt{2\kappa}}{dS}, \qquad
\text{drift } \frac{B}{dS}\,\frac{\partial}{\partial s}
   \Big(\frac{\kappa}{B\,dS}\Big).
$$

A crucial consequence: even with **physically constant** $\kappa$, the
label-space diffusivity $\kappa/dS^2$ jumps across a shock, because
compression permanently shrinks $dS$ (by the compression ratio $r$). The
coordinate system records the shock in its metric, and the drift term —
zero in uniform regions — becomes a large, shock-localized quantity. The
elegance of exact advection is paid for by concentrating all the numerical
difficulty of the discontinuity into the diffusion bookkeeping.

### 4.6 Derivation: the Parker equation in Lagrangian coordinates, and where $dS$ comes from

Section 4.5 stated the flux-tube operator; here is its derivation from the
Parker equation, assumption by assumption.

**Setup.** Field-aligned diffusion (gyrotropy makes $\kappa$ a parallel
scalar) and ideal MHD (frozen-in field, so plasma parcels on a line remain
on it). Along one line, with $x$ the arc length and $A(x,t)$ the
cross-section of an elementary flux tube, the exact tube form of the
parallel-diffusion divergence is
$\nabla\cdot(\hat{\mathbf b}F_\parallel) = \tfrac{1}{A}\partial_x(A F_\parallel)$
— particle number in a slab is $fA\,dx$, flux through a face is
$A\kappa\,\partial_x f$, conservation does the rest. Magnetic flux
conservation, $BA=\mathrm{const}$, eliminates the geometry: $A\propto 1/B$:

$$
\frac{\partial f}{\partial t} + u\frac{\partial f}{\partial x}
= B\frac{\partial}{\partial x}\Big(\frac{\kappa}{B}\frac{\partial f}{\partial x}\Big)
+ \frac{p}{3}(\nabla\cdot\mathbf{u})\frac{\partial f}{\partial p}.
$$

**Lagrangian labels.** Attach the label $s$ to plasma parcels:
$x = X(s,t)$ with $\partial X/\partial t|_s = u$, and define

$$
dS(s,t) \equiv \frac{\partial X}{\partial s}
$$

— **$dS$ is the Jacobian of the label-to-position map**, physical length
per unit label. Two chain-rule identities follow: for any $g$,

$$
\frac{\partial g}{\partial t}\Big|_{s}
= \frac{\partial g}{\partial t}\Big|_{x} + u\,\frac{\partial g}{\partial x},
\qquad
\frac{\partial}{\partial x} = \frac{1}{dS}\frac{\partial}{\partial s}.
$$

The first collapses the entire advective derivative into $\partial_t f|_s$
— advection absorbed exactly, the founding advantage of the frame. The
second is applied *once per spatial derivative* in the diffusion operator —
this is the "divided by $dS$", used twice:

$$
\frac{\partial f}{\partial t}\Big|_{s}
= \frac{B}{dS}\frac{\partial}{\partial s}
\Big(\frac{\kappa}{B\,dS}\frac{\partial f}{\partial s}\Big)
+ \frac{p}{3}(\nabla\cdot\mathbf{u})\frac{\partial f}{\partial p}.
$$

The inner $1/dS$ converts the gradient; the outer $B/dS$ converts the
tube divergence $\tfrac1A\partial_x(A\,\cdot)$ with $A \propto 1/B$. Both
factors are chain rule, not modelling choices.

**Continuity closes the system.** Mass conservation along the parcel,
$D\rho/Dt = -\rho\nabla\cdot\mathbf u$, reads
$\nabla\cdot\mathbf{u} = -\,\partial_t \ln\rho\,|_s$, turning the adiabatic
term into the compression kick. Applied to the mass of one label cell,
$m = \rho A\,dS \propto \rho\,dS/B = \mathrm{const}$, it also gives

$$
\frac{\partial}{\partial t}\ln\!\Big(\frac{dS}{B}\Big)\Big|_s
= -\,\frac{\partial \ln\rho}{\partial t}\Big|_s
$$

— the metric's evolution is locked to the kick: the same compression that
accelerates particles shrinks $dS$, which is precisely how a velocity jump
gets recorded as a diffusivity jump inside the operator.

**From operator to SDE coefficients.** The operator is a weighted
diffusion, $\partial_t f = \tfrac1w\partial_s(wD\,\partial_s f)$, with
weight $w = dS/B$ and label diffusivity $D = \kappa/dS^2$. Walkers sample
number per label, $n = wf$; substituting $f = n/w$ (with $w$ frozen during
a step — its slow evolution is continuity's business, above):

$$
\frac{\partial n}{\partial t}
= \frac{\partial^2}{\partial s^2}\big(Dn\big)
- \frac{\partial}{\partial s}\Big(n\;\frac{1}{w}\frac{\partial (wD)}{\partial s}\Big),
$$

which is forward-Kolmogorov form, so by inspection

$$
b = \frac{\sqrt{2\kappa}}{dS},
\qquad
A = \frac{B}{dS}\,\frac{\partial}{\partial s}\Big(\frac{\kappa}{B\,dS}\Big)
$$

— exactly the noise and drift coefficients a field-line SDE code must (and,
in MITTENS, does) implement, with $\partial_s$ realized as a one-label
finite difference. Every $dS$ in the implementation is accounted for by
this derivation: one Jacobian per spatial derivative, plus the walker
measure $w = dS/B$.

### 4.7 Itô vs Stratonovich

The same physical equation corresponds to different SDE coefficient sets
depending on the stochastic calculus: with the **full** drift
$\partial_x\kappa$ the SDE must be integrated in the Itô sense (coefficients
evaluated at the step start — the Euler–Maruyama scheme); a Stratonovich
formulation would carry only half the drift, the other half generated by
midpoint evaluation. The two must be paired consistently; mixing them solves
a different equation. Itô + full drift is the standard choice in cosmic-ray
SDE codes because it maps one-to-one onto the forward Fokker–Planck with no
hidden terms.

---

## 5. DSA from the particle's point of view

Fermi's picture: a ball bouncing between two **converging walls** gains
energy each round trip. In DSA the walls are not the shock — they are the
*scattering plasmas on either side*, converging at $\Delta u = U_1 - U_2$
because the flow decelerates across the front. Crossing the front is free;
the energy business is done by the walls, i.e. by the regions where the
particle actually rallies and turns around: within $\sim L_1 = \kappa/U_1$
upstream and $\sim L_2 = \kappa/U_2$ downstream.

Per full cycle the mean fractional momentum gain is
$\Delta p/p \simeq \tfrac{4}{3}\,\Delta u/v$, and per downstream excursion
the particle risks permanent advection away (probability $\sim 4U_2/v$).
The competition of steady gains against occasional permanent losses yields
the celebrated power law: for compression ratio $r = U_1/U_2$,

$$
f(p) \propto p^{-q},
\qquad
q = \frac{3r}{r-1}
\;\;\xrightarrow{\;r=4\;}\; 4 .
$$

The slope depends **only** on $r$ — not on $\kappa$. The diffusion
coefficient instead sets the *pace*: the acceleration time
$t_{\rm acc} \sim (3r/(r-1))\,(\kappa_1/U_1^2 + \kappa_2/U_2^2)$-type
combinations, i.e. the time for the power law to extend to a given momentum.
A time-dependent spectrum is the steady power law up to a momentum cutoff
that advances as $t_{\rm acc}(p) = t$, with a rollover above.

---

## 6. The shock-width criterion: why $W \ll L$

Real (and especially simulated) shocks have finite width $W$. When does a
particle experience the transition as a *shock* rather than as a gentle
compression?

### 6.1 The converging-walls argument

The walls' effective speeds are the flow speeds **in the rally regions** —
within $\sim L$ of the front. Overlay the transition width:

- $W \ll L$: the rally zones lie *outside* the ramp, in genuinely
  full-speed plasma on each side. Walls converge at the full $\Delta u$;
  full Fermi gain per cycle.
- $W \gg L$: the entire rally zone fits *inside* the ramp. Over the $\pm L$
  the particle explores, the flow changes by only
  $\sim \Delta u \,(L/W)$ — the walls have nearly stopped converging *as far
  as this particle can tell*. Per-cycle gain collapses by the same factor.

### 6.2 The ratchet argument

Equivalently: the power-law tail requires *compounding* — re-crossing the
same velocity jump many times. The probability of diffusing across the whole
transition against the flow is the stagger-vs-conveyor race over distance
$W$: $P \sim e^{-W/L}$. For $W\ll L$ re-crossings are cheap and many
(multiplicative gains, power law). For $W \gg L$ a full traversal is
exponentially rare: the particle is conveyed through the ramp once, gaining
exactly the single adiabatic increment $\Delta\ln p = \tfrac{1}{3}\ln r$ —
every particle gets it once, nobody compounds, no tail. **The same structure
with the same total compression is a Fermi engine or a mere squeeze,
depending on $W/L$.**

### 6.3 The shock as an energy filter

Since $L(p) = \kappa(p)/U_1$ grows steeply with momentum while $W$ is fixed,
one smeared front is simultaneously a razor-sharp shock to high-energy
particles ($L \gg W$) and an adiabatic squeeze to low-energy ones
($L \lesssim W$). A broadened shock is a **high-pass filter for
acceleration** — and because DSA is a ladder in which high energies are fed
from below, strangling the low-energy rungs starves the entire spectrum.

---

## 7. The validity hierarchy: $\lambda$, $W$, $L$ and the parameter $v/3U_1$

### 7.1 The Parker validity criterion

The Parker equation is the leading term of an expansion in the distribution's
anisotropy, with expansion parameter $\xi \sim U/v$. Validity requires
$v \gg U$ (plus $\lambda \ll$ background gradient scales). At a shock, the
tightest transport-generated scale is the foot $L$, and demanding that the
foot contain at least one scattering stride,

$$
\lambda \lesssim L
\quad\Longleftrightarrow\quad
v \gtrsim 3U_1
\qquad\big(\text{since } L/\lambda = v/3U_1\big),
$$

reduces exactly to the fundamental criterion. Three seemingly different
conditions are one condition in three costumes:

- anisotropy small ($\xi \ll 1$);
- particles can outrun the shock ($v \gg U_1$);
- the diffusive foot is many strides wide ($\lambda \ll L$).

The step-counting version makes the failure visceral: the number of
scatterings during one upstream residence is $\sim v^2/3U_1^2$; the foot is
$L/\lambda = v/3U_1$ strides wide. If $v \lesssim 3U_1$ the Parker equation
predicts a "diffusive" structure *smaller than one step of the walk that is
supposed to build it* — a staircase feature smaller than one stair. The
statistics have no population behind them.

What actually happens to such particles: the shock ballistically overruns
them (for $v < U_1$ they cannot re-cross upstream even once — one kick,
then swept downstream forever). Any Parker-type solver will nonetheless
predict repeated crossings and a power law, because the parabolic diffusion
operator has infinite signal speed: its "particles" always return. In this
regime the prediction is not degraded — it is fabricated by the
approximation. No shock-representation choice (width, sharpness, grid) can
repair it; only resolving pitch angle (focused transport) or kinetic
treatments move the boundary.

### 7.2 The regimes of shock crossing

The single-particle intuition "only $\lambda > W$ matters" (last scattering
upstream and first scattering downstream both in full-speed plasma → full
per-crossing gain) is correct — *where it applies*. Order the three lengths
(assuming validity, $\lambda \ll L$):

| ordering | crossing mode | outcome |
|---|---|---|
| $W < \lambda \ll L$ | single ballistic flight | full gain per crossing (classic DSA; real shocks live here) |
| $\lambda < W \ll L$ | diffusive traversal, cheap ($e^{-W/L}\approx 1$) | full $\Delta u$ accumulated per traversal; compounding intact |
| $\lambda \ll L \lesssim W$ | full traversal exponentially rare | adiabatic squeeze; no tail |

Note that under validity, $\lambda > W \Rightarrow W \ll L$ automatically —
the single-flight criterion is the *stronger* condition and never conflicts
with the $L$-criterion. The $L$-criterion takes over precisely when
$W > \lambda$, where "crossing" becomes a random walk and its cost is priced
by $W/L$. Outside validity the implication fails (one can have
$\lambda > W > L$), but there neither criterion computes anything
trustworthy.

### 7.3 The complete per-energy decision procedure

For each particle energy at a given shock:

1. **Validity:** $v \gg 3U_1$? If not (e.g. $\sim 10$ keV protons vs a
   $\sim 1600$ km/s shock: $v/3U_1 \approx 0.3$) → stop; Parker-class
   results at this energy are parameterization, not physics. Remedy lives in
   the model class (focused transport), not in any width or resolution knob.
2. **Thin shock:** $W < \lambda$? → full acceleration, guaranteed.
3. **Diffusively thin:** $\lambda \le W \ll L$ (factor $\gtrsim 3\text{–}5$)?
   → still full acceleration.
4. **Otherwise** ($W \gtrsim L$) → adiabatic squeeze; the *fields* must be
   fixed (sharpening, refinement, or an analytic sub-grid shock), no solver
   setting helps.

For SDE solvers specifically, a numerical companion condition rides along:
the represented width must also satisfy $W \ge N_{\min}\,\Delta x$ (several
grid cells) or the discretized fields at the front are mis-sampled by the
stochastic trajectories — Section 8 gives a concrete account of the failure
modes and the experiment that measured them. Grid-based (finite-volume) solvers of the same
equation do not share this particular wall — they integrate coefficients
conservatively rather than sampling them pathwise — though they have their
own resolution requirement (the foot $L$ must span several cells) with a
characteristically opposite failure signature.

### 7.4 A worked real-event example

Measured on a field line of the 2013-04-11 CME event (shock at
$R \approx 8\,R_\odot$, $U_1 \approx 1600$ km/s along the line, extraction
grid $\Delta x \approx 0.015\,R_\odot$, $\kappa$ from a quasi-linear model
driven by the simulated wave turbulence):

| E | $v/3U_1$ | $\lambda$ [$R_\odot$] | $L$ [$R_\odot$] | $L/\Delta x$ [cells] | verdict |
|---|---|---|---|---|---|
| 10 keV | 0.29 | 0.052 | 0.015 | ~1 | invalid (gate 1) |
| 100 keV | 0.91 | 0.076 | 0.069 | ~5 | marginal validity; window effectively closed |
| 1 MeV | 2.9 | 0.11 | 0.32 | ~22 | valid; needs $W \lesssim$ few cells |
| 100 MeV | 27 | 0.24 | 6.5 | ~450 | comfortably valid and open |

The delivered (MHD-smeared) shock width on the same line was 24–47 cells —
wider than $L$ for everything below $\sim$10 MeV — while sharpening it to
$\sim$2 cells trades the physical suppression for the SDE's numerical wall.
This two-sided squeeze, energy by energy, is the quantitative anatomy of the
generic experience that coupled MHD–SEP models "under-accelerate" at low
energies unless the shock is treated as an analytic sub-grid object.

Note the diffusion-model dependence: an alternative empirical
$\kappa(R, E)$ (PSP-based) is a factor $\sim$3–4 larger at these radii,
which moves the window-opening energy by roughly a decade. The admission
verdict is a statement about a *configured model*, and inherits the
astrophysical uncertainty of $\kappa$ — the perennial unknown of SEP
physics, here surfacing as a numerical-admissibility criterion.

---

## 8. When the solver meets a one-cell shock: a board-game account

The criteria above say the *fields* must present a resolvable shock. This
section explains, with no machinery beyond a board game, why an SDE solver
handed a one-cell discontinuity produces a systematically wrong spectrum —
and shows the experiment that measured the effect.

### 8.1 The game

Picture the Lagrangian grid as a row of squares and the pseudo-particle as a
token hopping randomly along it — about two squares per hop, a hundred hops
per second. Energy is earned in exactly one way: **one square "glows" for one
second** (the cell being compressed as the shock passes it), and the token
collects pay for every moment it stands on the glowing square. Then the glow
moves one square forward. Full fair pay per glow encounter is
$\tfrac{1}{3}\ln r \approx 0.46$ units of log-momentum for $r = 4$. That is
the entire acceleration mechanism: *stand on the glowing square while it
glows*. Three defects of how the discretized code runs this game:

### 8.2 Defect 1: the pay lookup averages across the shock's edge

The code stores the pay rate only at square corners and, for a token at an
in-between position, **averages the two neighbours by distance** (linear
interpolation). Physically the squeeze has a sharp boundary — plasma just
inside the transition compresses at the full rate, plasma just outside not at
all. The averaged lookup pays both sides a blend:

| token position | true pay | interpolated pay | error |
|---|---|---|---|
| just outside the compressing cell | 0 | ≈ half rate | overpaid |
| just inside the compressing cell | full rate | ≈ half rate | underpaid |

The total budget is preserved, so the mispayments would cancel *if* equal
numbers of tokens stood on both sides behaving identically — but the two
sides of a shock are the least symmetric place in the problem (different
crowd sizes, hop lengths, pushes), so they do not cancel. Distance-averaging
is a fine lookup for smoothly varying quantities and a money-leaking one for
a quantity with a sharp edge. (For a genuinely smooth several-cell squeeze,
the truth really does vary gradually between corners, and the same lookup
reproduces it exactly.)

### 8.3 Defect 2: the token flies over the square

Hops are ~2 squares long; the glow is ~1 square wide; and pay is evaluated
**where the token stands when a hop begins** — never for squares flown over.
A token at square 6 hopping to square 8 crossed the glowing square 7 and
collected nothing, though a real particle drifting through would have been
paid for the passage. With a one-square glow this happens constantly; a
five-square glow cannot be flown over.

### 8.4 Defect 3: a rigged shove at the pay square

Random hopping with **unequal hop sizes** needs a correction. Imagine two
rooms: in the left one everybody's steps are one inch, in the right one ten
inches. Random stepping then piles the crowd into the small-step room — easy
to enter with one big stride, slow to leave by tiny ones — with no force
involved. Physics forbids this (uniform gas must stay uniform), so every
variable-step random-walk code adds a corrective escort push, sized by *how
fast the step length changes per unit distance*. Across the shock the
Lagrangian step length changes 16-fold within about one square: the correct
escort is razor-thin, strong, and exactly at the boundary. Built from grid
values one square apart — and one-sidedly — it comes out blunt, smeared over
a square, and displaced by about half a square. It stands precisely on the
pay square, hustling tokens across the glow faster than physics allows.
(This "escort" is the drift term of Section 4.4; the two-room pile-up is the
same artifact the Itô drift exists to cancel.)

### 8.5 Small underpayment, ruined spectrum: compound interest

Together the defects trim each encounter's pay from 0.46 to roughly 0.35 —
about 25% light. Why does that *ruin* the spectrum rather than dent it?
Because DSA is compound interest: reaching high energy takes hundreds of
encounters multiplied together. Two banks after one hundred rounds:

$$
1.10^{100} \approx 14{,}000
\qquad\text{vs}\qquad
1.075^{100} \approx 1{,}400 .
$$

A quarter less per round leaves you ten times poorer at the end — and "fewer
particles at every energy, worse the higher you go" *is* a steeper slope.
The measured effect for a one-cell $r=4$ shock: slope $-4.60 \pm 0.05$
instead of $-4.0$, i.e. the solver behaves like an $r \approx 2.9$ shock.

### 8.6 Why "widen the shock" is a repair, not a cheat

An objection: interpolation already smears the one-cell glow over two cells —
how is that different from widening the shock in the data, and doesn't
widening weaken the shock anyway? The difference is **consistency**.
Interpolating a step smooths only the *pay lookup*, while the metric (cell
sizes), the hop amplitudes, the escort push and the actual parcel-compression
histories all remain a step — four fields telling contradictory stories (a
chimera). Widening the shock in the data makes all four tell the same smooth
story, which the code's machinery then represents *exactly*.

And widening does not weaken the shock, for two reasons: the *total*
compression per parcel is unchanged (every parcel still ends up compressed by
the full factor $r$; only the sharpness of delivery changes), and particles
cannot perceive sharpness below their own leash — their view of the flow is
blurred over $L$. A one-cell and a five-cell shock are both far inside one
"pixel" of that blur. Hence a **free-lunch window**:

$$
\text{few cells} \;\lesssim\; W \;\ll\; L
$$

— below it the numerics misrepresents a shock the physics could handle;
above it the physics genuinely softens (Section 6); inside it, widening costs
the spectrum a few percent and buys the numerics everything.

### 8.7 The experiment: a width scan

All of the above was tested directly: otherwise-identical MITTENS runs of the
$r=4$, constant-$\kappa$ analytic shock, differing only in the width and
smoothness of the transition ($L = 10$–$40$ cells throughout, so every case
sits far from the physical wall except the widest).

![Fitted spectral slope versus measured shock transition width](/notes/parker-sde-shock/figures/width_scan.png)

*Fitted slope (40–200 keV, $t = 1200$ s) versus measured transition width,
with four independent random-seed realizations per filled point (error bars
are standard errors of the mean). The discontinuous one-cell jump (red) sits
at $-4.60 \pm 0.05$; every smooth profile recovers to a flat plateau at
$-4.13 \pm 0.02$ from two cells upward — smoothness, not width, is the
requirement. The green diamond is the same 3-cell case run at one-third the
timestep: it moves to $-4.04$, indicating that most of the small remaining
deficit of the smooth cases is ordinary timestep error (the fly-over defect),
leaving the truly width/smoothness-induced part within the predicted
finite-width band (green). Open gray circles are single-seed runs; the 7–8
cell point's mild steepening — width approaching $L$ — is consistent with
the physical suppression of Section 6 switching on. A single-seed
compression-ratio generalization ($r = 3$, theory $-4.50$) measured
$-4.60 \pm 0.09$: the solver reproduces the $r$-dependence of the DSA
slope (measured $r=4 \to r=3$ shift $0.47 \pm 0.10$ vs the theoretical
$0.50$).*

![Shock spectra for all widths with the analytic reference](/notes/parker-sde-shock/figures/width_spectra.png)

*Left: spectra at $t=1200$ s for all widths against the analytic $p^{-4}$
reference. Right: ratio to the reference. The discontinuous run's deficit is
progressive in energy — the compound-interest signature made visible — while
all smooth profiles track the reference until the shared finite-time cutoff
region.*

Three conclusions with practical force. First, *profile smoothness is the
requirement, not width*: a smooth two-cell ramp already recovers the full
plateau, because Defects 1 and 3 are about representability, not size.
Second, the small residual deficit of the smooth cases decomposes cleanly:
mostly ordinary timestep error (removable by dt refinement — the green
diamond), with the remainder inside the expected finite-width correction.
Third, the smooth plateau plus the free-lunch condition $W \ll L$
reproduces, from measurement, exactly the admission window of Section 7 — and
condemns any "sharpening" scheme that condenses real smeared shocks to a
one-cell discontinuity: it lands the solver on the red point of the figure.

---

## 9. What focused transport changes — and what it does not

Focused transport retains the pitch-angle cosine $\mu$ as a dynamical
variable: $f(x, \mu, p, t)$ with explicit streaming $\mu v$, magnetic
focusing, pitch-angle scattering $D_{\mu\mu}$, and $\mu$-resolved
convection/deceleration. It assumes only gyrotropy — not isotropy — and
contains the Parker equation as its strong-scattering, $v \gg U$ limit.

What it fixes at low energies:

1. **Finite signal speed** — whether a particle can outrun the shock is
   answered kinematically per particle ($\mu v > U_1$), not assumed;
2. **Shock encounters become kinematics** — reflection, transmission and
   per-encounter gain follow from $(\mu, v)$; anisotropic injection and
   beamed escape emerge;
3. **Order-unity anisotropy** — onset timing, velocity dispersion, and the
   beam-like early phases of SEP events become describable.

What it does not fix: the true injection problem (how thermal ions become
seeds involves gyro-phase-scale shock structure — hybrid/PIC territory), and
the representation of the shock in the background fields, which is a data
problem independent of the transport equation. The practical role of focused
transport is to convert the *irreducible* Parker-validity wall into ordinary
(if costly, roughly one extra dimension) engineering, moving the trust floor
from $v \sim 3U_1$ down toward the gyro-averaging scale.

---

## 10. Summary: the quantities and the checklist

**The three lengths.**

| symbol | name | formula | meaning |
|---|---|---|---|
| $\lambda$ | mean free path | $3\kappa/v$ | one stride of the random walk |
| $W$ | shock width | (property of fields) | extent of the velocity transition |
| $L$ | diffusion length | $\kappa/U_1$ | reach/halo/engine-room/pixel of the particle at the shock |

**The master ratio.** $L/\lambda = v/3U_1$: simultaneously the Parker
validity parameter, the number of strides across the foot, and the
outrun-the-shock margin.

**The checklist** (per energy, at a given shock):

1. $v \gg 3U_1$ — else Parker-class output at this energy is
   parameterization (remedy: focused transport);
2. $W < \lambda$ — full acceleration (classic thin shock); else
3. $W \ll L$ — full acceleration (diffusively thin); else
4. $W \gtrsim L$ — adiabatic squeeze (remedy: fix the fields —
   sharpen/refine/sub-grid interface);
- and for SDE solvers: $W \ge N_{\min}\Delta x$, or the front must be
   handled as an analytic interface rather than through resolved fields.

The single most useful sentence to retain: **the diffusion length
$L = \kappa/U_1$ is how far a random stagger can beat a steady conveyor —
and therefore the size of everything a diffusing particle can know about,
build, or respond to around a shock.**
