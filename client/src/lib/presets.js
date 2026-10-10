/**
 * Programmatic floor-plan presets drawn in a 1200×800 logical space.
 * Pure canvas calls: no remote assets, no pointer events involved.
 */
export const PRESETS = [
  { id: 'studio', label: 'Studio', hint: 'Open-plan studio with bath' },
  { id: 'square-bedroom', label: 'Square Bedroom', hint: 'Square room, bed and wardrobe' },
  { id: 'corner-office', label: 'Corner Office', hint: 'L-desk with corner windows' },
];

const INK = '#1F2937';
const WALL = 10;
const FURN = 4;

const setup = (ctx) => {
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.globalCompositeOperation = 'source-over';
};

function walls(ctx, pts) {
  ctx.lineWidth = WALL;
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.stroke();
  ctx.lineJoin = 'round';
}
const seg = (ctx, x1, y1, x2, y2, w = WALL) => {
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};
const rect = (ctx, x, y, w, h, lw = FURN) => {
  ctx.lineWidth = lw;
  ctx.strokeRect(x, y, w, h);
};
const circle = (ctx, x, y, r, lw = FURN) => {
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
};
const poly = (ctx, pts, lw = FURN) => {
  ctx.lineWidth = lw;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.stroke();
};
const opening = (ctx, x, y, w, h) => {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.restore();
};
const windowH = (ctx, x, y, w) => {
  opening(ctx, x, y - 8, w, 16);
  [-6, 0, 6].forEach((d) => seg(ctx, x, y + d, x + w, y + d, 3));
  seg(ctx, x, y - 6, x, y + 6, 3);
  seg(ctx, x + w, y - 6, x + w, y + 6, 3);
};
const windowV = (ctx, x, y, h) => {
  opening(ctx, x - 8, y, 16, h);
  [-6, 0, 6].forEach((d) => seg(ctx, x + d, y, x + d, y + h, 3));
  seg(ctx, x - 6, y, x + 6, y, 3);
  seg(ctx, x - 6, y + h, x + 6, y + h, 3);
};
/** Door leaf + dashed swing arc. a0 = closed angle, a1 = open angle. */
const door = (ctx, hx, hy, r, a0, a1, ccw) => {
  seg(ctx, hx, hy, hx + r * Math.cos(a1), hy + r * Math.sin(a1), 4);
  ctx.save();
  ctx.setLineDash([7, 7]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(hx, hy, r, a0, a1, ccw);
  ctx.stroke();
  ctx.restore();
};
const label = (ctx, text, x, y) => {
  ctx.save();
  ctx.font = '600 22px ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.fillText(text, x, y);
  ctx.restore();
};

function studio(ctx) {
  const L = 160, T = 120, R = 1040, B = 680;
  walls(ctx, [[L, T], [R, T], [R, B], [L, B]]);
  // bathroom partition
  ctx.beginPath(); ctx.lineWidth = WALL; ctx.lineJoin = 'miter';
  ctx.moveTo(820, T); ctx.lineTo(820, 340); ctx.lineTo(R, 340); ctx.stroke();
  opening(ctx, 870, 332, 80, 16);
  door(ctx, 870, 340, 80, 0, -Math.PI / 2, true);
  // entry door (left wall) + windows
  opening(ctx, 152, 250, 16, 90);
  door(ctx, 160, 340, 90, -Math.PI / 2, 0, false);
  windowH(ctx, 540, T, 160);
  windowV(ctx, L, 420, 140);
  windowH(ctx, 500, B, 200);
  // bathroom fixtures
  rect(ctx, 845, 135, 50, 28); ctx.beginPath(); ctx.ellipse(870, 195, 24, 30, 0, 0, Math.PI * 2); ctx.lineWidth = FURN; ctx.stroke();
  rect(ctx, 960, 135, 60, 45); circle(ctx, 990, 158, 13, 3);
  rect(ctx, 955, 235, 70, 90); seg(ctx, 955, 235, 1025, 325, 2); seg(ctx, 1025, 235, 955, 325, 2); circle(ctx, 990, 280, 6, 3);
  // kitchen
  rect(ctx, 170, 130, 300, 62); rect(ctx, 210, 142, 64, 38, 3); circle(ctx, 242, 161, 10, 3);
  [[365, 148], [410, 148], [365, 174], [410, 174]].forEach(([x, y]) => circle(ctx, x, y, 10, 3));
  rect(ctx, 330, 280, 180, 60); [370, 420, 470].forEach((x) => circle(ctx, x, 372, 16, 3));
  // living
  rect(ctx, 200, 560, 230, 90); rect(ctx, 200, 560, 230, 26); rect(ctx, 200, 560, 24, 90); rect(ctx, 406, 560, 24, 90);
  rect(ctx, 250, 470, 130, 55, 3);
  // dining
  circle(ctx, 620, 480, 45); [[620, 412], [620, 548], [552, 480], [688, 480]].forEach(([x, y]) => circle(ctx, x, y, 14, 3));
  // sleeping
  rect(ctx, 780, 470, 230, 190); rect(ctx, 795, 485, 90, 42, 3); rect(ctx, 905, 485, 90, 42, 3); seg(ctx, 780, 575, 1010, 575, 3);
  rect(ctx, 735, 480, 35, 35, 3);
  label(ctx, 'KITCHEN', 390, 245); label(ctx, 'LIVING', 315, 455); label(ctx, 'SLEEP', 895, 455);
}

function squareBedroom(ctx) {
  const L = 300, T = 100, R = 900, B = 700;
  walls(ctx, [[L, T], [R, T], [R, B], [L, B]]);
  windowV(ctx, L, 300, 200);
  opening(ctx, 560, 692, 90, 16);
  door(ctx, 650, 700, 90, Math.PI, Math.PI * 1.5, false);
  // bed
  rect(ctx, 470, 115, 260, 250); rect(ctx, 485, 130, 105, 52, 3); rect(ctx, 610, 130, 105, 52, 3); seg(ctx, 470, 240, 730, 240, 3);
  // nightstands + lamps
  rect(ctx, 405, 120, 52, 52); circle(ctx, 431, 146, 12, 3);
  rect(ctx, 743, 120, 52, 52); circle(ctx, 769, 146, 12, 3);
  // wardrobe
  rect(ctx, 790, 450, 100, 230); seg(ctx, 790, 565, 890, 565, 3);
  [[848, 565 - 22], [848, 565 + 22]].forEach(([x, y]) => seg(ctx, x, y - 6, x, y + 6, 3));
  // desk + chair
  rect(ctx, 320, 620, 150, 60); circle(ctx, 395, 588, 22, 3);
  // rug
  ctx.save(); ctx.setLineDash([12, 10]); rect(ctx, 450, 400, 300, 150, 3); ctx.restore();
  label(ctx, 'BEDROOM', 600, 480);
}

function cornerOffice(ctx) {
  const L = 160, T = 120, R = 1040, B = 680;
  walls(ctx, [[L, T], [R, T], [R, B], [L, B]]);
  windowH(ctx, 600, T, 360);
  windowV(ctx, R, 160, 320);
  opening(ctx, 260, 672, 90, 16);
  door(ctx, 260, 680, 90, 0, -Math.PI / 2, true);
  // L-shaped desk in the corner
  poly(ctx, [[780, 140], [1020, 140], [1020, 440], [940, 440], [940, 220], [780, 220]]);
  rect(ctx, 830, 150, 80, 14, 3); rect(ctx, 960, 300, 14, 80, 3);
  // chair
  circle(ctx, 860, 310, 30, 3); ctx.beginPath(); ctx.lineWidth = 4; ctx.arc(860, 310, 42, Math.PI * 0.8, Math.PI * 1.2); ctx.stroke();
  // lounge
  rect(ctx, 180, 260, 100, 240); rect(ctx, 180, 260, 28, 240); circle(ctx, 360, 380, 45);
  // bookshelf
  rect(ctx, 480, 636, 320, 44); [533, 587, 640, 693, 747].forEach((x) => seg(ctx, x, 636, x, 680, 2));
  // plant
  circle(ctx, 215, 165, 24); circle(ctx, 215, 165, 10, 3);
  label(ctx, 'CORNER OFFICE', 560, 420);
}

const DRAWERS = { studio, 'square-bedroom': squareBedroom, 'corner-office': cornerOffice };

/** Draw a preset onto a 2D context (caller is responsible for clearing the canvas first). */
export function drawPreset(ctx, id) {
  const draw = DRAWERS[id];
  if (!draw) throw new Error(`Unknown preset: ${id}`);
  ctx.save();
  setup(ctx);
  draw(ctx);
  ctx.restore();
}
