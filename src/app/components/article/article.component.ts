import { Component, Input } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';
import { ActionSheetController, Platform } from '@ionic/angular';
import { Article } from 'src/app/interfaces';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent {
  @Input() public article!: Article;
  @Input() public index?: number;

  constructor(
    private platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private storageService: StorageService
  ) {}

  async openArticle() {
    if (this.platform.is('ios') || this.platform.is('android')) {
      try {
        await Browser.open({ url: this.article.url });
      } catch (error) {
        console.error('Error al abrir el navegador:', error);
      }
    } else {
      window.open(this.article.url, '_blank');
    }
  }

  async onOpenMenu() {

    const isArticleInFavorite = this.storageService.articleInFavorites(this.article);

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Options',
      buttons: [
        {
          text: isArticleInFavorite ? 'Remove from favorites' : 'Favorite',
          icon: isArticleInFavorite ? 'heart' : 'heart-outline',
          handler: () => this.onToggleFavorite(),
        },
        {
          text: 'Share',
          icon: 'share-outline',
          handler: () => this.onShareArticle(),
        },
      ],
    });

    await actionSheet.present();
  }

  async onShareArticle() {
    return await Share.share({
      title: this.article.title,
      text: this.article.description,
      url: this.article.url,
      dialogTitle: this.article.source.name,
    });
  }

  onToggleFavorite() {
    this.storageService.saveArticle(this.article);
  }
}
