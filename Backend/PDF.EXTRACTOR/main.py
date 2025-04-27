
from fastapi import FastAPI, File, UploadFile
import pdfplumber
import re

app = FastAPI()

def extract_text_from_pdf(pdf_file):
    """Extracts text from a given PDF file."""
    text = ""
    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() 
            if page_text:
                text += page_text + "\n"
    return text

def extract_invoice_details(text):
    """Extracts invoice details using improved regex patterns."""

    invoice_number = re.search(r'Invoice No\.\s*(\d+)', text)
    gstin = re.search(r'GSTIN\s*:\s*([\w\d]+)', text)
    receiver_details = re.search(r'Details of Receiver / Billed to\s*(.+?)\s*GSTIN', text, re.DOTALL)
    po_number = re.search(r'PO NO\s*:\s*(\d+)', text)
    po_date = re.search(r'PO DATE\s*:\s*(\d{2}-\d{2}-\d{4})', text)
    vehicle_number = re.search(r'Vehicle Number\s*(\d+)', text)

    # ✅ Improved Regex for Product Extraction
    products = []
    searcharray = [re.findall(
                r'(\d+)\.\s+([\w\s\/().-]+?)\s+(\d{8})\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)',
                text
            ),re.findall(
    r'(\d+)\.\s+(.*?)\s+(\d{6})\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)',
    text
)]
    
    for search in searcharray:
        if(search and len(search) > 0):
            for match in search:
                sr_no, name, hsn_code, quantity, rate, cgst, sgst, total = match
                products.append({
                    "sr_no": sr_no,
                    "name": name.strip(),
                    "hsn_code": hsn_code,
                    "quantity": quantity,
                    "rate": rate,
                    "cgst_amount": cgst,
                    "sgst_amount": sgst,
                    "total_amount": total
                })
            
            break
    

    return {
        "invoice_number": invoice_number.group(1) if invoice_number else "Not Found",
        "gstin": gstin.group(1) if gstin else "Not Found",
        "receiver_details": receiver_details.group(1).strip() if receiver_details else "Not Found",
        "po_number": po_number.group(1) if po_number else "Not Found",
        "po_date": po_date.group(1) if po_date else "Not Found",
        "vehicle_number": vehicle_number.group(1) if vehicle_number else "Not Found",
        "products": products
    }


@app.post("/extract_invoice")
async def extract_invoice(file: UploadFile = File(...)):
    """Handles PDF file upload and extracts invoice details."""
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are supported"}

    text = extract_text_from_pdf(file.file)
    invoice_details = extract_invoice_details(text)

    return invoice_details
