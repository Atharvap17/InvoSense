import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // ✅ Import Router

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'], // ✅ Corrected 'styleUrls'
  standalone: false
})
export class DashboardComponent implements OnInit {
  totalInvoices: number = 0;
  pendingInvoices: number = 0;
  approvedInvoices: number = 0;
  rejectedInvoices: number = 0;
  appName = '';
  recentInvoices: any[] = [];
  photoUrl = ''
  showLogout = false

  // ✅ Inject Router in the constructor
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchDashboardData();
    this.photoUrl = JSON.parse(sessionStorage.getItem('user') || '{}').picture; // Get user photo URL from session storage
  }

  fetchDashboardData(): void {
    this.totalInvoices = 120;
    this.pendingInvoices = 15;
    this.approvedInvoices = 95;
    this.rejectedInvoices = 10;

    this.recentInvoices = [
      { id: 1, vendor: 'Vendor A', status: 'Pending', amount: 5000, date: '2025-01-05' },
      { id: 2, vendor: 'Vendor B', status: 'Approved', amount: 2000, date: '2025-01-03' },
      { id: 3, vendor: 'Vendor C', status: 'Rejected', amount: 4500, date: '2025-01-02' },
      { id: 4, vendor: 'Vendor D', status: 'Approved', amount: 8000, date: '2025-01-01' },
    ];
  }

  handleInvoiceAction(invoiceId: number, action: string) {
    console.log(`Performing ${action} on invoice ID: ${invoiceId}`);
  }
  

  // ✅ Corrected Logout Function
  logout() {
    sessionStorage.clear(); // Remove user session
    this.router.navigate(['/login']); // Redirect to login page
    this.showLogout = false
  }
}
