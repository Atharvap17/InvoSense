import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false
})
export class AppComponent {
  title = 'Invosense'; // Application title
  uploadedPdfUrl: string | null = null; // URL for the uploaded PDF file

  /**
   * Handles the file upload event.
   * @param event File input event
   */
  onFileUpload(event: any): void {
    const file = event.target.files[0]; // Get the selected file
    if (file && file.type === 'application/pdf') {
      const fileReader = new FileReader();
      fileReader.onload = (e: any) => {
        this.uploadedPdfUrl = e.target.result; // Set the file data as the PDF URL
      };
      fileReader.readAsDataURL(file); // Read the file as a Data URL
    } else {
      alert('Please upload a valid PDF file!');
    }
  }

}
