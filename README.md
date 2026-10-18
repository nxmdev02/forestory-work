# forestory furniture — Nuxt implementation

제공된 `nuxt-site-implementation.md`와 13장 캡처를 기준으로 구현한 Nuxt 4 사이트입니다. 기존 Nuxt/Vue 버전을 유지하며 일반 CSS와 Vue Composition API를 사용합니다.

## 실행

Node **22.22.3 이상**(지원 범위는 `package.json`의 `engines` 참조)이 필요합니다.

```sh
npm install
npm run dev
```

개발 주소: `http://localhost:3000`

이 작업 환경에는 `.tools/node.exe`로 Node 22.22.3을 준비했습니다. npm 스크립트가 해당 런타임을 자동 선택하므로 시스템 Node를 변경하지 않고 실행할 수 있습니다. 다른 환경에서는 지원되는 Node를 설치하면 됩니다. `.tools`는 Git에 포함되지 않습니다.

```sh
npm run typecheck
npm run build
npm run preview
npx playwright install chromium
npm run test:e2e
```

`.npmrc`의 `legacy-peer-deps`는 초기 npm 10의 의존성 해석 오류를 피하기 위한 설정입니다. TypeScript는 현재 Vue 타입 검사 도구와 호환되는 5.9 계열로 고정했습니다.

## 구현 페이지

| 경로 | 내용 |
| --- | --- |
| `/` | 기존 인트로 영상과 Fellowmind Göteborg·Tarsier·Fellowmind Malmö 사진 3장, 브랜드 문구, 고정 연락처, 다음 장면 이동 |
| `/projects` | 우드슬랩·자개 리폼·상업가구 각 4개, 미디어·팝업 16개, 카테고리·연도 필터, 데스크톱 3열 / 태블릿 2열 / 모바일 1열 |
| `/projects/premium-woodwork` | 네 사례가 공유하는 상세 페이지, Korea·Wood·연도, 소개·더 보기, 제작 사례·공정 사진 |
| `/projects/heritage-craft` | 자개 리폼 네 사례가 공유하는 상세 페이지, 소개·더 보기, 제작 사례·상담·코팅 사진 |
| `/projects/commercial-space` | 상업가구 네 사례가 공유하는 상세 페이지, 소개·더 보기, 제작 사례·대량 제작·설치·실측 사진 |
| `/projects/media-drama-furniture` | 드라마 가구 네 사례가 공유하는 상세 페이지, 제작 소개·촬영 공간·작품 포스터 |
| `/projects/brand-pop-up` | 지자체 소품·가판대·팝업 가구 12개가 공유하는 상세 페이지, 제작 소개·사례·CNC 공정 |
| `/archive` | 자체 제작품 소개, 아카이브 001~003(사진·제품명·수종·가격 미입력), 개별 이메일 문의 |
| `/office` | 소개, 팀 3명(사진 영역은 비워둠), 서비스, 스크롤에 따른 Process 사진·강조 전환, 쌓이는 섹션 메뉴, Contact 바 |

잘못된 프로젝트 주소는 HTTP 404를 반환합니다. 공통 헤더는 상세 대표 이미지 경계에 따라 흰색/초록색으로 전환합니다. 모바일 메뉴는 포커스 순환·Escape·포커스 복귀를 지원합니다. 모션 감소 설정에서는 배경 영상과 부드러운 스크롤을 정지합니다.

모바일 메뉴는 햄버거 아이콘과 닫기 아이콘을 사용합니다. Projects·프로젝트 상세·Archive의 모바일 하단 Contact 바는 푸터로 이동하며, 푸터가 보이거나 메뉴가 열리면 숨깁니다. Office는 기존 Contact 바를 유지합니다. 헤더의 projects 버튼을 누르면 전체 프로젝트와 네 카테고리를 선택하는 메뉴가 열립니다. 모바일에서는 projects 아래로 카테고리가 펼쳐집니다. 목록 상단은 모든 화면에서 All·2026·2025·2024 연도 칩을 사용합니다. 선택 상태는 `/projects?category=premium-woodwork&year=2025`처럼 주소에 반영합니다. 카테고리를 바꾸면 연도는 All로 초기화하고 목록 상단으로 이동합니다.

## 수정 위치

- `app/data/site.ts`: 브랜드, 연락처, 메뉴, 외부 링크, 서비스, 메인 장면 설정.
- `app/data/reference.json`: 프로젝트 카드(`projects`), 공통 상세(`projectDetails`), 상품, 팀, 소개와 프로세스 데이터.
- `app/assets/css/main.css`: 색상·타이포그래피·이미지 톤·전체 반응형 레이아웃.
- `app/components/`: 공통 헤더·푸터·연락처·프로젝트 카드·메인 장면.
- `app/pages/`: 페이지와 상세 공통 템플릿.
- `public/images/`, `public/fonts/`: 로컬 미디어와 Cera Pro 폰트.
- `tests/site.spec.ts`: 주요 페이지·미디어·모바일 메뉴·스크롤·본문 펼침·라우팅·404 검증.

프로젝트 필터는 연도(`specs.Year`)와 카테고리(`category`)를 동시에 적용합니다. `app/data/reference.json`의 각 프로젝트에 아래 `category` 값을 지정하면 해당 필터에 표시됩니다. `premium-woodwork`는 앞 두 장이 2025년, 뒤 두 장이 2024년이며, `heritage-craft`는 앞 두 장이 2025년, 뒤 두 장이 2026년입니다. 각 카드의 `detailSlug`가 카테고리 공통 상세의 `slug`와 연결됩니다. 상세 상단은 `app/data/site.ts`의 `site.projectHero`에 지정한 공통 원목 인테리어 이미지(`wood-interior-cta.webp`)를 사용합니다. 원본 PNG를 같은 해상도의 WebP로 변환했습니다.

| category | 표시명 |
| --- | --- |
| `media-pop-up` | MEDIA & POP-UP — 미디어 세트 & 브랜드 팝업 |
| `commercial-space` | COMMERCIAL SPACE — 상업 & 공간 맞춤 가구 |
| `heritage-craft` | HERITAGE CRAFT — 자개 리폼 |
| `premium-woodwork` | PREMIUM WOODWORK — 우드슬랩 테이블 |

`commercial-space` 네 사례의 연도는 사진 순서대로 2025·2026·2025·2025년입니다. 상업가구 사진은 포트폴리오 PDF 14~15쪽의 원본 이미지이며, 현재 상세 갤러리는 사진 없이 6칸으로 구성합니다.

카드를 클릭하면 `?project=카드-slug`로 선택 정보를 전달하며, 공통 상세의 Year에는 해당 카드의 연도 하나만 표시합니다. 선택 정보 없이 상세 주소로 직접 접속하면 해당 상세에 연결된 첫 카드의 연도를 표시합니다. 상세 제목·대표 이미지·갤러리는 공통 구성을 유지합니다.

`media-pop-up`에는 드라마 가구 4개(2025·2025·2026·2025년), 지자체 소품 4개(2025·2026·2026·2026년), 행사 가판대 4개(2025년), 브랜드 팝업 가구 4개(2026년)를 등록했습니다. 드라마 가구는 `media-drama-furniture`, 나머지 12개는 `brand-pop-up` 상세로 연결됩니다. 사진은 포트폴리오 PDF 8~13쪽에서 추출했으며, 현재 두 상세 갤러리는 각각 사진 없이 6칸으로 구성합니다.

## 참고 자료와 범위

원본 사이트 `https://dsgninterior.se/en`의 공개 파일을 확인하여 사진, 영상, 폰트와 데이터를 로컬에 저장했습니다. 각 파일의 출처는 `public/asset-sources.json`에 기록했습니다. 인트로 정지 이미지는 같은 영상의 8초 프레임이며, 재생도 그 장면에서 시작합니다. 원본 미디어 누락 없이 실행됩니다.

메인은 인트로 → crafting wood / telling stories → shaped by nature / crafted with care → thoughtful details / everyday living의 일반 세로 스크롤로 구성했습니다. 원본 사이트의 모든 전환 효과를 복제한 것은 아닙니다. Office 섹션 메뉴·현재 단계 판단·Contact 숨김은 캡처를 바탕으로 구현했습니다. 모바일은 반응형으로 설계했습니다.

우드슬랩 사진은 사용자 포트폴리오 PDF 18~19쪽, 자개 리폼 사진은 16~17쪽에서 원본 이미지를 추출했습니다. 출처는 `public/forestory-asset-sources.json`에 기록했습니다. 모든 상세 본문 갤러리는 3열 × 2행의 빈 이미지 공간 6칸으로 통일했습니다. 각 칸의 비율은 3:4이며, 사진을 넣을 때는 해당 `projectDetails.gallery` 항목의 `src`와 `alt`를 입력합니다. 이전 갤러리 배치는 `.reference/detail-galleries-before-empty.json`에 보관했습니다. 기존 해외 프로젝트 데이터는 `.reference/reference-before-premium.json`에 보관했습니다. 원본 사이트를 다시 불러오는 API나 CMS는 없습니다.

언어 선택 표시는 헤더에서 제거했습니다. 푸터의 Instagram은 `forestory_furniture` 계정으로 연결하며, 제작사 표기는 `Website by Differs`입니다. LinkedIn과 법적 고지 링크는 제거했습니다. 관리자, 결제, 언어 전환, 별도 법적 고지 페이지와 배포는 이번 구현 범위에 포함되지 않습니다.

`scripts/import-reference.mjs`는 필요할 때만 명시적으로 실행하는 원본 데이터/에셋 수집 도구입니다. 실행하면 로컬 데이터가 다시 생성되므로 수동 수정 후에는 주의해서 사용합니다. 일반 개발·빌드는 저장된 로컬 파일만 사용합니다.
