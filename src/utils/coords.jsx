export const NormSizeToPixel = (r, vp) => ({
  left: r.x * vp.width,
  top: r.y * vp.height,
  width: (r.w ?? 0) * vp.width,
  height: (r.h ?? 0) * vp.height,
});

export const rectNormToAbs = (r, vp) => ({
  left: r.x * vp.width,
  top: r.y * vp.height,
  width: (r.w ?? 0) * vp.width,
  height: (r.h ?? 0) * vp.height,
});
