import html
import re
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from museum.models import Artifact, Hall


ARTIFACT_SPECS = [
    {
        "pk": 1,
        "page": "tutankhamun.html",
        "hall_pk": 3,
        "category": "royal",
        "is_featured": True,
    },
    {
        "pk": 2,
        "page": "khufu-boat.html",
        "hall_pk": 1,
        "category": "monument",
        "is_featured": True,
    },
    {
        "pk": 3,
        "page": "ramses.html",
        "hall_pk": 3,
        "category": "sculpture",
        "is_featured": True,
    },
    {
        "pk": 4,
        "page": "golden-throne.html",
        "hall_pk": 3,
        "category": "royal",
        "is_featured": False,
    },
    {
        "pk": 5,
        "page": "tut-head.html",
        "hall_pk": 3,
        "category": "sculpture",
        "is_featured": False,
    },
    {
        "pk": 6,
        "page": "hanging-obelisk.html",
        "hall_pk": 3,
        "category": "monument",
        "is_featured": True,
    },
    {
        "pk": 7,
        "page": "Senwosret III.html",
        "hall_pk": 3,
        "category": "sculpture",
        "is_featured": False,
    },
    {
        "pk": 8,
        "page": "column.html",
        "hall_pk": 3,
        "category": "inscription",
        "is_featured": False,
    },
    {
        "pk": 9,
        "page": "king.html",
        "hall_pk": 3,
        "category": "sculpture",
        "is_featured": False,
    },
]


def clean_text(value):
    text = re.sub(r"<.*?>", "", value or "")
    text = html.unescape(text)
    text = text.replace("\xa0", " ")
    return " ".join(text.split()).strip()


def extract_first(pattern, text):
    match = re.search(pattern, text, re.S)
    return clean_text(match.group(1)) if match else ""


def extract_meta(text):
    return {
        clean_text(label): clean_text(value)
        for label, value in re.findall(r"<dt>(.*?)</dt>\s*<dd>(.*?)</dd>", text, re.S)
    }


def parse_page(page_path):
    text = page_path.read_text(encoding="utf-8", errors="ignore")
    meta = extract_meta(text)

    gem = re.search(
        r"window\.GEM_ARTIFACT\s*=\s*\{.*?title:\s*'([^']+)'.*?img:\s*'([^']+)'.*?link:\s*'([^']+)'.*?\};",
        text,
        re.S,
    )
    title = clean_text(gem.group(1)) if gem else extract_first(r"<h1[^>]*>(.*?)</h1>", text)
    image_rel = clean_text(gem.group(2)) if gem else ""
    link_rel = clean_text(gem.group(3)) if gem else page_path.name
    eyebrow = extract_first(r'<span class="artifact-eyebrow">(.*?)</span>', text)
    lead = extract_first(r'<p class="lead">(.*?)</p>', text)

    discovered_text = meta.get("Discovered", "")
    discovered_year = None
    year_match = re.search(r"(1[0-9]{3}|20[0-9]{2})", discovered_text)
    if year_match:
        discovered_year = int(year_match.group(1))

    return {
        "name": title,
        "era": meta.get("Era", eyebrow.split("·")[0].strip()),
        "year_discovered": discovered_year,
        "discovered_by": meta.get("Discovered by", ""),
        "material": meta.get("Material", meta.get("Materials", "")),
        "date_label": eyebrow,
        "description": lead,
        "image_rel": image_rel,
        "source_link": link_rel,
    }


class Command(BaseCommand):
    help = "Sync dashboard artifacts from the real static artifact pages."

    def handle(self, *args, **options):
        project_root = Path(settings.BASE_DIR).parent
        pages_root = project_root / "explore" / "artifacts"

        missing_halls = sorted({spec["hall_pk"] for spec in ARTIFACT_SPECS} - set(Hall.objects.values_list("pk", flat=True)))
        if missing_halls:
            self.stderr.write(self.style.ERROR(f"Missing hall IDs required for sync: {missing_halls}"))
            return

        synced = []
        for spec in ARTIFACT_SPECS:
            page_path = pages_root / spec["page"]
            if not page_path.exists():
                self.stderr.write(self.style.WARNING(f"Skipped missing page: {spec['page']}"))
                continue

            parsed = parse_page(page_path)
            artifact = Artifact.objects.filter(pk=spec["pk"]).first() or Artifact(pk=spec["pk"])
            artifact.name = parsed["name"]
            artifact.hall_id = spec["hall_pk"]
            artifact.category = spec["category"]
            artifact.era = parsed["era"]
            artifact.year_discovered = parsed["year_discovered"]
            artifact.discovered_by = parsed["discovered_by"]
            artifact.material = parsed["material"]
            artifact.date_label = parsed["date_label"]
            artifact.description = parsed["description"]
            artifact.is_featured = spec["is_featured"]
            artifact.save()

            image_path = (pages_root / parsed["image_rel"]).resolve()
            if image_path.exists():
                file_name = f"dashboard-{artifact.pk}-{image_path.name}"
                current_name = Path(artifact.main_image.name).name if artifact.main_image else ""
                if current_name != file_name:
                    with image_path.open("rb") as image_file:
                        artifact.main_image.save(file_name, File(image_file), save=True)

            synced.append(f"{artifact.pk}: {artifact.name}")

        self.stdout.write(self.style.SUCCESS(f"Synced {len(synced)} artifacts from static pages."))
        for line in synced:
            self.stdout.write(f" - {line}")
        self.stdout.write("Skipped artifact page: Hatshepsut.html (content is inconsistent and still mirrors Tutankhamun).")
