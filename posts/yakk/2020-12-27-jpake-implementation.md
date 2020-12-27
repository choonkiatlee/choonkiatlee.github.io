---
layout: post
title: "JPake Implementation"
tags: [Yakk]
toc: true
icon: /img/cats/algo.svg
keywords: JPake Yakk pake cryptography encription elliptical modular discrete log
---

# The Yakk JPake Implementation

## PAKE

![password_strength_xkcd](https://imgs.xkcd.com/comics/password_strength.png)

It's a well-known fact -- strong passwords are better! (up until you can't remember them that is). 

When creating YAKK, I wanted a way of allowing 2 users to share a signalling connection, but without mandating that they use a large secure key to encrypt the connection information. In addition, I was adamant that the controller of the communication channel between these 2 users cannot evesdrop on the messages sent without knowing the shared password, and is not able to brute-force guess the password. (TLDR: see it in action [here](/jpake-calculator/))

Enter [Password Authenticated Key Exchange (PAKE)](https://en.wikipedia.org/wiki/Password-authenticated_key_agreement). 

PAKE allows our 2 parties, Alice and Bob, to establish a shared cryptographic key using a weak shared secret (like a simple password), without needing to trust the communication channel used to establish the shared key.

## JPake using modular arithmetic

J-PAKE (Password Authenticated Key Exchange by Juggling) is one such PAKE protocol, proposed by [Hao and Ryan](https://eprint.iacr.org/2010/190.pdf).

It consists of 2 stages: 
- one-time key establishment
- key confirmation

A quick summary of the protocol can be written as follows. 

### Round 0

First, both Alice and Bob separately derive secret value $s$ from a shared low-entropy password $s'$.

In our implementation, this is done as $s = H(asBase64String(s')) \text{ mod } q$. This is because $s$ has to be in the range $[1,q-1]$. Alice and Bob also both check that $s$ is not equal to zero

| Alice                                 | Bob                                   |
| ------------------------------------- | ------------------------------------- |
| Select $x_1$ uniformly from $[0,q-1]$ | Select $x_3$ uniformly from $[0,q-1]$ |
| Select $x_2$ uniformly from $[0,q-1]$ | Select $x_4$ uniformly from $[0,q-1]$ |


### Round 1

| Alice -> Bob                   | Bob -> Alice                   |
| ------------------------------ | ------------------------------ |
| $xG1 = g^{x_1} \text{ mod } p$ | $xG3 = g^{x_3} \text{ mod } p$ |
| $xG2 = g^{x_2} \text{ mod } p$ | $xG4 = g^{x_4} \text{ mod } p$ |
| ZKP for $x_1$ and $x_2$        | ZKP for $x_3$ and $x_4$        |

### Round 2

| Alice -> Bob                              | Bob -> Alice                              |
| ----------------------------------------- | ----------------------------------------- |
| Verify received ZKP for $x_3$ and $x_4$   | Verify received ZKP for $x_1$ and $x_2$   |
| $A = (xG1*xG3*xG4)^{x_2s} \text{ mod } p$ | $B = (xG1*xG2*xG3)^{x_4s} \text{ mod } p$ |
| ZKP for $x_2s$                            | ZKP for $x_4s$                            |

### Compute Shared Key

| Alice's Shared Key                                  | Bob's Shared Key                                    |
| --------------------------------------------------- | --------------------------------------------------- |
| Verify received ZKP for $x_2s$                      | Verify received ZKP for $x_4s$                      |
| $K_a = (\frac{B}{xG4^{x_2s}})^{x_2} \text{ mod } p$ | $K_b = (\frac{A}{xG2^{x_4s}})^{x_4} \text{ mod } p$ |

Here, $K = K_a = K_b = g^{((x_1+x_3)*x_2*x_4*s)} \text{ mod } p$

Using $K$ as an input, we can then apply a Key Derivation Function (KDF) to derive a common session key $k$. In our implementation, we do this by doing: 

$$k = H(asBase64String(K.x))$$


## JPake using elliptic curves

### The discrete log problem

Let G be a group with binary operation $\oplus$.
Let g be any element of G. For any positive integer k, the expression $b^k$ denotes performing the operation $\oplus$ on $b$ with itself $k$ times.

i.e. $g^k = \underbrace{g \oplus g \oplus g ... \oplus g}_{\text{k times}}$.

Any integer $k$ which solves the equation $g^k = a$ is termed to be a _discrete logarithm_ of $a$ to the base $g$, i.e. $k = \log_ga$. 

In the above setting, we used the group $(Z_p)^x$ to perform our cryptographic operations. This is the group of multiplication modulo the prime $p$.

Eg: In the group $3^4$ in the group $(Z_{17})^x$, is calculated as: $3^4 mod 17$.

Note that the discrete log problem is only hard in certain carefully chosen groups. Other than the group of $(Z_p)^x$ we saw earlier, another group which is useful to us in the cryptographic context is based on elliptic curves.

### Elliptic curves

For cryptographic purposes, an _elliptic curve_ is defined as a plane curve over a finite field which consists of points satisfying the equation

$$y^2 = x^3 + ax + b$$. 

Combined with a group operation $\oplus$ as an addition of 2 elements in the group, allows us to reformulate our discrete log problem as: 

$$g^k = \underbrace{g \oplus g \oplus g ... \oplus g}_{\text{k times}} = \underbrace{g +g + g + ... + g}_{\text{k times}} = kg$$

We can convert operations from the group $(Z_p)^x$ to the elliptic curve setting by converting them as the following:

| $(Z_p)^x$ methods                             |       | Elliptic curve methods (over a finite field p) |
| --------------------------------------------- | :---: | ---------------------------------------------- |
| __exponentiation__ $g^x \text{ mod } p$       |  ->   | __multiplication__ $xG$                        |
| __multiplication__ $g^xg^y \text{ mod } p$    |  ->   | __point addition__ $xG + yG$                   |
| __division__ $\frac{g^x}{g^y} \text{ mod } p$ |  ->   | __point subtraction__ $(xG - yG)               |



### JPake using elliptic curves

With this knowledge, we can then convert our modular arithmetic operations into elliptic curve operations using the generator $G$.

#### Round 0

| Alice                                 | Bob                                   |
| ------------------------------------- | ------------------------------------- |
| Select $x_1$ uniformly from $[0,q-1]$ | Select $x_3$ uniformly from $[0,q-1]$ |
| Select $x_2$ uniformly from $[0,q-1]$ | Select $x_4$ uniformly from $[0,q-1]$ |


#### Round 1

| Alice -> Bob            | Bob -> Alice            |
| ----------------------- | ----------------------- |
| $xG1 = x_1G$            | $x3G = x_3G$            |
| $xG2 = x_2G$            | $xG4 = x_4G$            |
| ZKP for $x_1$ and $x_2$ | ZKP for $x_1$ and $x_2$ |

#### Round 2

| Alice -> Bob                            | Bob -> Alice                            |
| --------------------------------------- | --------------------------------------- |
| Verify received ZKP for $x_3$ and $x_4$ | Verify received ZKP for $x_1$ and $x_2$ |
| $A = (xG1+xG3+xG4) \times x_2s$         | $B = (xG1+xG2+xG3) \times x_4s$         |
| ZKP for $x_2s$                          | ZKP for $x_4s$                          |

#### Compute Shared Key

| Alice's Shared Key                          | Bob's Shared Key                            |
| ------------------------------------------- | ------------------------------------------- |
| Verify received ZKP for $x_2s$              | Verify received ZKP for $x_4s$              |
| $K_a = x_2 \times (B - (x_2s) \times x_4G)$ | $K_b = x_4 \times (A - (x_4s) \times x_2G)$ |
