# Emergent animation systems
**From interpolation to procedural motion**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT) [![Deno](https://img.shields.io/badge/Deno-%5E2.4.0-6DB33F?logo=deno)](https://deno.land/) [![Svelte](https://img.shields.io/badge/Svelte-%23f1413d.svg?logo=svelte&logoColor=white)](#) [![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](#)

This project explores how animation systems can be built using simple rules, gradually increasing in complexity from basic interpolation techniques to emergent, procedural movement.

The web examples can be found [here](https://kisskonraduni.github.io/emergent-animations/). (🚧 Under construction. 🚧)

---

## 📁 Repository Structure

- `web_example/`  
  An interactive webpage demonstrating key animation concepts.  

- `docs/`  
  The LaTeX documentation folder for the academic writeup.  

---

## 🎯 Project Goals

- Implement various animation paradigms:
  - Time-based interpolation with custom easing curves
  - Rule-based systems such as Conway's Game of Life, Boids, etc.
  - Simple 2D joint-based procedural animation (walking patterns)
- Visualize how complex and dynamic movement can arise from minimal input and simple rules.
- Compare and evaluate the strengths of different animation approaches.

---

## 🛠️ Technologies

- Deno / Vite / TypeScript / Svelte (for web demos)
- LaTeX (academic documentation)

---

## ⚙️ Building and Running

### 🌍 Web example

To run the web example, ensure you have the latest version of Deno installed, then execute on of the following commands:

```bash
# Enter the web_example directory
cd web_example

# View in a dev environment
deno run dev

# Build for production (/dist folder)
deno run build
```

### 📄 Documentation

To compile the LaTeX documentation make sure you have a LaTeX distribution installed (like TeX Live or MikTeX), and python for the build script, then run:

```bash
# Enter the docs directory
cd docs

# Build the LaTeX documentation
python build.py
```

After compilation, the script attempts to copy the generated PDF (`docs/output/main.pdf`) into the `web_example/public` directory for web access.

---

## 📖 References

Relevant literature on animation systems, procedural motion,
and rule-based behavior will be added as the documentation progresses.

All academic sources will be included and cited in the LaTeX paper under `docs/`.

---

## 🚧 Status

Currently in active development.
Has some working web examples.
