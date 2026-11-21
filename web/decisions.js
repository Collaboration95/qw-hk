(() => {
  const press = document.querySelector('.press');
  const links = [...press.querySelectorAll('.doc-link')];
  function selectPublication() {
    const chosen = links.find(link => link.hash === location.hash) || links[0];
    for (const link of links) {
      const selected = link === chosen;
      document.getElementById(link.hash.slice(1)).hidden = !selected;
      if (selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }
  for (const link of links) link.addEventListener('click', event => {
    event.preventDefault();
    history.replaceState(null, '', link.hash);
    selectPublication();
    const card = document.getElementById(link.hash.slice(1));
    card.scrollIntoView({block: 'start'});
    card.focus({preventScroll: true});
  });
  window.addEventListener('hashchange', selectPublication);
  selectPublication();
  const output = press.querySelector('.json');
  if (!output) return;
  const decisions = new Map();
  function updateExport() {
    output.value = JSON.stringify({run_id: press.dataset.run, decisions: [...decisions.values()]}, null, 2);
    press.querySelector('.copy-status').textContent = '';
  }

  for (const section of press.querySelectorAll('.editable')) {
    const id = section.dataset.claim;
    const editor = section.querySelector('textarea');
    const original = editor.value;
    const editBox = section.querySelector('.edit-box');
    const state = section.querySelector('.state');
    const proposal = section.querySelector('.proposal');
    const markedUp = proposal.cloneNode(true);
    const apply = section.querySelector('[data-action="apply"]');
    const skip = section.querySelector('[data-action="skip"]');
    const edit = section.querySelector('[data-action="edit"]');

    function choose(action) {
      if (action === 'skip') {
        editor.value = original;
        apply.disabled = false;
      }
      const replacement = editor.value.trim();
      if (action === 'apply' && !replacement) return;
      const edited = action === 'apply' && replacement !== original;
      const decision = {claim_id: id, decision: action};
      if (edited) decision.replacement_sentence = replacement;
      decisions.set(id, decision);
      editBox.hidden = true;
      edit.setAttribute('aria-expanded', 'false');
      apply.setAttribute('aria-pressed', String(action === 'apply'));
      skip.setAttribute('aria-pressed', String(action === 'skip'));
      proposal.replaceChildren(...markedUp.cloneNode(true).childNodes);
      if (edited) proposal.textContent = replacement;
      state.textContent = action === 'skip' ? 'Selected · Skip' :
        edited ? 'Apply edited sentence · File shows the original proposal' : 'Selected · Apply fix';
      updateExport();
    }

    apply.addEventListener('click', () => choose('apply'));
    skip.addEventListener('click', () => choose('skip'));
    edit.setAttribute('aria-expanded', 'false');
    edit.addEventListener('click', () => {
      decisions.delete(id);
      updateExport();
      editBox.hidden = false;
      edit.setAttribute('aria-expanded', 'true');
      apply.setAttribute('aria-pressed', 'false');
      skip.setAttribute('aria-pressed', 'false');
      apply.disabled = !editor.value.trim();
      state.textContent = 'Choose Apply fix to include your wording.';
      editor.focus();
    });
    editor.addEventListener('input', () => { apply.disabled = !editor.value.trim(); });
    if (section.dataset.decision === 'applied') choose('apply');
    if (section.dataset.decision === 'skipped') choose('skip');
  }
  updateExport();
  press.querySelector('.copy').addEventListener('click', async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(output.value);
      copied = true;
    } catch {
      output.focus();
      output.select();
      try { copied = document.execCommand('copy'); } catch { /* selection remains available */ }
    }
    press.querySelector('.copy-status').textContent = copied ? 'Copied' : 'JSON selected. Use your copy shortcut.';
  });
})();
