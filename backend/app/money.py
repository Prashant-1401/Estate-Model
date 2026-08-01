import re

_UNITS = {
    "cr": 1e7,
    "crore": 1e7,
    "crores": 1e7,
    "lakh": 1e5,
    "lakhs": 1e5,
    "lac": 1e5,
    "lacs": 1e5,
    "l": 1e5,
    "m": 1e6,
    "k": 1e3,
}

_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\s*(cr|crore|crores|lakh|lakhs|lac|lacs|l|m|k)?")


def parse_inr_price(text: str | None) -> float:
    """Parse an Indian rupee price string into a numeric value in rupees."""
    if not text:
        return 0.0
    normalized = re.sub(r"\s+", "", text.replace(",", "").replace("₹", "").lower())
    best = 0.0
    for num, unit in _PATTERN.findall(normalized):
        try:
            value = float(num)
        except ValueError:
            continue
        best = max(best, value * _UNITS.get(unit, 1))
    return best


def format_inr(value: float) -> str:
    if value >= 1e7:
        return f"₹{value / 1e7:.2f}".rstrip("0").rstrip(".") + " Cr"
    if value >= 1e5:
        return f"₹{value / 1e5:.2f}".rstrip("0").rstrip(".") + " L"
    return f"₹{value:,.0f}"
