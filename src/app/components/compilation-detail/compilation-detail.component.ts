import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { BacklogService } from '../../services/backlog.service';
import { DlcService } from '../../services/dlc.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { GameDetailBaseComponent } from '../shared/game-detail-base.component';

@Component({
  selector: 'app-compilation-detail',
  templateUrl: `./compilation-detail.component.html`,
  styleUrls: [`./compilation-detail.component.css`],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.8)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class CompilationDetailComponent extends GameDetailBaseComponent implements OnInit {
  includedGames: Game[] = [];
  consoleFamilies: ConsoleFamily[] = [];

  constructor(
    private route: ActivatedRoute,
    router: Router,
    gameService: GameService,
    consoleFamilyService: ConsoleFamilyService,
    backlogService: BacklogService,
    dlcService: DlcService
  ) {
    super(router, gameService, consoleFamilyService, backlogService, dlcService);
  }

  ngOnInit(): void {
    this.consoleFamilyService.getAllFamilies().subscribe(families => {
      this.consoleFamilies = families;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCompilation(id);
      }
    });
  }

  loadCompilation(id: string): void {
    this.gameService.getGame(id).subscribe(game => {
      // If this isn't actually a compilation, fall back to the normal detail view.
      if (!game.isCompilation) {
        this.router.navigate(['/game', game.id]);
        return;
      }
      this.game = game;
      this.loadConsoleFamily();
      this.loadBacklogs();
      this.loadDlcs();
      this.gameService.getIncludedGames(game.id).subscribe(games => {
        this.includedGames = games;
      });
    });
  }

  getConsoleFamilyName(familyId: string): string {
    const family = this.consoleFamilies.find(f => f.id === familyId);
    return family ? family.name : 'Unknown';
  }

  viewIncludedGame(gameId: string): void {
    this.router.navigate(['/game', gameId]);
  }
}
