import { Node } from "@xyflow/react";

interface PropertiesSidebarProps {
  selectedNode: Node | null;
  onUpdateNodeData: (nodeId: string, newData: any) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

export function PropertiesSidebar({ selectedNode, onUpdateNodeData, onDeleteNode, onClose }: PropertiesSidebarProps) {
  if (!selectedNode) return null;

  const handleDataChange = (key: string, value: string) => {
    onUpdateNodeData(selectedNode.id, { ...selectedNode.data, [key]: value });
  };

  return (
    <aside className="w-80 border-l bg-white p-6 shadow-sm flex flex-col z-10 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-slate-800 text-lg">Configurações</h2>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-bold"
        >
          ✕
        </button>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-semibold uppercase text-slate-400 tracking-wider">Nome do Bloco</label>
        <input
          type="text"
          value={(selectedNode.data.label as string) || ''}
          onChange={(e) => handleDataChange('label', e.target.value)}
          placeholder="Ex: Pegar Preço"
          className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
        />
        <div className="mt-2 text-[10px] text-slate-400 uppercase tracking-tighter">Tipo: {selectedNode.type}</div>
      </div>

      <hr className="my-4 border-slate-100" />

      {/* --- FORMULÁRIO HTTP --- */}
      {selectedNode.type === 'http' && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Método HTTP</label>
            <select
              value={(selectedNode.data.method as string) || 'GET'}
              onChange={(e) => handleDataChange('method', e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">URL Alvo</label>
            <input
              type="url"
              placeholder="https://exemplo.com"
              value={(selectedNode.data.url as string) || ''}
              onChange={(e) => handleDataChange('url', e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* --- FORMULÁRIO SELECTOR --- */}
      {selectedNode.type === 'selector' && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Tipo de Seletor</label>
            <select
              value={(selectedNode.data.selector_type as string) || 'xpath'}
              onChange={(e) => handleDataChange('selector_type', e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="xpath">XPath (Recomendado)</option>
              <option value="css">CSS Selector</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Consulta (Query)</label>
            <input
              type="text"
              placeholder={selectedNode.data.selector_type === 'css' ? "ex: div.price" : "ex: //*[@id='target-input']"}
              value={(selectedNode.data.selector as string) || ''}
              onChange={(e) => handleDataChange('selector', e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">O que extrair?</label>
            {(() => {
              const commonAttributes = ['', 'table', 'href', 'src', 'value', 'outerHTML', 'innerHTML'];
              const currentAttr = (selectedNode.data.attribute as string) || '';
              const isCustom = !commonAttributes.includes(currentAttr);
              
              return (
                <>
                  <select
                    value={isCustom ? 'custom' : currentAttr}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        handleDataChange('attribute', 'attr_custom'); // Valor temporário para ativar o input
                      } else {
                        handleDataChange('attribute', val);
                      }
                    }}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Texto Simples (padrão)</option>
                    <option value="table">Tabela Estruturada (CSV/Excel)</option>
                    <option value="href">Link da Página (href)</option>
                    <option value="src">Link de Imagem/Mídia (src)</option>
                    <option value="value">Valor de Input/Campo</option>
                    <option value="outerHTML">Código HTML (Completo)</option>
                    <option value="innerHTML">Código HTML (Apenas interno)</option>
                    <option value="custom">Outro atributo (digitar...)</option>
                  </select>
                  
                  {isCustom && (
                    <input
                      type="text"
                      autoFocus
                      placeholder="Digite o nome do atributo (ex: data-id)"
                      value={currentAttr === 'attr_custom' ? '' : currentAttr}
                      onChange={(e) => handleDataChange('attribute', e.target.value)}
                      className="w-full mt-2 rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </>
              );
            })()}
            <p className="mt-1 text-[10px] text-slate-400">
              Dica: Use "Tabela" para capturar tabelas com colunas separadas no CSV.
            </p>
          </div>
        </div>
      )}

      {/* --- FORMULÁRIO EXPORT --- */}
      {selectedNode.type === 'export' && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Formato do Arquivo</label>
            <select
              value={(selectedNode.data.format as string) || 'JSON'}
              onChange={(e) => handleDataChange('format', e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="JSON">.JSON (Objeto)</option>
              <option value="CSV">.CSV (Planilha Planilha)</option>
              <option value="XLSX">.XLSX (Excel)</option>
              <option value="PDF">.PDF (Relatório Visual)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Nome do Arquivo Base</label>
            <input
              type="text"
              placeholder="ex: extração_produtos"
              value={(selectedNode.data.filename as string) || ''}
              onChange={(e) => handleDataChange('filename', e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* --- FORMULÁRIO CLICK --- */}
      {selectedNode.type === 'click' && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Tipo de Seletor</label>
            <select
              value={(selectedNode.data.selector_type as string) || 'css'}
              onChange={(e) => handleDataChange('selector_type', e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="css">CSS Selector</option>
              <option value="xpath">XPath</option>
              <option value="text">Texto do Botão</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Seletor para Clicar</label>
            <input
              type="text"
              placeholder="ex: button#submit ou Logar"
              value={(selectedNode.data.selector as string) || ''}
              onChange={(e) => handleDataChange('selector', e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* --- FORMULÁRIO INPUT --- */}
      {selectedNode.type === 'input' && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Seletor do Campo</label>
            <input
              type="text"
              placeholder="ex: input[name='email']"
              value={(selectedNode.data.selector as string) || ''}
              onChange={(e) => handleDataChange('selector', e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Texto para Digitar</label>
            <input
              type="text"
              placeholder="Sua senha ou busca..."
              value={(selectedNode.data.value as string) || ''}
              onChange={(e) => handleDataChange('value', e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* --- FORMULÁRIO WAIT --- */}
      {selectedNode.type === 'wait' && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Tipo de Espera</label>
            <select
              value={(selectedNode.data.type as string) || 'timeout'}
              onChange={(e) => handleDataChange('type', e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="timeout">Tempo Fixo</option>
              <option value="element">Elemento aparecer</option>
            </select>
          </div>
          {selectedNode.data.type === 'element' ? (
             <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Seletor do Elemento</label>
                <input
                  type="text"
                  placeholder="ex: .success-message"
                  value={(selectedNode.data.selector as string) || ''}
                  onChange={(e) => handleDataChange('selector', e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
             </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Milisegundos</label>
              <input
                type="number"
                value={(selectedNode.data.ms as string) || '2000'}
                onChange={(e) => handleDataChange('ms', e.target.value)}
                className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-auto pt-6 border-t border-slate-100">
        <button 
          onClick={() => onDeleteNode(selectedNode.id)}
          className="w-full rounded-md border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
        >
          Remover Bloco
        </button>
      </div>
    </aside>
  );
}
