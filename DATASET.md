# DOPPEL Demo Dataset Specification

## 1. Zero-Scraping Commitment
Doppel strictly prohibits training, demoing, or evaluating on scraped images of real people without explicit rights.

## 2. Synthetic Seed Dataset (`scripts/seed_demo_data.py`)
- **Quantity**: 60 synthetic personas.
- **Vectors**: Synthesized 512-dimensional archetype clusters with parameterized Gaussian perturbation ($\sigma = 0.08 - 0.22$) to emulate genuine visual twin clusters.
- **Avatars**: Generated SVG procedural avatars via DiceBear Adventurer & Bottts procedural engines under CC0/MIT.
