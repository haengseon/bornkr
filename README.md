# 태어나보니 대한민국

대한민국에서 무작위로 태어나 한 사람의 생애를 15분 안에 살아 보는, 통계 기반 생애 시뮬레이션 웹게임입니다(19세 이상 권장).

- 정적 웹(바닐라 JS, 빌드 의존성은 개발용 esbuild·playwright-core뿐). 서버 없이 동작하며 기록은 브라우저에만 저장됩니다.
- 실제 통계와 시대별 자료를 참고한 가상 인생입니다. 일부 확률과 개인 사건은 게임을 위한 추정·각색입니다. 출처와 확인 수준은 [자료조사 목록](docs/research/README.md), `src/data/sources.js` 참고.

## 개발

```bash
npm install
npm run serve        # http://localhost:5173
npm test             # 단위 테스트
npm run build:site   # dist/site (S3·CloudFront 등 정적 호스팅용)
```

구조: `src/engine`(시뮬레이션) · `src/data`(통계 표) · `src/content`(사건·뉴스·직업·이름) · `src/ui`(화면) · `docs`(기획·설계·리서치·QA).
설계 기준은 `docs/00-plan.md`, `docs/design/GDD.md`, `docs/design/ARCHITECTURE.md`, `docs/design/PROCESS-V2.md`.

## 공개 안내 페이지와 광고

`guide.html`(이용 가이드), `how-it-works.html`(규칙·자료), `about.html`(제작 소개), `contact.html`(문의), `privacy.html`은 JavaScript 없이도 읽는 일반 HTML이다. 원문은 `src/static/`에 있으며 개발 서버와 배포 빌드가 같은 경로로 제공한다. `robots.txt`와 `sitemap.xml`도 빌드에 포함한다.

게임 문서(`index.html`)는 광고 SDK를 로드하지 않는다. 소유권은 `google-adsense-account` 메타와 `ads.txt`로 확인한다. `src/site/ads.js`의 광고 기능은 검토 대기 중 `enabled: false`이며, 승인 후에도 허용 경로는 가이드·규칙/자료 두 페이지뿐이다. 자동 광고는 AdSense에서 끄고, 필요한 사용자 동의 설정을 완료한 뒤에만 기능을 활성화한다. 빈 화면·게임·설정·개인 기록·알림 페이지에 광고를 추가하지 않는다.

## 라이선스

라이선스는 아직 지정하지 않았습니다(모든 권리 보유). 사용 조건을 정하려면 `LICENSE` 파일을 추가하세요.

## 배포(GitHub Actions → S3 → CloudFront)

`main`에 푸시하면 `.github/workflows/deploy.yml`이 `npm run build:site`로 만든 `dist/site`를 S3(`bornkr-static-resource`)에 올리고 CloudFront 캐시를 갱신합니다.
저장소 Secrets에 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`가 있어야 배포되며(없으면 건너뜀), 선택 변수로 `S3_BUCKET`, `AWS_REGION`(기본 ap-northeast-2), `CLOUDFRONT_DISTRIBUTION_ID`를 설정할 수 있습니다.

### KOSIS 자료 일회성 수집

게임과 분리된 Node.js 22 이상 CLI입니다. API 키는 환경변수 KOSIS_API_KEY 또는 Git에서 제외한 .env.local에 설정합니다(.env.example 참고). 키를 명령줄 인자나 소스에 넣지 마세요.

- 대상 확인: npm run collect:kosis -- --list
- 전체 수집: npm run collect:kosis -- --out docs/research/kosis/2026-10-16
- 일부만 수집: npm run collect:kosis -- --only life-table,death-causes --since 2020 --until 2024 --out docs/research/kosis/recent
- 요청 계획만 저장: npm run collect:kosis -- --plan --out docs/research/kosis/plan
- 같은 옵션·출력 경로로 다시 실행하면 완료 청크를 검증·재사용합니다.
- 수집기 검사: npm run test:collector

수집 대상은 tools/kosis/catalog.mjs의 26개 표입니다. 실제 수록시점에서 연간 자료를 우선하고, 연간 자료가 없는 표는 분기 등 원주기를 유지합니다. 인구이동은 전국·시도 수준으로 한정하며 다른 분류와 세부 사망원인은 보존합니다. 없는 과거·미래 값을 추정해서 채우지 않습니다.

출력 폴더의 README.md·manifest.json에서 전체 결과를 확인할 수 있습니다. 각 표 폴더에는 분류·단위·수록시점·출처·주석 metadata.json, 요청 범위 selection.json, 원응답 raw/*.json.gz, 정규화 observations.csv.gz, 품질·파일 해시·실패 내역 summary.json이 생깁니다. CSV는 UTF-8 BOM이며 gzip 해제 후 사용할 수 있습니다. 통계 기호는 원문으로 남기고 숫자로 해석할 수 없는 값은 결측으로 구분합니다. 표의 계·소계·하위 분류를 한꺼번에 합산하지 마세요. 유병률과 발병률, 명목 월소득과 연봉, 개편 전후 조사 기준은 별개입니다.

자료와 인증키는 웹 앱에 자동 연결되지 않습니다. 수집 파일은 기존 docs/ 제외 규칙에 따라 로컬에만 저장되며, 정적 사이트 빌드·배포에 포함되지 않습니다. 실행은 한 번 수집하고 종료하며 예약 작업·상시 서비스는 만들지 않습니다.

API 안내: [통계자료 JSON](https://kosis.kr/openapi/devGuide/devGuide_0201List.do), [통계표설명](https://kosis.kr/openapi/devGuide/devGuide_060101List.do). 대용량 API는 사용자 등록 통계표 식별자가 필요하므로, 이 수집기는 매개변수형 JSON API를 분할 호출합니다.

실제 API 응답에는 전 표 공통 단위가 섞여 표시되는 경우가 있습니다. 예를 들어 임금 분포 표의 UNIT_NM은 만원%로, 가계수지 표는 가구원수 행에도 원으로 반환될 수 있습니다. CSV의 unit은 이 원문을 보존한 값이며 항목별 실질 단위를 추론한 값이 아닙니다. 게임에 적용할 때는 ITM_ID와 C1~C8의 분류·주석으로 해당 지표의 의미와 단위를 먼저 확인해야 합니다.

### 생활 시뮬레이션 모델 2

새 생애는 생활 시간·연간 장부·선택 이력을 분리해서 기록합니다. 기존 저장과 재생은 모델 1을 유지합니다. 성년 선택에는 명시적으로 작성한 성향 가중치를 적용하고, 반복된 충돌 뒤의 부담과 실제 휴식·지원 이행을 구분합니다.

생활 사건 100개와 선택 300개를 정적 콘텐츠로 등록했습니다. 현재 상태에서 실행 가능한 56개 사건은 시대·나이·인물·주거·고용·시간·현금을 검사합니다. 나머지 44개는 계약·진료·제도 등 필요한 상태가 마련될 때까지 보류합니다. `node tools/build-life-events.mjs --check`로 생성 결과를 검사할 수 있습니다.

근태 경고와 고용 종료, 반복된 약속 갈등과 관계 정리, 사회적 배제와 지원은 현재 선택과 확인된 결과가 쌓여야 진행됩니다. 성향만으로 질병이나 사망을 결정하지 않습니다. 새 위험 보정은 관측 통계와 구분한 게임 가정이며, 미성년·구버전·근거 없는 상태에는 적용하지 않습니다.
