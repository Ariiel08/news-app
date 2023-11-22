import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Article, ArticlesByCategoryAndPage, NewsResponse } from '../interfaces';

const apiKey = environment.apiKey;
const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  private articlesByCategoryAndPage: ArticlesByCategoryAndPage = {};

  constructor(private http: HttpClient) { }

  private executeQuery<T>( endpoint: string ) {
    return this.http.get<T>(`${ apiUrl }${ endpoint }`,{
      params: {
        apiKey,
        country: 'us'
      }
    })
  }

  getTopHeadlines(): Observable<Article[]> {
    return this.getTopHeadlinesByCategory('business');
    // return this.executeQuery<NewsResponse>(`/top-headlines?category=business`)
    // .pipe(
    //   map( resp => resp.articles )
    // );
  }

  getTopHeadlinesByCategory( category: string, loadMore: boolean = false ): Observable<Article[]> {

    if ( loadMore ) {
      return this.getArticlesByCategory(category);
    }

    if ( this.articlesByCategoryAndPage[category] ) {
      return of(this.articlesByCategoryAndPage[category].articles);
    }

    return this.getArticlesByCategory(category);
  }

  private getArticlesByCategory( category: string ): Observable<Article[]> {

    if ( !Object.keys( this.articlesByCategoryAndPage ).includes(category) ) {

      this.articlesByCategoryAndPage[category] = {
        page: 0,
        articles: []
      }
    }

    const page = this.articlesByCategoryAndPage[category].page + 1;

    return this.executeQuery<NewsResponse>(`/top-headlines?category=${ category }&page=${ page }`)
    .pipe(
      map( resp => {

        if ( resp.articles.length === 0 ) return this.articlesByCategoryAndPage[category].articles;

        const actualArticles = this.articlesByCategoryAndPage[category].articles;

        this.articlesByCategoryAndPage[category] = {
          page,
          articles: [...actualArticles, ...resp.articles]
        }

        return this.articlesByCategoryAndPage[category].articles;
      })
    );
  }
}
