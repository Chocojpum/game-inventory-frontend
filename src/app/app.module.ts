import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { GameListComponent } from './components/game-list/game-list.component';
import { GameDetailComponent } from './components/game-detail/game-detail.component';
import { GameFormComponent } from './components/game-form/game-form.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { CategoryManagerComponent } from './components/category-manager/category-manager.component';
import { AttributeManagerComponent } from './components/attribute-manager/attribute-manager.component';

const routes: Routes = [
  { path: '', component: GameListComponent },
  { path: 'game/:id', component: GameDetailComponent },
  { path: 'add-game', component: GameFormComponent },
  { path: 'edit-game/:id', component: GameFormComponent },
  { path: 'categories', component: CategoryManagerComponent },
  { path: 'attributes', component: AttributeManagerComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    GameListComponent,
    GameDetailComponent,
    GameFormComponent,
    SearchBarComponent,
    CategoryManagerComponent,
    AttributeManagerComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }