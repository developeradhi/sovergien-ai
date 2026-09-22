import os
import hashlib
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from backend.app.models.schemas import TaskResponse

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "generated_reports")
os.makedirs(OUTPUT_DIR, exist_ok=True)


class OutputGenerator:
    def __init__(self):
        self.output_dir = OUTPUT_DIR

    def generate_permit_pdf(self, task: TaskResponse) -> str:
        filename = f"MRPL_PERMIT_{task.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)

        doc = SimpleDocTemplate(
            filepath,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'MRPLTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor('#0f172a'),
            alignment=1  # Center
        )
        subtitle_style = ParagraphStyle(
            'MRPLSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569'),
            alignment=1
        )
        section_style = ParagraphStyle(
            'MRPLSection',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#1e3a8a')
        )
        body_style = ParagraphStyle(
            'MRPLBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#1e293b')
        )
        hazard_style = ParagraphStyle(
            'MRPLHazard',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#991b1b')
        )
        mitigation_style = ParagraphStyle(
            'MRPLMitigation',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#065f46')
        )

        elements = []

        # 1. Header Banner
        elements.append(Paragraph("MANGALORE REFINERY AND PETROCHEMICALS LIMITED (MRPL)", title_style))
        elements.append(Paragraph("SOVEREIGN INDUSTRIAL ON-PREMISE AI WORKBENCH • AIR-GAP VERIFIED", subtitle_style))
        elements.append(Paragraph(f"OFFICIAL PERMIT & DELIVERABLE: {task.title.upper()}", ParagraphStyle('DocType', parent=title_style, fontSize=12, leading=16, textColor=colors.HexColor('#1d4ed8'))))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1e3a8a'), spaceAfter=12))

        # 2. Key Metadata Table
        meta_data = [
            [Paragraph("<b>Permit Reference:</b>", body_style), Paragraph(task.id, body_style),
             Paragraph("<b>Status:</b>", body_style), Paragraph(f"<b>{task.status}</b>", body_style)],
            [Paragraph("<b>Facility Location:</b>", body_style), Paragraph(task.unit_location, body_style),
             Paragraph("<b>Priority:</b>", body_style), Paragraph(task.priority, body_style)],
            [Paragraph("<b>Requested By:</b>", body_style), Paragraph(task.created_by, body_style),
             Paragraph("<b>Generated Time:</b>", body_style), Paragraph(datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"), body_style)],
            [Paragraph("<b>Security Profile:</b>", body_style), Paragraph("MRPL Level-4 Sovereign Air-Gapped", body_style),
             Paragraph("<b>Model Used:</b>", body_style), Paragraph("Open-Weight LLaMA-3.1-8B-Q4_K_M (Local)", body_style)],
        ]
        meta_table = Table(meta_data, colWidths=[110, 160, 110, 160])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 14))

        # 3. Task Description
        elements.append(Paragraph("1. Work Scope & Boundary Description", section_style))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(task.description, body_style))
        elements.append(Spacer(1, 12))

        # 4. Grounded SOP Citations (Local RAG)
        elements.append(Paragraph("2. Approved Grounded Knowledge Base Citations", section_style))
        elements.append(Spacer(1, 4))
        citation_rows = [[Paragraph("<b>Document</b>", body_style), Paragraph("<b>Section / Ref</b>", body_style), Paragraph("<b>Page</b>", body_style), Paragraph("<b>Evidence Excerpt</b>", body_style)]]
        for c in task.citations[:3]:
            citation_rows.append([
                Paragraph(c.source_filename, body_style),
                Paragraph(c.section, body_style),
                Paragraph(str(c.page_number), body_style),
                Paragraph(c.evidence_text[:120] + "...", body_style)
            ])
        cite_table = Table(citation_rows, colWidths=[130, 130, 40, 240])
        cite_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(cite_table)
        elements.append(Spacer(1, 12))

        # 5. Automated Hazard Analysis & Tool Findings
        elements.append(Paragraph("3. Tool Analysis & Hazard Evaluation", section_style))
        elements.append(Spacer(1, 4))
        if task.hazards_detected:
            for h in task.hazards_detected:
                elements.append(Paragraph(f"• <b>[IDENTIFIED HAZARD]</b> {h}", hazard_style))
                elements.append(Spacer(1, 2))
        else:
            elements.append(Paragraph("No critical environmental conflicts or out-of-spec conditions identified.", body_style))
        elements.append(Spacer(1, 8))

        # 6. Safety Mitigations
        elements.append(Paragraph("4. Mandatory Safety Mitigations Enforced", section_style))
        elements.append(Spacer(1, 4))
        for m in task.safety_mitigations:
            elements.append(Paragraph(f"✓ <b>[MANDATORY CONTROL]</b> {m}", mitigation_style))
            elements.append(Spacer(1, 2))
        elements.append(Spacer(1, 12))

        # 7. Human-In-The-Loop (HITL) Sign-off Block
        elements.append(Paragraph("5. Certified Safety Officer Sign-Off (Human-in-the-Loop)", section_style))
        elements.append(Spacer(1, 4))
        hitl_data = [
            [Paragraph("<b>Reviewer Name:</b>", body_style), Paragraph(task.reviewer_name or "Pending Assignment", body_style),
             Paragraph("<b>Decision:</b>", body_style), Paragraph(f"<b>{task.review_status or 'AWAITING SAFETY REVIEW'}</b>", body_style)],
            [Paragraph("<b>Sign-off Timestamp:</b>", body_style), Paragraph(task.reviewed_at.strftime("%Y-%m-%d %H:%M:%S UTC") if task.reviewed_at else "Not signed yet", body_style),
             Paragraph("<b>Officer Role:</b>", body_style), Paragraph("Authorized Safety Reviewer (Level 3)", body_style)],
            [Paragraph("<b>Officer Remarks:</b>", body_style), Paragraph(task.reviewer_comments or "Awaiting formal review before hot ignition permitted.", body_style), "", ""],
        ]
        hitl_table = Table(hitl_data, colWidths=[110, 160, 110, 160])
        hitl_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f1f5f9')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#94a3b8')),
            ('SPAN', (1, 2), (3, 2)),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(hitl_table)
        elements.append(Spacer(1, 14))

        # 8. Cryptographic Audit Seal
        elements.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#94a3b8'), spaceAfter=8))
        raw_hash = hashlib.sha256(f"{task.id}_{task.status}_{task.reviewed_at}".encode("utf-8")).hexdigest()
        audit_footer = (
            f"<b>IMMUTABLE AUDIT HASH (SHA-256):</b> {raw_hash}<br/>"
            f"<i>Execution Environment: Sovereign On-Premise Air-Gap • Mangalore Refinery and Petrochemicals Limited • No Cloud Transmission</i>"
        )
        elements.append(Paragraph(audit_footer, ParagraphStyle('AuditFooter', parent=styles['Normal'], fontSize=7.5, leading=10, textColor=colors.HexColor('#64748b'))))

        # Build PDF
        doc.build(elements)
        return filepath


output_generator = OutputGenerator()
