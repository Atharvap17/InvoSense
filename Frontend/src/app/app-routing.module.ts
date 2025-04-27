import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UploadInvoiceComponent } from './upload-invoice/upload-invoice.component';
import { InvoiceTableComponent } from './invoice-table/invoice-table.component';
import { LoginComponent } from './login/login.component';
import { CallbackComponent } from './callback/callback.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] }, // Default route (Dashboard)
  { path: 'upload-invoice/:id', component: UploadInvoiceComponent, canActivate: [AuthGuard] }, // Upload Invoice
  {path: 'login', component: LoginComponent},
  { path: 'view-invoices', component: InvoiceTableComponent , canActivate: [AuthGuard]},
  {path: 'callback' , component: CallbackComponent} ,// Invoice Table
  { path: '**', redirectTo: '' } // Redirect unknown routes to Dashboard
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
