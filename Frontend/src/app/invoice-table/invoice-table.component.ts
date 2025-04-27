import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-invoice-table',
  templateUrl: './invoice-table.component.html',
  styleUrls: ['./invoice-table.component.scss'],
  standalone: false
})
export class InvoiceTableComponent implements OnInit{

  constructor(private http: HttpClient,private router: Router){}
  displayedColumns: string[] = ['invoice_number', 'po_number', 'invoice_date','total_amount','view'];
  invoices = [
  ];
  loader = false;
  
  ngOnInit(): void {
    this.loader = true;
    this.http.get('http://localhost:8001/getInvoices')
    .subscribe({
      next: (res:any) =>{
        this.invoices = res.data;
        this.loader = false;
      }
    })
  }

  goBack() {
    this.router.navigate(['/']);  // Navigates back to the home page or previous page
  }

  exportToExcel(){
    this.downloadExcel(this.invoices, 'invoices'); // Downloads the invoices data as an excel file
  }

  viewInvoice(data:any){
    this.router.navigate(['/upload-invoice',data.invoice_number]); // Navigates to the upload invoice page with the invoice number
  }

  downloadExcel(data: any[], fileName: string): void {
    const worksheet = XLSX.utils.json_to_sheet(data); // Convert JSON to worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1'); // Append worksheet

    // Write workbook and create a Blob
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Create an object URL and trigger download without `file-saver`
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Cleanup memory
  }
}
