import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';  
import { Observable } from 'rxjs';


export interface Conta {
  _id?: string;
  tipo: 'entrada' | 'saida';
  data: Date;
  categoria: string;
  valor: number;
  descricao: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContasService {
    private http = inject(HttpClient);
    private base = `http://localhost:3000/contas`;

    listar(): Observable<Conta[]> {
        return this.http.get<Conta[]>(this.base);
    }

    buscarPorId(id: string): Observable<Conta> {
        return this.http.get<Conta>(`${this.base}/${id}`);
    }

    criar(conta: Conta): Observable<Conta> {
        console.log(conta);
        return this.http.post<Conta>(this.base, conta);
    }


atualizar(id: string, conta: Partial<Conta>): Observable<Conta> {
    return this.http.patch<Conta>(`${this.base}/${id}`, conta);
}

excluir(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}