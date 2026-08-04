---
layout: ../../layouts/NoteLayout.astro
title: "From the Parker Equation to a Stochastic Solver"
description: "How the Parker transport equation becomes the stochastic differential equations a Monte Carlo SEP code integrates: the Fokker–Planck bridge, the p³/3 measure, the drift term, and the Itô convention."
date: "2026-08-02"
topic: "SEP physics"
---
# From the Parker Equation to a Stochastic Solver

*Part 1 of a three-part series on stochastic SEP transport — Part 2: [Shock Width, Diffusion Length, and What a Grid Must Resolve](/notes/shock-grid-resolution); Part 3: [How Small Must a Timestep Be? The dt Ledger of a Stochastic Transport Solver](/notes/sde-timestep).*

*Notes developed while validating the MITTENS stochastic SEP transport code
against analytic shock-acceleration solutions. This part sets up the
transport model and derives the stochastic differential equations (SDEs)
that a Monte Carlo solver of the Parker equation actually integrates: the
Fokker–Planck bridge, the $p^3/3$ measure trick, the origin and meaning of
the drift term, the Lagrangian field-line form of the operator, and the
Itô convention.*

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
   validity conditions of the equation itself (the validity hierarchy of
   [Part 2 of this series](/notes/shock-grid-resolution)).
2. There is no explicit "shock acceleration term." Diffusive shock
   acceleration (DSA) emerges from the *interplay* of the diffusion term and
   the compression term at a velocity jump.

---

## 2. From the Parker equation to stochastic differential equations

MITTENS solves the Parker equation by the Monte Carlo/SDE method: follow
pseudo-particles whose random trajectories are engineered so that their
density in phase space equals $f$. The engineering rests on a theorem, not an
approximation.

### 2.1 The Fokker–Planck ↔ SDE equivalence

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

### 2.2 The measure trick: work in $P \equiv p^3/3$

$f$ is density per $d^3x\,d^3p$; Monte Carlo particles sample *number*. For
isotropic $f$, $d^3p = 4\pi p^2\,dp$. Choosing $P = p^3/3$ as the momentum
variable makes $dP = p^2\,dp$, so

$$
dN = f\; d^3x \; 4\pi\, dP
$$

— the measure is flat in $(x,P)$ and pseudo-particle density *is* $4\pi f$,
with no Jacobian bookkeeping anywhere. (This is why MITTENS stores particle
momentum as $p^3/3$.)

### 2.3 The derivation in 1-D

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

### 2.4 The intuitive meaning of the drift

The drift $\partial_x\kappa$ is not a force. Random walkers with
position-dependent step size $\sqrt{2\kappa(x)dt}$ spontaneously pile up
where steps are small (they leave slowly); a uniform population would develop
spurious density gradients. Physics requires that uniform $f$ produce zero
flux for *any* $\kappa(x)$. The drift, pointing toward increasing $\kappa$,
exactly cancels the artificial pile-up. It is the price of variable-step
random walking, tuned so the ensemble solves the true diffusion equation.

### 2.5 Lagrangian field-line coordinates and the flux-tube operator

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
and repeating the Section 2.3 manipulation on this operator gives the
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

### 2.6 Derivation: the Parker equation in Lagrangian coordinates, and where $dS$ comes from

Section 2.5 stated the flux-tube operator; here is its derivation from the
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

### 2.7 Itô vs Stratonovich

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

## 3. Summary: the SDE coefficient set

Collecting the results, the complete coefficient set a stochastic Parker
solver implements:

- **Momentum variable** $P = p^3/3$, so that pseudo-particle density *is*
  $4\pi f$ with no Jacobian bookkeeping (Section 2.2).
- **Cartesian 1-D:**
  $dx = (u + \partial_x\kappa)\,dt + \sqrt{2\kappa}\,dW$ and
  $dP = -P\,(\nabla\cdot\mathbf{u})\,dt = P\,(d\ln\rho/dt)\,dt$
  (Section 2.3).
- **Lagrangian field-line labels:** noise $b = \sqrt{2\kappa}/dS$, drift
  $A = \frac{B}{dS}\,\partial_s\big(\frac{\kappa}{B\,dS}\big)$, the same
  compression kick, with walker measure $w = dS/B$ (Sections 2.5–2.6).
- **Calculus:** the full drift pairs with Itô integration
  (Euler–Maruyama, coefficients frozen at the step start); a Stratonovich
  scheme would carry half the drift (Section 2.7).

How small the Euler–Maruyama timestep must be is the subject of
[How Small Must a Timestep Be?](/notes/sde-timestep); what the background
*fields* must resolve for the resulting shock acceleration to be physical
is the subject of
[Shock Width, Diffusion Length, and What a Grid Must Resolve](/notes/shock-grid-resolution).
