# AutoCon — Database Schema

## Mermaid ER Diagram

Paste this into **[Mermaid Live Editor](https://mermaid.live)**, **dbdiagram.io** (as the DBML below), or **draw.io** (import Mermaid).

```mermaid
erDiagram

    %% ──────────────────────────────────────────────────────────────
    %%  USERS
    %% ──────────────────────────────────────────────────────────────
    USER {
        ObjectId  _id           PK
        String    walletAddress UK "lowercase, indexed"
        String    nonce             "32-byte hex, rotated on login"
        String    role             "enum: user | admin"
        Number    tokenVersion      "incremented on logout"
        Number    usage_deployments "atomic counter"
        Number    usage_audits      "atomic counter"
        String    apiKey        UK  "sparse — null by default"
        Date      createdAt
        Date      updatedAt
    }

    %% ──────────────────────────────────────────────────────────────
    %%  NONCES  (ephemeral — TTL auto-deleted)
    %% ──────────────────────────────────────────────────────────────
    NONCE {
        ObjectId  _id           PK
        String    walletAddress FK "→ USER.walletAddress (indexed)"
        String    nonce
        Date      expiresAt        "TTL index — auto-deleted"
        String    type             "enum: signup | login"
        Date      createdAt
        Date      updatedAt
    }

    %% ──────────────────────────────────────────────────────────────
    %%  TOKEN BLACKLIST  (ephemeral — TTL auto-deleted)
    %% ──────────────────────────────────────────────────────────────
    TOKEN_BLACKLIST {
        ObjectId  _id           PK
        String    token         UK "JWT string, indexed"
        String    walletAddress FK "→ USER.walletAddress"
        Date      expiresAt        "TTL index — auto-deleted"
        Date      createdAt
        Date      updatedAt
    }

    %% ──────────────────────────────────────────────────────────────
    %%  CONTRACTS  (unified — replaces Token, NFT, Auction)
    %% ──────────────────────────────────────────────────────────────
    CONTRACT {
        ObjectId  _id             PK
        ObjectId  userId          FK "→ USER._id"
        String    ownerAddress       "denormalized for fast on-chain lookup"
        String    contractType       "enum: ERC20 | ERC721 | AUCTION"
        String    name
        String    symbol            "ERC20 / ERC721 only"
        String    contractAddress   "on-chain address"
        String    network           "enum: Sepolia | Mainnet | Amoy | BNBTestnet"
        Mixed     abi               "ABI JSON array"
        String    txHash
        Number    gasUsed
        Number    blockNumber
        String    sourceCode        "Solidity source"
        String    contractName
        String    sourceFile
        String    compilerVersion
        Number    optimizationUsed  "0 or 1"
        Number    runs              "optimizer runs (default 200)"
        Mixed     constructorArgs
        Boolean   verified          "Etherscan verified flag"
        Date      verifiedAt
        Mixed     metadata          "ERC20:{supply} ERC721:{maxSupply,mintPrice,baseURI} AUCTION:{itemName,itemDescription,duration,minimumBid}"
        Date      createdAt
        Date      updatedAt
    }

    %% ──────────────────────────────────────────────────────────────
    %%  AUDIT REPORTS
    %% ──────────────────────────────────────────────────────────────
    AUDIT_REPORT {
        ObjectId  _id             PK
        ObjectId  contractId      FK "→ CONTRACT._id"
        String    contractAddress    "denormalized"
        String    ownerAddress       "denormalized"
        Number    score              "0-100"
        String    riskLevel          "enum: LOW | MEDIUM | HIGH | CRITICAL"
        Number    totalFindings
        Array     findings           "Finding sub-documents (see below)"
        Number    summary_critical
        Number    summary_high
        Number    summary_medium
        Number    summary_low
        String    engineVersion      "default: v1"
        Date      createdAt
        Date      updatedAt
    }

    %% ──────────────────────────────────────────────────────────────
    %%  FINDINGS  (embedded sub-document inside AUDIT_REPORT)
    %% ──────────────────────────────────────────────────────────────
    FINDING {
        String    ruleId
        String    title
        String    severity    "enum: LOW | MEDIUM | HIGH | CRITICAL"
        String    description
        String    advice
        Number    line
        String    code
        Array     additionalLines
    }

    %% ──────────────────────────────────────────────────────────────
    %%  JOBS  (BullMQ lifecycle tracker)
    %% ──────────────────────────────────────────────────────────────
    JOB {
        ObjectId  _id          PK
        String    jobId        UK "BullMQ job ID, indexed"
        String    type            "enum: verification | audit"
        String    ownerAddress    "wallet address, indexed"
        String    status          "enum: pending | processing | completed | failed"
        Number    attempts
        Number    maxAttempts     "default 3"
        Date      startedAt
        Date      completedAt
        Mixed     payload         "input data the worker processed"
        Mixed     result          "structured result on success"
        String    error           "error message on failure"
        Date      createdAt
        Date      updatedAt
    }

    %% ──────────────────────────────────────────────────────────────
    %%  RELATIONSHIPS
    %% ──────────────────────────────────────────────────────────────
    USER         ||--o{ CONTRACT      : "owns (userId)"
    USER         ||--o{ NONCE         : "has (walletAddress)"
    USER         ||--o{ TOKEN_BLACKLIST : "blacklists (walletAddress)"
    CONTRACT     ||--o{ AUDIT_REPORT  : "has audit history (contractId)"
    AUDIT_REPORT ||--|{ FINDING       : "embeds findings[]"
    USER         ||--o{ JOB           : "triggers (ownerAddress)"
```

---

## DBML  (for dbdiagram.io — paste at https://dbdiagram.io)

```dbml
// AutoCon — MongoDB Schema represented in DBML
// Collections modelled as tables; Mixed/Array types noted in comments.

Table users {
  _id           ObjectId [pk, note: 'Auto-generated']
  walletAddress String   [unique, not null, note: 'Ethereum address, lowercase']
  nonce         String   [not null, note: '32-byte hex; rotated on every login']
  role          String   [not null, default: 'user', note: 'Enum: user | admin']
  tokenVersion  Int      [not null, default: 0]
  usage_deployments Int  [not null, default: 0]
  usage_audits  Int      [not null, default: 0]
  apiKey        String   [unique, note: 'Sparse — null by default']
  createdAt     DateTime
  updatedAt     DateTime
}

Table nonces {
  _id           ObjectId [pk]
  walletAddress String   [not null, ref: > users.walletAddress, note: 'Indexed']
  nonce         String   [not null]
  expiresAt     DateTime [not null, note: 'TTL index — document auto-deleted at this time']
  type          String   [default: 'signup', note: 'Enum: signup | login']
  createdAt     DateTime
  updatedAt     DateTime

  indexes {
    (walletAddress, type) [unique]
  }
}

Table token_blacklists {
  _id           ObjectId [pk]
  token         String   [unique, not null, note: 'JWT string']
  walletAddress String   [not null, ref: > users.walletAddress]
  expiresAt     DateTime [not null, note: 'TTL index — auto-deleted']
  createdAt     DateTime
  updatedAt     DateTime
}

Table contracts {
  _id              ObjectId [pk]
  userId           ObjectId [not null, ref: > users._id, note: 'FK → users._id']
  ownerAddress     String   [not null, note: 'Denormalized wallet address']
  contractType     String   [not null, note: 'Enum: ERC20 | ERC721 | AUCTION']
  name             String   [not null]
  symbol           String   [note: 'ERC20 / ERC721 ticker symbol']
  contractAddress  String   [not null, note: 'On-chain deployed address']
  network          String   [default: 'Sepolia', note: 'Enum: Sepolia | Mainnet | Amoy | BNBTestnet']
  abi              JSON     [note: 'Contract ABI array']
  txHash           String   [note: 'Deployment transaction hash']
  gasUsed          Int
  blockNumber      Int
  sourceCode       String   [note: 'Solidity source code string']
  contractName     String
  sourceFile       String
  compilerVersion  String
  optimizationUsed Int      [default: 1]
  runs             Int      [default: 200]
  constructorArgs  JSON     [note: 'ABI-encoded constructor arguments']
  verified         Boolean  [default: false]
  verifiedAt       DateTime
  metadata         JSON     [note: 'ERC20:{supply} ERC721:{maxSupply,mintPrice,baseURI} AUCTION:{itemName,itemDescription,duration,minimumBid}']
  createdAt        DateTime
  updatedAt        DateTime

  indexes {
    (contractAddress, network) [unique]
    (userId, createdAt)
    (ownerAddress, createdAt)
    (userId, contractType)
  }
}

Table audit_reports {
  _id             ObjectId [pk]
  contractId      ObjectId [not null, ref: > contracts._id]
  contractAddress String   [note: 'Denormalized for display']
  ownerAddress    String   [not null, note: 'Denormalized wallet']
  score           Int      [not null, note: '0-100']
  riskLevel       String   [not null, note: 'Enum: LOW | MEDIUM | HIGH | CRITICAL']
  totalFindings   Int      [default: 0]
  findings        JSON     [note: 'Array of Finding sub-documents — see findings table']
  summary_critical Int     [default: 0]
  summary_high     Int     [default: 0]
  summary_medium   Int     [default: 0]
  summary_low      Int     [default: 0]
  engineVersion   String   [default: 'v1']
  createdAt       DateTime
  updatedAt       DateTime

  indexes {
    (contractId, createdAt)
    (ownerAddress, createdAt)
  }
}

// Embedded sub-document inside audit_reports.findings[]
// Shown as a separate table for documentation clarity only.
Table findings {
  ruleId          String
  title           String
  severity        String  [note: 'Enum: LOW | MEDIUM | HIGH | CRITICAL']
  description     String
  advice          String
  line            Int
  code            String
  additionalLines JSON    [note: 'Array of line numbers']
}

Table jobs {
  _id          ObjectId [pk]
  jobId        String   [unique, not null, note: 'BullMQ job ID']
  type         String   [not null, note: 'Enum: verification | audit']
  ownerAddress String   [not null, ref: > users.walletAddress]
  status       String   [default: 'pending', note: 'Enum: pending | processing | completed | failed']
  attempts     Int      [default: 0]
  maxAttempts  Int      [default: 3]
  startedAt    DateTime
  completedAt  DateTime
  payload      JSON     [note: 'Input data the worker processed']
  result       JSON     [note: 'Structured result on success']
  error        String   [note: 'Error message on failure']
  createdAt    DateTime
  updatedAt    DateTime

  indexes {
    (ownerAddress, createdAt)
    (type, status)
  }
}
```

---

## PlantUML  (for PlantUML Online / IntelliJ / VS Code)

Paste at **https://www.plantuml.com/plantuml/uml/**

```plantuml
@startuml AutoCon_DB_Schema
!define TABLE(name,desc) class name as "desc" << (T,#FFAAAA) >>
!define PK(x) <u>x</u>
!define FK(x) #x
hide empty members
skinparam classBackgroundColor #1e1e2e
skinparam classBorderColor #7c3aed
skinparam classArrowColor #a78bfa
skinparam classFontColor #e2e8f0
skinparam classHeaderBackgroundColor #2d1b69

TABLE(User, "users") {
  PK(_id): ObjectId
  walletAddress: String UNIQUE
  nonce: String
  role: String [user|admin]
  tokenVersion: Number
  usage_deployments: Number
  usage_audits: Number
  apiKey: String SPARSE UNIQUE
  createdAt: Date
  updatedAt: Date
}

TABLE(Nonce, "nonces") {
  PK(_id): ObjectId
  FK(walletAddress): String
  nonce: String
  expiresAt: Date [TTL]
  type: String [signup|login]
  createdAt: Date
  updatedAt: Date
}

TABLE(TokenBlacklist, "token_blacklists") {
  PK(_id): ObjectId
  token: String UNIQUE
  FK(walletAddress): String
  expiresAt: Date [TTL]
  createdAt: Date
  updatedAt: Date
}

TABLE(Contract, "contracts") {
  PK(_id): ObjectId
  FK(userId): ObjectId
  ownerAddress: String
  contractType: String [ERC20|ERC721|AUCTION]
  name: String
  symbol: String
  contractAddress: String
  network: String [Sepolia|Mainnet|Amoy|BNBTestnet]
  abi: Mixed
  txHash: String
  gasUsed: Number
  blockNumber: Number
  sourceCode: String
  contractName: String
  sourceFile: String
  compilerVersion: String
  optimizationUsed: Number
  runs: Number
  constructorArgs: Mixed
  verified: Boolean
  verifiedAt: Date
  metadata: Mixed
  createdAt: Date
  updatedAt: Date
}

TABLE(AuditReport, "audit_reports") {
  PK(_id): ObjectId
  FK(contractId): ObjectId
  contractAddress: String
  ownerAddress: String
  score: Number [0-100]
  riskLevel: String [LOW|MEDIUM|HIGH|CRITICAL]
  totalFindings: Number
  findings: Finding[]
  summary_critical: Number
  summary_high: Number
  summary_medium: Number
  summary_low: Number
  engineVersion: String
  createdAt: Date
  updatedAt: Date
}

TABLE(Finding, "findings (embedded)") {
  ruleId: String
  title: String
  severity: String [LOW|MEDIUM|HIGH|CRITICAL]
  description: String
  advice: String
  line: Number
  code: String
  additionalLines: Number[]
}

TABLE(Job, "jobs") {
  PK(_id): ObjectId
  jobId: String UNIQUE
  type: String [verification|audit]
  FK(ownerAddress): String
  status: String [pending|processing|completed|failed]
  attempts: Number
  maxAttempts: Number
  startedAt: Date
  completedAt: Date
  payload: Mixed
  result: Mixed
  error: String
  createdAt: Date
  updatedAt: Date
}

User "1" --o{ "0..*" Contract : "owns (userId)"
User "1" --o{ "0..*" Nonce : "has (walletAddress)"
User "1" --o{ "0..*" TokenBlacklist : "revokes (walletAddress)"
User "1" --o{ "0..*" Job : "triggers (ownerAddress)"
Contract "1" --o{ "0..*" AuditReport : "audited (contractId)"
AuditReport "1" *--{ "0..*" Finding : "embeds findings[]"

@enduml
```

---

## Recommended Platforms

| Platform | Format to Use | Link |
|---|---|---|
| **Mermaid Live** | Mermaid block above | https://mermaid.live |
| **dbdiagram.io** | DBML block above | https://dbdiagram.io |
| **PlantUML Online** | PlantUML block above | https://www.plantuml.com/plantuml/uml/ |
| **draw.io / diagrams.net** | Import → From Text → Mermaid | https://app.diagrams.net |
| **Lucidchart** | Copy DBML or Mermaid | https://lucidchart.com |
| **ERD.plus** | Manual entry from DBML | https://erdplus.com |
