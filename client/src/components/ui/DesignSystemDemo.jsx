import React, { useState } from 'react';
import { Button, Input, Card, Badge, Alert, Avatar } from './index';

/**
 * Component to demonstrate the AliTools design system components
 */
const DesignSystemDemo = () => {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-primary">AliTools Design System</h1>

      {/* Cores */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Cores</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Cores Primárias</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="h-16 bg-primary rounded-t-md"></div>
                <div className="bg-white p-2 border border-t-0 rounded-b-md">
                  <div className="text-sm font-bold">Preto</div>
                  <div className="text-xs text-neutral-600">#1A1A1A</div>
                </div>
              </div>
              <div>
                <div className="h-16 bg-brand rounded-t-md"></div>
                <div className="bg-white p-2 border border-t-0 rounded-b-md">
                  <div className="text-sm font-bold">Amarelo</div>
                  <div className="text-xs text-neutral-600">#FFCC00</div>
                </div>
              </div>
              <div>
                <div className="h-16 bg-white rounded-t-md border"></div>
                <div className="bg-white p-2 border border-t-0 rounded-b-md">
                  <div className="text-sm font-bold">Branco</div>
                  <div className="text-xs text-neutral-600">#FFFFFF</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Cores Semânticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="h-16 bg-success rounded-t-md"></div>
                <div className="bg-white p-2 border border-t-0 rounded-b-md">
                  <div className="text-sm font-bold">Sucesso</div>
                  <div className="text-xs text-neutral-600">#22C55E</div>
                </div>
              </div>
              <div>
                <div className="h-16 bg-warning rounded-t-md"></div>
                <div className="bg-white p-2 border border-t-0 rounded-b-md">
                  <div className="text-sm font-bold">Alerta</div>
                  <div className="text-xs text-neutral-600">#F59E0B</div>
                </div>
              </div>
              <div>
                <div className="h-16 bg-error rounded-t-md"></div>
                <div className="bg-white p-2 border border-t-0 rounded-b-md">
                  <div className="text-sm font-bold">Erro</div>
                  <div className="text-xs text-neutral-600">#EF4444</div>
                </div>
              </div>
              <div>
                <div className="h-16 bg-info rounded-t-md"></div>
                <div className="bg-white p-2 border border-t-0 rounded-b-md">
                  <div className="text-sm font-bold">Informação</div>
                  <div className="text-xs text-neutral-600">#3B82F6</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Botões */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Botões</h2>
        <Card className="mb-6">
          <h3 className="text-lg font-medium mb-4">Variantes</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primário</Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Card>

        <Card className="mb-6">
          <h3 className="text-lg font-medium mb-4">Tamanhos</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Pequeno</Button>
            <Button size="md">Médio</Button>
            <Button size="lg">Grande</Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium mb-4">Estados</h3>
          <div className="flex flex-wrap gap-4">
            <Button>Normal</Button>
            <Button disabled>Desabilitado</Button>
            <Button fullWidth className="mt-4">Largura Total</Button>
          </div>
        </Card>
      </section>

      {/* Campos */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Campos de Entrada</h2>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Campo Padrão" 
              name="default" 
              placeholder="Digite aqui"
            />
            
            <Input 
              label="Campo com Erro" 
              name="error" 
              placeholder="Digite aqui"
              error="Este campo é obrigatório"
            />
            
            <Input 
              label="Campo com Dica" 
              name="helptext" 
              placeholder="Digite aqui"
              helpText="Esta é uma dica de ajuda"
            />
            
            <Input 
              label="Campo Desabilitado" 
              name="disabled" 
              placeholder="Campo desabilitado"
              disabled
            />
            
            <Input 
              label="Campo Obrigatório" 
              name="required" 
              placeholder="Digite aqui"
              required
            />
            
            <Input 
              label="Campo de Senha" 
              name="password" 
              type="password"
              placeholder="Digite sua senha"
            />
          </div>
        </Card>
      </section>

      {/* Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-medium mb-2">Card Padrão</h3>
            <p className="text-neutral-700">Este é um card padrão com conteúdo simples.</p>
          </Card>
          
          <Card variant="elevated">
            <h3 className="text-lg font-medium mb-2">Card Elevado</h3>
            <p className="text-neutral-700">Este card tem uma sombra para destacá-lo.</p>
          </Card>
          
          <Card variant="outlined">
            <h3 className="text-lg font-medium mb-2">Card Outline</h3>
            <p className="text-neutral-700">Este card tem apenas borda sem preenchimento.</p>
          </Card>
          
          <Card variant="branded">
            <h3 className="text-lg font-medium mb-2">Card Branded</h3>
            <p className="text-neutral-700">Este card usa as cores da marca.</p>
          </Card>
          
          <Card 
            header="Cabeçalho do Card"
            footer={<div className="text-right"><Button size="sm">Ação</Button></div>}
          >
            <h3 className="text-lg font-medium mb-2">Card com Cabeçalho e Rodapé</h3>
            <p className="text-neutral-700">Este card possui cabeçalho e rodapé.</p>
          </Card>
          
          <Card hover>
            <h3 className="text-lg font-medium mb-2">Card com Hover</h3>
            <p className="text-neutral-700">Passe o mouse sobre este card para ver o efeito.</p>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Badges</h2>
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Variantes</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="primary">Primário</Badge>
                <Badge variant="secondary">Secundário</Badge>
                <Badge variant="neutral">Neutro</Badge>
                <Badge variant="success">Sucesso</Badge>
                <Badge variant="warning">Alerta</Badge>
                <Badge variant="error">Erro</Badge>
                <Badge variant="info">Informação</Badge>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Tamanhos e Formatos</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge size="sm" variant="primary">Pequeno</Badge>
                <Badge size="md" variant="primary">Médio</Badge>
                <Badge rounded variant="primary">Arredondado</Badge>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Alerts */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Alertas</h2>
        <div className="space-y-4">
          {showAlert && (
            <Alert 
              variant="info" 
              title="Alerta Informativo com Fechamento"
              dismissible
              onDismiss={() => setShowAlert(false)}
            >
              Este é um alerta informativo que pode ser fechado.
            </Alert>
          )}
          
          <Alert variant="success" title="Alerta de Sucesso">
            A operação foi concluída com sucesso.
          </Alert>
          
          <Alert variant="warning" title="Alerta de Aviso">
            Atenção! Esta ação pode ter consequências inesperadas.
          </Alert>
          
          <Alert variant="error" title="Alerta de Erro">
            Ocorreu um erro ao processar sua solicitação.
          </Alert>
          
          <Alert variant="info">
            Alerta sem título, apenas com conteúdo.
          </Alert>
        </div>
      </section>

      {/* Avatars */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Avatares</h2>
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Tamanhos</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Avatar 
                  src="/client/src/assets/logos/png/symbol/alitools_symbol_fullcolor_64px.png" 
                  alt="AliTools" 
                  size="xs"
                />
                <Avatar 
                  src="/client/src/assets/logos/png/symbol/alitools_symbol_fullcolor_64px.png" 
                  alt="AliTools" 
                  size="sm"
                />
                <Avatar 
                  src="/client/src/assets/logos/png/symbol/alitools_symbol_fullcolor_64px.png" 
                  alt="AliTools" 
                  size="md"
                />
                <Avatar 
                  src="/client/src/assets/logos/png/symbol/alitools_symbol_fullcolor_64px.png" 
                  alt="AliTools" 
                  size="lg"
                />
                <Avatar 
                  src="/client/src/assets/logos/png/symbol/alitools_symbol_fullcolor_64px.png" 
                  alt="AliTools" 
                  size="xl"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Variantes</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Avatar 
                  alt="Usuário" 
                  variant="circle"
                />
                <Avatar 
                  alt="Usuário" 
                  variant="rounded"
                />
                <Avatar 
                  alt="Usuário" 
                  variant="square"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Fallbacks</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Avatar 
                  alt="João Silva" 
                />
                <Avatar 
                  alt="Maria Oliveira" 
                  bgColor="bg-primary"
                />
                <Avatar 
                  alt="Carlos Souza" 
                  fallback="CS"
                  bgColor="bg-info"
                />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Tipografia */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Tipografia</h2>
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Cabeçalhos</h3>
              <div className="space-y-3">
                <h1>Cabeçalho H1</h1>
                <h2>Cabeçalho H2</h2>
                <h3>Cabeçalho H3</h3>
                <h4>Cabeçalho H4</h4>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Texto</h3>
              <div className="space-y-2">
                <p className="text-xs">Texto Extrapequeño (xs)</p>
                <p className="text-sm">Texto Pequeno (sm)</p>
                <p className="text-base">Texto Base (base)</p>
                <p className="text-lg">Texto Grande (lg)</p>
                <p className="text-xl">Texto Extragrande (xl)</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Estilos de Texto</h3>
              <div className="space-y-2">
                <p className="font-bold">Texto em negrito</p>
                <p className="font-medium">Texto médio</p>
                <p className="italic">Texto em itálico</p>
                <p className="underline">Texto sublinhado</p>
                <p className="uppercase">Texto em maiúsculas</p>
                <p className="line-through">Texto tachado</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default DesignSystemDemo; 