
from django.contrib import admin
from django.urls import path, re_path, include

from factures.views import frontend

urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/factures/",
        include("factures.urls"),
    ),

    re_path(r"^.*$", frontend, name="frontend"),
]
