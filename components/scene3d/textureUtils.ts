import * as THREE from "three";

function getFallbackTexture(): THREE.CanvasTexture {
  if (typeof document !== "undefined") {
    const dummy = document.createElement("canvas");
    dummy.width = 16;
    dummy.height = 16;
    return new THREE.CanvasTexture(dummy);
  }
  return new THREE.CanvasTexture({} as HTMLCanvasElement);
}

export function createLetterTexture(
  title: string = "Camila & Andrés",
  subtitle: string = "Nuestra Boda",
  recipient: string = "Familia Rivas Molina",
  venue: string = "Convento de las Capuchinas · Antigua Guatemala",
  date: string = "Sábado, 28 de Noviembre de 2026",
  accentColor: string = "#B89758"
): THREE.CanvasTexture {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return getFallbackTexture();
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");

  if (!ctx) return getFallbackTexture();

  // Background: Warm fine cotton paper texture
  ctx.fillStyle = "#FCFAF7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle paper grain noise
  ctx.fillStyle = "rgba(0,0,0,0.015)";
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Double gold foil border lines
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  ctx.strokeStyle = "rgba(184, 151, 88, 0.45)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  // Tiny corner ornaments
  const corners = [
    [54, 54],
    [canvas.width - 54, 54],
    [54, canvas.height - 54],
    [canvas.width - 54, canvas.height - 54],
  ];
  ctx.fillStyle = accentColor;
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Top Subtitle / Category
  ctx.textAlign = "center";
  ctx.font = "italic 300 24px 'Cormorant Garamond', serif, Times";
  ctx.fillStyle = accentColor;
  ctx.letterSpacing = "6px";
  ctx.fillText(subtitle.toUpperCase(), canvas.width / 2, 130);

  // Gold separator line
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 80, 155);
  ctx.lineTo(canvas.width / 2 + 80, 155);
  ctx.strokeStyle = "rgba(184, 151, 88, 0.5)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Main Event Title (Cormorant Garamond italic)
  ctx.font = "italic 600 68px 'Cormorant Garamond', serif, Georgia";
  ctx.fillStyle = "#1E1C1A";
  ctx.letterSpacing = "2px";
  ctx.fillText(title, canvas.width / 2, 245);

  // Decorative monogram emblem
  ctx.font = "italic 400 32px 'Cormorant Garamond', serif";
  ctx.fillStyle = accentColor;
  ctx.fillText("❦", canvas.width / 2, 305);

  // Recipient Box
  ctx.fillStyle = "rgba(243, 235, 221, 0.4)";
  ctx.roundRect(canvas.width / 2 - 280, 345, 560, 110, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(223, 201, 166, 0.6)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = "400 16px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#7A5C30";
  ctx.fillText("CON EL CORDIAL HONOR DE RECIBIR A:", canvas.width / 2, 382);

  ctx.font = "italic 700 36px 'Cormorant Garamond', serif";
  ctx.fillStyle = "#1E1C1A";
  ctx.fillText(recipient, canvas.width / 2, 428);

  // Date & Venue Details
  ctx.font = "500 22px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#3F3A34";
  ctx.fillText(date, canvas.width / 2, 530);

  ctx.font = "italic 400 24px 'Cormorant Garamond', serif";
  ctx.fillStyle = "#6E6459";
  ctx.fillText(venue, canvas.width / 2, 575);

  // Bottom delicate seal stamp
  ctx.font = "400 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "rgba(184, 151, 88, 0.85)";
  ctx.letterSpacing = "4px";
  ctx.fillText("AUREA ATELIER · INVITACIÓN PRIVADA", canvas.width / 2, 680);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createQrTotemTexture(): THREE.CanvasTexture {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return getFallbackTexture();
  }

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");

  if (!ctx) return getFallbackTexture();

  // Sleek deep obsidian card with gold border
  ctx.fillStyle = "#181716";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#C5A059";
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

  ctx.textAlign = "center";
  ctx.font = "400 16px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#C5A059";
  ctx.letterSpacing = "3px";
  ctx.fillText("PASE PERSONAL QR", canvas.width / 2, 80);

  ctx.font = "italic 600 32px 'Cormorant Garamond', serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Familia Rivas Molina", canvas.width / 2, 130);

  // Mock QR box with high contrast
  const qrX = canvas.width / 2 - 130;
  const qrY = 180;
  const qrSize = 260;

  ctx.fillStyle = "#FFFFFF";
  ctx.roundRect(qrX, qrY, qrSize, qrSize, 12);
  ctx.fill();

  // Procedural QR pattern dots
  ctx.fillStyle = "#181716";
  const gridSize = 10;
  const cellSize = qrSize / gridSize;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Corner alignment squares
      const isCorner =
        (r < 3 && c < 3) ||
        (r < 3 && c >= gridSize - 3) ||
        (r >= gridSize - 3 && c < 3);

      if (isCorner || (r * c + r + c) % 3 === 0) {
        ctx.fillRect(qrX + c * cellSize + 4, qrY + r * cellSize + 4, cellSize - 6, cellSize - 6);
      }
    }
  }

  // Table Tag
  ctx.fillStyle = "rgba(197, 160, 89, 0.15)";
  ctx.roundRect(canvas.width / 2 - 150, 480, 300, 70, 35);
  ctx.fill();
  ctx.strokeStyle = "#C5A059";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "italic 700 24px 'Cormorant Garamond', serif";
  ctx.fillStyle = "#EAD7A8";
  ctx.fillText("Mesa 1 · Claustro Capuchinas", canvas.width / 2, 524);

  ctx.font = "400 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#A19B91";
  ctx.fillText("Presenta este código a tu llegada", canvas.width / 2, 600);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createAcrylicTableTexture(): THREE.CanvasTexture {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return getFallbackTexture();
  }

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) return getFallbackTexture();

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.textAlign = "center";
  ctx.font = "italic 300 20px 'Cormorant Garamond', serif";
  ctx.fillStyle = "#C5A059";
  ctx.fillText("AUREA · ACOMODO", canvas.width / 2, 90);

  ctx.font = "italic 700 48px 'Cormorant Garamond', serif";
  ctx.fillStyle = "#1E1C1A";
  ctx.fillText("Mesa 1", canvas.width / 2, 180);

  ctx.font = "400 22px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#5A524A";
  ctx.fillText("Claustro de Capuchinas", canvas.width / 2, 230);

  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 60, 270);
  ctx.lineTo(canvas.width / 2 + 60, 270);
  ctx.strokeStyle = "#C5A059";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = "italic 400 20px 'Cormorant Garamond', serif";
  ctx.fillStyle = "#7A5C30";
  ctx.fillText("4 Lugares Reservados", canvas.width / 2, 330);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
