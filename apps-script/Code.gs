/**
 * Ebook tự học Tuấn Hưng – nơi lưu tiến độ chung.
 * Dán toàn bộ file này vào Apps Script của một Google Sheet (Tiện ích mở rộng > Apps Script),
 * rồi Triển khai > Tùy chọn triển khai mới > Ứng dụng web (Thực thi: Tôi, Ai có quyền truy cập: Bất kỳ ai).
 * Lần đầu có người đăng nhập, script tự tạo 3 trang tính: "Mã đăng nhập", "Dữ liệu", "Nhật ký".
 * Đổi mã đăng nhập: sửa cột "Mã" ở trang "Mã đăng nhập".
 */
var CODE_SHEET = 'Mã đăng nhập';
var DATA_SHEET = 'Dữ liệu';
var LOG_SHEET = 'Nhật ký';
var DEFAULT_CODES = [
  ['Hưng (học viên)', 'student', 'hung123'],
  ['Phụ huynh', 'parent', 'phuhuynh123'],
  ['Giáo viên', 'teacher', 'giaovien123']
];
// Ai được ghi vào mục nào
var WRITE = {student: ['days', 'attempts', 'speaking', 'config'], teacher: ['notes', 'config'], parent: []};
var COLS = ['days', 'attempts', 'speaking', 'notes', 'config'];

function doGet(e) { return out_({ok: true, info: 'Ebook Tuấn Hưng API'}); }

function doPost(e) {
  var req = {};
  try { req = JSON.parse(e.postData.contents); } catch (x) { return out_({ok: false, error: 'bad_request'}); }
  return out_(handle_(req));
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function handle_(req) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setup_(ss);
  var role = roleOf_(ss, req.code);
  if (!role) return {ok: false, error: 'code'};
  if (req.action === 'login') return {ok: true, role: role};
  if (req.action === 'load') return {ok: true, role: role, data: load_(ss)};
  if (req.action === 'set') {
    var items = Array.isArray(req.items) ? req.items.slice(0, 200) : [];
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var saved = 0, rejected = 0;
      items.forEach(function (it) {
        if (save_(ss, role, it)) saved++; else rejected++;
      });
      return {ok: true, role: role, saved: saved, rejected: rejected};
    } finally { lock.releaseLock(); }
  }
  return {ok: false, error: 'action'};
}

function setup_(ss) {
  var c = ss.getSheetByName(CODE_SHEET);
  if (!c) {
    c = ss.insertSheet(CODE_SHEET);
    c.appendRow(['Người dùng', 'Vai trò (không sửa)', 'Mã']);
    DEFAULT_CODES.forEach(function (r) { c.appendRow(r); });
  }
  if (!ss.getSheetByName(DATA_SHEET)) {
    ss.insertSheet(DATA_SHEET).appendRow(['Mục', 'Nội dung (JSON)', 'Cập nhật lúc', 'Người ghi']);
  }
  if (!ss.getSheetByName(LOG_SHEET)) {
    ss.insertSheet(LOG_SHEET).appendRow(['Thời điểm', 'Người', 'Việc']);
  }
}

function roleOf_(ss, code) {
  code = String(code || '').trim().toLowerCase();
  if (!code) return null;
  var rows = ss.getSheetByName(CODE_SHEET).getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    var role = String(rows[i][1]).trim(), c = String(rows[i][2]).trim().toLowerCase();
    if (c && c === code && WRITE[role]) return role;
  }
  return null;
}

function load_(ss) {
  var data = {days: {}, attempts: {}, speaking: {}, notes: {}, config: {}};
  var rows = ss.getSheetByName(DATA_SHEET).getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    var p = String(rows[i][0]).split('/');
    if (p.length !== 2 || COLS.indexOf(p[0]) < 0) continue;
    try { data[p[0]][p[1]] = JSON.parse(rows[i][1]); } catch (x) {}
  }
  return data;
}

function save_(ss, role, it) {
  if (!it || typeof it.path !== 'string' || !/^[a-z]+\/[A-Za-z0-9_-]{1,60}$/.test(it.path)) return false;
  var col = it.path.split('/')[0];
  if (WRITE[role].indexOf(col) < 0) return false;
  var json = JSON.stringify(it.data);
  if (!json || json.length > 5000) return false;
  var sh = ss.getSheetByName(DATA_SHEET);
  var paths = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getValues();
  var now = new Date();
  var row = -1;
  for (var i = 1; i < paths.length; i++) if (paths[i][0] === it.path) { row = i + 1; break; }
  if (row > 0) sh.getRange(row, 2, 1, 3).setValues([[json, now, role]]);
  else sh.appendRow([it.path, json, now, role]);
  var what = describe_(col, it.data);
  if (what) ss.getSheetByName(LOG_SHEET).appendRow([now, label_(role), what]);
  return true;
}

function label_(role) { return role === 'student' ? 'Hưng' : role === 'teacher' ? 'Giáo viên' : 'Phụ huynh'; }

function describe_(col, d) {
  d = d || {};
  if (col === 'days') return (d.done ? 'Học xong' : 'Bỏ tick') + ' tuần ' + d.w + ' ngày ' + d.d;
  if (col === 'attempts') {
    var name = d.test === 'mockA' ? 'Thi thử A' : d.test === 'mockB' ? 'Thi thử B' : 'Kiểm tra tuần ' + String(d.test).slice(1);
    return name + ': ' + d.correct + '/' + d.total + (d.seconds ? ' (' + Math.round(d.seconds / 60) + ' phút)' : '');
  }
  if (col === 'speaking') return (d.sent ? 'Gửi bài nói: ' : 'Bỏ đánh dấu bài nói: ') + (d.title || '');
  if (col === 'notes') return 'Nhận xét tuần ' + d.w + ': ' + (d.text || '');
  if (col === 'config') return 'Ngày bắt đầu: ' + (d.start || '');
  return '';
}
