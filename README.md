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

## 라이선스

라이선스는 아직 지정하지 않았습니다(모든 권리 보유). 사용 조건을 정하려면 `LICENSE` 파일을 추가하세요.

## 배포(GitHub Actions → S3 → CloudFront)

`main`에 푸시하면 `.github/workflows/deploy.yml`이 `npm run build:site`로 만든 `dist/site`를 S3에 올리고 CloudFront 캐시를 갱신합니다.
인증은 OIDC 역할 가정(AWS 키를 저장소에 두지 않음)이며, 저장소 변수 `AWS_ROLE_ARN`, `AWS_REGION`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`를 설정해야 동작합니다(설정 전에는 배포 단계를 건너뜁니다).
