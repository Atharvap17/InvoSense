import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module'; 
import { DashboardComponent } from './dashboard/dashboard.component';
import { UploadInvoiceComponent } from './upload-invoice/upload-invoice.component';
import { InvoiceTableComponent } from './invoice-table/invoice-table.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import Firebase Modules
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { CallbackComponent } from './callback/callback.component';
import { AuthGuard } from './auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    UploadInvoiceComponent,
    InvoiceTableComponent,
    LoginComponent,
    CallbackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,  // ✅ Moved inside
    MaterialModule   // ✅ Moved inside
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
