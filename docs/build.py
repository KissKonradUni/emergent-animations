#!python

import subprocess
import os
import sys

WEB_DIR = "../web_example/public"
OUTPUT_DIR = "output"
MAIN_TEX = "main.tex"

YELLOW_COLOR = "\033[93m"

# Windows only
PYTHON_PATH = "%USERPROFILE%\\.pyenv\\pyenv-win\\versions\\3.10.11"

def add_python_exe_to_path():
    if sys.platform == "win32":
        python_exe = os.path.join(os.path.expandvars(PYTHON_PATH), "python.exe")
        if os.path.exists(python_exe):
            os.environ["PATH"] += os.pathsep + os.path.dirname(python_exe)

def run_latexmk():
    try:
        subprocess.run([
            "latexmk", "-pdf", "-silent", "-use-make", "-interaction=nonstopmode",
            "-output-directory=" + OUTPUT_DIR, MAIN_TEX
        ], check=True)
    except FileNotFoundError:
        print(f"{YELLOW_COLOR}Error: latexmk not found. Please install TeX Live or MikTeX with latexmk.")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"{YELLOW_COLOR}Compilation failed. Exit code:", e.returncode)
        print(f"{YELLOW_COLOR}You might need to check for errors in the LaTeX log.")
        sys.exit(e.returncode)
        
    # Copy the PDF to the web directory
    pdf_file = os.path.join(OUTPUT_DIR, "main.pdf")
    if os.path.exists(pdf_file):
        web_pdf_path = os.path.join(WEB_DIR, "main.pdf")
        try:
            import shutil
            shutil.copy2(pdf_file, web_pdf_path)  # Use copy2 to preserve metadata
        except OSError as e:
            print(f"{YELLOW_COLOR}Error copying PDF to web directory. File remains in \"{OUTPUT_DIR}\".")
        else:
            print(f"{YELLOW_COLOR}PDF copied to {web_pdf_path}")
    else:
        print(f"{YELLOW_COLOR}No PDF file found to copy.")

def clean():
    for f in os.listdir(OUTPUT_DIR):
        if not f.endswith(".pdf"):
            os.remove(os.path.join(OUTPUT_DIR, f))
    print(f"{YELLOW_COLOR}Build artifacts cleaned.")

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    add_python_exe_to_path()

    if len(sys.argv) > 1:
        if sys.argv[1] == "clean":
            clean()
        else:
            print(f"{YELLOW_COLOR}Unknown command.")
    else:
        run_latexmk()
