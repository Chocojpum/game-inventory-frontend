import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { CategoryService, Category } from '../../services/category.service';
import { AttributeService, Attribute } from '../../services/attribute.service';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';

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
  customAttributesObj: Record<string, any> = {};
  customAttributesArray: Array<{key: string, value: any}> = [];
  newAttributeName = '';
  newAttributeValue = '';

  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private categoryService: CategoryService,
    private attributeService: AttributeService,
    private consoleService: ConsoleService,
    private consoleFamilyService: ConsoleFamilyService,
    private route: ActivatedRoute,
    private router: Router
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

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.gameId = id;
      this.loadGame(id);
    }
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadConsoles(): void {
    this.consoleService.getAllConsoles().subscribe(consoles => {
      this.consoles = consoles;
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
      };

      if (this.isEditMode && this.gameId) {
        this.gameService.updateGame(this.gameId, gameData).subscribe(() => {
          this.router.navigate(['/game', this.gameId]);
        });
      } else {
        this.gameService.createGame(gameData).subscribe(game => {
          this.router.navigate(['/game', game.id]);
        });
      }
    }
  }

  cancel(): void {
    if (this.isEditMode && this.gameId) {
      this.router.navigate(['/game', this.gameId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}