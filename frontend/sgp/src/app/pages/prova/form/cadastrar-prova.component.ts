import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/components/alert/alert.service';
import { LoadingService } from 'src/app/components/loading/loading.service';
import { Pageable } from 'src/app/util/pageable-request';
import { Questao } from '../../questao/models/questao';
import { QuestaoFiltro } from '../../questao/models/questao-filtro.model';
import { QuestaoListarService } from '../../questao/service/questao-listar.service';
import { Prova } from '../models/prova';
import { ProvaService } from '../service/prova.service';
import { SelectItem } from 'primeng';
@Component({
  selector: 'app-cadastrar-prova',
  templateUrl: './cadastrar-prova.component.html',
  styleUrls: ['./cadastrar-prova.component.css'],
})
export class CadastrarProvaComponent implements OnInit, OnChanges {
  @Output() provaAtualizada = new EventEmitter();
  @Input() apenasVisualizar = false;
  @Output() salvar = new EventEmitter();
  provaDialog: Prova = new Prova();
  formulario: FormGroup;
  visualizando: boolean;
  edicao: boolean;
  questaoFiltro: QuestaoFiltro = new QuestaoFiltro();
  pageQuestoes: Pageable<Questao>;
  origemQuestoes: SelectItem[] = [];
  destinoQuestoes: SelectItem[];
  totalDeQuestoes = 0;

  exibir = false;

  constructor(
    private formBuilder: FormBuilder,
    private provaService: ProvaService,
    private alert: AlertService,
    private loadingService: LoadingService,
    private questaoService: QuestaoListarService,

  ) { }

  ngOnInit() {

    this.iniciarForm();

    this.preencherQuestoesDropDown();

  }

  ngOnChanges(): void {
    this.iniciarForm();
  }

  iniciarForm() {
    this.formulario = this.formBuilder.group(
      {
        titulo: [this.provaDialog.titulo, [Validators.required]],
        percentual: [this.provaDialog.percentual, [Validators.required]],
      }
    );

    if (this.provaDialog.id) {
      this.formulario.controls['titulo'].setValidators([]);
      this.formulario.controls['percentual'].setValidators([]);
    }
  }

  validarForm() {

    if (this.formulario.invalid) {
      this.alert.montarAlerta('error', 'Erro', 'Preenchimento obrigatório dos campos: titulo e Percentual de Aprovação');
      return;
    }

    this.verificaProva();

  }

  verificaProva() {
    if (this.provaDialog.id) {
      this.atualizarProva(this.provaDialog);
    }
    else {
      this.salvarProva(this.provaDialog);
    }
  }

  salvarProva(prova: Prova): void {
    this.provaService.create({
      ...prova,
      questoes: this.destinoQuestoes
    }).subscribe(
      () => {
        this.formulario.reset();
        this.alert.montarAlerta(
          'success',
          'Sucesso!',
          'Prova cadastrada com suscesso!'
        );
        this.loadingService.deactivate();
        this.salvar.emit(prova),
          this.exibir = false;
        this.resetarHeader();
      },
      (err) => {
        this.alert.montarAlerta('error', 'Error!', 'Erro ao salvar a Prova, verifique os campos');
      }
    );
  }

  atualizarProva(prova: Prova): void {
    this.provaService.update(prova).subscribe(
      () => {
        this.formulario.reset();
        this.alert.montarAlerta(
          'success',
          'Sucesso!',
          'Prova atualizada com suscesso!'
        );
        this.loadingService.deactivate();
        this.salvar.emit(prova),
          this.exibir = false;
        this.resetarHeader();
      },
      (err) => {
        this.alert.montarAlerta('error', 'Error!', 'Erro ao atualizar a Prova');
      }
    )
      .add(() => this.loadingService.deactivate());
  }

  abrirDialog(prova: Prova, apenasVisualizar = false): void {
    if (prova !== null && apenasVisualizar !== true) {
      this.edicao = true;
      this.preencherProva(prova);
      this.preencherQuestoesDropDown();
    }
    else if (apenasVisualizar == true) {
      this.visualizando = true;
      this.preencherProva(prova);
    }
    else {
      this.provaDialog = new Prova();
      this.preencherQuestoesDropDown();
      this.destinoQuestoes = [];
    }
    this.apenasVisualizar = apenasVisualizar;
    this.exibir = true;
  }

  definirHeader(): string {
    if (this.visualizando) {
      return 'Visualizar Prova';
    }
    else if (this.edicao) {
      return 'Editar Prova';
    }
    else {
      return 'Cadastrar Prova';
    }
  }

  removeRepetitions(arr: any[]): Array<SelectItem> {
    const reduced = [];
    arr.forEach((item) => {
      var duplicated = reduced.findIndex(redItem => {
        return item.value == redItem.value;
      }) > -1;

      if (!duplicated) {
        reduced.push(item);
      }
    });
    return reduced;
  }

  onMoveToSource(): void {
    this.origemQuestoes = this.removeRepetitions(this.origemQuestoes);
  }

  onMoveToTarget(): void {
    this.destinoQuestoes = this.removeRepetitions(this.destinoQuestoes);
  }

  onCancel(): void {
    this.exibir = false;
    this.resetarHeader();
  }

  resetarHeader() {
    this.edicao = false;
    this.visualizando = false;
  }

  preencherQuestoesDropDown(event = null) {

    const pageable = new Pageable<SelectItem>(0, 20);

    if (event) {
      pageable.setSize(event.rows ? event.rows : 20);
      pageable.setPage(event.first ? event.first : 0);
      pageable.setSort(1, 'descricao');
    }

    this.questaoService.listarQuestoesDropdown(this.questaoFiltro, pageable)
      .subscribe((questoes: Pageable<SelectItem>) => {
        this.origemQuestoes = questoes.content;
        this.totalDeQuestoes = questoes.totalElements;
      });
  }

  preencherProva(prova: Prova) {
    this.provaDialog = Object.assign({}, prova);
    this.destinoQuestoes = this.provaDialog.questoes;
  }
}
