import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormperformanceComponent } from '../formperformance/formperformance.component';
import { PerformanceService } from '../services/performance.service';
import { Colis } from '../models/performance';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {startWith, map} from 'rxjs/operators';
import {NgFor, AsyncPipe} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule, Validators} from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import {ErrorStateMatcher, MatNativeDateModule} from '@angular/material/core';
import { PaginationControlsDirective } from 'ngx-pagination';
import * as alertify from 'alertifyjs';




export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-performance-colis',
  templateUrl: './performance-colis.component.html',
  styleUrls: ['./performance-colis.component.scss']
})
export class PerformanceColisComponent implements OnInit{
  @ViewChild(PaginationControlsDirective) paginationControls!: PaginationControlsDirective;
  @ViewChild('yourDialogElement') yourDialogElement!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef

  clientsPagin: Colis[] = [];
  chiffre: Colis[] = [];

  pagedClientList: Colis[] | null = [];
  clients: string[] = [];
  Commerce: string[] = [];
  gov: string[] = [];
  page = 1;
  limit = 6;
  totalItems = 0;
  totalPages = 20;
  iC: number=1;
  showNomClForm = false;
  showNomComForm = false;
  showNomGovForm = false;
  showNomClFormchiffre = false;
  showNomComFormchiffre = false;
  showNomGovFormchiffre = false;
  showDateFormchiffre=false;
  filteredFactList: Colis[] = [];
  filteredFactchiffre: Colis[] = [];
 chiffreList: [] = [];
  selectedNomCl: { [key: string]: { isChecked: boolean } } = {};
  selectedNomCom: { [key: string]: { isChecked: boolean } } = {};
  selectedGov: { [key: string]: { isChecked: boolean } } = {};   
  selectedNomClchiffre: { [key: string]: { isChecked: boolean } } = {};
  selectedNomComchiffre: { [key: string]: { isChecked: boolean } } = {};
  selectedGovchiffre: { [key: string]: { isChecked: boolean } } = {};  
  selectedDateshiffre!:Date;
  pagedChiffreList: Colis[] | null = [];
  pageChiffre = 1;
  limitChiffre = 3;
  totalItemsChiffre = 0;
  totalPagesChiffre = 20;
  gouvernoratsTunisie: string[] = ['Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'];
  selectedDate!: Date ;

  chiffreData: any;
  chiffreData1:any;

  selectedFile: File | null = null;  
  colisList: Colis[] = [];
  coliform!:FormGroup;
  colis: Colis = new Colis();
  users: any;
  creColis:Colis =new Colis();
  successMessage: string = ''

  private validerClickedSubscription: Subscription;
  constructor(private formPerformance: PerformanceService,public dialog: MatDialog,private _formBuilder: FormBuilder,private form:FormBuilder) {

    this.validerClickedSubscription = this.formPerformance.validerClicked$.subscribe(() => {
      this.getAllClients();
    });
    this.formPerformance.colisCreated.subscribe((isCreated: boolean) => {
      if (isCreated) {
        this.getAllClients();
        // Refresh your table or perform any other action
        console.log('Table refreshed');
      }
    });
    this.selectedNomCl = {};
    this.selectedNomCom = {};
    this.selectedGov = {};

    this.coliform= this.form.group({
      nomCl:['', Validators.required],
      ColLiv:['', Validators.required], //colis livre hiya elli recu par l'expediteur ?
      ColRtr:['', Validators.required],//famma coli retour wo mafamesh cols recu
      CaAutre:['', Validators.required],
      Cr:['', Validators.required]

    })
  }
  


  ngOnInit(): void {

 
    this.getAllClients();
    this.getALLcommercial();
    this.getAllClientsFiltre();
    this.getChiffre()
    this.setICFromSelectedClient(1);
    this.getAllClientsform();
    this.filteredClients = this.clients;
    this.filterClients();
    this.getAllClientsFiltrefiltre();


  }

  ngOnDestroy(): void {
    // Unsubscribe from the subscription to avoid memory leaks
    if (this.validerClickedSubscription) {
      this.validerClickedSubscription.unsubscribe();
    }
  }
  //listechiffre
  getChiffre(): void {
    const nomClFilter = Object.keys(this.selectedNomClchiffre)
      .filter(key => this.selectedNomClchiffre[key].isChecked)
      .join(',');
  
    const nomComFilter = Object.keys(this.selectedNomComchiffre)
      .filter(key => this.selectedNomComchiffre[key].isChecked)
      .join(',');
  
    const govFilter = Object.keys(this.selectedGovchiffre)
      .filter(key => this.selectedGovchiffre[key].isChecked)
      .join(',');
  
    this.formPerformance.getChiffre<Colis>(
      this.pageChiffre,
      this.totalItemsChiffre,
      nomClFilter,
      nomComFilter,
      govFilter,
      this.selectedDateshiffre // Pass the selected date directly
    ).subscribe((paginatedResponse) => {
      this.chiffre = paginatedResponse.items;
      this.applyFilterChiffre();
      console.log('chiffresss', this.chiffre);
    });
  }
  


  applyFilterChiffre(): void {
    const selectedNomClKeys: string[] = [];
    const selectedNomComKeys: string[] = [];
    const selectedGovKeys: string[] = [];
  
    for (const key in this.selectedNomClchiffre) {
      if (this.selectedNomClchiffre.hasOwnProperty(key) && this.selectedNomClchiffre[key].isChecked) {
        selectedNomClKeys.push(key);
      }
    }
  
    for (const key in this.selectedNomComchiffre) {
      if (this.selectedNomComchiffre.hasOwnProperty(key) && this.selectedNomComchiffre[key].isChecked) {
        selectedNomComKeys.push(key);
      }
    }
  
    for (const key in this.selectedGovchiffre) {
      if (this.selectedGovchiffre.hasOwnProperty(key) && this.selectedGovchiffre[key].isChecked) {
        selectedGovKeys.push(key);
      }
    }
  
    let filteredData = this.chiffre;
  
    if (selectedNomClKeys.length > 0) {
      filteredData = filteredData.filter((client: Colis) => {
        const clientNomCl = (client.nomCl || '').toString().toLowerCase();
        return selectedNomClKeys.some(selectedNomClKey => clientNomCl.includes(selectedNomClKey));
      });
    }
  
    if (selectedNomComKeys.length > 0) {
      filteredData = filteredData.filter((client: Colis) => {
        const clientNomCom = (client.nomCom || '').toString().toLowerCase();
        return selectedNomComKeys.some(selectedNomComKey => clientNomCom.includes(selectedNomComKey));
      });
    }
  
    if (selectedGovKeys.length > 0) {
      filteredData = filteredData.filter((client: Colis) => {
        const clientGov = (client.gov || '').toString().toLowerCase();
        return selectedGovKeys.some(selectedGovKey => clientGov.includes(selectedGovKey));
      });
    }
  
    const selectedDate = this.selectedDateshiffre;
    if (selectedDate) {
      const formattedSelectedDate = selectedDate instanceof Date ? selectedDate.toISOString().split('T')[0] : selectedDate;
      filteredData = filteredData.filter((client: Colis) => {
        const clientDate = client.date;
        const clientDateISO = clientDate instanceof Date ? clientDate.toISOString().split('T')[0] : clientDate;
        return clientDateISO === formattedSelectedDate;
      });
    }
  
    this.filteredFactchiffre = filteredData;  
    this.totalItemsChiffre = this.filteredFactchiffre.length;
    this.totalPagesChiffre = Math.ceil(this.totalItemsChiffre / this.limitChiffre);
  
    this.changePageChiffre(1);
  
    if (this.totalItemsChiffre === 0) {
      this.pagedChiffreList = null;
    } else {
      this.pagedChiffreList = this.filteredFactchiffre.slice(
        (this.pageChiffre - 1) * this.limitChiffre,
        this.pageChiffre * this.limitChiffre
      );
    }
  }

  pageSize = 10;
  visiblePages: number[] = [];

  getVisiblePagesArrayChiffre(): void {
    const visiblePagesCount = 5;
    const start = Math.max(1, this.pageChiffre - Math.floor(visiblePagesCount / 2));
    const end = Math.min(start + visiblePagesCount - 1, this.totalPagesChiffre);
    this.visiblePages = new Array(end - start + 1).fill(0).map((_, index) => start + index);
  }
  
  changePageChiffre(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPagesChiffre) {
      this.pageChiffre = newPage;
      this.getVisiblePagesArrayChiffre();
  
      this.pagedChiffreList = this.filteredFactchiffre.slice(
        (this.pageChiffre - 1) * this.limitChiffre,
        this.pageChiffre * this.limitChiffre
      );
    }

  }


getAllClientsFiltre(): void {
  this.formPerformance.getAllClients().subscribe(
    (clients) => {
      this.clients = clients;
      console.log('clients', this.clients);
    },
    (error) => {
      console.error('Error getting clients in component:', error);
    }
  );
}

 

getALLcommercial():void{
  this.formPerformance.getAllCommerciaux().subscribe((data)=>{
    this.Commerce = data;
    console.log(this.Commerce);
  });
}
  isCollapsed = false;
  COMERCIO= false;
  selectedRow: any | null = null;
  sidebarWidth = 250; // Initial width of the sidebar
 
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
   
    this.updateSidebarWidth();

    setTimeout(() => {
      this.COMERCIO=!this.COMERCIO;
        }, 250);
  }


  updateSidebarWidth() {
    this.sidebarWidth = this.isCollapsed ? 100 : 250; // Adjust collapsed and expanded widths as needed
  }
  isFormVisible = false;

  openFormDialog(): void {
    const dialogRef = this.dialog.open(FormperformanceComponent
      // Adjust the width as needed
    );

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // You can perform actions after the dialog is closed if needed
    });
  }
   // Store the selected row data

  // Handle row click
  onRowClick(row: any) {
    this.selectedRow = row;
  }
  isCommercialFilterOpen = false;
  isGovernouratFilterOpen = false;
  isDateFilterOpen = false;
  isClientFilterOpen = false;
  isCommercialPerformanceFilterOpen = false;
  isGovernouratPerformanceFilterOpen = false;
  isDatePerformanceFilterOpen = false;
  

  toggleCommercialFilter() {
    this.isCommercialFilterOpen = !this.isCommercialFilterOpen;
  }

  closeCommercialFilter() {
    this.isCommercialFilterOpen = false;
  }
 Colislist:Colis[]=[];


  toggleGovernouratFilter() {
    this.isGovernouratFilterOpen = !this.isGovernouratFilterOpen;
  }

  closeGovernouratFilter() {
    this.isGovernouratFilterOpen = false;
  }


  toggleDateFilter() {
    this.isDateFilterOpen = !this.isDateFilterOpen;
  }

  closeDateFilter() {
    this.isDateFilterOpen = false;
  }



  getAllClients():void{
    const nomClFilter = Object.keys(this.selectedNomCl)
    .filter(key => this.selectedNomCl[key].isChecked)
    .join(',');

  const nomComFilter = Object.keys(this.selectedNomCom)
    .filter(key => this.selectedNomCom[key].isChecked)
    .join(',');

    const govFilter = Object.keys(this.selectedGov)
    .filter(key => this.selectedGov[key].isChecked)
    .join(',');

  this.formPerformance.getAllColisFiltre<Colis>(this.page, this.totalItems, nomClFilter, nomComFilter , govFilter, this.selectedDate)
    .subscribe((paginatedResponse) => {
      this.clientsPagin = paginatedResponse.items;
      this.applyFilter();
      console.log('users', this.clientsPagin);
      console.log("page", this.totalPages);
    });
  }

  applyFilter(): void {
    this.filteredFactList = this.clientsPagin.slice();
  
    const areAllCheckboxesUncheckedNomCl = Object.values(this.selectedNomCl).every(item => !item.isChecked);
    const areAllCheckboxesUncheckedNomCom = Object.values(this.selectedNomCom).every(item => !item.isChecked);
    const areAllCheckboxesUncheckedGov = Object.values(this.selectedGov).every(item => !item.isChecked);
  
    if (this.selectedDate) {
      const selectedDate = this.selectedDate instanceof Date ? this.selectedDate : new Date(this.selectedDate);
  
      this.filteredFactList = this.filteredFactList.filter((client) => {
        const clientDate = client.date ? new Date(client.date) : null;
  
        return (
          clientDate instanceof Date &&
          !isNaN(clientDate.getTime()) &&
          selectedDate instanceof Date &&
          !isNaN(selectedDate.getTime()) &&
          clientDate.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
        );
      });
    }
  
    if (!areAllCheckboxesUncheckedNomCl || !areAllCheckboxesUncheckedNomCom || !areAllCheckboxesUncheckedGov) {
      this.filteredFactList = this.filteredFactList.filter((client) => {
        const clientNomCl = (client.nomCl || '').toString().toLowerCase();
        const clientNomCom = (client.nomCom || '').toString().toLowerCase();
        const clientGov = (client.gov || '').toString().toLowerCase();
  
        const isSelectedNomCl = this.selectedNomCl[clientNomCl]?.isChecked !== undefined ? this.selectedNomCl[clientNomCl]?.isChecked : false;
        const isSelectedNomCom = this.selectedNomCom[clientNomCom]?.isChecked !== undefined ? this.selectedNomCom[clientNomCom]?.isChecked : false;
        const isSelectedGov = this.selectedGov[clientGov]?.isChecked !== undefined ? this.selectedGov[clientGov]?.isChecked : false;
  
        return (isSelectedNomCl || isSelectedNomCom || isSelectedGov) ||
          (!Object.keys(this.selectedNomCl).length && !Object.keys(this.selectedNomCom).length && !Object.keys(this.selectedGov).length);
      });
    }
  
    this.totalItems = this.filteredFactList.length;
    this.totalPages = Math.ceil(this.totalItems / this.limit);
  
    this.changePage(1);
  
    if (this.totalItems === 0) {
      this.pagedClientList = null;
    } else {
      this.pagedClientList = this.filteredFactList.slice((this.page - 1) * this.limit, this.page * this.limit);
    }
  }
  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
       this.getVisiblePagesArray();
      this.pagedClientList = this.filteredFactList.slice(
        (this.page - 1) * this.limit,
        this.page * this.limit
      );
    }
  }

  visiblePagesList: number[] = [];
  getVisiblePagesArray(): void {
    const visibleRangeCount = 5;
    const start = Math.max(1, this.page - Math.floor(visibleRangeCount / 2));
    const end = Math.min(start + visibleRangeCount - 1, this.totalPages);
    this.visiblePagesList = new Array(end - start + 1).fill(0).map((_, index) => start + index);
}

  getPagesArray(): number[] {
    return new Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }

  toggleCheckboxchiffre(value: string, category: string): void {
    const lowercaseValue = value.toLowerCase();
  
    let categoryArray: { value: string; isChecked: boolean }[];
    
    switch (category) {
        case 'nomCl':
            categoryArray = Object.entries(this.selectedNomClchiffre).map(([key, value]) => ({ value: key, isChecked: value.isChecked }));
            break;
        case 'nomCom':
            categoryArray = Object.entries(this.selectedNomComchiffre).map(([key, value]) => ({ value: key, isChecked: value.isChecked }));
            break;
        case 'gov':
            categoryArray = Object.entries(this.selectedGovchiffre).map(([key, value]) => ({ value: key, isChecked: value.isChecked }));
            break;
        default:
            console.error('Invalid category:', category);
            return;
    }
  
    const existingIndex = categoryArray.findIndex(item => item.value === lowercaseValue);
  
    if (existingIndex === -1) {
        categoryArray.push({ value: lowercaseValue, isChecked: true });
    } else {
        categoryArray[existingIndex].isChecked = !categoryArray[existingIndex].isChecked;
    }
  
    const newSelectedCategory: { [key: string]: { isChecked: boolean } } = {};
    categoryArray.forEach(item => {
        newSelectedCategory[item.value] = { isChecked: item.isChecked };
    });
  
    switch (category) {
        case 'nomCl':
            this.selectedNomClchiffre = newSelectedCategory;
            break;
        case 'nomCom':
            this.selectedNomComchiffre = newSelectedCategory;
            break;
        case 'gov':
            this.selectedGovchiffre = newSelectedCategory;
            break;
    }
  
    this.applyFilterChiffre();
  }
  toggleCheckbox(gouvernorat: string, formType: string): void {
    const lowercaseGouvernorat = gouvernorat.toLowerCase();
    const selectedNom = formType === 'nomCL' ? this.selectedNomCl : formType === 'nomCom' ? this.selectedNomCom : this.selectedGov;
  
    console.log('Before toggle:', selectedNom[lowercaseGouvernorat]);
  
    if (!selectedNom[lowercaseGouvernorat]) {
      selectedNom[lowercaseGouvernorat] = { isChecked: true };
    } else {
      selectedNom[lowercaseGouvernorat].isChecked = !selectedNom[lowercaseGouvernorat].isChecked;
    }
  
    console.log('After toggle:', selectedNom[lowercaseGouvernorat]);
  
    this.applyFilter();
  }


  setICFromSelectedClient(selectedIndex: number): void {
    this.iC = selectedIndex;
    console.log("iC", this.iC);
    this.fetchChiffreData();
  }

  // colis par id
  fetchChiffreData() {
    if (this.iC !== null) {
      this.formPerformance.getChiffreById(this.iC).subscribe(
        (data) => {
          this.chiffreData = data;
        },
        (error) => {
          console.error('Error fetching chiffre data:', error);
        }
      );
    }
  }

  toggleFormchiffre(formType: string): void {
    if (formType === 'nomCL') {
      this.showNomClFormchiffre = !this.showNomClFormchiffre;
      this.showNomComFormchiffre = false;
      this.showNomGovFormchiffre=false;
      this.showDateFormchiffre=false;
      if (this.showNomClFormchiffre) {
        this.filteredClients = this.clients;
      }
    }  if (formType === 'gov') {
      this.showNomGovFormchiffre = !this.showNomGovFormchiffre;
      this.showNomComFormchiffre = false;
      this.showNomClFormchiffre = false;
      this.showDateFormchiffre=false;
    } else if (formType === 'nomCom') {
      this.showNomComFormchiffre = !this.showNomComFormchiffre;
      this.showNomClFormchiffre = false;
      this.showNomGovFormchiffre=false;
      this.showDateFormchiffre=false;

    }else if (formType === 'date'){
      this.showDateFormchiffre=!this.showDateFormchiffre;
      this.showNomComFormchiffre =false;
      this.showNomClFormchiffre = false;
      this.showNomGovFormchiffre=false;
    }
  }

  

  isPopupVisible = false;

  openDialog(): void {
    this.isPopupVisible = true;
  }

  closeDialog(): void {
    this.isPopupVisible = false;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  

  //form
  selected = new FormControl('valid', [Validators.required, Validators.pattern('valid')]);

  selectFormControl = new FormControl('valid', [Validators.required, Validators.pattern('valid')]);

  nativeSelectFormControl = new FormControl('valid', [
    Validators.required,
    Validators.pattern('valid'),
  ]);

  matcher = new MyErrorStateMatcher();





  createColis(): void {
    if (this.selectedFile) {
      this.uploadExcel();
 
    } else {
      const formValues = this.coliform.value;
      this.formPerformance.createColis(formValues).subscribe(
        (response) => {
          this.successMessage = 'Client created successfully!';
          console.log('Client created successfully', response);
          this.coliform.reset();
     
        },
        (error) => {
          console.error(error);
          // Handle error appropriately
        }
      );
    }
  }

  

  clearFileInput(): void {
    const fileInputElement = this.fileInput.nativeElement as HTMLInputElement;
    fileInputElement.value = ''; 
    this.selectedFile = null; 
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadExcel():void{
    if (!this.selectedFile) {
      alert('Please select a file.');
      return;
    }
    this.formPerformance.uploadExcel(this.selectedFile).subscribe(
      response => {
        console.log(response);
        this.successMessage = 'File uploaded successfully.';
        this.clearFileInput();
        this.selectedFile = null;
      },
      error => {
        console.error(error);
        alert('Error uploading file.');
      }
    );
  }
  getAllClientsform():void{
    this.formPerformance.getAllColis().subscribe((date)=>{
      this.colisList= date;
      console.log(this.colisList);
    });
  }

    
  



  // ... your existing code


  handleValiderClicked(): void {
    this.closeDialog(); // Close the popup when "Valider" is clicked
  }

  filteredClients: string[] = [];
  searchTerm: string = '';
  filterClients() {
    this.filteredClients=this.clients;
    this.filteredClients = this.clients.filter(client => client.toLowerCase().includes(this.searchTerm.toLowerCase()));
    console.log(this.filteredClients)
  }

  filterValue: string = '';
  getAllClientsFiltrefiltre(): void {
    this.formPerformance.getAllClientsfiltre(this.filterValue).subscribe(
      (clients) => {
        this.clients = clients;
        console.log('clients', this.clients);
      },
      (error) => {
        console.error('Error getting clients in component:', error);
      }
    );
  }


  goToFirstPage(): void {
    this.changePage(1);
  }
  
  goToLastPage(): void {
    this.changePage(this.totalPages);
  }

  
  goToFirstPageChiffre(): void {
    this.changePageChiffre(1);
  }
  
  goToLastPageChiffre(): void {
    this.changePageChiffre(this.totalPagesChiffre);
  }
}
