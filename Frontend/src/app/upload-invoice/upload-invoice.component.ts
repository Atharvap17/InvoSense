import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-upload-invoice',
  templateUrl: './upload-invoice.component.html',
  styleUrls: ['./upload-invoice.component.scss'],
  standalone: false
})
export class UploadInvoiceComponent implements OnInit {
  pdfSrc: SafeResourceUrl | null = null;
  file:any;
  data:any = {
    "invoice_number": "",
    "gstin": "",
    "receiver_details":"",
    "po_number": "",
    "po_date": "",
    "vehicle_number":"",
    "products":[],
    "total_sgst": 0,
    "total_cgst": 0,
    "total_amount": 0
    }
    submit = true
  constructor(private sanitizer: DomSanitizer,private http: HttpClient,
    private route: ActivatedRoute,
    private matsnackbar: MatSnackBar,private router: Router) {}

    ngOnInit(): void {
      const number = this.route.snapshot.paramMap.get('id');
      if(number != 'NEW'){
        this.submit = false;
        this.getInvoiceData(number);
      }else{
        this.submit = true;
      }
    }

    getInvoiceData(number:any){
      const invoiceDetails = this.http.post(`http://localhost:8001/getInvoiceByNumber`, {invoice_number: number});
    const invoiceItems = this.http.post(`http://localhost:8001/getInvoicePDF`,{invoice_number: number},{'responseType': 'blob' as 'json'});
      this.loader = true;
    forkJoin({
      invoiceDetails, 
      invoiceItems
    }).subscribe({
      next: (res:any) =>{
        const url = URL.createObjectURL(res.invoiceItems); // Convert Blob to Object URL
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        let products = []
        res.invoiceDetails.data.products.forEach((element:any) => {
          products.push({
            'name': element.item_name,
            'quantity': element.item_quantity,
            'rate': element.item_rate,
            'cgst_amount': element.item_cgst,
            'sgst_amount': element.item_sgst,
            'total_amount': element.item_amount
        });
        res.invoiceDetails.data.products = products;
        this.data = res.invoiceDetails.data;
        this.loader = false;
      })
    }})
    }

    goBack() {
      this.router.navigate(['/']);  // Navigates back to the home page or previous page
    }
    

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        // Sanitize the URL and assign it to pdfSrc
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result);
        this.callML(file)
      };
      this.file = file;
      reader.readAsDataURL(file); // Convert PDF file to a base64 data URL
    } else {
      alert('Please upload a valid PDF file.');
    }
  }

  loader:boolean = false;

  callML(file:any){
    this.loader = true;
    const payload = new FormData();
    payload.append('file',file);
    this.http.post('http://localhost:8000/extract_invoice',payload)
    .subscribe({
      next: (res:any)=>{
        let total_sgst = 0;
        let total_cgst = 0;
        let total_amount = 0;
        res.products.forEach((element:any) => {
          total_cgst +=Number(element.cgst_amount);
          total_sgst += Number(element.sgst_amount);
          total_amount += Number(element.total_amount);
        });
        res['total_sgst'] = total_sgst;
        res['total_cgst'] = total_cgst;
        res['total_amount'] = total_amount;
        this.data = res;
        this.loader = false;
      }
    })
  }

  submitData(){
    this.loader = true;
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB").split("/").join("-");
    this.data['invoice_date'] = formattedDate;
    const newform = new FormData();
    newform.append('file',this.file);
    newform.append('payload',JSON.stringify(this.data));
    this.http.post('http://localhost:8001/saveInvoices',newform)
    .subscribe({
      next: (res:any)=>{
        this.matsnackbar.open('Invoice Saved Successfully','Close');
        this.loader = false;
        this.router.navigate(['view-invoices']);
      }
    })
  }
}
