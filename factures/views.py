
from django.conf import settings
from django.http import HttpResponse
from pathlib import Path


def frontend(request):
    index_file = (
        settings.BASE_DIR
        / "factures"
        / "frontend"
        / "dist"
        / "index.html"
    )

    html = index_file.read_text(encoding="utf-8")
    return HttpResponse(html)
