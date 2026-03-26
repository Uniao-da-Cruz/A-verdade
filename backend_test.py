"""Regression tests for basic project sanity.

These tests intentionally avoid external dependencies so they can run in
minimal CI environments.
"""

from pathlib import Path


def test_backend_entrypoint_exists():
    assert Path("backend/server.py").exists()


def test_readme_exists():
    assert Path("README.md").exists()
