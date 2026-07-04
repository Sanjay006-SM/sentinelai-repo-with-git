import io
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from datetime import datetime

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.title_style = self.styles['Title']
        self.heading_style = self.styles['Heading1']
        self.subheading_style = self.styles['Heading2']
        self.normal_style = self.styles['Normal']
        
    def generate(self, report_name: str, metrics: dict, ai_summary: str) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        story = []
        
        # 1. Title Page
        story.append(Paragraph(f"SentinelAI Enterprise Security Report", self.title_style))
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"Report: {report_name}", self.heading_style))
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC", self.normal_style))
        story.append(PageBreak())
        
        # 2. Executive Summary (AI Generated)
        story.append(Paragraph("Executive Summary", self.heading_style))
        story.append(Spacer(1, 12))
        story.append(Paragraph(ai_summary or "No summary available.", self.normal_style))
        story.append(Spacer(1, 24))
        
        # 3. Security Posture Score
        exec_data = metrics.get('executive', {})
        story.append(Paragraph("Overall Posture", self.heading_style))
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"Security Score: {exec_data.get('security_score', 'N/A')}/100", self.normal_style))
        story.append(Paragraph(f"Overall Risk: {exec_data.get('overall_risk', 'UNKNOWN')}", self.normal_style))
        story.append(Spacer(1, 24))
        
        # 4. Risk Breakdown
        risk_data = metrics.get('risk', {})
        story.append(Paragraph("Risk Breakdown", self.heading_style))
        story.append(Spacer(1, 12))
        risk_table_data = [
            ["Critical", "High", "Medium", "Low", "Resolved"],
            [str(risk_data.get('critical', 0)), str(risk_data.get('high', 0)), 
             str(risk_data.get('medium', 0)), str(risk_data.get('low', 0)), 
             str(risk_data.get('resolved', 0))]
        ]
        t = Table(risk_table_data, colWidths=[80, 80, 80, 80, 80])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#ecf0f1')),
            ('GRID', (0,0), (-1,-1), 1, colors.black)
        ]))
        story.append(t)
        story.append(PageBreak())
        
        # 5. Top Risk Findings
        story.append(Paragraph("Top Risk Findings", self.heading_style))
        story.append(Spacer(1, 12))
        top_findings = risk_data.get('top_findings', [])
        if top_findings:
            findings_data = [["Severity", "Type", "Description"]]
            for f in top_findings[:10]:
                findings_data.append([f['severity'], f['type'], f['description'][:50] + "..."])
            
            ft = Table(findings_data, colWidths=[60, 140, 260])
            ft.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#34495e')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('GRID', (0,0), (-1,-1), 1, colors.black),
                ('VALIGN', (0,0), (-1,-1), 'TOP')
            ]))
            story.append(ft)
        else:
            story.append(Paragraph("No active risk findings.", self.normal_style))
            
        story.append(PageBreak())
        
        # 6. Graph & Identity Analytics
        story.append(Paragraph("Graph Analytics", self.heading_style))
        story.append(Spacer(1, 12))
        graph_data = metrics.get('graph', {})
        story.append(Paragraph(f"Total Nodes: {graph_data.get('total_nodes', 0)}", self.normal_style))
        story.append(Paragraph(f"Relationships: {graph_data.get('total_relationships', 0)}", self.normal_style))
        story.append(Paragraph(f"Most Connected Identity: {graph_data.get('most_connected_identity', 'None')}", self.normal_style))
        story.append(Spacer(1, 24))
        
        story.append(Paragraph("Identity Summary", self.heading_style))
        story.append(Spacer(1, 12))
        id_data = metrics.get('identity', {})
        story.append(Paragraph(f"Total Identities: {id_data.get('total_identities', 0)}", self.normal_style))
        story.append(Paragraph(f"Privileged: {id_data.get('privileged', 0)}", self.normal_style))
        story.append(Paragraph(f"Dormant: {id_data.get('dormant', 0)}", self.normal_style))
        
        doc.build(story)
        
        return buffer.getvalue()
