# 태어나보니 대한민국

대한민국에서 무작위로 태어나 한 사람의 생애를 15분 안에 살아 보는, 통계 기반 생애 시뮬레이션 웹게임입니다(19세 이상 권장).

- 정적 웹(바닐라 JS, 빌드 의존성은 개발용 esbuild·playwright-core뿐). 서버 없이 동작하며 기록은 브라우저에만 저장됩니다.
- 실제 통계와 시대별 자료를 참고한 가상 인생입니다. 일부 확률과 개인 사건은 게임을 위한 추정·각색입니다. 출처와 확인 수준은 `docs/research`, `src/data/sources.js` 참고.

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
