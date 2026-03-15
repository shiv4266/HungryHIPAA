import subprocess
import sys

print("\n**** STARTING HUNGRYHIPAA PIPELINE ****\n")

scripts = [
    "scripts/ingest.py",
    "scripts/clean.py",
    "scripts/deidentify.py",
    "scripts/load_db.py",
    "scripts/analyze.py"
]

for script in scripts:
    print(f"\nRunning {script}...\n")

    result = subprocess.run(
        [sys.executable, script],
        capture_output=False,
        text=True
    )

    if result.returncode != 0:
        print(f"\nPipeline stopped due to error in {script}")
        sys.exit(1)

print("\n**** SUCCESS! PIPELINE COMPLETED ****\n")