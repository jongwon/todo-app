# 프로젝트 관리 시스템

Kanban 보드를 이용한 프로젝트 및 할일 관리 시스템입니다.

## 주요 기능

- 📁 프로젝트 생성/수정/삭제 관리
- ✅ 할일 생성/수정/삭제 관리  
- 📋 Kanban 보드 (Todo / In Progress / Done)
- 🏷️ 우선순위 설정 (낮음/보통/높음)
- 📅 마감일 설정 및 관리
- 🎨 프로젝트별 색상 테마

## 기술 스택

- **Frontend/Backend**: Next.js 14
- **Database**: PostgreSQL (Docker)
- **ORM**: Prisma
- **UI**: Tailwind CSS + Custom Components
- **Icons**: Lucide React

## 시작하기

### 1. 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd todo/todo-app

# 의존성 설치
npm install
```

### 2. 데이터베이스 설정

Docker를 이용해 PostgreSQL 데이터베이스를 실행합니다:

```bash
# PostgreSQL 컨테이너 실행 (포트 15501)
docker-compose up -d

# 데이터베이스 스키마 적용
npm run db:push

# Prisma 클라이언트 생성
npm run db:generate
```

### 3. 애플리케이션 실행

```bash
# 개발 서버 실행 (포트 15502)
npm run dev
```

브라우저에서 `http://localhost:15502`로 접속하세요.

## 환경 변수

`.env.local` 파일에 다음 환경 변수들이 설정되어 있습니다:

```env
DATABASE_URL="postgresql://todouser:todopassword@localhost:15501/todo_management?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:15502"
```

## 사용법

### 프로젝트 관리
1. 홈페이지에서 "프로젝트 보기" 클릭
2. "새 프로젝트" 버튼으로 프로젝트 생성
3. 프로젝트 이름, 설명, 색상 설정
4. "프로젝트 열기"로 Kanban 보드 접근

### 할일 관리
1. 프로젝트 상세 페이지에서 "새 할일" 클릭
2. 할일 제목, 설명, 우선순위, 마감일 설정
3. Kanban 보드에서 드래그앤드롭으로 상태 변경
4. 할일 카드 클릭으로 수정/삭제

### Kanban 보드
- **Todo**: 새로 생성된 할일
- **In Progress**: 진행 중인 할일  
- **Done**: 완료된 할일

## API 엔드포인트

### 프로젝트 API
- `GET /api/projects` - 프로젝트 목록 조회
- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects/[id]` - 프로젝트 상세 조회
- `PUT /api/projects/[id]` - 프로젝트 수정
- `DELETE /api/projects/[id]` - 프로젝트 삭제 (비활성화)

### 할일 API
- `GET /api/tasks` - 할일 목록 조회
- `POST /api/tasks` - 할일 생성
- `GET /api/tasks/[id]` - 할일 상세 조회
- `PUT /api/tasks/[id]` - 할일 수정
- `DELETE /api/tasks/[id]` - 할일 삭제

## 데이터베이스 스키마

### Project
- id: 고유 식별자
- title: 프로젝트 이름
- description: 프로젝트 설명
- color: 프로젝트 색상
- isActive: 활성 상태
- createdAt, updatedAt: 생성/수정 시간

### Task
- id: 고유 식별자
- title: 할일 제목
- description: 할일 설명
- status: 상태 (TODO, IN_PROGRESS, DONE)
- priority: 우선순위 (LOW, MEDIUM, HIGH)
- dueDate: 마감일
- projectId: 프로젝트 참조
- createdAt, updatedAt: 생성/수정 시간

## 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# 데이터베이스 스키마 동기화
npm run db:push

# Prisma Studio 실행
npm run db:studio
```