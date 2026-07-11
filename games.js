// Dữ liệu game — hiện là placeholder để dựng giao diện trước.
// Khi có tài khoản developer (GameDistribution / CrazyGames / Poki for Developers),
// thay "embedUrl" bằng URL nhúng thật của họ và "thumb" bằng ảnh thumbnail thật.

// Dán URL Web App (từ Google Apps Script, xem play-stats.gs.txt) vào đây để bật đếm lượt chơi thật.
const PLAY_STATS_URL = "https://script.google.com/macros/s/AKfycbyJ4HbHKeSDK1IebsGLuUlfWnMRBWqZ3cTTHxtnGk6BrZ8RfhJE40UuPcJWCYgAC7HENg/exec";
let playCounts = {};

const GAMES = [
  { id: "y9-2048", title: "2048", category: "Giải Đố", hue: 275, plays: "0", isNew: true, embedUrl: "/mygames/2048/index.html", thumbKind: "2048-grid" },
  { id: "y9-flappy", title: "Flappy", category: "Kỹ Năng", hue: 190, plays: "0", isNew: true, embedUrl: "/mygames/flappy/index.html", thumbKind: "flappy-preview" },
  { id: "y9-snake", title: "Rắn Săn Mồi", category: "Kỹ Năng", hue: 165, plays: "0", isNew: true, embedUrl: "/mygames/snake/index.html", thumbKind: "snake-preview" },
  { id: "y9-memory", title: "Lật Hình Tìm Cặp", category: "Giải Đố", hue: 255, plays: "0", isNew: true, embedUrl: "/mygames/memory/index.html", thumbKind: "memory-preview" },
  { id: "moto-rush", title: "Moto Rush", category: "Đua Xe", hue: 205, plays: "0", isNew: true, embedUrl: "" },
  { id: "block-blast", title: "Block Blast Saga", category: "Giải Đố", hue: 45, plays: "0", isNew: true, embedUrl: "" },
  { id: "zombie-siege", title: "Zombie Siege", category: "Bắn Súng", hue: 350, plays: "0", isNew: false, embedUrl: "" },
  { id: "soccer-cup", title: "Soccer Skills Cup", category: "Thể Thao", hue: 140, plays: "0", isNew: false, embedUrl: "" },
  { id: "snake-io", title: "Snake.io Big Big", category: "Game .IO", hue: 165, plays: "0", isNew: true, embedUrl: "" },
  { id: "geo-jump", title: "Geometry Jump 2", category: "Giải Đố", hue: 275, plays: "0", isNew: false, embedUrl: "" },
  { id: "8ball-pro", title: "8 Ball Pool Pro", category: "Thể Thao", hue: 20, plays: "0", isNew: false, embedUrl: "" },
  { id: "granny-house", title: "Granny Horror House", category: "Kinh Dị", hue: 260, plays: "0", isNew: false, embedUrl: "" },
  { id: "stick-fight", title: "Stickman Fight Arena", category: "Đối Kháng", hue: 10, plays: "0", isNew: true, embedUrl: "" },
  { id: "police-chase", title: "Police Moto Chase", category: "Đua Xe", hue: 220, plays: "0", isNew: false, embedUrl: "" },
  { id: "line-98", title: "Line 98 Classic", category: "Giải Đố", hue: 320, plays: "0", isNew: false, embedUrl: "" },
  { id: "snake-rivals", title: "Little Big Snake", category: "Game .IO", hue: 155, plays: "0", isNew: false, embedUrl: "" },
];

const CATEGORIES = ["Tất Cả", "Game Mới", "Đua Xe", "Bắn Súng", "Giải Đố", "Thể Thao", "Game .IO", "Kinh Dị", "Đối Kháng", "Kỹ Năng"];
