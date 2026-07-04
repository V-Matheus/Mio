---
activation: always-on
alwaysApply: true
---

# Política de Modificação de Código

Sempre que o agente precisar realizar modificações no código deste projeto (criar, editar ou sobrescrever arquivos):

1. **Confirmação Obrigatória**: O agente deve apresentar um plano detalhado das alterações propostas e obter aprovação explícita do usuário antes de realizar qualquer modificação em arquivos.
2. **Proibição de Alterações Automáticas**: Não faça edições diretas nos arquivos de código sem antes descrever o que será alterado e receber o consentimento do usuário para prosseguir.
3. **Modal Interativo para Confirmações**: O agente deve, obrigatoriamente, utilizar a ferramenta de perguntas interativas (`ask_question`) para exibir um modal de múltipla escolha com as opções de aprovação antes de aplicar as edições, em vez de aguardar confirmações textuais no chat.
