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
  { id: "y9-caro", title: "Cờ Ca-rô", category: "Giải Đố", hue: 250, plays: "0", isNew: true, embedUrl: "/mygames/tictactoe/index.html", thumbKind: "caro-preview" },
  { id: "y9-breakout", title: "Phá Gạch", category: "Kỹ Năng", hue: 5, plays: "0", isNew: true, embedUrl: "/mygames/breakout/index.html", thumbKind: "breakout-preview" },
  { id: "y9-whack", title: "Đập Chuột", category: "Kỹ Năng", hue: 260, plays: "0", isNew: true, embedUrl: "/mygames/whack/index.html", thumbKind: "whack-preview" },
  { id: "y9-simon", title: "Nhớ Màu", category: "Giải Đố", hue: 330, plays: "0", isNew: true, embedUrl: "/mygames/simon/index.html", thumbKind: "simon-preview" },
  { id: "y9-connect4", title: "Kết Nối 4", category: "Giải Đố", hue: 355, plays: "0", isNew: true, embedUrl: "/mygames/connect4/index.html", thumbKind: "connect4-preview" },
  { id: "y9-minesweeper", title: "Dò Mìn", category: "Giải Đố", hue: 15, plays: "0", isNew: true, embedUrl: "/mygames/minesweeper/index.html", thumbKind: "minesweeper-preview" },
  { id: "y9-rps", title: "Kéo Búa Bao", category: "Đối Kháng", hue: 40, plays: "0", isNew: true, embedUrl: "/mygames/rps/index.html", thumbKind: "rps-preview" },
  { id: "y9-guessnum", title: "Đoán Số", category: "Giải Đố", hue: 200, plays: "0", isNew: true, embedUrl: "/mygames/guessnum/index.html", thumbKind: "guessnum-preview" },
  { id: "y9-pong", title: "Bóng Bàn", category: "Thể Thao", hue: 170, plays: "0", isNew: true, embedUrl: "/mygames/pong/index.html", thumbKind: "pong-preview" },
  { id: "y9-stack", title: "Xếp Tháp", category: "Kỹ Năng", hue: 145, plays: "0", isNew: true, embedUrl: "/mygames/stack/index.html", thumbKind: "stack-preview" },
  { id: "y9-lanedodge", title: "Né Làn", category: "Đua Xe", hue: 55, plays: "0", isNew: true, embedUrl: "/mygames/lanedodge/index.html", thumbKind: "lanedodge-preview" },
  { id: "y9-jumper", title: "Nhảy Lên Cao", category: "Kỹ Năng", hue: 35, plays: "0", isNew: true, embedUrl: "/mygames/jumper/index.html", thumbKind: "jumper-preview" },
  { id: "y9-basketball", title: "Ném Bóng Rổ", category: "Thể Thao", hue: 25, plays: "0", isNew: true, embedUrl: "/mygames/basketball/index.html", thumbKind: "basketball-preview" },
  { id: "y9-blockpuzzle", title: "Xếp Khối", category: "Giải Đố", hue: 300, plays: "0", isNew: true, embedUrl: "/mygames/blockpuzzle/index.html", thumbKind: "blockpuzzle-preview" },
  { id: "y9-bubblepop", title: "Nổ Bóng", category: "Giải Đố", hue: 210, plays: "0", isNew: true, embedUrl: "/mygames/bubblepop/index.html", thumbKind: "bubblepop-preview" },
  { id: "y9-sudoku", title: "Sudoku Mini", category: "Giải Đố", hue: 235, plays: "0", isNew: true, embedUrl: "/mygames/sudoku/index.html", thumbKind: "sudoku-preview" },
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
