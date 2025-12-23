import { Component, OnInit, inject } from '@angular/core';
import { Conta, ContasService } from '../../services/contas-service';
import { FormsModule } from '@angular/forms';
import { LowerCasePipe } from '@angular/common';  

@Component({
  selector: 'app-contas',
  imports: [FormsModule, LowerCasePipe],
  templateUrl: './contas.html',
  standalone: true,
  styleUrl: './contas.css'
})
export class Contas {
  private api = inject(ContasService);

  filtroCategoria: string = '';
  filtroMes: string = '';

  meses = [
    { valor: 0, nome: 'Janeiro' },
    { valor: 1, nome: 'Fevereiro' },
    { valor: 2, nome: 'Março' },
    { valor: 3, nome: 'Abril' },
    { valor: 4, nome: 'Maio' },
    { valor: 5, nome: 'Junho' },
    { valor: 6, nome: 'Julho' },
    { valor: 7, nome: 'Agosto' },
    { valor: 8, nome: 'Setembro' },
    { valor: 9, nome: 'Outubro' },
    { valor: 10, nome: 'Novembro' },
    { valor: 11, nome: 'Dezembro' },
  ];

  contas: Conta[] = [];
  carregando = false;
  salvando = false;
  erro = '';

  saldoTotal: number = 0;
  saldoMesAtual: number = 0;

  data: Date = new Date();
  categoria: string = '';
  valor: number | null = null;
  descricao: string = '';
  tipo: 'entrada' | 'saida' = 'entrada';

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.api.listar().subscribe({
      next: xs => {
        this.contas = xs;
        this.carregando = false;
        this.calcularSaldoTotal();
        this.calcularSaldoMesAtual();
      },
      error: e => {
        this.erro = e.message ?? 'Falha ao carregar';
        this.carregando = false;
      }
    });
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  criar() {
    if (!this.categoria || !this.valor || !this.data) return;

    const conta: Conta = {
      tipo: this.tipo,
      data: this.data,
      valor: Number(this.valor),
      categoria: this.categoria,
      descricao: this.descricao
    };

    this.salvando = true;
    this.api.criar(conta).subscribe({
      next: _ => {
        this.categoria = '';
        this.descricao = '';
        this.data = new Date();
        this.valor = null;

        this.salvando = false;
        this.carregar();
      },
      error: e => {
        this.erro = e.message ?? 'Falha ao criar';
        this.salvando = false;
      }
    });
  }

  excluir(id?: string) {
    if (!id) return;
    this.api.excluir(id).subscribe({
      next: _ => this.carregar(),
      error: e => this.erro = e.message ?? 'Falha ao excluir'
    });
  }

 contasFiltradas() {
  return this.contas.filter(c => {
    const dataConta = new Date(c.data);

    const filtraCategoria = !this.filtroCategoria || c.categoria === this.filtroCategoria;
    const filtraMes = this.filtroMes === '' || dataConta.getMonth() === +this.filtroMes;

    return filtraCategoria && filtraMes;
  });
}


  calcularSaldoTotal() {
    this.saldoTotal = this.contas.reduce((total, c) => {
      return c.tipo === 'entrada' ? total + c.valor : total - c.valor;
    }, 0);
  }

  calcularSaldoMesAtual() {
    const agora = new Date();
    const mes = agora.getMonth();
    const ano = agora.getFullYear();

    this.saldoMesAtual = this.contas
      .filter(c => {
        const d = new Date(c.data);
        return d.getMonth() === mes && d.getFullYear() === ano;
      })
      .reduce((total, c) => {
        return c.tipo === 'entrada' ? total + c.valor : total - c.valor;
      }, 0);
  }
}
