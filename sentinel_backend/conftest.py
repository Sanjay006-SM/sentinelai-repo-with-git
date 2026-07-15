"""
Root conftest.py for the sentinel_backend test suite.

Inserts the sentinel_backend/ directory into sys.path so that
`from app.xxx import yyy` works correctly regardless of the directory
pytest is invoked from (repo root, sentinel_backend/, or CI).
"""
import sys
import os

# Ensure sentinel_backend/ is always the first path entry so that
# `import app.*` resolves to sentinel_backend/app/ in all cases.
_backend_root = os.path.dirname(os.path.abspath(__file__))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)
