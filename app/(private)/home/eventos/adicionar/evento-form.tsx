"use client";

import { useState } from "react";
import { createEvento } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface Categoria {
  id: string;
  nome: string;
}

interface TipoEvento {
  id: string;
  nome: string;
}

interface EventoFormProps {
  categorias: Categoria[];
  tiposEvento: TipoEvento[];
}

export function EventoForm({ categorias, tiposEvento }: EventoFormProps) {
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<
    string[]
  >([]);
  const [criarDespesa, setCriarDespesa] = useState(false);

  return (
    <form action={createEvento} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Dados do Evento
        </h2>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Evento *</Label>
            <Input id="nome" name="nome" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data">Data *</Label>
            <Input id="data" name="data" type="date" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input id="local" name="local" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo do Evento *</Label>
            <div className="relative">
              <select
                id="tipo"
                name="tipo"
                required
                className="w-full h-10 rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
              >
                <option value="">Selecione o tipo</option>
                {tiposEvento.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categorias">Categorias</Label>
          <MultiSelect
            options={categorias}
            selected={categoriasSelecionadas}
            onChange={setCategoriasSelecionadas}
            placeholder="Selecione as categorias..."
          />
          {/* Hidden input para enviar os valores selecionados no form */}
          {categoriasSelecionadas.map((catId) => (
            <input key={catId} type="hidden" name="categorias" value={catId} />
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <textarea
            id="descricao"
            name="descricao"
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Criar Despesa Automática */}
        <div className="pt-4 border-t border-border space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="criarDespesa"
              name="criarDespesa"
              checked={criarDespesa}
              onCheckedChange={(checked) => setCriarDespesa(checked === true)}
            />
            <Label
              htmlFor="criarDespesa"
              className="text-sm font-medium cursor-pointer"
            >
              Criar despesa automaticamente para este evento
            </Label>
          </div>

          {criarDespesa && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="nomeDespesa">Nome da Despesa *</Label>
                <Input
                  id="nomeDespesa"
                  name="nomeDespesa"
                  placeholder="Ex: Pagamento Evento XYZ"
                  required={criarDespesa}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vencimentoDespesa">Data de Vencimento *</Label>
                <Input
                  id="vencimentoDespesa"
                  name="vencimentoDespesa"
                  type="date"
                  required={criarDespesa}
                />
                <p className="text-xs text-muted-foreground">
                  Após criar, você será redirecionado para adicionar os itens da despesa
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          Salvar
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/home/eventos">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
