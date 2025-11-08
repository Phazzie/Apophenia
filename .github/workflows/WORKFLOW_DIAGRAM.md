# PR Comments to Issues - Workflow Diagram

## Visual Flow

```mermaid
graph TD
    A[PR Comment Created] --> B{Contains Trigger Keyword?}
    B -->|No| C[Skip - No Action]
    B -->|Yes| D[Parse Comment]

    D --> E[Detect Issue Type]
    E --> F{Type Detected}
    F -->|bug| G[Label: bug]
    F -->|enhancement| H[Label: enhancement]
    F -->|documentation| I[Label: documentation]
    F -->|security| J[Label: security]
    F -->|test| K[Label: test]
    F -->|refactor| L[Label: refactor]

    G --> M[Get File Path]
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M

    M --> N{CODEOWNERS exists?}
    N -->|Yes| O[Match File to Owner]
    N -->|No| P[Use Comment Author]

    O --> Q[Determine Assignee]
    P --> Q

    Q --> R[Extract PR Context]
    R --> S[Get Line Numbers]
    S --> T[Build Issue Body]

    T --> U[Create GitHub Issue]
    U --> V[Add Labels]
    V --> W[Assign Owner]
    W --> X[Reply on PR]

    X --> Y{Notion Configured?}
    Y -->|Yes| Z[Create Notion Page]
    Y -->|No| AA[Skip Notion]

    Z --> AB{ClickUp Configured?}
    AA --> AB

    AB -->|Yes| AC[Create ClickUp Task]
    AB -->|No| AD[Skip ClickUp]

    AC --> AE[Done ✅]
    AD --> AE

    style A fill:#e1f5ff
    style U fill:#c8e6c9
    style AE fill:#81c784
    style C fill:#ffcdd2
```

## Detailed Step Flow

```mermaid
sequenceDiagram
    participant User as PR Reviewer
    participant GitHub as GitHub
    participant Workflow as GitHub Actions
    participant CodeOwners as CODEOWNERS File
    participant Notion as Notion API
    participant ClickUp as ClickUp API

    User->>GitHub: Creates PR Comment with "TODO:"
    GitHub->>Workflow: Triggers pr-comments-to-issues.yml

    Note over Workflow: Step 1: Parse Comment
    Workflow->>Workflow: Check for trigger keywords
    Workflow->>Workflow: Detect issue type from keywords
    Workflow->>Workflow: Extract comment content

    Note over Workflow: Step 2: Get File Ownership
    Workflow->>CodeOwners: Read CODEOWNERS file
    CodeOwners-->>Workflow: Return owner for file path

    Note over Workflow: Step 3: Get PR Details
    Workflow->>GitHub: Fetch PR metadata
    GitHub-->>Workflow: Return PR number, title, URLs
    Workflow->>Workflow: Extract line numbers from comment

    Note over Workflow: Step 4: Create Issue
    Workflow->>GitHub: Create new issue with context
    GitHub-->>Workflow: Return issue number and URL

    Note over Workflow: Step 5: Notify PR
    Workflow->>GitHub: Reply to original comment
    GitHub-->>User: Show reply with issue link

    Note over Workflow: Step 6: Sync Notion (Optional)
    alt Notion Configured
        Workflow->>Notion: Create database page
        Notion-->>Workflow: Success/Failure
    end

    Note over Workflow: Step 7: Sync ClickUp (Optional)
    alt ClickUp Configured
        Workflow->>ClickUp: Create task
        ClickUp-->>Workflow: Success/Failure
    end

    Workflow->>GitHub: Workflow Complete ✅
```

## Component Architecture

```mermaid
graph LR
    subgraph "GitHub Repository"
        PR[Pull Request]
        Comment[Review Comment]
        Issue[GitHub Issue]
        CW[CODEOWNERS File]
    end

    subgraph "GitHub Actions Workflow"
        Trigger[Event Trigger]
        Parse[Comment Parser]
        Type[Type Detector]
        Owner[Ownership Resolver]
        Creator[Issue Creator]
        Notifier[PR Notifier]
    end

    subgraph "External Integrations"
        Notion[Notion Database]
        ClickUp[ClickUp List]
    end

    Comment -->|Event| Trigger
    Trigger --> Parse
    Parse --> Type
    Type --> Owner

    CW -->|Read| Owner

    Owner --> Creator
    Creator -->|Create| Issue
    Creator --> Notifier

    Issue -->|Link| PR
    Notifier -->|Reply| Comment

    Creator -.->|Sync| Notion
    Creator -.->|Sync| ClickUp

    style PR fill:#e3f2fd
    style Issue fill:#c8e6c9
    style Notion fill:#fff9c4
    style ClickUp fill:#f8bbd0
```

## Trigger Detection Logic

```mermaid
flowchart TD
    Start[Comment Text] --> Check1{Contains 'TODO:'?}
    Check1 -->|Yes| Create[Create Issue]
    Check1 -->|No| Check2{Contains 'FIXME:'?}

    Check2 -->|Yes| Create
    Check2 -->|No| Check3{Contains 'create issue'?}

    Check3 -->|Yes| Create
    Check3 -->|No| Check4{Contains 'track this'?}

    Check4 -->|Yes| Create
    Check4 -->|No| Check5{Contains 'follow up'?}

    Check5 -->|Yes| Create
    Check5 -->|No| Skip[Skip - No Trigger]

    Create --> TypeCheck[Analyze for Type]

    style Create fill:#81c784
    style Skip fill:#ffcdd2
```

## Type Detection Logic

```mermaid
flowchart LR
    Comment[Comment Text] --> Keywords{Check Keywords}

    Keywords -->|bug, error, broken| Bug[Type: bug]
    Keywords -->|feature, improve, todo| Enhancement[Type: enhancement]
    Keywords -->|docs, documentation| Docs[Type: documentation]
    Keywords -->|refactor, cleanup| Refactor[Type: refactor]
    Keywords -->|test, coverage| Test[Type: test]
    Keywords -->|security, vulnerability| Security[Type: security]
    Keywords -->|No match| Default[Type: enhancement]

    Bug --> Labels[Apply Labels]
    Enhancement --> Labels
    Docs --> Labels
    Refactor --> Labels
    Test --> Labels
    Security --> Labels
    Default --> Labels

    style Bug fill:#ffcdd2
    style Enhancement fill:#c5e1a5
    style Docs fill:#90caf9
    style Security fill:#ffab91
    style Test fill:#ce93d8
    style Refactor fill:#fff59d
```

## Ownership Resolution

```mermaid
flowchart TD
    Start[File Path from Comment] --> Check{CODEOWNERS exists?}

    Check -->|No| Fallback[Use Comment Author]
    Check -->|Yes| Read[Read CODEOWNERS]

    Read --> Parse[Parse patterns]
    Parse --> Match{Pattern matches file?}

    Match -->|Yes| Owner[Extract Owner]
    Match -->|No| NextPattern{More patterns?}

    NextPattern -->|Yes| Parse
    NextPattern -->|No| Fallback

    Owner --> Assign[Assign to Owner]
    Fallback --> Assign

    style Owner fill:#81c784
    style Fallback fill:#ffcc80
```

## Integration Flow

```mermaid
flowchart TD
    Issue[GitHub Issue Created] --> NotionCheck{NOTION_API_KEY set?}

    NotionCheck -->|No| ClickUpCheck
    NotionCheck -->|Yes| NotionAPI[Call Notion API]

    NotionAPI --> NotionResult{Success?}
    NotionResult -->|Yes| NotionLog[Log Success]
    NotionResult -->|No| NotionError[Log Error - Continue]

    NotionLog --> ClickUpCheck
    NotionError --> ClickUpCheck

    ClickUpCheck{CLICKUP_API_KEY set?}
    ClickUpCheck -->|No| Done
    ClickUpCheck -->|Yes| ClickUpAPI[Call ClickUp API]

    ClickUpAPI --> ClickUpResult{Success?}
    ClickUpResult -->|Yes| ClickUpLog[Log Success]
    ClickUpResult -->|No| ClickUpError[Log Error - Continue]

    ClickUpLog --> Done[Complete ✅]
    ClickUpError --> Done

    style Done fill:#81c784
    style NotionError fill:#ffcc80
    style ClickUpError fill:#ffcc80
```

## Error Handling

```mermaid
flowchart TD
    Start[Workflow Step] --> Execute{Execute Step}

    Execute -->|Success| NextStep[Next Step]
    Execute -->|Error| Critical{Critical Step?}

    Critical -->|Yes| Fail[Workflow Fails ❌]
    Critical -->|No| Log[Log Error]

    Log --> Continue[Continue to Next Step]
    Continue --> NextStep

    NextStep --> Complete[Complete]

    style Complete fill:#81c784
    style Fail fill:#ef5350
    style Log fill:#ffcc80
```

### Critical vs Non-Critical Steps

**Critical Steps** (Must succeed):
- Parse comment
- Get file ownership
- Create GitHub issue

**Non-Critical Steps** (Continue on error):
- Notion sync
- ClickUp sync
- PR reply (with fallback)

## Data Flow

```mermaid
graph LR
    subgraph Input
        A[PR Comment]
        B[CODEOWNERS]
        C[PR Metadata]
    end

    subgraph Processing
        D[Parse & Classify]
        E[Build Context]
        F[Create Issue]
    end

    subgraph Output
        G[GitHub Issue]
        H[PR Reply]
        I[Notion Page]
        J[ClickUp Task]
    end

    A --> D
    B --> E
    C --> E
    D --> E
    E --> F
    F --> G
    F --> H
    F -.-> I
    F -.-> J

    style A fill:#e3f2fd
    style G fill:#c8e6c9
    style H fill:#c8e6c9
    style I fill:#fff9c4
    style J fill:#f8bbd0
```

## Timing Diagram

```mermaid
gantt
    title Workflow Execution Timeline
    dateFormat ss

    section Detection
    Trigger Event           :0, 1s
    Parse Comment          :1s, 2s

    section Analysis
    Detect Type            :3s, 2s
    Get Ownership          :5s, 2s
    Get PR Details         :7s, 2s

    section Creation
    Create GitHub Issue    :9s, 3s
    Reply on PR            :12s, 2s

    section Integration
    Sync to Notion         :14s, 2s
    Sync to ClickUp        :16s, 2s

    section Complete
    Workflow Done          :18s, 1s
```

**Expected Total Time:** 15-30 seconds (depending on integrations)

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Listening : Workflow Enabled
    Listening --> Triggered : PR Comment Created

    Triggered --> Parsing : Check Keywords
    Parsing --> Skipped : No Trigger Found
    Parsing --> Processing : Trigger Found

    Processing --> Analyzing : Parse Content
    Analyzing --> Resolving : Determine Type
    Resolving --> Creating : Get Owner

    Creating --> Notifying : Issue Created
    Notifying --> Syncing : PR Notified

    Syncing --> Complete : Integrations Done

    Skipped --> Listening
    Complete --> Listening

    Complete --> [*]
```

## Summary

These diagrams illustrate:

1. **Main Flow** - Overall workflow from comment to issue
2. **Sequence** - Interaction between components
3. **Architecture** - System components and relationships
4. **Trigger Logic** - How trigger keywords are detected
5. **Type Detection** - How issue types are classified
6. **Ownership** - How assignees are determined
7. **Integration** - How external tools are synced
8. **Error Handling** - How errors are managed
9. **Data Flow** - How data moves through the system
10. **Timing** - Expected execution timeline
11. **State** - Workflow state transitions

---

**Note:** These diagrams use Mermaid syntax and will render automatically on GitHub.

**View this file on GitHub to see the rendered diagrams.**
