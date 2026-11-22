import {Node} from '@tiptap/core';
import {NodeSelection, TextSelection} from '@tiptap/pm/state';
import {embedInfo} from '../lib/embeds.mjs';

// Embed: kartu kecil di editor (tidak memuat situs luar saat menulis), bingkai sungguhan di blog.
export const Embed = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,
  addAttributes() { return {src: {default: ''}}; },
  parseHTML() {
    return [{tag: 'iframe[data-embed]', getAttrs: element => embedInfo(element.getAttribute('src')) ? {src: element.getAttribute('src')} : false}];
  },
  renderHTML({node}) {
    const info = embedInfo(node.attrs.src);
    return ['iframe', {'data-embed': info?.provider || '', src: node.attrs.src, height: String(info?.height || ''), loading: 'lazy', allowfullscreen: ''}];
  },
  addNodeView() {
    return ({node}) => {
      const dom = document.createElement('div');
      dom.className = 'embed-chip';
      dom.contentEditable = 'false';
      const label = document.createElement('strong');
      const link = document.createElement('span');
      dom.append(label, link);
      const update = current => {
        if (current.type.name !== 'embed') return false;
        const info = embedInfo(current.attrs.src);
        label.textContent = info ? `Embed ${info.label}` : 'Embed tidak dikenal';
        link.textContent = current.attrs.src.replace(/^https:\/\//, '');
        return true;
      };
      update(node);
      return {dom, update, ignoreMutation: () => true};
    };
  }
});

// Blok tingkat atas tempat kursor berada: {index, pos, node}.
function currentBlock(state) {
  const {selection, doc} = state;
  const index = Math.min(selection.$from.index(0), doc.childCount - 1);
  let pos = 0;
  for (let i = 0; i < index; i++) pos += doc.child(i).nodeSize;
  return {index, pos, node: doc.child(index), doc};
}

function selectBlock(tr, pos) {
  const node = tr.doc.nodeAt(pos);
  if (!node) return tr;
  return tr.setSelection(node.isAtom || node.type.spec.selectable && !node.isTextblock && !node.content.size ? NodeSelection.create(tr.doc, pos) : TextSelection.near(tr.doc.resolve(pos + 1)));
}

export function canMoveBlock(editor, direction) {
  const {index, doc} = currentBlock(editor.state);
  const target = index + direction;
  return target >= 0 && target < doc.childCount;
}

export function moveBlock(editor, direction) {
  const {state, view} = editor;
  if (!canMoveBlock(editor, direction)) return false;
  const {index, pos, node, doc} = currentBlock(state);
  const other = doc.child(index + direction);
  const start = direction < 0 ? pos - other.nodeSize : pos;
  const end = direction < 0 ? pos + node.nodeSize : pos + node.nodeSize + other.nodeSize;
  const tr = state.tr.replaceWith(start, end, direction < 0 ? [node, other] : [other, node]);
  selectBlock(tr, direction < 0 ? start : start + other.nodeSize);
  view.dispatch(tr.scrollIntoView());
  return true;
}

export function duplicateBlock(editor) {
  const {state, view} = editor;
  const {pos, node} = currentBlock(state);
  const at = pos + node.nodeSize;
  const tr = state.tr.insert(at, node.type.create(node.attrs, node.content, node.marks));
  selectBlock(tr, at);
  view.dispatch(tr.scrollIntoView());
  return true;
}

export function deleteBlock(editor) {
  const {state, view} = editor;
  const {pos, node, doc} = currentBlock(state);
  const tr = state.tr;
  if (doc.childCount === 1) tr.replaceWith(pos, pos + node.nodeSize, state.schema.nodes.paragraph.create());
  else tr.delete(pos, pos + node.nodeSize);
  tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(pos, tr.doc.content.size)), -1));
  view.dispatch(tr.scrollIntoView());
  return true;
}

// Menyisipkan blok baru sesudah blok yang sedang aktif (atau menggantikannya bila masih paragraf kosong).
export function insertBlocks(editor, nodes) {
  const {pos, node} = currentBlock(editor.state);
  const empty = node.type.name === 'paragraph' && node.content.size === 0;
  const range = empty ? {from: pos, to: pos + node.nodeSize} : pos + node.nodeSize;
  return editor.chain().focus().insertContentAt(range, nodes).run();
}
