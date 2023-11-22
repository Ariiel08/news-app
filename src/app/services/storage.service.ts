import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Article } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private _localArticles: Article[] = [];

  constructor() {
    this.loadFavorites();
  }

  get getLocalArticles() {
    return [ ...this._localArticles ];
  }

  async saveArticle( article: Article) {

    const exists = this._localArticles.find( localArticle => localArticle.title === article.title );

    if ( exists ) {
      this._localArticles = this._localArticles.filter( localArticle => localArticle.title !== article.title );
    } else {
      this._localArticles = [ article, ...this._localArticles ];
    }


    await Preferences.set({
      key: 'articles',
      value: JSON.stringify(this._localArticles)
    });
  }

  async loadFavorites() {
    try {
      const { value } = await Preferences.get({ key: 'articles' });
      this._localArticles = JSON.parse(value || '') || [];
    } catch (error) {

    }
  }

  articleInFavorites( article: Article ): boolean {
    return !!this._localArticles.find( localArticle => localArticle.title === article.title );
  }
}
