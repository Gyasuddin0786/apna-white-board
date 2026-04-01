export const snapToGrid = (value, gridSize = 20) =>
  Math.round(value / gridSize) * gridSize;

export const generateId = () =>
  `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const getRelativePointerPosition = (stage) => {
  const transform = stage.getAbsoluteTransform().copy();
  transform.invert();
  const pos = stage.getPointerPosition();
  return transform.point(pos);
};

export const downloadURI = (uri, name) => {
  const link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (dataURL, filename = 'board.pdf') => {
  const { jsPDF } = await import('jspdf');
  const img = new Image();
  img.src = dataURL;
  await new Promise((r) => (img.onload = r));
  const pdf = new jsPDF({ orientation: img.width > img.height ? 'l' : 'p', unit: 'px', format: [img.width, img.height] });
  pdf.addImage(dataURL, 'PNG', 0, 0, img.width, img.height);
  pdf.save(filename);
};

export const GRID_SIZE = 20;

export const TOOL_CURSORS = {
  select: 'default',
  pencil: 'crosshair',
  highlight: 'crosshair',
  eraser: 'cell',
  rect: 'crosshair',
  circle: 'crosshair',
  triangle: 'crosshair',
  diamond: 'crosshair',
  star: 'crosshair',
  hexagon: 'crosshair',
  parallelogram: 'crosshair',
  cylinder: 'crosshair',
  arrow: 'crosshair',
  line: 'crosshair',
  text: 'text',
  sticky: 'crosshair',
  image: 'crosshair',
};
