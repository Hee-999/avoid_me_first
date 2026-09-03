# Research Basis / Construct Map

**Version:** 1.0
**Description:** Conversation Behavior Analysis Model based on Adult Attachment Research.

## 1. 기본 분석 축 (Basic Analytical Dimensions)
본 분석 엔진은 Bartholomew의 4유형을 직접 판정하지 않습니다. 성인 애착 연구에 기반하여 다음 두 가지 연속 차원(Continuous Dimensions)을 기본 축으로 삼습니다.
- **Attachment Anxiety** (애착 불안)
- **Attachment Avoidance** (애착 회피)

## 2. Dyadic Analysis Principle (양방향 분석 원칙)
본 엔진은 대화의 한 사람(Target)만 분석하지 않고, 대화에 참여한 두 사람(Speaker A / Speaker B) 모두의 행동을 독립적으로 분석합니다.
- 애착 행동은 상대방의 상호작용 맥락에 직접적인 영향을 받습니다.
- 양쪽을 모두 분석함으로써 정상적인 경계 설정(Boundary Setting)을 회피(Avoidance)로 오판하는 False Positive를 방지할 수 있습니다.
- 예를 들어, 한쪽이 지속적으로 연락을 강요(Contact Escalation)할 때 상대방이 일시적으로 대화를 멈추는 행위는 회피(AV02)라기보다 합리적인 방어기제로 해석될 수 있습니다.

## 3. Research Construct Map
본 엔진은 ECR-R과 같은 자기보고식 문항을 복제하는 것이 아닌, 실제 대화(Conversation)에서 관찰 가능한 행동 Signal을 기반으로 작동합니다.

`Research Construct` ➔ `Observable Behavior` ➔ `Conversation Signal` ➔ `Signal Extraction` ➔ `Deterministic Scoring` ➔ `Attachment Anxiety / Avoidance` ➔ `4-Type Fitness`

### 중요 원칙 (Key Principles)
- **NO Free Inference:** AI가 사람의 애착 유형을 자유롭게 추론하지 않습니다.
- **NO Direct Scoring:** AI가 불안/회피 최종 점수를 직접 생성하지 않습니다.
- **Signal Detection Only:** AI의 역할은 오직 '사전에 정의된 Signal'을 대화에서 양쪽 화자(Speaker A, Speaker B)에 대해 탐지하는 것뿐입니다.
- **Deterministic Calculation:** 점수와 유형은 양측에서 추출된 Signal과 Interaction Context를 바탕으로 향후 구축될 Deterministic Scoring Engine이 수학적으로 계산합니다.
- **Contextual Judgment:** 단 하나의 문장만으로 판단하지 않으며, 타 화자의 행동, 상호작용 맥락, 반대 증거(Counter Evidence)를 종합적으로 평가합니다.
- **Normal Boundary Check:** 일시적인 상황(업무, 피로 등)이나 상대의 위협에 대응하는 방어적 경계 설정을 애착 특성으로 오판하지 않습니다.

## 4. Signal 구조 및 규칙 (Signal Roles & Rules)

### 3.1. Role (역할)
- **CORE:** 불안/회피 점수를 형성하는 핵심 Signal. (높은 관찰 가능성 및 연구 근거)
- **SUPPORTING:** 점수를 보조하거나 신뢰도(Confidence)를 강화하는 Signal.
- **REPORT_ONLY:** 개인화 리포트 구성에만 활용되며 v1에서는 점수화되지 않음.

### 3.2. Common Strength (강도)
- `0` (None): 평가 가능한 상황임에도 관찰되지 않음.
- `1` (Weak): 하나의 약하거나 모호한 근거. 다른 상황적 설명 가능.
- `2` (Moderate): 명확한 행동 근거가 있거나 동일 종류 행동 반복.
- `3` (Strong): 다수 에피소드에서 반복, 명확한 맥락, 반대 증거(Counter Evidence)를 압도하는 일관성.

### 3.3. Status (상태)
- `detected`: 행동 탐지됨.
- `not_detected`: 상황은 존재했으나 행동이 발생하지 않음.
- `ambiguous`: 모호함.
- `insufficient`: 판단할 만한 대화 맥락 자체가 없음.

### 3.4. Global False Positive Rules (오탐 방지 글로벌 규칙)
다음과 같은 현실적, 환경적 요인이 있을 경우 Signal Strength를 과도하게 책정하지 않습니다.
- 명확한 현실 사유 (업무, 수면, 운전, 시험)
- 외부 스트레스 (건강, 가족, 과도한 업무)
- 정상적 경계 설정 (폭언, 협박, 연락 폭격을 방어하기 위함)
- 명확한 관계 종료 의사 표시 후의 일방적 연락 수신
- 실제 배신이나 명백한 관계 위협이 존재하는 상황
- 일회성 행동 (반복성 부재)
- *특히 "temporary pause + later re-engagement" 와 "persistent withdrawal" 을 엄격히 구분.*

## 5. Signal Families (시그널 패밀리)
중복 가산을 방지하기 위한 그룹화 (Overlap Rule 적용 대상).

**AVOIDANCE**
- `EMOTIONAL_OPENNESS` (AV01)
- `DISTANCING` (AV02, AV03)
- `DEPENDENCY_DEACTIVATION` (AV04, AV05, AV06)

**ANXIETY**
- `RELATIONSHIP_SECURITY` (AN01, AN02)
- `THREAT_MONITORING` (AN03, AN06)
- `PROXIMITY_REGULATION` (AN04)
- `RELATIONSHIP_BALANCE` (AN05)

## 6. Important Model Rule
> "Signal ≠ Personality"

`AV02(갈등 철수) = Strong` 이 관찰되었다고 해서 "이 사람은 회피형이다"라고 즉각 단정하지 않습니다. 이는 "제공된 대화에서 갈등 상황의 철수 행동이 강하게 관찰됨"이라는 객관적 Fact만을 의미하며, 최종 유형 판별은 모든 Signal과 Context를 융합한 이후에 코드 단에서 계산됩니다.
