import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { GameListComponent } from './components/game-list/game-list.component';
import { GameDetailComponent } from './components/game-detail/game-detail.component';
import { CompilationDetailComponent } from './components/compilation-detail/compilation-detail.component';
import { GameFormComponent } from './components/game-form/game-form.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { CategoryManagerComponent } from './components/category-manager/category-manager.component';
import { AttributeManagerComponent } from './components/attribute-manager/attribute-manager.component';
import { ConsoleListComponent } from './components/console-list/console-list.component';
import { ConsoleDetailComponent } from './components/console-detail/console-detail.component';
import { ConsoleFormComponent } from './components/console-form/console-form.component';
import { PeripheralListComponent } from './components/peripheral-list/peripheral-list.component';
import { PeripheralFormComponent } from './components/peripheral-form/peripheral-form.component';
import { BacklogManagerComponent } from './components/backlog-manager/backlog-manager.component';
import { AddonManagerComponent } from './components/addon-manager/addon-manager.component';
import { BacklogListComponent } from './components/backlog-list/backlog-list.component';

import { ConsoleFamilyManagerComponent } from './components/console-family-manager/console-family-manager.component';
import { PaginationControlsComponent } from './components/shared/pagination-controls/pagination-controls.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { OverflowClassDirective } from './directives/overflow-class.directive';

const routes: Routes = [
  { path: '', component: GameListComponent },
  { path: 'game/:id', component: GameDetailComponent },
  { path: 'compilation/:id', component: CompilationDetailComponent },
  { path: 'add-game', component: GameFormComponent },
  { path: 'edit-game/:id', component: GameFormComponent },
  { path: 'console-families', component: ConsoleFamilyManagerComponent },
  { path: 'consoles', component: ConsoleListComponent },
  { path: 'console/:id', component: ConsoleDetailComponent },
  { path: 'add-console', component: ConsoleFormComponent },
  { path: 'edit-console/:id', component: ConsoleFormComponent },
  { path: 'peripherals', component: PeripheralListComponent },
  { path: 'add-peripheral', component: PeripheralFormComponent },
  { path: 'edit-peripheral/:id', component: PeripheralFormComponent },
  { path: 'categories', component: CategoryManagerComponent },
  { path: 'attributes', component: AttributeManagerComponent },
  { path: 'backlog', component: BacklogListComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    GameListComponent,
    GameDetailComponent,
    CompilationDetailComponent,
    GameFormComponent,
    SearchBarComponent,
    CategoryManagerComponent,
    AttributeManagerComponent,
    ConsoleFamilyManagerComponent,
    ConsoleListComponent,
    ConsoleDetailComponent,
    ConsoleFormComponent,
    PeripheralListComponent,
    PeripheralFormComponent,
    BacklogManagerComponent,
    AddonManagerComponent,
    BacklogListComponent,
    PaginationControlsComponent,
    ClickOutsideDirective,
    OverflowClassDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    // Scrolling to top is handled manually in AppComponent so it only happens
    // on a real route (path) change, not when list views update their query
    // params for pagination/filters.
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'disabled' }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }