import json
from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from typing import Any
from datetime import datetime
from fastapi import HTTPException
import shutil
import os
# Database connection details
DB_USERNAME = "root"
DB_PASSWORD = "atharva"
DB_HOST = "127.0.0.1"
DB_PORT = "3306"  # MySQL default port
DB_NAME = "invosense"

# ✅ Use `pymysql` as the MySQL driver
DATABASE_URL = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create database engine
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint to fetch users using raw SQL query
@app.get("/getVendors")
def get_users(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT * FROM vendors"))  # Modify query if needed
    response = {
        "data": [dict(row._mapping) for row in result],
        "success": True

    }
    return response

@app.get("/getInvoices")
def get_users(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT * FROM invoices"))  # Modify query if needed
    response = {
        "data": [dict(row._mapping) for row in result],
        "success": True

    }
    return response

@app.post("/saveInvoices")
def get_users(file: UploadFile = File(...), 
    payload: str = Form(...),db: Session = Depends(get_db)):
    # query = f"INSERT INTO INVOICES(invoice_id , invoice_date, invoice_number , reciever_dails , po_number , vehicle_number , po_date , total_cgst , total_sgst, total_amount, gstin ) VALUES({payload.get('invoice_number')} , {payload.get('vendor_id')}, {payload.get('amount')}, {payload.get('invoice_date')}, {payload.get('status')},  {payload.get('invoice_number')},  {payload.get('date')},  {payload.get('reciever-details')},  {payload.get('po_number')},  {payload.get('vehicle_number')},{ payload.get('po_date')}, {payload.get('total_cgst')}, {payload.get('total_sgst')}, {payload.get('total_amount')}, {payload.get('gstin')})"
    try:
        payload = json.loads(payload)
        payload['po_date'] = datetime.strptime(payload.get('po_date'), "%d-%m-%Y").strftime('%Y-%m-%d')
        payload['invoice_date'] = datetime.strptime(payload.get('invoice_date'), "%d-%m-%Y").strftime('%Y-%m-%d')
        query = text("""
            INSERT INTO INVOICES (invoice_number, receiver_details, po_number, vehicle_number, po_date, 
                                    total_cgst, total_sgst, total_amount, gstin, invoice_date) 
            VALUES (:invoice_number, :receiver_details, :po_number, :vehicle_number, :po_date, 
                    :total_cgst, :total_sgst, :total_amount, :gstin, :invoice_date)
        """)

        # Executing the query with parameters
        db.execute(query, {
            "invoice_number": payload.get('invoice_number'),
            "receiver_details": payload.get('receiver_details'),
            "po_number": payload.get('po_number'),
            "vehicle_number": payload.get('vehicle_number'),
            "po_date": payload.get('po_date'),
            "total_cgst": payload.get('total_cgst'),
            "total_sgst": payload.get('total_sgst'),
            "total_amount": payload.get('total_amount'),
            "gstin": payload.get('gstin'),
            "invoice_date": payload.get('invoice_date')
        })

        for i in payload.get('products'):
            query = text("""
                INSERT INTO invoice_items (invoice_number, item_name,item_quantity, item_rate, item_amount, item_cgst, item_sgst) 
                VALUES (:invoice_number, :item_name, :item_quantity, :item_rate, :item_amount, :item_cgst, :item_sgst)
            """)
            db.execute(query, {
                "invoice_number": payload.get('invoice_number'),
                "item_name": i.get('name'),
                "item_quantity": i.get('quantity'),
                "item_rate": i.get('rate'),
                "item_amount": i.get('total_amount'),
                "item_cgst": i.get('cgst_amount'),
                "item_sgst": i.get('sgst_amount')
            })
        # Commit the transaction'
        db.commit()
        UPLOAD_DIR = r"C:\Users\ATHARVA\Invosense2.0\pdf"
        file_path = os.path.join(UPLOAD_DIR, payload.get('invoice_number') + ".pdf")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"message": "Invoice saved successfully", "success": True}
    except Exception as e:
        db.rollback()  # Rollback in case of an error
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/getInvoiceByNumber")
def get_users(payload: dict[str, Any],db: Session = Depends(get_db)):
    
    try:
        query = f"SELECT * FROM INVOICES WHERE invoice_number = '{payload.get('invoice_number')}'"
        result = db.execute(text(query))
        if result:
            main_data = [dict(row._mapping) for row in result]
            if(len(main_data) > 0):
                query = f"SELECT * FROM invoice_items WHERE invoice_number = '{payload.get('invoice_number')}'"
                result = db.execute(text(query))
                items = [dict(row._mapping) for row in result]
                main_data[0]['products'] = items
                return {"message": "Invoice already exists", "success": True, "data": main_data[0]}
            else:
                raise Exception("Invoice not found")
            
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/getInvoicePDF")
def get_invoice_pdf(payload: dict, db: Session = Depends(get_db)):
    try:
        UPLOAD_DIR = r"C:\Users\ATHARVA\Invosense2.0\pdf"
        filename = payload.get('invoice_number')+'.pdf'
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="PDF file not found")

        # Return the PDF file
        return FileResponse(file_path, media_type="application/pdf", filename=filename)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

        
