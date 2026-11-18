
from io import BytesIO

from django.core.files.base import ContentFile
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas


# Couleurs de la charte graphique AUBERGE
VERT = colors.HexColor("#1F4D3B")
BEIGE = colors.HexColor("#F7F3E9")
BRUN = colors.HexColor("#2B2B2B")
BRIQUE = colors.HexColor("#C07A5A")
OR = colors.HexColor("#D4AF37")
BLANC = colors.white


def generer_pdf_facture(facture):
    buffer = BytesIO()

    largeur, hauteur = A4
    pdf = canvas.Canvas(buffer, pagesize=A4)

    pdf.setTitle(f"Facture-{facture.id}")

    # =====================================
    # 1. EN-TETE
    # =====================================

    pdf.setFillColor(VERT)
    pdf.rect(0, 720, largeur, 122, fill=1, stroke=0)

    pdf.setFillColor(BLANC)
    pdf.setFont("Helvetica-Bold", 25)
    pdf.drawString(50, 790, "AUBERGE")

    pdf.setFont("Helvetica", 10)
    pdf.drawString(50, 768, "HOSPITALITE & CONFORT")

    pdf.setFont("Helvetica-Bold", 19)
    pdf.drawRightString(545, 785, "FACTURE")

    pdf.setFont("Helvetica", 10)
    pdf.drawRightString(545, 762, f"N° {facture.id}")

    # =====================================
    # 2. DATE ET INFORMATIONS
    # =====================================

    pdf.setFillColor(BRUN)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 680, "INFORMATIONS DE FACTURATION")

    pdf.setStrokeColor(OR)
    pdf.setLineWidth(2)
    pdf.line(50, 668, 545, 668)

    pdf.setFont("Helvetica", 10)
    pdf.setFillColor(BRUN)

    pdf.drawString(50, 638, "Reference reservation")
    pdf.drawString(250, 638, f"RES-{facture.reservation_id}")

    pdf.drawString(50, 615, "Identifiant client")
    pdf.drawString(250, 615, str(facture.client_id))

    pdf.drawString(50, 592, "Date d'emission")
    pdf.drawString(
        250,
        592,
        facture.date_emission.strftime("%d/%m/%Y")
    )

    # =====================================
    # 3. DETAIL DES MONTANTS
    # =====================================

    pdf.setFillColor(VERT)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 545, "DETAIL DE LA FACTURE")

    # Tableau
    pdf.setFillColor(BEIGE)
    pdf.roundRect(50, 420, 495, 100, 6, fill=1, stroke=0)

    pdf.setFillColor(VERT)
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(70, 493, "DESCRIPTION")
    pdf.drawRightString(525, 493, "MONTANT")

    pdf.setStrokeColor(colors.HexColor("#DDD6C8"))
    pdf.line(70, 480, 525, 480)

    pdf.setFillColor(BRUN)
    pdf.setFont("Helvetica", 10)

    pdf.drawString(70, 460, "Hebergement")
    pdf.drawRightString(
        525, 460, f"{facture.montant_chambres} MAD"
    )

    pdf.drawString(70, 437, "Services supplementaires")
    pdf.drawRightString(
        525, 437, f"{facture.montant_services} MAD"
    )

    # =====================================
    # 4. TOTAL
    # =====================================

    pdf.setFillColor(VERT)
    pdf.roundRect(50, 340, 495, 55, 6, fill=1, stroke=0)

    pdf.setFillColor(BLANC)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(70, 361, "TOTAL A PAYER")

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawRightString(
        525, 360, f"{facture.montant_total} MAD"
    )

    # =====================================
    # 5. STATUT DE PAIEMENT
    # =====================================

    pdf.setFillColor(BRUN)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 295, "INFORMATIONS DE PAIEMENT")

    if facture.statut == "payee":
        statut = "PAYEE"
        couleur_statut = VERT
    else:
        statut = "NON PAYEE"
        couleur_statut = BRIQUE

    pdf.setFillColor(BEIGE)
    pdf.roundRect(50, 245, 495, 32, 5, fill=1, stroke=0)

    pdf.setFillColor(couleur_statut)
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(70, 256, f"Statut : {statut}")

    if facture.date_paiement:
        pdf.setFillColor(BRUN)
        pdf.setFont("Helvetica", 10)
        pdf.drawString(
            70,
            225,
            "Date de paiement : "
            + facture.date_paiement.strftime("%d/%m/%Y a %H:%M")
        )

    # =====================================
    # 6. FOOTER
    # =====================================

    pdf.setStrokeColor(OR)
    pdf.line(50, 100, 545, 100)

    pdf.setFillColor(VERT)
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawCentredString(
        largeur / 2, 75, "MERCI POUR VOTRE CONFIANCE"
    )

    pdf.setFillColor(BRUN)
    pdf.setFont("Helvetica", 9)
    pdf.drawCentredString(
        largeur / 2, 57, "AUBERGE - Votre confort, notre priorite"
    )

    # =====================================
    # 7. GENERATION ET SAUVEGARDE
    # =====================================

    pdf.save()
    buffer.seek(0)

    facture.pdf_file.save(
        f"facture_{facture.id}.pdf",
        ContentFile(buffer.getvalue()),
        save=True
    )

    buffer.close()

    return facture.pdf_file
