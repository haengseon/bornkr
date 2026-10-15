// 가짜 도움 자원(ARCHITECTURE §18.4 형식). E2E가 /src/content/help.js 대신 쓴다(실파일이 없을 때만).
export const HELP_LINES = [
  { id: '109', name: '자살예방상담전화', number: '109', hours: '24시간', desc: '본인과 주변 사람 모두', topics: ['selfharm', 'death'] },
  { id: '1577-0199', name: '정신건강위기상담', number: '1577-0199', hours: '24시간', topics: ['selfharm', 'death', 'illness'] },
  { id: '1388', name: '청소년상담전화', number: '1388', hours: '24시간', desc: '문자 #1388', topics: ['violence', 'abuse'] },
  { id: '1366', name: '여성긴급전화', number: '1366', hours: '24시간', desc: '가정폭력·성폭력', topics: ['sexual'] },
  { id: '117', name: '학교폭력 신고', number: '117', hours: '24시간', topics: ['violence'] },
  { id: '112', name: '긴급 신고', number: '112', hours: '24시간', desc: '범죄 신고', topics: ['violence', 'abuse', 'sexual'] },
];
export const HELP_BY_SENSITIVE = { violence: ['117', '1388'], abuse: ['112', '1388'], sexual: ['1366', '112'], illness: ['1577-0199', '109'], death: ['109', '1577-0199'], selfharm: ['109', '1577-0199'], disaster: ['1577-0199'], elder: ['1577-0199'] };
