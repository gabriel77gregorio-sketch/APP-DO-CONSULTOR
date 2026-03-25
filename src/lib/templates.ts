export const ROADMAP_TEMPLATES: Record<string, any[]> = {
  default: [
    { step: 1, month: '', title: 'Diagnóstico e Alinhamento', desc: 'Mapeamento da situação atual e definição de objetivos', checks: ['Cultura organizacional mapeada', 'Principais dores identificadas', 'Metas definidas e alinhadas'] },
    { step: 2, month: '', title: 'Estrutura de RH', desc: 'Análise e organização da estrutura de recursos humanos', checks: ['Organograma revisado', 'Funções e responsabilidades claras', 'Gaps de competência identificados'] },
    { step: 3, month: '', title: 'Atração e Recrutamento', desc: 'Estratégia para atrair os melhores talentos', checks: ['Employer branding definido', 'Processo seletivo estruturado', 'Job descriptions revisados'] },
    { step: 4, month: '', title: 'Onboarding', desc: 'Programa de integração de novos colaboradores', checks: ['Processo de onboarding criado', 'Materiais de boas-vindas prontos', 'Buddy system implementado'] },
    { step: 5, month: '', title: 'Avaliação de Desempenho', desc: 'Sistema de avaliação e feedback contínuo', checks: ['Modelo de avaliação escolhido', 'Critérios e pesos definidos', 'Ciclo de avaliação planejado'] },
    { step: 6, month: '', title: 'Remuneração e Benefícios', desc: 'Política de remuneração competitiva e atrativa', checks: ['Pesquisa salarial realizada', 'Política de benefícios revisada', 'Plano de cargos e salários estruturado'] },
    { step: 7, month: '', title: 'Treinamento e Desenvolvimento', desc: 'Plano de capacitação para evolução das equipes', checks: ['Matriz de treinamentos criada', 'Plano de PDI implementado', 'Trilhas de aprendizado definidas'] },
    { step: 8, month: '', title: 'Clima e Engajamento', desc: 'Diagnóstico e plano de ação para engajamento', checks: ['Pesquisa de clima realizada', 'Principais pontos analisados', 'Plano de ação elaborado'] },
    { step: 9, month: '', title: 'Liderança e Cultura', desc: 'Desenvolvimento de líderes e fortalecimento da cultura', checks: ['Perfil de liderança definido', 'Programa de desenvolvimento lançado', 'Valores organizacionais comunicados'] },
    { step: 10, month: '', title: 'Processos e Compliance', desc: 'Regularização de processos e conformidade legal', checks: ['Processos mapeados e documentados', 'Conformidade legal verificada', 'Políticas internas atualizadas'] },
    { step: 11, month: '', title: 'Indicadores de RH (KPIs)', desc: 'Implementação de métricas e dashboards de gestão', checks: ['KPIs de RH definidos', 'Dashboard de métricas criado', 'Rotina de análise estabelecida'] },
    { step: 12, month: '', title: 'Revisão e Plano de Continuidade', desc: 'Consolidação dos resultados e próximos passos', checks: ['Resultados consolidados', 'Próximos passos definidos', 'Autonomia da equipe garantida'] },
  ],
  onboarding_rh: [
    { step: 1, month: '', title: 'Boas-vindas, Kit e Setup', desc: 'O "Uau" inicial: recepção com kit de boas vindas, acessos e equipamentos.', checks: ['Entregar Kit Boas-Vindas', 'Configurar E-mail e Acessos', 'Assinatura de Documentos'] },
    { step: 2, month: '', title: 'Alinhamento de Cultura', desc: 'Treinamento básico e alinhamento com a cultura da empresa.', checks: ['Treinamento de Valores e Cultura', 'Apresentação Institucional', 'Tour e Reunião com Equipe'] },
    { step: 3, month: '', title: 'Primeiro Check-in', desc: 'Feedback sobre o primeiro mês: o que está bom e o que está faltando.', checks: ['Reunião de Feedback (1on1)', 'Ajuste de Expectativas', 'Análise de Adaptação'] },
    { step: 4, month: '', title: 'Treinamento Técnico', desc: 'Treinamento técnico e hard skills específicas do cargo.', checks: ['Treinamento da Ferramenta de Trabalho', 'Shadowing (Acompanhamento)', 'Entrega da Primeira Demanda Prática'] },
    { step: 5, month: '', title: 'Avaliação de Experiência', desc: 'Avaliação final do período de experiência (Fica ou não fica?).', checks: ['Avaliação de Desempenho 90 dias', 'Feedback do Gestor', 'Efetivação ou Desligamento'] },
  ],
  sales_b2b: [
    { step: 1, month: '', title: 'Definição do ICP', desc: 'Mapeamento do Perfil de Cliente Ideal e criação da matriz de objeções.', checks: ['Mapear Dores e Desejos', 'Definir ICP', 'Criar Matriz de Objeções'] },
    { step: 2, month: '', title: 'Setup do CRM', desc: 'Criação de funil de vendas e automações essenciais no sistema de CRM.', checks: ['Configurar Fases do Funil', 'Definir Motivos de Perda', 'Integrar Formulários ao CRM'] },
    { step: 3, month: '', title: 'Criação de Scripts', desc: 'Estruturação dos roteiros: Cold Call, E-mail e WhatsApp.', checks: ['Criar Script de Cold Call', 'Criar Templates de E-mail B2B', 'Criar Roteiros de WhatsApp'] },
    { step: 4, month: '', title: 'Contratação do primeiro SDR', desc: 'Recrutamento e treinamento do primeiro SDR (Pré-vendedor).', checks: ['Alinhar Perfil do Pré-Vendedor', 'Treinamento Técnico de Abordagem', 'Simulação (Roleplay)'] },
    { step: 5, month: '', title: 'Playbook de Vendas', desc: 'Consolidação e entrega do Playbook de Vendas Finalizado no Cofre.', checks: ['Documentação do Processo B2B', 'Upload do Playbook', 'Aprovação Final da Diretoria'] },
    { step: 6, month: '', title: 'Análise de Métricas', desc: 'Revisão das métricas de conversão para melhoria contínua.', checks: ['Análise de Conversão por Etapa', 'Custo de Aquisição de Cliente (CAC)', 'Ajuste de Estratégia'] },
  ],
  bpo_financeiro: [
    { step: 1, month: '', title: 'Kick-off e Contas Bancárias', desc: 'Reunião inicial de Kick-off e mapeamento completo de contas bancárias.', checks: ['Sincronizar Acessos Bancários', 'Levantamento de Contas a Pagar/Receber', 'Alinhamento de Escopo'] },
    { step: 2, month: '', title: 'Configuração do ERP', desc: 'Setup e parametrização do Sistema de Gestão Financeira (Conta Azul, Omie, etc).', checks: ['Parametrização do Plano de Contas', 'Integração Bancária Automática', 'Cadastro de Fornecedores'] },
    { step: 3, month: '', title: 'Transição de Senhas', desc: 'Upload seguro de senhas e acessos na seção Cofre.', checks: ['Atualização do Cofre de Documentos', 'Validação de Token (Certificado Digital)', 'Testes Práticos de Acesso'] },
    { step: 4, month: '', title: 'Rotina de Pagamentos', desc: 'Definição das regras e da rotina de aprovação de pagamentos.', checks: ['Definir Data de Corte para NF', 'Estabelecer Fluxo de Aprovação', 'Treinar Cliente na Nova Rotina'] },
    { step: 5, month: '', title: 'DRE e Fluxo Projetado', desc: 'Entrega do Primeiro DRE e apresentação do Fluxo de Caixa Projetado.', checks: ['Conciliação Bancária Concluída', 'Emissão do DRE do Mês', 'Reunião de Apresentação de Resultados'] },
  ],
  saas_impl: [
    { step: 1, month: '', title: 'Kick-off e Requisitos', desc: 'Levantamento de requisitos, prazos e expectativas do cliente.', checks: ['Definir Cronograma de Implantação', 'Identificar Dores e Gargalos Atuais', 'Aprovar Escopo de Trabalho'] },
    { step: 2, month: '', title: 'Migração de Dados', desc: 'Limpeza de planilhas antigas, mapeamento de colunas e importação.', checks: ['Exportar Dados do Sistema Antigo', 'Higienização da Base (Limpeza)', 'Importar Dados no Novo Sistema'] },
    { step: 3, month: '', title: 'Setup Técnico', desc: 'Parametrização e configurações gerais da conta do cliente.', checks: ['Configurar Permissões de Usuários', 'Customizar Campos e Módulos', 'Homologação e Testes de Setup'] },
    { step: 4, month: '', title: 'Treinamento Key Users', desc: 'Treinamento focado nos Usuários-Chave (Multiplicadores internos).', checks: ['Treinamento do Módulo Operacional', 'Treinamento do Módulo Gerencial', 'Entrega de Manuais e Guias'] },
    { step: 5, month: '', title: 'Go-Live', desc: 'Dia do uso oficial do sistema. Acompanhamento em tempo real.', checks: ['Suporte Especializado N1 Ativo', 'Acompanhar Primeiras Operações', 'Corrigir Impeditivos Imediatos'] },
    { step: 6, month: '', title: 'Reunião de Adoção', desc: 'Medir o engajamento e o sucesso no uso durante o primeiro mês.', checks: ['Mensurar Logins Frequentes', 'Apresentar Relatório de Uso', 'Revisar Assuntos Pendentes'] },
  ]
};

export const TEMPLATE_NAMES = {
  default: { title: "Consultoria de RH Clássica", subtitle: "Jornada dos 12 Checkpoints", name: "Padrão (12 Passos)" },
  onboarding_rh: { title: "Onboarding de Novos Colaboradores", subtitle: "Jornada de 90 Dias", name: "Onboarding RH (90 Dias)" },
  sales_b2b: { title: "Máquina de Vendas B2B", subtitle: "Sales Ops & Processos", name: "Máquina de Vendas B2B" },
  bpo_financeiro: { title: "Onboarding de BPO Financeiro", subtitle: "Transição Segura em 30 Dias", name: "BPO Financeiro (30/45 Dias)" },
  saas_impl: { title: "Sucesso do Cliente (CS)", subtitle: "Implantação de Software (SaaS)", name: "Implantação de Software (SaaS)" }
};
