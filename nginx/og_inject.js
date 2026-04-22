function buildOgTags(r) {
  var title = r.args.t || '';
  var image = r.args.img || '';

  if (!title && !image) {
    return '';
  }

  var tags = '';

  if (title) {
    tags += '<meta property="og:title" content="' + escapeHtml(title) + '">';
  }
  if (image) {
    tags += '<meta property="og:image" content="' + escapeHtml(image) + '">';
  }
  tags += '<meta property="og:type" content="article">';

  return tags;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default { buildOgTags };
