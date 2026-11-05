// Explorer section: hands off to a module from the explorer library (docs/js/explorers/<name>.js).
// lesson.js loads the module first and passes it in ctx.explorers.
const pick = (sec, ctx) => {
  const mod = ctx.explorers[sec.explorer];
  if (!mod) throw new Error(`Unknown explorer "${sec.explorer}"`);
  return mod;
};
export const renderSide = (sec, ctx) => (pick(sec, ctx).renderSide ? pick(sec, ctx).renderSide(sec, ctx) : '');
export const render = (sec, ctx) => pick(sec, ctx).render(sec, ctx);
export const mount = (el, sec, ctx) => pick(sec, ctx).mount(el, sec, ctx);
