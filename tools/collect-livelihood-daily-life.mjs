#!/usr/bin/env node
// One-off official-statistics collector. It is never used by the game runtime.
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'docs', 'research', 'livelihood-daily-life');
process.loadEnvFile(path.join(root, '.env.local'));
const key = process.env.KOSIS_API_KEY?.trim();
if (!key) throw new Error('KOSIS_API_KEY is required; it is not written to output.');
await fs.mkdir(out, { recursive: true });
const accessed = new Date().toISOString();
const esc = v => /[",\r\n]/.test(String(v ?? '')) ? `"${String(v ?? '').replaceAll('"', '""')}"` : String(v ?? '');
const write = async (name, headers, rows) => fs.writeFile(path.join(out, name), '\ufeff' + headers.join(',') + '\n' + rows.map(r => headers.map(h => esc(r[h] ?? '')).join(',')).join('\n') + '\n', 'utf8');
const num = v => /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(String(v ?? '').trim().replaceAll(',', '')) ? Number(String(v).replaceAll(',', '')) : '';
async function api(params) {
  const u = new URL('https://kosis.kr/openapi/' + (params.method === 'getMeta' ? 'statisticsData.do' : 'Param/statisticsParameterData.do'));
  u.search = new URLSearchParams({ ...params, apiKey: key });
  const response = await fetch(u, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`KOSIS HTTP ${response.status}`);
  const data = JSON.parse((await response.text()).replace(/^\ufeff/, ''));
  if (!Array.isArray(data) || data.some(x => x?.err || x?.ERROR_CODE)) throw new Error('KOSIS returned an error response');
  return data;
}
const meta = (org, table, type) => api({ method: 'getMeta', type, orgId: org, tblId: table, format: 'json', jsonVD: 'Y', ...(type === 'PRD' ? { detail: 'Y' } : {}) });
function periods(rows, wanted) {
  let freq = ''; const ans = [];
  for (const r of rows) { if (r.PRD_SE) freq = r.PRD_SE; if (r.PRD_DE && wanted.test(String(r.PRD_DE))) ans.push(String(r.PRD_DE).replace(/\D/g, '')); }
  return { freq, first: ans.at(0), last: ans.at(-1) };
}
function select(metaRows, selector) {
  const by = new Map();
  for (const r of metaRows) { const k = r.OBJ_ID || 'ITEM'; if (!by.has(k)) by.set(k, []); by.get(k).push(r); }
  const dims = [];
  for (const [id, rows] of by) {
    const chosen = rows.filter(r => selector(id, r));
    if (!chosen.length) continue;
    if (id === 'ITEM') dims.unshift({ id, parameter: 'itmId', rows: chosen });
    else dims.push({ id, parameter: `objL${Number(rows[0].OBJ_ID_SN)}`, rows: chosen });
  }
  return dims;
}
async function collect(config) {
  const [items, prd] = await Promise.all([meta(config.org, config.table, 'ITM'), meta(config.org, config.table, 'PRD')]);
  const dims = select(items, config.pick);
  const params = { method: 'getList', orgId: config.org, tblId: config.table, prdSe: config.prdSe, startPrdDe: config.start, endPrdDe: config.end, format: 'json', jsonVD: 'Y', smblChk: 'Y' };
  for (const d of dims) params[d.parameter] = d.rows.map(r => r.ITM_ID).join('+') + '+';
  const data = await api(params);
  const base = ['dataset_id','table_id','period','frequency','measure_code','measure_name','value_raw','value_numeric','unit','population','source_url','value_status'];
  const extra = ['dimension_1_code','dimension_1_name','dimension_1_type','dimension_2_code','dimension_2_name','dimension_2_type','dimension_3_code','dimension_3_name','dimension_3_type','dimension_4_code','dimension_4_name','dimension_4_type'];
  const rows = data.map(r => {
    const o = { dataset_id: config.id, table_id: config.table, period: r.PRD_DE, frequency: r.PRD_SE, measure_code: r.ITM_ID, measure_name: r.ITM_NM, value_raw: r.DT, value_numeric: num(r.DT), unit: r.UNIT_NM, population: config.population, source_url: config.url, value_status: num(r.DT) === '' ? 'symbol_or_missing' : 'observed' };
    for (let i = 1; i <= 4; i++) { o[`dimension_${i}_code`] = r[`C${i}`] || ''; o[`dimension_${i}_name`] = r[`C${i}_NM`] || ''; o[`dimension_${i}_type`] = r[`C${i}_OBJ_NM`] || ''; }
    return o;
  });
  await write(`observations-${config.id}.csv`, [...base, ...extra], rows);
  return { ...config, rows: rows.length, items, prd, dims };
}
const url = (org, table) => `https://kosis.kr/statHtml/statHtml.do?orgId=${org}&tblId=${table}`;
const purposeNames = /^(01 식료품 및 비주류음료|02 주류 및 담배|03 의류 및 신발|04 주택 수도 전기 및 연료|05 가정용품 및 가사서비스|06 보건|07 교통|08 정보통신|09 오락 및 문화|11 음식 및 숙박)$/;
const highBudget = /^(소득|소비지출|01\.식료품|02\.주류|03\.의류|04\.주거|05\.가정|06\.보건|07\.교통|08\.통신|09\.오락|11\.음식|처분가능소득|흑자액)$/;
const runs = [
  { id:'time-use-age-weekday', org:'101', table:'DT_1TS202004', url:url('101','DT_1TS202004'), prdSe:'F', start:'1999', end:'2024', population:'10세 이상 인구; 성별 계, 연령대별', pick:(id,r)=>id==='ITEM'||(id==='A'&&/요일평균|평일|토요일|일요일/.test(r.ITM_NM))||(id==='SBB'&&r.ITM_NM==='계')||(id==='D'&&/20~29|30~39|40~49|50~59|60~69/.test(r.ITM_NM))||(id==='Y'&&/^(일|이동|수면|가사|돌봄|학습|교제|미디어|운동|문화)/.test(r.ITM_NM)) },
  { id:'consumer-price-purpose', org:'101', table:'DT_1J22001', url:url('101','DT_1J22001'), prdSe:'M', start:'196501', end:'202610', population:'전국 소비자물가 조사대상 품목; 전국', pick:(id,r)=>id==='ITEM'||(id==='C'&&r.ITM_NM==='전국')||(id==='I'&&purposeNames.test(String(r.ITM_NM).replaceAll('·',' '))) },
  { id:'household-size-budget', org:'101', table:'DT_1L9U105', url:url('101','DT_1L9U105'), prdSe:'Y', start:'2019', end:'2025', population:'전국 1인 이상 가구; 월평균 가계수지', pick:(id,r)=>id==='ITEM'||(id==='E'&&/^(1인|2인|3인|4인이상)$/.test(String(r.ITM_NM).replaceAll(' ','')))||(id==='GSH'&&highBudget.test(String(r.ITM_NM).replaceAll(' ','').replace('01.식료품·비주류음료','01.식료품'))) },
  { id:'household-head-age-budget', org:'101', table:'DT_1L9U108', url:url('101','DT_1L9U108'), prdSe:'Y', start:'2019', end:'2025', population:'전국 1인 이상 가구; 가구주 연령별 월평균 가계수지', pick:(id,r)=>id==='ITEM'||(id==='G'&&/^(39세이하|40~49세|50~59세|60세이상)/.test(String(r.ITM_NM).replaceAll(' ','')))||(id==='GSH'&&highBudget.test(String(r.ITM_NM).replaceAll(' ','').replace('01.식료품·비주류음료','01.식료품'))) },
  { id:'leisure-main-activity', org:'113', table:'DT_113_STBL_1026887', url:url('113','DT_113_STBL_1026887'), prdSe:'Y', start:'2014', end:'2025', population:'15세 이상 국민여가활동조사 응답자', pick:(id,r)=>id==='ITEM'||(id!=='ITEM'&&(/전체|20대|30대|40대|50대|60대|70세이상/.test(r.ITM_NM))&&(/통계분류/.test(r.OBJ_NM||''))) },
  { id:'business-demography', org:'101', table:'DT_1BD1122', url:url('101','DT_1BD1122'), prdSe:'Y', start:'2016', end:'2024', population:'기업생멸행정통계의 기업; 개인이 아님', pick:(id,r)=>id==='ITEM'||(id==='A'&&/^(전체|제조업|도매 및 소매업|숙박 및 음식점업|정보통신업|예술 스포츠 및 여가관련 서비스업)$/.test(r.ITM_NM))||(id==='B'&&r.ITM_NM==='계') }
];
const results = [];
for (const r of runs) { try { results.push(await collect(r)); } catch (e) { results.push({ ...r, error: e.message, rows:0 }); } }
const catalogHeaders = ['dataset_id','priority','topic','survey_name','table_title','organization','org_id','table_id','source_url','accessed_at','coverage_start','coverage_end','frequency','population','grain','available_dimensions','selected_scope','unit','status','existing_local_path','output_data_file','game_application','limitations','next_action'];
const generated = Object.fromEntries(results.map(r => [r.id, r]));
const catalog = [
  ['time-use-age-weekday','1','생활시간','생활시간조사','연령대별 평균시간','국가데이터처','101','DT_1TS202004',url('101','DT_1TS202004'),'1999','2024','5년','10세 이상 인구','평균시간','요일,성별,연령,행동분류','성별 계; 20~69세; 요일; 일·이동·수면·가사·돌봄·학습·교제·미디어·운동·문화','분','collected','', 'observations-time-use-age-weekday.csv','시간 예산의 기준','평균시간이며 행위자 평균·참여율과 다름','취업여부별 평균시간·통근 세부표를 후속 확인'],
  ['employment-wage-hours','2','근로시간·임금','고용형태별노동실태조사','고용형태별 임금 및 근로시간','고용노동부','118','DT_118N_LCE0001',url('118','DT_118N_LCE0001'),'2007','2025','년','','임금·근로시간','고용형태','원표 ID와 수록기간만 검증','', 'metadata_only','','','소득과 시간 제약의 결합','이 실행에서는 API 메타데이터 응답이 없어 단위·분류·값 미확보','공식 원표 또는 고용노동부 원자료로 단위와 분류를 확인한 뒤 수집'],
  ['consumer-price-purpose','3','지출목적 물가','소비자물가조사','지출목적별 소비자물가지수(품목포함, 2020=100)','국가데이터처','101','DT_1J22001',url('101','DT_1J22001'),'1965.01','2026.10','월','전국','가격지수','시도,지출목적','전국; 식료품·의류·주거광열·교통·정보통신·오락문화·음식숙박','2020=100','collected','','observations-consumer-price-purpose.csv','항목별 명목지출 보정','지수는 실제 가격·가구별 물가가 아님; 기준연도 변경 주의','연간 적용 시 월지수의 연평균 산식 명시'],
  ['household-size-budget','4','가구 소비','가계동향조사','가구원수별 가구당 월평균 가계수지 (전국,1인이상)','국가데이터처','101','DT_1L9U105',url('101','DT_1L9U105'),'2019','2025','년','전국 1인 이상 가구','가구당 월평균','가구원수,가계수지항목,가구유형','1~4인 이상; 생계·주요 소비항목','원','collected','','observations-household-size-budget.csv','가구 구성별 월 장부','월평균 명목금액; 개인 지출이나 연간 합계가 아님','분기 원표·과거 계열 연결 가능성 확인'],
  ['household-head-age-budget','4','가구 소비','가계동향조사','가구주 연령별 가구당 월평균 가계수지 (전국,1인이상)','국가데이터처','101','DT_1L9U108',url('101','DT_1L9U108'),'2019','2025','년','전국 1인 이상 가구','가구당 월평균','가구주연령,가계수지항목,가구유형','가구주 39세 이하~60세 이상; 주요 소비항목','원','collected','','observations-household-head-age-budget.csv','생애단계별 가구 장부','가구주 연령은 구성원 개인 연령과 다름; 월평균 명목금액','가구원수×연령 결합표가 있는지 별도 검토'],
  ['household-budget-income','4','가구 소비','가계동향조사','소득구간별 가계수지','국가데이터처','101','DT_1L9U107',url('101','DT_1L9U107'),'2019','2025','년','전국 가구','가구당 월평균','소득구간,가계수지항목,가구유형','기존 9개 소득구간·138개 항목','원','existing_reusable','docs/research/kosis/2026-10-16/household-budget/observations.csv.gz','','소득 제약과 항목 장부','소득구간은 소득분위가 아니며 총계와 항목 중복','새 표와 결합분포로 취급하지 말고 독립 보정'],
  ['leisure-main-activity','6','여가','국민여가활동조사','지난 1년 동안 가장 많이 참여한 여가활동 (1순위)_중분류','문화체육관광부','113','DT_113_STBL_1026887',url('113','DT_113_STBL_1026887'),'2014','2025','년','국민여가활동조사 응답자','응답 비율 또는 표본수','통계분류,활동','전체·연령대별 활동 대분류','원표 단위 보존','collected','','observations-leisure-main-activity.csv','취미 후보와 연령별 접근성','1순위 활동만으로 복수 참여·시간·비용·동반자를 대체할 수 없음','동반자·시간·비용·제약 이유 원표 수집'],
  ['social-network','5','사회적 관계망','사회조사','도움받을 사람·교제·단체참여·관계 만족 관련 문항','국가데이터처','','','https://kosis.kr/visual/socialStat/index.do?lang=ko','','','비정기','','개인 응답','문항별','문항별 교차분류','후보만 확인','candidate_unverified','','','도움·고립·관계 이력의 범위 설정','해당 실행에서 원표 ID·문항·값을 모두 확인하지 못함','사회조사 원표와 조사표를 함께 확인'],
  ['job-entry-exit','7','생계 변화','사업체노동력조사','산업/규모별 고용','고용노동부','118','DT_118N_MON066',url('118','DT_118N_MON066'),'2024.01','2026.10','월','사업체의 종사자·입직자·이직자','사업체 단위','산업,규모,고용지표','표 ID·항목(입직·이직·율) 확인','명/%, 원표 단위','metadata_only','','','일자리 시장 충격의 배경','사업체 집계이며 개인의 해고·재취업 전이확률이 아님; 값 미수집','전국 총계 범위를 확정해 월별 수집'],
  ['business-demography','7','생계 변화','기업생멸행정통계','산업별 기업 규모별 기업수(활동/신생/소멸)','국가데이터처','101','DT_1BD1122',url('101','DT_1BD1122'),'2016','2024','년','기업','기업 수·비율','산업,기업규모','전체 및 생활 관련 산업; 기업규모 계','기업/%, 원표 단위','collected','','observations-business-demography.csv','사업체 생존 배경','기업 소멸은 개인 실직·파산과 다름','개인 이직 통계와 섞지 않고 별도 사건 배경으로 사용'],
  ['social-integration-participation','8','사회·정치 관심','사회통합실태조사','사회단체 활동 정도; 정치·사회 현안에 대한 의견 피력 경험 여부','한국행정연구원','417','DT_417001_0021; DT_417001_0027','https://sky.kipa.re.kr/$/10210/contents/7532973','2013','2025','년','조사 응답자','개인 응답','문항·인구특성','표 ID·제목·기간 검증','', 'metadata_only','','','관심·소통·참여 선택지의 문항 기반','설문 문항 원문과 응답척도는 이 실행에서 값과 함께 미확보','조사표·코드북을 확인해 문항별로 수집']
].map(a => { a.splice(9, 0, accessed); return Object.fromEntries(catalogHeaders.map((h,i)=>[h,a[i] ?? ''])); });
for (const row of catalog) { const found = generated[row.dataset_id]; if (found?.error && row.status==='collected') { row.status='unavailable'; row.limitations += `; 수집 실패: ${found.error}`; row.output_data_file=''; } }
await write('research-catalog.csv', catalogHeaders, catalog);
const cautions = [
  ['time-use-age-weekday','measure_definition','평균시간은 모든 조사대상자의 하루 평균이다. 행위자 평균시간과 행위자 비율을 더하거나 서로 대체하지 않는다.','생활시간','시간 예산 과대·과소 추정','평균시간·행위자 평균·참여율을 별도 변수로 저장',url('101','DT_1TS202004')],
  ['household-size-budget','unit_and_population','가구당 월평균 명목금액이다. 연간 시계열에 있어도 연간 금액이 아니다.','가구원수별 지출','개인 장부·연간 장부에 12배/배분을 빠뜨림','월 장부로 보관하고 연간화는 명시적으로 수행',url('101','DT_1L9U105')],
  ['household-head-age-budget','unit_and_population','가구주 연령별 통계는 가구 구성원 개인의 연령별 소비가 아니다.','가구주 연령별 지출','개인 나이에 직접 배정','가구 상태의 보정치로만 사용',url('101','DT_1L9U108')],
  ['household-budget-income','classification','소득구간별 가계수지의 소득구간은 소득분위와 다르다. 총계·소계·세부항목을 함께 합산하면 중복된다.','기존 가계수지','가구 소비 이중 계산','하나의 장부 수준만 선택하고 항목 트리를 유지',url('101','DT_1L9U107')],
  ['consumer-price-purpose','price_index','소비자물가지수는 기준연도=100인 지수이며 실제 구매가격이나 가구별 체감물가가 아니다.','항목별 물가','가격을 지수값으로 오인','명목금액 보정에만 사용하고 기준연도·산식을 기록',url('101','DT_1J22001')],
  ['leisure-main-activity','survey_scope','1순위 여가활동은 여러 활동의 참여율·시간·비용·동반자 분포가 아니다.','여가 활동','한 가지 활동만 하는 것으로 처리','후속 표에서 복수응답·시간·비용·동반자를 별도 수집',url('113','DT_113_STBL_1026887')],
  ['job-entry-exit','unit_of_analysis','사업체의 입직·이직 집계와 기업의 고용변화는 개인의 실업기간·재취업 확률이 아니다.','생계 변화','횡단면 비율을 개인 전이확률로 사용','개인 패널·구직 통계가 확보되기 전에는 배경 강도로만 사용',url('118','DT_118N_MON066')],
  ['business-demography','unit_of_analysis','기업 신생·소멸 통계는 사업체의 생존이며 플레이어 개인의 창업 성공·파산·실직을 입증하지 않는다.','창업·폐업 사건','기업 소멸률을 개인 사건 확률로 사용','사업체 환경 변수로만 쓰고 개인 사건은 별도 근거 필요',url('101','DT_1BD1122')],
  ['social-integration-participation','causality','사회·정치 관심, 신뢰, 참여의 관측된 집단 차이는 인과효과가 아니다. 문항·척도가 연도별로 바뀔 수 있다.','관심·참여','소득·성격에서 정치 성향이나 결과를 자동 결정','실제 문항을 확인하고 가치판단 없는 선택지로만 사용','https://sky.kipa.re.kr/$/10210/contents/7532973']
].map(a=>Object.fromEntries(['dataset_id','issue_type','description','affected_scope','game_risk','recommended_handling','evidence_url'].map((h,i)=>[h,a[i]])));
await write('data-cautions.csv',['dataset_id','issue_type','description','affected_scope','game_risk','recommended_handling','evidence_url'],cautions);
const priorities = [
  [1,'household-budget-income','기존 원자료를 항목 장부에 재사용','소득구간·세부 지출이 이미 확보됨','생계 장부','기존 observations.csv.gz','소득구간×연령×가구원수 결합분포 없음'],
  [2,'time-use-age-weekday','수집값으로 시간 예산의 기본값 설정','일·수면·가사·돌봄·교제 등의 일상 시간 확보','일상 시간표','time-use-age-weekday','취업여부별 시간·행위자 지표'],
  [3,'consumer-price-purpose','월별 지수를 항목별 가격 보정에 연결','생계 항목별 인플레이션 차이 반영','물가·소비 조정','consumer-price-purpose','연간 보정 규칙과 과거 기준연도 연결'],
  [4,'household-size-budget','가구원수별 월 장부 보정','1인~4인 이상 차이를 확보','가구 장부','household-budget-income','가구원수×소득 결합분포'],
  [5,'household-head-age-budget','가구주 연령별 월 장부 보정','생애단계 가구 차이를 확보','생애 단계','household-budget-income','가구주 연령×개인 연령 차이'],
  [6,'employment-wage-hours','공식 원표의 단위·분류 검증 후 수집','임금과 시간 제약을 같은 통계에서 연결해야 함','직업·노동시간','metadata_only','고용형태·직종 교차분류와 시계열'],
  [7,'social-network','사회조사 조사표와 원표를 함께 수집','도움·교제·고립을 문항에 맞게 정의해야 함','관계 이력','candidate_unverified','관계망의 개인 연간 전이'],
  [8,'leisure-main-activity','활동 유형 분포를 취미 후보에 반영','여가 활동군은 확보됨','취미 선택','leisure-main-activity','동반자·시간·비용·제약 이유'],
  [9,'job-entry-exit','사업체노동력조사 전국 총계의 입직·이직을 후속 수집','실직·재취업 사건의 배경 통계가 필요','고용 변화','metadata_only','개인 실업기간·재취업 전이'],
  [10,'business-demography','사업체 생멸을 별도 환경 변수로 사용','기업과 개인을 구분한 폐업 배경','창업 환경','business-demography','기업 폐업과 개인 생계충격 연결 근거'],
  [11,'social-integration-participation','실제 설문 문항·척도를 확인 후 수집','관심·참여를 성향 자동배정 없이 다뤄야 함','사회 관심','metadata_only','문항 변경 전후 비교 가능성']
].map(a=>Object.fromEntries(['rank','dataset_id','action','reason','game_feature','dependency','remaining_gap'].map((h,i)=>[h,a[i]])));
await write('collection-priorities.csv',['rank','dataset_id','action','reason','game_feature','dependency','remaining_gap'],priorities);
// Strict checks required for this deliverable.
for (const name of await fs.readdir(out)) if (name.endsWith('.csv')) {
  const b = await fs.readFile(path.join(out,name)); if (!(b[0]===0xef&&b[1]===0xbb&&b[2]===0xbf)) throw new Error(`${name}: UTF-8 BOM missing`);
  const lines = b.toString('utf8').replace(/^\ufeff/,'').trimEnd().split(/\r?\n/); const width = lines[0].split(',').length;
  const parse = line => { const a=[]; let s='',q=false; for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){s+='"';i++;}else q=!q;}else if(c===','&&!q){a.push(s);s='';}else s+=c;}a.push(s);return a; };
  for (const l of lines.slice(1)) if (parse(l).length!==width) throw new Error(`${name}: inconsistent CSV width`);
}
for (const r of results) console.log(`${r.id}\t${r.rows}\t${r.error || 'ok'}`);
