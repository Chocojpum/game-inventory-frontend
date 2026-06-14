import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { CategoryService, Category } from '../../services/category.service';
import { AttributeService, Attribute } from '../../services/attribute.service';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { CreationFlowService } from '../../services/creation-flow.service';

@Component({
  selector: 'app-game-form',
  templateUrl: `./game-form.component.html`,
  styleUrls: [`./game-form.component.css`]
})
export class GameFormComponent implements OnInit {
  gameForm: FormGroup;
  isEditMode = false;
  gameId: string | null = null;
  categories: Category[] = [];
  categoryTypes = ['genre', 'franchise', 'saga', 'custom'];
  categorySearchQueries: { [key: string]: string } = {
    genre: '', franchise: '', saga: '', custom: ''
  };
  consoles: Console[] = [];
  consoleFamilies: ConsoleFamily[] = [];
  globalAttributes: Attribute[] = [];
  selectedCategoryIds: string[] = [];
  canHaveDlc = false;
  // Compilation support
  isCompilation = false;
  allGames: Game[] = [];
  selectedIncludedGameIds: string[] = [];
  includedGameSearchQuery = '';
  customAttributesObj: Record<string, any> = {};
  customAttributesArray: Array<{key: string, value: any}> = [];
  newAttributeName = '';
  newAttributeValue = '';
  // Set while returning from a create-flow so the owned console can be matched
  // to its family once the consoles list has loaded.
  private pendingConsoleId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private categoryService: CategoryService,
    private attributeService: AttributeService,
    private consoleService: ConsoleService,
    private consoleFamilyService: ConsoleFamilyService,
    private route: ActivatedRoute,
    private router: Router,
    public flow: CreationFlowService
  ) {
    this.gameForm = this.fb.group({
      title: ['', Validators.required],
      alternateTitles: this.fb.array([]),
      coverArt: ['', Validators.required],
      releaseDate: ['', Validators.required],
      developer: ['', Validators.required],
      consoleFamilyId: ['', Validators.required],
      consoleId: [''],
      region: ['', Validators.required],
      physicalDigital: ['physical', Validators.required],
    });
  }

  get alternateTitles(): FormArray {
    return this.gameForm.get('alternateTitles') as FormArray;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadConsoles();
    this.loadConsoleFamilies();
    this.loadGlobalAttributes();
    this.loadAllGames();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.gameId = id;
    }

    const returned = this.flow.consume(this.router.url);
    if (returned) {
      // Coming back from a "+ New ..." flow: restore what the user had typed
      // and apply the value(s) they just created/selected.
      this.restoreState(returned.returnState);
      this.applyFlowResult(returned.field, returned.resultIds);
    } else if (id) {
      this.loadGame(id);
    }
  }

  // --- Inline creation flow ---

  /** True when this Add Game view was opened to create a compilation member. */
  get isFlowTarget(): boolean {
    return this.flow.active && this.flow.current?.field === 'includedGameIds';
  }

  startCreate(field: string, multi: boolean, createUrl: string, context?: any): void {
    this.flow.start({
      returnUrl: this.router.url,
      returnState: this.captureState(),
      field,
      multi,
      context,
      createUrl,
    });
  }

  private captureState(): any {
    return {
      raw: this.gameForm.getRawValue(),
      selectedCategoryIds: [...this.selectedCategoryIds],
      isCompilation: this.isCompilation,
      selectedIncludedGameIds: [...this.selectedIncludedGameIds],
      customAttributesObj: { ...this.customAttributesObj },
    };
  }

  private restoreState(state: any): void {
    if (!state) return;

    this.alternateTitles.clear();
    (state.raw?.alternateTitles || []).forEach((title: string) => {
      this.alternateTitles.push(this.fb.control(title));
    });
    this.gameForm.patchValue(state.raw || {});

    this.selectedCategoryIds = state.selectedCategoryIds || [];
    this.isCompilation = state.isCompilation || false;
    this.selectedIncludedGameIds = state.selectedIncludedGameIds || [];
    this.customAttributesObj = state.customAttributesObj || {};
    this.updateCustomAttributesArray();
  }

  private applyFlowResult(field: string, ids: string[]): void {
    if (!ids || ids.length === 0) return;
    switch (field) {
      case 'consoleFamilyId':
        this.gameForm.patchValue({ consoleFamilyId: ids[0] });
        break;
      case 'consoleId':
        // Match the new console to its family once consoles have loaded.
        this.pendingConsoleId = ids[0];
        this.applyPendingConsole();
        break;
      case 'categoryIds':
        ids.forEach(id => {
          if (!this.selectedCategoryIds.includes(id)) {
            this.selectedCategoryIds.push(id);
          }
        });
        break;
      case 'includedGameIds':
        ids.forEach(id => {
          if (!this.selectedIncludedGameIds.includes(id)) {
            this.selectedIncludedGameIds.push(id);
          }
        });
        break;
      case 'globalAttribute':
        // Newly created global attributes appear via loadGlobalAttributes().
        break;
    }
  }

  private applyPendingConsole(): void {
    if (!this.pendingConsoleId) return;
    const console = this.consoles.find(c => c.id === this.pendingConsoleId);
    if (!console) return; // consoles not loaded yet; retried after load
    this.gameForm.patchValue({
      consoleFamilyId: console.consoleFamilyId,
      consoleId: console.id,
    });
    this.pendingConsoleId = null;
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadConsoles(): void {
    this.consoleService.getAllConsoles().subscribe(consoles => {
      this.consoles = consoles;
      this.applyPendingConsole();
    });
  }

  loadConsoleFamilies(): void {
    this.consoleFamilyService.getAllFamilies().subscribe(families => {
      this.consoleFamilies = families;
    });
  }

  loadGlobalAttributes(): void {
    this.attributeService.getGlobalAttributes().subscribe(attributes => {
      this.globalAttributes = attributes;
    });
  }

  loadAllGames(): void {
    // Load every game so compilations can pick their members.
    this.gameService
      .getFilteredAndPaginatedGames({}, { page: 1, limit: 9999 })
      .subscribe(result => {
        this.allGames = result.data;
      });
  }

  // --- Compilation member selection ---

  getSelectableGames(): Game[] {
    const query = this.includedGameSearchQuery.toLowerCase().trim();
    return this.allGames.filter(g => {
      if (g.id === this.gameId) return false; // can't include itself
      if (g.isCompilation) return false; // compilations can't nest
      if (!query) return true;
      return g.title.toLowerCase().includes(query);
    });
  }

  isGameIncluded(gameId: string): boolean {
    return this.selectedIncludedGameIds.includes(gameId);
  }

  toggleIncludedGame(gameId: string): void {
    const index = this.selectedIncludedGameIds.indexOf(gameId);
    if (index > -1) {
      this.selectedIncludedGameIds.splice(index, 1);
    } else {
      this.selectedIncludedGameIds.push(gameId);
    }
  }

  loadGame(id: string): void {
    this.gameService.getGame(id).subscribe(game => {
      this.gameForm.patchValue({
        title: game.title,
        coverArt: game.coverArt,
        releaseDate: game.releaseDate.split('T')[0],
        developer: game.developer,
        consoleFamilyId: game.consoleFamilyId,
        consoleId: game.consoleId || '',
        region: game.region,
        physicalDigital: game.physicalDigital,
      });

      if (game.alternateTitles) {
        game.alternateTitles.forEach(title => {
          this.alternateTitles.push(this.fb.control(title));
        });
      }

      this.selectedCategoryIds = game.categoryIds || [];
      this.canHaveDlc = game.canHaveDlc || false;
      this.isCompilation = game.isCompilation || false;
      this.selectedIncludedGameIds = game.includedGameIds || [];
      this.customAttributesObj = game.customAttributes || {};
      this.updateCustomAttributesArray();
    });
  }

  getFilteredCategories(type: string): Category[] {
    const query = this.categorySearchQueries[type].toLowerCase().trim();
    const typedCategories = this.categories.filter(c => c.type === type);
    if (!query) return typedCategories;
    return typedCategories.filter(cat => cat.name.toLowerCase().includes(query));
  }

  getFilteredConsoles(): Console[] {
    const familyId = this.gameForm.get('consoleFamilyId')?.value;
    if (!familyId) return [];
    return this.consoles.filter(c => c.consoleFamilyId === familyId);
  }

  getConsoleName(console: Console): string {
    return `${console.model} - ${console.region} (${console.color})`;
  }

  addAlternateTitle(): void {
    this.alternateTitles.push(this.fb.control(''));
  }

  removeAlternateTitle(index: number): void {
    this.alternateTitles.removeAt(index);
  }

  isCategorySelected(categoryId: string): boolean {
    return this.selectedCategoryIds.includes(categoryId);
  }

  toggleCategory(categoryId: string): void {
    const index = this.selectedCategoryIds.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategoryIds.splice(index, 1);
    } else {
      this.selectedCategoryIds.push(categoryId);
    }
  }

  getAttributeValue(attrName: string): any {
    return this.customAttributesObj[attrName] || '';
  }

  setAttributeValue(attrName: string, event: any): void {
    const attr = this.globalAttributes.find(a => a.name === attrName);
    if (attr?.type === 'boolean') {
      this.customAttributesObj[attrName] = event.target.checked;
    } else if (attr?.type === 'number') {
      this.customAttributesObj[attrName] = parseFloat(event.target.value) || 0;
    } else {
      this.customAttributesObj[attrName] = event.target.value;
    }
    this.updateCustomAttributesArray();
  }

  addCustomAttribute(): void {
    if (this.newAttributeName && this.newAttributeValue) {
      this.customAttributesObj[this.newAttributeName] = this.newAttributeValue;
      this.updateCustomAttributesArray();
      this.newAttributeName = '';
      this.newAttributeValue = '';
    }
  }

  removeCustomAttribute(key: string): void {
    delete this.customAttributesObj[key];
    this.updateCustomAttributesArray();
  }

  updateCustomAttributesArray(): void {
    this.customAttributesArray = Object.entries(this.customAttributesObj).map(([key, value]) => ({
      key, value
    }));
  }

  onSubmit(): void {
    if (this.gameForm.valid) {
      const gameData = {
        ...this.gameForm.value,
        categoryIds: this.selectedCategoryIds,
        customAttributes: this.customAttributesObj,
        canHaveDlc: this.canHaveDlc,
        isCompilation: this.isCompilation,
        includedGameIds: this.isCompilation ? this.selectedIncludedGameIds : [],
      };

      if (this.isEditMode && this.gameId) {
        this.gameService.updateGame(this.gameId, gameData).subscribe(() => {
          this.router.navigate(['/game', this.gameId]);
        });
      } else {
        this.gameService.createGame(gameData).subscribe(game => {
          if (this.isFlowTarget) {
            // Created as a compilation member: hand the new game back.
            this.flow.finish([game.id]);
          } else {
            this.router.navigate(['/game', game.id]);
          }
        });
      }
    }
  }

  cancel(): void {
    if (this.isFlowTarget) {
      this.flow.abort();
    } else if (this.isEditMode && this.gameId) {
      this.router.navigate(['/game', this.gameId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}