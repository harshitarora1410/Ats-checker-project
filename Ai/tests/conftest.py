import sys
from pathlib import Path

# Make `ats_ai` importable when running pytest from the Ai/ folder without installing
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
