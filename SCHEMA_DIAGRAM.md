# Diagrama do Schema do Banco de Dados

Este documento contém o diagrama ERD (Entity Relationship Diagram) do schema do projeto.

## Como Importar no Excalidraw

O Excalidraw possui uma funcionalidade nativa para converter diagramas Mermaid em diagramas editáveis. **Importante**: O Excalidraw atualmente suporta apenas Flowchart, Sequence e **Class Diagrams** - não suporta ER Diagrams (erDiagram).

### Versão Compatível com Excalidraw

Para importar no Excalidraw, use o arquivo `schema-diagram-class.mmd` que contém uma versão em **Class Diagram**:

1. Acesse [excalidraw.com](https://excalidraw.com/)
2. No menu lateral, clique no ícone com triângulo, círculo e quadrado para acessar "Mais ferramentas"
3. Selecione a opção **"Mermaid to Excalidraw"**
4. Abra o arquivo `schema-diagram-class.mmd` na raiz do projeto e copie todo o conteúdo
5. Cole o código no Excalidraw e clique em "Inserir"

O diagrama será convertido em elementos editáveis do Excalidraw, permitindo personalizações adicionais.

### Versão ER Diagram Completa

O arquivo `schema-diagram.mmd` contém a versão completa em formato ER Diagram, que pode ser visualizada em outras ferramentas como:
- GitHub (renderiza automaticamente)
- mermaid.live
- Editores com suporte a Mermaid (VS Code com extensão, Obsidian, etc.)

## Diagrama ERD

```mermaid
erDiagram
    Organization ||--o{ User : "tem admins"
    Organization ||--o{ Manager : "tem"
    Organization ||--o{ Athlete : "tem"
    Organization ||--o{ Category : "tem"
    Organization ||--o{ Event : "organiza"
    Organization ||--o{ ManagerInvite : "envia"
    Organization ||--o{ AthleteInvite : "envia"
    Organization ||--o| Championship : "organiza"
    Organization ||--o{ ChampionshipEntry : "inscrita em"
    Organization ||--o{ ChampionshipInvite : "recebe"

    User ||--o| Manager : "pode ser"
    User ||--o| Athlete : "pode ser"
    User ||--o{ Session : "tem"
    User ||--o{ PasswordResetToken : "tem"

    Manager }o--o{ Category : "gerencia"
    ManagerCategory }o--|| Manager : "pertence"
    ManagerCategory }o--|| Category : "pertence"

    Athlete }o--o{ Category : "pertence"
    CategoryAthlete }o--|| Athlete : "pertence"
    CategoryAthlete }o--|| Category : "pertence"

    Event }o--o{ Category : "tem"
    EventCategory }o--|| Event : "pertence"
    EventCategory }o--|| Category : "pertence"

    Event ||--o{ EventAttendance : "tem"
    Athlete ||--o{ EventAttendance : "participa"
    EventAttendance ||--o{ AthletePaymentItem : "tem"

    Event ||--o{ Payment : "pode ter"
    Championship ||--o{ Payment : "pode ter"
    Payment }o--o{ Category : "tem"
    PaymentCategory }o--|| Payment : "pertence"
    PaymentCategory }o--|| Category : "pertence"

    Payment ||--o{ PaymentItem : "tem"
    PaymentItem ||--o{ AthletePaymentItem : "usado em"
    AthletePaymentItem }o--|| EventAttendance : "pertence"
    AthletePaymentItem }o--|| PaymentItem : "pertence"

    Championship ||--o{ ChampionshipCategory : "tem"
    ChampionshipCategory }o--o| Category : "pode referenciar"
    ChampionshipCategory ||--o{ ChampionshipEntry : "tem"
    
    ChampionshipEntry }o--|| Championship : "pertence"
    ChampionshipEntry }o--|| Organization : "inscrita"
    ChampionshipEntry }o--|| ChampionshipCategory : "em categoria"
    ChampionshipEntry ||--o{ ChampionshipAthleteEntry : "tem"
    
    ChampionshipAthleteEntry }o--|| ChampionshipEntry : "pertence"
    ChampionshipAthleteEntry }o--|| Athlete : "inclui"
    Athlete ||--o{ ChampionshipAthleteEntry : "participa"

    Championship ||--o{ ChampionshipInvite : "envia"

    Organization {
        string id PK
        string name UK
        string stripeAccountId
        datetime createdAt
        datetime updatedAt
    }

    User {
        string id PK
        string name
        string email UK
        string password
        boolean emailVerified
        string role
        datetime createdAt
        datetime updatedAt
        string phone UK
        string organizationName
        string organizationId FK
    }

    Session {
        string id PK
        string token UK
        datetime expiresAt
        datetime createdAt
        datetime updatedAt
        string userId FK
    }

    PasswordResetToken {
        string id PK
        string token UK
        string code
        string userId FK
        datetime expiresAt
        boolean used
        datetime createdAt
    }

    Manager {
        string id PK
        string firstName
        string lastName
        string phone UK
        string userId UK_FK
        datetime createdAt
        datetime updatedAt
        string organizationId FK
    }

    Category {
        string id PK
        string name
        datetime createdAt
        datetime updatedAt
        string organizationId FK
    }

    ManagerCategory {
        string managerId PK_FK
        string categoryId PK_FK
    }

    ManagerInvite {
        string id PK
        string token UK
        datetime expiresAt
        datetime createdAt
        boolean used
        string organizationId FK
    }

    Athlete {
        string id PK
        string firstName
        string lastName
        string phone UK
        string federationId
        datetime birthDate
        string userId UK_FK
        string shirtNumber
        string confederationId
        datetime createdAt
        datetime updatedAt
        string organizationId FK
    }

    CategoryAthlete {
        string athleteId PK_FK
        string categoryId PK_FK
    }

    AthleteInvite {
        string id PK
        string token UK
        datetime expiresAt
        datetime createdAt
        boolean used
        string organizationId FK
    }

    Event {
        string id PK
        string name
        datetime date
        string location
        string type
        string description
        datetime createdAt
        datetime updatedAt
        string organizationId FK
    }

    EventCategory {
        string eventId PK_FK
        string categoryId PK_FK
    }

    Payment {
        string id PK
        string name
        datetime dueDate
        boolean isFinalized
        string eventId FK
        string championshipId FK
        datetime createdAt
        datetime updatedAt
    }

    PaymentCategory {
        string paymentId PK_FK
        string categoryId PK_FK
    }

    PaymentItem {
        string id PK
        string name
        float value
        boolean quantityEnabled
        string paymentId FK
        datetime createdAt
        datetime updatedAt
        boolean required
        boolean isFixed
    }

    EventAttendance {
        string id PK
        string eventId FK
        string athleteId FK
        boolean confirmed
        datetime confirmedAt
        datetime createdAt
        datetime updatedAt
    }

    AthletePaymentItem {
        string id PK
        string attendanceId FK
        string paymentItemId FK
        boolean paid
        datetime paidAt
        datetime createdAt
        datetime updatedAt
        int confirmedQuantity
        int paidQuantity
    }

    Championship {
        string id PK
        string name
        string description
        datetime startDate
        datetime endDate
        string location
        string organizerId FK
        datetime createdAt
        datetime updatedAt
    }

    ChampionshipCategory {
        string id PK
        string championshipId FK
        string categoryId FK
        string name
        boolean allowUpgrade
        datetime createdAt
        datetime updatedAt
    }

    ChampionshipEntry {
        string id PK
        string championshipId FK
        string organizationId FK
        string championshipCategoryId FK
        datetime createdAt
        datetime updatedAt
    }

    ChampionshipAthleteEntry {
        string id PK
        string entryId FK
        string athleteId FK
        boolean confirmed
        datetime confirmedAt
        datetime createdAt
        datetime updatedAt
    }

    ChampionshipInvite {
        string id PK
        string championshipId FK
        string organizationId FK
        string token
        datetime expiresAt
        boolean used
        datetime usedAt
        datetime createdAt
    }
```

## Descrição das Entidades Principais

### Organization (Organização)
Entidade central que representa uma organização/clube. Contém todos os recursos principais:
- Gerentes (Managers)
- Atletas (Athletes)
- Categorias (Categories)
- Eventos (Events)
- Campeonatos (Championships) organizados

### User (Usuário)
Sistema de autenticação central. Um usuário pode ser:
- Um Admin (relacionado diretamente com Organization)
- Um Manager (através do modelo Manager)
- Um Athlete (através do modelo Athlete)

### Manager (Gerente)
Gerente de uma organização, responsável por gerenciar categorias específicas.

### Athlete (Atleta)
Atleta pertencente a uma organização, pode estar em múltiplas categorias.

### Category (Categoria)
Categoria de competição dentro de uma organização (ex: Sub-15, Sub-17, etc.).

### Event (Evento)
Evento organizado por uma organização, pode ter múltiplas categorias e pagamentos associados.

### Payment (Pagamento)
Pagamento associado a um Event ou Championship. Contém PaymentItems que são itens específicos de pagamento.

### Championship (Campeonato)
Campeonato organizado por uma Organization. Outras organizações podem se inscrever através de ChampionshipEntry.

### ChampionshipEntry (Inscrição no Campeonato)
Representa a inscrição de uma Organization em um Championship, em uma categoria específica (ChampionshipCategory).

### ChampionshipAthleteEntry (Atleta na Inscrição)
Representa um atleta específico incluído na inscrição do campeonato.

## Relacionamentos Principais

1. **Organization** é a entidade central, tendo relacionamentos com a maioria das outras entidades
2. **User** é usado para autenticação e pode ter diferentes papéis (Admin, Manager, Athlete)
3. **Many-to-Many** relações:
   - Manager ↔ Category (através de ManagerCategory)
   - Athlete ↔ Category (através de CategoryAthlete)
   - Event ↔ Category (através de EventCategory)
   - Payment ↔ Category (através de PaymentCategory)
4. **EventAttendance** conecta Athletes a Events e rastreia pagamentos através de AthletePaymentItem
5. **Championship** permite que múltiplas organizações participem através do sistema de convites e inscrições

