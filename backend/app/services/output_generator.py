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

    def generate_approval_note_docx(self, task: TaskResponse) -> str:
        import docx
        from docx.shared import Inches, Pt, RGBColor
        from docx.enum.text import WD_ALIGN_PARAGRAPH

        filename = f"MRPL_APPROVAL_NOTE_{task.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.docx"
        filepath = os.path.join(self.output_dir, filename)

        doc = docx.Document()

        # Title
        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_title = p_title.add_run("MANGALORE REFINERY AND PETROCHEMICALS LIMITED (MRPL)\n")
        r_title.bold = True
        r_title.font.size = Pt(15)
        r_title.font.color.rgb = RGBColor(15, 23, 42)

        r_sub = p_title.add_run("SOVEREIGN INDUSTRIAL ON-PREMISE AI WORKBENCH • APPROVAL NOTE\n")
        r_sub.font.size = Pt(10)
        r_sub.font.color.rgb = RGBColor(100, 116, 139)

        r_task = p_title.add_run(f"TECHNICAL ASSESSMENT: {task.title.upper()}\n")
        r_task.bold = True
        r_task.font.size = Pt(12)
        r_task.font.color.rgb = RGBColor(29, 78, 216)

        # Metadata Table
        doc.add_heading("1. Document & Task Metadata", level=2)
        meta_table = doc.add_table(rows=4, cols=2)
        meta_table.style = 'Table Grid'
        meta_pairs = [
            ("Task ID / Reference:", task.id),
            ("Plant Unit / Coordinates:", task.unit_location),
            ("Workflow Type & Priority:", f"{task.workflow_type.value} | {task.priority.value}"),
            ("Status / Verification:", f"{task.status.value} (Review: {task.review_status or 'PENDING'})")
        ]
        for i, (k, v) in enumerate(meta_pairs):
            meta_table.rows[i].cells[0].paragraphs[0].add_run(k).bold = True
            meta_table.rows[i].cells[1].paragraphs[0].add_run(v)

        doc.add_paragraph()

        # Scope
        doc.add_heading("2. Scope of Maintenance & Operation", level=2)
        doc.add_paragraph(task.description)

        # Knowledge Base Citations
        doc.add_heading("3. Approved Grounded Knowledge Base (Local RAG)", level=2)
        if task.citations:
            cite_table = doc.add_table(rows=1, cols=4)
            cite_table.style = 'Table Grid'
            hdr = cite_table.rows[0].cells
            hdr[0].paragraphs[0].add_run("Document").bold = True
            hdr[1].paragraphs[0].add_run("Section").bold = True
            hdr[2].paragraphs[0].add_run("Page").bold = True
            hdr[3].paragraphs[0].add_run("Evidence Excerpt").bold = True

            for c in task.citations[:3]:
                row = cite_table.add_row().cells
                row[0].paragraphs[0].add_run(c.source_filename)
                row[1].paragraphs[0].add_run(c.section)
                row[2].paragraphs[0].add_run(str(c.page_number))
                row[3].paragraphs[0].add_run(c.evidence_text[:140] + "...")
        else:
            doc.add_paragraph("No local citations attached.")

        doc.add_paragraph()

        # Tool Findings & Hazards
        doc.add_heading("4. Tool Findings & Hazard Analysis", level=2)
        if task.hazards_detected:
            for h in task.hazards_detected:
                p = doc.add_paragraph(style='List Bullet')
                r = p.add_run(f"[IDENTIFIED HAZARD] {h}")
                r.bold = True
                r.font.color.rgb = RGBColor(185, 28, 28)
        else:
            doc.add_paragraph("No active SIMOPS or atmospheric hazards detected.")

        # Mitigations
        doc.add_heading("5. Mandatory Safety Mitigations", level=2)
        for m in task.safety_mitigations:
            p = doc.add_paragraph(style='List Bullet')
            r = p.add_run(f"[MANDATORY CONTROL] {m}")
            r.font.color.rgb = RGBColor(4, 120, 87)

        # Human Review Block
        doc.add_heading("6. Certified Safety Officer Sign-Off (Human-in-the-Loop)", level=2)
        review_p = doc.add_paragraph()
        review_p.add_run(f"Safety Reviewer: ").bold = True
        review_p.add_run(f"{task.reviewer_name or 'Awaiting Safety Review'}\n")
        review_p.add_run(f"Decision: ").bold = True
        review_p.add_run(f"{task.review_status or 'PENDING'}\n")
        review_p.add_run(f"Reviewer Directives: ").bold = True
        review_p.add_run(f"{task.reviewer_comments or 'None'}\n")

        # Audit Seal
        doc.add_paragraph()
        raw_hash = hashlib.sha256(f"{task.id}_{task.status}_{task.reviewed_at}".encode("utf-8")).hexdigest()
        p_seal = doc.add_paragraph()
        p_seal.add_run(f"IMMUTABLE AUDIT HASH (SHA-256): {raw_hash}\n").bold = True
        p_seal.add_run("Execution Environment: Sovereign On-Premise Air-Gap • Mangalore Refinery and Petrochemicals Limited").italic = True

        doc.save(filepath)
        return filepath

    def generate_action_tracker_xlsx(self, task: TaskResponse) -> str:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

        filename = f"MRPL_ACTION_TRACKER_{task.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.xlsx"
        filepath = os.path.join(self.output_dir, filename)

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Action Tracker"

        # Headers
        headers = [
            "Action ID", "Task Ref", "Plant Location", "Identified Condition / Hazard",
            "Mandatory Control Action", "Assigned Role", "Priority", "Reviewer Status", "Audit Hash"
        ]
        ws.append(headers)

        # Header styling
        header_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        for col_num in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_num)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")

        raw_hash = hashlib.sha256(f"{task.id}_{task.status}_{task.reviewed_at}".encode("utf-8")).hexdigest()[:16]

        # Populate rows
        row_idx = 2
        for idx, (h, m) in enumerate(zip(task.hazards_detected or ["Standard flammable operational environment"],
                                         task.safety_mitigations or ["Follow SOP instructions"])):
            ws.append([
                f"ACT-{task.id}-{idx + 1:02d}",
                task.id,
                task.unit_location,
                h,
                m,
                "Certified Fire Watch / Operator",
                task.priority.value,
                task.review_status or "PENDING",
                raw_hash
            ])
            row_idx += 1

        # Auto-adjust column widths
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

        # Freeze top row
        ws.freeze_panes = "A2"

        wb.save(filepath)
        return filepath


output_generator = OutputGenerator()
