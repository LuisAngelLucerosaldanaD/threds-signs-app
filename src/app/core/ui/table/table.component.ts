import {
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
  CdkHeaderRow, CdkHeaderRowDef, CdkRow, CdkRowDef,
  CdkTable
} from '@angular/cdk/table';
import {NgClass} from '@angular/common';
import {SelectionModel} from '@angular/cdk/collections';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'trs-table',
  imports: [
    CdkCell,
    CdkCellDef,
    CdkColumnDef,
    CdkTable,
    CdkHeaderCell,
    CdkHeaderCellDef,
    NgClass,
    CdkHeaderRow,
    CdkHeaderRowDef,
    CdkRow,
    CdkRowDef,
    DropdownComponent,
    FormsModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit, OnChanges {
  public selectable = input(false);
  public headers = input<string[]>([]);
  public data = input<any[]>([]);
  public sortable = input(false);
  public paginate = input(false);
  public pages = input<number[]>([]);
  protected table = viewChild(CdkTable);
  public trsChange = output<any[]>({alias: 'dft-change'});

  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _typeSort: 'asc' | 'desc' = 'asc';

  protected dataDisplayed = signal<any[]>([]);
  protected selection = new SelectionModel<any>(true, []);
  protected optPages = [
    {label: '5', value: 5},
    {label: '10', value: 10},
    {label: '20', value: 20},
    {label: '50', value: 50}
  ];
  protected itemsPerPage = 5;
  protected currentPage = 1;
  protected totalPages = 1;
  protected columns: { label: string; value: string }[] = [];
  protected showColumns = signal<string[]>([]);
  protected columnsSelected: string = '';

  ngOnInit() {
    if (this.headers && this.headers().length > 0) {
      this.columns = this.headers().map(header => ({label: header, value: header}));
      this.columnsSelected = this.headers().join(',');
      this.showColumns.set(this.headers());
    }

    if (this.selectable()) {
      this.headers().unshift('select');
    }

    if (this.pages() && this.pages().length) {
      this.itemsPerPage = this.pages()[0];
      this.optPages = this.pages().map(page => ({label: page.toString(), value: page}));
    }

    if (this.data() && this.data().length) {
      if (this.paginate()) {
        this.changePage({value: this.itemsPerPage});
      } else {
        this.dataDisplayed.set(this.data());
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && changes['data'].currentValue && !changes['data'].firstChange) {
      if (this.paginate()) {
        this.changePage({value: this.itemsPerPage});
      } else {
        this.dataDisplayed.set(changes['data'].currentValue);
      }
      // TODO: validate unchecked rows
      this._changeDetectorRef.markForCheck();
      this.table()?.renderRows();
    }

    if (changes['headers'] && changes['headers'].currentValue && !changes['headers'].firstChange) {
      this.columnsSelected = this.headers().join(',');
      if (changes['headers'].previousValue.includes('select')) this.headers().unshift('select');
      this.showColumns.set(this.headers());
      this._changeDetectorRef.markForCheck();
      this.table()?.renderRows();
    }

    if (changes['selectable'] && !changes['selectable'].firstChange) {
      if (this.selectable()) {
        this.headers().unshift('select');
      } else {
        this.selection.clear();
        this.headers().shift();
      }
      this._changeDetectorRef.markForCheck();
      this.table()?.renderRows();
    }
  }

  protected isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.data().length;
    return numSelected === numRows;
  }

  protected toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.data());
    this.trsChange.emit(this.selection.selected);
  }

  protected toggleRow(row: any): void {
    this.selection.toggle(row);
    this.trsChange.emit(this.selection.selected);
  }

  protected sortData(header: string): void {
    if (!this.sortable()) return;
    this.data().sort((a, b) => {
      if (this._typeSort === 'asc') {
        return a[header] > b[header] ? 1 : -1;
      }
      return a[header] > b[header] ? -1 : 1;
    });

    this._typeSort = this._typeSort === 'asc' ? 'desc' : 'asc';
    this._changeDetectorRef.markForCheck();
    if (this.paginate()) {
      this.changePage({value: this.itemsPerPage});
    } else {
      this.dataDisplayed.set(this.data());
    }
    this.table()?.renderRows();
  }

  protected changePage(event: any): void {
    this.itemsPerPage = event.value;
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.data().length / this.itemsPerPage);
    this.dataDisplayed.set(this.data().slice(0, this.itemsPerPage));
    this._changeDetectorRef.markForCheck();
  }

  protected nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.dataDisplayed.set(this.data().slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage));
      this._changeDetectorRef.markForCheck();
    }
  }

  protected previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.dataDisplayed.set(this.data().slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage));
      this._changeDetectorRef.markForCheck();
    }
  }

  protected selectColumn(event: any): void {
    const showColumns = event.value;
    showColumns.unshift('select');
    this.showColumns.set(showColumns);
    this._changeDetectorRef.markForCheck();
    this.table()?.renderRows();
  }
}
