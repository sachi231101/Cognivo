"""Fetch and extract readable text from a website URL."""
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup


def fetch_url_text(url: str, max_chars: int = 200_000) -> tuple[str, str]:
    """Returns (title, text). Raises on bad URL or network errors."""
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("URL must start with http:// or https://")

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (compatible; CognivoCrawler/1.0; +https://cognivo.app)"
        )
    }
    r = requests.get(url, headers=headers, timeout=20)
    r.raise_for_status()

    soup = BeautifulSoup(r.text, "lxml")

    # Remove noise
    for tag in soup(["script", "style", "noscript", "header", "footer", "nav", "aside", "form"]):
        tag.decompose()

    title = (soup.title.string.strip() if soup.title and soup.title.string else parsed.netloc) or parsed.netloc

    # Get text with paragraph spacing
    text = soup.get_text(separator="\n")
    lines = [ln.strip() for ln in text.splitlines()]
    text = "\n".join([ln for ln in lines if ln])

    if len(text) > max_chars:
        text = text[:max_chars] + "\n…[truncated]"

    return title, text
