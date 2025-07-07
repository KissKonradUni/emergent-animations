#!python

import subprocess
import os
import sys

WEB_DIR = "../web_example/public"
OUTPUT_DIR = "output"
MAIN_TEX = "main.tex"

def run_latexmk():
    try:
        subprocess.run([
            "latexmk", "-pdf", "-interaction=nonstopmode", "-f",
            "-output-directory=" + OUTPUT_DIR, MAIN_TEX
        ], check=True)
    except FileNotFoundError:
        print("Error: latexmk not found. Please install TeX Live or MikTeX with latexmk.")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print("Compilation failed. Exit code:", e.returncode)
        print("You might need to check for errors in the LaTeX log.")
        sys.exit(e.returncode)
        
    # Copy the PDF to the web directory
    pdf_file = os.path.join(OUTPUT_DIR, "main.pdf")
    if os.path.exists(pdf_file):
        web_pdf_path = os.path.join(WEB_DIR, "main.pdf")
        os.makedirs(WEB_DIR, exist_ok=True)
        os.replace(pdf_file, web_pdf_path)
        print(f"PDF copied to {web_pdf_path}")
    else:
        print("No PDF file found to copy.")

def clean():
    for f in os.listdir(OUTPUT_DIR):
        if not f.endswith(".pdf"):
            os.remove(os.path.join(OUTPUT_DIR, f))
    print("Build artifacts cleaned.")

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if len(sys.argv) > 1:
        if sys.argv[1] == "clean":
            clean()
        else:
            print("Unknown command.")
    else:
        run_latexmk()
